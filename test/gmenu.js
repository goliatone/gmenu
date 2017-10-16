'use strict';

const test = require('tape');
const Menu = require('../lib/menu');

test('GMenu should expose DEFAULTS', (t) => {
    t.ok(Menu.DEFAULTS);
    t.end();
});

test('GMenu should expose a get static method', (t) => {
    t.ok(Menu.get);
    t.end();
});
