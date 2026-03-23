const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World from the map project!');
});

app.listen(3000, () => {
  console.log('Development server running on http://localhost:3000');
});