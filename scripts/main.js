/**
 * TODO:
 * 1. Convert script to typescript.
 * 2. Setup compilation to javascript (with maps?).
 * 3. Replace chart.js with d3
 */

const chartHTMLReference = document.getElementById('weightTimeSeries');

const chart = new Chart(chartHTMLReference, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Weight',
      data: [],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
      }
    }
  }
});

document.getElementById("dateInput").valueAsDate = new Date();

function getWeights() {
  let weightData = [];
  fetch("http://www.boheemia.ee:3000/api/get-weights").then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error("Something went wrong");
      }
    })
    .then(data => {
        console.log(data)
        weightData = data;
        const tbody = document.getElementsByTagName("tbody")[0];
        tbody.innerHTML = "";
        weightData.forEach((weight) => {
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

          row.insertCell(3).innerHTML = "";
        });

        let index = 0;

        function nextUpdateSpeed(inputIndex) {
          return (weightData.length * 2) * Math.log(inputIndex);
        }
        const updateEvent = () => setTimeout(() => {
          const newData = weightData[index];
          chart.data.labels.push(newData.date);
          chart.data.datasets[0].data.push(newData.weight);
          chart.update();
          index++;
          if (index < weightData.length) {
              updateEvent()
          }
        }, nextUpdateSpeed(index));
        updateEvent(index);
    });
}

getWeights();
