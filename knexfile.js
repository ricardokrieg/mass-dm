module.exports = {
  test: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      host:     'localhost',
      user:     'postgres',
      password: 'password'
    }
  },
  development: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      host:     'localhost',
      user:     'postgres',
      password: 'password'
    }
  }
};
