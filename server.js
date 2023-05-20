// a route that the front-end can request data from
const { animals } = require('./data/animals.json');
const express = require('express');
//instantiate the server
//We assign express() to the app variable so that we can later chain on methods to the Express.js server
const app = express();



app.get('/api/animals', (req, res) => {
    let results = animals;
    console.log(req.query)
    res.json(results);
});
// The port is like a building/classroom; it gives the exact desination on the host
app.listen(3001, () => {
    console.log(`API server now on port 3001`);
});
// ports with numbers 1024 and under are considered special by the operating system, and often require special permissions (like running the process as an administrator). To avoid these permission restrictions, we chose to run on a port that is less restricted
