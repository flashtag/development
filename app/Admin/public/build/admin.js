(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
};

exports.__esModule = true;
},{}],2:[function(require,module,exports){
'use strict'

/**
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Computes the difference between two texts to create a patch.
 * Applies the patch onto another text, allowing for errors.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class containing the diff, match and patch methods.
 * @constructor
 */
function diff_match_patch() {

  // Defaults.
  // Redefine these in your program to override the defaults.

  // Number of seconds to map a diff before giving up (0 for infinity).
  this.Diff_Timeout = 1.0;
  // Cost of an empty edit operation in terms of edit characters.
  this.Diff_EditCost = 4;
  // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
  this.Match_Threshold = 0.5;
  // How far to search for a match (0 = exact location, 1000+ = broad match).
  // A match this many characters away from the expected location will add
  // 1.0 to the score (0.0 is a perfect match).
  this.Match_Distance = 1000;
  // When deleting a large block of text (over ~64 characters), how close do
  // the contents have to be to match the expected contents. (0.0 = perfection,
  // 1.0 = very loose).  Note that Match_Threshold controls how closely the
  // end points of a delete need to match.
  this.Patch_DeleteThreshold = 0.5;
  // Chunk size for context length.
  this.Patch_Margin = 4;

  // The number of bits in an int.
  this.Match_MaxBits = 32;
}


//  DIFF FUNCTIONS


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;

/** @typedef {{0: number, 1: string}} */
diff_match_patch.Diff;


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean=} opt_checklines Optional speedup flag. If present and false,
 *     then don't run a line-level diff first to identify the changed areas.
 *     Defaults to true, which does a faster, slightly less optimal diff.
 * @param {number} opt_deadline Optional time when the diff should be complete
 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
 *     instead.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 */
diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines,
    opt_deadline) {
  // Set a deadline by which time the diff must be complete.
  if (typeof opt_deadline == 'undefined') {
    if (this.Diff_Timeout <= 0) {
      opt_deadline = Number.MAX_VALUE;
    } else {
      opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
    }
  }
  var deadline = opt_deadline;

  // Check for null inputs.
  if (text1 == null || text2 == null) {
    throw new Error('Null input. (diff_main)');
  }

  // Check for equality (speedup).
  if (text1 == text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }

  if (typeof opt_checklines == 'undefined') {
    opt_checklines = true;
  }
  var checklines = opt_checklines;

  // Trim off common prefix (speedup).
  var commonlength = this.diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);

  // Trim off common suffix (speedup).
  commonlength = this.diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);

  // Compute the diff on the middle block.
  var diffs = this.diff_compute_(text1, text2, checklines, deadline);

  // Restore the prefix and suffix.
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  this.diff_cleanupMerge(diffs);
  return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean} checklines Speedup flag.  If false, then don't run a
 *     line-level diff first to identify the changed areas.
 *     If true, then run a faster, slightly less optimal diff.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines,
    deadline) {
  var diffs;

  if (!text1) {
    // Just add some text (speedup).
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    // Just delete some text (speedup).
    return [[DIFF_DELETE, text1]];
  }

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i != -1) {
    // Shorter text is inside the longer text (speedup).
    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
             [DIFF_EQUAL, shorttext],
             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
    // Swap insertions for deletions if diff is reversed.
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length == 1) {
    // Single character string.
    // After the previous speedup, the character can't be an equality.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  // Check to see if the problem can be split in two.
  var hm = this.diff_halfMatch_(text1, text2);
  if (hm) {
    // A half-match was found, sort out the return data.
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    // Send both pairs off for separate processing.
    var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
    var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
    // Merge the results.
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  if (checklines && text1.length > 100 && text2.length > 100) {
    return this.diff_lineMode_(text1, text2, deadline);
  }

  return this.diff_bisect_(text1, text2, deadline);
};


/**
 * Do a quick line-level diff on both strings, then rediff the parts for
 * greater accuracy.
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
  // Scan the text on a line-by-line basis first.
  var a = this.diff_linesToChars_(text1, text2);
  text1 = a.chars1;
  text2 = a.chars2;
  var linearray = a.lineArray;

  var diffs = this.diff_main(text1, text2, false, deadline);

  // Convert the diff back to original text.
  this.diff_charsToLines_(diffs, linearray);
  // Eliminate freak matches (e.g. blank lines)
  this.diff_cleanupSemantic(diffs);

  // Rediff any replacement blocks, this time character-by-character.
  // Add a dummy entry at the end.
  diffs.push([DIFF_EQUAL, '']);
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete >= 1 && count_insert >= 1) {
          // Delete the offending records and add the merged ones.
          diffs.splice(pointer - count_delete - count_insert,
                       count_delete + count_insert);
          pointer = pointer - count_delete - count_insert;
          var a = this.diff_main(text_delete, text_insert, false, deadline);
          for (var j = a.length - 1; j >= 0; j--) {
            diffs.splice(pointer, 0, a[j]);
          }
          pointer = pointer + a.length;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
    pointer++;
  }
  diffs.pop();  // Remove the dummy entry at the end.

  return diffs;
};


/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  var front = (delta % 2 != 0);
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    // Bail out if deadline is reached.
    if ((new Date()).getTime() > deadline) {
      break;
    }

    // Walk the front path one step.
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length &&
             text1.charAt(x1) == text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
          // Mirror x2 onto top-left coordinate system.
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            // Overlap detected.
            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }

    // Walk the reverse path one step.
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length &&
             text1.charAt(text1_length - x2 - 1) ==
             text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;
          if (x1 >= x2) {
            // Overlap detected.
            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y,
    deadline) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);

  // Compute both diffs serially.
  var diffs = this.diff_main(text1a, text2a, false, deadline);
  var diffsb = this.diff_main(text1b, text2b, false, deadline);

  return diffs.concat(diffsb);
};


/**
 * Split two texts into an array of strings.  Reduce the texts to a string of
 * hashes where each Unicode character represents one line.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
 *     An object containing the encoded text1, the encoded text2 and
 *     the array of unique strings.
 *     The zeroth element of the array of unique strings is intentionally blank.
 * @private
 */
diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
  var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
  var lineHash = {};   // e.g. lineHash['Hello\n'] == 4

  // '\x00' is a valid character, but various debuggers don't like it.
  // So we'll insert a junk entry to avoid generating a null character.
  lineArray[0] = '';

  /**
   * Split a text into an array of strings.  Reduce the texts to a string of
   * hashes where each Unicode character represents one line.
   * Modifies linearray and linehash through being a closure.
   * @param {string} text String to encode.
   * @return {string} Encoded string.
   * @private
   */
  function diff_linesToCharsMunge_(text) {
    var chars = '';
    // Walk the text, pulling out a substring for each line.
    // text.split('\n') would would temporarily double our memory footprint.
    // Modifying text would create many large strings to garbage collect.
    var lineStart = 0;
    var lineEnd = -1;
    // Keeping our own length variable is faster than looking it up.
    var lineArrayLength = lineArray.length;
    while (lineEnd < text.length - 1) {
      lineEnd = text.indexOf('\n', lineStart);
      if (lineEnd == -1) {
        lineEnd = text.length - 1;
      }
      var line = text.substring(lineStart, lineEnd + 1);
      lineStart = lineEnd + 1;

      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
          (lineHash[line] !== undefined)) {
        chars += String.fromCharCode(lineHash[line]);
      } else {
        chars += String.fromCharCode(lineArrayLength);
        lineHash[line] = lineArrayLength;
        lineArray[lineArrayLength++] = line;
      }
    }
    return chars;
  }

  var chars1 = diff_linesToCharsMunge_(text1);
  var chars2 = diff_linesToCharsMunge_(text2);
  return {chars1: chars1, chars2: chars2, lineArray: lineArray};
};


/**
 * Rehydrate the text in a diff from a string of line hashes to real lines of
 * text.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {!Array.<string>} lineArray Array of unique strings.
 * @private
 */
diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
  for (var x = 0; x < diffs.length; x++) {
    var chars = diffs[x][1];
    var text = [];
    for (var y = 0; y < chars.length; y++) {
      text[y] = lineArray[chars.charCodeAt(y)];
    }
    diffs[x][1] = text.join('');
  }
};


/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) ==
        text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 ||
      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */
diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  // Eliminate the null case.
  if (text1_length == 0 || text2_length == 0) {
    return 0;
  }
  // Truncate the longer string.
  if (text1_length > text2_length) {
    text1 = text1.substring(text1_length - text2_length);
  } else if (text1_length < text2_length) {
    text2 = text2.substring(0, text1_length);
  }
  var text_length = Math.min(text1_length, text2_length);
  // Quick check for the worst case.
  if (text1 == text2) {
    return text_length;
  }

  // Start by looking for a single character match
  // and increase length until no match is found.
  // Performance analysis: http://neil.fraser.name/news/2010/11/04/
  var best = 0;
  var length = 1;
  while (true) {
    var pattern = text1.substring(text_length - length);
    var found = text2.indexOf(pattern);
    if (found == -1) {
      return best;
    }
    length += found;
    if (found == 0 || text1.substring(text_length - length) ==
        text2.substring(0, length)) {
      best = length;
      length++;
    }
  }
};


/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 * @private
 */
diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
  if (this.Diff_Timeout <= 0) {
    // Don't risk returning a non-optimal diff if we have unlimited time.
    return null;
  }
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;  // Pointless.
  }
  var dmp = this;  // 'this' becomes 'window' in a closure.

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1;
    var best_common = '';
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
      var prefixLength = dmp.diff_commonPrefix(longtext.substring(i),
                                               shorttext.substring(j));
      var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i),
                                               shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j) +
            shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b,
              best_shorttext_a, best_shorttext_b, best_common];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  var hm1 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 4));
  // Check again based on the third quarter.
  var hm2 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 2));
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }

  // A half-match was found, sort out the return data.
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
};


/**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
  var changes = false;
  var equalities = [];  // Stack of indices where equalities are found.
  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0;  // Index of current position.
  // Number of characters that changed prior to the equality.
  var length_insertions1 = 0;
  var length_deletions1 = 0;
  // Number of characters that changed after the equality.
  var length_insertions2 = 0;
  var length_deletions2 = 0;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = diffs[pointer][1];
    } else {  // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }
      // Eliminate an equality that is smaller or equal to the edits on both
      // sides of it.
      if (lastequality && (lastequality.length <=
          Math.max(length_insertions1, length_deletions1)) &&
          (lastequality.length <= Math.max(length_insertions2,
                                           length_deletions2))) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0,
                     [DIFF_DELETE, lastequality]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        // Throw away the equality we just deleted.
        equalitiesLength--;
        // Throw away the previous equality (it needs to be reevaluated).
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0;  // Reset the counters.
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastequality = null;
        changes = true;
      }
    }
    pointer++;
  }

  // Normalize the diff.
  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
  this.diff_cleanupSemanticLossless(diffs);

  // Find any overlaps between deletions and insertions.
  // e.g: <del>abcxxx</del><ins>xxxdef</ins>
  //   -> <del>abc</del>xxx<ins>def</ins>
  // e.g: <del>xxxabc</del><ins>defxxx</ins>
  //   -> <ins>def</ins>xxx<del>abc</del>
  // Only extract an overlap if it is as big as the edit ahead or behind it.
  pointer = 1;
  while (pointer < diffs.length) {
    if (diffs[pointer - 1][0] == DIFF_DELETE &&
        diffs[pointer][0] == DIFF_INSERT) {
      var deletion = diffs[pointer - 1][1];
      var insertion = diffs[pointer][1];
      var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
      var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (overlap_length1 >= deletion.length / 2 ||
            overlap_length1 >= insertion.length / 2) {
          // Overlap found.  Insert an equality and trim the surrounding edits.
          diffs.splice(pointer, 0,
              [DIFF_EQUAL, insertion.substring(0, overlap_length1)]);
          diffs[pointer - 1][1] =
              deletion.substring(0, deletion.length - overlap_length1);
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (overlap_length2 >= deletion.length / 2 ||
            overlap_length2 >= insertion.length / 2) {
          // Reverse overlap found.
          // Insert an equality and swap and trim the surrounding edits.
          diffs.splice(pointer, 0,
              [DIFF_EQUAL, deletion.substring(0, overlap_length2)]);
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] =
              insertion.substring(0, insertion.length - overlap_length2);
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] =
              deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
};


/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
  /**
   * Given two strings, compute a score representing whether the internal
   * boundary falls on logical boundaries.
   * Scores range from 6 (best) to 0 (worst).
   * Closure, but does not reference any external variables.
   * @param {string} one First string.
   * @param {string} two Second string.
   * @return {number} The score.
   * @private
   */
  function diff_cleanupSemanticScore_(one, two) {
    if (!one || !two) {
      // Edges are the best.
      return 6;
    }

    // Each port of this function behaves slightly differently due to
    // subtle differences in each language's definition of things like
    // 'whitespace'.  Since this function's purpose is largely cosmetic,
    // the choice has been made to use each language's native features
    // rather than force total conformity.
    var char1 = one.charAt(one.length - 1);
    var char2 = two.charAt(0);
    var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
    var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
    var whitespace1 = nonAlphaNumeric1 &&
        char1.match(diff_match_patch.whitespaceRegex_);
    var whitespace2 = nonAlphaNumeric2 &&
        char2.match(diff_match_patch.whitespaceRegex_);
    var lineBreak1 = whitespace1 &&
        char1.match(diff_match_patch.linebreakRegex_);
    var lineBreak2 = whitespace2 &&
        char2.match(diff_match_patch.linebreakRegex_);
    var blankLine1 = lineBreak1 &&
        one.match(diff_match_patch.blanklineEndRegex_);
    var blankLine2 = lineBreak2 &&
        two.match(diff_match_patch.blanklineStartRegex_);

    if (blankLine1 || blankLine2) {
      // Five points for blank lines.
      return 5;
    } else if (lineBreak1 || lineBreak2) {
      // Four points for line breaks.
      return 4;
    } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
      // Three points for end of sentences.
      return 3;
    } else if (whitespace1 || whitespace2) {
      // Two points for whitespace.
      return 2;
    } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
      // One point for non-alphanumeric.
      return 1;
    }
    return 0;
  }

  var pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      var equality1 = diffs[pointer - 1][1];
      var edit = diffs[pointer][1];
      var equality2 = diffs[pointer + 1][1];

      // First, shift the edit as far left as possible.
      var commonOffset = this.diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        var commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }

      // Second, step character by character right, looking for the best fit.
      var bestEquality1 = equality1;
      var bestEdit = edit;
      var bestEquality2 = equality2;
      var bestScore = diff_cleanupSemanticScore_(equality1, edit) +
          diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        var score = diff_cleanupSemanticScore_(equality1, edit) +
            diff_cleanupSemanticScore_(edit, equality2);
        // The >= encourages trailing rather than leading whitespace on edits.
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (diffs[pointer - 1][1] != bestEquality1) {
        // We have an improvement, save it back to the diff.
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
};

// Define some regex patterns for matching boundaries.
diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
diff_match_patch.whitespaceRegex_ = /\s/;
diff_match_patch.linebreakRegex_ = /[\r\n]/;
diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;

/**
 * Reduce the number of edits by eliminating operationally trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
  var changes = false;
  var equalities = [];  // Stack of indices where equalities are found.
  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0;  // Index of current position.
  // Is there an insertion operation before the last equality.
  var pre_ins = false;
  // Is there a deletion operation before the last equality.
  var pre_del = false;
  // Is there an insertion operation after the last equality.
  var post_ins = false;
  // Is there a deletion operation after the last equality.
  var post_del = false;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
      if (diffs[pointer][1].length < this.Diff_EditCost &&
          (post_ins || post_del)) {
        // Candidate found.
        equalities[equalitiesLength++] = pointer;
        pre_ins = post_ins;
        pre_del = post_del;
        lastequality = diffs[pointer][1];
      } else {
        // Not a candidate, and can never become one.
        equalitiesLength = 0;
        lastequality = null;
      }
      post_ins = post_del = false;
    } else {  // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_DELETE) {
        post_del = true;
      } else {
        post_ins = true;
      }
      /*
       * Five types to be split:
       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
       * <ins>A</ins>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<ins>C</ins>
       * <ins>A</del>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<del>C</del>
       */
      if (lastequality && ((pre_ins && pre_del && post_ins && post_del) ||
                           ((lastequality.length < this.Diff_EditCost / 2) &&
                            (pre_ins + pre_del + post_ins + post_del) == 3))) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0,
                     [DIFF_DELETE, lastequality]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        equalitiesLength--;  // Throw away the equality we just deleted;
        lastequality = null;
        if (pre_ins && pre_del) {
          // No changes made which could affect previous entry, keep going.
          post_ins = post_del = true;
          equalitiesLength = 0;
        } else {
          equalitiesLength--;  // Throw away the previous equality.
          pointer = equalitiesLength > 0 ?
              equalities[equalitiesLength - 1] : -1;
          post_ins = post_del = false;
        }
        changes = true;
      }
    }
    pointer++;
  }

  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
};


/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  var commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            // Factor out any common prefixies.
            commonlength = this.diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if ((pointer - count_delete - count_insert) > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] ==
                  DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] +=
                    text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixies.
            commonlength = this.diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length -
                  commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length -
                  commonlength);
              text_delete = text_delete.substring(0, text_delete.length -
                  commonlength);
            }
          }
          // Delete the offending records and add the merged ones.
          if (count_delete === 0) {
            diffs.splice(pointer - count_insert,
                count_delete + count_insert, [DIFF_INSERT, text_insert]);
          } else if (count_insert === 0) {
            diffs.splice(pointer - count_delete,
                count_delete + count_insert, [DIFF_DELETE, text_delete]);
          } else {
            diffs.splice(pointer - count_delete - count_insert,
                count_delete + count_insert, [DIFF_DELETE, text_delete],
                [DIFF_INSERT, text_insert]);
          }
          pointer = pointer - count_delete - count_insert +
                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
          // Merge this equality with the previous one.
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop();  // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  var changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      if (diffs[pointer][1].substring(diffs[pointer][1].length -
          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
        // Shift the edit over the previous equality.
        diffs[pointer][1] = diffs[pointer - 1][1] +
            diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                        diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
          diffs[pointer + 1][1]) {
        // Shift the edit over the next equality.
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
            diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
};


/**
 * loc is a location in text1, compute and return the equivalent location in
 * text2.
 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @return {number} Location within text2.
 */
diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
  var chars1 = 0;
  var chars2 = 0;
  var last_chars1 = 0;
  var last_chars2 = 0;
  var x;
  for (x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_INSERT) {  // Equality or deletion.
      chars1 += diffs[x][1].length;
    }
    if (diffs[x][0] !== DIFF_DELETE) {  // Equality or insertion.
      chars2 += diffs[x][1].length;
    }
    if (chars1 > loc) {  // Overshot the location.
      break;
    }
    last_chars1 = chars1;
    last_chars2 = chars2;
  }
  // Was the location was deleted?
  if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
    return last_chars2;
  }
  // Add the remaining character length.
  return last_chars2 + (loc - last_chars1);
};


/**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */
diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
  var html = [];
  var pattern_amp = /&/g;
  var pattern_lt = /</g;
  var pattern_gt = />/g;
  var pattern_para = /\n/g;
  for (var x = 0; x < diffs.length; x++) {
    var op = diffs[x][0];    // Operation (insert, delete, equal)
    var data = diffs[x][1];  // Text of change.
    var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
        .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
    switch (op) {
      case DIFF_INSERT:
        html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
        break;
      case DIFF_DELETE:
        html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
        break;
      case DIFF_EQUAL:
        html[x] = '<span>' + text + '</span>';
        break;
    }
  }
  return html.join('');
};


/**
 * Compute and return the source text (all equalities and deletions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Source text.
 */
diff_match_patch.prototype.diff_text1 = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_INSERT) {
      text[x] = diffs[x][1];
    }
  }
  return text.join('');
};


/**
 * Compute and return the destination text (all equalities and insertions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Destination text.
 */
diff_match_patch.prototype.diff_text2 = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_DELETE) {
      text[x] = diffs[x][1];
    }
  }
  return text.join('');
};


/**
 * Compute the Levenshtein distance; the number of inserted, deleted or
 * substituted characters.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {number} Number of changes.
 */
diff_match_patch.prototype.diff_levenshtein = function(diffs) {
  var levenshtein = 0;
  var insertions = 0;
  var deletions = 0;
  for (var x = 0; x < diffs.length; x++) {
    var op = diffs[x][0];
    var data = diffs[x][1];
    switch (op) {
      case DIFF_INSERT:
        insertions += data.length;
        break;
      case DIFF_DELETE:
        deletions += data.length;
        break;
      case DIFF_EQUAL:
        // A deletion and an insertion is one substitution.
        levenshtein += Math.max(insertions, deletions);
        insertions = 0;
        deletions = 0;
        break;
    }
  }
  levenshtein += Math.max(insertions, deletions);
  return levenshtein;
};


/**
 * Crush the diff into an encoded string which describes the operations
 * required to transform text1 into text2.
 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Delta text.
 */
diff_match_patch.prototype.diff_toDelta = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    switch (diffs[x][0]) {
      case DIFF_INSERT:
        text[x] = '+' + encodeURI(diffs[x][1]);
        break;
      case DIFF_DELETE:
        text[x] = '-' + diffs[x][1].length;
        break;
      case DIFF_EQUAL:
        text[x] = '=' + diffs[x][1].length;
        break;
    }
  }
  return text.join('\t').replace(/%20/g, ' ');
};


/**
 * Given the original text1, and an encoded string which describes the
 * operations required to transform text1 into text2, compute the full diff.
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta text.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
  var diffs = [];
  var diffsLength = 0;  // Keeping our own length var is faster in JS.
  var pointer = 0;  // Cursor in text1
  var tokens = delta.split(/\t/g);
  for (var x = 0; x < tokens.length; x++) {
    // Each token begins with a one character parameter which specifies the
    // operation of this token (delete, insert, equality).
    var param = tokens[x].substring(1);
    switch (tokens[x].charAt(0)) {
      case '+':
        try {
          diffs[diffsLength++] = [DIFF_INSERT, decodeURI(param)];
        } catch (ex) {
          // Malformed URI sequence.
          throw new Error('Illegal escape in diff_fromDelta: ' + param);
        }
        break;
      case '-':
        // Fall through.
      case '=':
        var n = parseInt(param, 10);
        if (isNaN(n) || n < 0) {
          throw new Error('Invalid number in diff_fromDelta: ' + param);
        }
        var text = text1.substring(pointer, pointer += n);
        if (tokens[x].charAt(0) == '=') {
          diffs[diffsLength++] = [DIFF_EQUAL, text];
        } else {
          diffs[diffsLength++] = [DIFF_DELETE, text];
        }
        break;
      default:
        // Blank tokens are ok (from a trailing \t).
        // Anything else is an error.
        if (tokens[x]) {
          throw new Error('Invalid diff operation in diff_fromDelta: ' +
                          tokens[x]);
        }
    }
  }
  if (pointer != text1.length) {
    throw new Error('Delta length (' + pointer +
        ') does not equal source text length (' + text1.length + ').');
  }
  return diffs;
};


//  MATCH FUNCTIONS


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc'.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 */
diff_match_patch.prototype.match_main = function(text, pattern, loc) {
  // Check for null inputs.
  if (text == null || pattern == null || loc == null) {
    throw new Error('Null input. (match_main)');
  }

  loc = Math.max(0, Math.min(loc, text.length));
  if (text == pattern) {
    // Shortcut (potentially not guaranteed by the algorithm)
    return 0;
  } else if (!text.length) {
    // Nothing to match.
    return -1;
  } else if (text.substring(loc, loc + pattern.length) == pattern) {
    // Perfect match at the perfect spot!  (Includes case of null pattern)
    return loc;
  } else {
    // Do a fuzzy compare.
    return this.match_bitap_(text, pattern, loc);
  }
};


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
 * Bitap algorithm.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 * @private
 */
diff_match_patch.prototype.match_bitap_ = function(text, pattern, loc) {
  if (pattern.length > this.Match_MaxBits) {
    throw new Error('Pattern too long for this browser.');
  }

  // Initialise the alphabet.
  var s = this.match_alphabet_(pattern);

  var dmp = this;  // 'this' becomes 'window' in a closure.

  /**
   * Compute and return the score for a match with e errors and x location.
   * Accesses loc and pattern through being a closure.
   * @param {number} e Number of errors in match.
   * @param {number} x Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */
  function match_bitapScore_(e, x) {
    var accuracy = e / pattern.length;
    var proximity = Math.abs(loc - x);
    if (!dmp.Match_Distance) {
      // Dodge divide by zero error.
      return proximity ? 1.0 : accuracy;
    }
    return accuracy + (proximity / dmp.Match_Distance);
  }

  // Highest score beyond which we give up.
  var score_threshold = this.Match_Threshold;
  // Is there a nearby exact match? (speedup)
  var best_loc = text.indexOf(pattern, loc);
  if (best_loc != -1) {
    score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
    // What about in the other direction? (speedup)
    best_loc = text.lastIndexOf(pattern, loc + pattern.length);
    if (best_loc != -1) {
      score_threshold =
          Math.min(match_bitapScore_(0, best_loc), score_threshold);
    }
  }

  // Initialise the bit arrays.
  var matchmask = 1 << (pattern.length - 1);
  best_loc = -1;

  var bin_min, bin_mid;
  var bin_max = pattern.length + text.length;
  var last_rd;
  for (var d = 0; d < pattern.length; d++) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from 'loc' we can stray at this
    // error level.
    bin_min = 0;
    bin_mid = bin_max;
    while (bin_min < bin_mid) {
      if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
        bin_min = bin_mid;
      } else {
        bin_max = bin_mid;
      }
      bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
    }
    // Use the result from this iteration as the maximum for the next.
    bin_max = bin_mid;
    var start = Math.max(1, loc - bin_mid + 1);
    var finish = Math.min(loc + bin_mid, text.length) + pattern.length;

    var rd = Array(finish + 2);
    rd[finish + 1] = (1 << d) - 1;
    for (var j = finish; j >= start; j--) {
      // The alphabet (s) is a sparse hash, so the following line generates
      // warnings.
      var charMatch = s[text.charAt(j - 1)];
      if (d === 0) {  // First pass: exact match.
        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
      } else {  // Subsequent passes: fuzzy match.
        rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                last_rd[j + 1];
      }
      if (rd[j] & matchmask) {
        var score = match_bitapScore_(d, j - 1);
        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (score <= score_threshold) {
          // Told you so.
          score_threshold = score;
          best_loc = j - 1;
          if (best_loc > loc) {
            // When passing loc, don't exceed our current distance from loc.
            start = Math.max(1, 2 * loc - best_loc);
          } else {
            // Already passed loc, downhill from here on in.
            break;
          }
        }
      }
    }
    // No hope for a (better) match at greater error levels.
    if (match_bitapScore_(d + 1, loc) > score_threshold) {
      break;
    }
    last_rd = rd;
  }
  return best_loc;
};


/**
 * Initialise the alphabet for the Bitap algorithm.
 * @param {string} pattern The text to encode.
 * @return {!Object} Hash of character locations.
 * @private
 */
diff_match_patch.prototype.match_alphabet_ = function(pattern) {
  var s = {};
  for (var i = 0; i < pattern.length; i++) {
    s[pattern.charAt(i)] = 0;
  }
  for (var i = 0; i < pattern.length; i++) {
    s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
  }
  return s;
};


//  PATCH FUNCTIONS


/**
 * Increase the context until it is unique,
 * but don't let the pattern expand beyond Match_MaxBits.
 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
 * @param {string} text Source text.
 * @private
 */
diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
  if (text.length == 0) {
    return;
  }
  var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
  var padding = 0;

  // Look for the first and last matches of pattern in text.  If two different
  // matches are found, increase the pattern length.
  while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
         pattern.length < this.Match_MaxBits - this.Patch_Margin -
         this.Patch_Margin) {
    padding += this.Patch_Margin;
    pattern = text.substring(patch.start2 - padding,
                             patch.start2 + patch.length1 + padding);
  }
  // Add one chunk for good luck.
  padding += this.Patch_Margin;

  // Add the prefix.
  var prefix = text.substring(patch.start2 - padding, patch.start2);
  if (prefix) {
    patch.diffs.unshift([DIFF_EQUAL, prefix]);
  }
  // Add the suffix.
  var suffix = text.substring(patch.start2 + patch.length1,
                              patch.start2 + patch.length1 + padding);
  if (suffix) {
    patch.diffs.push([DIFF_EQUAL, suffix]);
  }

  // Roll back the start points.
  patch.start1 -= prefix.length;
  patch.start2 -= prefix.length;
  // Extend the lengths.
  patch.length1 += prefix.length + suffix.length;
  patch.length2 += prefix.length + suffix.length;
};


/**
 * Compute a list of patches to turn text1 into text2.
 * Use diffs if provided, otherwise compute it ourselves.
 * There are four ways to call this function, depending on what data is
 * available to the caller:
 * Method 1:
 * a = text1, b = text2
 * Method 2:
 * a = diffs
 * Method 3 (optimal):
 * a = text1, b = diffs
 * Method 4 (deprecated, use method 3):
 * a = text1, b = text2, c = diffs
 *
 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
 * Array of diff tuples for text1 to text2 (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_b text2 (methods 1,4) or
 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_c Array of diff tuples
 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
  var text1, diffs;
  if (typeof a == 'string' && typeof opt_b == 'string' &&
      typeof opt_c == 'undefined') {
    // Method 1: text1, text2
    // Compute diffs from text1 and text2.
    text1 = /** @type {string} */(a);
    diffs = this.diff_main(text1, /** @type {string} */(opt_b), true);
    if (diffs.length > 2) {
      this.diff_cleanupSemantic(diffs);
      this.diff_cleanupEfficiency(diffs);
    }
  } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
      typeof opt_c == 'undefined') {
    // Method 2: diffs
    // Compute text1 from diffs.
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(a);
    text1 = this.diff_text1(diffs);
  } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
      typeof opt_c == 'undefined') {
    // Method 3: text1, diffs
    text1 = /** @type {string} */(a);
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_b);
  } else if (typeof a == 'string' && typeof opt_b == 'string' &&
      opt_c && typeof opt_c == 'object') {
    // Method 4: text1, text2, diffs
    // text2 is not used.
    text1 = /** @type {string} */(a);
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_c);
  } else {
    throw new Error('Unknown call format to patch_make.');
  }

  if (diffs.length === 0) {
    return [];  // Get rid of the null case.
  }
  var patches = [];
  var patch = new diff_match_patch.patch_obj();
  var patchDiffLength = 0;  // Keeping our own length var is faster in JS.
  var char_count1 = 0;  // Number of characters into the text1 string.
  var char_count2 = 0;  // Number of characters into the text2 string.
  // Start with text1 (prepatch_text) and apply the diffs until we arrive at
  // text2 (postpatch_text).  We recreate the patches one by one to determine
  // context info.
  var prepatch_text = text1;
  var postpatch_text = text1;
  for (var x = 0; x < diffs.length; x++) {
    var diff_type = diffs[x][0];
    var diff_text = diffs[x][1];

    if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
      // A new patch starts here.
      patch.start1 = char_count1;
      patch.start2 = char_count2;
    }

    switch (diff_type) {
      case DIFF_INSERT:
        patch.diffs[patchDiffLength++] = diffs[x];
        patch.length2 += diff_text.length;
        postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
                         postpatch_text.substring(char_count2);
        break;
      case DIFF_DELETE:
        patch.length1 += diff_text.length;
        patch.diffs[patchDiffLength++] = diffs[x];
        postpatch_text = postpatch_text.substring(0, char_count2) +
                         postpatch_text.substring(char_count2 +
                             diff_text.length);
        break;
      case DIFF_EQUAL:
        if (diff_text.length <= 2 * this.Patch_Margin &&
            patchDiffLength && diffs.length != x + 1) {
          // Small equality inside a patch.
          patch.diffs[patchDiffLength++] = diffs[x];
          patch.length1 += diff_text.length;
          patch.length2 += diff_text.length;
        } else if (diff_text.length >= 2 * this.Patch_Margin) {
          // Time for a new patch.
          if (patchDiffLength) {
            this.patch_addContext_(patch, prepatch_text);
            patches.push(patch);
            patch = new diff_match_patch.patch_obj();
            patchDiffLength = 0;
            // Unlike Unidiff, our patch lists have a rolling context.
            // http://code.google.com/p/google-diff-match-patch/wiki/Unidiff
            // Update prepatch text & pos to reflect the application of the
            // just completed patch.
            prepatch_text = postpatch_text;
            char_count1 = char_count2;
          }
        }
        break;
    }

    // Update the current character count.
    if (diff_type !== DIFF_INSERT) {
      char_count1 += diff_text.length;
    }
    if (diff_type !== DIFF_DELETE) {
      char_count2 += diff_text.length;
    }
  }
  // Pick up the leftover patch if not empty.
  if (patchDiffLength) {
    this.patch_addContext_(patch, prepatch_text);
    patches.push(patch);
  }

  return patches;
};


/**
 * Given an array of patches, return another array that is identical.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_deepCopy = function(patches) {
  // Making deep copies is hard in JavaScript.
  var patchesCopy = [];
  for (var x = 0; x < patches.length; x++) {
    var patch = patches[x];
    var patchCopy = new diff_match_patch.patch_obj();
    patchCopy.diffs = [];
    for (var y = 0; y < patch.diffs.length; y++) {
      patchCopy.diffs[y] = patch.diffs[y].slice();
    }
    patchCopy.start1 = patch.start1;
    patchCopy.start2 = patch.start2;
    patchCopy.length1 = patch.length1;
    patchCopy.length2 = patch.length2;
    patchesCopy[x] = patchCopy;
  }
  return patchesCopy;
};


/**
 * Merge a set of patches onto the text.  Return a patched text, as well
 * as a list of true/false values indicating which patches were applied.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @param {string} text Old text.
 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
 *      new text and an array of boolean values.
 */
diff_match_patch.prototype.patch_apply = function(patches, text) {
  if (patches.length == 0) {
    return [text, []];
  }

  // Deep copy the patches so that no changes are made to originals.
  patches = this.patch_deepCopy(patches);

  var nullPadding = this.patch_addPadding(patches);
  text = nullPadding + text + nullPadding;

  this.patch_splitMax(patches);
  // delta keeps track of the offset between the expected and actual location
  // of the previous patch.  If there are patches expected at positions 10 and
  // 20, but the first patch was found at 12, delta is 2 and the second patch
  // has an effective expected position of 22.
  var delta = 0;
  var results = [];
  for (var x = 0; x < patches.length; x++) {
    var expected_loc = patches[x].start2 + delta;
    var text1 = this.diff_text1(patches[x].diffs);
    var start_loc;
    var end_loc = -1;
    if (text1.length > this.Match_MaxBits) {
      // patch_splitMax will only provide an oversized pattern in the case of
      // a monster delete.
      start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits),
                                  expected_loc);
      if (start_loc != -1) {
        end_loc = this.match_main(text,
            text1.substring(text1.length - this.Match_MaxBits),
            expected_loc + text1.length - this.Match_MaxBits);
        if (end_loc == -1 || start_loc >= end_loc) {
          // Can't find valid trailing context.  Drop this patch.
          start_loc = -1;
        }
      }
    } else {
      start_loc = this.match_main(text, text1, expected_loc);
    }
    if (start_loc == -1) {
      // No match found.  :(
      results[x] = false;
      // Subtract the delta for this failed patch from subsequent patches.
      delta -= patches[x].length2 - patches[x].length1;
    } else {
      // Found a match.  :)
      results[x] = true;
      delta = start_loc - expected_loc;
      var text2;
      if (end_loc == -1) {
        text2 = text.substring(start_loc, start_loc + text1.length);
      } else {
        text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
      }
      if (text1 == text2) {
        // Perfect match, just shove the replacement text in.
        text = text.substring(0, start_loc) +
               this.diff_text2(patches[x].diffs) +
               text.substring(start_loc + text1.length);
      } else {
        // Imperfect match.  Run a diff to get a framework of equivalent
        // indices.
        var diffs = this.diff_main(text1, text2, false);
        if (text1.length > this.Match_MaxBits &&
            this.diff_levenshtein(diffs) / text1.length >
            this.Patch_DeleteThreshold) {
          // The end points match, but the content is unacceptably bad.
          results[x] = false;
        } else {
          this.diff_cleanupSemanticLossless(diffs);
          var index1 = 0;
          var index2;
          for (var y = 0; y < patches[x].diffs.length; y++) {
            var mod = patches[x].diffs[y];
            if (mod[0] !== DIFF_EQUAL) {
              index2 = this.diff_xIndex(diffs, index1);
            }
            if (mod[0] === DIFF_INSERT) {  // Insertion
              text = text.substring(0, start_loc + index2) + mod[1] +
                     text.substring(start_loc + index2);
            } else if (mod[0] === DIFF_DELETE) {  // Deletion
              text = text.substring(0, start_loc + index2) +
                     text.substring(start_loc + this.diff_xIndex(diffs,
                         index1 + mod[1].length));
            }
            if (mod[0] !== DIFF_DELETE) {
              index1 += mod[1].length;
            }
          }
        }
      }
    }
  }
  // Strip the padding off.
  text = text.substring(nullPadding.length, text.length - nullPadding.length);
  return [text, results];
};


/**
 * Add some padding on text start and end so that edges can match something.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} The padding string added to each side.
 */
diff_match_patch.prototype.patch_addPadding = function(patches) {
  var paddingLength = this.Patch_Margin;
  var nullPadding = '';
  for (var x = 1; x <= paddingLength; x++) {
    nullPadding += String.fromCharCode(x);
  }

  // Bump all the patches forward.
  for (var x = 0; x < patches.length; x++) {
    patches[x].start1 += paddingLength;
    patches[x].start2 += paddingLength;
  }

  // Add some padding on start of first diff.
  var patch = patches[0];
  var diffs = patch.diffs;
  if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
    // Add nullPadding equality.
    diffs.unshift([DIFF_EQUAL, nullPadding]);
    patch.start1 -= paddingLength;  // Should be 0.
    patch.start2 -= paddingLength;  // Should be 0.
    patch.length1 += paddingLength;
    patch.length2 += paddingLength;
  } else if (paddingLength > diffs[0][1].length) {
    // Grow first equality.
    var extraLength = paddingLength - diffs[0][1].length;
    diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
    patch.start1 -= extraLength;
    patch.start2 -= extraLength;
    patch.length1 += extraLength;
    patch.length2 += extraLength;
  }

  // Add some padding on end of last diff.
  patch = patches[patches.length - 1];
  diffs = patch.diffs;
  if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
    // Add nullPadding equality.
    diffs.push([DIFF_EQUAL, nullPadding]);
    patch.length1 += paddingLength;
    patch.length2 += paddingLength;
  } else if (paddingLength > diffs[diffs.length - 1][1].length) {
    // Grow last equality.
    var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
    diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
    patch.length1 += extraLength;
    patch.length2 += extraLength;
  }

  return nullPadding;
};


/**
 * Look through the patches and break up any which are longer than the maximum
 * limit of the match algorithm.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 */
diff_match_patch.prototype.patch_splitMax = function(patches) {
  var patch_size = this.Match_MaxBits;
  for (var x = 0; x < patches.length; x++) {
    if (patches[x].length1 <= patch_size) {
      continue;
    }
    var bigpatch = patches[x];
    // Remove the big old patch.
    patches.splice(x--, 1);
    var start1 = bigpatch.start1;
    var start2 = bigpatch.start2;
    var precontext = '';
    while (bigpatch.diffs.length !== 0) {
      // Create one of several smaller patches.
      var patch = new diff_match_patch.patch_obj();
      var empty = true;
      patch.start1 = start1 - precontext.length;
      patch.start2 = start2 - precontext.length;
      if (precontext !== '') {
        patch.length1 = patch.length2 = precontext.length;
        patch.diffs.push([DIFF_EQUAL, precontext]);
      }
      while (bigpatch.diffs.length !== 0 &&
             patch.length1 < patch_size - this.Patch_Margin) {
        var diff_type = bigpatch.diffs[0][0];
        var diff_text = bigpatch.diffs[0][1];
        if (diff_type === DIFF_INSERT) {
          // Insertions are harmless.
          patch.length2 += diff_text.length;
          start2 += diff_text.length;
          patch.diffs.push(bigpatch.diffs.shift());
          empty = false;
        } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 &&
                   patch.diffs[0][0] == DIFF_EQUAL &&
                   diff_text.length > 2 * patch_size) {
          // This is a large deletion.  Let it pass in one chunk.
          patch.length1 += diff_text.length;
          start1 += diff_text.length;
          empty = false;
          patch.diffs.push([diff_type, diff_text]);
          bigpatch.diffs.shift();
        } else {
          // Deletion or equality.  Only take as much as we can stomach.
          diff_text = diff_text.substring(0,
              patch_size - patch.length1 - this.Patch_Margin);
          patch.length1 += diff_text.length;
          start1 += diff_text.length;
          if (diff_type === DIFF_EQUAL) {
            patch.length2 += diff_text.length;
            start2 += diff_text.length;
          } else {
            empty = false;
          }
          patch.diffs.push([diff_type, diff_text]);
          if (diff_text == bigpatch.diffs[0][1]) {
            bigpatch.diffs.shift();
          } else {
            bigpatch.diffs[0][1] =
                bigpatch.diffs[0][1].substring(diff_text.length);
          }
        }
      }
      // Compute the head context for the next patch.
      precontext = this.diff_text2(patch.diffs);
      precontext =
          precontext.substring(precontext.length - this.Patch_Margin);
      // Append the end context for this patch.
      var postcontext = this.diff_text1(bigpatch.diffs)
                            .substring(0, this.Patch_Margin);
      if (postcontext !== '') {
        patch.length1 += postcontext.length;
        patch.length2 += postcontext.length;
        if (patch.diffs.length !== 0 &&
            patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
          patch.diffs[patch.diffs.length - 1][1] += postcontext;
        } else {
          patch.diffs.push([DIFF_EQUAL, postcontext]);
        }
      }
      if (!empty) {
        patches.splice(++x, 0, patch);
      }
    }
  }
};


/**
 * Take a list of patches and return a textual representation.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} Text representation of patches.
 */
diff_match_patch.prototype.patch_toText = function(patches) {
  var text = [];
  for (var x = 0; x < patches.length; x++) {
    text[x] = patches[x];
  }
  return text.join('');
};


/**
 * Parse a textual representation of patches and return a list of Patch objects.
 * @param {string} textline Text representation of patches.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.patch_fromText = function(textline) {
  var patches = [];
  if (!textline) {
    return patches;
  }
  var text = textline.split('\n');
  var textPointer = 0;
  var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
  while (textPointer < text.length) {
    var m = text[textPointer].match(patchHeader);
    if (!m) {
      throw new Error('Invalid patch string: ' + text[textPointer]);
    }
    var patch = new diff_match_patch.patch_obj();
    patches.push(patch);
    patch.start1 = parseInt(m[1], 10);
    if (m[2] === '') {
      patch.start1--;
      patch.length1 = 1;
    } else if (m[2] == '0') {
      patch.length1 = 0;
    } else {
      patch.start1--;
      patch.length1 = parseInt(m[2], 10);
    }

    patch.start2 = parseInt(m[3], 10);
    if (m[4] === '') {
      patch.start2--;
      patch.length2 = 1;
    } else if (m[4] == '0') {
      patch.length2 = 0;
    } else {
      patch.start2--;
      patch.length2 = parseInt(m[4], 10);
    }
    textPointer++;

    while (textPointer < text.length) {
      var sign = text[textPointer].charAt(0);
      try {
        var line = decodeURI(text[textPointer].substring(1));
      } catch (ex) {
        // Malformed URI sequence.
        throw new Error('Illegal escape in patch_fromText: ' + line);
      }
      if (sign == '-') {
        // Deletion.
        patch.diffs.push([DIFF_DELETE, line]);
      } else if (sign == '+') {
        // Insertion.
        patch.diffs.push([DIFF_INSERT, line]);
      } else if (sign == ' ') {
        // Minor equality.
        patch.diffs.push([DIFF_EQUAL, line]);
      } else if (sign == '@') {
        // Start of next patch.
        break;
      } else if (sign === '') {
        // Blank line?  Whatever.
      } else {
        // WTF?
        throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
      }
      textPointer++;
    }
  }
  return patches;
};


/**
 * Class representing one patch operation.
 * @constructor
 */
diff_match_patch.patch_obj = function() {
  /** @type {!Array.<!diff_match_patch.Diff>} */
  this.diffs = [];
  /** @type {?number} */
  this.start1 = null;
  /** @type {?number} */
  this.start2 = null;
  /** @type {number} */
  this.length1 = 0;
  /** @type {number} */
  this.length2 = 0;
};


/**
 * Emmulate GNU diff's format.
 * Header: @@ -382,8 +481,9 @@
 * Indicies are printed as 1-based, not 0-based.
 * @return {string} The GNU diff string.
 */
diff_match_patch.patch_obj.prototype.toString = function() {
  var coords1, coords2;
  if (this.length1 === 0) {
    coords1 = this.start1 + ',0';
  } else if (this.length1 == 1) {
    coords1 = this.start1 + 1;
  } else {
    coords1 = (this.start1 + 1) + ',' + this.length1;
  }
  if (this.length2 === 0) {
    coords2 = this.start2 + ',0';
  } else if (this.length2 == 1) {
    coords2 = this.start2 + 1;
  } else {
    coords2 = (this.start2 + 1) + ',' + this.length2;
  }
  var text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
  var op;
  // Escape the body of the patch with %xx notation.
  for (var x = 0; x < this.diffs.length; x++) {
    switch (this.diffs[x][0]) {
      case DIFF_INSERT:
        op = '+';
        break;
      case DIFF_DELETE:
        op = '-';
        break;
      case DIFF_EQUAL:
        op = ' ';
        break;
    }
    text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
  }
  return text.join('').replace(/%20/g, ' ');
};


// The following export code was added by @ForbesLindesay
module.exports = diff_match_patch;
module.exports['diff_match_patch'] = diff_match_patch;
module.exports['DIFF_DELETE'] = DIFF_DELETE;
module.exports['DIFF_INSERT'] = DIFF_INSERT;
module.exports['DIFF_EQUAL'] = DIFF_EQUAL;

},{}],3:[function(require,module,exports){

/*
 *
 * More info at [www.dropzonejs.com](http://www.dropzonejs.com)
 *
 * Copyright (c) 2012, Matias Meno
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

(function() {
  var Dropzone, Emitter, camelize, contentLoaded, detectVerticalSquash, drawImageIOSFix, noop, without,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  noop = function() {};

  Emitter = (function() {
    function Emitter() {}

    Emitter.prototype.addEventListener = Emitter.prototype.on;

    Emitter.prototype.on = function(event, fn) {
      this._callbacks = this._callbacks || {};
      if (!this._callbacks[event]) {
        this._callbacks[event] = [];
      }
      this._callbacks[event].push(fn);
      return this;
    };

    Emitter.prototype.emit = function() {
      var args, callback, callbacks, event, _i, _len;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this._callbacks = this._callbacks || {};
      callbacks = this._callbacks[event];
      if (callbacks) {
        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
          callback = callbacks[_i];
          callback.apply(this, args);
        }
      }
      return this;
    };

    Emitter.prototype.removeListener = Emitter.prototype.off;

    Emitter.prototype.removeAllListeners = Emitter.prototype.off;

    Emitter.prototype.removeEventListener = Emitter.prototype.off;

    Emitter.prototype.off = function(event, fn) {
      var callback, callbacks, i, _i, _len;
      if (!this._callbacks || arguments.length === 0) {
        this._callbacks = {};
        return this;
      }
      callbacks = this._callbacks[event];
      if (!callbacks) {
        return this;
      }
      if (arguments.length === 1) {
        delete this._callbacks[event];
        return this;
      }
      for (i = _i = 0, _len = callbacks.length; _i < _len; i = ++_i) {
        callback = callbacks[i];
        if (callback === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };

    return Emitter;

  })();

  Dropzone = (function(_super) {
    var extend, resolveOption;

    __extends(Dropzone, _super);

    Dropzone.prototype.Emitter = Emitter;


    /*
    This is a list of all available events you can register on a dropzone object.
    
    You can register an event handler like this:
    
        dropzone.on("dragEnter", function() { });
     */

    Dropzone.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "addedfiles", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached", "queuecomplete"];

    Dropzone.prototype.defaultOptions = {
      url: null,
      method: "post",
      withCredentials: false,
      parallelUploads: 2,
      uploadMultiple: false,
      maxFilesize: 256,
      paramName: "file",
      createImageThumbnails: true,
      maxThumbnailFilesize: 10,
      thumbnailWidth: 120,
      thumbnailHeight: 120,
      filesizeBase: 1000,
      maxFiles: null,
      params: {},
      clickable: true,
      ignoreHiddenFiles: true,
      acceptedFiles: null,
      acceptedMimeTypes: null,
      autoProcessQueue: true,
      autoQueue: true,
      addRemoveLinks: false,
      previewsContainer: null,
      hiddenInputContainer: "body",
      capture: null,
      dictDefaultMessage: "Drop files here to upload",
      dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
      dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
      dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
      dictInvalidFileType: "You can't upload files of this type.",
      dictResponseError: "Server responded with {{statusCode}} code.",
      dictCancelUpload: "Cancel upload",
      dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
      dictRemoveFile: "Remove file",
      dictRemoveFileConfirmation: null,
      dictMaxFilesExceeded: "You can not upload any more files.",
      accept: function(file, done) {
        return done();
      },
      init: function() {
        return noop;
      },
      forceFallback: false,
      fallback: function() {
        var child, messageElement, span, _i, _len, _ref;
        this.element.className = "" + this.element.className + " dz-browser-not-supported";
        _ref = this.element.getElementsByTagName("div");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (/(^| )dz-message($| )/.test(child.className)) {
            messageElement = child;
            child.className = "dz-message";
            continue;
          }
        }
        if (!messageElement) {
          messageElement = Dropzone.createElement("<div class=\"dz-message\"><span></span></div>");
          this.element.appendChild(messageElement);
        }
        span = messageElement.getElementsByTagName("span")[0];
        if (span) {
          if (span.textContent != null) {
            span.textContent = this.options.dictFallbackMessage;
          } else if (span.innerText != null) {
            span.innerText = this.options.dictFallbackMessage;
          }
        }
        return this.element.appendChild(this.getFallbackForm());
      },
      resize: function(file) {
        var info, srcRatio, trgRatio;
        info = {
          srcX: 0,
          srcY: 0,
          srcWidth: file.width,
          srcHeight: file.height
        };
        srcRatio = file.width / file.height;
        info.optWidth = this.options.thumbnailWidth;
        info.optHeight = this.options.thumbnailHeight;
        if ((info.optWidth == null) && (info.optHeight == null)) {
          info.optWidth = info.srcWidth;
          info.optHeight = info.srcHeight;
        } else if (info.optWidth == null) {
          info.optWidth = srcRatio * info.optHeight;
        } else if (info.optHeight == null) {
          info.optHeight = (1 / srcRatio) * info.optWidth;
        }
        trgRatio = info.optWidth / info.optHeight;
        if (file.height < info.optHeight || file.width < info.optWidth) {
          info.trgHeight = info.srcHeight;
          info.trgWidth = info.srcWidth;
        } else {
          if (srcRatio > trgRatio) {
            info.srcHeight = file.height;
            info.srcWidth = info.srcHeight * trgRatio;
          } else {
            info.srcWidth = file.width;
            info.srcHeight = info.srcWidth / trgRatio;
          }
        }
        info.srcX = (file.width - info.srcWidth) / 2;
        info.srcY = (file.height - info.srcHeight) / 2;
        return info;
      },

      /*
      Those functions register themselves to the events on init and handle all
      the user interface specific stuff. Overwriting them won't break the upload
      but can break the way it's displayed.
      You can overwrite them if you don't like the default behavior. If you just
      want to add an additional event handler, register it on the dropzone object
      and don't overwrite those options.
       */
      drop: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      dragstart: noop,
      dragend: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      dragenter: function(e) {
        return this.element.classList.add("dz-drag-hover");
      },
      dragover: function(e) {
        return this.element.classList.add("dz-drag-hover");
      },
      dragleave: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      paste: noop,
      reset: function() {
        return this.element.classList.remove("dz-started");
      },
      addedfile: function(file) {
        var node, removeFileEvent, removeLink, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
        if (this.element === this.previewsContainer) {
          this.element.classList.add("dz-started");
        }
        if (this.previewsContainer) {
          file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
          file.previewTemplate = file.previewElement;
          this.previewsContainer.appendChild(file.previewElement);
          _ref = file.previewElement.querySelectorAll("[data-dz-name]");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            node.textContent = file.name;
          }
          _ref1 = file.previewElement.querySelectorAll("[data-dz-size]");
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            node = _ref1[_j];
            node.innerHTML = this.filesize(file.size);
          }
          if (this.options.addRemoveLinks) {
            file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>" + this.options.dictRemoveFile + "</a>");
            file.previewElement.appendChild(file._removeLink);
          }
          removeFileEvent = (function(_this) {
            return function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (file.status === Dropzone.UPLOADING) {
                return Dropzone.confirm(_this.options.dictCancelUploadConfirmation, function() {
                  return _this.removeFile(file);
                });
              } else {
                if (_this.options.dictRemoveFileConfirmation) {
                  return Dropzone.confirm(_this.options.dictRemoveFileConfirmation, function() {
                    return _this.removeFile(file);
                  });
                } else {
                  return _this.removeFile(file);
                }
              }
            };
          })(this);
          _ref2 = file.previewElement.querySelectorAll("[data-dz-remove]");
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            removeLink = _ref2[_k];
            _results.push(removeLink.addEventListener("click", removeFileEvent));
          }
          return _results;
        }
      },
      removedfile: function(file) {
        var _ref;
        if (file.previewElement) {
          if ((_ref = file.previewElement) != null) {
            _ref.parentNode.removeChild(file.previewElement);
          }
        }
        return this._updateMaxFilesReachedClass();
      },
      thumbnail: function(file, dataUrl) {
        var thumbnailElement, _i, _len, _ref;
        if (file.previewElement) {
          file.previewElement.classList.remove("dz-file-preview");
          _ref = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            thumbnailElement = _ref[_i];
            thumbnailElement.alt = file.name;
            thumbnailElement.src = dataUrl;
          }
          return setTimeout(((function(_this) {
            return function() {
              return file.previewElement.classList.add("dz-image-preview");
            };
          })(this)), 1);
        }
      },
      error: function(file, message) {
        var node, _i, _len, _ref, _results;
        if (file.previewElement) {
          file.previewElement.classList.add("dz-error");
          if (typeof message !== "String" && message.error) {
            message = message.error;
          }
          _ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            _results.push(node.textContent = message);
          }
          return _results;
        }
      },
      errormultiple: noop,
      processing: function(file) {
        if (file.previewElement) {
          file.previewElement.classList.add("dz-processing");
          if (file._removeLink) {
            return file._removeLink.textContent = this.options.dictCancelUpload;
          }
        }
      },
      processingmultiple: noop,
      uploadprogress: function(file, progress, bytesSent) {
        var node, _i, _len, _ref, _results;
        if (file.previewElement) {
          _ref = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            if (node.nodeName === 'PROGRESS') {
              _results.push(node.value = progress);
            } else {
              _results.push(node.style.width = "" + progress + "%");
            }
          }
          return _results;
        }
      },
      totaluploadprogress: noop,
      sending: noop,
      sendingmultiple: noop,
      success: function(file) {
        if (file.previewElement) {
          return file.previewElement.classList.add("dz-success");
        }
      },
      successmultiple: noop,
      canceled: function(file) {
        return this.emit("error", file, "Upload canceled.");
      },
      canceledmultiple: noop,
      complete: function(file) {
        if (file._removeLink) {
          file._removeLink.textContent = this.options.dictRemoveFile;
        }
        if (file.previewElement) {
          return file.previewElement.classList.add("dz-complete");
        }
      },
      completemultiple: noop,
      maxfilesexceeded: noop,
      maxfilesreached: noop,
      queuecomplete: noop,
      addedfiles: noop,
      previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-image\"><img data-dz-thumbnail /></div>\n  <div class=\"dz-details\">\n    <div class=\"dz-size\"><span data-dz-size></span></div>\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Check</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <path d=\"M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" stroke-opacity=\"0.198794158\" stroke=\"#747474\" fill-opacity=\"0.816519475\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path>\n      </g>\n    </svg>\n  </div>\n  <div class=\"dz-error-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Error</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <g id=\"Check-+-Oval-2\" sketch:type=\"MSLayerGroup\" stroke=\"#747474\" stroke-opacity=\"0.198794158\" fill=\"#FFFFFF\" fill-opacity=\"0.816519475\">\n          <path d=\"M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" sketch:type=\"MSShapeGroup\"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>"
    };

    extend = function() {
      var key, object, objects, target, val, _i, _len;
      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        for (key in object) {
          val = object[key];
          target[key] = val;
        }
      }
      return target;
    };

    function Dropzone(element, options) {
      var elementOptions, fallback, _ref;
      this.element = element;
      this.version = Dropzone.version;
      this.defaultOptions.previewTemplate = this.defaultOptions.previewTemplate.replace(/\n*/g, "");
      this.clickableElements = [];
      this.listeners = [];
      this.files = [];
      if (typeof this.element === "string") {
        this.element = document.querySelector(this.element);
      }
      if (!(this.element && (this.element.nodeType != null))) {
        throw new Error("Invalid dropzone element.");
      }
      if (this.element.dropzone) {
        throw new Error("Dropzone already attached.");
      }
      Dropzone.instances.push(this);
      this.element.dropzone = this;
      elementOptions = (_ref = Dropzone.optionsForElement(this.element)) != null ? _ref : {};
      this.options = extend({}, this.defaultOptions, elementOptions, options != null ? options : {});
      if (this.options.forceFallback || !Dropzone.isBrowserSupported()) {
        return this.options.fallback.call(this);
      }
      if (this.options.url == null) {
        this.options.url = this.element.getAttribute("action");
      }
      if (!this.options.url) {
        throw new Error("No URL provided.");
      }
      if (this.options.acceptedFiles && this.options.acceptedMimeTypes) {
        throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
      }
      if (this.options.acceptedMimeTypes) {
        this.options.acceptedFiles = this.options.acceptedMimeTypes;
        delete this.options.acceptedMimeTypes;
      }
      this.options.method = this.options.method.toUpperCase();
      if ((fallback = this.getExistingFallback()) && fallback.parentNode) {
        fallback.parentNode.removeChild(fallback);
      }
      if (this.options.previewsContainer !== false) {
        if (this.options.previewsContainer) {
          this.previewsContainer = Dropzone.getElement(this.options.previewsContainer, "previewsContainer");
        } else {
          this.previewsContainer = this.element;
        }
      }
      if (this.options.clickable) {
        if (this.options.clickable === true) {
          this.clickableElements = [this.element];
        } else {
          this.clickableElements = Dropzone.getElements(this.options.clickable, "clickable");
        }
      }
      this.init();
    }

    Dropzone.prototype.getAcceptedFiles = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.accepted) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.getRejectedFiles = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (!file.accepted) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.getFilesWithStatus = function(status) {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status === status) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.getQueuedFiles = function() {
      return this.getFilesWithStatus(Dropzone.QUEUED);
    };

    Dropzone.prototype.getUploadingFiles = function() {
      return this.getFilesWithStatus(Dropzone.UPLOADING);
    };

    Dropzone.prototype.getAddedFiles = function() {
      return this.getFilesWithStatus(Dropzone.ADDED);
    };

    Dropzone.prototype.getActiveFiles = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status === Dropzone.UPLOADING || file.status === Dropzone.QUEUED) {
          _results.push(file);
        }
      }
      return _results;
    };

    Dropzone.prototype.init = function() {
      var eventName, noPropagation, setupHiddenFileInput, _i, _len, _ref, _ref1;
      if (this.element.tagName === "form") {
        this.element.setAttribute("enctype", "multipart/form-data");
      }
      if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) {
        this.element.appendChild(Dropzone.createElement("<div class=\"dz-default dz-message\"><span>" + this.options.dictDefaultMessage + "</span></div>"));
      }
      if (this.clickableElements.length) {
        setupHiddenFileInput = (function(_this) {
          return function() {
            if (_this.hiddenFileInput) {
              _this.hiddenFileInput.parentNode.removeChild(_this.hiddenFileInput);
            }
            _this.hiddenFileInput = document.createElement("input");
            _this.hiddenFileInput.setAttribute("type", "file");
            if ((_this.options.maxFiles == null) || _this.options.maxFiles > 1) {
              _this.hiddenFileInput.setAttribute("multiple", "multiple");
            }
            _this.hiddenFileInput.className = "dz-hidden-input";
            if (_this.options.acceptedFiles != null) {
              _this.hiddenFileInput.setAttribute("accept", _this.options.acceptedFiles);
            }
            if (_this.options.capture != null) {
              _this.hiddenFileInput.setAttribute("capture", _this.options.capture);
            }
            _this.hiddenFileInput.style.visibility = "hidden";
            _this.hiddenFileInput.style.position = "absolute";
            _this.hiddenFileInput.style.top = "0";
            _this.hiddenFileInput.style.left = "0";
            _this.hiddenFileInput.style.height = "0";
            _this.hiddenFileInput.style.width = "0";
            document.querySelector(_this.options.hiddenInputContainer).appendChild(_this.hiddenFileInput);
            return _this.hiddenFileInput.addEventListener("change", function() {
              var file, files, _i, _len;
              files = _this.hiddenFileInput.files;
              if (files.length) {
                for (_i = 0, _len = files.length; _i < _len; _i++) {
                  file = files[_i];
                  _this.addFile(file);
                }
              }
              _this.emit("addedfiles", files);
              return setupHiddenFileInput();
            });
          };
        })(this);
        setupHiddenFileInput();
      }
      this.URL = (_ref = window.URL) != null ? _ref : window.webkitURL;
      _ref1 = this.events;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        eventName = _ref1[_i];
        this.on(eventName, this.options[eventName]);
      }
      this.on("uploadprogress", (function(_this) {
        return function() {
          return _this.updateTotalUploadProgress();
        };
      })(this));
      this.on("removedfile", (function(_this) {
        return function() {
          return _this.updateTotalUploadProgress();
        };
      })(this));
      this.on("canceled", (function(_this) {
        return function(file) {
          return _this.emit("complete", file);
        };
      })(this));
      this.on("complete", (function(_this) {
        return function(file) {
          if (_this.getAddedFiles().length === 0 && _this.getUploadingFiles().length === 0 && _this.getQueuedFiles().length === 0) {
            return setTimeout((function() {
              return _this.emit("queuecomplete");
            }), 0);
          }
        };
      })(this));
      noPropagation = function(e) {
        e.stopPropagation();
        if (e.preventDefault) {
          return e.preventDefault();
        } else {
          return e.returnValue = false;
        }
      };
      this.listeners = [
        {
          element: this.element,
          events: {
            "dragstart": (function(_this) {
              return function(e) {
                return _this.emit("dragstart", e);
              };
            })(this),
            "dragenter": (function(_this) {
              return function(e) {
                noPropagation(e);
                return _this.emit("dragenter", e);
              };
            })(this),
            "dragover": (function(_this) {
              return function(e) {
                var efct;
                try {
                  efct = e.dataTransfer.effectAllowed;
                } catch (_error) {}
                e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
                noPropagation(e);
                return _this.emit("dragover", e);
              };
            })(this),
            "dragleave": (function(_this) {
              return function(e) {
                return _this.emit("dragleave", e);
              };
            })(this),
            "drop": (function(_this) {
              return function(e) {
                noPropagation(e);
                return _this.drop(e);
              };
            })(this),
            "dragend": (function(_this) {
              return function(e) {
                return _this.emit("dragend", e);
              };
            })(this)
          }
        }
      ];
      this.clickableElements.forEach((function(_this) {
        return function(clickableElement) {
          return _this.listeners.push({
            element: clickableElement,
            events: {
              "click": function(evt) {
                if ((clickableElement !== _this.element) || (evt.target === _this.element || Dropzone.elementInside(evt.target, _this.element.querySelector(".dz-message")))) {
                  _this.hiddenFileInput.click();
                }
                return true;
              }
            }
          });
        };
      })(this));
      this.enable();
      return this.options.init.call(this);
    };

    Dropzone.prototype.destroy = function() {
      var _ref;
      this.disable();
      this.removeAllFiles(true);
      if ((_ref = this.hiddenFileInput) != null ? _ref.parentNode : void 0) {
        this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
        this.hiddenFileInput = null;
      }
      delete this.element.dropzone;
      return Dropzone.instances.splice(Dropzone.instances.indexOf(this), 1);
    };

    Dropzone.prototype.updateTotalUploadProgress = function() {
      var activeFiles, file, totalBytes, totalBytesSent, totalUploadProgress, _i, _len, _ref;
      totalBytesSent = 0;
      totalBytes = 0;
      activeFiles = this.getActiveFiles();
      if (activeFiles.length) {
        _ref = this.getActiveFiles();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          totalBytesSent += file.upload.bytesSent;
          totalBytes += file.upload.total;
        }
        totalUploadProgress = 100 * totalBytesSent / totalBytes;
      } else {
        totalUploadProgress = 100;
      }
      return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
    };

    Dropzone.prototype._getParamName = function(n) {
      if (typeof this.options.paramName === "function") {
        return this.options.paramName(n);
      } else {
        return "" + this.options.paramName + (this.options.uploadMultiple ? "[" + n + "]" : "");
      }
    };

    Dropzone.prototype.getFallbackForm = function() {
      var existingFallback, fields, fieldsString, form;
      if (existingFallback = this.getExistingFallback()) {
        return existingFallback;
      }
      fieldsString = "<div class=\"dz-fallback\">";
      if (this.options.dictFallbackText) {
        fieldsString += "<p>" + this.options.dictFallbackText + "</p>";
      }
      fieldsString += "<input type=\"file\" name=\"" + (this._getParamName(0)) + "\" " + (this.options.uploadMultiple ? 'multiple="multiple"' : void 0) + " /><input type=\"submit\" value=\"Upload!\"></div>";
      fields = Dropzone.createElement(fieldsString);
      if (this.element.tagName !== "FORM") {
        form = Dropzone.createElement("<form action=\"" + this.options.url + "\" enctype=\"multipart/form-data\" method=\"" + this.options.method + "\"></form>");
        form.appendChild(fields);
      } else {
        this.element.setAttribute("enctype", "multipart/form-data");
        this.element.setAttribute("method", this.options.method);
      }
      return form != null ? form : fields;
    };

    Dropzone.prototype.getExistingFallback = function() {
      var fallback, getFallback, tagName, _i, _len, _ref;
      getFallback = function(elements) {
        var el, _i, _len;
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          el = elements[_i];
          if (/(^| )fallback($| )/.test(el.className)) {
            return el;
          }
        }
      };
      _ref = ["div", "form"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tagName = _ref[_i];
        if (fallback = getFallback(this.element.getElementsByTagName(tagName))) {
          return fallback;
        }
      }
    };

    Dropzone.prototype.setupEventListeners = function() {
      var elementListeners, event, listener, _i, _len, _ref, _results;
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elementListeners = _ref[_i];
        _results.push((function() {
          var _ref1, _results1;
          _ref1 = elementListeners.events;
          _results1 = [];
          for (event in _ref1) {
            listener = _ref1[event];
            _results1.push(elementListeners.element.addEventListener(event, listener, false));
          }
          return _results1;
        })());
      }
      return _results;
    };

    Dropzone.prototype.removeEventListeners = function() {
      var elementListeners, event, listener, _i, _len, _ref, _results;
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elementListeners = _ref[_i];
        _results.push((function() {
          var _ref1, _results1;
          _ref1 = elementListeners.events;
          _results1 = [];
          for (event in _ref1) {
            listener = _ref1[event];
            _results1.push(elementListeners.element.removeEventListener(event, listener, false));
          }
          return _results1;
        })());
      }
      return _results;
    };

    Dropzone.prototype.disable = function() {
      var file, _i, _len, _ref, _results;
      this.clickableElements.forEach(function(element) {
        return element.classList.remove("dz-clickable");
      });
      this.removeEventListeners();
      _ref = this.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _results.push(this.cancelUpload(file));
      }
      return _results;
    };

    Dropzone.prototype.enable = function() {
      this.clickableElements.forEach(function(element) {
        return element.classList.add("dz-clickable");
      });
      return this.setupEventListeners();
    };

    Dropzone.prototype.filesize = function(size) {
      var cutoff, i, selectedSize, selectedUnit, unit, units, _i, _len;
      selectedSize = 0;
      selectedUnit = "b";
      if (size > 0) {
        units = ['TB', 'GB', 'MB', 'KB', 'b'];
        for (i = _i = 0, _len = units.length; _i < _len; i = ++_i) {
          unit = units[i];
          cutoff = Math.pow(this.options.filesizeBase, 4 - i) / 10;
          if (size >= cutoff) {
            selectedSize = size / Math.pow(this.options.filesizeBase, 4 - i);
            selectedUnit = unit;
            break;
          }
        }
        selectedSize = Math.round(10 * selectedSize) / 10;
      }
      return "<strong>" + selectedSize + "</strong> " + selectedUnit;
    };

    Dropzone.prototype._updateMaxFilesReachedClass = function() {
      if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
        if (this.getAcceptedFiles().length === this.options.maxFiles) {
          this.emit('maxfilesreached', this.files);
        }
        return this.element.classList.add("dz-max-files-reached");
      } else {
        return this.element.classList.remove("dz-max-files-reached");
      }
    };

    Dropzone.prototype.drop = function(e) {
      var files, items;
      if (!e.dataTransfer) {
        return;
      }
      this.emit("drop", e);
      files = e.dataTransfer.files;
      this.emit("addedfiles", files);
      if (files.length) {
        items = e.dataTransfer.items;
        if (items && items.length && (items[0].webkitGetAsEntry != null)) {
          this._addFilesFromItems(items);
        } else {
          this.handleFiles(files);
        }
      }
    };

    Dropzone.prototype.paste = function(e) {
      var items, _ref;
      if ((e != null ? (_ref = e.clipboardData) != null ? _ref.items : void 0 : void 0) == null) {
        return;
      }
      this.emit("paste", e);
      items = e.clipboardData.items;
      if (items.length) {
        return this._addFilesFromItems(items);
      }
    };

    Dropzone.prototype.handleFiles = function(files) {
      var file, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _results.push(this.addFile(file));
      }
      return _results;
    };

    Dropzone.prototype._addFilesFromItems = function(items) {
      var entry, item, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if ((item.webkitGetAsEntry != null) && (entry = item.webkitGetAsEntry())) {
          if (entry.isFile) {
            _results.push(this.addFile(item.getAsFile()));
          } else if (entry.isDirectory) {
            _results.push(this._addFilesFromDirectory(entry, entry.name));
          } else {
            _results.push(void 0);
          }
        } else if (item.getAsFile != null) {
          if ((item.kind == null) || item.kind === "file") {
            _results.push(this.addFile(item.getAsFile()));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Dropzone.prototype._addFilesFromDirectory = function(directory, path) {
      var dirReader, entriesReader;
      dirReader = directory.createReader();
      entriesReader = (function(_this) {
        return function(entries) {
          var entry, _i, _len;
          for (_i = 0, _len = entries.length; _i < _len; _i++) {
            entry = entries[_i];
            if (entry.isFile) {
              entry.file(function(file) {
                if (_this.options.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
                  return;
                }
                file.fullPath = "" + path + "/" + file.name;
                return _this.addFile(file);
              });
            } else if (entry.isDirectory) {
              _this._addFilesFromDirectory(entry, "" + path + "/" + entry.name);
            }
          }
        };
      })(this);
      return dirReader.readEntries(entriesReader, function(error) {
        return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
      });
    };

    Dropzone.prototype.accept = function(file, done) {
      if (file.size > this.options.maxFilesize * 1024 * 1024) {
        return done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
      } else if (!Dropzone.isValidFile(file, this.options.acceptedFiles)) {
        return done(this.options.dictInvalidFileType);
      } else if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
        done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
        return this.emit("maxfilesexceeded", file);
      } else {
        return this.options.accept.call(this, file, done);
      }
    };

    Dropzone.prototype.addFile = function(file) {
      file.upload = {
        progress: 0,
        total: file.size,
        bytesSent: 0
      };
      this.files.push(file);
      file.status = Dropzone.ADDED;
      this.emit("addedfile", file);
      this._enqueueThumbnail(file);
      return this.accept(file, (function(_this) {
        return function(error) {
          if (error) {
            file.accepted = false;
            _this._errorProcessing([file], error);
          } else {
            file.accepted = true;
            if (_this.options.autoQueue) {
              _this.enqueueFile(file);
            }
          }
          return _this._updateMaxFilesReachedClass();
        };
      })(this));
    };

    Dropzone.prototype.enqueueFiles = function(files) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        this.enqueueFile(file);
      }
      return null;
    };

    Dropzone.prototype.enqueueFile = function(file) {
      if (file.status === Dropzone.ADDED && file.accepted === true) {
        file.status = Dropzone.QUEUED;
        if (this.options.autoProcessQueue) {
          return setTimeout(((function(_this) {
            return function() {
              return _this.processQueue();
            };
          })(this)), 0);
        }
      } else {
        throw new Error("This file can't be queued because it has already been processed or was rejected.");
      }
    };

    Dropzone.prototype._thumbnailQueue = [];

    Dropzone.prototype._processingThumbnail = false;

    Dropzone.prototype._enqueueThumbnail = function(file) {
      if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1024 * 1024) {
        this._thumbnailQueue.push(file);
        return setTimeout(((function(_this) {
          return function() {
            return _this._processThumbnailQueue();
          };
        })(this)), 0);
      }
    };

    Dropzone.prototype._processThumbnailQueue = function() {
      if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
        return;
      }
      this._processingThumbnail = true;
      return this.createThumbnail(this._thumbnailQueue.shift(), (function(_this) {
        return function() {
          _this._processingThumbnail = false;
          return _this._processThumbnailQueue();
        };
      })(this));
    };

    Dropzone.prototype.removeFile = function(file) {
      if (file.status === Dropzone.UPLOADING) {
        this.cancelUpload(file);
      }
      this.files = without(this.files, file);
      this.emit("removedfile", file);
      if (this.files.length === 0) {
        return this.emit("reset");
      }
    };

    Dropzone.prototype.removeAllFiles = function(cancelIfNecessary) {
      var file, _i, _len, _ref;
      if (cancelIfNecessary == null) {
        cancelIfNecessary = false;
      }
      _ref = this.files.slice();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status !== Dropzone.UPLOADING || cancelIfNecessary) {
          this.removeFile(file);
        }
      }
      return null;
    };

    Dropzone.prototype.createThumbnail = function(file, callback) {
      var fileReader;
      fileReader = new FileReader;
      fileReader.onload = (function(_this) {
        return function() {
          if (file.type === "image/svg+xml") {
            _this.emit("thumbnail", file, fileReader.result);
            if (callback != null) {
              callback();
            }
            return;
          }
          return _this.createThumbnailFromUrl(file, fileReader.result, callback);
        };
      })(this);
      return fileReader.readAsDataURL(file);
    };

    Dropzone.prototype.createThumbnailFromUrl = function(file, imageUrl, callback, crossOrigin) {
      var img;
      img = document.createElement("img");
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }
      img.onload = (function(_this) {
        return function() {
          var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
          file.width = img.width;
          file.height = img.height;
          resizeInfo = _this.options.resize.call(_this, file);
          if (resizeInfo.trgWidth == null) {
            resizeInfo.trgWidth = resizeInfo.optWidth;
          }
          if (resizeInfo.trgHeight == null) {
            resizeInfo.trgHeight = resizeInfo.optHeight;
          }
          canvas = document.createElement("canvas");
          ctx = canvas.getContext("2d");
          canvas.width = resizeInfo.trgWidth;
          canvas.height = resizeInfo.trgHeight;
          drawImageIOSFix(ctx, img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
          thumbnail = canvas.toDataURL("image/png");
          _this.emit("thumbnail", file, thumbnail);
          if (callback != null) {
            return callback();
          }
        };
      })(this);
      if (callback != null) {
        img.onerror = callback;
      }
      return img.src = imageUrl;
    };

    Dropzone.prototype.processQueue = function() {
      var i, parallelUploads, processingLength, queuedFiles;
      parallelUploads = this.options.parallelUploads;
      processingLength = this.getUploadingFiles().length;
      i = processingLength;
      if (processingLength >= parallelUploads) {
        return;
      }
      queuedFiles = this.getQueuedFiles();
      if (!(queuedFiles.length > 0)) {
        return;
      }
      if (this.options.uploadMultiple) {
        return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
      } else {
        while (i < parallelUploads) {
          if (!queuedFiles.length) {
            return;
          }
          this.processFile(queuedFiles.shift());
          i++;
        }
      }
    };

    Dropzone.prototype.processFile = function(file) {
      return this.processFiles([file]);
    };

    Dropzone.prototype.processFiles = function(files) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.processing = true;
        file.status = Dropzone.UPLOADING;
        this.emit("processing", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("processingmultiple", files);
      }
      return this.uploadFiles(files);
    };

    Dropzone.prototype._getFilesWithXhr = function(xhr) {
      var file, files;
      return files = (function() {
        var _i, _len, _ref, _results;
        _ref = this.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.xhr === xhr) {
            _results.push(file);
          }
        }
        return _results;
      }).call(this);
    };

    Dropzone.prototype.cancelUpload = function(file) {
      var groupedFile, groupedFiles, _i, _j, _len, _len1, _ref;
      if (file.status === Dropzone.UPLOADING) {
        groupedFiles = this._getFilesWithXhr(file.xhr);
        for (_i = 0, _len = groupedFiles.length; _i < _len; _i++) {
          groupedFile = groupedFiles[_i];
          groupedFile.status = Dropzone.CANCELED;
        }
        file.xhr.abort();
        for (_j = 0, _len1 = groupedFiles.length; _j < _len1; _j++) {
          groupedFile = groupedFiles[_j];
          this.emit("canceled", groupedFile);
        }
        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", groupedFiles);
        }
      } else if ((_ref = file.status) === Dropzone.ADDED || _ref === Dropzone.QUEUED) {
        file.status = Dropzone.CANCELED;
        this.emit("canceled", file);
        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", [file]);
        }
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    resolveOption = function() {
      var args, option;
      option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof option === 'function') {
        return option.apply(this, args);
      }
      return option;
    };

    Dropzone.prototype.uploadFile = function(file) {
      return this.uploadFiles([file]);
    };

    Dropzone.prototype.uploadFiles = function(files) {
      var file, formData, handleError, headerName, headerValue, headers, i, input, inputName, inputType, key, method, option, progressObj, response, updateProgress, url, value, xhr, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      xhr = new XMLHttpRequest();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.xhr = xhr;
      }
      method = resolveOption(this.options.method, files);
      url = resolveOption(this.options.url, files);
      xhr.open(method, url, true);
      xhr.withCredentials = !!this.options.withCredentials;
      response = null;
      handleError = (function(_this) {
        return function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
            file = files[_j];
            _results.push(_this._errorProcessing(files, response || _this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr));
          }
          return _results;
        };
      })(this);
      updateProgress = (function(_this) {
        return function(e) {
          var allFilesFinished, progress, _j, _k, _l, _len1, _len2, _len3, _results;
          if (e != null) {
            progress = 100 * e.loaded / e.total;
            for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
              file = files[_j];
              file.upload = {
                progress: progress,
                total: e.total,
                bytesSent: e.loaded
              };
            }
          } else {
            allFilesFinished = true;
            progress = 100;
            for (_k = 0, _len2 = files.length; _k < _len2; _k++) {
              file = files[_k];
              if (!(file.upload.progress === 100 && file.upload.bytesSent === file.upload.total)) {
                allFilesFinished = false;
              }
              file.upload.progress = progress;
              file.upload.bytesSent = file.upload.total;
            }
            if (allFilesFinished) {
              return;
            }
          }
          _results = [];
          for (_l = 0, _len3 = files.length; _l < _len3; _l++) {
            file = files[_l];
            _results.push(_this.emit("uploadprogress", file, progress, file.upload.bytesSent));
          }
          return _results;
        };
      })(this);
      xhr.onload = (function(_this) {
        return function(e) {
          var _ref;
          if (files[0].status === Dropzone.CANCELED) {
            return;
          }
          if (xhr.readyState !== 4) {
            return;
          }
          response = xhr.responseText;
          if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) {
            try {
              response = JSON.parse(response);
            } catch (_error) {
              e = _error;
              response = "Invalid JSON response from server.";
            }
          }
          updateProgress();
          if (!((200 <= (_ref = xhr.status) && _ref < 300))) {
            return handleError();
          } else {
            return _this._finished(files, response, e);
          }
        };
      })(this);
      xhr.onerror = (function(_this) {
        return function() {
          if (files[0].status === Dropzone.CANCELED) {
            return;
          }
          return handleError();
        };
      })(this);
      progressObj = (_ref = xhr.upload) != null ? _ref : xhr;
      progressObj.onprogress = updateProgress;
      headers = {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"
      };
      if (this.options.headers) {
        extend(headers, this.options.headers);
      }
      for (headerName in headers) {
        headerValue = headers[headerName];
        if (headerValue) {
          xhr.setRequestHeader(headerName, headerValue);
        }
      }
      formData = new FormData();
      if (this.options.params) {
        _ref1 = this.options.params;
        for (key in _ref1) {
          value = _ref1[key];
          formData.append(key, value);
        }
      }
      for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
        file = files[_j];
        this.emit("sending", file, xhr, formData);
      }
      if (this.options.uploadMultiple) {
        this.emit("sendingmultiple", files, xhr, formData);
      }
      if (this.element.tagName === "FORM") {
        _ref2 = this.element.querySelectorAll("input, textarea, select, button");
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          input = _ref2[_k];
          inputName = input.getAttribute("name");
          inputType = input.getAttribute("type");
          if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
            _ref3 = input.options;
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              option = _ref3[_l];
              if (option.selected) {
                formData.append(inputName, option.value);
              }
            }
          } else if (!inputType || ((_ref4 = inputType.toLowerCase()) !== "checkbox" && _ref4 !== "radio") || input.checked) {
            formData.append(inputName, input.value);
          }
        }
      }
      for (i = _m = 0, _ref5 = files.length - 1; 0 <= _ref5 ? _m <= _ref5 : _m >= _ref5; i = 0 <= _ref5 ? ++_m : --_m) {
        formData.append(this._getParamName(i), files[i], files[i].name);
      }
      return this.submitRequest(xhr, formData, files);
    };

    Dropzone.prototype.submitRequest = function(xhr, formData, files) {
      return xhr.send(formData);
    };

    Dropzone.prototype._finished = function(files, responseText, e) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.status = Dropzone.SUCCESS;
        this.emit("success", file, responseText, e);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("successmultiple", files, responseText, e);
        this.emit("completemultiple", files);
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    Dropzone.prototype._errorProcessing = function(files, message, xhr) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file.status = Dropzone.ERROR;
        this.emit("error", file, message, xhr);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("errormultiple", files, message, xhr);
        this.emit("completemultiple", files);
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    return Dropzone;

  })(Emitter);

  Dropzone.version = "4.2.0";

  Dropzone.options = {};

  Dropzone.optionsForElement = function(element) {
    if (element.getAttribute("id")) {
      return Dropzone.options[camelize(element.getAttribute("id"))];
    } else {
      return void 0;
    }
  };

  Dropzone.instances = [];

  Dropzone.forElement = function(element) {
    if (typeof element === "string") {
      element = document.querySelector(element);
    }
    if ((element != null ? element.dropzone : void 0) == null) {
      throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
    }
    return element.dropzone;
  };

  Dropzone.autoDiscover = true;

  Dropzone.discover = function() {
    var checkElements, dropzone, dropzones, _i, _len, _results;
    if (document.querySelectorAll) {
      dropzones = document.querySelectorAll(".dropzone");
    } else {
      dropzones = [];
      checkElements = function(elements) {
        var el, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          el = elements[_i];
          if (/(^| )dropzone($| )/.test(el.className)) {
            _results.push(dropzones.push(el));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      checkElements(document.getElementsByTagName("div"));
      checkElements(document.getElementsByTagName("form"));
    }
    _results = [];
    for (_i = 0, _len = dropzones.length; _i < _len; _i++) {
      dropzone = dropzones[_i];
      if (Dropzone.optionsForElement(dropzone) !== false) {
        _results.push(new Dropzone(dropzone));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Dropzone.blacklistedBrowsers = [/opera.*Macintosh.*version\/12/i];

  Dropzone.isBrowserSupported = function() {
    var capableBrowser, regex, _i, _len, _ref;
    capableBrowser = true;
    if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
      if (!("classList" in document.createElement("a"))) {
        capableBrowser = false;
      } else {
        _ref = Dropzone.blacklistedBrowsers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          regex = _ref[_i];
          if (regex.test(navigator.userAgent)) {
            capableBrowser = false;
            continue;
          }
        }
      }
    } else {
      capableBrowser = false;
    }
    return capableBrowser;
  };

  without = function(list, rejectedItem) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      item = list[_i];
      if (item !== rejectedItem) {
        _results.push(item);
      }
    }
    return _results;
  };

  camelize = function(str) {
    return str.replace(/[\-_](\w)/g, function(match) {
      return match.charAt(1).toUpperCase();
    });
  };

  Dropzone.createElement = function(string) {
    var div;
    div = document.createElement("div");
    div.innerHTML = string;
    return div.childNodes[0];
  };

  Dropzone.elementInside = function(element, container) {
    if (element === container) {
      return true;
    }
    while (element = element.parentNode) {
      if (element === container) {
        return true;
      }
    }
    return false;
  };

  Dropzone.getElement = function(el, name) {
    var element;
    if (typeof el === "string") {
      element = document.querySelector(el);
    } else if (el.nodeType != null) {
      element = el;
    }
    if (element == null) {
      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector or a plain HTML element.");
    }
    return element;
  };

  Dropzone.getElements = function(els, name) {
    var e, el, elements, _i, _j, _len, _len1, _ref;
    if (els instanceof Array) {
      elements = [];
      try {
        for (_i = 0, _len = els.length; _i < _len; _i++) {
          el = els[_i];
          elements.push(this.getElement(el, name));
        }
      } catch (_error) {
        e = _error;
        elements = null;
      }
    } else if (typeof els === "string") {
      elements = [];
      _ref = document.querySelectorAll(els);
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        el = _ref[_j];
        elements.push(el);
      }
    } else if (els.nodeType != null) {
      elements = [els];
    }
    if (!((elements != null) && elements.length)) {
      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
    }
    return elements;
  };

  Dropzone.confirm = function(question, accepted, rejected) {
    if (window.confirm(question)) {
      return accepted();
    } else if (rejected != null) {
      return rejected();
    }
  };

  Dropzone.isValidFile = function(file, acceptedFiles) {
    var baseMimeType, mimeType, validType, _i, _len;
    if (!acceptedFiles) {
      return true;
    }
    acceptedFiles = acceptedFiles.split(",");
    mimeType = file.type;
    baseMimeType = mimeType.replace(/\/.*$/, "");
    for (_i = 0, _len = acceptedFiles.length; _i < _len; _i++) {
      validType = acceptedFiles[_i];
      validType = validType.trim();
      if (validType.charAt(0) === ".") {
        if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) {
          return true;
        }
      } else if (/\/\*$/.test(validType)) {
        if (baseMimeType === validType.replace(/\/.*$/, "")) {
          return true;
        }
      } else {
        if (mimeType === validType) {
          return true;
        }
      }
    }
    return false;
  };

  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.fn.dropzone = function(options) {
      return this.each(function() {
        return new Dropzone(this, options);
      });
    };
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Dropzone;
  } else {
    window.Dropzone = Dropzone;
  }

  Dropzone.ADDED = "added";

  Dropzone.QUEUED = "queued";

  Dropzone.ACCEPTED = Dropzone.QUEUED;

  Dropzone.UPLOADING = "uploading";

  Dropzone.PROCESSING = Dropzone.UPLOADING;

  Dropzone.CANCELED = "canceled";

  Dropzone.ERROR = "error";

  Dropzone.SUCCESS = "success";


  /*
  
  Bugfix for iOS 6 and 7
  Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
  based on the work of https://github.com/stomita/ios-imagefile-megapixel
   */

  detectVerticalSquash = function(img) {
    var alpha, canvas, ctx, data, ey, ih, iw, py, ratio, sy;
    iw = img.naturalWidth;
    ih = img.naturalHeight;
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = ih;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData(0, 0, 1, ih).data;
    sy = 0;
    ey = ih;
    py = ih;
    while (py > sy) {
      alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    ratio = py / ih;
    if (ratio === 0) {
      return 1;
    } else {
      return ratio;
    }
  };

  drawImageIOSFix = function(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio;
    vertSquashRatio = detectVerticalSquash(img);
    return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
  };


  /*
   * contentloaded.js
   *
   * Author: Diego Perini (diego.perini at gmail.com)
   * Summary: cross-browser wrapper for DOMContentLoaded
   * Updated: 20101020
   * License: MIT
   * Version: 1.2
   *
   * URL:
   * http://javascript.nwbox.com/ContentLoaded/
   * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
   */

  contentLoaded = function(win, fn) {
    var add, doc, done, init, poll, pre, rem, root, top;
    done = false;
    top = true;
    doc = win.document;
    root = doc.documentElement;
    add = (doc.addEventListener ? "addEventListener" : "attachEvent");
    rem = (doc.addEventListener ? "removeEventListener" : "detachEvent");
    pre = (doc.addEventListener ? "" : "on");
    init = function(e) {
      if (e.type === "readystatechange" && doc.readyState !== "complete") {
        return;
      }
      (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
      if (!done && (done = true)) {
        return fn.call(win, e.type || e);
      }
    };
    poll = function() {
      var e;
      try {
        root.doScroll("left");
      } catch (_error) {
        e = _error;
        setTimeout(poll, 50);
        return;
      }
      return init("poll");
    };
    if (doc.readyState !== "complete") {
      if (doc.createEventObject && root.doScroll) {
        try {
          top = !win.frameElement;
        } catch (_error) {}
        if (top) {
          poll();
        }
      }
      doc[add](pre + "DOMContentLoaded", init, false);
      doc[add](pre + "readystatechange", init, false);
      return win[add](pre + "load", init, false);
    }
  };

  Dropzone._autoDiscoverFunction = function() {
    if (Dropzone.autoDiscover) {
      return Dropzone.discover();
    }
  };

  contentLoaded(window, Dropzone._autoDiscoverFunction);

}).call(this);

},{}],4:[function(require,module,exports){
(function (global){
/*! http://mths.be/he v0.5.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// http://whatwg.org/html/tokenization.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// http://whatwg.org/html/tokenization.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xC1':'Aacute','\xE1':'aacute','\u0102':'Abreve','\u0103':'abreve','\u223E':'ac','\u223F':'acd','\u223E\u0333':'acE','\xC2':'Acirc','\xE2':'acirc','\xB4':'acute','\u0410':'Acy','\u0430':'acy','\xC6':'AElig','\xE6':'aelig','\u2061':'af','\uD835\uDD04':'Afr','\uD835\uDD1E':'afr','\xC0':'Agrave','\xE0':'agrave','\u2135':'aleph','\u0391':'Alpha','\u03B1':'alpha','\u0100':'Amacr','\u0101':'amacr','\u2A3F':'amalg','&':'amp','\u2A55':'andand','\u2A53':'And','\u2227':'and','\u2A5C':'andd','\u2A58':'andslope','\u2A5A':'andv','\u2220':'ang','\u29A4':'ange','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u2221':'angmsd','\u221F':'angrt','\u22BE':'angrtvb','\u299D':'angrtvbd','\u2222':'angsph','\xC5':'angst','\u237C':'angzarr','\u0104':'Aogon','\u0105':'aogon','\uD835\uDD38':'Aopf','\uD835\uDD52':'aopf','\u2A6F':'apacir','\u2248':'ap','\u2A70':'apE','\u224A':'ape','\u224B':'apid','\'':'apos','\xE5':'aring','\uD835\uDC9C':'Ascr','\uD835\uDCB6':'ascr','\u2254':'colone','*':'ast','\u224D':'CupCap','\xC3':'Atilde','\xE3':'atilde','\xC4':'Auml','\xE4':'auml','\u2233':'awconint','\u2A11':'awint','\u224C':'bcong','\u03F6':'bepsi','\u2035':'bprime','\u223D':'bsim','\u22CD':'bsime','\u2216':'setmn','\u2AE7':'Barv','\u22BD':'barvee','\u2305':'barwed','\u2306':'Barwed','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u0411':'Bcy','\u0431':'bcy','\u201E':'bdquo','\u2235':'becaus','\u29B0':'bemptyv','\u212C':'Bscr','\u0392':'Beta','\u03B2':'beta','\u2136':'beth','\u226C':'twixt','\uD835\uDD05':'Bfr','\uD835\uDD1F':'bfr','\u22C2':'xcap','\u25EF':'xcirc','\u22C3':'xcup','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A06':'xsqcup','\u2605':'starf','\u25BD':'xdtri','\u25B3':'xutri','\u2A04':'xuplus','\u22C1':'Vee','\u22C0':'Wedge','\u290D':'rbarr','\u29EB':'lozf','\u25AA':'squf','\u25B4':'utrif','\u25BE':'dtrif','\u25C2':'ltrif','\u25B8':'rtrif','\u2423':'blank','\u2592':'blk12','\u2591':'blk14','\u2593':'blk34','\u2588':'block','=\u20E5':'bne','\u2261\u20E5':'bnequiv','\u2AED':'bNot','\u2310':'bnot','\uD835\uDD39':'Bopf','\uD835\uDD53':'bopf','\u22A5':'bot','\u22C8':'bowtie','\u29C9':'boxbox','\u2510':'boxdl','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u250C':'boxdr','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2500':'boxh','\u2550':'boxH','\u252C':'boxhd','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2534':'boxhu','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u229F':'minusb','\u229E':'plusb','\u22A0':'timesb','\u2518':'boxul','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u2514':'boxur','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u2502':'boxv','\u2551':'boxV','\u253C':'boxvh','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2524':'boxvl','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u251C':'boxvr','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u02D8':'breve','\xA6':'brvbar','\uD835\uDCB7':'bscr','\u204F':'bsemi','\u29C5':'bsolb','\\':'bsol','\u27C8':'bsolhsub','\u2022':'bull','\u224E':'bump','\u2AAE':'bumpE','\u224F':'bumpe','\u0106':'Cacute','\u0107':'cacute','\u2A44':'capand','\u2A49':'capbrcup','\u2A4B':'capcap','\u2229':'cap','\u22D2':'Cap','\u2A47':'capcup','\u2A40':'capdot','\u2145':'DD','\u2229\uFE00':'caps','\u2041':'caret','\u02C7':'caron','\u212D':'Cfr','\u2A4D':'ccaps','\u010C':'Ccaron','\u010D':'ccaron','\xC7':'Ccedil','\xE7':'ccedil','\u0108':'Ccirc','\u0109':'ccirc','\u2230':'Cconint','\u2A4C':'ccups','\u2A50':'ccupssm','\u010A':'Cdot','\u010B':'cdot','\xB8':'cedil','\u29B2':'cemptyv','\xA2':'cent','\xB7':'middot','\uD835\uDD20':'cfr','\u0427':'CHcy','\u0447':'chcy','\u2713':'check','\u03A7':'Chi','\u03C7':'chi','\u02C6':'circ','\u2257':'cire','\u21BA':'olarr','\u21BB':'orarr','\u229B':'oast','\u229A':'ocir','\u229D':'odash','\u2299':'odot','\xAE':'reg','\u24C8':'oS','\u2296':'ominus','\u2295':'oplus','\u2297':'otimes','\u25CB':'cir','\u29C3':'cirE','\u2A10':'cirfnint','\u2AEF':'cirmid','\u29C2':'cirscir','\u2232':'cwconint','\u201D':'rdquo','\u2019':'rsquo','\u2663':'clubs',':':'colon','\u2237':'Colon','\u2A74':'Colone',',':'comma','@':'commat','\u2201':'comp','\u2218':'compfn','\u2102':'Copf','\u2245':'cong','\u2A6D':'congdot','\u2261':'equiv','\u222E':'oint','\u222F':'Conint','\uD835\uDD54':'copf','\u2210':'coprod','\xA9':'copy','\u2117':'copysr','\u21B5':'crarr','\u2717':'cross','\u2A2F':'Cross','\uD835\uDC9E':'Cscr','\uD835\uDCB8':'cscr','\u2ACF':'csub','\u2AD1':'csube','\u2AD0':'csup','\u2AD2':'csupe','\u22EF':'ctdot','\u2938':'cudarrl','\u2935':'cudarrr','\u22DE':'cuepr','\u22DF':'cuesc','\u21B6':'cularr','\u293D':'cularrp','\u2A48':'cupbrcap','\u2A46':'cupcap','\u222A':'cup','\u22D3':'Cup','\u2A4A':'cupcup','\u228D':'cupdot','\u2A45':'cupor','\u222A\uFE00':'cups','\u21B7':'curarr','\u293C':'curarrm','\u22CE':'cuvee','\u22CF':'cuwed','\xA4':'curren','\u2231':'cwint','\u232D':'cylcty','\u2020':'dagger','\u2021':'Dagger','\u2138':'daleth','\u2193':'darr','\u21A1':'Darr','\u21D3':'dArr','\u2010':'dash','\u2AE4':'Dashv','\u22A3':'dashv','\u290F':'rBarr','\u02DD':'dblac','\u010E':'Dcaron','\u010F':'dcaron','\u0414':'Dcy','\u0434':'dcy','\u21CA':'ddarr','\u2146':'dd','\u2911':'DDotrahd','\u2A77':'eDDot','\xB0':'deg','\u2207':'Del','\u0394':'Delta','\u03B4':'delta','\u29B1':'demptyv','\u297F':'dfisht','\uD835\uDD07':'Dfr','\uD835\uDD21':'dfr','\u2965':'dHar','\u21C3':'dharl','\u21C2':'dharr','\u02D9':'dot','`':'grave','\u02DC':'tilde','\u22C4':'diam','\u2666':'diams','\xA8':'die','\u03DD':'gammad','\u22F2':'disin','\xF7':'div','\u22C7':'divonx','\u0402':'DJcy','\u0452':'djcy','\u231E':'dlcorn','\u230D':'dlcrop','$':'dollar','\uD835\uDD3B':'Dopf','\uD835\uDD55':'dopf','\u20DC':'DotDot','\u2250':'doteq','\u2251':'eDot','\u2238':'minusd','\u2214':'plusdo','\u22A1':'sdotb','\u21D0':'lArr','\u21D4':'iff','\u27F8':'xlArr','\u27FA':'xhArr','\u27F9':'xrArr','\u21D2':'rArr','\u22A8':'vDash','\u21D1':'uArr','\u21D5':'vArr','\u2225':'par','\u2913':'DownArrowBar','\u21F5':'duarr','\u0311':'DownBreve','\u2950':'DownLeftRightVector','\u295E':'DownLeftTeeVector','\u2956':'DownLeftVectorBar','\u21BD':'lhard','\u295F':'DownRightTeeVector','\u2957':'DownRightVectorBar','\u21C1':'rhard','\u21A7':'mapstodown','\u22A4':'top','\u2910':'RBarr','\u231F':'drcorn','\u230C':'drcrop','\uD835\uDC9F':'Dscr','\uD835\uDCB9':'dscr','\u0405':'DScy','\u0455':'dscy','\u29F6':'dsol','\u0110':'Dstrok','\u0111':'dstrok','\u22F1':'dtdot','\u25BF':'dtri','\u296F':'duhar','\u29A6':'dwangle','\u040F':'DZcy','\u045F':'dzcy','\u27FF':'dzigrarr','\xC9':'Eacute','\xE9':'eacute','\u2A6E':'easter','\u011A':'Ecaron','\u011B':'ecaron','\xCA':'Ecirc','\xEA':'ecirc','\u2256':'ecir','\u2255':'ecolon','\u042D':'Ecy','\u044D':'ecy','\u0116':'Edot','\u0117':'edot','\u2147':'ee','\u2252':'efDot','\uD835\uDD08':'Efr','\uD835\uDD22':'efr','\u2A9A':'eg','\xC8':'Egrave','\xE8':'egrave','\u2A96':'egs','\u2A98':'egsdot','\u2A99':'el','\u2208':'in','\u23E7':'elinters','\u2113':'ell','\u2A95':'els','\u2A97':'elsdot','\u0112':'Emacr','\u0113':'emacr','\u2205':'empty','\u25FB':'EmptySmallSquare','\u25AB':'EmptyVerySmallSquare','\u2004':'emsp13','\u2005':'emsp14','\u2003':'emsp','\u014A':'ENG','\u014B':'eng','\u2002':'ensp','\u0118':'Eogon','\u0119':'eogon','\uD835\uDD3C':'Eopf','\uD835\uDD56':'eopf','\u22D5':'epar','\u29E3':'eparsl','\u2A71':'eplus','\u03B5':'epsi','\u0395':'Epsilon','\u03F5':'epsiv','\u2242':'esim','\u2A75':'Equal','=':'equals','\u225F':'equest','\u21CC':'rlhar','\u2A78':'equivDD','\u29E5':'eqvparsl','\u2971':'erarr','\u2253':'erDot','\u212F':'escr','\u2130':'Escr','\u2A73':'Esim','\u0397':'Eta','\u03B7':'eta','\xD0':'ETH','\xF0':'eth','\xCB':'Euml','\xEB':'euml','\u20AC':'euro','!':'excl','\u2203':'exist','\u0424':'Fcy','\u0444':'fcy','\u2640':'female','\uFB03':'ffilig','\uFB00':'fflig','\uFB04':'ffllig','\uD835\uDD09':'Ffr','\uD835\uDD23':'ffr','\uFB01':'filig','\u25FC':'FilledSmallSquare','fj':'fjlig','\u266D':'flat','\uFB02':'fllig','\u25B1':'fltns','\u0192':'fnof','\uD835\uDD3D':'Fopf','\uD835\uDD57':'fopf','\u2200':'forall','\u22D4':'fork','\u2AD9':'forkv','\u2131':'Fscr','\u2A0D':'fpartint','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\u2154':'frac23','\u2156':'frac25','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\u2044':'frasl','\u2322':'frown','\uD835\uDCBB':'fscr','\u01F5':'gacute','\u0393':'Gamma','\u03B3':'gamma','\u03DC':'Gammad','\u2A86':'gap','\u011E':'Gbreve','\u011F':'gbreve','\u0122':'Gcedil','\u011C':'Gcirc','\u011D':'gcirc','\u0413':'Gcy','\u0433':'gcy','\u0120':'Gdot','\u0121':'gdot','\u2265':'ge','\u2267':'gE','\u2A8C':'gEl','\u22DB':'gel','\u2A7E':'ges','\u2AA9':'gescc','\u2A80':'gesdot','\u2A82':'gesdoto','\u2A84':'gesdotol','\u22DB\uFE00':'gesl','\u2A94':'gesles','\uD835\uDD0A':'Gfr','\uD835\uDD24':'gfr','\u226B':'gg','\u22D9':'Gg','\u2137':'gimel','\u0403':'GJcy','\u0453':'gjcy','\u2AA5':'gla','\u2277':'gl','\u2A92':'glE','\u2AA4':'glj','\u2A8A':'gnap','\u2A88':'gne','\u2269':'gnE','\u22E7':'gnsim','\uD835\uDD3E':'Gopf','\uD835\uDD58':'gopf','\u2AA2':'GreaterGreater','\u2273':'gsim','\uD835\uDCA2':'Gscr','\u210A':'gscr','\u2A8E':'gsime','\u2A90':'gsiml','\u2AA7':'gtcc','\u2A7A':'gtcir','>':'gt','\u22D7':'gtdot','\u2995':'gtlPar','\u2A7C':'gtquest','\u2978':'gtrarr','\u2269\uFE00':'gvnE','\u200A':'hairsp','\u210B':'Hscr','\u042A':'HARDcy','\u044A':'hardcy','\u2948':'harrcir','\u2194':'harr','\u21AD':'harrw','^':'Hat','\u210F':'hbar','\u0124':'Hcirc','\u0125':'hcirc','\u2665':'hearts','\u2026':'mldr','\u22B9':'hercon','\uD835\uDD25':'hfr','\u210C':'Hfr','\u2925':'searhk','\u2926':'swarhk','\u21FF':'hoarr','\u223B':'homtht','\u21A9':'larrhk','\u21AA':'rarrhk','\uD835\uDD59':'hopf','\u210D':'Hopf','\u2015':'horbar','\uD835\uDCBD':'hscr','\u0126':'Hstrok','\u0127':'hstrok','\u2043':'hybull','\xCD':'Iacute','\xED':'iacute','\u2063':'ic','\xCE':'Icirc','\xEE':'icirc','\u0418':'Icy','\u0438':'icy','\u0130':'Idot','\u0415':'IEcy','\u0435':'iecy','\xA1':'iexcl','\uD835\uDD26':'ifr','\u2111':'Im','\xCC':'Igrave','\xEC':'igrave','\u2148':'ii','\u2A0C':'qint','\u222D':'tint','\u29DC':'iinfin','\u2129':'iiota','\u0132':'IJlig','\u0133':'ijlig','\u012A':'Imacr','\u012B':'imacr','\u2110':'Iscr','\u0131':'imath','\u22B7':'imof','\u01B5':'imped','\u2105':'incare','\u221E':'infin','\u29DD':'infintie','\u22BA':'intcal','\u222B':'int','\u222C':'Int','\u2124':'Zopf','\u2A17':'intlarhk','\u2A3C':'iprod','\u2062':'it','\u0401':'IOcy','\u0451':'iocy','\u012E':'Iogon','\u012F':'iogon','\uD835\uDD40':'Iopf','\uD835\uDD5A':'iopf','\u0399':'Iota','\u03B9':'iota','\xBF':'iquest','\uD835\uDCBE':'iscr','\u22F5':'isindot','\u22F9':'isinE','\u22F4':'isins','\u22F3':'isinsv','\u0128':'Itilde','\u0129':'itilde','\u0406':'Iukcy','\u0456':'iukcy','\xCF':'Iuml','\xEF':'iuml','\u0134':'Jcirc','\u0135':'jcirc','\u0419':'Jcy','\u0439':'jcy','\uD835\uDD0D':'Jfr','\uD835\uDD27':'jfr','\u0237':'jmath','\uD835\uDD41':'Jopf','\uD835\uDD5B':'jopf','\uD835\uDCA5':'Jscr','\uD835\uDCBF':'jscr','\u0408':'Jsercy','\u0458':'jsercy','\u0404':'Jukcy','\u0454':'jukcy','\u039A':'Kappa','\u03BA':'kappa','\u03F0':'kappav','\u0136':'Kcedil','\u0137':'kcedil','\u041A':'Kcy','\u043A':'kcy','\uD835\uDD0E':'Kfr','\uD835\uDD28':'kfr','\u0138':'kgreen','\u0425':'KHcy','\u0445':'khcy','\u040C':'KJcy','\u045C':'kjcy','\uD835\uDD42':'Kopf','\uD835\uDD5C':'kopf','\uD835\uDCA6':'Kscr','\uD835\uDCC0':'kscr','\u21DA':'lAarr','\u0139':'Lacute','\u013A':'lacute','\u29B4':'laemptyv','\u2112':'Lscr','\u039B':'Lambda','\u03BB':'lambda','\u27E8':'lang','\u27EA':'Lang','\u2991':'langd','\u2A85':'lap','\xAB':'laquo','\u21E4':'larrb','\u291F':'larrbfs','\u2190':'larr','\u219E':'Larr','\u291D':'larrfs','\u21AB':'larrlp','\u2939':'larrpl','\u2973':'larrsim','\u21A2':'larrtl','\u2919':'latail','\u291B':'lAtail','\u2AAB':'lat','\u2AAD':'late','\u2AAD\uFE00':'lates','\u290C':'lbarr','\u290E':'lBarr','\u2772':'lbbrk','{':'lcub','[':'lsqb','\u298B':'lbrke','\u298F':'lbrksld','\u298D':'lbrkslu','\u013D':'Lcaron','\u013E':'lcaron','\u013B':'Lcedil','\u013C':'lcedil','\u2308':'lceil','\u041B':'Lcy','\u043B':'lcy','\u2936':'ldca','\u201C':'ldquo','\u2967':'ldrdhar','\u294B':'ldrushar','\u21B2':'ldsh','\u2264':'le','\u2266':'lE','\u21C6':'lrarr','\u27E6':'lobrk','\u2961':'LeftDownTeeVector','\u2959':'LeftDownVectorBar','\u230A':'lfloor','\u21BC':'lharu','\u21C7':'llarr','\u21CB':'lrhar','\u294E':'LeftRightVector','\u21A4':'mapstoleft','\u295A':'LeftTeeVector','\u22CB':'lthree','\u29CF':'LeftTriangleBar','\u22B2':'vltri','\u22B4':'ltrie','\u2951':'LeftUpDownVector','\u2960':'LeftUpTeeVector','\u2958':'LeftUpVectorBar','\u21BF':'uharl','\u2952':'LeftVectorBar','\u2A8B':'lEg','\u22DA':'leg','\u2A7D':'les','\u2AA8':'lescc','\u2A7F':'lesdot','\u2A81':'lesdoto','\u2A83':'lesdotor','\u22DA\uFE00':'lesg','\u2A93':'lesges','\u22D6':'ltdot','\u2276':'lg','\u2AA1':'LessLess','\u2272':'lsim','\u297C':'lfisht','\uD835\uDD0F':'Lfr','\uD835\uDD29':'lfr','\u2A91':'lgE','\u2962':'lHar','\u296A':'lharul','\u2584':'lhblk','\u0409':'LJcy','\u0459':'ljcy','\u226A':'ll','\u22D8':'Ll','\u296B':'llhard','\u25FA':'lltri','\u013F':'Lmidot','\u0140':'lmidot','\u23B0':'lmoust','\u2A89':'lnap','\u2A87':'lne','\u2268':'lnE','\u22E6':'lnsim','\u27EC':'loang','\u21FD':'loarr','\u27F5':'xlarr','\u27F7':'xharr','\u27FC':'xmap','\u27F6':'xrarr','\u21AC':'rarrlp','\u2985':'lopar','\uD835\uDD43':'Lopf','\uD835\uDD5D':'lopf','\u2A2D':'loplus','\u2A34':'lotimes','\u2217':'lowast','_':'lowbar','\u2199':'swarr','\u2198':'searr','\u25CA':'loz','(':'lpar','\u2993':'lparlt','\u296D':'lrhard','\u200E':'lrm','\u22BF':'lrtri','\u2039':'lsaquo','\uD835\uDCC1':'lscr','\u21B0':'lsh','\u2A8D':'lsime','\u2A8F':'lsimg','\u2018':'lsquo','\u201A':'sbquo','\u0141':'Lstrok','\u0142':'lstrok','\u2AA6':'ltcc','\u2A79':'ltcir','<':'lt','\u22C9':'ltimes','\u2976':'ltlarr','\u2A7B':'ltquest','\u25C3':'ltri','\u2996':'ltrPar','\u294A':'lurdshar','\u2966':'luruhar','\u2268\uFE00':'lvnE','\xAF':'macr','\u2642':'male','\u2720':'malt','\u2905':'Map','\u21A6':'map','\u21A5':'mapstoup','\u25AE':'marker','\u2A29':'mcomma','\u041C':'Mcy','\u043C':'mcy','\u2014':'mdash','\u223A':'mDDot','\u205F':'MediumSpace','\u2133':'Mscr','\uD835\uDD10':'Mfr','\uD835\uDD2A':'mfr','\u2127':'mho','\xB5':'micro','\u2AF0':'midcir','\u2223':'mid','\u2212':'minus','\u2A2A':'minusdu','\u2213':'mp','\u2ADB':'mlcp','\u22A7':'models','\uD835\uDD44':'Mopf','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\u039C':'Mu','\u03BC':'mu','\u22B8':'mumap','\u0143':'Nacute','\u0144':'nacute','\u2220\u20D2':'nang','\u2249':'nap','\u2A70\u0338':'napE','\u224B\u0338':'napid','\u0149':'napos','\u266E':'natur','\u2115':'Nopf','\xA0':'nbsp','\u224E\u0338':'nbump','\u224F\u0338':'nbumpe','\u2A43':'ncap','\u0147':'Ncaron','\u0148':'ncaron','\u0145':'Ncedil','\u0146':'ncedil','\u2247':'ncong','\u2A6D\u0338':'ncongdot','\u2A42':'ncup','\u041D':'Ncy','\u043D':'ncy','\u2013':'ndash','\u2924':'nearhk','\u2197':'nearr','\u21D7':'neArr','\u2260':'ne','\u2250\u0338':'nedot','\u200B':'ZeroWidthSpace','\u2262':'nequiv','\u2928':'toea','\u2242\u0338':'nesim','\n':'NewLine','\u2204':'nexist','\uD835\uDD11':'Nfr','\uD835\uDD2B':'nfr','\u2267\u0338':'ngE','\u2271':'nge','\u2A7E\u0338':'nges','\u22D9\u0338':'nGg','\u2275':'ngsim','\u226B\u20D2':'nGt','\u226F':'ngt','\u226B\u0338':'nGtv','\u21AE':'nharr','\u21CE':'nhArr','\u2AF2':'nhpar','\u220B':'ni','\u22FC':'nis','\u22FA':'nisd','\u040A':'NJcy','\u045A':'njcy','\u219A':'nlarr','\u21CD':'nlArr','\u2025':'nldr','\u2266\u0338':'nlE','\u2270':'nle','\u2A7D\u0338':'nles','\u226E':'nlt','\u22D8\u0338':'nLl','\u2274':'nlsim','\u226A\u20D2':'nLt','\u22EA':'nltri','\u22EC':'nltrie','\u226A\u0338':'nLtv','\u2224':'nmid','\u2060':'NoBreak','\uD835\uDD5F':'nopf','\u2AEC':'Not','\xAC':'not','\u226D':'NotCupCap','\u2226':'npar','\u2209':'notin','\u2279':'ntgl','\u22F5\u0338':'notindot','\u22F9\u0338':'notinE','\u22F7':'notinvb','\u22F6':'notinvc','\u29CF\u0338':'NotLeftTriangleBar','\u2278':'ntlg','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA1\u0338':'NotNestedLessLess','\u220C':'notni','\u22FE':'notnivb','\u22FD':'notnivc','\u2280':'npr','\u2AAF\u0338':'npre','\u22E0':'nprcue','\u29D0\u0338':'NotRightTriangleBar','\u22EB':'nrtri','\u22ED':'nrtrie','\u228F\u0338':'NotSquareSubset','\u22E2':'nsqsube','\u2290\u0338':'NotSquareSuperset','\u22E3':'nsqsupe','\u2282\u20D2':'vnsub','\u2288':'nsube','\u2281':'nsc','\u2AB0\u0338':'nsce','\u22E1':'nsccue','\u227F\u0338':'NotSucceedsTilde','\u2283\u20D2':'vnsup','\u2289':'nsupe','\u2241':'nsim','\u2244':'nsime','\u2AFD\u20E5':'nparsl','\u2202\u0338':'npart','\u2A14':'npolint','\u2933\u0338':'nrarrc','\u219B':'nrarr','\u21CF':'nrArr','\u219D\u0338':'nrarrw','\uD835\uDCA9':'Nscr','\uD835\uDCC3':'nscr','\u2284':'nsub','\u2AC5\u0338':'nsubE','\u2285':'nsup','\u2AC6\u0338':'nsupE','\xD1':'Ntilde','\xF1':'ntilde','\u039D':'Nu','\u03BD':'nu','#':'num','\u2116':'numero','\u2007':'numsp','\u224D\u20D2':'nvap','\u22AC':'nvdash','\u22AD':'nvDash','\u22AE':'nVdash','\u22AF':'nVDash','\u2265\u20D2':'nvge','>\u20D2':'nvgt','\u2904':'nvHarr','\u29DE':'nvinfin','\u2902':'nvlArr','\u2264\u20D2':'nvle','<\u20D2':'nvlt','\u22B4\u20D2':'nvltrie','\u2903':'nvrArr','\u22B5\u20D2':'nvrtrie','\u223C\u20D2':'nvsim','\u2923':'nwarhk','\u2196':'nwarr','\u21D6':'nwArr','\u2927':'nwnear','\xD3':'Oacute','\xF3':'oacute','\xD4':'Ocirc','\xF4':'ocirc','\u041E':'Ocy','\u043E':'ocy','\u0150':'Odblac','\u0151':'odblac','\u2A38':'odiv','\u29BC':'odsold','\u0152':'OElig','\u0153':'oelig','\u29BF':'ofcir','\uD835\uDD12':'Ofr','\uD835\uDD2C':'ofr','\u02DB':'ogon','\xD2':'Ograve','\xF2':'ograve','\u29C1':'ogt','\u29B5':'ohbar','\u03A9':'ohm','\u29BE':'olcir','\u29BB':'olcross','\u203E':'oline','\u29C0':'olt','\u014C':'Omacr','\u014D':'omacr','\u03C9':'omega','\u039F':'Omicron','\u03BF':'omicron','\u29B6':'omid','\uD835\uDD46':'Oopf','\uD835\uDD60':'oopf','\u29B7':'opar','\u29B9':'operp','\u2A54':'Or','\u2228':'or','\u2A5D':'ord','\u2134':'oscr','\xAA':'ordf','\xBA':'ordm','\u22B6':'origof','\u2A56':'oror','\u2A57':'orslope','\u2A5B':'orv','\uD835\uDCAA':'Oscr','\xD8':'Oslash','\xF8':'oslash','\u2298':'osol','\xD5':'Otilde','\xF5':'otilde','\u2A36':'otimesas','\u2A37':'Otimes','\xD6':'Ouml','\xF6':'ouml','\u233D':'ovbar','\u23DE':'OverBrace','\u23B4':'tbrk','\u23DC':'OverParenthesis','\xB6':'para','\u2AF3':'parsim','\u2AFD':'parsl','\u2202':'part','\u041F':'Pcy','\u043F':'pcy','%':'percnt','.':'period','\u2030':'permil','\u2031':'pertenk','\uD835\uDD13':'Pfr','\uD835\uDD2D':'pfr','\u03A6':'Phi','\u03C6':'phi','\u03D5':'phiv','\u260E':'phone','\u03A0':'Pi','\u03C0':'pi','\u03D6':'piv','\u210E':'planckh','\u2A23':'plusacir','\u2A22':'pluscir','+':'plus','\u2A25':'plusdu','\u2A72':'pluse','\xB1':'pm','\u2A26':'plussim','\u2A27':'plustwo','\u2A15':'pointint','\uD835\uDD61':'popf','\u2119':'Popf','\xA3':'pound','\u2AB7':'prap','\u2ABB':'Pr','\u227A':'pr','\u227C':'prcue','\u2AAF':'pre','\u227E':'prsim','\u2AB9':'prnap','\u2AB5':'prnE','\u22E8':'prnsim','\u2AB3':'prE','\u2032':'prime','\u2033':'Prime','\u220F':'prod','\u232E':'profalar','\u2312':'profline','\u2313':'profsurf','\u221D':'prop','\u22B0':'prurel','\uD835\uDCAB':'Pscr','\uD835\uDCC5':'pscr','\u03A8':'Psi','\u03C8':'psi','\u2008':'puncsp','\uD835\uDD14':'Qfr','\uD835\uDD2E':'qfr','\uD835\uDD62':'qopf','\u211A':'Qopf','\u2057':'qprime','\uD835\uDCAC':'Qscr','\uD835\uDCC6':'qscr','\u2A16':'quatint','?':'quest','"':'quot','\u21DB':'rAarr','\u223D\u0331':'race','\u0154':'Racute','\u0155':'racute','\u221A':'Sqrt','\u29B3':'raemptyv','\u27E9':'rang','\u27EB':'Rang','\u2992':'rangd','\u29A5':'range','\xBB':'raquo','\u2975':'rarrap','\u21E5':'rarrb','\u2920':'rarrbfs','\u2933':'rarrc','\u2192':'rarr','\u21A0':'Rarr','\u291E':'rarrfs','\u2945':'rarrpl','\u2974':'rarrsim','\u2916':'Rarrtl','\u21A3':'rarrtl','\u219D':'rarrw','\u291A':'ratail','\u291C':'rAtail','\u2236':'ratio','\u2773':'rbbrk','}':'rcub',']':'rsqb','\u298C':'rbrke','\u298E':'rbrksld','\u2990':'rbrkslu','\u0158':'Rcaron','\u0159':'rcaron','\u0156':'Rcedil','\u0157':'rcedil','\u2309':'rceil','\u0420':'Rcy','\u0440':'rcy','\u2937':'rdca','\u2969':'rdldhar','\u21B3':'rdsh','\u211C':'Re','\u211B':'Rscr','\u211D':'Ropf','\u25AD':'rect','\u297D':'rfisht','\u230B':'rfloor','\uD835\uDD2F':'rfr','\u2964':'rHar','\u21C0':'rharu','\u296C':'rharul','\u03A1':'Rho','\u03C1':'rho','\u03F1':'rhov','\u21C4':'rlarr','\u27E7':'robrk','\u295D':'RightDownTeeVector','\u2955':'RightDownVectorBar','\u21C9':'rrarr','\u22A2':'vdash','\u295B':'RightTeeVector','\u22CC':'rthree','\u29D0':'RightTriangleBar','\u22B3':'vrtri','\u22B5':'rtrie','\u294F':'RightUpDownVector','\u295C':'RightUpTeeVector','\u2954':'RightUpVectorBar','\u21BE':'uharr','\u2953':'RightVectorBar','\u02DA':'ring','\u200F':'rlm','\u23B1':'rmoust','\u2AEE':'rnmid','\u27ED':'roang','\u21FE':'roarr','\u2986':'ropar','\uD835\uDD63':'ropf','\u2A2E':'roplus','\u2A35':'rotimes','\u2970':'RoundImplies',')':'rpar','\u2994':'rpargt','\u2A12':'rppolint','\u203A':'rsaquo','\uD835\uDCC7':'rscr','\u21B1':'rsh','\u22CA':'rtimes','\u25B9':'rtri','\u29CE':'rtriltri','\u29F4':'RuleDelayed','\u2968':'ruluhar','\u211E':'rx','\u015A':'Sacute','\u015B':'sacute','\u2AB8':'scap','\u0160':'Scaron','\u0161':'scaron','\u2ABC':'Sc','\u227B':'sc','\u227D':'sccue','\u2AB0':'sce','\u2AB4':'scE','\u015E':'Scedil','\u015F':'scedil','\u015C':'Scirc','\u015D':'scirc','\u2ABA':'scnap','\u2AB6':'scnE','\u22E9':'scnsim','\u2A13':'scpolint','\u227F':'scsim','\u0421':'Scy','\u0441':'scy','\u22C5':'sdot','\u2A66':'sdote','\u21D8':'seArr','\xA7':'sect',';':'semi','\u2929':'tosa','\u2736':'sext','\uD835\uDD16':'Sfr','\uD835\uDD30':'sfr','\u266F':'sharp','\u0429':'SHCHcy','\u0449':'shchcy','\u0428':'SHcy','\u0448':'shcy','\u2191':'uarr','\xAD':'shy','\u03A3':'Sigma','\u03C3':'sigma','\u03C2':'sigmaf','\u223C':'sim','\u2A6A':'simdot','\u2243':'sime','\u2A9E':'simg','\u2AA0':'simgE','\u2A9D':'siml','\u2A9F':'simlE','\u2246':'simne','\u2A24':'simplus','\u2972':'simrarr','\u2A33':'smashp','\u29E4':'smeparsl','\u2323':'smile','\u2AAA':'smt','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u042C':'SOFTcy','\u044C':'softcy','\u233F':'solbar','\u29C4':'solb','/':'sol','\uD835\uDD4A':'Sopf','\uD835\uDD64':'sopf','\u2660':'spades','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u228F':'sqsub','\u2291':'sqsube','\u2290':'sqsup','\u2292':'sqsupe','\u25A1':'squ','\uD835\uDCAE':'Sscr','\uD835\uDCC8':'sscr','\u22C6':'Star','\u2606':'star','\u2282':'sub','\u22D0':'Sub','\u2ABD':'subdot','\u2AC5':'subE','\u2286':'sube','\u2AC3':'subedot','\u2AC1':'submult','\u2ACB':'subnE','\u228A':'subne','\u2ABF':'subplus','\u2979':'subrarr','\u2AC7':'subsim','\u2AD5':'subsub','\u2AD3':'subsup','\u2211':'sum','\u266A':'sung','\xB9':'sup1','\xB2':'sup2','\xB3':'sup3','\u2283':'sup','\u22D1':'Sup','\u2ABE':'supdot','\u2AD8':'supdsub','\u2AC6':'supE','\u2287':'supe','\u2AC4':'supedot','\u27C9':'suphsol','\u2AD7':'suphsub','\u297B':'suplarr','\u2AC2':'supmult','\u2ACC':'supnE','\u228B':'supne','\u2AC0':'supplus','\u2AC8':'supsim','\u2AD4':'supsub','\u2AD6':'supsup','\u21D9':'swArr','\u292A':'swnwar','\xDF':'szlig','\t':'Tab','\u2316':'target','\u03A4':'Tau','\u03C4':'tau','\u0164':'Tcaron','\u0165':'tcaron','\u0162':'Tcedil','\u0163':'tcedil','\u0422':'Tcy','\u0442':'tcy','\u20DB':'tdot','\u2315':'telrec','\uD835\uDD17':'Tfr','\uD835\uDD31':'tfr','\u2234':'there4','\u0398':'Theta','\u03B8':'theta','\u03D1':'thetav','\u205F\u200A':'ThickSpace','\u2009':'thinsp','\xDE':'THORN','\xFE':'thorn','\u2A31':'timesbar','\xD7':'times','\u2A30':'timesd','\u2336':'topbot','\u2AF1':'topcir','\uD835\uDD4B':'Topf','\uD835\uDD65':'topf','\u2ADA':'topfork','\u2034':'tprime','\u2122':'trade','\u25B5':'utri','\u225C':'trie','\u25EC':'tridot','\u2A3A':'triminus','\u2A39':'triplus','\u29CD':'trisb','\u2A3B':'tritime','\u23E2':'trpezium','\uD835\uDCAF':'Tscr','\uD835\uDCC9':'tscr','\u0426':'TScy','\u0446':'tscy','\u040B':'TSHcy','\u045B':'tshcy','\u0166':'Tstrok','\u0167':'tstrok','\xDA':'Uacute','\xFA':'uacute','\u219F':'Uarr','\u2949':'Uarrocir','\u040E':'Ubrcy','\u045E':'ubrcy','\u016C':'Ubreve','\u016D':'ubreve','\xDB':'Ucirc','\xFB':'ucirc','\u0423':'Ucy','\u0443':'ucy','\u21C5':'udarr','\u0170':'Udblac','\u0171':'udblac','\u296E':'udhar','\u297E':'ufisht','\uD835\uDD18':'Ufr','\uD835\uDD32':'ufr','\xD9':'Ugrave','\xF9':'ugrave','\u2963':'uHar','\u2580':'uhblk','\u231C':'ulcorn','\u230F':'ulcrop','\u25F8':'ultri','\u016A':'Umacr','\u016B':'umacr','\u23DF':'UnderBrace','\u23DD':'UnderParenthesis','\u228E':'uplus','\u0172':'Uogon','\u0173':'uogon','\uD835\uDD4C':'Uopf','\uD835\uDD66':'uopf','\u2912':'UpArrowBar','\u2195':'varr','\u03C5':'upsi','\u03D2':'Upsi','\u03A5':'Upsilon','\u21C8':'uuarr','\u231D':'urcorn','\u230E':'urcrop','\u016E':'Uring','\u016F':'uring','\u25F9':'urtri','\uD835\uDCB0':'Uscr','\uD835\uDCCA':'uscr','\u22F0':'utdot','\u0168':'Utilde','\u0169':'utilde','\xDC':'Uuml','\xFC':'uuml','\u29A7':'uwangle','\u299C':'vangrt','\u228A\uFE00':'vsubne','\u2ACB\uFE00':'vsubnE','\u228B\uFE00':'vsupne','\u2ACC\uFE00':'vsupnE','\u2AE8':'vBar','\u2AEB':'Vbar','\u2AE9':'vBarv','\u0412':'Vcy','\u0432':'vcy','\u22A9':'Vdash','\u22AB':'VDash','\u2AE6':'Vdashl','\u22BB':'veebar','\u225A':'veeeq','\u22EE':'vellip','|':'vert','\u2016':'Vert','\u2758':'VerticalSeparator','\u2240':'wr','\uD835\uDD19':'Vfr','\uD835\uDD33':'vfr','\uD835\uDD4D':'Vopf','\uD835\uDD67':'vopf','\uD835\uDCB1':'Vscr','\uD835\uDCCB':'vscr','\u22AA':'Vvdash','\u299A':'vzigzag','\u0174':'Wcirc','\u0175':'wcirc','\u2A5F':'wedbar','\u2259':'wedgeq','\u2118':'wp','\uD835\uDD1A':'Wfr','\uD835\uDD34':'wfr','\uD835\uDD4E':'Wopf','\uD835\uDD68':'wopf','\uD835\uDCB2':'Wscr','\uD835\uDCCC':'wscr','\uD835\uDD1B':'Xfr','\uD835\uDD35':'xfr','\u039E':'Xi','\u03BE':'xi','\u22FB':'xnis','\uD835\uDD4F':'Xopf','\uD835\uDD69':'xopf','\uD835\uDCB3':'Xscr','\uD835\uDCCD':'xscr','\xDD':'Yacute','\xFD':'yacute','\u042F':'YAcy','\u044F':'yacy','\u0176':'Ycirc','\u0177':'ycirc','\u042B':'Ycy','\u044B':'ycy','\xA5':'yen','\uD835\uDD1C':'Yfr','\uD835\uDD36':'yfr','\u0407':'YIcy','\u0457':'yicy','\uD835\uDD50':'Yopf','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDCCE':'yscr','\u042E':'YUcy','\u044E':'yucy','\xFF':'yuml','\u0178':'Yuml','\u0179':'Zacute','\u017A':'zacute','\u017D':'Zcaron','\u017E':'zcaron','\u0417':'Zcy','\u0437':'zcy','\u017B':'Zdot','\u017C':'zdot','\u2128':'Zfr','\u0396':'Zeta','\u03B6':'zeta','\uD835\uDD37':'zfr','\u0416':'ZHcy','\u0436':'zhcy','\u21DD':'zigrarr','\uD835\uDD6B':'zopf','\uD835\uDCB5':'Zscr','\uD835\uDCCF':'zscr','\u200D':'zwj','\u200C':'zwnj'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|iacute|Uacute|plusmn|otilde|Otilde|Agrave|agrave|yacute|Yacute|oslash|Oslash|Atilde|atilde|brvbar|Ccedil|ccedil|ograve|curren|divide|Eacute|eacute|Ograve|oacute|Egrave|egrave|ugrave|frac12|frac14|frac34|Ugrave|Oacute|Iacute|ntilde|Ntilde|uacute|middot|Igrave|igrave|iquest|aacute|laquo|THORN|micro|iexcl|icirc|Icirc|Acirc|ucirc|ecirc|Ocirc|ocirc|Ecirc|Ucirc|aring|Aring|aelig|AElig|acute|pound|raquo|acirc|times|thorn|szlig|cedil|COPY|Auml|ordf|ordm|uuml|macr|Uuml|auml|Ouml|ouml|para|nbsp|Euml|quot|QUOT|euml|yuml|cent|sect|copy|sup1|sup2|sup3|Iuml|iuml|shy|eth|reg|not|yen|amp|AMP|REG|uml|ETH|deg|gt|GT|LT|lt)([=a-zA-Z0-9])?/g;
	var decodeMap = {'Aacute':'\xC1','aacute':'\xE1','Abreve':'\u0102','abreve':'\u0103','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','Acirc':'\xC2','acirc':'\xE2','acute':'\xB4','Acy':'\u0410','acy':'\u0430','AElig':'\xC6','aelig':'\xE6','af':'\u2061','Afr':'\uD835\uDD04','afr':'\uD835\uDD1E','Agrave':'\xC0','agrave':'\xE0','alefsym':'\u2135','aleph':'\u2135','Alpha':'\u0391','alpha':'\u03B1','Amacr':'\u0100','amacr':'\u0101','amalg':'\u2A3F','amp':'&','AMP':'&','andand':'\u2A55','And':'\u2A53','and':'\u2227','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angmsd':'\u2221','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','Aogon':'\u0104','aogon':'\u0105','Aopf':'\uD835\uDD38','aopf':'\uD835\uDD52','apacir':'\u2A6F','ap':'\u2248','apE':'\u2A70','ape':'\u224A','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','Aring':'\xC5','aring':'\xE5','Ascr':'\uD835\uDC9C','ascr':'\uD835\uDCB6','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','Atilde':'\xC3','atilde':'\xE3','Auml':'\xC4','auml':'\xE4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','Bcy':'\u0411','bcy':'\u0431','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','Beta':'\u0392','beta':'\u03B2','beth':'\u2136','between':'\u226C','Bfr':'\uD835\uDD05','bfr':'\uD835\uDD1F','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bNot':'\u2AED','bnot':'\u2310','Bopf':'\uD835\uDD39','bopf':'\uD835\uDD53','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxHd':'\u2564','boxhD':'\u2565','boxHD':'\u2566','boxhu':'\u2534','boxHu':'\u2567','boxhU':'\u2568','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsolb':'\u29C5','bsol':'\\','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpE':'\u2AAE','bumpe':'\u224F','Bumpeq':'\u224E','bumpeq':'\u224F','Cacute':'\u0106','cacute':'\u0107','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','cap':'\u2229','Cap':'\u22D2','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','Ccaron':'\u010C','ccaron':'\u010D','Ccedil':'\xC7','ccedil':'\xE7','Ccirc':'\u0108','ccirc':'\u0109','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','Cdot':'\u010A','cdot':'\u010B','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','CHcy':'\u0427','chcy':'\u0447','check':'\u2713','checkmark':'\u2713','Chi':'\u03A7','chi':'\u03C7','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cir':'\u25CB','cirE':'\u29C3','cire':'\u2257','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','Colone':'\u2A74','colone':'\u2254','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','Cscr':'\uD835\uDC9E','cscr':'\uD835\uDCB8','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cup':'\u222A','Cup':'\u22D3','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','Darr':'\u21A1','dArr':'\u21D3','dash':'\u2010','Dashv':'\u2AE4','dashv':'\u22A3','dbkarow':'\u290F','dblac':'\u02DD','Dcaron':'\u010E','dcaron':'\u010F','Dcy':'\u0414','dcy':'\u0434','ddagger':'\u2021','ddarr':'\u21CA','DD':'\u2145','dd':'\u2146','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','Delta':'\u0394','delta':'\u03B4','demptyv':'\u29B1','dfisht':'\u297F','Dfr':'\uD835\uDD07','dfr':'\uD835\uDD21','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','DJcy':'\u0402','djcy':'\u0452','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','Dopf':'\uD835\uDD3B','dopf':'\uD835\uDD55','Dot':'\xA8','dot':'\u02D9','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','DownArrowBar':'\u2913','downarrow':'\u2193','DownArrow':'\u2193','Downarrow':'\u21D3','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVectorBar':'\u2956','DownLeftVector':'\u21BD','DownRightTeeVector':'\u295F','DownRightVectorBar':'\u2957','DownRightVector':'\u21C1','DownTeeArrow':'\u21A7','DownTee':'\u22A4','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','Dscr':'\uD835\uDC9F','dscr':'\uD835\uDCB9','DScy':'\u0405','dscy':'\u0455','dsol':'\u29F6','Dstrok':'\u0110','dstrok':'\u0111','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','DZcy':'\u040F','dzcy':'\u045F','dzigrarr':'\u27FF','Eacute':'\xC9','eacute':'\xE9','easter':'\u2A6E','Ecaron':'\u011A','ecaron':'\u011B','Ecirc':'\xCA','ecirc':'\xEA','ecir':'\u2256','ecolon':'\u2255','Ecy':'\u042D','ecy':'\u044D','eDDot':'\u2A77','Edot':'\u0116','edot':'\u0117','eDot':'\u2251','ee':'\u2147','efDot':'\u2252','Efr':'\uD835\uDD08','efr':'\uD835\uDD22','eg':'\u2A9A','Egrave':'\xC8','egrave':'\xE8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','Emacr':'\u0112','emacr':'\u0113','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp13':'\u2004','emsp14':'\u2005','emsp':'\u2003','ENG':'\u014A','eng':'\u014B','ensp':'\u2002','Eogon':'\u0118','eogon':'\u0119','Eopf':'\uD835\uDD3C','eopf':'\uD835\uDD56','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','Epsilon':'\u0395','epsilon':'\u03B5','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','Esim':'\u2A73','esim':'\u2242','Eta':'\u0397','eta':'\u03B7','ETH':'\xD0','eth':'\xF0','Euml':'\xCB','euml':'\xEB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','Fcy':'\u0424','fcy':'\u0444','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','Ffr':'\uD835\uDD09','ffr':'\uD835\uDD23','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','Fopf':'\uD835\uDD3D','fopf':'\uD835\uDD57','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','Gamma':'\u0393','gamma':'\u03B3','Gammad':'\u03DC','gammad':'\u03DD','gap':'\u2A86','Gbreve':'\u011E','gbreve':'\u011F','Gcedil':'\u0122','Gcirc':'\u011C','gcirc':'\u011D','Gcy':'\u0413','gcy':'\u0433','Gdot':'\u0120','gdot':'\u0121','ge':'\u2265','gE':'\u2267','gEl':'\u2A8C','gel':'\u22DB','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','gescc':'\u2AA9','ges':'\u2A7E','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','Gfr':'\uD835\uDD0A','gfr':'\uD835\uDD24','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','GJcy':'\u0403','gjcy':'\u0453','gla':'\u2AA5','gl':'\u2277','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','Gopf':'\uD835\uDD3E','gopf':'\uD835\uDD58','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','Gscr':'\uD835\uDCA2','gscr':'\u210A','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gtcc':'\u2AA7','gtcir':'\u2A7A','gt':'>','GT':'>','Gt':'\u226B','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','HARDcy':'\u042A','hardcy':'\u044A','harrcir':'\u2948','harr':'\u2194','hArr':'\u21D4','harrw':'\u21AD','Hat':'^','hbar':'\u210F','Hcirc':'\u0124','hcirc':'\u0125','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','Hstrok':'\u0126','hstrok':'\u0127','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','Iacute':'\xCD','iacute':'\xED','ic':'\u2063','Icirc':'\xCE','icirc':'\xEE','Icy':'\u0418','icy':'\u0438','Idot':'\u0130','IEcy':'\u0415','iecy':'\u0435','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','Igrave':'\xCC','igrave':'\xEC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','IJlig':'\u0132','ijlig':'\u0133','Imacr':'\u012A','imacr':'\u012B','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','Im':'\u2111','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','incare':'\u2105','in':'\u2208','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','intcal':'\u22BA','int':'\u222B','Int':'\u222C','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','IOcy':'\u0401','iocy':'\u0451','Iogon':'\u012E','iogon':'\u012F','Iopf':'\uD835\uDD40','iopf':'\uD835\uDD5A','Iota':'\u0399','iota':'\u03B9','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','Itilde':'\u0128','itilde':'\u0129','Iukcy':'\u0406','iukcy':'\u0456','Iuml':'\xCF','iuml':'\xEF','Jcirc':'\u0134','jcirc':'\u0135','Jcy':'\u0419','jcy':'\u0439','Jfr':'\uD835\uDD0D','jfr':'\uD835\uDD27','jmath':'\u0237','Jopf':'\uD835\uDD41','jopf':'\uD835\uDD5B','Jscr':'\uD835\uDCA5','jscr':'\uD835\uDCBF','Jsercy':'\u0408','jsercy':'\u0458','Jukcy':'\u0404','jukcy':'\u0454','Kappa':'\u039A','kappa':'\u03BA','kappav':'\u03F0','Kcedil':'\u0136','kcedil':'\u0137','Kcy':'\u041A','kcy':'\u043A','Kfr':'\uD835\uDD0E','kfr':'\uD835\uDD28','kgreen':'\u0138','KHcy':'\u0425','khcy':'\u0445','KJcy':'\u040C','kjcy':'\u045C','Kopf':'\uD835\uDD42','kopf':'\uD835\uDD5C','Kscr':'\uD835\uDCA6','kscr':'\uD835\uDCC0','lAarr':'\u21DA','Lacute':'\u0139','lacute':'\u013A','laemptyv':'\u29B4','lagran':'\u2112','Lambda':'\u039B','lambda':'\u03BB','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larrb':'\u21E4','larrbfs':'\u291F','larr':'\u2190','Larr':'\u219E','lArr':'\u21D0','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','latail':'\u2919','lAtail':'\u291B','lat':'\u2AAB','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','Lcaron':'\u013D','lcaron':'\u013E','Lcedil':'\u013B','lcedil':'\u013C','lceil':'\u2308','lcub':'{','Lcy':'\u041B','lcy':'\u043B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','LeftArrowBar':'\u21E4','leftarrow':'\u2190','LeftArrow':'\u2190','Leftarrow':'\u21D0','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVectorBar':'\u2959','LeftDownVector':'\u21C3','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','LeftRightArrow':'\u2194','Leftrightarrow':'\u21D4','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTeeArrow':'\u21A4','LeftTee':'\u22A3','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangleBar':'\u29CF','LeftTriangle':'\u22B2','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVectorBar':'\u2958','LeftUpVector':'\u21BF','LeftVectorBar':'\u2952','LeftVector':'\u21BC','lEg':'\u2A8B','leg':'\u22DA','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','lescc':'\u2AA8','les':'\u2A7D','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','Lfr':'\uD835\uDD0F','lfr':'\uD835\uDD29','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','LJcy':'\u0409','ljcy':'\u0459','llarr':'\u21C7','ll':'\u226A','Ll':'\u22D8','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','Lmidot':'\u013F','lmidot':'\u0140','lmoustache':'\u23B0','lmoust':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','LongLeftArrow':'\u27F5','Longleftarrow':'\u27F8','longleftrightarrow':'\u27F7','LongLeftRightArrow':'\u27F7','Longleftrightarrow':'\u27FA','longmapsto':'\u27FC','longrightarrow':'\u27F6','LongRightArrow':'\u27F6','Longrightarrow':'\u27F9','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','Lopf':'\uD835\uDD43','lopf':'\uD835\uDD5D','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','Lstrok':'\u0141','lstrok':'\u0142','ltcc':'\u2AA6','ltcir':'\u2A79','lt':'<','LT':'<','Lt':'\u226A','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','Map':'\u2905','map':'\u21A6','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','Mcy':'\u041C','mcy':'\u043C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','Mfr':'\uD835\uDD10','mfr':'\uD835\uDD2A','mho':'\u2127','micro':'\xB5','midast':'*','midcir':'\u2AF0','mid':'\u2223','middot':'\xB7','minusb':'\u229F','minus':'\u2212','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','Mopf':'\uD835\uDD44','mopf':'\uD835\uDD5E','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','Mu':'\u039C','mu':'\u03BC','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','Nacute':'\u0143','nacute':'\u0144','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natural':'\u266E','naturals':'\u2115','natur':'\u266E','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','Ncaron':'\u0147','ncaron':'\u0148','Ncedil':'\u0145','ncedil':'\u0146','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','Ncy':'\u041D','ncy':'\u043D','ndash':'\u2013','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','ne':'\u2260','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','Nfr':'\uD835\uDD11','nfr':'\uD835\uDD2B','ngE':'\u2267\u0338','nge':'\u2271','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','nGt':'\u226B\u20D2','ngt':'\u226F','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','NJcy':'\u040A','njcy':'\u045A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nlE':'\u2266\u0338','nle':'\u2270','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nLt':'\u226A\u20D2','nlt':'\u226E','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','Not':'\u2AEC','not':'\xAC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangle':'\u22EA','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangle':'\u22EB','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','nparallel':'\u2226','npar':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','nprec':'\u2280','npreceq':'\u2AAF\u0338','npre':'\u2AAF\u0338','nrarrc':'\u2933\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','Nscr':'\uD835\uDCA9','nscr':'\uD835\uDCC3','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsubE':'\u2AC5\u0338','nsube':'\u2288','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupE':'\u2AC6\u0338','nsupe':'\u2289','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','Ntilde':'\xD1','ntilde':'\xF1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','Nu':'\u039D','nu':'\u03BD','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','Oacute':'\xD3','oacute':'\xF3','oast':'\u229B','Ocirc':'\xD4','ocirc':'\xF4','ocir':'\u229A','Ocy':'\u041E','ocy':'\u043E','odash':'\u229D','Odblac':'\u0150','odblac':'\u0151','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','OElig':'\u0152','oelig':'\u0153','ofcir':'\u29BF','Ofr':'\uD835\uDD12','ofr':'\uD835\uDD2C','ogon':'\u02DB','Ograve':'\xD2','ograve':'\xF2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','Omacr':'\u014C','omacr':'\u014D','Omega':'\u03A9','omega':'\u03C9','Omicron':'\u039F','omicron':'\u03BF','omid':'\u29B6','ominus':'\u2296','Oopf':'\uD835\uDD46','oopf':'\uD835\uDD60','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','orarr':'\u21BB','Or':'\u2A54','or':'\u2228','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','Oscr':'\uD835\uDCAA','oscr':'\u2134','Oslash':'\xD8','oslash':'\xF8','osol':'\u2298','Otilde':'\xD5','otilde':'\xF5','otimesas':'\u2A36','Otimes':'\u2A37','otimes':'\u2297','Ouml':'\xD6','ouml':'\xF6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','para':'\xB6','parallel':'\u2225','par':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','Pcy':'\u041F','pcy':'\u043F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','Pfr':'\uD835\uDD13','pfr':'\uD835\uDD2D','Phi':'\u03A6','phi':'\u03C6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','Pi':'\u03A0','pi':'\u03C0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plus':'+','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','prap':'\u2AB7','Pr':'\u2ABB','pr':'\u227A','prcue':'\u227C','precapprox':'\u2AB7','prec':'\u227A','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','pre':'\u2AAF','prE':'\u2AB3','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportional':'\u221D','Proportion':'\u2237','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','Pscr':'\uD835\uDCAB','pscr':'\uD835\uDCC5','Psi':'\u03A8','psi':'\u03C8','puncsp':'\u2008','Qfr':'\uD835\uDD14','qfr':'\uD835\uDD2E','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','Qscr':'\uD835\uDCAC','qscr':'\uD835\uDCC6','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','Racute':'\u0154','racute':'\u0155','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarr':'\u2192','Rarr':'\u21A0','rArr':'\u21D2','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','Rarrtl':'\u2916','rarrtl':'\u21A3','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','Rcaron':'\u0158','rcaron':'\u0159','Rcedil':'\u0156','rcedil':'\u0157','rceil':'\u2309','rcub':'}','Rcy':'\u0420','rcy':'\u0440','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','Re':'\u211C','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','Rho':'\u03A1','rho':'\u03C1','rhov':'\u03F1','RightAngleBracket':'\u27E9','RightArrowBar':'\u21E5','rightarrow':'\u2192','RightArrow':'\u2192','Rightarrow':'\u21D2','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVectorBar':'\u2955','RightDownVector':'\u21C2','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTeeArrow':'\u21A6','RightTee':'\u22A2','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangleBar':'\u29D0','RightTriangle':'\u22B3','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVectorBar':'\u2954','RightUpVector':'\u21BE','RightVectorBar':'\u2953','RightVector':'\u21C0','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoustache':'\u23B1','rmoust':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','Sacute':'\u015A','sacute':'\u015B','sbquo':'\u201A','scap':'\u2AB8','Scaron':'\u0160','scaron':'\u0161','Sc':'\u2ABC','sc':'\u227B','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','Scedil':'\u015E','scedil':'\u015F','Scirc':'\u015C','scirc':'\u015D','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','Scy':'\u0421','scy':'\u0441','sdotb':'\u22A1','sdot':'\u22C5','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','Sfr':'\uD835\uDD16','sfr':'\uD835\uDD30','sfrown':'\u2322','sharp':'\u266F','SHCHcy':'\u0429','shchcy':'\u0449','SHcy':'\u0428','shcy':'\u0448','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','Sigma':'\u03A3','sigma':'\u03C3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','SOFTcy':'\u042C','softcy':'\u044C','solbar':'\u233F','solb':'\u29C4','sol':'/','Sopf':'\uD835\uDD4A','sopf':'\uD835\uDD64','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squ':'\u25A1','squf':'\u25AA','srarr':'\u2192','Sscr':'\uD835\uDCAE','sscr':'\uD835\uDCC8','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','Star':'\u22C6','star':'\u2606','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','subE':'\u2AC5','sube':'\u2286','subedot':'\u2AC3','submult':'\u2AC1','subnE':'\u2ACB','subne':'\u228A','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succapprox':'\u2AB8','succ':'\u227B','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','sup':'\u2283','Sup':'\u22D1','supdot':'\u2ABE','supdsub':'\u2AD8','supE':'\u2AC6','supe':'\u2287','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supnE':'\u2ACC','supne':'\u228B','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','Tau':'\u03A4','tau':'\u03C4','tbrk':'\u23B4','Tcaron':'\u0164','tcaron':'\u0165','Tcedil':'\u0162','tcedil':'\u0163','Tcy':'\u0422','tcy':'\u0442','tdot':'\u20DB','telrec':'\u2315','Tfr':'\uD835\uDD17','tfr':'\uD835\uDD31','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','Theta':'\u0398','theta':'\u03B8','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','ThinSpace':'\u2009','thinsp':'\u2009','thkap':'\u2248','thksim':'\u223C','THORN':'\xDE','thorn':'\xFE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','timesbar':'\u2A31','timesb':'\u22A0','times':'\xD7','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','topbot':'\u2336','topcir':'\u2AF1','top':'\u22A4','Topf':'\uD835\uDD4B','topf':'\uD835\uDD65','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','Tscr':'\uD835\uDCAF','tscr':'\uD835\uDCC9','TScy':'\u0426','tscy':'\u0446','TSHcy':'\u040B','tshcy':'\u045B','Tstrok':'\u0166','tstrok':'\u0167','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','Uacute':'\xDA','uacute':'\xFA','uarr':'\u2191','Uarr':'\u219F','uArr':'\u21D1','Uarrocir':'\u2949','Ubrcy':'\u040E','ubrcy':'\u045E','Ubreve':'\u016C','ubreve':'\u016D','Ucirc':'\xDB','ucirc':'\xFB','Ucy':'\u0423','ucy':'\u0443','udarr':'\u21C5','Udblac':'\u0170','udblac':'\u0171','udhar':'\u296E','ufisht':'\u297E','Ufr':'\uD835\uDD18','ufr':'\uD835\uDD32','Ugrave':'\xD9','ugrave':'\xF9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','Umacr':'\u016A','umacr':'\u016B','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','Uogon':'\u0172','uogon':'\u0173','Uopf':'\uD835\uDD4C','uopf':'\uD835\uDD66','UpArrowBar':'\u2912','uparrow':'\u2191','UpArrow':'\u2191','Uparrow':'\u21D1','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','UpDownArrow':'\u2195','Updownarrow':'\u21D5','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','Upsilon':'\u03A5','upsilon':'\u03C5','UpTeeArrow':'\u21A5','UpTee':'\u22A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','Uring':'\u016E','uring':'\u016F','urtri':'\u25F9','Uscr':'\uD835\uDCB0','uscr':'\uD835\uDCCA','utdot':'\u22F0','Utilde':'\u0168','utilde':'\u0169','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','Uuml':'\xDC','uuml':'\xFC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','Vcy':'\u0412','vcy':'\u0432','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','veebar':'\u22BB','vee':'\u2228','Vee':'\u22C1','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','Vfr':'\uD835\uDD19','vfr':'\uD835\uDD33','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','Vopf':'\uD835\uDD4D','vopf':'\uD835\uDD67','vprop':'\u221D','vrtri':'\u22B3','Vscr':'\uD835\uDCB1','vscr':'\uD835\uDCCB','vsubnE':'\u2ACB\uFE00','vsubne':'\u228A\uFE00','vsupnE':'\u2ACC\uFE00','vsupne':'\u228B\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','Wcirc':'\u0174','wcirc':'\u0175','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','Wfr':'\uD835\uDD1A','wfr':'\uD835\uDD34','Wopf':'\uD835\uDD4E','wopf':'\uD835\uDD68','wp':'\u2118','wr':'\u2240','wreath':'\u2240','Wscr':'\uD835\uDCB2','wscr':'\uD835\uDCCC','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','Xfr':'\uD835\uDD1B','xfr':'\uD835\uDD35','xharr':'\u27F7','xhArr':'\u27FA','Xi':'\u039E','xi':'\u03BE','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','Xopf':'\uD835\uDD4F','xopf':'\uD835\uDD69','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','Xscr':'\uD835\uDCB3','xscr':'\uD835\uDCCD','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','Yacute':'\xDD','yacute':'\xFD','YAcy':'\u042F','yacy':'\u044F','Ycirc':'\u0176','ycirc':'\u0177','Ycy':'\u042B','ycy':'\u044B','yen':'\xA5','Yfr':'\uD835\uDD1C','yfr':'\uD835\uDD36','YIcy':'\u0407','yicy':'\u0457','Yopf':'\uD835\uDD50','yopf':'\uD835\uDD6A','Yscr':'\uD835\uDCB4','yscr':'\uD835\uDCCE','YUcy':'\u042E','yucy':'\u044E','yuml':'\xFF','Yuml':'\u0178','Zacute':'\u0179','zacute':'\u017A','Zcaron':'\u017D','zcaron':'\u017E','Zcy':'\u0417','zcy':'\u0437','Zdot':'\u017B','zdot':'\u017C','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','Zeta':'\u0396','zeta':'\u03B6','zfr':'\uD835\uDD37','Zfr':'\u2128','ZHcy':'\u0416','zhcy':'\u0436','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','Zscr':'\uD835\uDCB5','zscr':'\uD835\uDCCF','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'Aacute':'\xC1','aacute':'\xE1','Acirc':'\xC2','acirc':'\xE2','acute':'\xB4','AElig':'\xC6','aelig':'\xE6','Agrave':'\xC0','agrave':'\xE0','amp':'&','AMP':'&','Aring':'\xC5','aring':'\xE5','Atilde':'\xC3','atilde':'\xE3','Auml':'\xC4','auml':'\xE4','brvbar':'\xA6','Ccedil':'\xC7','ccedil':'\xE7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','Eacute':'\xC9','eacute':'\xE9','Ecirc':'\xCA','ecirc':'\xEA','Egrave':'\xC8','egrave':'\xE8','ETH':'\xD0','eth':'\xF0','Euml':'\xCB','euml':'\xEB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','Iacute':'\xCD','iacute':'\xED','Icirc':'\xCE','icirc':'\xEE','iexcl':'\xA1','Igrave':'\xCC','igrave':'\xEC','iquest':'\xBF','Iuml':'\xCF','iuml':'\xEF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','Ntilde':'\xD1','ntilde':'\xF1','Oacute':'\xD3','oacute':'\xF3','Ocirc':'\xD4','ocirc':'\xF4','Ograve':'\xD2','ograve':'\xF2','ordf':'\xAA','ordm':'\xBA','Oslash':'\xD8','oslash':'\xF8','Otilde':'\xD5','otilde':'\xF5','Ouml':'\xD6','ouml':'\xF6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','THORN':'\xDE','thorn':'\xFE','times':'\xD7','Uacute':'\xDA','uacute':'\xFA','Ucirc':'\xDB','ucirc':'\xFB','Ugrave':'\xD9','ugrave':'\xF9','uml':'\xA8','Uuml':'\xDC','uuml':'\xFC','Yacute':'\xDD','yacute':'\xFD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see http://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(symbol) {
		return '&#x' + symbol.charCodeAt(0).toString(16).toUpperCase() + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		var allowUnsafeSymbols = options.allowUnsafeSymbols;
		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return hexEscape(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			if (!allowUnsafeSymbols) {
				string = string.replace(regexEscape, function(string) {
					return '&' + encodeMap[string] + ';'; // no need to check `has()` here
				});
			}
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else if (!allowUnsafeSymbols) {
			// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
			// using named character references.
			string = string.replace(regexEscape, hexEscape);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return '&#x' + codePoint.toString(16).toUpperCase() + ';';
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, hexEscape);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7) {
			var codePoint;
			var semicolon;
			var hexDigits;
			var reference;
			var next;
			if ($1) {
				// Decode decimal escapes, e.g. `&#119558;`.
				codePoint = $1;
				semicolon = $2;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				return codePointToSymbol(codePoint, strict);
			}
			if ($3) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $3;
				semicolon = $4;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}
			if ($5) {
				// Decode named character references with trailing `;`, e.g. `&copy;`.
				reference = $5;
				if (has(decodeMap, reference)) {
					return decodeMap[reference];
				} else {
					// Ambiguous ampersand; see http://mths.be/notes/ambiguous-ampersands.
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					return $0;
				}
			}
			// If we’re still here, it’s a legacy reference for sure. No need for an
			// extra `if` check.
			// Decode named character references without trailing `;`, e.g. `&amp`
			// This is only a parse error if it gets converted to `&`, or if it is
			// followed by `=` in an attribute context.
			reference = $6;
			next = $7;
			if (next && options.isAttributeValue) {
				if (strict && next == '=') {
					parseError('`&` did not start a character reference');
				}
				return $0;
			} else {
				if (strict) {
					parseError(
						'named character reference was not terminated by a semicolon'
					);
				}
				// Note: there is no need to check `has(decodeMapLegacy, reference)`.
				return decodeMapLegacy[reference] + (next || '');
			}
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '0.5.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return he;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = he;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.he = he;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
/*!
 * JavaScript Cookie v2.0.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));

},{}],6:[function(require,module,exports){
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function Locale() {
    }

    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && typeof module !== 'undefined' &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function get_set__set (mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

    var regexes = {};

    function isFunction (sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' &&
            Object.prototype.toString.call(sth) === '[object Function]';
    }


    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  matchWord);
    addRegexToken('MMMM', matchWord);

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m) {
        return this._months[m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m) {
        return this._monthsShort[m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
        ['YYYY-DDD', /\d{4}-\d{3}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
        ['HH:mm', /(T| )\d\d:\d\d/],
        ['HH', /(T| )\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = from_string__isoRegex.exec(string);

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }

        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
        }
        return [now.getFullYear(), now.getMonth(), now.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             return other < this ? this : other;
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(string) {
        var matches = ((string || '').match(matchOffset) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return !this._isUTC;
    }

    function isUtcOffset () {
        return this._isUTC;
    }

    function isUtc () {
        return this._isUTC && this._offset === 0;
    }

    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function diff (input, units, asFloat) {
        var that = cloneWithOffset(input, this),
            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
            delta, output;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    // MOMENTS

    function getSetWeekYear (input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getSetISOWeekYear (input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    addFormatToken('Q', 0, 0, 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m) {
        return this._weekdays[m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName) {
        var i, mom, regex;

        this._weekdaysParse = this._weekdaysParse || [];

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([2000, 1]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, function () {
        return this.hours() % 12 || 12;
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add          = add_subtract__add;
    momentPrototype__proto.calendar     = moment_calendar__calendar;
    momentPrototype__proto.clone        = clone;
    momentPrototype__proto.diff         = diff;
    momentPrototype__proto.endOf        = endOf;
    momentPrototype__proto.format       = format;
    momentPrototype__proto.from         = from;
    momentPrototype__proto.fromNow      = fromNow;
    momentPrototype__proto.to           = to;
    momentPrototype__proto.toNow        = toNow;
    momentPrototype__proto.get          = getSet;
    momentPrototype__proto.invalidAt    = invalidAt;
    momentPrototype__proto.isAfter      = isAfter;
    momentPrototype__proto.isBefore     = isBefore;
    momentPrototype__proto.isBetween    = isBetween;
    momentPrototype__proto.isSame       = isSame;
    momentPrototype__proto.isValid      = moment_valid__isValid;
    momentPrototype__proto.lang         = lang;
    momentPrototype__proto.locale       = locale;
    momentPrototype__proto.localeData   = localeData;
    momentPrototype__proto.max          = prototypeMax;
    momentPrototype__proto.min          = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set          = getSet;
    momentPrototype__proto.startOf      = startOf;
    momentPrototype__proto.subtract     = add_subtract__subtract;
    momentPrototype__proto.toArray      = toArray;
    momentPrototype__proto.toObject     = toObject;
    momentPrototype__proto.toDate       = toDate;
    momentPrototype__proto.toISOString  = moment_format__toISOString;
    momentPrototype__proto.toJSON       = moment_format__toISOString;
    momentPrototype__proto.toString     = toString;
    momentPrototype__proto.unix         = unix;
    momentPrototype__proto.valueOf      = to_type__valueOf;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (typeof output === 'function') ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months       =        localeMonths;
    prototype__proto._months      = defaultLocaleMonths;
    prototype__proto.monthsShort  =        localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse  =        localeMonthsParse;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes === 1          && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   === 1          && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    === 1          && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  === 1          && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   === 1          && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.10.6';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, location) {
	'use strict';

	var undef;

	define(function (require) {

		var mixin, origin, urlRE, absoluteUrlRE, fullyQualifiedUrlRE;

		mixin = require('./util/mixin');

		urlRE = /([a-z][a-z0-9\+\-\.]*:)\/\/([^@]+@)?(([^:\/]+)(:([0-9]+))?)?(\/[^?#]*)?(\?[^#]*)?(#\S*)?/i;
		absoluteUrlRE = /^([a-z][a-z0-9\-\+\.]*:\/\/|\/)/i;
		fullyQualifiedUrlRE = /([a-z][a-z0-9\+\-\.]*:)\/\/([^@]+@)?(([^:\/]+)(:([0-9]+))?)?\//i;

		/**
		 * Apply params to the template to create a URL.
		 *
		 * Parameters that are not applied directly to the template, are appended
		 * to the URL as query string parameters.
		 *
		 * @param {string} template the URI template
		 * @param {Object} params parameters to apply to the template
		 * @return {string} the resulting URL
		 */
		function buildUrl(template, params) {
			// internal builder to convert template with params.
			var url, name, queryStringParams, re;

			url = template;
			queryStringParams = {};

			if (params) {
				for (name in params) {
					/*jshint forin:false */
					re = new RegExp('\\{' + name + '\\}');
					if (re.test(url)) {
						url = url.replace(re, encodeURIComponent(params[name]), 'g');
					}
					else {
						queryStringParams[name] = params[name];
					}
				}
				for (name in queryStringParams) {
					url += url.indexOf('?') === -1 ? '?' : '&';
					url += encodeURIComponent(name);
					if (queryStringParams[name] !== null && queryStringParams[name] !== undefined) {
						url += '=';
						url += encodeURIComponent(queryStringParams[name]);
					}
				}
			}
			return url;
		}

		function startsWith(str, test) {
			return str.indexOf(test) === 0;
		}

		/**
		 * Create a new URL Builder
		 *
		 * @param {string|UrlBuilder} template the base template to build from, may be another UrlBuilder
		 * @param {Object} [params] base parameters
		 * @constructor
		 */
		function UrlBuilder(template, params) {
			if (!(this instanceof UrlBuilder)) {
				// invoke as a constructor
				return new UrlBuilder(template, params);
			}

			if (template instanceof UrlBuilder) {
				this._template = template.template;
				this._params = mixin({}, this._params, params);
			}
			else {
				this._template = (template || '').toString();
				this._params = params || {};
			}
		}

		UrlBuilder.prototype = {

			/**
			 * Create a new UrlBuilder instance that extends the current builder.
			 * The current builder is unmodified.
			 *
			 * @param {string} [template] URL template to append to the current template
			 * @param {Object} [params] params to combine with current params.  New params override existing params
			 * @return {UrlBuilder} the new builder
			 */
			append: function (template,  params) {
				// TODO consider query strings and fragments
				return new UrlBuilder(this._template + template, mixin({}, this._params, params));
			},

			/**
			 * Create a new UrlBuilder with a fully qualified URL based on the
			 * window's location or base href and the current templates relative URL.
			 *
			 * Path variables are preserved.
			 *
			 * *Browser only*
			 *
			 * @return {UrlBuilder} the fully qualified URL template
			 */
			fullyQualify: function () {
				if (!location) { return this; }
				if (this.isFullyQualified()) { return this; }

				var template = this._template;

				if (startsWith(template, '//')) {
					template = origin.protocol + template;
				}
				else if (startsWith(template, '/')) {
					template = origin.origin + template;
				}
				else if (!this.isAbsolute()) {
					template = origin.origin + origin.pathname.substring(0, origin.pathname.lastIndexOf('/') + 1);
				}

				if (template.indexOf('/', 8) === -1) {
					// default the pathname to '/'
					template = template + '/';
				}

				return new UrlBuilder(template, this._params);
			},

			/**
			 * True if the URL is absolute
			 *
			 * @return {boolean}
			 */
			isAbsolute: function () {
				return absoluteUrlRE.test(this.build());
			},

			/**
			 * True if the URL is fully qualified
			 *
			 * @return {boolean}
			 */
			isFullyQualified: function () {
				return fullyQualifiedUrlRE.test(this.build());
			},

			/**
			 * True if the URL is cross origin. The protocol, host and port must not be
			 * the same in order to be cross origin,
			 *
			 * @return {boolean}
			 */
			isCrossOrigin: function () {
				if (!origin) {
					return true;
				}
				var url = this.parts();
				return url.protocol !== origin.protocol ||
				       url.hostname !== origin.hostname ||
				       url.port !== origin.port;
			},

			/**
			 * Split a URL into its consituent parts following the naming convention of
			 * 'window.location'. One difference is that the port will contain the
			 * protocol default if not specified.
			 *
			 * @see https://developer.mozilla.org/en-US/docs/DOM/window.location
			 *
			 * @returns {Object} a 'window.location'-like object
			 */
			parts: function () {
				/*jshint maxcomplexity:20 */
				var url, parts;
				url = this.fullyQualify().build().match(urlRE);
				parts = {
					href: url[0],
					protocol: url[1],
					host: url[3] || '',
					hostname: url[4] || '',
					port: url[6],
					pathname: url[7] || '',
					search: url[8] || '',
					hash: url[9] || ''
				};
				parts.origin = parts.protocol + '//' + parts.host;
				parts.port = parts.port || (parts.protocol === 'https:' ? '443' : parts.protocol === 'http:' ? '80' : '');
				return parts;
			},

			/**
			 * Expand the template replacing path variables with parameters
			 *
			 * @param {Object} [params] params to combine with current params.  New params override existing params
			 * @return {string} the expanded URL
			 */
			build: function (params) {
				return buildUrl(this._template, mixin({}, this._params, params));
			},

			/**
			 * @see build
			 */
			toString: function () {
				return this.build();
			}

		};

		origin = location ? new UrlBuilder(location.href).parts() : undef;

		return UrlBuilder;
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window !== 'undefined' ? window.location : void 0
	// Boilerplate for AMD and Node
));

},{"./util/mixin":28}],9:[function(require,module,exports){
/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var rest = require('./client/default'),
		    browser = require('./client/xhr');

		rest.setPlatformDefaultClient(browser);

		return rest;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"./client/default":11,"./client/xhr":12}],10:[function(require,module,exports){
/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		/**
		 * Add common helper methods to a client impl
		 *
		 * @param {function} impl the client implementation
		 * @param {Client} [target] target of this client, used when wrapping other clients
		 * @returns {Client} the client impl with additional methods
		 */
		return function client(impl, target) {

			if (target) {

				/**
				 * @returns {Client} the target client
				 */
				impl.skip = function skip() {
					return target;
				};

			}

			/**
			 * Allow a client to easily be wrapped by an interceptor
			 *
			 * @param {Interceptor} interceptor the interceptor to wrap this client with
			 * @param [config] configuration for the interceptor
			 * @returns {Client} the newly wrapped client
			 */
			impl.wrap = function wrap(interceptor, config) {
				return interceptor(impl, config);
			};

			/**
			 * @deprecated
			 */
			impl.chain = function chain() {
				if (typeof console !== 'undefined') {
					console.log('rest.js: client.chain() is deprecated, use client.wrap() instead');
				}

				return impl.wrap.apply(this, arguments);
			};

			return impl;

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],11:[function(require,module,exports){
/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	var undef;

	define(function (require) {

		/**
		 * Plain JS Object containing properties that represent an HTTP request.
		 *
		 * Depending on the capabilities of the underlying client, a request
		 * may be cancelable. If a request may be canceled, the client will add
		 * a canceled flag and cancel function to the request object. Canceling
		 * the request will put the response into an error state.
		 *
		 * @field {string} [method='GET'] HTTP method, commonly GET, POST, PUT, DELETE or HEAD
		 * @field {string|UrlBuilder} [path=''] path template with optional path variables
		 * @field {Object} [params] parameters for the path template and query string
		 * @field {Object} [headers] custom HTTP headers to send, in addition to the clients default headers
		 * @field [entity] the HTTP entity, common for POST or PUT requests
		 * @field {boolean} [canceled] true if the request has been canceled, set by the client
		 * @field {Function} [cancel] cancels the request if invoked, provided by the client
		 * @field {Client} [originator] the client that first handled this request, provided by the interceptor
		 *
		 * @class Request
		 */

		/**
		 * Plain JS Object containing properties that represent an HTTP response
		 *
		 * @field {Object} [request] the request object as received by the root client
		 * @field {Object} [raw] the underlying request object, like XmlHttpRequest in a browser
		 * @field {number} [status.code] status code of the response (i.e. 200, 404)
		 * @field {string} [status.text] status phrase of the response
		 * @field {Object] [headers] response headers hash of normalized name, value pairs
		 * @field [entity] the response body
		 *
		 * @class Response
		 */

		/**
		 * HTTP client particularly suited for RESTful operations.
		 *
		 * @field {function} wrap wraps this client with a new interceptor returning the wrapped client
		 *
		 * @param {Request} the HTTP request
		 * @returns {ResponsePromise<Response>} a promise the resolves to the HTTP response
		 *
		 * @class Client
		 */

		 /**
		  * Extended when.js Promises/A+ promise with HTTP specific helpers
		  *q
		  * @method entity promise for the HTTP entity
		  * @method status promise for the HTTP status code
		  * @method headers promise for the HTTP response headers
		  * @method header promise for a specific HTTP response header
		  *
		  * @class ResponsePromise
		  * @extends Promise
		  */

		var client, target, platformDefault;

		client = require('../client');

		/**
		 * Make a request with the default client
		 * @param {Request} the HTTP request
		 * @returns {Promise<Response>} a promise the resolves to the HTTP response
		 */
		function defaultClient() {
			return target.apply(undef, arguments);
		}

		/**
		 * Change the default client
		 * @param {Client} client the new default client
		 */
		defaultClient.setDefaultClient = function setDefaultClient(client) {
			target = client;
		};

		/**
		 * Obtain a direct reference to the current default client
		 * @returns {Client} the default client
		 */
		defaultClient.getDefaultClient = function getDefaultClient() {
			return target;
		};

		/**
		 * Reset the default client to the platform default
		 */
		defaultClient.resetDefaultClient = function resetDefaultClient() {
			target = platformDefault;
		};

		/**
		 * @private
		 */
		defaultClient.setPlatformDefaultClient = function setPlatformDefaultClient(client) {
			if (platformDefault) {
				throw new Error('Unable to redefine platformDefaultClient');
			}
			target = platformDefault = client;
		};

		return client(defaultClient);

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../client":10}],12:[function(require,module,exports){
/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, global) {
	'use strict';

	define(function (require) {

		var when, UrlBuilder, normalizeHeaderName, responsePromise, client, headerSplitRE;

		when = require('when');
		UrlBuilder = require('../UrlBuilder');
		normalizeHeaderName = require('../util/normalizeHeaderName');
		responsePromise = require('../util/responsePromise');
		client = require('../client');

		// according to the spec, the line break is '\r\n', but doesn't hold true in practice
		headerSplitRE = /[\r|\n]+/;

		function parseHeaders(raw) {
			// Note: Set-Cookie will be removed by the browser
			var headers = {};

			if (!raw) { return headers; }

			raw.trim().split(headerSplitRE).forEach(function (header) {
				var boundary, name, value;
				boundary = header.indexOf(':');
				name = normalizeHeaderName(header.substring(0, boundary).trim());
				value = header.substring(boundary + 1).trim();
				if (headers[name]) {
					if (Array.isArray(headers[name])) {
						// add to an existing array
						headers[name].push(value);
					}
					else {
						// convert single value to array
						headers[name] = [headers[name], value];
					}
				}
				else {
					// new, single value
					headers[name] = value;
				}
			});

			return headers;
		}

		function safeMixin(target, source) {
			Object.keys(source || {}).forEach(function (prop) {
				// make sure the property already exists as
				// IE 6 will blow up if we add a new prop
				if (source.hasOwnProperty(prop) && prop in target) {
					try {
						target[prop] = source[prop];
					}
					catch (e) {
						// ignore, expected for some properties at some points in the request lifecycle
					}
				}
			});

			return target;
		}

		return client(function xhr(request) {
			return responsePromise.promise(function (resolve, reject) {
				/*jshint maxcomplexity:20 */

				var client, method, url, headers, entity, headerName, response, XMLHttpRequest;

				request = typeof request === 'string' ? { path: request } : request || {};
				response = { request: request };

				if (request.canceled) {
					response.error = 'precanceled';
					reject(response);
					return;
				}

				XMLHttpRequest = request.engine || global.XMLHttpRequest;
				if (!XMLHttpRequest) {
					reject({ request: request, error: 'xhr-not-available' });
					return;
				}

				entity = request.entity;
				request.method = request.method || (entity ? 'POST' : 'GET');
				method = request.method;
				url = new UrlBuilder(request.path || '', request.params).build();

				try {
					client = response.raw = new XMLHttpRequest();

					// mixin extra request properties before and after opening the request as some properties require being set at different phases of the request
					safeMixin(client, request.mixin);
					client.open(method, url, true);
					safeMixin(client, request.mixin);

					headers = request.headers;
					for (headerName in headers) {
						/*jshint forin:false */
						if (headerName === 'Content-Type' && headers[headerName] === 'multipart/form-data') {
							// XMLHttpRequest generates its own Content-Type header with the
							// appropriate multipart boundary when sending multipart/form-data.
							continue;
						}

						client.setRequestHeader(headerName, headers[headerName]);
					}

					request.canceled = false;
					request.cancel = function cancel() {
						request.canceled = true;
						client.abort();
						reject(response);
					};

					client.onreadystatechange = function (/* e */) {
						if (request.canceled) { return; }
						if (client.readyState === (XMLHttpRequest.DONE || 4)) {
							response.status = {
								code: client.status,
								text: client.statusText
							};
							response.headers = parseHeaders(client.getAllResponseHeaders());
							response.entity = client.responseText;

							if (response.status.code > 0) {
								// check status code as readystatechange fires before error event
								resolve(response);
							}
							else {
								// give the error callback a chance to fire before resolving
								// requests for file:// URLs do not have a status code
								setTimeout(function () {
									resolve(response);
								}, 0);
							}
						}
					};

					try {
						client.onerror = function (/* e */) {
							response.error = 'loaderror';
							reject(response);
						};
					}
					catch (e) {
						// IE 6 will not support error handling
					}

					client.send(entity);
				}
				catch (e) {
					response.error = 'loaderror';
					reject(response);
				}

			});
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window !== 'undefined' ? window : void 0
	// Boilerplate for AMD and Node
));

},{"../UrlBuilder":8,"../client":10,"../util/normalizeHeaderName":29,"../util/responsePromise":30,"when":63}],13:[function(require,module,exports){
/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var defaultClient, mixin, responsePromise, client, when;

		defaultClient = require('./client/default');
		mixin = require('./util/mixin');
		responsePromise = require('./util/responsePromise');
		client = require('./client');
		when = require('when');

		/**
		 * Interceptors have the ability to intercept the request and/org response
		 * objects.  They may augment, prune, transform or replace the
		 * request/response as needed.  Clients may be composed by wrapping
		 * together multiple interceptors.
		 *
		 * Configured interceptors are functional in nature.  Wrapping a client in
		 * an interceptor will not affect the client, merely the data that flows in
		 * and out of that client.  A common configuration can be created once and
		 * shared; specialization can be created by further wrapping that client
		 * with custom interceptors.
		 *
		 * @param {Client} [target] client to wrap
		 * @param {Object} [config] configuration for the interceptor, properties will be specific to the interceptor implementation
		 * @returns {Client} A client wrapped with the interceptor
		 *
		 * @class Interceptor
		 */

		function defaultInitHandler(config) {
			return config;
		}

		function defaultRequestHandler(request /*, config, meta */) {
			return request;
		}

		function defaultResponseHandler(response /*, config, meta */) {
			return response;
		}

		function race(promisesOrValues) {
			// this function is different than when.any as the first to reject also wins
			return when.promise(function (resolve, reject) {
				promisesOrValues.forEach(function (promiseOrValue) {
					when(promiseOrValue, resolve, reject);
				});
			});
		}

		/**
		 * Alternate return type for the request handler that allows for more complex interactions.
		 *
		 * @param properties.request the traditional request return object
		 * @param {Promise} [properties.abort] promise that resolves if/when the request is aborted
		 * @param {Client} [properties.client] override the defined client with an alternate client
		 * @param [properties.response] response for the request, short circuit the request
		 */
		function ComplexRequest(properties) {
			if (!(this instanceof ComplexRequest)) {
				// in case users forget the 'new' don't mix into the interceptor
				return new ComplexRequest(properties);
			}
			mixin(this, properties);
		}

		/**
		 * Create a new interceptor for the provided handlers.
		 *
		 * @param {Function} [handlers.init] one time intialization, must return the config object
		 * @param {Function} [handlers.request] request handler
		 * @param {Function} [handlers.response] response handler regardless of error state
		 * @param {Function} [handlers.success] response handler when the request is not in error
		 * @param {Function} [handlers.error] response handler when the request is in error, may be used to 'unreject' an error state
		 * @param {Function} [handlers.client] the client to use if otherwise not specified, defaults to platform default client
		 *
		 * @returns {Interceptor}
		 */
		function interceptor(handlers) {

			var initHandler, requestHandler, successResponseHandler, errorResponseHandler;

			handlers = handlers || {};

			initHandler            = handlers.init    || defaultInitHandler;
			requestHandler         = handlers.request || defaultRequestHandler;
			successResponseHandler = handlers.success || handlers.response || defaultResponseHandler;
			errorResponseHandler   = handlers.error   || function () {
				// Propagate the rejection, with the result of the handler
				return when((handlers.response || defaultResponseHandler).apply(this, arguments), when.reject, when.reject);
			};

			return function (target, config) {

				if (typeof target === 'object') {
					config = target;
				}
				if (typeof target !== 'function') {
					target = handlers.client || defaultClient;
				}

				config = initHandler(config || {});

				function interceptedClient(request) {
					var context, meta;
					context = {};
					meta = { 'arguments': Array.prototype.slice.call(arguments), client: interceptedClient };
					request = typeof request === 'string' ? { path: request } : request || {};
					request.originator = request.originator || interceptedClient;
					return responsePromise(
						requestHandler.call(context, request, config, meta),
						function (request) {
							var response, abort, next;
							next = target;
							if (request instanceof ComplexRequest) {
								// unpack request
								abort = request.abort;
								next = request.client || next;
								response = request.response;
								// normalize request, must be last
								request = request.request;
							}
							response = response || when(request, function (request) {
								return when(
									next(request),
									function (response) {
										return successResponseHandler.call(context, response, config, meta);
									},
									function (response) {
										return errorResponseHandler.call(context, response, config, meta);
									}
								);
							});
							return abort ? race([response, abort]) : response;
						},
						function (error) {
							return when.reject({ request: request, error: error });
						}
					);
				}

				return client(interceptedClient, target);
			};
		}

		interceptor.ComplexRequest = ComplexRequest;

		return interceptor;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"./client":10,"./client/default":11,"./util/mixin":28,"./util/responsePromise":30,"when":63}],14:[function(require,module,exports){
/*
 * Copyright 2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor, mixinUtil, defaulter;

		interceptor = require('../interceptor');
		mixinUtil = require('../util/mixin');

		defaulter = (function () {

			function mixin(prop, target, defaults) {
				if (prop in target || prop in defaults) {
					target[prop] = mixinUtil({}, defaults[prop], target[prop]);
				}
			}

			function copy(prop, target, defaults) {
				if (prop in defaults && !(prop in target)) {
					target[prop] = defaults[prop];
				}
			}

			var mappings = {
				method: copy,
				path: copy,
				params: mixin,
				headers: mixin,
				entity: copy,
				mixin: mixin
			};

			return function (target, defaults) {
				for (var prop in mappings) {
					/*jshint forin: false */
					mappings[prop](prop, target, defaults);
				}
				return target;
			};

		}());

		/**
		 * Provide default values for a request. These values will be applied to the
		 * request if the request object does not already contain an explicit value.
		 *
		 * For 'params', 'headers', and 'mixin', individual values are mixed in with the
		 * request's values. The result is a new object representiing the combined
		 * request and config values. Neither input object is mutated.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {string} [config.method] the default method
		 * @param {string} [config.path] the default path
		 * @param {Object} [config.params] the default params, mixed with the request's existing params
		 * @param {Object} [config.headers] the default headers, mixed with the request's existing headers
		 * @param {Object} [config.mixin] the default "mixins" (http/https options), mixed with the request's existing "mixins"
		 *
		 * @returns {Client}
		 */
		return interceptor({
			request: function handleRequest(request, config) {
				return defaulter(request, config);
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../interceptor":13,"../util/mixin":28}],15:[function(require,module,exports){
/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor, when;

		interceptor = require('../interceptor');
		when = require('when');

		/**
		 * Rejects the response promise based on the status code.
		 *
		 * Codes greater than or equal to the provided value are rejected.  Default
		 * value 400.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {number} [config.code=400] code to indicate a rejection
		 *
		 * @returns {Client}
		 */
		return interceptor({
			init: function (config) {
				config.code = config.code || 400;
				return config;
			},
			response: function (response, config) {
				if (response.status && response.status.code >= config.code) {
					return when.reject(response);
				}
				return response;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../interceptor":13,"when":63}],16:[function(require,module,exports){
/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor, mime, registry, noopConverter, when;

		interceptor = require('../interceptor');
		mime = require('../mime');
		registry = require('../mime/registry');
		when = require('when');

		noopConverter = {
			read: function (obj) { return obj; },
			write: function (obj) { return obj; }
		};

		/**
		 * MIME type support for request and response entities.  Entities are
		 * (de)serialized using the converter for the MIME type.
		 *
		 * Request entities are converted using the desired converter and the
		 * 'Accept' request header prefers this MIME.
		 *
		 * Response entities are converted based on the Content-Type response header.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {string} [config.mime='text/plain'] MIME type to encode the request
		 *   entity
		 * @param {string} [config.accept] Accept header for the request
		 * @param {Client} [config.client=<request.originator>] client passed to the
		 *   converter, defaults to the client originating the request
		 * @param {Registry} [config.registry] MIME registry, defaults to the root
		 *   registry
		 * @param {boolean} [config.permissive] Allow an unkown request MIME type
		 *
		 * @returns {Client}
		 */
		return interceptor({
			init: function (config) {
				config.registry = config.registry || registry;
				return config;
			},
			request: function (request, config) {
				var type, headers;

				headers = request.headers || (request.headers = {});
				type = mime.parse(headers['Content-Type'] = headers['Content-Type'] || config.mime || 'text/plain');
				headers.Accept = headers.Accept || config.accept || type.raw + ', application/json;q=0.8, text/plain;q=0.5, */*;q=0.2';

				if (!('entity' in request)) {
					return request;
				}

				return config.registry.lookup(type).otherwise(function () {
					// failed to resolve converter
					if (config.permissive) {
						return noopConverter;
					}
					throw 'mime-unknown';
				}).then(function (converter) {
					var client = config.client || request.originator;

					return when.attempt(converter.write, request.entity, { client: client, request: request, mime: type, registry: config.registry })
						.otherwise(function() {
							throw 'mime-serialization';
						})
						.then(function(entity) {
							request.entity = entity;
							return request;
						});
				});
			},
			response: function (response, config) {
				if (!(response.headers && response.headers['Content-Type'] && response.entity)) {
					return response;
				}

				var type = mime.parse(response.headers['Content-Type']);

				return config.registry.lookup(type).otherwise(function () { return noopConverter; }).then(function (converter) {
					var client = config.client || response.request && response.request.originator;

					return when.attempt(converter.read, response.entity, { client: client, response: response, mime: type, registry: config.registry })
						.otherwise(function (e) {
							response.error = 'mime-deserialization';
							response.cause = e;
							throw response;
						})
						.then(function (entity) {
							response.entity = entity;
							return response;
						});
				});
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../interceptor":13,"../mime":19,"../mime/registry":20,"when":63}],17:[function(require,module,exports){
/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor, UrlBuilder;

		interceptor = require('../interceptor');
		UrlBuilder = require('../UrlBuilder');

		function startsWith(str, prefix) {
			return str.indexOf(prefix) === 0;
		}

		function endsWith(str, suffix) {
			return str.lastIndexOf(suffix) + suffix.length === str.length;
		}

		/**
		 * Prefixes the request path with a common value.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {number} [config.prefix] path prefix
		 *
		 * @returns {Client}
		 */
		return interceptor({
			request: function (request, config) {
				var path;

				if (config.prefix && !(new UrlBuilder(request.path).isFullyQualified())) {
					path = config.prefix;
					if (request.path) {
						if (!endsWith(path, '/') && !startsWith(request.path, '/')) {
							// add missing '/' between path sections
							path += '/';
						}
						path += request.path;
					}
					request.path = path;
				}

				return request;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../UrlBuilder":8,"../interceptor":13}],18:[function(require,module,exports){
/*
 * Copyright 2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor, uriTemplate, mixin;

		interceptor = require('../interceptor');
		uriTemplate = require('../util/uriTemplate');
		mixin = require('../util/mixin');

		/**
		 * Applies request params to the path as a URI Template
		 *
		 * Params are removed from the request object, as they have been consumed.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Object} [config.params] default param values
		 * @param {string} [config.template] default template
		 *
		 * @returns {Client}
		 */
		return interceptor({
			init: function (config) {
				config.params = config.params || {};
				config.template = config.template || '';
				return config;
			},
			request: function (request, config) {
				var template, params;

				template = request.path || config.template;
				params = mixin({}, request.params, config.params);

				request.path = uriTemplate.expand(template, params);
				delete request.params;

				return request;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../interceptor":13,"../util/mixin":28,"../util/uriTemplate":32}],19:[function(require,module,exports){
/*
* Copyright 2014 the original author or authors
* @license MIT, see LICENSE.txt for details
*
* @author Scott Andrews
*/

(function (define) {
	'use strict';

	var undef;

	define(function (/* require */) {

		/**
		 * Parse a MIME type into it's constituent parts
		 *
		 * @param {string} mime MIME type to parse
		 * @return {{
		 *   {string} raw the original MIME type
		 *   {string} type the type and subtype
		 *   {string} [suffix] mime suffix, including the plus, if any
		 *   {Object} params key/value pair of attributes
		 * }}
		 */
		function parse(mime) {
			var params, type;

			params = mime.split(';');
			type = params[0].trim().split('+');

			return {
				raw: mime,
				type: type[0],
				suffix: type[1] ? '+' + type[1] : '',
				params: params.slice(1).reduce(function (params, pair) {
					pair = pair.split('=');
					params[pair[0].trim()] = pair[1] ? pair[1].trim() : undef;
					return params;
				}, {})
			};
		}

		return {
			parse: parse
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],20:[function(require,module,exports){
/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var mime, when, registry;

		mime = require('../mime');
		when = require('when');

		function Registry(mimes) {

			/**
			 * Lookup the converter for a MIME type
			 *
			 * @param {string} type the MIME type
			 * @return a promise for the converter
			 */
			this.lookup = function lookup(type) {
				var parsed;

				parsed = typeof type === 'string' ? mime.parse(type) : type;

				if (mimes[parsed.raw]) {
					return mimes[parsed.raw];
				}
				if (mimes[parsed.type + parsed.suffix]) {
					return mimes[parsed.type + parsed.suffix];
				}
				if (mimes[parsed.type]) {
					return mimes[parsed.type];
				}
				if (mimes[parsed.suffix]) {
					return mimes[parsed.suffix];
				}

				return when.reject(new Error('Unable to locate converter for mime "' + parsed.raw + '"'));
			};

			/**
			 * Create a late dispatched proxy to the target converter.
			 *
			 * Common when a converter is registered under multiple names and
			 * should be kept in sync if updated.
			 *
			 * @param {string} type mime converter to dispatch to
			 * @returns converter whose read/write methods target the desired mime converter
			 */
			this.delegate = function delegate(type) {
				return {
					read: function () {
						var args = arguments;
						return this.lookup(type).then(function (converter) {
							return converter.read.apply(this, args);
						}.bind(this));
					}.bind(this),
					write: function () {
						var args = arguments;
						return this.lookup(type).then(function (converter) {
							return converter.write.apply(this, args);
						}.bind(this));
					}.bind(this)
				};
			};

			/**
			 * Register a custom converter for a MIME type
			 *
			 * @param {string} type the MIME type
			 * @param converter the converter for the MIME type
			 * @return a promise for the converter
			 */
			this.register = function register(type, converter) {
				mimes[type] = when(converter);
				return mimes[type];
			};

			/**
			 * Create a child registry whoes registered converters remain local, while
			 * able to lookup converters from its parent.
			 *
			 * @returns child MIME registry
			 */
			this.child = function child() {
				return new Registry(Object.create(mimes));
			};

		}

		registry = new Registry({});

		// include provided serializers
		registry.register('application/hal', require('./type/application/hal'));
		registry.register('application/json', require('./type/application/json'));
		registry.register('application/x-www-form-urlencoded', require('./type/application/x-www-form-urlencoded'));
		registry.register('multipart/form-data', require('./type/multipart/form-data'));
		registry.register('text/plain', require('./type/text/plain'));

		registry.register('+json', registry.delegate('application/json'));

		return registry;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../mime":19,"./type/application/hal":21,"./type/application/json":22,"./type/application/x-www-form-urlencoded":23,"./type/multipart/form-data":24,"./type/text/plain":25,"when":63}],21:[function(require,module,exports){
/*
 * Copyright 2013-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var pathPrefix, template, find, lazyPromise, responsePromise, when;

		pathPrefix = require('../../../interceptor/pathPrefix');
		template = require('../../../interceptor/template');
		find = require('../../../util/find');
		lazyPromise = require('../../../util/lazyPromise');
		responsePromise = require('../../../util/responsePromise');
		when = require('when');

		function defineProperty(obj, name, value) {
			Object.defineProperty(obj, name, {
				value: value,
				configurable: true,
				enumerable: false,
				writeable: true
			});
		}

		/**
		 * Hypertext Application Language serializer
		 *
		 * Implemented to https://tools.ietf.org/html/draft-kelly-json-hal-06
		 *
		 * As the spec is still a draft, this implementation will be updated as the
		 * spec evolves
		 *
		 * Objects are read as HAL indexing links and embedded objects on to the
		 * resource. Objects are written as plain JSON.
		 *
		 * Embedded relationships are indexed onto the resource by the relationship
		 * as a promise for the related resource.
		 *
		 * Links are indexed onto the resource as a lazy promise that will GET the
		 * resource when a handler is first registered on the promise.
		 *
		 * A `requestFor` method is added to the entity to make a request for the
		 * relationship.
		 *
		 * A `clientFor` method is added to the entity to get a full Client for a
		 * relationship.
		 *
		 * The `_links` and `_embedded` properties on the resource are made
		 * non-enumerable.
		 */
		return {

			read: function (str, opts) {
				var client, console;

				opts = opts || {};
				client = opts.client;
				console = opts.console || console;

				function deprecationWarning(relationship, deprecation) {
					if (deprecation && console && console.warn || console.log) {
						(console.warn || console.log).call(console, 'Relationship \'' + relationship + '\' is deprecated, see ' + deprecation);
					}
				}

				return opts.registry.lookup(opts.mime.suffix).then(function (converter) {
					return when(converter.read(str, opts)).then(function (root) {

						find.findProperties(root, '_embedded', function (embedded, resource, name) {
							Object.keys(embedded).forEach(function (relationship) {
								if (relationship in resource) { return; }
								var related = responsePromise({
									entity: embedded[relationship]
								});
								defineProperty(resource, relationship, related);
							});
							defineProperty(resource, name, embedded);
						});
						find.findProperties(root, '_links', function (links, resource, name) {
							Object.keys(links).forEach(function (relationship) {
								var link = links[relationship];
								if (relationship in resource) { return; }
								defineProperty(resource, relationship, responsePromise.make(lazyPromise(function () {
									if (link.deprecation) { deprecationWarning(relationship, link.deprecation); }
									if (link.templated === true) {
										return template(client)({ path: link.href });
									}
									return client({ path: link.href });
								})));
							});
							defineProperty(resource, name, links);
							defineProperty(resource, 'clientFor', function (relationship, clientOverride) {
								var link = links[relationship];
								if (!link) {
									throw new Error('Unknown relationship: ' + relationship);
								}
								if (link.deprecation) { deprecationWarning(relationship, link.deprecation); }
								if (link.templated === true) {
									return template(
										clientOverride || client,
										{ template: link.href }
									);
								}
								return pathPrefix(
									clientOverride || client,
									{ prefix: link.href }
								);
							});
							defineProperty(resource, 'requestFor', function (relationship, request, clientOverride) {
								var client = this.clientFor(relationship, clientOverride);
								return client(request);
							});
						});

						return root;
					});
				});

			},

			write: function (obj, opts) {
				return opts.registry.lookup(opts.mime.suffix).then(function (converter) {
					return converter.write(obj, opts);
				});
			}

		};
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"../../../interceptor/pathPrefix":17,"../../../interceptor/template":18,"../../../util/find":26,"../../../util/lazyPromise":27,"../../../util/responsePromise":30,"when":63}],22:[function(require,module,exports){
/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		/**
		 * Create a new JSON converter with custom reviver/replacer.
		 *
		 * The extended converter must be published to a MIME registry in order
		 * to be used. The existing converter will not be modified.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
		 *
		 * @param {function} [reviver=undefined] custom JSON.parse reviver
		 * @param {function|Array} [replacer=undefined] custom JSON.stringify replacer
		 */
		function createConverter(reviver, replacer) {
			return {

				read: function (str) {
					return JSON.parse(str, reviver);
				},

				write: function (obj) {
					return JSON.stringify(obj, replacer);
				},

				extend: createConverter

			};
		}

		return createConverter();

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],23:[function(require,module,exports){
/*
 * Copyright 2012 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		var encodedSpaceRE, urlEncodedSpaceRE;

		encodedSpaceRE = /%20/g;
		urlEncodedSpaceRE = /\+/g;

		function urlEncode(str) {
			str = encodeURIComponent(str);
			// spec says space should be encoded as '+'
			return str.replace(encodedSpaceRE, '+');
		}

		function urlDecode(str) {
			// spec says space should be encoded as '+'
			str = str.replace(urlEncodedSpaceRE, ' ');
			return decodeURIComponent(str);
		}

		function append(str, name, value) {
			if (Array.isArray(value)) {
				value.forEach(function (value) {
					str = append(str, name, value);
				});
			}
			else {
				if (str.length > 0) {
					str += '&';
				}
				str += urlEncode(name);
				if (value !== undefined && value !== null) {
					str += '=' + urlEncode(value);
				}
			}
			return str;
		}

		return {

			read: function (str) {
				var obj = {};
				str.split('&').forEach(function (entry) {
					var pair, name, value;
					pair = entry.split('=');
					name = urlDecode(pair[0]);
					if (pair.length === 2) {
						value = urlDecode(pair[1]);
					}
					else {
						value = null;
					}
					if (name in obj) {
						if (!Array.isArray(obj[name])) {
							// convert to an array, perserving currnent value
							obj[name] = [obj[name]];
						}
						obj[name].push(value);
					}
					else {
						obj[name] = value;
					}
				});
				return obj;
			},

			write: function (obj) {
				var str = '';
				Object.keys(obj).forEach(function (name) {
					str = append(str, name, obj[name]);
				});
				return str;
			}

		};
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],24:[function(require,module,exports){
/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Michael Jackson
 */

/* global FormData, File, Blob */

(function (define) {
	'use strict';

	define(function (/* require */) {

		function isFormElement(object) {
			return object &&
				object.nodeType === 1 && // Node.ELEMENT_NODE
				object.tagName === 'FORM';
		}

		function createFormDataFromObject(object) {
			var formData = new FormData();

			var value;
			for (var property in object) {
				if (object.hasOwnProperty(property)) {
					value = object[property];

					if (value instanceof File) {
						formData.append(property, value, value.name);
					} else if (value instanceof Blob) {
						formData.append(property, value);
					} else {
						formData.append(property, String(value));
					}
				}
			}

			return formData;
		}

		return {

			write: function (object) {
				if (typeof FormData === 'undefined') {
					throw new Error('The multipart/form-data mime serializer requires FormData support');
				}

				// Support FormData directly.
				if (object instanceof FormData) {
					return object;
				}

				// Support <form> elements.
				if (isFormElement(object)) {
					return new FormData(object);
				}

				// Support plain objects, may contain File/Blob as value.
				if (typeof object === 'object' && object !== null) {
					return createFormDataFromObject(object);
				}

				throw new Error('Unable to create FormData from object ' + object);
			}

		};
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],25:[function(require,module,exports){
/*
 * Copyright 2012 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		return {

			read: function (str) {
				return str;
			},

			write: function (obj) {
				return obj.toString();
			}

		};
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],26:[function(require,module,exports){
/*
 * Copyright 2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		return {

			/**
			 * Find objects within a graph the contain a property of a certain name.
			 *
			 * NOTE: this method will not discover object graph cycles.
			 *
			 * @param {*} obj object to search on
			 * @param {string} prop name of the property to search for
			 * @param {Function} callback function to receive the found properties and their parent
			 */
			findProperties: function findProperties(obj, prop, callback) {
				if (typeof obj !== 'object' || obj === null) { return; }
				if (prop in obj) {
					callback(obj[prop], obj, prop);
				}
				Object.keys(obj).forEach(function (key) {
					findProperties(obj[key], prop, callback);
				});
			}

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],27:[function(require,module,exports){
/*
 * Copyright 2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var when;

		when = require('when');

		/**
		 * Create a promise whose work is started only when a handler is registered.
		 *
		 * The work function will be invoked at most once. Thrown values will result
		 * in promise rejection.
		 *
		 * @param {Function} work function whose ouput is used to resolve the
		 *   returned promise.
		 * @returns {Promise} a lazy promise
		 */
		function lazyPromise(work) {
			var defer, started, resolver, promise, then;

			defer = when.defer();
			started = false;

			resolver = defer.resolver;
			promise = defer.promise;
			then = promise.then;

			promise.then = function () {
				if (!started) {
					started = true;
					when.attempt(work).then(resolver.resolve, resolver.reject);
				}
				return then.apply(promise, arguments);
			};

			return promise;
		}

		return lazyPromise;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"when":63}],28:[function(require,module,exports){
/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	// derived from dojo.mixin
	define(function (/* require */) {

		var empty = {};

		/**
		 * Mix the properties from the source object into the destination object.
		 * When the same property occurs in more then one object, the right most
		 * value wins.
		 *
		 * @param {Object} dest the object to copy properties to
		 * @param {Object} sources the objects to copy properties from.  May be 1 to N arguments, but not an Array.
		 * @return {Object} the destination object
		 */
		function mixin(dest /*, sources... */) {
			var i, l, source, name;

			if (!dest) { dest = {}; }
			for (i = 1, l = arguments.length; i < l; i += 1) {
				source = arguments[i];
				for (name in source) {
					if (!(name in dest) || (dest[name] !== source[name] && (!(name in empty) || empty[name] !== source[name]))) {
						dest[name] = source[name];
					}
				}
			}

			return dest; // Object
		}

		return mixin;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],29:[function(require,module,exports){
/*
 * Copyright 2012 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		/**
		 * Normalize HTTP header names using the pseudo camel case.
		 *
		 * For example:
		 *   content-type         -> Content-Type
		 *   accepts              -> Accepts
		 *   x-custom-header-name -> X-Custom-Header-Name
		 *
		 * @param {string} name the raw header name
		 * @return {string} the normalized header name
		 */
		function normalizeHeaderName(name) {
			return name.toLowerCase()
				.split('-')
				.map(function (chunk) { return chunk.charAt(0).toUpperCase() + chunk.slice(1); })
				.join('-');
		}

		return normalizeHeaderName;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],30:[function(require,module,exports){
/*
 * Copyright 2014-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var when = require('when'),
			normalizeHeaderName = require('./normalizeHeaderName');

		function property(promise, name) {
			return promise.then(
				function (value) {
					return value && value[name];
				},
				function (value) {
					return when.reject(value && value[name]);
				}
			);
		}

		/**
		 * Obtain the response entity
		 *
		 * @returns {Promise} for the response entity
		 */
		function entity() {
			/*jshint validthis:true */
			return property(this, 'entity');
		}

		/**
		 * Obtain the response status
		 *
		 * @returns {Promise} for the response status
		 */
		function status() {
			/*jshint validthis:true */
			return property(property(this, 'status'), 'code');
		}

		/**
		 * Obtain the response headers map
		 *
		 * @returns {Promise} for the response headers map
		 */
		function headers() {
			/*jshint validthis:true */
			return property(this, 'headers');
		}

		/**
		 * Obtain a specific response header
		 *
		 * @param {String} headerName the header to retrieve
		 * @returns {Promise} for the response header's value
		 */
		function header(headerName) {
			/*jshint validthis:true */
			headerName = normalizeHeaderName(headerName);
			return property(this.headers(), headerName);
		}

		/**
		 * Follow a related resource
		 *
		 * The relationship to follow may be define as a plain string, an object
		 * with the rel and params, or an array containing one or more entries
		 * with the previous forms.
		 *
		 * Examples:
		 *   response.follow('next')
		 *
		 *   response.follow({ rel: 'next', params: { pageSize: 100 } })
		 *
		 *   response.follow([
		 *       { rel: 'items', params: { projection: 'noImages' } },
		 *       'search',
		 *       { rel: 'findByGalleryIsNull', params: { projection: 'noImages' } },
		 *       'items'
		 *   ])
		 *
		 * @param {String|Object|Array} rels one, or more, relationships to follow
		 * @returns ResponsePromise<Response> related resource
		 */
		function follow(rels) {
			/*jshint validthis:true */
			rels = [].concat(rels);
			return make(when.reduce(rels, function (response, rel) {
				if (typeof rel === 'string') {
					rel = { rel: rel };
				}
				if (typeof response.entity.clientFor !== 'function') {
					throw new Error('Hypermedia response expected');
				}
				var client = response.entity.clientFor(rel.rel);
				return client({ params: rel.params });
			}, this));
		}

		/**
		 * Wrap a Promise as an ResponsePromise
		 *
		 * @param {Promise<Response>} promise the promise for an HTTP Response
		 * @returns {ResponsePromise<Response>} wrapped promise for Response with additional helper methods
		 */
		function make(promise) {
			promise.status = status;
			promise.headers = headers;
			promise.header = header;
			promise.entity = entity;
			promise.follow = follow;
			return promise;
		}

		function responsePromise() {
			return make(when.apply(when, arguments));
		}

		responsePromise.make = make;
		responsePromise.reject = function (val) {
			return make(when.reject(val));
		};
		responsePromise.promise = function (func) {
			return make(when.promise(func));
		};

		return responsePromise;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"./normalizeHeaderName":29,"when":63}],31:[function(require,module,exports){
/*
 * Copyright 2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (/* require */) {

		var charMap;

		charMap = (function () {
			var strings = {
				alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
				digit: '0123456789'
			};

			strings.genDelims = ':/?#[]@';
			strings.subDelims = '!$&\'()*+,;=';
			strings.reserved = strings.genDelims + strings.subDelims;
			strings.unreserved = strings.alpha + strings.digit + '-._~';
			strings.url = strings.reserved + strings.unreserved;
			strings.scheme = strings.alpha + strings.digit + '+-.';
			strings.userinfo = strings.unreserved + strings.subDelims + ':';
			strings.host = strings.unreserved + strings.subDelims;
			strings.port = strings.digit;
			strings.pchar = strings.unreserved + strings.subDelims + ':@';
			strings.segment = strings.pchar;
			strings.path = strings.segment + '/';
			strings.query = strings.pchar + '/?';
			strings.fragment = strings.pchar + '/?';

			return Object.keys(strings).reduce(function (charMap, set) {
				charMap[set] = strings[set].split('').reduce(function (chars, myChar) {
					chars[myChar] = true;
					return chars;
				}, {});
				return charMap;
			}, {});
		}());

		function encode(str, allowed) {
			if (typeof str !== 'string') {
				throw new Error('String required for URL encoding');
			}
			return str.split('').map(function (myChar) {
				if (allowed.hasOwnProperty(myChar)) {
					return myChar;
				}
				var code = myChar.charCodeAt(0);
				if (code <= 127) {
					return '%' + code.toString(16).toUpperCase();
				}
				else {
					return encodeURIComponent(myChar).toUpperCase();
				}
			}).join('');
		}

		function makeEncoder(allowed) {
			allowed = allowed || charMap.unreserved;
			return function (str) {
				return encode(str, allowed);
			};
		}

		function decode(str) {
			return decodeURIComponent(str);
		}

		return {

			/*
			 * Decode URL encoded strings
			 *
			 * @param {string} URL encoded string
			 * @returns {string} URL decoded string
			 */
			decode: decode,

			/*
			 * URL encode a string
			 *
			 * All but alpha-numerics and a very limited set of punctuation - . _ ~ are
			 * encoded.
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encode: makeEncoder(),

			/*
			* URL encode a URL
			*
			* All character permitted anywhere in a URL are left unencoded even
			* if that character is not permitted in that portion of a URL.
			*
			* Note: This method is typically not what you want.
			*
			* @param {string} string to encode
			* @returns {string} URL encoded string
			*/
			encodeURL: makeEncoder(charMap.url),

			/*
			 * URL encode the scheme portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodeScheme: makeEncoder(charMap.scheme),

			/*
			 * URL encode the user info portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodeUserInfo: makeEncoder(charMap.userinfo),

			/*
			 * URL encode the host portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodeHost: makeEncoder(charMap.host),

			/*
			 * URL encode the port portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodePort: makeEncoder(charMap.port),

			/*
			 * URL encode a path segment portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodePathSegment: makeEncoder(charMap.segment),

			/*
			 * URL encode the path portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodePath: makeEncoder(charMap.path),

			/*
			 * URL encode the query portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodeQuery: makeEncoder(charMap.query),

			/*
			 * URL encode the fragment portion of a URL
			 *
			 * @param {string} string to encode
			 * @returns {string} URL encoded string
			 */
			encodeFragment: makeEncoder(charMap.fragment)

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{}],32:[function(require,module,exports){
/*
 * Copyright 2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	var undef;

	define(function (require) {

		var uriEncoder, operations, prefixRE;

		uriEncoder = require('./uriEncoder');

		prefixRE = /^([^:]*):([0-9]+)$/;
		operations = {
			'':  { first: '',  separator: ',', named: false, empty: '',  encoder: uriEncoder.encode },
			'+': { first: '',  separator: ',', named: false, empty: '',  encoder: uriEncoder.encodeURL },
			'#': { first: '#', separator: ',', named: false, empty: '',  encoder: uriEncoder.encodeURL },
			'.': { first: '.', separator: '.', named: false, empty: '',  encoder: uriEncoder.encode },
			'/': { first: '/', separator: '/', named: false, empty: '',  encoder: uriEncoder.encode },
			';': { first: ';', separator: ';', named: true,  empty: '',  encoder: uriEncoder.encode },
			'?': { first: '?', separator: '&', named: true,  empty: '=', encoder: uriEncoder.encode },
			'&': { first: '&', separator: '&', named: true,  empty: '=', encoder: uriEncoder.encode },
			'=': { reserved: true },
			',': { reserved: true },
			'!': { reserved: true },
			'@': { reserved: true },
			'|': { reserved: true }
		};

		function apply(operation, expression, params) {
			/*jshint maxcomplexity:11 */
			return expression.split(',').reduce(function (result, variable) {
				var opts, value;

				opts = {};
				if (variable.slice(-1) === '*') {
					variable = variable.slice(0, -1);
					opts.explode = true;
				}
				if (prefixRE.test(variable)) {
					var prefix = prefixRE.exec(variable);
					variable = prefix[1];
					opts.maxLength = parseInt(prefix[2]);
				}

				variable = uriEncoder.decode(variable);
				value = params[variable];

				if (value === undef || value === null) {
					return result;
				}
				if (Array.isArray(value)) {
					result += value.reduce(function (result, value) {
						if (result.length) {
							result += opts.explode ? operation.separator : ',';
							if (operation.named && opts.explode) {
								result += operation.encoder(variable);
								result += value.length ? '=' : operation.empty;
							}
						}
						else {
							result += operation.first;
							if (operation.named) {
								result += operation.encoder(variable);
								result += value.length ? '=' : operation.empty;
							}
						}
						result += operation.encoder(value);
						return result;
					}, '');
				}
				else if (typeof value === 'object') {
					result += Object.keys(value).reduce(function (result, name) {
						if (result.length) {
							result += opts.explode ? operation.separator : ',';
						}
						else {
							result += operation.first;
							if (operation.named && !opts.explode) {
								result += operation.encoder(variable);
								result += value[name].length ? '=' : operation.empty;
							}
						}
						result += operation.encoder(name);
						result += opts.explode ? '=' : ',';
						result += operation.encoder(value[name]);
						return result;
					}, '');
				}
				else {
					value = String(value);
					if (opts.maxLength) {
						value = value.slice(0, opts.maxLength);
					}
					result += result.length ? operation.separator : operation.first;
					if (operation.named) {
						result += operation.encoder(variable);
						result += value.length ? '=' : operation.empty;
					}
					result += operation.encoder(value);
				}

				return result;
			}, '');
		}

		function expandExpression(expression, params) {
			var operation;

			operation = operations[expression.slice(0,1)];
			if (operation) {
				expression = expression.slice(1);
			}
			else {
				operation = operations[''];
			}

			if (operation.reserved) {
				throw new Error('Reserved expression operations are not supported');
			}

			return apply(operation, expression, params);
		}

		function expandTemplate(template, params) {
			var start, end, uri;

			uri = '';
			end = 0;
			while (true) {
				start = template.indexOf('{', end);
				if (start === -1) {
					// no more expressions
					uri += template.slice(end);
					break;
				}
				uri += template.slice(end, start);
				end = template.indexOf('}', start) + 1;
				uri += expandExpression(template.slice(start + 1, end - 1), params);
			}

			return uri;
		}

		return {

			/**
			 * Expand a URI Template with parameters to form a URI.
			 *
			 * Full implementation (level 4) of rfc6570.
			 * @see https://tools.ietf.org/html/rfc6570
			 *
			 * @param {string} template URI template
			 * @param {Object} [params] params to apply to the template durring expantion
			 * @returns {string} expanded URI
			 */
			expand: expandTemplate

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));

},{"./uriEncoder":31}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultParams = {
  title: '',
  text: '',
  type: null,
  allowOutsideClick: false,
  showConfirmButton: true,
  showCancelButton: false,
  closeOnConfirm: true,
  closeOnCancel: true,
  confirmButtonText: 'OK',
  confirmButtonColor: '#8CD4F5',
  cancelButtonText: 'Cancel',
  imageUrl: null,
  imageSize: null,
  timer: null,
  customClass: '',
  html: false,
  animation: true,
  allowEscapeKey: true,
  inputType: 'text',
  inputPlaceholder: '',
  inputValue: '',
  showLoaderOnConfirm: false
};

exports['default'] = defaultParams;
module.exports = exports['default'];
},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _colorLuminance = require('./utils');

var _getModal = require('./handle-swal-dom');

var _hasClass$isDescendant = require('./handle-dom');

/*
 * User clicked on "Confirm"/"OK" or "Cancel"
 */
var handleButton = function handleButton(event, params, modal) {
  var e = event || window.event;
  var target = e.target || e.srcElement;

  var targetedConfirm = target.className.indexOf('confirm') !== -1;
  var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
  var modalIsVisible = _hasClass$isDescendant.hasClass(modal, 'visible');
  var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';

  // Since the user can change the background-color of the confirm button programmatically,
  // we must calculate what the color should be on hover/active
  var normalColor, hoverColor, activeColor;
  if (targetedConfirm && params.confirmButtonColor) {
    normalColor = params.confirmButtonColor;
    hoverColor = _colorLuminance.colorLuminance(normalColor, -0.04);
    activeColor = _colorLuminance.colorLuminance(normalColor, -0.14);
  }

  function shouldSetConfirmButtonColor(color) {
    if (targetedConfirm && params.confirmButtonColor) {
      target.style.backgroundColor = color;
    }
  }

  switch (e.type) {
    case 'mouseover':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'mouseout':
      shouldSetConfirmButtonColor(normalColor);
      break;

    case 'mousedown':
      shouldSetConfirmButtonColor(activeColor);
      break;

    case 'mouseup':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'focus':
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');

      if (targetedConfirm) {
        $cancelButton.style.boxShadow = 'none';
      } else {
        $confirmButton.style.boxShadow = 'none';
      }
      break;

    case 'click':
      var clickedOnModal = modal === target;
      var clickedOnModalChild = _hasClass$isDescendant.isDescendant(modal, target);

      // Ignore click outside if allowOutsideClick is false
      if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
        break;
      }

      if (targetedConfirm && doneFunctionExists && modalIsVisible) {
        handleConfirm(modal, params);
      } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
        handleCancel(modal, params);
      } else if (_hasClass$isDescendant.isDescendant(modal, target) && target.tagName === 'BUTTON') {
        sweetAlert.close();
      }
      break;
  }
};

/*
 *  User clicked on "Confirm"/"OK"
 */
var handleConfirm = function handleConfirm(modal, params) {
  var callbackValue = true;

  if (_hasClass$isDescendant.hasClass(modal, 'show-input')) {
    callbackValue = modal.querySelector('input').value;

    if (!callbackValue) {
      callbackValue = '';
    }
  }

  params.doneFunction(callbackValue);

  if (params.closeOnConfirm) {
    sweetAlert.close();
  }
  // Disable cancel and confirm button if the parameter is true
  if (params.showLoaderOnConfirm) {
    sweetAlert.disableButtons();
  }
};

/*
 *  User clicked on "Cancel"
 */
var handleCancel = function handleCancel(modal, params) {
  // Check if callback function expects a parameter (to track cancel actions)
  var functionAsStr = String(params.doneFunction).replace(/\s/g, '');
  var functionHandlesCancel = functionAsStr.substring(0, 9) === 'function(' && functionAsStr.substring(9, 10) !== ')';

  if (functionHandlesCancel) {
    params.doneFunction(false);
  }

  if (params.closeOnCancel) {
    sweetAlert.close();
  }
};

exports['default'] = {
  handleButton: handleButton,
  handleConfirm: handleConfirm,
  handleCancel: handleCancel
};
module.exports = exports['default'];
},{"./handle-dom":35,"./handle-swal-dom":37,"./utils":40}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var hasClass = function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
};

var addClass = function addClass(elem, className) {
  if (!hasClass(elem, className)) {
    elem.className += ' ' + className;
  }
};

var removeClass = function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  }
};

var escapeHtml = function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

var _show = function _show(elem) {
  elem.style.opacity = '';
  elem.style.display = 'block';
};

var show = function show(elems) {
  if (elems && !elems.length) {
    return _show(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _show(elems[i]);
  }
};

var _hide = function _hide(elem) {
  elem.style.opacity = '';
  elem.style.display = 'none';
};

var hide = function hide(elems) {
  if (elems && !elems.length) {
    return _hide(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _hide(elems[i]);
  }
};

var isDescendant = function isDescendant(parent, child) {
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

var getTopMargin = function getTopMargin(elem) {
  elem.style.left = '-9999px';
  elem.style.display = 'block';

  var height = elem.clientHeight,
      padding;
  if (typeof getComputedStyle !== 'undefined') {
    // IE 8
    padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
  } else {
    padding = parseInt(elem.currentStyle.padding);
  }

  elem.style.left = '';
  elem.style.display = 'none';
  return '-' + parseInt((height + padding) / 2) + 'px';
};

var fadeIn = function fadeIn(elem, interval) {
  if (+elem.style.opacity < 1) {
    interval = interval || 16;
    elem.style.opacity = 0;
    elem.style.display = 'block';
    var last = +new Date();
    var tick = (function (_tick) {
      function tick() {
        return _tick.apply(this, arguments);
      }

      tick.toString = function () {
        return _tick.toString();
      };

      return tick;
    })(function () {
      elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
      last = +new Date();

      if (+elem.style.opacity < 1) {
        setTimeout(tick, interval);
      }
    });
    tick();
  }
  elem.style.display = 'block'; //fallback IE8
};

var fadeOut = function fadeOut(elem, interval) {
  interval = interval || 16;
  elem.style.opacity = 1;
  var last = +new Date();
  var tick = (function (_tick2) {
    function tick() {
      return _tick2.apply(this, arguments);
    }

    tick.toString = function () {
      return _tick2.toString();
    };

    return tick;
  })(function () {
    elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
    last = +new Date();

    if (+elem.style.opacity > 0) {
      setTimeout(tick, interval);
    } else {
      elem.style.display = 'none';
    }
  });
  tick();
};

var fireClick = function fireClick(node) {
  // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
  // Then fixed for today's Chrome browser.
  if (typeof MouseEvent === 'function') {
    // Up-to-date approach
    var mevt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    node.dispatchEvent(mevt);
  } else if (document.createEvent) {
    // Fallback
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', false, false);
    node.dispatchEvent(evt);
  } else if (document.createEventObject) {
    node.fireEvent('onclick');
  } else if (typeof node.onclick === 'function') {
    node.onclick();
  }
};

var stopEventPropagation = function stopEventPropagation(e) {
  // In particular, make sure the space bar doesn't scroll the main window.
  if (typeof e.stopPropagation === 'function') {
    e.stopPropagation();
    e.preventDefault();
  } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
    window.event.cancelBubble = true;
  }
};

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.escapeHtml = escapeHtml;
exports._show = _show;
exports.show = show;
exports._hide = _hide;
exports.hide = hide;
exports.isDescendant = isDescendant;
exports.getTopMargin = getTopMargin;
exports.fadeIn = fadeIn;
exports.fadeOut = fadeOut;
exports.fireClick = fireClick;
exports.stopEventPropagation = stopEventPropagation;
},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _stopEventPropagation$fireClick = require('./handle-dom');

var _setFocusStyle = require('./handle-swal-dom');

var handleKeyDown = function handleKeyDown(event, params, modal) {
  var e = event || window.event;
  var keyCode = e.keyCode || e.which;

  var $okButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  var $modalButtons = modal.querySelectorAll('button[tabindex]');

  if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
    // Don't do work on keys we don't care about.
    return;
  }

  var $targetElement = e.target || e.srcElement;

  var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
  for (var i = 0; i < $modalButtons.length; i++) {
    if ($targetElement === $modalButtons[i]) {
      btnIndex = i;
      break;
    }
  }

  if (keyCode === 9) {
    // TAB
    if (btnIndex === -1) {
      // No button focused. Jump to the confirm button.
      $targetElement = $okButton;
    } else {
      // Cycle to the next button
      if (btnIndex === $modalButtons.length - 1) {
        $targetElement = $modalButtons[0];
      } else {
        $targetElement = $modalButtons[btnIndex + 1];
      }
    }

    _stopEventPropagation$fireClick.stopEventPropagation(e);
    $targetElement.focus();

    if (params.confirmButtonColor) {
      _setFocusStyle.setFocusStyle($targetElement, params.confirmButtonColor);
    }
  } else {
    if (keyCode === 13) {
      if ($targetElement.tagName === 'INPUT') {
        $targetElement = $okButton;
        $okButton.focus();
      }

      if (btnIndex === -1) {
        // ENTER/SPACE clicked outside of a button.
        $targetElement = $okButton;
      } else {
        // Do nothing - let the browser handle it.
        $targetElement = undefined;
      }
    } else if (keyCode === 27 && params.allowEscapeKey === true) {
      $targetElement = $cancelButton;
      _stopEventPropagation$fireClick.fireClick($targetElement, e);
    } else {
      // Fallback - let the browser handle it.
      $targetElement = undefined;
    }
  }
};

exports['default'] = handleKeyDown;
module.exports = exports['default'];
},{"./handle-dom":35,"./handle-swal-dom":37}],37:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _hexToRgb = require('./utils');

var _removeClass$getTopMargin$fadeIn$show$addClass = require('./handle-dom');

var _defaultParams = require('./default-params');

var _defaultParams2 = _interopRequireWildcard(_defaultParams);

/*
 * Add modal + overlay to DOM
 */

var _injectedHTML = require('./injected-html');

var _injectedHTML2 = _interopRequireWildcard(_injectedHTML);

var modalClass = '.sweet-alert';
var overlayClass = '.sweet-overlay';

var sweetAlertInitialize = function sweetAlertInitialize() {
  var sweetWrap = document.createElement('div');
  sweetWrap.innerHTML = _injectedHTML2['default'];

  // Append elements to body
  while (sweetWrap.firstChild) {
    document.body.appendChild(sweetWrap.firstChild);
  }
};

/*
 * Get DOM element of modal
 */
var getModal = (function (_getModal) {
  function getModal() {
    return _getModal.apply(this, arguments);
  }

  getModal.toString = function () {
    return _getModal.toString();
  };

  return getModal;
})(function () {
  var $modal = document.querySelector(modalClass);

  if (!$modal) {
    sweetAlertInitialize();
    $modal = getModal();
  }

  return $modal;
});

/*
 * Get DOM element of input (in modal)
 */
var getInput = function getInput() {
  var $modal = getModal();
  if ($modal) {
    return $modal.querySelector('input');
  }
};

/*
 * Get DOM element of overlay
 */
var getOverlay = function getOverlay() {
  return document.querySelector(overlayClass);
};

/*
 * Add box-shadow style to button (depending on its chosen bg-color)
 */
var setFocusStyle = function setFocusStyle($button, bgColor) {
  var rgbColor = _hexToRgb.hexToRgb(bgColor);
  $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
};

/*
 * Animation when opening modal
 */
var openModal = function openModal(callback) {
  var $modal = getModal();
  _removeClass$getTopMargin$fadeIn$show$addClass.fadeIn(getOverlay(), 10);
  _removeClass$getTopMargin$fadeIn$show$addClass.show($modal);
  _removeClass$getTopMargin$fadeIn$show$addClass.addClass($modal, 'showSweetAlert');
  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($modal, 'hideSweetAlert');

  window.previousActiveElement = document.activeElement;
  var $okButton = $modal.querySelector('button.confirm');
  $okButton.focus();

  setTimeout(function () {
    _removeClass$getTopMargin$fadeIn$show$addClass.addClass($modal, 'visible');
  }, 500);

  var timer = $modal.getAttribute('data-timer');

  if (timer !== 'null' && timer !== '') {
    var timerCallback = callback;
    $modal.timeout = setTimeout(function () {
      var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
      if (doneFunctionExists) {
        timerCallback(null);
      } else {
        sweetAlert.close();
      }
    }, timer);
  }
};

/*
 * Reset the styling of the input
 * (for example if errors have been shown)
 */
var resetInput = function resetInput() {
  var $modal = getModal();
  var $input = getInput();

  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($modal, 'show-input');
  $input.value = _defaultParams2['default'].inputValue;
  $input.setAttribute('type', _defaultParams2['default'].inputType);
  $input.setAttribute('placeholder', _defaultParams2['default'].inputPlaceholder);

  resetInputError();
};

var resetInputError = function resetInputError(event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = getModal();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($errorContainer, 'show');
};

/*
 * Set "margin-top"-property on modal based on its computed height
 */
var fixVerticalPosition = function fixVerticalPosition() {
  var $modal = getModal();
  $modal.style.marginTop = _removeClass$getTopMargin$fadeIn$show$addClass.getTopMargin(getModal());
};

exports.sweetAlertInitialize = sweetAlertInitialize;
exports.getModal = getModal;
exports.getOverlay = getOverlay;
exports.getInput = getInput;
exports.setFocusStyle = setFocusStyle;
exports.openModal = openModal;
exports.resetInput = resetInput;
exports.resetInputError = resetInputError;
exports.fixVerticalPosition = fixVerticalPosition;
},{"./default-params":33,"./handle-dom":35,"./injected-html":38,"./utils":40}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var injectedHTML =

// Dark overlay
"<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +

// Modal
"<div class=\"sweet-alert\">" +

// Error icon
"<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +

// Warning icon
"<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +

// Info icon
"<div class=\"sa-icon sa-info\"></div>" +

// Success icon
"<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +

// Title, text and input
"<h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type=\"text\" tabIndex=\"3\" />\n      <div class=\"sa-input-error\"></div>\n    </fieldset>" +

// Input errors
"<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +

// Cancel and confirm buttons
"<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +

// Loading animation
"<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +

// End of modal
"</div>";

exports["default"] = injectedHTML;
module.exports = exports["default"];
},{}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _isIE8 = require('./utils');

var _getModal$getInput$setFocusStyle = require('./handle-swal-dom');

var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide = require('./handle-dom');

var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];

/*
 * Set type, text and actions on modal
 */
var setParameters = function setParameters(params) {
  var modal = _getModal$getInput$setFocusStyle.getModal();

  var $title = modal.querySelector('h2');
  var $text = modal.querySelector('p');
  var $cancelBtn = modal.querySelector('button.cancel');
  var $confirmBtn = modal.querySelector('button.confirm');

  /*
   * Title
   */
  $title.innerHTML = params.html ? params.title : _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.title).split('\n').join('<br>');

  /*
   * Text
   */
  $text.innerHTML = params.html ? params.text : _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.text || '').split('\n').join('<br>');
  if (params.text) _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($text);

  /*
   * Custom class
   */
  if (params.customClass) {
    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass(modal, params.customClass);
    modal.setAttribute('data-custom-class', params.customClass);
  } else {
    // Find previously set classes and remove them
    var customClass = modal.getAttribute('data-custom-class');
    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.removeClass(modal, customClass);
    modal.setAttribute('data-custom-class', '');
  }

  /*
   * Icon
   */
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide(modal.querySelectorAll('.sa-icon'));

  if (params.type && !_isIE8.isIE8()) {
    var _ret = (function () {

      var validType = false;

      for (var i = 0; i < alertTypes.length; i++) {
        if (params.type === alertTypes[i]) {
          validType = true;
          break;
        }
      }

      if (!validType) {
        logStr('Unknown alert type: ' + params.type);
        return {
          v: false
        };
      }

      var typesWithIcons = ['success', 'error', 'warning', 'info'];
      var $icon = undefined;

      if (typesWithIcons.indexOf(params.type) !== -1) {
        $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($icon);
      }

      var $input = _getModal$getInput$setFocusStyle.getInput();

      // Animate icon
      switch (params.type) {

        case 'success':
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'animate');
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-tip'), 'animateSuccessTip');
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-long'), 'animateSuccessLong');
          break;

        case 'error':
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'animateErrorIcon');
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-x-mark'), 'animateXMark');
          break;

        case 'warning':
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'pulseWarning');
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-body'), 'pulseWarningIns');
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-dot'), 'pulseWarningIns');
          break;

        case 'input':
        case 'prompt':
          $input.setAttribute('type', params.inputType);
          $input.value = params.inputValue;
          $input.setAttribute('placeholder', params.inputPlaceholder);
          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass(modal, 'show-input');
          setTimeout(function () {
            $input.focus();
            $input.addEventListener('keyup', swal.resetInputError);
          }, 400);
          break;
      }
    })();

    if (typeof _ret === 'object') {
      return _ret.v;
    }
  }

  /*
   * Custom image
   */
  if (params.imageUrl) {
    var $customIcon = modal.querySelector('.sa-icon.sa-custom');

    $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($customIcon);

    var _imgWidth = 80;
    var _imgHeight = 80;

    if (params.imageSize) {
      var dimensions = params.imageSize.toString().split('x');
      var imgWidth = dimensions[0];
      var imgHeight = dimensions[1];

      if (!imgWidth || !imgHeight) {
        logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
      } else {
        _imgWidth = imgWidth;
        _imgHeight = imgHeight;
      }
    }

    $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
  }

  /*
   * Show cancel button?
   */
  modal.setAttribute('data-has-cancel-button', params.showCancelButton);
  if (params.showCancelButton) {
    $cancelBtn.style.display = 'inline-block';
  } else {
    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide($cancelBtn);
  }

  /*
   * Show confirm button?
   */
  modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
  if (params.showConfirmButton) {
    $confirmBtn.style.display = 'inline-block';
  } else {
    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide($confirmBtn);
  }

  /*
   * Custom text on cancel/confirm buttons
   */
  if (params.cancelButtonText) {
    $cancelBtn.innerHTML = _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.cancelButtonText);
  }
  if (params.confirmButtonText) {
    $confirmBtn.innerHTML = _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.confirmButtonText);
  }

  /*
   * Custom color on confirm button
   */
  if (params.confirmButtonColor) {
    // Set confirm button to selected background color
    $confirmBtn.style.backgroundColor = params.confirmButtonColor;

    // Set the confirm button color to the loading ring
    $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
    $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;

    // Set box-shadow to default focused button
    _getModal$getInput$setFocusStyle.setFocusStyle($confirmBtn, params.confirmButtonColor);
  }

  /*
   * Allow outside click
   */
  modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);

  /*
   * Callback function
   */
  var hasDoneFunction = params.doneFunction ? true : false;
  modal.setAttribute('data-has-done-function', hasDoneFunction);

  /*
   * Animation
   */
  if (!params.animation) {
    modal.setAttribute('data-animation', 'none');
  } else if (typeof params.animation === 'string') {
    modal.setAttribute('data-animation', params.animation); // Custom animation
  } else {
    modal.setAttribute('data-animation', 'pop');
  }

  /*
   * Timer
   */
  modal.setAttribute('data-timer', params.timer);
};

exports['default'] = setParameters;
module.exports = exports['default'];
},{"./handle-dom":35,"./handle-swal-dom":37,"./utils":40}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/*
 * Allow user to pass their own params
 */
var extend = function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/*
 * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
 */
var hexToRgb = function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
};

/*
 * Check if the user is using Internet Explorer 8 (for fallbacks)
 */
var isIE8 = function isIE8() {
  return window.attachEvent && !window.addEventListener;
};

/*
 * IE compatible logging for developers
 */
var logStr = function logStr(string) {
  if (window.console) {
    // IE...
    window.console.log('SweetAlert: ' + string);
  }
};

/*
 * Set hover, active and focus-states for buttons 
 * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
 */
var colorLuminance = function colorLuminance(hex, lum) {
  // Validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // Convert to decimal and change luminosity
  var rgb = '#';
  var c;
  var i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }

  return rgb;
};

exports.extend = extend;
exports.hexToRgb = hexToRgb;
exports.isIE8 = isIE8;
exports.logStr = logStr;
exports.colorLuminance = colorLuminance;
},{}],41:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
// SweetAlert
// 2014-2015 (c) - Tristan Edwards
// github.com/t4t5/sweetalert

/*
 * jQuery-like functions for manipulating the DOM
 */

var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation = require('./modules/handle-dom');

/*
 * Handy utilities
 */

var _extend$hexToRgb$isIE8$logStr$colorLuminance = require('./modules/utils');

/*
 *  Handle sweetAlert's DOM elements
 */

var _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition = require('./modules/handle-swal-dom');

// Handle button events and keyboard events

var _handleButton$handleConfirm$handleCancel = require('./modules/handle-click');

var _handleKeyDown = require('./modules/handle-key');

var _handleKeyDown2 = _interopRequireWildcard(_handleKeyDown);

// Default values

var _defaultParams = require('./modules/default-params');

var _defaultParams2 = _interopRequireWildcard(_defaultParams);

var _setParameters = require('./modules/set-params');

var _setParameters2 = _interopRequireWildcard(_setParameters);

/*
 * Remember state in cases where opening and handling a modal will fiddle with it.
 * (We also use window.previousActiveElement as a global variable)
 */
var previousWindowKeyDown;
var lastFocusedButton;

/*
 * Global sweetAlert function
 * (this is what the user calls)
 */
var sweetAlert, swal;

exports['default'] = sweetAlert = swal = function () {
  var customizations = arguments[0];

  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass(document.body, 'stop-scrolling');
  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.resetInput();

  /*
   * Use argument if defined or default value from params object otherwise.
   * Supports the case where a default value is boolean true and should be
   * overridden by a corresponding explicit argument which is boolean false.
   */
  function argumentOrDefault(key) {
    var args = customizations;
    return args[key] === undefined ? _defaultParams2['default'][key] : args[key];
  }

  if (customizations === undefined) {
    _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('SweetAlert expects at least 1 attribute!');
    return false;
  }

  var params = _extend$hexToRgb$isIE8$logStr$colorLuminance.extend({}, _defaultParams2['default']);

  switch (typeof customizations) {

    // Ex: swal("Hello", "Just testing", "info");
    case 'string':
      params.title = customizations;
      params.text = arguments[1] || '';
      params.type = arguments[2] || '';
      break;

    // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
    case 'object':
      if (customizations.title === undefined) {
        _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('Missing "title" argument!');
        return false;
      }

      params.title = customizations.title;

      for (var customName in _defaultParams2['default']) {
        params[customName] = argumentOrDefault(customName);
      }

      // Show "Confirm" instead of "OK" if cancel button is visible
      params.confirmButtonText = params.showCancelButton ? 'Confirm' : _defaultParams2['default'].confirmButtonText;
      params.confirmButtonText = argumentOrDefault('confirmButtonText');

      // Callback function when clicking on "OK"/"Cancel"
      params.doneFunction = arguments[1] || null;

      break;

    default:
      _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('Unexpected type of argument! Expected "string" or "object", got ' + typeof customizations);
      return false;

  }

  _setParameters2['default'](params);
  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.fixVerticalPosition();
  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.openModal(arguments[1]);

  // Modal interactions
  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

  /*
   * Make sure all modal buttons respond to all events
   */
  var $buttons = modal.querySelectorAll('button');
  var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
  var onButtonEvent = function onButtonEvent(e) {
    return _handleButton$handleConfirm$handleCancel.handleButton(e, params, modal);
  };

  for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
    for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
      var btnEvt = buttonEvents[evtIndex];
      $buttons[btnIndex][btnEvt] = onButtonEvent;
    }
  }

  // Clicking outside the modal dismisses it (if allowed by user)
  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getOverlay().onclick = onButtonEvent;

  previousWindowKeyDown = window.onkeydown;

  var onKeyEvent = function onKeyEvent(e) {
    return _handleKeyDown2['default'](e, params, modal);
  };
  window.onkeydown = onKeyEvent;

  window.onfocus = function () {
    // When the user has focused away and focused back from the whole window.
    setTimeout(function () {
      // Put in a timeout to jump out of the event sequence.
      // Calling focus() in the event sequence confuses things.
      if (lastFocusedButton !== undefined) {
        lastFocusedButton.focus();
        lastFocusedButton = undefined;
      }
    }, 0);
  };

  // Show alert with enabled buttons always
  swal.enableButtons();
};

/*
 * Set default params for each popup
 * @param {Object} userParams
 */
sweetAlert.setDefaults = swal.setDefaults = function (userParams) {
  if (!userParams) {
    throw new Error('userParams is required');
  }
  if (typeof userParams !== 'object') {
    throw new Error('userParams has to be a object');
  }

  _extend$hexToRgb$isIE8$logStr$colorLuminance.extend(_defaultParams2['default'], userParams);
};

/*
 * Animation when closing modal
 */
sweetAlert.close = swal.close = function () {
  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.fadeOut(_sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getOverlay(), 5);
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.fadeOut(modal, 5);
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, 'showSweetAlert');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass(modal, 'hideSweetAlert');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, 'visible');

  /*
   * Reset icon animations
   */
  var $successIcon = modal.querySelector('.sa-icon.sa-success');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon, 'animate');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon.querySelector('.sa-long'), 'animateSuccessLong');

  var $errorIcon = modal.querySelector('.sa-icon.sa-error');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon, 'animateErrorIcon');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');

  var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon, 'pulseWarning');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');

  // Reset custom class (delay so that UI changes aren't visible)
  setTimeout(function () {
    var customClass = modal.getAttribute('data-custom-class');
    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, customClass);
  }, 300);

  // Make page scrollable again
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(document.body, 'stop-scrolling');

  // Reset the page to its previous state
  window.onkeydown = previousWindowKeyDown;
  if (window.previousActiveElement) {
    window.previousActiveElement.focus();
  }
  lastFocusedButton = undefined;
  clearTimeout(modal.timeout);

  return true;
};

/*
 * Validation of the input field is done by user
 * If something is wrong => call showInputError with errorMessage
 */
sweetAlert.showInputError = swal.showInputError = function (errorMessage) {
  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

  var $errorIcon = modal.querySelector('.sa-input-error');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass($errorIcon, 'show');

  var $errorContainer = modal.querySelector('.sa-error-container');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass($errorContainer, 'show');

  $errorContainer.querySelector('p').innerHTML = errorMessage;

  setTimeout(function () {
    sweetAlert.enableButtons();
  }, 1);

  modal.querySelector('input').focus();
};

/*
 * Reset input error DOM elements
 */
sweetAlert.resetInputError = swal.resetInputError = function (event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorContainer, 'show');
};

/*
 * Disable confirm and cancel buttons
 */
sweetAlert.disableButtons = swal.disableButtons = function (event) {
  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = true;
  $cancelButton.disabled = true;
};

/*
 * Enable confirm and cancel buttons
 */
sweetAlert.enableButtons = swal.enableButtons = function (event) {
  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = false;
  $cancelButton.disabled = false;
};

if (typeof window !== 'undefined') {
  // The 'handle-click' module requires
  // that 'sweetAlert' was set as global.
  window.sweetAlert = window.swal = sweetAlert;
} else {
  _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('SweetAlert is a frontend module!');
}
module.exports = exports['default'];
},{"./modules/default-params":33,"./modules/handle-click":34,"./modules/handle-dom":35,"./modules/handle-key":36,"./modules/handle-swal-dom":37,"./modules/set-params":39,"./modules/utils":40}],42:[function(require,module,exports){
var Vue // late bind
var map = Object.create(null)
var shimmed = false
var isBrowserify = false

/**
 * Determine compatibility and apply patch.
 *
 * @param {Function} vue
 * @param {Boolean} browserify
 */

exports.install = function (vue, browserify) {
  if (shimmed) return
  shimmed = true

  Vue = vue
  isBrowserify = browserify

  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // patch view directive
  patchView(Vue.internalDirectives.component)
  console.log('[HMR] Vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    patchView(routerView)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the view directive (component or router-view).
 *
 * @param {Object} View
 */

function patchView (View) {
  var unbuild = View.unbuild
  View.unbuild = function (defer) {
    if (!this.hotUpdating) {
      var prevComponent = this.childVM && this.childVM.constructor
      removeView(prevComponent, this)
      // defer = true means we are transitioning to a new
      // Component. Register this new component to the list.
      if (defer) {
        addView(this.Component, this)
      }
    }
    // call original
    return unbuild.call(this, defer)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function addView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Component: Component,
        views: [],
        instances: []
      }
    }
    map[id].views.push(view)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function removeView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].views.$remove(view)
  }
}

/**
 * Create a record for a hot module, which keeps track of its construcotr,
 * instnaces and views (component directives or router-views).
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if (typeof options === 'function') {
    options = options.options
  }
  if (typeof options.el !== 'string' && typeof options.data !== 'object') {
    makeOptionsHot(id, options)
    map[id] = {
      Component: null,
      views: [],
      instances: []
    }
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  options.hotID = id
  injectHook(options, 'created', function () {
    var record = map[id]
    if (!record.Component) {
      record.Component = this.constructor
    }
    record.instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    map[id].instances.$remove(this)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

/**
 * Update a hot component.
 *
 * @param {String} id
 * @param {Object|null} newOptions
 * @param {String|null} newTemplate
 */

exports.update = function (id, newOptions, newTemplate) {
  var record = map[id]
  // force full-reload if an instance of the component is active but is not
  // managed by a view
  if (!record || (record.instances.length && !record.views.length)) {
    console.log('[HMR] Root or manually-mounted instance modified. Full reload may be required.')
    if (!isBrowserify) {
      window.location.reload()
    } else {
      // browserify-hmr somehow sends incomplete bundle if we reload here
      return
    }
  }
  if (!isBrowserify) {
    // browserify-hmr already logs this
    console.log('[HMR] Updating component: ' + format(id))
  }
  var Component = record.Component
  // update constructor
  if (newOptions) {
    // in case the user exports a constructor
    Component = record.Component = typeof newOptions === 'function'
      ? newOptions
      : Vue.extend(newOptions)
    makeOptionsHot(id, Component.options)
  }
  if (newTemplate) {
    Component.options.template = newTemplate
  }
  // handle recursive lookup
  if (Component.options.name) {
    Component.options.components[Component.options.name] = Component
  }
  // reset constructor cached linker
  Component.linker = null
  // reload all views
  record.views.forEach(function (view) {
    updateView(view, Component)
  })
}

/**
 * Update a component view instance
 *
 * @param {Directive} view
 * @param {Function} Component
 */

function updateView (view, Component) {
  if (!view._bound) {
    return
  }
  view.Component = Component
  view.hotUpdating = true
  // disable transitions
  view.vm._isCompiled = false
  // save state
  var state = view.childVM.$data
  // remount, make sure to disable keep-alive
  var keepAlive = view.keepAlive
  view.keepAlive = false
  view.mountComponent()
  view.keepAlive = keepAlive
  // restore state
  view.childVM.$data = state
  // re-eanble transitions
  view.vm._isCompiled = true
  view.hotUpdating = false
}

function format (id) {
  return id.match(/[^\/]+\.vue$/)[0]
}

},{}],43:[function(require,module,exports){
'use strict';

var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
function Target(path, matcher, delegate) {
  this.path = path;
  this.matcher = matcher;
  this.delegate = delegate;
}

Target.prototype = {
  to: function to(target, callback) {
    var delegate = this.delegate;

    if (delegate && delegate.willAddRoute) {
      target = delegate.willAddRoute(this.matcher.target, target);
    }

    this.matcher.add(this.path, target);

    if (callback) {
      if (callback.length === 0) {
        throw new Error("You must have an argument in the function passed to `to`");
      }
      this.matcher.addChild(this.path, target, callback, this.delegate);
    }
    return this;
  }
};

function Matcher(target) {
  this.routes = {};
  this.children = {};
  this.target = target;
}

Matcher.prototype = {
  add: function add(path, handler) {
    this.routes[path] = handler;
  },

  addChild: function addChild(path, target, callback, delegate) {
    var matcher = new Matcher(target);
    this.children[path] = matcher;

    var match = generateMatch(path, matcher, delegate);

    if (delegate && delegate.contextEntered) {
      delegate.contextEntered(target, match);
    }

    callback(match);
  }
};

function generateMatch(startingPath, matcher, delegate) {
  return function (path, nestedCallback) {
    var fullPath = startingPath + path;

    if (nestedCallback) {
      nestedCallback(generateMatch(fullPath, matcher, delegate));
    } else {
      return new Target(startingPath + path, matcher, delegate);
    }
  };
}

function addRoute(routeArray, path, handler) {
  var len = 0;
  for (var i = 0, l = routeArray.length; i < l; i++) {
    len += routeArray[i].path.length;
  }

  path = path.substr(len);
  var route = { path: path, handler: handler };
  routeArray.push(route);
}

function eachRoute(baseRoute, matcher, callback, binding) {
  var routes = matcher.routes;

  for (var path in routes) {
    if (routes.hasOwnProperty(path)) {
      var routeArray = baseRoute.slice();
      addRoute(routeArray, path, routes[path]);

      if (matcher.children[path]) {
        eachRoute(routeArray, matcher.children[path], callback, binding);
      } else {
        callback.call(binding, routeArray);
      }
    }
  }
}

function map (callback, addRouteCallback) {
  var matcher = new Matcher();

  callback(generateMatch("", matcher, this.delegate));

  eachRoute([], matcher, function (route) {
    if (addRouteCallback) {
      addRouteCallback(this, route);
    } else {
      this.add(route);
    }
  }, this);
}

var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

function isArray(test) {
  return Object.prototype.toString.call(test) === "[object Array]";
}

// A Segment represents a segment in the original route description.
// Each Segment type provides an `eachChar` and `regex` method.
//
// The `eachChar` method invokes the callback with one or more character
// specifications. A character specification consumes one or more input
// characters.
//
// The `regex` method returns a regex fragment for the segment. If the
// segment is a dynamic of star segment, the regex fragment also includes
// a capture.
//
// A character specification contains:
//
// * `validChars`: a String with a list of all valid characters, or
// * `invalidChars`: a String with a list of all invalid characters
// * `repeat`: true if the character specification can repeat

function StaticSegment(string) {
  this.string = string;
}
StaticSegment.prototype = {
  eachChar: function eachChar(callback) {
    var string = this.string,
        ch;

    for (var i = 0, l = string.length; i < l; i++) {
      ch = string.charAt(i);
      callback({ validChars: ch });
    }
  },

  regex: function regex() {
    return this.string.replace(escapeRegex, '\\$1');
  },

  generate: function generate() {
    return this.string;
  }
};

function DynamicSegment(name) {
  this.name = name;
}
DynamicSegment.prototype = {
  eachChar: function eachChar(callback) {
    callback({ invalidChars: "/", repeat: true });
  },

  regex: function regex() {
    return "([^/]+)";
  },

  generate: function generate(params) {
    return params[this.name];
  }
};

function StarSegment(name) {
  this.name = name;
}
StarSegment.prototype = {
  eachChar: function eachChar(callback) {
    callback({ invalidChars: "", repeat: true });
  },

  regex: function regex() {
    return "(.+)";
  },

  generate: function generate(params) {
    return params[this.name];
  }
};

function EpsilonSegment() {}
EpsilonSegment.prototype = {
  eachChar: function eachChar() {},
  regex: function regex() {
    return "";
  },
  generate: function generate() {
    return "";
  }
};

function parse(route, names, specificity) {
  // normalize route as not starting with a "/". Recognition will
  // also normalize.
  if (route.charAt(0) === "/") {
    route = route.substr(1);
  }

  var segments = route.split("/"),
      results = [];

  // A routes has specificity determined by the order that its different segments
  // appear in. This system mirrors how the magnitude of numbers written as strings
  // works.
  // Consider a number written as: "abc". An example would be "200". Any other number written
  // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
  // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
  // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
  // leading symbol, "1".
  // The rule is that symbols to the left carry more weight than symbols to the right
  // when a number is written out as a string. In the above strings, the leading digit
  // represents how many 100's are in the number, and it carries more weight than the middle
  // number which represents how many 10's are in the number.
  // This system of number magnitude works well for route specificity, too. A route written as
  // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
  // `x`, irrespective of the other parts.
  // Because of this similarity, we assign each type of segment a number value written as a
  // string. We can find the specificity of compound routes by concatenating these strings
  // together, from left to right. After we have looped through all of the segments,
  // we convert the string to a number.
  specificity.val = '';

  for (var i = 0, l = segments.length; i < l; i++) {
    var segment = segments[i],
        match;

    if (match = segment.match(/^:([^\/]+)$/)) {
      results.push(new DynamicSegment(match[1]));
      names.push(match[1]);
      specificity.val += '3';
    } else if (match = segment.match(/^\*([^\/]+)$/)) {
      results.push(new StarSegment(match[1]));
      specificity.val += '2';
      names.push(match[1]);
    } else if (segment === "") {
      results.push(new EpsilonSegment());
      specificity.val += '1';
    } else {
      results.push(new StaticSegment(segment));
      specificity.val += '4';
    }
  }

  specificity.val = +specificity.val;

  return results;
}

// A State has a character specification and (`charSpec`) and a list of possible
// subsequent states (`nextStates`).
//
// If a State is an accepting state, it will also have several additional
// properties:
//
// * `regex`: A regular expression that is used to extract parameters from paths
//   that reached this accepting state.
// * `handlers`: Information on how to convert the list of captures into calls
//   to registered handlers with the specified parameters
// * `types`: How many static, dynamic or star segments in this route. Used to
//   decide which route to use if multiple registered routes match a path.
//
// Currently, State is implemented naively by looping over `nextStates` and
// comparing a character specification against a character. A more efficient
// implementation would use a hash of keys pointing at one or more next states.

function State(charSpec) {
  this.charSpec = charSpec;
  this.nextStates = [];
}

State.prototype = {
  get: function get(charSpec) {
    var nextStates = this.nextStates;

    for (var i = 0, l = nextStates.length; i < l; i++) {
      var child = nextStates[i];

      var isEqual = child.charSpec.validChars === charSpec.validChars;
      isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

      if (isEqual) {
        return child;
      }
    }
  },

  put: function put(charSpec) {
    var state;

    // If the character specification already exists in a child of the current
    // state, just return that state.
    if (state = this.get(charSpec)) {
      return state;
    }

    // Make a new state for the character spec
    state = new State(charSpec);

    // Insert the new state as a child of the current state
    this.nextStates.push(state);

    // If this character specification repeats, insert the new state as a child
    // of itself. Note that this will not trigger an infinite loop because each
    // transition during recognition consumes a character.
    if (charSpec.repeat) {
      state.nextStates.push(state);
    }

    // Return the new state
    return state;
  },

  // Find a list of child states matching the next character
  match: function match(ch) {
    // DEBUG "Processing `" + ch + "`:"
    var nextStates = this.nextStates,
        child,
        charSpec,
        chars;

    // DEBUG "  " + debugState(this)
    var returned = [];

    for (var i = 0, l = nextStates.length; i < l; i++) {
      child = nextStates[i];

      charSpec = child.charSpec;

      if (typeof (chars = charSpec.validChars) !== 'undefined') {
        if (chars.indexOf(ch) !== -1) {
          returned.push(child);
        }
      } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
        if (chars.indexOf(ch) === -1) {
          returned.push(child);
        }
      }
    }

    return returned;
  }

  /** IF DEBUG
  , debug: function() {
    var charSpec = this.charSpec,
        debug = "[",
        chars = charSpec.validChars || charSpec.invalidChars;
     if (charSpec.invalidChars) { debug += "^"; }
    debug += chars;
    debug += "]";
     if (charSpec.repeat) { debug += "+"; }
     return debug;
  }
  END IF **/
};

/** IF DEBUG
function debug(log) {
  console.log(log);
}

function debugState(state) {
  return state.nextStates.map(function(n) {
    if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
    return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
  }).join(", ")
}
END IF **/

// Sort the routes by specificity
function sortSolutions(states) {
  return states.sort(function (a, b) {
    return b.specificity.val - a.specificity.val;
  });
}

function recognizeChar(states, ch) {
  var nextStates = [];

  for (var i = 0, l = states.length; i < l; i++) {
    var state = states[i];

    nextStates = nextStates.concat(state.match(ch));
  }

  return nextStates;
}

var oCreate = Object.create || function (proto) {
  function F() {}
  F.prototype = proto;
  return new F();
};

function RecognizeResults(queryParams) {
  this.queryParams = queryParams || {};
}
RecognizeResults.prototype = oCreate({
  splice: Array.prototype.splice,
  slice: Array.prototype.slice,
  push: Array.prototype.push,
  length: 0,
  queryParams: null
});

function findHandler(state, path, queryParams) {
  var handlers = state.handlers,
      regex = state.regex;
  var captures = path.match(regex),
      currentCapture = 1;
  var result = new RecognizeResults(queryParams);

  for (var i = 0, l = handlers.length; i < l; i++) {
    var handler = handlers[i],
        names = handler.names,
        params = {};

    for (var j = 0, m = names.length; j < m; j++) {
      params[names[j]] = captures[currentCapture++];
    }

    result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
  }

  return result;
}

function addSegment(currentState, segment) {
  segment.eachChar(function (ch) {
    var state;

    currentState = currentState.put(ch);
  });

  return currentState;
}

function decodeQueryParamPart(part) {
  // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
  part = part.replace(/\+/gm, '%20');
  return decodeURIComponent(part);
}

// The main interface

var RouteRecognizer = function RouteRecognizer() {
  this.rootState = new State();
  this.names = {};
};

RouteRecognizer.prototype = {
  add: function add(routes, options) {
    var currentState = this.rootState,
        regex = "^",
        specificity = {},
        handlers = [],
        allSegments = [],
        name;

    var isEmpty = true;

    for (var i = 0, l = routes.length; i < l; i++) {
      var route = routes[i],
          names = [];

      var segments = parse(route.path, names, specificity);

      allSegments = allSegments.concat(segments);

      for (var j = 0, m = segments.length; j < m; j++) {
        var segment = segments[j];

        if (segment instanceof EpsilonSegment) {
          continue;
        }

        isEmpty = false;

        // Add a "/" for the new segment
        currentState = currentState.put({ validChars: "/" });
        regex += "/";

        // Add a representation of the segment to the NFA and regex
        currentState = addSegment(currentState, segment);
        regex += segment.regex();
      }

      var handler = { handler: route.handler, names: names };
      handlers.push(handler);
    }

    if (isEmpty) {
      currentState = currentState.put({ validChars: "/" });
      regex += "/";
    }

    currentState.handlers = handlers;
    currentState.regex = new RegExp(regex + "$");
    currentState.specificity = specificity;

    if (name = options && options.as) {
      this.names[name] = {
        segments: allSegments,
        handlers: handlers
      };
    }
  },

  handlersFor: function handlersFor(name) {
    var route = this.names[name],
        result = [];
    if (!route) {
      throw new Error("There is no route named " + name);
    }

    for (var i = 0, l = route.handlers.length; i < l; i++) {
      result.push(route.handlers[i]);
    }

    return result;
  },

  hasRoute: function hasRoute(name) {
    return !!this.names[name];
  },

  generate: function generate(name, params) {
    var route = this.names[name],
        output = "";
    if (!route) {
      throw new Error("There is no route named " + name);
    }

    var segments = route.segments;

    for (var i = 0, l = segments.length; i < l; i++) {
      var segment = segments[i];

      if (segment instanceof EpsilonSegment) {
        continue;
      }

      output += "/";
      output += segment.generate(params);
    }

    if (output.charAt(0) !== '/') {
      output = '/' + output;
    }

    if (params && params.queryParams) {
      output += this.generateQueryString(params.queryParams);
    }

    return output;
  },

  generateQueryString: function generateQueryString(params) {
    var pairs = [];
    var keys = [];
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys.sort();
    for (var i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      var value = params[key];
      if (value == null) {
        continue;
      }
      var pair = encodeURIComponent(key);
      if (isArray(value)) {
        for (var j = 0, l = value.length; j < l; j++) {
          var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
          pairs.push(arrayPair);
        }
      } else {
        pair += "=" + encodeURIComponent(value);
        pairs.push(pair);
      }
    }

    if (pairs.length === 0) {
      return '';
    }

    return "?" + pairs.join("&");
  },

  parseQueryString: function parseQueryString(queryString) {
    var pairs = queryString.split("&"),
        queryParams = {};
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('='),
          key = decodeQueryParamPart(pair[0]),
          keyLength = key.length,
          isArray = false,
          value;
      if (pair.length === 1) {
        value = 'true';
      } else {
        //Handle arrays
        if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
          isArray = true;
          key = key.slice(0, keyLength - 2);
          if (!queryParams[key]) {
            queryParams[key] = [];
          }
        }
        value = pair[1] ? decodeQueryParamPart(pair[1]) : '';
      }
      if (isArray) {
        queryParams[key].push(value);
      } else {
        queryParams[key] = value;
      }
    }
    return queryParams;
  },

  recognize: function recognize(path) {
    var states = [this.rootState],
        pathLen,
        i,
        l,
        queryStart,
        queryParams = {},
        isSlashDropped = false;

    queryStart = path.indexOf('?');
    if (queryStart !== -1) {
      var queryString = path.substr(queryStart + 1, path.length);
      path = path.substr(0, queryStart);
      queryParams = this.parseQueryString(queryString);
    }

    path = decodeURI(path);

    // DEBUG GROUP path

    if (path.charAt(0) !== "/") {
      path = "/" + path;
    }

    pathLen = path.length;
    if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
      path = path.substr(0, pathLen - 1);
      isSlashDropped = true;
    }

    for (i = 0, l = path.length; i < l; i++) {
      states = recognizeChar(states, path.charAt(i));
      if (!states.length) {
        break;
      }
    }

    // END DEBUG GROUP

    var solutions = [];
    for (i = 0, l = states.length; i < l; i++) {
      if (states[i].handlers) {
        solutions.push(states[i]);
      }
    }

    states = sortSolutions(solutions);

    var state = solutions[0];

    if (state && state.handlers) {
      // if a trailing slash was dropped and a star segment is the last segment
      // specified, put the trailing slash back
      if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
        path = path + "/";
      }
      return findHandler(state, path, queryParams);
    }
  }
};

RouteRecognizer.prototype.map = map;

RouteRecognizer.VERSION = '0.1.9';

var genQuery = RouteRecognizer.prototype.generateQueryString;

// export default for holding the Vue reference
var exports$1 = {};
/**
 * Warn stuff.
 *
 * @param {String} msg
 */

function warn(msg) {
  /* istanbul ignore next */
  if (window.console) {
    console.warn('[vue-router] ' + msg);
    /* istanbul ignore if */
    if (!exports$1.Vue || exports$1.Vue.config.debug) {
      console.warn(new Error('warning stack trace:').stack);
    }
  }
}

/**
 * Resolve a relative path.
 *
 * @param {String} base
 * @param {String} relative
 * @param {Boolean} append
 * @return {String}
 */

function resolvePath(base, relative, append) {
  var query = base.match(/(\?.*)$/);
  if (query) {
    query = query[1];
    base = base.slice(0, -query.length);
  }
  // a query!
  if (relative.charAt(0) === '?') {
    return base + relative;
  }
  var stack = base.split('/');
  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop();
  }
  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/');
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (segment === '.') {
      continue;
    } else if (segment === '..') {
      stack.pop();
    } else {
      stack.push(segment);
    }
  }
  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('');
  }
  return stack.join('/');
}

/**
 * Forgiving check for a promise
 *
 * @param {Object} p
 * @return {Boolean}
 */

function isPromise(p) {
  return p && typeof p.then === 'function';
}

/**
 * Retrive a route config field from a component instance
 * OR a component contructor.
 *
 * @param {Function|Vue} component
 * @param {String} name
 * @return {*}
 */

function getRouteConfig(component, name) {
  var options = component && (component.$options || component.options);
  return options && options.route && options.route[name];
}

/**
 * Resolve an async component factory. Have to do a dirty
 * mock here because of Vue core's internal API depends on
 * an ID check.
 *
 * @param {Object} handler
 * @param {Function} cb
 */

var resolver = undefined;

function resolveAsyncComponent(handler, cb) {
  if (!resolver) {
    resolver = {
      resolve: exports$1.Vue.prototype._resolveComponent,
      $options: {
        components: {
          _: handler.component
        }
      }
    };
  } else {
    resolver.$options.components._ = handler.component;
  }
  resolver.resolve('_', function (Component) {
    handler.component = Component;
    cb(Component);
  });
}

/**
 * Map the dynamic segments in a path to params.
 *
 * @param {String} path
 * @param {Object} params
 * @param {Object} query
 */

function mapParams(path, params, query) {
  if (params === undefined) params = {};

  path = path.replace(/:([^\/]+)/g, function (_, key) {
    var val = params[key];
    if (!val) {
      warn('param "' + key + '" not found when generating ' + 'path for "' + path + '" with params ' + JSON.stringify(params));
    }
    return val || '';
  });
  if (query) {
    path += genQuery(query);
  }
  return path;
}

var hashRE = /#.*$/;

var HTML5History = (function () {
  function HTML5History(_ref) {
    var root = _ref.root;
    var onChange = _ref.onChange;
    babelHelpers.classCallCheck(this, HTML5History);

    if (root) {
      // make sure there's the starting slash
      if (root.charAt(0) !== '/') {
        root = '/' + root;
      }
      // remove trailing slash
      this.root = root.replace(/\/$/, '');
      this.rootRE = new RegExp('^\\' + this.root);
    } else {
      this.root = null;
    }
    this.onChange = onChange;
    // check base tag
    var baseEl = document.querySelector('base');
    this.base = baseEl && baseEl.getAttribute('href');
  }

  HTML5History.prototype.start = function start() {
    var _this = this;

    this.listener = function (e) {
      var url = decodeURI(location.pathname + location.search);
      if (_this.root) {
        url = url.replace(_this.rootRE, '');
      }
      _this.onChange(url, e && e.state, location.hash);
    };
    window.addEventListener('popstate', this.listener);
    this.listener();
  };

  HTML5History.prototype.stop = function stop() {
    window.removeEventListener('popstate', this.listener);
  };

  HTML5History.prototype.go = function go(path, replace, append) {
    var url = this.formatPath(path, append);
    if (replace) {
      history.replaceState({}, '', url);
    } else {
      // record scroll position by replacing current state
      history.replaceState({
        pos: {
          x: window.pageXOffset,
          y: window.pageYOffset
        }
      }, '');
      // then push new state
      history.pushState({}, '', url);
    }
    var hashMatch = path.match(hashRE);
    var hash = hashMatch && hashMatch[0];
    path = url
    // strip hash so it doesn't mess up params
    .replace(hashRE, '')
    // remove root before matching
    .replace(this.rootRE, '');
    this.onChange(path, null, hash);
  };

  HTML5History.prototype.formatPath = function formatPath(path, append) {
    return path.charAt(0) === '/'
    // absolute path
    ? this.root ? this.root + '/' + path.replace(/^\//, '') : path : resolvePath(this.base || location.pathname, path, append);
  };

  return HTML5History;
})();

var HashHistory = (function () {
  function HashHistory(_ref) {
    var hashbang = _ref.hashbang;
    var onChange = _ref.onChange;
    babelHelpers.classCallCheck(this, HashHistory);

    this.hashbang = hashbang;
    this.onChange = onChange;
  }

  HashHistory.prototype.start = function start() {
    var self = this;
    this.listener = function () {
      var path = location.hash;
      var raw = path.replace(/^#!?/, '');
      // always
      if (raw.charAt(0) !== '/') {
        raw = '/' + raw;
      }
      var formattedPath = self.formatPath(raw);
      if (formattedPath !== path) {
        location.replace(formattedPath);
        return;
      }
      // determine query
      // note it's possible to have queries in both the actual URL
      // and the hash fragment itself.
      var query = location.search && path.indexOf('?') > -1 ? '&' + location.search.slice(1) : location.search;
      self.onChange(decodeURI(path.replace(/^#!?/, '') + query));
    };
    window.addEventListener('hashchange', this.listener);
    this.listener();
  };

  HashHistory.prototype.stop = function stop() {
    window.removeEventListener('hashchange', this.listener);
  };

  HashHistory.prototype.go = function go(path, replace, append) {
    path = this.formatPath(path, append);
    if (replace) {
      location.replace(path);
    } else {
      location.hash = path;
    }
  };

  HashHistory.prototype.formatPath = function formatPath(path, append) {
    var isAbsoloute = path.charAt(0) === '/';
    var prefix = '#' + (this.hashbang ? '!' : '');
    return isAbsoloute ? prefix + path : prefix + resolvePath(location.hash.replace(/^#!?/, ''), path, append);
  };

  return HashHistory;
})();

var AbstractHistory = (function () {
  function AbstractHistory(_ref) {
    var onChange = _ref.onChange;
    babelHelpers.classCallCheck(this, AbstractHistory);

    this.onChange = onChange;
    this.currentPath = '/';
  }

  AbstractHistory.prototype.start = function start() {
    this.onChange('/');
  };

  AbstractHistory.prototype.stop = function stop() {
    // noop
  };

  AbstractHistory.prototype.go = function go(path, replace, append) {
    path = this.currentPath = this.formatPath(path, append);
    this.onChange(path);
  };

  AbstractHistory.prototype.formatPath = function formatPath(path, append) {
    return path.charAt(0) === '/' ? path : resolvePath(this.currentPath, path, append);
  };

  return AbstractHistory;
})();

/**
 * Determine the reusability of an existing router view.
 *
 * @param {Directive} view
 * @param {Object} handler
 * @param {Transition} transition
 */

function canReuse(view, handler, transition) {
  var component = view.childVM;
  if (!component || !handler) {
    return false;
  }
  // important: check view.Component here because it may
  // have been changed in activate hook
  if (view.Component !== handler.component) {
    return false;
  }
  var canReuseFn = getRouteConfig(component, 'canReuse');
  return typeof canReuseFn === 'boolean' ? canReuseFn : canReuseFn ? canReuseFn.call(component, {
    to: transition.to,
    from: transition.from
  }) : true; // defaults to true
}

/**
 * Check if a component can deactivate.
 *
 * @param {Directive} view
 * @param {Transition} transition
 * @param {Function} next
 */

function canDeactivate(view, transition, next) {
  var fromComponent = view.childVM;
  var hook = getRouteConfig(fromComponent, 'canDeactivate');
  if (!hook) {
    next();
  } else {
    transition.callHook(hook, fromComponent, next, {
      expectBoolean: true
    });
  }
}

/**
 * Check if a component can activate.
 *
 * @param {Object} handler
 * @param {Transition} transition
 * @param {Function} next
 */

function canActivate(handler, transition, next) {
  resolveAsyncComponent(handler, function (Component) {
    // have to check due to async-ness
    if (transition.aborted) {
      return;
    }
    // determine if this component can be activated
    var hook = getRouteConfig(Component, 'canActivate');
    if (!hook) {
      next();
    } else {
      transition.callHook(hook, null, next, {
        expectBoolean: true
      });
    }
  });
}

/**
 * Call deactivate hooks for existing router-views.
 *
 * @param {Directive} view
 * @param {Transition} transition
 * @param {Function} next
 */

function deactivate(view, transition, next) {
  var component = view.childVM;
  var hook = getRouteConfig(component, 'deactivate');
  if (!hook) {
    next();
  } else {
    transition.callHooks(hook, component, next);
  }
}

/**
 * Activate / switch component for a router-view.
 *
 * @param {Directive} view
 * @param {Transition} transition
 * @param {Number} depth
 * @param {Function} [cb]
 */

function activate(view, transition, depth, cb, reuse) {
  var handler = transition.activateQueue[depth];
  if (!handler) {
    // fix 1.0.0-alpha.3 compat
    if (view._bound) {
      view.setComponent(null);
    }
    cb && cb();
    return;
  }

  var Component = view.Component = handler.component;
  var activateHook = getRouteConfig(Component, 'activate');
  var dataHook = getRouteConfig(Component, 'data');
  var waitForData = getRouteConfig(Component, 'waitForData');

  view.depth = depth;
  view.activated = false;

  var component = undefined;
  var loading = !!(dataHook && !waitForData);

  // "reuse" is a flag passed down when the parent view is
  // either reused via keep-alive or as a child of a kept-alive view.
  // of course we can only reuse if the current kept-alive instance
  // is of the correct type.
  reuse = reuse && view.childVM && view.childVM.constructor === Component;

  if (reuse) {
    // just reuse
    component = view.childVM;
    component.$loadingRouteData = loading;
  } else {
    // unbuild current component. this step also destroys
    // and removes all nested child views.
    view.unbuild(true);
    // handle keep-alive.
    // if the view has keep-alive, the child vm is not actually
    // destroyed - its nested views will still be in router's
    // view list. We need to removed these child views and
    // cache them on the child vm.
    if (view.keepAlive) {
      var views = transition.router._views;
      var i = views.indexOf(view);
      if (i > 0) {
        transition.router._views = views.slice(i);
        if (view.childVM) {
          view.childVM._routerViews = views.slice(0, i);
        }
      }
    }

    // build the new component. this will also create the
    // direct child view of the current one. it will register
    // itself as view.childView.
    component = view.build({
      _meta: {
        $loadingRouteData: loading
      }
    });
    // handle keep-alive.
    // when a kept-alive child vm is restored, we need to
    // add its cached child views into the router's view list,
    // and also properly update current view's child view.
    if (view.keepAlive) {
      component.$loadingRouteData = loading;
      var cachedViews = component._routerViews;
      if (cachedViews) {
        transition.router._views = cachedViews.concat(transition.router._views);
        view.childView = cachedViews[cachedViews.length - 1];
        component._routerViews = null;
      }
    }
  }

  // cleanup the component in case the transition is aborted
  // before the component is ever inserted.
  var cleanup = function cleanup() {
    component.$destroy();
  };

  // actually insert the component and trigger transition
  var insert = function insert() {
    if (reuse) {
      cb && cb();
      return;
    }
    var router = transition.router;
    if (router._rendered || router._transitionOnLoad) {
      view.transition(component);
    } else {
      // no transition on first render, manual transition
      /* istanbul ignore if */
      if (view.setCurrent) {
        // 0.12 compat
        view.setCurrent(component);
      } else {
        // 1.0
        view.childVM = component;
      }
      component.$before(view.anchor, null, false);
    }
    cb && cb();
  };

  // called after activation hook is resolved
  var afterActivate = function afterActivate() {
    view.activated = true;
    // activate the child view
    if (view.childView) {
      activate(view.childView, transition, depth + 1, null, reuse || view.keepAlive);
    }
    if (dataHook && waitForData) {
      // wait until data loaded to insert
      loadData(component, transition, dataHook, insert, cleanup);
    } else {
      // load data and insert at the same time
      if (dataHook) {
        loadData(component, transition, dataHook);
      }
      insert();
    }
  };

  if (activateHook) {
    transition.callHooks(activateHook, component, afterActivate, {
      cleanup: cleanup
    });
  } else {
    afterActivate();
  }
}

/**
 * Reuse a view, just reload data if necessary.
 *
 * @param {Directive} view
 * @param {Transition} transition
 */

function reuse(view, transition) {
  var component = view.childVM;
  var dataHook = getRouteConfig(component, 'data');
  if (dataHook) {
    loadData(component, transition, dataHook);
  }
}

/**
 * Asynchronously load and apply data to component.
 *
 * @param {Vue} component
 * @param {Transition} transition
 * @param {Function} hook
 * @param {Function} cb
 * @param {Function} cleanup
 */

function loadData(component, transition, hook, cb, cleanup) {
  component.$loadingRouteData = true;
  transition.callHooks(hook, component, function (data, onError) {
    // merge data from multiple data hooks
    if (Array.isArray(data) && data._needMerge) {
      data = data.reduce(function (res, obj) {
        if (isPlainObject(obj)) {
          Object.keys(obj).forEach(function (key) {
            res[key] = obj[key];
          });
        }
        return res;
      }, Object.create(null));
    }
    // handle promise sugar syntax
    var promises = [];
    if (isPlainObject(data)) {
      Object.keys(data).forEach(function (key) {
        var val = data[key];
        if (isPromise(val)) {
          promises.push(val.then(function (resolvedVal) {
            component.$set(key, resolvedVal);
          }));
        } else {
          component.$set(key, val);
        }
      });
    }
    if (!promises.length) {
      component.$loadingRouteData = false;
      cb && cb();
    } else {
      promises[0].constructor.all(promises).then(function (_) {
        component.$loadingRouteData = false;
        cb && cb();
      }, onError);
    }
  }, {
    cleanup: cleanup,
    expectData: true
  });
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * A RouteTransition object manages the pipeline of a
 * router-view switching process. This is also the object
 * passed into user route hooks.
 *
 * @param {Router} router
 * @param {Route} to
 * @param {Route} from
 */

var RouteTransition = (function () {
  function RouteTransition(router, to, from) {
    babelHelpers.classCallCheck(this, RouteTransition);

    this.router = router;
    this.to = to;
    this.from = from;
    this.next = null;
    this.aborted = false;
    this.done = false;

    // start by determine the queues

    // the deactivate queue is an array of router-view
    // directive instances that need to be deactivated,
    // deepest first.
    this.deactivateQueue = router._views;

    // check the default handler of the deepest match
    var matched = to.matched ? Array.prototype.slice.call(to.matched) : [];

    // the activate queue is an array of route handlers
    // that need to be activated
    this.activateQueue = matched.map(function (match) {
      return match.handler;
    });
  }

  /**
   * Abort current transition and return to previous location.
   */

  RouteTransition.prototype.abort = function abort() {
    if (!this.aborted) {
      this.aborted = true;
      // if the root path throws an error during validation
      // on initial load, it gets caught in an infinite loop.
      var abortingOnLoad = !this.from.path && this.to.path === '/';
      if (!abortingOnLoad) {
        this.router.replace(this.from.path || '/');
      }
    }
  };

  /**
   * Abort current transition and redirect to a new location.
   *
   * @param {String} path
   */

  RouteTransition.prototype.redirect = function redirect(path) {
    if (!this.aborted) {
      this.aborted = true;
      if (typeof path === 'string') {
        path = mapParams(path, this.to.params, this.to.query);
      } else {
        path.params = path.params || this.to.params;
        path.query = path.query || this.to.query;
      }
      this.router.replace(path);
    }
  };

  /**
   * A router view transition's pipeline can be described as
   * follows, assuming we are transitioning from an existing
   * <router-view> chain [Component A, Component B] to a new
   * chain [Component A, Component C]:
   *
   *  A    A
   *  | => |
   *  B    C
   *
   * 1. Reusablity phase:
   *   -> canReuse(A, A)
   *   -> canReuse(B, C)
   *   -> determine new queues:
   *      - deactivation: [B]
   *      - activation: [C]
   *
   * 2. Validation phase:
   *   -> canDeactivate(B)
   *   -> canActivate(C)
   *
   * 3. Activation phase:
   *   -> deactivate(B)
   *   -> activate(C)
   *
   * Each of these steps can be asynchronous, and any
   * step can potentially abort the transition.
   *
   * @param {Function} cb
   */

  RouteTransition.prototype.start = function start(cb) {
    var transition = this;
    var daq = this.deactivateQueue;
    var aq = this.activateQueue;
    var rdaq = daq.slice().reverse();
    var reuseQueue = undefined;

    // 1. Reusability phase
    var i = undefined;
    for (i = 0; i < rdaq.length; i++) {
      if (!canReuse(rdaq[i], aq[i], transition)) {
        break;
      }
    }
    if (i > 0) {
      reuseQueue = rdaq.slice(0, i);
      daq = rdaq.slice(i).reverse();
      aq = aq.slice(i);
    }

    // 2. Validation phase
    transition.runQueue(daq, canDeactivate, function () {
      transition.runQueue(aq, canActivate, function () {
        transition.runQueue(daq, deactivate, function () {
          // 3. Activation phase

          // Update router current route
          transition.router._onTransitionValidated(transition);

          // trigger reuse for all reused views
          reuseQueue && reuseQueue.forEach(function (view) {
            reuse(view, transition);
          });

          // the root of the chain that needs to be replaced
          // is the top-most non-reusable view.
          if (daq.length) {
            var view = daq[daq.length - 1];
            var depth = reuseQueue ? reuseQueue.length : 0;
            activate(view, transition, depth, cb);
          } else {
            cb();
          }
        });
      });
    });
  };

  /**
   * Asynchronously and sequentially apply a function to a
   * queue.
   *
   * @param {Array} queue
   * @param {Function} fn
   * @param {Function} cb
   */

  RouteTransition.prototype.runQueue = function runQueue(queue, fn, cb) {
    var transition = this;
    step(0);
    function step(index) {
      if (index >= queue.length) {
        cb();
      } else {
        fn(queue[index], transition, function () {
          step(index + 1);
        });
      }
    }
  };

  /**
   * Call a user provided route transition hook and handle
   * the response (e.g. if the user returns a promise).
   *
   * If the user neither expects an argument nor returns a
   * promise, the hook is assumed to be synchronous.
   *
   * @param {Function} hook
   * @param {*} [context]
   * @param {Function} [cb]
   * @param {Object} [options]
   *                 - {Boolean} expectBoolean
   *                 - {Boolean} expectData
   *                 - {Function} cleanup
   */

  RouteTransition.prototype.callHook = function callHook(hook, context, cb) {
    var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    var _ref$expectBoolean = _ref.expectBoolean;
    var expectBoolean = _ref$expectBoolean === undefined ? false : _ref$expectBoolean;
    var _ref$expectData = _ref.expectData;
    var expectData = _ref$expectData === undefined ? false : _ref$expectData;
    var cleanup = _ref.cleanup;

    var transition = this;
    var nextCalled = false;

    // abort the transition
    var abort = function abort() {
      cleanup && cleanup();
      transition.abort();
    };

    // handle errors
    var onError = function onError(err) {
      // cleanup indicates an after-activation hook,
      // so instead of aborting we just let the transition
      // finish.
      cleanup ? next() : abort();
      if (err && !transition.router._suppress) {
        warn('Uncaught error during transition: ');
        throw err instanceof Error ? err : new Error(err);
      }
    };

    // advance the transition to the next step
    var next = function next(data) {
      if (nextCalled) {
        warn('transition.next() should be called only once.');
        return;
      }
      nextCalled = true;
      if (transition.aborted) {
        cleanup && cleanup();
        return;
      }
      cb && cb(data, onError);
    };

    // expose a clone of the transition object, so that each
    // hook gets a clean copy and prevent the user from
    // messing with the internals.
    var exposed = {
      to: transition.to,
      from: transition.from,
      abort: abort,
      next: next,
      redirect: function redirect() {
        transition.redirect.apply(transition, arguments);
      }
    };

    // actually call the hook
    var res = undefined;
    try {
      res = hook.call(context, exposed);
    } catch (err) {
      return onError(err);
    }

    // handle boolean/promise return values
    var resIsPromise = isPromise(res);
    if (expectBoolean) {
      if (typeof res === 'boolean') {
        res ? next() : abort();
      } else if (resIsPromise) {
        res.then(function (ok) {
          ok ? next() : abort();
        }, onError);
      } else if (!hook.length) {
        next(res);
      }
    } else if (resIsPromise) {
      res.then(next, onError);
    } else if (expectData && isPlainOjbect(res) || !hook.length) {
      next(res);
    }
  };

  /**
   * Call a single hook or an array of async hooks in series.
   *
   * @param {Array} hooks
   * @param {*} context
   * @param {Function} cb
   * @param {Object} [options]
   */

  RouteTransition.prototype.callHooks = function callHooks(hooks, context, cb, options) {
    var _this = this;

    if (Array.isArray(hooks)) {
      (function () {
        var res = [];
        res._needMerge = true;
        var onError = undefined;
        _this.runQueue(hooks, function (hook, _, next) {
          if (!_this.aborted) {
            _this.callHook(hook, context, function (r, onError) {
              if (r) res.push(r);
              onError = onError;
              next();
            }, options);
          }
        }, function () {
          cb(res, onError);
        });
      })();
    } else {
      this.callHook(hooks, context, cb, options);
    }
  };

  return RouteTransition;
})();

function isPlainOjbect(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

var internalKeysRE = /^(component|subRoutes)$/;

/**
 * Route Context Object
 *
 * @param {String} path
 * @param {Router} router
 */

var Route = function Route(path, router) {
  var _this = this;

  babelHelpers.classCallCheck(this, Route);

  var matched = router._recognizer.recognize(path);
  if (matched) {
    // copy all custom fields from route configs
    [].forEach.call(matched, function (match) {
      for (var key in match.handler) {
        if (!internalKeysRE.test(key)) {
          _this[key] = match.handler[key];
        }
      }
    });
    // set query and params
    this.query = matched.queryParams;
    this.params = [].reduce.call(matched, function (prev, cur) {
      if (cur.params) {
        for (var key in cur.params) {
          prev[key] = cur.params[key];
        }
      }
      return prev;
    }, {});
  }
  // expose path and router
  this.path = path;
  this.router = router;
  // for internal use
  this.matched = matched || router._notFoundHandler;
  // Important: freeze self to prevent observation
  Object.freeze(this);
};

function applyOverride (Vue) {

  var _ = Vue.util;

  // override Vue's init and destroy process to keep track of router instances
  var init = Vue.prototype._init;
  Vue.prototype._init = function (options) {
    var root = options._parent || options.parent || this;
    var route = root.$route;
    if (route) {
      route.router._children.push(this);
      if (!this.$route) {
        /* istanbul ignore if */
        if (this._defineMeta) {
          // 0.12
          this._defineMeta('$route', route);
        } else {
          // 1.0
          _.defineReactive(this, '$route', route);
        }
      }
    }
    init.call(this, options);
  };

  var destroy = Vue.prototype._destroy;
  Vue.prototype._destroy = function () {
    if (!this._isBeingDestroyed) {
      var route = this.$root.$route;
      if (route) {
        route.router._children.$remove(this);
      }
      destroy.apply(this, arguments);
    }
  };

  // 1.0 only: enable route mixins
  var strats = Vue.config.optionMergeStrategies;
  var hooksToMergeRE = /^(data|activate|deactivate)$/;

  if (strats) {
    strats.route = function (parentVal, childVal) {
      if (!childVal) return parentVal;
      if (!parentVal) return childVal;
      var ret = {};
      _.extend(ret, parentVal);
      for (var key in childVal) {
        var a = ret[key];
        var b = childVal[key];
        // for data, activate and deactivate, we need to merge them into
        // arrays similar to lifecycle hooks.
        if (a && hooksToMergeRE.test(key)) {
          ret[key] = (_.isArray(a) ? a : [a]).concat(b);
        } else {
          ret[key] = b;
        }
      }
      return ret;
    };
  }
}

function View (Vue) {

  var _ = Vue.util;
  var componentDef =
  // 0.12
  Vue.directive('_component') ||
  // 1.0
  Vue.internalDirectives.component;
  // <router-view> extends the internal component directive
  var viewDef = _.extend({}, componentDef);

  // with some overrides
  _.extend(viewDef, {

    _isRouterView: true,

    bind: function bind() {
      var route = this.vm.$route;
      /* istanbul ignore if */
      if (!route) {
        warn('<router-view> can only be used inside a ' + 'router-enabled app.');
        return;
      }
      // force dynamic directive so v-component doesn't
      // attempt to build right now
      this._isDynamicLiteral = true;
      // finally, init by delegating to v-component
      componentDef.bind.call(this);

      // all we need to do here is registering this view
      // in the router. actual component switching will be
      // managed by the pipeline.
      var router = this.router = route.router;
      router._views.unshift(this);

      // note the views are in reverse order.
      var parentView = router._views[1];
      if (parentView) {
        // register self as a child of the parent view,
        // instead of activating now. This is so that the
        // child's activate hook is called after the
        // parent's has resolved.
        parentView.childView = this;
      }

      // handle late-rendered view
      // two possibilities:
      // 1. root view rendered after transition has been
      //    validated;
      // 2. child view rendered after parent view has been
      //    activated.
      var transition = route.router._currentTransition;
      if (!parentView && transition.done || parentView && parentView.activated) {
        var depth = parentView ? parentView.depth + 1 : 0;
        activate(this, transition, depth);
      }
    },

    unbind: function unbind() {
      this.router._views.$remove(this);
      componentDef.unbind.call(this);
    }
  });

  Vue.elementDirective('router-view', viewDef);
}

var trailingSlashRE = /\/$/;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var queryStringRE = /\?.*$/;

// install v-link, which provides navigation support for
// HTML5 history mode
function Link (Vue) {

  var _ = Vue.util;

  Vue.directive('link', {

    bind: function bind() {
      var _this = this;

      var vm = this.vm;
      /* istanbul ignore if */
      if (!vm.$route) {
        warn('v-link can only be used inside a ' + 'router-enabled app.');
        return;
      }
      // no need to handle click if link expects to be opened
      // in a new window/tab.
      /* istanbul ignore if */
      if (this.el.tagName === 'A' && this.el.getAttribute('target') === '_blank') {
        return;
      }
      // handle click
      var router = vm.$route.router;
      this.handler = function (e) {
        // don't redirect with control keys
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        // don't redirect when preventDefault called
        if (e.defaultPrevented) return;
        // don't redirect on right click
        if (e.button !== 0) return;

        var target = _this.target;
        var go = function go(target) {
          e.preventDefault();
          if (target != null) {
            router.go(target);
          }
        };

        if (_this.el.tagName === 'A' || e.target === _this.el) {
          // v-link on <a v-link="'path'">
          go(target);
        } else {
          // v-link delegate on <div v-link>
          var el = e.target;
          while (el && el.tagName !== 'A' && el !== _this.el) {
            el = el.parentNode;
          }
          if (!el) return;
          if (el.tagName !== 'A' || !el.href) {
            // allow not anchor
            go(target);
          } else if (sameOrigin(el)) {
            go({
              path: el.pathname,
              replace: target && target.replace,
              append: target && target.append
            });
          }
        }
      };
      this.el.addEventListener('click', this.handler);
      // manage active link class
      this.unwatch = vm.$watch('$route.path', _.bind(this.updateClasses, this));
    },

    update: function update(path) {
      var router = this.vm.$route.router;
      var append = undefined;
      this.target = path;
      if (_.isObject(path)) {
        append = path.append;
        this.exact = path.exact;
        this.prevActiveClass = this.activeClass;
        this.activeClass = path.activeClass;
      }
      path = this.path = router._stringifyPath(path);
      this.activeRE = path && !this.exact ? new RegExp('^' + path.replace(/\/$/, '').replace(regexEscapeRE, '\\$&') + '(\\/|$)') : null;
      this.updateClasses(this.vm.$route.path);
      var isAbsolute = path.charAt(0) === '/';
      // do not format non-hash relative paths
      var href = path && (router.mode === 'hash' || isAbsolute) ? router.history.formatPath(path, append) : path;
      if (this.el.tagName === 'A') {
        if (href) {
          this.el.href = href;
        } else {
          this.el.removeAttribute('href');
        }
      }
    },

    updateClasses: function updateClasses(path) {
      var el = this.el;
      var router = this.vm.$route.router;
      var activeClass = this.activeClass || router._linkActiveClass;
      // clear old class
      if (this.prevActiveClass !== activeClass) {
        _.removeClass(el, this.prevActiveClass);
      }
      // remove query string before matching
      var dest = this.path.replace(queryStringRE, '');
      path = path.replace(queryStringRE, '');
      // add new class
      if (this.exact) {
        if (dest === path ||
        // also allow additional trailing slash
        dest.charAt(dest.length - 1) !== '/' && dest === path.replace(trailingSlashRE, '')) {
          _.addClass(el, activeClass);
        } else {
          _.removeClass(el, activeClass);
        }
      } else {
        if (this.activeRE && this.activeRE.test(path)) {
          _.addClass(el, activeClass);
        } else {
          _.removeClass(el, activeClass);
        }
      }
    },

    unbind: function unbind() {
      this.el.removeEventListener('click', this.handler);
      this.unwatch && this.unwatch();
    }
  });

  function sameOrigin(link) {
    return link.protocol === location.protocol && link.hostname === location.hostname && link.port === location.port;
  }
}

var historyBackends = {
  abstract: AbstractHistory,
  hash: HashHistory,
  html5: HTML5History
};

// late bind during install
var Vue = undefined;

/**
 * Router constructor
 *
 * @param {Object} [options]
 */

var Router = (function () {
  function Router() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$hashbang = _ref.hashbang;
    var hashbang = _ref$hashbang === undefined ? true : _ref$hashbang;
    var _ref$abstract = _ref.abstract;
    var abstract = _ref$abstract === undefined ? false : _ref$abstract;
    var _ref$history = _ref.history;
    var history = _ref$history === undefined ? false : _ref$history;
    var _ref$saveScrollPosition = _ref.saveScrollPosition;
    var saveScrollPosition = _ref$saveScrollPosition === undefined ? false : _ref$saveScrollPosition;
    var _ref$transitionOnLoad = _ref.transitionOnLoad;
    var transitionOnLoad = _ref$transitionOnLoad === undefined ? false : _ref$transitionOnLoad;
    var _ref$suppressTransitionError = _ref.suppressTransitionError;
    var suppressTransitionError = _ref$suppressTransitionError === undefined ? false : _ref$suppressTransitionError;
    var _ref$root = _ref.root;
    var root = _ref$root === undefined ? null : _ref$root;
    var _ref$linkActiveClass = _ref.linkActiveClass;
    var linkActiveClass = _ref$linkActiveClass === undefined ? 'v-link-active' : _ref$linkActiveClass;
    babelHelpers.classCallCheck(this, Router);

    /* istanbul ignore if */
    if (!Router.installed) {
      throw new Error('Please install the Router with Vue.use() before ' + 'creating an instance.');
    }

    // Vue instances
    this.app = null;
    this._views = [];
    this._children = [];

    // route recognizer
    this._recognizer = new RouteRecognizer();
    this._guardRecognizer = new RouteRecognizer();

    // state
    this._started = false;
    this._startCb = null;
    this._currentRoute = {};
    this._currentTransition = null;
    this._previousTransition = null;
    this._notFoundHandler = null;
    this._notFoundRedirect = null;
    this._beforeEachHooks = [];
    this._afterEachHooks = [];

    // feature detection
    this._hasPushState = typeof window !== 'undefined' && window.history && window.history.pushState;

    // trigger transition on initial render?
    this._rendered = false;
    this._transitionOnLoad = transitionOnLoad;

    // history mode
    this._abstract = abstract;
    this._hashbang = hashbang;
    this._history = this._hasPushState && history;

    // other options
    this._saveScrollPosition = saveScrollPosition;
    this._linkActiveClass = linkActiveClass;
    this._suppress = suppressTransitionError;

    // create history object
    var inBrowser = Vue.util.inBrowser;
    this.mode = !inBrowser || this._abstract ? 'abstract' : this._history ? 'html5' : 'hash';

    var History = historyBackends[this.mode];
    var self = this;
    this.history = new History({
      root: root,
      hashbang: this._hashbang,
      onChange: function onChange(path, state, anchor) {
        self._match(path, state, anchor);
      }
    });
  }

  /**
   * Allow directly passing components to a route
   * definition.
   *
   * @param {String} path
   * @param {Object} handler
   */

  // API ===================================================

  /**
  * Register a map of top-level paths.
  *
  * @param {Object} map
  */

  Router.prototype.map = function map(_map) {
    for (var route in _map) {
      this.on(route, _map[route]);
    }
  };

  /**
   * Register a single root-level path
   *
   * @param {String} rootPath
   * @param {Object} handler
   *                 - {String} component
   *                 - {Object} [subRoutes]
   *                 - {Boolean} [forceRefresh]
   *                 - {Function} [before]
   *                 - {Function} [after]
   */

  Router.prototype.on = function on(rootPath, handler) {
    if (rootPath === '*') {
      this._notFound(handler);
    } else {
      this._addRoute(rootPath, handler, []);
    }
  };

  /**
   * Set redirects.
   *
   * @param {Object} map
   */

  Router.prototype.redirect = function redirect(map) {
    for (var path in map) {
      this._addRedirect(path, map[path]);
    }
  };

  /**
   * Set aliases.
   *
   * @param {Object} map
   */

  Router.prototype.alias = function alias(map) {
    for (var path in map) {
      this._addAlias(path, map[path]);
    }
  };

  /**
   * Set global before hook.
   *
   * @param {Function} fn
   */

  Router.prototype.beforeEach = function beforeEach(fn) {
    this._beforeEachHooks.push(fn);
  };

  /**
   * Set global after hook.
   *
   * @param {Function} fn
   */

  Router.prototype.afterEach = function afterEach(fn) {
    this._afterEachHooks.push(fn);
  };

  /**
   * Navigate to a given path.
   * The path can be an object describing a named path in
   * the format of { name: '...', params: {}, query: {}}
   * The path is assumed to be already decoded, and will
   * be resolved against root (if provided)
   *
   * @param {String|Object} path
   * @param {Boolean} [replace]
   */

  Router.prototype.go = function go(path) {
    var replace = false;
    var append = false;
    if (Vue.util.isObject(path)) {
      replace = path.replace;
      append = path.append;
    }
    path = this._stringifyPath(path);
    if (path) {
      this.history.go(path, replace, append);
    }
  };

  /**
   * Short hand for replacing current path
   *
   * @param {String} path
   */

  Router.prototype.replace = function replace(path) {
    if (typeof path === 'string') {
      path = { path: path };
    }
    path.replace = true;
    this.go(path);
  };

  /**
   * Start the router.
   *
   * @param {VueConstructor} App
   * @param {String|Element} container
   * @param {Function} [cb]
   */

  Router.prototype.start = function start(App, container, cb) {
    /* istanbul ignore if */
    if (this._started) {
      warn('already started.');
      return;
    }
    this._started = true;
    this._startCb = cb;
    if (!this.app) {
      /* istanbul ignore if */
      if (!App || !container) {
        throw new Error('Must start vue-router with a component and a ' + 'root container.');
      }
      this._appContainer = container;
      var Ctor = this._appConstructor = typeof App === 'function' ? App : Vue.extend(App);
      // give it a name for better debugging
      Ctor.options.name = Ctor.options.name || 'RouterApp';
    }
    this.history.start();
  };

  /**
   * Stop listening to route changes.
   */

  Router.prototype.stop = function stop() {
    this.history.stop();
    this._started = false;
  };

  // Internal methods ======================================

  /**
  * Add a route containing a list of segments to the internal
  * route recognizer. Will be called recursively to add all
  * possible sub-routes.
  *
  * @param {String} path
  * @param {Object} handler
  * @param {Array} segments
  */

  Router.prototype._addRoute = function _addRoute(path, handler, segments) {
    guardComponent(path, handler);
    handler.path = path;
    handler.fullPath = (segments.reduce(function (path, segment) {
      return path + segment.path;
    }, '') + path).replace('//', '/');
    segments.push({
      path: path,
      handler: handler
    });
    this._recognizer.add(segments, {
      as: handler.name
    });
    // add sub routes
    if (handler.subRoutes) {
      for (var subPath in handler.subRoutes) {
        // recursively walk all sub routes
        this._addRoute(subPath, handler.subRoutes[subPath],
        // pass a copy in recursion to avoid mutating
        // across branches
        segments.slice());
      }
    }
  };

  /**
   * Set the notFound route handler.
   *
   * @param {Object} handler
   */

  Router.prototype._notFound = function _notFound(handler) {
    guardComponent('*', handler);
    this._notFoundHandler = [{ handler: handler }];
  };

  /**
   * Add a redirect record.
   *
   * @param {String} path
   * @param {String} redirectPath
   */

  Router.prototype._addRedirect = function _addRedirect(path, redirectPath) {
    if (path === '*') {
      this._notFoundRedirect = redirectPath;
    } else {
      this._addGuard(path, redirectPath, this.replace);
    }
  };

  /**
   * Add an alias record.
   *
   * @param {String} path
   * @param {String} aliasPath
   */

  Router.prototype._addAlias = function _addAlias(path, aliasPath) {
    this._addGuard(path, aliasPath, this._match);
  };

  /**
   * Add a path guard.
   *
   * @param {String} path
   * @param {String} mappedPath
   * @param {Function} handler
   */

  Router.prototype._addGuard = function _addGuard(path, mappedPath, _handler) {
    var _this = this;

    this._guardRecognizer.add([{
      path: path,
      handler: function handler(match, query) {
        var realPath = mapParams(mappedPath, match.params, query);
        _handler.call(_this, realPath);
      }
    }]);
  };

  /**
   * Check if a path matches any redirect records.
   *
   * @param {String} path
   * @return {Boolean} - if true, will skip normal match.
   */

  Router.prototype._checkGuard = function _checkGuard(path) {
    var matched = this._guardRecognizer.recognize(path);
    if (matched) {
      matched[0].handler(matched[0], matched.queryParams);
      return true;
    } else if (this._notFoundRedirect) {
      matched = this._recognizer.recognize(path);
      if (!matched) {
        this.replace(this._notFoundRedirect);
        return true;
      }
    }
  };

  /**
   * Match a URL path and set the route context on vm,
   * triggering view updates.
   *
   * @param {String} path
   * @param {Object} [state]
   * @param {String} [anchor]
   */

  Router.prototype._match = function _match(path, state, anchor) {
    var _this2 = this;

    if (this._checkGuard(path)) {
      return;
    }

    var currentRoute = this._currentRoute;
    var currentTransition = this._currentTransition;

    if (currentTransition) {
      if (currentTransition.to.path === path) {
        // do nothing if we have an active transition going to the same path
        return;
      } else if (currentRoute.path === path) {
        // We are going to the same path, but we also have an ongoing but
        // not-yet-validated transition. Abort that transition and reset to
        // prev transition.
        currentTransition.aborted = true;
        this._currentTransition = this._prevTransition;
        return;
      } else {
        // going to a totally different path. abort ongoing transition.
        currentTransition.aborted = true;
      }
    }

    // construct new route and transition context
    var route = new Route(path, this);
    var transition = new RouteTransition(this, route, currentRoute);

    // current transition is updated right now.
    // however, current route will only be updated after the transition has
    // been validated.
    this._prevTransition = currentTransition;
    this._currentTransition = transition;

    if (!this.app) {
      // initial render
      this.app = new this._appConstructor({
        el: this._appContainer,
        _meta: {
          $route: route
        }
      });
    }

    // check global before hook
    var beforeHooks = this._beforeEachHooks;
    var startTransition = function startTransition() {
      transition.start(function () {
        _this2._postTransition(route, state, anchor);
      });
    };

    if (beforeHooks.length) {
      transition.runQueue(beforeHooks, function (hook, _, next) {
        if (transition === _this2._currentTransition) {
          transition.callHook(hook, null, next, {
            expectBoolean: true
          });
        }
      }, startTransition);
    } else {
      startTransition();
    }

    if (!this._rendered && this._startCb) {
      this._startCb.call(null);
    }

    // HACK:
    // set rendered to true after the transition start, so
    // that components that are acitvated synchronously know
    // whether it is the initial render.
    this._rendered = true;
  };

  /**
   * Set current to the new transition.
   * This is called by the transition object when the
   * validation of a route has succeeded.
   *
   * @param {Transition} transition
   */

  Router.prototype._onTransitionValidated = function _onTransitionValidated(transition) {
    // set current route
    var route = this._currentRoute = transition.to;
    // update route context for all children
    if (this.app.$route !== route) {
      this.app.$route = route;
      this._children.forEach(function (child) {
        child.$route = route;
      });
    }
    // call global after hook
    if (this._afterEachHooks.length) {
      this._afterEachHooks.forEach(function (hook) {
        return hook.call(null, {
          to: transition.to,
          from: transition.from
        });
      });
    }
    this._currentTransition.done = true;
  };

  /**
   * Handle stuff after the transition.
   *
   * @param {Route} route
   * @param {Object} [state]
   * @param {String} [anchor]
   */

  Router.prototype._postTransition = function _postTransition(route, state, anchor) {
    // handle scroll positions
    // saved scroll positions take priority
    // then we check if the path has an anchor
    var pos = state && state.pos;
    if (pos && this._saveScrollPosition) {
      Vue.nextTick(function () {
        window.scrollTo(pos.x, pos.y);
      });
    } else if (anchor) {
      Vue.nextTick(function () {
        var el = document.getElementById(anchor.slice(1));
        if (el) {
          window.scrollTo(window.scrollX, el.offsetTop);
        }
      });
    }
  };

  /**
   * Normalize named route object / string paths into
   * a string.
   *
   * @param {Object|String|Number} path
   * @return {String}
   */

  Router.prototype._stringifyPath = function _stringifyPath(path) {
    if (path && typeof path === 'object') {
      if (path.name) {
        var params = path.params || {};
        if (path.query) {
          params.queryParams = path.query;
        }
        return this._recognizer.generate(path.name, params);
      } else if (path.path) {
        var fullPath = path.path;
        if (path.query) {
          var query = this._recognizer.generateQueryString(path.query);
          if (fullPath.indexOf('?') > -1) {
            fullPath += '&' + query.slice(1);
          } else {
            fullPath += query;
          }
        }
        return fullPath;
      } else {
        return '';
      }
    } else {
      return path ? path + '' : '';
    }
  };

  return Router;
})();

function guardComponent(path, handler) {
  var comp = handler.component;
  if (Vue.util.isPlainObject(comp)) {
    comp = handler.component = Vue.extend(comp);
  }
  /* istanbul ignore if */
  if (typeof comp !== 'function') {
    handler.component = null;
    warn('invalid component for route "' + path + '".');
  }
}

/* Installation */

Router.installed = false;

/**
 * Installation interface.
 * Install the necessary directives.
 */

Router.install = function (externalVue) {
  /* istanbul ignore if */
  if (Router.installed) {
    warn('already installed.');
    return;
  }
  Vue = externalVue;
  applyOverride(Vue);
  View(Vue);
  Link(Vue);
  exports$1.Vue = Vue;
  Router.installed = true;
};

// auto install
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Router);
}

module.exports = Router;
},{}],44:[function(require,module,exports){
(function (process){
/*!
 * Vue.js v1.0.10
 * (c) 2015 Evan You
 * Released under the MIT License.
 */
'use strict';

function set(obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  }
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;
  if (!ob) {
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if an expression is a literal value.
 *
 * @param {String} exp
 * @return {Boolean}
 */

var literalValueRE = /^\s?(true|false|[\d\.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
  return value == null ? '' : value.toString();
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

function toNumber(value) {
  if (typeof value !== 'string') {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

function toBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : value;
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;

function camelize(str) {
  return str.replace(camelizeRE, toUpper);
}

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;

function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g;

function classify(str) {
  return str.replace(classifyRE, toUpper);
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind$1(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  var keys = Object.keys(from);
  var i = keys.length;
  while (i--) {
    to[keys[i]] = from[keys[i]];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';

function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Define a non-enumerable property
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

function _debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function later() {
    var last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

function indexOf(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) return i;
  }
  return -1;
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

function cancellable(fn) {
  var cb = function cb() {
    if (!cb.cancelled) {
      return fn.apply(this, arguments);
    }
  };
  cb.cancel = function () {
    cb.cancelled = true;
  };
  return cb;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

function looseEqual(a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
  /* eslint-enable eqeqeq */
}

var hasProto = ('__proto__' in {});

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

var isIE9 = inBrowser && navigator.userAgent.toLowerCase().indexOf('msie 9.0') > 0;

var isAndroid = inBrowser && navigator.userAgent.toLowerCase().indexOf('android') > 0;

var transitionProp = undefined;
var transitionEndEvent = undefined;
var animationProp = undefined;
var animationEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }
  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined') {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    timerFunc = setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
})();

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = Object.create(null);
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var entry = {
    key: key,
    value: value
  };
  this._keymap[key] = entry;
  if (this.tail) {
    this.tail.newer = entry;
    entry.older = this.tail;
  } else {
    this.head = entry;
  }
  this.tail = entry;
  if (this.size === this.limit) {
    return this.shift();
  } else {
    this.size++;
  }
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older; // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer; // C. --> E
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

var cache$1 = new Cache(1000);
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var reservedArgRE = /^in$|^-?\d+/;

/**
 * Parser state
 */

var str;
var dir;
var c;
var i;
var l;
var lastFilterIndex;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg);
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg(arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    };
  } else {
    var stripped = stripQuotes(arg);
    var dynamic = stripped === arg;
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    };
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} str
 * @return {Object}
 */

function parseDirective(s) {

  var hit = cache$1.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = 0;
  lastFilterIndex = 0;
  dir = {};

  for (i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 0x27) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 0x22) inDouble = !inDouble;
    } else if (c === 0x7C && // pipe
    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(0, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;break; // "
        case 0x27:
          inSingle = true;break; // '
        case 0x28:
          paren++;break; // (
        case 0x29:
          paren--;break; // )
        case 0x5B:
          square++;break; // [
        case 0x5D:
          square--;break; // ]
        case 0x7B:
          curly++;break; // {
        case 0x7D:
          curly--;break; // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  cache$1.put(s, dir);
  return dir;
}

var directive = Object.freeze({
  parseDirective: parseDirective
});

var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache = undefined;
var tagRE = undefined;
var htmlRE = undefined;
/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, '\\$&');
}

function compileRegex() {
  var open = escapeRegex(config.delimiters[0]);
  var close = escapeRegex(config.delimiters[1]);
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
  tagRE = new RegExp(unsafeOpen + '(.+?)' + unsafeClose + '|' + open + '(.+?)' + close, 'g');
  htmlRE = new RegExp('^' + unsafeOpen + '.*' + unsafeClose + '$');
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

function parseText(text) {
  if (!cache) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  text = text.replace(/\n/g, '');
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, html, value, first, oneTime;
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
    /* eslint-enable no-cond-assign */
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    html = htmlRE.test(match[0]);
    value = html ? match[1] : match[2];
    first = value.charCodeAt(0);
    oneTime = first === 42; // *
    value = oneTime ? value.slice(1) : value;
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @return {String}
 */

function tokensToExp(tokens) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token);
    }).join('+');
  } else {
    return formatToken(tokens[0], true);
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Boolean} single
 * @return {String}
 */

function formatToken(token, single) {
  return token.tag ? inlineFilters(token.value, single) : '"' + token.value + '"';
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE$1 = /[^|]\|[^|]/;
function inlineFilters(exp, single) {
  if (!filterRE$1.test(exp)) {
    return single ? exp : '(' + exp + ')';
  } else {
    var dir = parseDirective(exp);
    if (!dir.filters) {
      return '(' + exp + ')';
    } else {
      return 'this._applyFilters(' + dir.expression + // value
      ',null,' + // oldValue (null for read)
      JSON.stringify(dir.filters) + // filter descriptors
      ',false)'; // write?
    }
  }
}

var text$1 = Object.freeze({
  compileRegex: compileRegex,
  parseText: parseText,
  tokensToExp: tokensToExp
});

var delimiters = ['{{', '}}'];
var unsafeDelimiters = ['{{{', '}}}'];

var config = Object.defineProperties({

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Whether or not to handle fully object properties which
   * are already backed by getters and seters. Depending on
   * use case and environment, this might introduce non-neglible
   * performance penalties.
   */
  convertAllProperties: false,

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}, {
  delimiters: { /**
                 * Interpolation delimiters. Changing these would trigger
                 * the text parser to re-compile the regular expressions.
                 *
                 * @type {Array<String>}
                 */

    get: function get() {
      return delimiters;
    },
    set: function set(val) {
      delimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  },
  unsafeDelimiters: {
    get: function get() {
      return unsafeDelimiters;
    },
    set: function set(val) {
      unsafeDelimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  }
});

var warn = undefined;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';
    warn = function (msg, e) {
      if (hasConsole && (!config.silent || config.debug)) {
        console.warn('[Vue warn]: ' + msg);
        /* istanbul ignore if */
        if (config.debug) {
          if (e) {
            throw e;
          } else {
            console.warn(new Error('Warning Stack Trace').stack);
          }
        }
      }
    };
  })();
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    before(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    remove(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
  var doc = document.documentElement;
  var parent = node && node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Get and remove an attribute from a node.
 *
 * @param {Node} node
 * @param {String} _attr
 */

function getAttr(node, _attr) {
  var val = node.getAttribute(_attr);
  if (val !== null) {
    node.removeAttribute(_attr);
  }
  return val;
}

/**
 * Get an attribute with colon or v-bind: prefix.
 *
 * @param {Node} node
 * @param {String} name
 * @return {String|null}
 */

function getBindAttr(node, name) {
  var val = getAttr(node, ':' + name);
  if (val === null) {
    val = getAttr(node, 'v-bind:' + name);
  }
  return val;
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

function remove(el) {
  el.parentNode.removeChild(el);
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

function prepend(el, target) {
  if (target.firstChild) {
    before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function on$1(el, event, cb) {
  el.addEventListener(event, cb);
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function off(el, event, cb) {
  el.removeEventListener(event, cb);
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    el.setAttribute('class', cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element}
 */

function extractContent(el, asFragment) {
  var child;
  var rawContent;
  /* istanbul ignore if */
  if (isTemplate(el) && el.content instanceof DocumentFragment) {
    el = el.content;
  }
  if (el.hasChildNodes()) {
    trimNode(el);
    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
      /* eslint-enable no-cond-assign */
      rawContent.appendChild(child);
    }
  }
  return rawContent;
}

/**
 * Trim possible empty head/tail textNodes inside a parent.
 *
 * @param {Node} node
 */

function trimNode(node) {
  trim(node, node.firstChild);
  trim(node, node.lastChild);
}

function trim(parent, node) {
  if (node && node.nodeType === 3 && !node.data.trim()) {
    parent.removeChild(node);
  }
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

function isTemplate(el) {
  return el.tagName && el.tagName.toLowerCase() === 'template';
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

function createAnchor(content, persist) {
  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
  anchor.__vue_anchor = true;
  return anchor;
}

/**
 * Find a component ref attribute that starts with $.
 *
 * @param {Element} node
 * @return {String|undefined}
 */

var refRE = /^v-ref:/;

function findRef(node) {
  if (node.hasAttributes()) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var name = attrs[i].name;
      if (refRE.test(name)) {
        return camelize(name.replace(refRE, ''));
      }
    }
  }
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
  var next;
  while (node !== end) {
    next = node.nextSibling;
    op(node);
    node = next;
  }
  op(end);
}

/**
 * Remove a range of nodes with transition, store
 * the nodes in a fragment with correct ordering,
 * and call callback when done.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Function} cb
 */

function removeNodeRange(start, end, vm, frag, cb) {
  var done = false;
  var removed = 0;
  var nodes = [];
  mapNodeRange(start, end, function (node) {
    if (node === end) done = true;
    nodes.push(node);
    removeWithTransition(node, vm, onRemoved);
  });
  function onRemoved() {
    removed++;
    if (done && removed >= nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
        frag.appendChild(nodes[i]);
      }
      cb && cb();
    }
  }
}

var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/;

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function checkComponentAttr(el, options) {
  var tag = el.tagName.toLowerCase();
  var hasAttrs = el.hasAttributes();
  if (!commonTagRE.test(tag) && tag !== 'component') {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag };
    } else {
      var is = hasAttrs && getIsBinding(el);
      if (is) {
        return is;
      } else if (process.env.NODE_ENV !== 'production') {
        if (tag.indexOf('-') > -1 || /HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        !/^(data|time|rtc|rb)$/.test(tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly?');
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el);
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @return {Object|undefined}
 */

function getIsBinding(el) {
  // dynamic syntax
  var exp = getAttr(el, 'is');
  if (exp != null) {
    return { id: exp };
  } else {
    exp = getBindAttr(el, 'is');
    if (exp != null) {
      return { id: exp, dynamic: true };
    }
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function initProp(vm, prop, value) {
  var key = prop.path;
  vm[key] = vm._data[key] = assertProp(prop, value) ? value : undefined;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 */

function assertProp(prop, value) {
  // if a prop is not provided and is not required,
  // skip the check.
  if (prop.raw === null && !prop.required) {
    return true;
  }
  var options = prop.options;
  var type = options.type;
  var valid = true;
  var expectedType;
  if (type) {
    if (type === String) {
      expectedType = 'string';
      valid = typeof value === expectedType;
    } else if (type === Number) {
      expectedType = 'number';
      valid = typeof value === 'number';
    } else if (type === Boolean) {
      expectedType = 'boolean';
      valid = typeof value === 'boolean';
    } else if (type === Function) {
      expectedType = 'function';
      valid = typeof value === 'function';
    } else if (type === Object) {
      expectedType = 'object';
      valid = isPlainObject(value);
    } else if (type === Array) {
      expectedType = 'array';
      valid = isArray(value);
    } else {
      valid = value instanceof type;
    }
  }
  if (!valid) {
    process.env.NODE_ENV !== 'production' && warn('Invalid prop: type check failed for ' + prop.path + '="' + prop.raw + '".' + ' Expected ' + formatType(expectedType) + ', got ' + formatValue(value) + '.');
    return false;
  }
  var validator = options.validator;
  if (validator) {
    if (!validator.call(null, value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for ' + prop.path + '="' + prop.raw + '"');
      return false;
    }
  }
  return true;
}

function formatType(val) {
  return val ? val.charAt(0).toUpperCase() + val.slice(1) : 'custom type';
}

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.');
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.');
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * 0.11 deprecation warning
 */

strats.paramAttributes = function () {
  /* istanbul ignore next */
  process.env.NODE_ENV !== 'production' && warn('"paramAttributes" option has been deprecated in 0.12. ' + 'Use "props" instead.');
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal);
  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components = guardArrayAssets(options.components);
    var def;
    var ids = Object.keys(components);
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i];
      if (commonTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in HTML elements as component ' + 'id: ' + key);
        continue;
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  var i, val;
  if (isArray(props)) {
    options.props = {};
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        options.props[val] = null;
      } else if (val.name) {
        options.props[val.name] = val;
      }
    }
  } else if (isPlainObject(props)) {
    var keys = Object.keys(props);
    i = keys.length;
    while (i--) {
      val = props[keys[i]];
      if (typeof val === 'function') {
        props[keys[i]] = { type: val };
      }
    }
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets(assets) {
  if (isArray(assets)) {
    var res = {};
    var i = assets.length;
    var asset;
    while (i--) {
      asset = assets[i];
      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
      if (!id) {
        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
      } else {
        res[id] = asset;
      }
    }
    return res;
  }
  return assets;
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  var options = {};
  var key;
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @return {Object|Function}
 */

function resolveAsset(options, type, id) {
  var assets = options[type];
  var camelizedId;
  return assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
}

/**
 * Assert asset exists
 */

function assertAsset(val, type, id) {
  if (!val) {
    process.env.NODE_ENV !== 'production' && warn('Failed to resolve ' + type + ': ' + id);
  }
}

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(arrayProto, '$set', function $set(index, val) {
  if (index >= this.length) {
    this.length = index + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

def(arrayProto, '$remove', function $remove(item) {
  /* istanbul ignore if */
  if (!this.length) return;
  var index = indexOf(this, item);
  if (index > -1) {
    return this.splice(index, 1);
  }
});

var uid$3 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */
function Dep() {
  this.id = uid$3++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = toArray(this.subs);
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj);
  var i = keys.length;
  while (i--) {
    this.convert(keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  var i = items.length;
  while (i--) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function protoAugment(target, src) {
  target.__proto__ = src;
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  var i = keys.length;
  var key;
  while (i--) {
    key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if ((isArray(value) || isPlainObject(value)) && !Object.isFrozen(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
  var dep = new Dep();

  // cater for pre-defined getter/setters
  var getter, setter;
  if (config.convertAllProperties) {
    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return;
    }
    getter = property && property.get;
    setter = property && property.set;
  }

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

var util = Object.freeze({
	defineReactive: defineReactive,
	set: set,
	del: del,
	hasOwn: hasOwn,
	isLiteral: isLiteral,
	isReserved: isReserved,
	_toString: _toString,
	toNumber: toNumber,
	toBoolean: toBoolean,
	stripQuotes: stripQuotes,
	camelize: camelize,
	hyphenate: hyphenate,
	classify: classify,
	bind: bind$1,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	def: def,
	debounce: _debounce,
	indexOf: indexOf,
	cancellable: cancellable,
	looseEqual: looseEqual,
	isArray: isArray,
	hasProto: hasProto,
	inBrowser: inBrowser,
	isIE9: isIE9,
	isAndroid: isAndroid,
	get transitionProp () { return transitionProp; },
	get transitionEndEvent () { return transitionEndEvent; },
	get animationProp () { return animationProp; },
	get animationEndEvent () { return animationEndEvent; },
	nextTick: nextTick,
	query: query,
	inDoc: inDoc,
	getAttr: getAttr,
	getBindAttr: getBindAttr,
	before: before,
	after: after,
	remove: remove,
	prepend: prepend,
	replace: replace,
	on: on$1,
	off: off,
	addClass: addClass,
	removeClass: removeClass,
	extractContent: extractContent,
	trimNode: trimNode,
	isTemplate: isTemplate,
	createAnchor: createAnchor,
	findRef: findRef,
	mapNodeRange: mapNodeRange,
	removeNodeRange: removeNodeRange,
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	assertAsset: assertAsset,
	checkComponentAttr: checkComponentAttr,
	initProp: initProp,
	assertProp: assertProp,
	commonTagRE: commonTagRE,
	get warn () { return warn; }
});

var uid = 0;

function initMixin (Vue) {

  /**
   * The main init sequence. This is called for every
   * instance, including ones that are created from extended
   * constructors.
   *
   * @param {Object} options - this options object should be
   *                           the result of merging class
   *                           options and the options passed
   *                           in to the constructor.
   */

  Vue.prototype._init = function (options) {

    options = options || {};

    this.$el = null;
    this.$parent = options.parent;
    this.$root = this.$parent ? this.$parent.$root : this;
    this.$children = [];
    this.$refs = {}; // child vm references
    this.$els = {}; // element references
    this._watchers = []; // all watchers as an array
    this._directives = []; // all directives

    // a uid
    this._uid = uid++;

    // a flag to avoid this being observed
    this._isVue = true;

    // events bookkeeping
    this._events = {}; // registered callbacks
    this._eventsCount = {}; // for $broadcast optimization

    // fragment instance properties
    this._isFragment = false;
    this._fragment = // @type {DocumentFragment}
    this._fragmentStart = // @type {Text|Comment}
    this._fragmentEnd = null; // @type {Text|Comment}

    // lifecycle state
    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = false;
    this._unlinkFn = null;

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent;

    // scope:
    // if this is inside an inline v-for, the scope
    // will be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope;

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to reigster itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag;
    if (this._frag) {
      this._frag.children.push(this);
    }

    // push self into parent / transclusion host
    if (this.$parent) {
      this.$parent.$children.push(this);
    }

    // merge options.
    options = this.$options = mergeOptions(this.constructor.options, options, this);

    // set ref
    this._updateRef();

    // initialize data as empty object.
    // it will be filled up in _initScope().
    this._data = {};

    // call init hook
    this._callHook('init');

    // initialize data observation and scope inheritance.
    this._initState();

    // setup event system and option events.
    this._initEvents();

    // call created hook
    this._callHook('created');

    // if `el` option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el);
    }
  };
}

var pathCache = new Cache(1000);

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType(ch) {
  if (ch === undefined) {
    return 'eof';
  }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30:
      // 0
      return ch;

    case 0x5F: // _
    case 0x24:
      // $
      return 'ident';

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }

  // a-z, A-Z
  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
    return 'ident';
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number';
  }

  return 'else';
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 *
 * @param {String} path
 * @return {String}
 */

function formatSubPath(path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

/**
 * Parse a string path into an array of segments
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c, newChar, key, type, transition, action, typeMap;

  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode != null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        return;
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path;
      return keys;
    }
  }
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      pathCache.put(path, hit);
    }
  }
  return hit;
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

function getPath(obj, path) {
  return parseExpression(path).get(obj);
}

/**
 * Warn against setting non-existent root path on a vm.
 */

var warnNonExistent;
if (process.env.NODE_ENV !== 'production') {
  warnNonExistent = function (path) {
    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.');
  };
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

function setPath(obj, path, val) {
  var original = obj;
  if (typeof path === 'string') {
    path = parse(path);
  }
  if (!path || !isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj;
    key = path[i];
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original);
    }
    if (i < l - 1) {
      obj = obj[key];
      if (!isObject(obj)) {
        obj = {};
        if (process.env.NODE_ENV !== 'production' && last._isVue) {
          warnNonExistent(path);
        }
        set(last, key, obj);
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val);
      } else if (key in obj) {
        obj[key] = val;
      } else {
        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
          warnNonExistent(path);
        }
        set(obj, key, val);
      }
    }
  }
  return true;
}

var path = Object.freeze({
  parsePath: parsePath,
  getPath: getPath,
  setPath: setPath
});

var expressionCache = new Cache(1000);

var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

// keywords that don't make sense inside expressions
var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'proctected,static,interface,private,public';
var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g;
var booleanLiteralRE = /^(true|false)$/;

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save(str, isString) {
  var i = saved.length;
  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
  return '"' + i + '"';
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (allowedKeywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
    return c + 'scope.' + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileGetter(exp) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
  }
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, '');
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body).replace(pathReplaceRE, rewrite).replace(restoreRE, restore);
  return makeGetterFn(body);
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetterFn(body) {
  try {
    return new Function('scope', 'return ' + body + ';');
  } catch (e) {
    process.env.NODE_ENV !== 'production' && warn('Invalid expression. ' + 'Generated function body: ' + body);
  }
}

/**
 * Compile a setter function for the expression.
 *
 * @param {String} exp
 * @return {Function|undefined}
 */

function compileSetter(exp) {
  var path = parsePath(exp);
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val);
    };
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function parseExpression(exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet && !hit.set) {
      hit.set = compileSetter(hit.exp);
    }
    return hit;
  }
  var res = { exp: exp };
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
  ? makeGetterFn('scope.' + exp)
  // dynamic getter
  : compileGetter(exp);
  if (needSet) {
    res.set = compileSetter(exp);
  }
  expressionCache.put(exp, res);
  return res;
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

function isSimplePath(exp) {
  return pathTestRE.test(exp) &&
  // don't treat true/false as paths
  !booleanLiteralRE.test(exp) &&
  // Math constants e.g. Math.PI, Math.E etc.
  exp.slice(0, 5) !== 'Math.';
}

var expression = Object.freeze({
  parseExpression: parseExpression,
  isSimplePath: isSimplePath
});

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.
var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;
var internalQueueDepleted = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue = [];
  userQueue = [];
  has = {};
  circular = {};
  waiting = internalQueueDepleted = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  runBatcherQueue(queue);
  internalQueueDepleted = true;
  runBatcherQueue(userQueue);
  // dev tool hook
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    if (inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush');
    }
  }
  resetBatcherState();
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        queue.splice(has[id], 1);
        warn('You may have an infinite update loop for watcher ' + 'with expression: ' + watcher.expression);
      }
    }
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    // if an internal watcher is pushed, but the internal
    // queue is already depleted, we run it immediately.
    if (internalQueueDepleted && !watcher.user) {
      watcher.run();
      return;
    }
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue;
    has[id] = q.length;
    q.push(watcher);
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushBatcherQueue);
    }
  }
}

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = isFn ? expOrFn.toString() : expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = Object.create(null);
  this.newDeps = null;
  this.prevError = null; // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    var res = parseExpression(expOrFn, this.twoWay);
    this.getter = res.get;
    this.setter = res.set;
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDeps[id]) {
    this.newDeps[id] = dep;
    if (!this.deps[id]) {
      this.deps[id] = dep;
      dep.addSub(this);
    }
  }
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var scope = this.scope || this.vm;
  var value;
  try {
    value = this.getter.call(scope, scope);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating expression "' + this.expression + '". ' + (config.debug ? '' : 'Turn on debug mode to see stack trace.'), e);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  if (this.preProcess) {
    value = this.preProcess(value);
  }
  if (this.filters) {
    value = scope._applyFilters(value, null, this.filters, false);
  }
  if (this.postProcess) {
    value = this.postProcess(value);
  }
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var scope = this.scope || this.vm;
  if (this.filters) {
    value = scope._applyFilters(value, this.value, this.filters, true);
  }
  try {
    this.setter.call(scope, scope, value);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating setter "' + this.expression + '"', e);
    }
  }
  // two-way sync for v-for alias
  var forContext = scope.$forContext;
  if (forContext && forContext.alias === this.expression) {
    if (forContext.filters) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.');
      return;
    }
    forContext._withLock(function () {
      if (scope.$key) {
        // original is an object
        forContext.rawValue[scope.$key] = value;
      } else {
        forContext.rawValue.$set(scope.$index, value);
      }
    });
  }
};

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
  this.newDeps = Object.create(null);
};

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null;
  var ids = Object.keys(this.deps);
  var i = ids.length;
  while (i--) {
    var id = ids[i];
    if (!this.newDeps[id]) {
      this.deps[id].removeSub(this);
    }
  }
  this.deps = this.newDeps;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync || !config.async) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace');
    }
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and Array watchers should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isArray(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
        this.prevError = null;
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          nextTick(function () {
            throw prevError;
          }, 0);
          throw e;
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target;
  this.value = this.get();
  this.dirty = false;
  Dep.target = current;
};

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var depIds = Object.keys(this.deps);
  var i = depIds.length;
  while (i--) {
    this.deps[depIds[i]].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // we can skip this if the vm if being destroyed
    // which can improve teardown performance.
    if (!this.vm._isBeingDestroyed) {
      this.vm._watchers.$remove(this);
    }
    var depIds = Object.keys(this.deps);
    var i = depIds.length;
    while (i--) {
      this.deps[depIds[i]].removeSub(this);
    }
    this.active = false;
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 */

function traverse(val) {
  var i, keys;
  if (isArray(val)) {
    i = val.length;
    while (i--) traverse(val[i]);
  } else if (isObject(val)) {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) traverse(val[keys[i]]);
  }
}

var cloak = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};

var ref = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.');
  }
};

var el = {

  priority: 1500,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = camelize(this.arg);
    var refs = (this._scope || this.vm).$els;
    if (hasOwn(refs, id)) {
      refs[id] = this.el;
    } else {
      defineReactive(refs, id, this.el);
    }
  },

  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};

var prefixes = ['-webkit-', '-moz-', '-ms-'];
var camelPrefixes = ['Webkit', 'Moz', 'ms'];
var importantRE = /!important;?$/;
var propCache = Object.create(null);

var testEl = null;

var style = {

  deep: true,

  update: function update(value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value;
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}));
    } else {
      this.handleObject(value || {});
    }
  },

  handleObject: function handleObject(value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {});
    var name, val;
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null);
        delete cache[name];
      }
    }
    for (name in value) {
      val = value[name];
      if (val !== cache[name]) {
        cache[name] = val;
        this.handleSingle(name, val);
      }
    }
  },

  handleSingle: function handleSingle(prop, value) {
    prop = normalize(prop);
    if (!prop) return; // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += '';
    if (value) {
      var isImportant = importantRE.test(value) ? 'important' : '';
      if (isImportant) {
        value = value.replace(importantRE, '').trim();
      }
      this.el.style.setProperty(prop, value, isImportant);
    } else {
      this.el.style.removeProperty(prop);
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = hyphenate(prop);
  var camel = camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement('div');
  }
  if (camel in testEl.style) {
    return prop;
  }
  var i = prefixes.length;
  var prefixed;
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixes[i] + prop;
    }
  }
}

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xlinkRE = /^xlink:/;

// these input element attributes should also set their
// corresponding properties
var inputProps = {
  value: 1,
  checked: 1,
  selected: 1
};

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
};

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;

var bind = {

  priority: 850,

  bind: function bind() {
    var attr = this.arg;
    var tag = this.el.tagName;
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true;
    }
    // handle interpolation bindings
    if (this.descriptor.interp) {
      // only allow binding on native attributes
      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
        process.env.NODE_ENV !== 'production' && warn(attr + '="' + this.descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.');
        this.el.removeAttribute(attr);
        this.invalid = true;
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + this.descriptor.raw + '": ';
        // warn src
        if (attr === 'src') {
          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.');
        }

        // warn style
        if (attr === 'style') {
          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.');
        }
      }
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }
    var attr = this.arg;
    if (this.arg) {
      this.handleSingle(attr, value);
    } else {
      this.handleObject(value || {});
    }
  },

  // share object handler with v-bind:class
  handleObject: style.handleObject,

  handleSingle: function handleSingle(attr, value) {
    if (inputProps[attr] && attr in this.el) {
      this.el[attr] = attr === 'value' ? value || '' : // IE9 will set input.value to "null" for null...
      value;
    }
    // set model props
    var modelProp = modelProps[attr];
    if (modelProp) {
      this.el[modelProp] = value;
      // update v-model if present
      var model = this.el.__v_model;
      if (model) {
        model.listener();
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && this.el.tagName === 'TEXTAREA') {
      this.el.removeAttribute(attr);
      return;
    }
    // update attribute
    if (value != null && value !== false) {
      if (xlinkRE.test(attr)) {
        this.el.setAttributeNS(xlinkNS, attr, value);
      } else {
        this.el.setAttribute(attr, value);
      }
    } else {
      this.el.removeAttribute(attr);
    }
  }
};

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': 46,
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

function keyFilter(handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0);
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10);
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0);
      if (charCode > 64 && charCode < 91) {
        return charCode;
      }
    }
    return keyCodes[key];
  });
  return function keyHandler(e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e);
    }
  };
}

function stopFilter(handler) {
  return function stopHandler(e) {
    e.stopPropagation();
    return handler.call(this, e);
  };
}

function preventFilter(handler) {
  return function preventHandler(e) {
    e.preventDefault();
    return handler.call(this, e);
  };
}

var on = {

  acceptStatement: true,
  priority: 700,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
      var self = this;
      this.iframeBind = function () {
        on$1(self.el.contentWindow, self.arg, self.handler);
      };
      this.on('load', this.iframeBind);
    }
  },

  update: function update(handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {};
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler);
      return;
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler);
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler);
    }
    // key filter
    var keys = Object.keys(this.modifiers).filter(function (key) {
      return key !== 'stop' && key !== 'prevent';
    });
    if (keys.length) {
      handler = keyFilter(handler, keys);
    }

    this.reset();
    this.handler = handler;

    if (this.iframeBind) {
      this.iframeBind();
    } else {
      on$1(this.el, this.arg, this.handler);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
  }
};

var checkbox = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if (isArray(model)) {
        var val = self.getValue();
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.checked) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    var el = this.el;
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};

var select = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get());
      }
    };

    // check if this is a multiple select
    var multiple = this.multiple = el.hasAttribute('multiple');

    // attach listener
    this.listener = function () {
      var value = getValue(el, multiple);
      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
      self.set(value);
    };
    this.on('change', this.listener);

    // if has initial value, set afterBind
    var initValue = getValue(el, multiple, true);
    if (multiple && initValue.length || !multiple && initValue !== null) {
      this.afterBind = this.listener;
    }

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', this.forceUpdate);
  },

  update: function update(value) {
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && isArray(value);
    var options = el.options;
    var i = options.length;
    var op, val;
    while (i--) {
      op = options[i];
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      /* eslint-disable eqeqeq */
      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function unbind() {
    /* istanbul ignore next */
    this.vm.$off('hook:attached', this.forceUpdate);
  }
};

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @param {Boolean} init
 * @return {Array|*}
 */

function getValue(el, multi, init) {
  var res = multi ? [] : null;
  var op, val, selected;
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i];
    selected = init ? op.hasAttribute('selected') : op.selected;
    if (selected) {
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      if (multi) {
        res.push(val);
      } else {
        return val;
      }
    }
  }
  return res;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf$1(arr, val) {
  var i = arr.length;
  while (i--) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

var radio = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = toNumber(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.checked) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.checked = looseEqual(value, this.getValue());
  }
};

var text$2 = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    var isRange = el.type === 'range';
    var lazy = this.params.lazy;
    var number = this.params.number;
    var debounce = this.params.debounce;

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false;
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true;
      });
      this.on('compositionend', function () {
        composing = false;
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener();
        }
      });
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false;
    if (!isRange) {
      this.on('focus', function () {
        self.focused = true;
      });
      this.on('blur', function () {
        self.focused = false;
        self.listener();
      });
    }

    // Now attach the main listener
    this.listener = function () {
      if (composing) return;
      var val = number || isRange ? toNumber(el.value) : el.value;
      self.set(val);
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value);
        }
      });
    };

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce);
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function';
    if (this.hasjQuery) {
      jQuery(el).on('change', this.listener);
      if (!lazy) {
        jQuery(el).on('input', this.listener);
      }
    } else {
      this.on('change', this.listener);
      if (!lazy) {
        this.on('input', this.listener);
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener);
      });
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      });
    }

    // set initial value if present
    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.value = _toString(value);
  },

  unbind: function unbind() {
    var el = this.el;
    if (this.hasjQuery) {
      jQuery(el).off('change', this.listener);
      jQuery(el).off('input', this.listener);
    }
  }
};

var handlers = {
  text: text$2,
  radio: radio,
  select: select,
  checkbox: checkbox
};

var model = {

  priority: 800,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model. You might want to use a two-way filter ' + 'to ensure correct behavior.');
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },

  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};

var show = {

  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },

  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },

  apply: function apply(el, value) {
    applyTransition(el, value ? 1 : -1, function () {
      el.style.display = value ? '' : 'none';
    }, this.vm);
  }
};

var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};

map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate(node) {
  return isTemplate(node) && node.content instanceof DocumentFragment;
}

var tagRE$1 = /<([\w:]+)/;
var entityRE = /&\w+;|&#\d+;|&#x[\dA-F]+;/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @param {Boolean} raw
 * @return {DocumentFragment}
 */

function stringToFragment(templateString, raw) {
  // try a cache hit first
  var hit = templateCache.get(templateString);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE$1);
  var entityMatch = entityRE.test(templateString);

  if (!tagMatch && !entityMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {

    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map.efault;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement('div');

    if (!raw) {
      templateString = templateString.trim();
    }
    node.innerHTML = prefix + templateString + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
      /* eslint-enable no-cond-assign */
      frag.appendChild(child);
    }
  }

  templateCache.put(templateString, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment.
  if (isRealTemplate(node)) {
    trimNode(node.content);
    return node.content;
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent);
  }
  // normal node, clone it to avoid mutating the original
  var clonedNode = cloneNode(node);
  var frag = document.createDocumentFragment();
  var child;
  /* eslint-disable no-cond-assign */
  while (child = clonedNode.firstChild) {
    /* eslint-enable no-cond-assign */
    frag.appendChild(child);
  }
  trimNode(frag);
  return frag;
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/showug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var a = document.createElement('div');
    a.innerHTML = '<template>1</template>';
    return !a.cloneNode(true).firstChild.innerHTML;
  } else {
    return false;
  }
})();

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var t = document.createElement('textarea');
    t.placeholder = 't';
    return t.cloneNode(true).value === 't';
  } else {
    return false;
  }
})();

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function cloneNode(node) {
  if (!node.querySelectorAll) {
    return node.cloneNode();
  }
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var tempClone = res;
    if (isRealTemplate(node)) {
      node = node.content;
      tempClone = res.content;
    }
    original = node.querySelectorAll('template');
    if (original.length) {
      cloned = tempClone.querySelectorAll('template');
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value;
    } else {
      original = node.querySelectorAll('textarea');
      if (original.length) {
        cloned = res.querySelectorAll('textarea');
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *        Possible values include:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone
 * @param {Boolean} raw
 *        inline HTML interpolation. Do not check for id
 *        selector and keep whitespace in the string.
 * @return {DocumentFragment|undefined}
 */

function parseTemplate(template, shouldClone, raw) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (template instanceof DocumentFragment) {
    trimNode(template);
    return shouldClone ? cloneNode(template) : template;
  }

  if (typeof template === 'string') {
    // id selector
    if (!raw && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template, raw);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && shouldClone ? cloneNode(frag) : frag;
}

var template = Object.freeze({
  cloneNode: cloneNode,
  parseTemplate: parseTemplate
});

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 */
function Fragment(linker, vm, frag, host, scope, parentFrag) {
  this.children = [];
  this.childFrags = [];
  this.vm = vm;
  this.scope = scope;
  this.inserted = false;
  this.parentFrag = parentFrag;
  if (parentFrag) {
    parentFrag.childFrags.push(this);
  }
  this.unlink = linker(vm, frag, host, scope, this);
  var single = this.single = frag.childNodes.length === 1 &&
  // do not go single mode if the only node is an anchor
  !frag.childNodes[0].__vue_anchor;
  if (single) {
    this.node = frag.childNodes[0];
    this.before = singleBefore;
    this.remove = singleRemove;
  } else {
    this.node = createAnchor('fragment-start');
    this.end = createAnchor('fragment-end');
    this.frag = frag;
    prepend(this.node, frag);
    frag.appendChild(this.end);
    this.before = multiBefore;
    this.remove = multiRemove;
  }
  this.node.__vfrag__ = this;
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l;
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i]);
  }
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook);
  }
};

/**
 * Destroy the fragment.
 */

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this);
  }
  this.unlink();
};

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function singleBefore(target, withTransition) {
  this.inserted = true;
  var method = withTransition !== false ? beforeWithTransition : before;
  method(this.node, target, this.vm);
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove() {
  this.inserted = false;
  var shouldCallRemove = inDoc(this.node);
  var self = this;
  self.callHook(destroyChild);
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore(target, withTransition) {
  this.inserted = true;
  var vm = this.vm;
  var method = withTransition !== false ? beforeWithTransition : before;
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm);
  });
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove() {
  this.inserted = false;
  var self = this;
  var shouldCallRemove = inDoc(this.node);
  self.callHook(destroyChild);
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach(child) {
  if (!child._isAttached) {
    child._callHook('attached');
  }
}

/**
 * Call destroy for all contained instances,
 * with remove:false and defer:true.
 * Defer is necessary because we need to
 * keep the children to call detach hooks
 * on them.
 *
 * @param {Vue} child
 */

function destroyChild(child) {
  child.$destroy(false, true);
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach(child) {
  if (child._isAttached) {
    child._callHook('detached');
  }
}

var linkerCache = new Cache(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */
function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || isTemplate(el)) {
    template = parseTemplate(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : el.outerHTML);
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = compile(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = compile(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template);
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
};

var vIf = {

  priority: 2000,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next);
        this.elseFactory = new FragmentFactory(this.vm, next);
      }
      // check main block
      this.anchor = createAnchor('v-if');
      replace(el, this.anchor);
      this.factory = new FragmentFactory(this.vm, el);
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.');
      this.invalid = true;
    }
  },

  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },

  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },

  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseFactory && !this.elseFrag) {
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

var uid$1 = 0;

var vFor = {

  priority: 2000,

  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

  bind: function bind() {
    // support "item in items" syntax
    var inMatch = this.expression.match(/(.*) in (.*)/);
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
      if (itMatch) {
        this.iterator = itMatch[1].trim();
        this.alias = itMatch[2].trim();
      } else {
        this.alias = inMatch[1].trim();
      }
      this.expression = inMatch[2];
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn('Alias is required in v-for.');
      return;
    }

    // uid as a cache identifier
    this.id = '__v-for__' + ++uid$1;

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName;
    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

    // setup anchor nodes
    this.start = createAnchor('v-for-start');
    this.end = createAnchor('v-for-end');
    replace(this.el, this.end);
    before(this.start, this.end);

    // cache
    this.cache = Object.create(null);

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el);
  },

  update: function update(data) {
    this.diff(data);
    this.updateRef();
    this.updateModel();
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff: function diff(data) {
    // check if the Array was converted from an Object
    var item = data[0];
    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

    var trackByKey = this.params.trackBy;
    var oldFrags = this.frags;
    var frags = this.frags = new Array(data.length);
    var alias = this.alias;
    var iterator = this.iterator;
    var start = this.start;
    var end = this.end;
    var inDocument = inDoc(start);
    var init = !oldFrags;
    var i, l, frag, key, value, primitive;

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i];
      key = convertedFromObject ? item.$key : null;
      value = convertedFromObject ? item.$value : item;
      primitive = !isObject(value);
      frag = !init && this.getCachedFrag(value, i, key);
      if (frag) {
        // reusable fragment
        frag.reused = true;
        // update $index
        frag.scope.$index = i;
        // update $key
        if (key) {
          frag.scope.$key = key;
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i;
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          frag.scope[alias] = value;
        }
      } else {
        // new isntance
        frag = this.create(value, alias, i, key);
        frag.fresh = !init;
      }
      frags[i] = frag;
      if (init) {
        frag.before(end);
      }
    }

    // we're done for the initial render.
    if (init) {
      return;
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0;
    var totalRemoved = oldFrags.length - frags.length;
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i];
      if (!frag.reused) {
        this.deleteCachedFrag(frag);
        this.remove(frag, removalIndex++, totalRemoved, inDocument);
      }
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev;
    var insertionIndex = 0;
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i];
      // this is the frag that we should be after
      targetPrev = frags[i - 1];
      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id);
        if (currentPrev !== targetPrev && (!currentPrev ||
        // optimization for moving a single item.
        // thanks to suggestions by @livoras in #1807
        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
          this.move(frag, prevEl);
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument);
      }
      frag.reused = frag.fresh = false;
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create: function create(value, alias, index, key) {
    var host = this._host;
    // create iteration scope
    var parentScope = this._scope || this.vm;
    var scope = Object.create(parentScope);
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs);
    scope.$els = Object.create(parentScope.$els);
    // make sure point $parent to parent scope
    scope.$parent = parentScope;
    // for two-way binding on alias
    scope.$forContext = this;
    // define scope properties
    defineReactive(scope, alias, value);
    defineReactive(scope, '$index', index);
    if (key) {
      defineReactive(scope, '$key', key);
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null);
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index);
    }
    var frag = this.factory.create(host, scope, this._frag);
    frag.forId = this.id;
    this.cacheFrag(value, frag, index, key);
    return frag;
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef: function updateRef() {
    var ref = this.descriptor.ref;
    if (!ref) return;
    var hash = (this._scope || this.vm).$refs;
    var refs;
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag);
    } else {
      refs = {};
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag);
      });
    }
    hash[ref] = refs;
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel: function updateModel() {
    if (this.isOption) {
      var parent = this.start.parentNode;
      var model = parent && parent.__v_model;
      if (model) {
        model.forceUpdate();
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert: function insert(frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter');
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor;
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
        anchor.__vfrag__ = frag;
      }
      after(anchor, prevEl);
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.before(anchor);
        remove(anchor);
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.before(prevEl.nextSibling);
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove: function remove(frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return;
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave');
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.remove();
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.remove();
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move: function move(frag, prevEl) {
    frag.before(prevEl.nextSibling, false);
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag: function cacheFrag(value, frag, index, key) {
    var trackByKey = this.params.trackBy;
    var cache = this.cache;
    var primitive = !isObject(value);
    var id;
    if (key || trackByKey || primitive) {
      id = trackByKey ? trackByKey === '$index' ? index : value[trackByKey] : key || value;
      if (!cache[id]) {
        cache[id] = frag;
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
      }
    } else {
      id = this.id;
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag;
        } else {
          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
        }
      } else {
        def(value, id, frag);
      }
    }
    frag.raw = value;
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag: function getCachedFrag(value, index, key) {
    var trackByKey = this.params.trackBy;
    var primitive = !isObject(value);
    var frag;
    if (key || trackByKey || primitive) {
      var id = trackByKey ? trackByKey === '$index' ? index : value[trackByKey] : key || value;
      frag = this.cache[id];
    } else {
      frag = value[this.id];
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
    }
    return frag;
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag: function deleteCachedFrag(frag) {
    var value = frag.raw;
    var trackByKey = this.params.trackBy;
    var scope = frag.scope;
    var index = scope.$index;
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key;
    var primitive = !isObject(value);
    if (trackByKey || key || primitive) {
      var id = trackByKey ? trackByKey === '$index' ? index : value[trackByKey] : key || value;
      this.cache[id] = null;
    } else {
      value[this.id] = null;
      frag.raw = null;
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function getStagger(frag, index, total, type) {
    type = type + 'Stagger';
    var trans = frag.node.__v_trans;
    var hooks = trans && trans.hooks;
    var hook = hooks && (hooks[type] || hooks.stagger);
    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess: function _preProcess(value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value;
    return value;
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * wathcer's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess: function _postProcess(value) {
    if (isArray(value)) {
      return value;
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value);
      var i = keys.length;
      var res = new Array(i);
      var key;
      while (i--) {
        key = keys[i];
        res[i] = {
          $key: key,
          $value: value[key]
        };
      }
      return res;
    } else {
      if (typeof value === 'number') {
        value = range(value);
      }
      return value || [];
    }
  },

  unbind: function unbind() {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
    }
    if (this.frags) {
      var i = this.frags.length;
      var frag;
      while (i--) {
        frag = this.frags[i];
        this.deleteCachedFrag(frag);
        frag.destroy();
      }
    }
  }
};

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag(frag, anchor, id) {
  var el = frag.node.previousSibling;
  /* istanbul ignore if */
  if (!el) return;
  frag = el.__vfrag__;
  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
    el = el.previousSibling;
    /* istanbul ignore if */
    if (!el) return;
    frag = el.__vfrag__;
  }
  return frag;
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag(frag) {
  var node = frag.node;
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling;
    }
  }
  return node.__vue__;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(n);
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.');
  };
}

var html = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = createAnchor('v-html');
      replace(this.el, this.anchor);
    }
  },

  update: function update(value) {
    value = _toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = parseTemplate(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = toArray(frag.childNodes);
    before(frag, this.anchor);
  }
};

var text = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },

  update: function update(value) {
    this.el[this.attr] = _toString(value);
  }
};

// must export plain object
var publicDirectives = {
  text: text,
  html: html,
  'for': vFor,
  'if': vIf,
  show: show,
  model: model,
  on: on,
  bind: bind,
  el: el,
  ref: ref,
  cloak: cloak
};

var queue$1 = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue$1.push(job);
  if (!queued) {
    queued = true;
    nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}

var TYPE_TRANSITION = 1;
var TYPE_ANIMATION = 2;
var transDurationProp = transitionProp + 'Duration';
var animDurationProp = animationProp + 'Duration';

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */
function Transition(el, id, hooks, vm) {
  this.id = id;
  this.el = el;
  this.enterClass = id + '-enter';
  this.leaveClass = id + '-leave';
  this.hooks = hooks;
  this.vm = vm;
  // async state
  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
  this.justEntered = false;
  this.entered = this.left = false;
  this.typeCache = {};
  // bind
  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
    self[m] = bind$1(self[m], self);
  });
}

var p$1 = Transition.prototype;

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p$1.enter = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeEnter');
  this.cb = cb;
  addClass(this.el, this.enterClass);
  op();
  this.entered = false;
  this.callHookWithCb('enter');
  if (this.entered) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled;
  pushJob(this.enterNextTick);
};

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p$1.enterNextTick = function () {

  // Important hack:
  // in Chrome, if a just-entered element is applied the
  // leave class while its interpolated property still has
  // a very small value (within one frame), Chrome will
  // skip the leave transition entirely and not firing the
  // transtionend event. Therefore we need to protected
  // against such cases using a one-frame timeout.
  this.justEntered = true;
  var self = this;
  setTimeout(function () {
    self.justEntered = false;
  }, 17);

  var enterDone = this.enterDone;
  var type = this.getCssTransitionType(this.enterClass);
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass);
      this.setupCssCb(transitionEndEvent, enterDone);
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone);
    } else {
      enterDone();
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass);
  }
};

/**
 * The "cleanup" phase of an entering transition.
 */

p$1.enterDone = function () {
  this.entered = true;
  this.cancel = this.pendingJsCb = null;
  removeClass(this.el, this.enterClass);
  this.callHook('afterEnter');
  if (this.cb) this.cb();
};

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p$1.leave = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeLeave');
  this.op = op;
  this.cb = cb;
  addClass(this.el, this.leaveClass);
  this.left = false;
  this.callHookWithCb('leave');
  if (this.left) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled;
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone();
    } else {
      pushJob(this.leaveNextTick);
    }
  }
};

/**
 * The "nextTick" phase of a leaving transition.
 */

p$1.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass);
  if (type) {
    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
    this.setupCssCb(event, this.leaveDone);
  } else {
    this.leaveDone();
  }
};

/**
 * The "cleanup" phase of a leaving transition.
 */

p$1.leaveDone = function () {
  this.left = true;
  this.cancel = this.pendingJsCb = null;
  this.op();
  removeClass(this.el, this.leaveClass);
  this.callHook('afterLeave');
  if (this.cb) this.cb();
  this.op = null;
};

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p$1.cancelPending = function () {
  this.op = this.cb = null;
  var hasPending = false;
  if (this.pendingCssCb) {
    hasPending = true;
    off(this.el, this.pendingCssEvent, this.pendingCssCb);
    this.pendingCssEvent = this.pendingCssCb = null;
  }
  if (this.pendingJsCb) {
    hasPending = true;
    this.pendingJsCb.cancel();
    this.pendingJsCb = null;
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass);
    removeClass(this.el, this.leaveClass);
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el);
    this.cancel = null;
  }
};

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p$1.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el);
  }
};

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p$1.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type];
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = cancellable(this[type + 'Done']);
    }
    hook.call(this.vm, this.el, this.pendingJsCb);
  }
};

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p$1.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (!transitionEndEvent ||
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  document.hidden ||
  // explicit js-only transition
  this.hooks && this.hooks.css === false ||
  // element is hidden
  isHidden(this.el)) {
    return;
  }
  var type = this.typeCache[className];
  if (type) return type;
  var inlineStyles = this.el.style;
  var computedStyles = window.getComputedStyle(this.el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION;
    }
  }
  if (type) {
    this.typeCache[className] = type;
  }
  return type;
};

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p$1.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event;
  var self = this;
  var el = this.el;
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      off(el, event, onEnd);
      self.pendingCssEvent = self.pendingCssCb = null;
      if (!self.pendingJsCb && cb) {
        cb();
      }
    }
  };
  on$1(el, event, onEnd);
};

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden(el) {
  return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

var transition = {

  priority: 1100,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
    id = id || 'v';
    // apply on closest vm
    el.__v_trans = new Transition(el, id, hooks, this.el.__vue__ || this.vm);
    if (oldId) {
      removeClass(el, oldId + '-transition');
    }
    addClass(el, id + '-transition');
  }
};

var bindingModes = config._propBindingModes;

var propDef = {

  bind: function bind() {

    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
      if (assertProp(prop, val)) {
        child[childKey] = val;
      }
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    initProp(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('hook:created', function () {
        self.childWatcher = new Watcher(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },

  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};

var component = {

  priority: 1500,

  params: ['keep-alive', 'transition-mode', 'inline-template'],

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   <comp> or <div v-component="comp">
   *
   * - dynamic:
   *   <component :is="view">
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // keep-alive cache
      this.keepAlive = this.params.keepAlive;
      if (this.keepAlive) {
        this.cache = {};
      }
      // check inline-template
      if (this.params.inlineTemplate) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = extractContent(this.el, true);
      }
      // component resolution related state
      this.pendingComponentCb = this.Component = null;
      // transition related state
      this.pendingRemovals = 0;
      this.pendingRemovalCb = null;
      // create a ref anchor
      this.anchor = createAnchor('v-component');
      replace(this.el, this.anchor);
      // remove is attribute.
      // this is removed during compilation, but because compilation is
      // cached, when the component is used elsewhere this attribute
      // will remain at link time.
      this.el.removeAttribute('is');
      // remove ref, same as above
      if (this.descriptor.ref) {
        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
      }
      // if static, build right now.
      if (this.literal) {
        this.setComponent(this.expression);
      }
    } else {
      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. <component :is="view">
   */

  update: function update(value) {
    if (!this.literal) {
      this.setComponent(value);
    }
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function setComponent(value, cb) {
    this.invalidatePending();
    if (!value) {
      // just remove current
      this.unbuild(true);
      this.remove(this.childVM, cb);
      this.childVM = null;
    } else {
      var self = this;
      this.resolveComponent(value, function () {
        self.mountComponent(cb);
      });
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveComponent: function resolveComponent(id, cb) {
    var self = this;
    this.pendingComponentCb = cancellable(function (Component) {
      self.ComponentName = Component.options.name || id;
      self.Component = Component;
      cb();
    });
    this.vm._resolveComponent(id, this.pendingComponentCb);
  },

  /**
   * Create a new instance using the current constructor and
   * replace the existing instance. This method doesn't care
   * whether the new component and the old one are actually
   * the same.
   *
   * @param {Function} [cb]
   */

  mountComponent: function mountComponent(cb) {
    // actual mount
    this.unbuild(true);
    var self = this;
    var activateHook = this.Component.options.activate;
    var cached = this.getCached();
    var newComponent = this.build();
    if (activateHook && !cached) {
      this.waitingFor = newComponent;
      activateHook.call(newComponent, function () {
        self.waitingFor = null;
        self.transition(newComponent, cb);
      });
    } else {
      // update ref for kept-alive component
      if (cached) {
        newComponent._updateRef();
      }
      this.transition(newComponent, cb);
    }
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function invalidatePending() {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel();
      this.pendingComponentCb = null;
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function build(extraOptions) {
    var cached = this.getCached();
    if (cached) {
      return cached;
    }
    if (this.Component) {
      // default options
      var options = {
        name: this.ComponentName,
        el: cloneNode(this.el),
        template: this.inlineTemplate,
        // make sure to add the child with correct parent
        // if this is a transcluded component, its parent
        // should be the transclusion host.
        parent: this._host || this.vm,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.descriptor.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-for, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      };
      // extra options
      // in 1.0.0 this is used by vue-router only
      /* istanbul ignore if */
      if (extraOptions) {
        extend(options, extraOptions);
      }
      var child = new this.Component(options);
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child;
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template);
      }
      return child;
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function getCached() {
    return this.keepAlive && this.cache[this.Component.cid];
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function unbuild(defer) {
    if (this.waitingFor) {
      this.waitingFor.$destroy();
      this.waitingFor = null;
    }
    var child = this.childVM;
    if (!child || this.keepAlive) {
      if (child) {
        // remove ref
        child._updateRef(true);
      }
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++;
      this.pendingRemovalCb = cb;
      var self = this;
      child.$remove(function () {
        self.pendingRemovals--;
        if (!keepAlive) child._cleanup();
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb();
          self.pendingRemovalCb = null;
        }
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function transition(target, cb) {
    var self = this;
    var current = this.childVM;
    // for devtool inspection
    if (process.env.NODE_ENV !== 'production') {
      if (current) current._inactive = true;
      target._inactive = false;
    }
    this.childVM = target;
    switch (self.params.transitionMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb);
        });
        break;
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.anchor, cb);
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.invalidatePending();
    // Do not defer cleanup when unbinding
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }
};

var vClass = {

  deep: true,

  update: function update(value) {
    if (value && typeof value === 'string') {
      this.handleObject(stringToObject(value));
    } else if (isPlainObject(value)) {
      this.handleObject(value);
    } else if (isArray(value)) {
      this.handleArray(value);
    } else {
      this.cleanup();
    }
  },

  handleObject: function handleObject(value) {
    this.cleanup(value);
    var keys = this.prevKeys = Object.keys(value);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      if (value[key]) {
        addClass(this.el, key);
      } else {
        removeClass(this.el, key);
      }
    }
  },

  handleArray: function handleArray(value) {
    this.cleanup(value);
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        addClass(this.el, value[i]);
      }
    }
    this.prevKeys = value.slice();
  },

  cleanup: function cleanup(value) {
    if (this.prevKeys) {
      var i = this.prevKeys.length;
      while (i--) {
        var key = this.prevKeys[i];
        if (key && (!value || !contains$1(value, key))) {
          removeClass(this.el, key);
        }
      }
    }
  }
};

function stringToObject(value) {
  var res = {};
  var keys = value.trim().split(/\s+/);
  var i = keys.length;
  while (i--) {
    res[keys[i]] = true;
  }
  return res;
}

function contains$1(value, key) {
  return isArray(value) ? value.indexOf(key) > -1 : hasOwn(value, key);
}

var internalDirectives = {
  style: style,
  'class': vClass,
  component: component,
  prop: propDef,
  transition: transition
};

var propBindingModes = config._propBindingModes;
var empty = {};

// regexes
var identRE = /^[$_a-zA-Z]+[\w$]*$/;
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @return {Function} propsLinkFn
 */

function compileProps(el, propOptions) {
  var props = [];
  var names = Object.keys(propOptions);
  var i = names.length;
  var options, name, attr, value, path, parsed, prop;
  while (i--) {
    name = names[i];
    options = propOptions[name] || empty;

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.');
      continue;
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name);
    if (!identRE.test(path)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.');
      continue;
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    };

    attr = hyphenate(name);
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY;
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME;
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value;
      parsed = parseDirective(value);
      value = parsed.expression;
      prop.filters = parsed.filters;
      // check binding type
      if (isLiteral(value)) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true;
      } else {
        prop.dynamic = true;
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY;
          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value);
        }
      }
      prop.parentPath = value;

      // warn required two-way
      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
        warn('Prop "' + name + '" expects a two-way binding type.');
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value;
    } else if (options.required) {
      // warn missing required
      process.env.NODE_ENV !== 'production' && warn('Missing required prop: ' + name);
    }
    // push prop
    props.push(prop);
  }
  return makePropsLinkFn(props);
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn(props) {
  return function propsLinkFn(vm, scope) {
    // store resolved props info
    vm._props = {};
    var i = props.length;
    var prop, path, options, value, raw;
    while (i--) {
      prop = props[i];
      raw = prop.raw;
      path = prop.path;
      options = prop.options;
      vm._props[path] = prop;
      if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, getDefault(vm, options));
      } else if (prop.dynamic) {
        // dynamic prop
        if (vm._context) {
          if (prop.mode === propBindingModes.ONE_TIME) {
            // one time binding
            value = (scope || vm._context).$get(prop.parentPath);
            initProp(vm, prop, value);
          } else {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope); // el, host, scope
          }
        } else {
            process.env.NODE_ENV !== 'production' && warn('Cannot bind dynamic prop on a root instance' + ' with no parent: ' + prop.name + '="' + raw + '"');
          }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw);
        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
        initProp(vm, prop, value);
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value
        value = options.type === Boolean && raw === '' ? true : raw;
        initProp(vm, prop, value);
      }
    }
  };
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} options
 * @return {*}
 */

function getDefault(vm, options) {
  // no default, return undefined
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean ? false : undefined;
  }
  var def = options['default'];
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Object/Array as default prop values will be shared ' + 'across multiple instances. Use a factory function ' + 'to return the default value instead.');
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
}

// special binding prefixes
var bindRE = /^v-bind:|^:/;
var onRE = /^v-on:|^@/;
var argRE = /:(.*)$/;
var modifierRE = /\.[^\.]+/g;
var transitionRE = /^(v-bind:|:)?transition$/;

// terminal directives
var terminalDirectives = ['for', 'if'];

// default directive priority
var DEFAULT_PRIORITY = 1000;

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

function compile(el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
  // link function for the childNodes
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && el.tagName !== 'SCRIPT' && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - link context fragment
   * @return {Function|undefined}
   */

  return function compositeLinkFn(vm, el, host, scope, frag) {
    // cache childNodes before linking parent, fix #657
    var childNodes = toArray(el.childNodes);
    // link
    var dirs = linkAndCapture(function compositeLinkCapturer() {
      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
    }, vm);
    return makeUnlinkFn(vm, dirs);
  };
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture(linker, vm) {
  var originalDirCount = vm._directives.length;
  linker();
  var dirs = vm._directives.slice(originalDirCount);
  dirs.sort(directiveComparator);
  for (var i = 0, l = dirs.length; i < l; i++) {
    dirs[i]._bind();
  }
  return dirs;
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
  return a > b ? -1 : a === b ? 0 : 1;
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn(vm, dirs, context, contextDirs) {
  return function unlink(destroying) {
    teardownDirs(vm, dirs, destroying);
    if (context && contextDirs) {
      teardownDirs(context, contextDirs);
    }
  };
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs(vm, dirs, destroying) {
  var i = dirs.length;
  while (i--) {
    dirs[i]._teardown();
    if (!destroying) {
      vm._directives.$remove(dirs[i]);
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} props
 * @param {Object} [scope]
 * @return {Function}
 */

function compileAndLinkProps(vm, el, props, scope) {
  var propsLinkFn = compileProps(el, props);
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, scope);
  }, vm);
  return makeUnlinkFn(vm, propDirs);
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} options
 * @param {Object} contextOptions
 * @return {Function}
 */

function compileRoot(el, options, contextOptions) {
  var containerAttrs = options._containerAttrs;
  var replacerAttrs = options._replacerAttrs;
  var contextLinkFn, replacerLinkFn;

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs && contextOptions) {
        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options);
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options);
    }
  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
    // warn container directives for fragment instances
    var names = containerAttrs.filter(function (attr) {
      // allow vue-loader/vueify scoped css attributes
      return attr.name.indexOf('_v-') < 0 &&
      // allow event listeners
      !onRE.test(attr.name) &&
      // allow slots
      attr.name !== 'slot';
    }).map(function (attr) {
      return '"' + attr.name + '"';
    });
    if (names.length) {
      var plural = names.length > 1;
      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment_Instance');
    }
  }

  return function rootLinkFn(vm, el, scope) {
    // link context scope dirs
    var context = vm._context;
    var contextDirs;
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el, null, scope);
      }, context);
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el);
    }, vm);

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
  };
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode(node, options) {
  var type = node.nodeType;
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, options);
  } else {
    return null;
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement(el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as an attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    var tokens = parseText(el.value);
    if (tokens) {
      el.setAttribute(':value', tokensToExp(tokens));
      el.value = '';
    }
  }
  var linkFn;
  var hasAttrs = el.hasAttributes();
  // check terminal directives (for & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, options);
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options);
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options);
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(el.attributes, options);
  }
  return linkFn;
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  // skip marked text nodes
  if (node._skip) {
    return removeText;
  }

  var tokens = parseText(node.wholeText);
  if (!tokens) {
    return null;
  }

  // mark adjacent text nodes as skipped,
  // because we are using node.wholeText to compile
  // all adjacent text nodes together. This fixes
  // issues in IE where sometimes it splits up a single
  // text node into multiple ones.
  var next = node.nextSibling;
  while (next && next.nodeType === 3) {
    next._skip = true;
    next = next.nextSibling;
  }

  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Linker for an skipped text node.
 *
 * @param {Vue} vm
 * @param {Text} node
 */

function removeText(vm, node) {
  remove(node);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment('v-html');
      setTokenType('html');
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ');
      setTokenType('text');
    }
  }
  function setTokenType(type) {
    if (token.descriptor) return;
    var parsed = parseDirective(token.value);
    token.descriptor = {
      name: type,
      def: publicDirectives[type],
      expression: parsed.expression,
      filters: parsed.filters
    };
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el, host, scope) {
    var fragClone = frag.cloneNode(true);
    var childNodes = toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = (scope || vm).$eval(value);
          if (token.html) {
            replace(node, parseTemplate(value, true));
          } else {
            node.data = value;
          }
        } else {
          vm._bindDir(token.descriptor, node, host, scope);
        }
      }
    }
    replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes, host, scope, frag) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host, scope, frag);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host, scope, frag);
      }
    }
  };
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives(el, options) {
  var tag = el.tagName.toLowerCase();
  if (commonTagRE.test(tag)) return;
  var def = resolveAsset(options, 'elementDirectives', tag);
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def);
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|undefined}
 */

function checkComponent(el, options) {
  var component = checkComponentAttr(el, options);
  if (component) {
    var ref = findRef(el);
    var descriptor = {
      name: 'component',
      ref: ref,
      expression: component.id,
      def: internalDirectives.component,
      modifiers: {
        literal: !component.dynamic
      }
    };
    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
      if (ref) {
        defineReactive((scope || vm).$refs, ref, null);
      }
      vm._bindDir(descriptor, el, host, scope, frag);
    };
    componentLinkFn.terminal = true;
    return componentLinkFn;
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives(el, options) {
  // skip v-pre
  if (getAttr(el, 'v-pre') !== null) {
    return skip;
  }
  // skip v-else block, but only if following v-if
  if (el.hasAttribute('v-else')) {
    var prev = el.previousElementSibling;
    if (prev && prev.hasAttribute('v-if')) {
      return skip;
    }
  }
  var value, dirName;
  for (var i = 0, l = terminalDirectives.length; i < l; i++) {
    dirName = terminalDirectives[i];
    /* eslint-disable no-cond-assign */
    if (value = el.getAttribute('v-' + dirName)) {
      return makeTerminalNodeLinkFn(el, dirName, value, options);
    }
    /* eslint-enable no-cond-assign */
  }
}

function skip() {}
skip.terminal = true;

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} [def]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn(el, dirName, value, options, def) {
  var parsed = parseDirective(value);
  var descriptor = {
    name: dirName,
    expression: parsed.expression,
    filters: parsed.filters,
    raw: value,
    // either an element directive, or if/for
    def: def || publicDirectives[dirName]
  };
  // check ref for v-for and router-view
  if (dirName === 'for' || dirName === 'router-view') {
    descriptor.ref = findRef(el);
  }
  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
    if (descriptor.ref) {
      defineReactive((scope || vm).$refs, descriptor.ref, null);
    }
    vm._bindDir(descriptor, el, host, scope, frag);
  };
  fn.terminal = true;
  return fn;
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives(attrs, options) {
  var i = attrs.length;
  var dirs = [];
  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens;
  while (i--) {
    attr = attrs[i];
    name = rawName = attr.name;
    value = rawValue = attr.value;
    tokens = parseText(value);
    // reset arg
    arg = null;
    // check modifiers
    modifiers = parseModifiers(name);
    name = name.replace(modifierRE, '');

    // attribute interpolations
    if (tokens) {
      value = tokensToExp(tokens);
      arg = name;
      pushDir('bind', publicDirectives.bind, true);
      // warn against mixing mustaches with v-bind
      if (process.env.NODE_ENV !== 'production') {
        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
          return attr.name === ':class' || attr.name === 'v-bind:class';
        })) {
          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.');
        }
      }
    } else

      // special attribute: transition
      if (transitionRE.test(name)) {
        modifiers.literal = !bindRE.test(name);
        pushDir('transition', internalDirectives.transition);
      } else

        // event handlers
        if (onRE.test(name)) {
          arg = name.replace(onRE, '');
          pushDir('on', publicDirectives.on);
        } else

          // attribute bindings
          if (bindRE.test(name)) {
            dirName = name.replace(bindRE, '');
            if (dirName === 'style' || dirName === 'class') {
              pushDir(dirName, internalDirectives[dirName]);
            } else {
              arg = dirName;
              pushDir('bind', publicDirectives.bind);
            }
          } else

            // normal directives
            if (name.indexOf('v-') === 0) {
              // check arg
              arg = (arg = name.match(argRE)) && arg[1];
              if (arg) {
                name = name.replace(argRE, '');
              }
              // extract directive name
              dirName = name.slice(2);

              // skip v-else (when used with v-show)
              if (dirName === 'else') {
                continue;
              }

              dirDef = resolveAsset(options, 'directives', dirName);

              if (process.env.NODE_ENV !== 'production') {
                assertAsset(dirDef, 'directive', dirName);
              }

              if (dirDef) {
                pushDir(dirName, dirDef);
              }
            }
  }

  /**
   * Push a directive.
   *
   * @param {String} dirName
   * @param {Object|Function} def
   * @param {Boolean} [interp]
   */

  function pushDir(dirName, def, interp) {
    var parsed = parseDirective(value);
    dirs.push({
      name: dirName,
      attr: rawName,
      raw: rawValue,
      def: def,
      arg: arg,
      modifiers: modifiers,
      expression: parsed.expression,
      filters: parsed.filters,
      interp: interp
    });
  }

  if (dirs.length) {
    return makeNodeLinkFn(dirs);
  }
}

/**
 * Parse modifiers from directive attribute name.
 *
 * @param {String} name
 * @return {Object}
 */

function parseModifiers(name) {
  var res = Object.create(null);
  var match = name.match(modifierRE);
  if (match) {
    var i = match.length;
    while (i--) {
      res[match[i].slice(1)] = true;
    }
  }
  return res;
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn(directives) {
  return function nodeLinkFn(vm, el, host, scope, frag) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    while (i--) {
      vm._bindDir(directives[i], el, host, scope, frag);
    }
  };
}

var specialCharRE = /[^\w\-:\.]/;

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-for.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transclude(el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el);
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (isTemplate(el)) {
    el = parseTemplate(el);
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<slot></slot>';
    }
    if (options.template) {
      options._content = extractContent(el);
      el = transcludeTemplate(el, options);
    }
  }
  if (el instanceof DocumentFragment) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    prepend(createAnchor('v-start', true), el);
    el.appendChild(createAnchor('v-end', true));
  }
  return el;
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = parseTemplate(template, true);
  if (frag) {
    var replacer = frag.firstChild;
    var tag = replacer.tagName && replacer.tagName.toLowerCase();
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
      // multi-children template
      frag.childNodes.length > 1 ||
      // non-element template
      replacer.nodeType !== 1 ||
      // single nested component
      tag === 'component' || resolveAsset(options, 'components', tag) || replacer.hasAttribute('is') || replacer.hasAttribute(':is') || replacer.hasAttribute('v-bind:is') ||
      // element directive
      resolveAsset(options, 'elementDirectives', tag) ||
      // for block
      replacer.hasAttribute('v-for') ||
      // if block
      replacer.hasAttribute('v-if')) {
        return frag;
      } else {
        options._replacerAttrs = extractAttrs(replacer);
        mergeAttrs(el, replacer);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      return el;
    }
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs(el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return toArray(el.attributes);
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs(from, to) {
  var attrs = from.attributes;
  var i = attrs.length;
  var name, value;
  while (i--) {
    name = attrs[i].name;
    value = attrs[i].value;
    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
      to.setAttribute(name, value);
    } else if (name === 'class') {
      value.split(/\s+/).forEach(function (cls) {
        addClass(to, cls);
      });
    }
  }
}

var compiler = Object.freeze({
	compile: compile,
	compileAndLinkProps: compileAndLinkProps,
	compileRoot: compileRoot,
	transclude: transclude
});

function stateMixin (Vue) {

  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        this._setData(newData);
      }
    }
  });

  /**
   * Setup the scope of an instance, which contains:
   * - observed data
   * - computed properties
   * - user methods
   * - meta properties
   */

  Vue.prototype._initState = function () {
    this._initProps();
    this._initMeta();
    this._initMethods();
    this._initData();
    this._initComputed();
  };

  /**
   * Initialize props.
   */

  Vue.prototype._initProps = function () {
    var options = this.$options;
    var el = options.el;
    var props = options.props;
    if (props && !el) {
      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.');
    }
    // make sure to convert string selectors into element now
    el = options.el = query(el);
    this._propsUnlinkFn = el && el.nodeType === 1 && props
    // props must be linked in proper scope if inside v-for
    ? compileAndLinkProps(this, el, props, this._scope) : null;
  };

  /**
   * Initialize the data.
   */

  Vue.prototype._initData = function () {
    var propsData = this._data;
    var optionsDataFn = this.$options.data;
    var optionsData = optionsDataFn && optionsDataFn();
    if (optionsData) {
      this._data = optionsData;
      for (var prop in propsData) {
        if (process.env.NODE_ENV !== 'production' && hasOwn(optionsData, prop)) {
          warn('Data field "' + prop + '" is already defined ' + 'as a prop. Use prop default value instead.');
        }
        if (this._props[prop].raw !== null || !hasOwn(optionsData, prop)) {
          set(optionsData, prop, propsData[prop]);
        }
      }
    }
    var data = this._data;
    // proxy data on instance
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
      key = keys[i];
      this._proxy(key);
    }
    // observe data
    observe(data, this);
  };

  /**
   * Swap the instance's $data. Called in $data's setter.
   *
   * @param {Object} newData
   */

  Vue.prototype._setData = function (newData) {
    newData = newData || {};
    var oldData = this._data;
    this._data = newData;
    var keys, key, i;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        this._unproxy(key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(this, key)) {
        // new property
        this._proxy(key);
      }
    }
    oldData.__ob__.removeVm(this);
    observe(newData, this);
    this._digest();
  };

  /**
   * Proxy a property, so that
   * vm.prop === vm._data.prop
   *
   * @param {String} key
   */

  Vue.prototype._proxy = function (key) {
    if (!isReserved(key)) {
      // need to store ref to self here
      // because these getter/setters might
      // be called by child scopes via
      // prototype inheritance.
      var self = this;
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(val) {
          self._data[key] = val;
        }
      });
    }
  };

  /**
   * Unproxy a property.
   *
   * @param {String} key
   */

  Vue.prototype._unproxy = function (key) {
    if (!isReserved(key)) {
      delete this[key];
    }
  };

  /**
   * Force update on every watcher in scope.
   */

  Vue.prototype._digest = function () {
    for (var i = 0, l = this._watchers.length; i < l; i++) {
      this._watchers[i].update(true); // shallow updates
    }
  };

  /**
   * Setup computed properties. They are essentially
   * special getter/setters
   */

  function noop() {}
  Vue.prototype._initComputed = function () {
    var computed = this.$options.computed;
    if (computed) {
      for (var key in computed) {
        var userDef = computed[key];
        var def = {
          enumerable: true,
          configurable: true
        };
        if (typeof userDef === 'function') {
          def.get = makeComputedGetter(userDef, this);
          def.set = noop;
        } else {
          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind$1(userDef.get, this) : noop;
          def.set = userDef.set ? bind$1(userDef.set, this) : noop;
        }
        Object.defineProperty(this, key, def);
      }
    }
  };

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, null, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  /**
   * Setup instance methods. Methods must be bound to the
   * instance since they might be passed down as a prop to
   * child components.
   */

  Vue.prototype._initMethods = function () {
    var methods = this.$options.methods;
    if (methods) {
      for (var key in methods) {
        this[key] = bind$1(methods[key], this);
      }
    }
  };

  /**
   * Initialize meta information like $index, $key & $value.
   */

  Vue.prototype._initMeta = function () {
    var metas = this.$options._meta;
    if (metas) {
      for (var key in metas) {
        defineReactive(this, key, metas[key]);
      }
    }
  };
}

var eventRE = /^v-on:|^@/;

function eventsMixin (Vue) {

  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options;
    if (options._asComponent) {
      registerComponentEvents(this, options.el);
    }
    registerCallbacks(this, '$on', options.events);
    registerCallbacks(this, '$watch', options.watch);
  };

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents(vm, el) {
    var attrs = el.attributes;
    var name, handler;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '');
        handler = (vm._scope || vm._context).$eval(attrs[i].value, true);
        vm.$on(name.replace(eventRE), handler);
      }
    }
  }

  /**
   * Register callbacks for option events and watchers.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {Object} hash
   */

  function registerCallbacks(vm, action, hash) {
    if (!hash) return;
    var handlers, key, i, j;
    for (key in hash) {
      handlers = hash[key];
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i]);
        }
      } else {
        register(vm, action, key, handlers);
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register(vm, action, key, handler, options) {
    var type = typeof handler;
    if (type === 'function') {
      vm[action](key, handler, options);
    } else if (type === 'string') {
      var methods = vm.$options.methods;
      var method = methods && methods[handler];
      if (method) {
        vm[action](key, method, options);
      } else {
        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".');
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler);
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached);
    this.$on('hook:detached', onDetached);
  };

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached() {
    if (!this._isAttached) {
      this._isAttached = true;
      this.$children.forEach(callAttach);
    }
  }

  /**
   * Iterator to call attached hook
   *
   * @param {Vue} child
   */

  function callAttach(child) {
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached');
    }
  }

  /**
   * Callback to recursively call detached hook on children
   */

  function onDetached() {
    if (this._isAttached) {
      this._isAttached = false;
      this.$children.forEach(callDetach);
    }
  }

  /**
   * Iterator to call detached hook
   *
   * @param {Vue} child
   */

  function callDetach(child) {
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached');
    }
  }

  /**
   * Trigger all handlers for a hook
   *
   * @param {String} hook
   */

  Vue.prototype._callHook = function (hook) {
    var handlers = this.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this);
      }
    }
    this.$emit('hook:' + hook);
  };
}

function noop() {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {String} name
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} name
 *                 - {Object} def
 *                 - {String} expression
 *                 - {Array<Object>} [filters]
 *                 - {Boolean} literal
 *                 - {String} attr
 *                 - {String} raw
 * @param {Object} def - directive definition object
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 * @constructor
 */
function Directive(descriptor, vm, el, host, scope, frag) {
  this.vm = vm;
  this.el = el;
  // copy descriptor properties
  this.descriptor = descriptor;
  this.name = descriptor.name;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.modifiers = descriptor.modifiers;
  this.filters = descriptor.filters;
  this.literal = this.modifiers && this.modifiers.literal;
  // private
  this._locked = false;
  this._bound = false;
  this._listeners = null;
  // link context
  this._host = host;
  this._scope = scope;
  this._frag = frag;
  // store directives on node in dev mode
  if (process.env.NODE_ENV !== 'production' && this.el) {
    this.el._vue_directives = this.el._vue_directives || [];
    this.el._vue_directives.push(this);
  }
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 *
 * @param {Object} def
 */

Directive.prototype._bind = function () {
  var name = this.name;
  var descriptor = this.descriptor;

  // remove attribute
  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
    var attr = descriptor.attr || 'v-' + name;
    this.el.removeAttribute(attr);
  }

  // copy def properties
  var def = descriptor.def;
  if (typeof def === 'function') {
    this.update = def;
  } else {
    extend(this, def);
  }

  // setup directive params
  this._setupParams();

  // initial bind
  if (this.bind) {
    this.bind();
  }

  if (this.literal) {
    this.update && this.update(descriptor.raw);
  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal);
        }
      };
    } else {
      this._update = noop;
    }
    var preProcess = this._preProcess ? bind$1(this._preProcess, this) : null;
    var postProcess = this._postProcess ? bind$1(this._postProcess, this) : null;
    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
    {
      filters: this.filters,
      twoWay: this.twoWay,
      deep: this.deep,
      preProcess: preProcess,
      postProcess: postProcess,
      scope: this._scope
    });
    // v-model with inital inline value need to sync back to
    // model instead of update to DOM on init. They would
    // set the afterBind hook to indicate that.
    if (this.afterBind) {
      this.afterBind();
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
  this._bound = true;
};

/**
 * Setup all param attributes, e.g. track-by,
 * transition-mode, etc...
 */

Directive.prototype._setupParams = function () {
  if (!this.params) {
    return;
  }
  var params = this.params;
  // swap the params array with a fresh object.
  this.params = Object.create(null);
  var i = params.length;
  var key, val, mappedKey;
  while (i--) {
    key = params[i];
    mappedKey = camelize(key);
    val = getBindAttr(this.el, key);
    if (val != null) {
      // dynamic
      this._setupParamWatcher(mappedKey, val);
    } else {
      // static
      val = getAttr(this.el, key);
      if (val != null) {
        this.params[mappedKey] = val === '' ? true : val;
      }
    }
  }
};

/**
 * Setup a watcher for a dynamic param.
 *
 * @param {String} key
 * @param {String} expression
 */

Directive.prototype._setupParamWatcher = function (key, expression) {
  var self = this;
  var called = false;
  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
    self.params[key] = val;
    // since we are in immediate mode,
    // only call the param change callbacks if this is not the first update.
    if (called) {
      var cb = self.paramWatchers && self.paramWatchers[key];
      if (cb) {
        cb.call(self, val, oldVal);
      }
    } else {
      called = true;
    }
  }, {
    immediate: true
  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. on-click="a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !isSimplePath(expression)) {
    var fn = parseExpression(expression).get;
    var scope = this._scope || this.vm;
    var handler = function handler(e) {
      scope.$event = e;
      fn.call(scope, scope);
      scope.$event = null;
    };
    if (this.filters) {
      handler = scope._applyFilters(handler, null, this.filters);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn('Directive.set() can only be used inside twoWay' + 'directives.');
  }
};

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this;
  self._locked = true;
  fn.call(self);
  nextTick(function () {
    self._locked = false;
  });
};

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 */

Directive.prototype.on = function (event, handler) {
  on$1(this.el, event, handler);(this._listeners || (this._listeners = [])).push([event, handler]);
};

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false;
    if (this.unbind) {
      this.unbind();
    }
    if (this._watcher) {
      this._watcher.teardown();
    }
    var listeners = this._listeners;
    var i;
    if (listeners) {
      i = listeners.length;
      while (i--) {
        off(this.el, listeners[i][0], listeners[i][1]);
      }
    }
    var unwatchFns = this._paramUnwatchFns;
    if (unwatchFns) {
      i = unwatchFns.length;
      while (i--) {
        unwatchFns[i]();
      }
    }
    if (process.env.NODE_ENV !== 'production' && this.el) {
      this.el._vue_directives.$remove(this);
    }
    this.vm = this.el = this._watcher = this._listeners = null;
  }
};

function lifecycleMixin (Vue) {

  /**
   * Update v-ref for component.
   *
   * @param {Boolean} remove
   */

  Vue.prototype._updateRef = function (remove) {
    var ref = this.$options._ref;
    if (ref) {
      var refs = (this._scope || this._context).$refs;
      if (remove) {
        if (refs[ref] === this) {
          refs[ref] = null;
        }
      } else {
        refs[ref] = this;
      }
    }
  };

  /**
   * Transclude, compile and link element.
   *
   * If a pre-compiled linker is available, that means the
   * passed in element will be pre-transcluded and compiled
   * as well - all we need to do is to call the linker.
   *
   * Otherwise we need to call transclude/compile/link here.
   *
   * @param {Element} el
   * @return {Element}
   */

  Vue.prototype._compile = function (el) {
    var options = this.$options;

    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el;
    el = transclude(el, options);
    this._initElement(el);

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var contextOptions = this._context && this._context.$options;
    var rootLinker = compileRoot(el, options, contextOptions);

    // compile and link the rest
    var contentLinkFn;
    var ctor = this.constructor;
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker;
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compile(el, options);
      }
    }

    // link phase
    // make sure to link root with prop scope!
    var rootUnlinkFn = rootLinker(this, el, this._scope);
    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn();
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true);
    };

    // finally replace original
    if (options.replace) {
      replace(original, el);
    }

    this._isCompiled = true;
    this._callHook('compiled');
    return el;
  };

  /**
   * Initialize instance element. Called in the public
   * $mount() method.
   *
   * @param {Element} el
   */

  Vue.prototype._initElement = function (el) {
    if (el instanceof DocumentFragment) {
      this._isFragment = true;
      this.$el = this._fragmentStart = el.firstChild;
      this._fragmentEnd = el.lastChild;
      // set persisted text anchors to empty
      if (this._fragmentStart.nodeType === 3) {
        this._fragmentStart.data = this._fragmentEnd.data = '';
      }
      this._fragment = el;
    } else {
      this.$el = el;
    }
    this.$el.__vue__ = this;
    this._callHook('beforeCompile');
  };

  /**
   * Create and bind a directive to an element.
   *
   * @param {String} name - directive name
   * @param {Node} node   - target node
   * @param {Object} desc - parsed directive descriptor
   * @param {Object} def  - directive definition object
   * @param {Vue} [host] - transclusion host component
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - owner fragment
   */

  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
  };

  /**
   * Teardown an instance, unobserves the data, unbind all the
   * directives, turn off all the event listeners, etc.
   *
   * @param {Boolean} remove - whether to remove the DOM node.
   * @param {Boolean} deferCleanup - if true, defer cleanup to
   *                                 be called later
   */

  Vue.prototype._destroy = function (remove, deferCleanup) {
    if (this._isBeingDestroyed) {
      if (!deferCleanup) {
        this._cleanup();
      }
      return;
    }
    this._callHook('beforeDestroy');
    this._isBeingDestroyed = true;
    var i;
    // remove self from parent. only necessary
    // if parent is not being destroyed as well.
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this);
      // unregister ref (remove: true)
      this._updateRef(true);
    }
    // destroy all children.
    i = this.$children.length;
    while (i--) {
      this.$children[i].$destroy();
    }
    // teardown props
    if (this._propsUnlinkFn) {
      this._propsUnlinkFn();
    }
    // teardown all directives. this also tearsdown all
    // directive-owned watchers.
    if (this._unlinkFn) {
      this._unlinkFn();
    }
    i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference to self on $el
    if (this.$el) {
      this.$el.__vue__ = null;
    }
    // remove DOM element
    var self = this;
    if (remove && this.$el) {
      this.$remove(function () {
        self._cleanup();
      });
    } else if (!deferCleanup) {
      this._cleanup();
    }
  };

  /**
   * Clean up to ensure garbage collection.
   * This is called after the leave transition if there
   * is any.
   */

  Vue.prototype._cleanup = function () {
    if (this._isDestroyed) {
      return;
    }
    // remove self from owner fragment
    // do it in cleanup so that we can call $destroy with
    // defer right when a fragment is about to be removed.
    if (this._frag) {
      this._frag.children.$remove(this);
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // Clean up references to private properties and other
    // instances. preserve reference to _data so that proxy
    // accessors still work. The only potential side effect
    // here is that mutating the instance after it's destroyed
    // may affect the state of other components that are still
    // observing the same object, but that seems to be a
    // reasonable responsibility for the user rather than
    // always throwing an error on them.
    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
    // call the last hook...
    this._isDestroyed = true;
    this._callHook('destroyed');
    // turn off all instance listeners.
    this.$off();
  };
}

function miscMixin (Vue) {

  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k;
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[i];
      fn = resolveAsset(this.$options, 'filters', filter.name);
      if (process.env.NODE_ENV !== 'production') {
        assertAsset(fn, 'filter', filter.name);
      }
      if (!fn) continue;
      fn = write ? fn.write : fn.read || fn;
      if (typeof fn !== 'function') continue;
      args = write ? [value, oldValue] : [value];
      offset = write ? 2 : 1;
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j];
          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
        }
      }
      value = fn.apply(this, args);
    }
    return value;
  };

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String} id
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (id, cb) {
    var factory = resolveAsset(this.$options, 'components', id);
    if (process.env.NODE_ENV !== 'production') {
      assertAsset(factory, 'component', id);
    }
    if (!factory) {
      return;
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved);
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb);
      } else {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        factory(function resolve(res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }, function reject(reason) {
          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component: ' + id + '. ' + (reason ? '\nReason: ' + reason : ''));
        });
      }
    } else {
      // normal component
      cb(factory);
    }
  };
}

function globalAPI (Vue) {

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = config;
  Vue.set = set;
  Vue['delete'] = del;
  Vue.nextTick = nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = FragmentFactory;
  Vue.internalDirectives = internalDirectives;
  Vue.parsers = {
    path: path,
    text: text$1,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && commonTagRE.test(id)) {
            warn('Do not use built-in HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = id;
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}

var filterRE = /[^|]\|[^|]/;

function dataAPI (Vue) {

  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp);
    if (res) {
      if (asStatement && !isSimplePath(exp)) {
        var self = this;
        return function statementHandler() {
          res.get.call(self, self);
        };
      } else {
        try {
          return res.get.call(this, this);
        } catch (e) {}
      }
    }
  };

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true);
    if (res && res.set) {
      res.set.call(this, this, val);
    }
  };

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key);
  };

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    var parsed;
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn);
      expOrFn = parsed.expression;
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      filters: parsed && parsed.filters
    });
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE.test(text)) {
      var dir = parseDirective(text);
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement);
      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
    } else {
      // no filter
      return this.$get(text, asStatement);
    }
  };

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text);
    var vm = this;
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + '';
      } else {
        return tokens.map(function (token) {
          return token.tag ? vm.$eval(token.value) : token.value;
        }).join('');
      }
    } else {
      return text;
    }
  };

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path ? getPath(this._data, path) : this._data;
    if (data) {
      data = clean(data);
    }
    // include computed fields
    if (!path) {
      for (var key in this.$options.computed) {
        data[key] = clean(this[key]);
      }
    }
    console.log(data);
  };

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

function domAPI (Vue) {

  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, append, appendWithTransition);
  };

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target);
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition);
    } else {
      this.$appendTo(target, cb, withTransition);
    }
    return this;
  };

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
  };

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target);
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition);
    } else {
      this.$appendTo(target.parentNode, cb, withTransition);
    }
    return this;
  };

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb();
    }
    var inDocument = this._isAttached && inDoc(this.$el);
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false;
    var self = this;
    var realCb = function realCb() {
      if (inDocument) self._callHook('detached');
      if (cb) cb();
    };
    if (this._isFragment) {
      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
    } else {
      var op = withTransition === false ? removeWithCb : removeWithTransition;
      op(this.$el, this, realCb);
    }
    return this;
  };

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert(vm, target, cb, withTransition, op1, op2) {
    target = query(target);
    var targetIsDetached = !inDoc(target);
    var op = withTransition === false || targetIsDetached ? op1 : op2;
    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm);
      });
      cb && cb();
    } else {
      op(vm.$el, target, vm, cb);
    }
    if (shouldCallHook) {
      vm._callHook('attached');
    }
    return vm;
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append(el, target, vm, cb) {
    target.appendChild(el);
    if (cb) cb();
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb(el, target, vm, cb) {
    before(el, target);
    if (cb) cb();
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb(el, vm, cb) {
    remove(el);
    if (cb) cb();
  }
}

function eventsAPI (Vue) {

  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    modifyListenerCount(this, event, 1);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event];
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length);
          }
        }
      }
      this._events = {};
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length);
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1);
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var cbs = this._events[event];
    var shouldPropagate = !cbs;
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        var res = cbs[i].apply(this, args);
        if (res === true) {
          shouldPropagate = true;
        }
      }
    }
    return shouldPropagate;
  };

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return;
    var children = this.$children;
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var shouldPropagate = child.$emit.apply(child, arguments);
      if (shouldPropagate) {
        child.$broadcast.apply(child, arguments);
      }
    }
    return this;
  };

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function () {
    this.$emit.apply(this, arguments);
    var parent = this.$parent;
    while (parent) {
      var shouldPropagate = parent.$emit.apply(parent, arguments);
      parent = shouldPropagate ? parent.$parent : null;
    }
    return this;
  };

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/;
  function modifyListenerCount(vm, event, count) {
    var parent = vm.$parent;
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return;
    while (parent) {
      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
      parent = parent.$parent;
    }
  }
}

function lifecycleAPI (Vue) {

  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.');
      return;
    }
    el = query(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if (inDoc(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return compile(el, this.$options, true)(this, el, host, scope, frag);
  };
}

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
miscMixin(Vue);

// install APIs
globalAPI(Vue);
dataAPI(Vue);
domAPI(Vue);
eventsAPI(Vue);
lifecycleAPI(Vue);

var convertArray = vFor._postProcess;

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

function limitBy(arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0;
  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

function filterBy(arr, search, delimiter) {
  arr = convertArray(arr);
  if (search == null) {
    return arr;
  }
  if (typeof search === 'function') {
    return arr.filter(search);
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase();
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2;
  // extract and flatten keys
  var keys = toArray(arguments, n).reduce(function (prev, cur) {
    return prev.concat(cur);
  }, []);
  var res = [];
  var item, key, val, j;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    val = item && item.$value || item;
    j = keys.length;
    if (j) {
      while (j--) {
        key = keys[j];
        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
          res.push(item);
          break;
        }
      }
    } else if (contains(item, search)) {
      res.push(item);
    }
  }
  return res;
}

/**
 * Filter filter for arrays
 *
 * @param {String} sortKey
 * @param {String} reverse
 */

function orderBy(arr, sortKey, reverse) {
  arr = convertArray(arr);
  if (!sortKey) {
    return arr;
  }
  var order = reverse && reverse < 0 ? -1 : 1;
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    if (sortKey !== '$key') {
      if (isObject(a) && '$value' in a) a = a.$value;
      if (isObject(b) && '$value' in b) b = b.$value;
    }
    a = isObject(a) ? getPath(a, sortKey) : a;
    b = isObject(b) ? getPath(b, sortKey) : b;
    return a === b ? 0 : a > b ? order : -order;
  });
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  var i;
  if (isPlainObject(val)) {
    var keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true;
      }
    }
  } else if (isArray(val)) {
    i = val.length;
    while (i--) {
      if (contains(val[i], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}

var digitsRE = /(\d{3})(?=\d)/g;

// asset collections must be a plain object.
var filters = {

  orderBy: orderBy,
  filterBy: filterBy,
  limitBy: limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function read(value, indent) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, Number(indent) || 2);
    },
    write: function write(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize: function capitalize(value) {
    if (!value && value !== 0) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase: function uppercase(value) {
    return value || value === 0 ? value.toString().toUpperCase() : '';
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase: function lowercase(value) {
    return value || value === 0 ? value.toString().toLowerCase() : '';
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   */

  currency: function currency(value, _currency) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    _currency = _currency != null ? _currency : '$';
    var stringified = Math.abs(value).toFixed(2);
    var _int = stringified.slice(0, -3);
    var i = _int.length % 3;
    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    var _float = stringified.slice(-3);
    var sign = value < 0 ? '-' : '';
    return _currency + sign + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize: function pluralize(value) {
    var args = toArray(arguments, 1);
    return args.length > 1 ? args[value % 10 - 1] || args[args.length - 1] : args[0] + (value === 1 ? '' : 's');
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce: function debounce(handler, delay) {
    if (!handler) return;
    if (!delay) {
      delay = 300;
    }
    return _debounce(handler, delay);
  }
};

var partial = {

  priority: 1750,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      vIf.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = createAnchor('v-partial');
    replace(this.el, this.anchor);
    this.insert(this.params.name);
  },

  insert: function insert(id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id);
    if (process.env.NODE_ENV !== 'production') {
      assertAsset(partial, 'partial', id);
    }
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial);
      vIf.insert.call(this);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

// This is the elementDirective that handles <content>
// transclusions. It relies on the raw content of an
// instance being stored as `$options._content` during
// the transclude phase.

var slot = {

  priority: 1750,

  params: ['name'],

  bind: function bind() {
    var host = this.vm;
    var raw = host.$options._content;
    var content;
    if (!raw) {
      this.fallback();
      return;
    }
    var context = host._context;
    var slotName = this.params.name;
    if (!slotName) {
      // Default content
      var self = this;
      var compileDefaultContent = function compileDefaultContent() {
        self.compile(extractFragment(raw.childNodes, raw, true), context, host);
      };
      if (!host._isCompiled) {
        // defer until the end of instance compilation,
        // because the default outlet must wait until all
        // other possible outlets with selectors have picked
        // out their contents.
        host.$once('hook:compiled', compileDefaultContent);
      } else {
        compileDefaultContent();
      }
    } else {
      var selector = '[slot="' + slotName + '"]';
      var nodes = raw.querySelectorAll(selector);
      if (nodes.length) {
        content = extractFragment(nodes, raw);
        if (content.hasChildNodes()) {
          this.compile(content, context, host);
        } else {
          this.fallback();
        }
      } else {
        this.fallback();
      }
    }
  },

  fallback: function fallback() {
    this.compile(extractContent(this.el, true), this.vm);
  },

  compile: function compile(content, context, host) {
    if (content && context) {
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      replace(this.el, content);
    } else {
      remove(this.el);
    }
  },

  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @param {Element} parent
 * @param {Boolean} main
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent, main) {
  var frag = document.createDocumentFragment();
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    // if this is the main outlet, we want to skip all
    // previously selected nodes;
    // otherwise, we want to mark the node as selected.
    // clone the node so the original raw content remains
    // intact. this ensures proper re-compilation in cases
    // where the outlet is inside a conditional block
    if (main && !node.__v_selected) {
      append(node);
    } else if (!main && node.parentNode === parent) {
      node.__v_selected = true;
      append(node);
    }
  }
  return frag;

  function append(node) {
    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      node = parseTemplate(node);
    }
    node = cloneNode(node);
    frag.appendChild(node);
  }
}

var elementDirectives = {
  slot: slot,
  partial: partial
};

Vue.version = '1.0.10';

/**
 * Vue and every constructor that extends Vue has an
 * associated options object, which can be accessed during
 * compilation steps as `this.constructor.options`.
 *
 * These can be seen as the default options of every
 * Vue instance.
 */

Vue.options = {
  directives: publicDirectives,
  elementDirectives: elementDirectives,
  filters: filters,
  transitions: {},
  components: {},
  partials: {},
  replace: true
};

// devtools global hook
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') {
  if (inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue);
  }
}

module.exports = Vue;
}).call(this,require('_process'))
},{"_process":7}],45:[function(require,module,exports){
var inserted = exports.cache = {}

exports.insert = function (css) {
  if (inserted[css]) return
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return elem
}

},{}],46:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./Scheduler');
	var async = require('./env').asap;

	return makePromise({
		scheduler: new Scheduler(async)
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./Scheduler":47,"./env":59,"./makePromise":61}],47:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	/**
	 * Async task scheduler
	 * @param {function} async function to schedule a single async function
	 * @constructor
	 */
	function Scheduler(async) {
		this._async = async;
		this._running = false;

		this._queue = this;
		this._queueLen = 0;
		this._afterQueue = {};
		this._afterQueueLen = 0;

		var self = this;
		this.drain = function() {
			self._drain();
		};
	}

	/**
	 * Enqueue a task
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		this._queue[this._queueLen++] = task;
		this.run();
	};

	/**
	 * Enqueue a task to run after the main task queue
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.afterQueue = function(task) {
		this._afterQueue[this._afterQueueLen++] = task;
		this.run();
	};

	Scheduler.prototype.run = function() {
		if (!this._running) {
			this._running = true;
			this._async(this.drain);
		}
	};

	/**
	 * Drain the handler queue entirely, and then the after queue
	 */
	Scheduler.prototype._drain = function() {
		var i = 0;
		for (; i < this._queueLen; ++i) {
			this._queue[i].run();
			this._queue[i] = void 0;
		}

		this._queueLen = 0;
		this._running = false;

		for (i = 0; i < this._afterQueueLen; ++i) {
			this._afterQueue[i].run();
			this._afterQueue[i] = void 0;
		}

		this._afterQueueLen = 0;
	};

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],48:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	/**
	 * Custom error type for promises rejected by promise.timeout
	 * @param {string} message
	 * @constructor
	 */
	function TimeoutError (message) {
		Error.call(this);
		this.message = message;
		this.name = TimeoutError.name;
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, TimeoutError);
		}
	}

	TimeoutError.prototype = Object.create(Error.prototype);
	TimeoutError.prototype.constructor = TimeoutError;

	return TimeoutError;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
},{}],49:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	makeApply.tryCatchResolve = tryCatchResolve;

	return makeApply;

	function makeApply(Promise, call) {
		if(arguments.length < 2) {
			call = tryCatchResolve;
		}

		return apply;

		function apply(f, thisArg, args) {
			var p = Promise._defer();
			var l = args.length;
			var params = new Array(l);
			callAndResolve({ f:f, thisArg:thisArg, args:args, params:params, i:l-1, call:call }, p._handler);

			return p;
		}

		function callAndResolve(c, h) {
			if(c.i < 0) {
				return call(c.f, c.thisArg, c.params, h);
			}

			var handler = Promise._handler(c.args[c.i]);
			handler.fold(callAndResolveNext, c, void 0, h);
		}

		function callAndResolveNext(c, x, h) {
			c.params[c.i] = x;
			c.i -= 1;
			callAndResolve(c, h);
		}
	}

	function tryCatchResolve(f, thisArg, args, resolver) {
		try {
			resolver.resolve(f.apply(thisArg, args));
		} catch(e) {
			resolver.reject(e);
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));



},{}],50:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var state = require('../state');
	var applier = require('../apply');

	return function array(Promise) {

		var applyFold = applier(Promise);
		var toPromise = Promise.resolve;
		var all = Promise.all;

		var ar = Array.prototype.reduce;
		var arr = Array.prototype.reduceRight;
		var slice = Array.prototype.slice;

		// Additional array combinators

		Promise.any = any;
		Promise.some = some;
		Promise.settle = settle;

		Promise.map = map;
		Promise.filter = filter;
		Promise.reduce = reduce;
		Promise.reduceRight = reduceRight;

		/**
		 * When this promise fulfills with an array, do
		 * onFulfilled.apply(void 0, array)
		 * @param {function} onFulfilled function to apply
		 * @returns {Promise} promise for the result of applying onFulfilled
		 */
		Promise.prototype.spread = function(onFulfilled) {
			return this.then(all).then(function(array) {
				return onFulfilled.apply(this, array);
			});
		};

		return Promise;

		/**
		 * One-winner competitive race.
		 * Return a promise that will fulfill when one of the promises
		 * in the input array fulfills, or will reject when all promises
		 * have rejected.
		 * @param {array} promises
		 * @returns {Promise} promise for the first fulfilled value
		 */
		function any(promises) {
			var p = Promise._defer();
			var resolver = p._handler;
			var l = promises.length>>>0;

			var pending = l;
			var errors = [];

			for (var h, x, i = 0; i < l; ++i) {
				x = promises[i];
				if(x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				h = Promise._handler(x);
				if(h.state() > 0) {
					resolver.become(h);
					Promise._visitRemaining(promises, i, h);
					break;
				} else {
					h.visit(resolver, handleFulfill, handleReject);
				}
			}

			if(pending === 0) {
				resolver.reject(new RangeError('any(): array must not be empty'));
			}

			return p;

			function handleFulfill(x) {
				/*jshint validthis:true*/
				errors = null;
				this.resolve(x); // this === resolver
			}

			function handleReject(e) {
				/*jshint validthis:true*/
				if(this.resolved) { // this === resolver
					return;
				}

				errors.push(e);
				if(--pending === 0) {
					this.reject(errors);
				}
			}
		}

		/**
		 * N-winner competitive race
		 * Return a promise that will fulfill when n input promises have
		 * fulfilled, or will reject when it becomes impossible for n
		 * input promises to fulfill (ie when promises.length - n + 1
		 * have rejected)
		 * @param {array} promises
		 * @param {number} n
		 * @returns {Promise} promise for the earliest n fulfillment values
		 *
		 * @deprecated
		 */
		function some(promises, n) {
			/*jshint maxcomplexity:7*/
			var p = Promise._defer();
			var resolver = p._handler;

			var results = [];
			var errors = [];

			var l = promises.length>>>0;
			var nFulfill = 0;
			var nReject;
			var x, i; // reused in both for() loops

			// First pass: count actual array items
			for(i=0; i<l; ++i) {
				x = promises[i];
				if(x === void 0 && !(i in promises)) {
					continue;
				}
				++nFulfill;
			}

			// Compute actual goals
			n = Math.max(n, 0);
			nReject = (nFulfill - n + 1);
			nFulfill = Math.min(n, nFulfill);

			if(n > nFulfill) {
				resolver.reject(new RangeError('some(): array must contain at least '
				+ n + ' item(s), but had ' + nFulfill));
			} else if(nFulfill === 0) {
				resolver.resolve(results);
			}

			// Second pass: observe each array item, make progress toward goals
			for(i=0; i<l; ++i) {
				x = promises[i];
				if(x === void 0 && !(i in promises)) {
					continue;
				}

				Promise._handler(x).visit(resolver, fulfill, reject, resolver.notify);
			}

			return p;

			function fulfill(x) {
				/*jshint validthis:true*/
				if(this.resolved) { // this === resolver
					return;
				}

				results.push(x);
				if(--nFulfill === 0) {
					errors = null;
					this.resolve(results);
				}
			}

			function reject(e) {
				/*jshint validthis:true*/
				if(this.resolved) { // this === resolver
					return;
				}

				errors.push(e);
				if(--nReject === 0) {
					results = null;
					this.reject(errors);
				}
			}
		}

		/**
		 * Apply f to the value of each promise in a list of promises
		 * and return a new list containing the results.
		 * @param {array} promises
		 * @param {function(x:*, index:Number):*} f mapping function
		 * @returns {Promise}
		 */
		function map(promises, f) {
			return Promise._traverse(f, promises);
		}

		/**
		 * Filter the provided array of promises using the provided predicate.  Input may
		 * contain promises and values
		 * @param {Array} promises array of promises and values
		 * @param {function(x:*, index:Number):boolean} predicate filtering predicate.
		 *  Must return truthy (or promise for truthy) for items to retain.
		 * @returns {Promise} promise that will fulfill with an array containing all items
		 *  for which predicate returned truthy.
		 */
		function filter(promises, predicate) {
			var a = slice.call(promises);
			return Promise._traverse(predicate, a).then(function(keep) {
				return filterSync(a, keep);
			});
		}

		function filterSync(promises, keep) {
			// Safe because we know all promises have fulfilled if we've made it this far
			var l = keep.length;
			var filtered = new Array(l);
			for(var i=0, j=0; i<l; ++i) {
				if(keep[i]) {
					filtered[j++] = Promise._handler(promises[i]).value;
				}
			}
			filtered.length = j;
			return filtered;

		}

		/**
		 * Return a promise that will always fulfill with an array containing
		 * the outcome states of all input promises.  The returned promise
		 * will never reject.
		 * @param {Array} promises
		 * @returns {Promise} promise for array of settled state descriptors
		 */
		function settle(promises) {
			return all(promises.map(settleOne));
		}

		function settleOne(p) {
			var h = Promise._handler(p);
			if(h.state() === 0) {
				return toPromise(p).then(state.fulfilled, state.rejected);
			}

			h._unreport();
			return state.inspect(h);
		}

		/**
		 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
		 * input may contain promises and/or values, and reduceFunc
		 * may return either a value or a promise, *and* initialValue may
		 * be a promise for the starting value.
		 * @param {Array|Promise} promises array or promise for an array of anything,
		 *      may contain a mix of promises and values.
		 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
		 * @returns {Promise} that will resolve to the final reduced value
		 */
		function reduce(promises, f /*, initialValue */) {
			return arguments.length > 2 ? ar.call(promises, liftCombine(f), arguments[2])
					: ar.call(promises, liftCombine(f));
		}

		/**
		 * Traditional reduce function, similar to `Array.prototype.reduceRight()`, but
		 * input may contain promises and/or values, and reduceFunc
		 * may return either a value or a promise, *and* initialValue may
		 * be a promise for the starting value.
		 * @param {Array|Promise} promises array or promise for an array of anything,
		 *      may contain a mix of promises and values.
		 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
		 * @returns {Promise} that will resolve to the final reduced value
		 */
		function reduceRight(promises, f /*, initialValue */) {
			return arguments.length > 2 ? arr.call(promises, liftCombine(f), arguments[2])
					: arr.call(promises, liftCombine(f));
		}

		function liftCombine(f) {
			return function(z, x, i) {
				return applyFold(f, void 0, [z,x,i]);
			};
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../apply":49,"../state":62}],51:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function flow(Promise) {

		var resolve = Promise.resolve;
		var reject = Promise.reject;
		var origCatch = Promise.prototype['catch'];

		/**
		 * Handle the ultimate fulfillment value or rejection reason, and assume
		 * responsibility for all errors.  If an error propagates out of result
		 * or handleFatalError, it will be rethrown to the host, resulting in a
		 * loud stack track on most platforms and a crash on some.
		 * @param {function?} onResult
		 * @param {function?} onError
		 * @returns {undefined}
		 */
		Promise.prototype.done = function(onResult, onError) {
			this._handler.visit(this._handler.receiver, onResult, onError);
		};

		/**
		 * Add Error-type and predicate matching to catch.  Examples:
		 * promise.catch(TypeError, handleTypeError)
		 *   .catch(predicate, handleMatchedErrors)
		 *   .catch(handleRemainingErrors)
		 * @param onRejected
		 * @returns {*}
		 */
		Promise.prototype['catch'] = Promise.prototype.otherwise = function(onRejected) {
			if (arguments.length < 2) {
				return origCatch.call(this, onRejected);
			}

			if(typeof onRejected !== 'function') {
				return this.ensure(rejectInvalidPredicate);
			}

			return origCatch.call(this, createCatchFilter(arguments[1], onRejected));
		};

		/**
		 * Wraps the provided catch handler, so that it will only be called
		 * if the predicate evaluates truthy
		 * @param {?function} handler
		 * @param {function} predicate
		 * @returns {function} conditional catch handler
		 */
		function createCatchFilter(handler, predicate) {
			return function(e) {
				return evaluatePredicate(e, predicate)
					? handler.call(this, e)
					: reject(e);
			};
		}

		/**
		 * Ensures that onFulfilledOrRejected will be called regardless of whether
		 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
		 * receive the promises' value or reason.  Any returned value will be disregarded.
		 * onFulfilledOrRejected may throw or return a rejected promise to signal
		 * an additional error.
		 * @param {function} handler handler to be called regardless of
		 *  fulfillment or rejection
		 * @returns {Promise}
		 */
		Promise.prototype['finally'] = Promise.prototype.ensure = function(handler) {
			if(typeof handler !== 'function') {
				return this;
			}

			return this.then(function(x) {
				return runSideEffect(handler, this, identity, x);
			}, function(e) {
				return runSideEffect(handler, this, reject, e);
			});
		};

		function runSideEffect (handler, thisArg, propagate, value) {
			var result = handler.call(thisArg);
			return maybeThenable(result)
				? propagateValue(result, propagate, value)
				: propagate(value);
		}

		function propagateValue (result, propagate, x) {
			return resolve(result).then(function () {
				return propagate(x);
			});
		}

		/**
		 * Recover from a failure by returning a defaultValue.  If defaultValue
		 * is a promise, it's fulfillment value will be used.  If defaultValue is
		 * a promise that rejects, the returned promise will reject with the
		 * same reason.
		 * @param {*} defaultValue
		 * @returns {Promise} new promise
		 */
		Promise.prototype['else'] = Promise.prototype.orElse = function(defaultValue) {
			return this.then(void 0, function() {
				return defaultValue;
			});
		};

		/**
		 * Shortcut for .then(function() { return value; })
		 * @param  {*} value
		 * @return {Promise} a promise that:
		 *  - is fulfilled if value is not a promise, or
		 *  - if value is a promise, will fulfill with its value, or reject
		 *    with its reason.
		 */
		Promise.prototype['yield'] = function(value) {
			return this.then(function() {
				return value;
			});
		};

		/**
		 * Runs a side effect when this promise fulfills, without changing the
		 * fulfillment value.
		 * @param {function} onFulfilledSideEffect
		 * @returns {Promise}
		 */
		Promise.prototype.tap = function(onFulfilledSideEffect) {
			return this.then(onFulfilledSideEffect)['yield'](this);
		};

		return Promise;
	};

	function rejectInvalidPredicate() {
		throw new TypeError('catch predicate must be a function');
	}

	function evaluatePredicate(e, predicate) {
		return isError(predicate) ? e instanceof predicate : predicate(e);
	}

	function isError(predicate) {
		return predicate === Error
			|| (predicate != null && predicate.prototype instanceof Error);
	}

	function maybeThenable(x) {
		return (typeof x === 'object' || typeof x === 'function') && x !== null;
	}

	function identity(x) {
		return x;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],52:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @author Jeff Escalante */

(function(define) { 'use strict';
define(function() {

	return function fold(Promise) {

		Promise.prototype.fold = function(f, z) {
			var promise = this._beget();

			this._handler.fold(function(z, x, to) {
				Promise._handler(z).fold(function(x, z, to) {
					to.resolve(f.call(this, z, x));
				}, x, this, to);
			}, z, promise._handler.receiver, promise._handler);

			return promise;
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],53:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var inspect = require('../state').inspect;

	return function inspection(Promise) {

		Promise.prototype.inspect = function() {
			return inspect(Promise._handler(this));
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../state":62}],54:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function generate(Promise) {

		var resolve = Promise.resolve;

		Promise.iterate = iterate;
		Promise.unfold = unfold;

		return Promise;

		/**
		 * @deprecated Use github.com/cujojs/most streams and most.iterate
		 * Generate a (potentially infinite) stream of promised values:
		 * x, f(x), f(f(x)), etc. until condition(x) returns true
		 * @param {function} f function to generate a new x from the previous x
		 * @param {function} condition function that, given the current x, returns
		 *  truthy when the iterate should stop
		 * @param {function} handler function to handle the value produced by f
		 * @param {*|Promise} x starting value, may be a promise
		 * @return {Promise} the result of the last call to f before
		 *  condition returns true
		 */
		function iterate(f, condition, handler, x) {
			return unfold(function(x) {
				return [x, f(x)];
			}, condition, handler, x);
		}

		/**
		 * @deprecated Use github.com/cujojs/most streams and most.unfold
		 * Generate a (potentially infinite) stream of promised values
		 * by applying handler(generator(seed)) iteratively until
		 * condition(seed) returns true.
		 * @param {function} unspool function that generates a [value, newSeed]
		 *  given a seed.
		 * @param {function} condition function that, given the current seed, returns
		 *  truthy when the unfold should stop
		 * @param {function} handler function to handle the value produced by unspool
		 * @param x {*|Promise} starting value, may be a promise
		 * @return {Promise} the result of the last value produced by unspool before
		 *  condition returns true
		 */
		function unfold(unspool, condition, handler, x) {
			return resolve(x).then(function(seed) {
				return resolve(condition(seed)).then(function(done) {
					return done ? seed : resolve(unspool(seed)).spread(next);
				});
			});

			function next(item, newSeed) {
				return resolve(handler(item)).then(function() {
					return unfold(unspool, condition, handler, newSeed);
				});
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],55:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function progress(Promise) {

		/**
		 * @deprecated
		 * Register a progress handler for this promise
		 * @param {function} onProgress
		 * @returns {Promise}
		 */
		Promise.prototype.progress = function(onProgress) {
			return this.then(void 0, void 0, onProgress);
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],56:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var env = require('../env');
	var TimeoutError = require('../TimeoutError');

	function setTimeout(f, ms, x, y) {
		return env.setTimer(function() {
			f(x, y, ms);
		}, ms);
	}

	return function timed(Promise) {
		/**
		 * Return a new promise whose fulfillment value is revealed only
		 * after ms milliseconds
		 * @param {number} ms milliseconds
		 * @returns {Promise}
		 */
		Promise.prototype.delay = function(ms) {
			var p = this._beget();
			this._handler.fold(handleDelay, ms, void 0, p._handler);
			return p;
		};

		function handleDelay(ms, x, h) {
			setTimeout(resolveDelay, ms, x, h);
		}

		function resolveDelay(x, h) {
			h.resolve(x);
		}

		/**
		 * Return a new promise that rejects after ms milliseconds unless
		 * this promise fulfills earlier, in which case the returned promise
		 * fulfills with the same value.
		 * @param {number} ms milliseconds
		 * @param {Error|*=} reason optional rejection reason to use, defaults
		 *   to a TimeoutError if not provided
		 * @returns {Promise}
		 */
		Promise.prototype.timeout = function(ms, reason) {
			var p = this._beget();
			var h = p._handler;

			var t = setTimeout(onTimeout, ms, reason, p._handler);

			this._handler.visit(h,
				function onFulfill(x) {
					env.clearTimer(t);
					this.resolve(x); // this = h
				},
				function onReject(x) {
					env.clearTimer(t);
					this.reject(x); // this = h
				},
				h.notify);

			return p;
		};

		function onTimeout(reason, h, ms) {
			var e = typeof reason === 'undefined'
				? new TimeoutError('timed out after ' + ms + 'ms')
				: reason;
			h.reject(e);
		}

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../TimeoutError":48,"../env":59}],57:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var setTimer = require('../env').setTimer;
	var format = require('../format');

	return function unhandledRejection(Promise) {

		var logError = noop;
		var logInfo = noop;
		var localConsole;

		if(typeof console !== 'undefined') {
			// Alias console to prevent things like uglify's drop_console option from
			// removing console.log/error. Unhandled rejections fall into the same
			// category as uncaught exceptions, and build tools shouldn't silence them.
			localConsole = console;
			logError = typeof localConsole.error !== 'undefined'
				? function (e) { localConsole.error(e); }
				: function (e) { localConsole.log(e); };

			logInfo = typeof localConsole.info !== 'undefined'
				? function (e) { localConsole.info(e); }
				: function (e) { localConsole.log(e); };
		}

		Promise.onPotentiallyUnhandledRejection = function(rejection) {
			enqueue(report, rejection);
		};

		Promise.onPotentiallyUnhandledRejectionHandled = function(rejection) {
			enqueue(unreport, rejection);
		};

		Promise.onFatalRejection = function(rejection) {
			enqueue(throwit, rejection.value);
		};

		var tasks = [];
		var reported = [];
		var running = null;

		function report(r) {
			if(!r.handled) {
				reported.push(r);
				logError('Potentially unhandled rejection [' + r.id + '] ' + format.formatError(r.value));
			}
		}

		function unreport(r) {
			var i = reported.indexOf(r);
			if(i >= 0) {
				reported.splice(i, 1);
				logInfo('Handled previous rejection [' + r.id + '] ' + format.formatObject(r.value));
			}
		}

		function enqueue(f, x) {
			tasks.push(f, x);
			if(running === null) {
				running = setTimer(flush, 0);
			}
		}

		function flush() {
			running = null;
			while(tasks.length > 0) {
				tasks.shift()(tasks.shift());
			}
		}

		return Promise;
	};

	function throwit(e) {
		throw e;
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../env":59,"../format":60}],58:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function addWith(Promise) {
		/**
		 * Returns a promise whose handlers will be called with `this` set to
		 * the supplied receiver.  Subsequent promises derived from the
		 * returned promise will also have their handlers called with receiver
		 * as `this`. Calling `with` with undefined or no arguments will return
		 * a promise whose handlers will again be called in the usual Promises/A+
		 * way (no `this`) thus safely undoing any previous `with` in the
		 * promise chain.
		 *
		 * WARNING: Promises returned from `with`/`withThis` are NOT Promises/A+
		 * compliant, specifically violating 2.2.5 (http://promisesaplus.com/#point-41)
		 *
		 * @param {object} receiver `this` value for all handlers attached to
		 *  the returned promise.
		 * @returns {Promise}
		 */
		Promise.prototype['with'] = Promise.prototype.withThis = function(receiver) {
			var p = this._beget();
			var child = p._handler;
			child.receiver = receiver;
			this._handler.chain(child, receiver);
			return p;
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));


},{}],59:[function(require,module,exports){
(function (process){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global process,document,setTimeout,clearTimeout,MutationObserver,WebKitMutationObserver*/
(function(define) { 'use strict';
define(function(require) {
	/*jshint maxcomplexity:6*/

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// setTimeout, and finally vertx, since its the only env that doesn't
	// have setTimeout

	var MutationObs;
	var capturedSetTimeout = typeof setTimeout !== 'undefined' && setTimeout;

	// Default env
	var setTimer = function(f, ms) { return setTimeout(f, ms); };
	var clearTimer = function(t) { return clearTimeout(t); };
	var asap = function (f) { return capturedSetTimeout(f, 0); };

	// Detect specific env
	if (isNode()) { // Node
		asap = function (f) { return process.nextTick(f); };

	} else if (MutationObs = hasMutationObserver()) { // Modern browser
		asap = initMutationObserver(MutationObs);

	} else if (!capturedSetTimeout) { // vert.x
		var vertxRequire = require;
		var vertx = vertxRequire('vertx');
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		clearTimer = vertx.cancelTimer;
		asap = vertx.runOnLoop || vertx.runOnContext;
	}

	return {
		setTimer: setTimer,
		clearTimer: clearTimer,
		asap: asap
	};

	function isNode () {
		return typeof process !== 'undefined' &&
			Object.prototype.toString.call(process) === '[object process]';
	}

	function hasMutationObserver () {
		return (typeof MutationObserver === 'function' && MutationObserver) ||
			(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver);
	}

	function initMutationObserver(MutationObserver) {
		var scheduled;
		var node = document.createTextNode('');
		var o = new MutationObserver(run);
		o.observe(node, { characterData: true });

		function run() {
			var f = scheduled;
			scheduled = void 0;
			f();
		}

		var i = 0;
		return function (f) {
			scheduled = f;
			node.data = (i ^= 1);
		};
	}
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

}).call(this,require('_process'))
},{"_process":7}],60:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return {
		formatError: formatError,
		formatObject: formatObject,
		tryStringify: tryStringify
	};

	/**
	 * Format an error into a string.  If e is an Error and has a stack property,
	 * it's returned.  Otherwise, e is formatted using formatObject, with a
	 * warning added about e not being a proper Error.
	 * @param {*} e
	 * @returns {String} formatted string, suitable for output to developers
	 */
	function formatError(e) {
		var s = typeof e === 'object' && e !== null && (e.stack || e.message) ? e.stack || e.message : formatObject(e);
		return e instanceof Error ? s : s + ' (WARNING: non-Error used)';
	}

	/**
	 * Format an object, detecting "plain" objects and running them through
	 * JSON.stringify if possible.
	 * @param {Object} o
	 * @returns {string}
	 */
	function formatObject(o) {
		var s = String(o);
		if(s === '[object Object]' && typeof JSON !== 'undefined') {
			s = tryStringify(o, s);
		}
		return s;
	}

	/**
	 * Try to return the result of JSON.stringify(x).  If that fails, return
	 * defaultValue
	 * @param {*} x
	 * @param {*} defaultValue
	 * @returns {String|*} JSON.stringify(x) or defaultValue
	 */
	function tryStringify(x, defaultValue) {
		try {
			return JSON.stringify(x);
		} catch(e) {
			return defaultValue;
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],61:[function(require,module,exports){
(function (process){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;
		var emitRejection = initEmitRejection();

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver, handler) {
			this._handler = resolver === Handler ? handler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {Pending}
		 */
		function init(resolver) {
			var handler = new Pending();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * @deprecated
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;
		Promise._handler = getHandler;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return isPromise(x) ? x
				: new Promise(Handler, new Async(getHandler(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return new Promise(Handler, new Async(new Rejected(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {Promise}
		 */
		function defer() {
			return new Promise(Handler, new Pending());
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param {function=} onFulfilled fulfillment handler
		 * @param {function=} onRejected rejection handler
		 * @param {function=} onProgress @deprecated progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected, onProgress) {
			var parent = this._handler;
			var state = parent.join().state();

			if ((typeof onFulfilled !== 'function' && state > 0) ||
				(typeof onRejected !== 'function' && state < 0)) {
				// Short circuit: value will not change, simply share handler
				return new this.constructor(Handler, parent);
			}

			var p = this._beget();
			var child = p._handler;

			parent.chain(child, parent.receiver, onFulfilled, onRejected, onProgress);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			return begetFrom(this._handler, this.constructor);
		};

		function begetFrom(parent, Promise) {
			var child = new Pending(parent.receiver, parent.join().context);
			return new Promise(Handler, child);
		}

		// Array combinators

		Promise.all = all;
		Promise.race = race;
		Promise._traverse = traverse;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			return traverseWith(snd, null, promises);
		}

		/**
		 * Array<Promise<X>> -> Promise<Array<f(X)>>
		 * @private
		 * @param {function} f function to apply to each promise's value
		 * @param {Array} promises array of promises
		 * @returns {Promise} promise for transformed values
		 */
		function traverse(f, promises) {
			return traverseWith(tryCatch2, f, promises);
		}

		function traverseWith(tryMap, f, promises) {
			var handler = typeof f === 'function' ? mapAt : settleAt;

			var resolver = new Pending();
			var pending = promises.length >>> 0;
			var results = new Array(pending);

			for (var i = 0, x; i < promises.length && !resolver.resolved; ++i) {
				x = promises[i];

				if (x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				traverseAt(promises, handler, i, x, resolver);
			}

			if(pending === 0) {
				resolver.become(new Fulfilled(results));
			}

			return new Promise(Handler, resolver);

			function mapAt(i, x, resolver) {
				if(!resolver.resolved) {
					traverseAt(promises, settleAt, i, tryMap(f, x, i), resolver);
				}
			}

			function settleAt(i, x, resolver) {
				results[i] = x;
				if(--pending === 0) {
					resolver.become(new Fulfilled(results));
				}
			}
		}

		function traverseAt(promises, handler, i, x, resolver) {
			if (maybeThenable(x)) {
				var h = getHandlerMaybeThenable(x);
				var s = h.state();

				if (s === 0) {
					h.fold(handler, i, void 0, resolver);
				} else if (s > 0) {
					handler(i, h.value, resolver);
				} else {
					resolver.become(h);
					visitRemaining(promises, i+1, h);
				}
			} else {
				handler(i, x, resolver);
			}
		}

		Promise._visitRemaining = visitRemaining;
		function visitRemaining(promises, start, handler) {
			for(var i=start; i<promises.length; ++i) {
				markAsHandled(getHandler(promises[i]), handler);
			}
		}

		function markAsHandled(h, handler) {
			if(h === handler) {
				return;
			}

			var s = h.state();
			if(s === 0) {
				h.visit(h, void 0, h._unreport);
			} else if(s < 0) {
				h._unreport();
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			if(typeof promises !== 'object' || promises === null) {
				return reject(new TypeError('non-iterable passed to race()'));
			}

			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			return promises.length === 0 ? never()
				 : promises.length === 1 ? resolve(promises[0])
				 : runRace(promises);
		}

		function runRace(promises) {
			var resolver = new Pending();
			var i, x, h;
			for(i=0; i<promises.length; ++i) {
				x = promises[i];
				if (x === void 0 && !(i in promises)) {
					continue;
				}

				h = getHandler(x);
				if(h.state() !== 0) {
					resolver.become(h);
					visitRemaining(promises, i+1, h);
					break;
				} else {
					h.visit(resolver, resolver.resolve, resolver.reject);
				}
			}
			return new Promise(Handler, resolver);
		}

		// Promise internals
		// Below this, everything is @private

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandler(x) {
			if(isPromise(x)) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
		}

		/**
		 * Get a handler for thenable x.
		 * NOTE: You must only call this if maybeThenable(x) == true
		 * @param {object|function|Promise} x
		 * @returns {object} handler
		 */
		function getHandlerMaybeThenable(x) {
			return isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new Thenable(untrustedThen, x)
					: new Fulfilled(x);
			} catch(e) {
				return new Rejected(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @constructor
		 */
		function Handler() {}

		Handler.prototype.when
			= Handler.prototype.become
			= Handler.prototype.notify // deprecated
			= Handler.prototype.fail
			= Handler.prototype._unreport
			= Handler.prototype._report
			= noop;

		Handler.prototype._state = 0;

		Handler.prototype.state = function() {
			return this._state;
		};

		/**
		 * Recursively collapse handler chain to find the handler
		 * nearest to the fully resolved value.
		 * @returns {object} handler nearest the fully resolved value
		 */
		Handler.prototype.join = function() {
			var h = this;
			while(h.handler !== void 0) {
				h = h.handler;
			}
			return h;
		};

		Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
			this.when({
				resolver: to,
				receiver: receiver,
				fulfilled: fulfilled,
				rejected: rejected,
				progress: progress
			});
		};

		Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
			this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
		};

		Handler.prototype.fold = function(f, z, c, to) {
			this.when(new Fold(f, z, c, to));
		};

		/**
		 * Handler that invokes fail() on any handler it becomes
		 * @constructor
		 */
		function FailIfRejected() {}

		inherit(Handler, FailIfRejected);

		FailIfRejected.prototype.become = function(h) {
			h.fail();
		};

		var failIfRejected = new FailIfRejected();

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @constructor
		 */
		function Pending(receiver, inheritedContext) {
			Promise.createContext(this, inheritedContext);

			this.consumers = void 0;
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
		}

		inherit(Handler, Pending);

		Pending.prototype._state = 0;

		Pending.prototype.resolve = function(x) {
			this.become(getHandler(x));
		};

		Pending.prototype.reject = function(x) {
			if(this.resolved) {
				return;
			}

			this.become(new Rejected(x));
		};

		Pending.prototype.join = function() {
			if (!this.resolved) {
				return this;
			}

			var h = this;

			while (h.handler !== void 0) {
				h = h.handler;
				if (h === this) {
					return this.handler = cycle();
				}
			}

			return h;
		};

		Pending.prototype.run = function() {
			var q = this.consumers;
			var handler = this.handler;
			this.handler = this.handler.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; ++i) {
				handler.when(q[i]);
			}
		};

		Pending.prototype.become = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			if(this.consumers !== void 0) {
				tasks.enqueue(this);
			}

			if(this.context !== void 0) {
				handler._report(this.context);
			}
		};

		Pending.prototype.when = function(continuation) {
			if(this.resolved) {
				tasks.enqueue(new ContinuationTask(continuation, this.handler));
			} else {
				if(this.consumers === void 0) {
					this.consumers = [continuation];
				} else {
					this.consumers.push(continuation);
				}
			}
		};

		/**
		 * @deprecated
		 */
		Pending.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(x, this));
			}
		};

		Pending.prototype.fail = function(context) {
			var c = typeof context === 'undefined' ? this.context : context;
			this.resolved && this.handler.join().fail(c);
		};

		Pending.prototype._report = function(context) {
			this.resolved && this.handler.join()._report(context);
		};

		Pending.prototype._unreport = function() {
			this.resolved && this.handler.join()._unreport();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @param {object} handler
		 * @constructor
		 */
		function Async(handler) {
			this.handler = handler;
		}

		inherit(Handler, Async);

		Async.prototype.when = function(continuation) {
			tasks.enqueue(new ContinuationTask(continuation, this));
		};

		Async.prototype._report = function(context) {
			this.join()._report(context);
		};

		Async.prototype._unreport = function() {
			this.join()._unreport();
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function Thenable(then, thenable) {
			Pending.call(this);
			tasks.enqueue(new AssimilateTask(then, thenable, this));
		}

		inherit(Pending, Thenable);

		/**
		 * Handler for a fulfilled promise
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function Fulfilled(x) {
			Promise.createContext(this);
			this.value = x;
		}

		inherit(Handler, Fulfilled);

		Fulfilled.prototype._state = 1;

		Fulfilled.prototype.fold = function(f, z, c, to) {
			runContinuation3(f, z, this, c, to);
		};

		Fulfilled.prototype.when = function(cont) {
			runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
		};

		var errorId = 0;

		/**
		 * Handler for a rejected promise
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function Rejected(x) {
			Promise.createContext(this);

			this.id = ++errorId;
			this.value = x;
			this.handled = false;
			this.reported = false;

			this._report();
		}

		inherit(Handler, Rejected);

		Rejected.prototype._state = -1;

		Rejected.prototype.fold = function(f, z, c, to) {
			to.become(this);
		};

		Rejected.prototype.when = function(cont) {
			if(typeof cont.rejected === 'function') {
				this._unreport();
			}
			runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
		};

		Rejected.prototype._report = function(context) {
			tasks.afterQueue(new ReportTask(this, context));
		};

		Rejected.prototype._unreport = function() {
			if(this.handled) {
				return;
			}
			this.handled = true;
			tasks.afterQueue(new UnreportTask(this));
		};

		Rejected.prototype.fail = function(context) {
			this.reported = true;
			emitRejection('unhandledRejection', this);
			Promise.onFatalRejection(this, context === void 0 ? this.context : context);
		};

		function ReportTask(rejection, context) {
			this.rejection = rejection;
			this.context = context;
		}

		ReportTask.prototype.run = function() {
			if(!this.rejection.handled && !this.rejection.reported) {
				this.rejection.reported = true;
				emitRejection('unhandledRejection', this.rejection) ||
					Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
			}
		};

		function UnreportTask(rejection) {
			this.rejection = rejection;
		}

		UnreportTask.prototype.run = function() {
			if(this.rejection.reported) {
				emitRejection('rejectionHandled', this.rejection) ||
					Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
			}
		};

		// Unhandled rejection hooks
		// By default, everything is a noop

		Promise.createContext
			= Promise.enterContext
			= Promise.exitContext
			= Promise.onPotentiallyUnhandledRejection
			= Promise.onPotentiallyUnhandledRejectionHandled
			= Promise.onFatalRejection
			= noop;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

		function cycle() {
			return new Rejected(new TypeError('Promise cycle'));
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @constructor
		 */
		function ContinuationTask(continuation, handler) {
			this.continuation = continuation;
			this.handler = handler;
		}

		ContinuationTask.prototype.run = function() {
			this.handler.join().when(this.continuation);
		};

		/**
		 * Run a queue of progress handlers
		 * @constructor
		 */
		function ProgressTask(value, handler) {
			this.handler = handler;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.handler.consumers;
			if(q === void 0) {
				return;
			}

			for (var c, i = 0; i < q.length; ++i) {
				c = q[i];
				runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
			}
		};

		/**
		 * Assimilate a thenable, sending it's value to resolver
		 * @param {function} then
		 * @param {object|function} thenable
		 * @param {object} resolver
		 * @constructor
		 */
		function AssimilateTask(then, thenable, resolver) {
			this._then = then;
			this.thenable = thenable;
			this.resolver = resolver;
		}

		AssimilateTask.prototype.run = function() {
			var h = this.resolver;
			tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		function tryAssimilate(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		}

		/**
		 * Fold a handler value with z
		 * @constructor
		 */
		function Fold(f, z, c, to) {
			this.f = f; this.z = z; this.c = c; this.to = to;
			this.resolver = failIfRejected;
			this.receiver = this;
		}

		Fold.prototype.fulfilled = function(x) {
			this.f.call(this.c, this.z, x, this.to);
		};

		Fold.prototype.rejected = function(x) {
			this.to.reject(x);
		};

		Fold.prototype.progress = function(x) {
			this.to.notify(x);
		};

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} true iff x is a trusted Promise
		 */
		function isPromise(x) {
			return x instanceof Promise;
		}

		/**
		 * Test just enough to rule out primitives, in order to take faster
		 * paths in some code
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function runContinuation1(f, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject(f, h.value, receiver, next);
			Promise.exitContext();
		}

		function runContinuation3(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject3(f, x, h.value, receiver, next);
			Promise.exitContext();
		}

		/**
		 * @deprecated
		 */
		function runNotify(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.notify(x);
			}

			Promise.enterContext(h);
			tryCatchReturn(f, x, receiver, next);
			Promise.exitContext();
		}

		function tryCatch2(f, a, b) {
			try {
				return f(a, b);
			} catch(e) {
				return reject(e);
			}
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 */
		function tryCatchReject(f, x, thisArg, next) {
			try {
				next.become(getHandler(f.call(thisArg, x)));
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Same as above, but includes the extra argument parameter.
		 */
		function tryCatchReject3(f, x, y, thisArg, next) {
			try {
				f.call(thisArg, x, y, next);
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * @deprecated
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 */
		function tryCatchReturn(f, x, thisArg, next) {
			try {
				next.notify(f.call(thisArg, x));
			} catch(e) {
				next.notify(e);
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function snd(x, y) {
			return y;
		}

		function noop() {}

		function initEmitRejection() {
			/*global process, self, CustomEvent*/
			if(typeof process !== 'undefined' && process !== null
				&& typeof process.emit === 'function') {
				// Returning falsy here means to call the default
				// onPotentiallyUnhandledRejection API.  This is safe even in
				// browserify since process.emit always returns falsy in browserify:
				// https://github.com/defunctzombie/node-process/blob/master/browser.js#L40-L46
				return function(type, rejection) {
					return type === 'unhandledRejection'
						? process.emit(type, rejection.value, rejection)
						: process.emit(type, rejection);
				};
			} else if(typeof self !== 'undefined' && typeof CustomEvent === 'function') {
				return (function(noop, self, CustomEvent) {
					var hasCustomEvent = false;
					try {
						var ev = new CustomEvent('unhandledRejection');
						hasCustomEvent = ev instanceof CustomEvent;
					} catch (e) {}

					return !hasCustomEvent ? noop : function(type, rejection) {
						var ev = new CustomEvent(type, {
							detail: {
								reason: rejection.value,
								key: rejection
							},
							bubbles: false,
							cancelable: true
						});

						return !self.dispatchEvent(ev);
					};
				}(noop, self, CustomEvent));
			}

			return noop;
		}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

}).call(this,require('_process'))
},{"_process":7}],62:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return {
		pending: toPendingState,
		fulfilled: toFulfilledState,
		rejected: toRejectedState,
		inspect: inspect
	};

	function toPendingState() {
		return { state: 'pending' };
	}

	function toRejectedState(e) {
		return { state: 'rejected', reason: e };
	}

	function toFulfilledState(x) {
		return { state: 'fulfilled', value: x };
	}

	function inspect(handler) {
		var state = handler.state();
		return state === 0 ? toPendingState()
			 : state > 0   ? toFulfilledState(handler.value)
			               : toRejectedState(handler.value);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],63:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */

/**
 * Promises/A+ and when() implementation
 * when is part of the cujoJS family of libraries (http://cujojs.com/)
 * @author Brian Cavalier
 * @author John Hann
 */
(function(define) { 'use strict';
define(function (require) {

	var timed = require('./lib/decorators/timed');
	var array = require('./lib/decorators/array');
	var flow = require('./lib/decorators/flow');
	var fold = require('./lib/decorators/fold');
	var inspect = require('./lib/decorators/inspect');
	var generate = require('./lib/decorators/iterate');
	var progress = require('./lib/decorators/progress');
	var withThis = require('./lib/decorators/with');
	var unhandledRejection = require('./lib/decorators/unhandledRejection');
	var TimeoutError = require('./lib/TimeoutError');

	var Promise = [array, flow, fold, generate, progress,
		inspect, withThis, timed, unhandledRejection]
		.reduce(function(Promise, feature) {
			return feature(Promise);
		}, require('./lib/Promise'));

	var apply = require('./lib/apply')(Promise);

	// Public API

	when.promise     = promise;              // Create a pending promise
	when.resolve     = Promise.resolve;      // Create a resolved promise
	when.reject      = Promise.reject;       // Create a rejected promise

	when.lift        = lift;                 // lift a function to return promises
	when['try']      = attempt;              // call a function and return a promise
	when.attempt     = attempt;              // alias for when.try

	when.iterate     = Promise.iterate;      // DEPRECATED (use cujojs/most streams) Generate a stream of promises
	when.unfold      = Promise.unfold;       // DEPRECATED (use cujojs/most streams) Generate a stream of promises

	when.join        = join;                 // Join 2 or more promises

	when.all         = all;                  // Resolve a list of promises
	when.settle      = settle;               // Settle a list of promises

	when.any         = lift(Promise.any);    // One-winner race
	when.some        = lift(Promise.some);   // Multi-winner race
	when.race        = lift(Promise.race);   // First-to-settle race

	when.map         = map;                  // Array.map() for promises
	when.filter      = filter;               // Array.filter() for promises
	when.reduce      = lift(Promise.reduce);       // Array.reduce() for promises
	when.reduceRight = lift(Promise.reduceRight);  // Array.reduceRight() for promises

	when.isPromiseLike = isPromiseLike;      // Is something promise-like, aka thenable

	when.Promise     = Promise;              // Promise constructor
	when.defer       = defer;                // Create a {promise, resolve, reject} tuple

	// Error types

	when.TimeoutError = TimeoutError;

	/**
	 * Get a trusted promise for x, or by transforming x with onFulfilled
	 *
	 * @param {*} x
	 * @param {function?} onFulfilled callback to be called when x is
	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {function?} onRejected callback to be called when x is
	 *   rejected.
	 * @param {function?} onProgress callback to be called when progress updates
	 *   are issued for x. @deprecated
	 * @returns {Promise} a new promise that will fulfill with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(x, onFulfilled, onRejected, onProgress) {
		var p = Promise.resolve(x);
		if (arguments.length < 2) {
			return p;
		}

		return p.then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Creates a new promise whose fate is determined by resolver.
	 * @param {function} resolver function(resolve, reject, notify)
	 * @returns {Promise} promise whose fate is determine by resolver
	 */
	function promise(resolver) {
		return new Promise(resolver);
	}

	/**
	 * Lift the supplied function, creating a version of f that returns
	 * promises, and accepts promises as arguments.
	 * @param {function} f
	 * @returns {Function} version of f that returns promises
	 */
	function lift(f) {
		return function() {
			for(var i=0, l=arguments.length, a=new Array(l); i<l; ++i) {
				a[i] = arguments[i];
			}
			return apply(f, this, a);
		};
	}

	/**
	 * Call f in a future turn, with the supplied args, and return a promise
	 * for the result.
	 * @param {function} f
	 * @returns {Promise}
	 */
	function attempt(f /*, args... */) {
		/*jshint validthis:true */
		for(var i=0, l=arguments.length-1, a=new Array(l); i<l; ++i) {
			a[i] = arguments[i+1];
		}
		return apply(f, this, a);
	}

	/**
	 * Creates a {promise, resolver} pair, either or both of which
	 * may be given out safely to consumers.
	 * @return {{promise: Promise, resolve: function, reject: function, notify: function}}
	 */
	function defer() {
		return new Deferred();
	}

	function Deferred() {
		var p = Promise._defer();

		function resolve(x) { p._handler.resolve(x); }
		function reject(x) { p._handler.reject(x); }
		function notify(x) { p._handler.notify(x); }

		this.promise = p;
		this.resolve = resolve;
		this.reject = reject;
		this.notify = notify;
		this.resolver = { resolve: resolve, reject: reject, notify: notify };
	}

	/**
	 * Determines if x is promise-like, i.e. a thenable object
	 * NOTE: Will return true for *any thenable object*, and isn't truly
	 * safe, since it may attempt to access the `then` property of x (i.e.
	 *  clever/malicious getters may do weird things)
	 * @param {*} x anything
	 * @returns {boolean} true if x is promise-like
	 */
	function isPromiseLike(x) {
		return x && typeof x.then === 'function';
	}

	/**
	 * Return a promise that will resolve only once all the supplied arguments
	 * have resolved. The resolution value of the returned promise will be an array
	 * containing the resolution values of each of the arguments.
	 * @param {...*} arguments may be a mix of promises and values
	 * @returns {Promise}
	 */
	function join(/* ...promises */) {
		return Promise.all(arguments);
	}

	/**
	 * Return a promise that will fulfill once all input promises have
	 * fulfilled, or reject when any one input promise rejects.
	 * @param {array|Promise} promises array (or promise for an array) of promises
	 * @returns {Promise}
	 */
	function all(promises) {
		return when(promises, Promise.all);
	}

	/**
	 * Return a promise that will always fulfill with an array containing
	 * the outcome states of all input promises.  The returned promise
	 * will only reject if `promises` itself is a rejected promise.
	 * @param {array|Promise} promises array (or promise for an array) of promises
	 * @returns {Promise} promise for array of settled state descriptors
	 */
	function settle(promises) {
		return when(promises, Promise.settle);
	}

	/**
	 * Promise-aware array map function, similar to `Array.prototype.map()`,
	 * but input array may contain promises or values.
	 * @param {Array|Promise} promises array of anything, may contain promises and values
	 * @param {function(x:*, index:Number):*} mapFunc map function which may
	 *  return a promise or value
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function map(promises, mapFunc) {
		return when(promises, function(promises) {
			return Promise.map(promises, mapFunc);
		});
	}

	/**
	 * Filter the provided array of promises using the provided predicate.  Input may
	 * contain promises and values
	 * @param {Array|Promise} promises array of promises and values
	 * @param {function(x:*, index:Number):boolean} predicate filtering predicate.
	 *  Must return truthy (or promise for truthy) for items to retain.
	 * @returns {Promise} promise that will fulfill with an array containing all items
	 *  for which predicate returned truthy.
	 */
	function filter(promises, predicate) {
		return when(promises, function(promises) {
			return Promise.filter(promises, predicate);
		});
	}

	return when;
});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./lib/Promise":46,"./lib/TimeoutError":48,"./lib/apply":49,"./lib/decorators/array":50,"./lib/decorators/flow":51,"./lib/decorators/fold":52,"./lib/decorators/inspect":53,"./lib/decorators/iterate":54,"./lib/decorators/progress":55,"./lib/decorators/timed":56,"./lib/decorators/unhandledRejection":57,"./lib/decorators/with":58}],64:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

exports['default'] = {

    data: function data() {
        return {
            user: null,
            token: null,
            authenticated: false
        };
    },

    ready: function ready() {
        this.getInitialToken();
        this.registerEventListeners();
        this.setLoginStatus();
    },

    methods: {

        registerEventListeners: function registerEventListeners() {
            this.$on('userHasLoggedOut', function () {
                this.destroyLogin();
            });
            this.$on('userHasLoggedIn', function (user) {
                this.setLogin(user);
            });
        },

        setLoginStatus: function setLoginStatus() {
            var token = _jsCookie2['default'].get('jwt-token');
            if (token !== null && token !== 'undefined') {
                var self = this;
                client({
                    path: '/auth/user/me'
                }).then(function (response) {
                    self.setLogin(response.entity.user);
                    self.$broadcast('data-loaded');
                }, function (response) {
                    self.destroyLogin();
                });
            }
        },

        setLogin: function setLogin(user) {
            this.user = user;
            this.authenticated = true;
            this.token = _jsCookie2['default'].get('jwt-token');
        },

        destroyLogin: function destroyLogin() {
            this.user = null;
            this.token = null;
            this.authenticated = false;
            _jsCookie2['default'].remove('jwt-token');
        },

        getInitialToken: function getInitialToken() {
            if (!_jsCookie2['default'].get('jwt-token')) {
                this.token = document.getElementById('jwt').getAttribute('content');
                _jsCookie2['default'].set('jwt-token', 'Bearer ' + this.token, { expires: 7, path: '' });
            }
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <section class=\"Main\">\n        <top-nav :current-user=\"user\"></top-nav>\n        <div class=\"Main__menu\">\n            <side-nav></side-nav>\n        </div>\n        <div class=\"Main__container\">\n            <div class=\"Main__content\">\n                <router-view :current-user=\"user\"></router-view>\n            </div>\n        </div>\n    </section>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/App.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"js-cookie":5,"vue":44,"vue-hot-reload-api":42}],65:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = require('vue-router');

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _AppVue = require('./App.vue');

var _AppVue2 = _interopRequireDefault(_AppVue);

_vue2['default'].use(_vueRouter2['default']);

// Develop
_vue2['default'].config.debug = true;

// Rest client
window.client = require('./http/client');

// Router
var router = require('./http/router');

// Components
_vue2['default'].component('top-nav', require('./components/partials/top-nav.vue'));
_vue2['default'].component('side-nav', require('./components/partials/side-nav.vue'));
_vue2['default'].component('paginator', require('./components/partials/paginator.vue'));

// Directives
_vue2['default'].directive('select', require('./directives/select'));
_vue2['default'].directive('rich-editor', require('./directives/rich-editor'));

// Start
router.start(_AppVue2['default'], '#Admin');

},{"./App.vue":64,"./components/partials/paginator.vue":76,"./components/partials/side-nav.vue":77,"./components/partials/top-nav.vue":78,"./directives/rich-editor":95,"./directives/select":96,"./http/client":97,"./http/router":99,"vue":44,"vue-router":43}],66:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            author: {
                name: '',
                bio: ''
            }
        };
    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            client({
                method: 'POST',
                path: '/authors',
                entity: this.author
            }).then(function (response) {
                self.$route.router.go('/authors');
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/authors'\">Authors</a></li>\n        <li class=\"active\">Create</li>\n    </ol>\n\n    <form class=\"Author\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-success\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button v-link=\"'/authors'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Cancel</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">Author</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"author.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"bio\">Bio</label>\n                    <textarea name=\"bio\" id=\"bio\" class=\"form-control rich-editor\" v-rich-editor=\"author.bio\"></textarea>\n                </div>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/authors/create.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],67:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            author: {
                id: '',
                name: '',
                bio: ''
            }
        };
    },

    methods: {

        fetch: function fetch(successHandler) {
            var self = this;
            client({
                path: '/authors/' + this.$route.params.author_id
            }).then(function (response) {
                self.author = response.entity.data;
                successHandler(self.author);
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            console.log(this.author);
            client({
                method: 'PUT',
                path: '/authors/' + this.author.id,
                entity: this.author
            }).then(function (response) {
                self.notify('success', 'Saved successfully.');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        'delete': function _delete() {
            var self = this;
            _sweetalert2['default']({
                title: 'Are you sure?',
                text: 'You will not be able to recover this author!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, say good-bye!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                client({
                    method: 'DELETE',
                    path: '/authors/' + self.author.id
                }).then(function () {
                    _sweetalert2['default']({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.author.name + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.deleted = true;
                        self.$route.router.go('/authors');
                    });
                }, function () {
                    _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        }

    },

    route: {
        data: function data(transition) {
            this.fetch((function (author) {
                transition.next({ author: author });
            }).bind(this));
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/authors'\">Authors</a></li>\n        <li class=\"active\">{{ author.name }}</li>\n    </ol>\n\n    <form class=\"Author EditForm\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button @click.prevent=\"delete\" class=\"btn btn-danger\"><i class=\"fa fa-trash\"></i> Delete</button>\n                    <button v-link=\"'/authors'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Close</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">Author</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"author.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"bio\">Bio</label>\n                    <textarea name=\"bio\" id=\"bio\" class=\"form-control rich-editor\" v-if=\"author.bio\" v-rich-editor=\"author.bio\"></textarea>\n                </div>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/authors/edit.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],68:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            authors: [],
            pagination: { links: {} },
            nameFilter: null,
            sortKey: null,
            sortDir: -1
        };
    },

    methods: {

        fetch: function fetch(successHandler) {
            var self = this;
            client({
                path: '/authors'
            }).then(function (response) {
                self.authors = response.entity.data;
                self.pagination = response.entity.meta.pagination;
                successHandler(response.entity.data);
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        sortBy: function sortBy(key) {
            if (this.sortKey == key) {
                this.sortDir = this.sortDir * -1;
            } else {
                this.sortKey = key;
                this.sortDir = 1;
            }
        },

        orderIcon: function orderIcon(key) {
            if (key == this.sortKey) {
                return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
            }

            return 'fa fa-unsorted';
        }

    },

    route: {
        data: function data(transition) {
            this.fetch(function (data) {
                transition.next({ authors: data });
            });
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li class=\"active\">Authors</li>\n    </ol>\n\n    <div class=\"filters\">\n        <div class=\"row\">\n            <div class=\"col-md-6\">\n                <input type=\"text\" v-model=\"nameFilter\" placeholder=\"Filter by name...\" class=\"form-control\">\n            </div>\n            <div class=\"create-button col-md-6\">\n                <button v-link=\"'/authors/create'\" class=\"btn btn-success\"><i class=\"fa fa-plus\"></i> Add new</button>\n            </div>\n        </div>\n    </div>\n\n    <table class=\"Authors table table-striped table-hover\">\n        <thead>\n            <tr>\n                <th><a href=\"#\" @click.prevent=\"sortBy('name')\">Name <i :class=\"orderIcon('name')\"></i></a></th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr v-for=\"author in authors | filterBy nameFilter | orderBy sortKey sortDir\" class=\"Author\">\n                <td><a v-link=\"'/authors/'+author.id\">{{ author.name }}</a></td>\n            </tr>\n        </tbody>\n    </table>\n\n    <paginator :pagination=\"pagination\"></paginator>\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/authors/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],69:[function(require,module,exports){
var __vueify_style__ = require("vueify-insert-css").insert("\n    .order {\n        width: 40px;\n    }\n")
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user', 'category-id', 'posts'],

    methods: {

        /**
         * Reorder the posts' list_positions
         * @param post
         * @param e
         */
        reorder: function reorder(post, e) {
            var self = this;

            var new_position = parseInt(e.target.value);
            // If the position is not a number, we are done here.
            if (isNaN(new_position)) {
                e.target.value = post.order;
                return;
            }

            var max = self.posts.reduce(function (max, post) {
                return post.order > max ? post.order : max;
            }, 0);

            new_position = new_position > 0 ? new_position : 1;
            new_position = new_position > max ? max : new_position;

            // If the position is not different, we are done here.
            if (new_position === post.order) {
                e.target.value = post.order;
                return;
            }

            // Shift all the posts' between the new list position and old list position up or down by one.
            // If we are moving the list position to a lower number, the other numbers should shift up by one,
            // but if we are moving the list position to a higher number the others should shift down by one.
            var increment = new_position < post.order ? +1 : -1;
            var between = new_position < post.order ? [new_position, post.order] : [post.order, new_position];

            this.posts = this.posts.map(function (post) {
                var p = post.order;
                if (p >= between[0] && p <= between[1]) {
                    post.order += increment;
                }
                return post;
            });

            // Save the new position on the current post.
            post.order = new_position;

            // Persist the new order
            this.save(post);

            setTimeout((function () {
                this.scrollTo($(e.target).closest('tr'));
            }).bind(this), 0);
        },

        /**
         * Save the post's position to the database.
         * @param post
         */
        save: function save(post) {
            var self = this;
            client({
                method: "PATCH",
                path: '/posts/' + post.id + '/reorder',
                entity: { order: post.order }
            }).then(function () {
                setTimeout(function () {
                    self.notify('success', 'Saved post order.');
                }, 1800);
            }, function () {
                // fail
            });
        },

        scrollTo: function scrollTo(target) {
            $('html,body').animate({
                scrollTop: target.offset().top - 280
            }, 700);

            target.addClass("pulse").delay(4000).queue(function () {
                $(this).removeClass("pulse").dequeue();
            });

            return false;
        },

        blur: function blur(e) {
            e.target.blur();
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">Re-order posts</div>\n        <table class=\"CategoryPosts table table-striped table-hover\">\n            <tbody>\n            <tr v-for=\"post in posts | orderBy 'order'\" class=\"CategoryPosts__item\">\n                <td class=\"order\">\n                    <input class=\"post__order\" type=\"number\" value=\"{{ post.order }}\" @keyup.enter=\"blur\" @focusout=\"reorder(post, $event)\" number=\"\">\n                </td>\n                <td class=\"title\">{{ post.title }}</td>\n            </tr>\n            </tbody>\n        </table>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/categories/category-posts.vue"
  module.hot.dispose(function () {
    require("vueify-insert-css").cache["\n    .order {\n        width: 40px;\n    }\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42,"vueify-insert-css":45}],70:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _modelsCategory = require('../../models/category');

var _modelsCategory2 = _interopRequireDefault(_modelsCategory);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            category: {
                name: '',
                description: ''
            }
        };
    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            _modelsCategory2['default'].create(this.category).then(function (response) {
                self.$route.router.go('/categories');
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/categories'\">Categories</a></li>\n        <li class=\"active\">Create</li>\n    </ol>\n\n    <form class=\"Category\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-success\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button v-link=\"'/categories'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Cancel</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">Category</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"category.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"description\">Description</label>\n                    <input type=\"text\" v-model=\"category.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                </div>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/categories/create.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../models/category":101,"babel-runtime/helpers/interop-require-default":1,"vue":44,"vue-hot-reload-api":42}],71:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

var _repositoriesCategories = require('../../repositories/categories');

var _repositoriesCategories2 = _interopRequireDefault(_repositoriesCategories);

var _repositoriesTags = require('../../repositories/tags');

var _repositoriesTags2 = _interopRequireDefault(_repositoriesTags);

exports['default'] = {

    props: ['current-user'],

    components: {
        'category-posts': require('./category-posts.vue'),
        'media-input': require('../partials/media-input.vue')
    },

    data: function data() {
        return {
            category: {},
            allTags: [],
            allCategories: [],
            orderOptions: [{ id: 'order', text: 'Order (manual)' }, { id: 'created_at', text: 'Created' }, { id: 'updated_at', text: 'Updated' }],
            orderDirections: [{ id: 'asc', text: 'Ascending' }, { id: 'desc', text: 'Descending' }]
        };
    },

    computed: {

        showCategoryPosts: function showCategoryPosts() {
            return this.category.order_by == 'order';
        }

    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            return this.category.save().then(function () {
                self.notify('success', 'Saved successfully.');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        'delete': function _delete() {
            var self = this;
            _sweetalert2['default']({
                title: 'Are you sure?',
                text: 'You will not be able to recover this category!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                self.category.destroy().then(function () {
                    _sweetalert2['default']({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.category.name + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.$route.router.go('/categories');
                    });
                }, function () {
                    _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        }

    },

    route: {
        data: function data(transition) {
            var categoryId = transition.to.params.category_id;

            return {
                category: _repositoriesCategories2['default']['with'](['posts', 'tags', 'media']).getById(categoryId),
                allCategories: _repositoriesCategories2['default'].get(),
                allTags: _repositoriesTags2['default'].get()
            };
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/categories'\">Categories</a></li>\n        <li class=\"active\">{{ category.name }}</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <form class=\"Category EditForm\">\n\n            <section class=\"info row\">\n                <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                    <div class=\"action-buttons\">\n                        <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                        <button @click.prevent=\"delete\" class=\"btn btn-danger\"><i class=\"fa fa-trash\"></i> Delete</button>\n                        <button v-link=\"'/categories'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Close</button>\n                    </div>\n                </div>\n            </section>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">Category</div>\n                <div class=\"panel-body\">\n                    <div class=\"form-group\">\n                        <label for=\"name\">Name</label>\n                        <input type=\"text\" v-model=\"category.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"category\">Parent category</label>\n                                <select v-model=\"category.parent_id\" name=\"category\" id=\"category\" class=\"form-control\">\n                                    <option :value=\"null\" selected=\"\">None</option>\n                                    <option v-if=\"allCategories\" v-for=\"category in allCategories\" :value=\"category.id\">{{ category.name }}</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group form-tags\">\n                                <label for=\"tags\">Tags</label>\n                                <select v-select=\"category.tags\" v-model=\"category.tags\" name=\"tags\" id=\"tags\" multiple=\"\" class=\"form-control\">\n                                    <option v-for=\"tag in allTags\" :value=\"tag.id\">{{ tag.name }}</option>\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"description\">Description</label>\n                        <textarea v-if=\"category.description\" v-rich-editor=\"category.description\" name=\"description\" id=\"description\" class=\"form-control\"></textarea>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">Media</div>\n                <div class=\"panel-body\">\n                    <media-input :type.sync=\"category.media.type\" :url.sync=\"category.media.url\" image-path=\"/img/uploads/media/\" :image-upload=\"'/categories/'+$route.params.category_id+'/image'\">\n                    </media-input>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">Post Ordering</div>\n                <div class=\"panel-body\">\n                    <div class=\"row\">\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"order_by\">Order posts in category by</label>\n                                <select v-model=\"category.order_by\" name=\"order_by\" id=\"order_by\" class=\"form-control\">\n                                    <option v-for=\"option in orderOptions\" value=\"{{ option.id }}\">{{ option.text }}</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"order_dir\">Order posts in category direction</label>\n                                <select v-model=\"category.order_dir\" name=\"order_dir\" id=\"order_dir\" class=\"form-control\">\n                                    <option v-for=\"direction in orderDirections\" value=\"{{ direction.id }}\">{{ direction.text }}</option>\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </form>\n\n        <category-posts v-if=\"showCategoryPosts\" :category-id=\"$route.params.category_id\" :posts=\"category.posts\"></category-posts>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/categories/edit.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../repositories/categories":105,"../../repositories/tags":107,"../partials/media-input.vue":75,"./category-posts.vue":69,"babel-runtime/helpers/interop-require-default":1,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],72:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _repositoriesCategories = require('../../repositories/categories');

var _repositoriesCategories2 = _interopRequireDefault(_repositoriesCategories);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            categories: [],
            nameFilter: null,
            sortKey: null,
            sortDir: -1
        };
    },

    methods: {

        sortBy: function sortBy(key) {
            if (this.sortKey == key) {
                this.sortDir = this.sortDir * -1;
            } else {
                this.sortKey = key;
                this.sortDir = 1;
            }
        },

        orderIcon: function orderIcon(key) {
            if (key == this.sortKey) {
                return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
            }

            return 'fa fa-unsorted';
        }

    },

    route: {
        data: function data(transition) {
            return {
                categories: _repositoriesCategories2['default']['with']('tags').get()
            };
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li class=\"active\">Categories</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <div class=\"filters\">\n            <div class=\"row\">\n                <div class=\"col-md-6\">\n                    <input type=\"text\" v-model=\"nameFilter\" placeholder=\"Filter by name...\" class=\"form-control\">\n                </div>\n                <div class=\"create-button col-md-6\">\n                    <button v-link=\"'/categories/create'\" class=\"btn btn-success\"><i class=\"fa fa-plus\"></i> Add new</button>\n                </div>\n            </div>\n        </div>\n\n        <table class=\"Categories table table-striped table-hover\">\n            <thead>\n                <tr>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('name')\">Name <i :class=\"orderIcon('name')\"></i></a></th>\n                    <th><a>Parent</a></th>\n                    <th><a>Tags</a></th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr v-for=\"category in categories | filterBy nameFilter | orderBy sortKey sortDir\" class=\"Category\">\n                    <td><a v-link=\"'/categories/'+category.id\">{{ category.name }}</a></td>\n                    <td>{{ category.parentName }}</td>\n                    <td><span v-for=\"tag in category.tags\" class=\"tag label label-default\">{{ tag.name }}</span></td>\n                </tr>\n            </tbody>\n        </table>\n\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/categories/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../repositories/categories":105,"babel-runtime/helpers/interop-require-default":1,"vue":44,"vue-hot-reload-api":42}],73:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    computed: {

        userName: function userName() {
            return this.currentUser ? this.currentUser.name : '';
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <h1>Dashboard for {{ userName }}</h1>\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/home.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],74:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _dropzone = require('dropzone');

var _dropzone2 = _interopRequireDefault(_dropzone);

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

exports['default'] = {

    props: ['path', 'image', 'to'],

    data: function data() {
        return {
            dropzone: null
        };
    },

    ready: function ready() {
        this.initDropzone();
    },

    methods: {

        initDropzone: function initDropzone() {
            // Overwrite dropzone's confirm method with our own
            _dropzone2['default'].confirm = this.confirm;
            // Initialize dropzone with our config and add some even listeners
            this.dropzone = new _dropzone2['default']('#dropzone-image', {
                url: "/api" + this.to,
                dictDefaultMessage: "Drop image file here to upload",
                dictRemoveFileConfirmation: "Are you sure you want to delete this?",
                paramName: "image",
                maxFiles: 1,
                maxFilesize: 1.5,
                uploadMultiple: false,
                headers: { "Authorization": _jsCookie2['default'].get('jwt-token') }
            }).on('maxfilesreached', function () {
                //$('#dropzone-image').removeClass('dz-clickable'); // remove cursor
                //$('#dropzone-image')[0].removeEventListener('click', this.listeners[1].events.click);
            }).on('maxfilesexceeded', function (file) {
                //this.removeFile(file);
            }).on('removedfile', (function (file) {
                this['delete'](file);
            }).bind(this));
            // Show existing photo in dropzone box
            if (this.image && this.image.length > 0) {
                this.showExistingImage();
            }
        },

        'delete': function _delete(file) {
            client({
                method: 'DELETE',
                path: this.to
            }).then(function () {
                _sweetalert2['default']({
                    html: true,
                    title: 'Deleted!',
                    text: '<strong>' + file.name + '</strong> was deleted!',
                    type: 'success'
                });
            }, function () {
                _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
            });
        },

        showExistingImage: function showExistingImage() {
            var mockFile = { name: this.image, size: 432100 };
            this.dropzone.emit("addedfile", mockFile);
            this.dropzone.emit("thumbnail", mockFile, this.path + this.image);
            this.dropzone.emit("complete", mockFile);
            this.dropzone.files.push(mockFile);
            this.dropzone.options.maxFiles = this.dropzone.options.maxFiles - 1;
        },

        confirm: function confirm(question, accepted, rejected) {
            _sweetalert2['default']({
                title: 'Hold up!',
                text: question,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, accepted, rejected);
        }

    }
};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"form-group\">\n        <label>Image</label>\n        <div id=\"dropzone-image\" class=\"dropzone\">\n            <div class=\"fallback\">\n                <input name=\"image\" type=\"file\">\n            </div>\n        </div>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/partials/dropzone.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"dropzone":3,"js-cookie":5,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],75:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['type', 'url', 'image-path', 'image-upload'],

    components: { dropzone: require('./dropzone.vue') },

    data: function data() {
        return {
            mediaTypes: [{ id: 'image', text: 'Image' }, { id: 'youtube_video', text: 'Youtube' }, { id: 'vimeo_video', text: 'Vimeo' }, { id: 'wistia_video', text: 'Wistia' }],
            showMediaInput: false,
            showDropzone: false
        };
    },

    ready: function ready() {
        this.$nextTick(function () {
            this.checkMediaType();
        });
    },

    methods: {
        checkMediaType: function checkMediaType() {
            this.showDropzone = this.type == 'image';
            this.showMediaInput = this.type && this.type.length > 0 && this.type != 'image';
        }
    }
};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"form-group\">\n        <label for=\"media-type\">Media type</label>\n        <select v-model=\"type\" @change=\"checkMediaType\" name=\"media-type\" id=\"media-type\" class=\"form-control\">\n            <option :value=\"null\">Select type...</option>\n            <option v-for=\"mediaType in mediaTypes\" :value=\"mediaType.id\">{{ mediaType.text }}</option>\n        </select>\n    </div>\n    <div v-if=\"showDropzone\">\n        <dropzone :path=\"imagePath\" :image=\"url\" :to=\"imageUpload\"></dropzone>\n    </div>\n    <div v-if=\"showMediaInput\" class=\"form-group\">\n        <label for=\"media-link\">Media Link</label>\n        <input type=\"text\" v-model=\"url\" name=\"media-link\" id=\"media-link\" class=\"form-control\">\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/partials/media-input.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"./dropzone.vue":74,"vue":44,"vue-hot-reload-api":42}],76:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['pagination'],

    methods: {

        hasPrevious: function hasPrevious() {
            return !!this.pagination.links.previous;
        },

        hasNext: function hasNext() {
            return !!this.pagination.links.next;
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ul class=\"pagination\">\n        <li :class=\"{ 'disabled': !hasPrevious() }\">\n            <a href=\"#\">«</a>\n        </li>\n        <li v-for=\"i in pagination.total_pages\" :class=\"{ 'active': i+1 == pagination.current_page }\">\n            <a href=\"#\">{{ i+1 }}</a>\n        </li>\n        <li :class=\"{ 'disabled': !hasNext() }\">\n            <a href=\"#\">»</a>\n        </li>\n    </ul>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/partials/paginator.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],77:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

        props: ['current-user']

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"Side-nav panel\">\n        <div class=\"list-group\">\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/home', activeClass: 'active' }\">\n                <i class=\"fa fa-home\"></i> Home\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/posts', activeClass: 'active' }\">\n                <i class=\"fa fa-newspaper-o\"></i> Posts\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/post-fields', activeClass: 'active' }\">\n                <i class=\"fa fa-th-list\"></i> Post fields\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/categories', activeClass: 'active' }\">\n                <i class=\"fa fa-columns\"></i> Categories\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/tags', activeClass: 'active' }\">\n                <i class=\"fa fa-tags\"></i> Tags\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/authors', activeClass: 'active' }\">\n                <i class=\"fa fa-pencil-square-o\"></i> Authors\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/users', activeClass: 'active' }\">\n                <i class=\"fa fa-users\"></i> Users\n            </a>\n            <a href=\"#\" class=\"list-group-item\" v-link=\"{ path: '/settings', activeClass: 'active' }\">\n                <i class=\"fa fa-gear\"></i> Settings\n            </a>\n        </div>\n    </div>\n\n    <div class=\"flashtag\">\n        <!-- You don't have to leave this but it would be nice if you did -->\n        <div class=\"flashtag__link\"><a href=\"http://flashtag.org\" title=\"© Ryan Winchester\">FLASHTAG</a></div>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/partials/side-nav.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],78:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    computed: {

        userName: function userName() {
            return this.currentUser ? this.currentUser.name : '';
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <nav class=\"Top-nav navbar navbar-inverse navbar-fixed-top\">\n        <div class=\"container-fluid\">\n            <div class=\"navbar-header\">\n                <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#main-nav\">\n                    <span class=\"sr-only\">Toggle navigation</span>\n                    <span class=\"icon-bar\"></span>\n                    <span class=\"icon-bar\"></span>\n                    <span class=\"icon-bar\"></span>\n                </button>\n                <span class=\"navbar-brand\">Acme Co.</span>\n            </div>\n            <ul class=\"nav navbar-nav navbar-right\">\n                <li class=\"dropdown\">\n                    <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                       {{ userName }} <span class=\"caret\"></span>\n                    </a>\n                    <ul class=\"dropdown-menu\">\n                        <li><a href=\"/admin/auth/logout\"><i class=\"fa fa-sign-out\"></i> Logout</a></li>\n                    </ul>\n                </li>\n            </ul>\n        </div>\n    </nav>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/partials/top-nav.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],79:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            field: {
                label: '',
                name: '',
                description: '',
                template: ''
            },
            templates: [{ id: 'string', text: 'String' }, { id: 'rich_text', text: 'Rich Text' }]
        };
    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            return client({
                method: 'POST',
                path: '/fields',
                entity: this.field
            }).then(function (response) {
                self.$route.router.go('/post-fields');
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/post-fields'\">Post Fields</a></li>\n        <li class=\"active\">Create</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <form class=\"Category\">\n\n            <section class=\"info row\">\n                <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                    <div class=\"action-buttons\">\n                        <button @click.prevent=\"save\" class=\"btn btn-success\"><i class=\"fa fa-save\"></i> Save</button>\n                        <button v-link=\"'/post-fields'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Cancel</button>\n                    </div>\n                </div>\n            </section>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">POST FIELD</div>\n                <div class=\"panel-body\">\n                    <div class=\"form-group\">\n                        <label for=\"label\">Label</label>\n                        <input type=\"text\" v-model=\"field.label\" label=\"label\" id=\"label\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"name\">Name</label>\n                        <input type=\"text\" v-model=\"field.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"description\">Description</label>\n                        <input type=\"text\" v-model=\"field.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"template\">Template</label>\n                        <select v-model=\"field.template\" name=\"template\" id=\"template\" class=\"form-control\">\n                            <option value=\"\" disabled=\"\" selected=\"\">Select a template...</option>\n                            <option v-for=\"template in templates\" value=\"{{ template.id }}\">{{ template.text }}</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </form>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/post-fields/create.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],80:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            field: {
                id: '',
                label: '',
                name: '',
                description: '',
                template: ''
            },
            templates: [{ id: 'string', text: 'String' }, { id: 'rich_text', text: 'Rich Text' }]
        };
    },

    methods: {

        fetch: function fetch() {
            var self = this;
            return client({
                path: '/fields/' + this.$route.params.field_id
            }).then(function (response) {
                self.field = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            return client({
                method: 'PUT',
                path: '/fields/' + this.field.id,
                entity: this.field
            }).then(function (response) {
                self.notify('success', 'Saved successfully.');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        'delete': function _delete() {
            var self = this;
            _sweetalert2['default']({
                title: 'Are you sure?',
                text: 'You will not be able to recover this post and all of its revision history!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                client({
                    method: 'DELETE',
                    path: '/fields/' + self.field.id
                }).then(function () {
                    _sweetalert2['default']({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.field.name + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.$route.router.go('/post-fields');
                    });
                }, function () {
                    _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        }

    },

    route: {
        data: function data(transition) {
            this.fetch().then(transition.next);
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/post-fields'\">Post Fields</a></li>\n        <li class=\"active\">{{ field.label }}</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <form class=\"PostField EditForm\">\n\n            <section class=\"info row\">\n                <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                    <div class=\"action-buttons\">\n                        <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                        <button @click.prevent=\"delete\" class=\"btn btn-danger\"><i class=\"fa fa-trash\"></i> Delete</button>\n                        <button v-link=\"'/post-fields'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Close</button>\n                    </div>\n                </div>\n            </section>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">POST FIELD</div>\n                <div class=\"panel-body\">\n                    <div class=\"form-group\">\n                        <label for=\"label\">Label</label>\n                        <input type=\"text\" v-model=\"field.label\" label=\"label\" id=\"label\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"name\">Name</label>\n                        <input type=\"text\" v-model=\"field.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"description\">Description</label>\n                        <input type=\"text\" v-model=\"field.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"template\">Template</label>\n                        <select v-model=\"field.template\" name=\"template\" id=\"template\" class=\"form-control\">\n                            <option value=\"\" disabled=\"\" selected=\"\">Select a template...</option>\n                            <option v-for=\"template in templates\" value=\"{{ template.id }}\">{{ template.text }}</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </form>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/post-fields/edit.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],81:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            fields: [],
            pagination: { links: {} },
            labelFilter: null,
            sortKey: null,
            sortDir: -1
        };
    },

    methods: {

        fetch: function fetch() {
            var self = this;
            return client({
                path: '/fields'
            }).then(function (response) {
                self.fields = response.entity.data;
                self.pagination = response.entity.meta.pagination;
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        sortBy: function sortBy(key) {
            if (this.sortKey == key) {
                this.sortDir = this.sortDir * -1;
            } else {
                this.sortKey = key;
                this.sortDir = 1;
            }
        },

        orderIcon: function orderIcon(key) {
            if (key == this.sortKey) {
                return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
            }

            return 'fa fa-unsorted';
        }

    },

    route: {
        data: function data(transition) {
            this.fetch().then(transition.next);
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li class=\"active\">Post Fields</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <div class=\"filters\">\n            <div class=\"row\">\n                <div class=\"col-md-6\">\n                    <input type=\"text\" v-model=\"labelFilter\" placeholder=\"Filter by label...\" class=\"form-control\">\n                </div>\n                <div class=\"create-button col-md-6\">\n                    <button v-link=\"'/post-fields/create'\" class=\"btn btn-success\"><i class=\"fa fa-plus\"></i> Add new</button>\n                </div>\n            </div>\n        </div>\n\n        <table class=\"Fields table table-striped table-hover\">\n            <thead>\n                <tr>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('label')\">Label <i :class=\"orderIcon('label')\"></i></a></th>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('name')\">Name <i :class=\"orderIcon('name')\"></i></a></th>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('template')\">Template <i :class=\"orderIcon('template')\"></i></a></th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr v-for=\"field in fields | filterBy labelFilter in 'label' | orderBy sortKey sortDir\" class=\"Field\" :class=\"{ 'Field--unpublished': !field.is_published }\">\n                    <td><a v-link=\"'/post-fields/'+field.id\">{{ field.label }}</a></td>\n                    <td>{{ field.name }}</td>\n                    <td>{{ field.template }}</td>\n                </tr>\n            </tbody>\n        </table>\n\n        <paginator :pagination=\"pagination\"></paginator>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/post-fields/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],82:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = {

    props: {
        field: Object
    }

};
module.exports = exports["default"];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <label for=\"{{ field.name }}\">{{ field.label }}</label>\n    <textarea name=\"{{ field.name }}\" id=\"{{ field.name }}\" class=\"form-control rich-editor\" v-rich-editor=\"field.value\"></textarea>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/post-fields/templates/rich_text.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],83:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = {

    props: {
        field: Object
    }

};
module.exports = exports["default"];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <label for=\"{{ field.name }}\">{{ field.label }}</label>\n    <input type=\"text\" name=\"{{ field.name }}\" id=\"{{ field.name }}\" v-model=\"field.value\" class=\"form-control\">\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/post-fields/templates/string.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],84:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

exports['default'] = {

    props: ['current-user'],

    components: {
        string: require('../post-fields/templates/string.vue'),
        rich_text: require('../post-fields/templates/rich_text.vue')
    },

    data: function data() {
        return {
            post: {
                body: ' ',
                category: {},
                tags: [],
                fields: [],
                revisions: [],
                meta: {}
            },
            allCategories: [],
            allTags: [],
            allFields: [],
            allAuthors: []
        };
    },

    computed: {

        isShowing: function isShowing() {
            if (!this.post.is_published) {
                return false;
            }
            var start = this.post.start_showing_at ? _moment2['default'](this.post.start_showing_at) : _moment2['default']("1980-01-01", "YYYY-MM-DD");
            var end = this.post.stop_showing_at ? _moment2['default'](this.post.stop_showing_at) : _moment2['default']("2033-01-19", "YYYY-MM-DD");
            var now = _moment2['default']();

            return start <= now && now <= end;
        }

    },

    methods: {

        fetchCategories: function fetchCategories(successHandler) {
            var self = this;
            client({
                path: '/categories'
            }).then(function (response) {
                self.allCategories = response.entity.data;
                successHandler(self.allCategories);
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchTags: function fetchTags() {
            var self = this;
            client({
                path: '/tags'
            }).then(function (response) {
                self.allTags = response.entity.data.map(function (tag) {
                    tag.text = tag.name;
                    return tag;
                });
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchFields: function fetchFields() {
            var self = this;
            client({
                path: '/fields'
            }).then(function (response) {
                self.allFields = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchAuthors: function fetchAuthors() {
            var self = this;
            client({
                path: '/authors'
            }).then(function (response) {
                self.allAuthors = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            client({
                method: 'POST',
                path: '/posts',
                entity: self.post
            }).then(function (response) {
                self.$route.router.go('/posts');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        getTemplate: function getTemplate(field) {
            return field ? field.template : '';
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        }

    },

    route: {
        data: function data(transition) {
            this.fetchTags();
            this.fetchFields();
            this.fetchAuthors();
            this.fetchCategories(function (categories) {
                transition.next({ allCategories: categories });
            });
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/posts'\">Posts</a></li>\n        <li class=\"active\">Create</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <form class=\"Post\">\n\n            <section class=\"info row\">\n                <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                    <div class=\"action-buttons\">\n                        <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                        <button v-link=\"'/posts'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Cancel</button>\n                    </div>\n                </div>\n            </section>\n\n            <div class=\"panel panel-default\" :class=\"{ 'border-green': isShowing, 'border-red': !isShowing }\">\n                <div class=\"panel-heading\">\n                    PUBLISHING\n                    <label class=\"showing label\" :class=\"{ 'label-success': isShowing, 'label-danger': !isShowing }\">\n                        {{ isShowing ? 'Will show on website' : 'Will not show on website' }}\n                    </label>\n                </div>\n                <div class=\"panel-body\">\n                    <div class=\"row\">\n                        <div class=\"col-md-2\">\n                            <div class=\"form-group switch-wrapper\">\n                                <div class=\"publish-switch\">\n                                    <label for=\"is_published\">Published</label>\n                                    <div class=\"switch\">\n                                        <input v-model=\"post.is_published\" name=\"is_published\" id=\"is_published\" class=\"cmn-toggle cmn-toggle-round-md\" type=\"checkbox\">\n                                        <label for=\"is_published\"></label>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"col-md-5\">\n                            <label for=\"start_showing_at\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"If the post is published, it will not show until this date.\">\n                                Start showing\n                            </label>\n                            <input type=\"date\" v-model=\"post.start_showing_at\" name=\"start_showing_at\" id=\"start_showing_at\" class=\"form-control\" placeholder=\"Date\">\n                        </div>\n                        <div class=\"col-md-5\">\n                            <label for=\"stop_showing_at\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"If the post is published, it will not show after this date.\">\n                                Stop showing\n                            </label>\n                            <input type=\"date\" v-model=\"post.stop_showing_at\" name=\"stop_showing_at\" id=\"stop_showing_at\" class=\"form-control\" placeholder=\"Date\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">POST</div>\n                <div class=\"panel-body\">\n                    <div class=\"row\">\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"title\">Title</label>\n                                <input type=\"text\" v-model=\"post.title\" name=\"title\" id=\"title\" class=\"form-control\">\n                            </div>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"subtitle\">Subtitle</label>\n                                <input type=\"text\" v-model=\"post.subtitle\" name=\"subtitle\" id=\"subtitle\" class=\"form-control\">\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"category\">Category</label>\n                                <select v-model=\"post.category.id\" name=\"category\" id=\"category\" class=\"form-control\">\n                                    <option value=\"\" disabled=\"\" selected=\"\">Select a category...</option>\n                                    <option v-for=\"category in allCategories\" :value=\"category.id\">{{ category.name }}</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group form-tags\">\n                                <label for=\"tags\">Tags</label>\n                                <select v-model=\"post.tags\" name=\"tags\" id=\"tags\" multiple=\"\" class=\"form-control\" v-select=\"post.tags\">\n                                    <option v-for=\"tag in allTags\" :value=\"tag.id\">{{ tag.name }}</option>\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"body\">Body</label>\n                        <textarea name=\"body\" id=\"body\" class=\"form-control rich-editor\" v-if=\"post.body\" v-rich-editor=\"post.body\">                        </textarea>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"author\">Author</label>\n                        <select v-select=\"post.author_id\" id=\"author\" name=\"author\" :options=\"allAuthors\">\n                            <option value=\"\" disabled=\"\" selected=\"\">Select an author...</option>\n                            <option v-for=\"author in allAuthors\" value=\"{{ author.id }}\">{{ author.name }}</option>\n                        </select>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"show_author\">Show author?</label>\n                        <div class=\"switch\">\n                            <input id=\"show_author\" class=\"cmn-toggle cmn-toggle-yes-no\" type=\"checkbox\" v-model=\"post.show_author\">\n                            <label for=\"show_author\" data-on=\"Yes\" data-off=\"No\"></label>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">CUSTOM FIELDS</div>\n                <div class=\"panel-body\">\n                    <div class=\"form-group\" v-for=\"field in allFields\">\n                        <component :is=\"field.template\" :field.sync=\"field\">\n                        </component>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">META</div>\n                <div class=\"panel-body\">\n                    <div class=\"form-group\">\n                        <label for=\"description\">Description</label>\n                        <input type=\"text\" v-model=\"post.meta.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"url\">Canonical Link</label>\n                        <input type=\"text\" v-model=\"post.meta.url\" name=\"url\" id=\"url\" class=\"form-control\">\n                    </div>\n                </div>\n            </div>\n\n        </form>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/posts/create.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../post-fields/templates/rich_text.vue":82,"../post-fields/templates/string.vue":83,"babel-runtime/helpers/interop-require-default":1,"moment":6,"vue":44,"vue-hot-reload-api":42}],85:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

var _repositoriesCategories = require('../../repositories/categories');

var _repositoriesCategories2 = _interopRequireDefault(_repositoriesCategories);

exports['default'] = {

    props: ['current-user'],

    components: {
        string: require('../post-fields/templates/string.vue'),
        rich_text: require('../post-fields/templates/rich_text.vue'),
        dropzone: require('../partials/dropzone.vue')
    },

    data: function data() {
        return {
            post: {
                body: ' ',
                category: {},
                tags: [],
                fields: [],
                revisions: [],
                meta: {},
                media: { type: '' }
            },
            fieldValues: null,
            allCategories: [],
            allTags: [],
            allFields: [],
            allAuthors: [],
            deleted: false
        };
    },

    computed: {

        isShowing: function isShowing() {
            if (!this.post.is_published) {
                return false;
            }
            var start = this.post.start_showing_at ? _moment2['default'](this.post.start_showing_at) : _moment2['default']("1980-01-01", "YYYY-MM-DD");
            var end = this.post.stop_showing_at ? _moment2['default'](this.post.stop_showing_at) : _moment2['default']("2033-01-19", "YYYY-MM-DD");
            var now = _moment2['default']();

            return start <= now && now <= end;
        }

    },

    methods: {

        fetch: function fetch() {
            var self = this;
            return client({
                path: '/posts/' + this.$route.params.post_id + '?include=category,tags,fields,meta,author,media'
            }).then(function (response) {
                self.post = response.entity.data;
                self.post.category = self.post.category ? self.post.category.data : {};
                self.post.fields = self.post.fields.data;
                self.post.meta = self.post.meta ? self.post.meta.data : {};
                self.post.author = self.post.author ? self.post.author.data : {};
                self.post.media = self.post.media ? self.post.media.data : {};
                self.post.tags = self.post.tags.data.reduce(function (ids, tag) {
                    ids.push(tag.id);
                    return ids;
                }, []);
                if (self.post.start_showing_at) {
                    self.post.start_showing_at = _moment2['default'].utc(self.post.start_showing_at, 'X').format('YYYY-MM-DD');
                }
                if (self.post.stop_showing_at) {
                    self.post.stop_showing_at = _moment2['default'].utc(self.post.stop_showing_at, 'X').format('YYYY-MM-DD');
                }
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchCategories: function fetchCategories() {
            var self = this;
            return client({
                path: '/categories'
            }).then(function (response) {
                self.allCategories = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchTags: function fetchTags() {
            var self = this;
            return client({
                path: '/tags'
            }).then(function (response) {
                self.allTags = response.entity.data.map(function (tag) {
                    tag.text = tag.name;
                    return tag;
                });
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchFields: function fetchFields() {
            var self = this;
            return client({
                path: '/fields'
            }).then(function (response) {
                self.allFields = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchAuthors: function fetchAuthors() {
            var self = this;
            return client({
                path: '/authors'
            }).then(function (response) {
                self.allAuthors = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            this.post.fields = this.fieldValues;
            return client({
                method: 'PUT',
                path: '/posts/' + this.post.id,
                entity: self.post
            }).then(function (response) {
                self.notify('success', 'Saved successfully.');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        'delete': function _delete() {
            var self = this;
            _sweetalert2['default']({
                title: 'Are you sure?',
                text: 'You will not be able to recover this post and all of its revision history!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                client({
                    method: 'DELETE',
                    path: '/posts/' + self.post.id
                }).then(function () {
                    _sweetalert2['default']({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.post.title + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.deleted = true;
                        self.$route.router.go('/posts');
                    });
                }, function () {
                    _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        lock: function lock() {
            if (!this.post.is_locked) {
                var self = this;
                return client({
                    method: 'PATCH',
                    path: '/posts/' + self.post.id + '/lock',
                    entity: { user_id: self.currentUser.id }
                }).then(function (response) {
                    self.post.is_locked = true;
                    window.onbeforeunload = function (e) {
                        self.unlock();
                    };
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            }
        },

        unlock: function unlock(done) {
            if (this.post.is_locked && !this.deleted) {
                var self = this;
                return client({
                    method: 'PATCH',
                    path: '/posts/' + self.post.id + '/unlock',
                    entity: { user_id: self.currentUser.id }
                }).then(function (response) {
                    self.post.is_locked = false;
                    done();
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            } else {
                done();
            }
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        },

        mapFieldValues: function mapFieldValues() {
            var self = this;
            this.fieldValues = this.allFields.reduce(function (fields, field) {
                fields[field.name] = {
                    id: field.id,
                    name: field.name,
                    label: field.label,
                    value: self.getFieldValue(field.name)
                };
                return fields;
            }, {});
        },

        getFieldValue: function getFieldValue(fieldName) {
            if (!fieldName.length > 0) {
                return '';
            }
            var matchedField = this.post.fields.filter(function (field) {
                return field.name == fieldName;
            })[0];

            return matchedField ? matchedField.value : '';
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        },

        initTooltips: function initTooltips() {
            this.$nextTick(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
        }

    },

    route: {
        data: function data(transition) {
            var cat = _repositoriesCategories2['default'].get().then(function (response) {
                console.log(response);
            });
            this.fetch().then(this.fetchFields).then(this.fetchTags).then(this.fetchCategories).then(this.fetchAuthors).then(this.mapFieldValues).then(transition.next).then(this.initTooltips).then(this.lock);
        },

        deactivate: function deactivate(transition) {
            this.unlock(function () {
                transition.next();
            });
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/posts'\">Posts</a></li>\n        <li class=\"active\">{{ post.title }}</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n        <form class=\"Post EditForm\">\n\n            <section class=\"info row\">\n                <div class=\"col-md-6 clearfix\">\n                    <a v-link=\"'/posts/'+$route.params.post_id+'/revisions'\" class=\"btn btn-link\">\n                        <i class=\"fa fa-history\"></i> Revision history\n                    </a>\n                </div>\n                <div class=\"col-md-6 clearfix\">\n                    <div class=\"action-buttons\">\n                        <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                        <button @click.prevent=\"delete\" class=\"btn btn-danger\"><i class=\"fa fa-trash\"></i> Delete</button>\n                        <button v-link=\"'/posts'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Close</button>\n                    </div>\n                </div>\n            </section>\n\n            <div class=\"panel panel-default\" :class=\"{ 'border-green': isShowing, 'border-red': !isShowing }\">\n                <div class=\"panel-heading\">\n                    PUBLISHING\n                    <label class=\"showing label\" :class=\"{ 'label-success': isShowing, 'label-danger': !isShowing }\">\n                        {{ isShowing ? 'Will show on website' : 'Will not show on website' }}\n                    </label>\n                </div>\n                <div class=\"panel-body\">\n                    <div class=\"row\">\n                        <div class=\"col-md-2\">\n                            <div class=\"form-group switch-wrapper\">\n                                <div class=\"publish-switch\">\n                                    <label for=\"is_published\">Published</label>\n                                    <div class=\"switch\">\n                                        <input v-model=\"post.is_published\" name=\"is_published\" id=\"is_published\" class=\"cmn-toggle cmn-toggle-round-md\" type=\"checkbox\">\n                                        <label for=\"is_published\"></label>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"col-md-5\">\n                            <label for=\"start_showing_at\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"If the post is published, it will not show until this date.\">\n                                Start showing\n                            </label>\n                            <input type=\"date\" v-model=\"post.start_showing_at\" name=\"start_showing_at\" id=\"start_showing_at\" class=\"form-control\" placeholder=\"Date\">\n                        </div>\n                        <div class=\"col-md-5\">\n                            <label for=\"stop_showing_at\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"If the post is published, it will not show after this date.\">\n                                Stop showing\n                            </label>\n                            <input type=\"date\" v-model=\"post.stop_showing_at\" name=\"stop_showing_at\" id=\"stop_showing_at\" class=\"form-control\" placeholder=\"Date\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">POST</div>\n                <div class=\"panel-body\">\n                    <div class=\"row\">\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"title\">Title</label>\n                                <input type=\"text\" v-model=\"post.title\" name=\"title\" id=\"title\" class=\"form-control\">\n                            </div>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"subtitle\">Subtitle</label>\n                                <input type=\"text\" v-model=\"post.subtitle\" name=\"subtitle\" id=\"subtitle\" class=\"form-control\">\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group\">\n                                <label for=\"category\">Category</label>\n                                <select name=\"category\" id=\"category\" class=\"form-control\" v-select=\"post.category_id\" v-model=\"post.category_id\">\n                                    <option value=\"\" disabled=\"\" selected=\"\">Select a category...</option>\n                                    <option v-for=\"category in allCategories\" :value=\"category.id\">{{ category.name }}</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <div class=\"form-group form-tags\">\n                                <label for=\"tags\">Tags</label>\n                                <select name=\"tags\" id=\"tags\" multiple=\"\" class=\"form-control\" v-select=\"post.tags\" v-model=\"post.tags\" :options=\"allTags\">\n                                    <option v-for=\"tag in allTags\" :value=\"tag.id\">{{ tag.name }}</option>\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"body\">Body</label>\n                        <textarea name=\"body\" id=\"body\" class=\"form-control rich-editor\" v-if=\"post.body\" v-rich-editor=\"post.body\" v-model=\"post.body\">                        </textarea>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"author\">Author</label>\n                        <select v-select=\"post.author_id\" id=\"author\" name=\"author\" :options=\"allAuthors\">\n                            <option value=\"\" disabled=\"\" selected=\"\">Select an author...</option>\n                            <option v-for=\"author in allAuthors\" value=\"{{ author.id }}\">{{ author.name }}</option>\n                        </select>\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"show_author\">Show author?</label>\n                        <div class=\"switch\">\n                            <input id=\"show_author\" class=\"cmn-toggle cmn-toggle-yes-no\" type=\"checkbox\" v-model=\"post.show_author\">\n                            <label for=\"show_author\" data-on=\"Yes\" data-off=\"No\"></label>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div v-if=\"allFields &amp;&amp; allFields.length > 0\" class=\"panel panel-default\">\n                <div class=\"panel-heading\">CUSTOM FIELDS</div>\n                <div class=\"panel-body\">\n                    <div v-for=\"field in allFields\" class=\"form-group\">\n                        <component v-if=\"fieldValues\" :is=\"field.template\" :field.sync=\"fieldValues[field.name]\">\n                        </component>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">Image</div>\n                <div class=\"panel-body\">\n                    <dropzone path=\"/img/uploads/posts/\" :image=\"post.image\" :to=\"'/posts/'+$route.params.post_id+'/image'\">\n                    </dropzone>\n                </div>\n            </div>\n\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\">META</div>\n                <div class=\"panel-body\">\n                    <div class=\"form-group\">\n                        <label for=\"description\">Description</label>\n                        <input type=\"text\" v-model=\"post.meta.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label for=\"url\">Canonical Link</label>\n                        <input type=\"text\" v-model=\"post.meta.url\" name=\"url\" id=\"url\" class=\"form-control\">\n                    </div>\n                </div>\n            </div>\n\n        </form>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/posts/edit.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../repositories/categories":105,"../partials/dropzone.vue":74,"../post-fields/templates/rich_text.vue":82,"../post-fields/templates/string.vue":83,"babel-runtime/helpers/interop-require-default":1,"moment":6,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],86:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

var _repositoriesPosts = require('../../repositories/posts');

var _repositoriesPosts2 = _interopRequireDefault(_repositoriesPosts);

var _repositoriesCategories = require('../../repositories/categories');

var _repositoriesCategories2 = _interopRequireDefault(_repositoriesCategories);

var _repositoriesUsers = require('../../repositories/users');

var _repositoriesUsers2 = _interopRequireDefault(_repositoriesUsers);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            posts: [],
            categories: [],
            users: [],
            titleFilter: null,
            categoryFilter: null,
            sortKey: 'order',
            sortDir: 1
        };
    },

    ready: function ready() {
        this.$nextTick((function () {
            this.initTooltips();
        }).bind(this));
    },

    methods: {

        goToPost: function goToPost(post) {
            if (!post.is_locked) {
                this.$route.router.go({ path: '/posts/' + post.id });
            } else {
                _sweetalert2['default']({
                    html: true,
                    title: "Are you sure?",
                    text: "The post is currently opened by <strong>" + this.userName(post.locked_by_id) + "</strong>. " + "If you proceed and they are still editing the post, you may overwrite each other's work.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, unlock it!",
                    cancelButtonText: "Nevermind"
                }, (function () {
                    this.$route.router.go({ path: '/posts/' + post.id });
                }).bind(this));
            }
        },

        userName: function userName(userId) {
            if (!userId || !this.users || !this.users.length) {
                return '';
            }

            var user = this.users.filter(function (user) {
                return user.id == userId;
            })[0];

            return user.name;
        },

        formatTimestamp: function formatTimestamp(timestamp) {
            return _moment2['default'].unix(timestamp).format('MMM D, YYYY');
        },

        sortBy: function sortBy(key) {
            if (this.sortKey == key) {
                this.sortDir = this.sortDir * -1;
            } else {
                this.sortKey = key;
                this.sortDir = 1;
            }
        },

        orderIcon: function orderIcon(key) {
            if (key == this.sortKey) {
                return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
            }

            return 'fa fa-unsorted';
        },

        initTooltips: function initTooltips() {
            this.$nextTick(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
        },

        /**
         * Reorder the posts' list_positions
         * @param post
         * @param e
         */
        reorder: function reorder(post, e) {
            var self = this;

            var new_position = parseInt(e.target.value);
            // If the position is not a number, we are done here.
            if (isNaN(new_position)) {
                e.target.value = post.order;
                return;
            }

            var affectedPosts = self.posts.filter(function (p) {
                return p.category.data.id == post.category.data.id;
            });

            var max = affectedPosts.reduce(function (max, post) {
                return post.order > max ? post.order : max;
            }, 0);

            new_position = new_position > 0 ? new_position : 1;
            new_position = new_position > max ? max : new_position;

            // If the position is not different, we are done here.
            if (new_position === post.order) {
                e.target.value = post.order;
                return;
            }

            // Shift all the posts' between the new list position and old list position up or down by one.
            // If we are moving the list position to a lower number, the other numbers should shift up by one,
            // but if we are moving the list position to a higher number the others should shift down by one.
            var increment = new_position < post.order ? +1 : -1;
            var between = new_position < post.order ? [new_position, post.order] : [post.order, new_position];

            this.posts = affectedPosts.map(function (post) {
                var p = post.order;
                if (p >= between[0] && p <= between[1]) {
                    post.order += increment;
                }
                return post;
            });

            // Save the new position on the current post.
            post.order = new_position;

            // Persist the new order
            this.saveOrder(post);

            this.sortKey = 'order';

            setTimeout((function () {
                this.scrollTo($(e.target).closest('tr'));
            }).bind(this), 0);
        },

        changeFilter: function changeFilter() {
            this.initTooltips();
        },

        /**
         * Save the post's position to the database.
         * @param post
         */
        saveOrder: function saveOrder(post) {
            return client({
                method: "PATCH",
                path: '/posts/' + post.id + '/reorder',
                entity: { order: post.order }
            });
        },

        scrollTo: function scrollTo(target) {
            $('html,body').animate({
                scrollTop: target.offset().top - 280
            }, 700);

            target.addClass("pulse").delay(4000).queue(function () {
                $(this).removeClass("pulse").dequeue();
            });

            return false;
        },

        blur: function blur(e) {
            e.target.blur();
        }

    },

    computed: {

        currentUserName: function currentUserName() {
            return this.currentUser ? this.currentUser.name : '';
        }

    },

    route: {
        data: function data(transition) {
            return {
                posts: _repositoriesPosts2['default']['with']('category').orderBy('updated_at', 'desc').get(),
                categories: _repositoriesCategories2['default'].get(),
                users: _repositoriesUsers2['default'].get()
            };
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li class=\"active\">Posts</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <div class=\"create-button\">\n            <button v-link=\"'/posts/create'\" class=\"btn btn-success\"><i class=\"fa fa-pencil\"></i> Write New</button>\n        </div>\n\n        <div class=\"filters\">\n            <div class=\"row\">\n                <div class=\"col-md-6\">\n                    <input type=\"text\" v-model=\"titleFilter\" @keyup=\"changeFilter\" placeholder=\"Filter by title...\" class=\"form-control\">\n                </div>\n                <div class=\"col-md-6\">\n                    <select v-model=\"categoryFilter\" @change=\"changeFilter\" id=\"category\" class=\"form-control\">\n                        <option value=\"\" selected=\"\">Filter by category...</option>\n                        <option v-for=\"category in categories\" :value=\"category.name\">\n                            {{ category.name }}\n                        </option>\n                    </select>\n                </div>\n            </div>\n        </div>\n\n        <table class=\"Posts table table-striped table-hover\">\n            <thead>\n                <tr>\n                    <th v-if=\"categoryFilter\"><a href=\"#\" @click.prevent=\"sortBy('order')\">Order <i :class=\"orderIcon('order')\"></i></a></th>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('title')\">Title <i :class=\"orderIcon('title')\"></i></a></th>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('category.name')\">Category <i :class=\"orderIcon('category.name')\"></i></a></th>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('created_at')\">Created <i :class=\"orderIcon('created_at')\"></i></a></th>\n                    <th><a href=\"#\" @click.prevent=\"sortBy('is_published')\">Published <i :class=\"orderIcon('is_published')\"></i></a></th>\n                    <th class=\"text-centered\"><a>Showing</a></th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr v-for=\"post in posts\n                        | filterBy titleFilter in 'title'\n                        | filterBy categoryFilter in 'category.name'\n                        | orderBy sortKey sortDir\" class=\"Post\" :class=\"{ 'Post--unpublished': !post.is_published }\">\n\n                    <td v-if=\"categoryFilter\" class=\"order\">\n                        <input class=\"post__order\" type=\"number\" value=\"{{ post.order }}\" @keyup.enter=\"blur\" @focusout=\"reorder(post, $event)\" number=\"\">\n                    </td>\n\n                    <td>\n                        <a href=\"#!/posts/{{ post.id }}\" @click.prevent=\"goToPost(post)\">{{ post.title }}</a>\n                        <span v-if=\"post.is_locked\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Locked by {{ userName(post.locked_by_id) }}\"><i class=\"fa fa-lock\"></i></span>\n                    </td>\n\n                    <td>{{ post.category ? post.category.name : '' }}</td>\n\n                    <td>{{ formatTimestamp(post.created_at) }}</td>\n\n                    <td class=\"published\">\n                        <div class=\"switch\">\n                            <input class=\"cmn-toggle cmn-toggle-round-sm\" id=\"is_published_{{post.id}}\" type=\"checkbox\" name=\"is_published\" v-model=\"post.is_published\" @change=\"post.publish()\">\n                            <label for=\"is_published_{{post.id}}\"></label>\n                        </div>\n                    </td>\n\n                    <td class=\"text-centered\">\n                        <span v-if=\"post.isShowing\" class=\"showing\"><i class=\"fa fa-check\"></i></span>\n                        <span v-else=\"\" class=\"not-showing\"><i class=\"fa fa-times\"></i></span>\n                    </td>\n\n                </tr>\n            </tbody>\n        </table>\n\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/posts/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../repositories/categories":105,"../../repositories/posts":106,"../../repositories/users":108,"babel-runtime/helpers/interop-require-default":1,"moment":6,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],87:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            post: { revisions: { data: [] } },
            keys: {
                title: 'Title',
                subtitle: 'Subtitle',
                body: 'Body',
                category_id: 'Category',
                author_id: 'Author',
                show_author: 'Show author',
                start_showing_at: 'Start showing',
                stop_showing_at: 'Stop showing',
                image: 'Image',
                order: 'Order'
            },
            diffKeys: ['body'],
            pagination: { links: {} },
            users: [],
            categories: [],
            authors: [],
            fieldFilter: null
        };
    },

    methods: {

        fetch: function fetch() {
            var self = this;
            return client({
                path: '/posts/' + this.$route.params.post_id + '?include=revisions'
            }).then(function (response) {
                self.post = response.entity.data;
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        fetchUsers: function fetchUsers(successHandler) {
            var self = this;
            return client({
                path: '/users'
            }).then(function (response) {
                self.users = response.entity.data;
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        fetchCategories: function fetchCategories() {
            var self = this;
            return client({
                path: '/categories'
            }).then(function (response) {
                self.categories = response.entity.data;
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        fetchAuthors: function fetchAuthors() {
            var self = this;
            return client({
                path: '/authors'
            }).then(function (response) {
                self.authors = response.entity.data;
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        who: function who(userId) {
            if (!userId || !this.users || !this.users.length) {
                return 'a script';
            }

            var user = this.users.filter(function (user) {
                return user.id == userId;
            })[0];

            return user.name;
        },

        when: function when(timestamp) {
            return _moment2['default'].unix(timestamp).format('h:mm a on MMM D, YYYY');
        },

        shouldDiff: function shouldDiff(key) {
            return !! ~this.diffKeys.indexOf(key);
        },

        what: function what(revision) {
            var what = this.keys[revision.key];

            if (revision.key == 'is_published') {
                return '<strong>' + (revision.new_value > 0 ? 'Published' : 'Unpublished') + '</strong>';
            }
            if (!! ~this.diffKeys.indexOf(revision.key)) {
                return '<strong>' + what + '</strong> was edited';
            }
            if (revision.key == 'category_id') {
                return '<strong>' + what + '</strong> changed to <strong>' + this.categoryName(revision.new_value) + '</strong>';
            }
            if (revision.key == 'author_id') {
                return '<strong>' + what + '</strong> changed to <strong>' + this.authorName(revision.new_value) + '</strong>';
            }
            if (revision.key == 'show_author') {
                return '<strong>' + what + '</strong> changed to <strong>' + (revision.new_value > 0 ? 'Yes' : 'No') + '</strong>';
            }

            return '<strong>' + what + '</strong> changed to <strong>' + revision.new_value + '</strong>';
        },

        categoryName: function categoryName(id) {
            return this.categories.filter(function (category) {
                return id == category.id;
            })[0].name;
        },

        authorName: function authorName(id) {
            return this.authors.filter(function (author) {
                return id == author.id;
            })[0].name;
        }

    },

    computed: {

        currentUserName: function currentUserName() {
            return this.currentUser ? this.currentUser.name : '';
        }

    },

    route: {
        data: function data(transition) {
            this.fetch().then(this.fetchUsers).then(this.fetchCategories).then(this.fetchAuthors).then(transition.next);
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/posts'\">Posts</a></li>\n        <li><a v-link=\"'/posts/'+post.id\">{{ post.title }}</a></li>\n        <li class=\"active\">Revisions</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <div class=\"filters\">\n            <div class=\"row\">\n                <div class=\"col-md-6\">\n                    <select v-model=\"fieldFilter\" id=\"field\" class=\"form-control\">\n                        <option value=\"\" selected=\"\">Filter by field...</option>\n                        <option v-for=\"field in keys\" :value=\"$key\">\n                            {{ field }}\n                        </option>\n                    </select>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">Revision History</div>\n            <div class=\"panel-body\" v-if=\"!post.revisions.data.length > 0\"><h6>No revions</h6></div>\n            <table v-else=\"\" class=\"Revisions table table-hover\">\n                <tbody>\n                <tr v-for=\"revision in post.revisions.data\n                        | filterBy fieldFilter in 'key'\n                        | orderBy 'created_at' -1\" class=\"Revision\">\n                    <td>{{{ what(revision) }}}</td>\n                    <td>at {{ when(revision.created_at) }}</td>\n                    <td>by <em>{{ who(revision.user_id) }}</em></td>\n                    <td class=\"action-button\"><a v-if=\"shouldDiff(revision.key)\" v-link=\"'/posts/'+post.id+'/revisions/'+revision.id\" class=\"btn btn-primary btn-sm\">View</a></td>\n                </tr>\n                </tbody>\n            </table>\n        </div>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/posts/revisions/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"moment":6,"vue":44,"vue-hot-reload-api":42}],88:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _diffMatchPatch = require('diff-match-patch');

var _diffMatchPatch2 = _interopRequireDefault(_diffMatchPatch);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            revision: {},
            post: {},
            viewDiff: false,
            users: []
        };
    },

    computed: {

        content: function content() {
            return this.viewDiff ? this.diff : this.revision.new_value;
        },

        diff: function diff() {
            if (!this.revision) {
                return '';
            }
            var differ = new _diffMatchPatch2['default']();
            var diffs = differ.diff_main(this.revision.old_value || '', this.revision.new_value || '');
            differ.diff_cleanupSemantic(diffs);
            var diff = _he2['default'].decode(differ.diff_prettyHtml(diffs));

            return this.replaceAll(diff, ['<br>', '¶'], '');
        }

    },

    methods: {

        fetch: function fetch() {
            var self = this;
            return client({
                path: '/revisions/' + this.$route.params.revision_id
            }).then(function (response) {
                self.revision = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchPost: function fetchPost() {
            var self = this;
            return client({
                path: '/posts/' + this.$route.params.post_id
            }).then(function (response) {
                self.post = response.entity.data;
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        fetchUsers: function fetchUsers() {
            var self = this;
            return client({
                path: '/users'
            }).then(function (response) {
                self.users = response.entity.data;
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        restore: function restore() {
            if (this.canRestore()) {
                var self = this;
                _sweetalert2['default']({
                    title: 'For reals?',
                    text: 'This will restore the content to this state.',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, restore!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    var entity = {};
                    entity[self.revision.key] = self.revision.new_value;
                    client({
                        method: 'PATCH',
                        path: '/posts/' + self.$route.params.post_id + '/property',
                        entity: entity
                    }).then(function (response) {
                        _sweetalert2['default']({
                            html: true,
                            title: 'Great success!',
                            text: '<strong>' + self.post.title + '</strong> was restored to this state!',
                            type: 'success'
                        }, function () {
                            self.$route.router.go('/posts/' + self.post.id);
                        });
                    }, function (response) {
                        _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                        self.checkResponseStatus(response);
                    });
                });
            } else {
                _sweetalert2['default']("Well, actually...", "There is no difference between this revision and the current state.", "info");
            }
        },

        who: function who(userId) {
            if (!userId || !this.users || !this.users.length) {
                return 'a script';
            }

            var user = this.users.filter(function (user) {
                return user.id == userId;
            })[0];

            return user.name;
        },

        when: function when(timestamp) {
            return _moment2['default'].utc(timestamp, 'X').format('h:mm a on MMM D, YYYY');
        },

        canRestore: function canRestore() {
            return this.post[this.revision.key] != this.revision.new_value;
        },

        replaceAll: function replaceAll(str, find, replace) {
            if (!find instanceof Array) {
                find = [find];
            }

            return find.reduce(function (s, search) {
                return s.replace(new RegExp(search, 'g'), replace);
            }, str);
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        }

    },

    route: {
        data: function data(transition) {
            this.fetch().then(this.fetchPost).then(this.fetchUsers).then(transition.next);
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a v-link=\"'/home'\">Home</a></li>\n        <li><a v-link=\"'/posts'\">Posts</a></li>\n        <li><a v-link=\"'/posts/'+post.id\">{{ post.title }}</a></li>\n        <li><a v-link=\"'/posts/'+post.id+'/revisions'\">Revisions</a></li>\n        <li class=\"active\">{{ revision.id }}</li>\n    </ol>\n\n    <div v-if=\"$loadingRouteData\" class=\"content-loading\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n    <div v-if=\"!$loadingRouteData\">\n\n        <div class=\"Revision panel panel-default\">\n            <div class=\"panel-heading\">\n                <div class=\"row\">\n                <div class=\"col-md-6\">\n                    <strong>{{ who(revision.user_id) }}</strong> — <em>{{ when(revision.created_at) }}</em>\n                </div>\n                <div class=\"col-md-6 clearfix\">\n                    <div class=\"view-buttons\">\n                        <button class=\"btn btn-sm\" :class=\"{ 'active': !viewDiff }\" @click.prevent=\"viewDiff = false\">Content</button>\n                        <button class=\"btn btn-sm\" :class=\"{ 'active': viewDiff }\" @click.prevent=\"viewDiff = true\">Changes</button>\n                    </div>\n                </div>\n                </div>\n            </div>\n            <div class=\"panel-body\">{{{ content }}}</div>\n            <div class=\"panel-footer\">\n                <button class=\"btn btn-warning\" :class=\"{ 'disabled': !canRestore() }\" @click.prevent=\"restore\">\n                    <i class=\"fa fa-repeat\"></i> Restore this revision\n                </button>\n            </div>\n        </div>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/posts/revisions/show.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"diff-match-patch":2,"he":4,"moment":6,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],89:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _modelsTag = require('../../models/tag');

var _modelsTag2 = _interopRequireDefault(_modelsTag);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            tag: {
                name: '',
                description: ''
            }
        };
    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            _modelsTag2['default'].create(this.tag).then(function (response) {
                self.$route.router.go('/tags');
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/tags'\">Tags</a></li>\n        <li class=\"active\">Create</li>\n    </ol>\n\n    <form class=\"Tag\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-success\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button v-link=\"'/tags'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Cancel</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">Tag</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"tag.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"description\">Description</label>\n                    <input type=\"text\" v-model=\"tag.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                </div>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/tags/create.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../models/tag":104,"babel-runtime/helpers/interop-require-default":1,"vue":44,"vue-hot-reload-api":42}],90:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _repositoriesTags = require('../../repositories/tags');

var _repositoriesTags2 = _interopRequireDefault(_repositoriesTags);

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            tag: {
                id: '',
                name: '',
                description: ''
            }
        };
    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            this.tag.save().then(function (response) {
                self.notify('success', 'Saved successfully.');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        'delete': function _delete() {
            var self = this;
            _sweetalert2['default']({
                title: 'Are you sure?',
                text: 'You will not be able to recover this tag!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                self.tag.destroy().then(function () {
                    _sweetalert2['default']({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.tag.name + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.deleted = true;
                        self.$route.router.go('/tags');
                    });
                }, function () {
                    _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        }

    },

    route: {
        data: function data(transition) {
            return {
                tag: _repositoriesTags2['default'].getById(transition.to.params.tag_id)
            };
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/tags'\">Tags</a></li>\n        <li class=\"active\">{{ tag.name }}</li>\n    </ol>\n\n    <form class=\"Tag EditForm\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button @click.prevent=\"delete\" class=\"btn btn-danger\"><i class=\"fa fa-trash\"></i> Delete</button>\n                    <button v-link=\"'/tags'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Close</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">Tag</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"tag.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"description\">Description</label>\n                    <input type=\"text\" v-model=\"tag.description\" name=\"description\" id=\"description\" class=\"form-control\">\n                </div>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/tags/edit.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../repositories/tags":107,"babel-runtime/helpers/interop-require-default":1,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],91:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _repositoriesTags = require('../../repositories/tags');

var _repositoriesTags2 = _interopRequireDefault(_repositoriesTags);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            tags: [],
            pagination: { links: {} },
            nameFilter: null,
            sortKey: null,
            sortDir: -1
        };
    },

    methods: {

        sortBy: function sortBy(key) {
            if (this.sortKey == key) {
                this.sortDir = this.sortDir * -1;
            } else {
                this.sortKey = key;
                this.sortDir = 1;
            }
        },

        orderIcon: function orderIcon(key) {
            if (key == this.sortKey) {
                return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
            }

            return 'fa fa-unsorted';
        }

    },

    route: {
        data: function data(transition) {
            return {
                tags: _repositoriesTags2['default'].get()
            };
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li class=\"active\">Tags</li>\n    </ol>\n\n    <div class=\"filters\">\n        <div class=\"row\">\n            <div class=\"col-md-6\">\n                <input type=\"text\" v-model=\"nameFilter\" placeholder=\"Filter by name...\" class=\"form-control\">\n            </div>\n            <div class=\"create-button col-md-6\">\n                <button v-link=\"'/tags/create'\" class=\"btn btn-success\"><i class=\"fa fa-plus\"></i> Add new</button>\n            </div>\n        </div>\n    </div>\n\n    <table class=\"Tags table table-striped table-hover\">\n        <thead>\n            <tr>\n                <th><a href=\"#\" @click.prevent=\"sortBy('name')\">Name <i :class=\"orderIcon('name')\"></i></a></th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr v-for=\"tag in tags | filterBy nameFilter | orderBy sortKey sortDir\" class=\"Tag\">\n                <td><a v-link=\"'/tags/'+tag.id\">{{ tag.name }}</a></td>\n            </tr>\n        </tbody>\n    </table>\n\n    <paginator :pagination=\"pagination\"></paginator>\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/tags/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"../../repositories/tags":107,"babel-runtime/helpers/interop-require-default":1,"vue":44,"vue-hot-reload-api":42}],92:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            user: {
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            }
        };
    },

    methods: {

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            client({
                method: 'POST',
                path: '/users',
                entity: this.user
            }).then(function (response) {
                self.$route.router.go('/users');
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        }

    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/users'\">Users</a></li>\n        <li class=\"active\">Create</li>\n    </ol>\n\n    <form class=\"User\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-success\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button v-link=\"'/users'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Cancel</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">User</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"user.name\" name=\"name\" id=\"name\" class=\"form-control\" required=\"\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"email\">Email</label>\n                    <input type=\"text\" v-model=\"user.email\" name=\"email\" id=\"email\" class=\"form-control\" required=\"\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"password\">Password</label>\n                    <input type=\"password\" v-model=\"user.password\" name=\"password\" id=\"password\" class=\"form-control\" required=\"\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"password_confirmation\">Confirm password</label>\n                    <input type=\"password\" v-model=\"user.password_confirmation\" name=\"password_confirmation\" id=\"password_confirmation\" class=\"form-control\" required=\"\">\n                </div>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/users/create.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],93:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _sweetalert = require('sweetalert');

var _sweetalert2 = _interopRequireDefault(_sweetalert);

exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            user: {
                id: '',
                name: '',
                email: ''
            }
        };
    },

    methods: {

        fetch: function fetch(successHandler) {
            var self = this;
            client({
                path: '/users/' + this.$route.params.user_id
            }).then(function (response) {
                self.user = response.entity.data;
                successHandler(self.user);
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        /**
         * Save the post.
         */
        save: function save() {
            var self = this;
            console.log(this.user);
            client({
                method: 'PUT',
                path: '/users/' + this.user.id,
                entity: this.user
            }).then(function (response) {
                self.notify('success', 'Saved successfully.');
            }, function (response) {
                self.checkResponseStatus(response);
            });
        },

        'delete': function _delete() {
            var self = this;
            _sweetalert2['default']({
                title: 'Are you sure?',
                text: 'You will not be able to recover this user!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, say good-bye!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                client({
                    method: 'DELETE',
                    path: '/users/' + self.user.id
                }).then(function () {
                    _sweetalert2['default']({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.user.name + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.deleted = true;
                        self.$route.router.go('/users');
                    });
                }, function () {
                    _sweetalert2['default']("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        passwordReset: function passwordReset() {
            _sweetalert2['default']({
                title: 'Heads up!',
                text: 'This will email a unique password reset link to this user that will expire in <b>one hour</b>.',
                type: 'info',
                showCancelButton: true,
                confirmButtonText: 'Send link',
                closeOnConfirm: false,
                showLoaderOnConfirm: true,
                html: true
            }, (function () {
                var data = {
                    email: this.user.email,
                    _token: document.getElementById('csrf').getAttribute('content')
                };
                $.post('/admin/password/email', data, function (response) {
                    _sweetalert2['default']("Sent!", "The password reset link has been emailed!", "success");
                });
            }).bind(this));
        },

        notify: function notify(type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        },

        checkResponseStatus: function checkResponseStatus(response) {
            if (response.status.code == 401 || response.status.code == 500) {
                this.$dispatch('userHasLoggedOut');
            }
        }

    },

    route: {
        data: function data(transition) {
            this.fetch((function (user) {
                transition.next({ user: user });
            }).bind(this));
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li><a v-link=\"'/users'\">Users</a></li>\n        <li class=\"active\">{{ user.name }}</li>\n    </ol>\n\n    <form class=\"User EditForm\">\n\n        <section class=\"info row\">\n            <div class=\"col-md-6 col-md-offset-6 clearfix\">\n                <div class=\"action-buttons\">\n                    <button @click.prevent=\"save\" class=\"btn btn-primary\"><i class=\"fa fa-save\"></i> Save</button>\n                    <button @click.prevent=\"delete\" class=\"btn btn-danger\"><i class=\"fa fa-trash\"></i> Delete</button>\n                    <button v-link=\"'/users'\" class=\"btn btn-default\"><i class=\"fa fa-close\"></i> Close</button>\n                </div>\n            </div>\n        </section>\n\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">User</div>\n            <div class=\"panel-body\">\n                <div class=\"form-group\">\n                    <label for=\"name\">Name</label>\n                    <input type=\"text\" v-model=\"user.name\" name=\"name\" id=\"name\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"email\">Email</label>\n                    <input type=\"text\" v-model=\"user.email\" name=\"email\" id=\"email\" class=\"form-control\">\n                </div>\n            </div>\n            <div class=\"panel-footer\">\n                <a href=\"#\" class=\"btn btn-default\" @click.prevent=\"passwordReset\"><i class=\"fa fa-envelope\"></i> Send password reset</a>\n            </div>\n        </div>\n    </form>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/users/edit.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"babel-runtime/helpers/interop-require-default":1,"sweetalert":41,"vue":44,"vue-hot-reload-api":42}],94:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {

    props: ['current-user'],

    data: function data() {
        return {
            users: [],
            pagination: { links: {} },
            nameFilter: null,
            sortKey: null,
            sortDir: -1
        };
    },

    methods: {

        fetch: function fetch(successHandler) {
            var self = this;
            client({
                path: '/users'
            }).then(function (response) {
                self.users = response.entity.data;
                self.pagination = response.entity.meta.pagination;
                successHandler(response.entity.data);
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut');
                }
            });
        },

        sortBy: function sortBy(key) {
            if (this.sortKey == key) {
                this.sortDir = this.sortDir * -1;
            } else {
                this.sortKey = key;
                this.sortDir = 1;
            }
        },

        orderIcon: function orderIcon(key) {
            if (key == this.sortKey) {
                return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
            }

            return 'fa fa-unsorted';
        }

    },

    route: {
        data: function data(transition) {
            this.fetch(function (data) {
                transition.next({ users: data });
            });
        }
    }

};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <ol class=\"breadcrumb\">\n        <li><a href=\"#\">Home</a></li>\n        <li class=\"active\">Users</li>\n    </ol>\n\n    <div class=\"filters\">\n        <div class=\"row\">\n            <div class=\"col-md-6\">\n                <input type=\"text\" v-model=\"nameFilter\" placeholder=\"Filter by name...\" class=\"form-control\">\n            </div>\n            <div class=\"create-button col-md-6\">\n                <button v-link=\"'/users/create'\" class=\"btn btn-success\"><i class=\"fa fa-plus\"></i> Add new</button>\n            </div>\n        </div>\n    </div>\n\n    <table class=\"Users table table-striped table-hover\">\n        <thead>\n            <tr>\n                <th><a href=\"#\" @click.prevent=\"sortBy('name')\">Name <i :class=\"orderIcon('name')\"></i></a></th>\n                <th><a href=\"#\" @click.prevent=\"sortBy('email')\">Email <i :class=\"orderIcon('email')\"></i></a></th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr v-for=\"user in users | filterBy nameFilter | orderBy sortKey sortDir\" class=\"User\">\n                <td><a v-link=\"'/users/'+user.id\">{{ user.name }}</a></td>\n                <td>{{ user.email }}</td>\n            </tr>\n        </tbody>\n    </table>\n\n    <paginator :pagination=\"pagination\"></paginator>\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/ryanwinchester/Code/flashtag/flashtag/app/Admin/resources/assets/js/components/users/index.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":44,"vue-hot-reload-api":42}],95:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    twoWay: true,

    bind: function bind() {
        this.vm.$nextTick(this.setupEditor.bind(this));
    },

    setupEditor: function setupEditor() {
        var self = this;
        CKEDITOR.replace(this.el.id);
        CKEDITOR.instances[this.el.id].on('change', function () {
            self.set(CKEDITOR.instances[self.el.id].getData());
        });
    },

    update: function update(value) {
        value = value || ' ';
        if (!CKEDITOR.instances[this.el.id]) {
            return this.vm.$nextTick(this.update.bind(this, value));
        }
        CKEDITOR.instances[this.el.id].setData(value);
    },

    unbind: function unbind() {
        CKEDITOR.instances[this.el.id].destroy();
    }

};
module.exports = exports['default'];

},{}],96:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    twoWay: true,

    params: ['options'],

    bind: function bind() {
        var self = this;
        $(this.el).select2({
            data: this.params.options
        }).on('change', function () {
            self.set($(this).val());
        });
    },

    update: function update(value) {
        $(this.el).val(value).trigger('change');
    },

    unbind: function unbind() {
        $(this.el).off().select2('destroy');
    }

};
module.exports = exports['default'];

},{}],97:[function(require,module,exports){
'use strict';

var rest = require('rest');

module.exports = getWrappedClient(rest);

function getWrappedClient(rest) {
    var pathPrefix = require('rest/interceptor/pathPrefix');
    var mime = require('rest/interceptor/mime');
    var defaultRequest = require('rest/interceptor/defaultRequest');
    var errorCode = require('rest/interceptor/errorCode');
    var interceptor = require('rest/interceptor');
    var jwtAuth = require('./interceptors/jwtAuth');

    var defaultHeaders = {
        'X-Requested-With': 'rest.js',
        'Content-Type': 'application/json'
    };

    return rest.wrap(pathPrefix, { prefix: '/api' }).wrap(mime).wrap(defaultRequest, { headers: defaultHeaders }).wrap(errorCode, { code: 400 }).wrap(jwtAuth);
}

},{"./interceptors/jwtAuth":98,"rest":9,"rest/interceptor":13,"rest/interceptor/defaultRequest":14,"rest/interceptor/errorCode":15,"rest/interceptor/mime":16,"rest/interceptor/pathPrefix":17}],98:[function(require,module,exports){
'use strict';

var Cookies = require('js-cookie');

(function (define) {
    'use strict';

    define(function (require) {

        var interceptor = require('rest/interceptor');

        /**
         * Authenticates the request using JWT Authentication
         *
         * @param {Client} [client] client to wrap
         * @param {Object} config
         *
         * @returns {Client}
         */
        return interceptor({
            request: function request(_request, config) {
                var token = Cookies.get('jwt-token');
                var headers = _request.headers || (_request.headers = {});

                if (token !== null && token !== 'undefined') {
                    headers.Authorization = token;
                }

                return _request;
            },
            response: function response(_response) {
                if (_response.status && _response.status.code == 401) {
                    Cookies.remove('jwt-token');
                }
                if (_response.headers && _response.headers.Authorization) {
                    Cookies.set('jwt-token', _response.headers.Authorization, { expires: 7, path: '' });
                }
                if (_response.entity && _response.entity.token && _response.entity.token.length > 10) {
                    Cookies.set('jwt-token', 'Bearer ' + _response.entity.token, { expires: 7, path: '' });
                }

                return _response;
            }
        });
    });
})(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

},{"js-cookie":5,"rest/interceptor":13}],99:[function(require,module,exports){
'use strict';

var _routes = require('./routes');

var VueRouter = require('vue-router');

module.exports = getRouter();

function getRouter() {
    var router = new VueRouter();
    (0, _routes.mapRoutes)(router);

    router.beforeEach(function () {
        window.scrollTo(0, 0);
    });

    return router;
}

},{"./routes":100,"vue-router":43}],100:[function(require,module,exports){
'use strict';

module.exports = {

    mapRoutes: function mapRoutes(router) {

        router.map({

            '/home': { component: require('../components/home.vue') },

            // POSTS
            '/posts': { component: require('../components/posts/index.vue') },
            '/posts/create': { component: require('../components/posts/create.vue') },
            '/posts/:post_id': { component: require('../components/posts/edit.vue') },
            '/posts/:post_id/revisions': { component: require('../components/posts/revisions/index.vue') },
            '/posts/:post_id/revisions/:revision_id': { component: require('../components/posts/revisions/show.vue') },

            // POST FIELDS
            '/post-fields': { component: require('../components/post-fields/index.vue') },
            '/post-fields/create': { component: require('../components/post-fields/create.vue') },
            '/post-fields/:field_id': { component: require('../components/post-fields/edit.vue') },

            // CATEGORIES
            '/categories': { component: require('../components/categories/index.vue') },
            '/categories/create': { component: require('../components/categories/create.vue') },
            '/categories/:category_id': { component: require('../components/categories/edit.vue') },

            // TAGS
            '/tags': { component: require('../components/tags/index.vue') },
            '/tags/create': { component: require('../components/tags/create.vue') },
            '/tags/:tag_id': { component: require('../components/tags/edit.vue') },

            // AUTHORS
            '/authors': { component: require('../components/authors/index.vue') },
            '/authors/create': { component: require('../components/authors/create.vue') },
            '/authors/:author_id': { component: require('../components/authors/edit.vue') },

            // USERS
            '/users': { component: require('../components/users/index.vue') },
            '/users/create': { component: require('../components/users/create.vue') },
            '/users/:user_id': { component: require('../components/users/edit.vue') }

        });

        router.redirect({
            '/': '/home'
        });
    }

};

},{"../components/authors/create.vue":66,"../components/authors/edit.vue":67,"../components/authors/index.vue":68,"../components/categories/create.vue":70,"../components/categories/edit.vue":71,"../components/categories/index.vue":72,"../components/home.vue":73,"../components/post-fields/create.vue":79,"../components/post-fields/edit.vue":80,"../components/post-fields/index.vue":81,"../components/posts/create.vue":84,"../components/posts/edit.vue":85,"../components/posts/index.vue":86,"../components/posts/revisions/index.vue":87,"../components/posts/revisions/show.vue":88,"../components/tags/create.vue":89,"../components/tags/edit.vue":90,"../components/tags/index.vue":91,"../components/users/create.vue":92,"../components/users/edit.vue":93,"../components/users/index.vue":94}],101:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var Category = (function (_Model) {
    _inherits(Category, _Model);

    function Category(data) {
        _classCallCheck(this, Category);

        _get(Object.getPrototypeOf(Category.prototype), 'constructor', this).call(this, 'categories', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            parent_id: data.parent_id > 0 ? data.parent_id : null,
            order_by: data.order_by,
            order_dir: data.order_dir,
            parent: data.parent,
            posts: data.posts ? data.posts.data : [],
            tags: data.tags ? data.tags.data : [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }

    return Category;
})(_model2['default']);

exports['default'] = Category;
module.exports = exports['default'];

},{"./model":102}],102:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Model = (function () {
    function Model(resourcePath, attributes) {
        _classCallCheck(this, Model);

        this.resourcePath = resourcePath;
        this.attributes = attributes;
        this._createGettersAndSetters();
    }

    _createClass(Model, [{
        key: 'save',
        value: function save() {
            return client({
                method: 'PUT',
                path: '/' + this.resourcePath + '/' + this.attributes['id'],
                entity: this.attributes
            });
        }
    }, {
        key: 'update',
        value: function update(attributes) {
            return client({
                method: 'PATCH',
                path: '/' + this.resourcePath + '/' + this.attributes['id'],
                entity: attributes
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            return client({
                method: 'DELETE',
                path: '/' + this.resourcePath + '/' + this.attributes['id']
            });
        }
    }, {
        key: '_createGettersAndSetters',
        value: function _createGettersAndSetters() {
            var _this = this;

            var _loop = function (prop) {
                if (_this.attributes.hasOwnProperty(prop)) {
                    Object.defineProperty(_this, prop, {
                        get: function get() {
                            return this.attributes[prop];
                        },
                        set: function set(value) {
                            this.attributes[prop] = value;
                        }
                    });
                }
            };

            for (var prop in this.attributes) {
                _loop(prop);
            }
        }
    }], [{
        key: 'create',
        value: function create(attributes) {
            var model = new this(attributes);

            return client({
                method: 'POST',
                path: '/' + model.resourcePath,
                entity: model.attributes
            });
        }
    }]);

    return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];

},{}],103:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var Post = (function (_Model) {
    _inherits(Post, _Model);

    function Post(data) {
        _classCallCheck(this, Post);

        _get(Object.getPrototypeOf(Post.prototype), 'constructor', this).call(this, 'posts', {
            id: data.id,
            title: data.title,
            category_id: data.category_id,
            slug: data.slug,
            body: data.body,
            is_published: data.is_published,
            start_showing_at: data.start_showing_at,
            stop_showing_at: data.stop_showing_at,
            order: data.order,
            is_locked: data.is_locked,
            locked_by_id: data.locked_by_id,
            category: data.category ? data.category.data : {},
            tags: data.tags ? data.tags.data : [],
            fields: data.fields ? data.fields.data : [],
            revisions: data.revisions ? data.revisions.data : [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }

    _createClass(Post, [{
        key: 'publish',
        value: function publish(user_id) {
            return client({
                method: 'PATCH',
                path: '/posts/' + this.attributes['id'] + '/publish',
                entity: {
                    is_published: this.attributes['is_published'],
                    user_id: user_id
                }
            });
        }
    }, {
        key: 'isShowing',
        get: function get() {
            if (!this.attributes['is_published']) {
                return false;
            }

            var start = !!this.attributes['start_showing_at'] ? (0, _moment2['default'])(this.attributes['start_showing_at'], "YYYY-MM-DD HH:mm:ss") : (0, _moment2['default'])("1980-01-01", "YYYY-MM-DD");
            var stop = !!this.attributes['stop_showing_at'] ? (0, _moment2['default'])(this.attributes['stop_showing_at'], "YYYY-MM-DD HH:mm:ss") : (0, _moment2['default'])("2033-01-19", "YYYY-MM-DD");
            var now = (0, _moment2['default'])();

            return start <= now && now <= stop;
        }
    }]);

    return Post;
})(_model2['default']);

exports['default'] = Post;
module.exports = exports['default'];

},{"./model":102,"moment":6}],104:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var Tag = (function (_Model) {
    _inherits(Tag, _Model);

    function Tag(data) {
        _classCallCheck(this, Tag);

        _get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).call(this, 'tags', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            posts: data.posts || [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }

    return Tag;
})(_model2['default']);

exports['default'] = Tag;
module.exports = exports['default'];

},{"./model":102}],105:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsCategory = require('../models/category');

var _modelsCategory2 = _interopRequireDefault(_modelsCategory);

exports['default'] = {

    get: function get() {
        return client({
            path: '/categories' + (this.includes || '')
        }).entity().then(function (entity) {
            return entity.data.map(function (category) {
                return new _modelsCategory2['default'](category);
            });
        });
    },

    getById: function getById(id) {
        return client({
            path: '/categories/' + id + (this.includes || '')
        }).entity().then(function (entity) {
            return new _modelsCategory2['default'](entity.data);
        });
    },

    'with': function _with() {
        for (var _len = arguments.length, includes = Array(_len), _key = 0; _key < _len; _key++) {
            includes[_key] = arguments[_key];
        }

        this.includes = includes ? '?include=' + includes.join() : '';

        return this;
    }
};
module.exports = exports['default'];

},{"../models/category":101}],106:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsPost = require('../models/post');

var _modelsPost2 = _interopRequireDefault(_modelsPost);

exports['default'] = {

    get: function get() {
        return client({
            path: '/posts',
            params: this.params()
        }).entity().then(function (entity) {
            return entity.data.map(function (post) {
                return new _modelsPost2['default'](post);
            });
        });
    },

    getById: function getById(id) {
        return client({
            path: '/posts/' + id,
            params: this.params()
        }).entity().then(function (entity) {
            return new _modelsPost2['default'](entity.data);
        });
    },

    params: function params() {
        var params = {};
        if (this.includes) {
            params.include = this.includes;
        }
        if (this.orderBy) {
            params.orderBy = this.orderBy;
        }
        return params;
    },

    'with': function _with() {
        for (var _len = arguments.length, includes = Array(_len), _key = 0; _key < _len; _key++) {
            includes[_key] = arguments[_key];
        }

        this.includes = includes ? includes.join() : '';

        return this;
    },

    orderBy: function orderBy(key, dir) {
        dir = dir ? '|' + dir : '|asc';
        this.orderBy = key ? key + dir : '';

        return this;
    }
};
module.exports = exports['default'];

},{"../models/post":103}],107:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsTag = require('../models/tag');

var _modelsTag2 = _interopRequireDefault(_modelsTag);

exports['default'] = {

    get: function get() {
        return client({
            path: '/tags' + (this.includes || '')
        }).entity().then(function (entity) {
            return entity.data.map(function (tag) {
                return new _modelsTag2['default'](tag);
            });
        });
    },

    getById: function getById(id) {
        return client({
            path: '/tags/' + id + (this.includes || '')
        }).entity().then(function (entity) {
            return new _modelsTag2['default'](entity.data);
        });
    },

    'with': function _with() {
        for (var _len = arguments.length, includes = Array(_len), _key = 0; _key < _len; _key++) {
            includes[_key] = arguments[_key];
        }

        this.includes = includes ? '?include=' + includes.join : '';

        return this;
    }
};
module.exports = exports['default'];

},{"../models/tag":104}],108:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsPost = require('../models/post');

var _modelsPost2 = _interopRequireDefault(_modelsPost);

exports['default'] = {

    get: function get() {
        return client({
            path: '/users' + (this.includes || '')
        }).entity().then(function (entity) {
            return entity.data.map(function (user) {
                return new _modelsPost2['default'](user);
            });
        });
    },

    getById: function getById(id) {
        return client({
            path: '/users/' + id + (this.includes || '')
        }).entity().then(function (entity) {
            return new _modelsPost2['default'](entity.data);
        });
    },

    'with': function _with() {
        for (var _len = arguments.length, includes = Array(_len), _key = 0; _key < _len; _key++) {
            includes[_key] = arguments[_key];
        }

        this.includes = includes ? '?include=' + includes.join() : '';

        return this;
    }
};
module.exports = exports['default'];

},{"../models/post":103}]},{},[65]);

//# sourceMappingURL=admin.js.map
