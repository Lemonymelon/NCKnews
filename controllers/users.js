const { fetchUsers, fetchSingleUser, fetchArticlesByUser } = require('../db/models/users');

const regexIsNumber = /^[0-9]*$/;
const validSortValues = [
  'articles.article_id',
  'articles.created_at',
  'articles.author',
  'articles.title',
  'articles.topic',
  'articles.votes',
  'articles.comment_count'];

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      if (!users) {
        return Promise.reject({ status: 404, msg: 'users not found!' });
      }
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getSingleUser = (req, res, next) => {
  const { username } = req.params;
  fetchSingleUser(username)
    .then(([user]) => {
      if (!user) {
        return Promise.reject({ status: 404, msg: 'user not found!' });
      }
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.getArticlesByUser = (req, res, next) => {
  const { username } = req.params;
  const limit = regexIsNumber.test(req.query.limit) ? req.query.limit : 10;
  const p = regexIsNumber.test(req.query.p) ? req.query.p : 1;
  const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const sort_by = validSortValues.includes(req.query.sort_by) ? req.query.sort_by : 'articles.created_at';

  const {
    offset: skip_num_articles = p <= 1 ? 0 : (p - 1) * limit,
  } = req.query;
  fetchArticlesByUser(username, limit, skip_num_articles, sort_by, order)
    .then((articles) => {
      if (!articles) {
        return Promise.reject({ status: 404, msg: 'user not found!' });
      }
    })
    .catch(next);
};
