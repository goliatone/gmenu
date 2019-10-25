/*jshint esversion:6, node:true*/
'use strict';
const Menu = require('..');
const AccessControl = require('accesscontrol');

let grantList = [
    { role: 'admin', resource: 'passport', action: 'read:any', attributes: '*' },
    { role: 'admin', resource: 'hotdesk', action: 'read:any', attributes: '*' },
    { role: 'admin', resource: 'user', action: 'read:any', attributes: '*' },
    { role: 'user',  resource: 'hotdesk', action: 'read:any', attributes: '*' },
    { role: 'user',  resource: 'user', action: 'read:any', attributes: '*' },
];
const ac = new AccessControl(grantList);

const topMenu = new Menu('Main', {
    segment:'/',
    data: {
        acl: 'user'
    },
    filterNode(node) {
        console.log('node path', node.keypath);
        let role = this.request.user.role;
        let resource = node.data.resource;
        if(!resource) return node;

        console.log('can role "%s" read "%s"?', role, resource, ac.can(role).readAny(resource).granted)
        if(ac.can(role).readAny(resource).granted) {
            return node;
        }
    }
});

const adminMenu = new Menu('Admin', {
    data: {}
});
adminMenu.request = {
    route: {
        path: '/admin/api/users'
    }
};

const consoleMenu = Menu.get('admin').addNode('Debug', {

});

consoleMenu.addNode('WebSocket', {

});
consoleMenu.addNode('Payloads', {

});
consoleMenu.addNode('Requests', {

});

const crudMenu = Menu.get('admin').addNode('Crud');
crudMenu.segment = 'api';
crudMenu.addNode('Users', {
    data: { resource: 'user' }
});
crudMenu.addNode('Passports', {
    data: { resource: 'passport' }
});
crudMenu.addNode('HotDesks', {
    data: { resource: 'hotdesk' }
});

topMenu.addNode(adminMenu);
topMenu.addNode(crudMenu);

// console.log(topMenu.find('main').id);
// console.log(topMenu.find('main.crud').id);
// console.log(topMenu.find('main.crud.users').id);
// console.log(topMenu.find('main.admin.debug.websocket').id);

console.log('----- GRANTS -----')
console.log(ac.getGrants());

const user = { id:1, role:'user' };
const admin = { id:1, role:'admin' };

console.log('------------ USER MENU --------------');
Menu.get('main').middleware({path:'/', user:user}, {locals:{}}, _=> {
    console.log('--- done');
    let menu = Menu.get('admin').toJSON();
console.log('<div id="' + menu.id + '" class="ui small menu">');
    menu.nodes.map(child => {
        console.log('  <div class="right menu">');
            console.log('    <div class="ui dropdown item">');
                console.log('      <i class="dropdown icon"></i>');
                console.log('      <div class="menu">');
                child.nodes.map(leaf => {
                    console.log('        <a class="item">'+leaf.name+'</a>');
                });
                console.log('      </div>');
            console.log('    </div>');
        console.log('  </div>');
    });
    console.log('');
console.log('</div>');    
});


console.log('------------ ADMIN MENU --------------');

Menu.get('main').middleware({path:'/', user:admin}, {locals:{}}, _=> {
    console.log('--- done');
    let menu = Menu.get('admin').toJSON();
console.log('<div id="' + menu.id + '" class="ui small menu">');
    menu.nodes.map(child => {
        console.log('  <div class="right menu">');
            console.log('    <div class="ui dropdown item">');
                console.log('      <i class="dropdown icon"></i>');
                console.log('      <div class="menu">');
                child.nodes.map(leaf => {
                    console.log('        <a class="item">'+leaf.name+'</a>');
                });
                console.log('      </div>');
            console.log('    </div>');
        console.log('  </div>');
    });
    console.log('');
console.log('</div>');    
});
