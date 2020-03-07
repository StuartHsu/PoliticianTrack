require('dotenv').config()

module.exports =
{
  mysql:
  {
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    host_TEST: process.env.HOST_TEST,
    user_TEST: process.env.DATABASE_USER_TEST,
    password_TEST: process.env.DATABASE_PASSWORD_TEST,
    database_TEST: process.env.DATABASE_TEST
  }
}
