exports.convertArticleData = data => data.map(({ created_at, created_by, ...restOfData }) => ({
  ...restOfData,
  username: created_by,
  created_at: new Date(created_at).toDateString(),
}));

exports.createRefObject = articles => articles.reduce((referenceObject, { article_id, title }) => {
  referenceObject[title] = article_id;
  return referenceObject;
}, {});

exports.convertCommentData = (refObject, commentData) => commentData.map(({
  belongs_to, created_at, created_by, ...restComment
}) => ({
  ...restComment,
  username: created_by,
  article_id: refObject[belongs_to],
  created_at: new Date(created_at).toDateString(),
}));

exports.formatArticleByTopic = (articleData, topic) => ({ ...articleData, topic });
