const connection = require('../connection');

exports.fetchUsers = () => connection('users').select('username', 'name', 'avatar_url');

exports.fetchSingleUser = username => connection('users')
  .select('username', 'name', 'avatar_url')
  .where(username);
