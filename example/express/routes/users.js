'use strict';

var express = require('express');
var router = express.Router();

var Menu = require('../../..');

let userMenu = Menu.get('admin').addNode('Users');
userMenu.addNode('Pets');
userMenu.addNode('Profiles');

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Users' });
});

router.get('/pets', function(req, res) {
    res.render('index', { title: 'Pets' });
});

router.get('/profiles', function(req, res) {
    res.render('index', { title: 'Profiles' });
});

module.exports = router;
