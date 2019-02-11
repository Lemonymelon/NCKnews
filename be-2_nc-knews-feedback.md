
  43 passing (6s)
  22 failing


 NCNews backend checklist

seed

- [x] any seed utils are pure - this is critical for the beforeEach hook
- [x] correctly uses `Date` to handle timestamps

general
- [?] README clear and instructions accurate
- [?] Clear instructions and script for seeding the DB
- [x] Uses knexfile.js and `process.env` for DB config
- [x] `package.json` includes dependencies (mocha in particular) organised into dev and not dev
- [x] `node_modules` and `knexfile.js` file ignored
- [x] Routes broken down with `Router.route()`
- [?] No errors in the console when running in dev or running tests
* Lots of console.logs in the errors folder
- [?] Deployed on heroku

Errors

- [x] extract into errors folder
- [x] separate functions for 400, 404, 405, and 500
- [x] using promise.reject

testing
- [x] Tests use test environment and test DB
- [x] Describe_it blocks organised_logically e.g.separate it blocks for queries
- [x] rollback() => latest() => seed() before every it block

  1) / DONE
       /api
         /topics/:topic/articles
           GET status:200
             responds with an array of article objects:

      AssertionError: expected { Object (article_id, body, ...) } to contain keys 'author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', and 'topic'
      + expected - actual

       [
         "article_id"
      -  "body"
      +  "author"
         "comment_count"
         "created_at"
         "title"
         "topic"
      -  "username"
         "votes"
       ]
      

* This end-point needs to have username as author and you don't need to serve the body on this endpoint 
(if you are serving up multiple articles)

  2) / DONE
       /api
         /topics/:topic/articles
           GET status:200
             responds with a total_count property giving the number of articles for that topic:
     AssertionError: expected undefined to equal '11'

* You are not responding with a total_count of the number of articles are for a given topic atm.

  3) /
       /api
         /topics/:topic/articles
           GET status:200
             returns default response if given invalid sort_by (DEFAULT order_by: created_at) order (DEFAULT sort_order: DESC):
     Error: expected 200 "OK", got 400 "Bad Request"

* You are giving back 400 Bad Request for this end-point which is fine (however, we decided in the end
not to penalise for erroneous queries)

  4) /
       /api
         /topics/:topic/articles
           ERRORS
             POST status:404 adding an article to a non-existent topic:
     Error: expected 404 "Not Found", got 400 "Bad Request"

* How are you handling the case for POSTing an article by a non-existent topic

  5) /
       /api
         /articles
           GET status:200
             will ignore an invalid sort_by query:
     Error: expected 200 "OK", got 400 "Bad Request"

* Getting a Bad Request for invalid sort_by query at the moment
This is fine though if you are happy with this behaviour from your API

  6) /
       /api
         /articles/:article_id
           GET status:200 responds with a single article object:

      AssertionError: expected { Object (article_id, body, ...) } to have keys 'article_id', 'body', 'author', 'created_at', 'votes', 'topic', 'comment_count', and 'title'
      + expected - actual

       [
         "article_id"
      +  "author"
         "body"
         "comment_count"
         "created_at"
         "title"
         "topic"
      -  "username"
         "votes"
       ]
      

* Re-name author to username in this end-point


  7) /
       /api
         /articles/:article_id
           GET status:404 url contains a non-existent (but potentially valid) article_id:
     Error: expected 404 "Not Found", got 500 "Internal Server Error"

* At the moment, you are getting this back from `knex`
TypeError: Cannot read property 'length' of undefined
-> In your controller you are checking 
```js
if (article.length < 1) {
        return Promise.reject({ status: 404, msg: 'Page not found!' });
      }
```
But article is not an array! It is just `undefined` here

  8) /
       /api
         /articles/:article_id
           PATCH status:200 and an updated article when given a body including a valid "inc_votes" (VOTE UP):
     AssertionError: expected undefined to equal 101

* Make sure you array-destructure in this controller for your PATCH request

  9) /
       /api
         /articles/:article_id
           PATCH status:200 responds with an updated article when given a body including a valid "inc_votes" (VOTE DOWN):
     AssertionError: expected undefined to equal 99

* Ensure you array-destructure - same problem


  10) /
       /api
         /articles/:article_id
           PATCH status:200s no body responds with an unmodified article:
     Error: expected 200 "OK", got 400 "Bad Request"

* `totesVotes` is `NaN` and therefore knex is throwing an error

  11) /
       /api
         /articles/:article_id
           DELETE status:204 and removes the article when given a valid article_id:
     Error: expected 204 "No Content", got 400 "Bad Request"

* This is CASCADE issue  - at the moment there are comments in the comments table that reference
the given article - and, therefore, knex is not allowing this.  Use CASCADE on commnents
in your migrations to fix this issue

  12) /
       /api
         /articles/:article_id
           DELETE status:404 when given a non-existent article_id:
     Error: expected 404 "Not Found", got 500 "Internal Server Error"

TypeError being created here by checking `.length` in your then() block

  13) /
       /api
         /articles/:article_id/comments/:comment_id
           PATCH status:200 with no body responds with an unmodified comment:
     Error: expected 200 "OK", got 400 "Bad Request"

* toteVotes is `NaN` at the moment 

  14) /
       /api
         /articles/:article_id/comments/:comment_id
           PATCH status:404 non-existent article_id is used:
     Error: expected 404 "Not Found", got 500 "Internal Server Error"

* knex is erroring out here when you use a non-existent article_id -> 
you attempt to find the comment first and then get the votes but you are destructuring inc_votes
off null

  15) /
       /api
         /articles/:article_id/comments/:comment_id
           PATCH status:404 non-existent comment_id is used:
     Error: expected 404 "Not Found", got 500 "Internal Server Error"

* Same issue here

  16) /
       /api
         /articles/:article_id/comments/:comment_id
           DELETE status:404 client uses a non-existent article_id:
     Error: expected 404 "Not Found", got 500 "Internal Server Error"

* You get nothing back then .length again and so the JS engine throws a TypeError


  17) /
       /api
         /articles/:article_id/comments/:comment_id
           DELETE status:404 client uses non-existent comment_id:
     Error: expected 404 "Not Found", got 500 "Internal Server Error"

* Same issue here as the above test


  18) /
       /api
         /articles/:article_id/comments/:comment_id
           invalid methods respond with 405:
     Error: expected 405 "Method Not Allowed", got 404 "Not Found"

* Invalid METHOD for a particular end-point  -> use a `handle405`

  19) /
       /users
         GET responds with a 200 and an array of user objects:
     Error: expected 200 "OK", got 404 "Not Found"

* Ensure you are using the userRouter in the apiRouter

  20) /
       /users
         invalid methods respond with 405:
     Error: expected 405 "Method Not Allowed", got 404 "Not Found"

  21) /
       /users/:username
         GET status:200 responds with a user object when given a valid username:
     Error: expected 200 "OK", got 404 "Not Found"

* Same issue as above

  22) /
       /users/:username
         invalid methods respond with 405:
     Error: expected 405 "Method Not Allowed", got 404 "Not Found"

* Same issue as above



