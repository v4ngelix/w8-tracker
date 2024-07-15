const http = require('http');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const Url  = require('url');
const sqlite3 = require('sqlite3').verbose();

const database = new sqlite3.Database(
  'weights.db',
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  }
);

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;

const server = http.createServer(
  async (
    request,
    response
  ) => {
    response.setHeader('Access-Control-Allow-Origin', `http://${hostname}:${port}`);
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    const { url, method, } = request;
    const requestPath = url.split(/[\/?]/).slice(1);
    console.log('Incoming url: ', url, requestPath, method);

    if (request.url === '/' && method === 'GET') {
      const indexPath = path.join(__dirname, 'index.html')
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          endResponse(response,500, 'text/plain', 'Internal Server Error')
        } else {
          endResponse(response,200, 'text/html', data);
        }
      });
    }
    else if (['assets', 'styles', 'scripts', 'favicon.ico'].includes(requestPath[0]) && method === 'GET') {
      const filePath = path.join(__dirname, ...requestPath)
      fs.readFile(filePath, (err, data) => {
        if (err) {
          endResponse(response,500, 'text/plain', 'Internal Server Error');
        } else {
          let type = 'text/html';
          const dir = requestPath[0];

          if (dir === 'favicon.ico') type = 'image/png';
          if (dir === 'assets') type = 'image/svg+xml';
          if (dir === 'styles') type = 'text/css';
          if (['scripts', 'node_modules'].includes(dir)) type = 'text/javascript';

          endResponse(response,200, type, data);
        }
      });
    } else if (request.url === '/api/ping' && method === 'GET') {
      endResponse(response,200, 'text/plain', 'Ping succesful');
    }

    else if (requestPath[0] === 'api') {
      const endPoint = requestPath?.[1] ?? '';
      console.log('It is an API request', endPoint);

      if (endPoint.includes('addWeight') && request.method === 'GET') {
        const parsedUrl = Url.parse(url);
        const queryParams = querystring.parse(parsedUrl.query);
        const weight = queryParams?.weight;
        const date = queryParams?.date;
        try {
          database.get(
            'SELECT * FROM weight_data WHERE date = ?',
            date,
            (error, rows) => {
              if (error) {
                endResponse(response,500, 'text/plain', `Error: ${error}`);
              } else {
                if (rows) {
                  updateValues(response, date, weight);
                } else {
                  addValues(response, date, weight);
                }
              }
            }
          );
        } catch (error) {
          console.log('Error in query', error);
        }
      }
      else if (endPoint.includes('getWeights') && request.method === 'GET') {
        try {
          database.all(
            'SELECT * FROM weight_data',
            (error, rows) => {
              if (error) {
                endResponse(response,500, 'text/plain', `Error: ${error}`);
              } else {
                endResponse(response,200, 'application/json', JSON.stringify(rows));
              }
          });
        } catch (error) {
          console.log('Error while getting values', error);
        }
      }
      else if (endPoint.includes('deleteWeight') && request.method === 'GET') {
        const parsedUrl = Url.parse(url);
        const queryParams = querystring.parse(parsedUrl.query);
        const date = queryParams?.date;
        console.log({date});

        try {
          database.run(
            'DELETE FROM weight_data WHERE date = ?',
            date,
            (error) => {
              if (error) {
                endResponse(response,500, 'text/plain', `Error: ${error}`);
              } else {
                endResponse(response,200, 'text/plain', 'Weight deleted');
              }
            }
          )
        } catch (error) {
          console.log('Error while deleting value', error);
        }
      } else {
        endResponse(response,404, 'text/plain', 'Not found');
      }
    }
  }
);

const updateValues = (response, date, weight) => {
  console.log('Trying to update', date);
  try {
    database.run(
      'UPDATE weight_data SET weight = ? WHERE date = ?',
      [weight, date],
      (error) => {
        if (error) {
          console.log(error);
          endResponse(response,500, 'text/plain', `Error: ${error}`);
        } else {
          endResponse(response,200, 'text/plain', 'Weight added');
        }
      }
    )
  } catch (error) {
    console.log('Error while updating existing value', error);
  }
}

const addValues = (response, date, weight) => {
  console.log('Trying to insert');
  try {
    database.run(
      'INSERT INTO weight_data (date, weight) VALUES (?, ?)',
      [date, weight],
      (error) => {
        if (error) {
          endResponse(response,500, 'text/plain', `Error: ${error}`);
        } else {
          endResponse(response,200, 'text/plain', 'Weight added');
        }
      }
    )
  } catch (error) {
    console.log('Error while adding new value', error);
  }
}

const endResponse = (
  response,
  statusCode,
  contentType,
  message
) => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(message);
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${ hostname }:${ port }/`);
});

