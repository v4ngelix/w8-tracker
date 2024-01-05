const http = require('http');
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const Url  = require('url');

const connection = mysql.createConnection({
  host: 'd66029.mysql.zonevs.eu',
  user: 'd66029_w8app',
  password: 'NoGainNoPain',
  database: 'd66029_weight',
});

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(
  async (
    request,
    response
  ) => {
    response.setHeader('Access-Control-Allow-Origin', 'https://w8.boheemia.ee');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    const { url, method, } = request;
    const requestPath = url.split('/').slice(1);

    console.log('Incoming url: ', url);
    if (request.url === '/' && method === 'GET') {
      const indexPath = path.join(__dirname, 'index.html')
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          response.writeHead(500, { 'Content-Type': 'text/plain' });
          response.end('Internal Server Error');
        } else {
          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end(data);
        }
      });
    } else if (['assets', 'styles', 'scripts', 'favicon.ico'].includes(requestPath[0]) && method === 'GET') {
      const filePath = path.join(__dirname, ...requestPath)
      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.writeHead(500, { 'Content-Type': 'text/plain' });
          response.end('Internal Server Error');
        } else {
          let type = 'text/html';
          const dir = requestPath[0];

          if (dir === 'favicon.ico') type = 'image/png';
          if (dir === 'assets') type = 'image/svg+xml';
          if (dir === 'styles') type = 'text/css';
          if (['scripts', 'node_modules'].includes(dir)) type = 'text/javascript';

          response.writeHead(200, { 'Content-Type': type });
          response.end(data);
        }
      });
    } else if (request.url === "/api/ping" && method === "GET") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write(JSON.stringify({ message: "Ping succesful" }));
      response.end();
    }
    else if (url.includes("/api/add-weight") && request.method === "GET") {
      const parsedUrl = Url.parse(url);
      const queryParams = querystring.parse(parsedUrl.query);
      const weight = queryParams?.weight;
      const date = queryParams?.date;
      console.log({weight, date});
      // INSERT INTO `weights_aa` (`Date`, `Weight`) VALUES ('2024-01-03', '103.3');
      const sql = `INSERT INTO weights_aa (date, weight) VALUES (\'${date}\', \'${weight}\')`;
      connection.query(sql, (error) => {
        if (error) {
          response.writeHead(500, { "Content-Type": "application/json" });
          response.write(JSON.stringify({ message: "Error: " + error }));
          response.end();
        }
        // if date already exists, update the weight
        else if (error.code === 'ER_DUP_ENTRY') {
          const sql = `UPDATE weights_aa SET weight=${weight} WHERE date='${date}'`;
          connection.query(sql, (error) => {
            if (error) {
              response.writeHead(500, { "Content-Type": "application/json" });
              response.write(JSON.stringify({ message: "Error: " + error }));
              response.end();
            } else {
              response.writeHead(200, { "Content-Type": "application/json" });
              response.write(JSON.stringify({ message: "Weight updated" }));
              response.end();
            }
          });
        }
        else {
          response.writeHead(200, { "Content-Type": "application/json" });
          response.write(JSON.stringify({ message: "Weight added" }));
          response.end();
        }
      });
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
  }
);

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to the database: ' + error);
    return;
  }
  console.log('Connected to the database');
});

server.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});

