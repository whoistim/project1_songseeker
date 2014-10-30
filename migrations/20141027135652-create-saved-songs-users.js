"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("SavedSongsUsers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      SavedSongId: {
        type: DataTypes.STRING,
        foreignKey: true
      },
      UserId: {
        type: DataTypes.STRING,
        foreignKey: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("SavedSongsUsers").done(done);
  }
};