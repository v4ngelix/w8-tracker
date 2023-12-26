const http = require('http');
const mysql = require('mysql');
const Controller = require('./controller');

const connection = mysql.createConnection({
  host: 'd66029.mysql.zonevs.eu',
  user: 'd66029_w8app',
  password: 'NoGainNoPain',
  database: 'd66029_weight',
});

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(async (request, response) => {
  if (request.url === "/api/ping" && request.method == "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.write(JSON.stringify({ message: "Ping succesful" }));
    response.end();
  } else if (request.url === "/api/get-weights" && request.method === "GET") {
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
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.write(JSON.stringify({ message: "Not found" }));
    response.end();
  }
});

connection.connect((error) => {
  console.log({ connection });
  if (error) {
    console.error('Error connecting to the database: ' + error);
    return;
  }
  console.log('Connected to the database');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

