const ctx = document.getElementById('weightTimeSeries');

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
          row.insertCell(1).innerHTML = `${weight.weight}`;
          row.insertCell(2).innerHTML = `${weight.date}`;
          row.insertCell(3).innerHTML = "";
        });
    });
}

getWeights();