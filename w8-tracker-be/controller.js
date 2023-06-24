const data = require("./mockData");
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'd66029.mysql.zonevs.eu',
  user: 'd66029_w8app',
  password: 'NoGainNoPain',
  database: 'd66029_weight',
});

//process.env.USER_ID;


class Controller {
  //
  async getWeights() {

    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return;
      }
      console.log('Connected to the database.');

      // Perform a SELECT query to fetch the whole table
      connection.query('SELECT * FROM weights_aa', (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return;
        }

        // Process the retrieved data
        console.log('Table data:', results);

        // Close the database connection
        connection.end((err) => {
          if (err) {
            console.error('Error closing database connection:', err);
            return;
          }
          console.log('Disconnected from the database.');
        });
      });
    });

    return new Promise((resolve, _) => resolve(data));
  }

  async addWeight(weight, date) {
    return new Promise((resolve, _) => {
      // create a todo, with random id and data sent
      let newTodo = {
        id: Math.floor(4 + Math.random() * 10),
        ...todo,
      };

      // return the new created todo
      resolve(newTodo);
    });
  }
}

module.exports = Controller;
