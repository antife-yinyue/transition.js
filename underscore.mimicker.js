/*!
 * Underscore.js 1.3.1
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 */
(function() {
  'use strict';

  // If you have used 'Underscore.js' in your project, you don't need this file.
  if ( this._ ) return;


  var breaker = {};

  var ArrayProto = Array.prototype, ObjProto = Object.prototype/*, FuncProto = Function.prototype*/;

  var slice            = ArrayProto.slice,
      // unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    // nativeReduce       = ArrayProto.reduce,
    // nativeReduceRight  = ArrayProto.reduceRight,
    // nativeFilter       = ArrayProto.filter,
    // nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    // nativeLastIndexOf  = ArrayProto.lastIndexOf,
    // nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys;
    // nativeBind         = FuncProto.bind;

  var _ = this._ = {};


  /*!
   * Collection Functions
   */
  // http://underscorejs.org/#each
  var each = _.each = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // http://underscorejs.org/#map
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // http://underscorejs.org/#find
  _.find = function(obj, iterator, context) {
    var result;
    _.any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // http://underscorejs.org/#any
  _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  /*!
   * Array Functions
   */
  // http://underscorejs.org/#indexOf
  _.indexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (var i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  /*!
   * Function (uh, ahem) Functions
   */


  /*!
   * Object Functions
   */
  // http://underscorejs.org/#keys
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // http://underscorejs.org/#extend
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // http://underscorejs.org/#defaults
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // http://underscorejs.org/#isFunction
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // http://underscorejs.org/#has
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  /*!
   * Utility Functions
   */
  // http://underscorejs.org/#identity
  _.identity = function(value) {
    return value;
  };

}).call(this);