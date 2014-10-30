"use strict";

module.exports = function(sequelize, DataTypes) {
  var SavedSongsUsers = sequelize.define("SavedSongsUsers", {
    SavedSongId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return SavedSongsUsers;
};
