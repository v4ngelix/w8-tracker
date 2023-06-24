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
  const request = new XMLHttpRequest();
  request.open("GET", "https://w8.boheemia.ee/:3000/api/get-weights");
  request.send();

  request.onload = async function () {
    const weightData = JSON.parse(this.response);
    if (weightData.length > 0) {
      console.log(weightData);
    }
    //document.getElementsByTagName("tbody")[0].innerHTML = "";
  }

}

getWeights();