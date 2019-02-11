const connection = require('../connection');

exports.fetchArticles = (limit, skip_num_articles, sort_by, order) => connection('articles')
  .select(
    'articles.article_id',
    'articles.body',
    'articles.created_at',
    'articles.username as author',
    'title',
    'topic',
    'articles.votes',
  )
  .count({ comment_count: 'comments.comment_id' })
  .leftJoin('comments', 'comments.article_id', 'articles.article_id')
  .groupBy('articles.article_id')
  .limit(limit)
  .offset(skip_num_articles)
  .orderBy(sort_by, order)
  .returning('*');

exports.fetchArticlesByID = article_id => connection('articles')
  .select(
    'articles.article_id',
    'articles.body',
    'articles.created_at',
    'articles.username',
    'title',
    'topic',
    'articles.votes',
  )
  .where('articles.article_id', article_id)
  .count({ comment_count: 'comments.comment_id' })
  .groupBy('articles.article_id')
  .leftJoin('comments', 'comments.article_id', 'articles.article_id')
  .returning('*');

exports.editArticleByID = (article_id, inc_votes) => connection('articles')
  .select('votes')
  .where({ article_id })
  .then(([{ votes }]) => {
    const totesVotes = inc_votes + votes;
    return connection('articles')
      .update('votes', totesVotes)
      .where('article_id', article_id)
      .returning('*');
  });

exports.removeArticleByID = article_id => connection('articles')
  .where({ article_id })
  .del()
  .returning('*');

exports.fetchCommentsByArticleID = (article_id, limit, skip_num_comments, sort_by, order) => connection('comments')
  .select(
    'comment_id',
    'comments.body',
    'comments.created_at',
    'articles.username',
    'comments.votes',
    'comments.article_id',
  )
  .where('comments.article_id', article_id)
  .rightJoin('articles', 'articles.article_id', 'comments.article_id')
  .limit(limit)
  .offset(skip_num_comments)
  .orderBy(sort_by, order);

exports.insertCommentByArticleID = comment => connection('comments')
  .insert(comment)
  .returning('*');

exports.editCommentByArticleID = (article_id, comment_id, inc_votes) => connection('comments')
  .select('votes')
  .where({ article_id, comment_id })
  .then(([{ votes }]) => {
    const totesVotes = inc_votes + votes;
    return connection('comments')
      .update('votes', totesVotes)
      .where('article_id', article_id)
      .andWhere('comment_id', comment_id)
      .returning('*');
  });

exports.removeCommentById = (article_id, comment_id) => connection('comments')
  .where({ article_id, comment_id })
  .del()
  .returning('*');
