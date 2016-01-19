/*!
 * jQuery JavaScript Library v2.2.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-01-08T20:02Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var arr = [];

var document = window.document;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "2.2.0",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isPlainObject: function( obj ) {

		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {

			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf( "use strict" ) === 1 ) {
				script = document.createElement( "script" );
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {

				// Otherwise, avoid the DOM node creation, insertion
				// and removal by using an indirect global eval

				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {

						// Inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE9-10 only
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	register: function( owner, initial ) {
		var value = initial || {};

		// If it is a node unlikely to be stringify-ed or looped over
		// use plain assignment
		if ( owner.nodeType ) {
			owner[ this.expando ] = value;

		// Otherwise secure it in a non-enumerable, non-writable property
		// configurability must be true to allow the property to be
		// deleted with the delete operator
		} else {
			Object.defineProperty( owner, this.expando, {
				value: value,
				writable: true,
				configurable: true
			} );
		}
		return owner[ this.expando ];
	},
	cache: function( owner ) {

		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return an empty object.
		if ( !acceptData( owner ) ) {
			return {};
		}

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ prop ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :
			owner[ this.expando ] && owner[ this.expando ][ key ];
	},
	access: function( owner, key, value ) {
		var stored;

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase( key ) );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key === undefined ) {
			this.register( owner );

		} else {

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );

				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;

			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <= 35-45+
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://code.google.com/p/chromium/issues/detail?id=378607
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data, camelKey;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// with the key as-is
				data = dataUser.get( elem, key ) ||

					// Try to find dashed key if it exists (gh-2779)
					// This is for 2.2.x only
					dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

				if ( data !== undefined ) {
					return data;
				}

				camelKey = jQuery.camelCase( key );

				// Attempt to get data from the cache
				// with the key camelized
				data = dataUser.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			camelKey = jQuery.camelCase( key );
			this.each( function() {

				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = dataUser.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				dataUser.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
					dataUser.set( this, key, value );
				}
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE9
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE9-11+
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android<4.1, PhantomJS<2
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0-4.3, Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return this;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
			"screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {
	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

function manipulationTarget( elem, content ) {
	if ( jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return elem.getElementsByTagName( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <= 35-45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {
		div.style.cssText =

			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );
	}

	jQuery.extend( support, {
		pixelPosition: function() {

			// This test is executed only once but we still do memoizing
			// since we can use the boxSizingReliable pre-computing.
			// No need to check if the test was already performed, though.
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
			// since that compresses better and they're computed together anyway.
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		},
		reliableMarginRight: function() {

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// This support function is only executed once so no memoizing is needed.
			var ret,
				marginDiv = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			marginDiv.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;box-sizing:content-box;" +
				"display:block;margin:0;border:0;padding:0";
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			documentElement.appendChild( container );

			ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

			documentElement.removeChild( container );
			div.removeChild( marginDiv );

			return ret;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// http://dev.w3.org/csswg/cssom/#resolved-values
		if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE9-11+
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Support: IE11 only
	// In IE 11 fullscreen elements inside of an iframe have
	// 100x too small dimensions (gh-1764).
	if ( document.msFullscreenElement && window.top !== window ) {

		// Support: IE11 only
		// Running getBoundingClientRect on a disconnected node
		// in IE throws an error.
		if ( elem.getClientRects().length ) {
			val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
		}
	}

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = dataPriv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = dataPriv.access(
					elem,
					"olddisplay",
					defaultDisplay( elem.nodeName )
				);
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				dataPriv.set(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = dataPriv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;

			dataPriv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {
	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
		opt.duration : opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );

	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// Handle most common string cases
					ret.replace( rreturn, "" ) :

					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				// Support: IE<11
				// option.value not trimmed (#14858)
				return jQuery.trim( elem.value );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// But now, this "simulate" function is used only for events
				// for which stopPropagation() is noop, so there is no need for that anymore.
				//
				// For the compat branch though, guard for "click" and "submit"
				// events is still used, but was moved to jQuery.event.stopPropagation function
				// because `originalEvent` should point to the original event for the constancy
				// with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




support.focusin = "onfocusin" in window;


// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE8-11+
			// IE throws exception if url is malformed, e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE8-11+
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


jQuery.expr.filters.hidden = function( elem ) {
	return !jQuery.expr.filters.visible( elem );
};
jQuery.expr.filters.visible = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	// Use OR instead of AND as the element is not visible if either is true
	// See tickets #10406 and #13132
	return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE9
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE9
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8+
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	// Stop scripts or inline event handlers from being executed immediately
	// by using document.implementation
	context = context || ( support.createHTMLDocument ?
		document.implementation.createHTMLDocument( "" ) :
		document );

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		box = elem.getBoundingClientRect();
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			// Subtract offsetParent scroll positions
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ) -
				offsetParent.scrollTop();
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true ) -
				offsetParent.scrollLeft();
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},
	size: function() {
		return this.length;
	}
} );

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.9
 *
 * Requires: jQuery 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.9',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        },

        getLineHeight: function(elem) {
            return parseInt($(elem)['offsetParent' in $.fn ? 'offsetParent' : 'parent']().css('fontSize'), 10);
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

/*!
 * Bootstrap v3.3.6 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under the MIT license
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 2)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 3')
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.6
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.6
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.6'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.6
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.6'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.6
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.6'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.6
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.6'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.6
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.6'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.6
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.6'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.6
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.6'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.6
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.6'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.6
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.6'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.6'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.6
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.6'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/*!
 * Select2 4.0.1
 * https://select2.github.io
 *
 * Released under the MIT license
 * https://github.com/select2/select2/blob/master/LICENSE.md
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function (jQuery) {
  // This is needed so we can catch the AMD loader configuration and use it
  // The inner file should be wrapped (by `banner.start.js`) in a function that
  // returns the AMD loader references.
  var S2 =
(function () {
  // Restore the Select2 AMD loader so it can be used
  // Needed mostly in the language files, where the loader is not inserted
  if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) {
    var S2 = jQuery.fn.select2.amd;
  }
var S2;(function () { if (!S2 || !S2.requirejs) {
if (!S2) { S2 = {}; } else { require = S2; }
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

S2.requirejs = requirejs;S2.require = require;S2.define = define;
}
}());
S2.define("almond", function(){});

/* global jQuery:false, $:false */
S2.define('jquery',[],function () {
  var _$ = jQuery || $;

  if (_$ == null && console && console.error) {
    console.error(
      'Select2: An instance of jQuery or a jQuery-compatible library was not ' +
      'found. Make sure that you are including jQuery before Select2 on your ' +
      'web page.'
    );
  }

  return _$;
});

S2.define('select2/utils',[
  'jquery'
], function ($) {
  var Utils = {};

  Utils.Extend = function (ChildClass, SuperClass) {
    var __hasProp = {}.hasOwnProperty;

    function BaseConstructor () {
      this.constructor = ChildClass;
    }

    for (var key in SuperClass) {
      if (__hasProp.call(SuperClass, key)) {
        ChildClass[key] = SuperClass[key];
      }
    }

    BaseConstructor.prototype = SuperClass.prototype;
    ChildClass.prototype = new BaseConstructor();
    ChildClass.__super__ = SuperClass.prototype;

    return ChildClass;
  };

  function getMethods (theClass) {
    var proto = theClass.prototype;

    var methods = [];

    for (var methodName in proto) {
      var m = proto[methodName];

      if (typeof m !== 'function') {
        continue;
      }

      if (methodName === 'constructor') {
        continue;
      }

      methods.push(methodName);
    }

    return methods;
  }

  Utils.Decorate = function (SuperClass, DecoratorClass) {
    var decoratedMethods = getMethods(DecoratorClass);
    var superMethods = getMethods(SuperClass);

    function DecoratedClass () {
      var unshift = Array.prototype.unshift;

      var argCount = DecoratorClass.prototype.constructor.length;

      var calledConstructor = SuperClass.prototype.constructor;

      if (argCount > 0) {
        unshift.call(arguments, SuperClass.prototype.constructor);

        calledConstructor = DecoratorClass.prototype.constructor;
      }

      calledConstructor.apply(this, arguments);
    }

    DecoratorClass.displayName = SuperClass.displayName;

    function ctr () {
      this.constructor = DecoratedClass;
    }

    DecoratedClass.prototype = new ctr();

    for (var m = 0; m < superMethods.length; m++) {
        var superMethod = superMethods[m];

        DecoratedClass.prototype[superMethod] =
          SuperClass.prototype[superMethod];
    }

    var calledMethod = function (methodName) {
      // Stub out the original method if it's not decorating an actual method
      var originalMethod = function () {};

      if (methodName in DecoratedClass.prototype) {
        originalMethod = DecoratedClass.prototype[methodName];
      }

      var decoratedMethod = DecoratorClass.prototype[methodName];

      return function () {
        var unshift = Array.prototype.unshift;

        unshift.call(arguments, originalMethod);

        return decoratedMethod.apply(this, arguments);
      };
    };

    for (var d = 0; d < decoratedMethods.length; d++) {
      var decoratedMethod = decoratedMethods[d];

      DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
    }

    return DecoratedClass;
  };

  var Observable = function () {
    this.listeners = {};
  };

  Observable.prototype.on = function (event, callback) {
    this.listeners = this.listeners || {};

    if (event in this.listeners) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }
  };

  Observable.prototype.trigger = function (event) {
    var slice = Array.prototype.slice;

    this.listeners = this.listeners || {};

    if (event in this.listeners) {
      this.invoke(this.listeners[event], slice.call(arguments, 1));
    }

    if ('*' in this.listeners) {
      this.invoke(this.listeners['*'], arguments);
    }
  };

  Observable.prototype.invoke = function (listeners, params) {
    for (var i = 0, len = listeners.length; i < len; i++) {
      listeners[i].apply(this, params);
    }
  };

  Utils.Observable = Observable;

  Utils.generateChars = function (length) {
    var chars = '';

    for (var i = 0; i < length; i++) {
      var randomChar = Math.floor(Math.random() * 36);
      chars += randomChar.toString(36);
    }

    return chars;
  };

  Utils.bind = function (func, context) {
    return function () {
      func.apply(context, arguments);
    };
  };

  Utils._convertData = function (data) {
    for (var originalKey in data) {
      var keys = originalKey.split('-');

      var dataLevel = data;

      if (keys.length === 1) {
        continue;
      }

      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];

        // Lowercase the first letter
        // By default, dash-separated becomes camelCase
        key = key.substring(0, 1).toLowerCase() + key.substring(1);

        if (!(key in dataLevel)) {
          dataLevel[key] = {};
        }

        if (k == keys.length - 1) {
          dataLevel[key] = data[originalKey];
        }

        dataLevel = dataLevel[key];
      }

      delete data[originalKey];
    }

    return data;
  };

  Utils.hasScroll = function (index, el) {
    // Adapted from the function created by @ShadowScripter
    // and adapted by @BillBarry on the Stack Exchange Code Review website.
    // The original code can be found at
    // http://codereview.stackexchange.com/q/13338
    // and was designed to be used with the Sizzle selector engine.

    var $el = $(el);
    var overflowX = el.style.overflowX;
    var overflowY = el.style.overflowY;

    //Check both x and y declarations
    if (overflowX === overflowY &&
        (overflowY === 'hidden' || overflowY === 'visible')) {
      return false;
    }

    if (overflowX === 'scroll' || overflowY === 'scroll') {
      return true;
    }

    return ($el.innerHeight() < el.scrollHeight ||
      $el.innerWidth() < el.scrollWidth);
  };

  Utils.escapeMarkup = function (markup) {
    var replaceMap = {
      '\\': '&#92;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#47;'
    };

    // Do not try to escape the markup if it's not a string
    if (typeof markup !== 'string') {
      return markup;
    }

    return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
      return replaceMap[match];
    });
  };

  // Append an array of jQuery nodes to a given element.
  Utils.appendMany = function ($element, $nodes) {
    // jQuery 1.7.x does not support $.fn.append() with an array
    // Fall back to a jQuery object collection using $.fn.add()
    if ($.fn.jquery.substr(0, 3) === '1.7') {
      var $jqNodes = $();

      $.map($nodes, function (node) {
        $jqNodes = $jqNodes.add(node);
      });

      $nodes = $jqNodes;
    }

    $element.append($nodes);
  };

  return Utils;
});

S2.define('select2/results',[
  'jquery',
  './utils'
], function ($, Utils) {
  function Results ($element, options, dataAdapter) {
    this.$element = $element;
    this.data = dataAdapter;
    this.options = options;

    Results.__super__.constructor.call(this);
  }

  Utils.Extend(Results, Utils.Observable);

  Results.prototype.render = function () {
    var $results = $(
      '<ul class="select2-results__options" role="tree"></ul>'
    );

    if (this.options.get('multiple')) {
      $results.attr('aria-multiselectable', 'true');
    }

    this.$results = $results;

    return $results;
  };

  Results.prototype.clear = function () {
    this.$results.empty();
  };

  Results.prototype.displayMessage = function (params) {
    var escapeMarkup = this.options.get('escapeMarkup');

    this.clear();
    this.hideLoading();

    var $message = $(
      '<li role="treeitem" aria-live="assertive"' +
      ' class="select2-results__option"></li>'
    );

    var message = this.options.get('translations').get(params.message);

    $message.append(
      escapeMarkup(
        message(params.args)
      )
    );

    $message[0].className += ' select2-results__message';

    this.$results.append($message);
  };

  Results.prototype.hideMessages = function () {
    this.$results.find('.select2-results__message').remove();
  };

  Results.prototype.append = function (data) {
    this.hideLoading();

    var $options = [];

    if (data.results == null || data.results.length === 0) {
      if (this.$results.children().length === 0) {
        this.trigger('results:message', {
          message: 'noResults'
        });
      }

      return;
    }

    data.results = this.sort(data.results);

    for (var d = 0; d < data.results.length; d++) {
      var item = data.results[d];

      var $option = this.option(item);

      $options.push($option);
    }

    this.$results.append($options);
  };

  Results.prototype.position = function ($results, $dropdown) {
    var $resultsContainer = $dropdown.find('.select2-results');
    $resultsContainer.append($results);
  };

  Results.prototype.sort = function (data) {
    var sorter = this.options.get('sorter');

    return sorter(data);
  };

  Results.prototype.setClasses = function () {
    var self = this;

    this.data.current(function (selected) {
      var selectedIds = $.map(selected, function (s) {
        return s.id.toString();
      });

      var $options = self.$results
        .find('.select2-results__option[aria-selected]');

      $options.each(function () {
        var $option = $(this);

        var item = $.data(this, 'data');

        // id needs to be converted to a string when comparing
        var id = '' + item.id;

        if ((item.element != null && item.element.selected) ||
            (item.element == null && $.inArray(id, selectedIds) > -1)) {
          $option.attr('aria-selected', 'true');
        } else {
          $option.attr('aria-selected', 'false');
        }
      });

      var $selected = $options.filter('[aria-selected=true]');

      // Check if there are any selected options
      if ($selected.length > 0) {
        // If there are selected options, highlight the first
        $selected.first().trigger('mouseenter');
      } else {
        // If there are no selected options, highlight the first option
        // in the dropdown
        $options.first().trigger('mouseenter');
      }
    });
  };

  Results.prototype.showLoading = function (params) {
    this.hideLoading();

    var loadingMore = this.options.get('translations').get('searching');

    var loading = {
      disabled: true,
      loading: true,
      text: loadingMore(params)
    };
    var $loading = this.option(loading);
    $loading.className += ' loading-results';

    this.$results.prepend($loading);
  };

  Results.prototype.hideLoading = function () {
    this.$results.find('.loading-results').remove();
  };

  Results.prototype.option = function (data) {
    var option = document.createElement('li');
    option.className = 'select2-results__option';

    var attrs = {
      'role': 'treeitem',
      'aria-selected': 'false'
    };

    if (data.disabled) {
      delete attrs['aria-selected'];
      attrs['aria-disabled'] = 'true';
    }

    if (data.id == null) {
      delete attrs['aria-selected'];
    }

    if (data._resultId != null) {
      option.id = data._resultId;
    }

    if (data.title) {
      option.title = data.title;
    }

    if (data.children) {
      attrs.role = 'group';
      attrs['aria-label'] = data.text;
      delete attrs['aria-selected'];
    }

    for (var attr in attrs) {
      var val = attrs[attr];

      option.setAttribute(attr, val);
    }

    if (data.children) {
      var $option = $(option);

      var label = document.createElement('strong');
      label.className = 'select2-results__group';

      var $label = $(label);
      this.template(data, label);

      var $children = [];

      for (var c = 0; c < data.children.length; c++) {
        var child = data.children[c];

        var $child = this.option(child);

        $children.push($child);
      }

      var $childrenContainer = $('<ul></ul>', {
        'class': 'select2-results__options select2-results__options--nested'
      });

      $childrenContainer.append($children);

      $option.append(label);
      $option.append($childrenContainer);
    } else {
      this.template(data, option);
    }

    $.data(option, 'data', data);

    return option;
  };

  Results.prototype.bind = function (container, $container) {
    var self = this;

    var id = container.id + '-results';

    this.$results.attr('id', id);

    container.on('results:all', function (params) {
      self.clear();
      self.append(params.data);

      if (container.isOpen()) {
        self.setClasses();
      }
    });

    container.on('results:append', function (params) {
      self.append(params.data);

      if (container.isOpen()) {
        self.setClasses();
      }
    });

    container.on('query', function (params) {
      self.hideMessages();
      self.showLoading(params);
    });

    container.on('select', function () {
      if (!container.isOpen()) {
        return;
      }

      self.setClasses();
    });

    container.on('unselect', function () {
      if (!container.isOpen()) {
        return;
      }

      self.setClasses();
    });

    container.on('open', function () {
      // When the dropdown is open, aria-expended="true"
      self.$results.attr('aria-expanded', 'true');
      self.$results.attr('aria-hidden', 'false');

      self.setClasses();
      self.ensureHighlightVisible();
    });

    container.on('close', function () {
      // When the dropdown is closed, aria-expended="false"
      self.$results.attr('aria-expanded', 'false');
      self.$results.attr('aria-hidden', 'true');
      self.$results.removeAttr('aria-activedescendant');
    });

    container.on('results:toggle', function () {
      var $highlighted = self.getHighlightedResults();

      if ($highlighted.length === 0) {
        return;
      }

      $highlighted.trigger('mouseup');
    });

    container.on('results:select', function () {
      var $highlighted = self.getHighlightedResults();

      if ($highlighted.length === 0) {
        return;
      }

      var data = $highlighted.data('data');

      if ($highlighted.attr('aria-selected') == 'true') {
        self.trigger('close', {});
      } else {
        self.trigger('select', {
          data: data
        });
      }
    });

    container.on('results:previous', function () {
      var $highlighted = self.getHighlightedResults();

      var $options = self.$results.find('[aria-selected]');

      var currentIndex = $options.index($highlighted);

      // If we are already at te top, don't move further
      if (currentIndex === 0) {
        return;
      }

      var nextIndex = currentIndex - 1;

      // If none are highlighted, highlight the first
      if ($highlighted.length === 0) {
        nextIndex = 0;
      }

      var $next = $options.eq(nextIndex);

      $next.trigger('mouseenter');

      var currentOffset = self.$results.offset().top;
      var nextTop = $next.offset().top;
      var nextOffset = self.$results.scrollTop() + (nextTop - currentOffset);

      if (nextIndex === 0) {
        self.$results.scrollTop(0);
      } else if (nextTop - currentOffset < 0) {
        self.$results.scrollTop(nextOffset);
      }
    });

    container.on('results:next', function () {
      var $highlighted = self.getHighlightedResults();

      var $options = self.$results.find('[aria-selected]');

      var currentIndex = $options.index($highlighted);

      var nextIndex = currentIndex + 1;

      // If we are at the last option, stay there
      if (nextIndex >= $options.length) {
        return;
      }

      var $next = $options.eq(nextIndex);

      $next.trigger('mouseenter');

      var currentOffset = self.$results.offset().top +
        self.$results.outerHeight(false);
      var nextBottom = $next.offset().top + $next.outerHeight(false);
      var nextOffset = self.$results.scrollTop() + nextBottom - currentOffset;

      if (nextIndex === 0) {
        self.$results.scrollTop(0);
      } else if (nextBottom > currentOffset) {
        self.$results.scrollTop(nextOffset);
      }
    });

    container.on('results:focus', function (params) {
      params.element.addClass('select2-results__option--highlighted');
    });

    container.on('results:message', function (params) {
      self.displayMessage(params);
    });

    if ($.fn.mousewheel) {
      this.$results.on('mousewheel', function (e) {
        var top = self.$results.scrollTop();

        var bottom = (
          self.$results.get(0).scrollHeight -
          self.$results.scrollTop() +
          e.deltaY
        );

        var isAtTop = e.deltaY > 0 && top - e.deltaY <= 0;
        var isAtBottom = e.deltaY < 0 && bottom <= self.$results.height();

        if (isAtTop) {
          self.$results.scrollTop(0);

          e.preventDefault();
          e.stopPropagation();
        } else if (isAtBottom) {
          self.$results.scrollTop(
            self.$results.get(0).scrollHeight - self.$results.height()
          );

          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    this.$results.on('mouseup', '.select2-results__option[aria-selected]',
      function (evt) {
      var $this = $(this);

      var data = $this.data('data');

      if ($this.attr('aria-selected') === 'true') {
        if (self.options.get('multiple')) {
          self.trigger('unselect', {
            originalEvent: evt,
            data: data
          });
        } else {
          self.trigger('close', {});
        }

        return;
      }

      self.trigger('select', {
        originalEvent: evt,
        data: data
      });
    });

    this.$results.on('mouseenter', '.select2-results__option[aria-selected]',
      function (evt) {
      var data = $(this).data('data');

      self.getHighlightedResults()
          .removeClass('select2-results__option--highlighted');

      self.trigger('results:focus', {
        data: data,
        element: $(this)
      });
    });
  };

  Results.prototype.getHighlightedResults = function () {
    var $highlighted = this.$results
    .find('.select2-results__option--highlighted');

    return $highlighted;
  };

  Results.prototype.destroy = function () {
    this.$results.remove();
  };

  Results.prototype.ensureHighlightVisible = function () {
    var $highlighted = this.getHighlightedResults();

    if ($highlighted.length === 0) {
      return;
    }

    var $options = this.$results.find('[aria-selected]');

    var currentIndex = $options.index($highlighted);

    var currentOffset = this.$results.offset().top;
    var nextTop = $highlighted.offset().top;
    var nextOffset = this.$results.scrollTop() + (nextTop - currentOffset);

    var offsetDelta = nextTop - currentOffset;
    nextOffset -= $highlighted.outerHeight(false) * 2;

    if (currentIndex <= 2) {
      this.$results.scrollTop(0);
    } else if (offsetDelta > this.$results.outerHeight() || offsetDelta < 0) {
      this.$results.scrollTop(nextOffset);
    }
  };

  Results.prototype.template = function (result, container) {
    var template = this.options.get('templateResult');
    var escapeMarkup = this.options.get('escapeMarkup');

    var content = template(result, container);

    if (content == null) {
      container.style.display = 'none';
    } else if (typeof content === 'string') {
      container.innerHTML = escapeMarkup(content);
    } else {
      $(container).append(content);
    }
  };

  return Results;
});

S2.define('select2/keys',[

], function () {
  var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46
  };

  return KEYS;
});

S2.define('select2/selection/base',[
  'jquery',
  '../utils',
  '../keys'
], function ($, Utils, KEYS) {
  function BaseSelection ($element, options) {
    this.$element = $element;
    this.options = options;

    BaseSelection.__super__.constructor.call(this);
  }

  Utils.Extend(BaseSelection, Utils.Observable);

  BaseSelection.prototype.render = function () {
    var $selection = $(
      '<span class="select2-selection" role="combobox" ' +
      ' aria-haspopup="true" aria-expanded="false">' +
      '</span>'
    );

    this._tabindex = 0;

    if (this.$element.data('old-tabindex') != null) {
      this._tabindex = this.$element.data('old-tabindex');
    } else if (this.$element.attr('tabindex') != null) {
      this._tabindex = this.$element.attr('tabindex');
    }

    $selection.attr('title', this.$element.attr('title'));
    $selection.attr('tabindex', this._tabindex);

    this.$selection = $selection;

    return $selection;
  };

  BaseSelection.prototype.bind = function (container, $container) {
    var self = this;

    var id = container.id + '-container';
    var resultsId = container.id + '-results';

    this.container = container;

    this.$selection.on('focus', function (evt) {
      self.trigger('focus', evt);
    });

    this.$selection.on('blur', function (evt) {
      self._handleBlur(evt);
    });

    this.$selection.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      if (evt.which === KEYS.SPACE) {
        evt.preventDefault();
      }
    });

    container.on('results:focus', function (params) {
      self.$selection.attr('aria-activedescendant', params.data._resultId);
    });

    container.on('selection:update', function (params) {
      self.update(params.data);
    });

    container.on('open', function () {
      // When the dropdown is open, aria-expanded="true"
      self.$selection.attr('aria-expanded', 'true');
      self.$selection.attr('aria-owns', resultsId);

      self._attachCloseHandler(container);
    });

    container.on('close', function () {
      // When the dropdown is closed, aria-expanded="false"
      self.$selection.attr('aria-expanded', 'false');
      self.$selection.removeAttr('aria-activedescendant');
      self.$selection.removeAttr('aria-owns');

      self.$selection.focus();

      self._detachCloseHandler(container);
    });

    container.on('enable', function () {
      self.$selection.attr('tabindex', self._tabindex);
    });

    container.on('disable', function () {
      self.$selection.attr('tabindex', '-1');
    });
  };

  BaseSelection.prototype._handleBlur = function (evt) {
    var self = this;

    // This needs to be delayed as the active element is the body when the tab
    // key is pressed, possibly along with others.
    window.setTimeout(function () {
      // Don't trigger `blur` if the focus is still in the selection
      if (
        (document.activeElement == self.$selection[0]) ||
        ($.contains(self.$selection[0], document.activeElement))
      ) {
        return;
      }

      self.trigger('blur', evt);
    }, 1);
  };

  BaseSelection.prototype._attachCloseHandler = function (container) {
    var self = this;

    $(document.body).on('mousedown.select2.' + container.id, function (e) {
      var $target = $(e.target);

      var $select = $target.closest('.select2');

      var $all = $('.select2.select2-container--open');

      $all.each(function () {
        var $this = $(this);

        if (this == $select[0]) {
          return;
        }

        var $element = $this.data('element');

        $element.select2('close');
      });
    });
  };

  BaseSelection.prototype._detachCloseHandler = function (container) {
    $(document.body).off('mousedown.select2.' + container.id);
  };

  BaseSelection.prototype.position = function ($selection, $container) {
    var $selectionContainer = $container.find('.selection');
    $selectionContainer.append($selection);
  };

  BaseSelection.prototype.destroy = function () {
    this._detachCloseHandler(this.container);
  };

  BaseSelection.prototype.update = function (data) {
    throw new Error('The `update` method must be defined in child classes.');
  };

  return BaseSelection;
});

S2.define('select2/selection/single',[
  'jquery',
  './base',
  '../utils',
  '../keys'
], function ($, BaseSelection, Utils, KEYS) {
  function SingleSelection () {
    SingleSelection.__super__.constructor.apply(this, arguments);
  }

  Utils.Extend(SingleSelection, BaseSelection);

  SingleSelection.prototype.render = function () {
    var $selection = SingleSelection.__super__.render.call(this);

    $selection.addClass('select2-selection--single');

    $selection.html(
      '<span class="select2-selection__rendered"></span>' +
      '<span class="select2-selection__arrow" role="presentation">' +
        '<b role="presentation"></b>' +
      '</span>'
    );

    return $selection;
  };

  SingleSelection.prototype.bind = function (container, $container) {
    var self = this;

    SingleSelection.__super__.bind.apply(this, arguments);

    var id = container.id + '-container';

    this.$selection.find('.select2-selection__rendered').attr('id', id);
    this.$selection.attr('aria-labelledby', id);

    this.$selection.on('mousedown', function (evt) {
      // Only respond to left clicks
      if (evt.which !== 1) {
        return;
      }

      self.trigger('toggle', {
        originalEvent: evt
      });
    });

    this.$selection.on('focus', function (evt) {
      // User focuses on the container
    });

    this.$selection.on('blur', function (evt) {
      // User exits the container
    });

    container.on('selection:update', function (params) {
      self.update(params.data);
    });
  };

  SingleSelection.prototype.clear = function () {
    this.$selection.find('.select2-selection__rendered').empty();
  };

  SingleSelection.prototype.display = function (data, container) {
    var template = this.options.get('templateSelection');
    var escapeMarkup = this.options.get('escapeMarkup');

    return escapeMarkup(template(data, container));
  };

  SingleSelection.prototype.selectionContainer = function () {
    return $('<span></span>');
  };

  SingleSelection.prototype.update = function (data) {
    if (data.length === 0) {
      this.clear();
      return;
    }

    var selection = data[0];

    var $rendered = this.$selection.find('.select2-selection__rendered');
    var formatted = this.display(selection, $rendered);

    $rendered.empty().append(formatted);
    $rendered.prop('title', selection.title || selection.text);
  };

  return SingleSelection;
});

S2.define('select2/selection/multiple',[
  'jquery',
  './base',
  '../utils'
], function ($, BaseSelection, Utils) {
  function MultipleSelection ($element, options) {
    MultipleSelection.__super__.constructor.apply(this, arguments);
  }

  Utils.Extend(MultipleSelection, BaseSelection);

  MultipleSelection.prototype.render = function () {
    var $selection = MultipleSelection.__super__.render.call(this);

    $selection.addClass('select2-selection--multiple');

    $selection.html(
      '<ul class="select2-selection__rendered"></ul>'
    );

    return $selection;
  };

  MultipleSelection.prototype.bind = function (container, $container) {
    var self = this;

    MultipleSelection.__super__.bind.apply(this, arguments);

    this.$selection.on('click', function (evt) {
      self.trigger('toggle', {
        originalEvent: evt
      });
    });

    this.$selection.on(
      'click',
      '.select2-selection__choice__remove',
      function (evt) {
        // Ignore the event if it is disabled
        if (self.options.get('disabled')) {
          return;
        }

        var $remove = $(this);
        var $selection = $remove.parent();

        var data = $selection.data('data');

        self.trigger('unselect', {
          originalEvent: evt,
          data: data
        });
      }
    );
  };

  MultipleSelection.prototype.clear = function () {
    this.$selection.find('.select2-selection__rendered').empty();
  };

  MultipleSelection.prototype.display = function (data, container) {
    var template = this.options.get('templateSelection');
    var escapeMarkup = this.options.get('escapeMarkup');

    return escapeMarkup(template(data, container));
  };

  MultipleSelection.prototype.selectionContainer = function () {
    var $container = $(
      '<li class="select2-selection__choice">' +
        '<span class="select2-selection__choice__remove" role="presentation">' +
          '&times;' +
        '</span>' +
      '</li>'
    );

    return $container;
  };

  MultipleSelection.prototype.update = function (data) {
    this.clear();

    if (data.length === 0) {
      return;
    }

    var $selections = [];

    for (var d = 0; d < data.length; d++) {
      var selection = data[d];

      var $selection = this.selectionContainer();
      var formatted = this.display(selection, $selection);

      $selection.append(formatted);
      $selection.prop('title', selection.title || selection.text);

      $selection.data('data', selection);

      $selections.push($selection);
    }

    var $rendered = this.$selection.find('.select2-selection__rendered');

    Utils.appendMany($rendered, $selections);
  };

  return MultipleSelection;
});

S2.define('select2/selection/placeholder',[
  '../utils'
], function (Utils) {
  function Placeholder (decorated, $element, options) {
    this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

    decorated.call(this, $element, options);
  }

  Placeholder.prototype.normalizePlaceholder = function (_, placeholder) {
    if (typeof placeholder === 'string') {
      placeholder = {
        id: '',
        text: placeholder
      };
    }

    return placeholder;
  };

  Placeholder.prototype.createPlaceholder = function (decorated, placeholder) {
    var $placeholder = this.selectionContainer();

    $placeholder.html(this.display(placeholder));
    $placeholder.addClass('select2-selection__placeholder')
                .removeClass('select2-selection__choice');

    return $placeholder;
  };

  Placeholder.prototype.update = function (decorated, data) {
    var singlePlaceholder = (
      data.length == 1 && data[0].id != this.placeholder.id
    );
    var multipleSelections = data.length > 1;

    if (multipleSelections || singlePlaceholder) {
      return decorated.call(this, data);
    }

    this.clear();

    var $placeholder = this.createPlaceholder(this.placeholder);

    this.$selection.find('.select2-selection__rendered').append($placeholder);
  };

  return Placeholder;
});

S2.define('select2/selection/allowClear',[
  'jquery',
  '../keys'
], function ($, KEYS) {
  function AllowClear () { }

  AllowClear.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    if (this.placeholder == null) {
      if (this.options.get('debug') && window.console && console.error) {
        console.error(
          'Select2: The `allowClear` option should be used in combination ' +
          'with the `placeholder` option.'
        );
      }
    }

    this.$selection.on('mousedown', '.select2-selection__clear',
      function (evt) {
        self._handleClear(evt);
    });

    container.on('keypress', function (evt) {
      self._handleKeyboardClear(evt, container);
    });
  };

  AllowClear.prototype._handleClear = function (_, evt) {
    // Ignore the event if it is disabled
    if (this.options.get('disabled')) {
      return;
    }

    var $clear = this.$selection.find('.select2-selection__clear');

    // Ignore the event if nothing has been selected
    if ($clear.length === 0) {
      return;
    }

    evt.stopPropagation();

    var data = $clear.data('data');

    for (var d = 0; d < data.length; d++) {
      var unselectData = {
        data: data[d]
      };

      // Trigger the `unselect` event, so people can prevent it from being
      // cleared.
      this.trigger('unselect', unselectData);

      // If the event was prevented, don't clear it out.
      if (unselectData.prevented) {
        return;
      }
    }

    this.$element.val(this.placeholder.id).trigger('change');

    this.trigger('toggle', {});
  };

  AllowClear.prototype._handleKeyboardClear = function (_, evt, container) {
    if (container.isOpen()) {
      return;
    }

    if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
      this._handleClear(evt);
    }
  };

  AllowClear.prototype.update = function (decorated, data) {
    decorated.call(this, data);

    if (this.$selection.find('.select2-selection__placeholder').length > 0 ||
        data.length === 0) {
      return;
    }

    var $remove = $(
      '<span class="select2-selection__clear">' +
        '&times;' +
      '</span>'
    );
    $remove.data('data', data);

    this.$selection.find('.select2-selection__rendered').prepend($remove);
  };

  return AllowClear;
});

S2.define('select2/selection/search',[
  'jquery',
  '../utils',
  '../keys'
], function ($, Utils, KEYS) {
  function Search (decorated, $element, options) {
    decorated.call(this, $element, options);
  }

  Search.prototype.render = function (decorated) {
    var $search = $(
      '<li class="select2-search select2-search--inline">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off"' +
        ' spellcheck="false" role="textbox" aria-autocomplete="list" />' +
      '</li>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    var $rendered = decorated.call(this);

    this._transferTabIndex();

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('open', function () {
      self.$search.trigger('focus');
    });

    container.on('close', function () {
      self.$search.val('');
      self.$search.removeAttr('aria-activedescendant');
      self.$search.trigger('focus');
    });

    container.on('enable', function () {
      self.$search.prop('disabled', false);

      self._transferTabIndex();
    });

    container.on('disable', function () {
      self.$search.prop('disabled', true);
    });

    container.on('focus', function (evt) {
      self.$search.trigger('focus');
    });

    container.on('results:focus', function (params) {
      self.$search.attr('aria-activedescendant', params.id);
    });

    this.$selection.on('focusin', '.select2-search--inline', function (evt) {
      self.trigger('focus', evt);
    });

    this.$selection.on('focusout', '.select2-search--inline', function (evt) {
      self._handleBlur(evt);
    });

    this.$selection.on('keydown', '.select2-search--inline', function (evt) {
      evt.stopPropagation();

      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();

      var key = evt.which;

      if (key === KEYS.BACKSPACE && self.$search.val() === '') {
        var $previousChoice = self.$searchContainer
          .prev('.select2-selection__choice');

        if ($previousChoice.length > 0) {
          var item = $previousChoice.data('data');

          self.searchRemoveChoice(item);

          evt.preventDefault();
        }
      }
    });

    // Try to detect the IE version should the `documentMode` property that
    // is stored on the document. This is only implemented in IE and is
    // slightly cleaner than doing a user agent check.
    // This property is not available in Edge, but Edge also doesn't have
    // this bug.
    var msie = document.documentMode;
    var disableInputEvents = msie && msie <= 11;

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$selection.on(
      'input.searchcheck',
      '.select2-search--inline',
      function (evt) {
        // IE will trigger the `input` event when a placeholder is used on a
        // search box. To get around this issue, we are forced to ignore all
        // `input` events in IE and keep using `keyup`.
        if (disableInputEvents) {
          self.$selection.off('input.search input.searchcheck');
          return;
        }

        // Unbind the duplicated `keyup` event
        self.$selection.off('keyup.search');
      }
    );

    this.$selection.on(
      'keyup.search input.search',
      '.select2-search--inline',
      function (evt) {
        // IE will trigger the `input` event when a placeholder is used on a
        // search box. To get around this issue, we are forced to ignore all
        // `input` events in IE and keep using `keyup`.
        if (disableInputEvents && evt.type === 'input') {
          self.$selection.off('input.search input.searchcheck');
          return;
        }

        var key = evt.which;

        // We can freely ignore events from modifier keys
        if (key == KEYS.SHIFT || key == KEYS.CTRL || key == KEYS.ALT) {
          return;
        }

        // Tabbing will be handled during the `keydown` phase
        if (key == KEYS.TAB) {
          return;
        }

        self.handleSearch(evt);
      }
    );
  };

  /**
   * This method will transfer the tabindex attribute from the rendered
   * selection to the search box. This allows for the search box to be used as
   * the primary focus instead of the selection container.
   *
   * @private
   */
  Search.prototype._transferTabIndex = function (decorated) {
    this.$search.attr('tabindex', this.$selection.attr('tabindex'));
    this.$selection.attr('tabindex', '-1');
  };

  Search.prototype.createPlaceholder = function (decorated, placeholder) {
    this.$search.attr('placeholder', placeholder.text);
  };

  Search.prototype.update = function (decorated, data) {
    var searchHadFocus = this.$search[0] == document.activeElement;

    this.$search.attr('placeholder', '');

    decorated.call(this, data);

    this.$selection.find('.select2-selection__rendered')
                   .append(this.$searchContainer);

    this.resizeSearch();
    if (searchHadFocus) {
      this.$search.focus();
    }
  };

  Search.prototype.handleSearch = function () {
    this.resizeSearch();

    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.searchRemoveChoice = function (decorated, item) {
    this.trigger('unselect', {
      data: item
    });

    this.$search.val(item.text);
    this.handleSearch();
  };

  Search.prototype.resizeSearch = function () {
    this.$search.css('width', '25px');

    var width = '';

    if (this.$search.attr('placeholder') !== '') {
      width = this.$selection.find('.select2-selection__rendered').innerWidth();
    } else {
      var minimumWidth = this.$search.val().length + 1;

      width = (minimumWidth * 0.75) + 'em';
    }

    this.$search.css('width', width);
  };

  return Search;
});

S2.define('select2/selection/eventRelay',[
  'jquery'
], function ($) {
  function EventRelay () { }

  EventRelay.prototype.bind = function (decorated, container, $container) {
    var self = this;
    var relayEvents = [
      'open', 'opening',
      'close', 'closing',
      'select', 'selecting',
      'unselect', 'unselecting'
    ];

    var preventableEvents = ['opening', 'closing', 'selecting', 'unselecting'];

    decorated.call(this, container, $container);

    container.on('*', function (name, params) {
      // Ignore events that should not be relayed
      if ($.inArray(name, relayEvents) === -1) {
        return;
      }

      // The parameters should always be an object
      params = params || {};

      // Generate the jQuery event for the Select2 event
      var evt = $.Event('select2:' + name, {
        params: params
      });

      self.$element.trigger(evt);

      // Only handle preventable events if it was one
      if ($.inArray(name, preventableEvents) === -1) {
        return;
      }

      params.prevented = evt.isDefaultPrevented();
    });
  };

  return EventRelay;
});

S2.define('select2/translation',[
  'jquery',
  'require'
], function ($, require) {
  function Translation (dict) {
    this.dict = dict || {};
  }

  Translation.prototype.all = function () {
    return this.dict;
  };

  Translation.prototype.get = function (key) {
    return this.dict[key];
  };

  Translation.prototype.extend = function (translation) {
    this.dict = $.extend({}, translation.all(), this.dict);
  };

  // Static functions

  Translation._cache = {};

  Translation.loadPath = function (path) {
    if (!(path in Translation._cache)) {
      var translations = require(path);

      Translation._cache[path] = translations;
    }

    return new Translation(Translation._cache[path]);
  };

  return Translation;
});

S2.define('select2/diacritics',[

], function () {
  var diacritics = {
    '\u24B6': 'A',
    '\uFF21': 'A',
    '\u00C0': 'A',
    '\u00C1': 'A',
    '\u00C2': 'A',
    '\u1EA6': 'A',
    '\u1EA4': 'A',
    '\u1EAA': 'A',
    '\u1EA8': 'A',
    '\u00C3': 'A',
    '\u0100': 'A',
    '\u0102': 'A',
    '\u1EB0': 'A',
    '\u1EAE': 'A',
    '\u1EB4': 'A',
    '\u1EB2': 'A',
    '\u0226': 'A',
    '\u01E0': 'A',
    '\u00C4': 'A',
    '\u01DE': 'A',
    '\u1EA2': 'A',
    '\u00C5': 'A',
    '\u01FA': 'A',
    '\u01CD': 'A',
    '\u0200': 'A',
    '\u0202': 'A',
    '\u1EA0': 'A',
    '\u1EAC': 'A',
    '\u1EB6': 'A',
    '\u1E00': 'A',
    '\u0104': 'A',
    '\u023A': 'A',
    '\u2C6F': 'A',
    '\uA732': 'AA',
    '\u00C6': 'AE',
    '\u01FC': 'AE',
    '\u01E2': 'AE',
    '\uA734': 'AO',
    '\uA736': 'AU',
    '\uA738': 'AV',
    '\uA73A': 'AV',
    '\uA73C': 'AY',
    '\u24B7': 'B',
    '\uFF22': 'B',
    '\u1E02': 'B',
    '\u1E04': 'B',
    '\u1E06': 'B',
    '\u0243': 'B',
    '\u0182': 'B',
    '\u0181': 'B',
    '\u24B8': 'C',
    '\uFF23': 'C',
    '\u0106': 'C',
    '\u0108': 'C',
    '\u010A': 'C',
    '\u010C': 'C',
    '\u00C7': 'C',
    '\u1E08': 'C',
    '\u0187': 'C',
    '\u023B': 'C',
    '\uA73E': 'C',
    '\u24B9': 'D',
    '\uFF24': 'D',
    '\u1E0A': 'D',
    '\u010E': 'D',
    '\u1E0C': 'D',
    '\u1E10': 'D',
    '\u1E12': 'D',
    '\u1E0E': 'D',
    '\u0110': 'D',
    '\u018B': 'D',
    '\u018A': 'D',
    '\u0189': 'D',
    '\uA779': 'D',
    '\u01F1': 'DZ',
    '\u01C4': 'DZ',
    '\u01F2': 'Dz',
    '\u01C5': 'Dz',
    '\u24BA': 'E',
    '\uFF25': 'E',
    '\u00C8': 'E',
    '\u00C9': 'E',
    '\u00CA': 'E',
    '\u1EC0': 'E',
    '\u1EBE': 'E',
    '\u1EC4': 'E',
    '\u1EC2': 'E',
    '\u1EBC': 'E',
    '\u0112': 'E',
    '\u1E14': 'E',
    '\u1E16': 'E',
    '\u0114': 'E',
    '\u0116': 'E',
    '\u00CB': 'E',
    '\u1EBA': 'E',
    '\u011A': 'E',
    '\u0204': 'E',
    '\u0206': 'E',
    '\u1EB8': 'E',
    '\u1EC6': 'E',
    '\u0228': 'E',
    '\u1E1C': 'E',
    '\u0118': 'E',
    '\u1E18': 'E',
    '\u1E1A': 'E',
    '\u0190': 'E',
    '\u018E': 'E',
    '\u24BB': 'F',
    '\uFF26': 'F',
    '\u1E1E': 'F',
    '\u0191': 'F',
    '\uA77B': 'F',
    '\u24BC': 'G',
    '\uFF27': 'G',
    '\u01F4': 'G',
    '\u011C': 'G',
    '\u1E20': 'G',
    '\u011E': 'G',
    '\u0120': 'G',
    '\u01E6': 'G',
    '\u0122': 'G',
    '\u01E4': 'G',
    '\u0193': 'G',
    '\uA7A0': 'G',
    '\uA77D': 'G',
    '\uA77E': 'G',
    '\u24BD': 'H',
    '\uFF28': 'H',
    '\u0124': 'H',
    '\u1E22': 'H',
    '\u1E26': 'H',
    '\u021E': 'H',
    '\u1E24': 'H',
    '\u1E28': 'H',
    '\u1E2A': 'H',
    '\u0126': 'H',
    '\u2C67': 'H',
    '\u2C75': 'H',
    '\uA78D': 'H',
    '\u24BE': 'I',
    '\uFF29': 'I',
    '\u00CC': 'I',
    '\u00CD': 'I',
    '\u00CE': 'I',
    '\u0128': 'I',
    '\u012A': 'I',
    '\u012C': 'I',
    '\u0130': 'I',
    '\u00CF': 'I',
    '\u1E2E': 'I',
    '\u1EC8': 'I',
    '\u01CF': 'I',
    '\u0208': 'I',
    '\u020A': 'I',
    '\u1ECA': 'I',
    '\u012E': 'I',
    '\u1E2C': 'I',
    '\u0197': 'I',
    '\u24BF': 'J',
    '\uFF2A': 'J',
    '\u0134': 'J',
    '\u0248': 'J',
    '\u24C0': 'K',
    '\uFF2B': 'K',
    '\u1E30': 'K',
    '\u01E8': 'K',
    '\u1E32': 'K',
    '\u0136': 'K',
    '\u1E34': 'K',
    '\u0198': 'K',
    '\u2C69': 'K',
    '\uA740': 'K',
    '\uA742': 'K',
    '\uA744': 'K',
    '\uA7A2': 'K',
    '\u24C1': 'L',
    '\uFF2C': 'L',
    '\u013F': 'L',
    '\u0139': 'L',
    '\u013D': 'L',
    '\u1E36': 'L',
    '\u1E38': 'L',
    '\u013B': 'L',
    '\u1E3C': 'L',
    '\u1E3A': 'L',
    '\u0141': 'L',
    '\u023D': 'L',
    '\u2C62': 'L',
    '\u2C60': 'L',
    '\uA748': 'L',
    '\uA746': 'L',
    '\uA780': 'L',
    '\u01C7': 'LJ',
    '\u01C8': 'Lj',
    '\u24C2': 'M',
    '\uFF2D': 'M',
    '\u1E3E': 'M',
    '\u1E40': 'M',
    '\u1E42': 'M',
    '\u2C6E': 'M',
    '\u019C': 'M',
    '\u24C3': 'N',
    '\uFF2E': 'N',
    '\u01F8': 'N',
    '\u0143': 'N',
    '\u00D1': 'N',
    '\u1E44': 'N',
    '\u0147': 'N',
    '\u1E46': 'N',
    '\u0145': 'N',
    '\u1E4A': 'N',
    '\u1E48': 'N',
    '\u0220': 'N',
    '\u019D': 'N',
    '\uA790': 'N',
    '\uA7A4': 'N',
    '\u01CA': 'NJ',
    '\u01CB': 'Nj',
    '\u24C4': 'O',
    '\uFF2F': 'O',
    '\u00D2': 'O',
    '\u00D3': 'O',
    '\u00D4': 'O',
    '\u1ED2': 'O',
    '\u1ED0': 'O',
    '\u1ED6': 'O',
    '\u1ED4': 'O',
    '\u00D5': 'O',
    '\u1E4C': 'O',
    '\u022C': 'O',
    '\u1E4E': 'O',
    '\u014C': 'O',
    '\u1E50': 'O',
    '\u1E52': 'O',
    '\u014E': 'O',
    '\u022E': 'O',
    '\u0230': 'O',
    '\u00D6': 'O',
    '\u022A': 'O',
    '\u1ECE': 'O',
    '\u0150': 'O',
    '\u01D1': 'O',
    '\u020C': 'O',
    '\u020E': 'O',
    '\u01A0': 'O',
    '\u1EDC': 'O',
    '\u1EDA': 'O',
    '\u1EE0': 'O',
    '\u1EDE': 'O',
    '\u1EE2': 'O',
    '\u1ECC': 'O',
    '\u1ED8': 'O',
    '\u01EA': 'O',
    '\u01EC': 'O',
    '\u00D8': 'O',
    '\u01FE': 'O',
    '\u0186': 'O',
    '\u019F': 'O',
    '\uA74A': 'O',
    '\uA74C': 'O',
    '\u01A2': 'OI',
    '\uA74E': 'OO',
    '\u0222': 'OU',
    '\u24C5': 'P',
    '\uFF30': 'P',
    '\u1E54': 'P',
    '\u1E56': 'P',
    '\u01A4': 'P',
    '\u2C63': 'P',
    '\uA750': 'P',
    '\uA752': 'P',
    '\uA754': 'P',
    '\u24C6': 'Q',
    '\uFF31': 'Q',
    '\uA756': 'Q',
    '\uA758': 'Q',
    '\u024A': 'Q',
    '\u24C7': 'R',
    '\uFF32': 'R',
    '\u0154': 'R',
    '\u1E58': 'R',
    '\u0158': 'R',
    '\u0210': 'R',
    '\u0212': 'R',
    '\u1E5A': 'R',
    '\u1E5C': 'R',
    '\u0156': 'R',
    '\u1E5E': 'R',
    '\u024C': 'R',
    '\u2C64': 'R',
    '\uA75A': 'R',
    '\uA7A6': 'R',
    '\uA782': 'R',
    '\u24C8': 'S',
    '\uFF33': 'S',
    '\u1E9E': 'S',
    '\u015A': 'S',
    '\u1E64': 'S',
    '\u015C': 'S',
    '\u1E60': 'S',
    '\u0160': 'S',
    '\u1E66': 'S',
    '\u1E62': 'S',
    '\u1E68': 'S',
    '\u0218': 'S',
    '\u015E': 'S',
    '\u2C7E': 'S',
    '\uA7A8': 'S',
    '\uA784': 'S',
    '\u24C9': 'T',
    '\uFF34': 'T',
    '\u1E6A': 'T',
    '\u0164': 'T',
    '\u1E6C': 'T',
    '\u021A': 'T',
    '\u0162': 'T',
    '\u1E70': 'T',
    '\u1E6E': 'T',
    '\u0166': 'T',
    '\u01AC': 'T',
    '\u01AE': 'T',
    '\u023E': 'T',
    '\uA786': 'T',
    '\uA728': 'TZ',
    '\u24CA': 'U',
    '\uFF35': 'U',
    '\u00D9': 'U',
    '\u00DA': 'U',
    '\u00DB': 'U',
    '\u0168': 'U',
    '\u1E78': 'U',
    '\u016A': 'U',
    '\u1E7A': 'U',
    '\u016C': 'U',
    '\u00DC': 'U',
    '\u01DB': 'U',
    '\u01D7': 'U',
    '\u01D5': 'U',
    '\u01D9': 'U',
    '\u1EE6': 'U',
    '\u016E': 'U',
    '\u0170': 'U',
    '\u01D3': 'U',
    '\u0214': 'U',
    '\u0216': 'U',
    '\u01AF': 'U',
    '\u1EEA': 'U',
    '\u1EE8': 'U',
    '\u1EEE': 'U',
    '\u1EEC': 'U',
    '\u1EF0': 'U',
    '\u1EE4': 'U',
    '\u1E72': 'U',
    '\u0172': 'U',
    '\u1E76': 'U',
    '\u1E74': 'U',
    '\u0244': 'U',
    '\u24CB': 'V',
    '\uFF36': 'V',
    '\u1E7C': 'V',
    '\u1E7E': 'V',
    '\u01B2': 'V',
    '\uA75E': 'V',
    '\u0245': 'V',
    '\uA760': 'VY',
    '\u24CC': 'W',
    '\uFF37': 'W',
    '\u1E80': 'W',
    '\u1E82': 'W',
    '\u0174': 'W',
    '\u1E86': 'W',
    '\u1E84': 'W',
    '\u1E88': 'W',
    '\u2C72': 'W',
    '\u24CD': 'X',
    '\uFF38': 'X',
    '\u1E8A': 'X',
    '\u1E8C': 'X',
    '\u24CE': 'Y',
    '\uFF39': 'Y',
    '\u1EF2': 'Y',
    '\u00DD': 'Y',
    '\u0176': 'Y',
    '\u1EF8': 'Y',
    '\u0232': 'Y',
    '\u1E8E': 'Y',
    '\u0178': 'Y',
    '\u1EF6': 'Y',
    '\u1EF4': 'Y',
    '\u01B3': 'Y',
    '\u024E': 'Y',
    '\u1EFE': 'Y',
    '\u24CF': 'Z',
    '\uFF3A': 'Z',
    '\u0179': 'Z',
    '\u1E90': 'Z',
    '\u017B': 'Z',
    '\u017D': 'Z',
    '\u1E92': 'Z',
    '\u1E94': 'Z',
    '\u01B5': 'Z',
    '\u0224': 'Z',
    '\u2C7F': 'Z',
    '\u2C6B': 'Z',
    '\uA762': 'Z',
    '\u24D0': 'a',
    '\uFF41': 'a',
    '\u1E9A': 'a',
    '\u00E0': 'a',
    '\u00E1': 'a',
    '\u00E2': 'a',
    '\u1EA7': 'a',
    '\u1EA5': 'a',
    '\u1EAB': 'a',
    '\u1EA9': 'a',
    '\u00E3': 'a',
    '\u0101': 'a',
    '\u0103': 'a',
    '\u1EB1': 'a',
    '\u1EAF': 'a',
    '\u1EB5': 'a',
    '\u1EB3': 'a',
    '\u0227': 'a',
    '\u01E1': 'a',
    '\u00E4': 'a',
    '\u01DF': 'a',
    '\u1EA3': 'a',
    '\u00E5': 'a',
    '\u01FB': 'a',
    '\u01CE': 'a',
    '\u0201': 'a',
    '\u0203': 'a',
    '\u1EA1': 'a',
    '\u1EAD': 'a',
    '\u1EB7': 'a',
    '\u1E01': 'a',
    '\u0105': 'a',
    '\u2C65': 'a',
    '\u0250': 'a',
    '\uA733': 'aa',
    '\u00E6': 'ae',
    '\u01FD': 'ae',
    '\u01E3': 'ae',
    '\uA735': 'ao',
    '\uA737': 'au',
    '\uA739': 'av',
    '\uA73B': 'av',
    '\uA73D': 'ay',
    '\u24D1': 'b',
    '\uFF42': 'b',
    '\u1E03': 'b',
    '\u1E05': 'b',
    '\u1E07': 'b',
    '\u0180': 'b',
    '\u0183': 'b',
    '\u0253': 'b',
    '\u24D2': 'c',
    '\uFF43': 'c',
    '\u0107': 'c',
    '\u0109': 'c',
    '\u010B': 'c',
    '\u010D': 'c',
    '\u00E7': 'c',
    '\u1E09': 'c',
    '\u0188': 'c',
    '\u023C': 'c',
    '\uA73F': 'c',
    '\u2184': 'c',
    '\u24D3': 'd',
    '\uFF44': 'd',
    '\u1E0B': 'd',
    '\u010F': 'd',
    '\u1E0D': 'd',
    '\u1E11': 'd',
    '\u1E13': 'd',
    '\u1E0F': 'd',
    '\u0111': 'd',
    '\u018C': 'd',
    '\u0256': 'd',
    '\u0257': 'd',
    '\uA77A': 'd',
    '\u01F3': 'dz',
    '\u01C6': 'dz',
    '\u24D4': 'e',
    '\uFF45': 'e',
    '\u00E8': 'e',
    '\u00E9': 'e',
    '\u00EA': 'e',
    '\u1EC1': 'e',
    '\u1EBF': 'e',
    '\u1EC5': 'e',
    '\u1EC3': 'e',
    '\u1EBD': 'e',
    '\u0113': 'e',
    '\u1E15': 'e',
    '\u1E17': 'e',
    '\u0115': 'e',
    '\u0117': 'e',
    '\u00EB': 'e',
    '\u1EBB': 'e',
    '\u011B': 'e',
    '\u0205': 'e',
    '\u0207': 'e',
    '\u1EB9': 'e',
    '\u1EC7': 'e',
    '\u0229': 'e',
    '\u1E1D': 'e',
    '\u0119': 'e',
    '\u1E19': 'e',
    '\u1E1B': 'e',
    '\u0247': 'e',
    '\u025B': 'e',
    '\u01DD': 'e',
    '\u24D5': 'f',
    '\uFF46': 'f',
    '\u1E1F': 'f',
    '\u0192': 'f',
    '\uA77C': 'f',
    '\u24D6': 'g',
    '\uFF47': 'g',
    '\u01F5': 'g',
    '\u011D': 'g',
    '\u1E21': 'g',
    '\u011F': 'g',
    '\u0121': 'g',
    '\u01E7': 'g',
    '\u0123': 'g',
    '\u01E5': 'g',
    '\u0260': 'g',
    '\uA7A1': 'g',
    '\u1D79': 'g',
    '\uA77F': 'g',
    '\u24D7': 'h',
    '\uFF48': 'h',
    '\u0125': 'h',
    '\u1E23': 'h',
    '\u1E27': 'h',
    '\u021F': 'h',
    '\u1E25': 'h',
    '\u1E29': 'h',
    '\u1E2B': 'h',
    '\u1E96': 'h',
    '\u0127': 'h',
    '\u2C68': 'h',
    '\u2C76': 'h',
    '\u0265': 'h',
    '\u0195': 'hv',
    '\u24D8': 'i',
    '\uFF49': 'i',
    '\u00EC': 'i',
    '\u00ED': 'i',
    '\u00EE': 'i',
    '\u0129': 'i',
    '\u012B': 'i',
    '\u012D': 'i',
    '\u00EF': 'i',
    '\u1E2F': 'i',
    '\u1EC9': 'i',
    '\u01D0': 'i',
    '\u0209': 'i',
    '\u020B': 'i',
    '\u1ECB': 'i',
    '\u012F': 'i',
    '\u1E2D': 'i',
    '\u0268': 'i',
    '\u0131': 'i',
    '\u24D9': 'j',
    '\uFF4A': 'j',
    '\u0135': 'j',
    '\u01F0': 'j',
    '\u0249': 'j',
    '\u24DA': 'k',
    '\uFF4B': 'k',
    '\u1E31': 'k',
    '\u01E9': 'k',
    '\u1E33': 'k',
    '\u0137': 'k',
    '\u1E35': 'k',
    '\u0199': 'k',
    '\u2C6A': 'k',
    '\uA741': 'k',
    '\uA743': 'k',
    '\uA745': 'k',
    '\uA7A3': 'k',
    '\u24DB': 'l',
    '\uFF4C': 'l',
    '\u0140': 'l',
    '\u013A': 'l',
    '\u013E': 'l',
    '\u1E37': 'l',
    '\u1E39': 'l',
    '\u013C': 'l',
    '\u1E3D': 'l',
    '\u1E3B': 'l',
    '\u017F': 'l',
    '\u0142': 'l',
    '\u019A': 'l',
    '\u026B': 'l',
    '\u2C61': 'l',
    '\uA749': 'l',
    '\uA781': 'l',
    '\uA747': 'l',
    '\u01C9': 'lj',
    '\u24DC': 'm',
    '\uFF4D': 'm',
    '\u1E3F': 'm',
    '\u1E41': 'm',
    '\u1E43': 'm',
    '\u0271': 'm',
    '\u026F': 'm',
    '\u24DD': 'n',
    '\uFF4E': 'n',
    '\u01F9': 'n',
    '\u0144': 'n',
    '\u00F1': 'n',
    '\u1E45': 'n',
    '\u0148': 'n',
    '\u1E47': 'n',
    '\u0146': 'n',
    '\u1E4B': 'n',
    '\u1E49': 'n',
    '\u019E': 'n',
    '\u0272': 'n',
    '\u0149': 'n',
    '\uA791': 'n',
    '\uA7A5': 'n',
    '\u01CC': 'nj',
    '\u24DE': 'o',
    '\uFF4F': 'o',
    '\u00F2': 'o',
    '\u00F3': 'o',
    '\u00F4': 'o',
    '\u1ED3': 'o',
    '\u1ED1': 'o',
    '\u1ED7': 'o',
    '\u1ED5': 'o',
    '\u00F5': 'o',
    '\u1E4D': 'o',
    '\u022D': 'o',
    '\u1E4F': 'o',
    '\u014D': 'o',
    '\u1E51': 'o',
    '\u1E53': 'o',
    '\u014F': 'o',
    '\u022F': 'o',
    '\u0231': 'o',
    '\u00F6': 'o',
    '\u022B': 'o',
    '\u1ECF': 'o',
    '\u0151': 'o',
    '\u01D2': 'o',
    '\u020D': 'o',
    '\u020F': 'o',
    '\u01A1': 'o',
    '\u1EDD': 'o',
    '\u1EDB': 'o',
    '\u1EE1': 'o',
    '\u1EDF': 'o',
    '\u1EE3': 'o',
    '\u1ECD': 'o',
    '\u1ED9': 'o',
    '\u01EB': 'o',
    '\u01ED': 'o',
    '\u00F8': 'o',
    '\u01FF': 'o',
    '\u0254': 'o',
    '\uA74B': 'o',
    '\uA74D': 'o',
    '\u0275': 'o',
    '\u01A3': 'oi',
    '\u0223': 'ou',
    '\uA74F': 'oo',
    '\u24DF': 'p',
    '\uFF50': 'p',
    '\u1E55': 'p',
    '\u1E57': 'p',
    '\u01A5': 'p',
    '\u1D7D': 'p',
    '\uA751': 'p',
    '\uA753': 'p',
    '\uA755': 'p',
    '\u24E0': 'q',
    '\uFF51': 'q',
    '\u024B': 'q',
    '\uA757': 'q',
    '\uA759': 'q',
    '\u24E1': 'r',
    '\uFF52': 'r',
    '\u0155': 'r',
    '\u1E59': 'r',
    '\u0159': 'r',
    '\u0211': 'r',
    '\u0213': 'r',
    '\u1E5B': 'r',
    '\u1E5D': 'r',
    '\u0157': 'r',
    '\u1E5F': 'r',
    '\u024D': 'r',
    '\u027D': 'r',
    '\uA75B': 'r',
    '\uA7A7': 'r',
    '\uA783': 'r',
    '\u24E2': 's',
    '\uFF53': 's',
    '\u00DF': 's',
    '\u015B': 's',
    '\u1E65': 's',
    '\u015D': 's',
    '\u1E61': 's',
    '\u0161': 's',
    '\u1E67': 's',
    '\u1E63': 's',
    '\u1E69': 's',
    '\u0219': 's',
    '\u015F': 's',
    '\u023F': 's',
    '\uA7A9': 's',
    '\uA785': 's',
    '\u1E9B': 's',
    '\u24E3': 't',
    '\uFF54': 't',
    '\u1E6B': 't',
    '\u1E97': 't',
    '\u0165': 't',
    '\u1E6D': 't',
    '\u021B': 't',
    '\u0163': 't',
    '\u1E71': 't',
    '\u1E6F': 't',
    '\u0167': 't',
    '\u01AD': 't',
    '\u0288': 't',
    '\u2C66': 't',
    '\uA787': 't',
    '\uA729': 'tz',
    '\u24E4': 'u',
    '\uFF55': 'u',
    '\u00F9': 'u',
    '\u00FA': 'u',
    '\u00FB': 'u',
    '\u0169': 'u',
    '\u1E79': 'u',
    '\u016B': 'u',
    '\u1E7B': 'u',
    '\u016D': 'u',
    '\u00FC': 'u',
    '\u01DC': 'u',
    '\u01D8': 'u',
    '\u01D6': 'u',
    '\u01DA': 'u',
    '\u1EE7': 'u',
    '\u016F': 'u',
    '\u0171': 'u',
    '\u01D4': 'u',
    '\u0215': 'u',
    '\u0217': 'u',
    '\u01B0': 'u',
    '\u1EEB': 'u',
    '\u1EE9': 'u',
    '\u1EEF': 'u',
    '\u1EED': 'u',
    '\u1EF1': 'u',
    '\u1EE5': 'u',
    '\u1E73': 'u',
    '\u0173': 'u',
    '\u1E77': 'u',
    '\u1E75': 'u',
    '\u0289': 'u',
    '\u24E5': 'v',
    '\uFF56': 'v',
    '\u1E7D': 'v',
    '\u1E7F': 'v',
    '\u028B': 'v',
    '\uA75F': 'v',
    '\u028C': 'v',
    '\uA761': 'vy',
    '\u24E6': 'w',
    '\uFF57': 'w',
    '\u1E81': 'w',
    '\u1E83': 'w',
    '\u0175': 'w',
    '\u1E87': 'w',
    '\u1E85': 'w',
    '\u1E98': 'w',
    '\u1E89': 'w',
    '\u2C73': 'w',
    '\u24E7': 'x',
    '\uFF58': 'x',
    '\u1E8B': 'x',
    '\u1E8D': 'x',
    '\u24E8': 'y',
    '\uFF59': 'y',
    '\u1EF3': 'y',
    '\u00FD': 'y',
    '\u0177': 'y',
    '\u1EF9': 'y',
    '\u0233': 'y',
    '\u1E8F': 'y',
    '\u00FF': 'y',
    '\u1EF7': 'y',
    '\u1E99': 'y',
    '\u1EF5': 'y',
    '\u01B4': 'y',
    '\u024F': 'y',
    '\u1EFF': 'y',
    '\u24E9': 'z',
    '\uFF5A': 'z',
    '\u017A': 'z',
    '\u1E91': 'z',
    '\u017C': 'z',
    '\u017E': 'z',
    '\u1E93': 'z',
    '\u1E95': 'z',
    '\u01B6': 'z',
    '\u0225': 'z',
    '\u0240': 'z',
    '\u2C6C': 'z',
    '\uA763': 'z',
    '\u0386': '\u0391',
    '\u0388': '\u0395',
    '\u0389': '\u0397',
    '\u038A': '\u0399',
    '\u03AA': '\u0399',
    '\u038C': '\u039F',
    '\u038E': '\u03A5',
    '\u03AB': '\u03A5',
    '\u038F': '\u03A9',
    '\u03AC': '\u03B1',
    '\u03AD': '\u03B5',
    '\u03AE': '\u03B7',
    '\u03AF': '\u03B9',
    '\u03CA': '\u03B9',
    '\u0390': '\u03B9',
    '\u03CC': '\u03BF',
    '\u03CD': '\u03C5',
    '\u03CB': '\u03C5',
    '\u03B0': '\u03C5',
    '\u03C9': '\u03C9',
    '\u03C2': '\u03C3'
  };

  return diacritics;
});

S2.define('select2/data/base',[
  '../utils'
], function (Utils) {
  function BaseAdapter ($element, options) {
    BaseAdapter.__super__.constructor.call(this);
  }

  Utils.Extend(BaseAdapter, Utils.Observable);

  BaseAdapter.prototype.current = function (callback) {
    throw new Error('The `current` method must be defined in child classes.');
  };

  BaseAdapter.prototype.query = function (params, callback) {
    throw new Error('The `query` method must be defined in child classes.');
  };

  BaseAdapter.prototype.bind = function (container, $container) {
    // Can be implemented in subclasses
  };

  BaseAdapter.prototype.destroy = function () {
    // Can be implemented in subclasses
  };

  BaseAdapter.prototype.generateResultId = function (container, data) {
    var id = container.id + '-result-';

    id += Utils.generateChars(4);

    if (data.id != null) {
      id += '-' + data.id.toString();
    } else {
      id += '-' + Utils.generateChars(4);
    }
    return id;
  };

  return BaseAdapter;
});

S2.define('select2/data/select',[
  './base',
  '../utils',
  'jquery'
], function (BaseAdapter, Utils, $) {
  function SelectAdapter ($element, options) {
    this.$element = $element;
    this.options = options;

    SelectAdapter.__super__.constructor.call(this);
  }

  Utils.Extend(SelectAdapter, BaseAdapter);

  SelectAdapter.prototype.current = function (callback) {
    var data = [];
    var self = this;

    this.$element.find(':selected').each(function () {
      var $option = $(this);

      var option = self.item($option);

      data.push(option);
    });

    callback(data);
  };

  SelectAdapter.prototype.select = function (data) {
    var self = this;

    data.selected = true;

    // If data.element is a DOM node, use it instead
    if ($(data.element).is('option')) {
      data.element.selected = true;

      this.$element.trigger('change');

      return;
    }

    if (this.$element.prop('multiple')) {
      this.current(function (currentData) {
        var val = [];

        data = [data];
        data.push.apply(data, currentData);

        for (var d = 0; d < data.length; d++) {
          var id = data[d].id;

          if ($.inArray(id, val) === -1) {
            val.push(id);
          }
        }

        self.$element.val(val);
        self.$element.trigger('change');
      });
    } else {
      var val = data.id;

      this.$element.val(val);
      this.$element.trigger('change');
    }
  };

  SelectAdapter.prototype.unselect = function (data) {
    var self = this;

    if (!this.$element.prop('multiple')) {
      return;
    }

    data.selected = false;

    if ($(data.element).is('option')) {
      data.element.selected = false;

      this.$element.trigger('change');

      return;
    }

    this.current(function (currentData) {
      var val = [];

      for (var d = 0; d < currentData.length; d++) {
        var id = currentData[d].id;

        if (id !== data.id && $.inArray(id, val) === -1) {
          val.push(id);
        }
      }

      self.$element.val(val);

      self.$element.trigger('change');
    });
  };

  SelectAdapter.prototype.bind = function (container, $container) {
    var self = this;

    this.container = container;

    container.on('select', function (params) {
      self.select(params.data);
    });

    container.on('unselect', function (params) {
      self.unselect(params.data);
    });
  };

  SelectAdapter.prototype.destroy = function () {
    // Remove anything added to child elements
    this.$element.find('*').each(function () {
      // Remove any custom data set by Select2
      $.removeData(this, 'data');
    });
  };

  SelectAdapter.prototype.query = function (params, callback) {
    var data = [];
    var self = this;

    var $options = this.$element.children();

    $options.each(function () {
      var $option = $(this);

      if (!$option.is('option') && !$option.is('optgroup')) {
        return;
      }

      var option = self.item($option);

      var matches = self.matches(params, option);

      if (matches !== null) {
        data.push(matches);
      }
    });

    callback({
      results: data
    });
  };

  SelectAdapter.prototype.addOptions = function ($options) {
    Utils.appendMany(this.$element, $options);
  };

  SelectAdapter.prototype.option = function (data) {
    var option;

    if (data.children) {
      option = document.createElement('optgroup');
      option.label = data.text;
    } else {
      option = document.createElement('option');

      if (option.textContent !== undefined) {
        option.textContent = data.text;
      } else {
        option.innerText = data.text;
      }
    }

    if (data.id) {
      option.value = data.id;
    }

    if (data.disabled) {
      option.disabled = true;
    }

    if (data.selected) {
      option.selected = true;
    }

    if (data.title) {
      option.title = data.title;
    }

    var $option = $(option);

    var normalizedData = this._normalizeItem(data);
    normalizedData.element = option;

    // Override the option's data with the combined data
    $.data(option, 'data', normalizedData);

    return $option;
  };

  SelectAdapter.prototype.item = function ($option) {
    var data = {};

    data = $.data($option[0], 'data');

    if (data != null) {
      return data;
    }

    if ($option.is('option')) {
      data = {
        id: $option.val(),
        text: $option.text(),
        disabled: $option.prop('disabled'),
        selected: $option.prop('selected'),
        title: $option.prop('title')
      };
    } else if ($option.is('optgroup')) {
      data = {
        text: $option.prop('label'),
        children: [],
        title: $option.prop('title')
      };

      var $children = $option.children('option');
      var children = [];

      for (var c = 0; c < $children.length; c++) {
        var $child = $($children[c]);

        var child = this.item($child);

        children.push(child);
      }

      data.children = children;
    }

    data = this._normalizeItem(data);
    data.element = $option[0];

    $.data($option[0], 'data', data);

    return data;
  };

  SelectAdapter.prototype._normalizeItem = function (item) {
    if (!$.isPlainObject(item)) {
      item = {
        id: item,
        text: item
      };
    }

    item = $.extend({}, {
      text: ''
    }, item);

    var defaults = {
      selected: false,
      disabled: false
    };

    if (item.id != null) {
      item.id = item.id.toString();
    }

    if (item.text != null) {
      item.text = item.text.toString();
    }

    if (item._resultId == null && item.id && this.container != null) {
      item._resultId = this.generateResultId(this.container, item);
    }

    return $.extend({}, defaults, item);
  };

  SelectAdapter.prototype.matches = function (params, data) {
    var matcher = this.options.get('matcher');

    return matcher(params, data);
  };

  return SelectAdapter;
});

S2.define('select2/data/array',[
  './select',
  '../utils',
  'jquery'
], function (SelectAdapter, Utils, $) {
  function ArrayAdapter ($element, options) {
    var data = options.get('data') || [];

    ArrayAdapter.__super__.constructor.call(this, $element, options);

    this.addOptions(this.convertToOptions(data));
  }

  Utils.Extend(ArrayAdapter, SelectAdapter);

  ArrayAdapter.prototype.select = function (data) {
    var $option = this.$element.find('option').filter(function (i, elm) {
      return elm.value == data.id.toString();
    });

    if ($option.length === 0) {
      $option = this.option(data);

      this.addOptions($option);
    }

    ArrayAdapter.__super__.select.call(this, data);
  };

  ArrayAdapter.prototype.convertToOptions = function (data) {
    var self = this;

    var $existing = this.$element.find('option');
    var existingIds = $existing.map(function () {
      return self.item($(this)).id;
    }).get();

    var $options = [];

    // Filter out all items except for the one passed in the argument
    function onlyItem (item) {
      return function () {
        return $(this).val() == item.id;
      };
    }

    for (var d = 0; d < data.length; d++) {
      var item = this._normalizeItem(data[d]);

      // Skip items which were pre-loaded, only merge the data
      if ($.inArray(item.id, existingIds) >= 0) {
        var $existingOption = $existing.filter(onlyItem(item));

        var existingData = this.item($existingOption);
        var newData = $.extend(true, {}, existingData, item);

        var $newOption = this.option(newData);

        $existingOption.replaceWith($newOption);

        continue;
      }

      var $option = this.option(item);

      if (item.children) {
        var $children = this.convertToOptions(item.children);

        Utils.appendMany($option, $children);
      }

      $options.push($option);
    }

    return $options;
  };

  return ArrayAdapter;
});

S2.define('select2/data/ajax',[
  './array',
  '../utils',
  'jquery'
], function (ArrayAdapter, Utils, $) {
  function AjaxAdapter ($element, options) {
    this.ajaxOptions = this._applyDefaults(options.get('ajax'));

    if (this.ajaxOptions.processResults != null) {
      this.processResults = this.ajaxOptions.processResults;
    }

    AjaxAdapter.__super__.constructor.call(this, $element, options);
  }

  Utils.Extend(AjaxAdapter, ArrayAdapter);

  AjaxAdapter.prototype._applyDefaults = function (options) {
    var defaults = {
      data: function (params) {
        return $.extend({}, params, {
          q: params.term
        });
      },
      transport: function (params, success, failure) {
        var $request = $.ajax(params);

        $request.then(success);
        $request.fail(failure);

        return $request;
      }
    };

    return $.extend({}, defaults, options, true);
  };

  AjaxAdapter.prototype.processResults = function (results) {
    return results;
  };

  AjaxAdapter.prototype.query = function (params, callback) {
    var matches = [];
    var self = this;

    if (this._request != null) {
      // JSONP requests cannot always be aborted
      if ($.isFunction(this._request.abort)) {
        this._request.abort();
      }

      this._request = null;
    }

    var options = $.extend({
      type: 'GET'
    }, this.ajaxOptions);

    if (typeof options.url === 'function') {
      options.url = options.url.call(this.$element, params);
    }

    if (typeof options.data === 'function') {
      options.data = options.data.call(this.$element, params);
    }

    function request () {
      var $request = options.transport(options, function (data) {
        var results = self.processResults(data, params);

        if (self.options.get('debug') && window.console && console.error) {
          // Check to make sure that the response included a `results` key.
          if (!results || !results.results || !$.isArray(results.results)) {
            console.error(
              'Select2: The AJAX results did not return an array in the ' +
              '`results` key of the response.'
            );
          }
        }

        callback(results);
      }, function () {
        // TODO: Handle AJAX errors
      });

      self._request = $request;
    }

    if (this.ajaxOptions.delay && params.term !== '') {
      if (this._queryTimeout) {
        window.clearTimeout(this._queryTimeout);
      }

      this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
    } else {
      request();
    }
  };

  return AjaxAdapter;
});

S2.define('select2/data/tags',[
  'jquery'
], function ($) {
  function Tags (decorated, $element, options) {
    var tags = options.get('tags');

    var createTag = options.get('createTag');

    if (createTag !== undefined) {
      this.createTag = createTag;
    }

    decorated.call(this, $element, options);

    if ($.isArray(tags)) {
      for (var t = 0; t < tags.length; t++) {
        var tag = tags[t];
        var item = this._normalizeItem(tag);

        var $option = this.option(item);

        this.$element.append($option);
      }
    }
  }

  Tags.prototype.query = function (decorated, params, callback) {
    var self = this;

    this._removeOldTags();

    if (params.term == null || params.page != null) {
      decorated.call(this, params, callback);
      return;
    }

    function wrapper (obj, child) {
      var data = obj.results;

      for (var i = 0; i < data.length; i++) {
        var option = data[i];

        var checkChildren = (
          option.children != null &&
          !wrapper({
            results: option.children
          }, true)
        );

        var checkText = option.text === params.term;

        if (checkText || checkChildren) {
          if (child) {
            return false;
          }

          obj.data = data;
          callback(obj);

          return;
        }
      }

      if (child) {
        return true;
      }

      var tag = self.createTag(params);

      if (tag != null) {
        var $option = self.option(tag);
        $option.attr('data-select2-tag', true);

        self.addOptions([$option]);

        self.insertTag(data, tag);
      }

      obj.results = data;

      callback(obj);
    }

    decorated.call(this, params, wrapper);
  };

  Tags.prototype.createTag = function (decorated, params) {
    var term = $.trim(params.term);

    if (term === '') {
      return null;
    }

    return {
      id: term,
      text: term
    };
  };

  Tags.prototype.insertTag = function (_, data, tag) {
    data.unshift(tag);
  };

  Tags.prototype._removeOldTags = function (_) {
    var tag = this._lastTag;

    var $options = this.$element.find('option[data-select2-tag]');

    $options.each(function () {
      if (this.selected) {
        return;
      }

      $(this).remove();
    });
  };

  return Tags;
});

S2.define('select2/data/tokenizer',[
  'jquery'
], function ($) {
  function Tokenizer (decorated, $element, options) {
    var tokenizer = options.get('tokenizer');

    if (tokenizer !== undefined) {
      this.tokenizer = tokenizer;
    }

    decorated.call(this, $element, options);
  }

  Tokenizer.prototype.bind = function (decorated, container, $container) {
    decorated.call(this, container, $container);

    this.$search =  container.dropdown.$search || container.selection.$search ||
      $container.find('.select2-search__field');
  };

  Tokenizer.prototype.query = function (decorated, params, callback) {
    var self = this;

    function select (data) {
      self.trigger('select', {
        data: data
      });
    }

    params.term = params.term || '';

    var tokenData = this.tokenizer(params, this.options, select);

    if (tokenData.term !== params.term) {
      // Replace the search term if we have the search box
      if (this.$search.length) {
        this.$search.val(tokenData.term);
        this.$search.focus();
      }

      params.term = tokenData.term;
    }

    decorated.call(this, params, callback);
  };

  Tokenizer.prototype.tokenizer = function (_, params, options, callback) {
    var separators = options.get('tokenSeparators') || [];
    var term = params.term;
    var i = 0;

    var createTag = this.createTag || function (params) {
      return {
        id: params.term,
        text: params.term
      };
    };

    while (i < term.length) {
      var termChar = term[i];

      if ($.inArray(termChar, separators) === -1) {
        i++;

        continue;
      }

      var part = term.substr(0, i);
      var partParams = $.extend({}, params, {
        term: part
      });

      var data = createTag(partParams);

      if (data == null) {
        i++;
        continue;
      }

      callback(data);

      // Reset the term to not include the tokenized portion
      term = term.substr(i + 1) || '';
      i = 0;
    }

    return {
      term: term
    };
  };

  return Tokenizer;
});

S2.define('select2/data/minimumInputLength',[

], function () {
  function MinimumInputLength (decorated, $e, options) {
    this.minimumInputLength = options.get('minimumInputLength');

    decorated.call(this, $e, options);
  }

  MinimumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';

    if (params.term.length < this.minimumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooShort',
        args: {
          minimum: this.minimumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MinimumInputLength;
});

S2.define('select2/data/maximumInputLength',[

], function () {
  function MaximumInputLength (decorated, $e, options) {
    this.maximumInputLength = options.get('maximumInputLength');

    decorated.call(this, $e, options);
  }

  MaximumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';

    if (this.maximumInputLength > 0 &&
        params.term.length > this.maximumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooLong',
        args: {
          maximum: this.maximumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MaximumInputLength;
});

S2.define('select2/data/maximumSelectionLength',[

], function (){
  function MaximumSelectionLength (decorated, $e, options) {
    this.maximumSelectionLength = options.get('maximumSelectionLength');

    decorated.call(this, $e, options);
  }

  MaximumSelectionLength.prototype.query =
    function (decorated, params, callback) {
      var self = this;

      this.current(function (currentData) {
        var count = currentData != null ? currentData.length : 0;
        if (self.maximumSelectionLength > 0 &&
          count >= self.maximumSelectionLength) {
          self.trigger('results:message', {
            message: 'maximumSelected',
            args: {
              maximum: self.maximumSelectionLength
            }
          });
          return;
        }
        decorated.call(self, params, callback);
      });
  };

  return MaximumSelectionLength;
});

S2.define('select2/dropdown',[
  'jquery',
  './utils'
], function ($, Utils) {
  function Dropdown ($element, options) {
    this.$element = $element;
    this.options = options;

    Dropdown.__super__.constructor.call(this);
  }

  Utils.Extend(Dropdown, Utils.Observable);

  Dropdown.prototype.render = function () {
    var $dropdown = $(
      '<span class="select2-dropdown">' +
        '<span class="select2-results"></span>' +
      '</span>'
    );

    $dropdown.attr('dir', this.options.get('dir'));

    this.$dropdown = $dropdown;

    return $dropdown;
  };

  Dropdown.prototype.bind = function () {
    // Should be implemented in subclasses
  };

  Dropdown.prototype.position = function ($dropdown, $container) {
    // Should be implmented in subclasses
  };

  Dropdown.prototype.destroy = function () {
    // Remove the dropdown from the DOM
    this.$dropdown.remove();
  };

  return Dropdown;
});

S2.define('select2/dropdown/search',[
  'jquery',
  '../utils'
], function ($, Utils) {
  function Search () { }

  Search.prototype.render = function (decorated) {
    var $rendered = decorated.call(this);

    var $search = $(
      '<span class="select2-search select2-search--dropdown">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off"' +
        ' spellcheck="false" role="textbox" />' +
      '</span>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    $rendered.prepend($search);

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    this.$search.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();
    });

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$search.on('input', function (evt) {
      // Unbind the duplicated `keyup` event
      $(this).off('keyup');
    });

    this.$search.on('keyup input', function (evt) {
      self.handleSearch(evt);
    });

    container.on('open', function () {
      self.$search.attr('tabindex', 0);

      self.$search.focus();

      window.setTimeout(function () {
        self.$search.focus();
      }, 0);
    });

    container.on('close', function () {
      self.$search.attr('tabindex', -1);

      self.$search.val('');
    });

    container.on('results:all', function (params) {
      if (params.query.term == null || params.query.term === '') {
        var showSearch = self.showSearch(params);

        if (showSearch) {
          self.$searchContainer.removeClass('select2-search--hide');
        } else {
          self.$searchContainer.addClass('select2-search--hide');
        }
      }
    });
  };

  Search.prototype.handleSearch = function (evt) {
    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.showSearch = function (_, params) {
    return true;
  };

  return Search;
});

S2.define('select2/dropdown/hidePlaceholder',[

], function () {
  function HidePlaceholder (decorated, $element, options, dataAdapter) {
    this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

    decorated.call(this, $element, options, dataAdapter);
  }

  HidePlaceholder.prototype.append = function (decorated, data) {
    data.results = this.removePlaceholder(data.results);

    decorated.call(this, data);
  };

  HidePlaceholder.prototype.normalizePlaceholder = function (_, placeholder) {
    if (typeof placeholder === 'string') {
      placeholder = {
        id: '',
        text: placeholder
      };
    }

    return placeholder;
  };

  HidePlaceholder.prototype.removePlaceholder = function (_, data) {
    var modifiedData = data.slice(0);

    for (var d = data.length - 1; d >= 0; d--) {
      var item = data[d];

      if (this.placeholder.id === item.id) {
        modifiedData.splice(d, 1);
      }
    }

    return modifiedData;
  };

  return HidePlaceholder;
});

S2.define('select2/dropdown/infiniteScroll',[
  'jquery'
], function ($) {
  function InfiniteScroll (decorated, $element, options, dataAdapter) {
    this.lastParams = {};

    decorated.call(this, $element, options, dataAdapter);

    this.$loadingMore = this.createLoadingMore();
    this.loading = false;
  }

  InfiniteScroll.prototype.append = function (decorated, data) {
    this.$loadingMore.remove();
    this.loading = false;

    decorated.call(this, data);

    if (this.showLoadingMore(data)) {
      this.$results.append(this.$loadingMore);
    }
  };

  InfiniteScroll.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('query', function (params) {
      self.lastParams = params;
      self.loading = true;
    });

    container.on('query:append', function (params) {
      self.lastParams = params;
      self.loading = true;
    });

    this.$results.on('scroll', function () {
      var isLoadMoreVisible = $.contains(
        document.documentElement,
        self.$loadingMore[0]
      );

      if (self.loading || !isLoadMoreVisible) {
        return;
      }

      var currentOffset = self.$results.offset().top +
        self.$results.outerHeight(false);
      var loadingMoreOffset = self.$loadingMore.offset().top +
        self.$loadingMore.outerHeight(false);

      if (currentOffset + 50 >= loadingMoreOffset) {
        self.loadMore();
      }
    });
  };

  InfiniteScroll.prototype.loadMore = function () {
    this.loading = true;

    var params = $.extend({}, {page: 1}, this.lastParams);

    params.page++;

    this.trigger('query:append', params);
  };

  InfiniteScroll.prototype.showLoadingMore = function (_, data) {
    return data.pagination && data.pagination.more;
  };

  InfiniteScroll.prototype.createLoadingMore = function () {
    var $option = $(
      '<li ' +
      'class="select2-results__option select2-results__option--load-more"' +
      'role="treeitem" aria-disabled="true"></li>'
    );

    var message = this.options.get('translations').get('loadingMore');

    $option.html(message(this.lastParams));

    return $option;
  };

  return InfiniteScroll;
});

S2.define('select2/dropdown/attachBody',[
  'jquery',
  '../utils'
], function ($, Utils) {
  function AttachBody (decorated, $element, options) {
    this.$dropdownParent = options.get('dropdownParent') || $(document.body);

    decorated.call(this, $element, options);
  }

  AttachBody.prototype.bind = function (decorated, container, $container) {
    var self = this;

    var setupResultsEvents = false;

    decorated.call(this, container, $container);

    container.on('open', function () {
      self._showDropdown();
      self._attachPositioningHandler(container);

      if (!setupResultsEvents) {
        setupResultsEvents = true;

        container.on('results:all', function () {
          self._positionDropdown();
          self._resizeDropdown();
        });

        container.on('results:append', function () {
          self._positionDropdown();
          self._resizeDropdown();
        });
      }
    });

    container.on('close', function () {
      self._hideDropdown();
      self._detachPositioningHandler(container);
    });

    this.$dropdownContainer.on('mousedown', function (evt) {
      evt.stopPropagation();
    });
  };

  AttachBody.prototype.destroy = function (decorated) {
    decorated.call(this);

    this.$dropdownContainer.remove();
  };

  AttachBody.prototype.position = function (decorated, $dropdown, $container) {
    // Clone all of the container classes
    $dropdown.attr('class', $container.attr('class'));

    $dropdown.removeClass('select2');
    $dropdown.addClass('select2-container--open');

    $dropdown.css({
      position: 'absolute',
      top: -999999
    });

    this.$container = $container;
  };

  AttachBody.prototype.render = function (decorated) {
    var $container = $('<span></span>');

    var $dropdown = decorated.call(this);
    $container.append($dropdown);

    this.$dropdownContainer = $container;

    return $container;
  };

  AttachBody.prototype._hideDropdown = function (decorated) {
    this.$dropdownContainer.detach();
  };

  AttachBody.prototype._attachPositioningHandler =
      function (decorated, container) {
    var self = this;

    var scrollEvent = 'scroll.select2.' + container.id;
    var resizeEvent = 'resize.select2.' + container.id;
    var orientationEvent = 'orientationchange.select2.' + container.id;

    var $watchers = this.$container.parents().filter(Utils.hasScroll);
    $watchers.each(function () {
      $(this).data('select2-scroll-position', {
        x: $(this).scrollLeft(),
        y: $(this).scrollTop()
      });
    });

    $watchers.on(scrollEvent, function (ev) {
      var position = $(this).data('select2-scroll-position');
      $(this).scrollTop(position.y);
    });

    $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent,
      function (e) {
      self._positionDropdown();
      self._resizeDropdown();
    });
  };

  AttachBody.prototype._detachPositioningHandler =
      function (decorated, container) {
    var scrollEvent = 'scroll.select2.' + container.id;
    var resizeEvent = 'resize.select2.' + container.id;
    var orientationEvent = 'orientationchange.select2.' + container.id;

    var $watchers = this.$container.parents().filter(Utils.hasScroll);
    $watchers.off(scrollEvent);

    $(window).off(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent);
  };

  AttachBody.prototype._positionDropdown = function () {
    var $window = $(window);

    var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
    var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');

    var newDirection = null;

    var position = this.$container.position();
    var offset = this.$container.offset();

    offset.bottom = offset.top + this.$container.outerHeight(false);

    var container = {
      height: this.$container.outerHeight(false)
    };

    container.top = offset.top;
    container.bottom = offset.top + container.height;

    var dropdown = {
      height: this.$dropdown.outerHeight(false)
    };

    var viewport = {
      top: $window.scrollTop(),
      bottom: $window.scrollTop() + $window.height()
    };

    var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
    var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

    var css = {
      left: offset.left,
      top: container.bottom
    };

    // Fix positioning with static parents
    if (this.$dropdownParent[0].style.position !== 'static') {
      var parentOffset = this.$dropdownParent.offset();

      css.top -= parentOffset.top;
      css.left -= parentOffset.left;
    }

    if (!isCurrentlyAbove && !isCurrentlyBelow) {
      newDirection = 'below';
    }

    if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
      newDirection = 'above';
    } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
      newDirection = 'below';
    }

    if (newDirection == 'above' ||
      (isCurrentlyAbove && newDirection !== 'below')) {
      css.top = container.top - dropdown.height;
    }

    if (newDirection != null) {
      this.$dropdown
        .removeClass('select2-dropdown--below select2-dropdown--above')
        .addClass('select2-dropdown--' + newDirection);
      this.$container
        .removeClass('select2-container--below select2-container--above')
        .addClass('select2-container--' + newDirection);
    }

    this.$dropdownContainer.css(css);
  };

  AttachBody.prototype._resizeDropdown = function () {
    var css = {
      width: this.$container.outerWidth(false) + 'px'
    };

    if (this.options.get('dropdownAutoWidth')) {
      css.minWidth = css.width;
      css.width = 'auto';
    }

    this.$dropdown.css(css);
  };

  AttachBody.prototype._showDropdown = function (decorated) {
    this.$dropdownContainer.appendTo(this.$dropdownParent);

    this._positionDropdown();
    this._resizeDropdown();
  };

  return AttachBody;
});

S2.define('select2/dropdown/minimumResultsForSearch',[

], function () {
  function countResults (data) {
    var count = 0;

    for (var d = 0; d < data.length; d++) {
      var item = data[d];

      if (item.children) {
        count += countResults(item.children);
      } else {
        count++;
      }
    }

    return count;
  }

  function MinimumResultsForSearch (decorated, $element, options, dataAdapter) {
    this.minimumResultsForSearch = options.get('minimumResultsForSearch');

    if (this.minimumResultsForSearch < 0) {
      this.minimumResultsForSearch = Infinity;
    }

    decorated.call(this, $element, options, dataAdapter);
  }

  MinimumResultsForSearch.prototype.showSearch = function (decorated, params) {
    if (countResults(params.data.results) < this.minimumResultsForSearch) {
      return false;
    }

    return decorated.call(this, params);
  };

  return MinimumResultsForSearch;
});

S2.define('select2/dropdown/selectOnClose',[

], function () {
  function SelectOnClose () { }

  SelectOnClose.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('close', function () {
      self._handleSelectOnClose();
    });
  };

  SelectOnClose.prototype._handleSelectOnClose = function () {
    var $highlightedResults = this.getHighlightedResults();

    // Only select highlighted results
    if ($highlightedResults.length < 1) {
      return;
    }

    var data = $highlightedResults.data('data');

    // Don't re-select already selected resulte
    if (
      (data.element != null && data.element.selected) ||
      (data.element == null && data.selected)
    ) {
      return;
    }

    this.trigger('select', {
        data: data
    });
  };

  return SelectOnClose;
});

S2.define('select2/dropdown/closeOnSelect',[

], function () {
  function CloseOnSelect () { }

  CloseOnSelect.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('select', function (evt) {
      self._selectTriggered(evt);
    });

    container.on('unselect', function (evt) {
      self._selectTriggered(evt);
    });
  };

  CloseOnSelect.prototype._selectTriggered = function (_, evt) {
    var originalEvent = evt.originalEvent;

    // Don't close if the control key is being held
    if (originalEvent && originalEvent.ctrlKey) {
      return;
    }

    this.trigger('close', {});
  };

  return CloseOnSelect;
});

S2.define('select2/i18n/en',[],function () {
  // English
  return {
    errorLoading: function () {
      return 'The results could not be loaded.';
    },
    inputTooLong: function (args) {
      var overChars = args.input.length - args.maximum;

      var message = 'Please delete ' + overChars + ' character';

      if (overChars != 1) {
        message += 's';
      }

      return message;
    },
    inputTooShort: function (args) {
      var remainingChars = args.minimum - args.input.length;

      var message = 'Please enter ' + remainingChars + ' or more characters';

      return message;
    },
    loadingMore: function () {
      return 'Loading more results…';
    },
    maximumSelected: function (args) {
      var message = 'You can only select ' + args.maximum + ' item';

      if (args.maximum != 1) {
        message += 's';
      }

      return message;
    },
    noResults: function () {
      return 'No results found';
    },
    searching: function () {
      return 'Searching…';
    }
  };
});

S2.define('select2/defaults',[
  'jquery',
  'require',

  './results',

  './selection/single',
  './selection/multiple',
  './selection/placeholder',
  './selection/allowClear',
  './selection/search',
  './selection/eventRelay',

  './utils',
  './translation',
  './diacritics',

  './data/select',
  './data/array',
  './data/ajax',
  './data/tags',
  './data/tokenizer',
  './data/minimumInputLength',
  './data/maximumInputLength',
  './data/maximumSelectionLength',

  './dropdown',
  './dropdown/search',
  './dropdown/hidePlaceholder',
  './dropdown/infiniteScroll',
  './dropdown/attachBody',
  './dropdown/minimumResultsForSearch',
  './dropdown/selectOnClose',
  './dropdown/closeOnSelect',

  './i18n/en'
], function ($, require,

             ResultsList,

             SingleSelection, MultipleSelection, Placeholder, AllowClear,
             SelectionSearch, EventRelay,

             Utils, Translation, DIACRITICS,

             SelectData, ArrayData, AjaxData, Tags, Tokenizer,
             MinimumInputLength, MaximumInputLength, MaximumSelectionLength,

             Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll,
             AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect,

             EnglishTranslation) {
  function Defaults () {
    this.reset();
  }

  Defaults.prototype.apply = function (options) {
    options = $.extend({}, this.defaults, options);

    if (options.dataAdapter == null) {
      if (options.ajax != null) {
        options.dataAdapter = AjaxData;
      } else if (options.data != null) {
        options.dataAdapter = ArrayData;
      } else {
        options.dataAdapter = SelectData;
      }

      if (options.minimumInputLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MinimumInputLength
        );
      }

      if (options.maximumInputLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MaximumInputLength
        );
      }

      if (options.maximumSelectionLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MaximumSelectionLength
        );
      }

      if (options.tags) {
        options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
      }

      if (options.tokenSeparators != null || options.tokenizer != null) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          Tokenizer
        );
      }

      if (options.query != null) {
        var Query = require(options.amdBase + 'compat/query');

        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          Query
        );
      }

      if (options.initSelection != null) {
        var InitSelection = require(options.amdBase + 'compat/initSelection');

        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          InitSelection
        );
      }
    }

    if (options.resultsAdapter == null) {
      options.resultsAdapter = ResultsList;

      if (options.ajax != null) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          InfiniteScroll
        );
      }

      if (options.placeholder != null) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          HidePlaceholder
        );
      }

      if (options.selectOnClose) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          SelectOnClose
        );
      }
    }

    if (options.dropdownAdapter == null) {
      if (options.multiple) {
        options.dropdownAdapter = Dropdown;
      } else {
        var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);

        options.dropdownAdapter = SearchableDropdown;
      }

      if (options.minimumResultsForSearch !== 0) {
        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          MinimumResultsForSearch
        );
      }

      if (options.closeOnSelect) {
        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          CloseOnSelect
        );
      }

      if (
        options.dropdownCssClass != null ||
        options.dropdownCss != null ||
        options.adaptDropdownCssClass != null
      ) {
        var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');

        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          DropdownCSS
        );
      }

      options.dropdownAdapter = Utils.Decorate(
        options.dropdownAdapter,
        AttachBody
      );
    }

    if (options.selectionAdapter == null) {
      if (options.multiple) {
        options.selectionAdapter = MultipleSelection;
      } else {
        options.selectionAdapter = SingleSelection;
      }

      // Add the placeholder mixin if a placeholder was specified
      if (options.placeholder != null) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          Placeholder
        );
      }

      if (options.allowClear) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          AllowClear
        );
      }

      if (options.multiple) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          SelectionSearch
        );
      }

      if (
        options.containerCssClass != null ||
        options.containerCss != null ||
        options.adaptContainerCssClass != null
      ) {
        var ContainerCSS = require(options.amdBase + 'compat/containerCss');

        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          ContainerCSS
        );
      }

      options.selectionAdapter = Utils.Decorate(
        options.selectionAdapter,
        EventRelay
      );
    }

    if (typeof options.language === 'string') {
      // Check if the language is specified with a region
      if (options.language.indexOf('-') > 0) {
        // Extract the region information if it is included
        var languageParts = options.language.split('-');
        var baseLanguage = languageParts[0];

        options.language = [options.language, baseLanguage];
      } else {
        options.language = [options.language];
      }
    }

    if ($.isArray(options.language)) {
      var languages = new Translation();
      options.language.push('en');

      var languageNames = options.language;

      for (var l = 0; l < languageNames.length; l++) {
        var name = languageNames[l];
        var language = {};

        try {
          // Try to load it with the original name
          language = Translation.loadPath(name);
        } catch (e) {
          try {
            // If we couldn't load it, check if it wasn't the full path
            name = this.defaults.amdLanguageBase + name;
            language = Translation.loadPath(name);
          } catch (ex) {
            // The translation could not be loaded at all. Sometimes this is
            // because of a configuration problem, other times this can be
            // because of how Select2 helps load all possible translation files.
            if (options.debug && window.console && console.warn) {
              console.warn(
                'Select2: The language file for "' + name + '" could not be ' +
                'automatically loaded. A fallback will be used instead.'
              );
            }

            continue;
          }
        }

        languages.extend(language);
      }

      options.translations = languages;
    } else {
      var baseTranslation = Translation.loadPath(
        this.defaults.amdLanguageBase + 'en'
      );
      var customTranslation = new Translation(options.language);

      customTranslation.extend(baseTranslation);

      options.translations = customTranslation;
    }

    return options;
  };

  Defaults.prototype.reset = function () {
    function stripDiacritics (text) {
      // Used 'uni range + named function' from http://jsperf.com/diacritics/18
      function match(a) {
        return DIACRITICS[a] || a;
      }

      return text.replace(/[^\u0000-\u007E]/g, match);
    }

    function matcher (params, data) {
      // Always return the object if there is nothing to compare
      if ($.trim(params.term) === '') {
        return data;
      }

      // Do a recursive check for options with children
      if (data.children && data.children.length > 0) {
        // Clone the data object if there are children
        // This is required as we modify the object to remove any non-matches
        var match = $.extend(true, {}, data);

        // Check each child of the option
        for (var c = data.children.length - 1; c >= 0; c--) {
          var child = data.children[c];

          var matches = matcher(params, child);

          // If there wasn't a match, remove the object in the array
          if (matches == null) {
            match.children.splice(c, 1);
          }
        }

        // If any children matched, return the new object
        if (match.children.length > 0) {
          return match;
        }

        // If there were no matching children, check just the plain object
        return matcher(params, match);
      }

      var original = stripDiacritics(data.text).toUpperCase();
      var term = stripDiacritics(params.term).toUpperCase();

      // Check if the text contains the term
      if (original.indexOf(term) > -1) {
        return data;
      }

      // If it doesn't contain the term, don't return anything
      return null;
    }

    this.defaults = {
      amdBase: './',
      amdLanguageBase: './i18n/',
      closeOnSelect: true,
      debug: false,
      dropdownAutoWidth: false,
      escapeMarkup: Utils.escapeMarkup,
      language: EnglishTranslation,
      matcher: matcher,
      minimumInputLength: 0,
      maximumInputLength: 0,
      maximumSelectionLength: 0,
      minimumResultsForSearch: 0,
      selectOnClose: false,
      sorter: function (data) {
        return data;
      },
      templateResult: function (result) {
        return result.text;
      },
      templateSelection: function (selection) {
        return selection.text;
      },
      theme: 'default',
      width: 'resolve'
    };
  };

  Defaults.prototype.set = function (key, value) {
    var camelKey = $.camelCase(key);

    var data = {};
    data[camelKey] = value;

    var convertedData = Utils._convertData(data);

    $.extend(this.defaults, convertedData);
  };

  var defaults = new Defaults();

  return defaults;
});

S2.define('select2/options',[
  'require',
  'jquery',
  './defaults',
  './utils'
], function (require, $, Defaults, Utils) {
  function Options (options, $element) {
    this.options = options;

    if ($element != null) {
      this.fromElement($element);
    }

    this.options = Defaults.apply(this.options);

    if ($element && $element.is('input')) {
      var InputCompat = require(this.get('amdBase') + 'compat/inputData');

      this.options.dataAdapter = Utils.Decorate(
        this.options.dataAdapter,
        InputCompat
      );
    }
  }

  Options.prototype.fromElement = function ($e) {
    var excludedData = ['select2'];

    if (this.options.multiple == null) {
      this.options.multiple = $e.prop('multiple');
    }

    if (this.options.disabled == null) {
      this.options.disabled = $e.prop('disabled');
    }

    if (this.options.language == null) {
      if ($e.prop('lang')) {
        this.options.language = $e.prop('lang').toLowerCase();
      } else if ($e.closest('[lang]').prop('lang')) {
        this.options.language = $e.closest('[lang]').prop('lang');
      }
    }

    if (this.options.dir == null) {
      if ($e.prop('dir')) {
        this.options.dir = $e.prop('dir');
      } else if ($e.closest('[dir]').prop('dir')) {
        this.options.dir = $e.closest('[dir]').prop('dir');
      } else {
        this.options.dir = 'ltr';
      }
    }

    $e.prop('disabled', this.options.disabled);
    $e.prop('multiple', this.options.multiple);

    if ($e.data('select2Tags')) {
      if (this.options.debug && window.console && console.warn) {
        console.warn(
          'Select2: The `data-select2-tags` attribute has been changed to ' +
          'use the `data-data` and `data-tags="true"` attributes and will be ' +
          'removed in future versions of Select2.'
        );
      }

      $e.data('data', $e.data('select2Tags'));
      $e.data('tags', true);
    }

    if ($e.data('ajaxUrl')) {
      if (this.options.debug && window.console && console.warn) {
        console.warn(
          'Select2: The `data-ajax-url` attribute has been changed to ' +
          '`data-ajax--url` and support for the old attribute will be removed' +
          ' in future versions of Select2.'
        );
      }

      $e.attr('ajax--url', $e.data('ajaxUrl'));
      $e.data('ajax--url', $e.data('ajaxUrl'));
    }

    var dataset = {};

    // Prefer the element's `dataset` attribute if it exists
    // jQuery 1.x does not correctly handle data attributes with multiple dashes
    if ($.fn.jquery && $.fn.jquery.substr(0, 2) == '1.' && $e[0].dataset) {
      dataset = $.extend(true, {}, $e[0].dataset, $e.data());
    } else {
      dataset = $e.data();
    }

    var data = $.extend(true, {}, dataset);

    data = Utils._convertData(data);

    for (var key in data) {
      if ($.inArray(key, excludedData) > -1) {
        continue;
      }

      if ($.isPlainObject(this.options[key])) {
        $.extend(this.options[key], data[key]);
      } else {
        this.options[key] = data[key];
      }
    }

    return this;
  };

  Options.prototype.get = function (key) {
    return this.options[key];
  };

  Options.prototype.set = function (key, val) {
    this.options[key] = val;
  };

  return Options;
});

S2.define('select2/core',[
  'jquery',
  './options',
  './utils',
  './keys'
], function ($, Options, Utils, KEYS) {
  var Select2 = function ($element, options) {
    if ($element.data('select2') != null) {
      $element.data('select2').destroy();
    }

    this.$element = $element;

    this.id = this._generateId($element);

    options = options || {};

    this.options = new Options(options, $element);

    Select2.__super__.constructor.call(this);

    // Set up the tabindex

    var tabindex = $element.attr('tabindex') || 0;
    $element.data('old-tabindex', tabindex);
    $element.attr('tabindex', '-1');

    // Set up containers and adapters

    var DataAdapter = this.options.get('dataAdapter');
    this.dataAdapter = new DataAdapter($element, this.options);

    var $container = this.render();

    this._placeContainer($container);

    var SelectionAdapter = this.options.get('selectionAdapter');
    this.selection = new SelectionAdapter($element, this.options);
    this.$selection = this.selection.render();

    this.selection.position(this.$selection, $container);

    var DropdownAdapter = this.options.get('dropdownAdapter');
    this.dropdown = new DropdownAdapter($element, this.options);
    this.$dropdown = this.dropdown.render();

    this.dropdown.position(this.$dropdown, $container);

    var ResultsAdapter = this.options.get('resultsAdapter');
    this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
    this.$results = this.results.render();

    this.results.position(this.$results, this.$dropdown);

    // Bind events

    var self = this;

    // Bind the container to all of the adapters
    this._bindAdapters();

    // Register any DOM event handlers
    this._registerDomEvents();

    // Register any internal event handlers
    this._registerDataEvents();
    this._registerSelectionEvents();
    this._registerDropdownEvents();
    this._registerResultsEvents();
    this._registerEvents();

    // Set the initial state
    this.dataAdapter.current(function (initialData) {
      self.trigger('selection:update', {
        data: initialData
      });
    });

    // Hide the original select
    $element.addClass('select2-hidden-accessible');
    $element.attr('aria-hidden', 'true');

    // Synchronize any monitored attributes
    this._syncAttributes();

    $element.data('select2', this);
  };

  Utils.Extend(Select2, Utils.Observable);

  Select2.prototype._generateId = function ($element) {
    var id = '';

    if ($element.attr('id') != null) {
      id = $element.attr('id');
    } else if ($element.attr('name') != null) {
      id = $element.attr('name') + '-' + Utils.generateChars(2);
    } else {
      id = Utils.generateChars(4);
    }

    id = 'select2-' + id;

    return id;
  };

  Select2.prototype._placeContainer = function ($container) {
    $container.insertAfter(this.$element);

    var width = this._resolveWidth(this.$element, this.options.get('width'));

    if (width != null) {
      $container.css('width', width);
    }
  };

  Select2.prototype._resolveWidth = function ($element, method) {
    var WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;

    if (method == 'resolve') {
      var styleWidth = this._resolveWidth($element, 'style');

      if (styleWidth != null) {
        return styleWidth;
      }

      return this._resolveWidth($element, 'element');
    }

    if (method == 'element') {
      var elementWidth = $element.outerWidth(false);

      if (elementWidth <= 0) {
        return 'auto';
      }

      return elementWidth + 'px';
    }

    if (method == 'style') {
      var style = $element.attr('style');

      if (typeof(style) !== 'string') {
        return null;
      }

      var attrs = style.split(';');

      for (var i = 0, l = attrs.length; i < l; i = i + 1) {
        var attr = attrs[i].replace(/\s/g, '');
        var matches = attr.match(WIDTH);

        if (matches !== null && matches.length >= 1) {
          return matches[1];
        }
      }

      return null;
    }

    return method;
  };

  Select2.prototype._bindAdapters = function () {
    this.dataAdapter.bind(this, this.$container);
    this.selection.bind(this, this.$container);

    this.dropdown.bind(this, this.$container);
    this.results.bind(this, this.$container);
  };

  Select2.prototype._registerDomEvents = function () {
    var self = this;

    this.$element.on('change.select2', function () {
      self.dataAdapter.current(function (data) {
        self.trigger('selection:update', {
          data: data
        });
      });
    });

    this._sync = Utils.bind(this._syncAttributes, this);

    if (this.$element[0].attachEvent) {
      this.$element[0].attachEvent('onpropertychange', this._sync);
    }

    var observer = window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver
    ;

    if (observer != null) {
      this._observer = new observer(function (mutations) {
        $.each(mutations, self._sync);
      });
      this._observer.observe(this.$element[0], {
        attributes: true,
        subtree: false
      });
    } else if (this.$element[0].addEventListener) {
      this.$element[0].addEventListener('DOMAttrModified', self._sync, false);
    }
  };

  Select2.prototype._registerDataEvents = function () {
    var self = this;

    this.dataAdapter.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerSelectionEvents = function () {
    var self = this;
    var nonRelayEvents = ['toggle', 'focus'];

    this.selection.on('toggle', function () {
      self.toggleDropdown();
    });

    this.selection.on('focus', function (params) {
      self.focus(params);
    });

    this.selection.on('*', function (name, params) {
      if ($.inArray(name, nonRelayEvents) !== -1) {
        return;
      }

      self.trigger(name, params);
    });
  };

  Select2.prototype._registerDropdownEvents = function () {
    var self = this;

    this.dropdown.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerResultsEvents = function () {
    var self = this;

    this.results.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerEvents = function () {
    var self = this;

    this.on('open', function () {
      self.$container.addClass('select2-container--open');
    });

    this.on('close', function () {
      self.$container.removeClass('select2-container--open');
    });

    this.on('enable', function () {
      self.$container.removeClass('select2-container--disabled');
    });

    this.on('disable', function () {
      self.$container.addClass('select2-container--disabled');
    });

    this.on('blur', function () {
      self.$container.removeClass('select2-container--focus');
    });

    this.on('query', function (params) {
      if (!self.isOpen()) {
        self.trigger('open', {});
      }

      this.dataAdapter.query(params, function (data) {
        self.trigger('results:all', {
          data: data,
          query: params
        });
      });
    });

    this.on('query:append', function (params) {
      this.dataAdapter.query(params, function (data) {
        self.trigger('results:append', {
          data: data,
          query: params
        });
      });
    });

    this.on('keypress', function (evt) {
      var key = evt.which;

      if (self.isOpen()) {
        if (key === KEYS.ESC || key === KEYS.TAB ||
            (key === KEYS.UP && evt.altKey)) {
          self.close();

          evt.preventDefault();
        } else if (key === KEYS.ENTER) {
          self.trigger('results:select', {});

          evt.preventDefault();
        } else if ((key === KEYS.SPACE && evt.ctrlKey)) {
          self.trigger('results:toggle', {});

          evt.preventDefault();
        } else if (key === KEYS.UP) {
          self.trigger('results:previous', {});

          evt.preventDefault();
        } else if (key === KEYS.DOWN) {
          self.trigger('results:next', {});

          evt.preventDefault();
        }
      } else {
        if (key === KEYS.ENTER || key === KEYS.SPACE ||
            (key === KEYS.DOWN && evt.altKey)) {
          self.open();

          evt.preventDefault();
        }
      }
    });
  };

  Select2.prototype._syncAttributes = function () {
    this.options.set('disabled', this.$element.prop('disabled'));

    if (this.options.get('disabled')) {
      if (this.isOpen()) {
        this.close();
      }

      this.trigger('disable', {});
    } else {
      this.trigger('enable', {});
    }
  };

  /**
   * Override the trigger method to automatically trigger pre-events when
   * there are events that can be prevented.
   */
  Select2.prototype.trigger = function (name, args) {
    var actualTrigger = Select2.__super__.trigger;
    var preTriggerMap = {
      'open': 'opening',
      'close': 'closing',
      'select': 'selecting',
      'unselect': 'unselecting'
    };

    if (args === undefined) {
      args = {};
    }

    if (name in preTriggerMap) {
      var preTriggerName = preTriggerMap[name];
      var preTriggerArgs = {
        prevented: false,
        name: name,
        args: args
      };

      actualTrigger.call(this, preTriggerName, preTriggerArgs);

      if (preTriggerArgs.prevented) {
        args.prevented = true;

        return;
      }
    }

    actualTrigger.call(this, name, args);
  };

  Select2.prototype.toggleDropdown = function () {
    if (this.options.get('disabled')) {
      return;
    }

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  };

  Select2.prototype.open = function () {
    if (this.isOpen()) {
      return;
    }

    this.trigger('query', {});
  };

  Select2.prototype.close = function () {
    if (!this.isOpen()) {
      return;
    }

    this.trigger('close', {});
  };

  Select2.prototype.isOpen = function () {
    return this.$container.hasClass('select2-container--open');
  };

  Select2.prototype.hasFocus = function () {
    return this.$container.hasClass('select2-container--focus');
  };

  Select2.prototype.focus = function (data) {
    // No need to re-trigger focus events if we are already focused
    if (this.hasFocus()) {
      return;
    }

    this.$container.addClass('select2-container--focus');
    this.trigger('focus', {});
  };

  Select2.prototype.enable = function (args) {
    if (this.options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `select2("enable")` method has been deprecated and will' +
        ' be removed in later Select2 versions. Use $element.prop("disabled")' +
        ' instead.'
      );
    }

    if (args == null || args.length === 0) {
      args = [true];
    }

    var disabled = !args[0];

    this.$element.prop('disabled', disabled);
  };

  Select2.prototype.data = function () {
    if (this.options.get('debug') &&
        arguments.length > 0 && window.console && console.warn) {
      console.warn(
        'Select2: Data can no longer be set using `select2("data")`. You ' +
        'should consider setting the value instead using `$element.val()`.'
      );
    }

    var data = [];

    this.dataAdapter.current(function (currentData) {
      data = currentData;
    });

    return data;
  };

  Select2.prototype.val = function (args) {
    if (this.options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `select2("val")` method has been deprecated and will be' +
        ' removed in later Select2 versions. Use $element.val() instead.'
      );
    }

    if (args == null || args.length === 0) {
      return this.$element.val();
    }

    var newVal = args[0];

    if ($.isArray(newVal)) {
      newVal = $.map(newVal, function (obj) {
        return obj.toString();
      });
    }

    this.$element.val(newVal).trigger('change');
  };

  Select2.prototype.destroy = function () {
    this.$container.remove();

    if (this.$element[0].detachEvent) {
      this.$element[0].detachEvent('onpropertychange', this._sync);
    }

    if (this._observer != null) {
      this._observer.disconnect();
      this._observer = null;
    } else if (this.$element[0].removeEventListener) {
      this.$element[0]
        .removeEventListener('DOMAttrModified', this._sync, false);
    }

    this._sync = null;

    this.$element.off('.select2');
    this.$element.attr('tabindex', this.$element.data('old-tabindex'));

    this.$element.removeClass('select2-hidden-accessible');
    this.$element.attr('aria-hidden', 'false');
    this.$element.removeData('select2');

    this.dataAdapter.destroy();
    this.selection.destroy();
    this.dropdown.destroy();
    this.results.destroy();

    this.dataAdapter = null;
    this.selection = null;
    this.dropdown = null;
    this.results = null;
  };

  Select2.prototype.render = function () {
    var $container = $(
      '<span class="select2 select2-container">' +
        '<span class="selection"></span>' +
        '<span class="dropdown-wrapper" aria-hidden="true"></span>' +
      '</span>'
    );

    $container.attr('dir', this.options.get('dir'));

    this.$container = $container;

    this.$container.addClass('select2-container--' + this.options.get('theme'));

    $container.data('element', this.$element);

    return $container;
  };

  return Select2;
});

S2.define('jquery-mousewheel',[
  'jquery'
], function ($) {
  // Used to shim jQuery.mousewheel for non-full builds.
  return $;
});

S2.define('jquery.select2',[
  'jquery',
  'jquery-mousewheel',

  './select2/core',
  './select2/defaults'
], function ($, _, Select2, Defaults) {
  if ($.fn.select2 == null) {
    // All methods that should return the element
    var thisMethods = ['open', 'close', 'destroy'];

    $.fn.select2 = function (options) {
      options = options || {};

      if (typeof options === 'object') {
        this.each(function () {
          var instanceOptions = $.extend(true, {}, options);

          var instance = new Select2($(this), instanceOptions);
        });

        return this;
      } else if (typeof options === 'string') {
        var ret;

        this.each(function () {
          var instance = $(this).data('select2');

          if (instance == null && window.console && console.error) {
            console.error(
              'The select2(\'' + options + '\') method was called on an ' +
              'element that is not using Select2.'
            );
          }

          var args = Array.prototype.slice.call(arguments, 1);

          ret = instance[options].apply(instance, args);
        });

        // Check if we should be returning `this`
        if ($.inArray(options, thisMethods) > -1) {
          return this;
        }

        return ret;
      } else {
        throw new Error('Invalid arguments for Select2: ' + options);
      }
    };
  }

  if ($.fn.select2.defaults == null) {
    $.fn.select2.defaults = Defaults;
  }

  return Select2;
});

  // Return the AMD loader configuration so it can be used outside of this file
  return {
    define: S2.define,
    require: S2.require
  };
}());

  // Autoload the jQuery bindings
  // We know that all of the modules exist above this, so we're safe
  var select2 = S2.require('jquery.select2');

  // Hold the AMD module references on the jQuery function that was just loaded
  // This allows Select2 to use the internal loader outside of this file, such
  // as in the language files.
  jQuery.fn.select2.amd = S2;

  // Return the Select2 instance for anyone who is importing it.
  return select2;
}));

/*
* Project: Bootstrap Notify = v3.1.3
* Description: Turns standard Bootstrap alerts into "Growl-like" notifications.
* Author: Mouse0270 aka Robert McIntosh
* License: MIT License
* Website: https://github.com/mouse0270/bootstrap-growl
*/
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	// Create the defaults once
	var defaults = {
			element: 'body',
			position: null,
			type: "info",
			allow_dismiss: true,
			newest_on_top: false,
			showProgressbar: false,
			placement: {
				from: "top",
				align: "right"
			},
			offset: 20,
			spacing: 10,
			z_index: 1031,
			delay: 5000,
			timer: 1000,
			url_target: '_blank',
			mouse_over: null,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},
			onShow: null,
			onShown: null,
			onClose: null,
			onClosed: null,
			icon_type: 'class',
			template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
		};

	String.format = function() {
		var str = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace(RegExp("\\{" + (i - 1) + "\\}", "gm"), arguments[i]);
		}
		return str;
	};

	function Notify ( element, content, options ) {
		// Setup Content of Notify
		var content = {
			content: {
				message: typeof content == 'object' ? content.message : content,
				title: content.title ? content.title : '',
				icon: content.icon ? content.icon : '',
				url: content.url ? content.url : '#',
				target: content.target ? content.target : '-'
			}
		};

		options = $.extend(true, {}, content, options);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		if (this.settings.content.target == "-") {
			this.settings.content.target = this.settings.url_target;
		}
		this.animations = {
			start: 'webkitAnimationStart oanimationstart MSAnimationStart animationstart',
			end: 'webkitAnimationEnd oanimationend MSAnimationEnd animationend'
		}

		if (typeof this.settings.offset == 'number') {
		    this.settings.offset = {
		    	x: this.settings.offset,
		    	y: this.settings.offset
		    };
		}

		this.init();
	};

	$.extend(Notify.prototype, {
		init: function () {
			var self = this;

			this.buildNotify();
			if (this.settings.content.icon) {
				this.setIcon();
			}
			if (this.settings.content.url != "#") {
				this.styleURL();
			}
			this.styleDismiss();
			this.placement();
			this.bind();

			this.notify = {
				$ele: this.$ele,
				update: function(command, update) {
					var commands = {};
					if (typeof command == "string") {
						commands[command] = update;
					}else{
						commands = command;
					}
					for (var command in commands) {
						switch (command) {
							case "type":
								this.$ele.removeClass('alert-' + self.settings.type);
								this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass('progress-bar-' + self.settings.type);
								self.settings.type = commands[command];
								this.$ele.addClass('alert-' + commands[command]).find('[data-notify="progressbar"] > .progress-bar').addClass('progress-bar-' + commands[command]);
								break;
							case "icon":
								var $icon = this.$ele.find('[data-notify="icon"]');
								if (self.settings.icon_type.toLowerCase() == 'class') {
									$icon.removeClass(self.settings.content.icon).addClass(commands[command]);
								}else{
									if (!$icon.is('img')) {
										$icon.find('img');
									}
									$icon.attr('src', commands[command]);
								}
								break;
							case "progress":
								var newDelay = self.settings.delay - (self.settings.delay * (commands[command] / 100));
								this.$ele.data('notify-delay', newDelay);
								this.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', commands[command]).css('width', commands[command] + '%');
								break;
							case "url":
								this.$ele.find('[data-notify="url"]').attr('href', commands[command]);
								break;
							case "target":
								this.$ele.find('[data-notify="url"]').attr('target', commands[command]);
								break;
							default:
								this.$ele.find('[data-notify="' + command +'"]').html(commands[command]);
						};
					}
					var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
					self.reposition(posX);
				},
				close: function() {
					self.close();
				}
			};
		},
		buildNotify: function () {
			var content = this.settings.content;
			this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target));
			this.$ele.attr('data-notify-position', this.settings.placement.from + '-' + this.settings.placement.align);
			if (!this.settings.allow_dismiss) {
				this.$ele.find('[data-notify="dismiss"]').css('display', 'none');
			}
			if ((this.settings.delay <= 0 && !this.settings.showProgressbar) || !this.settings.showProgressbar) {
				this.$ele.find('[data-notify="progressbar"]').remove();
			}
		},
		setIcon: function() {
			if (this.settings.icon_type.toLowerCase() == 'class') {
				this.$ele.find('[data-notify="icon"]').addClass(this.settings.content.icon);
			}else{
				if (this.$ele.find('[data-notify="icon"]').is('img')) {
					this.$ele.find('[data-notify="icon"]').attr('src', this.settings.content.icon);
				}else{
					this.$ele.find('[data-notify="icon"]').append('<img src="'+this.settings.content.icon+'" alt="Notify Icon" />');
				}
			}
		},
		styleDismiss: function() {
			this.$ele.find('[data-notify="dismiss"]').css({
				position: 'absolute',
				right: '10px',
				top: '5px',
				zIndex: this.settings.z_index + 2
			});
		},
		styleURL: function() {
			this.$ele.find('[data-notify="url"]').css({
				backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)',
				height: '100%',
				left: '0px',
				position: 'absolute',
				top: '0px',
				width: '100%',
				zIndex: this.settings.z_index + 1
			});
		},
		placement: function() {
			var self = this,
				offsetAmt = this.settings.offset.y,
				css = {
					display: 'inline-block',
					margin: '0px auto',
					position: this.settings.position ?  this.settings.position : (this.settings.element === 'body' ? 'fixed' : 'absolute'),
					transition: 'all .5s ease-in-out',
					zIndex: this.settings.z_index
				},
				hasAnimation = false,
				settings = this.settings;

			$('[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])').each(function() {
				return offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) +  parseInt($(this).outerHeight()) +  parseInt(settings.spacing));
			});
			if (this.settings.newest_on_top == true) {
				offsetAmt = this.settings.offset.y;
			}
			css[this.settings.placement.from] = offsetAmt+'px';

			switch (this.settings.placement.align) {
				case "left":
				case "right":
					css[this.settings.placement.align] = this.settings.offset.x+'px';
					break;
				case "center":
					css.left = 0;
					css.right = 0;
					break;
			}
			this.$ele.css(css).addClass(this.settings.animate.enter);
			$.each(Array('webkit-', 'moz-', 'o-', 'ms-', ''), function(index, prefix) {
				self.$ele[0].style[prefix+'AnimationIterationCount'] = 1;
			});

			$(this.settings.element).append(this.$ele);

			if (this.settings.newest_on_top == true) {
				offsetAmt = (parseInt(offsetAmt)+parseInt(this.settings.spacing)) + this.$ele.outerHeight();
				this.reposition(offsetAmt);
			}

			if ($.isFunction(self.settings.onShow)) {
				self.settings.onShow.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function(event) {
				hasAnimation = true;
			}).one(this.animations.end, function(event) {
				if ($.isFunction(self.settings.onShown)) {
					self.settings.onShown.call(this);
				}
			});

			setTimeout(function() {
				if (!hasAnimation) {
					if ($.isFunction(self.settings.onShown)) {
						self.settings.onShown.call(this);
					}
				}
			}, 600);
		},
		bind: function() {
			var self = this;

			this.$ele.find('[data-notify="dismiss"]').on('click', function() {
				self.close();
			})

			this.$ele.mouseover(function(e) {
				$(this).data('data-hover', "true");
			}).mouseout(function(e) {
				$(this).data('data-hover', "false");
			});
			this.$ele.data('data-hover', "false");

			if (this.settings.delay > 0) {
				self.$ele.data('notify-delay', self.settings.delay);
				var timer = setInterval(function() {
					var delay = parseInt(self.$ele.data('notify-delay')) - self.settings.timer;
					if ((self.$ele.data('data-hover') === 'false' && self.settings.mouse_over == "pause") || self.settings.mouse_over != "pause") {
						var percent = ((self.settings.delay - delay) / self.settings.delay) * 100;
						self.$ele.data('notify-delay', delay);
						self.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', percent).css('width', percent + '%');
					}
					if (delay <= -(self.settings.timer)) {
						clearInterval(timer);
						self.close();
					}
				}, self.settings.timer);
			}
		},
		close: function() {
			var self = this,
				$successors = null,
				posX = parseInt(this.$ele.css(this.settings.placement.from)),
				hasAnimation = false;

			this.$ele.data('closing', 'true').addClass(this.settings.animate.exit);
			self.reposition(posX);

			if ($.isFunction(self.settings.onClose)) {
				self.settings.onClose.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function(event) {
				hasAnimation = true;
			}).one(this.animations.end, function(event) {
				$(this).remove();
				if ($.isFunction(self.settings.onClosed)) {
					self.settings.onClosed.call(this);
				}
			});

			setTimeout(function() {
				if (!hasAnimation) {
					self.$ele.remove();
					if (self.settings.onClosed) {
						self.settings.onClosed(self.$ele);
					}
				}
			}, 600);
		},
		reposition: function(posX) {
			var self = this,
				notifies = '[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])',
				$elements = this.$ele.nextAll(notifies);
			if (this.settings.newest_on_top == true) {
				$elements = this.$ele.prevAll(notifies);
			}
			$elements.each(function() {
				$(this).css(self.settings.placement.from, posX);
				posX = (parseInt(posX)+parseInt(self.settings.spacing)) + $(this).outerHeight();
			});
		}
	});

	$.notify = function ( content, options ) {
		var plugin = new Notify( this, content, options );
		return plugin.notify;
	};
	$.notifyDefaults = function( options ) {
		defaults = $.extend(true, {}, defaults, options);
		return defaults;
	};
	$.notifyClose = function( command ) {
		if (typeof command === "undefined" || command == "all") {
			$('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
		}else{
			$('[data-notify-position="'+command+'"]').find('[data-notify="dismiss"]').trigger('click');
		}
	};

}));

/*
Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.md or http://ckeditor.com/license
*/
(function(){if(window.CKEDITOR&&window.CKEDITOR.dom)return;window.CKEDITOR||(window.CKEDITOR=function(){var a=/(^|.*[\\\/])ckeditor\.js(?:\?.*|;.*)?$/i,d={timestamp:"FACH",version:"4.5.5",revision:"b34ea4d",rnd:Math.floor(900*Math.random())+100,_:{pending:[],basePathSrcPattern:a},status:"unloaded",basePath:function(){var b=window.CKEDITOR_BASEPATH||"";if(!b)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var l=c[d].src.match(a);if(l){b=l[1];break}}-1==b.indexOf(":/")&&"//"!=b.slice(0,2)&&(b=0===b.indexOf("/")?location.href.match(/^.*?:\/\/[^\/]*/)[0]+
b:location.href.match(/^[^\?]*\/(?:)/)[0]+b);if(!b)throw'The CKEditor installation path could not be automatically detected. Please set the global variable "CKEDITOR_BASEPATH" before creating editor instances.';return b}(),getUrl:function(a){-1==a.indexOf(":/")&&0!==a.indexOf("/")&&(a=this.basePath+a);this.timestamp&&"/"!=a.charAt(a.length-1)&&!/[&?]t=/.test(a)&&(a+=(0<=a.indexOf("?")?"\x26":"?")+"t\x3d"+this.timestamp);return a},domReady:function(){function a(){try{document.addEventListener?(document.removeEventListener("DOMContentLoaded",
a,!1),b()):document.attachEvent&&"complete"===document.readyState&&(document.detachEvent("onreadystatechange",a),b())}catch(c){}}function b(){for(var a;a=c.shift();)a()}var c=[];return function(b){function d(){try{document.documentElement.doScroll("left")}catch(g){setTimeout(d,1);return}a()}c.push(b);"complete"===document.readyState&&setTimeout(a,1);if(1==c.length)if(document.addEventListener)document.addEventListener("DOMContentLoaded",a,!1),window.addEventListener("load",a,!1);else if(document.attachEvent){document.attachEvent("onreadystatechange",
a);window.attachEvent("onload",a);b=!1;try{b=!window.frameElement}catch(t){}document.documentElement.doScroll&&b&&d()}}}()},b=window.CKEDITOR_GETURL;if(b){var c=d.getUrl;d.getUrl=function(a){return b.call(d,a)||c.call(d,a)}}return d}());
CKEDITOR.event||(CKEDITOR.event=function(){},CKEDITOR.event.implementOn=function(a){var d=CKEDITOR.event.prototype,b;for(b in d)null==a[b]&&(a[b]=d[b])},CKEDITOR.event.prototype=function(){function a(a){var e=d(this);return e[a]||(e[a]=new b(a))}var d=function(a){a=a.getPrivate&&a.getPrivate()||a._||(a._={});return a.events||(a.events={})},b=function(a){this.name=a;this.listeners=[]};b.prototype={getListenerIndex:function(a){for(var b=0,d=this.listeners;b<d.length;b++)if(d[b].fn==a)return b;return-1}};
return{define:function(b,d){var f=a.call(this,b);CKEDITOR.tools.extend(f,d,!0)},on:function(b,d,f,k,l){function q(a,g,l,z){a={name:b,sender:this,editor:a,data:g,listenerData:k,stop:l,cancel:z,removeListener:t};return!1===d.call(f,a)?!1:a.data}function t(){z.removeListener(b,d)}var g=a.call(this,b);if(0>g.getListenerIndex(d)){g=g.listeners;f||(f=this);isNaN(l)&&(l=10);var z=this;q.fn=d;q.priority=l;for(var A=g.length-1;0<=A;A--)if(g[A].priority<=l)return g.splice(A+1,0,q),{removeListener:t};g.unshift(q)}return{removeListener:t}},
once:function(){var a=Array.prototype.slice.call(arguments),b=a[1];a[1]=function(a){a.removeListener();return b.apply(this,arguments)};return this.on.apply(this,a)},capture:function(){CKEDITOR.event.useCapture=1;var a=this.on.apply(this,arguments);CKEDITOR.event.useCapture=0;return a},fire:function(){var a=0,b=function(){a=1},f=0,k=function(){f=1};return function(l,q,t){var g=d(this)[l];l=a;var z=f;a=f=0;if(g){var A=g.listeners;if(A.length)for(var A=A.slice(0),v,C=0;C<A.length;C++){if(g.errorProof)try{v=
A[C].call(this,t,q,b,k)}catch(n){}else v=A[C].call(this,t,q,b,k);!1===v?f=1:"undefined"!=typeof v&&(q=v);if(a||f)break}}q=f?!1:"undefined"==typeof q?!0:q;a=l;f=z;return q}}(),fireOnce:function(a,b,f){b=this.fire(a,b,f);delete d(this)[a];return b},removeListener:function(a,b){var f=d(this)[a];if(f){var k=f.getListenerIndex(b);0<=k&&f.listeners.splice(k,1)}},removeAllListeners:function(){var a=d(this),b;for(b in a)delete a[b]},hasListeners:function(a){return(a=d(this)[a])&&0<a.listeners.length}}}());
CKEDITOR.editor||(CKEDITOR.editor=function(){CKEDITOR._.pending.push([this,arguments]);CKEDITOR.event.call(this)},CKEDITOR.editor.prototype.fire=function(a,d){a in{instanceReady:1,loaded:1}&&(this[a]=!0);return CKEDITOR.event.prototype.fire.call(this,a,d,this)},CKEDITOR.editor.prototype.fireOnce=function(a,d){a in{instanceReady:1,loaded:1}&&(this[a]=!0);return CKEDITOR.event.prototype.fireOnce.call(this,a,d,this)},CKEDITOR.event.implementOn(CKEDITOR.editor.prototype));
CKEDITOR.env||(CKEDITOR.env=function(){var a=navigator.userAgent.toLowerCase(),d=a.match(/edge[ \/](\d+.?\d*)/),b=-1<a.indexOf("trident/"),b=!(!d&&!b),b={ie:b,edge:!!d,webkit:!b&&-1<a.indexOf(" applewebkit/"),air:-1<a.indexOf(" adobeair/"),mac:-1<a.indexOf("macintosh"),quirks:"BackCompat"==document.compatMode&&(!document.documentMode||10>document.documentMode),mobile:-1<a.indexOf("mobile"),iOS:/(ipad|iphone|ipod)/.test(a),isCustomDomain:function(){if(!this.ie)return!1;var a=document.domain,b=window.location.hostname;
return a!=b&&a!="["+b+"]"},secure:"https:"==location.protocol};b.gecko="Gecko"==navigator.product&&!b.webkit&&!b.ie;b.webkit&&(-1<a.indexOf("chrome")?b.chrome=!0:b.safari=!0);var c=0;b.ie&&(c=d?parseFloat(d[1]):b.quirks||!document.documentMode?parseFloat(a.match(/msie (\d+)/)[1]):document.documentMode,b.ie9Compat=9==c,b.ie8Compat=8==c,b.ie7Compat=7==c,b.ie6Compat=7>c||b.quirks);b.gecko&&(d=a.match(/rv:([\d\.]+)/))&&(d=d[1].split("."),c=1E4*d[0]+100*(d[1]||0)+1*(d[2]||0));b.air&&(c=parseFloat(a.match(/ adobeair\/(\d+)/)[1]));
b.webkit&&(c=parseFloat(a.match(/ applewebkit\/(\d+)/)[1]));b.version=c;b.isCompatible=!(b.ie&&7>c)&&!(b.gecko&&4E4>c)&&!(b.webkit&&534>c);b.hidpi=2<=window.devicePixelRatio;b.needsBrFiller=b.gecko||b.webkit||b.ie&&10<c;b.needsNbspFiller=b.ie&&11>c;b.cssClass="cke_browser_"+(b.ie?"ie":b.gecko?"gecko":b.webkit?"webkit":"unknown");b.quirks&&(b.cssClass+=" cke_browser_quirks");b.ie&&(b.cssClass+=" cke_browser_ie"+(b.quirks?"6 cke_browser_iequirks":b.version));b.air&&(b.cssClass+=" cke_browser_air");
b.iOS&&(b.cssClass+=" cke_browser_ios");b.hidpi&&(b.cssClass+=" cke_hidpi");return b}());
"unloaded"==CKEDITOR.status&&function(){CKEDITOR.event.implementOn(CKEDITOR);CKEDITOR.loadFullCore=function(){if("basic_ready"!=CKEDITOR.status)CKEDITOR.loadFullCore._load=1;else{delete CKEDITOR.loadFullCore;var a=document.createElement("script");a.type="text/javascript";a.src=CKEDITOR.basePath+"ckeditor.js";document.getElementsByTagName("head")[0].appendChild(a)}};CKEDITOR.loadFullCoreTimeout=0;CKEDITOR.add=function(a){(this._.pending||(this._.pending=[])).push(a)};(function(){CKEDITOR.domReady(function(){var a=
CKEDITOR.loadFullCore,d=CKEDITOR.loadFullCoreTimeout;a&&(CKEDITOR.status="basic_ready",a&&a._load?a():d&&setTimeout(function(){CKEDITOR.loadFullCore&&CKEDITOR.loadFullCore()},1E3*d))})})();CKEDITOR.status="basic_loaded"}();"use strict";CKEDITOR.VERBOSITY_WARN=1;CKEDITOR.VERBOSITY_ERROR=2;CKEDITOR.verbosity=CKEDITOR.VERBOSITY_WARN|CKEDITOR.VERBOSITY_ERROR;CKEDITOR.warn=function(a,d){CKEDITOR.verbosity&CKEDITOR.VERBOSITY_WARN&&CKEDITOR.fire("log",{type:"warn",errorCode:a,additionalData:d})};
CKEDITOR.error=function(a,d){CKEDITOR.verbosity&CKEDITOR.VERBOSITY_ERROR&&CKEDITOR.fire("log",{type:"error",errorCode:a,additionalData:d})};
CKEDITOR.on("log",function(a){if(window.console&&window.console.log){var d=console[a.data.type]?a.data.type:"log",b=a.data.errorCode;if(a=a.data.additionalData)console[d]("[CKEDITOR] Error code: "+b+".",a);else console[d]("[CKEDITOR] Error code: "+b+".");console[d]("[CKEDITOR] For more information about this error go to http://docs.ckeditor.com/#!/guide/dev_errors-section-"+b)}},null,null,999);CKEDITOR.dom={};
(function(){var a=[],d=CKEDITOR.env.gecko?"-moz-":CKEDITOR.env.webkit?"-webkit-":CKEDITOR.env.ie?"-ms-":"",b=/&/g,c=/>/g,e=/</g,f=/"/g,k=/&(lt|gt|amp|quot|nbsp|shy|#\d{1,5});/g,l={lt:"\x3c",gt:"\x3e",amp:"\x26",quot:'"',nbsp:" ",shy:"­"},q=function(a,g){return"#"==g[0]?String.fromCharCode(parseInt(g.slice(1),10)):l[g]};CKEDITOR.on("reset",function(){a=[]});CKEDITOR.tools={arrayCompare:function(a,g){if(!a&&!g)return!0;if(!a||!g||a.length!=g.length)return!1;for(var b=0;b<a.length;b++)if(a[b]!=g[b])return!1;
return!0},getIndex:function(a,g){for(var b=0;b<a.length;++b)if(g(a[b]))return b;return-1},clone:function(a){var g;if(a&&a instanceof Array){g=[];for(var b=0;b<a.length;b++)g[b]=CKEDITOR.tools.clone(a[b]);return g}if(null===a||"object"!=typeof a||a instanceof String||a instanceof Number||a instanceof Boolean||a instanceof Date||a instanceof RegExp||a.nodeType||a.window===a)return a;g=new a.constructor;for(b in a)g[b]=CKEDITOR.tools.clone(a[b]);return g},capitalize:function(a,g){return a.charAt(0).toUpperCase()+
(g?a.slice(1):a.slice(1).toLowerCase())},extend:function(a){var g=arguments.length,b,c;"boolean"==typeof(b=arguments[g-1])?g--:"boolean"==typeof(b=arguments[g-2])&&(c=arguments[g-1],g-=2);for(var l=1;l<g;l++){var d=arguments[l],n;for(n in d)if(!0===b||null==a[n])if(!c||n in c)a[n]=d[n]}return a},prototypedCopy:function(a){var g=function(){};g.prototype=a;return new g},copy:function(a){var g={},b;for(b in a)g[b]=a[b];return g},isArray:function(a){return"[object Array]"==Object.prototype.toString.call(a)},
isEmpty:function(a){for(var g in a)if(a.hasOwnProperty(g))return!1;return!0},cssVendorPrefix:function(a,g,b){if(b)return d+a+":"+g+";"+a+":"+g;b={};b[a]=g;b[d+a]=g;return b},cssStyleToDomStyle:function(){var a=document.createElement("div").style,g="undefined"!=typeof a.cssFloat?"cssFloat":"undefined"!=typeof a.styleFloat?"styleFloat":"float";return function(a){return"float"==a?g:a.replace(/-./g,function(a){return a.substr(1).toUpperCase()})}}(),buildStyleHtml:function(a){a=[].concat(a);for(var g,
b=[],c=0;c<a.length;c++)if(g=a[c])/@import|[{}]/.test(g)?b.push("\x3cstyle\x3e"+g+"\x3c/style\x3e"):b.push('\x3clink type\x3d"text/css" rel\x3dstylesheet href\x3d"'+g+'"\x3e');return b.join("")},htmlEncode:function(a){return void 0===a||null===a?"":String(a).replace(b,"\x26amp;").replace(c,"\x26gt;").replace(e,"\x26lt;")},htmlDecode:function(a){return a.replace(k,q)},htmlEncodeAttr:function(a){return CKEDITOR.tools.htmlEncode(a).replace(f,"\x26quot;")},htmlDecodeAttr:function(a){return CKEDITOR.tools.htmlDecode(a)},
transformPlainTextToHtml:function(a,g){var b=g==CKEDITOR.ENTER_BR,c=this.htmlEncode(a.replace(/\r\n/g,"\n")),c=c.replace(/\t/g,"\x26nbsp;\x26nbsp; \x26nbsp;"),l=g==CKEDITOR.ENTER_P?"p":"div";if(!b){var d=/\n{2}/g;if(d.test(c))var n="\x3c"+l+"\x3e",q="\x3c/"+l+"\x3e",c=n+c.replace(d,function(){return q+n})+q}c=c.replace(/\n/g,"\x3cbr\x3e");b||(c=c.replace(new RegExp("\x3cbr\x3e(?\x3d\x3c/"+l+"\x3e)"),function(a){return CKEDITOR.tools.repeat(a,2)}));c=c.replace(/^ | $/g,"\x26nbsp;");return c=c.replace(/(>|\s) /g,
function(a,b){return b+"\x26nbsp;"}).replace(/ (?=<)/g,"\x26nbsp;")},getNextNumber:function(){var a=0;return function(){return++a}}(),getNextId:function(){return"cke_"+this.getNextNumber()},getUniqueId:function(){for(var a="e",b=0;8>b;b++)a+=Math.floor(65536*(1+Math.random())).toString(16).substring(1);return a},override:function(a,b){var c=b(a);c.prototype=a.prototype;return c},setTimeout:function(a,b,c,l,d){d||(d=window);c||(c=d);return d.setTimeout(function(){l?a.apply(c,[].concat(l)):a.apply(c)},
b||0)},trim:function(){var a=/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g;return function(b){return b.replace(a,"")}}(),ltrim:function(){var a=/^[ \t\n\r]+/g;return function(b){return b.replace(a,"")}}(),rtrim:function(){var a=/[ \t\n\r]+$/g;return function(b){return b.replace(a,"")}}(),indexOf:function(a,b){if("function"==typeof b)for(var c=0,l=a.length;c<l;c++){if(b(a[c]))return c}else{if(a.indexOf)return a.indexOf(b);c=0;for(l=a.length;c<l;c++)if(a[c]===b)return c}return-1},search:function(a,b){var c=CKEDITOR.tools.indexOf(a,
b);return 0<=c?a[c]:null},bind:function(a,b){return function(){return a.apply(b,arguments)}},createClass:function(a){var b=a.$,c=a.base,l=a.privates||a._,d=a.proto;a=a.statics;!b&&(b=function(){c&&this.base.apply(this,arguments)});if(l)var q=b,b=function(){var a=this._||(this._={}),b;for(b in l){var g=l[b];a[b]="function"==typeof g?CKEDITOR.tools.bind(g,this):g}q.apply(this,arguments)};c&&(b.prototype=this.prototypedCopy(c.prototype),b.prototype.constructor=b,b.base=c,b.baseProto=c.prototype,b.prototype.base=
function(){this.base=c.prototype.base;c.apply(this,arguments);this.base=arguments.callee});d&&this.extend(b.prototype,d,!0);a&&this.extend(b,a,!0);return b},addFunction:function(b,g){return a.push(function(){return b.apply(g||this,arguments)})-1},removeFunction:function(b){a[b]=null},callFunction:function(b){var g=a[b];return g&&g.apply(window,Array.prototype.slice.call(arguments,1))},cssLength:function(){var a=/^-?\d+\.?\d*px$/,b;return function(c){b=CKEDITOR.tools.trim(c+"")+"px";return a.test(b)?
b:c||""}}(),convertToPx:function(){var a;return function(b){a||(a=CKEDITOR.dom.element.createFromHtml('\x3cdiv style\x3d"position:absolute;left:-9999px;top:-9999px;margin:0px;padding:0px;border:0px;"\x3e\x3c/div\x3e',CKEDITOR.document),CKEDITOR.document.getBody().append(a));return/%$/.test(b)?b:(a.setStyle("width",b),a.$.clientWidth)}}(),repeat:function(a,b){return Array(b+1).join(a)},tryThese:function(){for(var a,b=0,c=arguments.length;b<c;b++){var l=arguments[b];try{a=l();break}catch(d){}}return a},
genKey:function(){return Array.prototype.slice.call(arguments).join("-")},defer:function(a){return function(){var b=arguments,c=this;window.setTimeout(function(){a.apply(c,b)},0)}},normalizeCssText:function(a,b){var c=[],l,d=CKEDITOR.tools.parseCssText(a,!0,b);for(l in d)c.push(l+":"+d[l]);c.sort();return c.length?c.join(";")+";":""},convertRgbToHex:function(a){return a.replace(/(?:rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\))/gi,function(a,b,c,l){a=[b,c,l];for(b=0;3>b;b++)a[b]=("0"+parseInt(a[b],10).toString(16)).slice(-2);
return"#"+a.join("")})},parseCssText:function(a,b,c){var l={};c&&(c=new CKEDITOR.dom.element("span"),c.setAttribute("style",a),a=CKEDITOR.tools.convertRgbToHex(c.getAttribute("style")||""));if(!a||";"==a)return l;a.replace(/&quot;/g,'"').replace(/\s*([^:;\s]+)\s*:\s*([^;]+)\s*(?=;|$)/g,function(a,c,d){b&&(c=c.toLowerCase(),"font-family"==c&&(d=d.toLowerCase().replace(/["']/g,"").replace(/\s*,\s*/g,",")),d=CKEDITOR.tools.trim(d));l[c]=d});return l},writeCssText:function(a,b){var c,l=[];for(c in a)l.push(c+
":"+a[c]);b&&l.sort();return l.join("; ")},objectCompare:function(a,b,c){var l;if(!a&&!b)return!0;if(!a||!b)return!1;for(l in a)if(a[l]!=b[l])return!1;if(!c)for(l in b)if(a[l]!=b[l])return!1;return!0},objectKeys:function(a){var b=[],c;for(c in a)b.push(c);return b},convertArrayToObject:function(a,b){var c={};1==arguments.length&&(b=!0);for(var l=0,d=a.length;l<d;++l)c[a[l]]=b;return c},fixDomain:function(){for(var a;;)try{a=window.parent.document.domain;break}catch(b){a=a?a.replace(/.+?(?:\.|$)/,
""):document.domain;if(!a)break;document.domain=a}return!!a},eventsBuffer:function(a,b,c){function l(){q=(new Date).getTime();d=!1;c?b.call(c):b()}var d,q=0;return{input:function(){if(!d){var b=(new Date).getTime()-q;b<a?d=setTimeout(l,a-b):l()}},reset:function(){d&&clearTimeout(d);d=q=0}}},enableHtml5Elements:function(a,b){for(var c="abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary time video".split(" "),
l=c.length,d;l--;)d=a.createElement(c[l]),b&&a.appendChild(d)},checkIfAnyArrayItemMatches:function(a,b){for(var c=0,l=a.length;c<l;++c)if(a[c].match(b))return!0;return!1},checkIfAnyObjectPropertyMatches:function(a,b){for(var c in a)if(c.match(b))return!0;return!1},transparentImageData:"data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d"}})();
CKEDITOR.dtd=function(){var a=CKEDITOR.tools.extend,d=function(a,b){for(var c=CKEDITOR.tools.clone(a),l=1;l<arguments.length;l++){b=arguments[l];for(var d in b)delete c[d]}return c},b={},c={},e={address:1,article:1,aside:1,blockquote:1,details:1,div:1,dl:1,fieldset:1,figure:1,footer:1,form:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,header:1,hgroup:1,hr:1,main:1,menu:1,nav:1,ol:1,p:1,pre:1,section:1,table:1,ul:1},f={command:1,link:1,meta:1,noscript:1,script:1,style:1},k={},l={"#":1},q={center:1,dir:1,noframes:1};
a(b,{a:1,abbr:1,area:1,audio:1,b:1,bdi:1,bdo:1,br:1,button:1,canvas:1,cite:1,code:1,command:1,datalist:1,del:1,dfn:1,em:1,embed:1,i:1,iframe:1,img:1,input:1,ins:1,kbd:1,keygen:1,label:1,map:1,mark:1,meter:1,noscript:1,object:1,output:1,progress:1,q:1,ruby:1,s:1,samp:1,script:1,select:1,small:1,span:1,strong:1,sub:1,sup:1,textarea:1,time:1,u:1,"var":1,video:1,wbr:1},l,{acronym:1,applet:1,basefont:1,big:1,font:1,isindex:1,strike:1,style:1,tt:1});a(c,e,b,q);d={a:d(b,{a:1,button:1}),abbr:b,address:c,
area:k,article:c,aside:c,audio:a({source:1,track:1},c),b:b,base:k,bdi:b,bdo:b,blockquote:c,body:c,br:k,button:d(b,{a:1,button:1}),canvas:b,caption:c,cite:b,code:b,col:k,colgroup:{col:1},command:k,datalist:a({option:1},b),dd:c,del:b,details:a({summary:1},c),dfn:b,div:c,dl:{dt:1,dd:1},dt:c,em:b,embed:k,fieldset:a({legend:1},c),figcaption:c,figure:a({figcaption:1},c),footer:c,form:c,h1:b,h2:b,h3:b,h4:b,h5:b,h6:b,head:a({title:1,base:1},f),header:c,hgroup:{h1:1,h2:1,h3:1,h4:1,h5:1,h6:1},hr:k,html:a({head:1,
body:1},c,f),i:b,iframe:l,img:k,input:k,ins:b,kbd:b,keygen:k,label:b,legend:b,li:c,link:k,main:c,map:c,mark:b,menu:a({li:1},c),meta:k,meter:d(b,{meter:1}),nav:c,noscript:a({link:1,meta:1,style:1},b),object:a({param:1},b),ol:{li:1},optgroup:{option:1},option:l,output:b,p:b,param:k,pre:b,progress:d(b,{progress:1}),q:b,rp:b,rt:b,ruby:a({rp:1,rt:1},b),s:b,samp:b,script:l,section:c,select:{optgroup:1,option:1},small:b,source:k,span:b,strong:b,style:l,sub:b,summary:a({h1:1,h2:1,h3:1,h4:1,h5:1,h6:1},b),
sup:b,table:{caption:1,colgroup:1,thead:1,tfoot:1,tbody:1,tr:1},tbody:{tr:1},td:c,textarea:l,tfoot:{tr:1},th:c,thead:{tr:1},time:d(b,{time:1}),title:l,tr:{th:1,td:1},track:k,u:b,ul:{li:1},"var":b,video:a({source:1,track:1},c),wbr:k,acronym:b,applet:a({param:1},c),basefont:k,big:b,center:c,dialog:k,dir:{li:1},font:b,isindex:k,noframes:c,strike:b,tt:b};a(d,{$block:a({audio:1,dd:1,dt:1,figcaption:1,li:1,video:1},e,q),$blockLimit:{article:1,aside:1,audio:1,body:1,caption:1,details:1,dir:1,div:1,dl:1,
fieldset:1,figcaption:1,figure:1,footer:1,form:1,header:1,hgroup:1,main:1,menu:1,nav:1,ol:1,section:1,table:1,td:1,th:1,tr:1,ul:1,video:1},$cdata:{script:1,style:1},$editable:{address:1,article:1,aside:1,blockquote:1,body:1,details:1,div:1,fieldset:1,figcaption:1,footer:1,form:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,header:1,hgroup:1,main:1,nav:1,p:1,pre:1,section:1},$empty:{area:1,base:1,basefont:1,br:1,col:1,command:1,dialog:1,embed:1,hr:1,img:1,input:1,isindex:1,keygen:1,link:1,meta:1,param:1,source:1,
track:1,wbr:1},$inline:b,$list:{dl:1,ol:1,ul:1},$listItem:{dd:1,dt:1,li:1},$nonBodyContent:a({body:1,head:1,html:1},d.head),$nonEditable:{applet:1,audio:1,button:1,embed:1,iframe:1,map:1,object:1,option:1,param:1,script:1,textarea:1,video:1},$object:{applet:1,audio:1,button:1,hr:1,iframe:1,img:1,input:1,object:1,select:1,table:1,textarea:1,video:1},$removeEmpty:{abbr:1,acronym:1,b:1,bdi:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,mark:1,meter:1,output:1,q:1,ruby:1,
s:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,time:1,tt:1,u:1,"var":1},$tabIndex:{a:1,area:1,button:1,input:1,object:1,select:1,textarea:1},$tableContent:{caption:1,col:1,colgroup:1,tbody:1,td:1,tfoot:1,th:1,thead:1,tr:1},$transparent:{a:1,audio:1,canvas:1,del:1,ins:1,map:1,noscript:1,object:1,video:1},$intermediate:{caption:1,colgroup:1,dd:1,dt:1,figcaption:1,legend:1,li:1,optgroup:1,option:1,rp:1,rt:1,summary:1,tbody:1,td:1,tfoot:1,th:1,thead:1,tr:1}});return d}();
CKEDITOR.dom.event=function(a){this.$=a};
CKEDITOR.dom.event.prototype={getKey:function(){return this.$.keyCode||this.$.which},getKeystroke:function(){var a=this.getKey();if(this.$.ctrlKey||this.$.metaKey)a+=CKEDITOR.CTRL;this.$.shiftKey&&(a+=CKEDITOR.SHIFT);this.$.altKey&&(a+=CKEDITOR.ALT);return a},preventDefault:function(a){var d=this.$;d.preventDefault?d.preventDefault():d.returnValue=!1;a&&this.stopPropagation()},stopPropagation:function(){var a=this.$;a.stopPropagation?a.stopPropagation():a.cancelBubble=!0},getTarget:function(){var a=
this.$.target||this.$.srcElement;return a?new CKEDITOR.dom.node(a):null},getPhase:function(){return this.$.eventPhase||2},getPageOffset:function(){var a=this.getTarget().getDocument().$;return{x:this.$.pageX||this.$.clientX+(a.documentElement.scrollLeft||a.body.scrollLeft),y:this.$.pageY||this.$.clientY+(a.documentElement.scrollTop||a.body.scrollTop)}}};CKEDITOR.CTRL=1114112;CKEDITOR.SHIFT=2228224;CKEDITOR.ALT=4456448;CKEDITOR.EVENT_PHASE_CAPTURING=1;CKEDITOR.EVENT_PHASE_AT_TARGET=2;
CKEDITOR.EVENT_PHASE_BUBBLING=3;CKEDITOR.dom.domObject=function(a){a&&(this.$=a)};
CKEDITOR.dom.domObject.prototype=function(){var a=function(a,b){return function(c){"undefined"!=typeof CKEDITOR&&a.fire(b,new CKEDITOR.dom.event(c))}};return{getPrivate:function(){var a;(a=this.getCustomData("_"))||this.setCustomData("_",a={});return a},on:function(d){var b=this.getCustomData("_cke_nativeListeners");b||(b={},this.setCustomData("_cke_nativeListeners",b));b[d]||(b=b[d]=a(this,d),this.$.addEventListener?this.$.addEventListener(d,b,!!CKEDITOR.event.useCapture):this.$.attachEvent&&this.$.attachEvent("on"+
d,b));return CKEDITOR.event.prototype.on.apply(this,arguments)},removeListener:function(a){CKEDITOR.event.prototype.removeListener.apply(this,arguments);if(!this.hasListeners(a)){var b=this.getCustomData("_cke_nativeListeners"),c=b&&b[a];c&&(this.$.removeEventListener?this.$.removeEventListener(a,c,!1):this.$.detachEvent&&this.$.detachEvent("on"+a,c),delete b[a])}},removeAllListeners:function(){var a=this.getCustomData("_cke_nativeListeners"),b;for(b in a){var c=a[b];this.$.detachEvent?this.$.detachEvent("on"+
b,c):this.$.removeEventListener&&this.$.removeEventListener(b,c,!1);delete a[b]}CKEDITOR.event.prototype.removeAllListeners.call(this)}}}();
(function(a){var d={};CKEDITOR.on("reset",function(){d={}});a.equals=function(a){try{return a&&a.$===this.$}catch(c){return!1}};a.setCustomData=function(a,c){var e=this.getUniqueId();(d[e]||(d[e]={}))[a]=c;return this};a.getCustomData=function(a){var c=this.$["data-cke-expando"];return(c=c&&d[c])&&a in c?c[a]:null};a.removeCustomData=function(a){var c=this.$["data-cke-expando"],c=c&&d[c],e,f;c&&(e=c[a],f=a in c,delete c[a]);return f?e:null};a.clearCustomData=function(){this.removeAllListeners();var a=
this.$["data-cke-expando"];a&&delete d[a]};a.getUniqueId=function(){return this.$["data-cke-expando"]||(this.$["data-cke-expando"]=CKEDITOR.tools.getNextNumber())};CKEDITOR.event.implementOn(a)})(CKEDITOR.dom.domObject.prototype);
CKEDITOR.dom.node=function(a){return a?new CKEDITOR.dom[a.nodeType==CKEDITOR.NODE_DOCUMENT?"document":a.nodeType==CKEDITOR.NODE_ELEMENT?"element":a.nodeType==CKEDITOR.NODE_TEXT?"text":a.nodeType==CKEDITOR.NODE_COMMENT?"comment":a.nodeType==CKEDITOR.NODE_DOCUMENT_FRAGMENT?"documentFragment":"domObject"](a):this};CKEDITOR.dom.node.prototype=new CKEDITOR.dom.domObject;CKEDITOR.NODE_ELEMENT=1;CKEDITOR.NODE_DOCUMENT=9;CKEDITOR.NODE_TEXT=3;CKEDITOR.NODE_COMMENT=8;CKEDITOR.NODE_DOCUMENT_FRAGMENT=11;
CKEDITOR.POSITION_IDENTICAL=0;CKEDITOR.POSITION_DISCONNECTED=1;CKEDITOR.POSITION_FOLLOWING=2;CKEDITOR.POSITION_PRECEDING=4;CKEDITOR.POSITION_IS_CONTAINED=8;CKEDITOR.POSITION_CONTAINS=16;
CKEDITOR.tools.extend(CKEDITOR.dom.node.prototype,{appendTo:function(a,d){a.append(this,d);return a},clone:function(a,d){function b(c){c["data-cke-expando"]&&(c["data-cke-expando"]=!1);if(c.nodeType==CKEDITOR.NODE_ELEMENT||c.nodeType==CKEDITOR.NODE_DOCUMENT_FRAGMENT)if(d||c.nodeType!=CKEDITOR.NODE_ELEMENT||c.removeAttribute("id",!1),a){c=c.childNodes;for(var e=0;e<c.length;e++)b(c[e])}}function c(b){if(b.type==CKEDITOR.NODE_ELEMENT||b.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT){if(b.type!=CKEDITOR.NODE_DOCUMENT_FRAGMENT){var d=
b.getName();":"==d[0]&&b.renameNode(d.substring(1))}if(a)for(d=0;d<b.getChildCount();d++)c(b.getChild(d))}}var e=this.$.cloneNode(a);b(e);e=new CKEDITOR.dom.node(e);CKEDITOR.env.ie&&9>CKEDITOR.env.version&&(this.type==CKEDITOR.NODE_ELEMENT||this.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT)&&c(e);return e},hasPrevious:function(){return!!this.$.previousSibling},hasNext:function(){return!!this.$.nextSibling},insertAfter:function(a){a.$.parentNode.insertBefore(this.$,a.$.nextSibling);return a},insertBefore:function(a){a.$.parentNode.insertBefore(this.$,
a.$);return a},insertBeforeMe:function(a){this.$.parentNode.insertBefore(a.$,this.$);return a},getAddress:function(a){for(var d=[],b=this.getDocument().$.documentElement,c=this.$;c&&c!=b;){var e=c.parentNode;e&&d.unshift(this.getIndex.call({$:c},a));c=e}return d},getDocument:function(){return new CKEDITOR.dom.document(this.$.ownerDocument||this.$.parentNode.ownerDocument)},getIndex:function(a){function d(a,b){var c=b?a.nextSibling:a.previousSibling;return c&&c.nodeType==CKEDITOR.NODE_TEXT?c.nodeValue?
c:d(c,b):null}var b=this.$,c=-1,e;if(!this.$.parentNode||a&&b.nodeType==CKEDITOR.NODE_TEXT&&!b.nodeValue&&!d(b)&&!d(b,!0))return-1;do if(!a||b==this.$||b.nodeType!=CKEDITOR.NODE_TEXT||!e&&b.nodeValue)c++,e=b.nodeType==CKEDITOR.NODE_TEXT;while(b=b.previousSibling);return c},getNextSourceNode:function(a,d,b){if(b&&!b.call){var c=b;b=function(a){return!a.equals(c)}}a=!a&&this.getFirst&&this.getFirst();var e;if(!a){if(this.type==CKEDITOR.NODE_ELEMENT&&b&&!1===b(this,!0))return null;a=this.getNext()}for(;!a&&
(e=(e||this).getParent());){if(b&&!1===b(e,!0))return null;a=e.getNext()}return!a||b&&!1===b(a)?null:d&&d!=a.type?a.getNextSourceNode(!1,d,b):a},getPreviousSourceNode:function(a,d,b){if(b&&!b.call){var c=b;b=function(a){return!a.equals(c)}}a=!a&&this.getLast&&this.getLast();var e;if(!a){if(this.type==CKEDITOR.NODE_ELEMENT&&b&&!1===b(this,!0))return null;a=this.getPrevious()}for(;!a&&(e=(e||this).getParent());){if(b&&!1===b(e,!0))return null;a=e.getPrevious()}return!a||b&&!1===b(a)?null:d&&a.type!=
d?a.getPreviousSourceNode(!1,d,b):a},getPrevious:function(a){var d=this.$,b;do b=(d=d.previousSibling)&&10!=d.nodeType&&new CKEDITOR.dom.node(d);while(b&&a&&!a(b));return b},getNext:function(a){var d=this.$,b;do b=(d=d.nextSibling)&&new CKEDITOR.dom.node(d);while(b&&a&&!a(b));return b},getParent:function(a){var d=this.$.parentNode;return d&&(d.nodeType==CKEDITOR.NODE_ELEMENT||a&&d.nodeType==CKEDITOR.NODE_DOCUMENT_FRAGMENT)?new CKEDITOR.dom.node(d):null},getParents:function(a){var d=this,b=[];do b[a?
"push":"unshift"](d);while(d=d.getParent());return b},getCommonAncestor:function(a){if(a.equals(this))return this;if(a.contains&&a.contains(this))return a;var d=this.contains?this:this.getParent();do if(d.contains(a))return d;while(d=d.getParent());return null},getPosition:function(a){var d=this.$,b=a.$;if(d.compareDocumentPosition)return d.compareDocumentPosition(b);if(d==b)return CKEDITOR.POSITION_IDENTICAL;if(this.type==CKEDITOR.NODE_ELEMENT&&a.type==CKEDITOR.NODE_ELEMENT){if(d.contains){if(d.contains(b))return CKEDITOR.POSITION_CONTAINS+
CKEDITOR.POSITION_PRECEDING;if(b.contains(d))return CKEDITOR.POSITION_IS_CONTAINED+CKEDITOR.POSITION_FOLLOWING}if("sourceIndex"in d)return 0>d.sourceIndex||0>b.sourceIndex?CKEDITOR.POSITION_DISCONNECTED:d.sourceIndex<b.sourceIndex?CKEDITOR.POSITION_PRECEDING:CKEDITOR.POSITION_FOLLOWING}d=this.getAddress();a=a.getAddress();for(var b=Math.min(d.length,a.length),c=0;c<b;c++)if(d[c]!=a[c])return d[c]<a[c]?CKEDITOR.POSITION_PRECEDING:CKEDITOR.POSITION_FOLLOWING;return d.length<a.length?CKEDITOR.POSITION_CONTAINS+
CKEDITOR.POSITION_PRECEDING:CKEDITOR.POSITION_IS_CONTAINED+CKEDITOR.POSITION_FOLLOWING},getAscendant:function(a,d){var b=this.$,c,e;d||(b=b.parentNode);"function"==typeof a?(e=!0,c=a):(e=!1,c=function(b){b="string"==typeof b.nodeName?b.nodeName.toLowerCase():"";return"string"==typeof a?b==a:b in a});for(;b;){if(c(e?new CKEDITOR.dom.node(b):b))return new CKEDITOR.dom.node(b);try{b=b.parentNode}catch(f){b=null}}return null},hasAscendant:function(a,d){var b=this.$;d||(b=b.parentNode);for(;b;){if(b.nodeName&&
b.nodeName.toLowerCase()==a)return!0;b=b.parentNode}return!1},move:function(a,d){a.append(this.remove(),d)},remove:function(a){var d=this.$,b=d.parentNode;if(b){if(a)for(;a=d.firstChild;)b.insertBefore(d.removeChild(a),d);b.removeChild(d)}return this},replace:function(a){this.insertBefore(a);a.remove()},trim:function(){this.ltrim();this.rtrim()},ltrim:function(){for(var a;this.getFirst&&(a=this.getFirst());){if(a.type==CKEDITOR.NODE_TEXT){var d=CKEDITOR.tools.ltrim(a.getText()),b=a.getLength();if(d)d.length<
b&&(a.split(b-d.length),this.$.removeChild(this.$.firstChild));else{a.remove();continue}}break}},rtrim:function(){for(var a;this.getLast&&(a=this.getLast());){if(a.type==CKEDITOR.NODE_TEXT){var d=CKEDITOR.tools.rtrim(a.getText()),b=a.getLength();if(d)d.length<b&&(a.split(d.length),this.$.lastChild.parentNode.removeChild(this.$.lastChild));else{a.remove();continue}}break}CKEDITOR.env.needsBrFiller&&(a=this.$.lastChild)&&1==a.type&&"br"==a.nodeName.toLowerCase()&&a.parentNode.removeChild(a)},isReadOnly:function(a){var d=
this;this.type!=CKEDITOR.NODE_ELEMENT&&(d=this.getParent());CKEDITOR.env.edge&&d&&d.is("textarea","input")&&(a=!0);if(!a&&d&&"undefined"!=typeof d.$.isContentEditable)return!(d.$.isContentEditable||d.data("cke-editable"));for(;d;){if(d.data("cke-editable"))return!1;if(d.hasAttribute("contenteditable"))return"false"==d.getAttribute("contenteditable");d=d.getParent()}return!0}});CKEDITOR.dom.window=function(a){CKEDITOR.dom.domObject.call(this,a)};CKEDITOR.dom.window.prototype=new CKEDITOR.dom.domObject;
CKEDITOR.tools.extend(CKEDITOR.dom.window.prototype,{focus:function(){this.$.focus()},getViewPaneSize:function(){var a=this.$.document,d="CSS1Compat"==a.compatMode;return{width:(d?a.documentElement.clientWidth:a.body.clientWidth)||0,height:(d?a.documentElement.clientHeight:a.body.clientHeight)||0}},getScrollPosition:function(){var a=this.$;if("pageXOffset"in a)return{x:a.pageXOffset||0,y:a.pageYOffset||0};a=a.document;return{x:a.documentElement.scrollLeft||a.body.scrollLeft||0,y:a.documentElement.scrollTop||
a.body.scrollTop||0}},getFrame:function(){var a=this.$.frameElement;return a?new CKEDITOR.dom.element.get(a):null}});CKEDITOR.dom.document=function(a){CKEDITOR.dom.domObject.call(this,a)};CKEDITOR.dom.document.prototype=new CKEDITOR.dom.domObject;
CKEDITOR.tools.extend(CKEDITOR.dom.document.prototype,{type:CKEDITOR.NODE_DOCUMENT,appendStyleSheet:function(a){if(this.$.createStyleSheet)this.$.createStyleSheet(a);else{var d=new CKEDITOR.dom.element("link");d.setAttributes({rel:"stylesheet",type:"text/css",href:a});this.getHead().append(d)}},appendStyleText:function(a){if(this.$.createStyleSheet){var d=this.$.createStyleSheet("");d.cssText=a}else{var b=new CKEDITOR.dom.element("style",this);b.append(new CKEDITOR.dom.text(a,this));this.getHead().append(b)}return d||
b.$.sheet},createElement:function(a,d){var b=new CKEDITOR.dom.element(a,this);d&&(d.attributes&&b.setAttributes(d.attributes),d.styles&&b.setStyles(d.styles));return b},createText:function(a){return new CKEDITOR.dom.text(a,this)},focus:function(){this.getWindow().focus()},getActive:function(){var a;try{a=this.$.activeElement}catch(d){return null}return new CKEDITOR.dom.element(a)},getById:function(a){return(a=this.$.getElementById(a))?new CKEDITOR.dom.element(a):null},getByAddress:function(a,d){for(var b=
this.$.documentElement,c=0;b&&c<a.length;c++){var e=a[c];if(d)for(var f=-1,k=0;k<b.childNodes.length;k++){var l=b.childNodes[k];if(!0!==d||3!=l.nodeType||!l.previousSibling||3!=l.previousSibling.nodeType)if(f++,f==e){b=l;break}}else b=b.childNodes[e]}return b?new CKEDITOR.dom.node(b):null},getElementsByTag:function(a,d){CKEDITOR.env.ie&&8>=document.documentMode||!d||(a=d+":"+a);return new CKEDITOR.dom.nodeList(this.$.getElementsByTagName(a))},getHead:function(){var a=this.$.getElementsByTagName("head")[0];
return a=a?new CKEDITOR.dom.element(a):this.getDocumentElement().append(new CKEDITOR.dom.element("head"),!0)},getBody:function(){return new CKEDITOR.dom.element(this.$.body)},getDocumentElement:function(){return new CKEDITOR.dom.element(this.$.documentElement)},getWindow:function(){return new CKEDITOR.dom.window(this.$.parentWindow||this.$.defaultView)},write:function(a){this.$.open("text/html","replace");CKEDITOR.env.ie&&(a=a.replace(/(?:^\s*<!DOCTYPE[^>]*?>)|^/i,'$\x26\n\x3cscript data-cke-temp\x3d"1"\x3e('+
CKEDITOR.tools.fixDomain+")();\x3c/script\x3e"));this.$.write(a);this.$.close()},find:function(a){return new CKEDITOR.dom.nodeList(this.$.querySelectorAll(a))},findOne:function(a){return(a=this.$.querySelector(a))?new CKEDITOR.dom.element(a):null},_getHtml5ShivFrag:function(){var a=this.getCustomData("html5ShivFrag");a||(a=this.$.createDocumentFragment(),CKEDITOR.tools.enableHtml5Elements(a,!0),this.setCustomData("html5ShivFrag",a));return a}});CKEDITOR.dom.nodeList=function(a){this.$=a};
CKEDITOR.dom.nodeList.prototype={count:function(){return this.$.length},getItem:function(a){return 0>a||a>=this.$.length?null:(a=this.$[a])?new CKEDITOR.dom.node(a):null}};CKEDITOR.dom.element=function(a,d){"string"==typeof a&&(a=(d?d.$:document).createElement(a));CKEDITOR.dom.domObject.call(this,a)};CKEDITOR.dom.element.get=function(a){return(a="string"==typeof a?document.getElementById(a)||document.getElementsByName(a)[0]:a)&&(a.$?a:new CKEDITOR.dom.element(a))};CKEDITOR.dom.element.prototype=new CKEDITOR.dom.node;
CKEDITOR.dom.element.createFromHtml=function(a,d){var b=new CKEDITOR.dom.element("div",d);b.setHtml(a);return b.getFirst().remove()};CKEDITOR.dom.element.setMarker=function(a,d,b,c){var e=d.getCustomData("list_marker_id")||d.setCustomData("list_marker_id",CKEDITOR.tools.getNextNumber()).getCustomData("list_marker_id"),f=d.getCustomData("list_marker_names")||d.setCustomData("list_marker_names",{}).getCustomData("list_marker_names");a[e]=d;f[b]=1;return d.setCustomData(b,c)};
CKEDITOR.dom.element.clearAllMarkers=function(a){for(var d in a)CKEDITOR.dom.element.clearMarkers(a,a[d],1)};CKEDITOR.dom.element.clearMarkers=function(a,d,b){var c=d.getCustomData("list_marker_names"),e=d.getCustomData("list_marker_id"),f;for(f in c)d.removeCustomData(f);d.removeCustomData("list_marker_names");b&&(d.removeCustomData("list_marker_id"),delete a[e])};
(function(){function a(a,b){return-1<(" "+a+" ").replace(f," ").indexOf(" "+b+" ")}function d(a){var b=!0;a.$.id||(a.$.id="cke_tmp_"+CKEDITOR.tools.getNextNumber(),b=!1);return function(){b||a.removeAttribute("id")}}function b(a,b){return"#"+a.$.id+" "+b.split(/,\s*/).join(", #"+a.$.id+" ")}function c(a){for(var b=0,c=0,g=k[a].length;c<g;c++)b+=parseInt(this.getComputedStyle(k[a][c])||0,10)||0;return b}var e=document.createElement("_").classList,e="undefined"!==typeof e&&null!==String(e.add).match(/\[Native code\]/gi),
f=/[\n\t\r]/g;CKEDITOR.tools.extend(CKEDITOR.dom.element.prototype,{type:CKEDITOR.NODE_ELEMENT,addClass:e?function(a){this.$.classList.add(a);return this}:function(b){var c=this.$.className;c&&(a(c,b)||(c+=" "+b));this.$.className=c||b;return this},removeClass:e?function(a){var b=this.$;b.classList.remove(a);b.className||b.removeAttribute("class");return this}:function(b){var c=this.getAttribute("class");c&&a(c,b)&&((c=c.replace(new RegExp("(?:^|\\s+)"+b+"(?\x3d\\s|$)"),"").replace(/^\s+/,""))?this.setAttribute("class",
c):this.removeAttribute("class"));return this},hasClass:function(b){return a(this.$.className,b)},append:function(a,b){"string"==typeof a&&(a=this.getDocument().createElement(a));b?this.$.insertBefore(a.$,this.$.firstChild):this.$.appendChild(a.$);return a},appendHtml:function(a){if(this.$.childNodes.length){var b=new CKEDITOR.dom.element("div",this.getDocument());b.setHtml(a);b.moveChildren(this)}else this.setHtml(a)},appendText:function(a){null!=this.$.text&&CKEDITOR.env.ie&&9>CKEDITOR.env.version?
this.$.text+=a:this.append(new CKEDITOR.dom.text(a))},appendBogus:function(a){if(a||CKEDITOR.env.needsBrFiller){for(a=this.getLast();a&&a.type==CKEDITOR.NODE_TEXT&&!CKEDITOR.tools.rtrim(a.getText());)a=a.getPrevious();a&&a.is&&a.is("br")||(a=this.getDocument().createElement("br"),CKEDITOR.env.gecko&&a.setAttribute("type","_moz"),this.append(a))}},breakParent:function(a,b){var c=new CKEDITOR.dom.range(this.getDocument());c.setStartAfter(this);c.setEndAfter(a);var g=c.extractContents(!1,b||!1);c.insertNode(this.remove());
g.insertAfterNode(this)},contains:document.compareDocumentPosition?function(a){return!!(this.$.compareDocumentPosition(a.$)&16)}:function(a){var b=this.$;return a.type!=CKEDITOR.NODE_ELEMENT?b.contains(a.getParent().$):b!=a.$&&b.contains(a.$)},focus:function(){function a(){try{this.$.focus()}catch(b){}}return function(b){b?CKEDITOR.tools.setTimeout(a,100,this):a.call(this)}}(),getHtml:function(){var a=this.$.innerHTML;return CKEDITOR.env.ie?a.replace(/<\?[^>]*>/g,""):a},getOuterHtml:function(){if(this.$.outerHTML)return this.$.outerHTML.replace(/<\?[^>]*>/,
"");var a=this.$.ownerDocument.createElement("div");a.appendChild(this.$.cloneNode(!0));return a.innerHTML},getClientRect:function(){var a=CKEDITOR.tools.extend({},this.$.getBoundingClientRect());!a.width&&(a.width=a.right-a.left);!a.height&&(a.height=a.bottom-a.top);return a},setHtml:CKEDITOR.env.ie&&9>CKEDITOR.env.version?function(a){try{var b=this.$;if(this.getParent())return b.innerHTML=a;var c=this.getDocument()._getHtml5ShivFrag();c.appendChild(b);b.innerHTML=a;c.removeChild(b);return a}catch(g){this.$.innerHTML=
"";b=new CKEDITOR.dom.element("body",this.getDocument());b.$.innerHTML=a;for(b=b.getChildren();b.count();)this.append(b.getItem(0));return a}}:function(a){return this.$.innerHTML=a},setText:function(){var a=document.createElement("p");a.innerHTML="x";a=a.textContent;return function(b){this.$[a?"textContent":"innerText"]=b}}(),getAttribute:function(){var a=function(a){return this.$.getAttribute(a,2)};return CKEDITOR.env.ie&&(CKEDITOR.env.ie7Compat||CKEDITOR.env.quirks)?function(a){switch(a){case "class":a=
"className";break;case "http-equiv":a="httpEquiv";break;case "name":return this.$.name;case "tabindex":return a=this.$.getAttribute(a,2),0!==a&&0===this.$.tabIndex&&(a=null),a;case "checked":return a=this.$.attributes.getNamedItem(a),(a.specified?a.nodeValue:this.$.checked)?"checked":null;case "hspace":case "value":return this.$[a];case "style":return this.$.style.cssText;case "contenteditable":case "contentEditable":return this.$.attributes.getNamedItem("contentEditable").specified?this.$.getAttribute("contentEditable"):
null}return this.$.getAttribute(a,2)}:a}(),getChildren:function(){return new CKEDITOR.dom.nodeList(this.$.childNodes)},getComputedStyle:document.defaultView&&document.defaultView.getComputedStyle?function(a){var b=this.getWindow().$.getComputedStyle(this.$,null);return b?b.getPropertyValue(a):""}:function(a){return this.$.currentStyle[CKEDITOR.tools.cssStyleToDomStyle(a)]},getDtd:function(){var a=CKEDITOR.dtd[this.getName()];this.getDtd=function(){return a};return a},getElementsByTag:CKEDITOR.dom.document.prototype.getElementsByTag,
getTabIndex:function(){var a=this.$.tabIndex;return 0!==a||CKEDITOR.dtd.$tabIndex[this.getName()]||0===parseInt(this.getAttribute("tabindex"),10)?a:-1},getText:function(){return this.$.textContent||this.$.innerText||""},getWindow:function(){return this.getDocument().getWindow()},getId:function(){return this.$.id||null},getNameAtt:function(){return this.$.name||null},getName:function(){var a=this.$.nodeName.toLowerCase();if(CKEDITOR.env.ie&&8>=document.documentMode){var b=this.$.scopeName;"HTML"!=
b&&(a=b.toLowerCase()+":"+a)}this.getName=function(){return a};return this.getName()},getValue:function(){return this.$.value},getFirst:function(a){var b=this.$.firstChild;(b=b&&new CKEDITOR.dom.node(b))&&a&&!a(b)&&(b=b.getNext(a));return b},getLast:function(a){var b=this.$.lastChild;(b=b&&new CKEDITOR.dom.node(b))&&a&&!a(b)&&(b=b.getPrevious(a));return b},getStyle:function(a){return this.$.style[CKEDITOR.tools.cssStyleToDomStyle(a)]},is:function(){var a=this.getName();if("object"==typeof arguments[0])return!!arguments[0][a];
for(var b=0;b<arguments.length;b++)if(arguments[b]==a)return!0;return!1},isEditable:function(a){var b=this.getName();return this.isReadOnly()||"none"==this.getComputedStyle("display")||"hidden"==this.getComputedStyle("visibility")||CKEDITOR.dtd.$nonEditable[b]||CKEDITOR.dtd.$empty[b]||this.is("a")&&(this.data("cke-saved-name")||this.hasAttribute("name"))&&!this.getChildCount()?!1:!1!==a?(a=CKEDITOR.dtd[b]||CKEDITOR.dtd.span,!(!a||!a["#"])):!0},isIdentical:function(a){var b=this.clone(0,1);a=a.clone(0,
1);b.removeAttributes(["_moz_dirty","data-cke-expando","data-cke-saved-href","data-cke-saved-name"]);a.removeAttributes(["_moz_dirty","data-cke-expando","data-cke-saved-href","data-cke-saved-name"]);if(b.$.isEqualNode)return b.$.style.cssText=CKEDITOR.tools.normalizeCssText(b.$.style.cssText),a.$.style.cssText=CKEDITOR.tools.normalizeCssText(a.$.style.cssText),b.$.isEqualNode(a.$);b=b.getOuterHtml();a=a.getOuterHtml();if(CKEDITOR.env.ie&&9>CKEDITOR.env.version&&this.is("a")){var c=this.getParent();
c.type==CKEDITOR.NODE_ELEMENT&&(c=c.clone(),c.setHtml(b),b=c.getHtml(),c.setHtml(a),a=c.getHtml())}return b==a},isVisible:function(){var a=(this.$.offsetHeight||this.$.offsetWidth)&&"hidden"!=this.getComputedStyle("visibility"),b,c;a&&CKEDITOR.env.webkit&&(b=this.getWindow(),!b.equals(CKEDITOR.document.getWindow())&&(c=b.$.frameElement)&&(a=(new CKEDITOR.dom.element(c)).isVisible()));return!!a},isEmptyInlineRemoveable:function(){if(!CKEDITOR.dtd.$removeEmpty[this.getName()])return!1;for(var a=this.getChildren(),
b=0,c=a.count();b<c;b++){var g=a.getItem(b);if(g.type!=CKEDITOR.NODE_ELEMENT||!g.data("cke-bookmark"))if(g.type==CKEDITOR.NODE_ELEMENT&&!g.isEmptyInlineRemoveable()||g.type==CKEDITOR.NODE_TEXT&&CKEDITOR.tools.trim(g.getText()))return!1}return!0},hasAttributes:CKEDITOR.env.ie&&(CKEDITOR.env.ie7Compat||CKEDITOR.env.quirks)?function(){for(var a=this.$.attributes,b=0;b<a.length;b++){var c=a[b];switch(c.nodeName){case "class":if(this.getAttribute("class"))return!0;case "data-cke-expando":continue;default:if(c.specified)return!0}}return!1}:
function(){var a=this.$.attributes,b=a.length,c={"data-cke-expando":1,_moz_dirty:1};return 0<b&&(2<b||!c[a[0].nodeName]||2==b&&!c[a[1].nodeName])},hasAttribute:function(){function a(b){var c=this.$.attributes.getNamedItem(b);if("input"==this.getName())switch(b){case "class":return 0<this.$.className.length;case "checked":return!!this.$.checked;case "value":return b=this.getAttribute("type"),"checkbox"==b||"radio"==b?"on"!=this.$.value:!!this.$.value}return c?c.specified:!1}return CKEDITOR.env.ie?
8>CKEDITOR.env.version?function(b){return"name"==b?!!this.$.name:a.call(this,b)}:a:function(a){return!!this.$.attributes.getNamedItem(a)}}(),hide:function(){this.setStyle("display","none")},moveChildren:function(a,b){var c=this.$;a=a.$;if(c!=a){var g;if(b)for(;g=c.lastChild;)a.insertBefore(c.removeChild(g),a.firstChild);else for(;g=c.firstChild;)a.appendChild(c.removeChild(g))}},mergeSiblings:function(){function a(b,c,g){if(c&&c.type==CKEDITOR.NODE_ELEMENT){for(var d=[];c.data("cke-bookmark")||c.isEmptyInlineRemoveable();)if(d.push(c),
c=g?c.getNext():c.getPrevious(),!c||c.type!=CKEDITOR.NODE_ELEMENT)return;if(b.isIdentical(c)){for(var l=g?b.getLast():b.getFirst();d.length;)d.shift().move(b,!g);c.moveChildren(b,!g);c.remove();l&&l.type==CKEDITOR.NODE_ELEMENT&&l.mergeSiblings()}}}return function(b){if(!1===b||CKEDITOR.dtd.$removeEmpty[this.getName()]||this.is("a"))a(this,this.getNext(),!0),a(this,this.getPrevious())}}(),show:function(){this.setStyles({display:"",visibility:""})},setAttribute:function(){var a=function(a,b){this.$.setAttribute(a,
b);return this};return CKEDITOR.env.ie&&(CKEDITOR.env.ie7Compat||CKEDITOR.env.quirks)?function(b,c){"class"==b?this.$.className=c:"style"==b?this.$.style.cssText=c:"tabindex"==b?this.$.tabIndex=c:"checked"==b?this.$.checked=c:"contenteditable"==b?a.call(this,"contentEditable",c):a.apply(this,arguments);return this}:CKEDITOR.env.ie8Compat&&CKEDITOR.env.secure?function(b,c){if("src"==b&&c.match(/^http:\/\//))try{a.apply(this,arguments)}catch(g){}else a.apply(this,arguments);return this}:a}(),setAttributes:function(a){for(var b in a)this.setAttribute(b,
a[b]);return this},setValue:function(a){this.$.value=a;return this},removeAttribute:function(){var a=function(a){this.$.removeAttribute(a)};return CKEDITOR.env.ie&&(CKEDITOR.env.ie7Compat||CKEDITOR.env.quirks)?function(a){"class"==a?a="className":"tabindex"==a?a="tabIndex":"contenteditable"==a&&(a="contentEditable");this.$.removeAttribute(a)}:a}(),removeAttributes:function(a){if(CKEDITOR.tools.isArray(a))for(var b=0;b<a.length;b++)this.removeAttribute(a[b]);else for(b in a)a.hasOwnProperty(b)&&this.removeAttribute(b)},
removeStyle:function(a){var b=this.$.style;if(b.removeProperty||"border"!=a&&"margin"!=a&&"padding"!=a)b.removeProperty?b.removeProperty(a):b.removeAttribute(CKEDITOR.tools.cssStyleToDomStyle(a)),this.$.style.cssText||this.removeAttribute("style");else{var c=["top","left","right","bottom"],g;"border"==a&&(g=["color","style","width"]);for(var b=[],d=0;d<c.length;d++)if(g)for(var A=0;A<g.length;A++)b.push([a,c[d],g[A]].join("-"));else b.push([a,c[d]].join("-"));for(a=0;a<b.length;a++)this.removeStyle(b[a])}},
setStyle:function(a,b){this.$.style[CKEDITOR.tools.cssStyleToDomStyle(a)]=b;return this},setStyles:function(a){for(var b in a)this.setStyle(b,a[b]);return this},setOpacity:function(a){CKEDITOR.env.ie&&9>CKEDITOR.env.version?(a=Math.round(100*a),this.setStyle("filter",100<=a?"":"progid:DXImageTransform.Microsoft.Alpha(opacity\x3d"+a+")")):this.setStyle("opacity",a)},unselectable:function(){this.setStyles(CKEDITOR.tools.cssVendorPrefix("user-select","none"));if(CKEDITOR.env.ie){this.setAttribute("unselectable",
"on");for(var a,b=this.getElementsByTag("*"),c=0,g=b.count();c<g;c++)a=b.getItem(c),a.setAttribute("unselectable","on")}},getPositionedAncestor:function(){for(var a=this;"html"!=a.getName();){if("static"!=a.getComputedStyle("position"))return a;a=a.getParent()}return null},getDocumentPosition:function(a){var b=0,c=0,g=this.getDocument(),d=g.getBody(),A="BackCompat"==g.$.compatMode;if(document.documentElement.getBoundingClientRect){var e=this.$.getBoundingClientRect(),f=g.$.documentElement,n=f.clientTop||
d.$.clientTop||0,y=f.clientLeft||d.$.clientLeft||0,k=!0;CKEDITOR.env.ie&&(k=g.getDocumentElement().contains(this),g=g.getBody().contains(this),k=A&&g||!A&&k);k&&(CKEDITOR.env.webkit||CKEDITOR.env.ie&&12<=CKEDITOR.env.version?(b=d.$.scrollLeft||f.scrollLeft,c=d.$.scrollTop||f.scrollTop):(c=A?d.$:f,b=c.scrollLeft,c=c.scrollTop),b=e.left+b-y,c=e.top+c-n)}else for(n=this,y=null;n&&"body"!=n.getName()&&"html"!=n.getName();){b+=n.$.offsetLeft-n.$.scrollLeft;c+=n.$.offsetTop-n.$.scrollTop;n.equals(this)||
(b+=n.$.clientLeft||0,c+=n.$.clientTop||0);for(;y&&!y.equals(n);)b-=y.$.scrollLeft,c-=y.$.scrollTop,y=y.getParent();y=n;n=(e=n.$.offsetParent)?new CKEDITOR.dom.element(e):null}a&&(e=this.getWindow(),n=a.getWindow(),!e.equals(n)&&e.$.frameElement&&(a=(new CKEDITOR.dom.element(e.$.frameElement)).getDocumentPosition(a),b+=a.x,c+=a.y));document.documentElement.getBoundingClientRect||!CKEDITOR.env.gecko||A||(b+=this.$.clientLeft?1:0,c+=this.$.clientTop?1:0);return{x:b,y:c}},scrollIntoView:function(a){var b=
this.getParent();if(b){do if((b.$.clientWidth&&b.$.clientWidth<b.$.scrollWidth||b.$.clientHeight&&b.$.clientHeight<b.$.scrollHeight)&&!b.is("body")&&this.scrollIntoParent(b,a,1),b.is("html")){var c=b.getWindow();try{var g=c.$.frameElement;g&&(b=new CKEDITOR.dom.element(g))}catch(d){}}while(b=b.getParent())}},scrollIntoParent:function(a,b,c){var g,d,e,v;function f(b,c){/body|html/.test(a.getName())?a.getWindow().$.scrollBy(b,c):(a.$.scrollLeft+=b,a.$.scrollTop+=c)}function n(a,b){var c={x:0,y:0};if(!a.is(k?
"body":"html")){var g=a.$.getBoundingClientRect();c.x=g.left;c.y=g.top}g=a.getWindow();g.equals(b)||(g=n(CKEDITOR.dom.element.get(g.$.frameElement),b),c.x+=g.x,c.y+=g.y);return c}function y(a,b){return parseInt(a.getComputedStyle("margin-"+b)||0,10)||0}!a&&(a=this.getWindow());e=a.getDocument();var k="BackCompat"==e.$.compatMode;a instanceof CKEDITOR.dom.window&&(a=k?e.getBody():e.getDocumentElement());e=a.getWindow();d=n(this,e);var w=n(a,e),u=this.$.offsetHeight;g=this.$.offsetWidth;var h=a.$.clientHeight,
p=a.$.clientWidth;e=d.x-y(this,"left")-w.x||0;v=d.y-y(this,"top")-w.y||0;g=d.x+g+y(this,"right")-(w.x+p)||0;d=d.y+u+y(this,"bottom")-(w.y+h)||0;(0>v||0<d)&&f(0,!0===b?v:!1===b?d:0>v?v:d);c&&(0>e||0<g)&&f(0>e?e:g,0)},setState:function(a,b,c){b=b||"cke";switch(a){case CKEDITOR.TRISTATE_ON:this.addClass(b+"_on");this.removeClass(b+"_off");this.removeClass(b+"_disabled");c&&this.setAttribute("aria-pressed",!0);c&&this.removeAttribute("aria-disabled");break;case CKEDITOR.TRISTATE_DISABLED:this.addClass(b+
"_disabled");this.removeClass(b+"_off");this.removeClass(b+"_on");c&&this.setAttribute("aria-disabled",!0);c&&this.removeAttribute("aria-pressed");break;default:this.addClass(b+"_off"),this.removeClass(b+"_on"),this.removeClass(b+"_disabled"),c&&this.removeAttribute("aria-pressed"),c&&this.removeAttribute("aria-disabled")}},getFrameDocument:function(){var a=this.$;try{a.contentWindow.document}catch(b){a.src=a.src}return a&&new CKEDITOR.dom.document(a.contentWindow.document)},copyAttributes:function(a,
b){var c=this.$.attributes;b=b||{};for(var g=0;g<c.length;g++){var d=c[g],e=d.nodeName.toLowerCase(),v;if(!(e in b))if("checked"==e&&(v=this.getAttribute(e)))a.setAttribute(e,v);else if(!CKEDITOR.env.ie||this.hasAttribute(e))v=this.getAttribute(e),null===v&&(v=d.nodeValue),a.setAttribute(e,v)}""!==this.$.style.cssText&&(a.$.style.cssText=this.$.style.cssText)},renameNode:function(a){if(this.getName()!=a){var b=this.getDocument();a=new CKEDITOR.dom.element(a,b);this.copyAttributes(a);this.moveChildren(a);
this.getParent(!0)&&this.$.parentNode.replaceChild(a.$,this.$);a.$["data-cke-expando"]=this.$["data-cke-expando"];this.$=a.$;delete this.getName}},getChild:function(){function a(b,c){var g=b.childNodes;if(0<=c&&c<g.length)return g[c]}return function(b){var c=this.$;if(b.slice)for(b=b.slice();0<b.length&&c;)c=a(c,b.shift());else c=a(c,b);return c?new CKEDITOR.dom.node(c):null}}(),getChildCount:function(){return this.$.childNodes.length},disableContextMenu:function(){function a(b){return b.type==CKEDITOR.NODE_ELEMENT&&
b.hasClass("cke_enable_context_menu")}this.on("contextmenu",function(b){b.data.getTarget().getAscendant(a,!0)||b.data.preventDefault()})},getDirection:function(a){return a?this.getComputedStyle("direction")||this.getDirection()||this.getParent()&&this.getParent().getDirection(1)||this.getDocument().$.dir||"ltr":this.getStyle("direction")||this.getAttribute("dir")},data:function(a,b){a="data-"+a;if(void 0===b)return this.getAttribute(a);!1===b?this.removeAttribute(a):this.setAttribute(a,b);return null},
getEditor:function(){var a=CKEDITOR.instances,b,c;for(b in a)if(c=a[b],c.element.equals(this)&&c.elementMode!=CKEDITOR.ELEMENT_MODE_APPENDTO)return c;return null},find:function(a){var c=d(this);a=new CKEDITOR.dom.nodeList(this.$.querySelectorAll(b(this,a)));c();return a},findOne:function(a){var c=d(this);a=this.$.querySelector(b(this,a));c();return a?new CKEDITOR.dom.element(a):null},forEach:function(a,b,c){if(!(c||b&&this.type!=b))var g=a(this);if(!1!==g){c=this.getChildren();for(var d=0;d<c.count();d++)g=
c.getItem(d),g.type==CKEDITOR.NODE_ELEMENT?g.forEach(a,b):b&&g.type!=b||a(g)}}});var k={width:["border-left-width","border-right-width","padding-left","padding-right"],height:["border-top-width","border-bottom-width","padding-top","padding-bottom"]};CKEDITOR.dom.element.prototype.setSize=function(a,b,d){"number"==typeof b&&(!d||CKEDITOR.env.ie&&CKEDITOR.env.quirks||(b-=c.call(this,a)),this.setStyle(a,b+"px"))};CKEDITOR.dom.element.prototype.getSize=function(a,b){var d=Math.max(this.$["offset"+CKEDITOR.tools.capitalize(a)],
this.$["client"+CKEDITOR.tools.capitalize(a)])||0;b&&(d-=c.call(this,a));return d}})();CKEDITOR.dom.documentFragment=function(a){a=a||CKEDITOR.document;this.$=a.type==CKEDITOR.NODE_DOCUMENT?a.$.createDocumentFragment():a};
CKEDITOR.tools.extend(CKEDITOR.dom.documentFragment.prototype,CKEDITOR.dom.element.prototype,{type:CKEDITOR.NODE_DOCUMENT_FRAGMENT,insertAfterNode:function(a){a=a.$;a.parentNode.insertBefore(this.$,a.nextSibling)},getHtml:function(){var a=new CKEDITOR.dom.element("div");this.clone(1,1).appendTo(a);return a.getHtml().replace(/\s*data-cke-expando=".*?"/g,"")}},!0,{append:1,appendBogus:1,clone:1,getFirst:1,getHtml:1,getLast:1,getParent:1,getNext:1,getPrevious:1,appendTo:1,moveChildren:1,insertBefore:1,
insertAfterNode:1,replace:1,trim:1,type:1,ltrim:1,rtrim:1,getDocument:1,getChildCount:1,getChild:1,getChildren:1});
(function(){function a(a,b){var c=this.range;if(this._.end)return null;if(!this._.start){this._.start=1;if(c.collapsed)return this.end(),null;c.optimize()}var g,d=c.startContainer;g=c.endContainer;var e=c.startOffset,z=c.endOffset,u,h=this.guard,p=this.type,m=a?"getPreviousSourceNode":"getNextSourceNode";if(!a&&!this._.guardLTR){var D=g.type==CKEDITOR.NODE_ELEMENT?g:g.getParent(),r=g.type==CKEDITOR.NODE_ELEMENT?g.getChild(z):g.getNext();this._.guardLTR=function(a,b){return(!b||!D.equals(a))&&(!r||
!a.equals(r))&&(a.type!=CKEDITOR.NODE_ELEMENT||!b||!a.equals(c.root))}}if(a&&!this._.guardRTL){var G=d.type==CKEDITOR.NODE_ELEMENT?d:d.getParent(),f=d.type==CKEDITOR.NODE_ELEMENT?e?d.getChild(e-1):null:d.getPrevious();this._.guardRTL=function(a,b){return(!b||!G.equals(a))&&(!f||!a.equals(f))&&(a.type!=CKEDITOR.NODE_ELEMENT||!b||!a.equals(c.root))}}var k=a?this._.guardRTL:this._.guardLTR;u=h?function(a,b){return!1===k(a,b)?!1:h(a,b)}:k;this.current?g=this.current[m](!1,p,u):(a?g.type==CKEDITOR.NODE_ELEMENT&&
(g=0<z?g.getChild(z-1):!1===u(g,!0)?null:g.getPreviousSourceNode(!0,p,u)):(g=d,g.type==CKEDITOR.NODE_ELEMENT&&((g=g.getChild(e))||(g=!1===u(d,!0)?null:d.getNextSourceNode(!0,p,u)))),g&&!1===u(g)&&(g=null));for(;g&&!this._.end;){this.current=g;if(!this.evaluator||!1!==this.evaluator(g)){if(!b)return g}else if(b&&this.evaluator)return!1;g=g[m](!1,p,u)}this.end();return this.current=null}function d(b){for(var c,g=null;c=a.call(this,b);)g=c;return g}CKEDITOR.dom.walker=CKEDITOR.tools.createClass({$:function(a){this.range=
a;this._={}},proto:{end:function(){this._.end=1},next:function(){return a.call(this)},previous:function(){return a.call(this,1)},checkForward:function(){return!1!==a.call(this,0,1)},checkBackward:function(){return!1!==a.call(this,1,1)},lastForward:function(){return d.call(this)},lastBackward:function(){return d.call(this,1)},reset:function(){delete this.current;this._={}}}});var b={block:1,"list-item":1,table:1,"table-row-group":1,"table-header-group":1,"table-footer-group":1,"table-row":1,"table-column-group":1,
"table-column":1,"table-cell":1,"table-caption":1},c={absolute:1,fixed:1};CKEDITOR.dom.element.prototype.isBlockBoundary=function(a){return"none"!=this.getComputedStyle("float")||this.getComputedStyle("position")in c||!b[this.getComputedStyle("display")]?!!(this.is(CKEDITOR.dtd.$block)||a&&this.is(a)):!0};CKEDITOR.dom.walker.blockBoundary=function(a){return function(b){return!(b.type==CKEDITOR.NODE_ELEMENT&&b.isBlockBoundary(a))}};CKEDITOR.dom.walker.listItemBoundary=function(){return this.blockBoundary({br:1})};
CKEDITOR.dom.walker.bookmark=function(a,b){function c(a){return a&&a.getName&&"span"==a.getName()&&a.data("cke-bookmark")}return function(g){var d,e;d=g&&g.type!=CKEDITOR.NODE_ELEMENT&&(e=g.getParent())&&c(e);d=a?d:d||c(g);return!!(b^d)}};CKEDITOR.dom.walker.whitespaces=function(a){return function(b){var c;b&&b.type==CKEDITOR.NODE_TEXT&&(c=!CKEDITOR.tools.trim(b.getText())||CKEDITOR.env.webkit&&"​"==b.getText());return!!(a^c)}};CKEDITOR.dom.walker.invisible=function(a){var b=CKEDITOR.dom.walker.whitespaces(),
c=CKEDITOR.env.webkit?1:0;return function(g){b(g)?g=1:(g.type==CKEDITOR.NODE_TEXT&&(g=g.getParent()),g=g.$.offsetWidth<=c);return!!(a^g)}};CKEDITOR.dom.walker.nodeType=function(a,b){return function(c){return!!(b^c.type==a)}};CKEDITOR.dom.walker.bogus=function(a){function b(a){return!f(a)&&!k(a)}return function(c){var g=CKEDITOR.env.needsBrFiller?c.is&&c.is("br"):c.getText&&e.test(c.getText());g&&(g=c.getParent(),c=c.getNext(b),g=g.isBlockBoundary()&&(!c||c.type==CKEDITOR.NODE_ELEMENT&&c.isBlockBoundary()));
return!!(a^g)}};CKEDITOR.dom.walker.temp=function(a){return function(b){b.type!=CKEDITOR.NODE_ELEMENT&&(b=b.getParent());b=b&&b.hasAttribute("data-cke-temp");return!!(a^b)}};var e=/^[\t\r\n ]*(?:&nbsp;|\xa0)$/,f=CKEDITOR.dom.walker.whitespaces(),k=CKEDITOR.dom.walker.bookmark(),l=CKEDITOR.dom.walker.temp(),q=function(a){return k(a)||f(a)||a.type==CKEDITOR.NODE_ELEMENT&&a.is(CKEDITOR.dtd.$inline)&&!a.is(CKEDITOR.dtd.$empty)};CKEDITOR.dom.walker.ignored=function(a){return function(b){b=f(b)||k(b)||
l(b);return!!(a^b)}};var t=CKEDITOR.dom.walker.ignored();CKEDITOR.dom.walker.empty=function(a){return function(b){for(var c=0,g=b.getChildCount();c<g;++c)if(!t(b.getChild(c)))return!!a;return!a}};var g=CKEDITOR.dom.walker.empty(),z=CKEDITOR.dom.walker.validEmptyBlockContainers=CKEDITOR.tools.extend(function(a){var b={},c;for(c in a)CKEDITOR.dtd[c]["#"]&&(b[c]=1);return b}(CKEDITOR.dtd.$block),{caption:1,td:1,th:1});CKEDITOR.dom.walker.editable=function(a){return function(b){b=t(b)?!1:b.type==CKEDITOR.NODE_TEXT||
b.type==CKEDITOR.NODE_ELEMENT&&(b.is(CKEDITOR.dtd.$inline)||b.is("hr")||"false"==b.getAttribute("contenteditable")||!CKEDITOR.env.needsBrFiller&&b.is(z)&&g(b))?!0:!1;return!!(a^b)}};CKEDITOR.dom.element.prototype.getBogus=function(){var a=this;do a=a.getPreviousSourceNode();while(q(a));return a&&(CKEDITOR.env.needsBrFiller?a.is&&a.is("br"):a.getText&&e.test(a.getText()))?a:!1}})();
CKEDITOR.dom.range=function(a){this.endOffset=this.endContainer=this.startOffset=this.startContainer=null;this.collapsed=!0;var d=a instanceof CKEDITOR.dom.document;this.document=d?a:a.getDocument();this.root=d?a.getBody():a};
(function(){function a(a){a.collapsed=a.startContainer&&a.endContainer&&a.startContainer.equals(a.endContainer)&&a.startOffset==a.endOffset}function d(a,b,c,d,e){function n(a,b,c,g){var d=c?a.getPrevious():a.getNext();if(g&&l)return d;h||g?b.append(a.clone(!0,e),c):(a.remove(),u&&b.append(a));return d}function f(){var a,b,c,g=Math.min(x.length,H.length);for(a=0;a<g;a++)if(b=x[a],c=H[a],!b.equals(c))return a;return a-1}function k(){var b=I-1,c=t&&q&&!p.equals(m);b<E-1||b<J-1||c?(c?a.moveToPosition(m,
CKEDITOR.POSITION_BEFORE_START):J==b+1&&B?a.moveToPosition(H[b],CKEDITOR.POSITION_BEFORE_END):a.moveToPosition(H[b+1],CKEDITOR.POSITION_BEFORE_START),d&&(b=x[b+1])&&b.type==CKEDITOR.NODE_ELEMENT&&(c=CKEDITOR.dom.element.createFromHtml('\x3cspan data-cke-bookmark\x3d"1" style\x3d"display:none"\x3e\x26nbsp;\x3c/span\x3e',a.document),c.insertAfter(b),b.mergeSiblings(!1),a.moveToBookmark({startNode:c}))):a.collapse(!0)}a.optimizeBookmark();var l=0===b,u=1==b,h=2==b;b=h||u;var p=a.startContainer,m=a.endContainer,
D=a.startOffset,r=a.endOffset,G,B,t,q,M,S;if(h&&m.type==CKEDITOR.NODE_TEXT&&p.equals(m))p=a.document.createText(p.substring(D,r)),c.append(p);else{m.type==CKEDITOR.NODE_TEXT?h?S=!0:m=m.split(r):0<m.getChildCount()?r>=m.getChildCount()?(m=m.getChild(r-1),B=!0):m=m.getChild(r):q=B=!0;p.type==CKEDITOR.NODE_TEXT?h?M=!0:p.split(D):0<p.getChildCount()?0===D?(p=p.getChild(D),G=!0):p=p.getChild(D-1):t=G=!0;for(var x=p.getParents(),H=m.getParents(),I=f(),E=x.length-1,J=H.length-1,O=c,K,aa,W,fa=-1,P=I;P<=E;P++){aa=
x[P];W=aa.getNext();for(P!=E||aa.equals(H[P])&&E<J?b&&(K=O.append(aa.clone(0,e))):G?n(aa,O,!1,t):M&&O.append(a.document.createText(aa.substring(D)));W;){if(W.equals(H[P])){fa=P;break}W=n(W,O)}O=K}O=c;for(P=I;P<=J;P++)if(c=H[P],W=c.getPrevious(),c.equals(x[P]))b&&(O=O.getChild(0));else{P!=J||c.equals(x[P])&&J<E?b&&(K=O.append(c.clone(0,e))):B?n(c,O,!1,q):S&&O.append(a.document.createText(c.substring(0,r)));if(P>fa)for(;W;)W=n(W,O,!0);O=K}h||k()}}function b(){var a=!1,b=CKEDITOR.dom.walker.whitespaces(),
c=CKEDITOR.dom.walker.bookmark(!0),d=CKEDITOR.dom.walker.bogus();return function(e){return c(e)||b(e)?!0:d(e)&&!a?a=!0:e.type==CKEDITOR.NODE_TEXT&&(e.hasAscendant("pre")||CKEDITOR.tools.trim(e.getText()).length)||e.type==CKEDITOR.NODE_ELEMENT&&!e.is(f)?!1:!0}}function c(a){var b=CKEDITOR.dom.walker.whitespaces(),c=CKEDITOR.dom.walker.bookmark(1);return function(d){return c(d)||b(d)?!0:!a&&k(d)||d.type==CKEDITOR.NODE_ELEMENT&&d.is(CKEDITOR.dtd.$removeEmpty)}}function e(a){return function(){var b;return this[a?
"getPreviousNode":"getNextNode"](function(a){!b&&t(a)&&(b=a);return q(a)&&!(k(a)&&a.equals(b))})}}var f={abbr:1,acronym:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,"var":1},k=CKEDITOR.dom.walker.bogus(),l=/^[\t\r\n ]*(?:&nbsp;|\xa0)$/,q=CKEDITOR.dom.walker.editable(),t=CKEDITOR.dom.walker.ignored(!0);CKEDITOR.dom.range.prototype={clone:function(){var a=new CKEDITOR.dom.range(this.root);a._setStartContainer(this.startContainer);
a.startOffset=this.startOffset;a._setEndContainer(this.endContainer);a.endOffset=this.endOffset;a.collapsed=this.collapsed;return a},collapse:function(a){a?(this._setEndContainer(this.startContainer),this.endOffset=this.startOffset):(this._setStartContainer(this.endContainer),this.startOffset=this.endOffset);this.collapsed=!0},cloneContents:function(a){var b=new CKEDITOR.dom.documentFragment(this.document);this.collapsed||d(this,2,b,!1,"undefined"==typeof a?!0:a);return b},deleteContents:function(a){this.collapsed||
d(this,0,null,a)},extractContents:function(a,b){var c=new CKEDITOR.dom.documentFragment(this.document);this.collapsed||d(this,1,c,a,"undefined"==typeof b?!0:b);return c},createBookmark:function(a){var b,c,d,e,n=this.collapsed;b=this.document.createElement("span");b.data("cke-bookmark",1);b.setStyle("display","none");b.setHtml("\x26nbsp;");a&&(d="cke_bm_"+CKEDITOR.tools.getNextNumber(),b.setAttribute("id",d+(n?"C":"S")));n||(c=b.clone(),c.setHtml("\x26nbsp;"),a&&c.setAttribute("id",d+"E"),e=this.clone(),
e.collapse(),e.insertNode(c));e=this.clone();e.collapse(!0);e.insertNode(b);c?(this.setStartAfter(b),this.setEndBefore(c)):this.moveToPosition(b,CKEDITOR.POSITION_AFTER_END);return{startNode:a?d+(n?"C":"S"):b,endNode:a?d+"E":c,serializable:a,collapsed:n}},createBookmark2:function(){function a(c){var g=c.container,d=c.offset,e;e=g;var f=d;e=e.type!=CKEDITOR.NODE_ELEMENT||0===f||f==e.getChildCount()?0:e.getChild(f-1).type==CKEDITOR.NODE_TEXT&&e.getChild(f).type==CKEDITOR.NODE_TEXT;e&&(g=g.getChild(d-
1),d=g.getLength());g.type==CKEDITOR.NODE_ELEMENT&&1<d&&(d=g.getChild(d-1).getIndex(!0)+1);if(g.type==CKEDITOR.NODE_TEXT){e=g;for(f=0;(e=e.getPrevious())&&e.type==CKEDITOR.NODE_TEXT;)f+=e.getLength();e=f;g.getText()?d+=e:(f=g.getPrevious(b),e?(d=e,g=f?f.getNext():g.getParent().getFirst()):(g=g.getParent(),d=f?f.getIndex(!0)+1:0))}c.container=g;c.offset=d}var b=CKEDITOR.dom.walker.nodeType(CKEDITOR.NODE_TEXT,!0);return function(b){var c=this.collapsed,d={container:this.startContainer,offset:this.startOffset},
e={container:this.endContainer,offset:this.endOffset};b&&(a(d),c||a(e));return{start:d.container.getAddress(b),end:c?null:e.container.getAddress(b),startOffset:d.offset,endOffset:e.offset,normalized:b,collapsed:c,is2:!0}}}(),moveToBookmark:function(a){if(a.is2){var b=this.document.getByAddress(a.start,a.normalized),c=a.startOffset,d=a.end&&this.document.getByAddress(a.end,a.normalized);a=a.endOffset;this.setStart(b,c);d?this.setEnd(d,a):this.collapse(!0)}else b=(c=a.serializable)?this.document.getById(a.startNode):
a.startNode,a=c?this.document.getById(a.endNode):a.endNode,this.setStartBefore(b),b.remove(),a?(this.setEndBefore(a),a.remove()):this.collapse(!0)},getBoundaryNodes:function(){var a=this.startContainer,b=this.endContainer,c=this.startOffset,d=this.endOffset,e;if(a.type==CKEDITOR.NODE_ELEMENT)if(e=a.getChildCount(),e>c)a=a.getChild(c);else if(1>e)a=a.getPreviousSourceNode();else{for(a=a.$;a.lastChild;)a=a.lastChild;a=new CKEDITOR.dom.node(a);a=a.getNextSourceNode()||a}if(b.type==CKEDITOR.NODE_ELEMENT)if(e=
b.getChildCount(),e>d)b=b.getChild(d).getPreviousSourceNode(!0);else if(1>e)b=b.getPreviousSourceNode();else{for(b=b.$;b.lastChild;)b=b.lastChild;b=new CKEDITOR.dom.node(b)}a.getPosition(b)&CKEDITOR.POSITION_FOLLOWING&&(a=b);return{startNode:a,endNode:b}},getCommonAncestor:function(a,b){var c=this.startContainer,d=this.endContainer,c=c.equals(d)?a&&c.type==CKEDITOR.NODE_ELEMENT&&this.startOffset==this.endOffset-1?c.getChild(this.startOffset):c:c.getCommonAncestor(d);return b&&!c.is?c.getParent():
c},optimize:function(){var a=this.startContainer,b=this.startOffset;a.type!=CKEDITOR.NODE_ELEMENT&&(b?b>=a.getLength()&&this.setStartAfter(a):this.setStartBefore(a));a=this.endContainer;b=this.endOffset;a.type!=CKEDITOR.NODE_ELEMENT&&(b?b>=a.getLength()&&this.setEndAfter(a):this.setEndBefore(a))},optimizeBookmark:function(){var a=this.startContainer,b=this.endContainer;a.is&&a.is("span")&&a.data("cke-bookmark")&&this.setStartAt(a,CKEDITOR.POSITION_BEFORE_START);b&&b.is&&b.is("span")&&b.data("cke-bookmark")&&
this.setEndAt(b,CKEDITOR.POSITION_AFTER_END)},trim:function(a,b){var c=this.startContainer,d=this.startOffset,e=this.collapsed;if((!a||e)&&c&&c.type==CKEDITOR.NODE_TEXT){if(d)if(d>=c.getLength())d=c.getIndex()+1,c=c.getParent();else{var n=c.split(d),d=c.getIndex()+1,c=c.getParent();this.startContainer.equals(this.endContainer)?this.setEnd(n,this.endOffset-this.startOffset):c.equals(this.endContainer)&&(this.endOffset+=1)}else d=c.getIndex(),c=c.getParent();this.setStart(c,d);if(e){this.collapse(!0);
return}}c=this.endContainer;d=this.endOffset;b||e||!c||c.type!=CKEDITOR.NODE_TEXT||(d?(d>=c.getLength()||c.split(d),d=c.getIndex()+1):d=c.getIndex(),c=c.getParent(),this.setEnd(c,d))},enlarge:function(a,b){function c(a){return a&&a.type==CKEDITOR.NODE_ELEMENT&&a.hasAttribute("contenteditable")?null:a}var d=new RegExp(/[^\s\ufeff]/);switch(a){case CKEDITOR.ENLARGE_INLINE:var e=1;case CKEDITOR.ENLARGE_ELEMENT:var n=function(a,b){var c=new CKEDITOR.dom.range(k);c.setStart(a,b);c.setEndAt(k,CKEDITOR.POSITION_BEFORE_END);
var c=new CKEDITOR.dom.walker(c),g;for(c.guard=function(a){return!(a.type==CKEDITOR.NODE_ELEMENT&&a.isBlockBoundary())};g=c.next();){if(g.type!=CKEDITOR.NODE_TEXT)return!1;G=g!=a?g.getText():g.substring(b);if(d.test(G))return!1}return!0};if(this.collapsed)break;var f=this.getCommonAncestor(),k=this.root,l,u,h,p,m,D=!1,r,G;r=this.startContainer;var B=this.startOffset;r.type==CKEDITOR.NODE_TEXT?(B&&(r=!CKEDITOR.tools.trim(r.substring(0,B)).length&&r,D=!!r),r&&((p=r.getPrevious())||(h=r.getParent()))):
(B&&(p=r.getChild(B-1)||r.getLast()),p||(h=r));for(h=c(h);h||p;){if(h&&!p){!m&&h.equals(f)&&(m=!0);if(e?h.isBlockBoundary():!k.contains(h))break;D&&"inline"==h.getComputedStyle("display")||(D=!1,m?l=h:this.setStartBefore(h));p=h.getPrevious()}for(;p;)if(r=!1,p.type==CKEDITOR.NODE_COMMENT)p=p.getPrevious();else{if(p.type==CKEDITOR.NODE_TEXT)G=p.getText(),d.test(G)&&(p=null),r=/[\s\ufeff]$/.test(G);else if((p.$.offsetWidth>(CKEDITOR.env.webkit?1:0)||b&&p.is("br"))&&!p.data("cke-bookmark"))if(D&&CKEDITOR.dtd.$removeEmpty[p.getName()]){G=
p.getText();if(d.test(G))p=null;else for(var B=p.$.getElementsByTagName("*"),t=0,q;q=B[t++];)if(!CKEDITOR.dtd.$removeEmpty[q.nodeName.toLowerCase()]){p=null;break}p&&(r=!!G.length)}else p=null;r&&(D?m?l=h:h&&this.setStartBefore(h):D=!0);if(p){r=p.getPrevious();if(!h&&!r){h=p;p=null;break}p=r}else h=null}h&&(h=c(h.getParent()))}r=this.endContainer;B=this.endOffset;h=p=null;m=D=!1;r.type==CKEDITOR.NODE_TEXT?CKEDITOR.tools.trim(r.substring(B)).length?D=!0:(D=!r.getLength(),B==r.getLength()?(p=r.getNext())||
(h=r.getParent()):n(r,B)&&(h=r.getParent())):(p=r.getChild(B))||(h=r);for(;h||p;){if(h&&!p){!m&&h.equals(f)&&(m=!0);if(e?h.isBlockBoundary():!k.contains(h))break;D&&"inline"==h.getComputedStyle("display")||(D=!1,m?u=h:h&&this.setEndAfter(h));p=h.getNext()}for(;p;){r=!1;if(p.type==CKEDITOR.NODE_TEXT)G=p.getText(),n(p,0)||(p=null),r=/^[\s\ufeff]/.test(G);else if(p.type==CKEDITOR.NODE_ELEMENT){if((0<p.$.offsetWidth||b&&p.is("br"))&&!p.data("cke-bookmark"))if(D&&CKEDITOR.dtd.$removeEmpty[p.getName()]){G=
p.getText();if(d.test(G))p=null;else for(B=p.$.getElementsByTagName("*"),t=0;q=B[t++];)if(!CKEDITOR.dtd.$removeEmpty[q.nodeName.toLowerCase()]){p=null;break}p&&(r=!!G.length)}else p=null}else r=1;r&&D&&(m?u=h:this.setEndAfter(h));if(p){r=p.getNext();if(!h&&!r){h=p;p=null;break}p=r}else h=null}h&&(h=c(h.getParent()))}l&&u&&(f=l.contains(u)?u:l,this.setStartBefore(f),this.setEndAfter(f));break;case CKEDITOR.ENLARGE_BLOCK_CONTENTS:case CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS:h=new CKEDITOR.dom.range(this.root);
k=this.root;h.setStartAt(k,CKEDITOR.POSITION_AFTER_START);h.setEnd(this.startContainer,this.startOffset);h=new CKEDITOR.dom.walker(h);var M,S,x=CKEDITOR.dom.walker.blockBoundary(a==CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS?{br:1}:null),H=null,I=function(a){if(a.type==CKEDITOR.NODE_ELEMENT&&"false"==a.getAttribute("contenteditable"))if(H){if(H.equals(a)){H=null;return}}else H=a;else if(H)return;var b=x(a);b||(M=a);return b},e=function(a){var b=I(a);!b&&a.is&&a.is("br")&&(S=a);return b};h.guard=I;h=h.lastBackward();
M=M||k;this.setStartAt(M,!M.is("br")&&(!h&&this.checkStartOfBlock()||h&&M.contains(h))?CKEDITOR.POSITION_AFTER_START:CKEDITOR.POSITION_AFTER_END);if(a==CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS){h=this.clone();h=new CKEDITOR.dom.walker(h);var E=CKEDITOR.dom.walker.whitespaces(),J=CKEDITOR.dom.walker.bookmark();h.evaluator=function(a){return!E(a)&&!J(a)};if((h=h.previous())&&h.type==CKEDITOR.NODE_ELEMENT&&h.is("br"))break}h=this.clone();h.collapse();h.setEndAt(k,CKEDITOR.POSITION_BEFORE_END);h=new CKEDITOR.dom.walker(h);
h.guard=a==CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS?e:I;M=H=S=null;h=h.lastForward();M=M||k;this.setEndAt(M,!h&&this.checkEndOfBlock()||h&&M.contains(h)?CKEDITOR.POSITION_BEFORE_END:CKEDITOR.POSITION_BEFORE_START);S&&this.setEndAfter(S)}},shrink:function(a,b,c){if(!this.collapsed){a=a||CKEDITOR.SHRINK_TEXT;var d=this.clone(),e=this.startContainer,n=this.endContainer,f=this.startOffset,k=this.endOffset,l=1,u=1;e&&e.type==CKEDITOR.NODE_TEXT&&(f?f>=e.getLength()?d.setStartAfter(e):(d.setStartBefore(e),l=
0):d.setStartBefore(e));n&&n.type==CKEDITOR.NODE_TEXT&&(k?k>=n.getLength()?d.setEndAfter(n):(d.setEndAfter(n),u=0):d.setEndBefore(n));var d=new CKEDITOR.dom.walker(d),h=CKEDITOR.dom.walker.bookmark();d.evaluator=function(b){return b.type==(a==CKEDITOR.SHRINK_ELEMENT?CKEDITOR.NODE_ELEMENT:CKEDITOR.NODE_TEXT)};var p;d.guard=function(b,d){if(h(b))return!0;if(a==CKEDITOR.SHRINK_ELEMENT&&b.type==CKEDITOR.NODE_TEXT||d&&b.equals(p)||!1===c&&b.type==CKEDITOR.NODE_ELEMENT&&b.isBlockBoundary()||b.type==CKEDITOR.NODE_ELEMENT&&
b.hasAttribute("contenteditable"))return!1;d||b.type!=CKEDITOR.NODE_ELEMENT||(p=b);return!0};l&&(e=d[a==CKEDITOR.SHRINK_ELEMENT?"lastForward":"next"]())&&this.setStartAt(e,b?CKEDITOR.POSITION_AFTER_START:CKEDITOR.POSITION_BEFORE_START);u&&(d.reset(),(d=d[a==CKEDITOR.SHRINK_ELEMENT?"lastBackward":"previous"]())&&this.setEndAt(d,b?CKEDITOR.POSITION_BEFORE_END:CKEDITOR.POSITION_AFTER_END));return!(!l&&!u)}},insertNode:function(a){this.optimizeBookmark();this.trim(!1,!0);var b=this.startContainer,c=b.getChild(this.startOffset);
c?a.insertBefore(c):b.append(a);a.getParent()&&a.getParent().equals(this.endContainer)&&this.endOffset++;this.setStartBefore(a)},moveToPosition:function(a,b){this.setStartAt(a,b);this.collapse(!0)},moveToRange:function(a){this.setStart(a.startContainer,a.startOffset);this.setEnd(a.endContainer,a.endOffset)},selectNodeContents:function(a){this.setStart(a,0);this.setEnd(a,a.type==CKEDITOR.NODE_TEXT?a.getLength():a.getChildCount())},setStart:function(b,c){b.type==CKEDITOR.NODE_ELEMENT&&CKEDITOR.dtd.$empty[b.getName()]&&
(c=b.getIndex(),b=b.getParent());this._setStartContainer(b);this.startOffset=c;this.endContainer||(this._setEndContainer(b),this.endOffset=c);a(this)},setEnd:function(b,c){b.type==CKEDITOR.NODE_ELEMENT&&CKEDITOR.dtd.$empty[b.getName()]&&(c=b.getIndex()+1,b=b.getParent());this._setEndContainer(b);this.endOffset=c;this.startContainer||(this._setStartContainer(b),this.startOffset=c);a(this)},setStartAfter:function(a){this.setStart(a.getParent(),a.getIndex()+1)},setStartBefore:function(a){this.setStart(a.getParent(),
a.getIndex())},setEndAfter:function(a){this.setEnd(a.getParent(),a.getIndex()+1)},setEndBefore:function(a){this.setEnd(a.getParent(),a.getIndex())},setStartAt:function(b,c){switch(c){case CKEDITOR.POSITION_AFTER_START:this.setStart(b,0);break;case CKEDITOR.POSITION_BEFORE_END:b.type==CKEDITOR.NODE_TEXT?this.setStart(b,b.getLength()):this.setStart(b,b.getChildCount());break;case CKEDITOR.POSITION_BEFORE_START:this.setStartBefore(b);break;case CKEDITOR.POSITION_AFTER_END:this.setStartAfter(b)}a(this)},
setEndAt:function(b,c){switch(c){case CKEDITOR.POSITION_AFTER_START:this.setEnd(b,0);break;case CKEDITOR.POSITION_BEFORE_END:b.type==CKEDITOR.NODE_TEXT?this.setEnd(b,b.getLength()):this.setEnd(b,b.getChildCount());break;case CKEDITOR.POSITION_BEFORE_START:this.setEndBefore(b);break;case CKEDITOR.POSITION_AFTER_END:this.setEndAfter(b)}a(this)},fixBlock:function(a,b){var c=this.createBookmark(),d=this.document.createElement(b);this.collapse(a);this.enlarge(CKEDITOR.ENLARGE_BLOCK_CONTENTS);this.extractContents().appendTo(d);
d.trim();this.insertNode(d);var e=d.getBogus();e&&e.remove();d.appendBogus();this.moveToBookmark(c);return d},splitBlock:function(a,b){var c=new CKEDITOR.dom.elementPath(this.startContainer,this.root),d=new CKEDITOR.dom.elementPath(this.endContainer,this.root),e=c.block,n=d.block,f=null;if(!c.blockLimit.equals(d.blockLimit))return null;"br"!=a&&(e||(e=this.fixBlock(!0,a),n=(new CKEDITOR.dom.elementPath(this.endContainer,this.root)).block),n||(n=this.fixBlock(!1,a)));c=e&&this.checkStartOfBlock();
d=n&&this.checkEndOfBlock();this.deleteContents();e&&e.equals(n)&&(d?(f=new CKEDITOR.dom.elementPath(this.startContainer,this.root),this.moveToPosition(n,CKEDITOR.POSITION_AFTER_END),n=null):c?(f=new CKEDITOR.dom.elementPath(this.startContainer,this.root),this.moveToPosition(e,CKEDITOR.POSITION_BEFORE_START),e=null):(n=this.splitElement(e,b||!1),e.is("ul","ol")||e.appendBogus()));return{previousBlock:e,nextBlock:n,wasStartOfBlock:c,wasEndOfBlock:d,elementPath:f}},splitElement:function(a,b){if(!this.collapsed)return null;
this.setEndAt(a,CKEDITOR.POSITION_BEFORE_END);var c=this.extractContents(!1,b||!1),d=a.clone(!1,b||!1);c.appendTo(d);d.insertAfter(a);this.moveToPosition(a,CKEDITOR.POSITION_AFTER_END);return d},removeEmptyBlocksAtEnd:function(){function a(d){return function(a){return b(a)||c(a)||a.type==CKEDITOR.NODE_ELEMENT&&a.isEmptyInlineRemoveable()||d.is("table")&&a.is("caption")?!1:!0}}var b=CKEDITOR.dom.walker.whitespaces(),c=CKEDITOR.dom.walker.bookmark(!1);return function(b){for(var c=this.createBookmark(),
d=this[b?"endPath":"startPath"](),e=d.block||d.blockLimit,f;e&&!e.equals(d.root)&&!e.getFirst(a(e));)f=e.getParent(),this[b?"setEndAt":"setStartAt"](e,CKEDITOR.POSITION_AFTER_END),e.remove(1),e=f;this.moveToBookmark(c)}}(),startPath:function(){return new CKEDITOR.dom.elementPath(this.startContainer,this.root)},endPath:function(){return new CKEDITOR.dom.elementPath(this.endContainer,this.root)},checkBoundaryOfElement:function(a,b){var d=b==CKEDITOR.START,e=this.clone();e.collapse(d);e[d?"setStartAt":
"setEndAt"](a,d?CKEDITOR.POSITION_AFTER_START:CKEDITOR.POSITION_BEFORE_END);e=new CKEDITOR.dom.walker(e);e.evaluator=c(d);return e[d?"checkBackward":"checkForward"]()},checkStartOfBlock:function(){var a=this.startContainer,c=this.startOffset;CKEDITOR.env.ie&&c&&a.type==CKEDITOR.NODE_TEXT&&(a=CKEDITOR.tools.ltrim(a.substring(0,c)),l.test(a)&&this.trim(0,1));this.trim();a=new CKEDITOR.dom.elementPath(this.startContainer,this.root);c=this.clone();c.collapse(!0);c.setStartAt(a.block||a.blockLimit,CKEDITOR.POSITION_AFTER_START);
a=new CKEDITOR.dom.walker(c);a.evaluator=b();return a.checkBackward()},checkEndOfBlock:function(){var a=this.endContainer,c=this.endOffset;CKEDITOR.env.ie&&a.type==CKEDITOR.NODE_TEXT&&(a=CKEDITOR.tools.rtrim(a.substring(c)),l.test(a)&&this.trim(1,0));this.trim();a=new CKEDITOR.dom.elementPath(this.endContainer,this.root);c=this.clone();c.collapse(!1);c.setEndAt(a.block||a.blockLimit,CKEDITOR.POSITION_BEFORE_END);a=new CKEDITOR.dom.walker(c);a.evaluator=b();return a.checkForward()},getPreviousNode:function(a,
b,c){var d=this.clone();d.collapse(1);d.setStartAt(c||this.root,CKEDITOR.POSITION_AFTER_START);c=new CKEDITOR.dom.walker(d);c.evaluator=a;c.guard=b;return c.previous()},getNextNode:function(a,b,c){var d=this.clone();d.collapse();d.setEndAt(c||this.root,CKEDITOR.POSITION_BEFORE_END);c=new CKEDITOR.dom.walker(d);c.evaluator=a;c.guard=b;return c.next()},checkReadOnly:function(){function a(b,c){for(;b;){if(b.type==CKEDITOR.NODE_ELEMENT){if("false"==b.getAttribute("contentEditable")&&!b.data("cke-editable"))return 0;
if(b.is("html")||"true"==b.getAttribute("contentEditable")&&(b.contains(c)||b.equals(c)))break}b=b.getParent()}return 1}return function(){var b=this.startContainer,c=this.endContainer;return!(a(b,c)&&a(c,b))}}(),moveToElementEditablePosition:function(a,b){if(a.type==CKEDITOR.NODE_ELEMENT&&!a.isEditable(!1))return this.moveToPosition(a,b?CKEDITOR.POSITION_AFTER_END:CKEDITOR.POSITION_BEFORE_START),!0;for(var c=0;a;){if(a.type==CKEDITOR.NODE_TEXT){b&&this.endContainer&&this.checkEndOfBlock()&&l.test(a.getText())?
this.moveToPosition(a,CKEDITOR.POSITION_BEFORE_START):this.moveToPosition(a,b?CKEDITOR.POSITION_AFTER_END:CKEDITOR.POSITION_BEFORE_START);c=1;break}if(a.type==CKEDITOR.NODE_ELEMENT)if(a.isEditable())this.moveToPosition(a,b?CKEDITOR.POSITION_BEFORE_END:CKEDITOR.POSITION_AFTER_START),c=1;else if(b&&a.is("br")&&this.endContainer&&this.checkEndOfBlock())this.moveToPosition(a,CKEDITOR.POSITION_BEFORE_START);else if("false"==a.getAttribute("contenteditable")&&a.is(CKEDITOR.dtd.$block))return this.setStartBefore(a),
this.setEndAfter(a),!0;var d=a,e=c,n=void 0;d.type==CKEDITOR.NODE_ELEMENT&&d.isEditable(!1)&&(n=d[b?"getLast":"getFirst"](t));e||n||(n=d[b?"getPrevious":"getNext"](t));a=n}return!!c},moveToClosestEditablePosition:function(a,b){var c,d=0,e,n,f=[CKEDITOR.POSITION_AFTER_END,CKEDITOR.POSITION_BEFORE_START];a?(c=new CKEDITOR.dom.range(this.root),c.moveToPosition(a,f[b?0:1])):c=this.clone();if(a&&!a.is(CKEDITOR.dtd.$block))d=1;else if(e=c[b?"getNextEditableNode":"getPreviousEditableNode"]())d=1,(n=e.type==
CKEDITOR.NODE_ELEMENT)&&e.is(CKEDITOR.dtd.$block)&&"false"==e.getAttribute("contenteditable")?(c.setStartAt(e,CKEDITOR.POSITION_BEFORE_START),c.setEndAt(e,CKEDITOR.POSITION_AFTER_END)):!CKEDITOR.env.needsBrFiller&&n&&e.is(CKEDITOR.dom.walker.validEmptyBlockContainers)?(c.setEnd(e,0),c.collapse()):c.moveToPosition(e,f[b?1:0]);d&&this.moveToRange(c);return!!d},moveToElementEditStart:function(a){return this.moveToElementEditablePosition(a)},moveToElementEditEnd:function(a){return this.moveToElementEditablePosition(a,
!0)},getEnclosedNode:function(){var a=this.clone();a.optimize();if(a.startContainer.type!=CKEDITOR.NODE_ELEMENT||a.endContainer.type!=CKEDITOR.NODE_ELEMENT)return null;var a=new CKEDITOR.dom.walker(a),b=CKEDITOR.dom.walker.bookmark(!1,!0),c=CKEDITOR.dom.walker.whitespaces(!0);a.evaluator=function(a){return c(a)&&b(a)};var d=a.next();a.reset();return d&&d.equals(a.previous())?d:null},getTouchedStartNode:function(){var a=this.startContainer;return this.collapsed||a.type!=CKEDITOR.NODE_ELEMENT?a:a.getChild(this.startOffset)||
a},getTouchedEndNode:function(){var a=this.endContainer;return this.collapsed||a.type!=CKEDITOR.NODE_ELEMENT?a:a.getChild(this.endOffset-1)||a},getNextEditableNode:e(),getPreviousEditableNode:e(1),scrollIntoView:function(){var a=new CKEDITOR.dom.element.createFromHtml("\x3cspan\x3e\x26nbsp;\x3c/span\x3e",this.document),b,c,d,e=this.clone();e.optimize();(d=e.startContainer.type==CKEDITOR.NODE_TEXT)?(c=e.startContainer.getText(),b=e.startContainer.split(e.startOffset),a.insertAfter(e.startContainer)):
e.insertNode(a);a.scrollIntoView();d&&(e.startContainer.setText(c),b.remove());a.remove()},_setStartContainer:function(a){this.startContainer=a},_setEndContainer:function(a){this.endContainer=a}}})();CKEDITOR.POSITION_AFTER_START=1;CKEDITOR.POSITION_BEFORE_END=2;CKEDITOR.POSITION_BEFORE_START=3;CKEDITOR.POSITION_AFTER_END=4;CKEDITOR.ENLARGE_ELEMENT=1;CKEDITOR.ENLARGE_BLOCK_CONTENTS=2;CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS=3;CKEDITOR.ENLARGE_INLINE=4;CKEDITOR.START=1;CKEDITOR.END=2;
CKEDITOR.SHRINK_ELEMENT=1;CKEDITOR.SHRINK_TEXT=2;"use strict";
(function(){function a(a){1>arguments.length||(this.range=a,this.forceBrBreak=0,this.enlargeBr=1,this.enforceRealBlocks=0,this._||(this._={}))}function d(a){var b=[];a.forEach(function(a){if("true"==a.getAttribute("contenteditable"))return b.push(a),!1},CKEDITOR.NODE_ELEMENT,!0);return b}function b(a,c,e,f){a:{null==f&&(f=d(e));for(var k;k=f.shift();)if(k.getDtd().p){f={element:k,remaining:f};break a}f=null}if(!f)return 0;if((k=CKEDITOR.filter.instances[f.element.data("cke-filter")])&&!k.check(c))return b(a,
c,e,f.remaining);c=new CKEDITOR.dom.range(f.element);c.selectNodeContents(f.element);c=c.createIterator();c.enlargeBr=a.enlargeBr;c.enforceRealBlocks=a.enforceRealBlocks;c.activeFilter=c.filter=k;a._.nestedEditable={element:f.element,container:e,remaining:f.remaining,iterator:c};return 1}function c(a,b,c){if(!b)return!1;a=a.clone();a.collapse(!c);return a.checkBoundaryOfElement(b,c?CKEDITOR.START:CKEDITOR.END)}var e=/^[\r\n\t ]+$/,f=CKEDITOR.dom.walker.bookmark(!1,!0),k=CKEDITOR.dom.walker.whitespaces(!0),
l=function(a){return f(a)&&k(a)},q={dd:1,dt:1,li:1};a.prototype={getNextParagraph:function(a){var d,k,A,v,C;a=a||"p";if(this._.nestedEditable){if(d=this._.nestedEditable.iterator.getNextParagraph(a))return this.activeFilter=this._.nestedEditable.iterator.activeFilter,d;this.activeFilter=this.filter;if(b(this,a,this._.nestedEditable.container,this._.nestedEditable.remaining))return this.activeFilter=this._.nestedEditable.iterator.activeFilter,this._.nestedEditable.iterator.getNextParagraph(a);this._.nestedEditable=
null}if(!this.range.root.getDtd()[a])return null;if(!this._.started){var n=this.range.clone();k=n.startPath();var y=n.endPath(),F=!n.collapsed&&c(n,k.block),w=!n.collapsed&&c(n,y.block,1);n.shrink(CKEDITOR.SHRINK_ELEMENT,!0);F&&n.setStartAt(k.block,CKEDITOR.POSITION_BEFORE_END);w&&n.setEndAt(y.block,CKEDITOR.POSITION_AFTER_START);k=n.endContainer.hasAscendant("pre",!0)||n.startContainer.hasAscendant("pre",!0);n.enlarge(this.forceBrBreak&&!k||!this.enlargeBr?CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS:CKEDITOR.ENLARGE_BLOCK_CONTENTS);
n.collapsed||(k=new CKEDITOR.dom.walker(n.clone()),y=CKEDITOR.dom.walker.bookmark(!0,!0),k.evaluator=y,this._.nextNode=k.next(),k=new CKEDITOR.dom.walker(n.clone()),k.evaluator=y,k=k.previous(),this._.lastNode=k.getNextSourceNode(!0,null,n.root),this._.lastNode&&this._.lastNode.type==CKEDITOR.NODE_TEXT&&!CKEDITOR.tools.trim(this._.lastNode.getText())&&this._.lastNode.getParent().isBlockBoundary()&&(y=this.range.clone(),y.moveToPosition(this._.lastNode,CKEDITOR.POSITION_AFTER_END),y.checkEndOfBlock()&&
(y=new CKEDITOR.dom.elementPath(y.endContainer,y.root),this._.lastNode=(y.block||y.blockLimit).getNextSourceNode(!0))),this._.lastNode&&n.root.contains(this._.lastNode)||(this._.lastNode=this._.docEndMarker=n.document.createText(""),this._.lastNode.insertAfter(k)),n=null);this._.started=1;k=n}y=this._.nextNode;n=this._.lastNode;for(this._.nextNode=null;y;){var F=0,w=y.hasAscendant("pre"),u=y.type!=CKEDITOR.NODE_ELEMENT,h=0;if(u)y.type==CKEDITOR.NODE_TEXT&&e.test(y.getText())&&(u=0);else{var p=y.getName();
if(CKEDITOR.dtd.$block[p]&&"false"==y.getAttribute("contenteditable")){d=y;b(this,a,d);break}else if(y.isBlockBoundary(this.forceBrBreak&&!w&&{br:1})){if("br"==p)u=1;else if(!k&&!y.getChildCount()&&"hr"!=p){d=y;A=y.equals(n);break}k&&(k.setEndAt(y,CKEDITOR.POSITION_BEFORE_START),"br"!=p&&(this._.nextNode=y));F=1}else{if(y.getFirst()){k||(k=this.range.clone(),k.setStartAt(y,CKEDITOR.POSITION_BEFORE_START));y=y.getFirst();continue}u=1}}u&&!k&&(k=this.range.clone(),k.setStartAt(y,CKEDITOR.POSITION_BEFORE_START));
A=(!F||u)&&y.equals(n);if(k&&!F)for(;!y.getNext(l)&&!A;){p=y.getParent();if(p.isBlockBoundary(this.forceBrBreak&&!w&&{br:1})){F=1;u=0;A||p.equals(n);k.setEndAt(p,CKEDITOR.POSITION_BEFORE_END);break}y=p;u=1;A=y.equals(n);h=1}u&&k.setEndAt(y,CKEDITOR.POSITION_AFTER_END);y=this._getNextSourceNode(y,h,n);if((A=!y)||F&&k)break}if(!d){if(!k)return this._.docEndMarker&&this._.docEndMarker.remove(),this._.nextNode=null;d=new CKEDITOR.dom.elementPath(k.startContainer,k.root);y=d.blockLimit;F={div:1,th:1,td:1};
d=d.block;!d&&y&&!this.enforceRealBlocks&&F[y.getName()]&&k.checkStartOfBlock()&&k.checkEndOfBlock()&&!y.equals(k.root)?d=y:!d||this.enforceRealBlocks&&d.is(q)?(d=this.range.document.createElement(a),k.extractContents().appendTo(d),d.trim(),k.insertNode(d),v=C=!0):"li"!=d.getName()?k.checkStartOfBlock()&&k.checkEndOfBlock()||(d=d.clone(!1),k.extractContents().appendTo(d),d.trim(),C=k.splitBlock(),v=!C.wasStartOfBlock,C=!C.wasEndOfBlock,k.insertNode(d)):A||(this._.nextNode=d.equals(n)?null:this._getNextSourceNode(k.getBoundaryNodes().endNode,
1,n))}v&&(v=d.getPrevious())&&v.type==CKEDITOR.NODE_ELEMENT&&("br"==v.getName()?v.remove():v.getLast()&&"br"==v.getLast().$.nodeName.toLowerCase()&&v.getLast().remove());C&&(v=d.getLast())&&v.type==CKEDITOR.NODE_ELEMENT&&"br"==v.getName()&&(!CKEDITOR.env.needsBrFiller||v.getPrevious(f)||v.getNext(f))&&v.remove();this._.nextNode||(this._.nextNode=A||d.equals(n)||!n?null:this._getNextSourceNode(d,1,n));return d},_getNextSourceNode:function(a,b,c){function d(a){return!(a.equals(c)||a.equals(e))}var e=
this.range.root;for(a=a.getNextSourceNode(b,null,d);!f(a);)a=a.getNextSourceNode(b,null,d);return a}};CKEDITOR.dom.range.prototype.createIterator=function(){return new a(this)}})();
CKEDITOR.command=function(a,d){this.uiItems=[];this.exec=function(b){if(this.state==CKEDITOR.TRISTATE_DISABLED||!this.checkAllowed())return!1;this.editorFocus&&a.focus();return!1===this.fire("exec")?!0:!1!==d.exec.call(this,a,b)};this.refresh=function(a,b){if(!this.readOnly&&a.readOnly)return!0;if(this.context&&!b.isContextFor(this.context)||!this.checkAllowed(!0))return this.disable(),!0;this.startDisabled||this.enable();this.modes&&!this.modes[a.mode]&&this.disable();return!1===this.fire("refresh",
{editor:a,path:b})?!0:d.refresh&&!1!==d.refresh.apply(this,arguments)};var b;this.checkAllowed=function(c){return c||"boolean"!=typeof b?b=a.activeFilter.checkFeature(this):b};CKEDITOR.tools.extend(this,d,{modes:{wysiwyg:1},editorFocus:1,contextSensitive:!!d.context,state:CKEDITOR.TRISTATE_DISABLED});CKEDITOR.event.call(this)};
CKEDITOR.command.prototype={enable:function(){this.state==CKEDITOR.TRISTATE_DISABLED&&this.checkAllowed()&&this.setState(this.preserveState&&"undefined"!=typeof this.previousState?this.previousState:CKEDITOR.TRISTATE_OFF)},disable:function(){this.setState(CKEDITOR.TRISTATE_DISABLED)},setState:function(a){if(this.state==a||a!=CKEDITOR.TRISTATE_DISABLED&&!this.checkAllowed())return!1;this.previousState=this.state;this.state=a;this.fire("state");return!0},toggleState:function(){this.state==CKEDITOR.TRISTATE_OFF?
this.setState(CKEDITOR.TRISTATE_ON):this.state==CKEDITOR.TRISTATE_ON&&this.setState(CKEDITOR.TRISTATE_OFF)}};CKEDITOR.event.implementOn(CKEDITOR.command.prototype);CKEDITOR.ENTER_P=1;CKEDITOR.ENTER_BR=2;CKEDITOR.ENTER_DIV=3;
CKEDITOR.config={customConfig:"config.js",autoUpdateElement:!0,language:"",defaultLanguage:"en",contentsLangDirection:"",enterMode:CKEDITOR.ENTER_P,forceEnterMode:!1,shiftEnterMode:CKEDITOR.ENTER_BR,docType:"\x3c!DOCTYPE html\x3e",bodyId:"",bodyClass:"",fullPage:!1,height:200,contentsCss:CKEDITOR.getUrl("contents.css"),extraPlugins:"",removePlugins:"",protectedSource:[],tabIndex:0,width:"",baseFloatZIndex:1E4,blockedKeystrokes:[CKEDITOR.CTRL+66,CKEDITOR.CTRL+73,CKEDITOR.CTRL+85]};
(function(){function a(a,b,c,d,e){var h,p;a=[];for(h in b){p=b[h];p="boolean"==typeof p?{}:"function"==typeof p?{match:p}:L(p);"$"!=h.charAt(0)&&(p.elements=h);c&&(p.featureName=c.toLowerCase());var m=p;m.elements=k(m.elements,/\s+/)||null;m.propertiesOnly=m.propertiesOnly||!0===m.elements;var r=/\s*,\s*/,n=void 0;for(n in S){m[n]=k(m[n],r)||null;var E=m,u=x[n],f=k(m[x[n]],r),D=m[n],g=[],G=!0,J=void 0;f?G=!1:f={};for(J in D)"!"==J.charAt(0)&&(J=J.slice(1),g.push(J),f[J]=!0,G=!1);for(;J=g.pop();)D[J]=
D["!"+J],delete D["!"+J];E[u]=(G?!1:f)||null}m.match=m.match||null;d.push(p);a.push(p)}b=e.elements;e=e.generic;var l;c=0;for(d=a.length;c<d;++c){h=L(a[c]);p=!0===h.classes||!0===h.styles||!0===h.attributes;m=h;n=u=r=void 0;for(r in S)m[r]=F(m[r]);E=!0;for(n in x){r=x[n];u=m[r];f=[];D=void 0;for(D in u)-1<D.indexOf("*")?f.push(new RegExp("^"+D.replace(/\*/g,".*")+"$")):f.push(D);u=f;u.length&&(m[r]=u,E=!1)}m.nothingRequired=E;m.noProperties=!(m.attributes||m.classes||m.styles);if(!0===h.elements||
null===h.elements)e[p?"unshift":"push"](h);else for(l in m=h.elements,delete h.elements,m)if(b[l])b[l][p?"unshift":"push"](h);else b[l]=[h]}}function d(a,c,d,h){if(!a.match||a.match(c))if(h||l(a,c))if(a.propertiesOnly||(d.valid=!0),d.allAttributes||(d.allAttributes=b(a.attributes,c.attributes,d.validAttributes)),d.allStyles||(d.allStyles=b(a.styles,c.styles,d.validStyles)),!d.allClasses){a=a.classes;c=c.classes;h=d.validClasses;if(a)if(!0===a)a=!0;else{for(var e=0,p=c.length,m;e<p;++e)m=c[e],h[m]||
(h[m]=a(m));a=!1}else a=!1;d.allClasses=a}}function b(a,b,c){if(!a)return!1;if(!0===a)return!0;for(var d in b)c[d]||(c[d]=a(d));return!1}function c(a,b,c){if(!a.match||a.match(b)){if(a.noProperties)return!1;c.hadInvalidAttribute=e(a.attributes,b.attributes)||c.hadInvalidAttribute;c.hadInvalidStyle=e(a.styles,b.styles)||c.hadInvalidStyle;a=a.classes;b=b.classes;if(a){for(var d=!1,h=!0===a,p=b.length;p--;)if(h||a(b[p]))b.splice(p,1),d=!0;a=d}else a=!1;c.hadInvalidClass=a||c.hadInvalidClass}}function e(a,
b){if(!a)return!1;var c=!1,d=!0===a,h;for(h in b)if(d||a(h))delete b[h],c=!0;return c}function f(a,b,c){if(a.disabled||a.customConfig&&!c||!b)return!1;a._.cachedChecks={};return!0}function k(a,b){if(!a)return!1;if(!0===a)return a;if("string"==typeof a)return a=T(a),"*"==a?!0:CKEDITOR.tools.convertArrayToObject(a.split(b));if(CKEDITOR.tools.isArray(a))return a.length?CKEDITOR.tools.convertArrayToObject(a):!1;var c={},d=0,h;for(h in a)c[h]=a[h],d++;return d?c:!1}function l(a,b){if(a.nothingRequired)return!0;
var c,d,h,p;if(h=a.requiredClasses)for(p=b.classes,c=0;c<h.length;++c)if(d=h[c],"string"==typeof d){if(-1==CKEDITOR.tools.indexOf(p,d))return!1}else if(!CKEDITOR.tools.checkIfAnyArrayItemMatches(p,d))return!1;return q(b.styles,a.requiredStyles)&&q(b.attributes,a.requiredAttributes)}function q(a,b){if(!b)return!0;for(var c=0,d;c<b.length;++c)if(d=b[c],"string"==typeof d){if(!(d in a))return!1}else if(!CKEDITOR.tools.checkIfAnyObjectPropertyMatches(a,d))return!1;return!0}function t(a){if(!a)return{};
a=a.split(/\s*,\s*/).sort();for(var b={};a.length;)b[a.shift()]="cke-test";return b}function g(a){var b,c,d,h,p={},e=1;for(a=T(a);b=a.match(H);)(c=b[2])?(d=z(c,"styles"),h=z(c,"attrs"),c=z(c,"classes")):d=h=c=null,p["$"+e++]={elements:b[1],classes:c,styles:d,attributes:h},a=a.slice(b[0].length);return p}function z(a,b){var c=a.match(I[b]);return c?T(c[1]):null}function A(a){var b=a.styleBackup=a.attributes.style,c=a.classBackup=a.attributes["class"];a.styles||(a.styles=CKEDITOR.tools.parseCssText(b||
"",1));a.classes||(a.classes=c?c.split(/\s+/):[])}function v(a,b,h,e){var m=0,r;e.toHtml&&(b.name=b.name.replace(E,"$1"));if(e.doCallbacks&&a.elementCallbacks){a:{r=a.elementCallbacks;for(var u=0,f=r.length,D;u<f;++u)if(D=r[u](b)){r=D;break a}r=void 0}if(r)return r}if(e.doTransform&&(r=a._.transformations[b.name])){A(b);for(u=0;u<r.length;++u)p(a,b,r[u]);n(b)}if(e.doFilter){a:{u=b.name;f=a._;a=f.allowedRules.elements[u];r=f.allowedRules.generic;u=f.disallowedRules.elements[u];f=f.disallowedRules.generic;
D=e.skipRequired;var g={valid:!1,validAttributes:{},validClasses:{},validStyles:{},allAttributes:!1,allClasses:!1,allStyles:!1,hadInvalidAttribute:!1,hadInvalidClass:!1,hadInvalidStyle:!1},x,k;if(a||r){A(b);if(u)for(x=0,k=u.length;x<k;++x)if(!1===c(u[x],b,g)){a=null;break a}if(f)for(x=0,k=f.length;x<k;++x)c(f[x],b,g);if(a)for(x=0,k=a.length;x<k;++x)d(a[x],b,g,D);if(r)for(x=0,k=r.length;x<k;++x)d(r[x],b,g,D);a=g}else a=null}if(!a||!a.valid)return h.push(b),1;k=a.validAttributes;var G=a.validStyles;
r=a.validClasses;var u=b.attributes,l=b.styles,f=b.classes;D=b.classBackup;var I=b.styleBackup,B,H,O=[],g=[],L=/^data-cke-/;x=!1;delete u.style;delete u["class"];delete b.classBackup;delete b.styleBackup;if(!a.allAttributes)for(B in u)k[B]||(L.test(B)?B==(H=B.replace(/^data-cke-saved-/,""))||k[H]||(delete u[B],x=!0):(delete u[B],x=!0));if(!a.allStyles||a.hadInvalidStyle){for(B in l)a.allStyles||G[B]?O.push(B+":"+l[B]):x=!0;O.length&&(u.style=O.sort().join("; "))}else I&&(u.style=I);if(!a.allClasses||
a.hadInvalidClass){for(B=0;B<f.length;++B)(a.allClasses||r[f[B]])&&g.push(f[B]);g.length&&(u["class"]=g.sort().join(" "));D&&g.length<D.split(/\s+/).length&&(x=!0)}else D&&(u["class"]=D);x&&(m=1);if(!e.skipFinalValidation&&!y(b))return h.push(b),1}e.toHtml&&(b.name=b.name.replace(J,"cke:$1"));return m}function C(a){var b=[],c;for(c in a)-1<c.indexOf("*")&&b.push(c.replace(/\*/g,".*"));return b.length?new RegExp("^(?:"+b.join("|")+")$"):null}function n(a){var b=a.attributes,c;delete b.style;delete b["class"];
if(c=CKEDITOR.tools.writeCssText(a.styles,!0))b.style=c;a.classes.length&&(b["class"]=a.classes.sort().join(" "))}function y(a){switch(a.name){case "a":if(!(a.children.length||a.attributes.name||a.attributes.id))return!1;break;case "img":if(!a.attributes.src)return!1}return!0}function F(a){if(!a)return!1;if(!0===a)return!0;var b=C(a);return function(c){return c in a||b&&c.match(b)}}function w(){return new CKEDITOR.htmlParser.element("br")}function u(a){return a.type==CKEDITOR.NODE_ELEMENT&&("br"==
a.name||B.$block[a.name])}function h(a,b,c){var d=a.name;if(B.$empty[d]||!a.children.length)"hr"==d&&"br"==b?a.replaceWith(w()):(a.parent&&c.push({check:"it",el:a.parent}),a.remove());else if(B.$block[d]||"tr"==d)if("br"==b)a.previous&&!u(a.previous)&&(b=w(),b.insertBefore(a)),a.next&&!u(a.next)&&(b=w(),b.insertAfter(a)),a.replaceWithChildren();else{var d=a.children,h;b:{h=B[b];for(var e=0,p=d.length,m;e<p;++e)if(m=d[e],m.type==CKEDITOR.NODE_ELEMENT&&!h[m.name]){h=!1;break b}h=!0}if(h)a.name=b,a.attributes=
{},c.push({check:"parent-down",el:a});else{h=a.parent;for(var e=h.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT||"body"==h.name,r,n,p=d.length;0<p;)m=d[--p],e&&(m.type==CKEDITOR.NODE_TEXT||m.type==CKEDITOR.NODE_ELEMENT&&B.$inline[m.name])?(r||(r=new CKEDITOR.htmlParser.element(b),r.insertAfter(a),c.push({check:"parent-down",el:r})),r.add(m,0)):(r=null,n=B[h.name]||B.span,m.insertAfter(a),h.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT||m.type!=CKEDITOR.NODE_ELEMENT||n[m.name]||c.push({check:"el-up",el:m}));a.remove()}}else d in
{style:1,script:1}?a.remove():(a.parent&&c.push({check:"it",el:a.parent}),a.replaceWithChildren())}function p(a,b,c){var d,h;for(d=0;d<c.length;++d)if(h=c[d],!(h.check&&!a.check(h.check,!1)||h.left&&!h.left(b))){h.right(b,O);break}}function m(a,b){var c=b.getDefinition(),d=c.attributes,h=c.styles,e,p,m,r;if(a.name!=c.element)return!1;for(e in d)if("class"==e)for(c=d[e].split(/\s+/),m=a.classes.join("|");r=c.pop();){if(-1==m.indexOf(r))return!1}else if(a.attributes[e]!=d[e])return!1;for(p in h)if(a.styles[p]!=
h[p])return!1;return!0}function D(a,b){var c,d;"string"==typeof a?c=a:a instanceof CKEDITOR.style?d=a:(c=a[0],d=a[1]);return[{element:c,left:d,right:function(a,c){c.transform(a,b)}}]}function r(a){return function(b){return m(b,a)}}function G(a){return function(b,c){c[a](b)}}var B=CKEDITOR.dtd,L=CKEDITOR.tools.copy,T=CKEDITOR.tools.trim,M=["","p","br","div"];CKEDITOR.FILTER_SKIP_TREE=2;CKEDITOR.filter=function(a){this.allowedContent=[];this.disallowedContent=[];this.elementCallbacks=null;this.disabled=
!1;this.editor=null;this.id=CKEDITOR.tools.getNextNumber();this._={allowedRules:{elements:{},generic:[]},disallowedRules:{elements:{},generic:[]},transformations:{},cachedTests:{}};CKEDITOR.filter.instances[this.id]=this;if(a instanceof CKEDITOR.editor){a=this.editor=a;this.customConfig=!0;var b=a.config.allowedContent;!0===b?this.disabled=!0:(b||(this.customConfig=!1),this.allow(b,"config",1),this.allow(a.config.extraAllowedContent,"extra",1),this.allow(M[a.enterMode]+" "+M[a.shiftEnterMode],"default",
1),this.disallow(a.config.disallowedContent))}else this.customConfig=!1,this.allow(a,"default",1)};CKEDITOR.filter.instances={};CKEDITOR.filter.prototype={allow:function(b,c,d){if(!f(this,b,d))return!1;var h,e;if("string"==typeof b)b=g(b);else if(b instanceof CKEDITOR.style){if(b.toAllowedContentRules)return this.allow(b.toAllowedContentRules(this.editor),c,d);h=b.getDefinition();b={};d=h.attributes;b[h.element]=h={styles:h.styles,requiredStyles:h.styles&&CKEDITOR.tools.objectKeys(h.styles)};d&&(d=
L(d),h.classes=d["class"]?d["class"].split(/\s+/):null,h.requiredClasses=h.classes,delete d["class"],h.attributes=d,h.requiredAttributes=d&&CKEDITOR.tools.objectKeys(d))}else if(CKEDITOR.tools.isArray(b)){for(h=0;h<b.length;++h)e=this.allow(b[h],c,d);return e}a(this,b,c,this.allowedContent,this._.allowedRules);return!0},applyTo:function(a,b,c,d){if(this.disabled)return!1;var e=this,p=[],m=this.editor&&this.editor.config.protectedSource,r,u=!1,n={doFilter:!c,doTransform:!0,doCallbacks:!0,toHtml:b};
a.forEach(function(a){if(a.type==CKEDITOR.NODE_ELEMENT){if("off"==a.attributes["data-cke-filter"])return!1;if(!b||"span"!=a.name||!~CKEDITOR.tools.objectKeys(a.attributes).join("|").indexOf("data-cke-"))if(r=v(e,a,p,n),r&1)u=!0;else if(r&2)return!1}else if(a.type==CKEDITOR.NODE_COMMENT&&a.value.match(/^\{cke_protected\}(?!\{C\})/)){var c;a:{var d=decodeURIComponent(a.value.replace(/^\{cke_protected\}/,""));c=[];var h,f,E;if(m)for(f=0;f<m.length;++f)if((E=d.match(m[f]))&&E[0].length==d.length){c=!0;
break a}d=CKEDITOR.htmlParser.fragment.fromHtml(d);1==d.children.length&&(h=d.children[0]).type==CKEDITOR.NODE_ELEMENT&&v(e,h,c,n);c=!c.length}c||p.push(a)}},null,!0);p.length&&(u=!0);var f;a=[];d=M[d||(this.editor?this.editor.enterMode:CKEDITOR.ENTER_P)];for(var E;c=p.pop();)c.type==CKEDITOR.NODE_ELEMENT?h(c,d,a):c.remove();for(;f=a.pop();)if(c=f.el,c.parent)switch(E=B[c.parent.name]||B.span,f.check){case "it":B.$removeEmpty[c.name]&&!c.children.length?h(c,d,a):y(c)||h(c,d,a);break;case "el-up":c.parent.type==
CKEDITOR.NODE_DOCUMENT_FRAGMENT||E[c.name]||h(c,d,a);break;case "parent-down":c.parent.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT||E[c.name]||h(c.parent,d,a)}return u},checkFeature:function(a){if(this.disabled||!a)return!0;a.toFeature&&(a=a.toFeature(this.editor));return!a.requiredContent||this.check(a.requiredContent)},disable:function(){this.disabled=!0},disallow:function(b){if(!f(this,b,!0))return!1;"string"==typeof b&&(b=g(b));a(this,b,null,this.disallowedContent,this._.disallowedRules);return!0},
addContentForms:function(a){if(!this.disabled&&a){var b,c,d=[],h;for(b=0;b<a.length&&!h;++b)c=a[b],("string"==typeof c||c instanceof CKEDITOR.style)&&this.check(c)&&(h=c);if(h){for(b=0;b<a.length;++b)d.push(D(a[b],h));this.addTransformations(d)}}},addElementCallback:function(a){this.elementCallbacks||(this.elementCallbacks=[]);this.elementCallbacks.push(a)},addFeature:function(a){if(this.disabled||!a)return!0;a.toFeature&&(a=a.toFeature(this.editor));this.allow(a.allowedContent,a.name);this.addTransformations(a.contentTransformations);
this.addContentForms(a.contentForms);return a.requiredContent&&(this.customConfig||this.disallowedContent.length)?this.check(a.requiredContent):!0},addTransformations:function(a){var b,c;if(!this.disabled&&a){var d=this._.transformations,h;for(h=0;h<a.length;++h){b=a[h];var e=void 0,p=void 0,m=void 0,u=void 0,n=void 0,f=void 0;c=[];for(p=0;p<b.length;++p)m=b[p],"string"==typeof m?(m=m.split(/\s*:\s*/),u=m[0],n=null,f=m[1]):(u=m.check,n=m.left,f=m.right),e||(e=m,e=e.element?e.element:u?u.match(/^([a-z0-9]+)/i)[0]:
e.left.getDefinition().element),n instanceof CKEDITOR.style&&(n=r(n)),c.push({check:u==e?null:u,left:n,right:"string"==typeof f?G(f):f});b=e;d[b]||(d[b]=[]);d[b].push(c)}}},check:function(a,b,c){if(this.disabled)return!0;if(CKEDITOR.tools.isArray(a)){for(var d=a.length;d--;)if(this.check(a[d],b,c))return!0;return!1}var h,e;if("string"==typeof a){e=a+"\x3c"+(!1===b?"0":"1")+(c?"1":"0")+"\x3e";if(e in this._.cachedChecks)return this._.cachedChecks[e];d=g(a).$1;h=d.styles;var m=d.classes;d.name=d.elements;
d.classes=m=m?m.split(/\s*,\s*/):[];d.styles=t(h);d.attributes=t(d.attributes);d.children=[];m.length&&(d.attributes["class"]=m.join(" "));h&&(d.attributes.style=CKEDITOR.tools.writeCssText(d.styles));h=d}else d=a.getDefinition(),h=d.styles,m=d.attributes||{},h?(h=L(h),m.style=CKEDITOR.tools.writeCssText(h,!0)):h={},h={name:d.element,attributes:m,classes:m["class"]?m["class"].split(/\s+/):[],styles:h,children:[]};var m=CKEDITOR.tools.clone(h),r=[],u;if(!1!==b&&(u=this._.transformations[h.name])){for(d=
0;d<u.length;++d)p(this,h,u[d]);n(h)}v(this,m,r,{doFilter:!0,doTransform:!1!==b,skipRequired:!c,skipFinalValidation:!c});b=0<r.length?!1:CKEDITOR.tools.objectCompare(h.attributes,m.attributes,!0)?!0:!1;"string"==typeof a&&(this._.cachedChecks[e]=b);return b},getAllowedEnterMode:function(){var a=["p","div","br"],b={p:CKEDITOR.ENTER_P,div:CKEDITOR.ENTER_DIV,br:CKEDITOR.ENTER_BR};return function(c,d){var h=a.slice(),e;if(this.check(M[c]))return c;for(d||(h=h.reverse());e=h.pop();)if(this.check(e))return b[e];
return CKEDITOR.ENTER_BR}}(),destroy:function(){delete CKEDITOR.filter.instances[this.id];delete this._;delete this.allowedContent;delete this.disallowedContent}};var S={styles:1,attributes:1,classes:1},x={styles:"requiredStyles",attributes:"requiredAttributes",classes:"requiredClasses"},H=/^([a-z0-9\-*\s]+)((?:\s*\{[!\w\-,\s\*]+\}\s*|\s*\[[!\w\-,\s\*]+\]\s*|\s*\([!\w\-,\s\*]+\)\s*){0,3})(?:;\s*|$)/i,I={styles:/{([^}]+)}/,attrs:/\[([^\]]+)\]/,classes:/\(([^\)]+)\)/},E=/^cke:(object|embed|param)$/,
J=/^(object|embed|param)$/,O=CKEDITOR.filter.transformationsTools={sizeToStyle:function(a){this.lengthToStyle(a,"width");this.lengthToStyle(a,"height")},sizeToAttribute:function(a){this.lengthToAttribute(a,"width");this.lengthToAttribute(a,"height")},lengthToStyle:function(a,b,c){c=c||b;if(!(c in a.styles)){var d=a.attributes[b];d&&(/^\d+$/.test(d)&&(d+="px"),a.styles[c]=d)}delete a.attributes[b]},lengthToAttribute:function(a,b,c){c=c||b;if(!(c in a.attributes)){var d=a.styles[b],h=d&&d.match(/^(\d+)(?:\.\d*)?px$/);
h?a.attributes[c]=h[1]:"cke-test"==d&&(a.attributes[c]="cke-test")}delete a.styles[b]},alignmentToStyle:function(a){if(!("float"in a.styles)){var b=a.attributes.align;if("left"==b||"right"==b)a.styles["float"]=b}delete a.attributes.align},alignmentToAttribute:function(a){if(!("align"in a.attributes)){var b=a.styles["float"];if("left"==b||"right"==b)a.attributes.align=b}delete a.styles["float"]},matchesStyle:m,transform:function(a,b){if("string"==typeof b)a.name=b;else{var c=b.getDefinition(),d=c.styles,
h=c.attributes,e,p,m,r;a.name=c.element;for(e in h)if("class"==e)for(c=a.classes.join("|"),m=h[e].split(/\s+/);r=m.pop();)-1==c.indexOf(r)&&a.classes.push(r);else a.attributes[e]=h[e];for(p in d)a.styles[p]=d[p]}}}})();
(function(){CKEDITOR.focusManager=function(a){if(a.focusManager)return a.focusManager;this.hasFocus=!1;this.currentActive=null;this._={editor:a};return this};CKEDITOR.focusManager._={blurDelay:200};CKEDITOR.focusManager.prototype={focus:function(a){this._.timer&&clearTimeout(this._.timer);a&&(this.currentActive=a);this.hasFocus||this._.locked||((a=CKEDITOR.currentInstance)&&a.focusManager.blur(1),this.hasFocus=!0,(a=this._.editor.container)&&a.addClass("cke_focus"),this._.editor.fire("focus"))},lock:function(){this._.locked=
1},unlock:function(){delete this._.locked},blur:function(a){function d(){if(this.hasFocus){this.hasFocus=!1;var a=this._.editor.container;a&&a.removeClass("cke_focus");this._.editor.fire("blur")}}if(!this._.locked){this._.timer&&clearTimeout(this._.timer);var b=CKEDITOR.focusManager._.blurDelay;a||!b?d.call(this):this._.timer=CKEDITOR.tools.setTimeout(function(){delete this._.timer;d.call(this)},b,this)}},add:function(a,d){var b=a.getCustomData("focusmanager");if(!b||b!=this){b&&b.remove(a);var b=
"focus",c="blur";d&&(CKEDITOR.env.ie?(b="focusin",c="focusout"):CKEDITOR.event.useCapture=1);var e={blur:function(){a.equals(this.currentActive)&&this.blur()},focus:function(){this.focus(a)}};a.on(b,e.focus,this);a.on(c,e.blur,this);d&&(CKEDITOR.event.useCapture=0);a.setCustomData("focusmanager",this);a.setCustomData("focusmanager_handlers",e)}},remove:function(a){a.removeCustomData("focusmanager");var d=a.removeCustomData("focusmanager_handlers");a.removeListener("blur",d.blur);a.removeListener("focus",
d.focus)}}})();CKEDITOR.keystrokeHandler=function(a){if(a.keystrokeHandler)return a.keystrokeHandler;this.keystrokes={};this.blockedKeystrokes={};this._={editor:a};return this};
(function(){var a,d=function(b){b=b.data;var d=b.getKeystroke(),f=this.keystrokes[d],k=this._.editor;a=!1===k.fire("key",{keyCode:d,domEvent:b});a||(f&&(a=!1!==k.execCommand(f,{from:"keystrokeHandler"})),a||(a=!!this.blockedKeystrokes[d]));a&&b.preventDefault(!0);return!a},b=function(b){a&&(a=!1,b.data.preventDefault(!0))};CKEDITOR.keystrokeHandler.prototype={attach:function(a){a.on("keydown",d,this);if(CKEDITOR.env.gecko&&CKEDITOR.env.mac)a.on("keypress",b,this)}}})();
(function(){CKEDITOR.lang={languages:{af:1,ar:1,bg:1,bn:1,bs:1,ca:1,cs:1,cy:1,da:1,de:1,el:1,"en-au":1,"en-ca":1,"en-gb":1,en:1,eo:1,es:1,et:1,eu:1,fa:1,fi:1,fo:1,"fr-ca":1,fr:1,gl:1,gu:1,he:1,hi:1,hr:1,hu:1,id:1,is:1,it:1,ja:1,ka:1,km:1,ko:1,ku:1,lt:1,lv:1,mk:1,mn:1,ms:1,nb:1,nl:1,no:1,pl:1,"pt-br":1,pt:1,ro:1,ru:1,si:1,sk:1,sl:1,sq:1,"sr-latn":1,sr:1,sv:1,th:1,tr:1,tt:1,ug:1,uk:1,vi:1,"zh-cn":1,zh:1},rtl:{ar:1,fa:1,he:1,ku:1,ug:1},load:function(a,d,b){a&&CKEDITOR.lang.languages[a]||(a=this.detect(d,
a));var c=this;d=function(){c[a].dir=c.rtl[a]?"rtl":"ltr";b(a,c[a])};this[a]?d():CKEDITOR.scriptLoader.load(CKEDITOR.getUrl("lang/"+a+".js"),d,this)},detect:function(a,d){var b=this.languages;d=d||navigator.userLanguage||navigator.language||a;var c=d.toLowerCase().match(/([a-z]+)(?:-([a-z]+))?/),e=c[1],c=c[2];b[e+"-"+c]?e=e+"-"+c:b[e]||(e=null);CKEDITOR.lang.detect=e?function(){return e}:function(a){return a};return e||a}}})();
CKEDITOR.scriptLoader=function(){var a={},d={};return{load:function(b,c,e,f){var k="string"==typeof b;k&&(b=[b]);e||(e=CKEDITOR);var l=b.length,q=[],t=[],g=function(a){c&&(k?c.call(e,a):c.call(e,q,t))};if(0===l)g(!0);else{var z=function(a,b){(b?q:t).push(a);0>=--l&&(f&&CKEDITOR.document.getDocumentElement().removeStyle("cursor"),g(b))},A=function(b,c){a[b]=1;var e=d[b];delete d[b];for(var f=0;f<e.length;f++)e[f](b,c)},v=function(b){if(a[b])z(b,!0);else{var e=d[b]||(d[b]=[]);e.push(z);if(!(1<e.length)){var f=
new CKEDITOR.dom.element("script");f.setAttributes({type:"text/javascript",src:b});c&&(CKEDITOR.env.ie&&11>CKEDITOR.env.version?f.$.onreadystatechange=function(){if("loaded"==f.$.readyState||"complete"==f.$.readyState)f.$.onreadystatechange=null,A(b,!0)}:(f.$.onload=function(){setTimeout(function(){A(b,!0)},0)},f.$.onerror=function(){A(b,!1)}));f.appendTo(CKEDITOR.document.getHead())}}};f&&CKEDITOR.document.getDocumentElement().setStyle("cursor","wait");for(var C=0;C<l;C++)v(b[C])}},queue:function(){function a(){var b;
(b=c[0])&&this.load(b.scriptUrl,b.callback,CKEDITOR,0)}var c=[];return function(d,f){var k=this;c.push({scriptUrl:d,callback:function(){f&&f.apply(this,arguments);c.shift();a.call(k)}});1==c.length&&a.call(this)}}()}}();CKEDITOR.resourceManager=function(a,d){this.basePath=a;this.fileName=d;this.registered={};this.loaded={};this.externals={};this._={waitingList:{}}};
CKEDITOR.resourceManager.prototype={add:function(a,d){if(this.registered[a])throw Error('[CKEDITOR.resourceManager.add] The resource name "'+a+'" is already registered.');var b=this.registered[a]=d||{};b.name=a;b.path=this.getPath(a);CKEDITOR.fire(a+CKEDITOR.tools.capitalize(this.fileName)+"Ready",b);return this.get(a)},get:function(a){return this.registered[a]||null},getPath:function(a){var d=this.externals[a];return CKEDITOR.getUrl(d&&d.dir||this.basePath+a+"/")},getFilePath:function(a){var d=this.externals[a];
return CKEDITOR.getUrl(this.getPath(a)+(d?d.file:this.fileName+".js"))},addExternal:function(a,d,b){a=a.split(",");for(var c=0;c<a.length;c++){var e=a[c];b||(d=d.replace(/[^\/]+$/,function(a){b=a;return""}));this.externals[e]={dir:d,file:b||this.fileName+".js"}}},load:function(a,d,b){CKEDITOR.tools.isArray(a)||(a=a?[a]:[]);for(var c=this.loaded,e=this.registered,f=[],k={},l={},q=0;q<a.length;q++){var t=a[q];if(t)if(c[t]||e[t])l[t]=this.get(t);else{var g=this.getFilePath(t);f.push(g);g in k||(k[g]=
[]);k[g].push(t)}}CKEDITOR.scriptLoader.load(f,function(a,e){if(e.length)throw Error('[CKEDITOR.resourceManager.load] Resource name "'+k[e[0]].join(",")+'" was not found at "'+e[0]+'".');for(var f=0;f<a.length;f++)for(var g=k[a[f]],n=0;n<g.length;n++){var y=g[n];l[y]=this.get(y);c[y]=1}d.call(b,l)},this)}};CKEDITOR.plugins=new CKEDITOR.resourceManager("plugins/","plugin");
CKEDITOR.plugins.load=CKEDITOR.tools.override(CKEDITOR.plugins.load,function(a){var d={};return function(b,c,e){var f={},k=function(b){a.call(this,b,function(a){CKEDITOR.tools.extend(f,a);var b=[],g;for(g in a){var l=a[g],A=l&&l.requires;if(!d[g]){if(l.icons)for(var v=l.icons.split(","),C=v.length;C--;)CKEDITOR.skin.addIcon(v[C],l.path+"icons/"+(CKEDITOR.env.hidpi&&l.hidpi?"hidpi/":"")+v[C]+".png");d[g]=1}if(A)for(A.split&&(A=A.split(",")),l=0;l<A.length;l++)f[A[l]]||b.push(A[l])}if(b.length)k.call(this,
b);else{for(g in f)l=f[g],l.onLoad&&!l.onLoad._called&&(!1===l.onLoad()&&delete f[g],l.onLoad._called=1);c&&c.call(e||window,f)}},this)};k.call(this,b)}});CKEDITOR.plugins.setLang=function(a,d,b){var c=this.get(a);a=c.langEntries||(c.langEntries={});c=c.lang||(c.lang=[]);c.split&&(c=c.split(","));-1==CKEDITOR.tools.indexOf(c,d)&&c.push(d);a[d]=b};CKEDITOR.ui=function(a){if(a.ui)return a.ui;this.items={};this.instances={};this.editor=a;this._={handlers:{}};return this};
CKEDITOR.ui.prototype={add:function(a,d,b){b.name=a.toLowerCase();var c=this.items[a]={type:d,command:b.command||null,args:Array.prototype.slice.call(arguments,2)};CKEDITOR.tools.extend(c,b)},get:function(a){return this.instances[a]},create:function(a){var d=this.items[a],b=d&&this._.handlers[d.type],c=d&&d.command&&this.editor.getCommand(d.command),b=b&&b.create.apply(this,d.args);this.instances[a]=b;c&&c.uiItems.push(b);b&&!b.type&&(b.type=d.type);return b},addHandler:function(a,d){this._.handlers[a]=
d},space:function(a){return CKEDITOR.document.getById(this.spaceId(a))},spaceId:function(a){return this.editor.id+"_"+a}};CKEDITOR.event.implementOn(CKEDITOR.ui);
(function(){function a(a,e,g){CKEDITOR.event.call(this);a=a&&CKEDITOR.tools.clone(a);if(void 0!==e){if(!(e instanceof CKEDITOR.dom.element))throw Error("Expect element of type CKEDITOR.dom.element.");if(!g)throw Error("One of the element modes must be specified.");if(CKEDITOR.env.ie&&CKEDITOR.env.quirks&&g==CKEDITOR.ELEMENT_MODE_INLINE)throw Error("Inline element mode is not supported on IE quirks.");if(!b(e,g))throw Error('The specified element mode is not supported on element: "'+e.getName()+'".');
this.element=e;this.elementMode=g;this.name=this.elementMode!=CKEDITOR.ELEMENT_MODE_APPENDTO&&(e.getId()||e.getNameAtt())}else this.elementMode=CKEDITOR.ELEMENT_MODE_NONE;this._={};this.commands={};this.templates={};this.name=this.name||d();this.id=CKEDITOR.tools.getNextId();this.status="unloaded";this.config=CKEDITOR.tools.prototypedCopy(CKEDITOR.config);this.ui=new CKEDITOR.ui(this);this.focusManager=new CKEDITOR.focusManager(this);this.keystrokeHandler=new CKEDITOR.keystrokeHandler(this);this.on("readOnly",
c);this.on("selectionChange",function(a){f(this,a.data.path)});this.on("activeFilterChange",function(){f(this,this.elementPath(),!0)});this.on("mode",c);this.on("instanceReady",function(){this.config.startupFocus&&this.focus()});CKEDITOR.fire("instanceCreated",null,this);CKEDITOR.add(this);CKEDITOR.tools.setTimeout(function(){"destroyed"!==this.status?l(this,a):CKEDITOR.warn("editor-incorrect-destroy")},0,this)}function d(){do var a="editor"+ ++v;while(CKEDITOR.instances[a]);return a}function b(a,
b){return b==CKEDITOR.ELEMENT_MODE_INLINE?a.is(CKEDITOR.dtd.$editable)||a.is("textarea"):b==CKEDITOR.ELEMENT_MODE_REPLACE?!a.is(CKEDITOR.dtd.$nonBodyContent):1}function c(){var a=this.commands,b;for(b in a)e(this,a[b])}function e(a,b){b[b.startDisabled?"disable":a.readOnly&&!b.readOnly?"disable":b.modes[a.mode]?"enable":"disable"]()}function f(a,b,c){if(b){var d,e,h=a.commands;for(e in h)d=h[e],(c||d.contextSensitive)&&d.refresh(a,b)}}function k(a){var b=a.config.customConfig;if(!b)return!1;var b=
CKEDITOR.getUrl(b),c=C[b]||(C[b]={});c.fn?(c.fn.call(a,a.config),CKEDITOR.getUrl(a.config.customConfig)!=b&&k(a)||a.fireOnce("customConfigLoaded")):CKEDITOR.scriptLoader.queue(b,function(){c.fn=CKEDITOR.editorConfig?CKEDITOR.editorConfig:function(){};k(a)});return!0}function l(a,b){a.on("customConfigLoaded",function(){if(b){if(b.on)for(var c in b.on)a.on(c,b.on[c]);CKEDITOR.tools.extend(a.config,b,!0);delete a.config.on}c=a.config;a.readOnly=c.readOnly?!0:a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?
a.element.is("textarea")?a.element.hasAttribute("disabled")||a.element.hasAttribute("readonly"):a.element.isReadOnly():a.elementMode==CKEDITOR.ELEMENT_MODE_REPLACE?a.element.hasAttribute("disabled")||a.element.hasAttribute("readonly"):!1;a.blockless=a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?!(a.element.is("textarea")||CKEDITOR.dtd[a.element.getName()].p):!1;a.tabIndex=c.tabIndex||a.element&&a.element.getAttribute("tabindex")||0;a.activeEnterMode=a.enterMode=a.blockless?CKEDITOR.ENTER_BR:c.enterMode;
a.activeShiftEnterMode=a.shiftEnterMode=a.blockless?CKEDITOR.ENTER_BR:c.shiftEnterMode;c.skin&&(CKEDITOR.skinName=c.skin);a.fireOnce("configLoaded");a.dataProcessor=new CKEDITOR.htmlDataProcessor(a);a.filter=a.activeFilter=new CKEDITOR.filter(a);q(a)});b&&null!=b.customConfig&&(a.config.customConfig=b.customConfig);k(a)||a.fireOnce("customConfigLoaded")}function q(a){CKEDITOR.skin.loadPart("editor",function(){t(a)})}function t(a){CKEDITOR.lang.load(a.config.language,a.config.defaultLanguage,function(b,
c){var d=a.config.title;a.langCode=b;a.lang=CKEDITOR.tools.prototypedCopy(c);a.title="string"==typeof d||!1===d?d:[a.lang.editor,a.name].join(", ");a.config.contentsLangDirection||(a.config.contentsLangDirection=a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?a.element.getDirection(1):a.lang.dir);a.fire("langLoaded");g(a)})}function g(a){a.getStylesSet(function(b){a.once("loaded",function(){a.fire("stylesSet",{styles:b})},null,null,1);z(a)})}function z(a){var b=a.config,c=b.plugins,d=b.extraPlugins,e=
b.removePlugins;if(d)var h=new RegExp("(?:^|,)(?:"+d.replace(/\s*,\s*/g,"|")+")(?\x3d,|$)","g"),c=c.replace(h,""),c=c+(","+d);if(e)var p=new RegExp("(?:^|,)(?:"+e.replace(/\s*,\s*/g,"|")+")(?\x3d,|$)","g"),c=c.replace(p,"");CKEDITOR.env.air&&(c+=",adobeair");CKEDITOR.plugins.load(c.split(","),function(c){var d=[],h=[],e=[];a.plugins=c;for(var f in c){var u=c[f],g=u.lang,k=null,l=u.requires,x;CKEDITOR.tools.isArray(l)&&(l=l.join(","));if(l&&(x=l.match(p)))for(;l=x.pop();)CKEDITOR.error("editor-plugin-required",
{plugin:l.replace(",",""),requiredBy:f});g&&!a.lang[f]&&(g.split&&(g=g.split(",")),0<=CKEDITOR.tools.indexOf(g,a.langCode)?k=a.langCode:(k=a.langCode.replace(/-.*/,""),k=k!=a.langCode&&0<=CKEDITOR.tools.indexOf(g,k)?k:0<=CKEDITOR.tools.indexOf(g,"en")?"en":g[0]),u.langEntries&&u.langEntries[k]?(a.lang[f]=u.langEntries[k],k=null):e.push(CKEDITOR.getUrl(u.path+"lang/"+k+".js")));h.push(k);d.push(u)}CKEDITOR.scriptLoader.load(e,function(){for(var c=["beforeInit","init","afterInit"],e=0;e<c.length;e++)for(var p=
0;p<d.length;p++){var m=d[p];0===e&&h[p]&&m.lang&&m.langEntries&&(a.lang[m.name]=m.langEntries[h[p]]);if(m[c[e]])m[c[e]](a)}a.fireOnce("pluginsLoaded");b.keystrokes&&a.setKeystroke(a.config.keystrokes);for(p=0;p<a.config.blockedKeystrokes.length;p++)a.keystrokeHandler.blockedKeystrokes[a.config.blockedKeystrokes[p]]=1;a.status="loaded";a.fireOnce("loaded");CKEDITOR.fire("instanceLoaded",null,a)})})}function A(){var a=this.element;if(a&&this.elementMode!=CKEDITOR.ELEMENT_MODE_APPENDTO){var b=this.getData();
this.config.htmlEncodeOutput&&(b=CKEDITOR.tools.htmlEncode(b));a.is("textarea")?a.setValue(b):a.setHtml(b);return!0}return!1}a.prototype=CKEDITOR.editor.prototype;CKEDITOR.editor=a;var v=0,C={};CKEDITOR.tools.extend(CKEDITOR.editor.prototype,{addCommand:function(a,b){b.name=a.toLowerCase();var c=new CKEDITOR.command(this,b);this.mode&&e(this,c);return this.commands[a]=c},_attachToForm:function(){function a(b){c.updateElement();c._.required&&!d.getValue()&&!1===c.fire("required")&&b.data.preventDefault()}
function b(a){return!!(a&&a.call&&a.apply)}var c=this,d=c.element,e=new CKEDITOR.dom.element(d.$.form);d.is("textarea")&&e&&(e.on("submit",a),b(e.$.submit)&&(e.$.submit=CKEDITOR.tools.override(e.$.submit,function(b){return function(){a();b.apply?b.apply(this):b()}})),c.on("destroy",function(){e.removeListener("submit",a)}))},destroy:function(a){this.fire("beforeDestroy");!a&&A.call(this);this.editable(null);this.filter&&(this.filter.destroy(),delete this.filter);delete this.activeFilter;this.status=
"destroyed";this.fire("destroy");this.removeAllListeners();CKEDITOR.remove(this);CKEDITOR.fire("instanceDestroyed",null,this)},elementPath:function(a){if(!a){a=this.getSelection();if(!a)return null;a=a.getStartElement()}return a?new CKEDITOR.dom.elementPath(a,this.editable()):null},createRange:function(){var a=this.editable();return a?new CKEDITOR.dom.range(a):null},execCommand:function(a,b){var c=this.getCommand(a),d={name:a,commandData:b,command:c};return c&&c.state!=CKEDITOR.TRISTATE_DISABLED&&
!1!==this.fire("beforeCommandExec",d)&&(d.returnValue=c.exec(d.commandData),!c.async&&!1!==this.fire("afterCommandExec",d))?d.returnValue:!1},getCommand:function(a){return this.commands[a]},getData:function(a){!a&&this.fire("beforeGetData");var b=this._.data;"string"!=typeof b&&(b=(b=this.element)&&this.elementMode==CKEDITOR.ELEMENT_MODE_REPLACE?b.is("textarea")?b.getValue():b.getHtml():"");b={dataValue:b};!a&&this.fire("getData",b);return b.dataValue},getSnapshot:function(){var a=this.fire("getSnapshot");
"string"!=typeof a&&(a=(a=this.element)&&this.elementMode==CKEDITOR.ELEMENT_MODE_REPLACE?a.is("textarea")?a.getValue():a.getHtml():"");return a},loadSnapshot:function(a){this.fire("loadSnapshot",a)},setData:function(a,b,c){var d=!0,e=b;b&&"object"==typeof b&&(c=b.internal,e=b.callback,d=!b.noSnapshot);!c&&d&&this.fire("saveSnapshot");if(e||!c)this.once("dataReady",function(a){!c&&d&&this.fire("saveSnapshot");e&&e.call(a.editor)});a={dataValue:a};!c&&this.fire("setData",a);this._.data=a.dataValue;
!c&&this.fire("afterSetData",a)},setReadOnly:function(a){a=null==a||a;this.readOnly!=a&&(this.readOnly=a,this.keystrokeHandler.blockedKeystrokes[8]=+a,this.editable().setReadOnly(a),this.fire("readOnly"))},insertHtml:function(a,b,c){this.fire("insertHtml",{dataValue:a,mode:b,range:c})},insertText:function(a){this.fire("insertText",a)},insertElement:function(a){this.fire("insertElement",a)},getSelectedHtml:function(a){var b=this.editable(),c=this.getSelection(),c=c&&c.getRanges();if(!b||!c||0===c.length)return null;
b=b.getHtmlFromRange(c[0]);return a?b.getHtml():b},extractSelectedHtml:function(a,b){var c=this.editable(),d=this.getSelection().getRanges();if(!c||0===d.length)return null;d=d[0];c=c.extractHtmlFromRange(d,b);b||this.getSelection().selectRanges([d]);return a?c.getHtml():c},focus:function(){this.fire("beforeFocus")},checkDirty:function(){return"ready"==this.status&&this._.previousValue!==this.getSnapshot()},resetDirty:function(){this._.previousValue=this.getSnapshot()},updateElement:function(){return A.call(this)},
setKeystroke:function(){for(var a=this.keystrokeHandler.keystrokes,b=CKEDITOR.tools.isArray(arguments[0])?arguments[0]:[[].slice.call(arguments,0)],c,d,e=b.length;e--;)c=b[e],d=0,CKEDITOR.tools.isArray(c)&&(d=c[1],c=c[0]),d?a[c]=d:delete a[c]},addFeature:function(a){return this.filter.addFeature(a)},setActiveFilter:function(a){a||(a=this.filter);this.activeFilter!==a&&(this.activeFilter=a,this.fire("activeFilterChange"),a===this.filter?this.setActiveEnterMode(null,null):this.setActiveEnterMode(a.getAllowedEnterMode(this.enterMode),
a.getAllowedEnterMode(this.shiftEnterMode,!0)))},setActiveEnterMode:function(a,b){a=a?this.blockless?CKEDITOR.ENTER_BR:a:this.enterMode;b=b?this.blockless?CKEDITOR.ENTER_BR:b:this.shiftEnterMode;if(this.activeEnterMode!=a||this.activeShiftEnterMode!=b)this.activeEnterMode=a,this.activeShiftEnterMode=b,this.fire("activeEnterModeChange")},showNotification:function(a){alert(a)}})})();CKEDITOR.ELEMENT_MODE_NONE=0;CKEDITOR.ELEMENT_MODE_REPLACE=1;CKEDITOR.ELEMENT_MODE_APPENDTO=2;
CKEDITOR.ELEMENT_MODE_INLINE=3;CKEDITOR.htmlParser=function(){this._={htmlPartsRegex:/<(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)--\x3e)|(?:([^\/\s>]+)((?:\s+[\w\-:.]+(?:\s*=\s*?(?:(?:"[^"]*")|(?:'[^']*')|[^\s"'\/>]+))?)*)[\S\s]*?(\/?)>))/g}};
(function(){var a=/([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g,d={checked:1,compact:1,declare:1,defer:1,disabled:1,ismap:1,multiple:1,nohref:1,noresize:1,noshade:1,nowrap:1,readonly:1,selected:1};CKEDITOR.htmlParser.prototype={onTagOpen:function(){},onTagClose:function(){},onText:function(){},onCDATA:function(){},onComment:function(){},parse:function(b){for(var c,e,f=0,k;c=this._.htmlPartsRegex.exec(b);){e=c.index;if(e>f)if(f=b.substring(f,e),k)k.push(f);else this.onText(f);
f=this._.htmlPartsRegex.lastIndex;if(e=c[1])if(e=e.toLowerCase(),k&&CKEDITOR.dtd.$cdata[e]&&(this.onCDATA(k.join("")),k=null),!k){this.onTagClose(e);continue}if(k)k.push(c[0]);else if(e=c[3]){if(e=e.toLowerCase(),!/="/.test(e)){var l={},q,t=c[4];c=!!c[5];if(t)for(;q=a.exec(t);){var g=q[1].toLowerCase();q=q[2]||q[3]||q[4]||"";l[g]=!q&&d[g]?g:CKEDITOR.tools.htmlDecodeAttr(q)}this.onTagOpen(e,l,c);!k&&CKEDITOR.dtd.$cdata[e]&&(k=[])}}else if(e=c[2])this.onComment(e)}if(b.length>f)this.onText(b.substring(f,
b.length))}}})();
CKEDITOR.htmlParser.basicWriter=CKEDITOR.tools.createClass({$:function(){this._={output:[]}},proto:{openTag:function(a){this._.output.push("\x3c",a)},openTagClose:function(a,d){d?this._.output.push(" /\x3e"):this._.output.push("\x3e")},attribute:function(a,d){"string"==typeof d&&(d=CKEDITOR.tools.htmlEncodeAttr(d));this._.output.push(" ",a,'\x3d"',d,'"')},closeTag:function(a){this._.output.push("\x3c/",a,"\x3e")},text:function(a){this._.output.push(a)},comment:function(a){this._.output.push("\x3c!--",a,
"--\x3e")},write:function(a){this._.output.push(a)},reset:function(){this._.output=[];this._.indent=!1},getHtml:function(a){var d=this._.output.join("");a&&this.reset();return d}}});"use strict";
(function(){CKEDITOR.htmlParser.node=function(){};CKEDITOR.htmlParser.node.prototype={remove:function(){var a=this.parent.children,d=CKEDITOR.tools.indexOf(a,this),b=this.previous,c=this.next;b&&(b.next=c);c&&(c.previous=b);a.splice(d,1);this.parent=null},replaceWith:function(a){var d=this.parent.children,b=CKEDITOR.tools.indexOf(d,this),c=a.previous=this.previous,e=a.next=this.next;c&&(c.next=a);e&&(e.previous=a);d[b]=a;a.parent=this.parent;this.parent=null},insertAfter:function(a){var d=a.parent.children,
b=CKEDITOR.tools.indexOf(d,a),c=a.next;d.splice(b+1,0,this);this.next=a.next;this.previous=a;a.next=this;c&&(c.previous=this);this.parent=a.parent},insertBefore:function(a){var d=a.parent.children,b=CKEDITOR.tools.indexOf(d,a);d.splice(b,0,this);this.next=a;(this.previous=a.previous)&&(a.previous.next=this);a.previous=this;this.parent=a.parent},getAscendant:function(a){var d="function"==typeof a?a:"string"==typeof a?function(b){return b.name==a}:function(b){return b.name in a},b=this.parent;for(;b&&
b.type==CKEDITOR.NODE_ELEMENT;){if(d(b))return b;b=b.parent}return null},wrapWith:function(a){this.replaceWith(a);a.add(this);return a},getIndex:function(){return CKEDITOR.tools.indexOf(this.parent.children,this)},getFilterContext:function(a){return a||{}}}})();"use strict";CKEDITOR.htmlParser.comment=function(a){this.value=a;this._={isBlockLike:!1}};
CKEDITOR.htmlParser.comment.prototype=CKEDITOR.tools.extend(new CKEDITOR.htmlParser.node,{type:CKEDITOR.NODE_COMMENT,filter:function(a,d){var b=this.value;if(!(b=a.onComment(d,b,this)))return this.remove(),!1;if("string"!=typeof b)return this.replaceWith(b),!1;this.value=b;return!0},writeHtml:function(a,d){d&&this.filter(d);a.comment(this.value)}});"use strict";
(function(){CKEDITOR.htmlParser.text=function(a){this.value=a;this._={isBlockLike:!1}};CKEDITOR.htmlParser.text.prototype=CKEDITOR.tools.extend(new CKEDITOR.htmlParser.node,{type:CKEDITOR.NODE_TEXT,filter:function(a,d){if(!(this.value=a.onText(d,this.value,this)))return this.remove(),!1},writeHtml:function(a,d){d&&this.filter(d);a.text(this.value)}})})();"use strict";
(function(){CKEDITOR.htmlParser.cdata=function(a){this.value=a};CKEDITOR.htmlParser.cdata.prototype=CKEDITOR.tools.extend(new CKEDITOR.htmlParser.node,{type:CKEDITOR.NODE_TEXT,filter:function(){},writeHtml:function(a){a.write(this.value)}})})();"use strict";CKEDITOR.htmlParser.fragment=function(){this.children=[];this.parent=null;this._={isBlockLike:!0,hasInlineStarted:!1}};
(function(){function a(a){return a.attributes["data-cke-survive"]?!1:"a"==a.name&&a.attributes.href||CKEDITOR.dtd.$removeEmpty[a.name]}var d=CKEDITOR.tools.extend({table:1,ul:1,ol:1,dl:1},CKEDITOR.dtd.table,CKEDITOR.dtd.ul,CKEDITOR.dtd.ol,CKEDITOR.dtd.dl),b={ol:1,ul:1},c=CKEDITOR.tools.extend({},{html:1},CKEDITOR.dtd.html,CKEDITOR.dtd.body,CKEDITOR.dtd.head,{style:1,script:1}),e={ul:"li",ol:"li",dl:"dd",table:"tbody",tbody:"tr",thead:"tr",tfoot:"tr",tr:"td"};CKEDITOR.htmlParser.fragment.fromHtml=
function(f,k,l){function q(a){var b;if(0<y.length)for(var c=0;c<y.length;c++){var d=y[c],h=d.name,e=CKEDITOR.dtd[h],f=w.name&&CKEDITOR.dtd[w.name];f&&!f[h]||a&&e&&!e[a]&&CKEDITOR.dtd[a]?h==w.name&&(z(w,w.parent,1),c--):(b||(t(),b=1),d=d.clone(),d.parent=w,w=d,y.splice(c,1),c--)}}function t(){for(;F.length;)z(F.shift(),w)}function g(a){if(a._.isBlockLike&&"pre"!=a.name&&"textarea"!=a.name){var b=a.children.length,c=a.children[b-1],d;c&&c.type==CKEDITOR.NODE_TEXT&&((d=CKEDITOR.tools.rtrim(c.value))?
c.value=d:a.children.length=b-1)}}function z(b,c,d){c=c||w||n;var e=w;void 0===b.previous&&(A(c,b)&&(w=c,C.onTagOpen(l,{}),b.returnPoint=c=w),g(b),a(b)&&!b.children.length||c.add(b),"pre"==b.name&&(h=!1),"textarea"==b.name&&(u=!1));b.returnPoint?(w=b.returnPoint,delete b.returnPoint):w=d?c:e}function A(a,b){if((a==n||"body"==a.name)&&l&&(!a.name||CKEDITOR.dtd[a.name][l])){var c,d;return(c=b.attributes&&(d=b.attributes["data-cke-real-element-type"])?d:b.name)&&c in CKEDITOR.dtd.$inline&&!(c in CKEDITOR.dtd.head)&&
!b.isOrphan||b.type==CKEDITOR.NODE_TEXT}}function v(a,b){return a in CKEDITOR.dtd.$listItem||a in CKEDITOR.dtd.$tableContent?a==b||"dt"==a&&"dd"==b||"dd"==a&&"dt"==b:!1}var C=new CKEDITOR.htmlParser,n=k instanceof CKEDITOR.htmlParser.element?k:"string"==typeof k?new CKEDITOR.htmlParser.element(k):new CKEDITOR.htmlParser.fragment,y=[],F=[],w=n,u="textarea"==n.name,h="pre"==n.name;C.onTagOpen=function(e,m,f,r){m=new CKEDITOR.htmlParser.element(e,m);m.isUnknown&&f&&(m.isEmpty=!0);m.isOptionalClose=r;
if(a(m))y.push(m);else{if("pre"==e)h=!0;else{if("br"==e&&h){w.add(new CKEDITOR.htmlParser.text("\n"));return}"textarea"==e&&(u=!0)}if("br"==e)F.push(m);else{for(;!(r=(f=w.name)?CKEDITOR.dtd[f]||(w._.isBlockLike?CKEDITOR.dtd.div:CKEDITOR.dtd.span):c,m.isUnknown||w.isUnknown||r[e]);)if(w.isOptionalClose)C.onTagClose(f);else if(e in b&&f in b)f=w.children,(f=f[f.length-1])&&"li"==f.name||z(f=new CKEDITOR.htmlParser.element("li"),w),!m.returnPoint&&(m.returnPoint=w),w=f;else if(e in CKEDITOR.dtd.$listItem&&
!v(e,f))C.onTagOpen("li"==e?"ul":"dl",{},0,1);else if(f in d&&!v(e,f))!m.returnPoint&&(m.returnPoint=w),w=w.parent;else if(f in CKEDITOR.dtd.$inline&&y.unshift(w),w.parent)z(w,w.parent,1);else{m.isOrphan=1;break}q(e);t();m.parent=w;m.isEmpty?z(m):w=m}}};C.onTagClose=function(a){for(var b=y.length-1;0<=b;b--)if(a==y[b].name){y.splice(b,1);return}for(var c=[],d=[],h=w;h!=n&&h.name!=a;)h._.isBlockLike||d.unshift(h),c.push(h),h=h.returnPoint||h.parent;if(h!=n){for(b=0;b<c.length;b++){var e=c[b];z(e,e.parent)}w=
h;h._.isBlockLike&&t();z(h,h.parent);h==w&&(w=w.parent);y=y.concat(d)}"body"==a&&(l=!1)};C.onText=function(a){if(!(w._.hasInlineStarted&&!F.length||h||u)&&(a=CKEDITOR.tools.ltrim(a),0===a.length))return;var b=w.name,f=b?CKEDITOR.dtd[b]||(w._.isBlockLike?CKEDITOR.dtd.div:CKEDITOR.dtd.span):c;if(!u&&!f["#"]&&b in d)C.onTagOpen(e[b]||""),C.onText(a);else{t();q();h||u||(a=a.replace(/[\t\r\n ]{2,}|[\t\r\n]/g," "));a=new CKEDITOR.htmlParser.text(a);if(A(w,a))this.onTagOpen(l,{},0,1);w.add(a)}};C.onCDATA=
function(a){w.add(new CKEDITOR.htmlParser.cdata(a))};C.onComment=function(a){t();q();w.add(new CKEDITOR.htmlParser.comment(a))};C.parse(f);for(t();w!=n;)z(w,w.parent,1);g(n);return n};CKEDITOR.htmlParser.fragment.prototype={type:CKEDITOR.NODE_DOCUMENT_FRAGMENT,add:function(a,b){isNaN(b)&&(b=this.children.length);var c=0<b?this.children[b-1]:null;if(c){if(a._.isBlockLike&&c.type==CKEDITOR.NODE_TEXT&&(c.value=CKEDITOR.tools.rtrim(c.value),0===c.value.length)){this.children.pop();this.add(a);return}c.next=
a}a.previous=c;a.parent=this;this.children.splice(b,0,a);this._.hasInlineStarted||(this._.hasInlineStarted=a.type==CKEDITOR.NODE_TEXT||a.type==CKEDITOR.NODE_ELEMENT&&!a._.isBlockLike)},filter:function(a,b){b=this.getFilterContext(b);a.onRoot(b,this);this.filterChildren(a,!1,b)},filterChildren:function(a,b,c){if(this.childrenFilteredBy!=a.id){c=this.getFilterContext(c);if(b&&!this.parent)a.onRoot(c,this);this.childrenFilteredBy=a.id;for(b=0;b<this.children.length;b++)!1===this.children[b].filter(a,
c)&&b--}},writeHtml:function(a,b){b&&this.filter(b);this.writeChildrenHtml(a)},writeChildrenHtml:function(a,b,c){var d=this.getFilterContext();if(c&&!this.parent&&b)b.onRoot(d,this);b&&this.filterChildren(b,!1,d);b=0;c=this.children;for(d=c.length;b<d;b++)c[b].writeHtml(a)},forEach:function(a,b,c){if(!(c||b&&this.type!=b))var d=a(this);if(!1!==d){c=this.children;for(var e=0;e<c.length;e++)d=c[e],d.type==CKEDITOR.NODE_ELEMENT?d.forEach(a,b):b&&d.type!=b||a(d)}},getFilterContext:function(a){return a||
{}}}})();"use strict";
(function(){function a(){this.rules=[]}function d(b,c,d,f){var k,l;for(k in c)(l=b[k])||(l=b[k]=new a),l.add(c[k],d,f)}CKEDITOR.htmlParser.filter=CKEDITOR.tools.createClass({$:function(b){this.id=CKEDITOR.tools.getNextNumber();this.elementNameRules=new a;this.attributeNameRules=new a;this.elementsRules={};this.attributesRules={};this.textRules=new a;this.commentRules=new a;this.rootRules=new a;b&&this.addRules(b,10)},proto:{addRules:function(a,c){var e;"number"==typeof c?e=c:c&&"priority"in c&&(e=
c.priority);"number"!=typeof e&&(e=10);"object"!=typeof c&&(c={});a.elementNames&&this.elementNameRules.addMany(a.elementNames,e,c);a.attributeNames&&this.attributeNameRules.addMany(a.attributeNames,e,c);a.elements&&d(this.elementsRules,a.elements,e,c);a.attributes&&d(this.attributesRules,a.attributes,e,c);a.text&&this.textRules.add(a.text,e,c);a.comment&&this.commentRules.add(a.comment,e,c);a.root&&this.rootRules.add(a.root,e,c)},applyTo:function(a){a.filter(this)},onElementName:function(a,c){return this.elementNameRules.execOnName(a,
c)},onAttributeName:function(a,c){return this.attributeNameRules.execOnName(a,c)},onText:function(a,c,d){return this.textRules.exec(a,c,d)},onComment:function(a,c,d){return this.commentRules.exec(a,c,d)},onRoot:function(a,c){return this.rootRules.exec(a,c)},onElement:function(a,c){for(var d=[this.elementsRules["^"],this.elementsRules[c.name],this.elementsRules.$],f,k=0;3>k;k++)if(f=d[k]){f=f.exec(a,c,this);if(!1===f)return null;if(f&&f!=c)return this.onNode(a,f);if(c.parent&&!c.name)break}return c},
onNode:function(a,c){var d=c.type;return d==CKEDITOR.NODE_ELEMENT?this.onElement(a,c):d==CKEDITOR.NODE_TEXT?new CKEDITOR.htmlParser.text(this.onText(a,c.value)):d==CKEDITOR.NODE_COMMENT?new CKEDITOR.htmlParser.comment(this.onComment(a,c.value)):null},onAttribute:function(a,c,d,f){return(d=this.attributesRules[d])?d.exec(a,f,c,this):f}}});CKEDITOR.htmlParser.filterRulesGroup=a;a.prototype={add:function(a,c,d){this.rules.splice(this.findIndex(c),0,{value:a,priority:c,options:d})},addMany:function(a,
c,d){for(var f=[this.findIndex(c),0],k=0,l=a.length;k<l;k++)f.push({value:a[k],priority:c,options:d});this.rules.splice.apply(this.rules,f)},findIndex:function(a){for(var c=this.rules,d=c.length-1;0<=d&&a<c[d].priority;)d--;return d+1},exec:function(a,c){var d=c instanceof CKEDITOR.htmlParser.node||c instanceof CKEDITOR.htmlParser.fragment,f=Array.prototype.slice.call(arguments,1),k=this.rules,l=k.length,q,t,g,z;for(z=0;z<l;z++)if(d&&(q=c.type,t=c.name),g=k[z],!(a.nonEditable&&!g.options.applyToAll||
a.nestedEditable&&g.options.excludeNestedEditable)){g=g.value.apply(null,f);if(!1===g||d&&g&&(g.name!=t||g.type!=q))return g;null!=g&&(f[0]=c=g)}return c},execOnName:function(a,c){for(var d=0,f=this.rules,k=f.length,l;c&&d<k;d++)l=f[d],a.nonEditable&&!l.options.applyToAll||a.nestedEditable&&l.options.excludeNestedEditable||(c=c.replace(l.value[0],l.value[1]));return c}}})();
(function(){function a(a,d){function m(a){return a||CKEDITOR.env.needsNbspFiller?new CKEDITOR.htmlParser.text(" "):new CKEDITOR.htmlParser.element("br",{"data-cke-bogus":1})}function p(a,d){return function(h){if(h.type!=CKEDITOR.NODE_DOCUMENT_FRAGMENT){var e=[],p=b(h),u,E;if(p)for(r(p,1)&&e.push(p);p;)f(p)&&(u=c(p))&&r(u)&&((E=c(u))&&!f(E)?e.push(u):(m(g).insertAfter(u),u.remove())),p=p.previous;for(p=0;p<e.length;p++)e[p].remove();if(e=!a||!1!==("function"==typeof d?d(h):d))g||CKEDITOR.env.needsBrFiller||
h.type!=CKEDITOR.NODE_DOCUMENT_FRAGMENT?g||CKEDITOR.env.needsBrFiller||!(7<document.documentMode||h.name in CKEDITOR.dtd.tr||h.name in CKEDITOR.dtd.$listItem)?(e=b(h),e=!e||"form"==h.name&&"input"==e.name):e=!1:e=!1;e&&h.add(m(a))}}}function r(a,b){if((!g||CKEDITOR.env.needsBrFiller)&&a.type==CKEDITOR.NODE_ELEMENT&&"br"==a.name&&!a.attributes["data-cke-eol"])return!0;var c;return a.type==CKEDITOR.NODE_TEXT&&(c=a.value.match(y))&&(c.index&&((new CKEDITOR.htmlParser.text(a.value.substring(0,c.index))).insertBefore(a),
a.value=c[0]),!CKEDITOR.env.needsBrFiller&&g&&(!b||a.parent.name in x)||!g&&((c=a.previous)&&"br"==c.name||!c||f(c)))?!0:!1}var u={elements:{}},g="html"==d,x=CKEDITOR.tools.extend({},h),D;for(D in x)"#"in w[D]||delete x[D];for(D in x)u.elements[D]=p(g,a.config.fillEmptyBlocks);u.root=p(g,!1);u.elements.br=function(a){return function(b){if(b.parent.type!=CKEDITOR.NODE_DOCUMENT_FRAGMENT){var d=b.attributes;if("data-cke-bogus"in d||"data-cke-eol"in d)delete d["data-cke-bogus"];else{for(d=b.next;d&&e(d);)d=
d.next;var h=c(b);!d&&f(b.parent)?k(b.parent,m(a)):f(d)&&h&&!f(h)&&m(a).insertBefore(d)}}}}(g);return u}function d(a,b){return a!=CKEDITOR.ENTER_BR&&!1!==b?a==CKEDITOR.ENTER_DIV?"div":"p":!1}function b(a){for(a=a.children[a.children.length-1];a&&e(a);)a=a.previous;return a}function c(a){for(a=a.previous;a&&e(a);)a=a.previous;return a}function e(a){return a.type==CKEDITOR.NODE_TEXT&&!CKEDITOR.tools.trim(a.value)||a.type==CKEDITOR.NODE_ELEMENT&&a.attributes["data-cke-bookmark"]}function f(a){return a&&
(a.type==CKEDITOR.NODE_ELEMENT&&a.name in h||a.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT)}function k(a,b){var c=a.children[a.children.length-1];a.children.push(b);b.parent=a;c&&(c.next=b,b.previous=c)}function l(a){a=a.attributes;"false"!=a.contenteditable&&(a["data-cke-editable"]=a.contenteditable?"true":1);a.contenteditable="false"}function q(a){a=a.attributes;switch(a["data-cke-editable"]){case "true":a.contenteditable="true";break;case "1":delete a.contenteditable}}function t(a){return a.replace(G,
function(a,b,c){return"\x3c"+b+c.replace(B,function(a,b){return L.test(b)&&-1==c.indexOf("data-cke-saved-"+b)?" data-cke-saved-"+a+" data-cke-"+CKEDITOR.rnd+"-"+a:a})+"\x3e"})}function g(a,b){return a.replace(b,function(a,b,c){0===a.indexOf("\x3ctextarea")&&(a=b+v(c).replace(/</g,"\x26lt;").replace(/>/g,"\x26gt;")+"\x3c/textarea\x3e");return"\x3ccke:encoded\x3e"+encodeURIComponent(a)+"\x3c/cke:encoded\x3e"})}function z(a){return a.replace(S,function(a,b){return decodeURIComponent(b)})}function A(a){return a.replace(/\x3c!--(?!{cke_protected})[\s\S]+?--\x3e/g,
function(a){return"\x3c!--"+F+"{C}"+encodeURIComponent(a).replace(/--/g,"%2D%2D")+"--\x3e"})}function v(a){return a.replace(/\x3c!--\{cke_protected\}\{C\}([\s\S]+?)--\x3e/g,function(a,b){return decodeURIComponent(b)})}function C(a,b){var c=b._.dataStore;return a.replace(/\x3c!--\{cke_protected\}([\s\S]+?)--\x3e/g,function(a,b){return decodeURIComponent(b)}).replace(/\{cke_protected_(\d+)\}/g,function(a,b){return c&&c[b]||""})}function n(a,b){var c=[],d=b.config.protectedSource,h=b._.dataStore||(b._.dataStore=
{id:1}),e=/<\!--\{cke_temp(comment)?\}(\d*?)--\x3e/g,d=[/<script[\s\S]*?(<\/script>|$)/gi,/<noscript[\s\S]*?<\/noscript>/gi,/<meta[\s\S]*?\/?>/gi].concat(d);a=a.replace(/\x3c!--[\s\S]*?--\x3e/g,function(a){return"\x3c!--{cke_tempcomment}"+(c.push(a)-1)+"--\x3e"});for(var m=0;m<d.length;m++)a=a.replace(d[m],function(a){a=a.replace(e,function(a,b,d){return c[d]});return/cke_temp(comment)?/.test(a)?a:"\x3c!--{cke_temp}"+(c.push(a)-1)+"--\x3e"});a=a.replace(e,function(a,b,d){return"\x3c!--"+F+(b?"{C}":
"")+encodeURIComponent(c[d]).replace(/--/g,"%2D%2D")+"--\x3e"});a=a.replace(/<\w+(?:\s+(?:(?:[^\s=>]+\s*=\s*(?:[^'"\s>]+|'[^']*'|"[^"]*"))|[^\s=\/>]+))+\s*\/?>/g,function(a){return a.replace(/\x3c!--\{cke_protected\}([^>]*)--\x3e/g,function(a,b){h[h.id]=decodeURIComponent(b);return"{cke_protected_"+h.id++ +"}"})});return a=a.replace(/<(title|iframe|textarea)([^>]*)>([\s\S]*?)<\/\1>/g,function(a,c,d,h){return"\x3c"+c+d+"\x3e"+C(v(h),b)+"\x3c/"+c+"\x3e"})}CKEDITOR.htmlDataProcessor=function(b){var c,
h,e=this;this.editor=b;this.dataFilter=c=new CKEDITOR.htmlParser.filter;this.htmlFilter=h=new CKEDITOR.htmlParser.filter;this.writer=new CKEDITOR.htmlParser.basicWriter;c.addRules(p);c.addRules(m,{applyToAll:!0});c.addRules(a(b,"data"),{applyToAll:!0});h.addRules(D);h.addRules(r,{applyToAll:!0});h.addRules(a(b,"html"),{applyToAll:!0});b.on("toHtml",function(a){a=a.data;var c=a.dataValue,h,c=n(c,b),c=g(c,M),c=t(c),c=g(c,T),c=c.replace(x,"$1cke:$2"),c=c.replace(I,"\x3ccke:$1$2\x3e\x3c/cke:$1\x3e"),
c=c.replace(/(<pre\b[^>]*>)(\r\n|\n)/g,"$1$2$2"),c=c.replace(/([^a-z0-9<\-])(on\w{3,})(?!>)/gi,"$1data-cke-"+CKEDITOR.rnd+"-$2");h=a.context||b.editable().getName();var e;CKEDITOR.env.ie&&9>CKEDITOR.env.version&&"pre"==h&&(h="div",c="\x3cpre\x3e"+c+"\x3c/pre\x3e",e=1);h=b.document.createElement(h);h.setHtml("a"+c);c=h.getHtml().substr(1);c=c.replace(new RegExp("data-cke-"+CKEDITOR.rnd+"-","ig"),"");e&&(c=c.replace(/^<pre>|<\/pre>$/gi,""));c=c.replace(H,"$1$2");c=z(c);c=v(c);h=!1===a.fixForBody?!1:
d(a.enterMode,b.config.autoParagraph);c=CKEDITOR.htmlParser.fragment.fromHtml(c,a.context,h);h&&(e=c,!e.children.length&&CKEDITOR.dtd[e.name][h]&&(h=new CKEDITOR.htmlParser.element(h),e.add(h)));a.dataValue=c},null,null,5);b.on("toHtml",function(a){a.data.filter.applyTo(a.data.dataValue,!0,a.data.dontFilter,a.data.enterMode)&&b.fire("dataFiltered")},null,null,6);b.on("toHtml",function(a){a.data.dataValue.filterChildren(e.dataFilter,!0)},null,null,10);b.on("toHtml",function(a){a=a.data;var b=a.dataValue,
c=new CKEDITOR.htmlParser.basicWriter;b.writeChildrenHtml(c);b=c.getHtml(!0);a.dataValue=A(b)},null,null,15);b.on("toDataFormat",function(a){var c=a.data.dataValue;a.data.enterMode!=CKEDITOR.ENTER_BR&&(c=c.replace(/^<br *\/?>/i,""));a.data.dataValue=CKEDITOR.htmlParser.fragment.fromHtml(c,a.data.context,d(a.data.enterMode,b.config.autoParagraph))},null,null,5);b.on("toDataFormat",function(a){a.data.dataValue.filterChildren(e.htmlFilter,!0)},null,null,10);b.on("toDataFormat",function(a){a.data.filter.applyTo(a.data.dataValue,
!1,!0)},null,null,11);b.on("toDataFormat",function(a){var c=a.data.dataValue,d=e.writer;d.reset();c.writeChildrenHtml(d);c=d.getHtml(!0);c=v(c);c=C(c,b);a.data.dataValue=c},null,null,15)};CKEDITOR.htmlDataProcessor.prototype={toHtml:function(a,b,c,d){var h=this.editor,e,m,p,r;b&&"object"==typeof b?(e=b.context,c=b.fixForBody,d=b.dontFilter,m=b.filter,p=b.enterMode,r=b.protectedWhitespaces):e=b;e||null===e||(e=h.editable().getName());return h.fire("toHtml",{dataValue:a,context:e,fixForBody:c,dontFilter:d,
filter:m||h.filter,enterMode:p||h.enterMode,protectedWhitespaces:r}).dataValue},toDataFormat:function(a,b){var c,d,h;b&&(c=b.context,d=b.filter,h=b.enterMode);c||null===c||(c=this.editor.editable().getName());return this.editor.fire("toDataFormat",{dataValue:a,filter:d||this.editor.filter,context:c,enterMode:h||this.editor.enterMode}).dataValue}};var y=/(?:&nbsp;|\xa0)$/,F="{cke_protected}",w=CKEDITOR.dtd,u="caption colgroup col thead tfoot tbody".split(" "),h=CKEDITOR.tools.extend({},w.$blockLimit,
w.$block),p={elements:{input:l,textarea:l}},m={attributeNames:[[/^on/,"data-cke-pa-on"],[/^data-cke-expando$/,""]]},D={elements:{embed:function(a){var b=a.parent;if(b&&"object"==b.name){var c=b.attributes.width,b=b.attributes.height;c&&(a.attributes.width=c);b&&(a.attributes.height=b)}},a:function(a){var b=a.attributes;if(!(a.children.length||b.name||b.id||a.attributes["data-cke-saved-name"]))return!1}}},r={elementNames:[[/^cke:/,""],[/^\?xml:namespace$/,""]],attributeNames:[[/^data-cke-(saved|pa)-/,
""],[/^data-cke-.*/,""],["hidefocus",""]],elements:{$:function(a){var b=a.attributes;if(b){if(b["data-cke-temp"])return!1;for(var c=["name","href","src"],d,h=0;h<c.length;h++)d="data-cke-saved-"+c[h],d in b&&delete b[c[h]]}return a},table:function(a){a.children.slice(0).sort(function(a,b){var c,d;a.type==CKEDITOR.NODE_ELEMENT&&b.type==a.type&&(c=CKEDITOR.tools.indexOf(u,a.name),d=CKEDITOR.tools.indexOf(u,b.name));-1<c&&-1<d&&c!=d||(c=a.parent?a.getIndex():-1,d=b.parent?b.getIndex():-1);return c>d?
1:-1})},param:function(a){a.children=[];a.isEmpty=!0;return a},span:function(a){"Apple-style-span"==a.attributes["class"]&&delete a.name},html:function(a){delete a.attributes.contenteditable;delete a.attributes["class"]},body:function(a){delete a.attributes.spellcheck;delete a.attributes.contenteditable},style:function(a){var b=a.children[0];b&&b.value&&(b.value=CKEDITOR.tools.trim(b.value));a.attributes.type||(a.attributes.type="text/css")},title:function(a){var b=a.children[0];!b&&k(a,b=new CKEDITOR.htmlParser.text);
b.value=a.attributes["data-cke-title"]||""},input:q,textarea:q},attributes:{"class":function(a){return CKEDITOR.tools.ltrim(a.replace(/(?:^|\s+)cke_[^\s]*/g,""))||!1}}};CKEDITOR.env.ie&&(r.attributes.style=function(a){return a.replace(/(^|;)([^\:]+)/g,function(a){return a.toLowerCase()})});var G=/<(a|area|img|input|source)\b([^>]*)>/gi,B=/([\w-:]+)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi,L=/^(href|src|name)$/i,T=/(?:<style(?=[ >])[^>]*>[\s\S]*?<\/style>)|(?:<(:?link|meta|base)[^>]*>)/gi,
M=/(<textarea(?=[ >])[^>]*>)([\s\S]*?)(?:<\/textarea>)/gi,S=/<cke:encoded>([^<]*)<\/cke:encoded>/gi,x=/(<\/?)((?:object|embed|param|html|body|head|title)[^>]*>)/gi,H=/(<\/?)cke:((?:html|body|head|title)[^>]*>)/gi,I=/<cke:(param|embed)([^>]*?)\/?>(?!\s*<\/cke:\1)/gi})();"use strict";
CKEDITOR.htmlParser.element=function(a,d){this.name=a;this.attributes=d||{};this.children=[];var b=a||"",c=b.match(/^cke:(.*)/);c&&(b=c[1]);b=!!(CKEDITOR.dtd.$nonBodyContent[b]||CKEDITOR.dtd.$block[b]||CKEDITOR.dtd.$listItem[b]||CKEDITOR.dtd.$tableContent[b]||CKEDITOR.dtd.$nonEditable[b]||"br"==b);this.isEmpty=!!CKEDITOR.dtd.$empty[a];this.isUnknown=!CKEDITOR.dtd[a];this._={isBlockLike:b,hasInlineStarted:this.isEmpty||!b}};
CKEDITOR.htmlParser.cssStyle=function(a){var d={};((a instanceof CKEDITOR.htmlParser.element?a.attributes.style:a)||"").replace(/&quot;/g,'"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,function(a,c,e){"font-family"==c&&(e=e.replace(/["']/g,""));d[c.toLowerCase()]=e});return{rules:d,populate:function(a){var c=this.toString();c&&(a instanceof CKEDITOR.dom.element?a.setAttribute("style",c):a instanceof CKEDITOR.htmlParser.element?a.attributes.style=c:a.style=c)},toString:function(){var a=[],c;
for(c in d)d[c]&&a.push(c,":",d[c],";");return a.join("")}}};
(function(){function a(a){return function(b){return b.type==CKEDITOR.NODE_ELEMENT&&("string"==typeof a?b.name==a:b.name in a)}}var d=function(a,b){a=a[0];b=b[0];return a<b?-1:a>b?1:0},b=CKEDITOR.htmlParser.fragment.prototype;CKEDITOR.htmlParser.element.prototype=CKEDITOR.tools.extend(new CKEDITOR.htmlParser.node,{type:CKEDITOR.NODE_ELEMENT,add:b.add,clone:function(){return new CKEDITOR.htmlParser.element(this.name,this.attributes)},filter:function(a,b){var d=this,k,l;b=d.getFilterContext(b);if(b.off)return!0;
if(!d.parent)a.onRoot(b,d);for(;;){k=d.name;if(!(l=a.onElementName(b,k)))return this.remove(),!1;d.name=l;if(!(d=a.onElement(b,d)))return this.remove(),!1;if(d!==this)return this.replaceWith(d),!1;if(d.name==k)break;if(d.type!=CKEDITOR.NODE_ELEMENT)return this.replaceWith(d),!1;if(!d.name)return this.replaceWithChildren(),!1}k=d.attributes;var q,t;for(q in k){for(l=k[q];;)if(t=a.onAttributeName(b,q))if(t!=q)delete k[q],q=t;else break;else{delete k[q];break}t&&(!1===(l=a.onAttribute(b,d,t,l))?delete k[t]:
k[t]=l)}d.isEmpty||this.filterChildren(a,!1,b);return!0},filterChildren:b.filterChildren,writeHtml:function(a,b){b&&this.filter(b);var f=this.name,k=[],l=this.attributes,q,t;a.openTag(f,l);for(q in l)k.push([q,l[q]]);a.sortAttributes&&k.sort(d);q=0;for(t=k.length;q<t;q++)l=k[q],a.attribute(l[0],l[1]);a.openTagClose(f,this.isEmpty);this.writeChildrenHtml(a);this.isEmpty||a.closeTag(f)},writeChildrenHtml:b.writeChildrenHtml,replaceWithChildren:function(){for(var a=this.children,b=a.length;b;)a[--b].insertAfter(this);
this.remove()},forEach:b.forEach,getFirst:function(b){if(!b)return this.children.length?this.children[0]:null;"function"!=typeof b&&(b=a(b));for(var d=0,f=this.children.length;d<f;++d)if(b(this.children[d]))return this.children[d];return null},getHtml:function(){var a=new CKEDITOR.htmlParser.basicWriter;this.writeChildrenHtml(a);return a.getHtml()},setHtml:function(a){a=this.children=CKEDITOR.htmlParser.fragment.fromHtml(a).children;for(var b=0,d=a.length;b<d;++b)a[b].parent=this},getOuterHtml:function(){var a=
new CKEDITOR.htmlParser.basicWriter;this.writeHtml(a);return a.getHtml()},split:function(a){for(var b=this.children.splice(a,this.children.length-a),d=this.clone(),k=0;k<b.length;++k)b[k].parent=d;d.children=b;b[0]&&(b[0].previous=null);0<a&&(this.children[a-1].next=null);this.parent.add(d,this.getIndex()+1);return d},addClass:function(a){if(!this.hasClass(a)){var b=this.attributes["class"]||"";this.attributes["class"]=b+(b?" ":"")+a}},removeClass:function(a){var b=this.attributes["class"];b&&((b=
CKEDITOR.tools.trim(b.replace(new RegExp("(?:\\s+|^)"+a+"(?:\\s+|$)")," ")))?this.attributes["class"]=b:delete this.attributes["class"])},hasClass:function(a){var b=this.attributes["class"];return b?(new RegExp("(?:^|\\s)"+a+"(?\x3d\\s|$)")).test(b):!1},getFilterContext:function(a){var b=[];a||(a={off:!1,nonEditable:!1,nestedEditable:!1});a.off||"off"!=this.attributes["data-cke-processor"]||b.push("off",!0);a.nonEditable||"false"!=this.attributes.contenteditable?a.nonEditable&&!a.nestedEditable&&
"true"==this.attributes.contenteditable&&b.push("nestedEditable",!0):b.push("nonEditable",!0);if(b.length){a=CKEDITOR.tools.copy(a);for(var d=0;d<b.length;d+=2)a[b[d]]=b[d+1]}return a}},!0)})();
(function(){var a={},d=/{([^}]+)}/g,b=/([\\'])/g,c=/\n/g,e=/\r/g;CKEDITOR.template=function(f){if(a[f])this.output=a[f];else{var k=f.replace(b,"\\$1").replace(c,"\\n").replace(e,"\\r").replace(d,function(a,b){return"',data['"+b+"']\x3d\x3dundefined?'{"+b+"}':data['"+b+"'],'"});this.output=a[f]=Function("data","buffer","return buffer?buffer.push('"+k+"'):['"+k+"'].join('');")}}})();delete CKEDITOR.loadFullCore;CKEDITOR.instances={};CKEDITOR.document=new CKEDITOR.dom.document(document);
CKEDITOR.add=function(a){CKEDITOR.instances[a.name]=a;a.on("focus",function(){CKEDITOR.currentInstance!=a&&(CKEDITOR.currentInstance=a,CKEDITOR.fire("currentInstance"))});a.on("blur",function(){CKEDITOR.currentInstance==a&&(CKEDITOR.currentInstance=null,CKEDITOR.fire("currentInstance"))});CKEDITOR.fire("instance",null,a)};CKEDITOR.remove=function(a){delete CKEDITOR.instances[a.name]};
(function(){var a={};CKEDITOR.addTemplate=function(d,b){var c=a[d];if(c)return c;c={name:d,source:b};CKEDITOR.fire("template",c);return a[d]=new CKEDITOR.template(c.source)};CKEDITOR.getTemplate=function(d){return a[d]}})();(function(){var a=[];CKEDITOR.addCss=function(d){a.push(d)};CKEDITOR.getCss=function(){return a.join("\n")}})();CKEDITOR.on("instanceDestroyed",function(){CKEDITOR.tools.isEmpty(this.instances)&&CKEDITOR.fire("reset")});CKEDITOR.TRISTATE_ON=1;CKEDITOR.TRISTATE_OFF=2;
CKEDITOR.TRISTATE_DISABLED=0;
(function(){CKEDITOR.inline=function(a,d){if(!CKEDITOR.env.isCompatible)return null;a=CKEDITOR.dom.element.get(a);if(a.getEditor())throw'The editor instance "'+a.getEditor().name+'" is already attached to the provided element.';var b=new CKEDITOR.editor(d,a,CKEDITOR.ELEMENT_MODE_INLINE),c=a.is("textarea")?a:null;c?(b.setData(c.getValue(),null,!0),a=CKEDITOR.dom.element.createFromHtml('\x3cdiv contenteditable\x3d"'+!!b.readOnly+'" class\x3d"cke_textarea_inline"\x3e'+c.getValue()+"\x3c/div\x3e",CKEDITOR.document),
a.insertAfter(c),c.hide(),c.$.form&&b._attachToForm()):b.setData(a.getHtml(),null,!0);b.on("loaded",function(){b.fire("uiReady");b.editable(a);b.container=a;b.ui.contentsElement=a;b.setData(b.getData(1));b.resetDirty();b.fire("contentDom");b.mode="wysiwyg";b.fire("mode");b.status="ready";b.fireOnce("instanceReady");CKEDITOR.fire("instanceReady",null,b)},null,null,1E4);b.on("destroy",function(){c&&(b.container.clearCustomData(),b.container.remove(),c.show());b.element.clearCustomData();delete b.element});
return b};CKEDITOR.inlineAll=function(){var a,d,b;for(b in CKEDITOR.dtd.$editable)for(var c=CKEDITOR.document.getElementsByTag(b),e=0,f=c.count();e<f;e++)a=c.getItem(e),"true"==a.getAttribute("contenteditable")&&(d={element:a,config:{}},!1!==CKEDITOR.fire("inline",d)&&CKEDITOR.inline(a,d.config))};CKEDITOR.domReady(function(){!CKEDITOR.disableAutoInline&&CKEDITOR.inlineAll()})})();CKEDITOR.replaceClass="ckeditor";
(function(){function a(a,e,f,k){if(!CKEDITOR.env.isCompatible)return null;a=CKEDITOR.dom.element.get(a);if(a.getEditor())throw'The editor instance "'+a.getEditor().name+'" is already attached to the provided element.';var l=new CKEDITOR.editor(e,a,k);k==CKEDITOR.ELEMENT_MODE_REPLACE&&(a.setStyle("visibility","hidden"),l._.required=a.hasAttribute("required"),a.removeAttribute("required"));f&&l.setData(f,null,!0);l.on("loaded",function(){b(l);k==CKEDITOR.ELEMENT_MODE_REPLACE&&l.config.autoUpdateElement&&
a.$.form&&l._attachToForm();l.setMode(l.config.startupMode,function(){l.resetDirty();l.status="ready";l.fireOnce("instanceReady");CKEDITOR.fire("instanceReady",null,l)})});l.on("destroy",d);return l}function d(){var a=this.container,b=this.element;a&&(a.clearCustomData(),a.remove());b&&(b.clearCustomData(),this.elementMode==CKEDITOR.ELEMENT_MODE_REPLACE&&(b.show(),this._.required&&b.setAttribute("required","required")),delete this.element)}function b(a){var b=a.name,d=a.element,k=a.elementMode,l=
a.fire("uiSpace",{space:"top",html:""}).html,q=a.fire("uiSpace",{space:"bottom",html:""}).html,t=new CKEDITOR.template('\x3c{outerEl} id\x3d"cke_{name}" class\x3d"{id} cke cke_reset cke_chrome cke_editor_{name} cke_{langDir} '+CKEDITOR.env.cssClass+'"  dir\x3d"{langDir}" lang\x3d"{langCode}" role\x3d"application"'+(a.title?' aria-labelledby\x3d"cke_{name}_arialbl"':"")+"\x3e"+(a.title?'\x3cspan id\x3d"cke_{name}_arialbl" class\x3d"cke_voice_label"\x3e{voiceLabel}\x3c/span\x3e':"")+'\x3c{outerEl} class\x3d"cke_inner cke_reset" role\x3d"presentation"\x3e{topHtml}\x3c{outerEl} id\x3d"{contentId}" class\x3d"cke_contents cke_reset" role\x3d"presentation"\x3e\x3c/{outerEl}\x3e{bottomHtml}\x3c/{outerEl}\x3e\x3c/{outerEl}\x3e'),
b=CKEDITOR.dom.element.createFromHtml(t.output({id:a.id,name:b,langDir:a.lang.dir,langCode:a.langCode,voiceLabel:a.title,topHtml:l?'\x3cspan id\x3d"'+a.ui.spaceId("top")+'" class\x3d"cke_top cke_reset_all" role\x3d"presentation" style\x3d"height:auto"\x3e'+l+"\x3c/span\x3e":"",contentId:a.ui.spaceId("contents"),bottomHtml:q?'\x3cspan id\x3d"'+a.ui.spaceId("bottom")+'" class\x3d"cke_bottom cke_reset_all" role\x3d"presentation"\x3e'+q+"\x3c/span\x3e":"",outerEl:CKEDITOR.env.ie?"span":"div"}));k==CKEDITOR.ELEMENT_MODE_REPLACE?
(d.hide(),b.insertAfter(d)):d.append(b);a.container=b;a.ui.contentsElement=a.ui.space("contents");l&&a.ui.space("top").unselectable();q&&a.ui.space("bottom").unselectable();d=a.config.width;k=a.config.height;d&&b.setStyle("width",CKEDITOR.tools.cssLength(d));k&&a.ui.space("contents").setStyle("height",CKEDITOR.tools.cssLength(k));b.disableContextMenu();CKEDITOR.env.webkit&&b.on("focus",function(){a.focus()});a.fireOnce("uiReady")}CKEDITOR.replace=function(b,d){return a(b,d,null,CKEDITOR.ELEMENT_MODE_REPLACE)};
CKEDITOR.appendTo=function(b,d,f){return a(b,d,f,CKEDITOR.ELEMENT_MODE_APPENDTO)};CKEDITOR.replaceAll=function(){for(var a=document.getElementsByTagName("textarea"),b=0;b<a.length;b++){var d=null,k=a[b];if(k.name||k.id){if("string"==typeof arguments[0]){if(!(new RegExp("(?:^|\\s)"+arguments[0]+"(?:$|\\s)")).test(k.className))continue}else if("function"==typeof arguments[0]&&(d={},!1===arguments[0](k,d)))continue;this.replace(k,d)}}};CKEDITOR.editor.prototype.addMode=function(a,b){(this._.modes||(this._.modes=
{}))[a]=b};CKEDITOR.editor.prototype.setMode=function(a,b){var d=this,k=this._.modes;if(a!=d.mode&&k&&k[a]){d.fire("beforeSetMode",a);if(d.mode){var l=d.checkDirty(),k=d._.previousModeData,q,t=0;d.fire("beforeModeUnload");d.editable(0);d._.previousMode=d.mode;d._.previousModeData=q=d.getData(1);"source"==d.mode&&k==q&&(d.fire("lockSnapshot",{forceUpdate:!0}),t=1);d.ui.space("contents").setHtml("");d.mode=""}else d._.previousModeData=d.getData(1);this._.modes[a](function(){d.mode=a;void 0!==l&&!l&&
d.resetDirty();t?d.fire("unlockSnapshot"):"wysiwyg"==a&&d.fire("saveSnapshot");setTimeout(function(){d.fire("mode");b&&b.call(d)},0)})}};CKEDITOR.editor.prototype.resize=function(a,b,d,k){var l=this.container,q=this.ui.space("contents"),t=CKEDITOR.env.webkit&&this.document&&this.document.getWindow().$.frameElement;k=k?this.container.getFirst(function(a){return a.type==CKEDITOR.NODE_ELEMENT&&a.hasClass("cke_inner")}):l;k.setSize("width",a,!0);t&&(t.style.width="1%");var g=(k.$.offsetHeight||0)-(q.$.clientHeight||
0),l=Math.max(b-(d?0:g),0);b=d?b+g:b;q.setStyle("height",l+"px");t&&(t.style.width="100%");this.fire("resize",{outerHeight:b,contentsHeight:l,outerWidth:a||k.getSize("width")})};CKEDITOR.editor.prototype.getResizable=function(a){return a?this.ui.space("contents"):this.container};CKEDITOR.domReady(function(){CKEDITOR.replaceClass&&CKEDITOR.replaceAll(CKEDITOR.replaceClass)})})();CKEDITOR.config.startupMode="wysiwyg";
(function(){function a(a){var b=a.editor,e=a.data.path,m=e.blockLimit,g=a.data.selection,r=g.getRanges()[0],f;if(CKEDITOR.env.gecko||CKEDITOR.env.ie&&CKEDITOR.env.needsBrFiller)if(g=d(g,e))g.appendBogus(),f=CKEDITOR.env.ie;k(b,e.block,m)&&r.collapsed&&!r.getCommonAncestor().isReadOnly()&&(e=r.clone(),e.enlarge(CKEDITOR.ENLARGE_BLOCK_CONTENTS),m=new CKEDITOR.dom.walker(e),m.guard=function(a){return!c(a)||a.type==CKEDITOR.NODE_COMMENT||a.isReadOnly()},!m.checkForward()||e.checkStartOfBlock()&&e.checkEndOfBlock())&&
(b=r.fixBlock(!0,b.activeEnterMode==CKEDITOR.ENTER_DIV?"div":"p"),CKEDITOR.env.needsBrFiller||(b=b.getFirst(c))&&b.type==CKEDITOR.NODE_TEXT&&CKEDITOR.tools.trim(b.getText()).match(/^(?:&nbsp;|\xa0)$/)&&b.remove(),f=1,a.cancel());f&&r.select()}function d(a,b){if(a.isFake)return 0;var d=b.block||b.blockLimit,e=d&&d.getLast(c);if(!(!d||!d.isBlockBoundary()||e&&e.type==CKEDITOR.NODE_ELEMENT&&e.isBlockBoundary()||d.is("pre")||d.getBogus()))return d}function b(a){var b=a.data.getTarget();b.is("input")&&
(b=b.getAttribute("type"),"submit"!=b&&"reset"!=b||a.data.preventDefault())}function c(a){return g(a)&&z(a)}function e(a,b){return function(c){var d=c.data.$.toElement||c.data.$.fromElement||c.data.$.relatedTarget;(d=d&&d.nodeType==CKEDITOR.NODE_ELEMENT?new CKEDITOR.dom.element(d):null)&&(b.equals(d)||b.contains(d))||a.call(this,c)}}function f(a){function b(a){return function(b,h){h&&b.type==CKEDITOR.NODE_ELEMENT&&b.is(g)&&(d=b);if(!(h||!c(b)||a&&v(b)))return!1}}var d,e=a.getRanges()[0];a=a.root;
var g={table:1,ul:1,ol:1,dl:1};if(e.startPath().contains(g)){var r=e.clone();r.collapse(1);r.setStartAt(a,CKEDITOR.POSITION_AFTER_START);a=new CKEDITOR.dom.walker(r);a.guard=b();a.checkBackward();if(d)return r=e.clone(),r.collapse(),r.setEndAt(d,CKEDITOR.POSITION_AFTER_END),a=new CKEDITOR.dom.walker(r),a.guard=b(!0),d=!1,a.checkForward(),d}return null}function k(a,b,c){return!1!==a.config.autoParagraph&&a.activeEnterMode!=CKEDITOR.ENTER_BR&&(a.editable().equals(c)&&!b||b&&"true"==b.getAttribute("contenteditable"))}
function l(a){return a.activeEnterMode!=CKEDITOR.ENTER_BR&&!1!==a.config.autoParagraph?a.activeEnterMode==CKEDITOR.ENTER_DIV?"div":"p":!1}function q(a){var b=a.editor;b.getSelection().scrollIntoView();setTimeout(function(){b.fire("saveSnapshot")},0)}function t(a,b,c){var d=a.getCommonAncestor(b);for(b=a=c?b:a;(a=a.getParent())&&!d.equals(a)&&1==a.getChildCount();)b=a;b.remove()}CKEDITOR.editable=CKEDITOR.tools.createClass({base:CKEDITOR.dom.element,$:function(a,b){this.base(b.$||b);this.editor=a;
this.status="unloaded";this.hasFocus=!1;this.setup()},proto:{focus:function(){var a;if(CKEDITOR.env.webkit&&!this.hasFocus&&(a=this.editor._.previousActive||this.getDocument().getActive(),this.contains(a))){a.focus();return}try{this.$[CKEDITOR.env.ie&&this.getDocument().equals(CKEDITOR.document)?"setActive":"focus"]()}catch(b){if(!CKEDITOR.env.ie)throw b;}CKEDITOR.env.safari&&!this.isInline()&&(a=CKEDITOR.document.getActive(),a.equals(this.getWindow().getFrame())||this.getWindow().focus())},on:function(a,
b){var c=Array.prototype.slice.call(arguments,0);CKEDITOR.env.ie&&/^focus|blur$/.exec(a)&&(a="focus"==a?"focusin":"focusout",b=e(b,this),c[0]=a,c[1]=b);return CKEDITOR.dom.element.prototype.on.apply(this,c)},attachListener:function(a){!this._.listeners&&(this._.listeners=[]);var b=Array.prototype.slice.call(arguments,1),b=a.on.apply(a,b);this._.listeners.push(b);return b},clearListeners:function(){var a=this._.listeners;try{for(;a.length;)a.pop().removeListener()}catch(b){}},restoreAttrs:function(){var a=
this._.attrChanges,b,c;for(c in a)a.hasOwnProperty(c)&&(b=a[c],null!==b?this.setAttribute(c,b):this.removeAttribute(c))},attachClass:function(a){var b=this.getCustomData("classes");this.hasClass(a)||(!b&&(b=[]),b.push(a),this.setCustomData("classes",b),this.addClass(a))},changeAttr:function(a,b){var c=this.getAttribute(a);b!==c&&(!this._.attrChanges&&(this._.attrChanges={}),a in this._.attrChanges||(this._.attrChanges[a]=c),this.setAttribute(a,b))},insertText:function(a){this.editor.focus();this.insertHtml(this.transformPlainTextToHtml(a),
"text")},transformPlainTextToHtml:function(a){var b=this.editor.getSelection().getStartElement().hasAscendant("pre",!0)?CKEDITOR.ENTER_BR:this.editor.activeEnterMode;return CKEDITOR.tools.transformPlainTextToHtml(a,b)},insertHtml:function(a,b,c){var d=this.editor;d.focus();d.fire("saveSnapshot");c||(c=d.getSelection().getRanges()[0]);n(this,b||"html",a,c);c.select();q(this);this.editor.fire("afterInsertHtml",{})},insertHtmlIntoRange:function(a,b,c){n(this,c||"html",a,b);this.editor.fire("afterInsertHtml",
{intoRange:b})},insertElement:function(a,b){var d=this.editor;d.focus();d.fire("saveSnapshot");var e=d.activeEnterMode,d=d.getSelection(),g=a.getName(),g=CKEDITOR.dtd.$block[g];b||(b=d.getRanges()[0]);this.insertElementIntoRange(a,b)&&(b.moveToPosition(a,CKEDITOR.POSITION_AFTER_END),g&&((g=a.getNext(function(a){return c(a)&&!v(a)}))&&g.type==CKEDITOR.NODE_ELEMENT&&g.is(CKEDITOR.dtd.$block)?g.getDtd()["#"]?b.moveToElementEditStart(g):b.moveToElementEditEnd(a):g||e==CKEDITOR.ENTER_BR||(g=b.fixBlock(!0,
e==CKEDITOR.ENTER_DIV?"div":"p"),b.moveToElementEditStart(g))));d.selectRanges([b]);q(this)},insertElementIntoSelection:function(a){this.insertElement(a)},insertElementIntoRange:function(a,b){var c=this.editor,d=c.config.enterMode,e=a.getName(),r=CKEDITOR.dtd.$block[e];if(b.checkReadOnly())return!1;b.deleteContents(1);b.startContainer.type==CKEDITOR.NODE_ELEMENT&&b.startContainer.is({tr:1,table:1,tbody:1,thead:1,tfoot:1})&&y(b);var g,f;if(r)for(;(g=b.getCommonAncestor(0,1))&&(f=CKEDITOR.dtd[g.getName()])&&
(!f||!f[e]);)g.getName()in CKEDITOR.dtd.span?b.splitElement(g):b.checkStartOfBlock()&&b.checkEndOfBlock()?(b.setStartBefore(g),b.collapse(!0),g.remove()):b.splitBlock(d==CKEDITOR.ENTER_DIV?"div":"p",c.editable());b.insertNode(a);return!0},setData:function(a,b){b||(a=this.editor.dataProcessor.toHtml(a));this.setHtml(a);this.fixInitialSelection();"unloaded"==this.status&&(this.status="ready");this.editor.fire("dataReady")},getData:function(a){var b=this.getHtml();a||(b=this.editor.dataProcessor.toDataFormat(b));
return b},setReadOnly:function(a){this.setAttribute("contenteditable",!a)},detach:function(){this.removeClass("cke_editable");this.status="detached";var a=this.editor;this._.detach();delete a.document;delete a.window},isInline:function(){return this.getDocument().equals(CKEDITOR.document)},fixInitialSelection:function(){function a(){var b=c.getDocument().$,d=b.getSelection(),h;a:if(d.anchorNode&&d.anchorNode==c.$)h=!0;else{if(CKEDITOR.env.webkit&&(h=c.getDocument().getActive())&&h.equals(c)&&!d.anchorNode){h=
!0;break a}h=void 0}h&&(h=new CKEDITOR.dom.range(c),h.moveToElementEditStart(c),b=b.createRange(),b.setStart(h.startContainer.$,h.startOffset),b.collapse(!0),d.removeAllRanges(),d.addRange(b))}function b(){var a=c.getDocument().$,d=a.selection,h=c.getDocument().getActive();"None"==d.type&&h.equals(c)&&(d=new CKEDITOR.dom.range(c),a=a.body.createTextRange(),d.moveToElementEditStart(c),d=d.startContainer,d.type!=CKEDITOR.NODE_ELEMENT&&(d=d.getParent()),a.moveToElementText(d.$),a.collapse(!0),a.select())}
var c=this;if(CKEDITOR.env.ie&&(9>CKEDITOR.env.version||CKEDITOR.env.quirks))this.hasFocus&&(this.focus(),b());else if(this.hasFocus)this.focus(),a();else this.once("focus",function(){a()},null,null,-999)},getHtmlFromRange:function(a){if(a.collapsed)return new CKEDITOR.dom.documentFragment(a.document);a={doc:this.getDocument(),range:a.clone()};F.eol.detect(a,this);F.bogus.exclude(a);F.cell.shrink(a);a.fragment=a.range.cloneContents();F.tree.rebuild(a,this);F.eol.fix(a,this);return new CKEDITOR.dom.documentFragment(a.fragment.$)},
extractHtmlFromRange:function(a,b){var c=w,d={range:a,doc:a.document},e=this.getHtmlFromRange(a);if(a.collapsed)return a.optimize(),e;a.enlarge(CKEDITOR.ENLARGE_INLINE,1);c.table.detectPurge(d);d.bookmark=a.createBookmark();delete d.range;var g=this.editor.createRange();g.moveToPosition(d.bookmark.startNode,CKEDITOR.POSITION_BEFORE_START);d.targetBookmark=g.createBookmark();c.list.detectMerge(d,this);c.table.detectRanges(d,this);c.block.detectMerge(d,this);d.tableContentsRanges?(c.table.deleteRanges(d),
a.moveToBookmark(d.bookmark),d.range=a):(a.moveToBookmark(d.bookmark),d.range=a,a.extractContents(c.detectExtractMerge(d)));a.moveToBookmark(d.targetBookmark);a.optimize();c.fixUneditableRangePosition(a);c.list.merge(d,this);c.table.purge(d,this);c.block.merge(d,this);if(b){c=a.startPath();if(d=a.checkStartOfBlock()&&a.checkEndOfBlock()&&c.block&&!a.root.equals(c.block)){a:{var d=c.block.getElementsByTag("span"),g=0,f;if(d)for(;f=d.getItem(g++);)if(!z(f)){d=!0;break a}d=!1}d=!d}d&&(a.moveToPosition(c.block,
CKEDITOR.POSITION_BEFORE_START),c.block.remove())}else c.autoParagraph(this.editor,a),A(a.startContainer)&&a.startContainer.appendBogus();a.startContainer.mergeSiblings();return e},setup:function(){var a=this.editor;this.attachListener(a,"beforeGetData",function(){var b=this.getData();this.is("textarea")||!1!==a.config.ignoreEmptyParagraph&&(b=b.replace(C,function(a,b){return b}));a.setData(b,null,1)},this);this.attachListener(a,"getSnapshot",function(a){a.data=this.getData(1)},this);this.attachListener(a,
"afterSetData",function(){this.setData(a.getData(1))},this);this.attachListener(a,"loadSnapshot",function(a){this.setData(a.data,1)},this);this.attachListener(a,"beforeFocus",function(){var b=a.getSelection();(b=b&&b.getNative())&&"Control"==b.type||this.focus()},this);this.attachListener(a,"insertHtml",function(a){this.insertHtml(a.data.dataValue,a.data.mode,a.data.range)},this);this.attachListener(a,"insertElement",function(a){this.insertElement(a.data)},this);this.attachListener(a,"insertText",
function(a){this.insertText(a.data)},this);this.setReadOnly(a.readOnly);this.attachClass("cke_editable");a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?this.attachClass("cke_editable_inline"):a.elementMode!=CKEDITOR.ELEMENT_MODE_REPLACE&&a.elementMode!=CKEDITOR.ELEMENT_MODE_APPENDTO||this.attachClass("cke_editable_themed");this.attachClass("cke_contents_"+a.config.contentsLangDirection);a.keystrokeHandler.blockedKeystrokes[8]=+a.readOnly;a.keystrokeHandler.attach(this);this.on("blur",function(){this.hasFocus=
!1},null,null,-1);this.on("focus",function(){this.hasFocus=!0},null,null,-1);a.focusManager.add(this);this.equals(CKEDITOR.document.getActive())&&(this.hasFocus=!0,a.once("contentDom",function(){a.focusManager.focus(this)},this));this.isInline()&&this.changeAttr("tabindex",a.tabIndex);if(!this.is("textarea")){a.document=this.getDocument();a.window=this.getWindow();var d=a.document;this.changeAttr("spellcheck",!a.config.disableNativeSpellChecker);var e=a.config.contentsLangDirection;this.getDirection(1)!=
e&&this.changeAttr("dir",e);var m=CKEDITOR.getCss();m&&(e=d.getHead(),e.getCustomData("stylesheet")||(m=d.appendStyleText(m),m=new CKEDITOR.dom.element(m.ownerNode||m.owningElement),e.setCustomData("stylesheet",m),m.data("cke-temp",1)));e=d.getCustomData("stylesheet_ref")||0;d.setCustomData("stylesheet_ref",e+1);this.setCustomData("cke_includeReadonly",!a.config.disableReadonlyStyling);this.attachListener(this,"click",function(a){a=a.data;var b=(new CKEDITOR.dom.elementPath(a.getTarget(),this)).contains("a");
b&&2!=a.$.button&&b.isReadOnly()&&a.preventDefault()});var k={8:1,46:1};this.attachListener(a,"key",function(b){if(a.readOnly)return!0;var c=b.data.domEvent.getKey(),d;if(c in k){b=a.getSelection();var h,e=b.getRanges()[0],m=e.startPath(),p,x,l,c=8==c;CKEDITOR.env.ie&&11>CKEDITOR.env.version&&(h=b.getSelectedElement())||(h=f(b))?(a.fire("saveSnapshot"),e.moveToPosition(h,CKEDITOR.POSITION_BEFORE_START),h.remove(),e.select(),a.fire("saveSnapshot"),d=1):e.collapsed&&((p=m.block)&&(l=p[c?"getPrevious":
"getNext"](g))&&l.type==CKEDITOR.NODE_ELEMENT&&l.is("table")&&e[c?"checkStartOfBlock":"checkEndOfBlock"]()?(a.fire("saveSnapshot"),e[c?"checkEndOfBlock":"checkStartOfBlock"]()&&p.remove(),e["moveToElementEdit"+(c?"End":"Start")](l),e.select(),a.fire("saveSnapshot"),d=1):m.blockLimit&&m.blockLimit.is("td")&&(x=m.blockLimit.getAscendant("table"))&&e.checkBoundaryOfElement(x,c?CKEDITOR.START:CKEDITOR.END)&&(l=x[c?"getPrevious":"getNext"](g))?(a.fire("saveSnapshot"),e["moveToElementEdit"+(c?"End":"Start")](l),
e.checkStartOfBlock()&&e.checkEndOfBlock()?l.remove():e.select(),a.fire("saveSnapshot"),d=1):(x=m.contains(["td","th","caption"]))&&e.checkBoundaryOfElement(x,c?CKEDITOR.START:CKEDITOR.END)&&(d=1))}return!d});a.blockless&&CKEDITOR.env.ie&&CKEDITOR.env.needsBrFiller&&this.attachListener(this,"keyup",function(b){b.data.getKeystroke()in k&&!this.getFirst(c)&&(this.appendBogus(),b=a.createRange(),b.moveToPosition(this,CKEDITOR.POSITION_AFTER_START),b.select())});this.attachListener(this,"dblclick",function(b){if(a.readOnly)return!1;
b={element:b.data.getTarget()};a.fire("doubleclick",b)});CKEDITOR.env.ie&&this.attachListener(this,"click",b);CKEDITOR.env.ie&&!CKEDITOR.env.edge||this.attachListener(this,"mousedown",function(b){var c=b.data.getTarget();c.is("img","hr","input","textarea","select")&&!c.isReadOnly()&&(a.getSelection().selectElement(c),c.is("input","textarea","select")&&b.data.preventDefault())});CKEDITOR.env.edge&&this.attachListener(this,"mouseup",function(b){(b=b.data.getTarget())&&b.is("img")&&a.getSelection().selectElement(b)});
CKEDITOR.env.gecko&&this.attachListener(this,"mouseup",function(b){if(2==b.data.$.button&&(b=b.data.getTarget(),!b.getOuterHtml().replace(C,""))){var c=a.createRange();c.moveToElementEditStart(b);c.select(!0)}});CKEDITOR.env.webkit&&(this.attachListener(this,"click",function(a){a.data.getTarget().is("input","select")&&a.data.preventDefault()}),this.attachListener(this,"mouseup",function(a){a.data.getTarget().is("input","textarea")&&a.data.preventDefault()}));CKEDITOR.env.webkit&&this.attachListener(a,
"key",function(b){if(a.readOnly)return!0;b=b.data.domEvent.getKey();if(b in k){var c=8==b,d=a.getSelection().getRanges()[0];b=d.startPath();if(d.collapsed)a:{var h=b.block;if(h&&d[c?"checkStartOfBlock":"checkEndOfBlock"]()&&d.moveToClosestEditablePosition(h,!c)&&d.collapsed){if(d.startContainer.type==CKEDITOR.NODE_ELEMENT){var e=d.startContainer.getChild(d.startOffset-(c?1:0));if(e&&e.type==CKEDITOR.NODE_ELEMENT&&e.is("hr")){a.fire("saveSnapshot");e.remove();b=!0;break a}}d=d.startPath().block;if(!d||
d&&d.contains(h))b=void 0;else{a.fire("saveSnapshot");var m;(m=(c?d:h).getBogus())&&m.remove();m=a.getSelection();e=m.createBookmarks();(c?h:d).moveChildren(c?d:h,!1);b.lastElement.mergeSiblings();t(h,d,!c);m.selectBookmarks(e);b=!0}}else b=!1}else c=d,m=b.block,d=c.endPath().block,m&&d&&!m.equals(d)?(a.fire("saveSnapshot"),(h=m.getBogus())&&h.remove(),c.enlarge(CKEDITOR.ENLARGE_INLINE),c.deleteContents(),d.getParent()&&(d.moveChildren(m,!1),b.lastElement.mergeSiblings(),t(m,d,!0)),c=a.getSelection().getRanges()[0],
c.collapse(1),c.optimize(),""===c.startContainer.getHtml()&&c.startContainer.appendBogus(),c.select(),b=!0):b=!1;if(!b)return;a.getSelection().scrollIntoView();a.fire("saveSnapshot");return!1}},this,null,100)}}},_:{detach:function(){this.editor.setData(this.editor.getData(),0,1);this.clearListeners();this.restoreAttrs();var a;if(a=this.removeCustomData("classes"))for(;a.length;)this.removeClass(a.pop());if(!this.is("textarea")){a=this.getDocument();var b=a.getHead();if(b.getCustomData("stylesheet")){var c=
a.getCustomData("stylesheet_ref");--c?a.setCustomData("stylesheet_ref",c):(a.removeCustomData("stylesheet_ref"),b.removeCustomData("stylesheet").remove())}}this.editor.fire("contentDomUnload");delete this.editor}}});CKEDITOR.editor.prototype.editable=function(a){var b=this._.editable;if(b&&a)return 0;arguments.length&&(b=this._.editable=a?a instanceof CKEDITOR.editable?a:new CKEDITOR.editable(this,a):(b&&b.detach(),null));return b};CKEDITOR.on("instanceLoaded",function(b){var c=b.editor;c.on("insertElement",
function(a){a=a.data;a.type==CKEDITOR.NODE_ELEMENT&&(a.is("input")||a.is("textarea"))&&("false"!=a.getAttribute("contentEditable")&&a.data("cke-editable",a.hasAttribute("contenteditable")?"true":"1"),a.setAttribute("contentEditable",!1))});c.on("selectionChange",function(b){if(!c.readOnly){var d=c.getSelection();d&&!d.isLocked&&(d=c.checkDirty(),c.fire("lockSnapshot"),a(b),c.fire("unlockSnapshot"),!d&&c.resetDirty())}})});CKEDITOR.on("instanceCreated",function(a){var b=a.editor;b.on("mode",function(){var a=
b.editable();if(a&&a.isInline()){var c=b.title;a.changeAttr("role","textbox");a.changeAttr("aria-label",c);c&&a.changeAttr("title",c);var d=b.fire("ariaEditorHelpLabel",{}).label;if(d&&(c=this.ui.space(this.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?"top":"contents"))){var e=CKEDITOR.tools.getNextId(),d=CKEDITOR.dom.element.createFromHtml('\x3cspan id\x3d"'+e+'" class\x3d"cke_voice_label"\x3e'+d+"\x3c/span\x3e");c.append(d);a.changeAttr("aria-describedby",e)}}})});CKEDITOR.addCss(".cke_editable{cursor:text}.cke_editable img,.cke_editable input,.cke_editable textarea{cursor:default}");
var g=CKEDITOR.dom.walker.whitespaces(!0),z=CKEDITOR.dom.walker.bookmark(!1,!0),A=CKEDITOR.dom.walker.empty(),v=CKEDITOR.dom.walker.bogus(),C=/(^|<body\b[^>]*>)\s*<(p|div|address|h\d|center|pre)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;)?\s*(:?<\/\2>)?\s*(?=$|<\/body>)/gi,n=function(){function a(b){return b.type==CKEDITOR.NODE_ELEMENT}function b(c,d){var e,m,g,p,f=[],k=d.range.startContainer;e=d.range.startPath();for(var k=B[k.getName()],r=0,D=c.getChildren(),l=D.count(),G=-1,n=-1,t=0,q=e.contains(B.$list);r<
l;++r)e=D.getItem(r),a(e)?(g=e.getName(),q&&g in CKEDITOR.dtd.$list?f=f.concat(b(e,d)):(p=!!k[g],"br"!=g||!e.data("cke-eol")||r&&r!=l-1||(t=(m=r?f[r-1].node:D.getItem(r+1))&&(!a(m)||!m.is("br")),m=m&&a(m)&&B.$block[m.getName()]),-1!=G||p||(G=r),p||(n=r),f.push({isElement:1,isLineBreak:t,isBlock:e.isBlockBoundary(),hasBlockSibling:m,node:e,name:g,allowed:p}),m=t=0)):f.push({isElement:0,node:e,allowed:1});-1<G&&(f[G].firstNotAllowed=1);-1<n&&(f[n].lastNotAllowed=1);return f}function d(b,c){var e=[],
h=b.getChildren(),m=h.count(),g,f=0,k=B[c],r=!b.is(B.$inline)||b.is("br");for(r&&e.push(" ");f<m;f++)g=h.getItem(f),a(g)&&!g.is(k)?e=e.concat(d(g,c)):e.push(g);r&&e.push(" ");return e}function e(b){return a(b.startContainer)&&b.startContainer.getChild(b.startOffset-1)}function g(b){return b&&a(b)&&(b.is(B.$removeEmpty)||b.is("a")&&!b.isBlockBoundary())}function f(b,c,d,e){var h=b.clone(),m,g;h.setEndAt(c,CKEDITOR.POSITION_BEFORE_END);(m=(new CKEDITOR.dom.walker(h)).next())&&a(m)&&n[m.getName()]&&
(g=m.getPrevious())&&a(g)&&!g.getParent().equals(b.startContainer)&&d.contains(g)&&e.contains(m)&&m.isIdentical(g)&&(m.moveChildren(g),m.remove(),f(b,c,d,e))}function G(b,c){function d(b,c){if(c.isBlock&&c.isElement&&!c.node.is("br")&&a(b)&&b.is("br"))return b.remove(),1}var e=c.endContainer.getChild(c.endOffset),h=c.endContainer.getChild(c.endOffset-1);e&&d(e,b[b.length-1]);h&&d(h,b[0])&&(c.setEnd(c.endContainer,c.endOffset-1),c.collapse())}var B=CKEDITOR.dtd,n={p:1,div:1,h1:1,h2:1,h3:1,h4:1,h5:1,
h6:1,ul:1,ol:1,li:1,pre:1,dl:1,blockquote:1},t={p:1,div:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1},q=CKEDITOR.tools.extend({},B.$inline);delete q.br;return function(n,x,H,I){var E=n.editor,J=!1;"unfiltered_html"==x&&(x="html",J=!0);if(!I.checkReadOnly()){var L=(new CKEDITOR.dom.elementPath(I.startContainer,I.root)).blockLimit||I.root;n={type:x,dontFilter:J,editable:n,editor:E,range:I,blockLimit:L,mergeCandidates:[],zombies:[]};x=n.range;I=n.mergeCandidates;var K,v;"text"==n.type&&x.shrink(CKEDITOR.SHRINK_ELEMENT,
!0,!1)&&(K=CKEDITOR.dom.element.createFromHtml("\x3cspan\x3e\x26nbsp;\x3c/span\x3e",x.document),x.insertNode(K),x.setStartAfter(K));J=new CKEDITOR.dom.elementPath(x.startContainer);n.endPath=L=new CKEDITOR.dom.elementPath(x.endContainer);if(!x.collapsed){var E=L.block||L.blockLimit,y=x.getCommonAncestor();E&&!E.equals(y)&&!E.contains(y)&&x.checkEndOfBlock()&&n.zombies.push(E);x.deleteContents()}for(;(v=e(x))&&a(v)&&v.isBlockBoundary()&&J.contains(v);)x.moveToPosition(v,CKEDITOR.POSITION_BEFORE_END);
f(x,n.blockLimit,J,L);K&&(x.setEndBefore(K),x.collapse(),K.remove());K=x.startPath();if(E=K.contains(g,!1,1))x.splitElement(E),n.inlineStylesRoot=E,n.inlineStylesPeak=K.lastElement;K=x.createBookmark();(E=K.startNode.getPrevious(c))&&a(E)&&g(E)&&I.push(E);(E=K.startNode.getNext(c))&&a(E)&&g(E)&&I.push(E);for(E=K.startNode;(E=E.getParent())&&g(E);)I.push(E);x.moveToBookmark(K);if(K=H){K=n.range;if("text"==n.type&&n.inlineStylesRoot){v=n.inlineStylesPeak;x=v.getDocument().createText("{cke-peak}");for(I=
n.inlineStylesRoot.getParent();!v.equals(I);)x=x.appendTo(v.clone()),v=v.getParent();H=x.getOuterHtml().split("{cke-peak}").join(H)}v=n.blockLimit.getName();if(/^\s+|\s+$/.test(H)&&"span"in CKEDITOR.dtd[v]){var A='\x3cspan data-cke-marker\x3d"1"\x3e\x26nbsp;\x3c/span\x3e';H=A+H+A}H=n.editor.dataProcessor.toHtml(H,{context:null,fixForBody:!1,protectedWhitespaces:!!A,dontFilter:n.dontFilter,filter:n.editor.activeFilter,enterMode:n.editor.activeEnterMode});v=K.document.createElement("body");v.setHtml(H);
A&&(v.getFirst().remove(),v.getLast().remove());if((A=K.startPath().block)&&(1!=A.getChildCount()||!A.getBogus()))a:{var z;if(1==v.getChildCount()&&a(z=v.getFirst())&&z.is(t)&&!z.hasAttribute("contenteditable")){A=z.getElementsByTag("*");K=0;for(I=A.count();K<I;K++)if(x=A.getItem(K),!x.is(q))break a;z.moveChildren(z.getParent(1));z.remove()}}n.dataWrapper=v;K=H}if(K){z=n.range;K=z.document;var w;v=n.blockLimit;I=0;var C,A=[],N,F;H=E=0;var R,X;x=z.startContainer;var J=n.endPath.elements[0],Y,L=J.getPosition(x),
y=!!J.getCommonAncestor(x)&&L!=CKEDITOR.POSITION_IDENTICAL&&!(L&CKEDITOR.POSITION_CONTAINS+CKEDITOR.POSITION_IS_CONTAINED);x=b(n.dataWrapper,n);for(G(x,z);I<x.length;I++){L=x[I];if(w=L.isLineBreak){w=z;R=v;var U=void 0,ba=void 0;L.hasBlockSibling?w=1:(U=w.startContainer.getAscendant(B.$block,1))&&U.is({div:1,p:1})?(ba=U.getPosition(R),ba==CKEDITOR.POSITION_IDENTICAL||ba==CKEDITOR.POSITION_CONTAINS?w=0:(R=w.splitElement(U),w.moveToPosition(R,CKEDITOR.POSITION_AFTER_START),w=1)):w=0}if(w)H=0<I;else{w=
z.startPath();!L.isBlock&&k(n.editor,w.block,w.blockLimit)&&(F=l(n.editor))&&(F=K.createElement(F),F.appendBogus(),z.insertNode(F),CKEDITOR.env.needsBrFiller&&(C=F.getBogus())&&C.remove(),z.moveToPosition(F,CKEDITOR.POSITION_BEFORE_END));if((w=z.startPath().block)&&!w.equals(N)){if(C=w.getBogus())C.remove(),A.push(w);N=w}L.firstNotAllowed&&(E=1);if(E&&L.isElement){w=z.startContainer;for(R=null;w&&!B[w.getName()][L.name];){if(w.equals(v)){w=null;break}R=w;w=w.getParent()}if(w)R&&(X=z.splitElement(R),
n.zombies.push(X),n.zombies.push(R));else{R=v.getName();Y=!I;w=I==x.length-1;R=d(L.node,R);for(var U=[],ba=R.length,ca=0,ea=void 0,Z=0,V=-1;ca<ba;ca++)ea=R[ca]," "==ea?(Z||Y&&!ca||(U.push(new CKEDITOR.dom.text(" ")),V=U.length),Z=1):(U.push(ea),Z=0);w&&V==U.length&&U.pop();Y=U}}if(Y){for(;w=Y.pop();)z.insertNode(w);Y=0}else z.insertNode(L.node);L.lastNotAllowed&&I<x.length-1&&((X=y?J:X)&&z.setEndAt(X,CKEDITOR.POSITION_AFTER_START),E=0);z.collapse()}}1!=x.length?C=!1:(C=x[0],C=C.isElement&&"false"==
C.node.getAttribute("contenteditable"));C&&(H=!0,w=x[0].node,z.setStartAt(w,CKEDITOR.POSITION_BEFORE_START),z.setEndAt(w,CKEDITOR.POSITION_AFTER_END));n.dontMoveCaret=H;n.bogusNeededBlocks=A}C=n.range;var Q;X=n.bogusNeededBlocks;for(Y=C.createBookmark();N=n.zombies.pop();)N.getParent()&&(F=C.clone(),F.moveToElementEditStart(N),F.removeEmptyBlocksAtEnd());if(X)for(;N=X.pop();)CKEDITOR.env.needsBrFiller?N.appendBogus():N.append(C.document.createText(" "));for(;N=n.mergeCandidates.pop();)N.mergeSiblings();
C.moveToBookmark(Y);if(!n.dontMoveCaret){for(N=e(C);N&&a(N)&&!N.is(B.$empty);){if(N.isBlockBoundary())C.moveToPosition(N,CKEDITOR.POSITION_BEFORE_END);else{if(g(N)&&N.getHtml().match(/(\s|&nbsp;)$/g)){Q=null;break}Q=C.clone();Q.moveToPosition(N,CKEDITOR.POSITION_BEFORE_END)}N=N.getLast(c)}Q&&C.moveToRange(Q)}}}}(),y=function(){function a(b){b=new CKEDITOR.dom.walker(b);b.guard=function(a,b){if(b)return!1;if(a.type==CKEDITOR.NODE_ELEMENT)return a.is(CKEDITOR.dtd.$tableContent)};b.evaluator=function(a){return a.type==
CKEDITOR.NODE_ELEMENT};return b}function b(a,c,d){c=a.getDocument().createElement(c);a.append(c,d);return c}function c(a){var b=a.count(),d;for(b;0<b--;)d=a.getItem(b),CKEDITOR.tools.trim(d.getHtml())||(d.appendBogus(),CKEDITOR.env.ie&&9>CKEDITOR.env.version&&d.getChildCount()&&d.getFirst().remove())}return function(d){var e=d.startContainer,g=e.getAscendant("table",1),f=!1;c(g.getElementsByTag("td"));c(g.getElementsByTag("th"));g=d.clone();g.setStart(e,0);g=a(g).lastBackward();g||(g=d.clone(),g.setEndAt(e,
CKEDITOR.POSITION_BEFORE_END),g=a(g).lastForward(),f=!0);g||(g=e);g.is("table")?(d.setStartAt(g,CKEDITOR.POSITION_BEFORE_START),d.collapse(!0),g.remove()):(g.is({tbody:1,thead:1,tfoot:1})&&(g=b(g,"tr",f)),g.is("tr")&&(g=b(g,g.getParent().is("thead")?"th":"td",f)),(e=g.getBogus())&&e.remove(),d.moveToPosition(g,f?CKEDITOR.POSITION_AFTER_START:CKEDITOR.POSITION_BEFORE_END))}}(),F={eol:{detect:function(a,b){var c=a.range,d=c.clone(),e=c.clone(),g=new CKEDITOR.dom.elementPath(c.startContainer,b),f=new CKEDITOR.dom.elementPath(c.endContainer,
b);d.collapse(1);e.collapse();g.block&&d.checkBoundaryOfElement(g.block,CKEDITOR.END)&&(c.setStartAfter(g.block),a.prependEolBr=1);f.block&&e.checkBoundaryOfElement(f.block,CKEDITOR.START)&&(c.setEndBefore(f.block),a.appendEolBr=1)},fix:function(a,b){var c=b.getDocument(),d;a.appendEolBr&&(d=this.createEolBr(c),a.fragment.append(d));!a.prependEolBr||d&&!d.getPrevious()||a.fragment.append(this.createEolBr(c),1)},createEolBr:function(a){return a.createElement("br",{attributes:{"data-cke-eol":1}})}},
bogus:{exclude:function(a){var b=a.range.getBoundaryNodes(),c=b.startNode,b=b.endNode;!b||!v(b)||c&&c.equals(b)||a.range.setEndBefore(b)}},tree:{rebuild:function(a,b){var c=a.range,d=c.getCommonAncestor(),e=new CKEDITOR.dom.elementPath(d,b),g=new CKEDITOR.dom.elementPath(c.startContainer,b),c=new CKEDITOR.dom.elementPath(c.endContainer,b),f;d.type==CKEDITOR.NODE_TEXT&&(d=d.getParent());if(e.blockLimit.is({tr:1,table:1})){var k=e.contains("table").getParent();f=function(a){return!a.equals(k)}}else if(e.block&&
e.block.is(CKEDITOR.dtd.$listItem)&&(g=g.contains(CKEDITOR.dtd.$list),c=c.contains(CKEDITOR.dtd.$list),!g.equals(c))){var l=e.contains(CKEDITOR.dtd.$list).getParent();f=function(a){return!a.equals(l)}}f||(f=function(a){return!a.equals(e.block)&&!a.equals(e.blockLimit)});this.rebuildFragment(a,b,d,f)},rebuildFragment:function(a,b,c,d){for(var e;c&&!c.equals(b)&&d(c);)e=c.clone(0,1),a.fragment.appendTo(e),a.fragment=e,c=c.getParent()}},cell:{shrink:function(a){a=a.range;var b=a.startContainer,c=a.endContainer,
d=a.startOffset,e=a.endOffset;b.type==CKEDITOR.NODE_ELEMENT&&b.equals(c)&&b.is("tr")&&++d==e&&a.shrink(CKEDITOR.SHRINK_TEXT)}}},w=function(){function a(b,c){var d=b.getParent();if(d.is(CKEDITOR.dtd.$inline))b[c?"insertBefore":"insertAfter"](d)}function b(c,d,e){a(d);a(e,1);for(var h;h=e.getNext();)h.insertAfter(d),d=h;A(c)&&c.remove()}function c(a,b){var d=new CKEDITOR.dom.range(a);d.setStartAfter(b.startNode);d.setEndBefore(b.endNode);return d}return{list:{detectMerge:function(a,b){var d=c(b,a.bookmark),
e=d.startPath(),h=d.endPath(),g=e.contains(CKEDITOR.dtd.$list),f=h.contains(CKEDITOR.dtd.$list);a.mergeList=g&&f&&g.getParent().equals(f.getParent())&&!g.equals(f);a.mergeListItems=e.block&&h.block&&e.block.is(CKEDITOR.dtd.$listItem)&&h.block.is(CKEDITOR.dtd.$listItem);if(a.mergeList||a.mergeListItems)d=d.clone(),d.setStartBefore(a.bookmark.startNode),d.setEndAfter(a.bookmark.endNode),a.mergeListBookmark=d.createBookmark()},merge:function(a,c){if(a.mergeListBookmark){var d=a.mergeListBookmark.startNode,
e=a.mergeListBookmark.endNode,g=new CKEDITOR.dom.elementPath(d,c),f=new CKEDITOR.dom.elementPath(e,c);if(a.mergeList){var p=g.contains(CKEDITOR.dtd.$list),k=f.contains(CKEDITOR.dtd.$list);p.equals(k)||(k.moveChildren(p),k.remove())}a.mergeListItems&&(g=g.contains(CKEDITOR.dtd.$listItem),f=f.contains(CKEDITOR.dtd.$listItem),g.equals(f)||b(f,d,e));d.remove();e.remove()}}},block:{detectMerge:function(a,b){if(!a.tableContentsRanges&&!a.mergeListBookmark){var c=new CKEDITOR.dom.range(b);c.setStartBefore(a.bookmark.startNode);
c.setEndAfter(a.bookmark.endNode);a.mergeBlockBookmark=c.createBookmark()}},merge:function(a,c){if(a.mergeBlockBookmark&&!a.purgeTableBookmark){var d=a.mergeBlockBookmark.startNode,e=a.mergeBlockBookmark.endNode,g=new CKEDITOR.dom.elementPath(d,c),f=new CKEDITOR.dom.elementPath(e,c),g=g.block,f=f.block;g&&f&&!g.equals(f)&&b(f,d,e);d.remove();e.remove()}}},table:function(){function a(c){var e=[],h,g=new CKEDITOR.dom.walker(c),m=c.startPath().contains(d),f=c.endPath().contains(d),p={};g.guard=function(a,
g){if(a.type==CKEDITOR.NODE_ELEMENT){var k="visited_"+(g?"out":"in");if(a.getCustomData(k))return;CKEDITOR.dom.element.setMarker(p,a,k,1)}if(g&&m&&a.equals(m))h=c.clone(),h.setEndAt(m,CKEDITOR.POSITION_BEFORE_END),e.push(h);else if(!g&&f&&a.equals(f))h=c.clone(),h.setStartAt(f,CKEDITOR.POSITION_AFTER_START),e.push(h);else{if(k=!g)k=a.type==CKEDITOR.NODE_ELEMENT&&a.is(d)&&(!m||b(a,m))&&(!f||b(a,f));k&&(h=c.clone(),h.selectNodeContents(a),e.push(h))}};g.lastForward();CKEDITOR.dom.element.clearAllMarkers(p);
return e}function b(a,c){var d=CKEDITOR.POSITION_CONTAINS+CKEDITOR.POSITION_IS_CONTAINED,e=a.getPosition(c);return e===CKEDITOR.POSITION_IDENTICAL?!1:0===(e&d)}var d={td:1,th:1,caption:1};return{detectPurge:function(a){var b=a.range,c=b.clone();c.enlarge(CKEDITOR.ENLARGE_ELEMENT);var c=new CKEDITOR.dom.walker(c),e=0;c.evaluator=function(a){a.type==CKEDITOR.NODE_ELEMENT&&a.is(d)&&++e};c.checkForward();if(1<e){var c=b.startPath().contains("table"),h=b.endPath().contains("table");c&&h&&b.checkBoundaryOfElement(c,
CKEDITOR.START)&&b.checkBoundaryOfElement(h,CKEDITOR.END)&&(b=a.range.clone(),b.setStartBefore(c),b.setEndAfter(h),a.purgeTableBookmark=b.createBookmark())}},detectRanges:function(e,h){var g=c(h,e.bookmark),f=g.clone(),k,l,x=g.getCommonAncestor();x.is(CKEDITOR.dtd.$tableContent)&&!x.is(d)&&(x=x.getAscendant("table",!0));l=x;x=new CKEDITOR.dom.elementPath(g.startContainer,l);l=new CKEDITOR.dom.elementPath(g.endContainer,l);x=x.contains("table");l=l.contains("table");if(x||l)x&&l&&b(x,l)?(e.tableSurroundingRange=
f,f.setStartAt(x,CKEDITOR.POSITION_AFTER_END),f.setEndAt(l,CKEDITOR.POSITION_BEFORE_START),f=g.clone(),f.setEndAt(x,CKEDITOR.POSITION_AFTER_END),k=g.clone(),k.setStartAt(l,CKEDITOR.POSITION_BEFORE_START),k=a(f).concat(a(k))):x?l||(e.tableSurroundingRange=f,f.setStartAt(x,CKEDITOR.POSITION_AFTER_END),g.setEndAt(x,CKEDITOR.POSITION_AFTER_END)):(e.tableSurroundingRange=f,f.setEndAt(l,CKEDITOR.POSITION_BEFORE_START),g.setStartAt(l,CKEDITOR.POSITION_AFTER_START)),e.tableContentsRanges=k?k:a(g)},deleteRanges:function(a){for(var b;b=
a.tableContentsRanges.pop();)b.extractContents(),A(b.startContainer)&&b.startContainer.appendBogus();a.tableSurroundingRange&&a.tableSurroundingRange.extractContents()},purge:function(a){if(a.purgeTableBookmark){var b=a.doc,c=a.range.clone(),b=b.createElement("p");b.insertBefore(a.purgeTableBookmark.startNode);c.moveToBookmark(a.purgeTableBookmark);c.deleteContents();a.range.moveToPosition(b,CKEDITOR.POSITION_AFTER_START)}}}}(),detectExtractMerge:function(a){return!(a.range.startPath().contains(CKEDITOR.dtd.$listItem)&&
a.range.endPath().contains(CKEDITOR.dtd.$listItem))},fixUneditableRangePosition:function(a){a.startContainer.getDtd()["#"]||a.moveToClosestEditablePosition(null,!0)},autoParagraph:function(a,b){var c=b.startPath(),d;k(a,c.block,c.blockLimit)&&(d=l(a))&&(d=b.document.createElement(d),d.appendBogus(),b.insertNode(d),b.moveToPosition(d,CKEDITOR.POSITION_AFTER_START))}}}()})();
(function(){function a(){var a=this._.fakeSelection,b;a&&(b=this.getSelection(1),b&&b.isHidden()||(a.reset(),a=0));if(!a&&(a=b||this.getSelection(1),!a||a.getType()==CKEDITOR.SELECTION_NONE))return;this.fire("selectionCheck",a);b=this.elementPath();b.compare(this._.selectionPreviousPath)||(CKEDITOR.env.webkit&&(this._.previousActive=this.document.getActive()),this._.selectionPreviousPath=b,this.fire("selectionChange",{selection:a,path:b}))}function d(){C=!0;v||(b.call(this),v=CKEDITOR.tools.setTimeout(b,
200,this))}function b(){v=null;C&&(CKEDITOR.tools.setTimeout(a,0,this),C=!1)}function c(a){return n(a)||a.type==CKEDITOR.NODE_ELEMENT&&!a.is(CKEDITOR.dtd.$empty)?!0:!1}function e(a){function b(c,d){return c&&c.type!=CKEDITOR.NODE_TEXT?a.clone()["moveToElementEdit"+(d?"End":"Start")](c):!1}if(!(a.root instanceof CKEDITOR.editable))return!1;var d=a.startContainer,e=a.getPreviousNode(c,null,d),g=a.getNextNode(c,null,d);return b(e)||b(g,1)||!(e||g||d.type==CKEDITOR.NODE_ELEMENT&&d.isBlockBoundary()&&
d.getBogus())?!0:!1}function f(a){return a.getCustomData("cke-fillingChar")}function k(a,b){var c=a&&a.removeCustomData("cke-fillingChar");if(c){if(!1!==b){var d,e=a.getDocument().getSelection().getNative(),g=e&&"None"!=e.type&&e.getRangeAt(0);1<c.getLength()&&g&&g.intersectsNode(c.$)&&(d=q(e),g=e.focusNode==c.$&&0<e.focusOffset,e.anchorNode==c.$&&0<e.anchorOffset&&d[0].offset--,g&&d[1].offset--)}c.setText(l(c.getText()));d&&t(a.getDocument().$,d)}}function l(a){return a.replace(/\u200B( )?/g,function(a){return a[1]?
" ":""})}function q(a){return[{node:a.anchorNode,offset:a.anchorOffset},{node:a.focusNode,offset:a.focusOffset}]}function t(a,b){var c=a.getSelection(),d=a.createRange();d.setStart(b[0].node,b[0].offset);d.collapse(!0);c.removeAllRanges();c.addRange(d);c.extend(b[1].node,b[1].offset)}function g(a){var b=CKEDITOR.dom.element.createFromHtml('\x3cdiv data-cke-hidden-sel\x3d"1" data-cke-temp\x3d"1" style\x3d"'+(CKEDITOR.env.ie?"display:none":"position:fixed;top:0;left:-1000px")+'"\x3e\x26nbsp;\x3c/div\x3e',
a.document);a.fire("lockSnapshot");a.editable().append(b);var c=a.getSelection(1),d=a.createRange(),e=c.root.on("selectionchange",function(a){a.cancel()},null,null,0);d.setStartAt(b,CKEDITOR.POSITION_AFTER_START);d.setEndAt(b,CKEDITOR.POSITION_BEFORE_END);c.selectRanges([d]);e.removeListener();a.fire("unlockSnapshot");a._.hiddenSelectionContainer=b}function z(a){var b={37:1,39:1,8:1,46:1};return function(c){var d=c.data.getKeystroke();if(b[d]){var e=a.getSelection().getRanges(),g=e[0];1==e.length&&
g.collapsed&&(d=g[38>d?"getPreviousEditableNode":"getNextEditableNode"]())&&d.type==CKEDITOR.NODE_ELEMENT&&"false"==d.getAttribute("contenteditable")&&(a.getSelection().fake(d),c.data.preventDefault(),c.cancel())}}}function A(a){for(var b=0;b<a.length;b++){var c=a[b];c.getCommonAncestor().isReadOnly()&&a.splice(b,1);if(!c.collapsed){if(c.startContainer.isReadOnly())for(var d=c.startContainer,e;d&&!((e=d.type==CKEDITOR.NODE_ELEMENT)&&d.is("body")||!d.isReadOnly());)e&&"false"==d.getAttribute("contentEditable")&&
c.setStartAfter(d),d=d.getParent();d=c.startContainer;e=c.endContainer;var g=c.startOffset,f=c.endOffset,k=c.clone();d&&d.type==CKEDITOR.NODE_TEXT&&(g>=d.getLength()?k.setStartAfter(d):k.setStartBefore(d));e&&e.type==CKEDITOR.NODE_TEXT&&(f?k.setEndAfter(e):k.setEndBefore(e));d=new CKEDITOR.dom.walker(k);d.evaluator=function(d){if(d.type==CKEDITOR.NODE_ELEMENT&&d.isReadOnly()){var e=c.clone();c.setEndBefore(d);c.collapsed&&a.splice(b--,1);d.getPosition(k.endContainer)&CKEDITOR.POSITION_CONTAINS||(e.setStartAfter(d),
e.collapsed||a.splice(b+1,0,e));return!0}return!1};d.next()}}return a}var v,C,n=CKEDITOR.dom.walker.invisible(1),y=function(){function a(b){return function(a){var c=a.editor.createRange();c.moveToClosestEditablePosition(a.selected,b)&&a.editor.getSelection().selectRanges([c]);return!1}}function b(a){return function(b){var c=b.editor,d=c.createRange(),e;(e=d.moveToClosestEditablePosition(b.selected,a))||(e=d.moveToClosestEditablePosition(b.selected,!a));e&&c.getSelection().selectRanges([d]);c.fire("saveSnapshot");
b.selected.remove();e||(d.moveToElementEditablePosition(c.editable()),c.getSelection().selectRanges([d]));c.fire("saveSnapshot");return!1}}var c=a(),d=a(1);return{37:c,38:c,39:d,40:d,8:b(),46:b(1)}}();CKEDITOR.on("instanceCreated",function(b){function c(){var a=e.getSelection();a&&a.removeAllRanges()}var e=b.editor;e.on("contentDom",function(){function b(){H=new CKEDITOR.dom.selection(e.getSelection());H.lock()}function c(){g.removeListener("mouseup",c);l.removeListener("mouseup",c);var a=CKEDITOR.document.$.selection,
b=a.createRange();"None"!=a.type&&b.parentElement().ownerDocument==h.$&&b.select()}var h=e.document,g=CKEDITOR.document,f=e.editable(),p=h.getBody(),l=h.getDocumentElement(),n=f.isInline(),x,H;CKEDITOR.env.gecko&&f.attachListener(f,"focus",function(a){a.removeListener();0!==x&&(a=e.getSelection().getNative())&&a.isCollapsed&&a.anchorNode==f.$&&(a=e.createRange(),a.moveToElementEditStart(f),a.select())},null,null,-2);f.attachListener(f,CKEDITOR.env.webkit?"DOMFocusIn":"focus",function(){x&&CKEDITOR.env.webkit&&
(x=e._.previousActive&&e._.previousActive.equals(h.getActive()));e.unlockSelection(x);x=0},null,null,-1);f.attachListener(f,"mousedown",function(){x=0});if(CKEDITOR.env.ie||n)F?f.attachListener(f,"beforedeactivate",b,null,null,-1):f.attachListener(e,"selectionCheck",b,null,null,-1),f.attachListener(f,CKEDITOR.env.webkit?"DOMFocusOut":"blur",function(){e.lockSelection(H);x=1},null,null,-1),f.attachListener(f,"mousedown",function(){x=0});if(CKEDITOR.env.ie&&!n){var I;f.attachListener(f,"mousedown",
function(a){2==a.data.$.button&&((a=e.document.getSelection())&&a.getType()!=CKEDITOR.SELECTION_NONE||(I=e.window.getScrollPosition()))});f.attachListener(f,"mouseup",function(a){2==a.data.$.button&&I&&(e.document.$.documentElement.scrollLeft=I.x,e.document.$.documentElement.scrollTop=I.y);I=null});if("BackCompat"!=h.$.compatMode){if(CKEDITOR.env.ie7Compat||CKEDITOR.env.ie6Compat)l.on("mousedown",function(a){function b(a){a=a.data.$;if(d){var c=p.$.createTextRange();try{c.moveToPoint(a.clientX,a.clientY)}catch(e){}d.setEndPoint(0>
h.compareEndPoints("StartToStart",c)?"EndToEnd":"StartToStart",c);d.select()}}function c(){l.removeListener("mousemove",b);g.removeListener("mouseup",c);l.removeListener("mouseup",c);d.select()}a=a.data;if(a.getTarget().is("html")&&a.$.y<l.$.clientHeight&&a.$.x<l.$.clientWidth){var d=p.$.createTextRange();try{d.moveToPoint(a.$.clientX,a.$.clientY)}catch(e){}var h=d.duplicate();l.on("mousemove",b);g.on("mouseup",c);l.on("mouseup",c)}});if(7<CKEDITOR.env.version&&11>CKEDITOR.env.version)l.on("mousedown",
function(a){a.data.getTarget().is("html")&&(g.on("mouseup",c),l.on("mouseup",c))})}}f.attachListener(f,"selectionchange",a,e);f.attachListener(f,"keyup",d,e);f.attachListener(f,CKEDITOR.env.webkit?"DOMFocusIn":"focus",function(){e.forceNextSelectionCheck();e.selectionChange(1)});if(n&&(CKEDITOR.env.webkit||CKEDITOR.env.gecko)){var E;f.attachListener(f,"mousedown",function(){E=1});f.attachListener(h.getDocumentElement(),"mouseup",function(){E&&d.call(e);E=0})}else f.attachListener(CKEDITOR.env.ie?
f:h.getDocumentElement(),"mouseup",d,e);CKEDITOR.env.webkit&&f.attachListener(h,"keydown",function(a){switch(a.data.getKey()){case 13:case 33:case 34:case 35:case 36:case 37:case 39:case 8:case 45:case 46:k(f)}},null,null,-1);f.attachListener(f,"keydown",z(e),null,null,-1)});e.on("setData",function(){e.unlockSelection();CKEDITOR.env.webkit&&c()});e.on("contentDomUnload",function(){e.unlockSelection()});if(CKEDITOR.env.ie9Compat)e.on("beforeDestroy",c,null,null,9);e.on("dataReady",function(){delete e._.fakeSelection;
delete e._.hiddenSelectionContainer;e.selectionChange(1)});e.on("loadSnapshot",function(){var a=CKEDITOR.dom.walker.nodeType(CKEDITOR.NODE_ELEMENT),b=e.editable().getLast(a);b&&b.hasAttribute("data-cke-hidden-sel")&&(b.remove(),CKEDITOR.env.gecko&&(a=e.editable().getFirst(a))&&a.is("br")&&a.getAttribute("_moz_editor_bogus_node")&&a.remove())},null,null,100);e.on("key",function(a){if("wysiwyg"==e.mode){var b=e.getSelection();if(b.isFake){var c=y[a.data.keyCode];if(c)return c({editor:e,selected:b.getSelectedElement(),
selection:b,keyEvent:a})}}})});CKEDITOR.on("instanceReady",function(a){function b(){var a=d.editable();if(a&&(a=f(a))){var c=d.document.$.getSelection();"None"==c.type||c.anchorNode!=a.$&&c.focusNode!=a.$||(g=q(c));e=a.getText();a.setText(l(e))}}function c(){var a=d.editable();a&&(a=f(a))&&(a.setText(e),g&&(t(d.document.$,g),g=null))}var d=a.editor,e,g;CKEDITOR.env.webkit&&(d.on("selectionChange",function(){var a=d.editable(),b=f(a);b&&(b.getCustomData("ready")?k(a):b.setCustomData("ready",1))},null,
null,-1),d.on("beforeSetMode",function(){k(d.editable())},null,null,-1),d.on("beforeUndoImage",b),d.on("afterUndoImage",c),d.on("beforeGetData",b,null,null,0),d.on("getData",c))});CKEDITOR.editor.prototype.selectionChange=function(b){(b?a:d).call(this)};CKEDITOR.editor.prototype.getSelection=function(a){return!this._.savedSelection&&!this._.fakeSelection||a?(a=this.editable())&&"wysiwyg"==this.mode?new CKEDITOR.dom.selection(a):null:this._.savedSelection||this._.fakeSelection};CKEDITOR.editor.prototype.lockSelection=
function(a){a=a||this.getSelection(1);return a.getType()!=CKEDITOR.SELECTION_NONE?(!a.isLocked&&a.lock(),this._.savedSelection=a,!0):!1};CKEDITOR.editor.prototype.unlockSelection=function(a){var b=this._.savedSelection;return b?(b.unlock(a),delete this._.savedSelection,!0):!1};CKEDITOR.editor.prototype.forceNextSelectionCheck=function(){delete this._.selectionPreviousPath};CKEDITOR.dom.document.prototype.getSelection=function(){return new CKEDITOR.dom.selection(this)};CKEDITOR.dom.range.prototype.select=
function(){var a=this.root instanceof CKEDITOR.editable?this.root.editor.getSelection():new CKEDITOR.dom.selection(this.root);a.selectRanges([this]);return a};CKEDITOR.SELECTION_NONE=1;CKEDITOR.SELECTION_TEXT=2;CKEDITOR.SELECTION_ELEMENT=3;var F="function"!=typeof window.getSelection,w=1;CKEDITOR.dom.selection=function(a){if(a instanceof CKEDITOR.dom.selection){var b=a;a=a.root}var c=a instanceof CKEDITOR.dom.element;this.rev=b?b.rev:w++;this.document=a instanceof CKEDITOR.dom.document?a:a.getDocument();
this.root=c?a:this.document.getBody();this.isLocked=0;this._={cache:{}};if(b)return CKEDITOR.tools.extend(this._.cache,b._.cache),this.isFake=b.isFake,this.isLocked=b.isLocked,this;a=this.getNative();var d,e;if(a)if(a.getRangeAt)d=(e=a.rangeCount&&a.getRangeAt(0))&&new CKEDITOR.dom.node(e.commonAncestorContainer);else{try{e=a.createRange()}catch(g){}d=e&&CKEDITOR.dom.element.get(e.item&&e.item(0)||e.parentElement())}if(!d||d.type!=CKEDITOR.NODE_ELEMENT&&d.type!=CKEDITOR.NODE_TEXT||!this.root.equals(d)&&
!this.root.contains(d))this._.cache.type=CKEDITOR.SELECTION_NONE,this._.cache.startElement=null,this._.cache.selectedElement=null,this._.cache.selectedText="",this._.cache.ranges=new CKEDITOR.dom.rangeList;return this};var u={img:1,hr:1,li:1,table:1,tr:1,td:1,th:1,embed:1,object:1,ol:1,ul:1,a:1,input:1,form:1,select:1,textarea:1,button:1,fieldset:1,thead:1,tfoot:1};CKEDITOR.dom.selection.prototype={getNative:function(){return void 0!==this._.cache.nativeSel?this._.cache.nativeSel:this._.cache.nativeSel=
F?this.document.$.selection:this.document.getWindow().$.getSelection()},getType:F?function(){var a=this._.cache;if(a.type)return a.type;var b=CKEDITOR.SELECTION_NONE;try{var c=this.getNative(),d=c.type;"Text"==d&&(b=CKEDITOR.SELECTION_TEXT);"Control"==d&&(b=CKEDITOR.SELECTION_ELEMENT);c.createRange().parentElement()&&(b=CKEDITOR.SELECTION_TEXT)}catch(e){}return a.type=b}:function(){var a=this._.cache;if(a.type)return a.type;var b=CKEDITOR.SELECTION_TEXT,c=this.getNative();if(!c||!c.rangeCount)b=CKEDITOR.SELECTION_NONE;
else if(1==c.rangeCount){var c=c.getRangeAt(0),d=c.startContainer;d==c.endContainer&&1==d.nodeType&&1==c.endOffset-c.startOffset&&u[d.childNodes[c.startOffset].nodeName.toLowerCase()]&&(b=CKEDITOR.SELECTION_ELEMENT)}return a.type=b},getRanges:function(){var a=F?function(){function a(b){return(new CKEDITOR.dom.node(b)).getIndex()}var b=function(b,c){b=b.duplicate();b.collapse(c);var d=b.parentElement();if(!d.hasChildNodes())return{container:d,offset:0};for(var e=d.children,g,h,f=b.duplicate(),k=0,
x=e.length-1,l=-1,m,n;k<=x;)if(l=Math.floor((k+x)/2),g=e[l],f.moveToElementText(g),m=f.compareEndPoints("StartToStart",b),0<m)x=l-1;else if(0>m)k=l+1;else return{container:d,offset:a(g)};if(-1==l||l==e.length-1&&0>m){f.moveToElementText(d);f.setEndPoint("StartToStart",b);f=f.text.replace(/(\r\n|\r)/g,"\n").length;e=d.childNodes;if(!f)return g=e[e.length-1],g.nodeType!=CKEDITOR.NODE_TEXT?{container:d,offset:e.length}:{container:g,offset:g.nodeValue.length};for(d=e.length;0<f&&0<d;)h=e[--d],h.nodeType==
CKEDITOR.NODE_TEXT&&(n=h,f-=h.nodeValue.length);return{container:n,offset:-f}}f.collapse(0<m?!0:!1);f.setEndPoint(0<m?"StartToStart":"EndToStart",b);f=f.text.replace(/(\r\n|\r)/g,"\n").length;if(!f)return{container:d,offset:a(g)+(0<m?0:1)};for(;0<f;)try{h=g[0<m?"previousSibling":"nextSibling"],h.nodeType==CKEDITOR.NODE_TEXT&&(f-=h.nodeValue.length,n=h),g=h}catch(t){return{container:d,offset:a(g)}}return{container:n,offset:0<m?-f:n.nodeValue.length+f}};return function(){var a=this.getNative(),c=a&&
a.createRange(),d=this.getType();if(!a)return[];if(d==CKEDITOR.SELECTION_TEXT)return a=new CKEDITOR.dom.range(this.root),d=b(c,!0),a.setStart(new CKEDITOR.dom.node(d.container),d.offset),d=b(c),a.setEnd(new CKEDITOR.dom.node(d.container),d.offset),a.endContainer.getPosition(a.startContainer)&CKEDITOR.POSITION_PRECEDING&&a.endOffset<=a.startContainer.getIndex()&&a.collapse(),[a];if(d==CKEDITOR.SELECTION_ELEMENT){for(var d=[],e=0;e<c.length;e++){for(var g=c.item(e),h=g.parentNode,f=0,a=new CKEDITOR.dom.range(this.root);f<
h.childNodes.length&&h.childNodes[f]!=g;f++);a.setStart(new CKEDITOR.dom.node(h),f);a.setEnd(new CKEDITOR.dom.node(h),f+1);d.push(a)}return d}return[]}}():function(){var a=[],b,c=this.getNative();if(!c)return a;for(var d=0;d<c.rangeCount;d++){var e=c.getRangeAt(d);b=new CKEDITOR.dom.range(this.root);b.setStart(new CKEDITOR.dom.node(e.startContainer),e.startOffset);b.setEnd(new CKEDITOR.dom.node(e.endContainer),e.endOffset);a.push(b)}return a};return function(b){var c=this._.cache,d=c.ranges;d||(c.ranges=
d=new CKEDITOR.dom.rangeList(a.call(this)));return b?A(new CKEDITOR.dom.rangeList(d.slice())):d}}(),getStartElement:function(){var a=this._.cache;if(void 0!==a.startElement)return a.startElement;var b;switch(this.getType()){case CKEDITOR.SELECTION_ELEMENT:return this.getSelectedElement();case CKEDITOR.SELECTION_TEXT:var c=this.getRanges()[0];if(c){if(c.collapsed)b=c.startContainer,b.type!=CKEDITOR.NODE_ELEMENT&&(b=b.getParent());else{for(c.optimize();b=c.startContainer,c.startOffset==(b.getChildCount?
b.getChildCount():b.getLength())&&!b.isBlockBoundary();)c.setStartAfter(b);b=c.startContainer;if(b.type!=CKEDITOR.NODE_ELEMENT)return b.getParent();if((b=b.getChild(c.startOffset))&&b.type==CKEDITOR.NODE_ELEMENT)for(c=b.getFirst();c&&c.type==CKEDITOR.NODE_ELEMENT;)b=c,c=c.getFirst();else b=c.startContainer}b=b.$}}return a.startElement=b?new CKEDITOR.dom.element(b):null},getSelectedElement:function(){var a=this._.cache;if(void 0!==a.selectedElement)return a.selectedElement;var b=this,c=CKEDITOR.tools.tryThese(function(){return b.getNative().createRange().item(0)},
function(){for(var a=b.getRanges()[0].clone(),c,d,e=2;e&&!((c=a.getEnclosedNode())&&c.type==CKEDITOR.NODE_ELEMENT&&u[c.getName()]&&(d=c));e--)a.shrink(CKEDITOR.SHRINK_ELEMENT);return d&&d.$});return a.selectedElement=c?new CKEDITOR.dom.element(c):null},getSelectedText:function(){var a=this._.cache;if(void 0!==a.selectedText)return a.selectedText;var b=this.getNative(),b=F?"Control"==b.type?"":b.createRange().text:b.toString();return a.selectedText=b},lock:function(){this.getRanges();this.getStartElement();
this.getSelectedElement();this.getSelectedText();this._.cache.nativeSel=null;this.isLocked=1},unlock:function(a){if(this.isLocked){if(a)var b=this.getSelectedElement(),c=!b&&this.getRanges(),d=this.isFake;this.isLocked=0;this.reset();a&&(a=b||c[0]&&c[0].getCommonAncestor())&&a.getAscendant("body",1)&&(d?this.fake(b):b?this.selectElement(b):this.selectRanges(c))}},reset:function(){this._.cache={};this.isFake=0;var a=this.root.editor;if(a&&a._.fakeSelection)if(this.rev==a._.fakeSelection.rev){delete a._.fakeSelection;
var b=a._.hiddenSelectionContainer;if(b){var c=a.checkDirty();a.fire("lockSnapshot");b.remove();a.fire("unlockSnapshot");!c&&a.resetDirty()}delete a._.hiddenSelectionContainer}else CKEDITOR.warn("selection-fake-reset");this.rev=w++},selectElement:function(a){var b=new CKEDITOR.dom.range(this.root);b.setStartBefore(a);b.setEndAfter(a);this.selectRanges([b])},selectRanges:function(a){var b=this.root.editor,b=b&&b._.hiddenSelectionContainer;this.reset();if(b)for(var b=this.root,c,d=0;d<a.length;++d)c=
a[d],c.endContainer.equals(b)&&(c.endOffset=Math.min(c.endOffset,b.getChildCount()));if(a.length)if(this.isLocked){var g=CKEDITOR.document.getActive();this.unlock();this.selectRanges(a);this.lock();g&&!g.equals(this.root)&&g.focus()}else{var f;a:{var l,n;if(1==a.length&&!(n=a[0]).collapsed&&(f=n.getEnclosedNode())&&f.type==CKEDITOR.NODE_ELEMENT&&(n=n.clone(),n.shrink(CKEDITOR.SHRINK_ELEMENT,!0),(l=n.getEnclosedNode())&&l.type==CKEDITOR.NODE_ELEMENT&&(f=l),"false"==f.getAttribute("contenteditable")))break a;
f=void 0}if(f)this.fake(f);else{if(F){n=CKEDITOR.dom.walker.whitespaces(!0);l=/\ufeff|\u00a0/;b={table:1,tbody:1,tr:1};1<a.length&&(f=a[a.length-1],a[0].setEnd(f.endContainer,f.endOffset));f=a[0];a=f.collapsed;var t,q,v;if((c=f.getEnclosedNode())&&c.type==CKEDITOR.NODE_ELEMENT&&c.getName()in u&&(!c.is("a")||!c.getText()))try{v=c.$.createControlRange();v.addElement(c.$);v.select();return}catch(x){}if(f.startContainer.type==CKEDITOR.NODE_ELEMENT&&f.startContainer.getName()in b||f.endContainer.type==
CKEDITOR.NODE_ELEMENT&&f.endContainer.getName()in b)f.shrink(CKEDITOR.NODE_ELEMENT,!0),a=f.collapsed;v=f.createBookmark();b=v.startNode;a||(g=v.endNode);v=f.document.$.body.createTextRange();v.moveToElementText(b.$);v.moveStart("character",1);g?(l=f.document.$.body.createTextRange(),l.moveToElementText(g.$),v.setEndPoint("EndToEnd",l),v.moveEnd("character",-1)):(t=b.getNext(n),q=b.hasAscendant("pre"),t=!(t&&t.getText&&t.getText().match(l))&&(q||!b.hasPrevious()||b.getPrevious().is&&b.getPrevious().is("br")),
q=f.document.createElement("span"),q.setHtml("\x26#65279;"),q.insertBefore(b),t&&f.document.createText("﻿").insertBefore(b));f.setStartBefore(b);b.remove();a?(t?(v.moveStart("character",-1),v.select(),f.document.$.selection.clear()):v.select(),f.moveToPosition(q,CKEDITOR.POSITION_BEFORE_START),q.remove()):(f.setEndBefore(g),g.remove(),v.select())}else{g=this.getNative();if(!g)return;this.removeAllRanges();for(v=0;v<a.length;v++){if(v<a.length-1&&(t=a[v],q=a[v+1],l=t.clone(),l.setStart(t.endContainer,
t.endOffset),l.setEnd(q.startContainer,q.startOffset),!l.collapsed&&(l.shrink(CKEDITOR.NODE_ELEMENT,!0),f=l.getCommonAncestor(),l=l.getEnclosedNode(),f.isReadOnly()||l&&l.isReadOnly()))){q.setStart(t.startContainer,t.startOffset);a.splice(v--,1);continue}f=a[v];q=this.document.$.createRange();f.collapsed&&CKEDITOR.env.webkit&&e(f)&&(t=this.root,k(t,!1),l=t.getDocument().createText("​"),t.setCustomData("cke-fillingChar",l),f.insertNode(l),(t=l.getNext())&&!l.getPrevious()&&t.type==CKEDITOR.NODE_ELEMENT&&
"br"==t.getName()?(k(this.root),f.moveToPosition(t,CKEDITOR.POSITION_BEFORE_START)):f.moveToPosition(l,CKEDITOR.POSITION_AFTER_END));q.setStart(f.startContainer.$,f.startOffset);try{q.setEnd(f.endContainer.$,f.endOffset)}catch(H){if(0<=H.toString().indexOf("NS_ERROR_ILLEGAL_VALUE"))f.collapse(1),q.setEnd(f.endContainer.$,f.endOffset);else throw H;}g.addRange(q)}}this.reset();this.root.fire("selectionchange")}}},fake:function(a){var b=this.root.editor;this.reset();g(b);var c=this._.cache,d=new CKEDITOR.dom.range(this.root);
d.setStartBefore(a);d.setEndAfter(a);c.ranges=new CKEDITOR.dom.rangeList(d);c.selectedElement=c.startElement=a;c.type=CKEDITOR.SELECTION_ELEMENT;c.selectedText=c.nativeSel=null;this.isFake=1;this.rev=w++;b._.fakeSelection=this;this.root.fire("selectionchange")},isHidden:function(){var a=this.getCommonAncestor();a&&a.type==CKEDITOR.NODE_TEXT&&(a=a.getParent());return!(!a||!a.data("cke-hidden-sel"))},createBookmarks:function(a){a=this.getRanges().createBookmarks(a);this.isFake&&(a.isFake=1);return a},
createBookmarks2:function(a){a=this.getRanges().createBookmarks2(a);this.isFake&&(a.isFake=1);return a},selectBookmarks:function(a){for(var b=[],c,d=0;d<a.length;d++){var e=new CKEDITOR.dom.range(this.root);e.moveToBookmark(a[d]);b.push(e)}a.isFake&&(c=b[0].getEnclosedNode(),c&&c.type==CKEDITOR.NODE_ELEMENT||(CKEDITOR.warn("selection-not-fake"),a.isFake=0));a.isFake?this.fake(c):this.selectRanges(b);return this},getCommonAncestor:function(){var a=this.getRanges();return a.length?a[0].startContainer.getCommonAncestor(a[a.length-
1].endContainer):null},scrollIntoView:function(){this.type!=CKEDITOR.SELECTION_NONE&&this.getRanges()[0].scrollIntoView()},removeAllRanges:function(){if(this.getType()!=CKEDITOR.SELECTION_NONE){var a=this.getNative();try{a&&a[F?"empty":"removeAllRanges"]()}catch(b){}this.reset()}}}})();"use strict";CKEDITOR.STYLE_BLOCK=1;CKEDITOR.STYLE_INLINE=2;CKEDITOR.STYLE_OBJECT=3;
(function(){function a(a,b){for(var c,d;(a=a.getParent())&&!a.equals(b);)if(a.getAttribute("data-nostyle"))c=a;else if(!d){var e=a.getAttribute("contentEditable");"false"==e?c=a:"true"==e&&(d=1)}return c}function d(a,b,c,d){return(a.getPosition(b)|d)==d&&(!c.childRule||c.childRule(a))}function b(c){var g=c.document;if(c.collapsed)g=F(this,g),c.insertNode(g),c.moveToPosition(g,CKEDITOR.POSITION_BEFORE_END);else{var f=this.element,h=this._.definition,k,l=h.ignoreReadonly,n=l||h.includeReadonly;null==
n&&(n=c.root.getCustomData("cke_includeReadonly"));var m=CKEDITOR.dtd[f];m||(k=!0,m=CKEDITOR.dtd.span);c.enlarge(CKEDITOR.ENLARGE_INLINE,1);c.trim();var p=c.createBookmark(),t=p.startNode,q=p.endNode,r=t,v;if(!l){var u=c.getCommonAncestor(),l=a(t,u),u=a(q,u);l&&(r=l.getNextSourceNode(!0));u&&(q=u)}for(r.getPosition(q)==CKEDITOR.POSITION_FOLLOWING&&(r=0);r;){l=!1;if(r.equals(q))r=null,l=!0;else{var w=r.type==CKEDITOR.NODE_ELEMENT?r.getName():null,u=w&&"false"==r.getAttribute("contentEditable"),z=w&&
r.getAttribute("data-nostyle");if(w&&r.data("cke-bookmark")){r=r.getNextSourceNode(!0);continue}if(u&&n&&CKEDITOR.dtd.$block[w])for(var A=r,y=e(A),B=void 0,D=y.length,G=0,A=D&&new CKEDITOR.dom.range(A.getDocument());G<D;++G){var B=y[G],T=CKEDITOR.filter.instances[B.data("cke-filter")];if(T?T.check(this):1)A.selectNodeContents(B),b.call(this,A)}y=w?!m[w]||z?0:u&&!n?0:d(r,q,h,M):1;if(y)if(B=r.getParent(),y=h,D=f,G=k,!B||!(B.getDtd()||CKEDITOR.dtd.span)[D]&&!G||y.parentRule&&!y.parentRule(B))l=!0;else{if(v||
w&&CKEDITOR.dtd.$removeEmpty[w]&&(r.getPosition(q)|M)!=M||(v=c.clone(),v.setStartBefore(r)),w=r.type,w==CKEDITOR.NODE_TEXT||u||w==CKEDITOR.NODE_ELEMENT&&!r.getChildCount()){for(var w=r,Z;(l=!w.getNext(L))&&(Z=w.getParent(),m[Z.getName()])&&d(Z,t,h,S);)w=Z;v.setEndAfter(w)}}else l=!0;r=r.getNextSourceNode(z||u)}if(l&&v&&!v.collapsed){for(var l=F(this,g),u=l.hasAttributes(),z=v.getCommonAncestor(),w={},y={},B={},D={},V,Q,da;l&&z;){if(z.getName()==f){for(V in h.attributes)!D[V]&&(da=z.getAttribute(Q))&&
(l.getAttribute(V)==da?y[V]=1:D[V]=1);for(Q in h.styles)!B[Q]&&(da=z.getStyle(Q))&&(l.getStyle(Q)==da?w[Q]=1:B[Q]=1)}z=z.getParent()}for(V in y)l.removeAttribute(V);for(Q in w)l.removeStyle(Q);u&&!l.hasAttributes()&&(l=null);l?(v.extractContents().appendTo(l),v.insertNode(l),C.call(this,l),l.mergeSiblings(),CKEDITOR.env.ie||l.$.normalize()):(l=new CKEDITOR.dom.element("span"),v.extractContents().appendTo(l),v.insertNode(l),C.call(this,l),l.remove(!0));v=null}}c.moveToBookmark(p);c.shrink(CKEDITOR.SHRINK_TEXT);
c.shrink(CKEDITOR.NODE_ELEMENT,!0)}}function c(a){function b(){for(var a=new CKEDITOR.dom.elementPath(d.getParent()),c=new CKEDITOR.dom.elementPath(m.getParent()),e=null,g=null,f=0;f<a.elements.length;f++){var h=a.elements[f];if(h==a.block||h==a.blockLimit)break;p.checkElementRemovable(h,!0)&&(e=h)}for(f=0;f<c.elements.length;f++){h=c.elements[f];if(h==c.block||h==c.blockLimit)break;p.checkElementRemovable(h,!0)&&(g=h)}g&&m.breakParent(g);e&&d.breakParent(e)}a.enlarge(CKEDITOR.ENLARGE_INLINE,1);var c=
a.createBookmark(),d=c.startNode;if(a.collapsed){for(var e=new CKEDITOR.dom.elementPath(d.getParent(),a.root),g,f=0,k;f<e.elements.length&&(k=e.elements[f])&&k!=e.block&&k!=e.blockLimit;f++)if(this.checkElementRemovable(k)){var l;a.collapsed&&(a.checkBoundaryOfElement(k,CKEDITOR.END)||(l=a.checkBoundaryOfElement(k,CKEDITOR.START)))?(g=k,g.match=l?"start":"end"):(k.mergeSiblings(),k.is(this.element)?v.call(this,k):n(k,h(this)[k.getName()]))}if(g){k=d;for(f=0;;f++){l=e.elements[f];if(l.equals(g))break;
else if(l.match)continue;else l=l.clone();l.append(k);k=l}k["start"==g.match?"insertBefore":"insertAfter"](g)}}else{var m=c.endNode,p=this;b();for(e=d;!e.equals(m);)g=e.getNextSourceNode(),e.type==CKEDITOR.NODE_ELEMENT&&this.checkElementRemovable(e)&&(e.getName()==this.element?v.call(this,e):n(e,h(this)[e.getName()]),g.type==CKEDITOR.NODE_ELEMENT&&g.contains(d)&&(b(),g=d.getNext())),e=g}a.moveToBookmark(c);a.shrink(CKEDITOR.NODE_ELEMENT,!0)}function e(a){var b=[];a.forEach(function(a){if("true"==
a.getAttribute("contenteditable"))return b.push(a),!1},CKEDITOR.NODE_ELEMENT,!0);return b}function f(a){var b=a.getEnclosedNode()||a.getCommonAncestor(!1,!0);(a=(new CKEDITOR.dom.elementPath(b,a.root)).contains(this.element,1))&&!a.isReadOnly()&&w(a,this)}function k(a){var b=a.getCommonAncestor(!0,!0);if(a=(new CKEDITOR.dom.elementPath(b,a.root)).contains(this.element,1)){var b=this._.definition,c=b.attributes;if(c)for(var d in c)a.removeAttribute(d,c[d]);if(b.styles)for(var e in b.styles)b.styles.hasOwnProperty(e)&&
a.removeStyle(e)}}function l(a){var b=a.createBookmark(!0),c=a.createIterator();c.enforceRealBlocks=!0;this._.enterMode&&(c.enlargeBr=this._.enterMode!=CKEDITOR.ENTER_BR);for(var d,e=a.document,g;d=c.getNextParagraph();)!d.isReadOnly()&&(c.activeFilter?c.activeFilter.check(this):1)&&(g=F(this,e,d),t(d,g));a.moveToBookmark(b)}function q(a){var b=a.createBookmark(1),c=a.createIterator();c.enforceRealBlocks=!0;c.enlargeBr=this._.enterMode!=CKEDITOR.ENTER_BR;for(var d,e;d=c.getNextParagraph();)this.checkElementRemovable(d)&&
(d.is("pre")?((e=this._.enterMode==CKEDITOR.ENTER_BR?null:a.document.createElement(this._.enterMode==CKEDITOR.ENTER_P?"p":"div"))&&d.copyAttributes(e),t(d,e)):v.call(this,d));a.moveToBookmark(b)}function t(a,b){var c=!b;c&&(b=a.getDocument().createElement("div"),a.copyAttributes(b));var d=b&&b.is("pre"),e=a.is("pre"),f=!d&&e;if(d&&!e){e=b;(f=a.getBogus())&&f.remove();f=a.getHtml();f=z(f,/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g,"");f=f.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi,"$1");f=f.replace(/([ \t\n\r]+|&nbsp;)/g,
" ");f=f.replace(/<br\b[^>]*>/gi,"\n");if(CKEDITOR.env.ie){var h=a.getDocument().createElement("div");h.append(e);e.$.outerHTML="\x3cpre\x3e"+f+"\x3c/pre\x3e";e.copyAttributes(h.getFirst());e=h.getFirst().remove()}else e.setHtml(f);b=e}else f?b=A(c?[a.getHtml()]:g(a),b):a.moveChildren(b);b.replace(a);if(d){var c=b,k;(k=c.getPrevious(T))&&k.type==CKEDITOR.NODE_ELEMENT&&k.is("pre")&&(d=z(k.getHtml(),/\n$/,"")+"\n\n"+z(c.getHtml(),/^\n/,""),CKEDITOR.env.ie?c.$.outerHTML="\x3cpre\x3e"+d+"\x3c/pre\x3e":
c.setHtml(d),k.remove())}else c&&y(b)}function g(a){var b=[];z(a.getOuterHtml(),/(\S\s*)\n(?:\s|(<span[^>]+data-cke-bookmark.*?\/span>))*\n(?!$)/gi,function(a,b,c){return b+"\x3c/pre\x3e"+c+"\x3cpre\x3e"}).replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi,function(a,c){b.push(c)});return b}function z(a,b,c){var d="",e="";a=a.replace(/(^<span[^>]+data-cke-bookmark.*?\/span>)|(<span[^>]+data-cke-bookmark.*?\/span>$)/gi,function(a,b,c){b&&(d=b);c&&(e=c);return""});return d+a.replace(b,c)+e}function A(a,b){var c;
1<a.length&&(c=new CKEDITOR.dom.documentFragment(b.getDocument()));for(var d=0;d<a.length;d++){var e=a[d],e=e.replace(/(\r\n|\r)/g,"\n"),e=z(e,/^[ \t]*\n/,""),e=z(e,/\n$/,""),e=z(e,/^[ \t]+|[ \t]+$/g,function(a,b){return 1==a.length?"\x26nbsp;":b?" "+CKEDITOR.tools.repeat("\x26nbsp;",a.length-1):CKEDITOR.tools.repeat("\x26nbsp;",a.length-1)+" "}),e=e.replace(/\n/g,"\x3cbr\x3e"),e=e.replace(/[ \t]{2,}/g,function(a){return CKEDITOR.tools.repeat("\x26nbsp;",a.length-1)+" "});if(c){var g=b.clone();g.setHtml(e);
c.append(g)}else b.setHtml(e)}return c||b}function v(a,b){var c=this._.definition,d=c.attributes,c=c.styles,e=h(this)[a.getName()],g=CKEDITOR.tools.isEmpty(d)&&CKEDITOR.tools.isEmpty(c),f;for(f in d)if("class"!=f&&!this._.definition.fullMatch||a.getAttribute(f)==p(f,d[f]))b&&"data-"==f.slice(0,5)||(g=a.hasAttribute(f),a.removeAttribute(f));for(var k in c)this._.definition.fullMatch&&a.getStyle(k)!=p(k,c[k],!0)||(g=g||!!a.getStyle(k),a.removeStyle(k));n(a,e,D[a.getName()]);g&&(this._.definition.alwaysRemoveElement?
y(a,1):!CKEDITOR.dtd.$block[a.getName()]||this._.enterMode==CKEDITOR.ENTER_BR&&!a.hasAttributes()?y(a):a.renameNode(this._.enterMode==CKEDITOR.ENTER_P?"p":"div"))}function C(a){for(var b=h(this),c=a.getElementsByTag(this.element),d,e=c.count();0<=--e;)d=c.getItem(e),d.isReadOnly()||v.call(this,d,!0);for(var g in b)if(g!=this.element)for(c=a.getElementsByTag(g),e=c.count()-1;0<=e;e--)d=c.getItem(e),d.isReadOnly()||n(d,b[g])}function n(a,b,c){if(b=b&&b.attributes)for(var d=0;d<b.length;d++){var e=b[d][0],
g;if(g=a.getAttribute(e)){var f=b[d][1];(null===f||f.test&&f.test(g)||"string"==typeof f&&g==f)&&a.removeAttribute(e)}}c||y(a)}function y(a,b){if(!a.hasAttributes()||b)if(CKEDITOR.dtd.$block[a.getName()]){var c=a.getPrevious(T),d=a.getNext(T);!c||c.type!=CKEDITOR.NODE_TEXT&&c.isBlockBoundary({br:1})||a.append("br",1);!d||d.type!=CKEDITOR.NODE_TEXT&&d.isBlockBoundary({br:1})||a.append("br");a.remove(!0)}else c=a.getFirst(),d=a.getLast(),a.remove(!0),c&&(c.type==CKEDITOR.NODE_ELEMENT&&c.mergeSiblings(),
d&&!c.equals(d)&&d.type==CKEDITOR.NODE_ELEMENT&&d.mergeSiblings())}function F(a,b,c){var d;d=a.element;"*"==d&&(d="span");d=new CKEDITOR.dom.element(d,b);c&&c.copyAttributes(d);d=w(d,a);b.getCustomData("doc_processing_style")&&d.hasAttribute("id")?d.removeAttribute("id"):b.setCustomData("doc_processing_style",1);return d}function w(a,b){var c=b._.definition,d=c.attributes,c=CKEDITOR.style.getStyleText(c);if(d)for(var e in d)a.setAttribute(e,d[e]);c&&a.setAttribute("style",c);return a}function u(a,
b){for(var c in a)a[c]=a[c].replace(B,function(a,c){return b[c]})}function h(a){if(a._.overrides)return a._.overrides;var b=a._.overrides={},c=a._.definition.overrides;if(c){CKEDITOR.tools.isArray(c)||(c=[c]);for(var d=0;d<c.length;d++){var e=c[d],g,f;"string"==typeof e?g=e.toLowerCase():(g=e.element?e.element.toLowerCase():a.element,f=e.attributes);e=b[g]||(b[g]={});if(f){var e=e.attributes=e.attributes||[],h;for(h in f)e.push([h.toLowerCase(),f[h]])}}}return b}function p(a,b,c){var d=new CKEDITOR.dom.element("span");
d[c?"setStyle":"setAttribute"](a,b);return d[c?"getStyle":"getAttribute"](a)}function m(a,b,c){var d=a.document,e=a.getRanges();b=b?this.removeFromRange:this.applyToRange;for(var g,f=e.createIterator();g=f.getNextRange();)b.call(this,g,c);a.selectRanges(e);d.removeCustomData("doc_processing_style")}var D={address:1,div:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,p:1,pre:1,section:1,header:1,footer:1,nav:1,article:1,aside:1,figure:1,dialog:1,hgroup:1,time:1,meter:1,menu:1,command:1,keygen:1,output:1,progress:1,
details:1,datagrid:1,datalist:1},r={a:1,blockquote:1,embed:1,hr:1,img:1,li:1,object:1,ol:1,table:1,td:1,tr:1,th:1,ul:1,dl:1,dt:1,dd:1,form:1,audio:1,video:1},G=/\s*(?:;\s*|$)/,B=/#\((.+?)\)/g,L=CKEDITOR.dom.walker.bookmark(0,1),T=CKEDITOR.dom.walker.whitespaces(1);CKEDITOR.style=function(a,b){if("string"==typeof a.type)return new CKEDITOR.style.customHandlers[a.type](a);var c=a.attributes;c&&c.style&&(a.styles=CKEDITOR.tools.extend({},a.styles,CKEDITOR.tools.parseCssText(c.style)),delete c.style);
b&&(a=CKEDITOR.tools.clone(a),u(a.attributes,b),u(a.styles,b));c=this.element=a.element?"string"==typeof a.element?a.element.toLowerCase():a.element:"*";this.type=a.type||(D[c]?CKEDITOR.STYLE_BLOCK:r[c]?CKEDITOR.STYLE_OBJECT:CKEDITOR.STYLE_INLINE);"object"==typeof this.element&&(this.type=CKEDITOR.STYLE_OBJECT);this._={definition:a}};CKEDITOR.style.prototype={apply:function(a){if(a instanceof CKEDITOR.dom.document)return m.call(this,a.getSelection());if(this.checkApplicable(a.elementPath(),a)){var b=
this._.enterMode;b||(this._.enterMode=a.activeEnterMode);m.call(this,a.getSelection(),0,a);this._.enterMode=b}},remove:function(a){if(a instanceof CKEDITOR.dom.document)return m.call(this,a.getSelection(),1);if(this.checkApplicable(a.elementPath(),a)){var b=this._.enterMode;b||(this._.enterMode=a.activeEnterMode);m.call(this,a.getSelection(),1,a);this._.enterMode=b}},applyToRange:function(a){this.applyToRange=this.type==CKEDITOR.STYLE_INLINE?b:this.type==CKEDITOR.STYLE_BLOCK?l:this.type==CKEDITOR.STYLE_OBJECT?
f:null;return this.applyToRange(a)},removeFromRange:function(a){this.removeFromRange=this.type==CKEDITOR.STYLE_INLINE?c:this.type==CKEDITOR.STYLE_BLOCK?q:this.type==CKEDITOR.STYLE_OBJECT?k:null;return this.removeFromRange(a)},applyToObject:function(a){w(a,this)},checkActive:function(a,b){switch(this.type){case CKEDITOR.STYLE_BLOCK:return this.checkElementRemovable(a.block||a.blockLimit,!0,b);case CKEDITOR.STYLE_OBJECT:case CKEDITOR.STYLE_INLINE:for(var c=a.elements,d=0,e;d<c.length;d++)if(e=c[d],
this.type!=CKEDITOR.STYLE_INLINE||e!=a.block&&e!=a.blockLimit){if(this.type==CKEDITOR.STYLE_OBJECT){var g=e.getName();if(!("string"==typeof this.element?g==this.element:g in this.element))continue}if(this.checkElementRemovable(e,!0,b))return!0}}return!1},checkApplicable:function(a,b,c){b&&b instanceof CKEDITOR.filter&&(c=b);if(c&&!c.check(this))return!1;switch(this.type){case CKEDITOR.STYLE_OBJECT:return!!a.contains(this.element);case CKEDITOR.STYLE_BLOCK:return!!a.blockLimit.getDtd()[this.element]}return!0},
checkElementMatch:function(a,b){var c=this._.definition;if(!a||!c.ignoreReadonly&&a.isReadOnly())return!1;var d=a.getName();if("string"==typeof this.element?d==this.element:d in this.element){if(!b&&!a.hasAttributes())return!0;if(d=c._AC)c=d;else{var d={},e=0,g=c.attributes;if(g)for(var f in g)e++,d[f]=g[f];if(f=CKEDITOR.style.getStyleText(c))d.style||e++,d.style=f;d._length=e;c=c._AC=d}if(c._length){for(var h in c)if("_length"!=h){e=a.getAttribute(h)||"";if("style"==h)a:{d=c[h];"string"==typeof d&&
(d=CKEDITOR.tools.parseCssText(d));"string"==typeof e&&(e=CKEDITOR.tools.parseCssText(e,!0));f=void 0;for(f in d)if(!(f in e)||e[f]!=d[f]&&"inherit"!=d[f]&&"inherit"!=e[f]){d=!1;break a}d=!0}else d=c[h]==e;if(d){if(!b)return!0}else if(b)return!1}if(b)return!0}else return!0}return!1},checkElementRemovable:function(a,b,c){if(this.checkElementMatch(a,b,c))return!0;if(b=h(this)[a.getName()]){var d;if(!(b=b.attributes))return!0;for(c=0;c<b.length;c++)if(d=b[c][0],d=a.getAttribute(d)){var e=b[c][1];if(null===
e)return!0;if("string"==typeof e){if(d==e)return!0}else if(e.test(d))return!0}}return!1},buildPreview:function(a){var b=this._.definition,c=[],d=b.element;"bdo"==d&&(d="span");var c=["\x3c",d],e=b.attributes;if(e)for(var g in e)c.push(" ",g,'\x3d"',e[g],'"');(e=CKEDITOR.style.getStyleText(b))&&c.push(' style\x3d"',e,'"');c.push("\x3e",a||b.name,"\x3c/",d,"\x3e");return c.join("")},getDefinition:function(){return this._.definition}};CKEDITOR.style.getStyleText=function(a){var b=a._ST;if(b)return b;
var b=a.styles,c=a.attributes&&a.attributes.style||"",d="";c.length&&(c=c.replace(G,";"));for(var e in b){var g=b[e],f=(e+":"+g).replace(G,";");"inherit"==g?d+=f:c+=f}c.length&&(c=CKEDITOR.tools.normalizeCssText(c,!0));return a._ST=c+d};CKEDITOR.style.customHandlers={};CKEDITOR.style.addCustomHandler=function(a){var b=function(a){this._={definition:a};this.setup&&this.setup(a)};b.prototype=CKEDITOR.tools.extend(CKEDITOR.tools.prototypedCopy(CKEDITOR.style.prototype),{assignedTo:CKEDITOR.STYLE_OBJECT},
a,!0);return this.customHandlers[a.type]=b};var M=CKEDITOR.POSITION_PRECEDING|CKEDITOR.POSITION_IDENTICAL|CKEDITOR.POSITION_IS_CONTAINED,S=CKEDITOR.POSITION_FOLLOWING|CKEDITOR.POSITION_IDENTICAL|CKEDITOR.POSITION_IS_CONTAINED})();CKEDITOR.styleCommand=function(a,d){this.requiredContent=this.allowedContent=this.style=a;CKEDITOR.tools.extend(this,d,!0)};
CKEDITOR.styleCommand.prototype.exec=function(a){a.focus();this.state==CKEDITOR.TRISTATE_OFF?a.applyStyle(this.style):this.state==CKEDITOR.TRISTATE_ON&&a.removeStyle(this.style)};CKEDITOR.stylesSet=new CKEDITOR.resourceManager("","stylesSet");CKEDITOR.addStylesSet=CKEDITOR.tools.bind(CKEDITOR.stylesSet.add,CKEDITOR.stylesSet);CKEDITOR.loadStylesSet=function(a,d,b){CKEDITOR.stylesSet.addExternal(a,d,"");CKEDITOR.stylesSet.load(a,b)};
CKEDITOR.tools.extend(CKEDITOR.editor.prototype,{attachStyleStateChange:function(a,d){var b=this._.styleStateChangeCallbacks;b||(b=this._.styleStateChangeCallbacks=[],this.on("selectionChange",function(a){for(var d=0;d<b.length;d++){var f=b[d],k=f.style.checkActive(a.data.path,this)?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF;f.fn.call(this,k)}}));b.push({style:a,fn:d})},applyStyle:function(a){a.apply(this)},removeStyle:function(a){a.remove(this)},getStylesSet:function(a){if(this._.stylesDefinitions)a(this._.stylesDefinitions);
else{var d=this,b=d.config.stylesCombo_stylesSet||d.config.stylesSet;if(!1===b)a(null);else if(b instanceof Array)d._.stylesDefinitions=b,a(b);else{b||(b="default");var b=b.split(":"),c=b[0];CKEDITOR.stylesSet.addExternal(c,b[1]?b.slice(1).join(":"):CKEDITOR.getUrl("styles.js"),"");CKEDITOR.stylesSet.load(c,function(b){d._.stylesDefinitions=b[c];a(d._.stylesDefinitions)})}}}});
CKEDITOR.dom.comment=function(a,d){"string"==typeof a&&(a=(d?d.$:document).createComment(a));CKEDITOR.dom.domObject.call(this,a)};CKEDITOR.dom.comment.prototype=new CKEDITOR.dom.node;CKEDITOR.tools.extend(CKEDITOR.dom.comment.prototype,{type:CKEDITOR.NODE_COMMENT,getOuterHtml:function(){return"\x3c!--"+this.$.nodeValue+"--\x3e"}});"use strict";
(function(){var a={},d={},b;for(b in CKEDITOR.dtd.$blockLimit)b in CKEDITOR.dtd.$list||(a[b]=1);for(b in CKEDITOR.dtd.$block)b in CKEDITOR.dtd.$blockLimit||b in CKEDITOR.dtd.$empty||(d[b]=1);CKEDITOR.dom.elementPath=function(b,e){var f=null,k=null,l=[],q=b,t;e=e||b.getDocument().getBody();do if(q.type==CKEDITOR.NODE_ELEMENT){l.push(q);if(!this.lastElement&&(this.lastElement=q,q.is(CKEDITOR.dtd.$object)||"false"==q.getAttribute("contenteditable")))continue;if(q.equals(e))break;if(!k&&(t=q.getName(),
"true"==q.getAttribute("contenteditable")?k=q:!f&&d[t]&&(f=q),a[t])){if(t=!f&&"div"==t){a:{t=q.getChildren();for(var g=0,z=t.count();g<z;g++){var A=t.getItem(g);if(A.type==CKEDITOR.NODE_ELEMENT&&CKEDITOR.dtd.$block[A.getName()]){t=!0;break a}}t=!1}t=!t}t?f=q:k=q}}while(q=q.getParent());k||(k=e);this.block=f;this.blockLimit=k;this.root=e;this.elements=l}})();
CKEDITOR.dom.elementPath.prototype={compare:function(a){var d=this.elements;a=a&&a.elements;if(!a||d.length!=a.length)return!1;for(var b=0;b<d.length;b++)if(!d[b].equals(a[b]))return!1;return!0},contains:function(a,d,b){var c;"string"==typeof a&&(c=function(b){return b.getName()==a});a instanceof CKEDITOR.dom.element?c=function(b){return b.equals(a)}:CKEDITOR.tools.isArray(a)?c=function(b){return-1<CKEDITOR.tools.indexOf(a,b.getName())}:"function"==typeof a?c=a:"object"==typeof a&&(c=function(b){return b.getName()in
a});var e=this.elements,f=e.length;d&&f--;b&&(e=Array.prototype.slice.call(e,0),e.reverse());for(d=0;d<f;d++)if(c(e[d]))return e[d];return null},isContextFor:function(a){var d;return a in CKEDITOR.dtd.$block?(d=this.contains(CKEDITOR.dtd.$intermediate)||this.root.equals(this.block)&&this.block||this.blockLimit,!!d.getDtd()[a]):!0},direction:function(){return(this.block||this.blockLimit||this.root).getDirection(1)}};
CKEDITOR.dom.text=function(a,d){"string"==typeof a&&(a=(d?d.$:document).createTextNode(a));this.$=a};CKEDITOR.dom.text.prototype=new CKEDITOR.dom.node;
CKEDITOR.tools.extend(CKEDITOR.dom.text.prototype,{type:CKEDITOR.NODE_TEXT,getLength:function(){return this.$.nodeValue.length},getText:function(){return this.$.nodeValue},setText:function(a){this.$.nodeValue=a},split:function(a){var d=this.$.parentNode,b=d.childNodes.length,c=this.getLength(),e=this.getDocument(),f=new CKEDITOR.dom.text(this.$.splitText(a),e);d.childNodes.length==b&&(a>=c?(f=e.createText(""),f.insertAfter(this)):(a=e.createText(""),a.insertAfter(f),a.remove()));return f},substring:function(a,
d){return"number"!=typeof d?this.$.nodeValue.substr(a):this.$.nodeValue.substring(a,d)}});
(function(){function a(a,c,d){var f=a.serializable,k=c[d?"endContainer":"startContainer"],l=d?"endOffset":"startOffset",q=f?c.document.getById(a.startNode):a.startNode;a=f?c.document.getById(a.endNode):a.endNode;k.equals(q.getPrevious())?(c.startOffset=c.startOffset-k.getLength()-a.getPrevious().getLength(),k=a.getNext()):k.equals(a.getPrevious())&&(c.startOffset-=k.getLength(),k=a.getNext());k.equals(q.getParent())&&c[l]++;k.equals(a.getParent())&&c[l]++;c[d?"endContainer":"startContainer"]=k;return c}
CKEDITOR.dom.rangeList=function(a){if(a instanceof CKEDITOR.dom.rangeList)return a;a?a instanceof CKEDITOR.dom.range&&(a=[a]):a=[];return CKEDITOR.tools.extend(a,d)};var d={createIterator:function(){var a=this,c=CKEDITOR.dom.walker.bookmark(),d=[],f;return{getNextRange:function(k){f=void 0===f?0:f+1;var l=a[f];if(l&&1<a.length){if(!f)for(var q=a.length-1;0<=q;q--)d.unshift(a[q].createBookmark(!0));if(k)for(var t=0;a[f+t+1];){var g=l.document;k=0;q=g.getById(d[t].endNode);for(g=g.getById(d[t+1].startNode);;){q=
q.getNextSourceNode(!1);if(g.equals(q))k=1;else if(c(q)||q.type==CKEDITOR.NODE_ELEMENT&&q.isBlockBoundary())continue;break}if(!k)break;t++}for(l.moveToBookmark(d.shift());t--;)q=a[++f],q.moveToBookmark(d.shift()),l.setEnd(q.endContainer,q.endOffset)}return l}}},createBookmarks:function(b){for(var c=[],d,f=0;f<this.length;f++){c.push(d=this[f].createBookmark(b,!0));for(var k=f+1;k<this.length;k++)this[k]=a(d,this[k]),this[k]=a(d,this[k],!0)}return c},createBookmarks2:function(a){for(var c=[],d=0;d<
this.length;d++)c.push(this[d].createBookmark2(a));return c},moveToBookmarks:function(a){for(var c=0;c<this.length;c++)this[c].moveToBookmark(a[c])}}})();
(function(){function a(){return CKEDITOR.getUrl(CKEDITOR.skinName.split(",")[1]||"skins/"+CKEDITOR.skinName.split(",")[0]+"/")}function d(b){var c=CKEDITOR.skin["ua_"+b],d=CKEDITOR.env;if(c)for(var c=c.split(",").sort(function(a,b){return a>b?-1:1}),e=0,f;e<c.length;e++)if(f=c[e],d.ie&&(f.replace(/^ie/,"")==d.version||d.quirks&&"iequirks"==f)&&(f="ie"),d[f]){b+="_"+c[e];break}return CKEDITOR.getUrl(a()+b+".css")}function b(a,b){f[a]||(CKEDITOR.document.appendStyleSheet(d(a)),f[a]=1);b&&b()}function c(a){var b=
a.getById(k);b||(b=a.getHead().append("style"),b.setAttribute("id",k),b.setAttribute("type","text/css"));return b}function e(a,b,c){var d,e,f;if(CKEDITOR.env.webkit)for(b=b.split("}").slice(0,-1),e=0;e<b.length;e++)b[e]=b[e].split("{");for(var k=0;k<a.length;k++)if(CKEDITOR.env.webkit)for(e=0;e<b.length;e++){f=b[e][1];for(d=0;d<c.length;d++)f=f.replace(c[d][0],c[d][1]);a[k].$.sheet.addRule(b[e][0],f)}else{f=b;for(d=0;d<c.length;d++)f=f.replace(c[d][0],c[d][1]);CKEDITOR.env.ie&&11>CKEDITOR.env.version?
a[k].$.styleSheet.cssText+=f:a[k].$.innerHTML+=f}}var f={};CKEDITOR.skin={path:a,loadPart:function(c,d){CKEDITOR.skin.name!=CKEDITOR.skinName.split(",")[0]?CKEDITOR.scriptLoader.load(CKEDITOR.getUrl(a()+"skin.js"),function(){b(c,d)}):b(c,d)},getPath:function(a){return CKEDITOR.getUrl(d(a))},icons:{},addIcon:function(a,b,c,d){a=a.toLowerCase();this.icons[a]||(this.icons[a]={path:b,offset:c||0,bgsize:d||"16px"})},getIconStyle:function(a,b,c,d,e){var f;a&&(a=a.toLowerCase(),b&&(f=this.icons[a+"-rtl"]),
f||(f=this.icons[a]));a=c||f&&f.path||"";d=d||f&&f.offset;e=e||f&&f.bgsize||"16px";a&&(a=a.replace(/'/g,"\\'"));return a&&"background-image:url('"+CKEDITOR.getUrl(a)+"');background-position:0 "+d+"px;background-size:"+e+";"}};CKEDITOR.tools.extend(CKEDITOR.editor.prototype,{getUiColor:function(){return this.uiColor},setUiColor:function(a){var b=c(CKEDITOR.document);return(this.setUiColor=function(a){this.uiColor=a;var c=CKEDITOR.skin.chameleon,d="",f="";"function"==typeof c&&(d=c(this,"editor"),f=
c(this,"panel"));a=[[q,a]];e([b],d,a);e(l,f,a)}).call(this,a)}});var k="cke_ui_color",l=[],q=/\$color/g;CKEDITOR.on("instanceLoaded",function(a){if(!CKEDITOR.env.ie||!CKEDITOR.env.quirks){var b=a.editor;a=function(a){a=(a.data[0]||a.data).element.getElementsByTag("iframe").getItem(0).getFrameDocument();if(!a.getById("cke_ui_color")){a=c(a);l.push(a);var d=b.getUiColor();d&&e([a],CKEDITOR.skin.chameleon(b,"panel"),[[q,d]])}};b.on("panelShow",a);b.on("menuShow",a);b.config.uiColor&&b.setUiColor(b.config.uiColor)}})})();
(function(){if(CKEDITOR.env.webkit)CKEDITOR.env.hc=!1;else{var a=CKEDITOR.dom.element.createFromHtml('\x3cdiv style\x3d"width:0;height:0;position:absolute;left:-10000px;border:1px solid;border-color:red blue"\x3e\x3c/div\x3e',CKEDITOR.document);a.appendTo(CKEDITOR.document.getHead());try{var d=a.getComputedStyle("border-top-color"),b=a.getComputedStyle("border-right-color");CKEDITOR.env.hc=!(!d||d!=b)}catch(c){CKEDITOR.env.hc=!1}a.remove()}CKEDITOR.env.hc&&(CKEDITOR.env.cssClass+=" cke_hc");CKEDITOR.document.appendStyleText(".cke{visibility:hidden;}");
CKEDITOR.status="loaded";CKEDITOR.fireOnce("loaded");if(a=CKEDITOR._.pending)for(delete CKEDITOR._.pending,d=0;d<a.length;d++)CKEDITOR.editor.prototype.constructor.apply(a[d][0],a[d][1]),CKEDITOR.add(a[d][0])})();/*
 Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.skin.name="minimalist";CKEDITOR.skin.ua_editor="ie,iequirks,ie7,ie8,gecko";CKEDITOR.skin.ua_dialog="ie,iequirks,ie7,ie8";
CKEDITOR.skin.chameleon=function(){var b=function(){return function(b,e){for(var a=b.match(/[^#]./g),c=0;3>c;c++){var f=a,h=c,d;d=parseInt(a[c],16);d=("0"+(0>e?0|d*(1+e):0|d+(255-d)*e).toString(16)).slice(-2);f[h]=d}return"#"+a.join("")}}(),c=function(){var b=new CKEDITOR.template("background:#{to};background-image:-webkit-gradient(linear,lefttop,leftbottom,from({from}),to({to}));background-image:-moz-linear-gradient(top,{from},{to});background-image:-webkit-linear-gradient(top,{from},{to});background-image:-o-linear-gradient(top,{from},{to});background-image:-ms-linear-gradient(top,{from},{to});background-image:linear-gradient(top,{from},{to});filter:progid:DXImageTransform.Microsoft.gradient(gradientType=0,startColorstr='{from}',endColorstr='{to}');");return function(c,
a){return b.output({from:c,to:a})}}(),f={editor:new CKEDITOR.template("{id}.cke_chrome [border-color:{defaultBorder};] {id} .cke_top [ {defaultGradient}border-bottom-color:{defaultBorder};] {id} .cke_bottom [{defaultGradient}border-top-color:{defaultBorder};] {id} .cke_resizer [border-right-color:{ckeResizer}] {id} .cke_dialog_title [{defaultGradient}border-bottom-color:{defaultBorder};] {id} .cke_dialog_footer [{defaultGradient}outline-color:{defaultBorder};border-top-color:{defaultBorder};] {id} .cke_dialog_tab [{lightGradient}border-color:{defaultBorder};] {id} .cke_dialog_tab:hover [{mediumGradient}] {id} .cke_dialog_contents [border-top-color:{defaultBorder};] {id} .cke_dialog_tab_selected, {id} .cke_dialog_tab_selected:hover [background:{dialogTabSelected};border-bottom-color:{dialogTabSelectedBorder};] {id} .cke_dialog_body [background:{dialogBody};border-color:{defaultBorder};] {id} .cke_toolgroup [{lightGradient}border-color:{defaultBorder};] {id} a.cke_button_off:hover, {id} a.cke_button_off:focus, {id} a.cke_button_off:active [{mediumGradient}] {id} .cke_button_on [{ckeButtonOn}] {id} .cke_toolbar_separator [background-color: {ckeToolbarSeparator};] {id} .cke_combo_button [border-color:{defaultBorder};{lightGradient}] {id} a.cke_combo_button:hover, {id} a.cke_combo_button:focus, {id} .cke_combo_on a.cke_combo_button [border-color:{defaultBorder};{mediumGradient}] {id} .cke_path_item [color:{elementsPathColor};] {id} a.cke_path_item:hover, {id} a.cke_path_item:focus, {id} a.cke_path_item:active [background-color:{elementsPathBg};] {id}.cke_panel [border-color:{defaultBorder};] "),
panel:new CKEDITOR.template(".cke_panel_grouptitle [{lightGradient}border-color:{defaultBorder};] .cke_menubutton_icon [background-color:{menubuttonIcon};] .cke_menubutton:hover .cke_menubutton_icon, .cke_menubutton:focus .cke_menubutton_icon, .cke_menubutton:active .cke_menubutton_icon [background-color:{menubuttonIconHover};] .cke_menuseparator [background-color:{menubuttonIcon};] a:hover.cke_colorbox, a:focus.cke_colorbox, a:active.cke_colorbox [border-color:{defaultBorder};] a:hover.cke_colorauto, a:hover.cke_colormore, a:focus.cke_colorauto, a:focus.cke_colormore, a:active.cke_colorauto, a:active.cke_colormore [background-color:{ckeColorauto};border-color:{defaultBorder};] ")};
return function(g,e){var a=g.uiColor,a={id:"."+g.id,defaultBorder:b(a,-0.1),defaultGradient:c(b(a,0.9),a),lightGradient:c(b(a,1),b(a,0.7)),mediumGradient:c(b(a,0.8),b(a,0.5)),ckeButtonOn:c(b(a,0.6),b(a,0.7)),ckeResizer:b(a,-0.4),ckeToolbarSeparator:b(a,0.5),ckeColorauto:b(a,0.8),dialogBody:b(a,0.7),dialogTabSelected:c("#FFFFFF","#FFFFFF"),dialogTabSelectedBorder:"#FFF",elementsPathColor:b(a,-0.6),elementsPathBg:a,menubuttonIcon:b(a,0.5),menubuttonIconHover:b(a,0.3)};return f[e].output(a).replace(/\[/g,
"{").replace(/\]/g,"}")}}();CKEDITOR.plugins.add("dialogui",{onLoad:function(){var h=function(b){this._||(this._={});this._["default"]=this._.initValue=b["default"]||"";this._.required=b.required||!1;for(var a=[this._],d=1;d<arguments.length;d++)a.push(arguments[d]);a.push(!0);CKEDITOR.tools.extend.apply(CKEDITOR.tools,a);return this._},v={build:function(b,a,d){return new CKEDITOR.ui.dialog.textInput(b,a,d)}},n={build:function(b,a,d){return new CKEDITOR.ui.dialog[a.type](b,a,d)}},q={isChanged:function(){return this.getValue()!=
this.getInitValue()},reset:function(b){this.setValue(this.getInitValue(),b)},setInitValue:function(){this._.initValue=this.getValue()},resetInitValue:function(){this._.initValue=this._["default"]},getInitValue:function(){return this._.initValue}},r=CKEDITOR.tools.extend({},CKEDITOR.ui.dialog.uiElement.prototype.eventProcessors,{onChange:function(b,a){this._.domOnChangeRegistered||(b.on("load",function(){this.getInputElement().on("change",function(){b.parts.dialog.isVisible()&&this.fire("change",{value:this.getValue()})},
this)},this),this._.domOnChangeRegistered=!0);this.on("change",a)}},!0),x=/^on([A-Z]\w+)/,t=function(b){for(var a in b)(x.test(a)||"title"==a||"type"==a)&&delete b[a];return b},w=function(b){b=b.data.getKeystroke();b==CKEDITOR.SHIFT+CKEDITOR.ALT+36?this.setDirectionMarker("ltr"):b==CKEDITOR.SHIFT+CKEDITOR.ALT+35&&this.setDirectionMarker("rtl")};CKEDITOR.tools.extend(CKEDITOR.ui.dialog,{labeledElement:function(b,a,d,f){if(!(4>arguments.length)){var c=h.call(this,a);c.labelId=CKEDITOR.tools.getNextId()+
"_label";this._.children=[];var e={role:a.role||"presentation"};a.includeLabel&&(e["aria-labelledby"]=c.labelId);CKEDITOR.ui.dialog.uiElement.call(this,b,a,d,"div",null,e,function(){var e=[],g=a.required?" cke_required":"";"horizontal"!=a.labelLayout?e.push('\x3clabel class\x3d"cke_dialog_ui_labeled_label'+g+'" ',' id\x3d"'+c.labelId+'"',c.inputId?' for\x3d"'+c.inputId+'"':"",(a.labelStyle?' style\x3d"'+a.labelStyle+'"':"")+"\x3e",a.label,"\x3c/label\x3e",'\x3cdiv class\x3d"cke_dialog_ui_labeled_content"',
a.controlStyle?' style\x3d"'+a.controlStyle+'"':"",' role\x3d"presentation"\x3e',f.call(this,b,a),"\x3c/div\x3e"):(g={type:"hbox",widths:a.widths,padding:0,children:[{type:"html",html:'\x3clabel class\x3d"cke_dialog_ui_labeled_label'+g+'" id\x3d"'+c.labelId+'" for\x3d"'+c.inputId+'"'+(a.labelStyle?' style\x3d"'+a.labelStyle+'"':"")+"\x3e"+CKEDITOR.tools.htmlEncode(a.label)+"\x3c/label\x3e"},{type:"html",html:'\x3cspan class\x3d"cke_dialog_ui_labeled_content"'+(a.controlStyle?' style\x3d"'+a.controlStyle+
'"':"")+"\x3e"+f.call(this,b,a)+"\x3c/span\x3e"}]},CKEDITOR.dialog._.uiElementBuilders.hbox.build(b,g,e));return e.join("")})}},textInput:function(b,a,d){if(!(3>arguments.length)){h.call(this,a);var f=this._.inputId=CKEDITOR.tools.getNextId()+"_textInput",c={"class":"cke_dialog_ui_input_"+a.type,id:f,type:a.type};a.validate&&(this.validate=a.validate);a.maxLength&&(c.maxlength=a.maxLength);a.size&&(c.size=a.size);a.inputStyle&&(c.style=a.inputStyle);var e=this,m=!1;b.on("load",function(){e.getInputElement().on("keydown",
function(a){13==a.data.getKeystroke()&&(m=!0)});e.getInputElement().on("keyup",function(a){13==a.data.getKeystroke()&&m&&(b.getButton("ok")&&setTimeout(function(){b.getButton("ok").click()},0),m=!1);e.bidi&&w.call(e,a)},null,null,1E3)});CKEDITOR.ui.dialog.labeledElement.call(this,b,a,d,function(){var b=['\x3cdiv class\x3d"cke_dialog_ui_input_',a.type,'" role\x3d"presentation"'];a.width&&b.push('style\x3d"width:'+a.width+'" ');b.push("\x3e\x3cinput ");c["aria-labelledby"]=this._.labelId;this._.required&&
(c["aria-required"]=this._.required);for(var e in c)b.push(e+'\x3d"'+c[e]+'" ');b.push(" /\x3e\x3c/div\x3e");return b.join("")})}},textarea:function(b,a,d){if(!(3>arguments.length)){h.call(this,a);var f=this,c=this._.inputId=CKEDITOR.tools.getNextId()+"_textarea",e={};a.validate&&(this.validate=a.validate);e.rows=a.rows||5;e.cols=a.cols||20;e["class"]="cke_dialog_ui_input_textarea "+(a["class"]||"");"undefined"!=typeof a.inputStyle&&(e.style=a.inputStyle);a.dir&&(e.dir=a.dir);if(f.bidi)b.on("load",
function(){f.getInputElement().on("keyup",w)},f);CKEDITOR.ui.dialog.labeledElement.call(this,b,a,d,function(){e["aria-labelledby"]=this._.labelId;this._.required&&(e["aria-required"]=this._.required);var a=['\x3cdiv class\x3d"cke_dialog_ui_input_textarea" role\x3d"presentation"\x3e\x3ctextarea id\x3d"',c,'" '],b;for(b in e)a.push(b+'\x3d"'+CKEDITOR.tools.htmlEncode(e[b])+'" ');a.push("\x3e",CKEDITOR.tools.htmlEncode(f._["default"]),"\x3c/textarea\x3e\x3c/div\x3e");return a.join("")})}},checkbox:function(b,
a,d){if(!(3>arguments.length)){var f=h.call(this,a,{"default":!!a["default"]});a.validate&&(this.validate=a.validate);CKEDITOR.ui.dialog.uiElement.call(this,b,a,d,"span",null,null,function(){var c=CKEDITOR.tools.extend({},a,{id:a.id?a.id+"_checkbox":CKEDITOR.tools.getNextId()+"_checkbox"},!0),e=[],d=CKEDITOR.tools.getNextId()+"_label",g={"class":"cke_dialog_ui_checkbox_input",type:"checkbox","aria-labelledby":d};t(c);a["default"]&&(g.checked="checked");"undefined"!=typeof c.inputStyle&&(c.style=c.inputStyle);
f.checkbox=new CKEDITOR.ui.dialog.uiElement(b,c,e,"input",null,g);e.push(' \x3clabel id\x3d"',d,'" for\x3d"',g.id,'"'+(a.labelStyle?' style\x3d"'+a.labelStyle+'"':"")+"\x3e",CKEDITOR.tools.htmlEncode(a.label),"\x3c/label\x3e");return e.join("")})}},radio:function(b,a,d){if(!(3>arguments.length)){h.call(this,a);this._["default"]||(this._["default"]=this._.initValue=a.items[0][1]);a.validate&&(this.validate=a.validate);var f=[],c=this;a.role="radiogroup";a.includeLabel=!0;CKEDITOR.ui.dialog.labeledElement.call(this,
b,a,d,function(){for(var e=[],d=[],g=(a.id?a.id:CKEDITOR.tools.getNextId())+"_radio",k=0;k<a.items.length;k++){var l=a.items[k],h=void 0!==l[2]?l[2]:l[0],n=void 0!==l[1]?l[1]:l[0],p=CKEDITOR.tools.getNextId()+"_radio_input",q=p+"_label",p=CKEDITOR.tools.extend({},a,{id:p,title:null,type:null},!0),h=CKEDITOR.tools.extend({},p,{title:h},!0),r={type:"radio","class":"cke_dialog_ui_radio_input",name:g,value:n,"aria-labelledby":q},u=[];c._["default"]==n&&(r.checked="checked");t(p);t(h);"undefined"!=typeof p.inputStyle&&
(p.style=p.inputStyle);p.keyboardFocusable=!0;f.push(new CKEDITOR.ui.dialog.uiElement(b,p,u,"input",null,r));u.push(" ");new CKEDITOR.ui.dialog.uiElement(b,h,u,"label",null,{id:q,"for":r.id},l[0]);e.push(u.join(""))}new CKEDITOR.ui.dialog.hbox(b,f,e,d);return d.join("")});this._.children=f}},button:function(b,a,d){if(arguments.length){"function"==typeof a&&(a=a(b.getParentEditor()));h.call(this,a,{disabled:a.disabled||!1});CKEDITOR.event.implementOn(this);var f=this;b.on("load",function(){var a=this.getElement();
(function(){a.on("click",function(a){f.click();a.data.preventDefault()});a.on("keydown",function(a){a.data.getKeystroke()in{32:1}&&(f.click(),a.data.preventDefault())})})();a.unselectable()},this);var c=CKEDITOR.tools.extend({},a);delete c.style;var e=CKEDITOR.tools.getNextId()+"_label";CKEDITOR.ui.dialog.uiElement.call(this,b,c,d,"a",null,{style:a.style,href:"javascript:void(0)",title:a.label,hidefocus:"true","class":a["class"],role:"button","aria-labelledby":e},'\x3cspan id\x3d"'+e+'" class\x3d"cke_dialog_ui_button"\x3e'+
CKEDITOR.tools.htmlEncode(a.label)+"\x3c/span\x3e")}},select:function(b,a,d){if(!(3>arguments.length)){var f=h.call(this,a);a.validate&&(this.validate=a.validate);f.inputId=CKEDITOR.tools.getNextId()+"_select";CKEDITOR.ui.dialog.labeledElement.call(this,b,a,d,function(){var c=CKEDITOR.tools.extend({},a,{id:a.id?a.id+"_select":CKEDITOR.tools.getNextId()+"_select"},!0),e=[],d=[],g={id:f.inputId,"class":"cke_dialog_ui_input_select","aria-labelledby":this._.labelId};e.push('\x3cdiv class\x3d"cke_dialog_ui_input_',
a.type,'" role\x3d"presentation"');a.width&&e.push('style\x3d"width:'+a.width+'" ');e.push("\x3e");void 0!==a.size&&(g.size=a.size);void 0!==a.multiple&&(g.multiple=a.multiple);t(c);for(var k=0,l;k<a.items.length&&(l=a.items[k]);k++)d.push('\x3coption value\x3d"',CKEDITOR.tools.htmlEncode(void 0!==l[1]?l[1]:l[0]).replace(/"/g,"\x26quot;"),'" /\x3e ',CKEDITOR.tools.htmlEncode(l[0]));"undefined"!=typeof c.inputStyle&&(c.style=c.inputStyle);f.select=new CKEDITOR.ui.dialog.uiElement(b,c,e,"select",null,
g,d.join(""));e.push("\x3c/div\x3e");return e.join("")})}},file:function(b,a,d){if(!(3>arguments.length)){void 0===a["default"]&&(a["default"]="");var f=CKEDITOR.tools.extend(h.call(this,a),{definition:a,buttons:[]});a.validate&&(this.validate=a.validate);b.on("load",function(){CKEDITOR.document.getById(f.frameId).getParent().addClass("cke_dialog_ui_input_file")});CKEDITOR.ui.dialog.labeledElement.call(this,b,a,d,function(){f.frameId=CKEDITOR.tools.getNextId()+"_fileInput";var b=['\x3ciframe frameborder\x3d"0" allowtransparency\x3d"0" class\x3d"cke_dialog_ui_input_file" role\x3d"presentation" id\x3d"',
f.frameId,'" title\x3d"',a.label,'" src\x3d"javascript:void('];b.push(CKEDITOR.env.ie?"(function(){"+encodeURIComponent("document.open();("+CKEDITOR.tools.fixDomain+")();document.close();")+"})()":"0");b.push(')"\x3e\x3c/iframe\x3e');return b.join("")})}},fileButton:function(b,a,d){var f=this;if(!(3>arguments.length)){h.call(this,a);a.validate&&(this.validate=a.validate);var c=CKEDITOR.tools.extend({},a),e=c.onClick;c.className=(c.className?c.className+" ":"")+"cke_dialog_ui_button";c.onClick=function(c){var d=
a["for"];e&&!1===e.call(this,c)||(b.getContentElement(d[0],d[1]).submit(),this.disable())};b.on("load",function(){b.getContentElement(a["for"][0],a["for"][1])._.buttons.push(f)});CKEDITOR.ui.dialog.button.call(this,b,c,d)}},html:function(){var b=/^\s*<[\w:]+\s+([^>]*)?>/,a=/^(\s*<[\w:]+(?:\s+[^>]*)?)((?:.|\r|\n)+)$/,d=/\/$/;return function(f,c,e){if(!(3>arguments.length)){var m=[],g=c.html;"\x3c"!=g.charAt(0)&&(g="\x3cspan\x3e"+g+"\x3c/span\x3e");var k=c.focus;if(k){var l=this.focus;this.focus=function(){("function"==
typeof k?k:l).call(this);this.fire("focus")};c.isFocusable&&(this.isFocusable=this.isFocusable);this.keyboardFocusable=!0}CKEDITOR.ui.dialog.uiElement.call(this,f,c,m,"span",null,null,"");m=m.join("").match(b);g=g.match(a)||["","",""];d.test(g[1])&&(g[1]=g[1].slice(0,-1),g[2]="/"+g[2]);e.push([g[1]," ",m[1]||"",g[2]].join(""))}}}(),fieldset:function(b,a,d,f,c){var e=c.label;this._={children:a};CKEDITOR.ui.dialog.uiElement.call(this,b,c,f,"fieldset",null,null,function(){var a=[];e&&a.push("\x3clegend"+
(c.labelStyle?' style\x3d"'+c.labelStyle+'"':"")+"\x3e"+e+"\x3c/legend\x3e");for(var b=0;b<d.length;b++)a.push(d[b]);return a.join("")})}},!0);CKEDITOR.ui.dialog.html.prototype=new CKEDITOR.ui.dialog.uiElement;CKEDITOR.ui.dialog.labeledElement.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.uiElement,{setLabel:function(b){var a=CKEDITOR.document.getById(this._.labelId);1>a.getChildCount()?(new CKEDITOR.dom.text(b,CKEDITOR.document)).appendTo(a):a.getChild(0).$.nodeValue=b;return this},getLabel:function(){var b=
CKEDITOR.document.getById(this._.labelId);return!b||1>b.getChildCount()?"":b.getChild(0).getText()},eventProcessors:r},!0);CKEDITOR.ui.dialog.button.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.uiElement,{click:function(){return this._.disabled?!1:this.fire("click",{dialog:this._.dialog})},enable:function(){this._.disabled=!1;var b=this.getElement();b&&b.removeClass("cke_disabled")},disable:function(){this._.disabled=!0;this.getElement().addClass("cke_disabled")},isVisible:function(){return this.getElement().getFirst().isVisible()},
isEnabled:function(){return!this._.disabled},eventProcessors:CKEDITOR.tools.extend({},CKEDITOR.ui.dialog.uiElement.prototype.eventProcessors,{onClick:function(b,a){this.on("click",function(){a.apply(this,arguments)})}},!0),accessKeyUp:function(){this.click()},accessKeyDown:function(){this.focus()},keyboardFocusable:!0},!0);CKEDITOR.ui.dialog.textInput.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.labeledElement,{getInputElement:function(){return CKEDITOR.document.getById(this._.inputId)},
focus:function(){var b=this.selectParentTab();setTimeout(function(){var a=b.getInputElement();a&&a.$.focus()},0)},select:function(){var b=this.selectParentTab();setTimeout(function(){var a=b.getInputElement();a&&(a.$.focus(),a.$.select())},0)},accessKeyUp:function(){this.select()},setValue:function(b){if(this.bidi){var a=b&&b.charAt(0);(a="‪"==a?"ltr":"‫"==a?"rtl":null)&&(b=b.slice(1));this.setDirectionMarker(a)}b||(b="");return CKEDITOR.ui.dialog.uiElement.prototype.setValue.apply(this,arguments)},
getValue:function(){var b=CKEDITOR.ui.dialog.uiElement.prototype.getValue.call(this);if(this.bidi&&b){var a=this.getDirectionMarker();a&&(b=("ltr"==a?"‪":"‫")+b)}return b},setDirectionMarker:function(b){var a=this.getInputElement();b?a.setAttributes({dir:b,"data-cke-dir-marker":b}):this.getDirectionMarker()&&a.removeAttributes(["dir","data-cke-dir-marker"])},getDirectionMarker:function(){return this.getInputElement().data("cke-dir-marker")},keyboardFocusable:!0},q,!0);CKEDITOR.ui.dialog.textarea.prototype=
new CKEDITOR.ui.dialog.textInput;CKEDITOR.ui.dialog.select.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.labeledElement,{getInputElement:function(){return this._.select.getElement()},add:function(b,a,d){var f=new CKEDITOR.dom.element("option",this.getDialog().getParentEditor().document),c=this.getInputElement().$;f.$.text=b;f.$.value=void 0===a||null===a?b:a;void 0===d||null===d?CKEDITOR.env.ie?c.add(f.$):c.add(f.$,null):c.add(f.$,d);return this},remove:function(b){this.getInputElement().$.remove(b);
return this},clear:function(){for(var b=this.getInputElement().$;0<b.length;)b.remove(0);return this},keyboardFocusable:!0},q,!0);CKEDITOR.ui.dialog.checkbox.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.uiElement,{getInputElement:function(){return this._.checkbox.getElement()},setValue:function(b,a){this.getInputElement().$.checked=b;!a&&this.fire("change",{value:b})},getValue:function(){return this.getInputElement().$.checked},accessKeyUp:function(){this.setValue(!this.getValue())},eventProcessors:{onChange:function(b,
a){if(!CKEDITOR.env.ie||8<CKEDITOR.env.version)return r.onChange.apply(this,arguments);b.on("load",function(){var a=this._.checkbox.getElement();a.on("propertychange",function(b){b=b.data.$;"checked"==b.propertyName&&this.fire("change",{value:a.$.checked})},this)},this);this.on("change",a);return null}},keyboardFocusable:!0},q,!0);CKEDITOR.ui.dialog.radio.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.uiElement,{setValue:function(b,a){for(var d=this._.children,f,c=0;c<d.length&&(f=d[c]);c++)f.getElement().$.checked=
f.getValue()==b;!a&&this.fire("change",{value:b})},getValue:function(){for(var b=this._.children,a=0;a<b.length;a++)if(b[a].getElement().$.checked)return b[a].getValue();return null},accessKeyUp:function(){var b=this._.children,a;for(a=0;a<b.length;a++)if(b[a].getElement().$.checked){b[a].getElement().focus();return}b[0].getElement().focus()},eventProcessors:{onChange:function(b,a){if(!CKEDITOR.env.ie||8<CKEDITOR.env.version)return r.onChange.apply(this,arguments);b.on("load",function(){for(var a=
this._.children,b=this,c=0;c<a.length;c++)a[c].getElement().on("propertychange",function(a){a=a.data.$;"checked"==a.propertyName&&this.$.checked&&b.fire("change",{value:this.getAttribute("value")})})},this);this.on("change",a);return null}}},q,!0);CKEDITOR.ui.dialog.file.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.labeledElement,q,{getInputElement:function(){var b=CKEDITOR.document.getById(this._.frameId).getFrameDocument();return 0<b.$.forms.length?new CKEDITOR.dom.element(b.$.forms[0].elements[0]):
this.getElement()},submit:function(){this.getInputElement().getParent().$.submit();return this},getAction:function(){return this.getInputElement().getParent().$.action},registerEvents:function(b){var a=/^on([A-Z]\w+)/,d,f=function(a,b,c,d){a.on("formLoaded",function(){a.getInputElement().on(c,d,a)})},c;for(c in b)if(d=c.match(a))this.eventProcessors[c]?this.eventProcessors[c].call(this,this._.dialog,b[c]):f(this,this._.dialog,d[1].toLowerCase(),b[c]);return this},reset:function(){function b(){d.$.open();
var b="";f.size&&(b=f.size-(CKEDITOR.env.ie?7:0));var h=a.frameId+"_input";d.$.write(['\x3chtml dir\x3d"'+g+'" lang\x3d"'+k+'"\x3e\x3chead\x3e\x3ctitle\x3e\x3c/title\x3e\x3c/head\x3e\x3cbody style\x3d"margin: 0; overflow: hidden; background: transparent;"\x3e','\x3cform enctype\x3d"multipart/form-data" method\x3d"POST" dir\x3d"'+g+'" lang\x3d"'+k+'" action\x3d"',CKEDITOR.tools.htmlEncode(f.action),'"\x3e\x3clabel id\x3d"',a.labelId,'" for\x3d"',h,'" style\x3d"display:none"\x3e',CKEDITOR.tools.htmlEncode(f.label),
'\x3c/label\x3e\x3cinput style\x3d"width:100%" id\x3d"',h,'" aria-labelledby\x3d"',a.labelId,'" type\x3d"file" name\x3d"',CKEDITOR.tools.htmlEncode(f.id||"cke_upload"),'" size\x3d"',CKEDITOR.tools.htmlEncode(0<b?b:""),'" /\x3e\x3c/form\x3e\x3c/body\x3e\x3c/html\x3e\x3cscript\x3e',CKEDITOR.env.ie?"("+CKEDITOR.tools.fixDomain+")();":"","window.parent.CKEDITOR.tools.callFunction("+e+");","window.onbeforeunload \x3d function() {window.parent.CKEDITOR.tools.callFunction("+m+")}","\x3c/script\x3e"].join(""));
d.$.close();for(b=0;b<c.length;b++)c[b].enable()}var a=this._,d=CKEDITOR.document.getById(a.frameId).getFrameDocument(),f=a.definition,c=a.buttons,e=this.formLoadedNumber,m=this.formUnloadNumber,g=a.dialog._.editor.lang.dir,k=a.dialog._.editor.langCode;e||(e=this.formLoadedNumber=CKEDITOR.tools.addFunction(function(){this.fire("formLoaded")},this),m=this.formUnloadNumber=CKEDITOR.tools.addFunction(function(){this.getInputElement().clearCustomData()},this),this.getDialog()._.editor.on("destroy",function(){CKEDITOR.tools.removeFunction(e);
CKEDITOR.tools.removeFunction(m)}));CKEDITOR.env.gecko?setTimeout(b,500):b()},getValue:function(){return this.getInputElement().$.value||""},setInitValue:function(){this._.initValue=""},eventProcessors:{onChange:function(b,a){this._.domOnChangeRegistered||(this.on("formLoaded",function(){this.getInputElement().on("change",function(){this.fire("change",{value:this.getValue()})},this)},this),this._.domOnChangeRegistered=!0);this.on("change",a)}},keyboardFocusable:!0},!0);CKEDITOR.ui.dialog.fileButton.prototype=
new CKEDITOR.ui.dialog.button;CKEDITOR.ui.dialog.fieldset.prototype=CKEDITOR.tools.clone(CKEDITOR.ui.dialog.hbox.prototype);CKEDITOR.dialog.addUIElement("text",v);CKEDITOR.dialog.addUIElement("password",v);CKEDITOR.dialog.addUIElement("textarea",n);CKEDITOR.dialog.addUIElement("checkbox",n);CKEDITOR.dialog.addUIElement("radio",n);CKEDITOR.dialog.addUIElement("button",n);CKEDITOR.dialog.addUIElement("select",n);CKEDITOR.dialog.addUIElement("file",n);CKEDITOR.dialog.addUIElement("fileButton",n);CKEDITOR.dialog.addUIElement("html",
n);CKEDITOR.dialog.addUIElement("fieldset",{build:function(b,a,d){for(var f=a.children,c,e=[],h=[],g=0;g<f.length&&(c=f[g]);g++){var k=[];e.push(k);h.push(CKEDITOR.dialog._.uiElementBuilders[c.type].build(b,c,k))}return new CKEDITOR.ui.dialog[a.type](b,h,e,d,a)}})}});CKEDITOR.DIALOG_RESIZE_NONE=0;CKEDITOR.DIALOG_RESIZE_WIDTH=1;CKEDITOR.DIALOG_RESIZE_HEIGHT=2;CKEDITOR.DIALOG_RESIZE_BOTH=3;CKEDITOR.DIALOG_STATE_IDLE=1;CKEDITOR.DIALOG_STATE_BUSY=2;
(function(){function x(){for(var a=this._.tabIdList.length,b=CKEDITOR.tools.indexOf(this._.tabIdList,this._.currentTabId)+a,c=b-1;c>b-a;c--)if(this._.tabs[this._.tabIdList[c%a]][0].$.offsetHeight)return this._.tabIdList[c%a];return null}function A(){for(var a=this._.tabIdList.length,b=CKEDITOR.tools.indexOf(this._.tabIdList,this._.currentTabId),c=b+1;c<b+a;c++)if(this._.tabs[this._.tabIdList[c%a]][0].$.offsetHeight)return this._.tabIdList[c%a];return null}function K(a,b){for(var c=a.$.getElementsByTagName("input"),
d=0,e=c.length;d<e;d++){var f=new CKEDITOR.dom.element(c[d]);"text"==f.getAttribute("type").toLowerCase()&&(b?(f.setAttribute("value",f.getCustomData("fake_value")||""),f.removeCustomData("fake_value")):(f.setCustomData("fake_value",f.getAttribute("value")),f.setAttribute("value","")))}}function T(a,b){var c=this.getInputElement();c&&(a?c.removeAttribute("aria-invalid"):c.setAttribute("aria-invalid",!0));a||(this.select?this.select():this.focus());b&&alert(b);this.fire("validated",{valid:a,msg:b})}
function U(){var a=this.getInputElement();a&&a.removeAttribute("aria-invalid")}function V(a){var b=CKEDITOR.dom.element.createFromHtml(CKEDITOR.addTemplate("dialog",W).output({id:CKEDITOR.tools.getNextNumber(),editorId:a.id,langDir:a.lang.dir,langCode:a.langCode,editorDialogClass:"cke_editor_"+a.name.replace(/\./g,"\\.")+"_dialog",closeTitle:a.lang.common.close,hidpi:CKEDITOR.env.hidpi?"cke_hidpi":""})),c=b.getChild([0,0,0,0,0]),d=c.getChild(0),e=c.getChild(1);a.plugins.clipboard&&CKEDITOR.plugins.clipboard.preventDefaultDropOnElement(c);
!CKEDITOR.env.ie||CKEDITOR.env.quirks||CKEDITOR.env.edge||(a="javascript:void(function(){"+encodeURIComponent("document.open();("+CKEDITOR.tools.fixDomain+")();document.close();")+"}())",CKEDITOR.dom.element.createFromHtml('\x3ciframe frameBorder\x3d"0" class\x3d"cke_iframe_shim" src\x3d"'+a+'" tabIndex\x3d"-1"\x3e\x3c/iframe\x3e').appendTo(c.getParent()));d.unselectable();e.unselectable();return{element:b,parts:{dialog:b.getChild(0),title:d,close:e,tabs:c.getChild(2),contents:c.getChild([3,0,0,0]),
footer:c.getChild([3,0,1,0])}}}function L(a,b,c){this.element=b;this.focusIndex=c;this.tabIndex=0;this.isFocusable=function(){return!b.getAttribute("disabled")&&b.isVisible()};this.focus=function(){a._.currentFocusIndex=this.focusIndex;this.element.focus()};b.on("keydown",function(a){a.data.getKeystroke()in{32:1,13:1}&&this.fire("click")});b.on("focus",function(){this.fire("mouseover")});b.on("blur",function(){this.fire("mouseout")})}function X(a){function b(){a.layout()}var c=CKEDITOR.document.getWindow();
c.on("resize",b);a.on("hide",function(){c.removeListener("resize",b)})}function M(a,b){this._={dialog:a};CKEDITOR.tools.extend(this,b)}function Y(a){function b(b){var c=a.getSize(),k=CKEDITOR.document.getWindow().getViewPaneSize(),q=b.data.$.screenX,n=b.data.$.screenY,r=q-d.x,l=n-d.y;d={x:q,y:n};e.x+=r;e.y+=l;a.move(e.x+h[3]<g?-h[3]:e.x-h[1]>k.width-c.width-g?k.width-c.width+("rtl"==f.lang.dir?0:h[1]):e.x,e.y+h[0]<g?-h[0]:e.y-h[2]>k.height-c.height-g?k.height-c.height+h[2]:e.y,1);b.data.preventDefault()}
function c(){CKEDITOR.document.removeListener("mousemove",b);CKEDITOR.document.removeListener("mouseup",c);if(CKEDITOR.env.ie6Compat){var a=u.getChild(0).getFrameDocument();a.removeListener("mousemove",b);a.removeListener("mouseup",c)}}var d=null,e=null,f=a.getParentEditor(),g=f.config.dialog_magnetDistance,h=CKEDITOR.skin.margins||[0,0,0,0];"undefined"==typeof g&&(g=20);a.parts.title.on("mousedown",function(g){d={x:g.data.$.screenX,y:g.data.$.screenY};CKEDITOR.document.on("mousemove",b);CKEDITOR.document.on("mouseup",
c);e=a.getPosition();if(CKEDITOR.env.ie6Compat){var f=u.getChild(0).getFrameDocument();f.on("mousemove",b);f.on("mouseup",c)}g.data.preventDefault()},a)}function Z(a){function b(b){var c="rtl"==f.lang.dir,n=k.width,q=k.height,G=n+(b.data.$.screenX-m.x)*(c?-1:1)*(a._.moved?1:2),H=q+(b.data.$.screenY-m.y)*(a._.moved?1:2),B=a._.element.getFirst(),B=c&&B.getComputedStyle("right"),C=a.getPosition();C.y+H>p.height&&(H=p.height-C.y);(c?B:C.x)+G>p.width&&(G=p.width-(c?B:C.x));if(e==CKEDITOR.DIALOG_RESIZE_WIDTH||
e==CKEDITOR.DIALOG_RESIZE_BOTH)n=Math.max(d.minWidth||0,G-g);if(e==CKEDITOR.DIALOG_RESIZE_HEIGHT||e==CKEDITOR.DIALOG_RESIZE_BOTH)q=Math.max(d.minHeight||0,H-h);a.resize(n,q);a._.moved||a.layout();b.data.preventDefault()}function c(){CKEDITOR.document.removeListener("mouseup",c);CKEDITOR.document.removeListener("mousemove",b);q&&(q.remove(),q=null);if(CKEDITOR.env.ie6Compat){var a=u.getChild(0).getFrameDocument();a.removeListener("mouseup",c);a.removeListener("mousemove",b)}}var d=a.definition,e=d.resizable;
if(e!=CKEDITOR.DIALOG_RESIZE_NONE){var f=a.getParentEditor(),g,h,p,m,k,q,n=CKEDITOR.tools.addFunction(function(e){k=a.getSize();var d=a.parts.contents;d.$.getElementsByTagName("iframe").length&&(q=CKEDITOR.dom.element.createFromHtml('\x3cdiv class\x3d"cke_dialog_resize_cover" style\x3d"height: 100%; position: absolute; width: 100%;"\x3e\x3c/div\x3e'),d.append(q));h=k.height-a.parts.contents.getSize("height",!(CKEDITOR.env.gecko||CKEDITOR.env.ie&&CKEDITOR.env.quirks));g=k.width-a.parts.contents.getSize("width",
1);m={x:e.screenX,y:e.screenY};p=CKEDITOR.document.getWindow().getViewPaneSize();CKEDITOR.document.on("mousemove",b);CKEDITOR.document.on("mouseup",c);CKEDITOR.env.ie6Compat&&(d=u.getChild(0).getFrameDocument(),d.on("mousemove",b),d.on("mouseup",c));e.preventDefault&&e.preventDefault()});a.on("load",function(){var b="";e==CKEDITOR.DIALOG_RESIZE_WIDTH?b=" cke_resizer_horizontal":e==CKEDITOR.DIALOG_RESIZE_HEIGHT&&(b=" cke_resizer_vertical");b=CKEDITOR.dom.element.createFromHtml('\x3cdiv class\x3d"cke_resizer'+
b+" cke_resizer_"+f.lang.dir+'" title\x3d"'+CKEDITOR.tools.htmlEncode(f.lang.common.resize)+'" onmousedown\x3d"CKEDITOR.tools.callFunction('+n+', event )"\x3e'+("ltr"==f.lang.dir?"◢":"◣")+"\x3c/div\x3e");a.parts.footer.append(b,1)});f.on("destroy",function(){CKEDITOR.tools.removeFunction(n)})}}function I(a){a.data.preventDefault(1)}function N(a){var b=CKEDITOR.document.getWindow(),c=a.config,d=c.dialog_backgroundCoverColor||"white",e=c.dialog_backgroundCoverOpacity,f=c.baseFloatZIndex,c=CKEDITOR.tools.genKey(d,
e,f),g=z[c];g?g.show():(f=['\x3cdiv tabIndex\x3d"-1" style\x3d"position: ',CKEDITOR.env.ie6Compat?"absolute":"fixed","; z-index: ",f,"; top: 0px; left: 0px; ",CKEDITOR.env.ie6Compat?"":"background-color: "+d,'" class\x3d"cke_dialog_background_cover"\x3e'],CKEDITOR.env.ie6Compat&&(d="\x3chtml\x3e\x3cbody style\x3d\\'background-color:"+d+";\\'\x3e\x3c/body\x3e\x3c/html\x3e",f.push('\x3ciframe hidefocus\x3d"true" frameborder\x3d"0" id\x3d"cke_dialog_background_iframe" src\x3d"javascript:'),f.push("void((function(){"+
encodeURIComponent("document.open();("+CKEDITOR.tools.fixDomain+")();document.write( '"+d+"' );document.close();")+"})())"),f.push('" style\x3d"position:absolute;left:0;top:0;width:100%;height: 100%;filter: progid:DXImageTransform.Microsoft.Alpha(opacity\x3d0)"\x3e\x3c/iframe\x3e')),f.push("\x3c/div\x3e"),g=CKEDITOR.dom.element.createFromHtml(f.join("")),g.setOpacity(void 0!==e?e:.5),g.on("keydown",I),g.on("keypress",I),g.on("keyup",I),g.appendTo(CKEDITOR.document.getBody()),z[c]=g);a.focusManager.add(g);
u=g;a=function(){var a=b.getViewPaneSize();g.setStyles({width:a.width+"px",height:a.height+"px"})};var h=function(){var a=b.getScrollPosition(),c=CKEDITOR.dialog._.currentTop;g.setStyles({left:a.x+"px",top:a.y+"px"});if(c){do a=c.getPosition(),c.move(a.x,a.y);while(c=c._.parentDialog)}};J=a;b.on("resize",a);a();CKEDITOR.env.mac&&CKEDITOR.env.webkit||g.focus();if(CKEDITOR.env.ie6Compat){var p=function(){h();arguments.callee.prevScrollHandler.apply(this,arguments)};b.$.setTimeout(function(){p.prevScrollHandler=
window.onscroll||function(){};window.onscroll=p},0);h()}}function O(a){u&&(a.focusManager.remove(u),a=CKEDITOR.document.getWindow(),u.hide(),a.removeListener("resize",J),CKEDITOR.env.ie6Compat&&a.$.setTimeout(function(){window.onscroll=window.onscroll&&window.onscroll.prevScrollHandler||null},0),J=null)}var v=CKEDITOR.tools.cssLength,W='\x3cdiv class\x3d"cke_reset_all {editorId} {editorDialogClass} {hidpi}" dir\x3d"{langDir}" lang\x3d"{langCode}" role\x3d"dialog" aria-labelledby\x3d"cke_dialog_title_{id}"\x3e\x3ctable class\x3d"cke_dialog '+
CKEDITOR.env.cssClass+' cke_{langDir}" style\x3d"position:absolute" role\x3d"presentation"\x3e\x3ctr\x3e\x3ctd role\x3d"presentation"\x3e\x3cdiv class\x3d"cke_dialog_body" role\x3d"presentation"\x3e\x3cdiv id\x3d"cke_dialog_title_{id}" class\x3d"cke_dialog_title" role\x3d"presentation"\x3e\x3c/div\x3e\x3ca id\x3d"cke_dialog_close_button_{id}" class\x3d"cke_dialog_close_button" href\x3d"javascript:void(0)" title\x3d"{closeTitle}" role\x3d"button"\x3e\x3cspan class\x3d"cke_label"\x3eX\x3c/span\x3e\x3c/a\x3e\x3cdiv id\x3d"cke_dialog_tabs_{id}" class\x3d"cke_dialog_tabs" role\x3d"tablist"\x3e\x3c/div\x3e\x3ctable class\x3d"cke_dialog_contents" role\x3d"presentation"\x3e\x3ctr\x3e\x3ctd id\x3d"cke_dialog_contents_{id}" class\x3d"cke_dialog_contents_body" role\x3d"presentation"\x3e\x3c/td\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd id\x3d"cke_dialog_footer_{id}" class\x3d"cke_dialog_footer" role\x3d"presentation"\x3e\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3c/div\x3e\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3c/div\x3e';
CKEDITOR.dialog=function(a,b){function c(){var a=l._.focusList;a.sort(function(a,b){return a.tabIndex!=b.tabIndex?b.tabIndex-a.tabIndex:a.focusIndex-b.focusIndex});for(var b=a.length,c=0;c<b;c++)a[c].focusIndex=c}function d(a){var b=l._.focusList;a=a||0;if(!(1>b.length)){var c=l._.currentFocusIndex;l._.tabBarMode&&0>a&&(c=0);try{b[c].getInputElement().$.blur()}catch(e){}var d=c,g=1<l._.pageCount;do{d+=a;if(g&&!l._.tabBarMode&&(d==b.length||-1==d)){l._.tabBarMode=!0;l._.tabs[l._.currentTabId][0].focus();
l._.currentFocusIndex=-1;return}d=(d+b.length)%b.length;if(d==c)break}while(a&&!b[d].isFocusable());b[d].focus();"text"==b[d].type&&b[d].select()}}function e(b){if(l==CKEDITOR.dialog._.currentTop){var c=b.data.getKeystroke(),e="rtl"==a.lang.dir,g=[37,38,39,40];q=n=0;if(9==c||c==CKEDITOR.SHIFT+9)d(c==CKEDITOR.SHIFT+9?-1:1),q=1;else if(c==CKEDITOR.ALT+121&&!l._.tabBarMode&&1<l.getPageCount())l._.tabBarMode=!0,l._.tabs[l._.currentTabId][0].focus(),l._.currentFocusIndex=-1,q=1;else if(-1!=CKEDITOR.tools.indexOf(g,
c)&&l._.tabBarMode)c=-1!=CKEDITOR.tools.indexOf([e?39:37,38],c)?x.call(l):A.call(l),l.selectPage(c),l._.tabs[c][0].focus(),q=1;else if(13!=c&&32!=c||!l._.tabBarMode)if(13==c)c=b.data.getTarget(),c.is("a","button","select","textarea")||c.is("input")&&"button"==c.$.type||((c=this.getButton("ok"))&&CKEDITOR.tools.setTimeout(c.click,0,c),q=1),n=1;else if(27==c)(c=this.getButton("cancel"))?CKEDITOR.tools.setTimeout(c.click,0,c):!1!==this.fire("cancel",{hide:!0}).hide&&this.hide(),n=1;else return;else this.selectPage(this._.currentTabId),
this._.tabBarMode=!1,this._.currentFocusIndex=-1,d(1),q=1;f(b)}}function f(a){q?a.data.preventDefault(1):n&&a.data.stopPropagation()}var g=CKEDITOR.dialog._.dialogDefinitions[b],h=CKEDITOR.tools.clone(aa),p=a.config.dialog_buttonsOrder||"OS",m=a.lang.dir,k={},q,n;("OS"==p&&CKEDITOR.env.mac||"rtl"==p&&"ltr"==m||"ltr"==p&&"rtl"==m)&&h.buttons.reverse();g=CKEDITOR.tools.extend(g(a),h);g=CKEDITOR.tools.clone(g);g=new P(this,g);h=V(a);this._={editor:a,element:h.element,name:b,contentSize:{width:0,height:0},
size:{width:0,height:0},contents:{},buttons:{},accessKeyMap:{},tabs:{},tabIdList:[],currentTabId:null,currentTabIndex:null,pageCount:0,lastTab:null,tabBarMode:!1,focusList:[],currentFocusIndex:0,hasFocus:!1};this.parts=h.parts;CKEDITOR.tools.setTimeout(function(){a.fire("ariaWidget",this.parts.contents)},0,this);h={position:CKEDITOR.env.ie6Compat?"absolute":"fixed",top:0,visibility:"hidden"};h["rtl"==m?"right":"left"]=0;this.parts.dialog.setStyles(h);CKEDITOR.event.call(this);this.definition=g=CKEDITOR.fire("dialogDefinition",
{name:b,definition:g},a).definition;if(!("removeDialogTabs"in a._)&&a.config.removeDialogTabs){h=a.config.removeDialogTabs.split(";");for(m=0;m<h.length;m++)if(p=h[m].split(":"),2==p.length){var r=p[0];k[r]||(k[r]=[]);k[r].push(p[1])}a._.removeDialogTabs=k}if(a._.removeDialogTabs&&(k=a._.removeDialogTabs[b]))for(m=0;m<k.length;m++)g.removeContents(k[m]);if(g.onLoad)this.on("load",g.onLoad);if(g.onShow)this.on("show",g.onShow);if(g.onHide)this.on("hide",g.onHide);if(g.onOk)this.on("ok",function(b){a.fire("saveSnapshot");
setTimeout(function(){a.fire("saveSnapshot")},0);!1===g.onOk.call(this,b)&&(b.data.hide=!1)});this.state=CKEDITOR.DIALOG_STATE_IDLE;if(g.onCancel)this.on("cancel",function(a){!1===g.onCancel.call(this,a)&&(a.data.hide=!1)});var l=this,t=function(a){var b=l._.contents,c=!1,d;for(d in b)for(var e in b[d])if(c=a.call(this,b[d][e]))return};this.on("ok",function(a){t(function(b){if(b.validate){var c=b.validate(this),d="string"==typeof c||!1===c;d&&(a.data.hide=!1,a.stop());T.call(b,!d,"string"==typeof c?
c:void 0);return d}})},this,null,0);this.on("cancel",function(b){t(function(c){if(c.isChanged())return a.config.dialog_noConfirmCancel||confirm(a.lang.common.confirmCancel)||(b.data.hide=!1),!0})},this,null,0);this.parts.close.on("click",function(a){!1!==this.fire("cancel",{hide:!0}).hide&&this.hide();a.data.preventDefault()},this);this.changeFocus=d;var y=this._.element;a.focusManager.add(y,1);this.on("show",function(){y.on("keydown",e,this);if(CKEDITOR.env.gecko)y.on("keypress",f,this)});this.on("hide",
function(){y.removeListener("keydown",e);CKEDITOR.env.gecko&&y.removeListener("keypress",f);t(function(a){U.apply(a)})});this.on("iframeAdded",function(a){(new CKEDITOR.dom.document(a.data.iframe.$.contentWindow.document)).on("keydown",e,this,null,0)});this.on("show",function(){c();var b=1<l._.pageCount;a.config.dialog_startupFocusTab&&b?(l._.tabBarMode=!0,l._.tabs[l._.currentTabId][0].focus(),l._.currentFocusIndex=-1):this._.hasFocus||(this._.currentFocusIndex=b?-1:this._.focusList.length-1,g.onFocus?
(b=g.onFocus.call(this))&&b.focus():d(1))},this,null,4294967295);if(CKEDITOR.env.ie6Compat)this.on("load",function(){var a=this.getElement(),b=a.getFirst();b.remove();b.appendTo(a)},this);Y(this);Z(this);(new CKEDITOR.dom.text(g.title,CKEDITOR.document)).appendTo(this.parts.title);for(m=0;m<g.contents.length;m++)(k=g.contents[m])&&this.addPage(k);this.parts.tabs.on("click",function(a){var b=a.data.getTarget();b.hasClass("cke_dialog_tab")&&(b=b.$.id,this.selectPage(b.substring(4,b.lastIndexOf("_"))),
this._.tabBarMode&&(this._.tabBarMode=!1,this._.currentFocusIndex=-1,d(1)),a.data.preventDefault())},this);m=[];k=CKEDITOR.dialog._.uiElementBuilders.hbox.build(this,{type:"hbox",className:"cke_dialog_footer_buttons",widths:[],children:g.buttons},m).getChild();this.parts.footer.setHtml(m.join(""));for(m=0;m<k.length;m++)this._.buttons[k[m].id]=k[m]};CKEDITOR.dialog.prototype={destroy:function(){this.hide();this._.element.remove()},resize:function(){return function(a,b){this._.contentSize&&this._.contentSize.width==
a&&this._.contentSize.height==b||(CKEDITOR.dialog.fire("resize",{dialog:this,width:a,height:b},this._.editor),this.fire("resize",{width:a,height:b},this._.editor),this.parts.contents.setStyles({width:a+"px",height:b+"px"}),"rtl"==this._.editor.lang.dir&&this._.position&&(this._.position.x=CKEDITOR.document.getWindow().getViewPaneSize().width-this._.contentSize.width-parseInt(this._.element.getFirst().getStyle("right"),10)),this._.contentSize={width:a,height:b})}}(),getSize:function(){var a=this._.element.getFirst();
return{width:a.$.offsetWidth||0,height:a.$.offsetHeight||0}},move:function(a,b,c){var d=this._.element.getFirst(),e="rtl"==this._.editor.lang.dir,f="fixed"==d.getComputedStyle("position");CKEDITOR.env.ie&&d.setStyle("zoom","100%");f&&this._.position&&this._.position.x==a&&this._.position.y==b||(this._.position={x:a,y:b},f||(f=CKEDITOR.document.getWindow().getScrollPosition(),a+=f.x,b+=f.y),e&&(f=this.getSize(),a=CKEDITOR.document.getWindow().getViewPaneSize().width-f.width-a),b={top:(0<b?b:0)+"px"},
b[e?"right":"left"]=(0<a?a:0)+"px",d.setStyles(b),c&&(this._.moved=1))},getPosition:function(){return CKEDITOR.tools.extend({},this._.position)},show:function(){var a=this._.element,b=this.definition;a.getParent()&&a.getParent().equals(CKEDITOR.document.getBody())?a.setStyle("display","block"):a.appendTo(CKEDITOR.document.getBody());this.resize(this._.contentSize&&this._.contentSize.width||b.width||b.minWidth,this._.contentSize&&this._.contentSize.height||b.height||b.minHeight);this.reset();this.selectPage(this.definition.contents[0].id);
null===CKEDITOR.dialog._.currentZIndex&&(CKEDITOR.dialog._.currentZIndex=this._.editor.config.baseFloatZIndex);this._.element.getFirst().setStyle("z-index",CKEDITOR.dialog._.currentZIndex+=10);null===CKEDITOR.dialog._.currentTop?(CKEDITOR.dialog._.currentTop=this,this._.parentDialog=null,N(this._.editor)):(this._.parentDialog=CKEDITOR.dialog._.currentTop,this._.parentDialog.getElement().getFirst().$.style.zIndex-=Math.floor(this._.editor.config.baseFloatZIndex/2),CKEDITOR.dialog._.currentTop=this);
a.on("keydown",Q);a.on("keyup",R);this._.hasFocus=!1;for(var c in b.contents)if(b.contents[c]){var a=b.contents[c],d=this._.tabs[a.id],e=a.requiredContent,f=0;if(d){for(var g in this._.contents[a.id]){var h=this._.contents[a.id][g];"hbox"!=h.type&&"vbox"!=h.type&&h.getInputElement()&&(h.requiredContent&&!this._.editor.activeFilter.check(h.requiredContent)?h.disable():(h.enable(),f++))}!f||e&&!this._.editor.activeFilter.check(e)?d[0].addClass("cke_dialog_tab_disabled"):d[0].removeClass("cke_dialog_tab_disabled")}}CKEDITOR.tools.setTimeout(function(){this.layout();
X(this);this.parts.dialog.setStyle("visibility","");this.fireOnce("load",{});CKEDITOR.ui.fire("ready",this);this.fire("show",{});this._.editor.fire("dialogShow",this);this._.parentDialog||this._.editor.focusManager.lock();this.foreach(function(a){a.setInitValue&&a.setInitValue()})},100,this)},layout:function(){var a=this.parts.dialog,b=this.getSize(),c=CKEDITOR.document.getWindow().getViewPaneSize(),d=(c.width-b.width)/2,e=(c.height-b.height)/2;CKEDITOR.env.ie6Compat||(b.height+(0<e?e:0)>c.height||
b.width+(0<d?d:0)>c.width?a.setStyle("position","absolute"):a.setStyle("position","fixed"));this.move(this._.moved?this._.position.x:d,this._.moved?this._.position.y:e)},foreach:function(a){for(var b in this._.contents)for(var c in this._.contents[b])a.call(this,this._.contents[b][c]);return this},reset:function(){var a=function(a){a.reset&&a.reset(1)};return function(){this.foreach(a);return this}}(),setupContent:function(){var a=arguments;this.foreach(function(b){b.setup&&b.setup.apply(b,a)})},
commitContent:function(){var a=arguments;this.foreach(function(b){CKEDITOR.env.ie&&this._.currentFocusIndex==b.focusIndex&&b.getInputElement().$.blur();b.commit&&b.commit.apply(b,a)})},hide:function(){if(this.parts.dialog.isVisible()){this.fire("hide",{});this._.editor.fire("dialogHide",this);this.selectPage(this._.tabIdList[0]);var a=this._.element;a.setStyle("display","none");this.parts.dialog.setStyle("visibility","hidden");for(ba(this);CKEDITOR.dialog._.currentTop!=this;)CKEDITOR.dialog._.currentTop.hide();
if(this._.parentDialog){var b=this._.parentDialog.getElement().getFirst();b.setStyle("z-index",parseInt(b.$.style.zIndex,10)+Math.floor(this._.editor.config.baseFloatZIndex/2))}else O(this._.editor);if(CKEDITOR.dialog._.currentTop=this._.parentDialog)CKEDITOR.dialog._.currentZIndex-=10;else{CKEDITOR.dialog._.currentZIndex=null;a.removeListener("keydown",Q);a.removeListener("keyup",R);var c=this._.editor;c.focus();setTimeout(function(){c.focusManager.unlock();CKEDITOR.env.iOS&&c.window.focus()},0)}delete this._.parentDialog;
this.foreach(function(a){a.resetInitValue&&a.resetInitValue()});this.setState(CKEDITOR.DIALOG_STATE_IDLE)}},addPage:function(a){if(!a.requiredContent||this._.editor.filter.check(a.requiredContent)){for(var b=[],c=a.label?' title\x3d"'+CKEDITOR.tools.htmlEncode(a.label)+'"':"",d=CKEDITOR.dialog._.uiElementBuilders.vbox.build(this,{type:"vbox",className:"cke_dialog_page_contents",children:a.elements,expand:!!a.expand,padding:a.padding,style:a.style||"width: 100%;"},b),e=this._.contents[a.id]={},f=d.getChild(),
g=0;d=f.shift();)d.notAllowed||"hbox"==d.type||"vbox"==d.type||g++,e[d.id]=d,"function"==typeof d.getChild&&f.push.apply(f,d.getChild());g||(a.hidden=!0);b=CKEDITOR.dom.element.createFromHtml(b.join(""));b.setAttribute("role","tabpanel");d=CKEDITOR.env;e="cke_"+a.id+"_"+CKEDITOR.tools.getNextNumber();c=CKEDITOR.dom.element.createFromHtml(['\x3ca class\x3d"cke_dialog_tab"',0<this._.pageCount?" cke_last":"cke_first",c,a.hidden?' style\x3d"display:none"':"",' id\x3d"',e,'"',d.gecko&&!d.hc?"":' href\x3d"javascript:void(0)"',
' tabIndex\x3d"-1" hidefocus\x3d"true" role\x3d"tab"\x3e',a.label,"\x3c/a\x3e"].join(""));b.setAttribute("aria-labelledby",e);this._.tabs[a.id]=[c,b];this._.tabIdList.push(a.id);!a.hidden&&this._.pageCount++;this._.lastTab=c;this.updateStyle();b.setAttribute("name",a.id);b.appendTo(this.parts.contents);c.unselectable();this.parts.tabs.append(c);a.accessKey&&(S(this,this,"CTRL+"+a.accessKey,ca,da),this._.accessKeyMap["CTRL+"+a.accessKey]=a.id)}},selectPage:function(a){if(this._.currentTabId!=a&&!this._.tabs[a][0].hasClass("cke_dialog_tab_disabled")&&
!1!==this.fire("selectPage",{page:a,currentPage:this._.currentTabId})){for(var b in this._.tabs){var c=this._.tabs[b][0],d=this._.tabs[b][1];b!=a&&(c.removeClass("cke_dialog_tab_selected"),d.hide());d.setAttribute("aria-hidden",b!=a)}var e=this._.tabs[a];e[0].addClass("cke_dialog_tab_selected");CKEDITOR.env.ie6Compat||CKEDITOR.env.ie7Compat?(K(e[1]),e[1].show(),setTimeout(function(){K(e[1],1)},0)):e[1].show();this._.currentTabId=a;this._.currentTabIndex=CKEDITOR.tools.indexOf(this._.tabIdList,a)}},
updateStyle:function(){this.parts.dialog[(1===this._.pageCount?"add":"remove")+"Class"]("cke_single_page")},hidePage:function(a){var b=this._.tabs[a]&&this._.tabs[a][0];b&&1!=this._.pageCount&&b.isVisible()&&(a==this._.currentTabId&&this.selectPage(x.call(this)),b.hide(),this._.pageCount--,this.updateStyle())},showPage:function(a){if(a=this._.tabs[a]&&this._.tabs[a][0])a.show(),this._.pageCount++,this.updateStyle()},getElement:function(){return this._.element},getName:function(){return this._.name},
getContentElement:function(a,b){var c=this._.contents[a];return c&&c[b]},getValueOf:function(a,b){return this.getContentElement(a,b).getValue()},setValueOf:function(a,b,c){return this.getContentElement(a,b).setValue(c)},getButton:function(a){return this._.buttons[a]},click:function(a){return this._.buttons[a].click()},disableButton:function(a){return this._.buttons[a].disable()},enableButton:function(a){return this._.buttons[a].enable()},getPageCount:function(){return this._.pageCount},getParentEditor:function(){return this._.editor},
getSelectedElement:function(){return this.getParentEditor().getSelection().getSelectedElement()},addFocusable:function(a,b){if("undefined"==typeof b)b=this._.focusList.length,this._.focusList.push(new L(this,a,b));else{this._.focusList.splice(b,0,new L(this,a,b));for(var c=b+1;c<this._.focusList.length;c++)this._.focusList[c].focusIndex++}},setState:function(a){if(this.state!=a){this.state=a;if(a==CKEDITOR.DIALOG_STATE_BUSY){if(!this.parts.spinner){var b=this.getParentEditor().lang.dir,c={attributes:{"class":"cke_dialog_spinner"},
styles:{"float":"rtl"==b?"right":"left"}};c.styles["margin-"+("rtl"==b?"left":"right")]="8px";this.parts.spinner=CKEDITOR.document.createElement("div",c);this.parts.spinner.setHtml("\x26#8987;");this.parts.spinner.appendTo(this.parts.title,1)}this.parts.spinner.show();this.getButton("ok").disable()}else a==CKEDITOR.DIALOG_STATE_IDLE&&(this.parts.spinner&&this.parts.spinner.hide(),this.getButton("ok").enable());this.fire("state",a)}}};CKEDITOR.tools.extend(CKEDITOR.dialog,{add:function(a,b){this._.dialogDefinitions[a]&&
"function"!=typeof b||(this._.dialogDefinitions[a]=b)},exists:function(a){return!!this._.dialogDefinitions[a]},getCurrent:function(){return CKEDITOR.dialog._.currentTop},isTabEnabled:function(a,b,c){a=a.config.removeDialogTabs;return!(a&&a.match(new RegExp("(?:^|;)"+b+":"+c+"(?:$|;)","i")))},okButton:function(){var a=function(a,c){c=c||{};return CKEDITOR.tools.extend({id:"ok",type:"button",label:a.lang.common.ok,"class":"cke_dialog_ui_button_ok",onClick:function(a){a=a.data.dialog;!1!==a.fire("ok",
{hide:!0}).hide&&a.hide()}},c,!0)};a.type="button";a.override=function(b){return CKEDITOR.tools.extend(function(c){return a(c,b)},{type:"button"},!0)};return a}(),cancelButton:function(){var a=function(a,c){c=c||{};return CKEDITOR.tools.extend({id:"cancel",type:"button",label:a.lang.common.cancel,"class":"cke_dialog_ui_button_cancel",onClick:function(a){a=a.data.dialog;!1!==a.fire("cancel",{hide:!0}).hide&&a.hide()}},c,!0)};a.type="button";a.override=function(b){return CKEDITOR.tools.extend(function(c){return a(c,
b)},{type:"button"},!0)};return a}(),addUIElement:function(a,b){this._.uiElementBuilders[a]=b}});CKEDITOR.dialog._={uiElementBuilders:{},dialogDefinitions:{},currentTop:null,currentZIndex:null};CKEDITOR.event.implementOn(CKEDITOR.dialog);CKEDITOR.event.implementOn(CKEDITOR.dialog.prototype);var aa={resizable:CKEDITOR.DIALOG_RESIZE_BOTH,minWidth:600,minHeight:400,buttons:[CKEDITOR.dialog.okButton,CKEDITOR.dialog.cancelButton]},D=function(a,b,c){for(var d=0,e;e=a[d];d++)if(e.id==b||c&&e[c]&&(e=D(e[c],
b,c)))return e;return null},E=function(a,b,c,d,e){if(c){for(var f=0,g;g=a[f];f++){if(g.id==c)return a.splice(f,0,b),b;if(d&&g[d]&&(g=E(g[d],b,c,d,!0)))return g}if(e)return null}a.push(b);return b},F=function(a,b,c){for(var d=0,e;e=a[d];d++){if(e.id==b)return a.splice(d,1);if(c&&e[c]&&(e=F(e[c],b,c)))return e}return null},P=function(a,b){this.dialog=a;for(var c=b.contents,d=0,e;e=c[d];d++)c[d]=e&&new M(a,e);CKEDITOR.tools.extend(this,b)};P.prototype={getContents:function(a){return D(this.contents,
a)},getButton:function(a){return D(this.buttons,a)},addContents:function(a,b){return E(this.contents,a,b)},addButton:function(a,b){return E(this.buttons,a,b)},removeContents:function(a){F(this.contents,a)},removeButton:function(a){F(this.buttons,a)}};M.prototype={get:function(a){return D(this.elements,a,"children")},add:function(a,b){return E(this.elements,a,b,"children")},remove:function(a){F(this.elements,a,"children")}};var J,z={},u,w={},Q=function(a){var b=a.data.$.ctrlKey||a.data.$.metaKey,c=
a.data.$.altKey,d=a.data.$.shiftKey,e=String.fromCharCode(a.data.$.keyCode);(b=w[(b?"CTRL+":"")+(c?"ALT+":"")+(d?"SHIFT+":"")+e])&&b.length&&(b=b[b.length-1],b.keydown&&b.keydown.call(b.uiElement,b.dialog,b.key),a.data.preventDefault())},R=function(a){var b=a.data.$.ctrlKey||a.data.$.metaKey,c=a.data.$.altKey,d=a.data.$.shiftKey,e=String.fromCharCode(a.data.$.keyCode);(b=w[(b?"CTRL+":"")+(c?"ALT+":"")+(d?"SHIFT+":"")+e])&&b.length&&(b=b[b.length-1],b.keyup&&(b.keyup.call(b.uiElement,b.dialog,b.key),
a.data.preventDefault()))},S=function(a,b,c,d,e){(w[c]||(w[c]=[])).push({uiElement:a,dialog:b,key:c,keyup:e||a.accessKeyUp,keydown:d||a.accessKeyDown})},ba=function(a){for(var b in w){for(var c=w[b],d=c.length-1;0<=d;d--)c[d].dialog!=a&&c[d].uiElement!=a||c.splice(d,1);0===c.length&&delete w[b]}},da=function(a,b){a._.accessKeyMap[b]&&a.selectPage(a._.accessKeyMap[b])},ca=function(){};(function(){CKEDITOR.ui.dialog={uiElement:function(a,b,c,d,e,f,g){if(!(4>arguments.length)){var h=(d.call?d(b):d)||
"div",p=["\x3c",h," "],m=(e&&e.call?e(b):e)||{},k=(f&&f.call?f(b):f)||{},q=(g&&g.call?g.call(this,a,b):g)||"",n=this.domId=k.id||CKEDITOR.tools.getNextId()+"_uiElement";b.requiredContent&&!a.getParentEditor().filter.check(b.requiredContent)&&(m.display="none",this.notAllowed=!0);k.id=n;var r={};b.type&&(r["cke_dialog_ui_"+b.type]=1);b.className&&(r[b.className]=1);b.disabled&&(r.cke_disabled=1);for(var l=k["class"]&&k["class"].split?k["class"].split(" "):[],n=0;n<l.length;n++)l[n]&&(r[l[n]]=1);l=
[];for(n in r)l.push(n);k["class"]=l.join(" ");b.title&&(k.title=b.title);r=(b.style||"").split(";");b.align&&(l=b.align,m["margin-left"]="left"==l?0:"auto",m["margin-right"]="right"==l?0:"auto");for(n in m)r.push(n+":"+m[n]);b.hidden&&r.push("display:none");for(n=r.length-1;0<=n;n--)""===r[n]&&r.splice(n,1);0<r.length&&(k.style=(k.style?k.style+"; ":"")+r.join("; "));for(n in k)p.push(n+'\x3d"'+CKEDITOR.tools.htmlEncode(k[n])+'" ');p.push("\x3e",q,"\x3c/",h,"\x3e");c.push(p.join(""));(this._||(this._=
{})).dialog=a;"boolean"==typeof b.isChanged&&(this.isChanged=function(){return b.isChanged});"function"==typeof b.isChanged&&(this.isChanged=b.isChanged);"function"==typeof b.setValue&&(this.setValue=CKEDITOR.tools.override(this.setValue,function(a){return function(c){a.call(this,b.setValue.call(this,c))}}));"function"==typeof b.getValue&&(this.getValue=CKEDITOR.tools.override(this.getValue,function(a){return function(){return b.getValue.call(this,a.call(this))}}));CKEDITOR.event.implementOn(this);
this.registerEvents(b);this.accessKeyUp&&this.accessKeyDown&&b.accessKey&&S(this,a,"CTRL+"+b.accessKey);var t=this;a.on("load",function(){var b=t.getInputElement();if(b){var c=t.type in{checkbox:1,ratio:1}&&CKEDITOR.env.ie&&8>CKEDITOR.env.version?"cke_dialog_ui_focused":"";b.on("focus",function(){a._.tabBarMode=!1;a._.hasFocus=!0;t.fire("focus");c&&this.addClass(c)});b.on("blur",function(){t.fire("blur");c&&this.removeClass(c)})}});CKEDITOR.tools.extend(this,b);this.keyboardFocusable&&(this.tabIndex=
b.tabIndex||0,this.focusIndex=a._.focusList.push(this)-1,this.on("focus",function(){a._.currentFocusIndex=t.focusIndex}))}},hbox:function(a,b,c,d,e){if(!(4>arguments.length)){this._||(this._={});var f=this._.children=b,g=e&&e.widths||null,h=e&&e.height||null,p,m={role:"presentation"};e&&e.align&&(m.align=e.align);CKEDITOR.ui.dialog.uiElement.call(this,a,e||{type:"hbox"},d,"table",{},m,function(){var a=['\x3ctbody\x3e\x3ctr class\x3d"cke_dialog_ui_hbox"\x3e'];for(p=0;p<c.length;p++){var b="cke_dialog_ui_hbox_child",
d=[];0===p&&(b="cke_dialog_ui_hbox_first");p==c.length-1&&(b="cke_dialog_ui_hbox_last");a.push('\x3ctd class\x3d"',b,'" role\x3d"presentation" ');g?g[p]&&d.push("width:"+v(g[p])):d.push("width:"+Math.floor(100/c.length)+"%");h&&d.push("height:"+v(h));e&&void 0!==e.padding&&d.push("padding:"+v(e.padding));CKEDITOR.env.ie&&CKEDITOR.env.quirks&&f[p].align&&d.push("text-align:"+f[p].align);0<d.length&&a.push('style\x3d"'+d.join("; ")+'" ');a.push("\x3e",c[p],"\x3c/td\x3e")}a.push("\x3c/tr\x3e\x3c/tbody\x3e");
return a.join("")})}},vbox:function(a,b,c,d,e){if(!(3>arguments.length)){this._||(this._={});var f=this._.children=b,g=e&&e.width||null,h=e&&e.heights||null;CKEDITOR.ui.dialog.uiElement.call(this,a,e||{type:"vbox"},d,"div",null,{role:"presentation"},function(){var b=['\x3ctable role\x3d"presentation" cellspacing\x3d"0" border\x3d"0" '];b.push('style\x3d"');e&&e.expand&&b.push("height:100%;");b.push("width:"+v(g||"100%"),";");CKEDITOR.env.webkit&&b.push("float:none;");b.push('"');b.push('align\x3d"',
CKEDITOR.tools.htmlEncode(e&&e.align||("ltr"==a.getParentEditor().lang.dir?"left":"right")),'" ');b.push("\x3e\x3ctbody\x3e");for(var d=0;d<c.length;d++){var k=[];b.push('\x3ctr\x3e\x3ctd role\x3d"presentation" ');g&&k.push("width:"+v(g||"100%"));h?k.push("height:"+v(h[d])):e&&e.expand&&k.push("height:"+Math.floor(100/c.length)+"%");e&&void 0!==e.padding&&k.push("padding:"+v(e.padding));CKEDITOR.env.ie&&CKEDITOR.env.quirks&&f[d].align&&k.push("text-align:"+f[d].align);0<k.length&&b.push('style\x3d"',
k.join("; "),'" ');b.push(' class\x3d"cke_dialog_ui_vbox_child"\x3e',c[d],"\x3c/td\x3e\x3c/tr\x3e")}b.push("\x3c/tbody\x3e\x3c/table\x3e");return b.join("")})}}}})();CKEDITOR.ui.dialog.uiElement.prototype={getElement:function(){return CKEDITOR.document.getById(this.domId)},getInputElement:function(){return this.getElement()},getDialog:function(){return this._.dialog},setValue:function(a,b){this.getInputElement().setValue(a);!b&&this.fire("change",{value:a});return this},getValue:function(){return this.getInputElement().getValue()},
isChanged:function(){return!1},selectParentTab:function(){for(var a=this.getInputElement();(a=a.getParent())&&-1==a.$.className.search("cke_dialog_page_contents"););if(!a)return this;a=a.getAttribute("name");this._.dialog._.currentTabId!=a&&this._.dialog.selectPage(a);return this},focus:function(){this.selectParentTab().getInputElement().focus();return this},registerEvents:function(a){var b=/^on([A-Z]\w+)/,c,d=function(a,b,c,d){b.on("load",function(){a.getInputElement().on(c,d,a)})},e;for(e in a)if(c=
e.match(b))this.eventProcessors[e]?this.eventProcessors[e].call(this,this._.dialog,a[e]):d(this,this._.dialog,c[1].toLowerCase(),a[e]);return this},eventProcessors:{onLoad:function(a,b){a.on("load",b,this)},onShow:function(a,b){a.on("show",b,this)},onHide:function(a,b){a.on("hide",b,this)}},accessKeyDown:function(){this.focus()},accessKeyUp:function(){},disable:function(){var a=this.getElement();this.getInputElement().setAttribute("disabled","true");a.addClass("cke_disabled")},enable:function(){var a=
this.getElement();this.getInputElement().removeAttribute("disabled");a.removeClass("cke_disabled")},isEnabled:function(){return!this.getElement().hasClass("cke_disabled")},isVisible:function(){return this.getInputElement().isVisible()},isFocusable:function(){return this.isEnabled()&&this.isVisible()?!0:!1}};CKEDITOR.ui.dialog.hbox.prototype=CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.uiElement,{getChild:function(a){if(1>arguments.length)return this._.children.concat();a.splice||(a=[a]);return 2>
a.length?this._.children[a[0]]:this._.children[a[0]]&&this._.children[a[0]].getChild?this._.children[a[0]].getChild(a.slice(1,a.length)):null}},!0);CKEDITOR.ui.dialog.vbox.prototype=new CKEDITOR.ui.dialog.hbox;(function(){var a={build:function(a,c,d){for(var e=c.children,f,g=[],h=[],p=0;p<e.length&&(f=e[p]);p++){var m=[];g.push(m);h.push(CKEDITOR.dialog._.uiElementBuilders[f.type].build(a,f,m))}return new CKEDITOR.ui.dialog[c.type](a,h,g,d,c)}};CKEDITOR.dialog.addUIElement("hbox",a);CKEDITOR.dialog.addUIElement("vbox",
a)})();CKEDITOR.dialogCommand=function(a,b){this.dialogName=a;CKEDITOR.tools.extend(this,b,!0)};CKEDITOR.dialogCommand.prototype={exec:function(a){a.openDialog(this.dialogName)},canUndo:!1,editorFocus:1};(function(){var a=/^([a]|[^a])+$/,b=/^\d*$/,c=/^\d*(?:\.\d+)?$/,d=/^(((\d*(\.\d+))|(\d*))(px|\%)?)?$/,e=/^(((\d*(\.\d+))|(\d*))(px|em|ex|in|cm|mm|pt|pc|\%)?)?$/i,f=/^(\s*[\w-]+\s*:\s*[^:;]+(?:;|$))*$/;CKEDITOR.VALIDATE_OR=1;CKEDITOR.VALIDATE_AND=2;CKEDITOR.dialog.validate={functions:function(){var a=
arguments;return function(){var b=this&&this.getValue?this.getValue():a[0],c,d=CKEDITOR.VALIDATE_AND,e=[],f;for(f=0;f<a.length;f++)if("function"==typeof a[f])e.push(a[f]);else break;f<a.length&&"string"==typeof a[f]&&(c=a[f],f++);f<a.length&&"number"==typeof a[f]&&(d=a[f]);var n=d==CKEDITOR.VALIDATE_AND?!0:!1;for(f=0;f<e.length;f++)n=d==CKEDITOR.VALIDATE_AND?n&&e[f](b):n||e[f](b);return n?!0:c}},regex:function(a,b){return function(c){c=this&&this.getValue?this.getValue():c;return a.test(c)?!0:b}},
notEmpty:function(b){return this.regex(a,b)},integer:function(a){return this.regex(b,a)},number:function(a){return this.regex(c,a)},cssLength:function(a){return this.functions(function(a){return e.test(CKEDITOR.tools.trim(a))},a)},htmlLength:function(a){return this.functions(function(a){return d.test(CKEDITOR.tools.trim(a))},a)},inlineStyle:function(a){return this.functions(function(a){return f.test(CKEDITOR.tools.trim(a))},a)},equals:function(a,b){return this.functions(function(b){return b==a},b)},
notEqual:function(a,b){return this.functions(function(b){return b!=a},b)}};CKEDITOR.on("instanceDestroyed",function(a){if(CKEDITOR.tools.isEmpty(CKEDITOR.instances)){for(var b;b=CKEDITOR.dialog._.currentTop;)b.hide();for(var c in z)z[c].remove();z={}}a=a.editor._.storedDialogs;for(var d in a)a[d].destroy()})})();CKEDITOR.tools.extend(CKEDITOR.editor.prototype,{openDialog:function(a,b){var c=null,d=CKEDITOR.dialog._.dialogDefinitions[a];null===CKEDITOR.dialog._.currentTop&&N(this);if("function"==typeof d)c=
this._.storedDialogs||(this._.storedDialogs={}),c=c[a]||(c[a]=new CKEDITOR.dialog(this,a)),b&&b.call(c,c),c.show();else{if("failed"==d)throw O(this),Error('[CKEDITOR.dialog.openDialog] Dialog "'+a+'" failed when loading definition.');"string"==typeof d&&CKEDITOR.scriptLoader.load(CKEDITOR.getUrl(d),function(){"function"!=typeof CKEDITOR.dialog._.dialogDefinitions[a]&&(CKEDITOR.dialog._.dialogDefinitions[a]="failed");this.openDialog(a,b)},this,0,1)}CKEDITOR.skin.loadPart("dialog");return c}})})();
CKEDITOR.plugins.add("dialog",{requires:"dialogui",init:function(x){x.on("doubleclick",function(A){A.data.dialog&&x.openDialog(A.data.dialog)},null,null,999)}});CKEDITOR.plugins.add("about",{requires:"dialog",init:function(a){var b=a.addCommand("about",new CKEDITOR.dialogCommand("about"));b.modes={wysiwyg:1,source:1};b.canUndo=!1;b.readOnly=1;a.ui.addButton&&a.ui.addButton("About",{label:a.lang.about.title,command:"about",toolbar:"about"});CKEDITOR.dialog.add("about",this.path+"dialogs/about.js")}});(function(){CKEDITOR.plugins.add("a11yhelp",{requires:"dialog",availableLangs:{af:1,ar:1,bg:1,ca:1,cs:1,cy:1,da:1,de:1,el:1,en:1,"en-gb":1,eo:1,es:1,et:1,eu:1,fa:1,fi:1,fo:1,fr:1,"fr-ca":1,gl:1,gu:1,he:1,hi:1,hr:1,hu:1,id:1,it:1,ja:1,km:1,ko:1,ku:1,lt:1,lv:1,mk:1,mn:1,nb:1,nl:1,no:1,pl:1,pt:1,"pt-br":1,ro:1,ru:1,si:1,sk:1,sl:1,sq:1,sr:1,"sr-latn":1,sv:1,th:1,tr:1,tt:1,ug:1,uk:1,vi:1,zh:1,"zh-cn":1},init:function(b){var c=this;b.addCommand("a11yHelp",{exec:function(){var a=b.langCode,a=c.availableLangs[a]?
a:c.availableLangs[a.replace(/-.*/,"")]?a.replace(/-.*/,""):"en";CKEDITOR.scriptLoader.load(CKEDITOR.getUrl(c.path+"dialogs/lang/"+a+".js"),function(){b.lang.a11yhelp=c.langEntries[a];b.openDialog("a11yHelp")})},modes:{wysiwyg:1,source:1},readOnly:1,canUndo:!1});b.setKeystroke(CKEDITOR.ALT+48,"a11yHelp");CKEDITOR.dialog.add("a11yHelp",this.path+"dialogs/a11yhelp.js");b.on("ariaEditorHelpLabel",function(a){a.data.label=b.lang.common.editorHelp})}})})();CKEDITOR.plugins.add("basicstyles",{init:function(c){var e=0,d=function(g,d,b,a){if(a){a=new CKEDITOR.style(a);var f=h[b];f.unshift(a);c.attachStyleStateChange(a,function(a){!c.readOnly&&c.getCommand(b).setState(a)});c.addCommand(b,new CKEDITOR.styleCommand(a,{contentForms:f}));c.ui.addButton&&c.ui.addButton(g,{label:d,command:b,toolbar:"basicstyles,"+(e+=10)})}},h={bold:["strong","b",["span",function(a){a=a.styles["font-weight"];return"bold"==a||700<=+a}]],italic:["em","i",["span",function(a){return"italic"==
a.styles["font-style"]}]],underline:["u",["span",function(a){return"underline"==a.styles["text-decoration"]}]],strike:["s","strike",["span",function(a){return"line-through"==a.styles["text-decoration"]}]],subscript:["sub"],superscript:["sup"]},b=c.config,a=c.lang.basicstyles;d("Bold",a.bold,"bold",b.coreStyles_bold);d("Italic",a.italic,"italic",b.coreStyles_italic);d("Underline",a.underline,"underline",b.coreStyles_underline);d("Strike",a.strike,"strike",b.coreStyles_strike);d("Subscript",a.subscript,
"subscript",b.coreStyles_subscript);d("Superscript",a.superscript,"superscript",b.coreStyles_superscript);c.setKeystroke([[CKEDITOR.CTRL+66,"bold"],[CKEDITOR.CTRL+73,"italic"],[CKEDITOR.CTRL+85,"underline"]])}});CKEDITOR.config.coreStyles_bold={element:"strong",overrides:"b"};CKEDITOR.config.coreStyles_italic={element:"em",overrides:"i"};CKEDITOR.config.coreStyles_underline={element:"u"};CKEDITOR.config.coreStyles_strike={element:"s",overrides:"strike"};CKEDITOR.config.coreStyles_subscript={element:"sub"};
CKEDITOR.config.coreStyles_superscript={element:"sup"};(function(){var m={exec:function(g){var a=g.getCommand("blockquote").state,k=g.getSelection(),c=k&&k.getRanges()[0];if(c){var h=k.createBookmarks();if(CKEDITOR.env.ie){var e=h[0].startNode,b=h[0].endNode,d;if(e&&"blockquote"==e.getParent().getName())for(d=e;d=d.getNext();)if(d.type==CKEDITOR.NODE_ELEMENT&&d.isBlockBoundary()){e.move(d,!0);break}if(b&&"blockquote"==b.getParent().getName())for(d=b;d=d.getPrevious();)if(d.type==CKEDITOR.NODE_ELEMENT&&d.isBlockBoundary()){b.move(d);break}}var f=c.createIterator();
f.enlargeBr=g.config.enterMode!=CKEDITOR.ENTER_BR;if(a==CKEDITOR.TRISTATE_OFF){for(e=[];a=f.getNextParagraph();)e.push(a);1>e.length&&(a=g.document.createElement(g.config.enterMode==CKEDITOR.ENTER_P?"p":"div"),b=h.shift(),c.insertNode(a),a.append(new CKEDITOR.dom.text("﻿",g.document)),c.moveToBookmark(b),c.selectNodeContents(a),c.collapse(!0),b=c.createBookmark(),e.push(a),h.unshift(b));d=e[0].getParent();c=[];for(b=0;b<e.length;b++)a=e[b],d=d.getCommonAncestor(a.getParent());for(a={table:1,tbody:1,
tr:1,ol:1,ul:1};a[d.getName()];)d=d.getParent();for(b=null;0<e.length;){for(a=e.shift();!a.getParent().equals(d);)a=a.getParent();a.equals(b)||c.push(a);b=a}for(;0<c.length;)if(a=c.shift(),"blockquote"==a.getName()){for(b=new CKEDITOR.dom.documentFragment(g.document);a.getFirst();)b.append(a.getFirst().remove()),e.push(b.getLast());b.replace(a)}else e.push(a);c=g.document.createElement("blockquote");for(c.insertBefore(e[0]);0<e.length;)a=e.shift(),c.append(a)}else if(a==CKEDITOR.TRISTATE_ON){b=[];
for(d={};a=f.getNextParagraph();){for(e=c=null;a.getParent();){if("blockquote"==a.getParent().getName()){c=a.getParent();e=a;break}a=a.getParent()}c&&e&&!e.getCustomData("blockquote_moveout")&&(b.push(e),CKEDITOR.dom.element.setMarker(d,e,"blockquote_moveout",!0))}CKEDITOR.dom.element.clearAllMarkers(d);a=[];e=[];for(d={};0<b.length;)f=b.shift(),c=f.getParent(),f.getPrevious()?f.getNext()?(f.breakParent(f.getParent()),e.push(f.getNext())):f.remove().insertAfter(c):f.remove().insertBefore(c),c.getCustomData("blockquote_processed")||
(e.push(c),CKEDITOR.dom.element.setMarker(d,c,"blockquote_processed",!0)),a.push(f);CKEDITOR.dom.element.clearAllMarkers(d);for(b=e.length-1;0<=b;b--){c=e[b];a:{d=c;for(var f=0,m=d.getChildCount(),l=void 0;f<m&&(l=d.getChild(f));f++)if(l.type==CKEDITOR.NODE_ELEMENT&&l.isBlockBoundary()){d=!1;break a}d=!0}d&&c.remove()}if(g.config.enterMode==CKEDITOR.ENTER_BR)for(c=!0;a.length;)if(f=a.shift(),"div"==f.getName()){b=new CKEDITOR.dom.documentFragment(g.document);!c||!f.getPrevious()||f.getPrevious().type==
CKEDITOR.NODE_ELEMENT&&f.getPrevious().isBlockBoundary()||b.append(g.document.createElement("br"));for(c=f.getNext()&&!(f.getNext().type==CKEDITOR.NODE_ELEMENT&&f.getNext().isBlockBoundary());f.getFirst();)f.getFirst().remove().appendTo(b);c&&b.append(g.document.createElement("br"));b.replace(f);c=!1}}k.selectBookmarks(h);g.focus()}},refresh:function(g,a){this.setState(g.elementPath(a.block||a.blockLimit).contains("blockquote",1)?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF)},context:"blockquote",allowedContent:"blockquote",
requiredContent:"blockquote"};CKEDITOR.plugins.add("blockquote",{init:function(g){g.blockless||(g.addCommand("blockquote",m),g.ui.addButton&&g.ui.addButton("Blockquote",{label:g.lang.blockquote.toolbar,command:"blockquote",toolbar:"blocks,10"}))}})})();(function(){function r(b,a,c){a.type||(a.type="auto");if(c&&!1===b.fire("beforePaste",a)||!a.dataValue&&a.dataTransfer.isEmpty())return!1;a.dataValue||(a.dataValue="");if(CKEDITOR.env.gecko&&"drop"==a.method&&b.toolbox)b.once("afterPaste",function(){b.toolbox.focus()});return b.fire("paste",a)}function y(b){function a(){var a=b.editable();if(CKEDITOR.plugins.clipboard.isCustomCopyCutSupported){var d=function(a){b.readOnly&&"cut"==a.name||n.initPasteDataTransfer(a,b);a.data.preventDefault()};a.on("copy",
d);a.on("cut",d);a.on("cut",function(){b.readOnly||b.extractSelectedHtml()},null,null,999)}a.on(n.mainPasteEvent,function(b){"beforepaste"==n.mainPasteEvent&&p||k(b)});"beforepaste"==n.mainPasteEvent&&(a.on("paste",function(a){v||(e(),a.data.preventDefault(),k(a),f("paste")||b.openDialog("paste"))}),a.on("contextmenu",g,null,null,0),a.on("beforepaste",function(b){!b.data||b.data.$.ctrlKey||b.data.$.shiftKey||g()},null,null,0));a.on("beforecut",function(){!p&&h(b)});var c;a.attachListener(CKEDITOR.env.ie?
a:b.document.getDocumentElement(),"mouseup",function(){c=setTimeout(function(){t()},0)});b.on("destroy",function(){clearTimeout(c)});a.on("keyup",t)}function c(a){return{type:a,canUndo:"cut"==a,startDisabled:!0,exec:function(){"cut"==this.type&&h();var a;var d=this.type;if(CKEDITOR.env.ie)a=f(d);else try{a=b.document.$.execCommand(d,!1,null)}catch(c){a=!1}a||b.showNotification(b.lang.clipboard[this.type+"Error"]);return a}}}function d(){return{canUndo:!1,async:!0,exec:function(b,a){var d=function(a,
d){a&&r(b,a,!!d);b.fire("afterCommandExec",{name:"paste",command:c,returnValue:!!a})},c=this;"string"==typeof a?d({dataValue:a,method:"paste",dataTransfer:n.initPasteDataTransfer()},1):b.getClipboardData(d)}}}function e(){v=1;setTimeout(function(){v=0},100)}function g(){p=1;setTimeout(function(){p=0},10)}function f(a){var d=b.document,c=d.getBody(),e=!1,f=function(){e=!0};c.on(a,f);7<CKEDITOR.env.version?d.$.execCommand(a):d.$.selection.createRange().execCommand(a);c.removeListener(a,f);return e}
function h(){if(CKEDITOR.env.ie&&!CKEDITOR.env.quirks){var a=b.getSelection(),d,c,e;a.getType()==CKEDITOR.SELECTION_ELEMENT&&(d=a.getSelectedElement())&&(c=a.getRanges()[0],e=b.document.createText(""),e.insertBefore(d),c.setStartBefore(e),c.setEndAfter(d),a.selectRanges([c]),setTimeout(function(){d.getParent()&&(e.remove(),a.selectElement(d))},0))}}function l(a,d){var c=b.document,e=b.editable(),f=function(b){b.cancel()},q;if(!c.getById("cke_pastebin")){var g=b.getSelection(),h=g.createBookmarks();
CKEDITOR.env.ie&&g.root.fire("selectionchange");var m=new CKEDITOR.dom.element(!CKEDITOR.env.webkit&&!e.is("body")||CKEDITOR.env.ie?"div":"body",c);m.setAttributes({id:"cke_pastebin","data-cke-temp":"1"});var k=0,c=c.getWindow();CKEDITOR.env.webkit?(e.append(m),m.addClass("cke_editable"),e.is("body")||(k="static"!=e.getComputedStyle("position")?e:CKEDITOR.dom.element.get(e.$.offsetParent),k=k.getDocumentPosition().y)):e.getAscendant(CKEDITOR.env.ie?"body":"html",1).append(m);m.setStyles({position:"absolute",
top:c.getScrollPosition().y-k+10+"px",width:"1px",height:Math.max(1,c.getViewPaneSize().height-20)+"px",overflow:"hidden",margin:0,padding:0});CKEDITOR.env.safari&&m.setStyles(CKEDITOR.tools.cssVendorPrefix("user-select","text"));(k=m.getParent().isReadOnly())?(m.setOpacity(0),m.setAttribute("contenteditable",!0)):m.setStyle("ltr"==b.config.contentsLangDirection?"left":"right","-1000px");b.on("selectionChange",f,null,null,0);if(CKEDITOR.env.webkit||CKEDITOR.env.gecko)q=e.once("blur",f,null,null,-100);
k&&m.focus();k=new CKEDITOR.dom.range(m);k.selectNodeContents(m);var t=k.select();CKEDITOR.env.ie&&(q=e.once("blur",function(){b.lockSelection(t)}));var l=CKEDITOR.document.getWindow().getScrollPosition().y;setTimeout(function(){CKEDITOR.env.webkit&&(CKEDITOR.document.getBody().$.scrollTop=l);q&&q.removeListener();CKEDITOR.env.ie&&e.focus();g.selectBookmarks(h);m.remove();var a;CKEDITOR.env.webkit&&(a=m.getFirst())&&a.is&&a.hasClass("Apple-style-span")&&(m=a);b.removeListener("selectionChange",f);
d(m.getHtml())},0)}}function z(){if("paste"==n.mainPasteEvent)return b.fire("beforePaste",{type:"auto",method:"paste"}),!1;b.focus();e();var a=b.focusManager;a.lock();if(b.editable().fire(n.mainPasteEvent)&&!f("paste"))return a.unlock(),!1;a.unlock();return!0}function q(a){if("wysiwyg"==b.mode)switch(a.data.keyCode){case CKEDITOR.CTRL+86:case CKEDITOR.SHIFT+45:a=b.editable();e();"paste"==n.mainPasteEvent&&a.fire("beforepaste");break;case CKEDITOR.CTRL+88:case CKEDITOR.SHIFT+46:b.fire("saveSnapshot"),
setTimeout(function(){b.fire("saveSnapshot")},50)}}function k(a){var d={type:"auto",method:"paste",dataTransfer:n.initPasteDataTransfer(a)};d.dataTransfer.cacheData();var c=!1!==b.fire("beforePaste",d);c&&n.canClipboardApiBeTrusted(d.dataTransfer,b)?(a.data.preventDefault(),setTimeout(function(){r(b,d)},0)):l(a,function(a){d.dataValue=a.replace(/<span[^>]+data-cke-bookmark[^<]*?<\/span>/ig,"");c&&r(b,d)})}function t(){if("wysiwyg"==b.mode){var a=u("paste");b.getCommand("cut").setState(u("cut"));b.getCommand("copy").setState(u("copy"));
b.getCommand("paste").setState(a);b.fire("pasteState",a)}}function u(a){if(w&&a in{paste:1,cut:1})return CKEDITOR.TRISTATE_DISABLED;if("paste"==a)return CKEDITOR.TRISTATE_OFF;a=b.getSelection();var d=a.getRanges();return a.getType()==CKEDITOR.SELECTION_NONE||1==d.length&&d[0].collapsed?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF}var n=CKEDITOR.plugins.clipboard,p=0,v=0,w=0;(function(){b.on("key",q);b.on("contentDom",a);b.on("selectionChange",function(b){w=b.data.selection.getRanges()[0].checkReadOnly();
t()});b.contextMenu&&b.contextMenu.addListener(function(b,a){w=a.getRanges()[0].checkReadOnly();return{cut:u("cut"),copy:u("copy"),paste:u("paste")}})})();(function(){function a(d,c,e,f,q){var g=b.lang.clipboard[c];b.addCommand(c,e);b.ui.addButton&&b.ui.addButton(d,{label:g,command:c,toolbar:"clipboard,"+f});b.addMenuItems&&b.addMenuItem(c,{label:g,command:c,group:"clipboard",order:q})}a("Cut","cut",c("cut"),10,1);a("Copy","copy",c("copy"),20,4);a("Paste","paste",d(),30,8)})();b.getClipboardData=
function(a,d){function c(a){a.removeListener();a.cancel();d(a.data)}function e(a){a.removeListener();a.cancel();k=!0;d({type:g,dataValue:a.data.dataValue,dataTransfer:a.data.dataTransfer,method:"paste"})}function f(){this.customTitle=a&&a.title}var q=!1,g="auto",k=!1;d||(d=a,a=null);b.on("paste",c,null,null,0);b.on("beforePaste",function(a){a.removeListener();q=!0;g=a.data.type},null,null,1E3);!1===z()&&(b.removeListener("paste",c),q&&b.fire("pasteDialog",f)?(b.on("pasteDialogCommit",e),b.on("dialogHide",
function(a){a.removeListener();a.data.removeListener("pasteDialogCommit",e);setTimeout(function(){k||d(null)},10)})):d(null))}}function A(b){if(CKEDITOR.env.webkit){if(!b.match(/^[^<]*$/g)&&!b.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi))return"html"}else if(CKEDITOR.env.ie){if(!b.match(/^([^<]|<br( ?\/)?>)*$/gi)&&!b.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi))return"html"}else if(CKEDITOR.env.gecko){if(!b.match(/^([^<]|<br( ?\/)?>)*$/gi))return"html"}else return"html";return"htmlifiedtext"}
function B(b,a){function c(a){return CKEDITOR.tools.repeat("\x3c/p\x3e\x3cp\x3e",~~(a/2))+(1==a%2?"\x3cbr\x3e":"")}a=a.replace(/\s+/g," ").replace(/> +</g,"\x3e\x3c").replace(/<br ?\/>/gi,"\x3cbr\x3e");a=a.replace(/<\/?[A-Z]+>/g,function(a){return a.toLowerCase()});if(a.match(/^[^<]$/))return a;CKEDITOR.env.webkit&&-1<a.indexOf("\x3cdiv\x3e")&&(a=a.replace(/^(<div>(<br>|)<\/div>)(?!$|(<div>(<br>|)<\/div>))/g,"\x3cbr\x3e").replace(/^(<div>(<br>|)<\/div>){2}(?!$)/g,"\x3cdiv\x3e\x3c/div\x3e"),a.match(/<div>(<br>|)<\/div>/)&&
(a="\x3cp\x3e"+a.replace(/(<div>(<br>|)<\/div>)+/g,function(a){return c(a.split("\x3c/div\x3e\x3cdiv\x3e").length+1)})+"\x3c/p\x3e"),a=a.replace(/<\/div><div>/g,"\x3cbr\x3e"),a=a.replace(/<\/?div>/g,""));CKEDITOR.env.gecko&&b.enterMode!=CKEDITOR.ENTER_BR&&(CKEDITOR.env.gecko&&(a=a.replace(/^<br><br>$/,"\x3cbr\x3e")),-1<a.indexOf("\x3cbr\x3e\x3cbr\x3e")&&(a="\x3cp\x3e"+a.replace(/(<br>){2,}/g,function(a){return c(a.length/4)})+"\x3c/p\x3e"));return C(b,a)}function D(){function b(){var a={},b;for(b in CKEDITOR.dtd)"$"!=
b.charAt(0)&&"div"!=b&&"span"!=b&&(a[b]=1);return a}var a={};return{get:function(c){return"plain-text"==c?a.plainText||(a.plainText=new CKEDITOR.filter("br")):"semantic-content"==c?((c=a.semanticContent)||(c=new CKEDITOR.filter,c.allow({$1:{elements:b(),attributes:!0,styles:!1,classes:!1}}),c=a.semanticContent=c),c):c?new CKEDITOR.filter(c):null}}}function x(b,a,c){a=CKEDITOR.htmlParser.fragment.fromHtml(a);var d=new CKEDITOR.htmlParser.basicWriter;c.applyTo(a,!0,!1,b.activeEnterMode);a.writeHtml(d);
return d.getHtml()}function C(b,a){b.enterMode==CKEDITOR.ENTER_BR?a=a.replace(/(<\/p><p>)+/g,function(a){return CKEDITOR.tools.repeat("\x3cbr\x3e",a.length/7*2)}).replace(/<\/?p>/g,""):b.enterMode==CKEDITOR.ENTER_DIV&&(a=a.replace(/<(\/)?p>/g,"\x3c$1div\x3e"));return a}function E(b){b.data.preventDefault();b.data.$.dataTransfer.dropEffect="none"}function F(b){var a=CKEDITOR.plugins.clipboard;b.on("contentDom",function(){function c(a,d,c){d.select();r(b,{dataTransfer:c,method:"drop"},1);c.sourceEditor.fire("saveSnapshot");
c.sourceEditor.editable().extractHtmlFromRange(a);c.sourceEditor.getSelection().selectRanges([a]);c.sourceEditor.fire("saveSnapshot")}function d(d,c){d.select();r(b,{dataTransfer:c,method:"drop"},1);a.resetDragDataTransfer()}function e(a,d,c){var e={$:a.data.$,target:a.data.getTarget()};d&&(e.dragRange=d);c&&(e.dropRange=c);!1===b.fire(a.name,e)&&a.data.preventDefault()}function g(a){a.type!=CKEDITOR.NODE_ELEMENT&&(a=a.getParent());return a.getChildCount()}var f=b.editable(),h=CKEDITOR.plugins.clipboard.getDropTarget(b),
l=b.ui.space("top"),p=b.ui.space("bottom");a.preventDefaultDropOnElement(l);a.preventDefaultDropOnElement(p);f.attachListener(h,"dragstart",e);f.attachListener(b,"dragstart",a.resetDragDataTransfer,a,null,1);f.attachListener(b,"dragstart",function(d){a.initDragDataTransfer(d,b)},null,null,2);f.attachListener(b,"dragstart",function(){var d=a.dragRange=b.getSelection().getRanges()[0];CKEDITOR.env.ie&&10>CKEDITOR.env.version&&(a.dragStartContainerChildCount=d?g(d.startContainer):null,a.dragEndContainerChildCount=
d?g(d.endContainer):null)},null,null,100);f.attachListener(h,"dragend",e);f.attachListener(b,"dragend",a.initDragDataTransfer,a,null,1);f.attachListener(b,"dragend",a.resetDragDataTransfer,a,null,100);f.attachListener(h,"dragover",function(a){var b=a.data.getTarget();b&&b.is&&b.is("html")?a.data.preventDefault():CKEDITOR.env.ie&&CKEDITOR.plugins.clipboard.isFileApiSupported&&a.data.$.dataTransfer.types.contains("Files")&&a.data.preventDefault()});f.attachListener(h,"drop",function(d){if(!d.data.$.defaultPrevented){d.data.preventDefault();
var c=d.data.getTarget();if(!c.isReadOnly()||c.type==CKEDITOR.NODE_ELEMENT&&c.is("html")){var c=a.getRangeAtDropPosition(d,b),f=a.dragRange;c&&e(d,f,c)}}},null,null,9999);f.attachListener(b,"drop",a.initDragDataTransfer,a,null,1);f.attachListener(b,"drop",function(e){if(e=e.data){var f=e.dropRange,g=e.dragRange,h=e.dataTransfer;h.getTransferType(b)==CKEDITOR.DATA_TRANSFER_INTERNAL?setTimeout(function(){a.internalDrop(g,f,h,b)},0):h.getTransferType(b)==CKEDITOR.DATA_TRANSFER_CROSS_EDITORS?c(g,f,h):
d(f,h)}},null,null,9999)})}CKEDITOR.plugins.add("clipboard",{requires:"dialog",init:function(b){var a,c=D();b.config.forcePasteAsPlainText?a="plain-text":b.config.pasteFilter?a=b.config.pasteFilter:!CKEDITOR.env.webkit||"pasteFilter"in b.config||(a="semantic-content");b.pasteFilter=c.get(a);y(b);F(b);CKEDITOR.dialog.add("paste",CKEDITOR.getUrl(this.path+"dialogs/paste.js"));b.on("paste",function(a){a.data.dataTransfer||(a.data.dataTransfer=new CKEDITOR.plugins.clipboard.dataTransfer);if(!a.data.dataValue){var c=
a.data.dataTransfer,g=c.getData("text/html");if(g)a.data.dataValue=g,a.data.type="html";else if(g=c.getData("text/plain"))a.data.dataValue=b.editable().transformPlainTextToHtml(g),a.data.type="text"}},null,null,1);b.on("paste",function(a){var b=a.data.dataValue,c=CKEDITOR.dtd.$block;-1<b.indexOf("Apple-")&&(b=b.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi," "),"html"!=a.data.type&&(b=b.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi,function(a,b){return b.replace(/\t/g,
"\x26nbsp;\x26nbsp; \x26nbsp;")})),-1<b.indexOf('\x3cbr class\x3d"Apple-interchange-newline"\x3e')&&(a.data.startsWithEOL=1,a.data.preSniffing="html",b=b.replace(/<br class="Apple-interchange-newline">/,"")),b=b.replace(/(<[^>]+) class="Apple-[^"]*"/gi,"$1"));if(b.match(/^<[^<]+cke_(editable|contents)/i)){var f,h,l=new CKEDITOR.dom.element("div");for(l.setHtml(b);1==l.getChildCount()&&(f=l.getFirst())&&f.type==CKEDITOR.NODE_ELEMENT&&(f.hasClass("cke_editable")||f.hasClass("cke_contents"));)l=h=f;
h&&(b=h.getHtml().replace(/<br>$/i,""))}CKEDITOR.env.ie?b=b.replace(/^&nbsp;(?: |\r\n)?<(\w+)/g,function(b,f){return f.toLowerCase()in c?(a.data.preSniffing="html","\x3c"+f):b}):CKEDITOR.env.webkit?b=b.replace(/<\/(\w+)><div><br><\/div>$/,function(b,f){return f in c?(a.data.endsWithEOL=1,"\x3c/"+f+"\x3e"):b}):CKEDITOR.env.gecko&&(b=b.replace(/(\s)<br>$/,"$1"));a.data.dataValue=b},null,null,3);b.on("paste",function(a){a=a.data;var e=a.type,g=a.dataValue,f,h=b.config.clipboard_defaultContentType||"html",
l=a.dataTransfer.getTransferType(b);f="html"==e||"html"==a.preSniffing?"html":A(g);"htmlifiedtext"==f&&(g=B(b.config,g));"text"==e&&"html"==f?g=x(b,g,c.get("plain-text")):l==CKEDITOR.DATA_TRANSFER_EXTERNAL&&b.pasteFilter&&!a.dontFilter&&(g=x(b,g,b.pasteFilter));a.startsWithEOL&&(g='\x3cbr data-cke-eol\x3d"1"\x3e'+g);a.endsWithEOL&&(g+='\x3cbr data-cke-eol\x3d"1"\x3e');"auto"==e&&(e="html"==f||"html"==h?"html":"text");a.type=e;a.dataValue=g;delete a.preSniffing;delete a.startsWithEOL;delete a.endsWithEOL},
null,null,6);b.on("paste",function(a){a=a.data;a.dataValue&&(b.insertHtml(a.dataValue,a.type,a.range),setTimeout(function(){b.fire("afterPaste")},0))},null,null,1E3);b.on("pasteDialog",function(a){setTimeout(function(){b.openDialog("paste",a.data)},0)})}});CKEDITOR.plugins.clipboard={isCustomCopyCutSupported:!CKEDITOR.env.ie&&!CKEDITOR.env.iOS,isCustomDataTypesSupported:!CKEDITOR.env.ie,isFileApiSupported:!CKEDITOR.env.ie||9<CKEDITOR.env.version,mainPasteEvent:CKEDITOR.env.ie&&!CKEDITOR.env.edge?
"beforepaste":"paste",canClipboardApiBeTrusted:function(b,a){return b.getTransferType(a)!=CKEDITOR.DATA_TRANSFER_EXTERNAL||CKEDITOR.env.chrome&&!b.isEmpty()||CKEDITOR.env.gecko&&(b.getData("text/html")||b.getFilesCount())?!0:!1},getDropTarget:function(b){var a=b.editable();return CKEDITOR.env.ie&&9>CKEDITOR.env.version||a.isInline()?a:b.document},fixSplitNodesAfterDrop:function(b,a,c,d){function e(b,c,d){var e=b;e.type==CKEDITOR.NODE_TEXT&&(e=b.getParent());if(e.equals(c)&&d!=c.getChildCount())return b=
a.startContainer.getChild(a.startOffset-1),c=a.startContainer.getChild(a.startOffset),b&&b.type==CKEDITOR.NODE_TEXT&&c&&c.type==CKEDITOR.NODE_TEXT&&(d=b.getLength(),b.setText(b.getText()+c.getText()),c.remove(),a.setStart(b,d),a.collapse(!0)),!0}var g=a.startContainer;"number"==typeof d&&"number"==typeof c&&g.type==CKEDITOR.NODE_ELEMENT&&(e(b.startContainer,g,c)||e(b.endContainer,g,d))},isDropRangeAffectedByDragRange:function(b,a){var c=a.startContainer,d=a.endOffset;return b.endContainer.equals(c)&&
b.endOffset<=d||b.startContainer.getParent().equals(c)&&b.startContainer.getIndex()<d||b.endContainer.getParent().equals(c)&&b.endContainer.getIndex()<d?!0:!1},internalDrop:function(b,a,c,d){var e=CKEDITOR.plugins.clipboard,g=d.editable(),f,h;d.fire("saveSnapshot");d.fire("lockSnapshot",{dontUpdate:1});CKEDITOR.env.ie&&10>CKEDITOR.env.version&&this.fixSplitNodesAfterDrop(b,a,e.dragStartContainerChildCount,e.dragEndContainerChildCount);(h=this.isDropRangeAffectedByDragRange(b,a))||(f=b.createBookmark(!1));
e=a.clone().createBookmark(!1);h&&(f=b.createBookmark(!1));b=f.startNode;a=f.endNode;h=e.startNode;a&&b.getPosition(h)&CKEDITOR.POSITION_PRECEDING&&a.getPosition(h)&CKEDITOR.POSITION_FOLLOWING&&h.insertBefore(b);b=d.createRange();b.moveToBookmark(f);g.extractHtmlFromRange(b,1);a=d.createRange();a.moveToBookmark(e);r(d,{dataTransfer:c,method:"drop",range:a},1);d.fire("unlockSnapshot")},getRangeAtDropPosition:function(b,a){var c=b.data.$,d=c.clientX,e=c.clientY,g=a.getSelection(!0).getRanges()[0],f=
a.createRange();if(b.data.testRange)return b.data.testRange;if(document.caretRangeFromPoint)c=a.document.$.caretRangeFromPoint(d,e),f.setStart(CKEDITOR.dom.node(c.startContainer),c.startOffset),f.collapse(!0);else if(c.rangeParent)f.setStart(CKEDITOR.dom.node(c.rangeParent),c.rangeOffset),f.collapse(!0);else{if(CKEDITOR.env.ie&&8<CKEDITOR.env.version&&g&&a.editable().hasFocus)return g;if(document.body.createTextRange){a.focus();c=a.document.getBody().$.createTextRange();try{for(var h=!1,l=0;20>l&&
!h;l++){if(!h)try{c.moveToPoint(d,e-l),h=!0}catch(p){}if(!h)try{c.moveToPoint(d,e+l),h=!0}catch(q){}}if(h){var k="cke-temp-"+(new Date).getTime();c.pasteHTML('\x3cspan id\x3d"'+k+'"\x3e​\x3c/span\x3e');var t=a.document.getById(k);f.moveToPosition(t,CKEDITOR.POSITION_BEFORE_START);t.remove()}else{var u=a.document.$.elementFromPoint(d,e),n=new CKEDITOR.dom.element(u),r;if(n.equals(a.editable())||"html"==n.getName())return g&&g.startContainer&&!g.startContainer.equals(a.editable())?g:null;r=n.getClientRect();
d<r.left?f.setStartAt(n,CKEDITOR.POSITION_AFTER_START):f.setStartAt(n,CKEDITOR.POSITION_BEFORE_END);f.collapse(!0)}}catch(v){return null}}else return null}return f},initDragDataTransfer:function(b,a){var c=b.data.$?b.data.$.dataTransfer:null,d=new this.dataTransfer(c,a);c?this.dragData&&d.id==this.dragData.id?d=this.dragData:this.dragData=d:this.dragData?d=this.dragData:this.dragData=d;b.data.dataTransfer=d},resetDragDataTransfer:function(){this.dragData=null},initPasteDataTransfer:function(b,a){if(this.isCustomCopyCutSupported&&
b&&b.data&&b.data.$){var c=new this.dataTransfer(b.data.$.clipboardData,a);this.copyCutData&&c.id==this.copyCutData.id?(c=this.copyCutData,c.$=b.data.$.clipboardData):this.copyCutData=c;return c}return new this.dataTransfer(null,a)},preventDefaultDropOnElement:function(b){b&&b.on("dragover",E)}};var p=CKEDITOR.plugins.clipboard.isCustomDataTypesSupported?"cke/id":"Text";CKEDITOR.plugins.clipboard.dataTransfer=function(b,a){b&&(this.$=b);this._={metaRegExp:/^<meta.*?>/i,bodyRegExp:/<body(?:[\s\S]*?)>([\s\S]*)<\/body>/i,
fragmentRegExp:/\x3c!--(?:Start|End)Fragment--\x3e/g,data:{},files:[],normalizeType:function(a){a=a.toLowerCase();return"text"==a||"text/plain"==a?"Text":"url"==a?"URL":a}};this.id=this.getData(p);this.id||(this.id="Text"==p?"":"cke-"+CKEDITOR.tools.getUniqueId());if("Text"!=p)try{this.$.setData(p,this.id)}catch(c){}a&&(this.sourceEditor=a,this.setData("text/html",a.getSelectedHtml(1)),"Text"==p||this.getData("text/plain")||this.setData("text/plain",a.getSelection().getSelectedText()))};CKEDITOR.DATA_TRANSFER_INTERNAL=
1;CKEDITOR.DATA_TRANSFER_CROSS_EDITORS=2;CKEDITOR.DATA_TRANSFER_EXTERNAL=3;CKEDITOR.plugins.clipboard.dataTransfer.prototype={getData:function(b){b=this._.normalizeType(b);var a=this._.data[b];if(void 0===a||null===a||""===a)try{a=this.$.getData(b)}catch(c){}if(void 0===a||null===a||""===a)a="";"text/html"==b?(a=a.replace(this._.metaRegExp,""),(b=this._.bodyRegExp.exec(a))&&b.length&&(a=b[1],a=a.replace(this._.fragmentRegExp,""))):"Text"==b&&CKEDITOR.env.gecko&&this.getFilesCount()&&"file://"==a.substring(0,
7)&&(a="");return a},setData:function(b,a){b=this._.normalizeType(b);this._.data[b]=a;if(CKEDITOR.plugins.clipboard.isCustomDataTypesSupported||"URL"==b||"Text"==b){"Text"==p&&"Text"==b&&(this.id=a);try{this.$.setData(b,a)}catch(c){}}},getTransferType:function(b){return this.sourceEditor?this.sourceEditor==b?CKEDITOR.DATA_TRANSFER_INTERNAL:CKEDITOR.DATA_TRANSFER_CROSS_EDITORS:CKEDITOR.DATA_TRANSFER_EXTERNAL},cacheData:function(){function b(b){b=a._.normalizeType(b);var c=a.getData(b);c&&(a._.data[b]=
c)}if(this.$){var a=this,c,d;if(CKEDITOR.plugins.clipboard.isCustomDataTypesSupported){if(this.$.types)for(c=0;c<this.$.types.length;c++)b(this.$.types[c])}else b("Text"),b("URL");d=this._getImageFromClipboard();if(this.$&&this.$.files||d){this._.files=[];for(c=0;c<this.$.files.length;c++)this._.files.push(this.$.files[c]);0===this._.files.length&&d&&this._.files.push(d)}}},getFilesCount:function(){return this._.files.length?this._.files.length:this.$&&this.$.files&&this.$.files.length?this.$.files.length:
this._getImageFromClipboard()?1:0},getFile:function(b){return this._.files.length?this._.files[b]:this.$&&this.$.files&&this.$.files.length?this.$.files[b]:0===b?this._getImageFromClipboard():void 0},isEmpty:function(){var b={},a;if(this.getFilesCount())return!1;for(a in this._.data)b[a]=1;if(this.$)if(CKEDITOR.plugins.clipboard.isCustomDataTypesSupported){if(this.$.types)for(var c=0;c<this.$.types.length;c++)b[this.$.types[c]]=1}else b.Text=1,b.URL=1;"Text"!=p&&(b[p]=0);for(a in b)if(b[a]&&""!==
this.getData(a))return!1;return!0},_getImageFromClipboard:function(){var b;if(this.$&&this.$.items&&this.$.items[0])try{if((b=this.$.items[0].getAsFile())&&b.type)return b}catch(a){}}}})();(function(){CKEDITOR.plugins.add("panel",{beforeInit:function(a){a.ui.addHandler(CKEDITOR.UI_PANEL,CKEDITOR.ui.panel.handler)}});CKEDITOR.UI_PANEL="panel";CKEDITOR.ui.panel=function(a,b){b&&CKEDITOR.tools.extend(this,b);CKEDITOR.tools.extend(this,{className:"",css:[]});this.id=CKEDITOR.tools.getNextId();this.document=a;this.isFramed=this.forceIFrame||this.css.length;this._={blocks:{}}};CKEDITOR.ui.panel.handler={create:function(a){return new CKEDITOR.ui.panel(a)}};var f=CKEDITOR.addTemplate("panel",
'\x3cdiv lang\x3d"{langCode}" id\x3d"{id}" dir\x3d{dir} class\x3d"cke cke_reset_all {editorId} cke_panel cke_panel {cls} cke_{dir}" style\x3d"z-index:{z-index}" role\x3d"presentation"\x3e{frame}\x3c/div\x3e'),g=CKEDITOR.addTemplate("panel-frame",'\x3ciframe id\x3d"{id}" class\x3d"cke_panel_frame" role\x3d"presentation" frameborder\x3d"0" src\x3d"{src}"\x3e\x3c/iframe\x3e'),h=CKEDITOR.addTemplate("panel-frame-inner",'\x3c!DOCTYPE html\x3e\x3chtml class\x3d"cke_panel_container {env}" dir\x3d"{dir}" lang\x3d"{langCode}"\x3e\x3chead\x3e{css}\x3c/head\x3e\x3cbody class\x3d"cke_{dir}" style\x3d"margin:0;padding:0" onload\x3d"{onload}"\x3e\x3c/body\x3e\x3c/html\x3e');
CKEDITOR.ui.panel.prototype={render:function(a,b){this.getHolderElement=function(){var a=this._.holder;if(!a){if(this.isFramed){var a=this.document.getById(this.id+"_frame"),b=a.getParent(),a=a.getFrameDocument();CKEDITOR.env.iOS&&b.setStyles({overflow:"scroll","-webkit-overflow-scrolling":"touch"});b=CKEDITOR.tools.addFunction(CKEDITOR.tools.bind(function(){this.isLoaded=!0;if(this.onLoad)this.onLoad()},this));a.write(h.output(CKEDITOR.tools.extend({css:CKEDITOR.tools.buildStyleHtml(this.css),onload:"window.parent.CKEDITOR.tools.callFunction("+
b+");"},d)));a.getWindow().$.CKEDITOR=CKEDITOR;a.on("keydown",function(a){var b=a.data.getKeystroke(),c=this.document.getById(this.id).getAttribute("dir");this._.onKeyDown&&!1===this._.onKeyDown(b)?a.data.preventDefault():(27==b||b==("rtl"==c?39:37))&&this.onEscape&&!1===this.onEscape(b)&&a.data.preventDefault()},this);a=a.getBody();a.unselectable();CKEDITOR.env.air&&CKEDITOR.tools.callFunction(b)}else a=this.document.getById(this.id);this._.holder=a}return a};var d={editorId:a.id,id:this.id,langCode:a.langCode,
dir:a.lang.dir,cls:this.className,frame:"",env:CKEDITOR.env.cssClass,"z-index":a.config.baseFloatZIndex+1};if(this.isFramed){var e=CKEDITOR.env.air?"javascript:void(0)":CKEDITOR.env.ie?"javascript:void(function(){"+encodeURIComponent("document.open();("+CKEDITOR.tools.fixDomain+")();document.close();")+"}())":"";d.frame=g.output({id:this.id+"_frame",src:e})}e=f.output(d);b&&b.push(e);return e},addBlock:function(a,b){b=this._.blocks[a]=b instanceof CKEDITOR.ui.panel.block?b:new CKEDITOR.ui.panel.block(this.getHolderElement(),
b);this._.currentBlock||this.showBlock(a);return b},getBlock:function(a){return this._.blocks[a]},showBlock:function(a){a=this._.blocks[a];var b=this._.currentBlock,d=!this.forceIFrame||CKEDITOR.env.ie?this._.holder:this.document.getById(this.id+"_frame");b&&b.hide();this._.currentBlock=a;CKEDITOR.fire("ariaWidget",d);a._.focusIndex=-1;this._.onKeyDown=a.onKeyDown&&CKEDITOR.tools.bind(a.onKeyDown,a);a.show();return a},destroy:function(){this.element&&this.element.remove()}};CKEDITOR.ui.panel.block=
CKEDITOR.tools.createClass({$:function(a,b){this.element=a.append(a.getDocument().createElement("div",{attributes:{tabindex:-1,"class":"cke_panel_block"},styles:{display:"none"}}));b&&CKEDITOR.tools.extend(this,b);this.element.setAttributes({role:this.attributes.role||"presentation","aria-label":this.attributes["aria-label"],title:this.attributes.title||this.attributes["aria-label"]});this.keys={};this._.focusIndex=-1;this.element.disableContextMenu()},_:{markItem:function(a){-1!=a&&(a=this.element.getElementsByTag("a").getItem(this._.focusIndex=
a),CKEDITOR.env.webkit&&a.getDocument().getWindow().focus(),a.focus(),this.onMark&&this.onMark(a))}},proto:{show:function(){this.element.setStyle("display","")},hide:function(){this.onHide&&!0===this.onHide.call(this)||this.element.setStyle("display","none")},onKeyDown:function(a,b){var d=this.keys[a];switch(d){case "next":for(var e=this._.focusIndex,d=this.element.getElementsByTag("a"),c;c=d.getItem(++e);)if(c.getAttribute("_cke_focus")&&c.$.offsetWidth){this._.focusIndex=e;c.focus();break}return c||
b?!1:(this._.focusIndex=-1,this.onKeyDown(a,1));case "prev":e=this._.focusIndex;for(d=this.element.getElementsByTag("a");0<e&&(c=d.getItem(--e));){if(c.getAttribute("_cke_focus")&&c.$.offsetWidth){this._.focusIndex=e;c.focus();break}c=null}return c||b?!1:(this._.focusIndex=d.count(),this.onKeyDown(a,1));case "click":case "mouseup":return e=this._.focusIndex,(c=0<=e&&this.element.getElementsByTag("a").getItem(e))&&(c.$[d]?c.$[d]():c.$["on"+d]()),!1}return!0}}})})();CKEDITOR.plugins.add("floatpanel",{requires:"panel"});
(function(){function v(a,b,c,l,h){h=CKEDITOR.tools.genKey(b.getUniqueId(),c.getUniqueId(),a.lang.dir,a.uiColor||"",l.css||"",h||"");var g=f[h];g||(g=f[h]=new CKEDITOR.ui.panel(b,l),g.element=c.append(CKEDITOR.dom.element.createFromHtml(g.render(a),b)),g.element.setStyles({display:"none",position:"absolute"}));return g}var f={};CKEDITOR.ui.floatPanel=CKEDITOR.tools.createClass({$:function(a,b,c,l){function h(){e.hide()}c.forceIFrame=1;c.toolbarRelated&&a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE&&
(b=CKEDITOR.document.getById("cke_"+a.name));var g=b.getDocument();l=v(a,g,b,c,l||0);var m=l.element,p=m.getFirst(),e=this;m.disableContextMenu();this.element=m;this._={editor:a,panel:l,parentElement:b,definition:c,document:g,iframe:p,children:[],dir:a.lang.dir,showBlockParams:null};a.on("mode",h);a.on("resize",h);g.getWindow().on("resize",function(){this.reposition()},this)},proto:{addBlock:function(a,b){return this._.panel.addBlock(a,b)},addListBlock:function(a,b){return this._.panel.addListBlock(a,
b)},getBlock:function(a){return this._.panel.getBlock(a)},showBlock:function(a,b,c,l,h,g){var m=this._.panel,p=m.showBlock(a);this._.showBlockParams=[].slice.call(arguments);this.allowBlur(!1);var e=this._.editor.editable();this._.returnFocus=e.hasFocus?e:new CKEDITOR.dom.element(CKEDITOR.document.$.activeElement);this._.hideTimeout=0;var k=this.element,e=this._.iframe,e=CKEDITOR.env.ie&&!CKEDITOR.env.edge?e:new CKEDITOR.dom.window(e.$.contentWindow),f=k.getDocument(),r=this._.parentElement.getPositionedAncestor(),
t=b.getDocumentPosition(f),f=r?r.getDocumentPosition(f):{x:0,y:0},q="rtl"==this._.dir,d=t.x+(l||0)-f.x,n=t.y+(h||0)-f.y;!q||1!=c&&4!=c?q||2!=c&&3!=c||(d+=b.$.offsetWidth-1):d+=b.$.offsetWidth;if(3==c||4==c)n+=b.$.offsetHeight-1;this._.panel._.offsetParentId=b.getId();k.setStyles({top:n+"px",left:0,display:""});k.setOpacity(0);k.getFirst().removeStyle("width");this._.editor.focusManager.add(e);this._.blurSet||(CKEDITOR.event.useCapture=!0,e.on("blur",function(a){function u(){delete this._.returnFocus;
this.hide()}this.allowBlur()&&a.data.getPhase()==CKEDITOR.EVENT_PHASE_AT_TARGET&&this.visible&&!this._.activeChild&&(CKEDITOR.env.iOS?this._.hideTimeout||(this._.hideTimeout=CKEDITOR.tools.setTimeout(u,0,this)):u.call(this))},this),e.on("focus",function(){this._.focused=!0;this.hideChild();this.allowBlur(!0)},this),CKEDITOR.env.iOS&&(e.on("touchstart",function(){clearTimeout(this._.hideTimeout)},this),e.on("touchend",function(){this._.hideTimeout=0;this.focus()},this)),CKEDITOR.event.useCapture=!1,
this._.blurSet=1);m.onEscape=CKEDITOR.tools.bind(function(a){if(this.onEscape&&!1===this.onEscape(a))return!1},this);CKEDITOR.tools.setTimeout(function(){var a=CKEDITOR.tools.bind(function(){var a=k;a.removeStyle("width");if(p.autoSize){var b=p.element.getDocument(),b=(CKEDITOR.env.webkit?p.element:b.getBody()).$.scrollWidth;CKEDITOR.env.ie&&CKEDITOR.env.quirks&&0<b&&(b+=(a.$.offsetWidth||0)-(a.$.clientWidth||0)+3);a.setStyle("width",b+10+"px");b=p.element.$.scrollHeight;CKEDITOR.env.ie&&CKEDITOR.env.quirks&&
0<b&&(b+=(a.$.offsetHeight||0)-(a.$.clientHeight||0)+3);a.setStyle("height",b+"px");m._.currentBlock.element.setStyle("display","none").removeStyle("display")}else a.removeStyle("height");q&&(d-=k.$.offsetWidth);k.setStyle("left",d+"px");var b=m.element.getWindow(),a=k.$.getBoundingClientRect(),b=b.getViewPaneSize(),c=a.width||a.right-a.left,e=a.height||a.bottom-a.top,l=q?a.right:b.width-a.left,h=q?b.width-a.right:a.left;q?l<c&&(d=h>c?d+c:b.width>c?d-a.left:d-a.right+b.width):l<c&&(d=h>c?d-c:b.width>
c?d-a.right+b.width:d-a.left);c=a.top;b.height-a.top<e&&(n=c>e?n-e:b.height>e?n-a.bottom+b.height:n-a.top);CKEDITOR.env.ie&&(b=a=new CKEDITOR.dom.element(k.$.offsetParent),"html"==b.getName()&&(b=b.getDocument().getBody()),"rtl"==b.getComputedStyle("direction")&&(d=CKEDITOR.env.ie8Compat?d-2*k.getDocument().getDocumentElement().$.scrollLeft:d-(a.$.scrollWidth-a.$.clientWidth)));var a=k.getFirst(),f;(f=a.getCustomData("activePanel"))&&f.onHide&&f.onHide.call(this,1);a.setCustomData("activePanel",this);
k.setStyles({top:n+"px",left:d+"px"});k.setOpacity(1);g&&g()},this);m.isLoaded?a():m.onLoad=a;CKEDITOR.tools.setTimeout(function(){var a=CKEDITOR.env.webkit&&CKEDITOR.document.getWindow().getScrollPosition().y;this.focus();p.element.focus();CKEDITOR.env.webkit&&(CKEDITOR.document.getBody().$.scrollTop=a);this.allowBlur(!0);this._.editor.fire("panelShow",this)},0,this)},CKEDITOR.env.air?200:0,this);this.visible=1;this.onShow&&this.onShow.call(this)},reposition:function(){var a=this._.showBlockParams;
this.visible&&this._.showBlockParams&&(this.hide(),this.showBlock.apply(this,a))},focus:function(){if(CKEDITOR.env.webkit){var a=CKEDITOR.document.getActive();a&&!a.equals(this._.iframe)&&a.$.blur()}(this._.lastFocused||this._.iframe.getFrameDocument().getWindow()).focus()},blur:function(){var a=this._.iframe.getFrameDocument().getActive();a&&a.is("a")&&(this._.lastFocused=a)},hide:function(a){if(this.visible&&(!this.onHide||!0!==this.onHide.call(this))){this.hideChild();CKEDITOR.env.gecko&&this._.iframe.getFrameDocument().$.activeElement.blur();
this.element.setStyle("display","none");this.visible=0;this.element.getFirst().removeCustomData("activePanel");if(a=a&&this._.returnFocus)CKEDITOR.env.webkit&&a.type&&a.getWindow().$.focus(),a.focus();delete this._.lastFocused;this._.showBlockParams=null;this._.editor.fire("panelHide",this)}},allowBlur:function(a){var b=this._.panel;void 0!==a&&(b.allowBlur=a);return b.allowBlur},showAsChild:function(a,b,c,f,h,g){if(this._.activeChild!=a||a._.panel._.offsetParentId!=c.getId())this.hideChild(),a.onHide=
CKEDITOR.tools.bind(function(){CKEDITOR.tools.setTimeout(function(){this._.focused||this.hide()},0,this)},this),this._.activeChild=a,this._.focused=!1,a.showBlock(b,c,f,h,g),this.blur(),(CKEDITOR.env.ie7Compat||CKEDITOR.env.ie6Compat)&&setTimeout(function(){a.element.getChild(0).$.style.cssText+=""},100)},hideChild:function(a){var b=this._.activeChild;b&&(delete b.onHide,delete this._.activeChild,b.hide(),a&&this.focus())}}});CKEDITOR.on("instanceDestroyed",function(){var a=CKEDITOR.tools.isEmpty(CKEDITOR.instances),
b;for(b in f){var c=f[b];a?c.destroy():c.element.hide()}a&&(f={})})})();CKEDITOR.plugins.add("menu",{requires:"floatpanel",beforeInit:function(g){for(var h=g.config.menu_groups.split(","),p=g._.menuGroups={},n=g._.menuItems={},a=0;a<h.length;a++)p[h[a]]=a+1;g.addMenuGroup=function(b,a){p[b]=a||100};g.addMenuItem=function(a,c){p[c.group]&&(n[a]=new CKEDITOR.menuItem(this,a,c))};g.addMenuItems=function(a){for(var c in a)this.addMenuItem(c,a[c])};g.getMenuItem=function(a){return n[a]};g.removeMenuItem=function(a){delete n[a]}}});
(function(){function g(a){a.sort(function(a,c){return a.group<c.group?-1:a.group>c.group?1:a.order<c.order?-1:a.order>c.order?1:0})}var h='\x3cspan class\x3d"cke_menuitem"\x3e\x3ca id\x3d"{id}" class\x3d"cke_menubutton cke_menubutton__{name} cke_menubutton_{state} {cls}" href\x3d"{href}" title\x3d"{title}" tabindex\x3d"-1"_cke_focus\x3d1 hidefocus\x3d"true" role\x3d"{role}" aria-haspopup\x3d"{hasPopup}" aria-disabled\x3d"{disabled}" {ariaChecked}';CKEDITOR.env.gecko&&CKEDITOR.env.mac&&(h+=' onkeypress\x3d"return false;"');
CKEDITOR.env.gecko&&(h+=' onblur\x3d"this.style.cssText \x3d this.style.cssText;"');var h=h+(' onmouseover\x3d"CKEDITOR.tools.callFunction({hoverFn},{index});" onmouseout\x3d"CKEDITOR.tools.callFunction({moveOutFn},{index});" '+(CKEDITOR.env.ie?'onclick\x3d"return false;" onmouseup':"onclick")+'\x3d"CKEDITOR.tools.callFunction({clickFn},{index}); return false;"\x3e'),p=CKEDITOR.addTemplate("menuItem",h+'\x3cspan class\x3d"cke_menubutton_inner"\x3e\x3cspan class\x3d"cke_menubutton_icon"\x3e\x3cspan class\x3d"cke_button_icon cke_button__{iconName}_icon" style\x3d"{iconStyle}"\x3e\x3c/span\x3e\x3c/span\x3e\x3cspan class\x3d"cke_menubutton_label"\x3e{label}\x3c/span\x3e{arrowHtml}\x3c/span\x3e\x3c/a\x3e\x3c/span\x3e'),
n=CKEDITOR.addTemplate("menuArrow",'\x3cspan class\x3d"cke_menuarrow"\x3e\x3cspan\x3e{label}\x3c/span\x3e\x3c/span\x3e');CKEDITOR.menu=CKEDITOR.tools.createClass({$:function(a,b){b=this._.definition=b||{};this.id=CKEDITOR.tools.getNextId();this.editor=a;this.items=[];this._.listeners=[];this._.level=b.level||1;var c=CKEDITOR.tools.extend({},b.panel,{css:[CKEDITOR.skin.getPath("editor")],level:this._.level-1,block:{}}),m=c.block.attributes=c.attributes||{};!m.role&&(m.role="menu");this._.panelDefinition=
c},_:{onShow:function(){var a=this.editor.getSelection(),b=a&&a.getStartElement(),c=this.editor.elementPath(),m=this._.listeners;this.removeAll();for(var e=0;e<m.length;e++){var l=m[e](b,a,c);if(l)for(var k in l){var f=this.editor.getMenuItem(k);!f||f.command&&!this.editor.getCommand(f.command).state||(f.state=l[k],this.add(f))}}},onClick:function(a){this.hide();if(a.onClick)a.onClick();else a.command&&this.editor.execCommand(a.command)},onEscape:function(a){var b=this.parent;b?b._.panel.hideChild(1):
27==a&&this.hide(1);return!1},onHide:function(){this.onHide&&this.onHide()},showSubMenu:function(a){var b=this._.subMenu,c=this.items[a];if(c=c.getItems&&c.getItems()){b?b.removeAll():(b=this._.subMenu=new CKEDITOR.menu(this.editor,CKEDITOR.tools.extend({},this._.definition,{level:this._.level+1},!0)),b.parent=this,b._.onClick=CKEDITOR.tools.bind(this._.onClick,this));for(var m in c){var e=this.editor.getMenuItem(m);e&&(e.state=c[m],b.add(e))}var l=this._.panel.getBlock(this.id).element.getDocument().getById(this.id+
String(a));setTimeout(function(){b.show(l,2)},0)}else this._.panel.hideChild(1)}},proto:{add:function(a){a.order||(a.order=this.items.length);this.items.push(a)},removeAll:function(){this.items=[]},show:function(a,b,c,m){if(!this.parent&&(this._.onShow(),!this.items.length))return;b=b||("rtl"==this.editor.lang.dir?2:1);var e=this.items,l=this.editor,k=this._.panel,f=this._.element;if(!k){k=this._.panel=new CKEDITOR.ui.floatPanel(this.editor,CKEDITOR.document.getBody(),this._.panelDefinition,this._.level);
k.onEscape=CKEDITOR.tools.bind(function(a){if(!1===this._.onEscape(a))return!1},this);k.onShow=function(){k._.panel.getHolderElement().getParent().addClass("cke").addClass("cke_reset_all")};k.onHide=CKEDITOR.tools.bind(function(){this._.onHide&&this._.onHide()},this);f=k.addBlock(this.id,this._.panelDefinition.block);f.autoSize=!0;var d=f.keys;d[40]="next";d[9]="next";d[38]="prev";d[CKEDITOR.SHIFT+9]="prev";d["rtl"==l.lang.dir?37:39]=CKEDITOR.env.ie?"mouseup":"click";d[32]=CKEDITOR.env.ie?"mouseup":
"click";CKEDITOR.env.ie&&(d[13]="mouseup");f=this._.element=f.element;d=f.getDocument();d.getBody().setStyle("overflow","hidden");d.getElementsByTag("html").getItem(0).setStyle("overflow","hidden");this._.itemOverFn=CKEDITOR.tools.addFunction(function(a){clearTimeout(this._.showSubTimeout);this._.showSubTimeout=CKEDITOR.tools.setTimeout(this._.showSubMenu,l.config.menu_subMenuDelay||400,this,[a])},this);this._.itemOutFn=CKEDITOR.tools.addFunction(function(){clearTimeout(this._.showSubTimeout)},this);
this._.itemClickFn=CKEDITOR.tools.addFunction(function(a){var b=this.items[a];if(b.state==CKEDITOR.TRISTATE_DISABLED)this.hide(1);else if(b.getItems)this._.showSubMenu(a);else this._.onClick(b)},this)}g(e);for(var d=l.elementPath(),d=['\x3cdiv class\x3d"cke_menu'+(d&&d.direction()!=l.lang.dir?" cke_mixed_dir_content":"")+'" role\x3d"presentation"\x3e'],h=e.length,p=h&&e[0].group,n=0;n<h;n++){var q=e[n];p!=q.group&&(d.push('\x3cdiv class\x3d"cke_menuseparator" role\x3d"separator"\x3e\x3c/div\x3e'),
p=q.group);q.render(this,n,d)}d.push("\x3c/div\x3e");f.setHtml(d.join(""));CKEDITOR.ui.fire("ready",this);this.parent?this.parent._.panel.showAsChild(k,this.id,a,b,c,m):k.showBlock(this.id,a,b,c,m);l.fire("menuShow",[k])},addListener:function(a){this._.listeners.push(a)},hide:function(a){this._.onHide&&this._.onHide();this._.panel&&this._.panel.hide(a)}}});CKEDITOR.menuItem=CKEDITOR.tools.createClass({$:function(a,b,c){CKEDITOR.tools.extend(this,c,{order:0,className:"cke_menubutton__"+b});this.group=
a._.menuGroups[this.group];this.editor=a;this.name=b},proto:{render:function(a,b,c){var h=a.id+String(b),e="undefined"==typeof this.state?CKEDITOR.TRISTATE_OFF:this.state,l="",k=e==CKEDITOR.TRISTATE_ON?"on":e==CKEDITOR.TRISTATE_DISABLED?"disabled":"off";this.role in{menuitemcheckbox:1,menuitemradio:1}&&(l=' aria-checked\x3d"'+(e==CKEDITOR.TRISTATE_ON?"true":"false")+'"');var f=this.getItems,d="\x26#"+("rtl"==this.editor.lang.dir?"9668":"9658")+";",g=this.name;this.icon&&!/\./.test(this.icon)&&(g=
this.icon);a={id:h,name:this.name,iconName:g,label:this.label,cls:this.className||"",state:k,hasPopup:f?"true":"false",disabled:e==CKEDITOR.TRISTATE_DISABLED,title:this.label,href:"javascript:void('"+(this.label||"").replace("'")+"')",hoverFn:a._.itemOverFn,moveOutFn:a._.itemOutFn,clickFn:a._.itemClickFn,index:b,iconStyle:CKEDITOR.skin.getIconStyle(g,"rtl"==this.editor.lang.dir,g==this.icon?null:this.icon,this.iconOffset),arrowHtml:f?n.output({label:d}):"",role:this.role?this.role:"menuitem",ariaChecked:l};
p.output(a,c)}}})})();CKEDITOR.config.menu_groups="clipboard,form,tablecell,tablecellproperties,tablerow,tablecolumn,table,anchor,link,image,flash,checkbox,radio,textfield,hiddenfield,imagebutton,button,select,textarea,div";CKEDITOR.plugins.add("contextmenu",{requires:"menu",onLoad:function(){CKEDITOR.plugins.contextMenu=CKEDITOR.tools.createClass({base:CKEDITOR.menu,$:function(a){this.base.call(this,a,{panel:{className:"cke_menu_panel",attributes:{"aria-label":a.lang.contextmenu.options}}})},proto:{addTarget:function(a,e){a.on("contextmenu",function(a){a=a.data;var c=CKEDITOR.env.webkit?f:CKEDITOR.env.mac?a.$.metaKey:a.$.ctrlKey;if(!e||!c){a.preventDefault();if(CKEDITOR.env.mac&&CKEDITOR.env.webkit){var c=this.editor,
b=(new CKEDITOR.dom.elementPath(a.getTarget(),c.editable())).contains(function(a){return a.hasAttribute("contenteditable")},!0);b&&"false"==b.getAttribute("contenteditable")&&c.getSelection().fake(b)}var b=a.getTarget().getDocument(),d=a.getTarget().getDocument().getDocumentElement(),c=!b.equals(CKEDITOR.document),b=b.getWindow().getScrollPosition(),g=c?a.$.clientX:a.$.pageX||b.x+a.$.clientX,h=c?a.$.clientY:a.$.pageY||b.y+a.$.clientY;CKEDITOR.tools.setTimeout(function(){this.open(d,null,g,h)},CKEDITOR.env.ie?
200:0,this)}},this);if(CKEDITOR.env.webkit){var f,d=function(){f=0};a.on("keydown",function(a){f=CKEDITOR.env.mac?a.data.$.metaKey:a.data.$.ctrlKey});a.on("keyup",d);a.on("contextmenu",d)}},open:function(a,e,f,d){this.editor.focus();a=a||CKEDITOR.document.getDocumentElement();this.editor.selectionChange(1);this.show(a,e,f,d)}}})},beforeInit:function(a){var e=a.contextMenu=new CKEDITOR.plugins.contextMenu(a);a.on("contentDom",function(){e.addTarget(a.editable(),!1!==a.config.browserContextMenuOnCtrl)});
a.addCommand("contextMenu",{exec:function(){a.contextMenu.open(a.document.getBody())}});a.setKeystroke(CKEDITOR.SHIFT+121,"contextMenu");a.setKeystroke(CKEDITOR.CTRL+CKEDITOR.SHIFT+121,"contextMenu")}});CKEDITOR.plugins.add("resize",{init:function(b){function f(d){var e=c.width,m=c.height,f=e+(d.data.$.screenX-n.x)*("rtl"==g?-1:1);d=m+(d.data.$.screenY-n.y);h&&(e=Math.max(a.resize_minWidth,Math.min(f,a.resize_maxWidth)));p&&(m=Math.max(a.resize_minHeight,Math.min(d,a.resize_maxHeight)));b.resize(h?e:null,m)}function k(){CKEDITOR.document.removeListener("mousemove",f);CKEDITOR.document.removeListener("mouseup",k);b.document&&(b.document.removeListener("mousemove",f),b.document.removeListener("mouseup",
k))}var a=b.config,r=b.ui.spaceId("resizer"),g=b.element?b.element.getDirection(1):"ltr";!a.resize_dir&&(a.resize_dir="vertical");void 0===a.resize_maxWidth&&(a.resize_maxWidth=3E3);void 0===a.resize_maxHeight&&(a.resize_maxHeight=3E3);void 0===a.resize_minWidth&&(a.resize_minWidth=750);void 0===a.resize_minHeight&&(a.resize_minHeight=250);if(!1!==a.resize_enabled){var l=null,n,c,h=("both"==a.resize_dir||"horizontal"==a.resize_dir)&&a.resize_minWidth!=a.resize_maxWidth,p=("both"==a.resize_dir||"vertical"==
a.resize_dir)&&a.resize_minHeight!=a.resize_maxHeight,q=CKEDITOR.tools.addFunction(function(d){l||(l=b.getResizable());c={width:l.$.offsetWidth||0,height:l.$.offsetHeight||0};n={x:d.screenX,y:d.screenY};a.resize_minWidth>c.width&&(a.resize_minWidth=c.width);a.resize_minHeight>c.height&&(a.resize_minHeight=c.height);CKEDITOR.document.on("mousemove",f);CKEDITOR.document.on("mouseup",k);b.document&&(b.document.on("mousemove",f),b.document.on("mouseup",k));d.preventDefault&&d.preventDefault()});b.on("destroy",
function(){CKEDITOR.tools.removeFunction(q)});b.on("uiSpace",function(a){if("bottom"==a.data.space){var e="";h&&!p&&(e=" cke_resizer_horizontal");!h&&p&&(e=" cke_resizer_vertical");var c='\x3cspan id\x3d"'+r+'" class\x3d"cke_resizer'+e+" cke_resizer_"+g+'" title\x3d"'+CKEDITOR.tools.htmlEncode(b.lang.common.resize)+'" onmousedown\x3d"CKEDITOR.tools.callFunction('+q+', event)"\x3e'+("ltr"==g?"◢":"◣")+"\x3c/span\x3e";"ltr"==g&&"ltr"==e?a.data.html+=c:a.data.html=c+a.data.html}},b,null,100);b.on("maximize",
function(a){b.ui.space("resizer")[a.data==CKEDITOR.TRISTATE_ON?"hide":"show"]()})}}});(function(){var c='\x3ca id\x3d"{id}" class\x3d"cke_button cke_button__{name} cke_button_{state} {cls}"'+(CKEDITOR.env.gecko&&!CKEDITOR.env.hc?"":" href\x3d\"javascript:void('{titleJs}')\"")+' title\x3d"{title}" tabindex\x3d"-1" hidefocus\x3d"true" role\x3d"button" aria-labelledby\x3d"{id}_label" aria-haspopup\x3d"{hasArrow}" aria-disabled\x3d"{ariaDisabled}"';CKEDITOR.env.gecko&&CKEDITOR.env.mac&&(c+=' onkeypress\x3d"return false;"');CKEDITOR.env.gecko&&(c+=' onblur\x3d"this.style.cssText \x3d this.style.cssText;"');
var c=c+(' onkeydown\x3d"return CKEDITOR.tools.callFunction({keydownFn},event);" onfocus\x3d"return CKEDITOR.tools.callFunction({focusFn},event);" '+(CKEDITOR.env.ie?'onclick\x3d"return false;" onmouseup':"onclick")+'\x3d"CKEDITOR.tools.callFunction({clickFn},this);return false;"\x3e\x3cspan class\x3d"cke_button_icon cke_button__{iconName}_icon" style\x3d"{style}"'),c=c+'\x3e\x26nbsp;\x3c/span\x3e\x3cspan id\x3d"{id}_label" class\x3d"cke_button_label cke_button__{name}_label" aria-hidden\x3d"false"\x3e{label}\x3c/span\x3e{arrowHtml}\x3c/a\x3e',
r=CKEDITOR.addTemplate("buttonArrow",'\x3cspan class\x3d"cke_button_arrow"\x3e'+(CKEDITOR.env.hc?"\x26#9660;":"")+"\x3c/span\x3e"),t=CKEDITOR.addTemplate("button",c);CKEDITOR.plugins.add("button",{beforeInit:function(a){a.ui.addHandler(CKEDITOR.UI_BUTTON,CKEDITOR.ui.button.handler)}});CKEDITOR.UI_BUTTON="button";CKEDITOR.ui.button=function(a){CKEDITOR.tools.extend(this,a,{title:a.label,click:a.click||function(b){b.execCommand(a.command)}});this._={}};CKEDITOR.ui.button.handler={create:function(a){return new CKEDITOR.ui.button(a)}};
CKEDITOR.ui.button.prototype={render:function(a,b){function c(){var e=a.mode;e&&(e=this.modes[e]?void 0!==k[e]?k[e]:CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,e=a.readOnly&&!this.readOnly?CKEDITOR.TRISTATE_DISABLED:e,this.setState(e),this.refresh&&this.refresh())}var l=CKEDITOR.env,m=this._.id=CKEDITOR.tools.getNextId(),f="",g=this.command,n;this._.editor=a;var d={id:m,button:this,editor:a,focus:function(){CKEDITOR.document.getById(m).focus()},execute:function(){this.button.click(a)},attach:function(a){this.button.attach(a)}},
u=CKEDITOR.tools.addFunction(function(a){if(d.onkey)return a=new CKEDITOR.dom.event(a),!1!==d.onkey(d,a.getKeystroke())}),v=CKEDITOR.tools.addFunction(function(a){var b;d.onfocus&&(b=!1!==d.onfocus(d,new CKEDITOR.dom.event(a)));return b}),p=0;d.clickFn=n=CKEDITOR.tools.addFunction(function(){p&&(a.unlockSelection(1),p=0);d.execute();l.iOS&&a.focus()});if(this.modes){var k={};a.on("beforeModeUnload",function(){a.mode&&this._.state!=CKEDITOR.TRISTATE_DISABLED&&(k[a.mode]=this._.state)},this);a.on("activeFilterChange",
c,this);a.on("mode",c,this);!this.readOnly&&a.on("readOnly",c,this)}else g&&(g=a.getCommand(g))&&(g.on("state",function(){this.setState(g.state)},this),f+=g.state==CKEDITOR.TRISTATE_ON?"on":g.state==CKEDITOR.TRISTATE_DISABLED?"disabled":"off");if(this.directional)a.on("contentDirChanged",function(b){var c=CKEDITOR.document.getById(this._.id),d=c.getFirst();b=b.data;b!=a.lang.dir?c.addClass("cke_"+b):c.removeClass("cke_ltr").removeClass("cke_rtl");d.setAttribute("style",CKEDITOR.skin.getIconStyle(h,
"rtl"==b,this.icon,this.iconOffset))},this);g||(f+="off");var q=this.name||this.command,h=q;this.icon&&!/\./.test(this.icon)&&(h=this.icon,this.icon=null);f={id:m,name:q,iconName:h,label:this.label,cls:this.className||"",state:f,ariaDisabled:"disabled"==f?"true":"false",title:this.title,titleJs:l.gecko&&!l.hc?"":(this.title||"").replace("'",""),hasArrow:this.hasArrow?"true":"false",keydownFn:u,focusFn:v,clickFn:n,style:CKEDITOR.skin.getIconStyle(h,"rtl"==a.lang.dir,this.icon,this.iconOffset),arrowHtml:this.hasArrow?
r.output():""};t.output(f,b);if(this.onRender)this.onRender();return d},setState:function(a){if(this._.state==a)return!1;this._.state=a;var b=CKEDITOR.document.getById(this._.id);return b?(b.setState(a,"cke_button"),a==CKEDITOR.TRISTATE_DISABLED?b.setAttribute("aria-disabled",!0):b.removeAttribute("aria-disabled"),this.hasArrow?(a=a==CKEDITOR.TRISTATE_ON?this._.editor.lang.button.selectedLabel.replace(/%1/g,this.label):this.label,CKEDITOR.document.getById(this._.id+"_label").setText(a)):a==CKEDITOR.TRISTATE_ON?
b.setAttribute("aria-pressed",!0):b.removeAttribute("aria-pressed"),!0):!1},getState:function(){return this._.state},toFeature:function(a){if(this._.feature)return this._.feature;var b=this;this.allowedContent||this.requiredContent||!this.command||(b=a.getCommand(this.command)||b);return this._.feature=b}};CKEDITOR.ui.prototype.addButton=function(a,b){this.add(a,CKEDITOR.UI_BUTTON,b)}})();(function(){function B(a){function d(){for(var b=g(),e=CKEDITOR.tools.clone(a.config.toolbarGroups)||q(a),f=0;f<e.length;f++){var l=e[f];if("/"!=l){"string"==typeof l&&(l=e[f]={name:l});var m,d=l.groups;if(d)for(var h=0;h<d.length;h++)m=d[h],(m=b[m])&&c(l,m);(m=b[l.name])&&c(l,m)}}return e}function g(){var b={},c,f,e;for(c in a.ui.items)f=a.ui.items[c],e=f.toolbar||"others",e=e.split(","),f=e[0],e=parseInt(e[1]||-1,10),b[f]||(b[f]=[]),b[f].push({name:c,order:e});for(f in b)b[f]=b[f].sort(function(b,
a){return b.order==a.order?0:0>a.order?-1:0>b.order?1:b.order<a.order?-1:1});return b}function c(c,e){if(e.length){c.items?c.items.push(a.ui.create("-")):c.items=[];for(var f;f=e.shift();)f="string"==typeof f?f:f.name,b&&-1!=CKEDITOR.tools.indexOf(b,f)||(f=a.ui.create(f))&&a.addFeature(f)&&c.items.push(f)}}function h(b){var a=[],e,d,h;for(e=0;e<b.length;++e)d=b[e],h={},"/"==d?a.push(d):CKEDITOR.tools.isArray(d)?(c(h,CKEDITOR.tools.clone(d)),a.push(h)):d.items&&(c(h,CKEDITOR.tools.clone(d.items)),
h.name=d.name,a.push(h));return a}var b=a.config.removeButtons,b=b&&b.split(","),e=a.config.toolbar;"string"==typeof e&&(e=a.config["toolbar_"+e]);return a.toolbar=e?h(e):d()}function q(a){return a._.toolbarGroups||(a._.toolbarGroups=[{name:"document",groups:["mode","document","doctools"]},{name:"clipboard",groups:["clipboard","undo"]},{name:"editing",groups:["find","selection","spellchecker"]},{name:"forms"},"/",{name:"basicstyles",groups:["basicstyles","cleanup"]},{name:"paragraph",groups:["list",
"indent","blocks","align","bidi"]},{name:"links"},{name:"insert"},"/",{name:"styles"},{name:"colors"},{name:"tools"},{name:"others"},{name:"about"}])}var y=function(){this.toolbars=[];this.focusCommandExecuted=!1};y.prototype.focus=function(){for(var a=0,d;d=this.toolbars[a++];)for(var g=0,c;c=d.items[g++];)if(c.focus){c.focus();return}};var C={modes:{wysiwyg:1,source:1},readOnly:1,exec:function(a){a.toolbox&&(a.toolbox.focusCommandExecuted=!0,CKEDITOR.env.ie||CKEDITOR.env.air?setTimeout(function(){a.toolbox.focus()},
100):a.toolbox.focus())}};CKEDITOR.plugins.add("toolbar",{requires:"button",init:function(a){var d,g=function(c,h){var b,e="rtl"==a.lang.dir,k=a.config.toolbarGroupCycling,r=e?37:39,e=e?39:37,k=void 0===k||k;switch(h){case 9:case CKEDITOR.SHIFT+9:for(;!b||!b.items.length;)if(b=9==h?(b?b.next:c.toolbar.next)||a.toolbox.toolbars[0]:(b?b.previous:c.toolbar.previous)||a.toolbox.toolbars[a.toolbox.toolbars.length-1],b.items.length)for(c=b.items[d?b.items.length-1:0];c&&!c.focus;)(c=d?c.previous:c.next)||
(b=0);c&&c.focus();return!1;case r:b=c;do b=b.next,!b&&k&&(b=c.toolbar.items[0]);while(b&&!b.focus);b?b.focus():g(c,9);return!1;case 40:return c.button&&c.button.hasArrow?(a.once("panelShow",function(b){b.data._.panel._.currentBlock.onKeyDown(40)}),c.execute()):g(c,40==h?r:e),!1;case e:case 38:b=c;do b=b.previous,!b&&k&&(b=c.toolbar.items[c.toolbar.items.length-1]);while(b&&!b.focus);b?b.focus():(d=1,g(c,CKEDITOR.SHIFT+9),d=0);return!1;case 27:return a.focus(),!1;case 13:case 32:return c.execute(),
!1}return!0};a.on("uiSpace",function(c){if(c.data.space==a.config.toolbarLocation){c.removeListener();a.toolbox=new y;var d=CKEDITOR.tools.getNextId(),b=['\x3cspan id\x3d"',d,'" class\x3d"cke_voice_label"\x3e',a.lang.toolbar.toolbars,"\x3c/span\x3e",'\x3cspan id\x3d"'+a.ui.spaceId("toolbox")+'" class\x3d"cke_toolbox" role\x3d"group" aria-labelledby\x3d"',d,'" onmousedown\x3d"return false;"\x3e'],d=!1!==a.config.toolbarStartupExpanded,e,k;a.config.toolbarCanCollapse&&a.elementMode!=CKEDITOR.ELEMENT_MODE_INLINE&&
b.push('\x3cspan class\x3d"cke_toolbox_main"'+(d?"\x3e":' style\x3d"display:none"\x3e'));for(var r=a.toolbox.toolbars,f=B(a),l=0;l<f.length;l++){var m,n=0,v,p=f[l],w;if(p)if(e&&(b.push("\x3c/span\x3e"),k=e=0),"/"===p)b.push('\x3cspan class\x3d"cke_toolbar_break"\x3e\x3c/span\x3e');else{w=p.items||p;for(var x=0;x<w.length;x++){var t=w[x],q;if(t){var z=function(c){c=c.render(a,b);u=n.items.push(c)-1;0<u&&(c.previous=n.items[u-1],c.previous.next=c);c.toolbar=n;c.onkey=g;c.onfocus=function(){a.toolbox.focusCommandExecuted||
a.focus()}};if(t.type==CKEDITOR.UI_SEPARATOR)k=e&&t;else{q=!1!==t.canGroup;if(!n){m=CKEDITOR.tools.getNextId();n={id:m,items:[]};v=p.name&&(a.lang.toolbar.toolbarGroups[p.name]||p.name);b.push('\x3cspan id\x3d"',m,'" class\x3d"cke_toolbar"',v?' aria-labelledby\x3d"'+m+'_label"':"",' role\x3d"toolbar"\x3e');v&&b.push('\x3cspan id\x3d"',m,'_label" class\x3d"cke_voice_label"\x3e',v,"\x3c/span\x3e");b.push('\x3cspan class\x3d"cke_toolbar_start"\x3e\x3c/span\x3e');var u=r.push(n)-1;0<u&&(n.previous=r[u-
1],n.previous.next=n)}q?e||(b.push('\x3cspan class\x3d"cke_toolgroup" role\x3d"presentation"\x3e'),e=1):e&&(b.push("\x3c/span\x3e"),e=0);k&&(z(k),k=0);z(t)}}}e&&(b.push("\x3c/span\x3e"),k=e=0);n&&b.push('\x3cspan class\x3d"cke_toolbar_end"\x3e\x3c/span\x3e\x3c/span\x3e')}}a.config.toolbarCanCollapse&&b.push("\x3c/span\x3e");if(a.config.toolbarCanCollapse&&a.elementMode!=CKEDITOR.ELEMENT_MODE_INLINE){var A=CKEDITOR.tools.addFunction(function(){a.execCommand("toolbarCollapse")});a.on("destroy",function(){CKEDITOR.tools.removeFunction(A)});
a.addCommand("toolbarCollapse",{readOnly:1,exec:function(b){var a=b.ui.space("toolbar_collapser"),c=a.getPrevious(),e=b.ui.space("contents"),d=c.getParent(),f=parseInt(e.$.style.height,10),h=d.$.offsetHeight,g=a.hasClass("cke_toolbox_collapser_min");g?(c.show(),a.removeClass("cke_toolbox_collapser_min"),a.setAttribute("title",b.lang.toolbar.toolbarCollapse)):(c.hide(),a.addClass("cke_toolbox_collapser_min"),a.setAttribute("title",b.lang.toolbar.toolbarExpand));a.getFirst().setText(g?"▲":"◀");e.setStyle("height",
f-(d.$.offsetHeight-h)+"px");b.fire("resize",{outerHeight:b.container.$.offsetHeight,contentsHeight:e.$.offsetHeight,outerWidth:b.container.$.offsetWidth})},modes:{wysiwyg:1,source:1}});a.setKeystroke(CKEDITOR.ALT+(CKEDITOR.env.ie||CKEDITOR.env.webkit?189:109),"toolbarCollapse");b.push('\x3ca title\x3d"'+(d?a.lang.toolbar.toolbarCollapse:a.lang.toolbar.toolbarExpand)+'" id\x3d"'+a.ui.spaceId("toolbar_collapser")+'" tabIndex\x3d"-1" class\x3d"cke_toolbox_collapser');d||b.push(" cke_toolbox_collapser_min");
b.push('" onclick\x3d"CKEDITOR.tools.callFunction('+A+')"\x3e','\x3cspan class\x3d"cke_arrow"\x3e\x26#9650;\x3c/span\x3e',"\x3c/a\x3e")}b.push("\x3c/span\x3e");c.data.html+=b.join("")}});a.on("destroy",function(){if(this.toolbox){var a,d=0,b,e,g;for(a=this.toolbox.toolbars;d<a.length;d++)for(e=a[d].items,b=0;b<e.length;b++)g=e[b],g.clickFn&&CKEDITOR.tools.removeFunction(g.clickFn),g.keyDownFn&&CKEDITOR.tools.removeFunction(g.keyDownFn)}});a.on("uiReady",function(){var c=a.ui.space("toolbox");c&&a.focusManager.add(c,
1)});a.addCommand("toolbarFocus",C);a.setKeystroke(CKEDITOR.ALT+121,"toolbarFocus");a.ui.add("-",CKEDITOR.UI_SEPARATOR,{});a.ui.addHandler(CKEDITOR.UI_SEPARATOR,{create:function(){return{render:function(a,d){d.push('\x3cspan class\x3d"cke_toolbar_separator" role\x3d"separator"\x3e\x3c/span\x3e');return{}}}}})}});CKEDITOR.ui.prototype.addToolbarGroup=function(a,d,g){var c=q(this.editor),h=0===d,b={name:a};if(g){if(g=CKEDITOR.tools.search(c,function(a){return a.name==g})){!g.groups&&(g.groups=[]);if(d&&
(d=CKEDITOR.tools.indexOf(g.groups,d),0<=d)){g.groups.splice(d+1,0,a);return}h?g.groups.splice(0,0,a):g.groups.push(a);return}d=null}d&&(d=CKEDITOR.tools.indexOf(c,function(a){return a.name==d}));h?c.splice(0,0,a):"number"==typeof d?c.splice(d+1,0,b):c.push(a)}})();CKEDITOR.UI_SEPARATOR="separator";CKEDITOR.config.toolbarLocation="top";(function(){function q(a,d){function l(c){c=k.list[c];if(c.equals(a.editable())||"true"==c.getAttribute("contenteditable")){var e=a.createRange();e.selectNodeContents(c);e.select()}else a.getSelection().selectElement(c);a.focus()}function m(){n&&n.setHtml('\x3cspan class\x3d"cke_path_empty"\x3e\x26nbsp;\x3c/span\x3e');delete k.list}var p=a.ui.spaceId("path"),n,k=a._.elementsPath,q=k.idBase;d.html+='\x3cspan id\x3d"'+p+'_label" class\x3d"cke_voice_label"\x3e'+a.lang.elementspath.eleLabel+'\x3c/span\x3e\x3cspan id\x3d"'+
p+'" class\x3d"cke_path" role\x3d"group" aria-labelledby\x3d"'+p+'_label"\x3e\x3cspan class\x3d"cke_path_empty"\x3e\x26nbsp;\x3c/span\x3e\x3c/span\x3e';a.on("uiReady",function(){var c=a.ui.space("path");c&&a.focusManager.add(c,1)});k.onClick=l;var v=CKEDITOR.tools.addFunction(l),w=CKEDITOR.tools.addFunction(function(c,e){var g=k.idBase,b;e=new CKEDITOR.dom.event(e);b="rtl"==a.lang.dir;switch(e.getKeystroke()){case b?39:37:case 9:return(b=CKEDITOR.document.getById(g+(c+1)))||(b=CKEDITOR.document.getById(g+
"0")),b.focus(),!1;case b?37:39:case CKEDITOR.SHIFT+9:return(b=CKEDITOR.document.getById(g+(c-1)))||(b=CKEDITOR.document.getById(g+(k.list.length-1))),b.focus(),!1;case 27:return a.focus(),!1;case 13:case 32:return l(c),!1}return!0});a.on("selectionChange",function(){for(var c=[],e=k.list=[],g=[],b=k.filters,d=!0,l=a.elementPath().elements,f,u=l.length;u--;){var h=l[u],r=0;f=h.data("cke-display-name")?h.data("cke-display-name"):h.data("cke-real-element-type")?h.data("cke-real-element-type"):h.getName();
(d=h.hasAttribute("contenteditable")?"true"==h.getAttribute("contenteditable"):d)||h.hasAttribute("contenteditable")||(r=1);for(var t=0;t<b.length;t++){var m=b[t](h,f);if(!1===m){r=1;break}f=m||f}r||(e.unshift(h),g.unshift(f))}e=e.length;for(b=0;b<e;b++)f=g[b],d=a.lang.elementspath.eleTitle.replace(/%1/,f),f=x.output({id:q+b,label:d,text:f,jsTitle:"javascript:void('"+f+"')",index:b,keyDownFn:w,clickFn:v}),c.unshift(f);n||(n=CKEDITOR.document.getById(p));g=n;g.setHtml(c.join("")+'\x3cspan class\x3d"cke_path_empty"\x3e\x26nbsp;\x3c/span\x3e');
a.fire("elementsPathUpdate",{space:g})});a.on("readOnly",m);a.on("contentDomUnload",m);a.addCommand("elementsPathFocus",y.toolbarFocus);a.setKeystroke(CKEDITOR.ALT+122,"elementsPathFocus")}var y={toolbarFocus:{editorFocus:!1,readOnly:1,exec:function(a){(a=CKEDITOR.document.getById(a._.elementsPath.idBase+"0"))&&a.focus(CKEDITOR.env.ie||CKEDITOR.env.air)}}},d="";CKEDITOR.env.gecko&&CKEDITOR.env.mac&&(d+=' onkeypress\x3d"return false;"');CKEDITOR.env.gecko&&(d+=' onblur\x3d"this.style.cssText \x3d this.style.cssText;"');
var x=CKEDITOR.addTemplate("pathItem",'\x3ca id\x3d"{id}" href\x3d"{jsTitle}" tabindex\x3d"-1" class\x3d"cke_path_item" title\x3d"{label}"'+d+' hidefocus\x3d"true"  onkeydown\x3d"return CKEDITOR.tools.callFunction({keyDownFn},{index}, event );" onclick\x3d"CKEDITOR.tools.callFunction({clickFn},{index}); return false;" role\x3d"button" aria-label\x3d"{label}"\x3e{text}\x3c/a\x3e');CKEDITOR.plugins.add("elementspath",{init:function(a){a._.elementsPath={idBase:"cke_elementspath_"+CKEDITOR.tools.getNextNumber()+
"_",filters:[]};a.on("uiSpace",function(d){"bottom"==d.data.space&&q(a,d.data)})}})})();(function(){function q(b,d,a){a=b.config.forceEnterMode||a;"wysiwyg"==b.mode&&(d||(d=b.activeEnterMode),b.elementPath().isContextFor("p")||(d=CKEDITOR.ENTER_BR,a=1),b.fire("saveSnapshot"),d==CKEDITOR.ENTER_BR?t(b,d,null,a):u(b,d,null,a),b.fire("saveSnapshot"))}function v(b){b=b.getSelection().getRanges(!0);for(var d=b.length-1;0<d;d--)b[d].deleteContents();return b[0]}function y(b){var d=b.startContainer.getAscendant(function(a){return a.type==CKEDITOR.NODE_ELEMENT&&"true"==a.getAttribute("contenteditable")},
!0);if(b.root.equals(d))return b;d=new CKEDITOR.dom.range(d);d.moveToRange(b);return d}CKEDITOR.plugins.add("enterkey",{init:function(b){b.addCommand("enter",{modes:{wysiwyg:1},editorFocus:!1,exec:function(b){q(b)}});b.addCommand("shiftEnter",{modes:{wysiwyg:1},editorFocus:!1,exec:function(b){q(b,b.activeShiftEnterMode,1)}});b.setKeystroke([[13,"enter"],[CKEDITOR.SHIFT+13,"shiftEnter"]])}});var z=CKEDITOR.dom.walker.whitespaces(),A=CKEDITOR.dom.walker.bookmark();CKEDITOR.plugins.enterkey={enterBlock:function(b,
d,a,h){if(a=a||v(b)){a=y(a);var f=a.document,k=a.checkStartOfBlock(),m=a.checkEndOfBlock(),l=b.elementPath(a.startContainer),c=l.block,n=d==CKEDITOR.ENTER_DIV?"div":"p",e;if(k&&m){if(c&&(c.is("li")||c.getParent().is("li"))){c.is("li")||(c=c.getParent());a=c.getParent();e=a.getParent();h=!c.hasPrevious();var p=!c.hasNext(),n=b.getSelection(),g=n.createBookmarks(),k=c.getDirection(1),m=c.getAttribute("class"),r=c.getAttribute("style"),q=e.getDirection(1)!=k;b=b.enterMode!=CKEDITOR.ENTER_BR||q||r||m;
if(e.is("li"))h||p?(h&&p&&a.remove(),c[p?"insertAfter":"insertBefore"](e)):c.breakParent(e);else{if(b)if(l.block.is("li")?(e=f.createElement(d==CKEDITOR.ENTER_P?"p":"div"),q&&e.setAttribute("dir",k),r&&e.setAttribute("style",r),m&&e.setAttribute("class",m),c.moveChildren(e)):e=l.block,h||p)e[h?"insertBefore":"insertAfter"](a);else c.breakParent(a),e.insertAfter(a);else if(c.appendBogus(!0),h||p)for(;f=c[h?"getFirst":"getLast"]();)f[h?"insertBefore":"insertAfter"](a);else for(c.breakParent(a);f=c.getLast();)f.insertAfter(a);
c.remove()}n.selectBookmarks(g);return}if(c&&c.getParent().is("blockquote")){c.breakParent(c.getParent());c.getPrevious().getFirst(CKEDITOR.dom.walker.invisible(1))||c.getPrevious().remove();c.getNext().getFirst(CKEDITOR.dom.walker.invisible(1))||c.getNext().remove();a.moveToElementEditStart(c);a.select();return}}else if(c&&c.is("pre")&&!m){t(b,d,a,h);return}if(k=a.splitBlock(n)){d=k.previousBlock;c=k.nextBlock;l=k.wasStartOfBlock;b=k.wasEndOfBlock;c?(g=c.getParent(),g.is("li")&&(c.breakParent(g),
c.move(c.getNext(),1))):d&&(g=d.getParent())&&g.is("li")&&(d.breakParent(g),g=d.getNext(),a.moveToElementEditStart(g),d.move(d.getPrevious()));if(l||b){if(d){if(d.is("li")||!w.test(d.getName())&&!d.is("pre"))e=d.clone()}else c&&(e=c.clone());e?h&&!e.is("li")&&e.renameNode(n):g&&g.is("li")?e=g:(e=f.createElement(n),d&&(p=d.getDirection())&&e.setAttribute("dir",p));if(f=k.elementPath)for(h=0,n=f.elements.length;h<n;h++){g=f.elements[h];if(g.equals(f.block)||g.equals(f.blockLimit))break;CKEDITOR.dtd.$removeEmpty[g.getName()]&&
(g=g.clone(),e.moveChildren(g),e.append(g))}e.appendBogus();e.getParent()||a.insertNode(e);e.is("li")&&e.removeAttribute("value");!CKEDITOR.env.ie||!l||b&&d.getChildCount()||(a.moveToElementEditStart(b?d:e),a.select());a.moveToElementEditStart(l&&!b?c:e)}else c.is("li")&&(e=a.clone(),e.selectNodeContents(c),e=new CKEDITOR.dom.walker(e),e.evaluator=function(a){return!(A(a)||z(a)||a.type==CKEDITOR.NODE_ELEMENT&&a.getName()in CKEDITOR.dtd.$inline&&!(a.getName()in CKEDITOR.dtd.$empty))},(g=e.next())&&
g.type==CKEDITOR.NODE_ELEMENT&&g.is("ul","ol")&&(CKEDITOR.env.needsBrFiller?f.createElement("br"):f.createText(" ")).insertBefore(g)),c&&a.moveToElementEditStart(c);a.select();a.scrollIntoView()}}},enterBr:function(b,d,a,h){if(a=a||v(b)){var f=a.document,k=a.checkEndOfBlock(),m=new CKEDITOR.dom.elementPath(b.getSelection().getStartElement()),l=m.block,c=l&&m.block.getName();h||"li"!=c?(!h&&k&&w.test(c)?(k=l.getDirection())?(f=f.createElement("div"),f.setAttribute("dir",k),f.insertAfter(l),a.setStart(f,
0)):(f.createElement("br").insertAfter(l),CKEDITOR.env.gecko&&f.createText("").insertAfter(l),a.setStartAt(l.getNext(),CKEDITOR.env.ie?CKEDITOR.POSITION_BEFORE_START:CKEDITOR.POSITION_AFTER_START)):(b="pre"==c&&CKEDITOR.env.ie&&8>CKEDITOR.env.version?f.createText("\r"):f.createElement("br"),a.deleteContents(),a.insertNode(b),CKEDITOR.env.needsBrFiller?(f.createText("﻿").insertAfter(b),k&&(l||m.blockLimit).appendBogus(),b.getNext().$.nodeValue="",a.setStartAt(b.getNext(),CKEDITOR.POSITION_AFTER_START)):
a.setStartAt(b,CKEDITOR.POSITION_AFTER_END)),a.collapse(!0),a.select(),a.scrollIntoView()):u(b,d,a,h)}}};var x=CKEDITOR.plugins.enterkey,t=x.enterBr,u=x.enterBlock,w=/^h[1-6]$/})();(function(){function k(b,f){var g={},c=[],e={nbsp:" ",shy:"­",gt:"\x3e",lt:"\x3c",amp:"\x26",apos:"'",quot:'"'};b=b.replace(/\b(nbsp|shy|gt|lt|amp|apos|quot)(?:,|$)/g,function(b,a){var d=f?"\x26"+a+";":e[a];g[d]=f?e[a]:"\x26"+a+";";c.push(d);return""});if(!f&&b){b=b.split(",");var a=document.createElement("div"),d;a.innerHTML="\x26"+b.join(";\x26")+";";d=a.innerHTML;a=null;for(a=0;a<d.length;a++){var h=d.charAt(a);g[h]="\x26"+b[a]+";";c.push(h)}}g.regex=c.join(f?"|":"");return g}CKEDITOR.plugins.add("entities",
{afterInit:function(b){function f(a){return h[a]}function g(b){return"force"!=c.entities_processNumerical&&a[b]?a[b]:"\x26#"+b.charCodeAt(0)+";"}var c=b.config;if(b=(b=b.dataProcessor)&&b.htmlFilter){var e=[];!1!==c.basicEntities&&e.push("nbsp,gt,lt,amp");c.entities&&(e.length&&e.push("quot,iexcl,cent,pound,curren,yen,brvbar,sect,uml,copy,ordf,laquo,not,shy,reg,macr,deg,plusmn,sup2,sup3,acute,micro,para,middot,cedil,sup1,ordm,raquo,frac14,frac12,frac34,iquest,times,divide,fnof,bull,hellip,prime,Prime,oline,frasl,weierp,image,real,trade,alefsym,larr,uarr,rarr,darr,harr,crarr,lArr,uArr,rArr,dArr,hArr,forall,part,exist,empty,nabla,isin,notin,ni,prod,sum,minus,lowast,radic,prop,infin,ang,and,or,cap,cup,int,there4,sim,cong,asymp,ne,equiv,le,ge,sub,sup,nsub,sube,supe,oplus,otimes,perp,sdot,lceil,rceil,lfloor,rfloor,lang,rang,loz,spades,clubs,hearts,diams,circ,tilde,ensp,emsp,thinsp,zwnj,zwj,lrm,rlm,ndash,mdash,lsquo,rsquo,sbquo,ldquo,rdquo,bdquo,dagger,Dagger,permil,lsaquo,rsaquo,euro"),
c.entities_latin&&e.push("Agrave,Aacute,Acirc,Atilde,Auml,Aring,AElig,Ccedil,Egrave,Eacute,Ecirc,Euml,Igrave,Iacute,Icirc,Iuml,ETH,Ntilde,Ograve,Oacute,Ocirc,Otilde,Ouml,Oslash,Ugrave,Uacute,Ucirc,Uuml,Yacute,THORN,szlig,agrave,aacute,acirc,atilde,auml,aring,aelig,ccedil,egrave,eacute,ecirc,euml,igrave,iacute,icirc,iuml,eth,ntilde,ograve,oacute,ocirc,otilde,ouml,oslash,ugrave,uacute,ucirc,uuml,yacute,thorn,yuml,OElig,oelig,Scaron,scaron,Yuml"),c.entities_greek&&e.push("Alpha,Beta,Gamma,Delta,Epsilon,Zeta,Eta,Theta,Iota,Kappa,Lambda,Mu,Nu,Xi,Omicron,Pi,Rho,Sigma,Tau,Upsilon,Phi,Chi,Psi,Omega,alpha,beta,gamma,delta,epsilon,zeta,eta,theta,iota,kappa,lambda,mu,nu,xi,omicron,pi,rho,sigmaf,sigma,tau,upsilon,phi,chi,psi,omega,thetasym,upsih,piv"),
c.entities_additional&&e.push(c.entities_additional));var a=k(e.join(",")),d=a.regex?"["+a.regex+"]":"a^";delete a.regex;c.entities&&c.entities_processNumerical&&(d="[^ -~]|"+d);var d=new RegExp(d,"g"),h=k("nbsp,gt,lt,amp,shy",!0),l=new RegExp(h.regex,"g");b.addRules({text:function(a){return a.replace(l,f).replace(d,g)}},{applyToAll:!0,excludeNestedEditable:!0})}}})})();CKEDITOR.config.basicEntities=!0;CKEDITOR.config.entities=!0;CKEDITOR.config.entities_latin=!0;CKEDITOR.config.entities_greek=!0;
CKEDITOR.config.entities_additional="#39";CKEDITOR.plugins.add("popup");
CKEDITOR.tools.extend(CKEDITOR.editor.prototype,{popup:function(e,a,b,d){a=a||"80%";b=b||"70%";"string"==typeof a&&1<a.length&&"%"==a.substr(a.length-1,1)&&(a=parseInt(window.screen.width*parseInt(a,10)/100,10));"string"==typeof b&&1<b.length&&"%"==b.substr(b.length-1,1)&&(b=parseInt(window.screen.height*parseInt(b,10)/100,10));640>a&&(a=640);420>b&&(b=420);var f=parseInt((window.screen.height-b)/2,10),g=parseInt((window.screen.width-a)/2,10);d=(d||"location\x3dno,menubar\x3dno,toolbar\x3dno,dependent\x3dyes,minimizable\x3dno,modal\x3dyes,alwaysRaised\x3dyes,resizable\x3dyes,scrollbars\x3dyes")+",width\x3d"+
a+",height\x3d"+b+",top\x3d"+f+",left\x3d"+g;var c=window.open("",null,d,!0);if(!c)return!1;try{-1==navigator.userAgent.toLowerCase().indexOf(" chrome/")&&(c.moveTo(g,f),c.resizeTo(a,b)),c.focus(),c.location.href=e}catch(h){window.open(e,null,d,!0)}return!0}});(function(){function g(a,c){var d=[];if(c)for(var b in c)d.push(b+"\x3d"+encodeURIComponent(c[b]));else return a;return a+(-1!=a.indexOf("?")?"\x26":"?")+d.join("\x26")}function k(a){a+="";return a.charAt(0).toUpperCase()+a.substr(1)}function m(){var a=this.getDialog(),c=a.getParentEditor();c._.filebrowserSe=this;var d=c.config["filebrowser"+k(a.getName())+"WindowWidth"]||c.config.filebrowserWindowWidth||"80%",a=c.config["filebrowser"+k(a.getName())+"WindowHeight"]||c.config.filebrowserWindowHeight||
"70%",b=this.filebrowser.params||{};b.CKEditor=c.name;b.CKEditorFuncNum=c._.filebrowserFn;b.langCode||(b.langCode=c.langCode);b=g(this.filebrowser.url,b);c.popup(b,d,a,c.config.filebrowserWindowFeatures||c.config.fileBrowserWindowFeatures)}function n(){var a=this.getDialog();a.getParentEditor()._.filebrowserSe=this;return a.getContentElement(this["for"][0],this["for"][1]).getInputElement().$.value&&a.getContentElement(this["for"][0],this["for"][1]).getAction()?!0:!1}function p(a,c,d){var b=d.params||
{};b.CKEditor=a.name;b.CKEditorFuncNum=a._.filebrowserFn;b.langCode||(b.langCode=a.langCode);c.action=g(d.url,b);c.filebrowser=d}function l(a,c,d,b){if(b&&b.length)for(var e,g=b.length;g--;)if(e=b[g],"hbox"!=e.type&&"vbox"!=e.type&&"fieldset"!=e.type||l(a,c,d,e.children),e.filebrowser)if("string"==typeof e.filebrowser&&(e.filebrowser={action:"fileButton"==e.type?"QuickUpload":"Browse",target:e.filebrowser}),"Browse"==e.filebrowser.action){var f=e.filebrowser.url;void 0===f&&(f=a.config["filebrowser"+
k(c)+"BrowseUrl"],void 0===f&&(f=a.config.filebrowserBrowseUrl));f&&(e.onClick=m,e.filebrowser.url=f,e.hidden=!1)}else if("QuickUpload"==e.filebrowser.action&&e["for"]&&(f=e.filebrowser.url,void 0===f&&(f=a.config["filebrowser"+k(c)+"UploadUrl"],void 0===f&&(f=a.config.filebrowserUploadUrl)),f)){var h=e.onClick;e.onClick=function(a){var b=a.sender;return h&&!1===h.call(b,a)?!1:n.call(b,a)};e.filebrowser.url=f;e.hidden=!1;p(a,d.getContents(e["for"][0]).get(e["for"][1]),e.filebrowser)}}function h(a,
c,d){if(-1!==d.indexOf(";")){d=d.split(";");for(var b=0;b<d.length;b++)if(h(a,c,d[b]))return!0;return!1}return(a=a.getContents(c).get(d).filebrowser)&&a.url}function q(a,c){var d=this._.filebrowserSe.getDialog(),b=this._.filebrowserSe["for"],e=this._.filebrowserSe.filebrowser.onSelect;b&&d.getContentElement(b[0],b[1]).reset();if("function"!=typeof c||!1!==c.call(this._.filebrowserSe))if(!e||!1!==e.call(this._.filebrowserSe,a,c))if("string"==typeof c&&c&&alert(c),a&&(b=this._.filebrowserSe,d=b.getDialog(),
b=b.filebrowser.target||null))if(b=b.split(":"),e=d.getContentElement(b[0],b[1]))e.setValue(a),d.selectPage(b[0])}CKEDITOR.plugins.add("filebrowser",{requires:"popup",init:function(a){a._.filebrowserFn=CKEDITOR.tools.addFunction(q,a);a.on("destroy",function(){CKEDITOR.tools.removeFunction(this._.filebrowserFn)})}});CKEDITOR.on("dialogDefinition",function(a){if(a.editor.plugins.filebrowser)for(var c=a.data.definition,d,b=0;b<c.contents.length;++b)if(d=c.contents[b])l(a.editor,a.data.name,c,d.elements),
d.hidden&&d.filebrowser&&(d.hidden=!h(c,d.id,d.filebrowser))})})();(function(){function k(a){var l=a.config,p=a.fire("uiSpace",{space:"top",html:""}).html,t=function(){function f(a,c,e){b.setStyle(c,w(e));b.setStyle("position",a)}function e(a){var b=k.getDocumentPosition();switch(a){case "top":f("absolute","top",b.y-q-r);break;case "pin":f("fixed","top",x);break;case "bottom":f("absolute","top",b.y+(c.height||c.bottom-c.top)+r)}m=a}var m,k,n,c,h,q,v,p=l.floatSpaceDockedOffsetX||0,r=l.floatSpaceDockedOffsetY||0,u=l.floatSpacePinnedOffsetX||0,x=l.floatSpacePinnedOffsetY||
0;return function(d){if(k=a.editable()){var f=d&&"focus"==d.name;f&&b.show();a.fire("floatingSpaceLayout",{show:f});b.removeStyle("left");b.removeStyle("right");n=b.getClientRect();c=k.getClientRect();h=g.getViewPaneSize();q=n.height;v="pageXOffset"in g.$?g.$.pageXOffset:CKEDITOR.document.$.documentElement.scrollLeft;m?(q+r<=c.top?e("top"):q+r>h.height-c.bottom?e("pin"):e("bottom"),d=h.width/2,d=l.floatSpacePreferRight?"right":0<c.left&&c.right<h.width&&c.width>n.width?"rtl"==l.contentsLangDirection?
"right":"left":d-c.left>c.right-d?"left":"right",n.width>h.width?(d="left",f=0):(f="left"==d?0<c.left?c.left:0:c.right<h.width?h.width-c.right:0,f+n.width>h.width&&(d="left"==d?"right":"left",f=0)),b.setStyle(d,w(("pin"==m?u:p)+f+("pin"==m?0:"left"==d?v:-v)))):(m="pin",e("pin"),t(d))}}}();if(p){var k=new CKEDITOR.template('\x3cdiv id\x3d"cke_{name}" class\x3d"cke {id} cke_reset_all cke_chrome cke_editor_{name} cke_float cke_{langDir} '+CKEDITOR.env.cssClass+'" dir\x3d"{langDir}" title\x3d"'+(CKEDITOR.env.gecko?
" ":"")+'" lang\x3d"{langCode}" role\x3d"application" style\x3d"{style}"'+(a.title?' aria-labelledby\x3d"cke_{name}_arialbl"':" ")+"\x3e"+(a.title?'\x3cspan id\x3d"cke_{name}_arialbl" class\x3d"cke_voice_label"\x3e{voiceLabel}\x3c/span\x3e':" ")+'\x3cdiv class\x3d"cke_inner"\x3e\x3cdiv id\x3d"{topId}" class\x3d"cke_top" role\x3d"presentation"\x3e{content}\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e'),b=CKEDITOR.document.getBody().append(CKEDITOR.dom.element.createFromHtml(k.output({content:p,id:a.id,langDir:a.lang.dir,
langCode:a.langCode,name:a.name,style:"display:none;z-index:"+(l.baseFloatZIndex-1),topId:a.ui.spaceId("top"),voiceLabel:a.title}))),u=CKEDITOR.tools.eventsBuffer(500,t),e=CKEDITOR.tools.eventsBuffer(100,t);b.unselectable();b.on("mousedown",function(a){a=a.data;a.getTarget().hasAscendant("a",1)||a.preventDefault()});a.on("focus",function(b){t(b);a.on("change",u.input);g.on("scroll",e.input);g.on("resize",e.input)});a.on("blur",function(){b.hide();a.removeListener("change",u.input);g.removeListener("scroll",
e.input);g.removeListener("resize",e.input)});a.on("destroy",function(){g.removeListener("scroll",e.input);g.removeListener("resize",e.input);b.clearCustomData();b.remove()});a.focusManager.hasFocus&&b.show();a.focusManager.add(b,1)}}var g=CKEDITOR.document.getWindow(),w=CKEDITOR.tools.cssLength;CKEDITOR.plugins.add("floatingspace",{init:function(a){a.on("loaded",function(){k(this)},null,null,20)}})})();CKEDITOR.plugins.add("listblock",{requires:"panel",onLoad:function(){var f=CKEDITOR.addTemplate("panel-list",'\x3cul role\x3d"presentation" class\x3d"cke_panel_list"\x3e{items}\x3c/ul\x3e'),g=CKEDITOR.addTemplate("panel-list-item",'\x3cli id\x3d"{id}" class\x3d"cke_panel_listItem" role\x3dpresentation\x3e\x3ca id\x3d"{id}_option" _cke_focus\x3d1 hidefocus\x3dtrue title\x3d"{title}" href\x3d"javascript:void(\'{val}\')"  {onclick}\x3d"CKEDITOR.tools.callFunction({clickFn},\'{val}\'); return false;" role\x3d"option"\x3e{text}\x3c/a\x3e\x3c/li\x3e'),
h=CKEDITOR.addTemplate("panel-list-group",'\x3ch1 id\x3d"{id}" class\x3d"cke_panel_grouptitle" role\x3d"presentation" \x3e{label}\x3c/h1\x3e'),k=/\'/g;CKEDITOR.ui.panel.prototype.addListBlock=function(a,b){return this.addBlock(a,new CKEDITOR.ui.listBlock(this.getHolderElement(),b))};CKEDITOR.ui.listBlock=CKEDITOR.tools.createClass({base:CKEDITOR.ui.panel.block,$:function(a,b){b=b||{};var c=b.attributes||(b.attributes={});(this.multiSelect=!!b.multiSelect)&&(c["aria-multiselectable"]=!0);!c.role&&
(c.role="listbox");this.base.apply(this,arguments);this.element.setAttribute("role",c.role);c=this.keys;c[40]="next";c[9]="next";c[38]="prev";c[CKEDITOR.SHIFT+9]="prev";c[32]=CKEDITOR.env.ie?"mouseup":"click";CKEDITOR.env.ie&&(c[13]="mouseup");this._.pendingHtml=[];this._.pendingList=[];this._.items={};this._.groups={}},_:{close:function(){if(this._.started){var a=f.output({items:this._.pendingList.join("")});this._.pendingList=[];this._.pendingHtml.push(a);delete this._.started}},getClick:function(){this._.click||
(this._.click=CKEDITOR.tools.addFunction(function(a){var b=this.toggle(a);if(this.onClick)this.onClick(a,b)},this));return this._.click}},proto:{add:function(a,b,c){var d=CKEDITOR.tools.getNextId();this._.started||(this._.started=1,this._.size=this._.size||0);this._.items[a]=d;var e;e=CKEDITOR.tools.htmlEncodeAttr(a).replace(k,"\\'");a={id:d,val:e,onclick:CKEDITOR.env.ie?'onclick\x3d"return false;" onmouseup':"onclick",clickFn:this._.getClick(),title:CKEDITOR.tools.htmlEncodeAttr(c||a),text:b||a};
this._.pendingList.push(g.output(a))},startGroup:function(a){this._.close();var b=CKEDITOR.tools.getNextId();this._.groups[a]=b;this._.pendingHtml.push(h.output({id:b,label:a}))},commit:function(){this._.close();this.element.appendHtml(this._.pendingHtml.join(""));delete this._.size;this._.pendingHtml=[]},toggle:function(a){var b=this.isMarked(a);b?this.unmark(a):this.mark(a);return!b},hideGroup:function(a){var b=(a=this.element.getDocument().getById(this._.groups[a]))&&a.getNext();a&&(a.setStyle("display",
"none"),b&&"ul"==b.getName()&&b.setStyle("display","none"))},hideItem:function(a){this.element.getDocument().getById(this._.items[a]).setStyle("display","none")},showAll:function(){var a=this._.items,b=this._.groups,c=this.element.getDocument(),d;for(d in a)c.getById(a[d]).setStyle("display","");for(var e in b)a=c.getById(b[e]),d=a.getNext(),a.setStyle("display",""),d&&"ul"==d.getName()&&d.setStyle("display","")},mark:function(a){this.multiSelect||this.unmarkAll();a=this._.items[a];var b=this.element.getDocument().getById(a);
b.addClass("cke_selected");this.element.getDocument().getById(a+"_option").setAttribute("aria-selected",!0);this.onMark&&this.onMark(b)},unmark:function(a){var b=this.element.getDocument();a=this._.items[a];var c=b.getById(a);c.removeClass("cke_selected");b.getById(a+"_option").removeAttribute("aria-selected");this.onUnmark&&this.onUnmark(c)},unmarkAll:function(){var a=this._.items,b=this.element.getDocument(),c;for(c in a){var d=a[c];b.getById(d).removeClass("cke_selected");b.getById(d+"_option").removeAttribute("aria-selected")}this.onUnmark&&
this.onUnmark()},isMarked:function(a){return this.element.getDocument().getById(this._.items[a]).hasClass("cke_selected")},focus:function(a){this._.focusIndex=-1;var b=this.element.getElementsByTag("a"),c,d=-1;if(a)for(c=this.element.getDocument().getById(this._.items[a]).getFirst();a=b.getItem(++d);){if(a.equals(c)){this._.focusIndex=d;break}}else this.element.focus();c&&setTimeout(function(){c.focus()},0)}}})}});CKEDITOR.plugins.add("richcombo",{requires:"floatpanel,listblock,button",beforeInit:function(d){d.ui.addHandler(CKEDITOR.UI_RICHCOMBO,CKEDITOR.ui.richCombo.handler)}});
(function(){var d='\x3cspan id\x3d"{id}" class\x3d"cke_combo cke_combo__{name} {cls}" role\x3d"presentation"\x3e\x3cspan id\x3d"{id}_label" class\x3d"cke_combo_label"\x3e{label}\x3c/span\x3e\x3ca class\x3d"cke_combo_button" title\x3d"{title}" tabindex\x3d"-1"'+(CKEDITOR.env.gecko&&!CKEDITOR.env.hc?"":" href\x3d\"javascript:void('{titleJs}')\"")+' hidefocus\x3d"true" role\x3d"button" aria-labelledby\x3d"{id}_label" aria-haspopup\x3d"true"';CKEDITOR.env.gecko&&CKEDITOR.env.mac&&(d+=' onkeypress\x3d"return false;"');
CKEDITOR.env.gecko&&(d+=' onblur\x3d"this.style.cssText \x3d this.style.cssText;"');var d=d+(' onkeydown\x3d"return CKEDITOR.tools.callFunction({keydownFn},event,this);" onfocus\x3d"return CKEDITOR.tools.callFunction({focusFn},event);" '+(CKEDITOR.env.ie?'onclick\x3d"return false;" onmouseup':"onclick")+'\x3d"CKEDITOR.tools.callFunction({clickFn},this);return false;"\x3e\x3cspan id\x3d"{id}_text" class\x3d"cke_combo_text cke_combo_inlinelabel"\x3e{label}\x3c/span\x3e\x3cspan class\x3d"cke_combo_open"\x3e\x3cspan class\x3d"cke_combo_arrow"\x3e'+
(CKEDITOR.env.hc?"\x26#9660;":CKEDITOR.env.air?"\x26nbsp;":"")+"\x3c/span\x3e\x3c/span\x3e\x3c/a\x3e\x3c/span\x3e"),k=CKEDITOR.addTemplate("combo",d);CKEDITOR.UI_RICHCOMBO="richcombo";CKEDITOR.ui.richCombo=CKEDITOR.tools.createClass({$:function(a){CKEDITOR.tools.extend(this,a,{canGroup:!1,title:a.label,modes:{wysiwyg:1},editorFocus:1});a=this.panel||{};delete this.panel;this.id=CKEDITOR.tools.getNextNumber();this.document=a.parent&&a.parent.getDocument()||CKEDITOR.document;a.className="cke_combopanel";
a.block={multiSelect:a.multiSelect,attributes:a.attributes};a.toolbarRelated=!0;this._={panelDefinition:a,items:{}}},proto:{renderHtml:function(a){var b=[];this.render(a,b);return b.join("")},render:function(a,b){function g(){if(this.getState()!=CKEDITOR.TRISTATE_ON){var c=this.modes[a.mode]?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED;a.readOnly&&!this.readOnly&&(c=CKEDITOR.TRISTATE_DISABLED);this.setState(c);this.setValue("");c!=CKEDITOR.TRISTATE_DISABLED&&this.refresh&&this.refresh()}}var d=
CKEDITOR.env,h="cke_"+this.id,e=CKEDITOR.tools.addFunction(function(b){l&&(a.unlockSelection(1),l=0);c.execute(b)},this),f=this,c={id:h,combo:this,focus:function(){CKEDITOR.document.getById(h).getChild(1).focus()},execute:function(c){var b=f._;if(b.state!=CKEDITOR.TRISTATE_DISABLED)if(f.createPanel(a),b.on)b.panel.hide();else{f.commit();var d=f.getValue();d?b.list.mark(d):b.list.unmarkAll();b.panel.showBlock(f.id,new CKEDITOR.dom.element(c),4)}},clickFn:e};a.on("activeFilterChange",g,this);a.on("mode",
g,this);a.on("selectionChange",g,this);!this.readOnly&&a.on("readOnly",g,this);var m=CKEDITOR.tools.addFunction(function(b,d){b=new CKEDITOR.dom.event(b);var g=b.getKeystroke();if(40==g)a.once("panelShow",function(a){a.data._.panel._.currentBlock.onKeyDown(40)});switch(g){case 13:case 32:case 40:CKEDITOR.tools.callFunction(e,d);break;default:c.onkey(c,g)}b.preventDefault()}),n=CKEDITOR.tools.addFunction(function(){c.onfocus&&c.onfocus()}),l=0;c.keyDownFn=m;d={id:h,name:this.name||this.command,label:this.label,
title:this.title,cls:this.className||"",titleJs:d.gecko&&!d.hc?"":(this.title||"").replace("'",""),keydownFn:m,focusFn:n,clickFn:e};k.output(d,b);if(this.onRender)this.onRender();return c},createPanel:function(a){if(!this._.panel){var b=this._.panelDefinition,d=this._.panelDefinition.block,k=b.parent||CKEDITOR.document.getBody(),h="cke_combopanel__"+this.name,e=new CKEDITOR.ui.floatPanel(a,k,b),f=e.addListBlock(this.id,d),c=this;e.onShow=function(){this.element.addClass(h);c.setState(CKEDITOR.TRISTATE_ON);
c._.on=1;c.editorFocus&&!a.focusManager.hasFocus&&a.focus();if(c.onOpen)c.onOpen();a.once("panelShow",function(){f.focus(!f.multiSelect&&c.getValue())})};e.onHide=function(b){this.element.removeClass(h);c.setState(c.modes&&c.modes[a.mode]?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED);c._.on=0;if(!b&&c.onClose)c.onClose()};e.onEscape=function(){e.hide(1)};f.onClick=function(a,b){c.onClick&&c.onClick.call(c,a,b);e.hide()};this._.panel=e;this._.list=f;e.getBlock(this.id).onHide=function(){c._.on=
0;c.setState(CKEDITOR.TRISTATE_OFF)};this.init&&this.init()}},setValue:function(a,b){this._.value=a;var d=this.document.getById("cke_"+this.id+"_text");d&&(a||b?d.removeClass("cke_combo_inlinelabel"):(b=this.label,d.addClass("cke_combo_inlinelabel")),d.setText("undefined"!=typeof b?b:a))},getValue:function(){return this._.value||""},unmarkAll:function(){this._.list.unmarkAll()},mark:function(a){this._.list.mark(a)},hideItem:function(a){this._.list.hideItem(a)},hideGroup:function(a){this._.list.hideGroup(a)},
showAll:function(){this._.list.showAll()},add:function(a,b,d){this._.items[a]=d||a;this._.list.add(a,b,d)},startGroup:function(a){this._.list.startGroup(a)},commit:function(){this._.committed||(this._.list.commit(),this._.committed=1,CKEDITOR.ui.fire("ready",this));this._.committed=1},setState:function(a){if(this._.state!=a){var b=this.document.getById("cke_"+this.id);b.setState(a,"cke_combo");a==CKEDITOR.TRISTATE_DISABLED?b.setAttribute("aria-disabled",!0):b.removeAttribute("aria-disabled");this._.state=
a}},getState:function(){return this._.state},enable:function(){this._.state==CKEDITOR.TRISTATE_DISABLED&&this.setState(this._.lastState)},disable:function(){this._.state!=CKEDITOR.TRISTATE_DISABLED&&(this._.lastState=this._.state,this.setState(CKEDITOR.TRISTATE_DISABLED))}},statics:{handler:{create:function(a){return new CKEDITOR.ui.richCombo(a)}}}});CKEDITOR.ui.prototype.addRichCombo=function(a,b){this.add(a,CKEDITOR.UI_RICHCOMBO,b)}})();CKEDITOR.plugins.add("format",{requires:"richcombo",init:function(a){if(!a.blockless){for(var f=a.config,c=a.lang.format,l=f.format_tags.split(";"),d={},m=0,n=[],g=0;g<l.length;g++){var h=l[g],k=new CKEDITOR.style(f["format_"+h]);if(!a.filter.customConfig||a.filter.check(k))m++,d[h]=k,d[h]._.enterMode=a.config.enterMode,n.push(k)}0!==m&&a.ui.addRichCombo("Format",{label:c.label,title:c.panelTitle,toolbar:"styles,20",allowedContent:n,panel:{css:[CKEDITOR.skin.getPath("editor")].concat(f.contentsCss),
multiSelect:!1,attributes:{"aria-label":c.panelTitle}},init:function(){this.startGroup(c.panelTitle);for(var a in d){var e=c["tag_"+a];this.add(a,d[a].buildPreview(e),e)}},onClick:function(b){a.focus();a.fire("saveSnapshot");b=d[b];var e=a.elementPath();a[b.checkActive(e,a)?"removeStyle":"applyStyle"](b);setTimeout(function(){a.fire("saveSnapshot")},0)},onRender:function(){a.on("selectionChange",function(b){var e=this.getValue();b=b.data.path;this.refresh();for(var c in d)if(d[c].checkActive(b,a)){c!=
e&&this.setValue(c,a.lang.format["tag_"+c]);return}this.setValue("")},this)},onOpen:function(){this.showAll();for(var b in d)a.activeFilter.check(d[b])||this.hideItem(b)},refresh:function(){var b=a.elementPath();if(b){if(b.isContextFor("p"))for(var c in d)if(a.activeFilter.check(d[c]))return;this.setState(CKEDITOR.TRISTATE_DISABLED)}}})}}});CKEDITOR.config.format_tags="p;h1;h2;h3;h4;h5;h6;pre;address;div";CKEDITOR.config.format_p={element:"p"};CKEDITOR.config.format_div={element:"div"};
CKEDITOR.config.format_pre={element:"pre"};CKEDITOR.config.format_address={element:"address"};CKEDITOR.config.format_h1={element:"h1"};CKEDITOR.config.format_h2={element:"h2"};CKEDITOR.config.format_h3={element:"h3"};CKEDITOR.config.format_h4={element:"h4"};CKEDITOR.config.format_h5={element:"h5"};CKEDITOR.config.format_h6={element:"h6"};(function(){var b={canUndo:!1,exec:function(a){var b=a.document.createElement("hr");a.insertElement(b)},allowedContent:"hr",requiredContent:"hr"};CKEDITOR.plugins.add("horizontalrule",{init:function(a){a.blockless||(a.addCommand("horizontalrule",b),a.ui.addButton&&a.ui.addButton("HorizontalRule",{label:a.lang.horizontalrule.toolbar,command:"horizontalrule",toolbar:"insert,40"}))}})})();CKEDITOR.plugins.add("htmlwriter",{init:function(b){var a=new CKEDITOR.htmlWriter;a.forceSimpleAmpersand=b.config.forceSimpleAmpersand;a.indentationChars=b.config.dataIndentationChars||"\t";b.dataProcessor.writer=a}});
CKEDITOR.htmlWriter=CKEDITOR.tools.createClass({base:CKEDITOR.htmlParser.basicWriter,$:function(){this.base();this.indentationChars="\t";this.selfClosingEnd=" /\x3e";this.lineBreakChars="\n";this.sortAttributes=1;this._.indent=0;this._.indentation="";this._.inPre=0;this._.rules={};var b=CKEDITOR.dtd,a;for(a in CKEDITOR.tools.extend({},b.$nonBodyContent,b.$block,b.$listItem,b.$tableContent))this.setRules(a,{indent:!b[a]["#"],breakBeforeOpen:1,breakBeforeClose:!b[a]["#"],breakAfterClose:1,needsSpace:a in
b.$block&&!(a in{li:1,dt:1,dd:1})});this.setRules("br",{breakAfterOpen:1});this.setRules("title",{indent:0,breakAfterOpen:0});this.setRules("style",{indent:0,breakBeforeClose:1});this.setRules("pre",{breakAfterOpen:1,indent:0})},proto:{openTag:function(b){var a=this._.rules[b];this._.afterCloser&&a&&a.needsSpace&&this._.needsSpace&&this._.output.push("\n");this._.indent?this.indentation():a&&a.breakBeforeOpen&&(this.lineBreak(),this.indentation());this._.output.push("\x3c",b);this._.afterCloser=0},
openTagClose:function(b,a){var c=this._.rules[b];a?(this._.output.push(this.selfClosingEnd),c&&c.breakAfterClose&&(this._.needsSpace=c.needsSpace)):(this._.output.push("\x3e"),c&&c.indent&&(this._.indentation+=this.indentationChars));c&&c.breakAfterOpen&&this.lineBreak();"pre"==b&&(this._.inPre=1)},attribute:function(b,a){"string"==typeof a&&(this.forceSimpleAmpersand&&(a=a.replace(/&amp;/g,"\x26")),a=CKEDITOR.tools.htmlEncodeAttr(a));this._.output.push(" ",b,'\x3d"',a,'"')},closeTag:function(b){var a=
this._.rules[b];a&&a.indent&&(this._.indentation=this._.indentation.substr(this.indentationChars.length));this._.indent?this.indentation():a&&a.breakBeforeClose&&(this.lineBreak(),this.indentation());this._.output.push("\x3c/",b,"\x3e");"pre"==b&&(this._.inPre=0);a&&a.breakAfterClose&&(this.lineBreak(),this._.needsSpace=a.needsSpace);this._.afterCloser=1},text:function(b){this._.indent&&(this.indentation(),!this._.inPre&&(b=CKEDITOR.tools.ltrim(b)));this._.output.push(b)},comment:function(b){this._.indent&&
this.indentation();this._.output.push("\x3c!--",b,"--\x3e")},lineBreak:function(){!this._.inPre&&0<this._.output.length&&this._.output.push(this.lineBreakChars);this._.indent=1},indentation:function(){!this._.inPre&&this._.indentation&&this._.output.push(this._.indentation);this._.indent=0},reset:function(){this._.output=[];this._.indent=0;this._.indentation="";this._.afterCloser=0;this._.inPre=0},setRules:function(b,a){var c=this._.rules[b];c?CKEDITOR.tools.extend(c,a,!0):this._.rules[b]=a}}});(function(){function m(a){function f(a){var b=!1;g.attachListener(g,"keydown",function(){var d=c.getBody().getElementsByTag(a);if(!b){for(var e=0;e<d.count();e++)d.getItem(e).setCustomData("retain",!0);b=!0}},null,null,1);g.attachListener(g,"keyup",function(){var d=c.getElementsByTag(a);b&&(1!=d.count()||d.getItem(0).getCustomData("retain")||d.getItem(0).remove(1),b=!1)})}var b=this.editor,c=a.document,d=c.body,e=c.getElementById("cke_actscrpt");e&&e.parentNode.removeChild(e);(e=c.getElementById("cke_shimscrpt"))&&
e.parentNode.removeChild(e);(e=c.getElementById("cke_basetagscrpt"))&&e.parentNode.removeChild(e);d.contentEditable=!0;CKEDITOR.env.ie&&(d.hideFocus=!0,d.disabled=!0,d.removeAttribute("disabled"));delete this._.isLoadingData;this.$=d;c=new CKEDITOR.dom.document(c);this.setup();this.fixInitialSelection();var g=this;CKEDITOR.env.ie&&!CKEDITOR.env.edge&&c.getDocumentElement().addClass(c.$.compatMode);CKEDITOR.env.ie&&!CKEDITOR.env.edge&&b.enterMode!=CKEDITOR.ENTER_P?f("p"):CKEDITOR.env.edge&&b.enterMode!=
CKEDITOR.ENTER_DIV&&f("div");if(CKEDITOR.env.webkit||CKEDITOR.env.ie&&10<CKEDITOR.env.version)c.getDocumentElement().on("mousedown",function(a){a.data.getTarget().is("html")&&setTimeout(function(){b.editable().focus()})});n(b);try{b.document.$.execCommand("2D-position",!1,!0)}catch(h){}(CKEDITOR.env.gecko||CKEDITOR.env.ie&&"CSS1Compat"==b.document.$.compatMode)&&this.attachListener(this,"keydown",function(a){var c=a.data.getKeystroke();if(33==c||34==c)if(CKEDITOR.env.ie)setTimeout(function(){b.getSelection().scrollIntoView()},
0);else if(b.window.$.innerHeight>this.$.offsetHeight){var d=b.createRange();d[33==c?"moveToElementEditStart":"moveToElementEditEnd"](this);d.select();a.data.preventDefault()}});CKEDITOR.env.ie&&this.attachListener(c,"blur",function(){try{c.$.selection.empty()}catch(a){}});CKEDITOR.env.iOS&&this.attachListener(c,"touchend",function(){a.focus()});d=b.document.getElementsByTag("title").getItem(0);d.data("cke-title",d.getText());CKEDITOR.env.ie&&(b.document.$.title=this._.docTitle);CKEDITOR.tools.setTimeout(function(){"unloaded"==
this.status&&(this.status="ready");b.fire("contentDom");this._.isPendingFocus&&(b.focus(),this._.isPendingFocus=!1);setTimeout(function(){b.fire("dataReady")},0)},0,this)}function n(a){function f(){var c;a.editable().attachListener(a,"selectionChange",function(){var d=a.getSelection().getSelectedElement();d&&(c&&(c.detachEvent("onresizestart",b),c=null),d.$.attachEvent("onresizestart",b),c=d.$)})}function b(a){a.returnValue=!1}if(CKEDITOR.env.gecko)try{var c=a.document.$;c.execCommand("enableObjectResizing",
!1,!a.config.disableObjectResizing);c.execCommand("enableInlineTableEditing",!1,!a.config.disableNativeTableHandles)}catch(d){}else CKEDITOR.env.ie&&11>CKEDITOR.env.version&&a.config.disableObjectResizing&&f(a)}function p(){var a=[];if(8<=CKEDITOR.document.$.documentMode){a.push("html.CSS1Compat [contenteditable\x3dfalse]{min-height:0 !important}");var f=[],b;for(b in CKEDITOR.dtd.$removeEmpty)f.push("html.CSS1Compat "+b+"[contenteditable\x3dfalse]");a.push(f.join(",")+"{display:inline-block}")}else CKEDITOR.env.gecko&&
(a.push("html{height:100% !important}"),a.push("img:-moz-broken{-moz-force-broken-image-icon:1;min-width:24px;min-height:24px}"));a.push("html{cursor:text;*cursor:auto}");a.push("img,input,textarea{cursor:default}");return a.join("\n")}CKEDITOR.plugins.add("wysiwygarea",{init:function(a){a.config.fullPage&&a.addFeature({allowedContent:"html head title; style [media,type]; body (*)[id]; meta link [*]",requiredContent:"body"});a.addMode("wysiwyg",function(f){function b(b){b&&b.removeListener();a.editable(new l(a,
d.$.contentWindow.document.body));a.setData(a.getData(1),f)}var c="document.open();"+(CKEDITOR.env.ie?"("+CKEDITOR.tools.fixDomain+")();":"")+"document.close();",c=CKEDITOR.env.air?"javascript:void(0)":CKEDITOR.env.ie&&!CKEDITOR.env.edge?"javascript:void(function(){"+encodeURIComponent(c)+"}())":"",d=CKEDITOR.dom.element.createFromHtml('\x3ciframe src\x3d"'+c+'" frameBorder\x3d"0"\x3e\x3c/iframe\x3e');d.setStyles({width:"100%",height:"100%"});d.addClass("cke_wysiwyg_frame").addClass("cke_reset");
c=a.ui.space("contents");c.append(d);var e=CKEDITOR.env.ie&&!CKEDITOR.env.edge||CKEDITOR.env.gecko;if(e)d.on("load",b);var g=a.title,h=a.fire("ariaEditorHelpLabel",{}).label;g&&(CKEDITOR.env.ie&&h&&(g+=", "+h),d.setAttribute("title",g));if(h){var g=CKEDITOR.tools.getNextId(),k=CKEDITOR.dom.element.createFromHtml('\x3cspan id\x3d"'+g+'" class\x3d"cke_voice_label"\x3e'+h+"\x3c/span\x3e");c.append(k,1);d.setAttribute("aria-describedby",g)}a.on("beforeModeUnload",function(a){a.removeListener();k&&k.remove()});
d.setAttributes({tabIndex:a.tabIndex,allowTransparency:"true"});!e&&b();a.fire("ariaWidget",d)})}});CKEDITOR.editor.prototype.addContentsCss=function(a){var f=this.config,b=f.contentsCss;CKEDITOR.tools.isArray(b)||(f.contentsCss=b?[b]:[]);f.contentsCss.push(a)};var l=CKEDITOR.tools.createClass({$:function(){this.base.apply(this,arguments);this._.frameLoadedHandler=CKEDITOR.tools.addFunction(function(a){CKEDITOR.tools.setTimeout(m,0,this,a)},this);this._.docTitle=this.getWindow().getFrame().getAttribute("title")},
base:CKEDITOR.editable,proto:{setData:function(a,f){var b=this.editor;if(f)this.setHtml(a),this.fixInitialSelection(),b.fire("dataReady");else{this._.isLoadingData=!0;b._.dataStore={id:1};var c=b.config,d=c.fullPage,e=c.docType,g=CKEDITOR.tools.buildStyleHtml(p()).replace(/<style>/,'\x3cstyle data-cke-temp\x3d"1"\x3e');d||(g+=CKEDITOR.tools.buildStyleHtml(b.config.contentsCss));var h=c.baseHref?'\x3cbase href\x3d"'+c.baseHref+'" data-cke-temp\x3d"1" /\x3e':"";d&&(a=a.replace(/<!DOCTYPE[^>]*>/i,function(a){b.docType=
e=a;return""}).replace(/<\?xml\s[^\?]*\?>/i,function(a){b.xmlDeclaration=a;return""}));a=b.dataProcessor.toHtml(a);d?(/<body[\s|>]/.test(a)||(a="\x3cbody\x3e"+a),/<html[\s|>]/.test(a)||(a="\x3chtml\x3e"+a+"\x3c/html\x3e"),/<head[\s|>]/.test(a)?/<title[\s|>]/.test(a)||(a=a.replace(/<head[^>]*>/,"$\x26\x3ctitle\x3e\x3c/title\x3e")):a=a.replace(/<html[^>]*>/,"$\x26\x3chead\x3e\x3ctitle\x3e\x3c/title\x3e\x3c/head\x3e"),h&&(a=a.replace(/<head[^>]*?>/,"$\x26"+h)),a=a.replace(/<\/head\s*>/,g+"$\x26"),a=
e+a):a=c.docType+'\x3chtml dir\x3d"'+c.contentsLangDirection+'" lang\x3d"'+(c.contentsLanguage||b.langCode)+'"\x3e\x3chead\x3e\x3ctitle\x3e'+this._.docTitle+"\x3c/title\x3e"+h+g+"\x3c/head\x3e\x3cbody"+(c.bodyId?' id\x3d"'+c.bodyId+'"':"")+(c.bodyClass?' class\x3d"'+c.bodyClass+'"':"")+"\x3e"+a+"\x3c/body\x3e\x3c/html\x3e";CKEDITOR.env.gecko&&(a=a.replace(/<body/,'\x3cbody contenteditable\x3d"true" '),2E4>CKEDITOR.env.version&&(a=a.replace(/<body[^>]*>/,"$\x26\x3c!-- cke-content-start --\x3e")));
c='\x3cscript id\x3d"cke_actscrpt" type\x3d"text/javascript"'+(CKEDITOR.env.ie?' defer\x3d"defer" ':"")+"\x3evar wasLoaded\x3d0;function onload(){if(!wasLoaded)window.parent.CKEDITOR.tools.callFunction("+this._.frameLoadedHandler+",window);wasLoaded\x3d1;}"+(CKEDITOR.env.ie?"onload();":'document.addEventListener("DOMContentLoaded", onload, false );')+"\x3c/script\x3e";CKEDITOR.env.ie&&9>CKEDITOR.env.version&&(c+='\x3cscript id\x3d"cke_shimscrpt"\x3ewindow.parent.CKEDITOR.tools.enableHtml5Elements(document)\x3c/script\x3e');
h&&CKEDITOR.env.ie&&10>CKEDITOR.env.version&&(c+='\x3cscript id\x3d"cke_basetagscrpt"\x3evar baseTag \x3d document.querySelector( "base" );baseTag.href \x3d baseTag.href;\x3c/script\x3e');a=a.replace(/(?=\s*<\/(:?head)>)/,c);this.clearCustomData();this.clearListeners();b.fire("contentDomUnload");var k=this.getDocument();try{k.write(a)}catch(l){setTimeout(function(){k.write(a)},0)}}},getData:function(a){if(a)return this.getHtml();a=this.editor;var f=a.config,b=f.fullPage,c=b&&a.docType,d=b&&a.xmlDeclaration,
e=this.getDocument(),b=b?e.getDocumentElement().getOuterHtml():e.getBody().getHtml();CKEDITOR.env.gecko&&f.enterMode!=CKEDITOR.ENTER_BR&&(b=b.replace(/<br>(?=\s*(:?$|<\/body>))/,""));b=a.dataProcessor.toDataFormat(b);d&&(b=d+"\n"+b);c&&(b=c+"\n"+b);return b},focus:function(){this._.isLoadingData?this._.isPendingFocus=!0:l.baseProto.focus.call(this)},detach:function(){var a=this.editor,f=a.document,b;try{b=a.window.getFrame()}catch(c){}l.baseProto.detach.call(this);this.clearCustomData();f.getDocumentElement().clearCustomData();
CKEDITOR.tools.removeFunction(this._.frameLoadedHandler);b&&b.getParent()?(b.clearCustomData(),(a=b.removeCustomData("onResize"))&&a.removeListener(),b.remove()):CKEDITOR.warn("editor-destroy-iframe")}}})})();CKEDITOR.config.disableObjectResizing=!1;CKEDITOR.config.disableNativeTableHandles=!0;CKEDITOR.config.disableNativeSpellChecker=!0;(function(){function e(b,a){a||(a=b.getSelection().getSelectedElement());if(a&&a.is("img")&&!a.data("cke-realelement")&&!a.isReadOnly())return a}function f(b){var a=b.getStyle("float");if("inherit"==a||"none"==a)a=0;a||(a=b.getAttribute("align"));return a}CKEDITOR.plugins.add("image",{requires:"dialog",init:function(b){if(!b.plugins.image2){CKEDITOR.dialog.add("image",this.path+"dialogs/image.js");var a="img[alt,!src]{border-style,border-width,float,height,margin,margin-bottom,margin-left,margin-right,margin-top,width}";
CKEDITOR.dialog.isTabEnabled(b,"image","advanced")&&(a="img[alt,dir,id,lang,longdesc,!src,title]{*}(*)");b.addCommand("image",new CKEDITOR.dialogCommand("image",{allowedContent:a,requiredContent:"img[alt,src]",contentTransformations:[["img{width}: sizeToStyle","img[width]: sizeToAttribute"],["img{float}: alignmentToStyle","img[align]: alignmentToAttribute"]]}));b.ui.addButton&&b.ui.addButton("Image",{label:b.lang.common.image,command:"image",toolbar:"insert,10"});b.on("doubleclick",function(b){var a=
b.data.element;!a.is("img")||a.data("cke-realelement")||a.isReadOnly()||(b.data.dialog="image")});b.addMenuItems&&b.addMenuItems({image:{label:b.lang.image.menu,command:"image",group:"image"}});b.contextMenu&&b.contextMenu.addListener(function(a){if(e(b,a))return{image:CKEDITOR.TRISTATE_OFF}})}},afterInit:function(b){function a(a){var d=b.getCommand("justify"+a);if(d){if("left"==a||"right"==a)d.on("exec",function(d){var c=e(b),g;c&&(g=f(c),g==a?(c.removeStyle("float"),a==f(c)&&c.removeAttribute("align")):
c.setStyle("float",a),d.cancel())});d.on("refresh",function(d){var c=e(b);c&&(c=f(c),this.setState(c==a?CKEDITOR.TRISTATE_ON:"right"==a||"left"==a?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED),d.cancel())})}}b.plugins.image2||(a("left"),a("right"),a("center"),a("block"))}})})();CKEDITOR.config.image_removeLinkByEmptyURL=!0;(function(){function m(a,b){var e,f;b.on("refresh",function(a){var b=[k],c;for(c in a.data.states)b.push(a.data.states[c]);this.setState(CKEDITOR.tools.search(b,p)?p:k)},b,null,100);b.on("exec",function(b){e=a.getSelection();f=e.createBookmarks(1);b.data||(b.data={});b.data.done=!1},b,null,0);b.on("exec",function(){a.forceNextSelectionCheck();e.selectBookmarks(f)},b,null,100)}var k=CKEDITOR.TRISTATE_DISABLED,p=CKEDITOR.TRISTATE_OFF;CKEDITOR.plugins.add("indent",{init:function(a){var b=CKEDITOR.plugins.indent.genericDefinition;
m(a,a.addCommand("indent",new b(!0)));m(a,a.addCommand("outdent",new b));a.ui.addButton&&(a.ui.addButton("Indent",{label:a.lang.indent.indent,command:"indent",directional:!0,toolbar:"indent,20"}),a.ui.addButton("Outdent",{label:a.lang.indent.outdent,command:"outdent",directional:!0,toolbar:"indent,10"}));a.on("dirChanged",function(b){var f=a.createRange(),l=b.data.node;f.setStartBefore(l);f.setEndAfter(l);for(var n=new CKEDITOR.dom.walker(f),c;c=n.next();)if(c.type==CKEDITOR.NODE_ELEMENT)if(!c.equals(l)&&
c.getDirection())f.setStartAfter(c),n=new CKEDITOR.dom.walker(f);else{var d=a.config.indentClasses;if(d)for(var g="ltr"==b.data.dir?["_rtl",""]:["","_rtl"],h=0;h<d.length;h++)c.hasClass(d[h]+g[0])&&(c.removeClass(d[h]+g[0]),c.addClass(d[h]+g[1]));d=c.getStyle("margin-right");g=c.getStyle("margin-left");d?c.setStyle("margin-left",d):c.removeStyle("margin-left");g?c.setStyle("margin-right",g):c.removeStyle("margin-right")}})}});CKEDITOR.plugins.indent={genericDefinition:function(a){this.isIndent=!!a;
this.startDisabled=!this.isIndent},specificDefinition:function(a,b,e){this.name=b;this.editor=a;this.jobs={};this.enterBr=a.config.enterMode==CKEDITOR.ENTER_BR;this.isIndent=!!e;this.relatedGlobal=e?"indent":"outdent";this.indentKey=e?9:CKEDITOR.SHIFT+9;this.database={}},registerCommands:function(a,b){a.on("pluginsLoaded",function(){for(var a in b)(function(a,b){var e=a.getCommand(b.relatedGlobal),c;for(c in b.jobs)e.on("exec",function(d){d.data.done||(a.fire("lockSnapshot"),b.execJob(a,c)&&(d.data.done=
!0),a.fire("unlockSnapshot"),CKEDITOR.dom.element.clearAllMarkers(b.database))},this,null,c),e.on("refresh",function(d){d.data.states||(d.data.states={});d.data.states[b.name+"@"+c]=b.refreshJob(a,c,d.data.path)},this,null,c);a.addFeature(b)})(this,b[a])})}};CKEDITOR.plugins.indent.genericDefinition.prototype={context:"p",exec:function(){}};CKEDITOR.plugins.indent.specificDefinition.prototype={execJob:function(a,b){var e=this.jobs[b];if(e.state!=k)return e.exec.call(this,a)},refreshJob:function(a,
b,e){b=this.jobs[b];a.activeFilter.checkFeature(this)?b.state=b.refresh.call(this,a,e):b.state=k;return b.state},getContext:function(a){return a.contains(this.context)}}})();(function(){function w(c){function f(b){for(var e=d.startContainer,a=d.endContainer;e&&!e.getParent().equals(b);)e=e.getParent();for(;a&&!a.getParent().equals(b);)a=a.getParent();if(!e||!a)return!1;for(var g=e,e=[],k=!1;!k;)g.equals(a)&&(k=!0),e.push(g),g=g.getNext();if(1>e.length)return!1;g=b.getParents(!0);for(a=0;a<g.length;a++)if(g[a].getName&&p[g[a].getName()]){b=g[a];break}for(var g=l.isIndent?1:-1,a=e[0],e=e[e.length-1],k=CKEDITOR.plugins.list.listToArray(b,q),n=k[e.getCustomData("listarray_index")].indent,
a=a.getCustomData("listarray_index");a<=e.getCustomData("listarray_index");a++)if(k[a].indent+=g,0<g){var h=k[a].parent;k[a].parent=new CKEDITOR.dom.element(h.getName(),h.getDocument())}for(a=e.getCustomData("listarray_index")+1;a<k.length&&k[a].indent>n;a++)k[a].indent+=g;e=CKEDITOR.plugins.list.arrayToList(k,q,null,c.config.enterMode,b.getDirection());if(!l.isIndent){var f;if((f=b.getParent())&&f.is("li"))for(var g=e.listNode.getChildren(),r=[],m,a=g.count()-1;0<=a;a--)(m=g.getItem(a))&&m.is&&m.is("li")&&
r.push(m)}e&&e.listNode.replace(b);if(r&&r.length)for(a=0;a<r.length;a++){for(m=b=r[a];(m=m.getNext())&&m.is&&m.getName()in p;)CKEDITOR.env.needsNbspFiller&&!b.getFirst(x)&&b.append(d.document.createText(" ")),b.append(m);b.insertAfter(f)}e&&c.fire("contentDomInvalidated");return!0}for(var l=this,q=this.database,p=this.context,n=c.getSelection(),n=(n&&n.getRanges()).createIterator(),d;d=n.getNextRange();){for(var b=d.getCommonAncestor();b&&(b.type!=CKEDITOR.NODE_ELEMENT||!p[b.getName()]);){if(c.editable().equals(b)){b=
!1;break}b=b.getParent()}b||(b=d.startPath().contains(p))&&d.setEndAt(b,CKEDITOR.POSITION_BEFORE_END);if(!b){var h=d.getEnclosedNode();h&&h.type==CKEDITOR.NODE_ELEMENT&&h.getName()in p&&(d.setStartAt(h,CKEDITOR.POSITION_AFTER_START),d.setEndAt(h,CKEDITOR.POSITION_BEFORE_END),b=h)}b&&d.startContainer.type==CKEDITOR.NODE_ELEMENT&&d.startContainer.getName()in p&&(h=new CKEDITOR.dom.walker(d),h.evaluator=t,d.startContainer=h.next());b&&d.endContainer.type==CKEDITOR.NODE_ELEMENT&&d.endContainer.getName()in
p&&(h=new CKEDITOR.dom.walker(d),h.evaluator=t,d.endContainer=h.previous());if(b)return f(b)}return 0}function t(c){return c.type==CKEDITOR.NODE_ELEMENT&&c.is("li")}function x(c){return y(c)&&z(c)}var y=CKEDITOR.dom.walker.whitespaces(!0),z=CKEDITOR.dom.walker.bookmark(!1,!0),u=CKEDITOR.TRISTATE_DISABLED,v=CKEDITOR.TRISTATE_OFF;CKEDITOR.plugins.add("indentlist",{requires:"indent",init:function(c){function f(c){l.specificDefinition.apply(this,arguments);this.requiredContent=["ul","ol"];c.on("key",
function(f){if("wysiwyg"==c.mode&&f.data.keyCode==this.indentKey){var n=this.getContext(c.elementPath());!n||this.isIndent&&CKEDITOR.plugins.indentList.firstItemInPath(this.context,c.elementPath(),n)||(c.execCommand(this.relatedGlobal),f.cancel())}},this);this.jobs[this.isIndent?10:30]={refresh:this.isIndent?function(c,f){var d=this.getContext(f),b=CKEDITOR.plugins.indentList.firstItemInPath(this.context,f,d);return d&&this.isIndent&&!b?v:u}:function(c,f){return!this.getContext(f)||this.isIndent?
u:v},exec:CKEDITOR.tools.bind(w,this)}}var l=CKEDITOR.plugins.indent;l.registerCommands(c,{indentlist:new f(c,"indentlist",!0),outdentlist:new f(c,"outdentlist")});CKEDITOR.tools.extend(f.prototype,l.specificDefinition.prototype,{context:{ol:1,ul:1}})}});CKEDITOR.plugins.indentList={};CKEDITOR.plugins.indentList.firstItemInPath=function(c,f,l){var q=f.contains(t);l||(l=f.contains(c));return l&&q&&q.equals(l.getFirst(t))}})();(function(){function g(a,b){var c=l.exec(a),d=l.exec(b);if(c){if(!c[2]&&"px"==d[2])return d[1];if("px"==c[2]&&!d[2])return d[1]+"px"}return b}var k=CKEDITOR.htmlParser.cssStyle,h=CKEDITOR.tools.cssLength,l=/^((?:\d*(?:\.\d+))|(?:\d+))(.*)?$/i,m={elements:{$:function(a){var b=a.attributes;if((b=(b=(b=b&&b["data-cke-realelement"])&&new CKEDITOR.htmlParser.fragment.fromHtml(decodeURIComponent(b)))&&b.children[0])&&a.attributes["data-cke-resizable"]){var c=(new k(a)).rules;a=b.attributes;var d=c.width,
c=c.height;d&&(a.width=g(a.width,d));c&&(a.height=g(a.height,c))}return b}}};CKEDITOR.plugins.add("fakeobjects",{init:function(a){a.filter.allow("img[!data-cke-realelement,src,alt,title](*){*}","fakeobjects")},afterInit:function(a){(a=(a=a.dataProcessor)&&a.htmlFilter)&&a.addRules(m,{applyToAll:!0})}});CKEDITOR.editor.prototype.createFakeElement=function(a,b,c,d){var e=this.lang.fakeobjects,e=e[c]||e.unknown;b={"class":b,"data-cke-realelement":encodeURIComponent(a.getOuterHtml()),"data-cke-real-node-type":a.type,
alt:e,title:e,align:a.getAttribute("align")||""};CKEDITOR.env.hc||(b.src=CKEDITOR.tools.transparentImageData);c&&(b["data-cke-real-element-type"]=c);d&&(b["data-cke-resizable"]=d,c=new k,d=a.getAttribute("width"),a=a.getAttribute("height"),d&&(c.rules.width=h(d)),a&&(c.rules.height=h(a)),c.populate(b));return this.document.createElement("img",{attributes:b})};CKEDITOR.editor.prototype.createFakeParserElement=function(a,b,c,d){var e=this.lang.fakeobjects,e=e[c]||e.unknown,f;f=new CKEDITOR.htmlParser.basicWriter;
a.writeHtml(f);f=f.getHtml();b={"class":b,"data-cke-realelement":encodeURIComponent(f),"data-cke-real-node-type":a.type,alt:e,title:e,align:a.attributes.align||""};CKEDITOR.env.hc||(b.src=CKEDITOR.tools.transparentImageData);c&&(b["data-cke-real-element-type"]=c);d&&(b["data-cke-resizable"]=d,d=a.attributes,a=new k,c=d.width,d=d.height,void 0!==c&&(a.rules.width=h(c)),void 0!==d&&(a.rules.height=h(d)),a.populate(b));return new CKEDITOR.htmlParser.element("img",b)};CKEDITOR.editor.prototype.restoreRealElement=
function(a){if(a.data("cke-real-node-type")!=CKEDITOR.NODE_ELEMENT)return null;var b=CKEDITOR.dom.element.createFromHtml(decodeURIComponent(a.data("cke-realelement")),this.document);if(a.data("cke-resizable")){var c=a.getStyle("width");a=a.getStyle("height");c&&b.setAttribute("width",g(b.getAttribute("width"),c));a&&b.setAttribute("height",g(b.getAttribute("height"),a))}return b}})();(function(){function p(c){return c.replace(/'/g,"\\$\x26")}function q(c){for(var b,a=c.length,f=[],e=0;e<a;e++)b=c.charCodeAt(e),f.push(b);return"String.fromCharCode("+f.join(",")+")"}function r(c,b){var a=c.plugins.link,f=a.compiledProtectionFunction.params,e,d;d=[a.compiledProtectionFunction.name,"("];for(var g=0;g<f.length;g++)a=f[g].toLowerCase(),e=b[a],0<g&&d.push(","),d.push("'",e?p(encodeURIComponent(b[a])):"","'");d.push(")");return d.join("")}function n(c){c=c.config.emailProtection||"";
var b;c&&"encode"!=c&&(b={},c.replace(/^([^(]+)\(([^)]+)\)$/,function(a,c,e){b.name=c;b.params=[];e.replace(/[^,\s]+/g,function(a){b.params.push(a)})}));return b}CKEDITOR.plugins.add("link",{requires:"dialog,fakeobjects",onLoad:function(){function c(b){return a.replace(/%1/g,"rtl"==b?"right":"left").replace(/%2/g,"cke_contents_"+b)}var b="background:url("+CKEDITOR.getUrl(this.path+"images"+(CKEDITOR.env.hidpi?"/hidpi":"")+"/anchor.png")+") no-repeat %1 center;border:1px dotted #00f;background-size:16px;",
a=".%2 a.cke_anchor,.%2 a.cke_anchor_empty,.cke_editable.%2 a[name],.cke_editable.%2 a[data-cke-saved-name]{"+b+"padding-%1:18px;cursor:auto;}.%2 img.cke_anchor{"+b+"width:16px;min-height:15px;height:1.15em;vertical-align:text-bottom;}";CKEDITOR.addCss(c("ltr")+c("rtl"))},init:function(c){var b="a[!href]";CKEDITOR.dialog.isTabEnabled(c,"link","advanced")&&(b=b.replace("]",",accesskey,charset,dir,id,lang,name,rel,tabindex,title,type]{*}(*)"));CKEDITOR.dialog.isTabEnabled(c,"link","target")&&(b=b.replace("]",
",target,onclick]"));c.addCommand("link",new CKEDITOR.dialogCommand("link",{allowedContent:b,requiredContent:"a[href]"}));c.addCommand("anchor",new CKEDITOR.dialogCommand("anchor",{allowedContent:"a[!name,id]",requiredContent:"a[name]"}));c.addCommand("unlink",new CKEDITOR.unlinkCommand);c.addCommand("removeAnchor",new CKEDITOR.removeAnchorCommand);c.setKeystroke(CKEDITOR.CTRL+76,"link");c.ui.addButton&&(c.ui.addButton("Link",{label:c.lang.link.toolbar,command:"link",toolbar:"links,10"}),c.ui.addButton("Unlink",
{label:c.lang.link.unlink,command:"unlink",toolbar:"links,20"}),c.ui.addButton("Anchor",{label:c.lang.link.anchor.toolbar,command:"anchor",toolbar:"links,30"}));CKEDITOR.dialog.add("link",this.path+"dialogs/link.js");CKEDITOR.dialog.add("anchor",this.path+"dialogs/anchor.js");c.on("doubleclick",function(a){var b=CKEDITOR.plugins.link.getSelectedLink(c)||a.data.element;b.isReadOnly()||(b.is("a")?(a.data.dialog=!b.getAttribute("name")||b.getAttribute("href")&&b.getChildCount()?"link":"anchor",a.data.link=
b):CKEDITOR.plugins.link.tryRestoreFakeAnchor(c,b)&&(a.data.dialog="anchor"))},null,null,0);c.on("doubleclick",function(a){a.data.dialog in{link:1,anchor:1}&&a.data.link&&c.getSelection().selectElement(a.data.link)},null,null,20);c.addMenuItems&&c.addMenuItems({anchor:{label:c.lang.link.anchor.menu,command:"anchor",group:"anchor",order:1},removeAnchor:{label:c.lang.link.anchor.remove,command:"removeAnchor",group:"anchor",order:5},link:{label:c.lang.link.menu,command:"link",group:"link",order:1},unlink:{label:c.lang.link.unlink,
command:"unlink",group:"link",order:5}});c.contextMenu&&c.contextMenu.addListener(function(a){if(!a||a.isReadOnly())return null;a=CKEDITOR.plugins.link.tryRestoreFakeAnchor(c,a);if(!a&&!(a=CKEDITOR.plugins.link.getSelectedLink(c)))return null;var b={};a.getAttribute("href")&&a.getChildCount()&&(b={link:CKEDITOR.TRISTATE_OFF,unlink:CKEDITOR.TRISTATE_OFF});a&&a.hasAttribute("name")&&(b.anchor=b.removeAnchor=CKEDITOR.TRISTATE_OFF);return b});this.compiledProtectionFunction=n(c)},afterInit:function(c){c.dataProcessor.dataFilter.addRules({elements:{a:function(a){return a.attributes.name?
a.children.length?null:c.createFakeParserElement(a,"cke_anchor","anchor"):null}}});var b=c._.elementsPath&&c._.elementsPath.filters;b&&b.push(function(a,b){if("a"==b&&(CKEDITOR.plugins.link.tryRestoreFakeAnchor(c,a)||a.getAttribute("name")&&(!a.getAttribute("href")||!a.getChildCount())))return"anchor"})}});var t=/^javascript:/,u=/^mailto:([^?]+)(?:\?(.+))?$/,v=/subject=([^;?:@&=$,\/]*)/i,w=/body=([^;?:@&=$,\/]*)/i,x=/^#(.*)$/,y=/^((?:http|https|ftp|news):\/\/)?(.*)$/,z=/^(_(?:self|top|parent|blank))$/,
A=/^javascript:void\(location\.href='mailto:'\+String\.fromCharCode\(([^)]+)\)(?:\+'(.*)')?\)$/,B=/^javascript:([^(]+)\(([^)]+)\)$/,C=/\s*window.open\(\s*this\.href\s*,\s*(?:'([^']*)'|null)\s*,\s*'([^']*)'\s*\)\s*;\s*return\s*false;*\s*/,D=/(?:^|,)([^=]+)=(\d+|yes|no)/gi,m={id:"advId",dir:"advLangDir",accessKey:"advAccessKey",name:"advName",lang:"advLangCode",tabindex:"advTabIndex",title:"advTitle",type:"advContentType","class":"advCSSClasses",charset:"advCharset",style:"advStyles",rel:"advRel"};
CKEDITOR.plugins.link={getSelectedLink:function(c){var b=c.getSelection(),a=b.getSelectedElement();return a&&a.is("a")?a:(b=b.getRanges()[0])?(b.shrink(CKEDITOR.SHRINK_TEXT),c.elementPath(b.getCommonAncestor()).contains("a",1)):null},getEditorAnchors:function(c){for(var b=c.editable(),a=b.isInline()&&!c.plugins.divarea?c.document:b,b=a.getElementsByTag("a"),a=a.getElementsByTag("img"),f=[],e=0,d;d=b.getItem(e++);)(d.data("cke-saved-name")||d.hasAttribute("name"))&&f.push({name:d.data("cke-saved-name")||
d.getAttribute("name"),id:d.getAttribute("id")});for(e=0;d=a.getItem(e++);)(d=this.tryRestoreFakeAnchor(c,d))&&f.push({name:d.getAttribute("name"),id:d.getAttribute("id")});return f},fakeAnchor:!0,tryRestoreFakeAnchor:function(c,b){if(b&&b.data("cke-real-element-type")&&"anchor"==b.data("cke-real-element-type")){var a=c.restoreRealElement(b);if(a.data("cke-saved-name"))return a}},parseLinkAttributes:function(c,b){var a=b&&(b.data("cke-saved-href")||b.getAttribute("href"))||"",f=c.plugins.link.compiledProtectionFunction,
e=c.config.emailProtection,d,g={};a.match(t)&&("encode"==e?a=a.replace(A,function(a,b,c){c=c||"";return"mailto:"+String.fromCharCode.apply(String,b.split(","))+c.replace(/\\'/g,"'")}):e&&a.replace(B,function(a,b,c){if(b==f.name){g.type="email";a=g.email={};b=/(^')|('$)/g;c=c.match(/[^,\s]+/g);for(var d=c.length,e,h,k=0;k<d;k++)e=decodeURIComponent,h=c[k].replace(b,"").replace(/\\'/g,"'"),h=e(h),e=f.params[k].toLowerCase(),a[e]=h;a.address=[a.name,a.domain].join("@")}}));if(!g.type)if(e=a.match(x))g.type=
"anchor",g.anchor={},g.anchor.name=g.anchor.id=e[1];else if(e=a.match(u)){d=a.match(v);a=a.match(w);g.type="email";var k=g.email={};k.address=e[1];d&&(k.subject=decodeURIComponent(d[1]));a&&(k.body=decodeURIComponent(a[1]))}else a&&(d=a.match(y))&&(g.type="url",g.url={},g.url.protocol=d[1],g.url.url=d[2]);if(b){if(a=b.getAttribute("target"))g.target={type:a.match(z)?a:"frame",name:a};else if(a=(a=b.data("cke-pa-onclick")||b.getAttribute("onclick"))&&a.match(C))for(g.target={type:"popup",name:a[1]};e=
D.exec(a[2]);)"yes"!=e[2]&&"1"!=e[2]||e[1]in{height:1,width:1,top:1,left:1}?isFinite(e[2])&&(g.target[e[1]]=e[2]):g.target[e[1]]=!0;var a={},h;for(h in m)(e=b.getAttribute(h))&&(a[m[h]]=e);if(h=b.data("cke-saved-name")||a.advName)a.advName=h;CKEDITOR.tools.isEmpty(a)||(g.advanced=a)}return g},getLinkAttributes:function(c,b){var a=c.config.emailProtection||"",f={};switch(b.type){case "url":var a=b.url&&void 0!==b.url.protocol?b.url.protocol:"http://",e=b.url&&CKEDITOR.tools.trim(b.url.url)||"";f["data-cke-saved-href"]=
0===e.indexOf("/")?e:a+e;break;case "anchor":a=b.anchor&&b.anchor.id;f["data-cke-saved-href"]="#"+(b.anchor&&b.anchor.name||a||"");break;case "email":var d=b.email,e=d.address;switch(a){case "":case "encode":var g=encodeURIComponent(d.subject||""),k=encodeURIComponent(d.body||""),d=[];g&&d.push("subject\x3d"+g);k&&d.push("body\x3d"+k);d=d.length?"?"+d.join("\x26"):"";"encode"==a?(a=["javascript:void(location.href\x3d'mailto:'+",q(e)],d&&a.push("+'",p(d),"'"),a.push(")")):a=["mailto:",e,d];break;default:a=
e.split("@",2),d.name=a[0],d.domain=a[1],a=["javascript:",r(c,d)]}f["data-cke-saved-href"]=a.join("")}if(b.target)if("popup"==b.target.type){for(var a=["window.open(this.href, '",b.target.name||"","', '"],h="resizable status location toolbar menubar fullscreen scrollbars dependent".split(" "),e=h.length,g=function(a){b.target[a]&&h.push(a+"\x3d"+b.target[a])},d=0;d<e;d++)h[d]+=b.target[h[d]]?"\x3dyes":"\x3dno";g("width");g("left");g("height");g("top");a.push(h.join(","),"'); return false;");f["data-cke-pa-onclick"]=
a.join("")}else"notSet"!=b.target.type&&b.target.name&&(f.target=b.target.name);if(b.advanced){for(var l in m)(a=b.advanced[m[l]])&&(f[l]=a);f.name&&(f["data-cke-saved-name"]=f.name)}f["data-cke-saved-href"]&&(f.href=f["data-cke-saved-href"]);l={target:1,onclick:1,"data-cke-pa-onclick":1,"data-cke-saved-name":1};b.advanced&&CKEDITOR.tools.extend(l,m);for(var n in f)delete l[n];return{set:f,removed:CKEDITOR.tools.objectKeys(l)}}};CKEDITOR.unlinkCommand=function(){};CKEDITOR.unlinkCommand.prototype=
{exec:function(c){var b=new CKEDITOR.style({element:"a",type:CKEDITOR.STYLE_INLINE,alwaysRemoveElement:1});c.removeStyle(b)},refresh:function(c,b){var a=b.lastElement&&b.lastElement.getAscendant("a",!0);a&&"a"==a.getName()&&a.getAttribute("href")&&a.getChildCount()?this.setState(CKEDITOR.TRISTATE_OFF):this.setState(CKEDITOR.TRISTATE_DISABLED)},contextSensitive:1,startDisabled:1,requiredContent:"a[href]"};CKEDITOR.removeAnchorCommand=function(){};CKEDITOR.removeAnchorCommand.prototype={exec:function(c){var b=
c.getSelection(),a=b.createBookmarks(),f;if(b&&(f=b.getSelectedElement())&&(f.getChildCount()?f.is("a"):CKEDITOR.plugins.link.tryRestoreFakeAnchor(c,f)))f.remove(1);else if(f=CKEDITOR.plugins.link.getSelectedLink(c))f.hasAttribute("href")?(f.removeAttributes({name:1,"data-cke-saved-name":1}),f.removeClass("cke_anchor")):f.remove(1);b.selectBookmarks(a)},requiredContent:"a[name]"};CKEDITOR.tools.extend(CKEDITOR.config,{linkShowAdvancedTab:!0,linkShowTargetTab:!0})})();(function(){function I(b,m,e){function c(c){if(!(!(a=d[c?"getFirst":"getLast"]())||a.is&&a.isBlockBoundary()||!(p=m.root[c?"getPrevious":"getNext"](CKEDITOR.dom.walker.invisible(!0)))||p.is&&p.isBlockBoundary({br:1})))b.document.createElement("br")[c?"insertBefore":"insertAfter"](a)}for(var f=CKEDITOR.plugins.list.listToArray(m.root,e),g=[],k=0;k<m.contents.length;k++){var h=m.contents[k];(h=h.getAscendant("li",!0))&&!h.getCustomData("list_item_processed")&&(g.push(h),CKEDITOR.dom.element.setMarker(e,
h,"list_item_processed",!0))}h=null;for(k=0;k<g.length;k++)h=g[k].getCustomData("listarray_index"),f[h].indent=-1;for(k=h+1;k<f.length;k++)if(f[k].indent>f[k-1].indent+1){g=f[k-1].indent+1-f[k].indent;for(h=f[k].indent;f[k]&&f[k].indent>=h;)f[k].indent+=g,k++;k--}var d=CKEDITOR.plugins.list.arrayToList(f,e,null,b.config.enterMode,m.root.getAttribute("dir")).listNode,a,p;c(!0);c();d.replace(m.root);b.fire("contentDomInvalidated")}function B(b,m){this.name=b;this.context=this.type=m;this.allowedContent=
m+" li";this.requiredContent=m}function E(b,m,e,c){for(var f,g;f=b[c?"getLast":"getFirst"](J);)(g=f.getDirection(1))!==m.getDirection(1)&&f.setAttribute("dir",g),f.remove(),e?f[c?"insertBefore":"insertAfter"](e):m.append(f,c)}function F(b){function m(e){var c=b[e?"getPrevious":"getNext"](u);c&&c.type==CKEDITOR.NODE_ELEMENT&&c.is(b.getName())&&(E(b,c,null,!e),b.remove(),b=c)}m();m(1)}function G(b){return b.type==CKEDITOR.NODE_ELEMENT&&(b.getName()in CKEDITOR.dtd.$block||b.getName()in CKEDITOR.dtd.$listItem)&&
CKEDITOR.dtd[b.getName()]["#"]}function C(b,m,e){b.fire("saveSnapshot");e.enlarge(CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS);var c=e.extractContents();m.trim(!1,!0);var f=m.createBookmark(),g=new CKEDITOR.dom.elementPath(m.startContainer),k=g.block,g=g.lastElement.getAscendant("li",1)||k,h=new CKEDITOR.dom.elementPath(e.startContainer),d=h.contains(CKEDITOR.dtd.$listItem),h=h.contains(CKEDITOR.dtd.$list);k?(k=k.getBogus())&&k.remove():h&&(k=h.getPrevious(u))&&z(k)&&k.remove();(k=c.getLast())&&k.type==CKEDITOR.NODE_ELEMENT&&
k.is("br")&&k.remove();(k=m.startContainer.getChild(m.startOffset))?c.insertBefore(k):m.startContainer.append(c);d&&(c=A(d))&&(g.contains(d)?(E(c,d.getParent(),d),c.remove()):g.append(c));for(;e.checkStartOfBlock()&&e.checkEndOfBlock();){h=e.startPath();c=h.block;if(!c)break;c.is("li")&&(g=c.getParent(),c.equals(g.getLast(u))&&c.equals(g.getFirst(u))&&(c=g));e.moveToPosition(c,CKEDITOR.POSITION_BEFORE_START);c.remove()}e=e.clone();c=b.editable();e.setEndAt(c,CKEDITOR.POSITION_BEFORE_END);e=new CKEDITOR.dom.walker(e);
e.evaluator=function(a){return u(a)&&!z(a)};(e=e.next())&&e.type==CKEDITOR.NODE_ELEMENT&&e.getName()in CKEDITOR.dtd.$list&&F(e);m.moveToBookmark(f);m.select();b.fire("saveSnapshot")}function A(b){return(b=b.getLast(u))&&b.type==CKEDITOR.NODE_ELEMENT&&b.getName()in v?b:null}var v={ol:1,ul:1},K=CKEDITOR.dom.walker.whitespaces(),H=CKEDITOR.dom.walker.bookmark(),u=function(b){return!(K(b)||H(b))},z=CKEDITOR.dom.walker.bogus();CKEDITOR.plugins.list={listToArray:function(b,m,e,c,f){if(!v[b.getName()])return[];
c||(c=0);e||(e=[]);for(var g=0,k=b.getChildCount();g<k;g++){var h=b.getChild(g);h.type==CKEDITOR.NODE_ELEMENT&&h.getName()in CKEDITOR.dtd.$list&&CKEDITOR.plugins.list.listToArray(h,m,e,c+1);if("li"==h.$.nodeName.toLowerCase()){var d={parent:b,indent:c,element:h,contents:[]};f?d.grandparent=f:(d.grandparent=b.getParent(),d.grandparent&&"li"==d.grandparent.$.nodeName.toLowerCase()&&(d.grandparent=d.grandparent.getParent()));m&&CKEDITOR.dom.element.setMarker(m,h,"listarray_index",e.length);e.push(d);
for(var a=0,p=h.getChildCount(),l;a<p;a++)l=h.getChild(a),l.type==CKEDITOR.NODE_ELEMENT&&v[l.getName()]?CKEDITOR.plugins.list.listToArray(l,m,e,c+1,d.grandparent):d.contents.push(l)}}return e},arrayToList:function(b,m,e,c,f){e||(e=0);if(!b||b.length<e+1)return null;for(var g,k=b[e].parent.getDocument(),h=new CKEDITOR.dom.documentFragment(k),d=null,a=e,p=Math.max(b[e].indent,0),l=null,q,n,t=c==CKEDITOR.ENTER_P?"p":"div";;){var r=b[a];g=r.grandparent;q=r.element.getDirection(1);if(r.indent==p){d&&b[a].parent.getName()==
d.getName()||(d=b[a].parent.clone(!1,1),f&&d.setAttribute("dir",f),h.append(d));l=d.append(r.element.clone(0,1));q!=d.getDirection(1)&&l.setAttribute("dir",q);for(g=0;g<r.contents.length;g++)l.append(r.contents[g].clone(1,1));a++}else if(r.indent==Math.max(p,0)+1)r=b[a-1].element.getDirection(1),a=CKEDITOR.plugins.list.arrayToList(b,null,a,c,r!=q?q:null),!l.getChildCount()&&CKEDITOR.env.needsNbspFiller&&7>=k.$.documentMode&&l.append(k.createText(" ")),l.append(a.listNode),a=a.nextIndex;else if(-1==
r.indent&&!e&&g){v[g.getName()]?(l=r.element.clone(!1,!0),q!=g.getDirection(1)&&l.setAttribute("dir",q)):l=new CKEDITOR.dom.documentFragment(k);var d=g.getDirection(1)!=q,y=r.element,D=y.getAttribute("class"),z=y.getAttribute("style"),A=l.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT&&(c!=CKEDITOR.ENTER_BR||d||z||D),w,B=r.contents.length,x;for(g=0;g<B;g++)if(w=r.contents[g],H(w)&&1<B)A?x=w.clone(1,1):l.append(w.clone(1,1));else if(w.type==CKEDITOR.NODE_ELEMENT&&w.isBlockBoundary()){d&&!w.getDirection()&&
w.setAttribute("dir",q);n=w;var C=y.getAttribute("style");C&&n.setAttribute("style",C.replace(/([^;])$/,"$1;")+(n.getAttribute("style")||""));D&&w.addClass(D);n=null;x&&(l.append(x),x=null);l.append(w.clone(1,1))}else A?(n||(n=k.createElement(t),l.append(n),d&&n.setAttribute("dir",q)),z&&n.setAttribute("style",z),D&&n.setAttribute("class",D),x&&(n.append(x),x=null),n.append(w.clone(1,1))):l.append(w.clone(1,1));x&&((n||l).append(x),x=null);l.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT&&a!=b.length-1&&(CKEDITOR.env.needsBrFiller&&
(q=l.getLast())&&q.type==CKEDITOR.NODE_ELEMENT&&q.is("br")&&q.remove(),(q=l.getLast(u))&&q.type==CKEDITOR.NODE_ELEMENT&&q.is(CKEDITOR.dtd.$block)||l.append(k.createElement("br")));q=l.$.nodeName.toLowerCase();"div"!=q&&"p"!=q||l.appendBogus();h.append(l);d=null;a++}else return null;n=null;if(b.length<=a||Math.max(b[a].indent,0)<p)break}if(m)for(b=h.getFirst();b;){if(b.type==CKEDITOR.NODE_ELEMENT&&(CKEDITOR.dom.element.clearMarkers(m,b),b.getName()in CKEDITOR.dtd.$listItem&&(e=b,k=f=c=void 0,c=e.getDirection()))){for(f=
e.getParent();f&&!(k=f.getDirection());)f=f.getParent();c==k&&e.removeAttribute("dir")}b=b.getNextSourceNode()}return{listNode:h,nextIndex:a}}};var L=/^h[1-6]$/,J=CKEDITOR.dom.walker.nodeType(CKEDITOR.NODE_ELEMENT);B.prototype={exec:function(b){this.refresh(b,b.elementPath());var m=b.config,e=b.getSelection(),c=e&&e.getRanges();if(this.state==CKEDITOR.TRISTATE_OFF){var f=b.editable();if(f.getFirst(u)){var g=1==c.length&&c[0];(m=g&&g.getEnclosedNode())&&m.is&&this.type==m.getName()&&this.setState(CKEDITOR.TRISTATE_ON)}else m.enterMode==
CKEDITOR.ENTER_BR?f.appendBogus():c[0].fixBlock(1,m.enterMode==CKEDITOR.ENTER_P?"p":"div"),e.selectRanges(c)}for(var m=e.createBookmarks(!0),f=[],k={},c=c.createIterator(),h=0;(g=c.getNextRange())&&++h;){var d=g.getBoundaryNodes(),a=d.startNode,p=d.endNode;a.type==CKEDITOR.NODE_ELEMENT&&"td"==a.getName()&&g.setStartAt(d.startNode,CKEDITOR.POSITION_AFTER_START);p.type==CKEDITOR.NODE_ELEMENT&&"td"==p.getName()&&g.setEndAt(d.endNode,CKEDITOR.POSITION_BEFORE_END);g=g.createIterator();for(g.forceBrBreak=
this.state==CKEDITOR.TRISTATE_OFF;d=g.getNextParagraph();)if(!d.getCustomData("list_block")){CKEDITOR.dom.element.setMarker(k,d,"list_block",1);for(var l=b.elementPath(d),a=l.elements,p=0,l=l.blockLimit,q,n=a.length-1;0<=n&&(q=a[n]);n--)if(v[q.getName()]&&l.contains(q)){l.removeCustomData("list_group_object_"+h);(a=q.getCustomData("list_group_object"))?a.contents.push(d):(a={root:q,contents:[d]},f.push(a),CKEDITOR.dom.element.setMarker(k,q,"list_group_object",a));p=1;break}p||(p=l,p.getCustomData("list_group_object_"+
h)?p.getCustomData("list_group_object_"+h).contents.push(d):(a={root:p,contents:[d]},CKEDITOR.dom.element.setMarker(k,p,"list_group_object_"+h,a),f.push(a)))}}for(q=[];0<f.length;)if(a=f.shift(),this.state==CKEDITOR.TRISTATE_OFF)if(v[a.root.getName()]){c=b;h=a;a=k;g=q;p=CKEDITOR.plugins.list.listToArray(h.root,a);l=[];for(d=0;d<h.contents.length;d++)n=h.contents[d],(n=n.getAscendant("li",!0))&&!n.getCustomData("list_item_processed")&&(l.push(n),CKEDITOR.dom.element.setMarker(a,n,"list_item_processed",
!0));for(var n=h.root.getDocument(),t=void 0,r=void 0,d=0;d<l.length;d++){var y=l[d].getCustomData("listarray_index"),t=p[y].parent;t.is(this.type)||(r=n.createElement(this.type),t.copyAttributes(r,{start:1,type:1}),r.removeStyle("list-style-type"),p[y].parent=r)}a=CKEDITOR.plugins.list.arrayToList(p,a,null,c.config.enterMode);p=void 0;l=a.listNode.getChildCount();for(d=0;d<l&&(p=a.listNode.getChild(d));d++)p.getName()==this.type&&g.push(p);a.listNode.replace(h.root);c.fire("contentDomInvalidated")}else{p=
b;g=a;d=q;l=g.contents;c=g.root.getDocument();h=[];1==l.length&&l[0].equals(g.root)&&(a=c.createElement("div"),l[0].moveChildren&&l[0].moveChildren(a),l[0].append(a),l[0]=a);g=g.contents[0].getParent();for(n=0;n<l.length;n++)g=g.getCommonAncestor(l[n].getParent());t=p.config.useComputedState;p=a=void 0;t=void 0===t||t;for(n=0;n<l.length;n++)for(r=l[n];y=r.getParent();){if(y.equals(g)){h.push(r);!p&&r.getDirection()&&(p=1);r=r.getDirection(t);null!==a&&(a=a&&a!=r?null:r);break}r=y}if(!(1>h.length)){l=
h[h.length-1].getNext();n=c.createElement(this.type);d.push(n);for(t=d=void 0;h.length;)d=h.shift(),t=c.createElement("li"),r=d,r.is("pre")||L.test(r.getName())||"false"==r.getAttribute("contenteditable")?d.appendTo(t):(d.copyAttributes(t),a&&d.getDirection()&&(t.removeStyle("direction"),t.removeAttribute("dir")),d.moveChildren(t),d.remove()),t.appendTo(n);a&&p&&n.setAttribute("dir",a);l?n.insertBefore(l):n.appendTo(g)}}else this.state==CKEDITOR.TRISTATE_ON&&v[a.root.getName()]&&I.call(this,b,a,k);
for(n=0;n<q.length;n++)F(q[n]);CKEDITOR.dom.element.clearAllMarkers(k);e.selectBookmarks(m);b.focus()},refresh:function(b,m){var e=m.contains(v,1),c=m.blockLimit||m.root;e&&c.contains(e)?this.setState(e.is(this.type)?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF):this.setState(CKEDITOR.TRISTATE_OFF)}};CKEDITOR.plugins.add("list",{requires:"indentlist",init:function(b){b.blockless||(b.addCommand("numberedlist",new B("numberedlist","ol")),b.addCommand("bulletedlist",new B("bulletedlist","ul")),b.ui.addButton&&
(b.ui.addButton("NumberedList",{label:b.lang.list.numberedlist,command:"numberedlist",directional:!0,toolbar:"list,10"}),b.ui.addButton("BulletedList",{label:b.lang.list.bulletedlist,command:"bulletedlist",directional:!0,toolbar:"list,20"})),b.on("key",function(m){var e=m.data.domEvent.getKey(),c;if("wysiwyg"==b.mode&&e in{8:1,46:1}){var f=b.getSelection().getRanges()[0],g=f&&f.startPath();if(f&&f.collapsed){var k=8==e,h=b.editable(),d=new CKEDITOR.dom.walker(f.clone());d.evaluator=function(a){return u(a)&&
!z(a)};d.guard=function(a,b){return!(b&&a.type==CKEDITOR.NODE_ELEMENT&&a.is("table"))};e=f.clone();if(k){var a;(a=g.contains(v))&&f.checkBoundaryOfElement(a,CKEDITOR.START)&&(a=a.getParent())&&a.is("li")&&(a=A(a))?(c=a,a=a.getPrevious(u),e.moveToPosition(a&&z(a)?a:c,CKEDITOR.POSITION_BEFORE_START)):(d.range.setStartAt(h,CKEDITOR.POSITION_AFTER_START),d.range.setEnd(f.startContainer,f.startOffset),(a=d.previous())&&a.type==CKEDITOR.NODE_ELEMENT&&(a.getName()in v||a.is("li"))&&(a.is("li")||(d.range.selectNodeContents(a),
d.reset(),d.evaluator=G,a=d.previous()),c=a,e.moveToElementEditEnd(c),e.moveToPosition(e.endPath().block,CKEDITOR.POSITION_BEFORE_END)));if(c)C(b,e,f),m.cancel();else{var p=g.contains(v);p&&f.checkBoundaryOfElement(p,CKEDITOR.START)&&(c=p.getFirst(u),f.checkBoundaryOfElement(c,CKEDITOR.START)&&(a=p.getPrevious(u),A(c)?a&&(f.moveToElementEditEnd(a),f.select()):b.execCommand("outdent"),m.cancel()))}}else if(c=g.contains("li")){if(d.range.setEndAt(h,CKEDITOR.POSITION_BEFORE_END),k=(h=c.getLast(u))&&
G(h)?h:c,g=0,(a=d.next())&&a.type==CKEDITOR.NODE_ELEMENT&&a.getName()in v&&a.equals(h)?(g=1,a=d.next()):f.checkBoundaryOfElement(k,CKEDITOR.END)&&(g=2),g&&a){f=f.clone();f.moveToElementEditStart(a);if(1==g&&(e.optimize(),!e.startContainer.equals(c))){for(c=e.startContainer;c.is(CKEDITOR.dtd.$inline);)p=c,c=c.getParent();p&&e.moveToPosition(p,CKEDITOR.POSITION_AFTER_END)}2==g&&(e.moveToPosition(e.endPath().block,CKEDITOR.POSITION_BEFORE_END),f.endPath().block&&f.moveToPosition(f.endPath().block,CKEDITOR.POSITION_AFTER_START));
C(b,e,f);m.cancel()}}else d.range.setEndAt(h,CKEDITOR.POSITION_BEFORE_END),(a=d.next())&&a.type==CKEDITOR.NODE_ELEMENT&&a.is(v)&&(a=a.getFirst(u),g.block&&f.checkStartOfBlock()&&f.checkEndOfBlock()?(g.block.remove(),f.moveToElementEditStart(a),f.select()):A(a)?(f.moveToElementEditStart(a),f.select()):(f=f.clone(),f.moveToElementEditStart(a),C(b,e,f)),m.cancel());setTimeout(function(){b.selectionChange(1)})}}}))}})})();(function(){function V(a,c,d){return n(c)&&n(d)&&d.equals(c.getNext(function(a){return!(E(a)||F(a)||u(a))}))}function z(a){this.upper=a[0];this.lower=a[1];this.set.apply(this,a.slice(2))}function O(a){var c=a.element;if(c&&n(c)&&(c=c.getAscendant(a.triggers,!0))&&a.editable.contains(c)){var d=P(c);if("true"==d.getAttribute("contenteditable"))return c;if(d.is(a.triggers))return d}return null}function ka(a,c,d){r(a,c);r(a,d);a=c.size.bottom;d=d.size.top;return a&&d?0|(a+d)/2:a||d}function w(a,c,d){return c=
c[d?"getPrevious":"getNext"](function(b){return b&&b.type==CKEDITOR.NODE_TEXT&&!E(b)||n(b)&&!u(b)&&!A(a,b)})}function q(a,c,d){return a>c&&a<d}function P(a,c){if(a.data("cke-editable"))return null;for(c||(a=a.getParent());a&&!a.data("cke-editable");){if(a.hasAttribute("contenteditable"))return a;a=a.getParent()}return null}function la(a){var c=a.doc,d=G('\x3cspan contenteditable\x3d"false" style\x3d"'+Q+"position:absolute;border-top:1px dashed "+a.boxColor+'"\x3e\x3c/span\x3e',c),b=CKEDITOR.getUrl(this.path+
"images/"+(t.hidpi?"hidpi/":"")+"icon"+(a.rtl?"-rtl":"")+".png");v(d,{attach:function(){this.wrap.getParent()||this.wrap.appendTo(a.editable,!0);return this},lineChildren:[v(G('\x3cspan title\x3d"'+a.editor.lang.magicline.title+'" contenteditable\x3d"false"\x3e\x26#8629;\x3c/span\x3e',c),{base:Q+"height:17px;width:17px;"+(a.rtl?"left":"right")+":17px;background:url("+b+") center no-repeat "+a.boxColor+";cursor:pointer;"+(t.hc?"font-size: 15px;line-height:14px;border:1px solid #fff;text-align:center;":
"")+(t.hidpi?"background-size: 9px 10px;":""),looks:["top:-8px; border-radius: 2px;","top:-17px; border-radius: 2px 2px 0px 0px;","top:-1px; border-radius: 0px 0px 2px 2px;"]}),v(G(W,c),{base:X+"left:0px;border-left-color:"+a.boxColor+";",looks:["border-width:8px 0 8px 8px;top:-8px","border-width:8px 0 0 8px;top:-8px","border-width:0 0 8px 8px;top:0px"]}),v(G(W,c),{base:X+"right:0px;border-right-color:"+a.boxColor+";",looks:["border-width:8px 8px 8px 0;top:-8px","border-width:8px 8px 0 0;top:-8px",
"border-width:0 8px 8px 0;top:0px"]})],detach:function(){this.wrap.getParent()&&this.wrap.remove();return this},mouseNear:function(){r(a,this);var b=a.holdDistance,c=this.size;return c&&q(a.mouse.y,c.top-b,c.bottom+b)&&q(a.mouse.x,c.left-b,c.right+b)?!0:!1},place:function(){var b=a.view,c=a.editable,d=a.trigger,h=d.upper,g=d.lower,l=h||g,p=l.getParent(),m={};this.trigger=d;h&&r(a,h,!0);g&&r(a,g,!0);r(a,p,!0);a.inInlineMode&&H(a,!0);p.equals(c)?(m.left=b.scroll.x,m.right=-b.scroll.x,m.width=""):(m.left=
l.size.left-l.size.margin.left+b.scroll.x-(a.inInlineMode?b.editable.left+b.editable.border.left:0),m.width=l.size.outerWidth+l.size.margin.left+l.size.margin.right+b.scroll.x,m.right="");h&&g?m.top=h.size.margin.bottom===g.size.margin.top?0|h.size.bottom+h.size.margin.bottom/2:h.size.margin.bottom<g.size.margin.top?h.size.bottom+h.size.margin.bottom:h.size.bottom+h.size.margin.bottom-g.size.margin.top:h?g||(m.top=h.size.bottom+h.size.margin.bottom):m.top=g.size.top-g.size.margin.top;d.is(C)||q(m.top,
b.scroll.y-15,b.scroll.y+5)?(m.top=a.inInlineMode?0:b.scroll.y,this.look(C)):d.is(D)||q(m.top,b.pane.bottom-5,b.pane.bottom+15)?(m.top=a.inInlineMode?b.editable.height+b.editable.padding.top+b.editable.padding.bottom:b.pane.bottom-1,this.look(D)):(a.inInlineMode&&(m.top-=b.editable.top+b.editable.border.top),this.look(x));a.inInlineMode&&(m.top--,m.top+=b.editable.scroll.top,m.left+=b.editable.scroll.left);for(var n in m)m[n]=CKEDITOR.tools.cssLength(m[n]);this.setStyles(m)},look:function(a){if(this.oldLook!=
a){for(var b=this.lineChildren.length,c;b--;)(c=this.lineChildren[b]).setAttribute("style",c.base+c.looks[0|a/2]);this.oldLook=a}},wrap:new R("span",a.doc)});for(c=d.lineChildren.length;c--;)d.lineChildren[c].appendTo(d);d.look(x);d.appendTo(d.wrap);d.unselectable();d.lineChildren[0].on("mouseup",function(b){d.detach();S(a,function(b){var c=a.line.trigger;b[c.is(I)?"insertBefore":"insertAfter"](c.is(I)?c.lower:c.upper)},!0);a.editor.focus();t.ie||a.enterMode==CKEDITOR.ENTER_BR||a.hotNode.scrollIntoView();
b.data.preventDefault(!0)});d.on("mousedown",function(a){a.data.preventDefault(!0)});a.line=d}function S(a,c,d){var b=new CKEDITOR.dom.range(a.doc),e=a.editor,f;t.ie&&a.enterMode==CKEDITOR.ENTER_BR?f=a.doc.createText(J):(f=(f=P(a.element,!0))&&f.data("cke-enter-mode")||a.enterMode,f=new R(K[f],a.doc),f.is("br")||a.doc.createText(J).appendTo(f));d&&e.fire("saveSnapshot");c(f);b.moveToPosition(f,CKEDITOR.POSITION_AFTER_START);e.getSelection().selectRanges([b]);a.hotNode=f;d&&e.fire("saveSnapshot")}
function Y(a,c){return{canUndo:!0,modes:{wysiwyg:1},exec:function(){function d(b){var d=t.ie&&9>t.version?" ":J,f=a.hotNode&&a.hotNode.getText()==d&&a.element.equals(a.hotNode)&&a.lastCmdDirection===!!c;S(a,function(d){f&&a.hotNode&&a.hotNode.remove();d[c?"insertAfter":"insertBefore"](b);d.setAttributes({"data-cke-magicline-hot":1,"data-cke-magicline-dir":!!c});a.lastCmdDirection=!!c});t.ie||a.enterMode==CKEDITOR.ENTER_BR||a.hotNode.scrollIntoView();a.line.detach()}return function(b){b=b.getSelection().getStartElement();
var e;b=b.getAscendant(Z,1);if(!aa(a,b)&&b&&!b.equals(a.editable)&&!b.contains(a.editable)){(e=P(b))&&"false"==e.getAttribute("contenteditable")&&(b=e);a.element=b;e=w(a,b,!c);var f;n(e)&&e.is(a.triggers)&&e.is(ma)&&(!w(a,e,!c)||(f=w(a,e,!c))&&n(f)&&f.is(a.triggers))?d(e):(f=O(a,b),n(f)&&(w(a,f,!c)?(b=w(a,f,!c))&&n(b)&&b.is(a.triggers)&&d(f):d(f)))}}}()}}function A(a,c){if(!c||c.type!=CKEDITOR.NODE_ELEMENT||!c.$)return!1;var d=a.line;return d.wrap.equals(c)||d.wrap.contains(c)}function n(a){return a&&
a.type==CKEDITOR.NODE_ELEMENT&&a.$}function u(a){if(!n(a))return!1;var c;(c=ba(a))||(n(a)?(c={left:1,right:1,center:1},c=!(!c[a.getComputedStyle("float")]&&!c[a.getAttribute("align")])):c=!1);return c}function ba(a){return!!{absolute:1,fixed:1}[a.getComputedStyle("position")]}function L(a,c){return n(c)?c.is(a.triggers):null}function aa(a,c){if(!c)return!1;for(var d=c.getParents(1),b=d.length;b--;)for(var e=a.tabuList.length;e--;)if(d[b].hasAttribute(a.tabuList[e]))return!0;return!1}function na(a,
c,d){c=c[d?"getLast":"getFirst"](function(b){return a.isRelevant(b)&&!b.is(oa)});if(!c)return!1;r(a,c);return d?c.size.top>a.mouse.y:c.size.bottom<a.mouse.y}function ca(a){var c=a.editable,d=a.mouse,b=a.view,e=a.triggerOffset;H(a);var f=d.y>(a.inInlineMode?b.editable.top+b.editable.height/2:Math.min(b.editable.height,b.pane.height)/2),c=c[f?"getLast":"getFirst"](function(a){return!(E(a)||F(a))});if(!c)return null;A(a,c)&&(c=a.line.wrap[f?"getPrevious":"getNext"](function(a){return!(E(a)||F(a))}));
if(!n(c)||u(c)||!L(a,c))return null;r(a,c);return!f&&0<=c.size.top&&q(d.y,0,c.size.top+e)?(a=a.inInlineMode||0===b.scroll.y?C:x,new z([null,c,I,M,a])):f&&c.size.bottom<=b.pane.height&&q(d.y,c.size.bottom-e,b.pane.height)?(a=a.inInlineMode||q(c.size.bottom,b.pane.height-e,b.pane.height)?D:x,new z([c,null,da,M,a])):null}function ea(a){var c=a.mouse,d=a.view,b=a.triggerOffset,e=O(a);if(!e)return null;r(a,e);var b=Math.min(b,0|e.size.outerHeight/2),f=[],k,h;if(q(c.y,e.size.top-1,e.size.top+b))h=!1;else if(q(c.y,
e.size.bottom-b,e.size.bottom+1))h=!0;else return null;if(u(e)||na(a,e,h)||e.getParent().is(fa))return null;var g=w(a,e,!h);if(g){if(g&&g.type==CKEDITOR.NODE_TEXT)return null;if(n(g)){if(u(g)||!L(a,g)||g.getParent().is(fa))return null;f=[g,e][h?"reverse":"concat"]().concat([T,M])}}else e.equals(a.editable[h?"getLast":"getFirst"](a.isRelevant))?(H(a),h&&q(c.y,e.size.bottom-b,d.pane.height)&&q(e.size.bottom,d.pane.height-b,d.pane.height)?k=D:q(c.y,0,e.size.top+b)&&(k=C)):k=x,f=[null,e][h?"reverse":
"concat"]().concat([h?da:I,M,k,e.equals(a.editable[h?"getLast":"getFirst"](a.isRelevant))?h?D:C:x]);return 0 in f?new z(f):null}function U(a,c,d,b){for(var e=c.getDocumentPosition(),f={},k={},h={},g={},l=y.length;l--;)f[y[l]]=parseInt(c.getComputedStyle.call(c,"border-"+y[l]+"-width"),10)||0,h[y[l]]=parseInt(c.getComputedStyle.call(c,"padding-"+y[l]),10)||0,k[y[l]]=parseInt(c.getComputedStyle.call(c,"margin-"+y[l]),10)||0;d&&!b||N(a,b);g.top=e.y-(d?0:a.view.scroll.y);g.left=e.x-(d?0:a.view.scroll.x);
g.outerWidth=c.$.offsetWidth;g.outerHeight=c.$.offsetHeight;g.height=g.outerHeight-(h.top+h.bottom+f.top+f.bottom);g.width=g.outerWidth-(h.left+h.right+f.left+f.right);g.bottom=g.top+g.outerHeight;g.right=g.left+g.outerWidth;a.inInlineMode&&(g.scroll={top:c.$.scrollTop,left:c.$.scrollLeft});return v({border:f,padding:h,margin:k,ignoreScroll:d},g,!0)}function r(a,c,d){if(!n(c))return c.size=null;if(!c.size)c.size={};else if(c.size.ignoreScroll==d&&c.size.date>new Date-ga)return null;return v(c.size,
U(a,c,d),{date:+new Date},!0)}function H(a,c){a.view.editable=U(a,a.editable,c,!0)}function N(a,c){a.view||(a.view={});var d=a.view;if(!(!c&&d&&d.date>new Date-ga)){var b=a.win,d=b.getScrollPosition(),b=b.getViewPaneSize();v(a.view,{scroll:{x:d.x,y:d.y,width:a.doc.$.documentElement.scrollWidth-b.width,height:a.doc.$.documentElement.scrollHeight-b.height},pane:{width:b.width,height:b.height,bottom:b.height+d.y},date:+new Date},!0)}}function pa(a,c,d,b){for(var e=b,f=b,k=0,h=!1,g=!1,l=a.view.pane.height,
p=a.mouse;p.y+k<l&&0<p.y-k;){h||(h=c(e,b));g||(g=c(f,b));!h&&0<p.y-k&&(e=d(a,{x:p.x,y:p.y-k}));!g&&p.y+k<l&&(f=d(a,{x:p.x,y:p.y+k}));if(h&&g)break;k+=2}return new z([e,f,null,null])}CKEDITOR.plugins.add("magicline",{init:function(a){var c=a.config,d=c.magicline_triggerOffset||30,b={editor:a,enterMode:c.enterMode,triggerOffset:d,holdDistance:0|d*(c.magicline_holdDistance||.5),boxColor:c.magicline_color||"#ff0000",rtl:"rtl"==c.contentsLangDirection,tabuList:["data-cke-hidden-sel"].concat(c.magicline_tabuList||
[]),triggers:c.magicline_everywhere?Z:{table:1,hr:1,div:1,ul:1,ol:1,dl:1,form:1,blockquote:1}},e,f,k;b.isRelevant=function(a){return n(a)&&!A(b,a)&&!u(a)};a.on("contentDom",function(){var d=a.editable(),g=a.document,l=a.window;v(b,{editable:d,inInlineMode:d.isInline(),doc:g,win:l,hotNode:null},!0);b.boundary=b.inInlineMode?b.editable:b.doc.getDocumentElement();d.is(B.$inline)||(b.inInlineMode&&!ba(d)&&d.setStyles({position:"relative",top:null,left:null}),la.call(this,b),N(b),d.attachListener(a,"beforeUndoImage",
function(){b.line.detach()}),d.attachListener(a,"beforeGetData",function(){b.line.wrap.getParent()&&(b.line.detach(),a.once("getData",function(){b.line.attach()},null,null,1E3))},null,null,0),d.attachListener(b.inInlineMode?g:g.getWindow().getFrame(),"mouseout",function(c){if("wysiwyg"==a.mode)if(b.inInlineMode){var d=c.data.$.clientX;c=c.data.$.clientY;N(b);H(b,!0);var e=b.view.editable,f=b.view.scroll;d>e.left-f.x&&d<e.right-f.x&&c>e.top-f.y&&c<e.bottom-f.y||(clearTimeout(k),k=null,b.line.detach())}else clearTimeout(k),
k=null,b.line.detach()}),d.attachListener(d,"keyup",function(){b.hiddenMode=0}),d.attachListener(d,"keydown",function(c){if("wysiwyg"==a.mode)switch(c.data.getKeystroke()){case 2228240:case 16:b.hiddenMode=1,b.line.detach()}}),d.attachListener(b.inInlineMode?d:g,"mousemove",function(c){f=!0;if("wysiwyg"==a.mode&&!a.readOnly&&!k){var d={x:c.data.$.clientX,y:c.data.$.clientY};k=setTimeout(function(){b.mouse=d;k=b.trigger=null;N(b);f&&!b.hiddenMode&&a.focusManager.hasFocus&&!b.line.mouseNear()&&(b.element=
ha(b,!0))&&((b.trigger=ca(b)||ea(b)||ia(b))&&!aa(b,b.trigger.upper||b.trigger.lower)?b.line.attach().place():(b.trigger=null,b.line.detach()),f=!1)},30)}}),d.attachListener(l,"scroll",function(){"wysiwyg"==a.mode&&(b.line.detach(),t.webkit&&(b.hiddenMode=1,clearTimeout(e),e=setTimeout(function(){b.mouseDown||(b.hiddenMode=0)},50)))}),d.attachListener(ja?g:l,"mousedown",function(){"wysiwyg"==a.mode&&(b.line.detach(),b.hiddenMode=1,b.mouseDown=1)}),d.attachListener(ja?g:l,"mouseup",function(){b.hiddenMode=
0;b.mouseDown=0}),a.addCommand("accessPreviousSpace",Y(b)),a.addCommand("accessNextSpace",Y(b,!0)),a.setKeystroke([[c.magicline_keystrokePrevious,"accessPreviousSpace"],[c.magicline_keystrokeNext,"accessNextSpace"]]),a.on("loadSnapshot",function(){var c,d,e,f;for(f in{p:1,br:1,div:1})for(c=a.document.getElementsByTag(f),e=c.count();e--;)if((d=c.getItem(e)).data("cke-magicline-hot")){b.hotNode=d;b.lastCmdDirection="true"===d.data("cke-magicline-dir")?!0:!1;return}}),this.backdoor={accessFocusSpace:S,
boxTrigger:z,isLine:A,getAscendantTrigger:O,getNonEmptyNeighbour:w,getSize:U,that:b,triggerEdge:ea,triggerEditable:ca,triggerExpand:ia})},this)}});var v=CKEDITOR.tools.extend,R=CKEDITOR.dom.element,G=R.createFromHtml,t=CKEDITOR.env,ja=CKEDITOR.env.ie&&9>CKEDITOR.env.version,B=CKEDITOR.dtd,K={},I=128,da=64,T=32,M=16,C=4,D=2,x=1,J=" ",fa=B.$listItem,oa=B.$tableContent,ma=v({},B.$nonEditable,B.$empty),Z=B.$block,ga=100,Q="width:0px;height:0px;padding:0px;margin:0px;display:block;z-index:9999;color:#fff;position:absolute;font-size: 0px;line-height:0px;",
X=Q+"border-color:transparent;display:block;border-style:solid;",W="\x3cspan\x3e"+J+"\x3c/span\x3e";K[CKEDITOR.ENTER_BR]="br";K[CKEDITOR.ENTER_P]="p";K[CKEDITOR.ENTER_DIV]="div";z.prototype={set:function(a,c,d){this.properties=a+c+(d||x);return this},is:function(a){return(this.properties&a)==a}};var ha=function(){function a(a,d){var b=a.$.elementFromPoint(d.x,d.y);return b&&b.nodeType?new CKEDITOR.dom.element(b):null}return function(c,d,b){if(!c.mouse)return null;var e=c.doc,f=c.line.wrap;b=b||c.mouse;
var k=a(e,b);d&&A(c,k)&&(f.hide(),k=a(e,b),f.show());return!k||k.type!=CKEDITOR.NODE_ELEMENT||!k.$||t.ie&&9>t.version&&!c.boundary.equals(k)&&!c.boundary.contains(k)?null:k}}(),E=CKEDITOR.dom.walker.whitespaces(),F=CKEDITOR.dom.walker.nodeType(CKEDITOR.NODE_COMMENT),ia=function(){function a(a){var b=a.element,e,f,k;if(!n(b)||b.contains(a.editable)||b.isReadOnly())return null;k=pa(a,function(a,b){return!b.equals(a)},function(a,b){return ha(a,!0,b)},b);e=k.upper;f=k.lower;if(V(a,e,f))return k.set(T,
8);if(e&&b.contains(e))for(;!e.getParent().equals(b);)e=e.getParent();else e=b.getFirst(function(b){return c(a,b)});if(f&&b.contains(f))for(;!f.getParent().equals(b);)f=f.getParent();else f=b.getLast(function(b){return c(a,b)});if(!e||!f)return null;r(a,e);r(a,f);if(!q(a.mouse.y,e.size.top,f.size.bottom))return null;for(var b=Number.MAX_VALUE,h,g,l,p;f&&!f.equals(e)&&(g=e.getNext(a.isRelevant));)h=Math.abs(ka(a,e,g)-a.mouse.y),h<b&&(b=h,l=e,p=g),e=g,r(a,e);if(!l||!p||!q(a.mouse.y,l.size.top,p.size.bottom))return null;
k.upper=l;k.lower=p;return k.set(T,8)}function c(a,b){return!(b&&b.type==CKEDITOR.NODE_TEXT||F(b)||u(b)||A(a,b)||b.type==CKEDITOR.NODE_ELEMENT&&b.$&&b.is("br"))}return function(c){var b=a(c),e;if(e=b){e=b.upper;var f=b.lower;e=!e||!f||u(f)||u(e)||f.equals(e)||e.equals(f)||f.contains(e)||e.contains(f)?!1:L(c,e)&&L(c,f)&&V(c,e,f)?!0:!1}return e?b:null}}(),y=["top","left","right","bottom"]})();CKEDITOR.config.magicline_keystrokePrevious=CKEDITOR.CTRL+CKEDITOR.SHIFT+51;
CKEDITOR.config.magicline_keystrokeNext=CKEDITOR.CTRL+CKEDITOR.SHIFT+52;(function(){function n(a){if(!a||a.type!=CKEDITOR.NODE_ELEMENT||"form"!=a.getName())return[];for(var e=[],f=["style","className"],b=0;b<f.length;b++){var c=a.$.elements.namedItem(f[b]);c&&(c=new CKEDITOR.dom.element(c),e.push([c,c.nextSibling]),c.remove())}return e}function t(a,e){if(a&&a.type==CKEDITOR.NODE_ELEMENT&&"form"==a.getName()&&0<e.length)for(var f=e.length-1;0<=f;f--){var b=e[f][0],c=e[f][1];c?b.insertBefore(c):b.appendTo(a)}}function r(a,e){var f=n(a),b={},c=a.$;e||(b["class"]=c.className||
"",c.className="");b.inline=c.style.cssText||"";e||(c.style.cssText="position: static; overflow: visible");t(f);return b}function u(a,e){var f=n(a),b=a.$;"class"in e&&(b.className=e["class"]);"inline"in e&&(b.style.cssText=e.inline);t(f)}function v(a){if(!a.editable().isInline()){var e=CKEDITOR.instances,f;for(f in e){var b=e[f];"wysiwyg"!=b.mode||b.readOnly||(b=b.document.getBody(),b.setAttribute("contentEditable",!1),b.setAttribute("contentEditable",!0))}a.editable().hasFocus&&(a.toolbox.focus(),
a.focus())}}CKEDITOR.plugins.add("maximize",{init:function(a){function e(){var b=c.getViewPaneSize();a.resize(b.width,b.height,null,!0)}if(a.elementMode!=CKEDITOR.ELEMENT_MODE_INLINE){var f=a.lang,b=CKEDITOR.document,c=b.getWindow(),l,m,p,n=CKEDITOR.TRISTATE_OFF;a.addCommand("maximize",{modes:{wysiwyg:!CKEDITOR.env.iOS,source:!CKEDITOR.env.iOS},readOnly:1,editorFocus:!1,exec:function(){var h=a.container.getFirst(function(a){return a.type==CKEDITOR.NODE_ELEMENT&&a.hasClass("cke_inner")}),g=a.ui.space("contents");
if("wysiwyg"==a.mode){var d=a.getSelection();l=d&&d.getRanges();m=c.getScrollPosition()}else{var k=a.editable().$;l=!CKEDITOR.env.ie&&[k.selectionStart,k.selectionEnd];m=[k.scrollLeft,k.scrollTop]}if(this.state==CKEDITOR.TRISTATE_OFF){c.on("resize",e);p=c.getScrollPosition();for(d=a.container;d=d.getParent();)d.setCustomData("maximize_saved_styles",r(d)),d.setStyle("z-index",a.config.baseFloatZIndex-5);g.setCustomData("maximize_saved_styles",r(g,!0));h.setCustomData("maximize_saved_styles",r(h,!0));
g={overflow:CKEDITOR.env.webkit?"":"hidden",width:0,height:0};b.getDocumentElement().setStyles(g);!CKEDITOR.env.gecko&&b.getDocumentElement().setStyle("position","fixed");CKEDITOR.env.gecko&&CKEDITOR.env.quirks||b.getBody().setStyles(g);CKEDITOR.env.ie?setTimeout(function(){c.$.scrollTo(0,0)},0):c.$.scrollTo(0,0);h.setStyle("position",CKEDITOR.env.gecko&&CKEDITOR.env.quirks?"fixed":"absolute");h.$.offsetLeft;h.setStyles({"z-index":a.config.baseFloatZIndex-5,left:"0px",top:"0px"});h.addClass("cke_maximized");
e();g=h.getDocumentPosition();h.setStyles({left:-1*g.x+"px",top:-1*g.y+"px"});CKEDITOR.env.gecko&&v(a)}else if(this.state==CKEDITOR.TRISTATE_ON){c.removeListener("resize",e);for(var d=[g,h],q=0;q<d.length;q++)u(d[q],d[q].getCustomData("maximize_saved_styles")),d[q].removeCustomData("maximize_saved_styles");for(d=a.container;d=d.getParent();)u(d,d.getCustomData("maximize_saved_styles")),d.removeCustomData("maximize_saved_styles");CKEDITOR.env.ie?setTimeout(function(){c.$.scrollTo(p.x,p.y)},0):c.$.scrollTo(p.x,
p.y);h.removeClass("cke_maximized");CKEDITOR.env.webkit&&(h.setStyle("display","inline"),setTimeout(function(){h.setStyle("display","block")},0));a.fire("resize",{outerHeight:a.container.$.offsetHeight,contentsHeight:g.$.offsetHeight,outerWidth:a.container.$.offsetWidth})}this.toggleState();if(d=this.uiItems[0])g=this.state==CKEDITOR.TRISTATE_OFF?f.maximize.maximize:f.maximize.minimize,d=CKEDITOR.document.getById(d._.id),d.getChild(1).setHtml(g),d.setAttribute("title",g),d.setAttribute("href",'javascript:void("'+
g+'");');"wysiwyg"==a.mode?l?(CKEDITOR.env.gecko&&v(a),a.getSelection().selectRanges(l),(k=a.getSelection().getStartElement())&&k.scrollIntoView(!0)):c.$.scrollTo(m.x,m.y):(l&&(k.selectionStart=l[0],k.selectionEnd=l[1]),k.scrollLeft=m[0],k.scrollTop=m[1]);l=m=null;n=this.state;a.fire("maximize",this.state)},canUndo:!1});a.ui.addButton&&a.ui.addButton("Maximize",{label:f.maximize.maximize,command:"maximize",toolbar:"tools,10"});a.on("mode",function(){var b=a.getCommand("maximize");b.setState(b.state==
CKEDITOR.TRISTATE_DISABLED?CKEDITOR.TRISTATE_DISABLED:n)},null,null,100)}}})})();(function(){var c={canUndo:!1,async:!0,exec:function(a){a.getClipboardData({title:a.lang.pastetext.title},function(b){b&&a.fire("paste",{type:"text",dataValue:b.dataValue,method:"paste",dataTransfer:CKEDITOR.plugins.clipboard.initPasteDataTransfer()});a.fire("afterCommandExec",{name:"pastetext",command:c,returnValue:!!b})})}};CKEDITOR.plugins.add("pastetext",{requires:"clipboard",init:function(a){a.addCommand("pastetext",c);a.ui.addButton&&a.ui.addButton("PasteText",{label:a.lang.pastetext.button,
command:"pastetext",toolbar:"clipboard,40"});if(a.config.forcePasteAsPlainText)a.on("beforePaste",function(a){"html"!=a.data.type&&(a.data.type="text")});a.on("pasteState",function(b){a.getCommand("pastetext").setState(b.data)})}})})();(function(){function h(a,d,f){var b=CKEDITOR.cleanWord;b?f():(a=CKEDITOR.getUrl(a.config.pasteFromWordCleanupFile||d+"filter/default.js"),CKEDITOR.scriptLoader.load(a,f,null,!0));return!b}function k(a){a.data.type="html"}CKEDITOR.plugins.add("pastefromword",{requires:"clipboard",init:function(a){var d=0,f=this.path;a.addCommand("pastefromword",{canUndo:!1,async:!0,exec:function(a){var e=this;d=1;a.once("beforePaste",k);a.getClipboardData({title:a.lang.pastefromword.title},function(c){c&&a.fire("paste",
{type:"html",dataValue:c.dataValue,method:"paste",dataTransfer:CKEDITOR.plugins.clipboard.initPasteDataTransfer()});a.fire("afterCommandExec",{name:"pastefromword",command:e,returnValue:!!c})})}});a.ui.addButton&&a.ui.addButton("PasteFromWord",{label:a.lang.pastefromword.toolbar,command:"pastefromword",toolbar:"clipboard,50"});a.on("pasteState",function(b){a.getCommand("pastefromword").setState(b.data)});a.on("paste",function(b){var e=b.data,c=e.dataValue;if(c&&(d||/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test(c))){e.dontFilter=
!0;var g=h(a,f,function(){if(g)a.fire("paste",e);else if(!a.config.pasteFromWordPromptCleanup||d||confirm(a.lang.pastefromword.confirmCleanup))e.dataValue=CKEDITOR.cleanWord(c,a);d=0});g&&b.cancel()}},null,null,3)}})})();CKEDITOR.plugins.add("removeformat",{init:function(a){a.addCommand("removeFormat",CKEDITOR.plugins.removeformat.commands.removeformat);a.ui.addButton&&a.ui.addButton("RemoveFormat",{label:a.lang.removeformat.toolbar,command:"removeFormat",toolbar:"cleanup,10"})}});
CKEDITOR.plugins.removeformat={commands:{removeformat:{exec:function(a){for(var h=a._.removeFormatRegex||(a._.removeFormatRegex=new RegExp("^(?:"+a.config.removeFormatTags.replace(/,/g,"|")+")$","i")),e=a._.removeAttributes||(a._.removeAttributes=a.config.removeFormatAttributes.split(",")),f=CKEDITOR.plugins.removeformat.filter,m=a.getSelection().getRanges(),n=m.createIterator(),p=function(a){return a.type==CKEDITOR.NODE_ELEMENT},c;c=n.getNextRange();){c.collapsed||c.enlarge(CKEDITOR.ENLARGE_ELEMENT);
var l=c.createBookmark(),b=l.startNode,d=l.endNode,k=function(b){for(var c=a.elementPath(b),e=c.elements,d=1,g;(g=e[d])&&!g.equals(c.block)&&!g.equals(c.blockLimit);d++)h.test(g.getName())&&f(a,g)&&b.breakParent(g)};k(b);if(d)for(k(d),b=b.getNextSourceNode(!0,CKEDITOR.NODE_ELEMENT);b&&!b.equals(d);)if(b.isReadOnly()){if(b.getPosition(d)&CKEDITOR.POSITION_CONTAINS)break;b=b.getNext(p)}else k=b.getNextSourceNode(!1,CKEDITOR.NODE_ELEMENT),"img"==b.getName()&&b.data("cke-realelement")||!f(a,b)||(h.test(b.getName())?
b.remove(1):(b.removeAttributes(e),a.fire("removeFormatCleanup",b))),b=k;c.moveToBookmark(l)}a.forceNextSelectionCheck();a.getSelection().selectRanges(m)}}},filter:function(a,h){for(var e=a._.removeFormatFilters||[],f=0;f<e.length;f++)if(!1===e[f](h))return!1;return!0}};CKEDITOR.editor.prototype.addRemoveFormatFilter=function(a){this._.removeFormatFilters||(this._.removeFormatFilters=[]);this._.removeFormatFilters.push(a)};CKEDITOR.config.removeFormatTags="b,big,cite,code,del,dfn,em,font,i,ins,kbd,q,s,samp,small,span,strike,strong,sub,sup,tt,u,var";
CKEDITOR.config.removeFormatAttributes="class,style,lang,width,height,align,hspace,valign";(function(){var f={preserveState:!0,editorFocus:!1,readOnly:1,exec:function(a){this.toggleState();this.refresh(a)},refresh:function(a){if(a.document){var b=this.state==CKEDITOR.TRISTATE_ON?"attachClass":"removeClass";a.editable()[b]("cke_show_borders")}}};CKEDITOR.plugins.add("showborders",{modes:{wysiwyg:1},onLoad:function(){var a;a=(CKEDITOR.env.ie6Compat?[".%1 table.%2,",".%1 table.%2 td, .%1 table.%2 th","{","border : #d3d3d3 1px dotted","}"]:".%1 table.%2,;.%1 table.%2 \x3e tr \x3e td, .%1 table.%2 \x3e tr \x3e th,;.%1 table.%2 \x3e tbody \x3e tr \x3e td, .%1 table.%2 \x3e tbody \x3e tr \x3e th,;.%1 table.%2 \x3e thead \x3e tr \x3e td, .%1 table.%2 \x3e thead \x3e tr \x3e th,;.%1 table.%2 \x3e tfoot \x3e tr \x3e td, .%1 table.%2 \x3e tfoot \x3e tr \x3e th;{;border : #d3d3d3 1px dotted;}".split(";")).join("").replace(/%2/g,
"cke_show_border").replace(/%1/g,"cke_show_borders ");CKEDITOR.addCss(a)},init:function(a){var b=a.addCommand("showborders",f);b.canUndo=!1;!1!==a.config.startupShowBorders&&b.setState(CKEDITOR.TRISTATE_ON);a.on("mode",function(){b.state!=CKEDITOR.TRISTATE_DISABLED&&b.refresh(a)},null,null,100);a.on("contentDom",function(){b.state!=CKEDITOR.TRISTATE_DISABLED&&b.refresh(a)});a.on("removeFormatCleanup",function(d){d=d.data;a.getCommand("showborders").state==CKEDITOR.TRISTATE_ON&&d.is("table")&&(!d.hasAttribute("border")||
0>=parseInt(d.getAttribute("border"),10))&&d.addClass("cke_show_border")})},afterInit:function(a){var b=a.dataProcessor;a=b&&b.dataFilter;b=b&&b.htmlFilter;a&&a.addRules({elements:{table:function(a){a=a.attributes;var b=a["class"],c=parseInt(a.border,10);c&&!(0>=c)||b&&-1!=b.indexOf("cke_show_border")||(a["class"]=(b||"")+" cke_show_border")}}});b&&b.addRules({elements:{table:function(a){a=a.attributes;var b=a["class"];b&&(a["class"]=b.replace("cke_show_border","").replace(/\s{2}/," ").replace(/^\s+|\s+$/,
""))}}})}});CKEDITOR.on("dialogDefinition",function(a){var b=a.data.name;if("table"==b||"tableProperties"==b)if(a=a.data.definition,b=a.getContents("info").get("txtBorder"),b.commit=CKEDITOR.tools.override(b.commit,function(a){return function(b,c){a.apply(this,arguments);var e=parseInt(this.getValue(),10);c[!e||0>=e?"addClass":"removeClass"]("cke_show_border")}}),a=(a=a.getContents("advanced"))&&a.get("advCSSClasses"))a.setup=CKEDITOR.tools.override(a.setup,function(a){return function(){a.apply(this,
arguments);this.setValue(this.getValue().replace(/cke_show_border/,""))}}),a.commit=CKEDITOR.tools.override(a.commit,function(a){return function(b,c){a.apply(this,arguments);parseInt(c.getAttribute("border"),10)||c.addClass("cke_show_border")}})})})();(function(){CKEDITOR.plugins.add("sourcearea",{init:function(a){function d(){var a=e&&this.equals(CKEDITOR.document.getActive());this.hide();this.setStyle("height",this.getParent().$.clientHeight+"px");this.setStyle("width",this.getParent().$.clientWidth+"px");this.show();a&&this.focus()}if(a.elementMode!=CKEDITOR.ELEMENT_MODE_INLINE){var f=CKEDITOR.plugins.sourcearea;a.addMode("source",function(e){var b=a.ui.space("contents").getDocument().createElement("textarea");b.setStyles(CKEDITOR.tools.extend({width:CKEDITOR.env.ie7Compat?
"99%":"100%",height:"100%",resize:"none",outline:"none","text-align":"left"},CKEDITOR.tools.cssVendorPrefix("tab-size",a.config.sourceAreaTabSize||4)));b.setAttribute("dir","ltr");b.addClass("cke_source").addClass("cke_reset").addClass("cke_enable_context_menu");a.ui.space("contents").append(b);b=a.editable(new c(a,b));b.setData(a.getData(1));CKEDITOR.env.ie&&(b.attachListener(a,"resize",d,b),b.attachListener(CKEDITOR.document.getWindow(),"resize",d,b),CKEDITOR.tools.setTimeout(d,0,b));a.fire("ariaWidget",
this);e()});a.addCommand("source",f.commands.source);a.ui.addButton&&a.ui.addButton("Source",{label:a.lang.sourcearea.toolbar,command:"source",toolbar:"mode,10"});a.on("mode",function(){a.getCommand("source").setState("source"==a.mode?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF)});var e=CKEDITOR.env.ie&&9==CKEDITOR.env.version}}});var c=CKEDITOR.tools.createClass({base:CKEDITOR.editable,proto:{setData:function(a){this.setValue(a);this.status="ready";this.editor.fire("dataReady")},getData:function(){return this.getValue()},
insertHtml:function(){},insertElement:function(){},insertText:function(){},setReadOnly:function(a){this[(a?"set":"remove")+"Attribute"]("readOnly","readonly")},detach:function(){c.baseProto.detach.call(this);this.clearCustomData();this.remove()}}})})();
CKEDITOR.plugins.sourcearea={commands:{source:{modes:{wysiwyg:1,source:1},editorFocus:!1,readOnly:1,exec:function(c){"wysiwyg"==c.mode&&c.fire("saveSnapshot");c.getCommand("source").setState(CKEDITOR.TRISTATE_DISABLED);c.setMode("source"==c.mode?"wysiwyg":"source")},canUndo:!1}}};CKEDITOR.plugins.add("specialchar",{availableLangs:{af:1,ar:1,bg:1,ca:1,cs:1,cy:1,da:1,de:1,el:1,en:1,"en-gb":1,eo:1,es:1,et:1,eu:1,fa:1,fi:1,fr:1,"fr-ca":1,gl:1,he:1,hr:1,hu:1,id:1,it:1,ja:1,km:1,ko:1,ku:1,lt:1,lv:1,nb:1,nl:1,no:1,pl:1,pt:1,"pt-br":1,ru:1,si:1,sk:1,sl:1,sq:1,sv:1,th:1,tr:1,tt:1,ug:1,uk:1,vi:1,zh:1,"zh-cn":1},requires:"dialog",init:function(a){var c=this;CKEDITOR.dialog.add("specialchar",this.path+"dialogs/specialchar.js");a.addCommand("specialchar",{exec:function(){var b=a.langCode,
b=c.availableLangs[b]?b:c.availableLangs[b.replace(/-.*/,"")]?b.replace(/-.*/,""):"en";CKEDITOR.scriptLoader.load(CKEDITOR.getUrl(c.path+"dialogs/lang/"+b+".js"),function(){CKEDITOR.tools.extend(a.lang.specialchar,c.langEntries[b]);a.openDialog("specialchar")})},modes:{wysiwyg:1},canUndo:!1});a.ui.addButton&&a.ui.addButton("SpecialChar",{label:a.lang.specialchar.toolbar,command:"specialchar",toolbar:"insert,50"})}});CKEDITOR.config.specialChars="! \x26quot; # $ % \x26amp; ' ( ) * + - . / 0 1 2 3 4 5 6 7 8 9 : ; \x26lt; \x3d \x26gt; ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~ \x26euro; \x26lsquo; \x26rsquo; \x26ldquo; \x26rdquo; \x26ndash; \x26mdash; \x26iexcl; \x26cent; \x26pound; \x26curren; \x26yen; \x26brvbar; \x26sect; \x26uml; \x26copy; \x26ordf; \x26laquo; \x26not; \x26reg; \x26macr; \x26deg; \x26sup2; \x26sup3; \x26acute; \x26micro; \x26para; \x26middot; \x26cedil; \x26sup1; \x26ordm; \x26raquo; \x26frac14; \x26frac12; \x26frac34; \x26iquest; \x26Agrave; \x26Aacute; \x26Acirc; \x26Atilde; \x26Auml; \x26Aring; \x26AElig; \x26Ccedil; \x26Egrave; \x26Eacute; \x26Ecirc; \x26Euml; \x26Igrave; \x26Iacute; \x26Icirc; \x26Iuml; \x26ETH; \x26Ntilde; \x26Ograve; \x26Oacute; \x26Ocirc; \x26Otilde; \x26Ouml; \x26times; \x26Oslash; \x26Ugrave; \x26Uacute; \x26Ucirc; \x26Uuml; \x26Yacute; \x26THORN; \x26szlig; \x26agrave; \x26aacute; \x26acirc; \x26atilde; \x26auml; \x26aring; \x26aelig; \x26ccedil; \x26egrave; \x26eacute; \x26ecirc; \x26euml; \x26igrave; \x26iacute; \x26icirc; \x26iuml; \x26eth; \x26ntilde; \x26ograve; \x26oacute; \x26ocirc; \x26otilde; \x26ouml; \x26divide; \x26oslash; \x26ugrave; \x26uacute; \x26ucirc; \x26uuml; \x26yacute; \x26thorn; \x26yuml; \x26OElig; \x26oelig; \x26#372; \x26#374 \x26#373 \x26#375; \x26sbquo; \x26#8219; \x26bdquo; \x26hellip; \x26trade; \x26#9658; \x26bull; \x26rarr; \x26rArr; \x26hArr; \x26diams; \x26asymp;".split(" ");CKEDITOR.plugins.add("menubutton",{requires:"button,menu",onLoad:function(){var d=function(c){var a=this._,b=a.menu;a.state!==CKEDITOR.TRISTATE_DISABLED&&(a.on&&b?b.hide():(a.previousState=a.state,b||(b=a.menu=new CKEDITOR.menu(c,{panel:{className:"cke_menu_panel",attributes:{"aria-label":c.lang.common.options}}}),b.onHide=CKEDITOR.tools.bind(function(){var b=this.command?c.getCommand(this.command).modes:this.modes;this.setState(!b||b[c.mode]?a.previousState:CKEDITOR.TRISTATE_DISABLED);a.on=0},this),
this.onMenu&&b.addListener(this.onMenu)),this.setState(CKEDITOR.TRISTATE_ON),a.on=1,setTimeout(function(){b.show(CKEDITOR.document.getById(a.id),4)},0)))};CKEDITOR.ui.menuButton=CKEDITOR.tools.createClass({base:CKEDITOR.ui.button,$:function(c){delete c.panel;this.base(c);this.hasArrow=!0;this.click=d},statics:{handler:{create:function(c){return new CKEDITOR.ui.menuButton(c)}}}})},beforeInit:function(d){d.ui.addHandler(CKEDITOR.UI_MENUBUTTON,CKEDITOR.ui.menuButton.handler)}});
CKEDITOR.UI_MENUBUTTON="menubutton";CKEDITOR.plugins.add("scayt",{requires:"menubutton,dialog",tabToOpen:null,dialogName:"scaytDialog",init:function(a){var c=this,d=CKEDITOR.plugins.scayt;this.bindEvents(a);this.parseConfig(a);this.addRule(a);CKEDITOR.dialog.add(this.dialogName,CKEDITOR.getUrl(this.path+"dialogs/options.js"));this.addMenuItems(a);var b=a.lang.scayt,f=CKEDITOR.env;a.ui.add("Scayt",CKEDITOR.UI_MENUBUTTON,{label:b.text_title,title:a.plugins.wsc?a.lang.wsc.title:b.text_title,modes:{wysiwyg:!(f.ie&&(8>f.version||f.quirks))},
toolbar:"spellchecker,20",refresh:function(){var e=a.ui.instances.Scayt.getState();a.scayt&&(e=d.state[a.name]?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF);a.fire("scaytButtonState",e)},onRender:function(){var d=this;a.on("scaytButtonState",function(a){void 0!==typeof a.data&&d.setState(a.data)})},onMenu:function(){var e=a.scayt;a.getMenuItem("scaytToggle").label=a.lang.scayt[e&&d.state[a.name]?"btn_disable":"btn_enable"];e={scaytToggle:CKEDITOR.TRISTATE_OFF,scaytOptions:e?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,
scaytLangs:e?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,scaytDict:e?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,scaytAbout:e?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,WSC:a.plugins.wsc?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED};a.config.scayt_uiTabs[0]||delete e.scaytOptions;a.config.scayt_uiTabs[1]||delete e.scaytLangs;a.config.scayt_uiTabs[2]||delete e.scaytDict;return e}});a.contextMenu&&a.addMenuItems&&(a.contextMenu.addListener(function(d,b){var f=a.scayt,h;if(f){var l=
f.getSelectionNode();if(l=l?l.getAttribute(f.getNodeAttribute()):l)h=c.menuGenerator(a,l,c),f.showBanner("."+a.contextMenu._.definition.panel.className.split(" ").join(" ."))}return h}),a.contextMenu._.onHide=CKEDITOR.tools.override(a.contextMenu._.onHide,function(d){return function(){var b=a.scayt;b&&b.hideBanner();return d.apply(this)}}))},addMenuItems:function(a){var c=this,d=CKEDITOR.plugins.scayt;a.addMenuGroup("scaytButton");var b=a.config.scayt_contextMenuItemsOrder.split("|");if(b&&b.length)for(var f=
0;f<b.length;f++)a.addMenuGroup("scayt_"+b[f],f-10);a.addCommand("scaytToggle",{exec:function(a){var b=a.scayt;d.state[a.name]=!d.state[a.name];!0===d.state[a.name]?b||d.createScayt(a):b&&d.destroy(a)}});a.addCommand("scaytAbout",{exec:function(a){a.scayt.tabToOpen="about";a.lockSelection();a.openDialog(c.dialogName)}});a.addCommand("scaytOptions",{exec:function(a){a.scayt.tabToOpen="options";a.lockSelection();a.openDialog(c.dialogName)}});a.addCommand("scaytLangs",{exec:function(a){a.scayt.tabToOpen=
"langs";a.lockSelection();a.openDialog(c.dialogName)}});a.addCommand("scaytDict",{exec:function(a){a.scayt.tabToOpen="dictionaries";a.lockSelection();a.openDialog(c.dialogName)}});b={scaytToggle:{label:a.lang.scayt.btn_enable,group:"scaytButton",command:"scaytToggle"},scaytAbout:{label:a.lang.scayt.btn_about,group:"scaytButton",command:"scaytAbout"},scaytOptions:{label:a.lang.scayt.btn_options,group:"scaytButton",command:"scaytOptions"},scaytLangs:{label:a.lang.scayt.btn_langs,group:"scaytButton",
command:"scaytLangs"},scaytDict:{label:a.lang.scayt.btn_dictionaries,group:"scaytButton",command:"scaytDict"}};a.plugins.wsc&&(b.WSC={label:a.lang.wsc.toolbar,group:"scaytButton",onClick:function(){var d=CKEDITOR.plugins.scayt,b=a.scayt,c=a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?a.container.getText():a.document.getBody().getText();(c=c.replace(/\s/g,""))?(b&&d.state[a.name]&&b.setMarkupPaused&&b.setMarkupPaused(!0),a.lockSelection(),a.execCommand("checkspell")):alert("Nothing to check!")}});a.addMenuItems(b)},
bindEvents:function(a){function c(){var d=a.scayt;d&&(d.removeMarkupInSelectionNode(),d.fire("startSpellCheck"))}var d=CKEDITOR.plugins.scayt,b=a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE,f=function(){d.destroy(a)},e=function(){!d.state[a.name]||a.readOnly||a.scayt||d.createScayt(a)},g=function(){var d=a.editable();d.attachListener(d,"focus",function(d){CKEDITOR.plugins.scayt&&!a.scayt&&setTimeout(e,0);d=CKEDITOR.plugins.scayt&&CKEDITOR.plugins.scayt.state[a.name]&&a.scayt;var c,h;if((b||d)&&a._.savedSelection){d=
a._.savedSelection.getSelectedElement();d=!d&&a._.savedSelection.getRanges();for(var f=0;f<d.length;f++)h=d[f],"string"===typeof h.startContainer.$.nodeValue&&(c=h.startContainer.getText().length,(c<h.startOffset||c<h.endOffset)&&a.unlockSelection(!1))}},this,null,-10)},k=function(){b?(a.on("blur",f),a.on("focus",e),a.focusManager.hasFocus&&e()):e();g()};a.on("contentDom",k);a.on("beforeCommandExec",function(b){var c;if(b.data.name in d.options.disablingCommandExec&&"wysiwyg"==a.mode){if(c=a.scayt)d.destroy(a),
a.fire("scaytButtonState",CKEDITOR.TRISTATE_DISABLED)}else if("bold"===b.data.name||"italic"===b.data.name||"underline"===b.data.name||"strike"===b.data.name||"subscript"===b.data.name||"superscript"===b.data.name||"enter"===b.data.name)if(c=a.scayt)c.removeMarkupInSelectionNode(),setTimeout(function(){c.fire("startSpellCheck")},0)});a.on("beforeSetMode",function(b){if("source"==b.data){if(b=a.scayt)d.destroy(a),a.fire("scaytButtonState",CKEDITOR.TRISTATE_DISABLED);a.document&&a.document.getBody().removeAttribute("_jquid")}});
a.on("afterCommandExec",function(d){var b;"wysiwyg"!=a.mode||"undo"!=d.data.name&&"redo"!=d.data.name||(b=a.scayt)&&setTimeout(function(){b.fire("startSpellCheck")},250)});a.on("readOnly",function(b){var c;b&&(c=a.scayt,!0===b.editor.readOnly?c&&c.fire("removeMarkupInDocument",{}):c?c.fire("startSpellCheck"):"wysiwyg"==b.editor.mode&&!0===d.state[b.editor.name]&&(d.createScayt(a),b.editor.fire("scaytButtonState",CKEDITOR.TRISTATE_ON)))});a.on("beforeDestroy",f);a.on("setData",function(){f();(a.elementMode==
CKEDITOR.ELEMENT_MODE_INLINE||a.plugins.divarea)&&k()},this,null,50);a.on("insertElement",function(){CKEDITOR.env.ie?setTimeout(function(){c()},50):c()},this,null,50);a.on("insertHtml",function(){c()},this,null,50);a.on("insertText",function(){c()},this,null,50);a.on("scaytDialogShown",function(d){d.data.selectPage(a.scayt.tabToOpen)});a.on("paste",function(d){(d=a.scayt)&&d.removeMarkupInSelectionNode()},null,null,0)},parseConfig:function(a){var c=CKEDITOR.plugins.scayt;c.replaceOldOptionsNames(a.config);
"boolean"!==typeof a.config.scayt_autoStartup&&(a.config.scayt_autoStartup=!1);c.state[a.name]=a.config.scayt_autoStartup;a.config.scayt_contextCommands||(a.config.scayt_contextCommands="ignore|ignoreall|add");a.config.scayt_contextMenuItemsOrder||(a.config.scayt_contextMenuItemsOrder="suggest|moresuggest|control");a.config.scayt_sLang||(a.config.scayt_sLang="en_US");if(void 0===a.config.scayt_maxSuggestions||"number"!=typeof a.config.scayt_maxSuggestions||0>a.config.scayt_maxSuggestions)a.config.scayt_maxSuggestions=
5;if(void 0===a.config.scayt_minWordLength||"number"!=typeof a.config.scayt_minWordLength||1>a.config.scayt_minWordLength)a.config.scayt_minWordLength=4;if(void 0===a.config.scayt_customDictionaryIds||"string"!==typeof a.config.scayt_customDictionaryIds)a.config.scayt_customDictionaryIds="";if(void 0===a.config.scayt_userDictionaryName||"string"!==typeof a.config.scayt_userDictionaryName)a.config.scayt_userDictionaryName=null;if("string"===typeof a.config.scayt_uiTabs&&3===a.config.scayt_uiTabs.split(",").length){var d=
[],b=[];a.config.scayt_uiTabs=a.config.scayt_uiTabs.split(",");CKEDITOR.tools.search(a.config.scayt_uiTabs,function(a){1===Number(a)||0===Number(a)?(b.push(!0),d.push(Number(a))):b.push(!1)});null===CKEDITOR.tools.search(b,!1)?a.config.scayt_uiTabs=d:a.config.scayt_uiTabs=[1,1,1]}else a.config.scayt_uiTabs=[1,1,1];"string"!=typeof a.config.scayt_serviceProtocol&&(a.config.scayt_serviceProtocol=null);"string"!=typeof a.config.scayt_serviceHost&&(a.config.scayt_serviceHost=null);"string"!=typeof a.config.scayt_servicePort&&
(a.config.scayt_servicePort=null);"string"!=typeof a.config.scayt_servicePath&&(a.config.scayt_servicePath=null);a.config.scayt_moreSuggestions||(a.config.scayt_moreSuggestions="on");"string"!==typeof a.config.scayt_customerId&&(a.config.scayt_customerId="1:WvF0D4-UtPqN1-43nkD4-NKvUm2-daQqk3-LmNiI-z7Ysb4-mwry24-T8YrS3-Q2tpq2");"string"!==typeof a.config.scayt_srcUrl&&(c=document.location.protocol,c=-1!=c.search(/https?:/)?c:"http:",a.config.scayt_srcUrl=c+"//svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/ckscayt.js");
"boolean"!==typeof CKEDITOR.config.scayt_handleCheckDirty&&(CKEDITOR.config.scayt_handleCheckDirty=!0);"boolean"!==typeof CKEDITOR.config.scayt_handleUndoRedo&&(CKEDITOR.config.scayt_handleUndoRedo=!0);if(a.config.scayt_disableOptionsStorage){var c=CKEDITOR.tools.isArray(a.config.scayt_disableOptionsStorage)?a.config.scayt_disableOptionsStorage:"string"===typeof a.config.scayt_disableOptionsStorage?[a.config.scayt_disableOptionsStorage]:void 0,f="all options lang ignore-all-caps-words ignore-domain-names ignore-words-with-mixed-cases ignore-words-with-numbers".split(" "),
e=["lang","ignore-all-caps-words","ignore-domain-names","ignore-words-with-mixed-cases","ignore-words-with-numbers"],g=CKEDITOR.tools.search,k=CKEDITOR.tools.indexOf;a.config.scayt_disableOptionsStorage=function(a){for(var d=[],b=0;b<a.length;b++){var c=a[b],m=!!g(a,"options");if(!g(f,c)||m&&g(e,function(a){if("lang"===a)return!1}))return;g(e,c)&&e.splice(k(e,c),1);if("all"===c||m&&g(a,"lang"))return[];"options"===c&&(e=["lang"])}return d=d.concat(e)}(c)}},addRule:function(a){var c=a.dataProcessor,
d=c&&c.htmlFilter,b=a._.elementsPath&&a._.elementsPath.filters,c=c&&c.dataFilter,f=a.addRemoveFormatFilter,e=function(d){var b=CKEDITOR.plugins.scayt;if(a.scayt&&d.hasAttribute(b.options.data_attribute_name))return!1},g=function(d){var b=CKEDITOR.plugins.scayt,c=!0;a.scayt&&d.hasAttribute(b.options.data_attribute_name)&&(c=!1);return c};b&&b.push(e);c&&c.addRules({elements:{span:function(d){var b=CKEDITOR.plugins.scayt;b&&b.state[a.name]&&d.classes&&CKEDITOR.tools.search(d.classes,b.options.misspelled_word_class)&&
(d.classes&&d.parent.type===CKEDITOR.NODE_DOCUMENT_FRAGMENT?(delete d.attributes.style,delete d.name):delete d.classes[CKEDITOR.tools.indexOf(d.classes,b.options.misspelled_word_class)]);return d}}});d&&d.addRules({elements:{span:function(d){var b=CKEDITOR.plugins.scayt;b&&b.state[a.name]&&d.hasClass(b.options.misspelled_word_class)&&d.attributes[b.options.data_attribute_name]&&(d.removeClass(b.options.misspelled_word_class),delete d.attributes[b.options.data_attribute_name],delete d.name);return d}}});
f&&f.call(a,g)},scaytMenuDefinition:function(a){var c=this;a=a.scayt;return{scayt_ignore:{label:a.getLocal("btn_ignore"),group:"scayt_control",order:1,exec:function(a){a.scayt.ignoreWord()}},scayt_ignoreall:{label:a.getLocal("btn_ignoreAll"),group:"scayt_control",order:2,exec:function(a){a.scayt.ignoreAllWords()}},scayt_add:{label:a.getLocal("btn_addWord"),group:"scayt_control",order:3,exec:function(a){var b=a.scayt;setTimeout(function(){b.addWordToUserDictionary()},10)}},option:{label:a.getLocal("btn_options"),
group:"scayt_control",order:4,exec:function(a){a.scayt.tabToOpen="options";a.lockSelection();a.openDialog(c.dialogName)},verification:function(a){return 1==a.config.scayt_uiTabs[0]?!0:!1}},language:{label:a.getLocal("btn_langs"),group:"scayt_control",order:5,exec:function(a){a.scayt.tabToOpen="langs";a.lockSelection();a.openDialog(c.dialogName)},verification:function(a){return 1==a.config.scayt_uiTabs[1]?!0:!1}},dictionary:{label:a.getLocal("btn_dictionaries"),group:"scayt_control",order:6,exec:function(a){a.scayt.tabToOpen=
"dictionaries";a.lockSelection();a.openDialog(c.dialogName)},verification:function(a){return 1==a.config.scayt_uiTabs[2]?!0:!1}},about:{label:a.getLocal("btn_about"),group:"scayt_control",order:7,exec:function(a){a.scayt.tabToOpen="about";a.lockSelection();a.openDialog(c.dialogName)}}}},buildSuggestionMenuItems:function(a,c){var d={},b={},f=a.scayt;if(0<c.length&&"no_any_suggestions"!==c[0])for(var e=0;e<c.length;e++){var g="scayt_suggest_"+CKEDITOR.plugins.scayt.suggestions[e].replace(" ","_");a.addCommand(g,
this.createCommand(CKEDITOR.plugins.scayt.suggestions[e]));e<a.config.scayt_maxSuggestions?(a.addMenuItem(g,{label:c[e],command:g,group:"scayt_suggest",order:e+1}),d[g]=CKEDITOR.TRISTATE_OFF):(a.addMenuItem(g,{label:c[e],command:g,group:"scayt_moresuggest",order:e+1}),b[g]=CKEDITOR.TRISTATE_OFF,"on"===a.config.scayt_moreSuggestions&&(a.addMenuItem("scayt_moresuggest",{label:f.getLocal("btn_moreSuggestions"),group:"scayt_moresuggest",order:10,getItems:function(){return b}}),d.scayt_moresuggest=CKEDITOR.TRISTATE_OFF))}else d.no_scayt_suggest=
CKEDITOR.TRISTATE_DISABLED,a.addCommand("no_scayt_suggest",{exec:function(){}}),a.addMenuItem("no_scayt_suggest",{label:f.getLocal("btn_noSuggestions")||"no_scayt_suggest",command:"no_scayt_suggest",group:"scayt_suggest",order:0});return d},menuGenerator:function(a,c){var d=a.scayt,b=this.scaytMenuDefinition(a),f={},e=a.config.scayt_contextCommands.split("|");d.fire("getSuggestionsList",{lang:d.getLang(),word:c});f=this.buildSuggestionMenuItems(a,CKEDITOR.plugins.scayt.suggestions);if("off"==a.config.scayt_contextCommands)return f;
for(var g in b)if(-1!=CKEDITOR.tools.indexOf(e,g.replace("scayt_",""))||"all"==a.config.scayt_contextCommands)f[g]=CKEDITOR.TRISTATE_OFF,"function"!==typeof b[g].verification||b[g].verification(a)||delete f[g],a.addCommand(g,{exec:b[g].exec}),a.addMenuItem(g,{label:a.lang.scayt[b[g].label]||b[g].label,command:g,group:b[g].group,order:b[g].order});return f},createCommand:function(a){return{exec:function(c){c.scayt.replaceSelectionNode({word:a})}}}});
CKEDITOR.plugins.scayt={state:{},suggestions:[],loadingHelper:{loadOrder:[]},isLoading:!1,options:{disablingCommandExec:{source:!0,newpage:!0,templates:!0},data_attribute_name:"data-scayt-word",misspelled_word_class:"scayt-misspell-word"},backCompatibilityMap:{scayt_service_protocol:"scayt_serviceProtocol",scayt_service_host:"scayt_serviceHost",scayt_service_port:"scayt_servicePort",scayt_service_path:"scayt_servicePath",scayt_customerid:"scayt_customerId"},replaceOldOptionsNames:function(a){for(var c in a)c in
this.backCompatibilityMap&&(a[this.backCompatibilityMap[c]]=a[c],delete a[c])},createScayt:function(a){var c=this;this.loadScaytLibrary(a,function(a){var b={lang:a.config.scayt_sLang,container:"BODY"==a.editable().$.nodeName?a.document.getWindow().$.frameElement:a.editable().$,customDictionary:a.config.scayt_customDictionaryIds,userDictionaryName:a.config.scayt_userDictionaryName,localization:a.langCode,customer_id:a.config.scayt_customerId,debug:a.config.scayt_debug,data_attribute_name:c.options.data_attribute_name,
misspelled_word_class:c.options.misspelled_word_class,"options-to-restore":a.config.scayt_disableOptionsStorage,focused:a.editable().hasFocus,ignoreElementsRegex:a.config.scayt_elementsToIgnore,minWordLength:a.config.scayt_minWordLength};a.config.scayt_serviceProtocol&&(b.service_protocol=a.config.scayt_serviceProtocol);a.config.scayt_serviceHost&&(b.service_host=a.config.scayt_serviceHost);a.config.scayt_servicePort&&(b.service_port=a.config.scayt_servicePort);a.config.scayt_servicePath&&(b.service_path=
a.config.scayt_servicePath);b=new SCAYT.CKSCAYT(b,function(){},function(){});b.subscribe("suggestionListSend",function(a){for(var b={},d=[],c=0;c<a.suggestionList.length;c++)b["word_"+a.suggestionList[c]]||(b["word_"+a.suggestionList[c]]=a.suggestionList[c],d.push(a.suggestionList[c]));CKEDITOR.plugins.scayt.suggestions=d});b.subscribe("selectionIsChanged",function(b){a.getSelection().isLocked&&a.lockSelection()});a.scayt=b;a.fire("scaytButtonState",a.readOnly?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_ON)})},
destroy:function(a){a.scayt&&a.scayt.destroy();delete a.scayt;a.fire("scaytButtonState",CKEDITOR.TRISTATE_OFF)},loadScaytLibrary:function(a,c){var d=this,b;"undefined"===typeof window.SCAYT||"function"!==typeof window.SCAYT.CKSCAYT?this.loadingHelper[a.name]||(this.loadingHelper[a.name]=c,this.loadingHelper.loadOrder.push(a.name),b=new Date,b=b.getTime(),b=a.config.scayt_srcUrl+"?"+b,CKEDITOR.scriptLoader.load(b,function(a){CKEDITOR.fireOnce("scaytReady");for(var b=0;b<d.loadingHelper.loadOrder.length;b++){a=
d.loadingHelper.loadOrder[b];if("function"===typeof d.loadingHelper[a])d.loadingHelper[a](CKEDITOR.instances[a]);delete d.loadingHelper[a]}d.loadingHelper.loadOrder=[]})):window.SCAYT&&"function"===typeof window.SCAYT.CKSCAYT&&(CKEDITOR.fireOnce("scaytReady"),a.scayt||"function"===typeof c&&c(a))}};CKEDITOR.on("dialogDefinition",function(a){if("scaytDialog"===a.data.name)a.data.definition.dialog.on("cancel",function(a){return!1},this,null,-1)});
CKEDITOR.on("scaytReady",function(){if(!0===CKEDITOR.config.scayt_handleCheckDirty){var a=CKEDITOR.editor.prototype;a.checkDirty=CKEDITOR.tools.override(a.checkDirty,function(a){return function(){var b=null,c=this.scayt;if(CKEDITOR.plugins.scayt&&CKEDITOR.plugins.scayt.state[this.name]&&this.scayt){if(b="ready"==this.status)var e=c.removeMarkupFromString(this.getSnapshot()),c=c.removeMarkupFromString(this._.previousValue),b=b&&c!==e}else b=a.call(this);return b}});a.resetDirty=CKEDITOR.tools.override(a.resetDirty,
function(a){return function(){var b=this.scayt;CKEDITOR.plugins.scayt&&CKEDITOR.plugins.scayt.state[this.name]&&this.scayt?this._.previousValue=b.removeMarkupFromString(this.getSnapshot()):a.call(this)}})}if(!0===CKEDITOR.config.scayt_handleUndoRedo){var a=CKEDITOR.plugins.undo.Image.prototype,c="function"==typeof a.equalsContent?"equalsContent":"equals";a[c]=CKEDITOR.tools.override(a[c],function(a){return function(b){var c=b.editor.scayt,e=this.contents,g=b.contents,k=null;CKEDITOR.plugins.scayt&&
CKEDITOR.plugins.scayt.state[b.editor.name]&&b.editor.scayt&&(this.contents=c.removeMarkupFromString(e)||"",b.contents=c.removeMarkupFromString(g)||"");k=a.apply(this,arguments);this.contents=e;b.contents=g;return k}})}});(function(){CKEDITOR.plugins.add("stylescombo",{requires:"richcombo",init:function(c){var l=c.config,g=c.lang.stylescombo,f={},k=[],m=[];c.on("stylesSet",function(b){if(b=b.data.styles){for(var a,h,d,e=0,n=b.length;e<n;e++)(a=b[e],c.blockless&&a.element in CKEDITOR.dtd.$block||(h=a.name,a=new CKEDITOR.style(a),c.filter.customConfig&&!c.filter.check(a)))||(a._name=h,a._.enterMode=l.enterMode,a._.type=d=a.assignedTo||a.type,a._.weight=e+1E3*(d==CKEDITOR.STYLE_OBJECT?1:d==CKEDITOR.STYLE_BLOCK?2:3),f[h]=
a,k.push(a),m.push(a));k.sort(function(a,b){return a._.weight-b._.weight})}});c.ui.addRichCombo("Styles",{label:g.label,title:g.panelTitle,toolbar:"styles,10",allowedContent:m,panel:{css:[CKEDITOR.skin.getPath("editor")].concat(l.contentsCss),multiSelect:!0,attributes:{"aria-label":g.panelTitle}},init:function(){var b,a,c,d,e,f;e=0;for(f=k.length;e<f;e++)b=k[e],a=b._name,d=b._.type,d!=c&&(this.startGroup(g["panelTitle"+String(d)]),c=d),this.add(a,b.type==CKEDITOR.STYLE_OBJECT?a:b.buildPreview(),a);
this.commit()},onClick:function(b){c.focus();c.fire("saveSnapshot");b=f[b];var a=c.elementPath();c[b.checkActive(a,c)?"removeStyle":"applyStyle"](b);c.fire("saveSnapshot")},onRender:function(){c.on("selectionChange",function(b){var a=this.getValue();b=b.data.path.elements;for(var h=0,d=b.length,e;h<d;h++){e=b[h];for(var g in f)if(f[g].checkElementRemovable(e,!0,c)){g!=a&&this.setValue(g);return}}this.setValue("")},this)},onOpen:function(){var b=c.getSelection().getSelectedElement(),b=c.elementPath(b),
a=[0,0,0,0];this.showAll();this.unmarkAll();for(var h in f){var d=f[h],e=d._.type;d.checkApplicable(b,c,c.activeFilter)?a[e]++:this.hideItem(h);d.checkActive(b,c)&&this.mark(h)}a[CKEDITOR.STYLE_BLOCK]||this.hideGroup(g["panelTitle"+String(CKEDITOR.STYLE_BLOCK)]);a[CKEDITOR.STYLE_INLINE]||this.hideGroup(g["panelTitle"+String(CKEDITOR.STYLE_INLINE)]);a[CKEDITOR.STYLE_OBJECT]||this.hideGroup(g["panelTitle"+String(CKEDITOR.STYLE_OBJECT)])},refresh:function(){var b=c.elementPath();if(b){for(var a in f)if(f[a].checkApplicable(b,
c,c.activeFilter))return;this.setState(CKEDITOR.TRISTATE_DISABLED)}},reset:function(){f={};k=[]}})}})})();(function(){function k(c){return{editorFocus:!1,canUndo:!1,modes:{wysiwyg:1},exec:function(d){if(d.editable().hasFocus){var e=d.getSelection(),b;if(b=(new CKEDITOR.dom.elementPath(e.getCommonAncestor(),e.root)).contains({td:1,th:1},1)){var e=d.createRange(),a=CKEDITOR.tools.tryThese(function(){var a=b.getParent().$.cells[b.$.cellIndex+(c?-1:1)];a.parentNode.parentNode;return a},function(){var a=b.getParent(),a=a.getAscendant("table").$.rows[a.$.rowIndex+(c?-1:1)];return a.cells[c?a.cells.length-1:
0]});if(a||c)if(a)a=new CKEDITOR.dom.element(a),e.moveToElementEditStart(a),e.checkStartOfBlock()&&e.checkEndOfBlock()||e.selectNodeContents(a);else return!0;else{for(var f=b.getAscendant("table").$,a=b.getParent().$.cells,f=new CKEDITOR.dom.element(f.insertRow(-1),d.document),g=0,h=a.length;g<h;g++)f.append((new CKEDITOR.dom.element(a[g],d.document)).clone(!1,!1)).appendBogus();e.moveToElementEditStart(f)}e.select(!0);return!0}}return!1}}}var h={editorFocus:!1,modes:{wysiwyg:1,source:1}},g={exec:function(c){c.container.focusNext(!0,
c.tabIndex)}},f={exec:function(c){c.container.focusPrevious(!0,c.tabIndex)}};CKEDITOR.plugins.add("tab",{init:function(c){for(var d=!1!==c.config.enableTabKeyTools,e=c.config.tabSpaces||0,b="";e--;)b+=" ";if(b)c.on("key",function(a){9==a.data.keyCode&&(c.insertText(b),a.cancel())});if(d)c.on("key",function(a){(9==a.data.keyCode&&c.execCommand("selectNextCell")||a.data.keyCode==CKEDITOR.SHIFT+9&&c.execCommand("selectPreviousCell"))&&a.cancel()});c.addCommand("blur",CKEDITOR.tools.extend(g,h));c.addCommand("blurBack",
CKEDITOR.tools.extend(f,h));c.addCommand("selectNextCell",k());c.addCommand("selectPreviousCell",k(!0))}})})();
CKEDITOR.dom.element.prototype.focusNext=function(k,h){var g=void 0===h?this.getTabIndex():h,f,c,d,e,b,a;if(0>=g)for(b=this.getNextSourceNode(k,CKEDITOR.NODE_ELEMENT);b;){if(b.isVisible()&&0===b.getTabIndex()){d=b;break}b=b.getNextSourceNode(!1,CKEDITOR.NODE_ELEMENT)}else for(b=this.getDocument().getBody().getFirst();b=b.getNextSourceNode(!1,CKEDITOR.NODE_ELEMENT);){if(!f)if(!c&&b.equals(this)){if(c=!0,k){if(!(b=b.getNextSourceNode(!0,CKEDITOR.NODE_ELEMENT)))break;f=1}}else c&&!this.contains(b)&&
(f=1);if(b.isVisible()&&!(0>(a=b.getTabIndex()))){if(f&&a==g){d=b;break}a>g&&(!d||!e||a<e)?(d=b,e=a):d||0!==a||(d=b,e=a)}}d&&d.focus()};
CKEDITOR.dom.element.prototype.focusPrevious=function(k,h){for(var g=void 0===h?this.getTabIndex():h,f,c,d,e=0,b,a=this.getDocument().getBody().getLast();a=a.getPreviousSourceNode(!1,CKEDITOR.NODE_ELEMENT);){if(!f)if(!c&&a.equals(this)){if(c=!0,k){if(!(a=a.getPreviousSourceNode(!0,CKEDITOR.NODE_ELEMENT)))break;f=1}}else c&&!this.contains(a)&&(f=1);if(a.isVisible()&&!(0>(b=a.getTabIndex())))if(0>=g){if(f&&0===b){d=a;break}b>e&&(d=a,e=b)}else{if(f&&b==g){d=a;break}b<g&&(!d||b>e)&&(d=a,e=b)}}d&&d.focus()};CKEDITOR.plugins.add("table",{requires:"dialog",init:function(a){function e(a){return CKEDITOR.tools.extend(a||{},{contextSensitive:1,refresh:function(a,f){this.setState(f.contains("table",1)?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED)}})}if(!a.blockless){var c=a.lang.table;a.addCommand("table",new CKEDITOR.dialogCommand("table",{context:"table",allowedContent:"table{width,height}[align,border,cellpadding,cellspacing,summary];caption tbody thead tfoot;th td tr[scope];"+(a.plugins.dialogadvtab?
"table"+a.plugins.dialogadvtab.allowedContent():""),requiredContent:"table",contentTransformations:[["table{width}: sizeToStyle","table[width]: sizeToAttribute"]]}));a.addCommand("tableProperties",new CKEDITOR.dialogCommand("tableProperties",e()));a.addCommand("tableDelete",e({exec:function(a){var b=a.elementPath().contains("table",1);if(b){var d=b.getParent(),c=a.editable();1!=d.getChildCount()||d.is("td","th")||d.equals(c)||(b=d);a=a.createRange();a.moveToPosition(b,CKEDITOR.POSITION_BEFORE_START);
b.remove();a.select()}}}));a.ui.addButton&&a.ui.addButton("Table",{label:c.toolbar,command:"table",toolbar:"insert,30"});CKEDITOR.dialog.add("table",this.path+"dialogs/table.js");CKEDITOR.dialog.add("tableProperties",this.path+"dialogs/table.js");a.addMenuItems&&a.addMenuItems({table:{label:c.menu,command:"tableProperties",group:"table",order:5},tabledelete:{label:c.deleteTable,command:"tableDelete",group:"table",order:1}});a.on("doubleclick",function(a){a.data.element.is("table")&&(a.data.dialog=
"tableProperties")});a.contextMenu&&a.contextMenu.addListener(function(){return{tabledelete:CKEDITOR.TRISTATE_OFF,table:CKEDITOR.TRISTATE_OFF}})}}});(function(){function t(e){function d(a){0<b.length||a.type!=CKEDITOR.NODE_ELEMENT||!C.test(a.getName())||a.getCustomData("selected_cell")||(CKEDITOR.dom.element.setMarker(c,a,"selected_cell",!0),b.push(a))}e=e.getRanges();for(var b=[],c={},a=0;a<e.length;a++){var f=e[a];if(f.collapsed)f=f.getCommonAncestor(),(f=f.getAscendant("td",!0)||f.getAscendant("th",!0))&&b.push(f);else{var f=new CKEDITOR.dom.walker(f),g;for(f.guard=d;g=f.next();)g.type==CKEDITOR.NODE_ELEMENT&&g.is(CKEDITOR.dtd.table)||(g=g.getAscendant("td",
!0)||g.getAscendant("th",!0))&&!g.getCustomData("selected_cell")&&(CKEDITOR.dom.element.setMarker(c,g,"selected_cell",!0),b.push(g))}}CKEDITOR.dom.element.clearAllMarkers(c);return b}function p(e,d){for(var b=t(e),c=b[0],a=c.getAscendant("table"),c=c.getDocument(),f=b[0].getParent(),g=f.$.rowIndex,b=b[b.length-1],h=b.getParent().$.rowIndex+b.$.rowSpan-1,b=new CKEDITOR.dom.element(a.$.rows[h]),g=d?g:h,f=d?f:b,b=CKEDITOR.tools.buildTableMap(a),a=b[g],g=d?b[g-1]:b[g+1],b=b[0].length,c=c.createElement("tr"),
h=0;a[h]&&h<b;h++){var k;1<a[h].rowSpan&&g&&a[h]==g[h]?(k=a[h],k.rowSpan+=1):(k=(new CKEDITOR.dom.element(a[h])).clone(),k.removeAttribute("rowSpan"),k.appendBogus(),c.append(k),k=k.$);h+=k.colSpan-1}d?c.insertBefore(f):c.insertAfter(f)}function u(e){if(e instanceof CKEDITOR.dom.selection){var d=t(e),b=d[0].getAscendant("table"),c=CKEDITOR.tools.buildTableMap(b);e=d[0].getParent().$.rowIndex;for(var d=d[d.length-1],a=d.getParent().$.rowIndex+d.$.rowSpan-1,d=[],f=e;f<=a;f++){for(var g=c[f],h=new CKEDITOR.dom.element(b.$.rows[f]),
k=0;k<g.length;k++){var l=new CKEDITOR.dom.element(g[k]),n=l.getParent().$.rowIndex;1==l.$.rowSpan?l.remove():(--l.$.rowSpan,n==f&&(n=c[f+1],n[k-1]?l.insertAfter(new CKEDITOR.dom.element(n[k-1])):(new CKEDITOR.dom.element(b.$.rows[f+1])).append(l,1)));k+=l.$.colSpan-1}d.push(h)}c=b.$.rows;b=new CKEDITOR.dom.element(c[a+1]||(0<e?c[e-1]:null)||b.$.parentNode);for(f=d.length;0<=f;f--)u(d[f]);return b}e instanceof CKEDITOR.dom.element&&(b=e.getAscendant("table"),1==b.$.rows.length?b.remove():e.remove());
return null}function v(e,d){for(var b=d?Infinity:0,c=0;c<e.length;c++){var a;a=e[c];for(var f=d,g=a.getParent().$.cells,h=0,k=0;k<g.length;k++){var l=g[k],h=h+(f?1:l.colSpan);if(l==a.$)break}a=h-1;if(d?a<b:a>b)b=a}return b}function m(e,d){for(var b=t(e),c=b[0].getAscendant("table"),a=v(b,1),b=v(b),a=d?a:b,f=CKEDITOR.tools.buildTableMap(c),c=[],b=[],g=f.length,h=0;h<g;h++)c.push(f[h][a]),b.push(d?f[h][a-1]:f[h][a+1]);for(h=0;h<g;h++)c[h]&&(1<c[h].colSpan&&b[h]==c[h]?(a=c[h],a.colSpan+=1):(a=(new CKEDITOR.dom.element(c[h])).clone(),
a.removeAttribute("colSpan"),a.appendBogus(),a[d?"insertBefore":"insertAfter"].call(a,new CKEDITOR.dom.element(c[h])),a=a.$),h+=a.rowSpan-1)}function y(e,d){var b=e.getStartElement();if(b=b.getAscendant("td",1)||b.getAscendant("th",1)){var c=b.clone();c.appendBogus();d?c.insertBefore(b):c.insertAfter(b)}}function x(e){if(e instanceof CKEDITOR.dom.selection){e=t(e);var d=e[0]&&e[0].getAscendant("table"),b;a:{var c=0;b=e.length-1;for(var a={},f,g;f=e[c++];)CKEDITOR.dom.element.setMarker(a,f,"delete_cell",
!0);for(c=0;f=e[c++];)if((g=f.getPrevious())&&!g.getCustomData("delete_cell")||(g=f.getNext())&&!g.getCustomData("delete_cell")){CKEDITOR.dom.element.clearAllMarkers(a);b=g;break a}CKEDITOR.dom.element.clearAllMarkers(a);g=e[0].getParent();(g=g.getPrevious())?b=g.getLast():(g=e[b].getParent(),b=(g=g.getNext())?g.getChild(0):null)}for(g=e.length-1;0<=g;g--)x(e[g]);b?q(b,!0):d&&d.remove()}else e instanceof CKEDITOR.dom.element&&(d=e.getParent(),1==d.getChildCount()?d.remove():e.remove())}function q(e,
d){var b=e.getDocument(),c=CKEDITOR.document;CKEDITOR.env.ie&&10==CKEDITOR.env.version&&(c.focus(),b.focus());b=new CKEDITOR.dom.range(b);b["moveToElementEdit"+(d?"End":"Start")](e)||(b.selectNodeContents(e),b.collapse(d?!1:!0));b.select(!0)}function z(e,d,b){e=e[d];if("undefined"==typeof b)return e;for(d=0;e&&d<e.length;d++){if(b.is&&e[d]==b.$)return d;if(d==b)return new CKEDITOR.dom.element(e[d])}return b.is?-1:null}function w(e,d,b){var c=t(e),a;if((d?1!=c.length:2>c.length)||(a=e.getCommonAncestor())&&
a.type==CKEDITOR.NODE_ELEMENT&&a.is("table"))return!1;var f;e=c[0];a=e.getAscendant("table");var g=CKEDITOR.tools.buildTableMap(a),h=g.length,k=g[0].length,l=e.getParent().$.rowIndex,n=z(g,l,e);if(d){var r;try{var q=parseInt(e.getAttribute("rowspan"),10)||1;f=parseInt(e.getAttribute("colspan"),10)||1;r=g["up"==d?l-q:"down"==d?l+q:l]["left"==d?n-f:"right"==d?n+f:n]}catch(D){return!1}if(!r||e.$==r)return!1;c["up"==d||"left"==d?"unshift":"push"](new CKEDITOR.dom.element(r))}d=e.getDocument();var p=l,
q=r=0,u=!b&&new CKEDITOR.dom.documentFragment(d),w=0;for(d=0;d<c.length;d++){f=c[d];var m=f.getParent(),x=f.getFirst(),v=f.$.colSpan,y=f.$.rowSpan,m=m.$.rowIndex,A=z(g,m,f),w=w+v*y,q=Math.max(q,A-n+v);r=Math.max(r,m-l+y);b||(v=f,(y=v.getBogus())&&y.remove(),v.trim(),f.getChildren().count()&&(m==p||!x||x.isBlockBoundary&&x.isBlockBoundary({br:1})||(p=u.getLast(CKEDITOR.dom.walker.whitespaces(!0)),!p||p.is&&p.is("br")||u.append("br")),f.moveChildren(u)),d?f.remove():f.setHtml(""));p=m}if(b)return r*
q==w;u.moveChildren(e);e.appendBogus();q>=k?e.removeAttribute("rowSpan"):e.$.rowSpan=r;r>=h?e.removeAttribute("colSpan"):e.$.colSpan=q;b=new CKEDITOR.dom.nodeList(a.$.rows);c=b.count();for(d=c-1;0<=d;d--)a=b.getItem(d),a.$.cells.length||(a.remove(),c++);return e}function A(e,d){var b=t(e);if(1<b.length)return!1;if(d)return!0;var b=b[0],c=b.getParent(),a=c.getAscendant("table"),f=CKEDITOR.tools.buildTableMap(a),g=c.$.rowIndex,h=z(f,g,b),k=b.$.rowSpan,l;if(1<k){l=Math.ceil(k/2);for(var k=Math.floor(k/
2),c=g+l,a=new CKEDITOR.dom.element(a.$.rows[c]),f=z(f,c),n,c=b.clone(),g=0;g<f.length;g++)if(n=f[g],n.parentNode==a.$&&g>h){c.insertBefore(new CKEDITOR.dom.element(n));break}else n=null;n||a.append(c)}else for(k=l=1,a=c.clone(),a.insertAfter(c),a.append(c=b.clone()),n=z(f,g),h=0;h<n.length;h++)n[h].rowSpan++;c.appendBogus();b.$.rowSpan=l;c.$.rowSpan=k;1==l&&b.removeAttribute("rowSpan");1==k&&c.removeAttribute("rowSpan");return c}function B(e,d){var b=t(e);if(1<b.length)return!1;if(d)return!0;var b=
b[0],c=b.getParent(),a=c.getAscendant("table"),a=CKEDITOR.tools.buildTableMap(a),f=z(a,c.$.rowIndex,b),g=b.$.colSpan;if(1<g)c=Math.ceil(g/2),g=Math.floor(g/2);else{for(var g=c=1,h=[],k=0;k<a.length;k++){var l=a[k];h.push(l[f]);1<l[f].rowSpan&&(k+=l[f].rowSpan-1)}for(a=0;a<h.length;a++)h[a].colSpan++}a=b.clone();a.insertAfter(b);a.appendBogus();b.$.colSpan=c;a.$.colSpan=g;1==c&&b.removeAttribute("colSpan");1==g&&a.removeAttribute("colSpan");return a}var C=/^(?:td|th)$/;CKEDITOR.plugins.tabletools=
{requires:"table,dialog,contextmenu",init:function(e){function d(a){return CKEDITOR.tools.extend(a||{},{contextSensitive:1,refresh:function(a,b){this.setState(b.contains({td:1,th:1},1)?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED)}})}function b(a,b){var c=e.addCommand(a,b);e.addFeature(c)}var c=e.lang.table;b("cellProperties",new CKEDITOR.dialogCommand("cellProperties",d({allowedContent:"td th{width,height,border-color,background-color,white-space,vertical-align,text-align}[colspan,rowspan]",
requiredContent:"table"})));CKEDITOR.dialog.add("cellProperties",this.path+"dialogs/tableCell.js");b("rowDelete",d({requiredContent:"table",exec:function(a){a=a.getSelection();q(u(a))}}));b("rowInsertBefore",d({requiredContent:"table",exec:function(a){a=a.getSelection();p(a,!0)}}));b("rowInsertAfter",d({requiredContent:"table",exec:function(a){a=a.getSelection();p(a)}}));b("columnDelete",d({requiredContent:"table",exec:function(a){a=a.getSelection();a=t(a);var b=a[0],c=a[a.length-1];a=b.getAscendant("table");
for(var d=CKEDITOR.tools.buildTableMap(a),e,l,n=[],r=0,p=d.length;r<p;r++)for(var m=0,u=d[r].length;m<u;m++)d[r][m]==b.$&&(e=m),d[r][m]==c.$&&(l=m);for(r=e;r<=l;r++)for(m=0;m<d.length;m++)c=d[m],b=new CKEDITOR.dom.element(a.$.rows[m]),c=new CKEDITOR.dom.element(c[r]),c.$&&(1==c.$.colSpan?c.remove():--c.$.colSpan,m+=c.$.rowSpan-1,b.$.cells.length||n.push(b));l=a.$.rows[0]&&a.$.rows[0].cells;e=new CKEDITOR.dom.element(l[e]||(e?l[e-1]:a.$.parentNode));n.length==p&&a.remove();e&&q(e,!0)}}));b("columnInsertBefore",
d({requiredContent:"table",exec:function(a){a=a.getSelection();m(a,!0)}}));b("columnInsertAfter",d({requiredContent:"table",exec:function(a){a=a.getSelection();m(a)}}));b("cellDelete",d({requiredContent:"table",exec:function(a){a=a.getSelection();x(a)}}));b("cellMerge",d({allowedContent:"td[colspan,rowspan]",requiredContent:"td[colspan,rowspan]",exec:function(a){q(w(a.getSelection()),!0)}}));b("cellMergeRight",d({allowedContent:"td[colspan]",requiredContent:"td[colspan]",exec:function(a){q(w(a.getSelection(),
"right"),!0)}}));b("cellMergeDown",d({allowedContent:"td[rowspan]",requiredContent:"td[rowspan]",exec:function(a){q(w(a.getSelection(),"down"),!0)}}));b("cellVerticalSplit",d({allowedContent:"td[rowspan]",requiredContent:"td[rowspan]",exec:function(a){q(B(a.getSelection()))}}));b("cellHorizontalSplit",d({allowedContent:"td[colspan]",requiredContent:"td[colspan]",exec:function(a){q(A(a.getSelection()))}}));b("cellInsertBefore",d({requiredContent:"table",exec:function(a){a=a.getSelection();y(a,!0)}}));
b("cellInsertAfter",d({requiredContent:"table",exec:function(a){a=a.getSelection();y(a)}}));e.addMenuItems&&e.addMenuItems({tablecell:{label:c.cell.menu,group:"tablecell",order:1,getItems:function(){var a=e.getSelection(),b=t(a);return{tablecell_insertBefore:CKEDITOR.TRISTATE_OFF,tablecell_insertAfter:CKEDITOR.TRISTATE_OFF,tablecell_delete:CKEDITOR.TRISTATE_OFF,tablecell_merge:w(a,null,!0)?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,tablecell_merge_right:w(a,"right",!0)?CKEDITOR.TRISTATE_OFF:
CKEDITOR.TRISTATE_DISABLED,tablecell_merge_down:w(a,"down",!0)?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,tablecell_split_vertical:B(a,!0)?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,tablecell_split_horizontal:A(a,!0)?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED,tablecell_properties:0<b.length?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED}}},tablecell_insertBefore:{label:c.cell.insertBefore,group:"tablecell",command:"cellInsertBefore",order:5},tablecell_insertAfter:{label:c.cell.insertAfter,
group:"tablecell",command:"cellInsertAfter",order:10},tablecell_delete:{label:c.cell.deleteCell,group:"tablecell",command:"cellDelete",order:15},tablecell_merge:{label:c.cell.merge,group:"tablecell",command:"cellMerge",order:16},tablecell_merge_right:{label:c.cell.mergeRight,group:"tablecell",command:"cellMergeRight",order:17},tablecell_merge_down:{label:c.cell.mergeDown,group:"tablecell",command:"cellMergeDown",order:18},tablecell_split_horizontal:{label:c.cell.splitHorizontal,group:"tablecell",
command:"cellHorizontalSplit",order:19},tablecell_split_vertical:{label:c.cell.splitVertical,group:"tablecell",command:"cellVerticalSplit",order:20},tablecell_properties:{label:c.cell.title,group:"tablecellproperties",command:"cellProperties",order:21},tablerow:{label:c.row.menu,group:"tablerow",order:1,getItems:function(){return{tablerow_insertBefore:CKEDITOR.TRISTATE_OFF,tablerow_insertAfter:CKEDITOR.TRISTATE_OFF,tablerow_delete:CKEDITOR.TRISTATE_OFF}}},tablerow_insertBefore:{label:c.row.insertBefore,
group:"tablerow",command:"rowInsertBefore",order:5},tablerow_insertAfter:{label:c.row.insertAfter,group:"tablerow",command:"rowInsertAfter",order:10},tablerow_delete:{label:c.row.deleteRow,group:"tablerow",command:"rowDelete",order:15},tablecolumn:{label:c.column.menu,group:"tablecolumn",order:1,getItems:function(){return{tablecolumn_insertBefore:CKEDITOR.TRISTATE_OFF,tablecolumn_insertAfter:CKEDITOR.TRISTATE_OFF,tablecolumn_delete:CKEDITOR.TRISTATE_OFF}}},tablecolumn_insertBefore:{label:c.column.insertBefore,
group:"tablecolumn",command:"columnInsertBefore",order:5},tablecolumn_insertAfter:{label:c.column.insertAfter,group:"tablecolumn",command:"columnInsertAfter",order:10},tablecolumn_delete:{label:c.column.deleteColumn,group:"tablecolumn",command:"columnDelete",order:15}});e.contextMenu&&e.contextMenu.addListener(function(a,b,c){return(a=c.contains({td:1,th:1},1))&&!a.isReadOnly()?{tablecell:CKEDITOR.TRISTATE_OFF,tablerow:CKEDITOR.TRISTATE_OFF,tablecolumn:CKEDITOR.TRISTATE_OFF}:null})},getSelectedCells:t};
CKEDITOR.plugins.add("tabletools",CKEDITOR.plugins.tabletools)})();CKEDITOR.tools.buildTableMap=function(t){t=t.$.rows;for(var p=-1,u=[],v=0;v<t.length;v++){p++;!u[p]&&(u[p]=[]);for(var m=-1,y=0;y<t[v].cells.length;y++){var x=t[v].cells[y];for(m++;u[p][m];)m++;for(var q=isNaN(x.colSpan)?1:x.colSpan,x=isNaN(x.rowSpan)?1:x.rowSpan,z=0;z<x;z++){u[p+z]||(u[p+z]=[]);for(var w=0;w<q;w++)u[p+z][m+w]=t[v].cells[y]}m+=q-1}}return u};(function(){var g=[CKEDITOR.CTRL+90,CKEDITOR.CTRL+89,CKEDITOR.CTRL+CKEDITOR.SHIFT+90],n={8:1,46:1};CKEDITOR.plugins.add("undo",{init:function(a){function b(a){d.enabled&&!1!==a.data.command.canUndo&&d.save()}function c(){d.enabled=a.readOnly?!1:"wysiwyg"==a.mode;d.onChange()}var d=a.undoManager=new e(a),l=d.editingHandler=new k(d),f=a.addCommand("undo",{exec:function(){d.undo()&&(a.selectionChange(),this.fire("afterUndo"))},startDisabled:!0,canUndo:!1}),h=a.addCommand("redo",{exec:function(){d.redo()&&
(a.selectionChange(),this.fire("afterRedo"))},startDisabled:!0,canUndo:!1});a.setKeystroke([[g[0],"undo"],[g[1],"redo"],[g[2],"redo"]]);d.onChange=function(){f.setState(d.undoable()?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED);h.setState(d.redoable()?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED)};a.on("beforeCommandExec",b);a.on("afterCommandExec",b);a.on("saveSnapshot",function(a){d.save(a.data&&a.data.contentOnly)});a.on("contentDom",l.attachListeners,l);a.on("instanceReady",function(){a.fire("saveSnapshot")});
a.on("beforeModeUnload",function(){"wysiwyg"==a.mode&&d.save(!0)});a.on("mode",c);a.on("readOnly",c);a.ui.addButton&&(a.ui.addButton("Undo",{label:a.lang.undo.undo,command:"undo",toolbar:"undo,10"}),a.ui.addButton("Redo",{label:a.lang.undo.redo,command:"redo",toolbar:"undo,20"}));a.resetUndo=function(){d.reset();a.fire("saveSnapshot")};a.on("updateSnapshot",function(){d.currentImage&&d.update()});a.on("lockSnapshot",function(a){a=a.data;d.lock(a&&a.dontUpdate,a&&a.forceUpdate)});a.on("unlockSnapshot",
d.unlock,d)}});CKEDITOR.plugins.undo={};var e=CKEDITOR.plugins.undo.UndoManager=function(a){this.strokesRecorded=[0,0];this.locked=null;this.previousKeyGroup=-1;this.limit=a.config.undoStackSize||20;this.strokesLimit=25;this.editor=a;this.reset()};e.prototype={type:function(a,b){var c=e.getKeyGroup(a),d=this.strokesRecorded[c]+1;b=b||d>=this.strokesLimit;this.typing||(this.hasUndo=this.typing=!0,this.hasRedo=!1,this.onChange());b?(d=0,this.editor.fire("saveSnapshot")):this.editor.fire("change");this.strokesRecorded[c]=
d;this.previousKeyGroup=c},keyGroupChanged:function(a){return e.getKeyGroup(a)!=this.previousKeyGroup},reset:function(){this.snapshots=[];this.index=-1;this.currentImage=null;this.hasRedo=this.hasUndo=!1;this.locked=null;this.resetType()},resetType:function(){this.strokesRecorded=[0,0];this.typing=!1;this.previousKeyGroup=-1},refreshState:function(){this.hasUndo=!!this.getNextImage(!0);this.hasRedo=!!this.getNextImage(!1);this.resetType();this.onChange()},save:function(a,b,c){var d=this.editor;if(this.locked||
"ready"!=d.status||"wysiwyg"!=d.mode)return!1;var e=d.editable();if(!e||"ready"!=e.status)return!1;e=this.snapshots;b||(b=new f(d));if(!1===b.contents)return!1;if(this.currentImage)if(b.equalsContent(this.currentImage)){if(a||b.equalsSelection(this.currentImage))return!1}else!1!==c&&d.fire("change");e.splice(this.index+1,e.length-this.index-1);e.length==this.limit&&e.shift();this.index=e.push(b)-1;this.currentImage=b;!1!==c&&this.refreshState();return!0},restoreImage:function(a){var b=this.editor,
c;a.bookmarks&&(b.focus(),c=b.getSelection());this.locked={level:999};this.editor.loadSnapshot(a.contents);a.bookmarks?c.selectBookmarks(a.bookmarks):CKEDITOR.env.ie&&(c=this.editor.document.getBody().$.createTextRange(),c.collapse(!0),c.select());this.locked=null;this.index=a.index;this.currentImage=this.snapshots[this.index];this.update();this.refreshState();b.fire("change")},getNextImage:function(a){var b=this.snapshots,c=this.currentImage,d;if(c)if(a)for(d=this.index-1;0<=d;d--){if(a=b[d],!c.equalsContent(a))return a.index=
d,a}else for(d=this.index+1;d<b.length;d++)if(a=b[d],!c.equalsContent(a))return a.index=d,a;return null},redoable:function(){return this.enabled&&this.hasRedo},undoable:function(){return this.enabled&&this.hasUndo},undo:function(){if(this.undoable()){this.save(!0);var a=this.getNextImage(!0);if(a)return this.restoreImage(a),!0}return!1},redo:function(){if(this.redoable()&&(this.save(!0),this.redoable())){var a=this.getNextImage(!1);if(a)return this.restoreImage(a),!0}return!1},update:function(a){if(!this.locked){a||
(a=new f(this.editor));for(var b=this.index,c=this.snapshots;0<b&&this.currentImage.equalsContent(c[b-1]);)--b;c.splice(b,this.index-b+1,a);this.index=b;this.currentImage=a}},updateSelection:function(a){if(!this.snapshots.length)return!1;var b=this.snapshots,c=b[b.length-1];return c.equalsContent(a)&&!c.equalsSelection(a)?(this.currentImage=b[b.length-1]=a,!0):!1},lock:function(a,b){if(this.locked)this.locked.level++;else if(a)this.locked={level:1};else{var c=null;if(b)c=!0;else{var d=new f(this.editor,
!0);this.currentImage&&this.currentImage.equalsContent(d)&&(c=d)}this.locked={update:c,level:1}}},unlock:function(){if(this.locked&&!--this.locked.level){var a=this.locked.update;this.locked=null;if(!0===a)this.update();else if(a){var b=new f(this.editor,!0);a.equalsContent(b)||this.update()}}}};e.navigationKeyCodes={37:1,38:1,39:1,40:1,36:1,35:1,33:1,34:1};e.keyGroups={PRINTABLE:0,FUNCTIONAL:1};e.isNavigationKey=function(a){return!!e.navigationKeyCodes[a]};e.getKeyGroup=function(a){var b=e.keyGroups;
return n[a]?b.FUNCTIONAL:b.PRINTABLE};e.getOppositeKeyGroup=function(a){var b=e.keyGroups;return a==b.FUNCTIONAL?b.PRINTABLE:b.FUNCTIONAL};e.ieFunctionalKeysBug=function(a){return CKEDITOR.env.ie&&e.getKeyGroup(a)==e.keyGroups.FUNCTIONAL};var f=CKEDITOR.plugins.undo.Image=function(a,b){this.editor=a;a.fire("beforeUndoImage");var c=a.getSnapshot();CKEDITOR.env.ie&&c&&(c=c.replace(/\s+data-cke-expando=".*?"/g,""));this.contents=c;b||(this.bookmarks=(c=c&&a.getSelection())&&c.createBookmarks2(!0));a.fire("afterUndoImage")},
h=/\b(?:href|src|name)="[^"]*?"/gi;f.prototype={equalsContent:function(a){var b=this.contents;a=a.contents;CKEDITOR.env.ie&&(CKEDITOR.env.ie7Compat||CKEDITOR.env.quirks)&&(b=b.replace(h,""),a=a.replace(h,""));return b!=a?!1:!0},equalsSelection:function(a){var b=this.bookmarks;a=a.bookmarks;if(b||a){if(!b||!a||b.length!=a.length)return!1;for(var c=0;c<b.length;c++){var d=b[c],e=a[c];if(d.startOffset!=e.startOffset||d.endOffset!=e.endOffset||!CKEDITOR.tools.arrayCompare(d.start,e.start)||!CKEDITOR.tools.arrayCompare(d.end,
e.end))return!1}}return!0}};var k=CKEDITOR.plugins.undo.NativeEditingHandler=function(a){this.undoManager=a;this.ignoreInputEvent=!1;this.keyEventsStack=new m;this.lastKeydownImage=null};k.prototype={onKeydown:function(a){var b=a.data.getKey();if(229!==b)if(-1<CKEDITOR.tools.indexOf(g,a.data.getKeystroke()))a.data.preventDefault();else if(this.keyEventsStack.cleanUp(a),a=this.undoManager,this.keyEventsStack.getLast(b)||this.keyEventsStack.push(b),this.lastKeydownImage=new f(a.editor),e.isNavigationKey(b)||
this.undoManager.keyGroupChanged(b))if(a.strokesRecorded[0]||a.strokesRecorded[1])a.save(!1,this.lastKeydownImage,!1),a.resetType()},onInput:function(){if(this.ignoreInputEvent)this.ignoreInputEvent=!1;else{var a=this.keyEventsStack.getLast();a||(a=this.keyEventsStack.push(0));this.keyEventsStack.increment(a.keyCode);this.keyEventsStack.getTotalInputs()>=this.undoManager.strokesLimit&&(this.undoManager.type(a.keyCode,!0),this.keyEventsStack.resetInputs())}},onKeyup:function(a){var b=this.undoManager;
a=a.data.getKey();var c=this.keyEventsStack.getTotalInputs();this.keyEventsStack.remove(a);if(!(e.ieFunctionalKeysBug(a)&&this.lastKeydownImage&&this.lastKeydownImage.equalsContent(new f(b.editor,!0))))if(0<c)b.type(a);else if(e.isNavigationKey(a))this.onNavigationKey(!0)},onNavigationKey:function(a){var b=this.undoManager;!a&&b.save(!0,null,!1)||b.updateSelection(new f(b.editor));b.resetType()},ignoreInputEventListener:function(){this.ignoreInputEvent=!0},attachListeners:function(){var a=this.undoManager.editor,
b=a.editable(),c=this;b.attachListener(b,"keydown",function(a){c.onKeydown(a);if(e.ieFunctionalKeysBug(a.data.getKey()))c.onInput()},null,null,999);b.attachListener(b,CKEDITOR.env.ie?"keypress":"input",c.onInput,c,null,999);b.attachListener(b,"keyup",c.onKeyup,c,null,999);b.attachListener(b,"paste",c.ignoreInputEventListener,c,null,999);b.attachListener(b,"drop",c.ignoreInputEventListener,c,null,999);b.attachListener(b.isInline()?b:a.document.getDocumentElement(),"click",function(){c.onNavigationKey()},
null,null,999);b.attachListener(this.undoManager.editor,"blur",function(){c.keyEventsStack.remove(9)},null,null,999)}};var m=CKEDITOR.plugins.undo.KeyEventsStack=function(){this.stack=[]};m.prototype={push:function(a){a=this.stack.push({keyCode:a,inputs:0});return this.stack[a-1]},getLastIndex:function(a){if("number"!=typeof a)return this.stack.length-1;for(var b=this.stack.length;b--;)if(this.stack[b].keyCode==a)return b;return-1},getLast:function(a){a=this.getLastIndex(a);return-1!=a?this.stack[a]:
null},increment:function(a){this.getLast(a).inputs++},remove:function(a){a=this.getLastIndex(a);-1!=a&&this.stack.splice(a,1)},resetInputs:function(a){if("number"==typeof a)this.getLast(a).inputs=0;else for(a=this.stack.length;a--;)this.stack[a].inputs=0},getTotalInputs:function(){for(var a=this.stack.length,b=0;a--;)b+=this.stack[a].inputs;return b},cleanUp:function(a){a=a.data.$;a.ctrlKey||a.metaKey||this.remove(17);a.shiftKey||this.remove(16);a.altKey||this.remove(18)}}})();CKEDITOR.plugins.add("wsc",{requires:"dialog",parseApi:function(a){a.config.wsc_onFinish="function"===typeof a.config.wsc_onFinish?a.config.wsc_onFinish:function(){};a.config.wsc_onClose="function"===typeof a.config.wsc_onClose?a.config.wsc_onClose:function(){}},parseConfig:function(a){a.config.wsc_customerId=a.config.wsc_customerId||CKEDITOR.config.wsc_customerId||"1:ua3xw1-2XyGJ3-GWruD3-6OFNT1-oXcuB1-nR6Bp4-hgQHc-EcYng3-sdRXG3-NOfFk";a.config.wsc_customDictionaryIds=a.config.wsc_customDictionaryIds||
CKEDITOR.config.wsc_customDictionaryIds||"";a.config.wsc_userDictionaryName=a.config.wsc_userDictionaryName||CKEDITOR.config.wsc_userDictionaryName||"";a.config.wsc_customLoaderScript=a.config.wsc_customLoaderScript||CKEDITOR.config.wsc_customLoaderScript;CKEDITOR.config.wsc_cmd=a.config.wsc_cmd||CKEDITOR.config.wsc_cmd||"spell";CKEDITOR.config.wsc_version="v4.3.0-master-d769233";CKEDITOR.config.wsc_removeGlobalVariable=!0},init:function(a){var b=CKEDITOR.env;this.parseConfig(a);this.parseApi(a);
a.addCommand("checkspell",new CKEDITOR.dialogCommand("checkspell")).modes={wysiwyg:!CKEDITOR.env.opera&&!CKEDITOR.env.air&&document.domain==window.location.hostname&&!(b.ie&&(8>b.version||b.quirks))};"undefined"==typeof a.plugins.scayt&&a.ui.addButton&&a.ui.addButton("SpellChecker",{label:a.lang.wsc.toolbar,click:function(a){var b=a.elementMode==CKEDITOR.ELEMENT_MODE_INLINE?a.container.getText():a.document.getBody().getText();(b=b.replace(/\s/g,""))?a.execCommand("checkspell"):alert("Nothing to check!")},
toolbar:"spellchecker,10"});CKEDITOR.dialog.add("checkspell",this.path+(CKEDITOR.env.ie&&7>=CKEDITOR.env.version?"dialogs/wsc_ie.js":window.postMessage?"dialogs/wsc.js":"dialogs/wsc_ie.js"))}});CKEDITOR.config.plugins='dialogui,dialog,about,a11yhelp,basicstyles,blockquote,clipboard,panel,floatpanel,menu,contextmenu,resize,button,toolbar,elementspath,enterkey,entities,popup,filebrowser,floatingspace,listblock,richcombo,format,horizontalrule,htmlwriter,wysiwygarea,image,indent,indentlist,fakeobjects,link,list,magicline,maximize,pastetext,pastefromword,removeformat,showborders,sourcearea,specialchar,menubutton,scayt,stylescombo,tab,table,tabletools,undo,wsc';CKEDITOR.config.skin='minimalist';(function() {var setIcons = function(icons, strip) {var path = CKEDITOR.getUrl( 'plugins/' + strip );icons = icons.split( ',' );for ( var i = 0; i < icons.length; i++ )CKEDITOR.skin.icons[ icons[ i ] ] = { path: path, offset: -icons[ ++i ], bgsize : icons[ ++i ] };};if (CKEDITOR.env.hidpi) setIcons('about,0,,bold,24,,italic,48,,strike,72,,subscript,96,,superscript,120,,underline,144,,blockquote,168,,copy-rtl,192,,copy,216,,cut-rtl,240,,cut,264,,paste-rtl,288,,paste,312,,horizontalrule,336,,image,360,,indent-rtl,384,,indent,408,,outdent-rtl,432,,outdent,456,,anchor-rtl,480,,anchor,504,,link,528,,unlink,552,,bulletedlist-rtl,576,,bulletedlist,600,,numberedlist-rtl,624,,numberedlist,648,,maximize,672,,pastetext-rtl,696,,pastetext,720,,pastefromword-rtl,744,,pastefromword,768,,removeformat,792,,source-rtl,816,,source,840,,specialchar,864,,scayt,888,,table,912,,redo-rtl,936,,redo,960,,undo-rtl,984,,undo,1008,,spellchecker,1032,','icons_hidpi.png');else setIcons('about,0,auto,bold,24,auto,italic,48,auto,strike,72,auto,subscript,96,auto,superscript,120,auto,underline,144,auto,blockquote,168,auto,copy-rtl,192,auto,copy,216,auto,cut-rtl,240,auto,cut,264,auto,paste-rtl,288,auto,paste,312,auto,horizontalrule,336,auto,image,360,auto,indent-rtl,384,auto,indent,408,auto,outdent-rtl,432,auto,outdent,456,auto,anchor-rtl,480,auto,anchor,504,auto,link,528,auto,unlink,552,auto,bulletedlist-rtl,576,auto,bulletedlist,600,auto,numberedlist-rtl,624,auto,numberedlist,648,auto,maximize,672,auto,pastetext-rtl,696,auto,pastetext,720,auto,pastefromword-rtl,744,auto,pastefromword,768,auto,removeformat,792,auto,source-rtl,816,auto,source,840,auto,specialchar,864,auto,scayt,888,auto,table,912,auto,redo-rtl,936,auto,redo,960,auto,undo-rtl,984,auto,undo,1008,auto,spellchecker,1032,auto','icons.png');})();CKEDITOR.lang.languages={"en":1,"en-gb":1};}());
//# sourceMappingURL=vendor.js.map
