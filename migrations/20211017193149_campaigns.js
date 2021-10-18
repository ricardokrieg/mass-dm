const tableName = 'campaigns'

exports.up = function(knex) {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() => {
    return knex.schema.createTable(tableName, table => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary()
      table.string('user_id').notNullable()
      table.string('title').notNullable()
      table.timestamps()
    })
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(tableName)
}
