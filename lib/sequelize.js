// lib/sequelize.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
});

export default sequelize;
