const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
const apiRouter = require('./routers/api');
const {
  handle400, handle404, handle422, handle500,
} = require('./errors');

console.log('gets to cors invocation');
app.use(cors());


app.use(bodyParser.json());
app.use('/api', apiRouter);

app.use(handle400);
app.use(handle404);
app.use(handle422);
app.use(handle500);

module.exports = app;
