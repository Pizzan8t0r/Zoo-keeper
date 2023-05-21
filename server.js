const fs = require('fs');
// path provides utilities for working with file and directory paths
const path = require('path');
// a route that the front-end can request data from
const { animals } = require('./data/animals.json');
const express = require('express');
const PORT = process.env.PORT || 3001;
//instantiate the server
//We assign express() to the app variable so that we can later chain on methods to the Express.js server
const app = express();
// Express.js middleware that instructs the server to make certain files readily available and to not gate it behind a server endpoint.
app.use(express.static('public'));
// parse incoming string or array data
// getting the server to read the data properly
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
//instead of handling the filter functionality inside the .get() callback, we're going to break it out into its own function
// filters animals by multiple personality traits at the same time


  app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });
  //new GET route for animals
  // if no record exists for the animal being searched for, the client receives a 404 erro
  app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
      // the 404 status code is meant to communicate to the client that the requested resource could not be found
      // return an error instead of an empty object or undefined in order to make it clear to the client that the resource they asked for, in this case a specific animal, does not exis
      res.send(404);
    }
  });
  // This route will take us to /animals
  // a route that has the term api in it will deal in transference of JSON data, whereas a more normal-looking endpoint such as /animals should serve an HTML page. 
  // Express.js isn't opinionated about how routes should be named and organized, so that's a system developers must create. 
  // The naming patterns we've used so far closely follow what you'd typically see in a professional setting.
  app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
  });

  app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
  });
  // The * will act as a wildcard, meaning any route that wasn't previously defined will fall under this request and will receive the homepage as the response
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });
  // sets up a route on our server that accepts data to be used or stored server-side
  //  post route's callback sends the updated req.body data to createNewAnimal()
  // our POST route's callback before we create the data and add it to the catalog, we'll pass our data through this function. 
  // In this case, the animal parameter is going to be the content from req.body, and we're going to run its properties through a series of validation checks. If any of them are false, we will return false and not create the animal data.
  app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();
  
    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
      res.status(400).send('The animal is not properly formatted.');
    } else {
      const animal = createNewAnimal(req.body, animals);
      res.json(animal);
    }
  });
  // index.html served from our Express.js server
  // '/' brings us to the root route of the server
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });
// The port is like a building/classroom; it gives the exact desination on the host
app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});
// ports with numbers 1024 and under are considered special by the operating system, and often require special permissions (like running the process as an administrator). To avoid these permission restrictions, we chose to run on a port that is less restricted
