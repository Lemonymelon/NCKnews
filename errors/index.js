/* eslint no-prototype-builtins:0 */

exports.handle400 = (err, req, res, next) => {
  console.log(400, ' <<-', err, '<<-');
  const hint = err.hint ? ` -->> ${err.hint}` : '';

  // console.log(hint);
  const codes400 = {
    // 42703: 'invalid field name(s)',
    '22P02': 'invalid syntax',
    23502: 'missing mandatory field',
  };
  if (codes400.hasOwnProperty(err.code)) {
    res.status(400).send({
      msg: `bad request -->> ${codes400[err.code]} -->> ${err.toString().slice(7)}${hint}`,
    });
  } else next(err);
};

exports.handle404 = (err, req, res, next) => {
  const hint = err.hint ? ` -->> ${err.hint}` : '';

  // console.log(hint);
  const codes404 = {

    23503: 'foreign key not found',
  };
  if (codes404.hasOwnProperty(err.code)) {
    res.status(404).send({
      msg: `bad request -->> ${codes404[err.code]} -->> ${err.toString().slice(7)}${hint}`,
    });
  } else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes422 = { 23505: 'duplicate key value violates unique constraint' };
  // console.log(422, ' <<-', err);
  if (codes422.hasOwnProperty(err.code)) {
    res.status(422).send({
      msg: `unprocessable entity -->> ${codes422[err.code]} -->> ${err.detail.toString()}`,
    });
  } else next(err);
};

exports.handle405 = (req, res, next) => {
  // console.log(405, ' <<-');
  res.status(405).send({ msg: 'invalid method for this endpoint!' });
};

exports.handle500 = (err, req, res, next) => {
  // console.log(500, ' <<-', err);
  if (err.status === 500) {
    res.status(500).send({ msg: err || 'oh no' });
  }
  next(err);
};
