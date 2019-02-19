const topicsRouter = require('express').Router();
const {
  getTopics,
  postTopic,
  getArticlesByTopic,
  postArticleByTopic,
} = require('../controllers/topics');
const { handle405 } = require('../errors');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopic)
  .all(handle405);

// console.log('topics');

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticleByTopic)
  .all(handle405);

module.exports = topicsRouter;
