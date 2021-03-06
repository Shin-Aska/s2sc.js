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
	process: false,

	clear: function() {

		s2sc.map = null;
		s2sc.symbol = null;
	},

    convert: function(originalLanguage, targetLanguage, data) {

		var count = 2;
		var result = "";
		s2sc.default.targetLanguage = targetLanguage;
		s2sc.default.originalLanguage = originalLanguage;

		try {
			do {

				if (generator.reparse) {
					generator.reparseCount++;
				}

				s2sc.clear();
				tokenizer.reset();
				errorHandler.clear();
				dictionary.pages.clear();

				if (generator.options.useDoubleInsteadOfFloat) {
					generator.enums.c.data.type.float = "double";
				}

				if (originalLanguage == s2sc.language.c || targetLanguage == s2sc.language.c) {
					dictionary.c.initialize();
				}

				if (originalLanguage == s2sc.language.python2 || targetLanguage == s2sc.language.python2) {
					dictionary.python.initialize();
				}

				s2sc.map = null;
				s2sc.symbol = [];

				if (originalLanguage == s2sc.language.python2 || s2sc.language.python3) {
					s2sc.map = tokenizer.python.tokenize(data);
				}

				for (var i = 0; i < s2sc.map.length; i++) {

					var result = "";

					if (s2sc.map[i].length != 0) {
						result = parser.parse(s2sc.map[i], originalLanguage);
					}
					else {
						result.symbol = "<ignore>";
						result.valid = true;
					}

					result.symbol = result.symbol !== "" ? result.symbol : "<parse_error>";
					s2sc.symbol.push(result.symbol);
				}

				result = generator.generateCode(originalLanguage, targetLanguage, new ParseData(s2sc.map, s2sc.symbol));
				count -= 1;
			} while (generator.reparse && count > 0);

			generator.reparse = false;
			generator.reparseCount = 0;
		}
		catch (exception) {

			s2sc.default.targetLanguage = "";
			s2sc.default.originalLanguage = "";
			throw exception;
		}

		s2sc.default.targetLanguage = "";
		s2sc.default.originalLanguage = "";
		s2sc.process = true;
		return result;
    },

    default: {

    	targetLanguage: "",
    	originalLanguage: ""
    },

    list: {

    	variables: function() {

    		if (!s2sc.process) {
    			return;
    		}

    		var global = new Array();
    		var reference = generator.refactor.variableList;
    		for (var i = 0; i < reference.length; i++) {
    			if (!reference[i].temporary) {
    				global.push(reference[i]);
    			}
    		}

    		return global;
    	},

    	functions: function() {

    		if (!s2sc.process) {
    			return;
    		}

    		var functionList = generator.refactor.functionList.slice();
    		return functionList;
    	}
    },

    language: {

		c: "C-language",
		python2: "Python-language",
		python3: "Python3-language"
    },

    parser: {

        initialize: false
    }
}


