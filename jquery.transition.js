/*!
 * jQuery.Transition v1.0
 * (c)2012 wǒ_is神仙, http://MrZhang.me/
 *
 * Source: https://github.com/jsw0528/Transition
 * Demos:  http://MrZhang.me/jquery-transition.html
 * MIT Licensed.
 */
(function($) {
  'use strict';

  var TRANSITION = 'transition',
      TRANSFORM  = 'transform',
      SPACE      = ' ',

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
      var _this = this,
          transitionProps = _.keys(props),
          i = _.indexOf(transitionProps, TRANSFORM),
          transitions = [],
          suffix = SPACE + cfg.duration + SPACE + cfg.easing + SPACE + cfg.delay;

      //=> msTransform => MsTransform => -ms-transform
      if ( i > -1 && support[TRANSFORM] ) {
        transitionProps[i] = capital( support[TRANSFORM] ).replace(/([A-Z])/g, function(l) {
          return '-' + l.toLowerCase();
        });
      }

      _.each(transitionProps, function(prop) {
        transitions.push( prop + suffix );
      });
      props[support[TRANSITION]] = transitions.join(',');

      // bind to 'this'
      _this.elem  = elem;
      _this.$elem = $(elem);
      _this.props = props;
      _this.cfg   = cfg;
      _this.tps   = transitionProps;

      // chain
      return _this;
    },

    run: function() {
      var _this = this,
          queue = _this.cfg.queue;

      if ( queue ) {
        _this.$elem.queue(queue, function(next) {
          _this._runNative(next);
          // hooks.stop
        });
      }
      else {
        _this._runNative();
      }
    },

    _runNative: function(next) {
      var _this    = this,
          $elem    = _this.$elem,
          elem     = _this.elem,
          callback = _this.cfg.complete,
          preProp  = support[TRANSITION],
          endEvent = support.transitionEnd;

      // defer
      setTimeout(function() {
        $elem.css(_this.props).on(endEvent, function() {
          // remove last event handler
          $elem.off(endEvent);

          // remove css transition property
          if ( preProp === 'OTransition' ) {
            elem.style[preProp + 'Property'] = '';
            elem.style[preProp + 'Duration'] = '';
            elem.style[preProp + 'TimingFunction'] = '';
            elem.style[preProp + 'Delay'] = '';
          }
          else {
            elem.style[preProp] = '';
          }

          _.isFunction(callback) && callback();
          _.isFunction(next) && next();
        });
      }, 1);
    },

    stop: function(queue, clearQueue, gotoEnd) {
      var _this  = this,
          $elem  = _this.$elem,
          curCSS = {};

      if ( typeof queue !== 'string' ) {
        gotoEnd = clearQueue;
        // clearQueue = queue;
        // queue = undefined;
      }

      !gotoEnd && _.each(_this.tps, function(prop) {
        curCSS[prop] = $elem.css(prop);
      });

      // stop transition
      curCSS[support[TRANSITION] + 'Property'] = 'none';

      $elem.css(curCSS).off(support.transitionEnd);
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
   * .transition( properties [, duration] [, easing] [, delay] [, complete] )
   * .transition( properties, options )
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
      $.data(this, TRANSITION, new Transition(this, props, cfg));
    });
  };

  $.fn.transition.defaults = {
    delay    : '0s',
    duration : '0.5s',
    easing   : { _default: 'cubic-bezier(0.1, 0.5, 0.1, 1)' },
    queue    : true
  };

  $.fn.transition.constructor = Transition;


  /*!
   * Overwrite .stop()
   */
  if ( support[TRANSITION] ) {
    var oldStop = $.fn.stop;

    $.fn.stop = function() {
      var $this = this,
          args  = arguments,
          data;

      $this.each(function() {
        data = $.data(this, TRANSITION);

        if ( data instanceof Transition ) {
          data.stop.apply(data, args);
        }
      });

      oldStop.apply($this, args);
    };
  }

})( window.jQuery );