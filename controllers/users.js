const { fetchUsers, fetchSingleUser } = require('../db/models/users');

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      if (users.length < 1) {
        return Promise.reject({ status: 404, msg: 'users not found!' });
      }
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getSingleUser = (req, res, next) => {
  const { username } = req.params;
  fetchSingleUser(username)
    .then(([user]) => {
      if (user.length < 1) {
        return Promise.reject({ status: 404, msg: 'user not found!' });
      }
      res.status(200).send({ user });
    })
    .catch(next);
};
