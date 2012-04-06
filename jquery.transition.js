/*!
 * jQuery.Transition v1.0
 * (c)2012 wǒ_is神仙, http://MrZhang.me/
 *
 * Source: https://github.com/jsw0528/Transition
 * Demos:  http://MrZhang.me/
 * MIT Licensed.
 */
(function($) {
  'use strict';

  var TRANSITION = 'transition',
      TRANSFORM  = 'transform',

      support    = {},
      cssHooks   = {},
      elem       = document.documentElement,
      elemStyle  = elem.style,
      capital    = function(s) { return s.charAt(0).toUpperCase() + s.substr(1); },
      eventNames = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd',
        'msTransition'     : 'MSTransitionEnd',
        'transition'       : 'transitionend'
      },
      vendorPrefix,
      capProp;


  /*!
   * Core class definition
   */
  var Transition = function() {
    this.init.apply(this, arguments).run();
  };

  Transition.prototype = {

    constructor: Transition,

    init: function(elem, props, cfg) {
      var _this    = this,
          delay    = cfg.delay,
          duration = cfg.duration,
          easing   = cfg.easing;

      var keys = _.keys(props),
          i = _.indexOf(keys, TRANSFORM),
          transitions = [];

      //=> msTransform => MsTransform => -ms-transform
      if ( i > -1 && support[TRANSFORM] ) {
        keys[i] = capital( support[TRANSFORM] ).replace(/([A-Z])/g, function(l) {
          return '-' + l.toLowerCase();
        });
      }

      _.each(keys, function(prop) {
        transitions.push( [prop, duration, easing, delay].join(' ') );
      });
      props[support[TRANSITION]] = transitions.join(',');

      // bind to 'this'
      _this.elem  = elem;
      _this.$elem = $(elem);
      _this.props = props;
      _this.keys  = keys;
      _this.cfg   = cfg;

      // chain
      return _this;
    },

    run: function() {
      var _this  = this,
          queue  = _this.cfg.queue,
          curCSS = {};

      if ( queue ) {
        _this.$elem.queue(queue, function(next, hooks) {
          _this._runNative(next);

          // TODO: 多次callback，Chrome闪动
          // stop transition (please ignore Opera)
          hooks.stop = function(gotoEnd) {
            if ( gotoEnd ) {
              // _this.elem.style[support[TRANSITION] + 'Property'] = 'none';
              curCSS[support[TRANSITION] + 'Property'] = 'none';
            }

            _.each(_this.keys, function(prop, key) {
              curCSS[prop] = _this.$elem.css(prop);
            });
            _this.$elem.css(curCSS);

          };
        });
      }
      // TODO: stop
      else {
        _this._runNative();
      }
    },

    _runNative: function(next) {
      var _this    = this,
          $elem    = _this.$elem,
          callback = _this.cfg.complete,
          e        = support.transitionEnd;

      // defer
      setTimeout(function() {
        $elem.css(_this.props).on(e, function() {
          // remove last event handler
          $elem.off(e);

          // remove css transition property (please ignore Opera)
          _this.elem.style[support[TRANSITION]] = '';

          _.isFunction(callback) && callback();
          _.isFunction(next) && next();
        });
      }, 1);
    }
  };


  /*!
   * Check supports & Create css hooks
   */
  _.each([TRANSITION, TRANSFORM, 'transformOrigin', 'transformStyle', 'perspective', 'perspectiveOrigin', 'backfaceVisibility'], function(prop) {
    // standard
    if ( prop in elemStyle ) {
      support[prop] = prop;
    }
    else {
      // capitalize first character
      capProp = capital(prop);

      // get the vendor prefix
      vendorPrefix = _.find(['Webkit', 'Moz', 'O', 'ms'], function(prefix) {
        return (prefix + capProp) in elemStyle;
      });

      // return vendor css property or 'false'
      support[prop] = !!vendorPrefix && (vendorPrefix + capProp);
    }

    // create css hook
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

  support.transitionEnd = eventNames[support[TRANSITION]] || false;

  // avoid memory leak in IE
  elem = null;

  // extend to jQuery
  _.extend($.support, support);
  _.extend($.cssHooks, cssHooks);


  /*!
   * Plugin definition
   *
   * Assume that all the parameters are normative, so we consider only the syntax.
   *
   * Syntax:
   * $().transition( properties [, duration] [, easing] [, delay] [, complete] )
   * $().transition( properties, options )
   */
  $.fn.transition = function(props, duration, easing, delay, callback) {
    var dfs = $.fn.transition.defaults,
        cfg = $.isPlainObject(duration) ? _.extend({}, duration) : {
          complete : callback || _.isFunction(delay) && delay || _.isFunction(easing) && easing || _.isFunction(duration) && duration,
          delay    : !_.isFunction(delay) && delay || null,
          duration : !_.isFunction(duration) && duration || null,
          easing   : !_.isFunction(easing) && easing || null
        };

    // use the default settings
    _.defaults(cfg, {
      delay    : dfs.delay,
      duration : dfs.duration,
      easing   : '_default',
      queue    : dfs.queue
    });

    // turn off animation
    if ( $.fx.off === true ) {
      cfg.duration = '0s';
    }

    if ( cfg.queue === true ) {
      cfg.queue = 'fx';
    }

    cfg.easing = dfs.easing[cfg.easing] || cfg.easing;

    props = _.extend({}, props);

    return this.each(function() {
      new Transition(this, props, cfg);
    });
  };

  $.fn.transition.defaults = {
    delay    : '0s',
    duration : '0.4s',
    easing   : { _default: 'cubic-bezier(0.1, 0.5, 0.1, 1)' },
    queue    : true
  };

  $.fn.transition.constructor = Transition;

})( window.jQuery );