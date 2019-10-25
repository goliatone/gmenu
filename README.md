## gmenu
Simple menu builder, a Node.js module to create menus in Express applications.

Builds an object with all nodes added to a menu, and makes it available to Express views as a local variable.

It supports lazy instantiation of menus, so you can add submenus before the parent menu has been defined. This is useful if you define your submenus inside your routes and your main menu on your app definition file.

You can attach arbitrary data to each node which can then be accessed for each item.


```javascript
const Menu = require('gmenu');

let adminMenu = new Menu('Admin');

let consoleMenu = Menu.get('admin').addNode('Web Console');
consoleMenu.addNode('WebSockets');
consoleMenu.addNode('Payloads');
consoleMenu.addNode('Requests');

let crudMenu = Menu.get('admin').addNode('Crud');
crudMenu.segment = 'api';
crudMenu.addNode('Users', {
    data: {
        resource: 'user'
    }
});
crudMenu.addNode('Passports', {
    data: {
        resource: 'passport'
    }
});
```

You then add the menu as a middleware:

```js
app.use(adminMenu.middleware.bind(adminMenu));
```

This will generate an object:

```json
{
    "id": "admin",
    "name": "Admin",
    "depth": 0,
    "isActive": false,
    "uri": "/admin",
    "data": {},
    "keypath": "admin",
    "nodes": [
        {
            "id": "web-console",
            "name": "Web Console",
            "depth": 1,
            "isActive": false,
            "uri": "/admin/web-console",
            "data": {},
            "keypath": "admin.web-console",
            "nodes": [
                {
                    "id": "websocket",
                    "name": "WebSocket",
                    "depth": 2,
                    "isActive": false,
                    "uri": "/admin/web-console/websocket",
                    "data": {},
                    "keypath": "admin.web-console.websocket",
                },
                {
                    "id": "payloads",
                    "name": "Payloads",
                    "depth": 2,
                    "isActive": false,
                    "uri": "/admin/web-console/payloads",
                    "data": {},
                    "keypath": "admin.web-console.payloads",
                },
                {
                    "id": "requests",
                    "name": "Requests",
                    "depth": 2,
                    "isActive": false,
                    "uri": "/admin/web-console/requests",
                    "data": {},
                    "keypath": "admin.web-console.requests",
                }
            ]
        },
        {
            "id": "crud",
            "name": "Crud",
            "depth": 1,
            "isActive": false,
            "uri": "/admin/api",
            "data": {},
            "keypath": "admin.crud",
            "nodes": [
                {
                    "id": "users",
                    "name": "Users",
                    "depth": 2,
                    "isActive": false,
                    "uri": "/admin/api/users",
                    "data": {
                        "resource": "user"
                    },
                    "keypath": "admin.crud.users",
                },
                {
                    "id": "passports",
                    "name": "Passports",
                    "depth": 2,
                    "isActive": false,
                    "uri": "/admin/api/passports",
                    "data": {
                        "resource": "passport"
                    },
                    "keypath": "admin.crud.passports",
                }
            ]
        }
    ]
}
```

The menu will be made available in the views as a local variable under the name returned by `menu.localName`. By default, the name will be `menu.id + 'Menu'`.

```ejs
<ul>
<% adminMenu.nodes.map(menu => { %>
    <li><a href="<%= menu.uri %>"><%= menu.name %></li>
    <ul>
        <% menu.nodes.map(item => { %>
            <li>
                <a href="<%= item.uri %>" class="<%= item.isActive ? 'active' : ''%>"><%= item.name %></a>
            </li>
        <%});%>
    </ul>
<%});%>
</ul>
```

### Documentation



<!--
https://github.com/mbouclas/mcms-node-menus/
https://github.com/john-doherty/express-url-breadcrumb
https://github.com/Persata/active-menu
-->
