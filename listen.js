/* eslint no-console:0 */

const { PORT = 9090 } = process.env;
const app = require('./app');

app.listen(PORT, (err) => {
  if (err) console.log('error, unable to connect');
  console.log(`listening on port ${PORT}`);
});
