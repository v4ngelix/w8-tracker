/**
 * TODO:
 * 1. Convert script to typescript.
 * 2. Setup compilation to javascript (with maps?).
 * 3. Replace chart.js with d3
 */

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["21.06", "22.06", "23.06"],
    datasets: [{
      label: 'Weight',
      data: [103.5, 103, 102.3],
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
  fetch("http://localhost:3000/api/get-weights")
    .then(response => {
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
          row.insertCell(0).innerHTML = `<div className="user-selection__bubble" style="background-color: red"></div>`;
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
    });
}

getWeights();