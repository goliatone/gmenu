'use strict';

var express = require('express');
var router = express.Router();

var Menu = require('../../..');

/*
 * Create Pets menu, we can access it using:
 */
let petsMenu = Menu.get('admin').addNode('Pets');
petsMenu.addNode('Profiles');
petsMenu.addNode('Owners');

let subMenu = petsMenu.addNode('Types');
subMenu.addNode('Cats');
subMenu.addNode('Dogs');

/* GET users listing. */
router.get('/types/:type?', function(req, res){
    res.render('index', { title: 'Types' });
});

router.get('/owners', function(req, res){
    res.render('index', { title: 'Owners' });
});
router.get('/profiles', function(req, res){
    res.render('index', { title: 'Profiles' });
});
router.get('/', function(req, res){
    res.render('index', { title: 'Pets' });
});


module.exports = router;
