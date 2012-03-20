/* jQuery.Transition.js v1.0 | https://github.com/jsw0528/Transition | MIT Licensed */
(function($) {
  'use strict';

  /*!
   * Core Class
   */
  var Transition = function(elem, property, duration, timingFn, delay, callback) {

    this.VERSION = '1.0';

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
          'transition'       : 'transitionend',
          'WebkitTransition' : 'webkitTransitionEnd',
          'MozTransition'    : 'transitionend',
          'OTransition'      : 'oTransitionEnd',
          'msTransition'     : 'MSTransitionEnd'
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
    $.extend($.support, support);
    $.extend($.cssHooks, cssHooks);

  })('transition transform transformOrigin');


  /*!
   * Plugin definition
   */
  $.fn.transition = function(property, duration, timingFn, delay, callback) {
    return this.each(function() {
      var $this = $(this);

      return new Transition($this, property, duration, timingFn, delay, callback);
    })
  };

})( window.jQuery );