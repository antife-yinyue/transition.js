/* jQuery.Transition.js v1.0 | https://github.com/jsw0528/Transition | MIT Licensed */
(function($) {
  'use strict';

  /*!
   * Core Class
   */
  var Transition = function(elem, props, duration, easing, delay, callback) {

    this.VERSION = '1.0';
    callback && callback();

  };

  Transition.prototype = {

    constructor: Transition,

    addProperty: function() {},

    removeProperty: function() {}

  };


  /*!
   * Check support & Create css hooks
   */
  var support = {};

  (function(props) {
    var elem = document.documentElement,
        cssHooks = {},
        eventNames = {
          'WebkitTransition' : 'webkitTransitionEnd',
          'MozTransition'    : 'transitionend',
          'OTransition'      : 'oTransitionEnd',
          'msTransition'     : 'MSTransitionEnd',
          'transition'       : 'transitionend'
        },
        capProp;


    _.forEach(props.split(' '), function(prop) {

      // standard
      if ( prop in elem.style ) {
        support[prop] = prop;
        return;
      }

      // capitalize first character
      capProp = prop.charAt(0).toUpperCase() + prop.substr(1);

      // prefixed
      _.find(['Webkit', 'Moz', 'O', 'ms'], function(prefix) {
        return (support[prop] = prefix + capProp) in elem.style;
      });

      // css hooks
      cssHooks[prop] = {
        get: function(elem) {
          return elem.style[support[prop]];
        },
        set: function(elem, value) {
          elem.style[support[prop]] = value;
        }
      };

    });

    // avoid memory leak in IE
    elem = null;


    support.transitionEnd = eventNames[support.transition] || null;

    // extend to jQuery
    _.extend($.support, support);
    _.extend($.cssHooks, cssHooks);

  })('transition transform transformOrigin');


  function uncamel(str) {
    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
  }


  /*!
   * Plugin definition
   */
  $.fn.transition = function(props, callback) {
    var $this = this,
        queue = true,
        dfs   = $.fn.transition.defaults,
        cfg   = {
          duration : dfs.duration,
          easing   : dfs.easing.default,
          delay    : dfs.delay
        };

    if ( !_.isObject(props) ) return;


    _.forEach('duration easing delay complete queue'.split(' '), function(key) {
      if ( _.has(props, key) ) {
        cfg[key] = props[key];
        delete props[key];
      }
    });
    if ( _.isFunction(callback) )
      cfg.complete = callback;


    return $this.each(function() {
      return new Transition(this, props, cfg.duration, cfg.easing, cfg.delay, cfg.complete);
    });
  };

  $.fn.transition.defaults = {
    duration : '400ms',
    delay    : 0,
    easing   : {
      'default'     : 'cubic-bezier(0.1, 0.5, 0.1, 1)',
      'ease'        : 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      'linear'      : 'cubic-bezier(0, 0, 1, 1)',
      'ease-in'     : 'cubic-bezier(0.42, 0, 1, 1)',
      'ease-out'    : 'cubic-bezier(0, 0, 0.58, 1)',
      'ease-in-out' : 'cubic-bezier(0.42, 0, 0.58, 1)'
    }
  };

})( window.jQuery );