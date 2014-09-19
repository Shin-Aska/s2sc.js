/**
 *
 * @source: s2sc.js
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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

		if (generator.options.useDoubleInsteadOfFloat) {
			generator.enums.c.data.type.float = "double";
		}

		if (originalLanguage == s2sc.language.c || targetLanguage == s2sc.language.c) {
			dictionary.c.initialize();
		}

		if (originalLanguage == s2sc.language.python || targetLanguage == s2sc.language.python) {
			dictionary.python.initialize();
		}

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


