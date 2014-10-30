var bcrypt = require("bcrypt");
var passport = require("passport");
var passportLocal = require("passport-local");
var salt = bcrypt.genSaltSync(10);


module.exports = function (sequelize, DataTypes){
   var User = sequelize.define('User', {
     name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: [6, 30]
        }
    },
    password: DataTypes.STRING
    },

  {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Savedsong);
        // associations can be defined here
      },
      encryptPass: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
    },
      comparePass: function(userpass, dbpass) {
      // don't salt twice when you compare....watch out for this
        return bcrypt.compareSync(userpass, dbpass);
    },
      createNewUser:function(name, password, err, success ) {
        if(password.length < 6) {
          err({message: "Password should be more than six characters"});
        }
        else{
        User.create({
            name: name,
            password: this.encryptPass(password)
          }).done(function(error,user) {
            if(error) {
              console.log(error);
              if(error.name === 'SequelizeValidationError'){
              err({message: 'Your name should be at least 6 characters long', name: name});
            }
              else if(error.name === 'SequelizeUniqueConstraintError') {
              err({message: 'An account with that name already exists', name: name});
              }
            }
            else{
              success({message: 'Account created, please log in now'});
            }
          });
        }
      },
      } // close classMethods
    } //close classMethods outer

  ); // close define user

  passport.use(new passportLocal.Strategy({
      nameField: 'name',
      passwordField: 'password',
      passReqToCallback : true
    },

    function(req, name, password, done) {
      // find a user in the DB
      User.find({
          where: {
            name: name
          }
        })
        // when that's done,
        .done(function(error,user){
          if(error){
            console.log(error);
            return done (err, req.flash('loginMessage', 'Oops! Something went wrong.'));
          }
          if (user === null){
            return done (null, false, req.flash('loginMessage', 'name does not exist.'));
          }
          if ((User.comparePass(password, user.password)) !== true){
            return done (null, false, req.flash('loginMessage', 'Invalid Password'));
          }
          done(null, user);
        });
    }));

  return User;
}; // close User function
