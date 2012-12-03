(function() {
  var TRANSITION = 'transition'
  var cssPrefixes = ['Webkit', 'Moz', 'ms', 'O']
  var cache = {}

  var toString = Object.prototype.toString
  var util = {
    forEach: Array.prototype.forEach ?
      function(arr, fn) {
        arr.forEach(fn)
      } :
      function(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
          fn(arr[i], i, arr)
        }
      },
    keys: Object.keys || function(obj) {
      var ret = []
      for (var prop in obj) {
        obj.hasOwnProperty(prop) && ret.push(prop)
      }
      return ret
    },
    isString: function(val) {
      return toString.call(val) === '[object String]'
    },
    isFunction: function(val) {
      return toString.call(val) === '[object Function]'
    }
  }

  /**
   * feature tests
   *
   * returns:
   * $.support.transition  -> true/false
   * $.support.transform2D -> true/false
   * $.support.transform3D -> true/false
   */
  ;(function() {
    var tests = {}
    tests[TRANSITION] = TRANSITION
    tests['transform'] = 'transform2D'
    tests['perspective'] = 'transform3D'

    var gangnam = document.documentElement
    var style = gangnam.style

    util.forEach(util.keys(tests), function(i) {
      $.support[tests[i]] = ($.cssProps[i] = vendorPropName(style, i)) in style
    })

    // avoid memory leak in IE
    gangnam = null
  })()

  var vendorEvents = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'msTransition': 'MSTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  }
  var vendorEvent = vendorEvents[$.cssProps[TRANSITION]]


  /**
   * core class definition
   *
   * uasge:
   * new Transition(element, properties, [options])
   * or
   * var t = new Transition(element)
   * t.run(properties, [options])
   *
   * `element`: { string for ID | Element | jQuery }
   */
  var Transition = function(element, properties, options) {

    element = element && element.jquery ? element[0] :
      util.isString(element) ? document.getElementById(element) : element

    this.$element = $(element)

    return arguments.length === 1 ? this : this.run(properties, options)
  }

  Transition.prototype.run = function(properties, options) {
    var $element = this.$element

    if (!$element.length) {
      return false
    }

    properties || (properties = {})
    options = merge({
      duration: '0.5s',
      easing: 'ease',
      delay: '0s',
      queue: true,
      onTransitionEnd: null
    }, options)

    this._cssProps = util.keys(properties)
    this._options = options

    var queue = fixQueue(options.queue)
    var cb = options.onTransitionEnd
    var transitions = []
    var origName

    util.forEach(this._cssProps, function(name) {
      origName = name

      if (cache[origName]) {
        name = cache[origName]
      }
      else {
        name = $.camelCase(name)
        name = $.cssProps[name] ||
              ($.cssProps[name] = vendorPropName($element[0].style, name))

        name = name.replace(/^(ms)/, function() { return 'Ms' })
                   .replace(/([A-Z])/g, function(letter) {
                     return '-' + letter.toLowerCase()
                   })

        cache[origName] = name
      }

      // set string for the `transition` css property
      transitions.push(
        [].concat(name, options.duration, options.easing, options.delay)
          .join(' ')
      )
    })

    properties[TRANSITION] = transitions.join(',')


    if (queue) {
      $element.queue(queue, function(next) {
        _run(next)
      })
    }
    else {
      _run()
    }

    function _run(next) {
      setTimeout(function() {
        $element.css(properties).on(vendorEvent, function() {

          $element.off(vendorEvent).css(TRANSITION, '')

          // set `this` point to `this.$element[0]`
          util.isFunction(cb) && cb.call($element[0])

          util.isFunction(next) && next()
        })
      }, 1)
    }
  }

  // .stop([clearQueue], [jumpToEnd])
  Transition.prototype.stop = function() {
    var $element = this.$element
    var queue = fixQueue(this._options.queue)
    var args = [].slice.call(arguments)
    var curCSS = {}

    // get the computed styles
    !args[1] && util.forEach(this._cssProps, function(name) {
      curCSS[name] = $.css($element[0], name)
    })
    curCSS[$.cssProps[TRANSITION] + 'Property'] = 'none'

    queue && args.unshift(queue)

    $element.off(vendorEvent).css(curCSS)
  }


  /**
   * helpers
   */
  // return a css property mapped to a potentially vendor prefixed property
  function vendorPropName(style, name) {
    if (name in style) {
      return name
    }

    var capName = name.charAt(0).toUpperCase() + name.slice(1)
    var origName = name
    var i = cssPrefixes.length

    while (i--) {
      if ((name = cssPrefixes[i] + capName) in style) {
        return name
      }
    }

    return origName
  }

  // merge source's value to `base`, only when `base` has the property
  function merge(base, source) {
    if (source) {
      for (var prop in source) {
        base.hasOwnProperty(prop) && (base[prop] = source[prop])
      }
    }

    return base
  }

  // return the valid queue for jQuery ('custom' | 'fx' | false)
  function fixQueue(type) {
    if (type) {
      util.isString(type) || (type = 'fx')
      return type
    }

    return !!type
  }


  /**
   * plugin definition
   */
  $.fn.transition = function(properties, options) {
    return this.each(function() {
      $.data(this, TRANSITION, new Transition(this, properties, options))
    })
  }


  /**
   * overwrite .stop()
   */
  if ($.support[TRANSITION]) {
    var oldStop = $.fn.stop

    $.fn.stop = function() {
      var $this = this
      var args = arguments
      var fn

      $this.each(function() {
        if ((fn = $.data(this, TRANSITION)) instanceof Transition) {
          fn.stop.apply(fn, args)
        }

        oldStop.apply($this, args)
      })
    }
  }

})()
