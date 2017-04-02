/*jshint esversion:6, node:true*/
'use strict';

const slug = require('slug');

// function slug(name){
//     return name.toLowerCase();
// }

let _instances = new Map();

class Menu {
    constructor(name, config = {}, parent = undefined){
        this.name = name;

        if(parent) this.parent = parent;

        this.init(config);
    }

    init(config = {}){
        this.nodes = [];
        if(!this.parent){
            console.log('set %s', this.id, this.name);
            if(_instances.has(this.id)) return;
            _instances.set(this.id, this);
        }
    }

    middleware(req, res, next){
        this.root.request = req;
        console.log('Generate "%s"', this.id + 'Menu');
        res.locals[this.id + 'Menu'] = this.root.toJSON();
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

        let node = {
            id: this.id,
            name: this.name,
            depth: this.depth,
            isActive: null,
            uri: this.uri,
            children: []
        };

        if(this.isLeaf){
            delete node.children;
        } else {
            node.children = this.nodes.map((node)=> node.toJSON());
        }

        node.isActive = this.isActive;

        return node;
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
        return {
            route: {
                path: '/'
            }
        }
        return this.root.request.route.path;
    }

    get id(){
        return slug(this.name);
    }

    get uri(){
        let uri = this._segment ? this._segment : this.id;
        return (this.parent? this.parent.uri : '') + '/' + uri;
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
            route: {
                path: '/'
            }
        }
    }

    set segment(v){ this._segment = v;}

    get parent(){ return this._parent;}

    set parent(v){ this._parent = v;}
}


Menu.get = function(id){
    if(_instances.has(id)){
        return _instances.get(id);
    }

    //We should do a MenuProxy, so when menu with
    //id is actually created we add children.
    return new Menu(id);
};

module.exports = Menu;
