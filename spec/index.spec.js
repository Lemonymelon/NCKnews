process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  describe('/topics', () => {
    it('GET status 200 responds invalid method error', () => request
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).to.be.an('array');
        expect(topics[0]).to.have.keys('slug', 'description');
      }));

    it('POST status 201 responds with inserted topic', () => request
      .post('/api/topics')
      .send({ slug: 'lemons', description: 'melons' })
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic.slug).to.equal('lemons');
        expect(topic.description).to.equal('melons');
      }));

    it('POST status 400 responds with correct error message when passed object with invalid field names', () => request
      .post('/api/topics')
      .send({ slurg: 'lemons', descrurption: 'melons' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> invalid field name(s) -->> insert into "topics" ("descrurption", "slurg") values ($1, $2) returning * - column "descrurption" of relation "topics" does not exist',
        );
      }));

    it('POST status 400 responds with correct error message when passed object with missing field names', () => request
      .post('/api/topics')
      .send({ description: 'melons' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> missing mandatory field -->> insert into "topics" ("description") values ($1) returning * - null value in column "slug" violates not-null constraint',
        );
      }));

    it('POST status 422 responds with correct error message when passed object with reserved unique field name(s)', () => request
      .post('/api/topics')
      .send({
        slug: 'mitch',
        description: "if you can't stand the heat, stay out of the mitchen",
      })
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'unprocessable entity -->> duplicate key value violates unique constraint -->> Key (slug)=(mitch) already exists.',
        );
      }));

    it('PATCH status 405 responds invalid method error', () => request
      .patch('/api/topics')
      .send({ whatevs: 'Trevs' })
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));

    it('DEL status 405 responds invalid method error', () => request
      .del('/api/topics')
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));
  });

  describe('/topics/:topic/articles', () => {
    it('GET status 200 responds with articles on a specified topic', () => request
      .get('/api/topics/mitch/articles')
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(total_count).to.equal(10);
        expect(articles).to.be.an('array');
        expect(articles[0]).to.have.keys(
          'article_id',
          'title',
          'votes',
          'topic',
          'author',
          'created_at',
          'comment_count',
        );
      }));

    it('GET status 404 responds with not found error', () => request
      .get('/api/topics/merch/articles')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('Page not found!');
      }));

    it('GET status 404 responds with not found error ', () => request
      .get('/api/topics/1/articles')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('Page not found!');
      }));

    it('GET status 200 should accept limit query', () => request
      .get('/api/topics/mitch/articles?limit=3')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).to.equal(3);
        expect(articles[0].article_id).to.equal(1);
        expect(articles[1].article_id).to.equal(2);
        expect(articles[2].article_id).to.equal(3);
        expect(articles[0]).to.have.all.keys(
          'article_id',
          'created_at',
          'author',
          'title',
          'topic',
          'votes',
          'comment_count',
        );
      }));

    it('GET status 200 should ignore invalid limit query', () => request
      .get('/api/topics/mitch/articles?limit=potato')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).to.equal(10);
        expect(articles[0]).to.have.all.keys(
          'article_id',
          'created_at',
          'author',
          'title',
          'topic',
          'votes',
          'comment_count',
        );
      }));

    it('GET status 200 should accept sort_by and order queries', () => request
      .get('/api/topics/mitch/articles?sort_by=article_id&order=asc')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(1);
        expect(articles[articles.length - 1].article_id).to.equal(11);
        expect(articles.length).to.equal(10);
      }));

    it('GET status 200 should ignore invalid sort field', () => request // *
      .get('/api/topics/mitch/articles?sort_by=sharticle_id&order=asc')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(12);
        expect(articles[articles.length - 1].article_id).to.equal(2);
        expect(articles.length).to.equal(10);
      }));

    it('GET status 200 should ignore invalid order query', () => request
      .get('/api/topics/mitch/articles?sort_by=article_id&order=desk')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0]).to.haveOwnProperty('article_id');
      }));

    it('GET status 200 should accept p (from page) query', () => request
      .get('/api/topics/mitch/articles?p=2')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(12);
      }));

    it('GET status 200 should ignore invalid (e.g. string) p (from page) query', () => request
      .get('/api/topics/mitch/articles?p=pee')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(1);
      }));

    it('GET status 200 should ignore invalid query when used', () => request
      .get('/api/topics/mitch/articles?knife=spoon')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(1);
      }));

    it('POST status 201 should respond with article with correct article', () => request
      .post('/api/topics/mitch/articles')
      .send({
        title: 'you beautiful son of a Mitch',
        body: 'blerp',
        username: 'butter_bridge',
      })
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).to.have.keys(
          'article_id',
          'title',
          'body',
          'votes',
          'topic',
          'username',
          'created_at',
        );
        expect(article.body).to.equal('blerp');
        expect(article.article_id).to.equal(13);
        expect(article.title).to.equal('you beautiful son of a Mitch');
        expect(article.topic).to.equal('mitch');
        expect(article.username).to.equal('butter_bridge');
        expect(article.votes).to.equal(0);
      }));

    it('POST status 400 responds with correct error message when passed object with missing field names', () => request
      .post('/api/topics/mitch/articles')
      .send({
        title: 'A Mitch in time saves nine',
        username: 'butter_bridge',
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> missing mandatory field -->> insert into "articles" ("title", "topic", "username") values ($1, $2, $3) returning * - null value in column "body" violates not-null constraint',
        );
      }));

    it('POST status 400 responds with correct error message when passed object with invalid field names', () => request
      .post('/api/topics/mitch/articles')
      .send({
        turtle: "you're like a Mitch I just can't scratch",
        body: 'blerp',
        username: 'butter_bridge',
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> invalid field name(s) -->> insert into "articles" ("body", "topic", "turtle", "username") values ($1, $2, $3, $4) returning * - column "turtle" of relation "articles" does not exist',
        );
      }));

    it('POST status 404 responds with correct error message when passed object using invalid topic', () => request
      .post('/api/topics/smitch/articles')
      .send({
        title: 'one fiddy for the golden smitch',
        body: 'blerp',
        username: 'butter_bridge',
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> foreign key not found -->> insert into "articles" ("body", "title", "topic", "username") values ($1, $2, $3, $4) returning * - insert or update on table "articles" violates foreign key constraint "articles_topic_foreign"',
        );
      }));

    it('PATCH status 405 responds invalid method error', () => request
      .patch('/api/topics/mitch/articles')
      .send({ whatevs: 'Trevs' })
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));

    it('DEL status 405 responds invalid method error', () => request
      .del('/api/topics/mitch/articles')
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));
  });

  describe('/api/articles', () => {
    it('GET status 200 returns an array of articles', () => request
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).to.be.an('array');
        expect(articles[0]).to.have.keys(
          'article_id',
          'title',
          'body',
          'votes',
          'topic',
          'author',
          'created_at',
          'comment_count',
        );
      }));

    it('GET status 200 should accept limit query', () => request
      .get('/api/articles?limit=3')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).to.equal(3);
        expect(articles[0].article_id).to.equal(1);
        expect(articles[1].article_id).to.equal(2);
        expect(articles[2].article_id).to.equal(3);
      }));

    it('GET status 200 should ignore non-numeric limit query', () => request
      .get('/api/articles?limit=tomato')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).to.equal(10);
        expect(articles[0]).to.have.all.keys(
          'article_id',
          'body',
          'created_at',
          'author',
          'title',
          'topic',
          'votes',
          'comment_count',
        );
      }));

    it('GET status 200 should accept sort_by and order queries', () => request
      .get('/api/articles?sort_by=article_id&order=desc')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(1);
        expect(articles[articles.length - 1].article_id).to.equal(10);
        expect(articles.length).to.equal(10);
      }));

    it('GET status 400 should ignore invalid sort field', () => request
      .get('/api/articles?sort_by=farticle_id&order=asc')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(12);
        expect(articles[articles.length - 1].article_id).to.equal(3);
      }));

    it('GET status 200 should ignore invalid order query', () => request
      .get('/api/articles?sort_by=article_id&order=ask')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0]).to.haveOwnProperty('article_id');
      }));

    it('GET status 200 should accept p (from page) query', () => request
      .get('/api/articles?p=2')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(11);
      }));

    it('GET status 200 should ignore invalid (e.g. string) p (from page) query', () => request
      .get('/api/articles?p=pea')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(1);
      }));

    it('GET status 200 should ignore invalid query when used', () => request
      .get('/api/articles?spife=knoon')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles[0].article_id).to.equal(1);
      }));

    it('POST status 405 responds invalid method error', () => request
      .post('/api/articles')
      .send({ whatevs: 'Trevs' })
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));

    it('PATCH status 405 responds invalid method error', () => request
      .patch('/api/articles')
      .send({ whatevs: 'Trevs' })
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));

    it('DEL status 405 responds invalid method error', () => request
      .del('/api/articles')
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('invalid method for this endpoint!');
      }));
  });

  describe('/api/articles/:article_id', () => {
    it('GET status 200 should serve article with specified article_id', () => request
      .get('/api/articles/1')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).to.equal(1);
        expect(article.title).to.equal('Living in the shadow of a great man');
        expect(article.comment_count).to.equal('13');
      }));

    it('GET status 404 responds with not found error', () => request
      .get('/api/articles/salmon')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> invalid syntax -->> select "articles"."article_id", "articles"."body", "articles"."created_at", "articles"."username", "title", "topic", "articles"."votes", count("comments"."comment_id") as "comment_count" from "articles" left join "comments" on "comments"."article_id" = "articles"."article_id" where "articles"."article_id" = $1 group by "articles"."article_id" - invalid input syntax for integer: "salmon"',
        );
      }));

    it('PATCH status 200 should serve article with augmented vote count', () => request
      .patch('/api/articles/1')
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { article } }) => {
        console.log(article);
        expect(article.article_id).to.equal(1);
        expect(article.votes).to.equal(101);
      }));

    it.only('PATCH status 200 should serve article with augmented vote count', () => request
      .patch('/api/articles/1')
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body: { article } }) => {
        console.log(article);
        expect(article.article_id).to.equal(1);
        expect(article.votes).to.equal(99);
      }));

    it('PATCH status 400 should return correct error message when passed malformed syntax', () => request
      .patch('/api/articles/1')
      .send({ inc_votes: 'lettuce' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> invalid syntax -->> update "articles" set "votes" = $1 where "article_id" = $2 returning * - invalid input syntax for integer: "one100"',
        );
      }));

    it('DEL status 204 should remove article from db', () => request
      .del('/api/articles/2')
      .expect(204)
      .then(({ body }) => {
        expect(body).to.eql({});
        return connection('articles').where('article_id', 2);
      })
      .then(([article]) => {
        expect(article).to.equal(undefined);
      }));

    it('DEL status 204 should remove article from db', () => request
      .del('/api/articles/two')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal(
          'bad request -->> invalid syntax -->> delete from "articles" where "article_id" = $1 returning * - invalid input syntax for integer: "two"',
        );
      }));
  });

  describe('/api/articles/:article_id/comments', () => {
    it('GET status 200 should serve comments belonging to article with specified article_id', () => request
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((element) => {
          expect(element.article_id).to.equal(1);
        });
      }));

    it('GET status 200 should accept sort_by and order queries', () => request
      .get('/api/articles/1/comments?sort_by=comment_id&order=asc')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments[0].comment_id).to.equal(2);
        expect(comments[comments.length - 1].comment_id).to.equal(11);
        expect(comments.length).to.equal(10);
      }));

    it('POST status 201 should respond with new comment belonging to specified article', () => request
      .post('/api/articles/1/comments')
      .send({ username: 'butter_bridge', body: 'insightful opinions' })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).to.have.keys(
          'comment_id',
          'username',
          'article_id',
          'votes',
          'created_at',
          'body',
        );
        expect(comment.article_id).to.equal(1);
        return connection('comments')
          .select('*')
          .where('article_id', 1)
          .then((articles) => {
            expect(articles.length).to.equal(14);
          });
      }));
  });

  describe('/api/articles/:article_id/comments/:comment_id', () => {
    it('PATCH status 200 should serve comment with augmented vote count', () => request
      .patch('/api/articles/9/comments/1')
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.article_id).to.equal(9);
        expect(comment.comment_id).to.equal(1);
        expect(comment.votes).to.equal(17);
      }));

    it('DEL status 204 should remove comment from db', () => request
      .del('/api/articles/9/comments/1')
      .expect(204)
      .then(({ body }) => {
        expect(body).to.eql({});
        return connection('comments')
          .where('article_id', 9)
          .andWhere('comment_id', 1);
      })
      .then(([article]) => {
        expect(article).to.equal(undefined);
      }));
  });

  describe('/users', () => {
    it('GET status 200 should return an array of users', () => request
      .get('/api/users')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).to.be.an('array');
        expect(users.length).to.equal(3);
        expect(users[0]).to.have.keys('username', 'name', 'avatar_url');
      }));
    it('GET status 200 should return a single user when passed a user ID', () => {
      request
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user.username).to.equal('butter_bridge');
        });
    });
    it('GET status 200 should return articles belonging to a single user when passed a user ID', () => {
      request
        .get('/api/users/butter_bridge/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles[0].author).to.equal('butter_bridge');
        });
    });
  });
});
