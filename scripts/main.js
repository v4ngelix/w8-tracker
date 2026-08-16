const weightInput = document.getElementById('weightInput');
if (weightInput) weightInput.focus();

const API_URL = `${window.location.href}api`;
document.getElementById('dateInput').valueAsDate = new Date();

let weightData = [];
let sortColumn = 'date';
let sortDirection = 'desc';

const SETTINGS_STORAGE_KEY = 'w8-settings';

const DEFAULT_SETTINGS = {
  bmiBackground: true,
  historyRange: 'all',
  yAxisMode: 'auto',
  targetWeight: 95,
};

const HISTORY_RANGE_MONTHS = {
  'all': null,
  '5y': 60,
  '1y': 12,
  '6m': 6,
  '3m': 3,
};

let settings = loadSettings();

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || {};
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function applySettingsToControls() {
  document.getElementById('settingBmiBackground').checked = settings.bmiBackground;
  document.getElementById('settingHistoryRange').value = settings.historyRange;
  document.getElementById('settingYAxisMode').value = settings.yAxisMode;
  document.getElementById('settingTargetWeight').value = settings.targetWeight;
  document.getElementById('settingTargetRow').hidden = settings.yAxisMode !== 'custom';
}

function updateSetting(key, value) {
  settings[key] = value;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

  if (key === 'yAxisMode') {
    document.getElementById('settingTargetRow').hidden = value !== 'custom';
  }

  drawChart();
}

function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  const toggle = document.querySelector('.w8__settings__toggle');
  const willOpen = panel.hidden;

  panel.hidden = !willOpen;
  toggle.setAttribute('aria-expanded', String(willOpen));
}

let readmeLoaded = false;

function toggleInfo() {
  const panel = document.getElementById('infoPanel');
  const toggle = document.querySelector('.w8__info__toggle');
  const willOpen = panel.hidden;

  panel.hidden = !willOpen;
  toggle.setAttribute('aria-expanded', String(willOpen));

  if (willOpen && !readmeLoaded) loadReadme();
}

async function loadReadme() {
  const content = document.getElementById('infoContent');

  try {
    const response = await fetch('/README.md');
    if (!response.ok) throw new Error(`Status ${response.status}`);

    content.innerHTML = renderMarkdown(await response.text());
    content.classList.remove('w8__info__content--error');
    readmeLoaded = true;
  } catch (error) {
    console.log('Error while loading README', error);
    content.textContent = 'Could not load the project description.';
    content.classList.add('w8__info__content--error');
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderMarkdown(markdown) {
  const html = [];
  let listDepth = 0;

  const closeLists = (depth) => {
    while (listDepth > depth) {
      html.push('</ul>');
      listDepth--;
    }
  };

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const listItem = line.match(/^(\s*)[-*]\s+(.*)$/);

    if (heading) {
      closeLists(0);
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
    } else if (listItem) {
      const depth = Math.floor(listItem[1].length / 2) + 1;
      while (listDepth < depth) {
        html.push('<ul>');
        listDepth++;
      }
      closeLists(depth);

      const item = listItem[2].replace(/^\[( |x)]\s*/, (_, mark) => (mark === 'x' ? '☑ ' : '☐ '));
      html.push(`<li>${renderInline(item)}</li>`);
    } else if (line.trim()) {
      closeLists(0);
      html.push(`<p>${renderInline(line.trim())}</p>`);
    }
  }

  closeLists(0);
  return html.join('');
}

document.addEventListener('click', (event) => {
  const settingsRoot = document.querySelector('.w8__settings');
  const panel = document.getElementById('settingsPanel');
  if (panel && !panel.hidden && !settingsRoot.contains(event.target)) toggleSettings();

  const infoRoot = document.querySelector('.w8__info');
  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel && !infoPanel.hidden && !infoRoot.contains(event.target)) toggleInfo();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  const panel = document.getElementById('settingsPanel');
  if (panel && !panel.hidden) toggleSettings();

  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel && !infoPanel.hidden) toggleInfo();
});

function getRangedChartData() {
  const data = getChartData();
  const months = HISTORY_RANGE_MONTHS[settings.historyRange];
  if (!months) return data;

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return data.filter((d) => new Date(d.date) >= cutoff);
}

const userHeight = 1.73;

function updateFavicon() {
  const favicon = document.getElementById('favicon');
  if (favicon) {
    const lastWeight = Number(weightData[0].weight);
    const secondLastWeight = Number(weightData[1].weight);
    const isIncreasing = lastWeight >secondLastWeight;

    favicon.href = isIncreasing ? '/assets/chart-increasing.svg' : '/assets/chart-decreasing.svg';
  }
}

/** Handler for the table header sorting event */
function handleTableSort(column) {
  sortColumn = column;
  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

  const sortingIcon = document.getElementById(`sort-by-${column}-icon`);
  const iconToClear = document.getElementById(`sort-by-${column === 'weight' ? 'date' : 'weight'}-icon`);

  sortingIcon.innerHTML = sortDirection === 'asc' ? '▲' : '▼';
  iconToClear.innerHTML = '&nbsp;';

  sortWeightData();
  drawTable();
}

/** Sort weightData according to current sortDirection and sortColumn values */
function sortWeightData() {
  weightData = weightData.slice().sort((a, b) => {
    if (sortColumn === 'weight') {
      return sortDirection === 'asc'
        ? a.weight - b.weight
        : b.weight - a.weight;
    } else {
      return sortDirection === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
}

/** Dumb method for re-drawing the weights table */
function drawTable() {
  const tbody = document.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  const days = [ 'P', 'E', 'T', 'K', 'N', 'R', 'L' ];

  const limit = 7;
  let index = 0;
  while (index < limit) {
    const weight = weightData[index];
    const row = tbody.insertRow();
    const weightValue = Number(weight.weight).toFixed(2);
    row.insertCell(0).innerHTML = `${weightValue} kg`;

    const difference = index !== weightData.length - 1
      ? (weightValue - Number(weightData[index + 1].weight).toFixed(2)).toFixed(2)
      : '-'
    const isBigger = difference > 0;
    row.insertCell(1).innerHTML = `${isBigger ? '+' : ''}${difference} kg`;
    if (difference !== '0.00') {
      row.cells[1].style.color = difference > 0 ? 'red' : 'green';
    } else {
      row.cells[1].style.color = 'orange';
    }

    const date = new Date(weight.date);
    const day = date.getDate();
    const dayPrefix = day < 10 ? '0' : '';
    const dayString = dayPrefix + day;
    const month = date.getMonth() + 1;
    const monthPrefix = month < 10 ? '0' : '';
    const monthString = monthPrefix + month;
    const year = String(date.getFullYear()).slice(2, 4);
    const weekday = days[date.getUTCDay()];

    row.insertCell(2).innerHTML = `${weekday} ${dayString}.${monthString}.${year}`;
    row.insertCell(3).innerHTML = (
      `<button
        onclick="deleteWeight('${weight.date}')"
        class="delete-weight-button">
          <img
            src="/assets/trash.svg"
            alt="Delete icon"
          >
          Delete
        </button>`
    );
    index++;
  }
}

/** Helper method for getting the data in the correct order for the chart - always sorted date descending */
function getChartData() {
  return weightData
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function initializePage() {
  applySettingsToControls();

  fetch('/validateKey')
    .then(response => response.json())
    .then(data => {
      const demoFrame = document.querySelector('.w8__demo-mode__frame');
      if (demoFrame) {
        demoFrame.style.display = data.valid ? 'none' : '';
      }
    });

  const getWeightsUrl = API_URL + '/getWeights';

  fetch(getWeightsUrl).then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error(`Something went wrong: ${response.error}`);
    }
  }).then(data => {
    weightData = data;
    sortWeightData();
    drawTable();
    drawChart();
  });

  document
    .getElementsByClassName('w8__header__retro-logo-effect')[0]
    .classList
    .add(
      'w8__header__retro-logo-effect--visible',
      'w8__header__retro-logo-effect--active'
    );

  document
    .getElementsByClassName('w8__header__subtitle')[0]
    .classList
    .add('w8__header__subtitle--active');

  initializeSubtitleCollapse();
}

function initializeSubtitleCollapse() {
  const scrollContainer = document.getElementsByTagName('main')[0];
  const subtitle = document.getElementsByClassName('w8__header__subtitle')[0];

  scrollContainer.addEventListener('scroll', () => {
    subtitle.classList.add('w8__header__subtitle--scroll-aware');
    subtitle.classList.toggle(
      'w8__header__subtitle--collapsed',
      scrollContainer.scrollTop > 16
    );
  }, {passive: true});
}

let oldMainWidth;
window.addEventListener('resize', () => {
  const newMainWidth = document.getElementsByTagName('main')[0].offsetWidth;
  if (oldMainWidth !== newMainWidth) {
    oldMainWidth = newMainWidth;
    drawChart();
  }
}, true);

const CHART_HEIGHT = 400;
const CHART_MARGIN_TOP = 20;
const CHART_MARGIN_RIGHT = 25;
const CHART_MARGIN_BOTTOM = 30;
const CHART_MARGIN_LEFT = 30;

const POINT_RADIUS = 2;
const POINT_RADIUS_HOVER = 4;

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_WINDOW_DAYS = 90;

function getTrendData(visibleData, allData) {
  const measurements = allData.map((d) => ({
    time: new Date(d.date).getTime(),
    weight: Number(d.weight),
  }));

  return visibleData.map((d) => {
    const time = new Date(d.date).getTime();
    const windowStart = time - TREND_WINDOW_DAYS * DAY_MS;
    const window = measurements.filter((m) => m.time <= time && m.time > windowStart);
    const total = window.reduce((sum, m) => sum + m.weight, 0);

    return { date: d.date, time, weight: total / window.length };
  });
}

function formatTooltipDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(2, 4);
  return `${day}.${month}.${year}`;
}

const BMI_GRADIENT_STOPS = [
  { name: 'Underweight',    bmi: 17.0, color: '#4a90d9' }, // blue
  { name: 'Healthy Weight', bmi: 21.7, color: '#5cb85c' }, // green
  { name: 'Overweight',     bmi: 27.5, color: '#f0d43a' }, // yellow
  { name: 'Obese',          bmi: 33.0, color: '#f0883e' }, // orange
];

/** Method for drawing and re-drawing the chart. */
function drawChart() {
  const chartContainer = document.getElementById('weightTimeSeriesChart');
  chartContainer.innerHTML = '';

  const width = chartContainer.offsetWidth
  const chartData = getRangedChartData();

  if (chartData.length === 0) {
    chartContainer.innerHTML = '<p style="text-align: center; color: #999999;">- No data in range -</p>';
    return;
  }

  const xAxis = d3.scaleUtc()
    .domain(d3.extent(chartData, (d) => new Date(d.date)))
    .range([CHART_MARGIN_LEFT, width - CHART_MARGIN_RIGHT]);

  const weightValues = chartData.map((d) => d.weight);
  const weightTarget = Number(settings.targetWeight);
  const useTarget = settings.yAxisMode === 'custom';

  const lowCandidates = useTarget ? [...weightValues, weightTarget - 5] : weightValues;
  const highCandidates = useTarget ? [...weightValues, weightTarget] : weightValues;

  const weightDomain = [Math.min(...lowCandidates), Math.max(...highCandidates) + 1];

  const yWeight = d3.scaleLinear()
    .domain(weightDomain)
    .range([CHART_HEIGHT - CHART_MARGIN_BOTTOM, CHART_MARGIN_TOP]);

  /** TODO: Maybe BMI is only used for coloring of the weight line. The second axis doesn't give any useful inforamtion. */
  const getBWI = (weight) => (
    weight / Math.pow(userHeight, 2)
  );

  const BWIValues = weightValues.map((weight) => {
    return getBWI(weight);
  });

  const yBMI = d3
    .scaleLinear()
    .domain([ getBWI(weightDomain[0]), getBWI(weightDomain[1]) ])
    .range([CHART_HEIGHT - CHART_MARGIN_BOTTOM, CHART_MARGIN_TOP]);

  let chart = d3.select('#chart');
  if (chart.empty()) {
    chart = d3
      .create('svg', 'chart')
      .attr('width', width)
      .attr('height', CHART_HEIGHT);
    chartContainer.append(chart.node());

    chart
      .append('g', 'chart-x-axis')
      .attr('transform', `translate(0,${ CHART_HEIGHT - CHART_MARGIN_BOTTOM })`)
      .call(d3.axisBottom(xAxis));

    chart
      .append('g', 'chart-top-border')
      .attr('transform', `translate(0,${ CHART_MARGIN_TOP })`)
      .call(d3.axisTop(xAxis).tickValues([]).tickSize(0));

    chart
      .append('g', 'chart-y-axis-weight')
      .attr('transform', `translate(${ CHART_MARGIN_LEFT }, 0)`)
      .call(d3.axisLeft(yWeight));

    const ticksBMI = yBMI
      .ticks()
      .filter(Number.isInteger);

    chart
      .append('g', 'chart-y-axis-bmi')
      .attr('transform', `translate(${ width - CHART_MARGIN_RIGHT }, 0)`)
      .call(
        d3
          .axisRight(yBMI)
          .tickValues(ticksBMI)
          .tickFormat(d3.format('d'))
      )
  }

  /** To update */
  else {
    chart
      .attr('width', width)

    chart
      .select('g#chart-x-axis')
      .call(d3.axisBottom(xAxis));

    chart
      .select('g#chart-top-border')
      .call(d3.axisTop(xAxis).tickValues([]).tickSize(0));

    chart
      .select('g#chart-y-axis-weight')
      .call(d3.axisLeft(yWeight));

    chart
      .select('g#chart-y-axis-bmi')
      .call(d3.axisRight(yBMI));
  }

  const bandTop = CHART_MARGIN_TOP;
  const bandBottom = CHART_HEIGHT - CHART_MARGIN_BOTTOM;
  const bandX = CHART_MARGIN_LEFT;
  const bandWidth = Math.max(0, width - CHART_MARGIN_RIGHT - CHART_MARGIN_LEFT);
  const bandSpan = bandBottom - bandTop;

  const anchorBmis = BMI_GRADIENT_STOPS.map((d) => d.bmi);
  const yGradTop = yBMI(Math.max(...anchorBmis));
  const yGradBottom = yBMI(Math.min(...anchorBmis));
  const gradPixelSpan = yGradBottom - yGradTop;

  let defs = chart.select('defs');
  if (defs.empty()) {
    defs = chart.append('defs');
  }

  let gradient = defs.select('#bmi-gradient');
  if (gradient.empty()) {
    gradient = defs
      .append('linearGradient')
      .attr('id', 'bmi-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('spreadMethod', 'pad')
      .attr('x1', 0)
      .attr('x2', 0);
  }
  gradient
    .attr('y1', yGradTop)
    .attr('y2', yGradBottom);

  const gradientStops = BMI_GRADIENT_STOPS
    .map((d) => ({ color: d.color, offset: (yBMI(d.bmi) - yGradTop) / gradPixelSpan }))
    .sort((a, b) => a.offset - b.offset);

  gradient
    .selectAll('stop')
    .data(gradientStops)
    .join('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color);

  chart
    .selectAll('rect.bmi-background')
    .data(settings.bmiBackground ? [null] : [])
    .join('rect')
    .lower()
    .attr('class', 'bmi-background')
    .attr('x', bandX)
    .attr('y', bandTop)
    .attr('width', bandWidth)
    .attr('height', bandSpan)
    .attr('fill', 'url(#bmi-gradient)')
    .attr('fill-opacity', 0.3);

  chart
    .selectAll('line.target-weight')
    .data(useTarget && Number.isFinite(weightTarget) ? [weightTarget] : [])
    .join('line')
    .attr('class', 'target-weight')
    .attr('x1', bandX)
    .attr('x2', bandX + bandWidth)
    .attr('y1', (d) => yWeight(d))
    .attr('y2', (d) => yWeight(d))
    .attr('stroke', '#9be59b')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6 4');

  const trendData = getTrendData(chartData, getChartData());
  const trendByDate = new Map(trendData.map((d) => [d.date, d.weight]));

  const lineMaker = d3
    .line()
    .x((d) => xAxis(new Date(d.date)))
    .y((d) => yWeight(d.weight))
    .curve(d3.curveBumpX);

  chart
    .selectAll('path.weight-trend')
    .data(trendData.length > 1 ? [trendData] : [])
    .join('path')
    .attr('class', 'weight-trend')
    .attr('fill', 'none')
    .attr('stroke', '#fa9898')
    .attr('stroke-width', 2)
    .attr('stroke-linecap', 'round')
    .attr('d', lineMaker);

  const tooltip = document.getElementById('chartTooltip');
  const hideTooltip = () => { tooltip.hidden = true; };

  const crosshair = chart
    .append('g', 'chart-crosshair')
    .attr('stroke', 'gray')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3 3')
    .attr('pointer-events', 'none')
    .attr('opacity', 0);

  const crosshairX = crosshair.append('line');
  const crosshairY = crosshair.append('line');

  const showCrosshair = (cx, cy) => {
    crosshairX
      .attr('x1', cx)
      .attr('x2', cx)
      .attr('y1', cy)
      .attr('y2', CHART_HEIGHT - CHART_MARGIN_BOTTOM);

    crosshairY
      .attr('x1', CHART_MARGIN_LEFT)
      .attr('x2', width - CHART_MARGIN_RIGHT)
      .attr('y1', cy)
      .attr('y2', cy);

    crosshair.attr('opacity', 1);
  };

  const hideCrosshair = () => { crosshair.attr('opacity', 0); };

  chart
    .selectAll('circle')
    .data(chartData)
    .enter()
    //.exit()
    .append('circle')
    .attr('cx', (d) => xAxis(new Date(d.date)))
    .attr('cy', (d) => yWeight(d.weight))
    .attr('r', POINT_RADIUS)
    .attr('fill', 'red')
    .on('mouseenter', function (event, d) {
      d3.select(this).attr('r', POINT_RADIUS_HOVER);
      showCrosshair(xAxis(new Date(d.date)), yWeight(d.weight));
      const trend = trendByDate.get(d.date);
      tooltip.innerHTML = (
        `<span class="w8__chart__tooltip__weight">${ Number(d.weight).toFixed(2) } kg</span>`
        + ` - ${ formatTooltipDate(d.date) }`
        + (trend === undefined
          ? ''
          : `<span class="w8__chart__tooltip__trend">${ TREND_WINDOW_DAYS }-day avg ${ trend.toFixed(2) } kg</span>`)
      );
      tooltip.hidden = false;
      tooltip.style.left = `${ xAxis(new Date(d.date)) }px`;
      tooltip.style.top = `${ yWeight(d.weight) - POINT_RADIUS_HOVER }px`;
    })
    .on('mouseleave', function () {
      d3.select(this).attr('r', POINT_RADIUS);
      hideCrosshair();
      hideTooltip();
    });

  hideCrosshair();
  hideTooltip();
  updateFavicon();
}

/** Weight of the latest record preceding the given date, or undefined if there is none */
function getPreviousWeight(date) {
  const previous = weightData
    .filter((d) => d.date.split('T')[0] < date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return previous && Number(previous.weight);
}

/** Reward for a weight lower than the previous one */
function celebrate() {
  if (typeof confetti !== 'function') return;

  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.7 },
  });
}

function addWeight() {
  const date = document.getElementById('dateInput').value;
  const weight = document.getElementById('weightInput').value;
  const addWeightUrl = API_URL + `/addWeight?date=${ date }&weight=${ weight }`;

  if (weight && date) {
    const previousWeight = getPreviousWeight(date);

    fetch(
      addWeightUrl,
      {} // TODO: use method: "POST"
    ).then(response => {
      if (response.ok) {
        const presentDataIndex = weightData.findIndex(data => data.date === date);
        if (presentDataIndex !== -1) {
          weightData[presentDataIndex].weight = weight;
        } else {
          weightData.push({ date, weight });
        }
        sortWeightData();
        drawTable();
        drawChart();

        if (previousWeight !== undefined && Number(weight) < previousWeight) celebrate();
      }
      const graph = document.getElementById('weightTimeSeriesChart');
      graph.scrollIntoView({behavior: 'smooth'});
    }).catch(error => console.error(error));
  }
}

function deleteWeight(date) {
  const dateToDelete = date.split('T')[0];
  const deleteWeightUrl = API_URL + `/deleteWeight?date=${ dateToDelete }`;

  fetch(
    deleteWeightUrl,
    {} // TODO: use method: "DELETE"
  ).then(response => {
    if (response.ok) {
      weightData = weightData.filter(weight => weight.date !== dateToDelete);
      sortWeightData();
      drawTable();
      drawChart();
    }
  }).catch(error => console.error(error));
}

initializePage();
