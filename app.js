var express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  session = require("cookie-session"),
  db = require("./models/index"),
  request = require("request"),
  flash = require('connect-flash'),
  app = express();
  var morgan = require('morgan');
  var routeMiddleware = require("./config/routes");


// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}) );

app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 12000000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// prepare our serialize functions
passport.serializeUser(function(user, done){
  // console.log("SERIALIZED JUST RAN!");
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  // console.log("DESERIALIZED JUST RAN!");
  db.User.find({
      where: {
        id: id
      }
    })
    .done(function(error,user){
      done(error, user);
    });
});
app.get('/', routeMiddleware.preventLoginSignup, function(req,res){
    res.render('index');
});

app.get('/signup', routeMiddleware.preventLoginSignup, function(req,res){
    res.render('signup', { username: ""});
});

app.get('/login', routeMiddleware.preventLoginSignup, function(req,res){
    res.render('login', {message: req.flash('loginMessage'), username: ""});
});

app.get('/home', routeMiddleware.checkAuthentication, function(req,res){
  res.render("home", {user: req.user});
});

app.post('/search', routeMiddleware.checkAuthentication, function(req,res){

  var url = "http://developer.echonest.com/api/v4/song/search?api_key=0JJG9AOSEXOB7KW0E&bucket=id:spotify&bucket=tracks&format=json&results=5&bucket=audio_summary";
  var searchTerms = req.body;
  console.log(searchTerms);
  for(var term in searchTerms){
    if(searchTerms[term]){
      url = url.concat("&"+term+"="+encodeURIComponent(searchTerms[term])); //checks each pair in the body.
    }
    } 
    console.log(url);



  request(url, function(error,response,body){
    if(response.statusCode !== 200){//check for valide server response code
      var message = "Invalid parameter, please try again.";
      // console.log(JSON.parse(body));//chops up response to send back to the page.
      res.render("home", {user:req.user, message: message});//sends user and message back.
    }
    else if(!error && response.statusCode === 200){
      var result = JSON.parse(body);
      var songs = result.response.songs;
      // console.log(spotifyID);

      res.render("results", {user:req.user, songs: songs, songQ: req.body});
      
    }
    
  });

  //http://developer.echonest.com/api/v4/song/search?api_key=0JJG9AOSEXOB7KW0E&format=json&
  //results=1&artist=radiohead&title=karma%20police&bucket=id:7digital-US&bucket=audio_summary&bucket=tracks
});

// on submit, create a new users using form values
app.post('/submit', function(req,res){

  db.User.createNewUser(req.body.username, req.body.password,
  function(err){
    res.render("signup", {message: err.message, username: req.body.username});
  },
  function(success){
    res.render("index", {message: success.message});
  });
});

// authenticate users when logging in - no need for req,res passport does this for us
app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/mysongs', routeMiddleware.checkAuthentication, function(req,res){
var url = "http://developer.echonest.com/api/v4/song/profile?api_key=0JJG9AOSEXOB7KW0E&format=json&bucket=id:spotify&bucket=tracks&bucket=audio_summary&id=";
var mySongLookup = req.body.mySongId;
console.log("this is mySongId*** "+mySongLookup);
url = url+mySongLookup;
console.log("this is search url*** "+url);

  request(url, function(error,response,body){
    if(response.statusCode !== 200){//check for valide server response code
      var message = "Invalid song ID, please try again.";
      // console.log(JSON.parse(body));//chops up response to send back to the page.
      res.render("results", {user:req.user, message: message});//sends user and message back.
    }
    else if(!error && response.statusCode === 200){
      var result = JSON.parse(body);
      // console.log(Array.isArray(result.response.songs))
      // console.log("This is the result ****", result.response.songs[0]);
      // console.log(result.response.songs[0]);
      var song = result.response.songs[0];
      res.render("mysongs", {user:req.user, song: song});
      
    }
    
  });
// console.log(req.user);
});

app.get('/logout', function(req,res){
  //req.logout added by passport - delete the user id/session
  req.logout();
  res.redirect('/');
});

// catch-all for 404 errors
app.get('*', function(req,res){
  res.status(404);
  res.render('404');
});

app.listen(process.env.PORT || 3000);
