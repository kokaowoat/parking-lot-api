'use strict';

module.exports = {
  'postgres': {
    'name': 'parking-lot',
    'host': process.env.POSTGRESQL_HOST,
    'port': 5432,
    'url': 'postgres://' + process.env.POSTGRESQL_USER + ':' + process.env.POSTGRESQL_PASSWORD + '@' + process.env.POSTGRESQL_HOST + '/' + process.env.POSTGRESQL_DATABASE,
    'database': process.env.POSTGRESQL_DATABASE,
    'password': process.env.POSTGRESQL_PASSWORD,
    'user': process.env.POSTGRESQL_USER,
    'connector': 'postgresql',
  },
  'db': {
    'name': 'db',
    'connector': 'memory'
  }
};