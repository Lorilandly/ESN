module.exports = {
    up: (queryInterface, Sequelize) =>
      queryInterface.createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        passwordHash: {
            type: Sequelize.STRING
        },
        privilege: {
            type: Sequelize.STRING,
            
        },
        currentStatus: {
            type: Sequelize.STRING
        }
      }),
    down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Users'),
  };