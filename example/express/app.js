var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var routes = require('./routes/index');
var users = require('./routes/users');

//////////////////
//We want to create a top menu here.
var Menu = require('/Users/goliatone/Development/NODEJS/gmenu');

let adminMenu = new Menu('Admin', {segment: false});

let consoleMenu = Menu.get('admin').addNode('Web Console');
consoleMenu.addNode('WebSocket');
consoleMenu.addNode('Payloads');
consoleMenu.addNode('Requests');

let crudMenu = Menu.get('admin').addNode('Pets');
crudMenu.addNode('Profiles');
crudMenu.addNode('Owners');
//////////////////

var app = express();

// Use Menu


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(adminMenu.middleware.bind(adminMenu));

app.use('/', routes);
app.use('/users', users);

var pets = express();
pets.get('/pets/owners', function(req, res){
    res.render('index', { title: 'Owners' });
});
pets.get('/pets/profiles', function(req, res){
    res.render('index', { title: 'Profiles' });
});
pets.get('/pets', function(req, res){
    res.render('index', { title: 'Pets' });
});
app.use(pets);

var magic = express();
var magicRouter = express.Router();
magicRouter.get('/pets/magic', function(req, res){
    res.send('abracadabra...');
});
magic.use('/users', magicRouter);
app.use(magic);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

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


module.exports = app;