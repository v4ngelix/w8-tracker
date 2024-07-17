/**
 * TODO:
 * 1. Convert script to typescript.
 * 2. Setup compilation to javascript (with maps?).
 */

const weightInput = document.getElementById("weightInput");
if (weightInput) weightInput.focus();

const API_URL = `${window.location.href}api`;

document.getElementById("dateInput").valueAsDate = new Date();

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
  updateTable();
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
function updateTable() {
  console.log('updateTable called')
  const tbody = document.getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  weightData.forEach((weight) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerHTML = `${Number(weight.weight).toFixed(2)} kg`;

    const date = new Date(weight.date);
    const day = date.getDate();
    const dayPrefix = day < 10 ? "0" : "";
    const dayString = dayPrefix + day;
    const month = date.getMonth() + 1;
    const monthPrefix = month < 10 ? "0" : "";
    const monthString = monthPrefix + month;
    const year = String(date.getFullYear()).slice(2, 4);
    row.insertCell(1).innerHTML = `${dayString}.${monthString}.${year}`;
    row.insertCell(2).innerHTML = (
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

function getWeights() {
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
    updateTable();
    /*
     * TODO: The following code should take into account that a chart might already be in place.
     * this method should also work as an update method.
     * Afterwards initializing and updating should be separated
     */
    const chartContainer = document.getElementById('weightTimeSeriesChart');
    chartContainer.innerHTML = '';

    const width = chartContainer.offsetWidth
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const chartData = getChartData();

    const x = d3.scaleUtc()
      .domain([
        new Date(chartData[0].date),
        new Date(chartData[chartData.length -1].date)
      ])
      .range([marginLeft, width - marginRight]);

    const weightValues = weightData.map((d) => d.weight);
    const weightTarget = 70;

    const y = d3.scaleLinear()
      .domain([Math.min(...weightValues, weightTarget - 10), Math.max(...weightValues) + 10])
      .range([height - marginBottom, marginTop]);

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
  });
}

function addWeight() {
  const date = document.getElementById("dateInput").value;
  const weight = document.getElementById("weightInput").value;
  const addWeightUrl = API_URL + `/addWeight?date=${ date }&weight=${ weight }`;

  fetch(addWeightUrl).then(response => {
    if (response.ok) {
      getWeights();
    }
    const graph = document.getElementById('weightTimeSeriesChart');
    graph.scrollIntoView({ behavior: "smooth"});
  }).catch(error => {
    console.error(error);
  })
}

function deleteWeight(date) {
  const dateToDelete = date.split('T')[0];
  const deleteWeightUrl = API_URL + `/deleteWeight?date=${ dateToDelete }`;

  fetch(
    deleteWeightUrl,
    {} // TODO: use method: "DELETE"
  ).then(response => {
    if (response.ok) {
      getWeights();
    }
  }).catch(error => {
    console.error(error);
  })
}

getWeights();
