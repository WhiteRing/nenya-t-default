'use strict';

const ACTIONS       = require('./theme.actions');

var _               = require('lodash');

let NenyaFlux       = require('nenya-flux')();
let assert          = require('assert');
let jss             = require('jss');
let jssExtend       = require('jss-extend');
let jssCamelCase    = require('jss-camel-case');


//
// Default theme state
//
let emptyState = {
  head:   {
    styles:   [],    
    scripts:  [],
    jss:      {}
  },
  body: {
    scripts:  []    
  }
};

let _themeActions = {
  jssInit: NenyaFlux.createAction(ACTIONS.JSS_INITIALIZE)  
};



//
// Default theme's main store 
//
class ThemeStore extends NenyaFlux.NenyaStore {
  constructor (initialState) {
    
    initialState = Object.assign({}, emptyState, initialState);
       
    super(initialState);
    
    this.defineActions();        
  }
    
  defineActions () {
    this.addAction(ACTIONS.ADD_JSS,           _addJss);
    this.addAction(ACTIONS.ADD_STYLESHEET,    _addStyle);
    this.addAction(ACTIONS.ADD_SCRIPT,        _addScript);
 }
   
  get stylesheets () {
    return this._state.head.styles;
  }

  get headScripts () {
    return this._state.head.scripts;
  }

  get bodyScripts () {
    return this._state.body.scripts;
  }
  
  get jssStyle () {
    
    jss.use(jssExtend());
    jss.use(jssCamelCase());
    
    let jssStyle = jss.createStyleSheet(this._state.head.jss, {named: false});     
    let response = jssStyle.toString();
    
    // if PRODUCTION
    if (true) {
      // remove all newlines
      response = response.replace(/(?:\r\n|\r|\n)/g, '');
      
      // remove all spaces
      response = response.replace(/\s+/g, '');
    } 
    
    
    return response;
  }
      
}



module.exports = (initialState) => {
  return new ThemeStore(initialState);
}



function _addStyle (state, path) {
  if (_.indexOf(state.head.styles, path) === -1) { 
    state.head.styles[state.head.styles.length] = path;
  }
}

function _addScript (state, path) {
  if (_.indexOf(state.head.scripts, path) === -1) { 
    state.head.scripts[state.head.scripts.length] = path;
  }
}

function _addJss (state, jssRules) {
  
  Object.assign(state.head.jss, jssRules);
  
  console.log(state.head.jss);
}

