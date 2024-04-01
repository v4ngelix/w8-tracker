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
    const requestPath = url.split(/[\/?]/).slice(1);
    console.log('Incoming url: ', url, requestPath, method);

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

    else if (requestPath[0] === 'api') {
      const endPoint = requestPath?.[1] ?? '';
      console.log('It is an API request', endPoint);

      if (endPoint.includes("addWeight") && request.method === "GET") {
        const parsedUrl = Url.parse(url);
        const queryParams = querystring.parse(parsedUrl.query);
        const weight = queryParams?.weight;
        const date = queryParams?.date;
        console.log({weight, date});
        let exists = false;
        try {
          connection.query(`SELECT * FROM weights_aa WHERE date = '${date}'`, (error, rows) => {
            console.log("Existing values:", rows, rows.length > 0);
            exists = rows.length > 0;
          });
        } catch (error) {
          console.log('Error in query', error);
        }

        console.log({ exists })
        if (exists) {
          console.log('Trying to update', date);
          const sql = `UPDATE 'weights_aa' SET 'weight' = '${ weight }' WHERE 'weights_aa'.'date' = '${date}'`;
          console.log({ sql });
          try {
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
          } catch (error) {
            console.log('Error while updating existing value', error);
          }
        } else {
          console.log('Trying to insert');
          const sql = `INSERT INTO weights_aa (date, weight) VALUES ('${date}', ${weight})`;
          try {
            connection.query(sql, (error) => {
              if (error) {
                response.writeHead(500, { "Content-Type": "application/json" });
                response.write(JSON.stringify({ message: "Error: " + error }));
                response.end();
              } else {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.write(JSON.stringify({ message: "Weight added" }));
                response.end();
              }
            });
          } catch (error) {
            console.log('Error while adding new value', error);
          }
        }
      }
      else if (endPoint.includes("getWeights") && request.method === "GET") {
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
      else if (endPoint.includes("deleteWeight") && request.method === "GET") {
        const parsedUrl = Url.parse(url);
        const queryParams = querystring.parse(parsedUrl.query);
        const date = queryParams?.date;
        console.log({date});
        const sql = `DELETE FROM weights_aa WHERE date = '${date}'`;
        try {
          connection.query(sql, (error) => {
            if (error) {
              response.writeHead(500, { "Content-Type": "application/json" });
              response.write(JSON.stringify({ message: "Error: " + error }));
              response.end();
            } else {
              response.writeHead(200, { "Content-Type": "application/json" });
              response.write(JSON.stringify({ message: "Weight deleted" }));
              response.end();
            }
          });
        } catch (error) {
          console.log('Error while deleting value', error);
        }
      } else {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.write(JSON.stringify({ message: "Not found" }));
        response.end();
      }

      // DELETE FROM `weights_aa` WHERE `weights_aa`.`date` = '0000-00-00';
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

