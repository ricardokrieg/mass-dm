module.exports = {
  test: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      host:     'localhost',
      user:     'postgres',
      password: 'password',
    },
  },
  development: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      host:     'localhost',
      user:     'postgres',
      password: 'password',
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      database: process.env.DATABASE_NAME,
      host:     process.env.DATABASE_HOST,
      user:     process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
  },
};
