/*jshint esversion:6, node:true*/
'use strict';

const Menu = require('..');

const topMenu = new Menu('Main', {
    segment: '/',
    data: {
        acl: 'user'
    }
});

const adminMenu = new Menu('Admin');

const consoleMenu = Menu.get('admin').addNode('Console');
consoleMenu.addNode('WebSocket');
consoleMenu.addNode('Payloads');
consoleMenu.addNode('Requests');

const crudMenu = Menu.get('admin').addNode('Crud');
crudMenu.segment = 'api';
crudMenu.addNode('Users', {
    data: { resource: 'user' }
});
crudMenu.addNode('Profile', {
    data: { resource: 'profile' }
});
crudMenu.addNode('Options', {
    data: { resource: 'options' }
});

topMenu.addNode(adminMenu);
topMenu.addNode(crudMenu);

// return Menu.get('main').toCLI();

console.log('------ CLI MENU -----');
Menu.get('admin').toCLI();

console.log('------ JSON MENU -----');
console.log(JSON.stringify(Menu.get('main').toJSON(), null, 4));

console.log('------ SUB-MENU -----');
//TODO: Fix this
let crud = Menu.get('crud');
console.log(JSON.stringify(crud.toJSON(), null, 4));


console.log('------ HTML MENU -----');
let menu = Menu.get('admin').toJSON();
console.log('<div id="' + menu.id + '" class="ui small menu">');
menu.nodes.map(child => {
    console.log(`  <div class="right menu">
                     <div class="ui dropdown item">
                       <i class="dropdown icon"></i>
                       <div class="menu">`);
    child.nodes.map(leaf => {
        console.log(`        <a href="${leaf.uri}" class="item">${leaf.name}</a>`);
    });
    console.log('      </div>');
    console.log('    </div>');
    console.log('  </div>');
});
console.log('');
console.log('</div>');
