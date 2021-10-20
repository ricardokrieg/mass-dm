module.exports = {
  test: {
    client: 'postgresql',
    connection: 'postgres://postgres:password@localhost:5432/postgres',
  },
  development: {
    client: 'postgresql',
    connection: 'postgres://postgres:password@localhost:5432/postgres',
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },
};
