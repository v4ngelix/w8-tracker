const http = require('http');
const Controller = require('./controller');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/get-weights" && req.method === "GET") {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
      const weights = await new Controller().getWeights();
      res.writeHead(200, { "Content-Type": "application/json" });
      // send the data
      console.log(weights);
      res.end(JSON.stringify(weights));
    } catch (error) {
      // set the status code and content-type
      res.writeHead(404, { "Content-Type": "application/json" });
      // send the error
      res.end(JSON.stringify({ message: error }));
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});