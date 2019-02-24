const articlesRouter = require('express').Router();
const {
  getArticles,
  getArticleById,
  amendArticleById,
  deleteArticleById,
  getCommentsByArticleId,
  postCommentToArticle,
  amendCommentById,
  deleteCommentById,
} = require('../controllers/articles');
const { handle405 } = require('../errors');

console.log('articles router');
articlesRouter
  .route('/')
  .get(getArticles)
  .all(handle405);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(amendArticleById)
  .delete(deleteArticleById)
  .all(handle405);

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentToArticle)
  .all(handle405);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(amendCommentById)
  .delete(deleteCommentById);

module.exports = articlesRouter;
