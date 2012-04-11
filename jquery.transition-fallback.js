/*!
 * jQuery.Transition Fallback Solution
 * (c)2012 wǒ_is神仙, http://MrZhang.me/
 *
 * Source: https://github.com/jsw0528/Transition
 * Demos: http://MrZhang.me/jquery-transition.html
 * MIT Licensed.
 */
(function($) {
  'use strict';

  var _fn = $.fn.transition, Transition = _fn.constructor;

  var cbL = 'cubic-bezier(', cbR = ')';

  // '0.5s' => 500, '500ms' => 500
  var toMS = function(t) { return (+/ms$/.test(t) || 1000) * parseFloat(t); };


  var fallback = {
    init: function(elem, props, cfg) {
      var _this = this;

      cfg.delay    = toMS(cfg.delay);
      cfg.duration = toMS(cfg.duration);
      cfg.easing   = (function() {
        var easing = cfg.easing,
            points = _.map(easing.substring(13, easing.length - 1).split(','), function(p) { return parseFloat(p); }),
            lookupTable = [],
            steps = 101,
            i = 0;

        easing = 'cubic-bezier-' + points.join('-');

        if ( !$.easing[easing] ) {

          for ( ; i <= steps; i++ ) {
            lookupTable[i] = _this.cubicBezier(points, i/steps);
          }

          $.easing[easing] = function(p) {
            var sp = steps * p,
                fp = Math.floor(sp),
                y1 = lookupTable[fp],
                y2 = lookupTable[fp + 1];

            return y1 + (y2 - y1) * (sp - fp);
          };
        }

        return easing;
      })();

      // bind to 'this'
      _this.elem  = elem;
      _this.$elem = $(elem);
      _this.props = props;
      _this.cfg   = cfg;

      // chain
      return _this;
    },

    run: function() {
      var _this = this,
          cfg   = _this.cfg;

      _this.$elem.delay( cfg.delay ).animate(_this.props, cfg);
    },

    cubicBezier: function(p, t) {
      var x1 = p[0],
          y1 = p[1],
          x2 = p[2],
          y2 = p[3],

          cx = 3 * x1,
          bx = 3 * (x2 - x1) - cx,
          ax = 1 - cx - bx,
          cy = 3 * y1,
          by = 3 * (y2 - y1) - cy,
          ay = 1 - cy - by;

      t = (function(t) {
        var _t = t, x, d, i = 0;

        // try a few iterations of Newton's method
        for ( ; i < 8; i++ ) {
          x = ((ax * t + bx) * t + cx) * t - _t;
          if ( Math.abs(x) < 1e-3 ) { return t; }

          d = (3 * ax * t + 2 * bx) * t + cx;
          if ( Math.abs(d) < 1e-6 ) { break; }

          t = t - x / d;
        }

        return t;
      })(t);

      return ((ay * t + by) * t + cy) * t;
    },

    stop: _.identity
  };


  if ( !$.support.transition ) {
    // overwrite
    _.extend(Transition.prototype, fallback);

    // add to easing table
    _.extend(_fn.defaults.easing, {
      'ease'        : cbL + '0.25, 0.1, 0.25, 1' + cbR,
      'linear'      : cbL + '0, 0, 1, 1'         + cbR,
      'ease-in'     : cbL + '0.42, 0, 1, 1'      + cbR,
      'ease-out'    : cbL + '0, 0, 0.58, 1'      + cbR,
      'ease-in-out' : cbL + '0.42, 0, 0.58, 1'   + cbR
    });
  }

})( window.jQuery );