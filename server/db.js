// импортируем sequelize
const {Sequelize} = require('sequelize')

// Экспортируем объект, который мы создаем из этого класса
module.exports = new Sequelize(
  process.env.DB_NAME, // название бд
  process.env.DB_USER, // пользователь
  process.env.DB_PASSWORD, // паспорт для бд
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  }
)
