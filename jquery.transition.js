/* jQuery.Transition.js v1.0 | https://github.com/jsw0528/Transition | MIT Licensed */
(function($) {
  'use strict';

  /*!
   * Core Class
   */
  var Transition = function(elem, props, duration, easing, delay, callback) {
    // Current version
    this.VERSION = '1.0';

    elem.css(props);

    callback && callback();
  };

  Transition.prototype = {

    constructor: Transition,

    run: function() {},

    stop: function() {}

  };


  /*!
   * Check support & Create css hooks
   */
  var support = {},
      standardProps = ['transition', 'transform', 'transformOrigin', 'transformStyle', 'perspective', 'perspectiveOrigin', 'backfaceVisibility'];

  (function() {
    var elem       = document.documentElement,
        elemStyle  = elem.style,
        cssHooks   = {},
        eventNames = {
          'WebkitTransition' : 'webkitTransitionEnd',
          'MozTransition'    : 'transitionend',
          'OTransition'      : 'oTransitionEnd',
          'msTransition'     : 'MSTransitionEnd',
          'transition'       : 'transitionend'
        },
        capProp, vendorPrefix;

    _.each(arguments[0], function(prop) {
      // standard
      if ( prop in elemStyle ) {
        support[prop] = prop;
      }
      else {
        // capitalize first character
        capProp = prop.charAt(0).toUpperCase() + prop.substr(1);

        vendorPrefix = _.find(['Webkit', 'Moz', 'O', 'ms'], function(prefix) {
          return (prefix + capProp) in elemStyle;
        });

        support[prop] = vendorPrefix && (vendorPrefix + capProp) || false;
      }

      // css hooks
      if ( support[prop] ) {
        cssHooks[prop] = {
          get: function(elem) {
            return elem.style[support[prop]];
          },
          set: function(elem, value) {
            elem.style[support[prop]] = value;
          }
        };
      }

    });

    // avoid memory leak in IE
    elem = null;

    support.transitionEnd = eventNames[support.transition] || false;

    // extend to jQuery
    _.extend($.support, support);
    _.extend($.cssHooks, cssHooks);

  })( standardProps );


  /*!
   * Private methods
   */
  function unCamel(str) {
    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
  }


  /*!
   * Plugin definition
   */
  $.fn.transition = function(props, duration, easing, delay, callback) {
    var _this = this,
        dfs   = $.fn.transition.defaults,
        // Assume that all the parameters are normal, so we consider only the syntax.
        opt   = $.isPlainObject(duration) ? _.extend({}, duration) : {
          complete : callback || _.isFunction(delay) && delay || _.isFunction(easing) && easing || _.isFunction(duration) && duration,
          duration : !_.isFunction(duration) && duration || null,
          easing   : !_.isFunction(easing) && easing || null,
          delay    : !_.isFunction(delay) && delay || null
        };

    //=> cubic bezier curve
    opt.easing = dfs.easing[opt.easing] || !dfs.easing[opt.easing] && /^cubic-bezier/.test(opt.easing) && opt.easing || null;

    // Queuing
    if ( opt.queue !== false ) {
      opt.queue = true;
    }

    // Turn off animation
    if ( $.fx.off === true ) {
      opt.duration = '0s';
    }

    // Use the default settings
    _.defaults(opt, {
      duration : dfs.duration,
      easing   : dfs.easing._default,
      delay    : dfs.delay
    });


    _this.each(function() {
      return new Transition($(this), props, opt.duration, opt.easing, opt.delay, opt.complete);
    });

    // Chain
    return _this;
  };


  /*!
   * Setting defaults
   */
  $.fn.transition.defaults = {
    duration : '0.4s',
    delay    : '0s',
    easing   : {
      '_default'    : 'cubic-bezier(0.1, 0.5, 0.1, 1)',
      'ease'        : 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      'linear'      : 'cubic-bezier(0, 0, 1, 1)',
      'ease-in'     : 'cubic-bezier(0.42, 0, 1, 1)',
      'ease-out'    : 'cubic-bezier(0, 0, 0.58, 1)',
      'ease-in-out' : 'cubic-bezier(0.42, 0, 0.58, 1)'
    }
  };

})( window.jQuery );