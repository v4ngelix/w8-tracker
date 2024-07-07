/**
 * TODO:
 * 1. Convert script to typescript.
 * 2. Setup compilation to javascript (with maps?).
 */

const weightInput = document.getElementById("weightInput");
if (weightInput) weightInput.focus();

const API_URL = `${window.location.href}api`;

const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

const x = d3.scaleUtc()
  .domain([new Date("2023-01-01"), new Date("2024-01-01")])
  .range([marginLeft, width - marginRight]);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
  .domain([0, 100])
  .range([height - marginBottom, marginTop]);

const chart = d3.create("svg")
  .attr("width", width)
  .attr("height", height);

chart.append("g")
  .attr("transform", `translate(0,${height - marginBottom})`)
  .call(d3.axisBottom(x));

// Add the y-axis.
chart.append("g")
  .attr("transform", `translate(${marginLeft},0)`)
  .call(d3.axisLeft(y));

const chartContainer = document.getElementById('weightTimeSeriesChart');

chartContainer.append(chart.node());

document.getElementById("dateInput").valueAsDate = new Date();

function rerenderChartAndTable() {
  // TODO: Have an separate method for updating view.
}

function getWeights() {
  let weightData = [];
  const getWeightsUrl = API_URL + '/getWeights';

  fetch(getWeightsUrl).then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error(`Something went wrong: ${response.error}`);
    }
  }).then(data => {
    weightData = data;
    const tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    const tableData = weightData.slice().reverse();
    tableData.forEach((weight) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerHTML = `<div class="user-selection__bubble" style="background-color: red"></div>`;
      row.insertCell(1).innerHTML = `${Number(weight.weight).toFixed(2)} kg`;

      const date = new Date(weight.date);
      const day = date.getDate();
      const dayPrefix = day < 10 ? "0" : "";
      const dayString = dayPrefix + day;
      const month = date.getMonth() + 1;
      const monthPrefix = month < 10 ? "0" : "";
      const monthString = monthPrefix + month;
      const year = String(date.getFullYear()).slice(2, 4);
      row.insertCell(2).innerHTML = `${dayString}.${monthString}.${year}`;
      row.insertCell(3).innerHTML = (
        `<button onclick="deleteWeight('${weight.date}')">Delete</button>`
      );
    });

    let index = 0;
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();

    const updateEvent = () => setTimeout(() => {
      const newData = weightData[index];

      if (newData) {
        const date = new Date(newData.date);
        const day = date.getDate();
        const dayPrefix = day < 10 ? "0" : "";
        const dayString = dayPrefix + day;
        const month = date.getMonth() + 1;
        const monthPrefix = month < 10 ? "0" : "";
        const monthString = monthPrefix + month;
        const year = String(date.getFullYear()).slice(2, 4);
        const dateString = `${dayString}.${monthString}.${year}`;

        chart.data.labels.push(dateString);
        chart.data.datasets[0].data.push(newData.weight);
        chart.update();
        index++;
        if (index < weightData.length) {
          updateEvent()
        }
      }
    }, 25);

    updateEvent(index);
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
    {
      // method: "DELETE"
    }
  ).then(response => {
    if (response.ok) {
      getWeights();
    }
  }).catch(error => {
    console.error(error);
  })
}

getWeights();
