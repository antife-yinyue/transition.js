#Super-smooth CSS3 transitions and transformations for jQuery
---

##Syntax

    .transition( properties [, duration] [, easing] [, delay] [, complete] )
    // Or
    .transition( properties, options )

##Live Demos

[http://MrZhang.me/blog/jquery-transition.html](http://MrZhang.me/blog/jquery-transition.html)

##Downloads

If you have used `Underscore.js` in your project, please download:

- [jQuery.Transition.min.js](https://github.com/downloads/jsw0528/Transition/jquery.transition.min.js) (1.3K, gzipped)
- [jQuery.Transition-with-fallback.min.js](https://github.com/downloads/jsw0528/Transition/jquery.transition-with-fallback.min.js) (1.9K, gzipped)

Otherwise:

- [jQuery.Transition.pkg.js](https://github.com/downloads/jsw0528/Transition/jquery.transition.pkg.js) (1.8K, gzipped)
- [jQuery.Transition-with-fallback.pkg.js](https://github.com/downloads/jsw0528/Transition/jquery.transition-with-fallback.pkg.js) (2.3K, gzipped)

##Notes

- Defaults to place the transitions in the effects queue.
- You can stop the transitions by using `.stop()` method. For more information, see [.stop()](http://api.jquery.com/stop).
- The `complete` callback function is not sent any arguments, but `this` is set to the DOM element being transitioned.
- The transitions can be turned off globally by setting `$.fx.off = true`, which effectively sets the duration to 0. For more information, see [$.fx.off](http://api.jquery.com/jquery.fx.off).

##License

Licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

##Change Log

**1.0**  -- April 16, 2012

Initial release.