"use strict";

module.exports = function(sequelize, DataTypes) {
  var Savedsong = sequelize.define("Savedsong", {
    name: DataTypes.STRING,
    thirdPartyId: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Savedsong.hasMany(models.User);
        // associations can be defined here
      }
    }
  });

  return Savedsong;
};
