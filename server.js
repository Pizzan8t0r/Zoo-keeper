// a route that the front-end can request data from
const { animals } = require('./data/animals.json');
const express = require('express');
//instantiate the server
//We assign express() to the app variable so that we can later chain on methods to the Express.js server
const app = express();

//instead of handling the filter functionality inside the .get() callback, we're going to break it out into its own function
function filterByQuery(query, animalsArray) {
    let filteredResults = animalsArray;
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
  }

  app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });
// The port is like a building/classroom; it gives the exact desination on the host
app.listen(3001, () => {
    console.log(`API server now on port 3001`);
});
// ports with numbers 1024 and under are considered special by the operating system, and often require special permissions (like running the process as an administrator). To avoid these permission restrictions, we chose to run on a port that is less restricted
