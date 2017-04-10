'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var routes = require('./routes/index');
var users = require('./routes/users');
var pets = require('./routes/pets');

//////////////////
//We want to create a top menu here.
var Menu = require('gmenu');

/*
 * Create Admin menu, we can access it using:
 */
let adminMenu = new Menu('Admin', {segment: false});

/*
 * To access a child menu of admin,
 * use `find`.
 */
let remoteMenu = adminMenu.find('users').addNode('Remote Links', {segment: '#'});
remoteMenu.addNode('Twitter', {link: 'http://twitter.com'});
remoteMenu.addNode('Instagram', {link: 'http://instagram.com'});
remoteMenu.addNode('Keybase', {link: 'http://keybase.io'});

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

app.use((req, res, next)=> {
    console.log('------- Admin Menu ------');
    Menu.get('admin').toCLI();
    console.log('-------------------------');
    next();
});

app.use('/', routes);

/*
 * The route /users defines the Users menu
 */
app.use('/users', users);
app.use('/pets', pets);




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
