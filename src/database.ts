import {default as config} from './config'
const connection = require('../knexfile')[config.env]

export default require('knex')(connection)
