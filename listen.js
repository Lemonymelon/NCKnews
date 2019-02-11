/* eslint no-console:0 */

const PORT = process.env.PORT || 9090;
const app = require('./app');

app.listen(PORT, (err) => {
  if (err) console.log('error, unable to connect');
  console.log(`listening on port ${PORT}`);
});
