import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',  // You are using MySQL, so this is correct
  logging: false     // Disable logging; default: console.log
});

// Function to sync the database
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Alter tables to match models
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to sync the database:', error);
  }
};

export default sequelize;
