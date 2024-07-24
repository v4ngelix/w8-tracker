const weightInput = document.getElementById('weightInput');
if (weightInput) weightInput.focus();

const API_URL = `${window.location.href}api`;

document.getElementById('dateInput').valueAsDate = new Date();

let weightData = [];
let sortColumn = 'date';
let sortDirection = 'desc';

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
  console.log('updateTable called')
  const tbody = document.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  weightData.forEach((weight, index) => {
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
    row.insertCell(2).innerHTML = `${dayString}.${monthString}.${year}`;

    row.insertCell(3).innerHTML = (
      `<button onclick="deleteWeight('${weight.date}')">Delete</button>`
    );
  });
}

/** Helper method for getting the data in the correct order for the chart - always sorted date descending */
function getChartData() {
  return weightData
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function initializePage() {
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
}

let oldMainWidth;
window.addEventListener('resize', () => {
  const newMainWidth = document.getElementsByTagName('main')[0].offsetWidth;
  console.log('resize event');
  if (oldMainWidth !== newMainWidth) {
    oldMainWidth = newMainWidth;
    console.log('drawing');
    drawChart();
  }
}, true);

const CHART_HEIGHT = 400;
const CHART_MARGIN_TOP = 20;
const CHART_MARGIN_RIGHT = 20;
const CHART_MARGIN_BOTTOM = 30;
const CHART_MARGIN_LEFT = 40;

/** Method for drawing and re-drawing the chart. */
function drawChart() {
  const chartContainer = document.getElementById('weightTimeSeriesChart');
  chartContainer.innerHTML = '';

  const width = chartContainer.offsetWidth
  const chartData = getChartData();

  const x = d3.scaleUtc()
    .domain(d3.extent(chartData, (d) => new Date(d.date)))
    .range([CHART_MARGIN_LEFT, width - CHART_MARGIN_RIGHT]);

  const weightValues = weightData.map((d) => d.weight);
  const weightTarget = 95;

  const y = d3.scaleLinear()
    .domain([Math.min(...weightValues, weightTarget - 5), Math.max(...weightValues) + 1])
    .range([CHART_HEIGHT - CHART_MARGIN_BOTTOM, CHART_MARGIN_TOP]);

    const chart = d3.create("svg")
      .attr("width", width)
      .attr("height", height);

    chart.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x));

    chart.append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y));

    chartContainer.append(chart.node());

    console.log({ weightData, chartData });

    d3.select('#weightTimeSeriesChart')
      .select('svg')
      .selectAll('circle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(new Date(d.date)))
      .attr('cy', (d) => y(d.weight))
      .attr('r', 1)
      .attr('fill', 'red');
}

function addWeight() {
  const date = document.getElementById('dateInput').value;
  const weight = document.getElementById('weightInput').value;
  const addWeightUrl = API_URL + `/addWeight?date=${ date }&weight=${ weight }`;

  fetch(addWeightUrl).then(response => {
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
    }
    const graph = document.getElementById('weightTimeSeriesChart');
    graph.scrollIntoView({behavior: 'smooth'});
  }).catch(error => console.error(error));
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
