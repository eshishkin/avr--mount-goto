/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    (navigator.appName === 'Microsoft Internet Explorer') && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.
      
      var iframe,
        iframe_src;
      
      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();
          
          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
            
            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })
            
            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )
            
            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;
          
          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };
          
        }
      };
      
      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;
      
      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };
      
      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;
        
        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;
          
          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();
          
          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
          
          iframe_doc.close();
          
          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };
      
    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    return self;
  })();
  
})(jQuery,this);
/*!
 * jQuery Color Animations v@VERSION
 * https://github.com/jquery/jquery-color
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: @DATE
 */

(function( jQuery, undefined ) {

	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",

	// plusequals test for += 100 -= 100
	rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
	// a set of RE's that can match strings and generate color tuples.
	stringParsers = [{
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ],
					execResult[ 3 ],
					execResult[ 4 ]
				];
			}
		}, {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ] * 2.55,
					execResult[ 2 ] * 2.55,
					execResult[ 3 ] * 2.55,
					execResult[ 4 ]
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ], 16 )
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
				];
			}
		}, {
			re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			space: "hsla",
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ] / 100,
					execResult[ 3 ] / 100,
					execResult[ 4 ]
				];
			}
		}],

	// jQuery.Color( )
	color = jQuery.Color = function( color, green, blue, alpha ) {
		return new jQuery.Color.fn.parse( color, green, blue, alpha );
	},
	spaces = {
		rgba: {
			props: {
				red: {
					idx: 0,
					type: "byte"
				},
				green: {
					idx: 1,
					type: "byte"
				},
				blue: {
					idx: 2,
					type: "byte"
				}
			}
		},

		hsla: {
			props: {
				hue: {
					idx: 0,
					type: "degrees"
				},
				saturation: {
					idx: 1,
					type: "percent"
				},
				lightness: {
					idx: 2,
					type: "percent"
				}
			}
		}
	},
	propTypes = {
		"byte": {
			floor: true,
			max: 255
		},
		"percent": {
			max: 1
		},
		"degrees": {
			mod: 360,
			floor: true
		}
	},
	support = color.support = {},

	// element for support tests
	supportElem = jQuery( "<p>" )[ 0 ],

	// colors = jQuery.Color.names
	colors,

	// local aliases of functions called often
	each = jQuery.each;

// determine rgba support immediately
supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
support.rgba = supportElem.style.backgroundColor.indexOf( "rgba" ) > -1;

// define cache name and alpha properties
// for rgba and hsla spaces
each( spaces, function( spaceName, space ) {
	space.cache = "_" + spaceName;
	space.props.alpha = {
		idx: 3,
		type: "percent",
		def: 1
	};
});

function clamp( value, prop, allowEmpty ) {
	var type = propTypes[ prop.type ] || {};

	if ( value == null ) {
		return (allowEmpty || !prop.def) ? null : prop.def;
	}

	// ~~ is an short way of doing floor for positive numbers
	value = type.floor ? ~~value : parseFloat( value );

	// IE will pass in empty strings as value for alpha,
	// which will hit this case
	if ( isNaN( value ) ) {
		return prop.def;
	}

	if ( type.mod ) {
		// we add mod before modding to make sure that negatives values
		// get converted properly: -10 -> 350
		return (value + type.mod) % type.mod;
	}

	// for now all property types without mod have min and max
	return 0 > value ? 0 : type.max < value ? type.max : value;
}

function stringParse( string ) {
	var inst = color(),
		rgba = inst._rgba = [];

	string = string.toLowerCase();

	each( stringParsers, function( i, parser ) {
		var parsed,
			match = parser.re.exec( string ),
			values = match && parser.parse( match ),
			spaceName = parser.space || "rgba";

		if ( values ) {
			parsed = inst[ spaceName ]( values );

			// if this was an rgba parse the assignment might happen twice
			// oh well....
			inst[ spaces[ spaceName ].cache ] = parsed[ spaces[ spaceName ].cache ];
			rgba = inst._rgba = parsed._rgba;

			// exit each( stringParsers ) here because we matched
			return false;
		}
	});

	// Found a stringParser that handled it
	if ( rgba.length ) {

		// if this came from a parsed string, force "transparent" when alpha is 0
		// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
		if ( rgba.join() === "0,0,0,0" ) {
			jQuery.extend( rgba, colors.transparent );
		}
		return inst;
	}

	// named colors
	return colors[ string ];
}

color.fn = jQuery.extend( color.prototype, {
	parse: function( red, green, blue, alpha ) {
		if ( red === undefined ) {
			this._rgba = [ null, null, null, null ];
			return this;
		}
		if ( red.jquery || red.nodeType ) {
			red = jQuery( red ).css( green );
			green = undefined;
		}

		var inst = this,
			type = jQuery.type( red ),
			rgba = this._rgba = [];

		// more than 1 argument specified - assume ( red, green, blue, alpha )
		if ( green !== undefined ) {
			red = [ red, green, blue, alpha ];
			type = "array";
		}

		if ( type === "string" ) {
			return this.parse( stringParse( red ) || colors._default );
		}

		if ( type === "array" ) {
			each( spaces.rgba.props, function( key, prop ) {
				rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
			});
			return this;
		}

		if ( type === "object" ) {
			if ( red instanceof color ) {
				each( spaces, function( spaceName, space ) {
					if ( red[ space.cache ] ) {
						inst[ space.cache ] = red[ space.cache ].slice();
					}
				});
			} else {
				each( spaces, function( spaceName, space ) {
					var cache = space.cache;
					each( space.props, function( key, prop ) {

						// if the cache doesn't exist, and we know how to convert
						if ( !inst[ cache ] && space.to ) {

							// if the value was null, we don't need to copy it
							// if the key was alpha, we don't need to copy it either
							if ( key === "alpha" || red[ key ] == null ) {
								return;
							}
							inst[ cache ] = space.to( inst._rgba );
						}

						// this is the only case where we allow nulls for ALL properties.
						// call clamp with alwaysAllowEmpty
						inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
					});

					// everything defined but alpha?
					if ( inst[ cache ] && jQuery.inArray( null, inst[ cache ].slice( 0, 3 ) ) < 0 ) {
						// use the default of 1
						inst[ cache ][ 3 ] = 1;
						if ( space.from ) {
							inst._rgba = space.from( inst[ cache ] );
						}
					}
				});
			}
			return this;
		}
	},
	is: function( compare ) {
		var is = color( compare ),
			same = true,
			inst = this;

		each( spaces, function( _, space ) {
			var localCache,
				isCache = is[ space.cache ];
			if (isCache) {
				localCache = inst[ space.cache ] || space.to && space.to( inst._rgba ) || [];
				each( space.props, function( _, prop ) {
					if ( isCache[ prop.idx ] != null ) {
						same = ( isCache[ prop.idx ] === localCache[ prop.idx ] );
						return same;
					}
				});
			}
			return same;
		});
		return same;
	},
	_space: function() {
		var used = [],
			inst = this;
		each( spaces, function( spaceName, space ) {
			if ( inst[ space.cache ] ) {
				used.push( spaceName );
			}
		});
		return used.pop();
	},
	transition: function( other, distance ) {
		var end = color( other ),
			spaceName = end._space(),
			space = spaces[ spaceName ],
			startColor = this.alpha() === 0 ? color( "transparent" ) : this,
			start = startColor[ space.cache ] || space.to( startColor._rgba ),
			result = start.slice();

		end = end[ space.cache ];
		each( space.props, function( key, prop ) {
			var index = prop.idx,
				startValue = start[ index ],
				endValue = end[ index ],
				type = propTypes[ prop.type ] || {};

			// if null, don't override start value
			if ( endValue === null ) {
				return;
			}
			// if null - use end
			if ( startValue === null ) {
				result[ index ] = endValue;
			} else {
				if ( type.mod ) {
					if ( endValue - startValue > type.mod / 2 ) {
						startValue += type.mod;
					} else if ( startValue - endValue > type.mod / 2 ) {
						startValue -= type.mod;
					}
				}
				result[ index ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
			}
		});
		return this[ spaceName ]( result );
	},
	blend: function( opaque ) {
		// if we are already opaque - return ourself
		if ( this._rgba[ 3 ] === 1 ) {
			return this;
		}

		var rgb = this._rgba.slice(),
			a = rgb.pop(),
			blend = color( opaque )._rgba;

		return color( jQuery.map( rgb, function( v, i ) {
			return ( 1 - a ) * blend[ i ] + a * v;
		}));
	},
	toRgbaString: function() {
		var prefix = "rgba(",
			rgba = jQuery.map( this._rgba, function( v, i ) {
				return v == null ? ( i > 2 ? 1 : 0 ) : v;
			});

		if ( rgba[ 3 ] === 1 ) {
			rgba.pop();
			prefix = "rgb(";
		}

		return prefix + rgba.join() + ")";
	},
	toHslaString: function() {
		var prefix = "hsla(",
			hsla = jQuery.map( this.hsla(), function( v, i ) {
				if ( v == null ) {
					v = i > 2 ? 1 : 0;
				}

				// catch 1 and 2
				if ( i && i < 3 ) {
					v = Math.round( v * 100 ) + "%";
				}
				return v;
			});

		if ( hsla[ 3 ] === 1 ) {
			hsla.pop();
			prefix = "hsl(";
		}
		return prefix + hsla.join() + ")";
	},
	toHexString: function( includeAlpha ) {
		var rgba = this._rgba.slice(),
			alpha = rgba.pop();

		if ( includeAlpha ) {
			rgba.push( ~~( alpha * 255 ) );
		}

		return "#" + jQuery.map( rgba, function( v ) {

			// default to 0 when nulls exist
			v = ( v || 0 ).toString( 16 );
			return v.length === 1 ? "0" + v : v;
		}).join("");
	},
	toString: function() {
		return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
	}
});
color.fn.parse.prototype = color.fn;

// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

function hue2rgb( p, q, h ) {
	h = ( h + 1 ) % 1;
	if ( h * 6 < 1 ) {
		return p + (q - p) * h * 6;
	}
	if ( h * 2 < 1) {
		return q;
	}
	if ( h * 3 < 2 ) {
		return p + (q - p) * ((2/3) - h) * 6;
	}
	return p;
}

spaces.hsla.to = function ( rgba ) {
	if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
		return [ null, null, null, rgba[ 3 ] ];
	}
	var r = rgba[ 0 ] / 255,
		g = rgba[ 1 ] / 255,
		b = rgba[ 2 ] / 255,
		a = rgba[ 3 ],
		max = Math.max( r, g, b ),
		min = Math.min( r, g, b ),
		diff = max - min,
		add = max + min,
		l = add * 0.5,
		h, s;

	if ( min === max ) {
		h = 0;
	} else if ( r === max ) {
		h = ( 60 * ( g - b ) / diff ) + 360;
	} else if ( g === max ) {
		h = ( 60 * ( b - r ) / diff ) + 120;
	} else {
		h = ( 60 * ( r - g ) / diff ) + 240;
	}

	// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
	// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
	if ( diff === 0 ) {
		s = 0;
	} else if ( l <= 0.5 ) {
		s = diff / add;
	} else {
		s = diff / ( 2 - add );
	}
	return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
};

spaces.hsla.from = function ( hsla ) {
	if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
		return [ null, null, null, hsla[ 3 ] ];
	}
	var h = hsla[ 0 ] / 360,
		s = hsla[ 1 ],
		l = hsla[ 2 ],
		a = hsla[ 3 ],
		q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
		p = 2 * l - q;

	return [
		Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
		Math.round( hue2rgb( p, q, h ) * 255 ),
		Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
		a
	];
};


each( spaces, function( spaceName, space ) {
	var props = space.props,
		cache = space.cache,
		to = space.to,
		from = space.from;

	// makes rgba() and hsla()
	color.fn[ spaceName ] = function( value ) {

		// generate a cache for this space if it doesn't exist
		if ( to && !this[ cache ] ) {
			this[ cache ] = to( this._rgba );
		}
		if ( value === undefined ) {
			return this[ cache ].slice();
		}

		var ret,
			type = jQuery.type( value ),
			arr = ( type === "array" || type === "object" ) ? value : arguments,
			local = this[ cache ].slice();

		each( props, function( key, prop ) {
			var val = arr[ type === "object" ? key : prop.idx ];
			if ( val == null ) {
				val = local[ prop.idx ];
			}
			local[ prop.idx ] = clamp( val, prop );
		});

		if ( from ) {
			ret = color( from( local ) );
			ret[ cache ] = local;
			return ret;
		} else {
			return color( local );
		}
	};

	// makes red() green() blue() alpha() hue() saturation() lightness()
	each( props, function( key, prop ) {
		// alpha is included in more than one space
		if ( color.fn[ key ] ) {
			return;
		}
		color.fn[ key ] = function( value ) {
			var vtype = jQuery.type( value ),
				fn = ( key === "alpha" ? ( this._hsla ? "hsla" : "rgba" ) : spaceName ),
				local = this[ fn ](),
				cur = local[ prop.idx ],
				match;

			if ( vtype === "undefined" ) {
				return cur;
			}

			if ( vtype === "function" ) {
				value = value.call( this, cur );
				vtype = jQuery.type( value );
			}
			if ( value == null && prop.empty ) {
				return this;
			}
			if ( vtype === "string" ) {
				match = rplusequals.exec( value );
				if ( match ) {
					value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
				}
			}
			local[ prop.idx ] = value;
			return this[ fn ]( local );
		};
	});
});

// add cssHook and .fx.step function for each named hook.
// accept a space separated string of properties
color.hook = function( hook ) {
	var hooks = hook.split( " " );
	each( hooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed, curElem,
					backgroundColor = "";

				if ( value !== "transparent" && ( jQuery.type( value ) !== "string" || ( parsed = stringParse( value ) ) ) ) {
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						while (
							(backgroundColor === "" || backgroundColor === "transparent") &&
							curElem && curElem.style
						) {
							try {
								backgroundColor = jQuery.css( curElem, "backgroundColor" );
								curElem = curElem.parentNode;
							} catch ( e ) {
							}
						}

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				try {
					elem.style[ hook ] = value;
				} catch( e ) {
					// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
				}
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});

};

color.hook( stepHooks );

jQuery.cssHooks.borderColor = {
	expand: function( value ) {
		var expanded = {};

		each( [ "Top", "Right", "Bottom", "Left" ], function( i, part ) {
			expanded[ "border" + part + "Color" ] = value;
		});
		return expanded;
	}
};

// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors = jQuery.Color.names = {
	// 4.1. Basic color keywords
	aqua: "#00ffff",
	black: "#000000",
	blue: "#0000ff",
	fuchsia: "#ff00ff",
	gray: "#808080",
	green: "#008000",
	lime: "#00ff00",
	maroon: "#800000",
	navy: "#000080",
	olive: "#808000",
	purple: "#800080",
	red: "#ff0000",
	silver: "#c0c0c0",
	teal: "#008080",
	white: "#ffffff",
	yellow: "#ffff00",

	// 4.2.3. "transparent" color keyword
	transparent: [ null, null, null, 0 ],

	_default: "#ffffff"
};

}( jQuery ));
var ajaxContentDownload = (function(){
  /* Private */
  var content_download = function(type, url, data, success, failure, error_message){
    $.ajax({
      url: url,
      data: data,
      type: type,
      success: success,
      failure: failure,
      error: function(jqXHR, exception){ 
        message = error_message || 'An error occurred. Please try again or reload.'
        success('<div class="preview_warning">'+message+'</div>', 500);
      }
    });
  };

  /* Public */
  var post = function(url, data, success, failure, error_message){
    content_download('POST', url, data, success, failure, error_message);
  };
  var get = function(url, data, success, failure, error_message){
    content_download('GET', url, data, success, failure, error_message);
  };

  return {
    post: post,
    get: get
  };
})();
function externalLinksPopup()
{
  window.open(this.href);
  return false;
}

function externalLinksNewWindow()
{
  $('a').each(externalLinksCheck)
}

function externalLinksCheck() {
  var href = $(this).attr('href')
  var host = document.domain
  if(href && ((href.substr(0,7) == "http://" && href.substr(7,host.length) != host) ||
              (href.substr(0,8) == "https://" && href.substr(8,host.length) != host)))
      $(this).attr('target','_blank')
}
;
var cookie_handler = (function () {

  /* Public */

  // Found code for the reading of cookies from: http://www.quirksmode.org/js/cookies.html
  var readCookie = function(name) {
      var search_name = name + "=";
      var cookies = document.cookie.split(';');
      for(var i=0;i < cookies.length;i++) {
          var c = cookies[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(search_name) == 0) return c.substring(search_name.length,c.length);
      }
      return null;
    };

  return {
          readCookie: readCookie
        };

})();
// This implements a simple cache in sessionStorage that allows
// asynchronous fetches. Use it like this:
//
//   cache.get(key, tag, max_age_minutes,
//     function(result) { ... do something with result ... },
//     function(handler) { ... get the result, e.g. with AJAX, then call handler(result) }
//   );

var cache = (function() {
  var clear_on_login_logout = function() {
    if(typeof(Storage) == "undefined") return null;
    var username = cookie_handler.readCookie('username');
    if(sessionStorage.getItem('cache:username') != username) {
      sessionStorage.clear();
      sessionStorage.setItem('cache:username', username);
    }
  }

  // Gets an item from the cache, or returns null if it's not cached.
  // Ignores results older than max_age_minutes or with a differing
  // tag.
  var get_from_cache = function(key, tag, max_age_minutes) {
    if(typeof(Storage) == "undefined") return null;

    result_info_json = sessionStorage.getItem("cache:"+key);

    // null if nonexistent
    if(!result_info_json) return null;

    result_info = JSON.parse(result_info_json);

    // null if too old
    if(Date.now() - result_info.timestamp > max_age_minutes*60000) return null;

    // null if tag mismatch
    if(result_info.tag != tag) return null;

    return result_info.result;
  };

  var store = function(key, tag, result) {
    if(typeof(Storage) == "undefined") return;
    result_info = JSON.stringify({
      result: result,
      timestamp: Date.now(),
      tag: tag
    });
    sessionStorage.setItem("cache:"+key, result_info);
  };

  var get = function(key, tag, max_age_minutes, result_handler, getter) {
    cached_result = get_from_cache(key, tag, max_age_minutes)
    if(cached_result) {
      result_handler(cached_result);
      return;
    }

    result_handler2 = function(result, status) {
      if (status != 500){
        store(key, tag, result);
      }
      result_handler(result);
    }
    getter(result_handler2);
  };

  return {
    get: get,
    store: store,
    get_from_cache: get_from_cache,
    clear_on_login_logout: clear_on_login_logout
  };
})();

cache.clear_on_login_logout();
var note = (function(){
  /* Private */
  var add = function(parent, text, type){
    var class_list = 'note ' + type;
    var original_child = $(parent).children()[0];
    $(parent).prepend("<div class='"+ class_list + "'>"+ text + "</div>");
  };

  /* Public */

  var add_general = function(parent, text){
    add(parent,text, '');
  };

  var add_good = function(parent, text){
    add(parent,text, 'note_good');
  };

  var add_warning = function(parent, text){
    add(parent, text, 'note_warning');
  };
 
  var add_error = function(parent, text){
    add(parent, text, 'error');
  };

  return {add_general: add_general,
          add_good: add_good,
          add_warning: add_warning,
          add_error: add_error};
})();
function productInit(path)
{
  productGalleryPrepare();
  restoreScrollPosition(path);
}

function restoreScrollPosition(path)
{
    // do not scroll if the user has already scrolled (that would be annoying!)
    var current_y = (document.all)?document.body.scrollTop:window.pageYOffset;
    if(current_y != 0)
	return;

    pos=document.cookie.indexOf("scroll=");
    if (pos==-1)
	return; // no cookie found
    pos += 7; // go to the beginning of the value
    end = document.cookie.indexOf(";", pos);
    if (end==-1)
	end=document.cookie.length; // it is the last cookie
    
    window.scrollTo(0,document.cookie.substring(pos,end));

    // clear the cookie so reloading will work
    var date = new Date();
    date.setTime(date.getTime()-24*60*60*1000); // date in the past
    var cookie = "scroll=; expires="+date.toGMTString()+"; path=";

    if(/MSIE (\d+\.\d+);/.test(navigator.userAgent))
	cookie += "/"; // IE does not respect the last element of the path
    else
	cookie += path;
    document.cookie = cookie;
}

function saveScrollPosition(path)
{
    var y = (document.all)?document.body.scrollTop:window.pageYOffset;
    if(y == 0)
	y = document.documentElement.scrollTop; // make IE work

    var date = new Date();
    date.setTime(date.getTime()+30*1000);

    var cookie = "scroll="+y+"; expires="+date.toGMTString()+"; path=";
    if(/MSIE (\d+\.\d+);/.test(navigator.userAgent))
	cookie += "/"; // IE does not respect the last element of the path
    else
	cookie += path;
    document.cookie = cookie;
}

function productGalleryClick(id) {
  productGalleryData().forEach(function(picture) {
    if(picture.id == id) {
      $('#main_picture_img').attr('src', picture.url_medium)
        .attr('data-picture-id', picture.id)
        .attr('data-picture-longest-side', picture.longest_side)
      $('#main_picture_img').parent().attr('href', picture.url_full)
      return
    }
  })
}

function productGalleryImg(picture) {
  return $('<div class="img_holder"/>').append($('<img/>', {
    src: picture.url_tiny,
    alt: '',
    onclick: 'productGalleryClick("'+picture.id+'"); return false'
  }))
}

function productGalleryData() {
  var picture_json = $('#main_picture_img').attr('data-gallery-pictures')
  if(!picture_json) return undefined
  return JSON.parse(picture_json)
}

function productGalleryPrepare() {
  var pictures = productGalleryData()
  if(!pictures || pictures.length < 2) return

  container = $('#related_pictures_gallery')

  pictures.forEach(function(picture) { container.append(productGalleryImg(picture)) })

  container.slick({
    dots: false,
    infinite: false,
    useTransform: false, // Re: https://bugs.chromium.org/p/chromium/issues/detail?id=521364
    speed: 100,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 740 + 1,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 560 + 1, // $single_column_picture_width
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4
        }
      },
      {
        breakpoint: 400 + 1,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      }
    ]
  })
}
;
function pictureSetupZoom() {
  $(this).parent().append($('<span class="zoom"/>'))
  $(this).parent().click(function(e) {
        e.preventDefault();
  })
  $(this).click(pictureZoom)
}

function pictureSetupZoomEvent() {
  $('.zoomable').each(pictureSetupZoom)
}

function pictureZoom(event) {
  var picture_id = $(this).attr('data-picture-id')
  var gallery_id = $(this).attr('data-gallery-id')
  var gallery_data = $(this).attr('data-gallery-pictures')

  lightbox.showGallery(gallery_id, gallery_data, picture_id)
}

$(document).ready(pictureSetupZoomEvent)
;
var shipping = (function(){
  /* Public */
  var estimate = function(e){
    e.preventDefault();
    var container = $('#shipping-container');

    container.addClass('loading');

    ajaxContentDownload.post(window.location.protocol + "//" + window.location.host + '/shipping/estimate2',
      $(e.currentTarget.form).serialize(),
      function(data){
        var html_e = jQuery.Event("click", {target: $('a[data-shipping-target]'), rescroll: 1});
        if(data.status == 'failure'){
          html_e['warning-message'] = data.message;
        }
        if($(data)[0].className == 'preview_warning'){
          html_e['error-message'] = data;
        }
        get_html(html_e);
      },
      null);
    return false;
  };

  var get_html = function(e){
    var container = $('#shipping-container');
    container.addClass('loading');
    var target = $(e.target);
    var url = target.data('shipping-target');
    if (url == undefined){ return; }
    ajaxContentDownload.get(url, null, 
      function(data){
        container.removeClass('loading');
        container[0].innerHTML = data;
        if (e.rescroll){ 
          $('#shipping-estimate').get(0).scrollIntoView(false); 
        }
        if(e['warning-message']){
          note.add_warning(container[0], e['warning-message']);
        }
        if(e['error-message']){
          note.add_error(container[0], e['error-message']);
        }
      },
      function(){
        return;
      });
    return false;
  };

  return {
    estimate: estimate,
    get_html: get_html
  };
})();
// A javascript used by the payment and shipping pages

function onLoadCheckoutIndex()
{
    showStateOrProvince('shipping');
}

function onLoadShipping()
{
    showOrEnableShippingInputs();
}

function onLoadPayment()
{
    showOrHideContacts();
    showStateOrProvince('billing');
    showStateOrProvince('order');
}

function showStateOrProvince_shipping() { showStateOrProvince('shipping'); }
function showStateOrProvince_billing() { showStateOrProvince('billing'); }
function showStateOrProvince_order() { showStateOrProvince('order'); }

function showStateOrProvince(contact_type)
{
    var country_select = $("#"+contact_type+"_country");
    var state_tr = $("#"+contact_type+"_state_tr");
    var province_tr = $("#"+contact_type+"_province_tr");
    var state = $("#"+contact_type+"_state")
    if(state_tr && province_tr)
    {
	if(country_select.length == 0)
	{
	    state_tr.show()
	    province_tr.show()
	}
	else 
	{
	    var country = country_select.val();

	    if(country == "Puerto Rico")
	    {
		country = "USA"
		state.val("PR")		
		country_select.val(country)
	    }

	    if(country == "USA")
	    {
		state_tr.show()
		province_tr.hide()
	    }
	    else
	    {
		state_tr.hide()
		province_tr.show()
	    }
	}
    }
}

function showOrEnableShippingInputs()
{
    // these are for figuring out what shipping method we are using in case of backorders
    var hold_orders_radio_button = document.getElementById("shipping.backorders_ship_separately..0");
    var ship_separately_radio_button = document.getElementById("shipping.backorders_ship_separately..1");
    var hold_orders_select = document.getElementById("shipping_method");
    var ship_separately_select = document.getElementById("shipping_method_backorders_ship_separately");
    var backorders_ship_together_if_possible_in_a_few_days = document.getElementById("shipping_backorders_ship_together_if_possible_in_a_few_days");

    // get the shipping method and gray out the appropriate inputs
    var service = "";
    if(ship_separately_radio_button && ship_separately_radio_button.checked)
    {
	hold_orders_select.disabled = true;
	ship_separately_select.disabled = false;
	backorders_ship_together_if_possible_in_a_few_days.disabled = false;
	service = ship_separately_select.options[ship_separately_select.selectedIndex].value;
    }
    else
    {
	hold_orders_select.disabled = false;
	if(ship_separately_radio_button)
	{
	    ship_separately_select.disabled = true;
	    backorders_ship_together_if_possible_in_a_few_days.disabled = true;
	}
	service = hold_orders_select.options[hold_orders_select.selectedIndex].value;
    }

    // hide the acknowledgement paragraph if it is not necessary
    var not_tracked_shipping_checkbox = document.getElementById("not_tracked_shipping_checkbox");
    var not_tracked_shipping_label = document.getElementById("not_tracked_shipping_label");

    // this should match ShippingRateLookup.not_tracked
    if(service == "usps_first_class_mail_international" ||
       service == "usps_priority_mail_international")
    {
	not_tracked_shipping_checkbox.style.display = "block";
    }
    else
    {
	not_tracked_shipping_checkbox.style.display = "none";
    }

    // display #fedex_number only for FedEx/UPS
    var fedex_number = document.getElementById("fedex_number");
    if(service.substr(0,5) == "fedex" || service.substr(0,3) == "UPS")
    {
	fedex_number.style.display = "block";
    }
    else
    {
	fedex_number.style.display = "none";
    }
}

function showOrHideContacts()
{
    showOrHideEntireOrderContactForm();
    showOrHideContact("billing");
    showOrHideContact("order");
    updateNameAndEmailDefaults("billing");
    updateNameAndEmailDefaults("order");

    var paypal_radio_button = $("#payment\\.payment_type\\.\\.paypal")
    var wire_radio_button = $("#payment\\.payment_type\\.\\.wire_transfer")
    var cash_radio_button = $("#payment\\.payment_type\\.\\.cash")
    var check_radio_button = $("#payment\\.payment_type\\.\\.check")
    var net30_radio_button = $("#payment\\.payment_type\\.\\.net30")
    var credit_card_radio_button = $("#payment\\.payment_type\\.\\.credit_card")
    var cc_div = $("#cc_info")
    var paypal_div = $("#paypal_info")

    if(paypal_radio_button.prop('checked'))
    {
	paypal_div.css('display', 'block')
	cc_div.css('display', 'none')
    }
    else if(cash_radio_button.prop('checked') || check_radio_button.prop('checked')
	    || wire_radio_button.prop('checked') || net30_radio_button.prop('checked'))
    {
	paypal_div.css('display', 'none')
	cc_div.css('display', 'none')
    }
    else
    {
	// default: cc

	// I don't know whether this should result in any recursion, but the if should at least block infinite recursion.
	if(!credit_card_radio_button.prop('checked'))
	{
	    credit_card_radio_button.prop('checked', true)
	}

	paypal_div.css('display', 'none')
	cc_div.css('display', 'block')
    }
}

function showOrHideContact(name)
{
    var selector = document.getElementById(name+"_same_select");
    var div = document.getElementById(name+"_div");

    if(!selector || selector.selectedIndex == 0)
	div.style.display = 'block';
    else
	div.style.display = 'none';
}

function showOrHideEntireOrderContactForm()
{
    var shipping_contact_is_me = (document.getElementById("shipping_contact_is_me").value == '1');
    var order_selector = document.getElementById("order_same_select");
    var billing_selector = $("#billing_same_select");
    var order_contact_form = document.getElementById("order_contact_form");

    if(order_contact_form == null)
	return; // not the payment page

    if(shipping_contact_is_me)
    {
	if(order_selector)
	    order_selector.value = "shipping";
	order_contact_form.style.display = 'none';
	return;
    }

    var billing_is_not_me_radio = document.getElementById("billing.is_me..0");

    if(billing_is_not_me_radio)
    {
	if(billing_selector.val() == "shipping" || billing_is_not_me_radio.checked)
	{
	    if(order_selector)
		order_selector.value = "";
	    order_contact_form.style.display = 'block';
	}
	else
	{
	    if(order_selector)
		order_selector.value = "billing";
	    order_contact_form.style.display = 'none';
	}
    }
}

function updateNameAndEmailDefaults(name)
{
    var default_first_name = document.getElementById("default_order_first_name").value;
    var default_middle_name = document.getElementById("default_order_middle_name").value;
    var default_last_name = document.getElementById("default_order_last_name").value;
    var default_email_address = document.getElementById("default_order_email_address").value;

    var first_name_input = document.getElementById(name+"_first_name");
    var middle_name_input = document.getElementById(name+"_middle_name");
    var last_name_input = document.getElementById(name+"_last_name");
    var email_address_input = document.getElementById(name+"_email");
    var is_not_me_radio = document.getElementById(name+".is_me..0");
    var is_me_radio = document.getElementById(name+".is_me..1");

    if(!is_not_me_radio || !is_me_radio) // do not do anything if these do not exist for some reason (e.g. order contact)
	return;

    // handle names
    if(is_not_me_radio.checked
       && first_name_input.value == default_first_name
       && middle_name_input.value == default_middle_name
       && last_name_input.value == default_last_name)
    {
	// just set it to not me, but name is my name
	first_name_input.value = "";
	middle_name_input.value = "";
	last_name_input.value = "";
    }
    else if(is_me_radio.checked)
    {
	first_name_input.value = default_first_name;
	middle_name_input.value = default_middle_name;
	last_name_input.value = default_last_name;
    }

    // handle emails
    if(is_not_me_radio.checked
       && email_address_input.value == default_email_address)
    {
	email_address_input.value = "";
    }
    else if(is_me_radio.checked)
    {
	email_address_input.value = default_email_address;
    }
}
;
function load_clean_url()
{
    document.location.href = get_clean_url();
}

function update_table()
{
    load_clean_url();
}

function update_table_and_parameter_list()
{
    load_clean_url();
}

function get_clean_url()
{
    var query = document.getElementById("query");
    var last_query = document.getElementById("last_query");
    var append_query = ""
    if(query && last_query && query.value != last_query.value)
	append_query = "?query="+escape(query.value);
    else if(query && query.value != "")
	append_query = "?q="+escape(query.value);

    var products = document.getElementById("products");
    var append_products = "";
    if(products && products.value != "")
    {
	append_products = "products="+escape(products.value)
	if(append_query != "")
	    append_products = "&"+append_products
	else
	    append_products = "?"+append_products
    }

    var categories = document.getElementById("category_tree");
    var inputs = categories.getElementsByTagName("INPUT");
    var category_list = new Array();
    for(var i=0;i<inputs.length;i++)
    {
	if(inputs[i].checked)
	{
	    var name = inputs[i].name;
	    var x = name.substring(4,name.length-1);
	    category_list.push(x);
	}
    }

    var parameters = document.getElementById("parameter_list");

    var parameters_included = new Array();
    var parameters_not_included = new Array();
    if(parameters)
    {
	inputs = parameters.getElementsByTagName("INPUT");
	for(var i=0;i<inputs.length;i++)
	{
	    var name = inputs[i].name;
	    var x = name.substring(4,name.length-1);
	    if(inputs[i].checked)	
		parameters_included.push(x);
	    else
		parameters_not_included.push(x);
	}
    }

    var sort = document.getElementById("sort");
  
    category_list = category_list.join(",");
    parameters_included = parameters_included.join(",");
    parameters_not_included = parameters_not_included.join(",");
    if(category_list == "")
	category_list = "x";
    if(parameters_included == "")
	parameters_included = "x";
    if(parameters_not_included == "")
	parameters_not_included = "x";

    var url = "/search/compare/"+
	category_list+"/"+
	parameters_included+"/"+
	parameters_not_included+"/"+
	sort.value+
	append_query+
	append_products;

    return url;
}
;
var laser_quote = (function () {
  /* Private */
  var comparator = function(attr, ascending){
      var isNumber = "^[0-9.]+$";
      if (ascending==undefined){
        ascending = true;
      }
      return function(a, b){
          var c = a.getAttribute(attr);
          var d = b.getAttribute(attr);

          /* David is worried that this will be slow, but it's not */
          if (c.match(isNumber) && d.match(isNumber)){
              c = parseFloat(c);
              d = parseFloat(d);
          }
          else {
              c = c.toLowerCase();
              d = d.toLowerCase();
          }

          if (c > d)      return ascending ?  1 : -1;
          else if (c < d) return ascending ? -1 :  1;
          else return 0;
      }
  };

  var sortChildren = function(element, func){
    children = []

    // copy the references to the children in to the array
    for (var x = element.firstChild; x != null; x = x.nextSibling)
      if (x.nodeType == 1 /* Node.ELEMENT_NODE except in IE */) children.push(x)

    children.sort(func);

    // now put them back
    for(var i=0; i<children.length; i++) element.appendChild(children[i]);
  };

  var highlightCurrentSortButton = function(table, columnName, ascending)
  {
    //static currentSortbuttonId;

    var currentSortButton = $('#'+this.currentSortButtonId);
    if (currentSortButton)
         currentSortButton.removeClass("current");

    this.currentSortButtonId = table[0].id + '_' + columnName + '_sort_' + (ascending ? 'ascending' : 'descending') + '_button';

    $('#'+this.currentSortButtonId).addClass("current");
  };

  /* Public */

  var sortNiceTable = function(table, columnName, ascending){
      var i;

      if (ascending == undefined){
          // Determing the value of ascending based oncurrent state
          var currentSortColumn = table.getAttribute("data-sort-column");
          if (currentSortColumn == columnName)
              ascending = table.getAttribute("data-sort-ascending").toString() != "true";
          else
              ascending = true;
      }

      // Make the new comparator for that one column
      var new_comparator = comparator("data-"+columnName, ascending);

      // Sort the rows
      var tBody = table.find('tbody')[1];
      sortChildren(tBody, new_comparator);

      //for (i = 0; table.comparators[i]; i++){}
      //alert("There are " + i + " comparators.");

      // Reclassify the rows to be alternating class="odd" and class="even"
      var rows = tBody.rows;
      for (var i = 0; rows[i]; i++)
          rows[i].className = (i % 2 == 0 ? 'odd' : 'even');

      // Record the new sort state
      table.attr("data-sort-column", columnName); 
      table.attr("data-sort-ascending", ascending); 

      highlightCurrentSortButton(table, columnName, ascending);
  }

  return {
    sortNiceTable: sortNiceTable
        };

})();
var stencilQuote = (function(){
  /* Private */
  var prefix;

  /* Public */

  var disableDxfFields = function(disabled){
    var height_inches = $('#'+prefix+'_height_inches')[0];
    var width_inches = $('#'+prefix+'_width_inches')[0];
    var handling_ins = $('#'+prefix+'_special_handling_instructions')[0];
    if(height_inches && width_inches && handling_ins){
      height_inches.disabled = width_inches.disabled = handling_ins.disabled = disabled;
    }
  };

  var bindFileChange = function(){
    document.getElementById('change_file_link').onclick();
  };

  var init = function(){
    if (!$('#stencil_quote_form')){ return; }

    prefix = $('#stencil_quote_form').data('prefix');
    var customer_file_format = $('tr.customer_file_format').data('file-format');

    var file_format_radio = $(document.getElementById(prefix+'.customer_file_format..'+customer_file_format))[0];
    if (file_format_radio){
      file_format_radio.checked=true;
    }

    if(customer_file_format == 'gbr'){
      disableDxfFields(true);
    }
  };

  return {
          init:init,
          disableDxfFields: disableDxfFields,
          bindFileChange: bindFileChange,
        };
})();
$(document).ready(stencilQuote.init);
var DistributorPage = (function(){
  var get_email = function(e){
    e.preventDefault();
    var currentTarget = $(e.currentTarget);
    var entry_id = currentTarget.parent().data('entry');
    currentTarget.addClass('loading');
    ajaxContentDownload.get(
      '/distributors/get-email/', 
      {'id': entry_id}, 
      function(response, textStatus){
        e.currentTarget.outerHTML = response;
      }, 
      null,
      "An error occurred. Please visit the distributor's website for contact information or try again later."
      );
  };

  var init = function(){
    $(document).on('click', '.get_email > a', get_email)
  };

  return {
    init: init
  };
})();
var DistributorMap = (function(){
  /* Private */
  var DMmap;
  var first_width_limit = 890;
  var second_width_limit = 450;
  var show_controls_min_width = 450;
  var last_zoom;
  var attachInfo = function (map, marker, infoWindow, distributor){
    google.maps.event.addListener(marker, 'click', function()
    { 
      var content = $(distributor)[0].outerHTML
      infoWindow.setContent(content)
      infoWindow.open(map, marker)
    })
  };

  var build_marker = function( distributor, markers, infoWindow ){
    var title = distributor.innerText.split(" ")[0]
    var lat = distributor.getAttribute("data-lat");
    var lon = distributor.getAttribute("data-lon");
    if ((lat && lon) == 0){
      return;
    }
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lon),
      title: title
    })
    markers.push(marker);
    attachInfo(DMmap, marker, infoWindow, distributor)
  };

  var calculateZoom = function(){
    var map_width = $("#distributor_map").width();
    var zoom = 2;
    if (map_width < first_width_limit) {
      zoom = 1;
    }
    if(map_width < second_width_limit) {
      zoom = 0;
    }
    return zoom;
  };

  var verifyDisplayControls = function(){
    var map_width = $("#distributor_map").width();
    return (map_width > show_controls_min_width);
  };

  var resetMap = function(){
    last_zoom = calculateZoom()
     DMmap.setOptions({
      center: new google.maps.LatLng(10, 30), 
      zoom: last_zoom,
      })
  };

  var resizeView = function(e, map){
    if (map.getZoom() != last_zoom){
      return;
    }
    resetMap();
  };

  var showOrHideControls = function(){
    show = verifyDisplayControls();
     DMmap.setOptions({
      zoomControl: show,
      streetViewControl: show
      })
  };

  /* Public */
  var make = function(){
    var mapElement = $("#distributor_map");

    if(mapElement == null){return;}

    var mapOptions = { 
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      disableDefaultUI: true 
    }

    DMmap = new google.maps.Map(mapElement[0], mapOptions);

    $('.mapfocus').click(resetMap);
    google.maps.event.addDomListener(window,'resize', function(e){ 
      resizeView(e, DMmap);
      showOrHideControls();
    });
    resetMap();
    showOrHideControls();

    var infoWindow = new google.maps.InfoWindow()

    var markers = [];
    $(".distributor_entry").each(function(index, distributor){ build_marker(distributor, markers, infoWindow) });
    var markerCluster = new MarkerClusterer(DMmap, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  };

  return {
    make: make
  };
})();
// highlight blog comments in yellow
function blogHighlightYellow()
{
    $(".web_update_comment").css({backgroundColor: 'transparent'})
    if(location.hash.indexOf("comment") == 1 && location.hash != "#comments")
      $(location.hash).animate({backgroundColor: '#FFFF99'},"slow")
}
;
$(document).ready(function () {
  loadMath()
})

function loadMath() {
  var loadMathjax = false
  var processClass = ''

  if ($('.math:contains(``)').size() > 0){
    loadMathjax = true
    processClass = ', processClass: "math"'
  }

  if (loadMathjax && (typeof MathJax === 'undefined')) {
    $("#mathjax").append( '<script type="text/x-mathjax-config">\n'+
                            'MathJax.Hub.Config({asciimath2jax: {delimiters: [["``","``"]], ignoreClass: "math_ignore"' + processClass + '}, "HTML-CSS": {imageFont: null}, MathMenu: {showRenderer: false, showLocale: false}});\n'+
                          '</script>\n' +
                          '<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=AM_HTMLorMML-full.js" type="text/javascript"></script>')
  }
}

function typesetMath(targetClass) {
  loadMath()
  if (typeof MathJax !== 'undefined')
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, targetClass])
}
;
var preview = (function(){
  /* Private */
  var build_preview = function(inputClass, outputClass, url){
    var inputVal = $(inputClass).val()
    var output = $(outputClass)[0]

    if (inputVal.length > 0){
      ajaxContentDownload.post(url,
                               {
                                 user_input: inputVal,
                                 session_id: cookie_handler.readCookie('session_id')
                               },
        function(data){
          output.innerHTML = data
          typesetMath(output)
        },
        function(){
          alert("Something is wrong, please try again.");
        });
    }
    else
      output.innerHTML = ''
  };

  /* Public */
  var init = function(){
    var previewInput = $('.preview_input')
    var timeout
    
    if (previewInput.size() > 0){
      build_preview('.preview_input','.preview','/preview/preview_user_input')
      previewInput.on('input propertychange paste', function() {
        if (timeout)
          clearTimeout(timeout)
        timeout = setTimeout(build_preview('.preview_input','.preview','/preview/preview_user_input'), 500)
      })
    }
  };

  return { init: init };
})();
$(document).ready(preview.init);
menu_visible = false;

function menuShow() {
  $('#header_small_menu').slideDown(100)
  $('#gray_screen').fadeIn(100)
  menu_visible = true
}

function menuHide() {
  $('#header_small_menu').slideUp(100)
  $('#gray_screen').fadeOut(100)
  menu_visible = false
}

function menuHideIfBig() {
  if($(window).width() > 1023 && menu_visible)
    menuHide();
}

function menuClick(event) {
  if(menu_visible)
    menuHide();
  else
    menuShow();
  event.preventDefault();
}

function menuInit() {
  $('#menu_button').click(menuClick)
  $('#gray_screen').click(menuClick)
  $(window).resize(menuHideIfBig)
}
;
var lightbox = (function(){
  /* Private */
  var on_close;

  var show = function(){
    $('#lightbox_holder').show();
    $('#lightbox_gray_screen').fadeIn(100);
    $('body').css('overflow-x', 'hidden');
    $('html').css('overflow-x', 'hidden');
  };

  var hide = function(){
    $('#lightbox').removeClass('loading');
    $('#lightbox_holder').hide();
    $('#lightbox_gray_screen').fadeOut(100);
    $('body').css('overflow-x', '');
    $('html').css('overflow-x', '');
  };

  var setFullLink = function(slide) {
    var url = slide.find('img').attr('src');
    $('#lightbox_full a').attr('href',url);
  };

  var setHash = function(gallery_id, picture_id) {
    var hash = '#lightbox-picture'+picture_id;
    if(gallery_id)
      hash += ';'+gallery_id;

    if(parseHash())
      history.replaceState('', '', hash);
    else
      history.pushState('', '', hash);
  };

  // returns picture_id, gallery_id
  var parseHash = function() {
    var re = /#lightbox-picture(\dJ\d+)(;(.+))?/;
    var result = re.exec(window.location.hash);
    if(!result)
      return undefined;

    return [result[1], result[3]];
  };

  var getImage = function() {
    var result = parseHash();

    if(result) {
      var picture_id = result[0];
      var gallery_id = result[1];

      var item;
      if(gallery_id) {
        // find the gallery object and request that picture
        item = $('[data-gallery-id='+gallery_id+']');
        showGallery(gallery_id, item.attr('data-gallery-pictures'), picture_id);
      }
      else {
        // find the picture object and display it
        item = $('[data-picture-id='+picture_id+']');
        showGallery(undefined, item.attr('data-gallery-pictures'), picture_id);
      }

      // scroll to the item (note that this might not be the
      // originally-clicked one, if there are multiple copies of an
      // image on the page)
      $('html, body').scrollTop(item.offset().top);
    } else {
      if($('#lightbox_gallery').is(':visible')) { hide(); };
    }
  };

  var galleryChange = function(event, slick, index) {
    var slide = $(slick.$slides[index]);

    var picture_id = slide.attr('data-slide-picture-id');
    var gallery_id = slide.attr('data-slide-gallery-id');

    setHash(gallery_id, picture_id);
    setFullLink(slide);
    showOrHideArrows(slick);
  };

  var buildHtmlImg = function(gallery_id, picture) {
    var img = $('<img/>', {
      src: picture.url_full,
      alt: ''
    });

    return $('<div/>', {
      'class': 'img_holder',
      'data-slide-picture-id': picture.id,
      'data-slide-gallery-id': gallery_id
    }).append(img)
      .append($('<div class="caption"/>').html(picture.caption));
  };

  var fillGallery = function(gallery_id, pictures, start_picture_id) {

    var container = $('#lightbox_gallery');
    var start_index;
    for(var i=0; i < pictures.length; i++) {
      var picture = pictures[i];
      container.slick('slickAdd',buildHtmlImg(gallery_id, picture));
      if(picture.id == start_picture_id)
        start_index = i;
     }
    if(start_index)
      container.slick('slickGoTo', start_index, true);
    if(start_index == 0) {
      // fake a call to the change event
      galleryChange(undefined, getSlickObject(), 0);
    }
  };

  var keyHandler = function(key_event){
    if($('#lightbox').is(":hidden")) { return; }
    if(key_event.altKey || key_event.shiftKey || key_event.ctrlKey || key_event.metaKey) { return; }

    switch(key_event.which) {
      case 27: // escape
        close();
      case (37): // left
        if ($('#lightbox_gallery').is(":visible")){
          $('#lightbox_gallery').slick('slickPrev');
        }
        break;

      case (39): // right
        if ($('#lightbox_gallery').is(":visible")){
          $('#lightbox_gallery').slick('slickNext');
        }
        break;

      default: return; // exit this handler for other keys
    };
    key_event.preventDefault(); // prevent the default action (scroll / move caret)
  };

  var galleryInit = function(){
    var container = $('#lightbox_gallery');
    $(window).hashchange(getImage);

    container.slick({
      dots: false,
      infinite: false,
      speed: 100,
      slidesToShow: 1,
      slidesToScroll: 1,
      draggable: false,
      arrows: false,
      useTransform: false // Re: https://bugs.chromium.org/p/chromium/issues/detail?id=521364
    });

    container.on('afterChange', galleryChange);

    $('#lightbox_left').click(function() {
      $('#lightbox_gallery').slick('slickPrev');
    });
    $('#lightbox_right').click(function() {
      $('#lightbox_gallery').slick('slickNext');
    });
  };

  var showOrHideArrows = function(slick) {
    if(slick.slideCount - 1 > slick.currentSlide)
      $('#lightbox_right').show();
    else
      $('#lightbox_right').hide();

    if(slick.currentSlide > 0)
      $('#lightbox_left').show();
    else
      $('#lightbox_left').hide();
  };

  var contentClear = function(){
    $('#lightbox_content').html('');
    $('#lightbox').css('max-height', '');
    $('#lightbox').css('max-width', '');
  };

  var galleryClear = function() {
    $('#lightbox_gallery').slick('removeSlide', null, null, true);
  };

  var setupTouchPassthrough = function() {
    var handler = getSlickObject().swipeHandler;

    // Pass all mouse and touch events to the slick object, using the
    // same event names and data as in slick.js itself.  Note: we
    // disabled mouse events in slick via the draggable configuration
    // option so that you could select text in captions.
    $('#lightbox').on('touchstart.slick mousedown.slick', { action: 'start' },  handler);
    $('#lightbox').on('touchend.slick mouseup.slick', { action: 'end' }, handler);
    $('#lightbox').on('touchcancel.slick mouseleave.slick', { action: 'end' }, handler);
    $('#lightbox').on('touchmove.slick mousemove.slick', { action: 'move' }, handler);
  };

  var getSlickObject = function() {
    return $('#lightbox_gallery').slick('getSlick');
  };

  var prepareLoading = function(){
    $('#lightbox').addClass('loading');
    $('#lightbox_content').hide();
    $('#lightbox_gallery').hide();
    $('#lightbox_left').hide();
    $('#lightbox_right').hide();
    $('#lightbox_full a').hide();
  }

  var prepareContent = function(handler){
    $('#lightbox').removeClass('loading');
    $('#lightbox_content').show();
    $('#lightbox_gallery').hide();
    $('#lightbox_left').hide();
    $('#lightbox_right').hide();
    $('#lightbox_full a').hide();
  };

  var prepareGalleryLayout = function(){
    $('#lightbox').removeClass('loading');
    $('#lightbox_content').hide();
    $('#lightbox_gallery').show();
    $('#lightbox_left').show();
    $('#lightbox_right').show();
    $('#lightbox_full a').show();
  };

  var scaleLightbox = function(max_height, max_width){
    if(max_height){ $('#lightbox').css('max-height', max_height); }
    if(max_height){ $('#lightbox').css('max-width', max_width); }
  };

  var prepareToShow = function(max_height, max_width, callback){
    scaleLightbox(max_height, max_width);
    if(callback){ on_close = callback; }
    document.activeElement.blur();
  };

  /* Public */

  var init = function() {
    galleryInit();
    getImage();
    setupTouchPassthrough();
    $('#lightbox_gray_screen').click(close);
    $(document).keydown( keyHandler );
    $('#lightbox_close a').click(function() {
      close();
      return false;
    });
  };

  var showGallery = function(gallery_id, gallery_data, picture_id) {
    if(!gallery_data) { return };
    document.activeElement.blur();
    prepareGalleryLayout();

    var pictures = JSON.parse(gallery_data);

    show();
    fillGallery(gallery_id, pictures, picture_id);
  };

  var showContent = function(content, max_height, max_width, callback){
    prepareToShow(max_height, max_width, callback);
    prepareContent();
    $('#lightbox_content').html(content);
    $('#lightbox_content').scrollTop(0);
    show();
  };

  var showLoading = function(max_height, max_width, callback){
    prepareToShow(max_height, max_width, callback);
    prepareLoading();
    show();
  };

  var close = function() {
    contentClear();
    galleryClear();
    hide();
    
    // Determines whether or not the pathname has been modified with a hash. 
    // If it has, we want to go to the url without the hash as a seperate state
    // Otherwise we don't need to dirty the history by adding the same url that's currently there.
    if (parseHash()){
      history.pushState('', '', window.location.pathname);
    }
    if(on_close){ on_close(); }
  };

  return {
          init: init,
          showGallery: showGallery,
          showContent: showContent,
          showLoading: showLoading,
          close: close
        };
})();
$(document).ready(lightbox.init);
var cart = (function(){
  /* Private */
  var expandableOptionShow = function(inner_div) {
    inner_div.show()
    inner_div.find("input:text, textarea").first().focus()
  };

  var expandableOptionHide = function(inner_div) {
    inner_div.hide()
  };

  var expandableOptionClick = function(div) {
    inner_div = $(div).children('div').first()
    if(inner_div.is(':visible')) {
      expandableOptionHide(inner_div)
    }
    else {
      expandableOptionShow(inner_div)
    }
  };

  var expandableOptionCall = function(option_call, event){
    switch (option_call) {
      case 'estimate':
        shipping.get_html(event);
        break;
      default:
        break;
    }
  };

  var expandableOptionInit = function(i, div) {
    var label = $(div).children('a');
    var parent = label.context;
    var option_call = parent.getAttribute('data-expand-option');
    label.click(function (event) { 
      expandableOptionClick(div);
      expandableOptionCall(option_call, event);
    });
    if(window.location.hash == '#'+parent.id){
      expandableOptionClick(div);
      var e = jQuery.Event( "click", { target: label, rescroll: 1 } );
      expandableOptionCall(option_call, e);
    }
    label.attr('tabindex',0)
    $(div).show()
  };

  var load = function() {
    divs = $('div.cart_expandable_option')
    divs.each(expandableOptionInit)
  };

  var lightbox_status_notification_submit = function(e, original_target){
      $.post(window.location.protocol + "//" + window.location.host + "/cart/set-status-editing/", function(){
        lightbox.close();
        cart_target.unbind('click', raise_status_notification_lightbox);
        cart_target.data('freeze-cart', false);
        original_target.click();
      });
      return;
  };

  var raise_status_notification_lightbox = function(e) {
    var aborted;
    lightbox.showLoading('24rem', '40rem', function(){ aborted = true; });
    var original_target = $(e.currentTarget);
    e.preventDefault();
    e.stopImmediatePropagation();
    ajaxContentDownload.get((window.location.protocol + "//" + window.location.host + '/cart/paypal-status-notification'),
      null,
      function(response) {
        if(aborted){
          return;
        }
        lightbox.showContent(response, '24rem', '40rem');
        $('#lightbox_submit_button').on('click', function(event) { lightbox_status_notification_submit(event, original_target); });
      },
      null);
  };

  var raise_add_product_lightbox = function(response, aborted){
    if(aborted){
      return;
    }
    lightbox.showContent(response, '19rem', '32rem');
    display_mini_cart_content();
    $('#continue-shopping').find('a').on('click', function(event) { 
      event.preventDefault();
      event.stopImmediatePropagation();
      lightbox.close(); 
    });
  };

  var add_product = function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    var aborted;
    var form = $(e.currentTarget.form);
    lightbox.showLoading('19rem', '32rem', function(){ aborted = true; });
    ajaxContentDownload.post(form[0].action, 
      $(form).serialize(), 
      function(response){ raise_add_product_lightbox(response, aborted)}, 
      null)
  };

  var add_cart_content = function(content){
    var mini_cart = $('[data-mini-cart=1]')[0];
    if(mini_cart){
      mini_cart.innerHTML = content;
    }
  };

  /* Public */
  var display_mini_cart_content = function(){
    var cid = cookie_handler.readCookie('cart');
    if (!cid){ return false;}
    $('[data-mini-cart=1]').hide();

    cache.get('mini_cart', cid, 5,
              function(result) {
                add_cart_content(result);
                $('[data-mini-cart=1]').show();
              },
              function(result_handler) {
                ajaxContentDownload.get((window.location.protocol + "//" + window.location.host +'/cart/mini_cart?'+cid),
                  null, result_handler, null);
              }
             );
  };

  var init = function(){
    cart_target = $(document).find('[data-freeze-cart="true"]');
    cart_target.click(raise_status_notification_lightbox);
    add_to_carts = $('[value="add_to_cart"],[value="backorder"]');
    add_to_carts.click(add_product);
    $('submit_check_out').click(function(e){
                                  $('#check_out_form').submit(); 
                                  return false;
                                });
    $('#add_salesorder > a').click(function(e){
                                  $('#add_salesorder').submit(); 
                                  return false;
                                });

    load();
  };

  return {
    init: init,
    display_mini_cart_content: display_mini_cart_content
  };
})();
$(cart.init);
var quote = (function(){
  /* Private */

  var add_list_result = function(content){
    var quote_list = $('[data-my-quotes=1]')[0];
    if(quote_list){
      quote_list.innerHTML = content
    }
  };

  /* Public */
  var display_list = function(){
    var qids = cookie_handler.readCookie('quote');
    $('[data-my-quotes=1]').hide();
    if (!qids){ return;}

    cache.get('quote', qids, 5,
              function(result) {
                add_list_result(result, status);
                $('[data-my-quotes=1]').show();
              },
              function(result_handler) {
                ajaxContentDownload.get('/quote/quotes?'+qids, null, result_handler, null);
              }
             );
  };

  var bind_delete_design = function(){
    $('#delete_design > a').click(function(e){
      e.preventDefault();
      if (window.confirm("Are you sure you want to delete this design?")) {
        e.currentTarget.parentElement.submit();
      }
    });
  };

  return {
    display_list: display_list,
    bind_delete_design: bind_delete_design
  };
})();
var braintree_payments = (function(){
  /* Private */
  var hfInstance;

  var getExpirationMonths = function(){
    // Pulled slicing for month from: https://stackoverflow.com/questions/38413690/results-from-loop-dont-work-correctly first answer
    var months = [];
    for( var i = 0; i < 12; i++ ){
      months.push( ('0'+(i+1)).slice(-2) );
    }
    return months;
  };

  var getFieldByKey = function(emittedBy){
    switch (emittedBy){
      case 'number':
        key_id = 'card-number';
        break;
      case 'expirationMonth':
        key_id = 'expiration-month';
        break;
      case 'expirationYear':
        key_id = 'expiration-year';
        break;
      default:
        key_id = emittedBy;
    }
    return $('#'+key_id);
  };

  var createHostedFields = function(client, form, submit){
    braintree.hostedFields.create({
      client: client,
      fields: {
        number: {
          selector: '#card-number',
          formatInput: false
        },
        cvv: {
          selector: '#cvv'
        },
        expirationMonth: {
          selector: '#expiration-month',
          select: { options: getExpirationMonths() },
          placeholder: 'MM'
        },
        expirationYear: {
          selector: '#expiration-year',
          select: true,
          placeholder: 'YYYY'
        }
      }
    }, function (hostedFieldsErr, hostedFieldsInstance) {
      if (hostedFieldsErr) { throw hostedFieldsErr; }

      hfInstance = hostedFieldsInstance;
      hfInstance.on('focus', form_hints.focusHint);
      hfInstance.on('blur', validateField);

      numberChange();
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        hostedFieldsInstance.tokenize(tokenizeFields, false);
      });
    });
  };

  var validateField = function(event){
    event_field = event.fields[event.emittedBy];
    field = getFieldByKey(event.emittedBy);

    if (!event_field.isEmpty && !event_field.isValid){
      field.addClass('braintree-hosted-fields-invalid');
    }else{
      field.removeClass('braintree-hosted-fields-invalid');
    }
    field.each(form_hints.checkHintError);
  };

  var tokenizeFields = function (tokenizeErr, payload) {
    // somehow some people seem to checkout with payment_type unselected
    var payment_type = $('[name="payment[payment_type]"]:checked').val()
    if(payment_type == "" || payment_type == undefined)
    {
      alert("You must select a payment method to proceed.")
      return false
    }
    var errored;
    if(payment_type == "credit_card"){
      var name_card_field = $('#payment_name_on_card');
      if( name_card_field[0].value.length == 0){
        name_card_field.addClass('error');
        errored = true;
      }
      if (tokenizeErr) {
        errored = true;
        switch (tokenizeErr.code){
          case 'HOSTED_FIELDS_FIELDS_EMPTY':
            $('.braintree-field-container').addClass('error');
            break;
          case 'HOSTED_FIELDS_FIELDS_INVALID':
            var keys = tokenizeErr.details.invalidFieldKeys;
            var key_id;
            for(var k=0; k<keys.length; k++){
              getFieldByKey(keys[k]).addClass('error');
            }
            break;
          default: break;
        }
      }
      if(errored){
        form_hints.formHintsSetup();
        alert('You must enter your Credit Card information to proceed.');
        return; 
      }

      $('#nonce').val(payload.nonce);
      $('#last_two').val(payload.details.lastTwo);
      $('#card_type').val(payload.details.cardType);
    }
    $("#payment_form")[0].submit();
  };

  var numberChange = function(){
    $("#payment_verification_hint").html("Your three- or four-digit card security code.");

    hfInstance.on('cardTypeChange', function (event) {
        if (event.cards.length > 1) {
          $("#img_visa").hide();
          $("#img_discover").hide();
          $("#img_amex").hide();
          $("#img_mastercard").hide();
          $("#payment_verification_hint").html("Your three- or four-digit card security code.");
        }
        // Change card bg depending on card type
        if (event.cards.length === 1) {
          switch (event.cards[0].type){
            case 'visa':
            case 'discover':
            case 'master-card':
              $("#img_"+event.cards[0].type.replace('-','')).show();
            case 'jcb':
              $("#payment_verification_hint").html("Three extra digits after your number on the back of the card.");
              break;
            case 'american-express':
              $("#img_amex").show();
              $("#payment_verification_hint").html("Four extra digits printed above and to the right of the main number.");
              break;
            default: 
              $("#payment_verification_hint").html("Your three- or four-digit card security code.");
              break;
          }
        }
    });
  };

  var createClient = function(authorization, form, submit){
    braintree.client.create({
    authorization: authorization
    }, function (clientErr, clientInstance) {
      if (clientErr) { return; }
      createHostedFields(clientInstance, form, submit);
    });
  };

  /* Public */

  var onLoadPayment = function(){
    // setup the submit button to submit
    var submit = $("button[name='payment_submit_button']");
    var form = document.querySelector('#payment_form');

    if(!form){ return; }

    var authorization = $('#payment_form').data('auth-token');
    createClient(authorization, form, submit);

    var braintree_field_containers = $('.braintree-field-container');
    for (var h=0; h<braintree_field_containers.length; h++){
      if(braintree_field_containers[h].dataset.error){
        $(braintree_field_containers[h]).addClass('error');
      }
    }

  };

  return { onLoadPayment: onLoadPayment };

})();
$(document).ready(braintree_payments.onLoadPayment);
var form_hints = (function(){
  /* Private */
  var getHintId = function(id){
    if(id.match(/_(first|middle|last)_name/))
      return id.replace(/_(first|middle|last)_name/,"_first_middle_last_name_hint")
    else if(id.match(/_addr[12]/))
      return id.replace(/_addr[12]/,"_address_hint")
    //Has to handle Braintree 'hostedfields' focus and errors at the container div level
    else if (id.match(/(card-)?number/))
      return 'payment_number_hint'
    else if (id == 'cvv')
      return 'payment_verification_hint'
    else
      return id+"_hint"
  };

  var getInputsFromHintId = function(id){
    if(id.match(/_first_middle_last_name_hint$/))
    {
      first_part = id.replace(/first_middle_last_name_hint$/,"")
      return $("[id^="+first_part+"][id$=_name]")
    }
    else if(id.match(/_address_hint$/,""))
    {
      first_part = id.replace(/_address_hint$/,"")
      return $("[id^="+first_part+"_addr]")
    }
    else if(id.match(/payment_number_/)){
      return $('#card-number')
    }else if(id.match(/verification/)){
      return $('#cvv')
    }
    else
      return $("#"+id.replace(/_hint$/,""))
  };

  var showHint = function(){
    id = $(this)[0].id
    inputs = getInputsFromHintId(id)
    inputs.focus(focusHint)
    inputs.each(checkHintError)
  };

  /* Public */
  var checkHintError = function(){
    var hint_id = getHintId($(this)[0].id);

    // Check for the error class we add and the 'invalid' class that braintree adds
    if($(this).hasClass("error") || $(this).hasClass('braintree-hosted-fields-invalid'))
    {
      $("#"+hint_id).addClass("error");
    }else{
      if ($("#"+hint_id).hasClass("error")){
        $("#"+hint_id).removeClass("error");
      }
    }
  };

  var focusHint = function(event){
    $(".selected").removeClass("selected")
    if(event.target){var id = event.target.id;} else {var id = event.emittedBy;}
    $("#"+getHintId(id)).addClass("selected")
  };

  var formHintsSetup = function(){
    $("[id$=_hint]").each(showHint)
  };


  return { formHintsSetup: formHintsSetup,
           focusHint: focusHint,
           checkHintError:checkHintError};

})();
$(document).ready(form_hints.formHintsSetup)
;
(function(i,s,o,g,r,a,m){
  i['GoogleAnalyticsObject']=r;
  i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;
      $(function(){m.parentNode.insertBefore(a,m)});
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-3723284-1', 'auto');
ga('send', 'pageview');
var analyticsEvents = (function(){
  /* Testing Values */
  var reportedValue = 0;
  var eventSent = false;

  /* Private */

  var sendEvent = function(event_category, event_action, event_label, event_value){
    ga('send', 'event', event_category, event_action, event_label, event_value);
    eventSent = true;
    reportedValue = event_value;
  };

  /* Public */

  var sendSalesorderReport = function(report_value){
    sendEvent('Salesorder', 'checkout', 'Goal Tracking', report_value);
  };

  return {
    // Grab test values with functions because JS would pass the initial value and not the reference
    getReportedValue: function(){return reportedValue},
    isEventSent: function(){return eventSent},

    // Public functions
    sendSalesorderReport: sendSalesorderReport
  };
})();
var login_widget = (function () {
  /* Private */
  var set_display_state = function(widget_number) {
    $("#create_account_Z, #forgot_password_Z, #proceed_anonymously_Z , #login_Z".replace(/[Z]/g, widget_number)).hide();

    switch(1) {
      case $("#login_option_login_" + widget_number+":checked").length:
          $("#login_" + widget_number).show();
          break;
      case $("#login_option_new_" + widget_number+":checked").length:
          $("#create_account_" + widget_number).show();
          break;
      case $("#login_option_forgot_" + widget_number+":checked").length:
          $("#forgot_password_" + widget_number).show();
          break;
      case $("#login_option_anonymous_" + widget_number+":checked").length:
          $("#proceed_anonymously_" + widget_number).show();
          break;
      default:
          break;
    }
  };

  var set_display_by_event = function(event){
    widget_number = event.currentTarget.id.split('_').slice(-1)[0]; //Use this because JS doesn't recognize -1 as the last element of an array
    set_display_state(widget_number);
  };
  /* Public */

  var init = function() {
    if (!$('#login_widget')){
      return;
    }
    var login_widgets = $('.login_widget');
    var allow_no_account = $('#login_widget').data('allow-no-account');
    for(var w = 0; w<login_widgets.length; w++){
      widget_number = $(login_widgets[w]).data('widget-number');

      set_display_state(widget_number);

      $("#login_option_login_Z, #login_option_new_Z, #login_option_forgot_Z, #login_option_anonymous_Z".replace(/[Z]/g, widget_number)).click(set_display_by_event);

    }
  };

  return {
          init: init,
        };

})();
$(document).ready(login_widget.init);
var dynamic_user_login = (function () {
  /* Public */

  var init = function() {
    var hide_login = $('[data-login-ui="login"]');
    var show_login = $('[data-login-ui="my_account"], [data-login-ui="logout"]');
    var username = cookie_handler.readCookie('username');
    if (username){
      $('[data-login-ui="my_account_link"]').html(decodeURIComponent(username));
      hide_login.hide();
      show_login.show();
    }else{
      hide_login.show();
      show_login.hide();
    }
  };

  return {
          init: init,
        };

})();
var product_ui = (function(){
  /* Private */

  var update_stock_message = function(stock_message, product) {
    var s = $(stock_message);
    var stock_available = product.attributes.stock_available;
    var non_stock = product.attributes.non_stock;

    if(non_stock) {
      s.hide();
    } else {
      s.show();
      if(stock_available == 0) {
        s.html('<span class="message_negative">0</span> in stock');
      } else {
        s.html('<span class="message_positive">'+stock_available+'</span> in stock');
      }
    }
  };

  var format_price = function(price) {
    if(!price) return "";
    return price;
  };

  var price_format = function(price) {
    // first, handle prices with fractional cents
    if(price.toFixed(2) != price)
      return '$'+price;

    return '$'+price.toFixed(2);
  }

  var append_first_price = function(div, prices, price_type, label) {
    var first_price_break;
    $(prices).each( function(index, price_break) {
      if(price_break[price_type]) {
        first_price_break = price_break;
        return false; // break
      }
    });

    if(!first_price_break) return;

    div.append('<span class="label">'+label+':</span> ');

    p = price_format(first_price_break[price_type]);
    if(price_type == 'regular_price' && first_price_break.discount_price) {
      dp = price_format(first_price_break.discount_price);
      div.append('<span class="message_positive">'+dp+'</span> <del>'+p+'</del>');
    }
    else
      div.append(p);
    div.append('<br>');
  }

  var has_price = function(prices, price_type) {
    var found_it = false;
    $(prices).each( function(index, price_break) {
      if(price_break[price_type]) {
        found_it = true;
        return false; // break
      }
    });
    return found_it;
  }

  var check_on_sale = function(prices) {
    var found_it = false;
    $.each(prices, function(index, price) {
      if(price.discount_price) {
        found_it = true;
        return false; // break
      }
    });

    return found_it;
  }

  var check_new = function(on_website_date) {
    if(!on_website_date)
      return false;

    // new = within 30 days
    var today = new Date();
    var pieces = on_website_date.split('-');
    var d = new Date(parseInt(pieces[0]),parseInt(pieces[1]),parseInt(pieces[2]));
    var diff_ms = today - d;
    return diff_ms < 1000*60*60*24*30;
  };

  var update_short_order_form_session_id = function(div) {
    var session_id_input = $(div).find('input[name="session_id"]');
    session_id_input.val(cookie_handler.readCookie('session_id'));
  };

  var update_short_order_form_prices = function(div, product) {
    var prices_div = $(div).find('[data-product-ui="short_order_form_prices"]');
    var on_sale = $(div).find('[data-product-ui="short_order_form_on_sale"]');
    var is_new = $(div).find('[data-product-ui="short_order_form_new"]');
    var prices = product.attributes.prices;
    var on_website_date = product.attributes.on_website_date;
    var d = $(prices_div);
    d.html('');

    on_sale.hide();
    is_new.hide();

    var unavailable_notes = product.attributes.unavailable_notes;
    if(unavailable_notes != "") {
      d.append(unavailable_notes);
      return;
    }

    if(check_on_sale(prices))
      on_sale.show();

    if(check_new(on_website_date))
      is_new.show();

    var has_your_price = has_price(prices, 'your_price')
    var has_distributor_price = has_price(prices, 'distributor_price')

    // display "Retail price" or just "Price"
    if(has_your_price || has_distributor_price) {
      append_first_price(d, prices, 'regular_price', 'Retail price');
    }
    else {
      append_first_price(d, prices, 'regular_price', 'Price');
    }

    // display "Your price", "Distributor price", or nothing
    if(has_your_price) {
      append_first_price(d, prices, 'your_price', 'Your price');
    }
    else if(has_distributor_price) {
      append_first_price(d, prices, 'distributor_price', 'Dist. price');
    }

    if(prices.length > 0) {
      var default_quantity = prices[0].quantity
      $(div).find('[data-product-ui="short_order_form_quantity"]').attr('value', default_quantity)
    }
  }

  var update_short_order_form_stock = function(div, product) {
    var stock_available = product.attributes.stock_available;
    var maximum_order = product.attributes.maximum_order;

    var d = $(div);
    var out_of_stock_message = d.find('[data-product-ui="short_order_form_out_of_stock_message"]')
    var backorder_message = d.find('[data-product-ui="short_order_form_backorder_message"]')
    var quantity_and_add = d.find('[data-product-ui="short_order_form_quantity_and_add"]')
    var add_to_wish_list = d.find('[data-product-ui="short_order_form_add_to_wish_list"]')

    backorder_message.hide();
    out_of_stock_message.hide();
    quantity_and_add.hide();
    add_to_wish_list.hide();

    var unavailable_notes = product.attributes.unavailable_notes;
    if(unavailable_notes != '')
      return;

    add_to_wish_list.show();

    if(stock_available <= 0) {
      if(maximum_order > 0) {
        backorder_message.show();
      }
      else {
        out_of_stock_message.show();
      }
    }
    else {
      quantity_and_add.show();
    }
  };

  var update_short_order_form = function(div, product) {
    update_short_order_form_stock(div, product);
    update_short_order_form_prices(div, product);
    update_short_order_form_session_id(div);
  }

  var cache_multiple_products = function(products) {
    $.each(products.data, function(index, product) {
      cache.store('product_'+product.id, '', JSON.stringify(product));
    });
  }

  var update_product_from_cache = function(product_id, element) {
    product_json = cache.get_from_cache('product_'+product_id, '', 5);
    if(product_json) {
      update_short_order_form(element, JSON.parse(product_json));
      return true;
    }
    else {
      return false;
    }
  }

  var update_some_products = function(needed_products, needed_elements) {
    var fields = 'stock_available,non_stock,prices,unavailable_notes,maximum_order,on_website_date';
    $.get({
      url: '/api/v2/product.json',
      data: {
        via_pololu_website: 1,
        'fields[product]': fields,
        filter: needed_products.join(',')
      },
      success: function(products) {
        cache_multiple_products(products);
        $.each(needed_elements, function (index, element) {
          update_product_from_cache(needed_products[index], element);
        });
      },
      dataType: 'json',
      cache: false // don't let Chrome cache it since we have our own cache
    });
  }

  var update_each = function(selector) {
    var needed_products = []
    var needed_elements = []
    $(selector).each(function (index, element) {
      product_id = $(element).attr('data-product-id');

      if(!update_product_from_cache(product_id, element)) {
        needed_products.push(product_id);
        needed_elements.push(element);
      }

      if(needed_products.length >= 50)
      {
        update_some_products(needed_products, needed_elements);
        needed_products = [];
        needed_elements = [];
      }
    });

    if(needed_products.length >= 1)
    {
      update_some_products(needed_products, needed_elements);
    }
  }

  var update = function(){
    update_each('[data-product-ui="short_order_form"]');
  }

  return {
    update: update
  };
})();
/*































*/

$(function() {
  externalLinksNewWindow();
  if(document.onLoadHandler) {
    document.onLoadHandler();
  };
  if($('body').data('print') == true) {
    window.print();
  };
  var product = $('body[data-product]');
  var productURL = $('body').data('product');
  if(product.length) {
    productInit(productURL);
  }
});

$(function() {
  $("li.web_update.clickable, li.web_comment.clickable").click(function(){
    window.location=$(this).find("h3").find("a").attr("href");
    return false;
  });
});
