const {
  fetchTopics,
  sendTopic,
  fetchArticlesByTopic,
  insertArticleByTopic,
} = require('../db/models/topics');
const { formatArticleByTopic } = require('../utils');

const validSortValues = [
  'article_id',
  'created_at',
  'author',
  'title',
  'topic',
  'votes',
  'comment_count'];

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
  const limit = regexIsNumber.test(req.query.limit) ? req.query.limit : 10;
  const p = regexIsNumber.test(req.query.p) ? req.query.p : 1;
  const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const sort_by = validSortValues.includes(req.query.sort_by) ? req.query.sort_by : 'articles.created_at';
  const {
    offset: skip_num_articles = p <= 1 ? 0 : (p - 1) * limit,
  } = req.query;
  fetchArticlesByTopic(topic, limit, skip_num_articles, sort_by, order)
    .then((articles) => {
      // console.log(!articles[0]);
      if (articles === undefined || articles.length == 0) {
        // console.log('if');
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
    }).then((postedArticle) => {
      if (!postedArticle) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
    })
    .catch(next);
};
