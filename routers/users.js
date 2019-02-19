const usersRouter = require('express').Router();
const { handle405 } = require('../errors');

const { getUsers, getSingleUser, getArticlesByUser } = require('../controllers/users');

usersRouter
  .route('/')
  .get(getUsers)
  .all(handle405);

usersRouter
  .route('/:username')
  .get(getSingleUser)
  .all(handle405);

usersRouter
  .route('/:username/articles')
  .get(getArticlesByUser)
  .all(handle405);


module.exports = usersRouter;
