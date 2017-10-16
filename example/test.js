/*jshint esversion:6, node:true*/
'use strict';

const Menu = require('..');

let adminMenu = new Menu('Admin');
adminMenu.request = {
    route: {
        path: '/admin/api/users'
    }
};

let consoleMenu = Menu.get('admin').addNode('Console');
consoleMenu.addNode('WebSocket');
consoleMenu.addNode('Payloads');
consoleMenu.addNode('Requests');

let crudMenu = Menu.get('admin').addNode('Crud');
crudMenu.segment = 'api';
crudMenu.addNode('Users');
crudMenu.addNode('Passports');
crudMenu.addNode('HotDesks');

console.log('------ MENU -----');
Menu.get('admin').toCLI();

console.log('------ SUB-MENU -----');
//TODO: Fix this
let crud = Menu.get('crud');
console.log(JSON.stringify(crud.toJSON(), null, 4));

let menu = Menu.get('admin').toJSON();


// console.log('<div id="' + menu.id + '" class="ui small menu">');
//     menu.children.map((child)=>{
//         console.log('<div class="right menu">');
//             console.log('<div class="ui dropdown item">');
//                 console.log(child.label);console.log('<i class="dropdown icon"></i>');
//                 console.log('<div class="menu">');
//                 child.children.map((leaf)=>{
//                     console.log('<a class="item">'+leaf.label+'</a>');
//                 });
//                 console.log('</div>');
//             console.log('</div>');
//         console.log('</div>');
//     });
//     console.log('');
// console.log('</div>');
