 /**
 *
 * @source: s2sc.js
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2014  Richard Louie Orilla
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

var s2sc =  {

	map: null,
	symbol: null,

	clear: function() {

		s2sc.map = null;
		s2sc.symbol = null;
	},

    convert: function(originalLanguage, targetLanguage, data) {

		s2sc.clear();
		dictionary.python.initialize();
		dictionary.c.initialize();

		s2sc.map = tokenizer.python.tokenize(data);
		s2sc.symbol = [];

		for (var i = 0; i < s2sc.map.length; i++) {

			var result = "";

			if (s2sc.map[i].length != 0) {
				result = parser.parse(s2sc.map[i]);
			}
			else {
				result.symbol = "<ignore>";
				result.valid = true;
			}

			result.symbol = result.symbol !== "" ? result.symbol : "<parse_error>";
			s2sc.symbol.push(result.symbol);
		}

		return generator.generateCode(originalLanguage, targetLanguage, new ParseData(s2sc.map, s2sc.symbol));
    },

    language: {

		c: "C-language",
		python: "Python-language"
    },

    parser: {

        initialize: false
    }
}


