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
function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // WE save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach(trait => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one 
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        animal => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  // return the filtered results:
  return filteredResults;
}
// findById() takes in the id and array of animals and returns a single animal object
function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}
// separate function that handles taking the data from req.body and adds it to the animals.json file
function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    // saves the JavaScript array data as JSON, we use JSON.stringify() to convert it
    // 2 indicates we want to create white space between our values to make it more readable
    JSON.stringify({ animals: animalsArray }, null, 2)
  );
  return animal;
}
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}
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
