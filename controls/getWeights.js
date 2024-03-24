const getWeigths = (response) => {
  connection.query('SELECT * FROM weights_aa', (error, rows) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.write(JSON.stringify({ message: "Error: " + error }));
      response.end();
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write(JSON.stringify(rows));
      response.end();
    }
  });
}