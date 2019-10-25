/*jshint esversion:6, node:true*/
'use strict';

const slug = require('./slug');
const extend = require('gextend');

let _instances = new Map();

/**
 * Creates a new Menu instance. 
 * Internally, Menu will create new items
 * that are also instances of the Menu class.
 * 
 * @param {String} name Menu ID
 * @param {Object} config Configuration
 * @private {Menu} parent 
 */
class Menu {

    constructor(name, config = {}, parent = undefined) {
        this.name = name;

        if (parent) this.parent = parent;

        this.init(config);
    }

    init(config = {}) {
        this.nodes = [];
        this._breadcrumbs = [];

        extend(this, Menu.DEFAULTS, config);

        if (!this.parent) {
            this.logger.info('set %s', this.id, this.name);

            const node = _instances.get(this.id);

            if (!node) {
                return _instances.set(this.id, this);
            }

            if (!node._lazy) return;
            this.attachLazyNode(node);
            _instances.set(this.id, this);
        }
    }

    attachLazyNode(node) {
        //We need to update the properties of the other
        //menu... figure a better way!!! :)
        // node.segment = this.segment;
        const nodes = node.nodes.concat();
        nodes.map(node => node.parent = this);
        this.nodes = this.nodes.concat(nodes);
    }

    /**
     * Attach this node's root node to a connect
     * application as a middleware handler.
     *
     * TODO: We might want to have a global/static
     * middleware method, so that we can export either
     * once or mark a Menu to be exported. Otherwhise
     * we only have a menu available when we are using
     * that router.
     *
     * @param  {Object}   req  Connect request
     * @param  {Object}   res  Connect response
     * @param  {Function} next Connect next handler
     * @return {void}
     */
    middleware(req, res, next) {
        /*
         * Added to support fastify
         */
        this.root.request = (req.raw ? req.raw : req);

        this.logger.info('Generate "%s"', this.id + 'Menu');
        this.logger.info('path "%s"', this.root.request.path);
        this.logger.info('Export menu as %s', this.localName);

        this.root.reset();

        let locals = res.locals;
        let name = this.root.localName;

        if (locals && !locals[name]) {
            locals[name] = this.exportLocalVariables(req);
        } else {
            this.logger.warn('We are not exporting %s.', name);
            this.logger.warn('There exists a local with that name');
        }

        next();
    }

    /**
     * Stub implementation of function to 
     * filter out nodes.
     *  
     * @param {http.IncommingRequest}
     * @returns {Object} Object with nodes
     */
    exportLocalVariables(req) {
        return this.root.toJSON();
    }

    filterNode(node) {
        if(this.parent && typeof this.parent.filterNode === 'function') {
            return this.parent.filterNode(node);
        }

        return node;
    }

    find(nodeId) {
        //TODO: support keypath! admin.pets
        return this.nodes.reduce((a, b) => {
            return (a.id === nodeId && a) || (b.id == nodeId && b);
        }, []);
    }

    /**
     * In order to calculate the active state
     * we need to reset the state of the menu
     * on each request.
     */
    reset() {

        this._isActive = false;
        this._breadcrumbs = [];

        function resetNode(node) {
            node.isActive = false;
            if (node.nodes) {
                node.nodes.map(resetNode);
            }
        }

        this.nodes.map(resetNode);
    }

    addNode(name, config) {
        let node;

        if (typeof name === 'object') {
            node = name;
            node.parent = this;
        } else {
            node = new Menu(name, config, this);
        }

        this.nodes.push(node);

        this.logger.info('Menu %s adding node %s', this.name, node.name);

        return node;
    }

    toCLI() {
        let label = (new Array(this.depth + 1)).join('  ') + '%s';

        this.logger.info(label, this.name);

        if (this.isLeaf) return this.name;

        this.nodes.map(node => {
            return node.toCLI();
        });
    }

    toJSON() {
        //TODO: should we do outside of toJSON, do it
        //on setActiveURL()
        if (this.requestPath === this.uri) {
            this.isActive = true;
        }

        let item = {
            id: this.id,
            name: this.name,
            depth: this.depth,
            isActive: null,
            isExternal: !!this.link,
            uri: this.uri,
            data: extend({}, this.data),
            breadcrumbs: [],
            nodes: [],
        };

        if (this.isLeaf) {
            delete item.nodes;
        } else {
            item.nodes = this.nodes.map(node => node.toJSON()).filter(Boolean);
        }

        item.isActive = this.isActive;

        //handle breadcrumbs
        this.updateBreadcrumbs();

        if (this.depth === 0) {
            item.breadcrumbs = this.breadcrumbs;
        } else {
            delete item.breadcrumbs;
        }

        item = this.filterNode(item);

        return item;
    }

    updateBreadcrumbs() {
        if (this.isActive) {
            this.root._breadcrumbs[this.depth] = this.breadcrumb;
        }
    }

    get breadcrumbs() {
        return this._breadcrumbs.filter(Boolean);
    }

    get breadcrumb() {
        return {
            name: this.name,
            uri: this.uri,
            depth: this.depth
        };
    }

    get isRoot() {
        return this.root === this;
    }

    get isLeaf() {
        return this.nodes.length === 0;
    }

    get depth() {
        if (this.isRoot) return 0;
        return this.parent.depth + 1;
    }

    get root() {
        if (this.parent) {
            return this.parent.root;
        }
        return this;
    }

    get requestPath() {
        return this.root.request.path;
    }

    /**
     *
     * Returns a normalized string used
     * to identify the menu globally.
     *
     * Under the hood we use `slug` to
     * remove extraneous characters and
     * to normalize the menu's given name.
     *
     * Also, the name will be lowercased.
     *
     * If we use the middleware option,
     * this property plus the value
     * of `localExportSuffix` to export the
     * menu as a local variable to make it
     * available to express rendered pages.
     *
     * @return {String} Normalized string.
     */
    get id() {
        return slug(this.name, {
            lowercase: true
        });
    }

    get uri() {
        if (this.link) {
            return this.link;
        }

        let uri = this.id;

        if (this._segment === false) {
            uri = '';
        } else if (typeof this._segment === 'string') {
            uri = this._segment;
        }

        uri = (this.parent ? this.parent.uri : '') + '/' + uri;
        uri = require('path').normalize(uri);
        return uri;
    }

    get isActive() {
        return this._active || false;
    }

    set isActive(value) {
        if (this.parent && value) {
            this.parent.isActive = true;
        }

        this._active = value;
    }
    set request(value) {
        this._request = value;
    }

    get request() {
        if (this._request) return this._request;
        return {
            path: '/'
        };
    }

    get localName() {
        return this.id + this.localExportSuffix;
    }

    set segment(v) { this._segment = v; }

    get segment() { return this._segment; }

    get parent() { return this._parent; }

    set parent(v) { this._parent = v; }
}

Menu.DEFAULTS = {
    logger: console,
    localExportSuffix: 'Menu'
};

/**
 * Get a menu by id. If it does 
 * not exist yet it will create a 
 * lazy instance. 
 * Meaning that it supports attaching 
 * sub-menus before we have created 
 * the actual menu.
 * 
 * This is useful to not have to worry
 * abbout order of menu creation.
 * 
 * @param {String} id Menu identifier
 */
Menu.get = function(id, config = {}) {

    if (_instances.has(id)) {
        return _instances.get(id);
    }

    /*
     * Support attaching sub menus
     * before we have created the
     * actual Menu. This is useful
     * so that we don't have to worry
     * about order of creation.
     */
    let node = new Menu(id, config);
    node._lazy = true;
    return node;
};

module.exports = Menu;