const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;

// this is only necessary if you will use replit as a hosting service
