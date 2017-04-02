const slug = require('slug');

slug.defaults.modes['rfc3986'] = {
    replacement: '-',
    symbols: true,
    lower: true,
    charmap: slug.charmap,
    multicharmap: slug.multicharmap
};
slug.defaults.mode ='rfc3986';

module.exports = slug;
