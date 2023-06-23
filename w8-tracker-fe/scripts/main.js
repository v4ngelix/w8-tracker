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