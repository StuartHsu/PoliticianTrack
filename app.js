const express = require('express');


const PORT = process.env.PORT || 3000;


const app = express();


app.get('/', (req, res) => {
  res.send('HEY!');
});








app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something Error!');
});

app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
