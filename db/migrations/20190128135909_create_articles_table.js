exports.up = function (knex, Promise) {
  return knex.schema.createTable('articles', (articlesTable) => {
    articlesTable
      .increments('article_id')
      .primary()
      .unique()
      .notNullable();
    articlesTable.string('title').notNullable();
    articlesTable.string('body', 10000).notNullable();
    articlesTable.integer('votes').defaultTo(0);
    articlesTable
      .string('topic')
      .references('slug')
      .inTable('topics')
      .notNullable();
    articlesTable
      .string('username')
      .references('username')
      .inTable('users');
    articlesTable.timestamp('created_at').defaultTo(knex.fn.now());
    // 6?
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('articles');
};
