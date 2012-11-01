define(function(require, exports, module) {
  var $ = require('$')

  var TRANSITION = 'transition'

  var cssPrefixes = ['Webkit', 'Moz', 'ms', 'O']

  var defaults = {
    duration: '0.5s',
    easing: 'ease',
    delay: '0s',
    queue: true,
    onTransitionEnd: null
  }

  var util = seajs.pluginSDK.util

  // feature tests
  ;(function() {
    var tests = {}
    tests[TRANSITION] = TRANSITION
    tests['transform'] = 'transform2D'
    tests['perspective'] = 'transform3D'

    var gangnam = document.documentElement
    var style = gangnam.style

    util.forEach(util.keys(tests), function(k) {
      $.support[tests[k]] = ($.cssProps[k] = vendorPropName(style, k)) in style
    })

    // avoid memory leak in IE
    gangnam = null
  })()

  // get the name of the vendor transition event
  var vendorEvents = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'msTransition': 'MSTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  }
  var vendorEvent = vendorEvents[$.cssProps[TRANSITION]]


  /**
   * Core class definition
   *
   * Uasge:
   * new Transition(element, properties, [options])
   * or
   * var t = new Transition(element)
   * t.run(properties, [options])
   *
   * `element`: { String | DOM element | jQuery object }
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
    options = mergeObject(defaults, options)

    var element = $element[0]
    var names = util.keys(properties)
    var queue = options.queue
    var cb = options.onTransitionEnd
    var transitions = []

    this.cssProps = names
    this.options = options


    util.forEach(names, function(name) {
      name = $.camelCase(name)
      name = $.cssProps[name] ||
            ($.cssProps[name] = vendorPropName(element.style, name))

      // set string for the `transition` css property
      name = name.replace(/^(ms)/, function() { return 'Ms' })
                 .replace(/([A-Z])/g, function(letter) {
                   return '-' + letter.toLowerCase()
                 })
      transitions.push(
        [name, options.duration, options.easing, options.delay].join(' ')
      )
    })

    properties[TRANSITION] = transitions.join(',')


    if (queue) {
      queue === true && (queue = 'fx')

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

          // set 'this' to the DOM element being transitioned
          util.isFunction(cb) && cb.call(element)

          util.isFunction(next) && next()
        })
      }, 1)
    }
  }

  Transition.prototype.stop = function(clearQueue, jumpToEnd) {
    var $element = this.$element
    var queue = this.options.queue
    var curCSS = {}

    !jumpToEnd && util.forEach(this.cssProps, function(name) {
      curCSS[name] = $.css($element[0], name)
    })
    curCSS[$.cssProps[TRANSITION] + 'Property'] = 'none'

    queue === true && (queue = 'fx')

    $element.off(vendorEvent).css(curCSS).stop(queue, clearQueue, jumpToEnd)
  }


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

  // merge 2 objects into a new object
  function mergeObject(o1, o2) {
    var ret = {}

    if (!o2) {
      return o1
    }

    for (var i in o1) {
      ret[i] = o2.hasOwnProperty(i) ? o2[i] : o1[i]
    }

    return ret
  }


  module.exports = Transition
})
