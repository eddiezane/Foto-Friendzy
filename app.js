var express = require('express');
var app = express();
var server = require('http').createServer(app);
var favicon = require('serve-favicon');
var io = require('socket.io')(server);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./assets/data.json');

// var session = require('express-session');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon(__dirname + '/public/favicon.ico'));
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
var sockQ = {};
var sockDB = {};
io.on('connection', function(socket) {
  var BreakException= {};

  socket.on('disconnect', function() {
    try {
      for (var loc in sockQ) {
        if (sockQ[loc] == socket.id) {
          delete sockQ[loc];
          throw BreakException;
        }
      }
    } catch(e) {
      if (e!==BreakException) throw e;
    }
    delete sockDB[socket.id];
  });

  socket.on('join', function(data) {
    socket.emit('reply', db);
  });

  socket.on('location', function(loc) {
    if (sockQ[loc]) {
      try {
        // User changes queue
        for (var key in sockQ) {
          if (sockQ[key] == socket.id) {
            delete sockQ[key];
          }
        }
        for (var key in io.in('/').sockets) {
          var sock = io.in('/').sockets[key];
          if (sockQ[loc] == sock.id) {
            var room = guid();
            sock.join(room);
            socket.join(room);
            sockQ[loc] = null;
            sockDB[socket.id] = {location: loc, room: room};
            sockDB[sock.id] = {location: loc, room: room};

            // Get item
            var item = db[loc][Math.floor(Math.random()*db[loc].length)];
            io.in(room).emit('match', item);
            // Hack to break on find
            throw BreakException;
          }
        }
      } catch(e) {
        if (e!==BreakException) throw e;
      }
    } else {
      sockQ[loc] = socket.id;
    }
  });

  socket.on('data', function(data) {
    socket.broadcast.to(sockDB[socket.id].room).emit('image', data);
  });

  socket.on('judge', function(data) {
    if (data == 'yes') {
      socket.broadcast.to(sockDB[socket.id].room).emit('result', 'yes');
    } else {
      socket.broadcast.to(sockDB[socket.id].room).emit('result', 'no');
    }
  });

  socket.on('done', function() {
    socket.broadcast.to(sockDB[socket.id].room).emit('done');
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

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
  .toString(16)
  .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  s4() + '-' + s4() + s4() + s4();
  };
})();

// module.exports = app;
