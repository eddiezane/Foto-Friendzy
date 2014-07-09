var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var session = require('express-session');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('tacosareyummy'));
// app.use(session({secret: 'tacosareyummy'}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose
// mongoose.connect('mongodb://localhost/fotofriendzy');
// var UserSchema = new Schema({});
// UserSchema.plugin(passportLocalMongoose);
// var User = mongoose.model('User', UserSchema);

// Passport Local
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Routes
app.get('/', function(req, res) {
  res.render('new');
});

// app.get('/new', function(req, res) {
  // res.render('new', {user: req.user});
// });

// app.post('/login', passport.authenticate('local'), function(req, res) {
  // res.redirect('/');
// });

// app.get('/register', function(req, res) {
  // res.render('register');
// });

// app.post('/register', function(req, res) {
  // User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
    // if (err) {
      // return res.render('register');
    // }
    // res.redirect('/');
  // });
// });

// Socket Logic
io.on('connection', function(socket) {

  socket.on('join', function(data) {
    console.log('Join');
  });

  socket.on('data', function(data) {
    console.log("Got data");
    socket.broadcast.emit('image', data);
  });
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(process.env.PORT || 3000);

// module.exports = app;
