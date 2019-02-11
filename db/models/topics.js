const connection = require('../connection');

exports.fetchTopics = () => connection('topics')
  .select('*')
  .returning('*');

exports.sendTopic = topic => connection('topics')
  .insert(topic)
  .returning('*');

exports.fetchArticlesByTopic = (topic, limit, skip_num_articles, sort_by, order) => connection('articles')
  .select(
    'articles.article_id',
    'articles.created_at',
    'articles.username as author',
    'title',
    'topic',
    'articles.votes',
  )
  .count({ comment_count: 'comments.comment_id' })
  .leftJoin('comments', 'comments.article_id', 'articles.article_id')
  .groupBy('articles.article_id')
  .where({ topic })
  .limit(limit)
  .offset(skip_num_articles)
  .orderBy(sort_by, order);

exports.insertArticleByTopic = article => connection('articles')
  .insert(article)
  .returning('*');
