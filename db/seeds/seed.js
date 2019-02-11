const {
  articleData, topicData, userData, commentData,
} = require('../data');
const { convertArticleData, createRefObject, convertCommentData } = require('../../utils');

exports.seed = function (knex, Promise) {
  return knex('topics')
    .insert(topicData)
    .returning('*')
    .then(() => knex('users')
      .insert(userData)
      .returning('*'))
    .then(() => {
      const formattedArticles = convertArticleData(articleData);
      return knex('articles')
        .insert(formattedArticles)
        .returning('*');
    })
    .then((articleRows) => {
      const refObject = createRefObject(articleRows);
      const formattedComments = convertCommentData(refObject, commentData);
      return knex('comments').insert(formattedComments);
    });
};
