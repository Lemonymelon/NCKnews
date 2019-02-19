const {
  fetchArticles,
  fetchArticlesByID,
  editArticleByID,
  removeArticleByID,
  fetchCommentsByArticleID,
  insertCommentByArticleID,
  editCommentByArticleID,
  removeCommentById,
} = require('../db/models/articles');

const validSortValues = [
  'article_id',
  'created_at',
  'author',
  'title',
  'topic',
  'votes',
  'comment_count'];


const regexIsNumber = /^[0-9]*$/;

exports.getArticles = (req, res, next) => {
  console.log(1);
  const limit = regexIsNumber.test(req.query.limit) ? req.query.limit : 10;
  const p = regexIsNumber.test(req.query.p) ? req.query.p : 1;
  const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const sort_by = validSortValues.includes(req.query.sort_by) ? req.query.sort_by : 'articles.created_at';

  const {
    offset: skip_num_articles = p <= 1 ? 0 : (p - 1) * limit,
  } = req.query;
  fetchArticles(limit, skip_num_articles, sort_by, order)
    .then((articles) => {
      if (!articles) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticlesByID(article_id)
    .then(([article]) => {
      if (!article) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.amendArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const inc_votes = typeof req.body.inc_votes === 'number' ? req.body.inc_votes : null;
  // console.log(inc_votes);
  editArticleByID(article_id, inc_votes)
    .then((article) => {
      // console.log(article);
      if (!article) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  removeArticleByID(article_id)
    .then(([article]) => {
      if (!article) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(204).send({ article });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const limit = regexIsNumber.test(req.query.limit) ? req.query.limit : 10;
  const p = regexIsNumber.test(req.query.p) ? req.query.p : 1;
  const {
    offset: skip_num_comments = p <= 1 ? 0 : (p - 1) * limit,
    sort_by = 'comments.created_at',
    order = 'desc',
  } = req.query;
  fetchCommentsByArticleID(article_id, limit, skip_num_comments, sort_by, order)
    .then((comments) => {
      if (!comments) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentToArticle = (req, res, next) => {
  const { article_id } = req.params;
  const commentWithId = { article_id, ...req.body };
  insertCommentByArticleID(commentWithId)
    .then(([comment]) => {
      if (!comment) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.amendCommentById = (req, res, next) => {
  const { article_id, comment_id } = req.params;
  const { inc_votes } = req.body;
  editCommentByArticleID(article_id, comment_id, inc_votes)
    .then(([comment]) => {
      if (!comment) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { article_id, comment_id } = req.params;
  removeCommentById(article_id, comment_id)
    .then(([comment]) => {
      if (!comment) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(204).send({ comment });
    })
    .catch(next);
};
