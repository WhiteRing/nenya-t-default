'use strict';

let m               = require('mithril');
let mRender         = require('mithril-node-render');
let NenyaComponents = require('nenya-components');
let nenyaFlux       = require('nenya-flux')();


let ThemeStore      = require('./stores/theme.store');



module.exports = (store) => {
  return new NenyaThemeBase (store);
};


class NenyaThemeBase {
  constructor (store, path) {
    this.appStore = store;
    
    let initialThemeState = { meta: store.getState().meta };
    
    //
    // TODO: make methods to define theme's assets
    //
    this.themeStore = ThemeStore(initialThemeState);
    this.themeSubscription = nenyaFlux.createSubscription(this.themeStore);
    
    this.wrappersDir = typeof path === 'undefined' ? __dirname + '/wrappers' : path;
    this.page = [];
    
    this.themeStore.resetState();
  }
  
  loadWrapper () {
    let state = this.appStore.getState();
    let wrapperName = state.request.route.wrapper;
    let wrapperPath = this.wrappersDir + '/' + wrapperName + '.wrap';
    
    try {
      this.wrapperData = require(wrapperPath);
    }
    catch (e) {
      console.log('Wrapper not found: ' + wrapperPath);
      wrapperPath = this.wrappersDir + '/e500.wrap';
      this.wrapperData = require(wrapperPath);
    }
    
    if (this.wrapperHasData()) {
      this.flattenWrapper();
    }
    
    // console.log('wrapper data ' + wrapperName);
    // console.dir(this.wrapperData);
  }
  
  wrapperHasData () {
    if (typeof this.wrapperData.layout != 'undefined') {
      return true;
    }
    return false;
  }
  
  flattenWrapper () {
    this.wrapperData.layout.containers.forEach((container, index, arr) => {
      if (typeof container.import != 'undefined') {
        let wrapperPath = this.wrappersDir + '/' + container.import + '.wrap';
        
        try {
          arr[index] = require(wrapperPath);
          delete container.import;
        }
        catch (e) {
          console.log(e);
        }
      }
    })
  }
  
  //
  // Transforms wraper into Mithril VDOM
  //
  proccessWrapper () {
    this.loadWrapper();
    
    if (this.wrapperHasData()) {
      this.wrapperData.layout.containers.forEach((container) => {
        this.page[this.page.length] = this.handleWrapperEntity(container);
      });    
    }
  }
  
  handleWrapperEntity (entity, tag) {
    let selector = tag ? tag : 'div';
    let content = [];
    
    if (entity.tag) selector = entity.tag;
    
    if (entity.id) selector += "#" + entity.id;
    
    if (entity.sections) {
      entity.sections.forEach((section) => {
        content[content.length] = this.handleWrapperEntity(section, 'section');
      })
    }
    // else ?
    if (entity.modules) {
      let modulesKeys = Object.keys(entity.modules); 
      modulesKeys.forEach((key) => {
        let module = entity.modules[key];
        
        
        // try {
          let NenyaModule = require('nenya-m-' + key);
          let nenyaModule = new NenyaModule(module.id, key);
          
          content[content.length] = nenyaModule.m(this.themeStore);
                    
        // } catch(e) { console.log('ERR for ' + key + ': ' + e); }
      })
    }
    
    return m(selector, content);
  }
  
  //
  // Transform Mithril to HTML
  //
  render () {
    this.proccessWrapper();
        
    let nHtml = new NenyaComponents.core.html.component(this.appStore);
    nHtml.setContent(this.page);
        
    let themeState = this.themeStore.getState();
    
    return mRender(m.component(nHtml.m(), {store: this.themeStore}));
  }
}
