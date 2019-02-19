const connection = require('../connection');

exports.fetchUsers = () => connection('users').select('username', 'name', 'avatar_url');

exports.fetchSingleUser = username => connection('users')
  .select('username', 'name', 'avatar_url')
  .where(username);

exports.fetchArticlesByUser = (username, limit, skip_num_articles, sort_by, order) => connection('articles')
  .select(
    'articles.article_id',
    'articles.body',
    'articles.created_at',
    'articles.username as author',
    'title',
    'topic',
    'articles.votes',
  )
  .where('articles.username', '=', username)
  .count({ comment_count: 'comments.comment_id' })
  .leftJoin('comments', 'comments.article_id', 'articles.article_id')
  .groupBy('articles.article_id')
  .limit(limit)
  .offset(skip_num_articles)
  .orderBy(sort_by, order)
  .returning('*');
