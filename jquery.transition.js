(function($){
  'use strict';

  var Transition = function() {

    this.VERSION = '1.0';

  };

  Transition.prototype = {

    constructor: Transition

  };


  $.fn.transition = function(options) {
    return this.each(function() {
      return new Transition($(this), options)
    })
  };

})( window.jQuery );