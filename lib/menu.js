/*jshint esversion:6, node:true*/
'use strict';

const slug = require('./slug');
const extend = require('gextend');

let _instances = new Map();

class Menu {
    constructor(name, config = {}, parent = undefined){
        this.name = name;

        if(parent) this.parent = parent;

        this.init(config);
    }

    init(config = {}){
        this.nodes = [];

        extend(this, Menu.DEFAULTS, config);

        if(!this.parent){
            console.log('set %s', this.id, this.name);

            let node = _instances.get(this.id);

            if(!node){
                return _instances.set(this.id, this);
            }

            if(!node._lazy) return;
            this.attachLazyNode(node);
            _instances.set(this.id, this);
        }
    }

    attachLazyNode(node){
        //We need to update the properties of the other
        //menu... figure a better way!!! :)
        // node.segment = this.segment;
        let nodes = node.nodes.concat();
        nodes.map((node)=> node.parent = this);
        this.nodes = this.nodes.concat(nodes);
    }

    middleware(req, res, next){
        this.root.request = req;
        console.log('Generate "%s"', this.id + 'Menu');
        console.log('path "%s"', req.path);
        res.locals[this.localName] = this.root.toJSON();
        next();
    }

    addNode(name, config){

        console.log('Menu %s adding node %s', this.name, name);

        let node = new Menu(name, config, this);
        this.nodes.push(node);
        return node;
    }

    toCLI(){
        let label = (new Array(this.depth + 1)).join('  ') + '%s';

        console.log(label, this.name);

        if(this.isLeaf) return this.name;

        this.nodes.map((node)=>{
            return node.toCLI();
        });
    }

    toJSON() {

        if(this.isLeaf && this.requestPath === this.uri){
            this.isActive = true;
        }

        let item = {
            id: this.id,
            name: this.name,
            depth: this.depth,
            isActive: null,
            uri: this.uri,
            nodes: []
        };

        if(this.isLeaf){
            delete item.nodes;
        } else {
            item.nodes = this.nodes.map((node)=> node.toJSON());
        }

        item.isActive = this.isActive;

        return item;
    }

    get isRoot(){
        return this.root === this;
    }

    get isLeaf(){
        return this.nodes.length === 0;
    }

    get depth(){
        if(this.isRoot) return 0;
        return this.parent.depth + 1;
    }

    get root() {
        if(this.parent) {
            return this.parent.root;
        }
        return this;
    }

    get requestPath(){
        return this.root.request.path;
    }

    get id(){
        return slug(this.name, {
            lowercase: true
        });
    }

    get uri(){
        let uri = this.id;

        if(this._segment === false) {
            uri = '';
        } else if (typeof this._segment === 'string'){
            uri = this._segment;
        }

        uri = (this.parent ? this.parent.uri : '') + '/' + uri;
        uri = require('path').normalize(uri);
        console.log('uri', uri);
        return uri;
    }

    get isActive(){
        return this._active || false;
    }

    set isActive(value){
        if(this.parent && value === true){
            if(!this.parent.isActive){
                this.parent.isActive = true;
            }
        }
        this._active = value;
    }
    set request(value){
        this._request = value;
    }

    get request(){
        if(this._request) return this._request;
        return {
                path: '/'
        };
    }

    get localName() {
        return this.id + this.localExportSuffix;
    }

    set segment(v){ this._segment = v;}

    get segment(){ return this._segment;}

    get parent(){ return this._parent;}

    set parent(v){ this._parent = v;}
}

Menu.DEFAULTS = {
    localExportSuffix: 'Menu'
};

Menu.get = function(id){

    if(_instances.has(id)){
        return _instances.get(id);
    }

    /*
     * Support attaching sub menus
     * before we have created the
     * actual Menu. This is useful
     * so that we don't have to worry
     * about order of creation.
     */
    let node = new Menu(id);
    node._lazy = true;
    return node;
};

module.exports = Menu;
