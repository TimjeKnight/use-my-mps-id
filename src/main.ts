import express from 'express';
import postcoderoutes from './routes/postcode.js';

const app = express();
const port = 3000;


app.use('/postcode', postcoderoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
