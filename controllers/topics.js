const {
  fetchTopics,
  sendTopic,
  fetchArticlesByTopic,
  insertArticleByTopic,
} = require('../db/models/topics');
const { formatArticleByTopic } = require('../utils');

const regexIsNumber = /^[0-9]*$/;

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  sendTopic(req.body)
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const limit = 10;
  const p = regexIsNumber.test(req.query.p) ? req.query.p : 1;
  const {
    offset: skip_num_articles = p <= 1 ? 0 : (p - 1) * limit,
    sort_by = 'articles.created_at',
    order = 'desc',
  } = req.query;
  fetchArticlesByTopic(topic, limit, skip_num_articles, sort_by, order)
    .then((articles) => {
      if (articles.length < 1) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
      res.status(200).send({ articles, total_count: articles.length });
    })
    .catch(next);
};

exports.postArticleByTopic = (req, res, next) => {
  const { topic } = req.params;
  const formattedArticle = formatArticleByTopic(req.body, topic);

  insertArticleByTopic(formattedArticle)
    .then(([article]) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
