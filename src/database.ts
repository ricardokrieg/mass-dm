const connection = require('../knexfile')[process.env.NODE_ENV || 'development']

export default require('knex')(connection)
