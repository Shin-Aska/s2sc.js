/**
 *
 * @source: dictionary.js
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

function Candidate (Cname, Cindex, Cmatches) {

	this.name = Cname;
	this.index = Cindex;
	this.matchCount = Cmatches;
}

function Word (Wname, Wdefinition, Wkeyword, Wtype) {

	this.name = Wname;
	this.function = Wdefinition;
	this.tags = Wkeyword;
	this.returnType = Wtype;
}

function Keyword () {

	this.condition = [];
}

var dictionary = {

	search: {

		list: {

			byTypeAndCount: function (list, returnType, matchCount) {

				var candidate;
				for (var i = 0; i < list.length; i++) {
					if (list[i].matchCount == matchCount) {
						if (dictionary.pages.word[list[i].index].returnType == returnType) {
							candidate = dictionary.pages.word[list[i].index];
							break;
						}
					}
				}
				return candidate;
			}
		},

		equivalentWord: function (targetLanguage, targetFunction) {

			var keywordList = [];
			var candidate = null;
			var tags = targetFunction.tags;
			var list = dictionary.pages.findWordsByKeywords(new Array(targetLanguage));
			//alert(targetFunction.name);

			for (var i = 0; i < tags.length; i++) {

				var currentKeyword = tags[i].split("-");
				var keyword = new Keyword();
				var conditionBuffer = "";
				for (var j = 0; j < currentKeyword.length; j++) {

					if (trimString(currentKeyword[j]) != "" ) {

						if (trimString(currentKeyword[j]) != "or") {

							conditionBuffer += currentKeyword[j];
							if (j + 1 != currentKeyword.length) {
								conditionBuffer += "-";
							}
							else {

								if (conditionBuffer.search("-language") == -1) {
									keyword.condition.push(conditionBuffer);
								}

								if (conditionBuffer == "integer" || conditionBuffer == "float" || conditionBuffer == "string") {
									keyword.condition.push(conditionBuffer + "only");

								}
							}
						}
						else {

							keyword.condition.push(conditionBuffer.slice(0, -1));
							if (conditionBuffer.slice(0, -1) == "integer" || conditionBuffer.slice(0, -1) == "float" || conditionBuffer.slice(0, -1) == "string") {
								keyword.condition.push(conditionBuffer + "only");
							}
							conditionBuffer = "";
						}
					}

				}
				keywordList.push(keyword);
			}

			var candidateWordIndex = -1;
			var candidateTagMatches = 0;
			var tmpTagMatches = 0;

			for (var i = 0; i < list.length; i++) {

				var currentTags = dictionary.pages.word[list[i].index].tags;
				tmpTagMatches = 0;

				for (var j = 0; j < keywordList.length; j++) {

					for (var k = 0; k < keywordList[j].condition.length; k++) {

						for (var l = 0; l < currentTags.length; l++) {

							if (currentTags[l] == keywordList[j].condition[k]) {

								tmpTagMatches++;
							}
						}
					}
				}

				if (candidateWordIndex != list[i].index && candidateTagMatches < tmpTagMatches) {
					candidateWordIndex = list[i].index;
					candidateTagMatches = tmpTagMatches;
				}
			}

			if (candidateWordIndex != -1) {
				return dictionary.pages.word[candidateWordIndex];
			}

			throw "No equivalent found exception";
		}
	},

	pages: {

		word: Array(),

		addWord: function(currentWord) {

			dictionary.pages.word.push(currentWord);
		},

		findIndexOfWord: function(name, language) {

			var list = dictionary.pages.findWordsByKeywords(new Array(language));
			for (var i = 0; i < list.length; i++) {
				if (dictionary.pages.word[list[i].index].name == name) {
					return list[i].index;
				}
			}

			return -1;
		},

		findWord: function(name, language) {

			var index = dictionary.pages.findIndexOfWord(name, language);
			if (index != -1) {
				return dictionary.pages.word[index];
			}

			throw "Cannot find word on dictionary";
		},

		findWordsByKeywords: function(tags) {

			var list = [];

			for (var i = 0; i < dictionary.pages.word.length; i++) {

				var keywords = dictionary.pages.word[i].tags;
				var candidate = new Candidate(dictionary.pages.word[i].name, i, 0);
				for (var j = 0; j < tags.length; j++) {

					for (var k = 0; k < keywords.length; k++) {

						if (tags[j] == keywords[k]) {
							candidate.matchCount++;
							break;
						}
					}
				}

				if (candidate.matchCount > 0) {
					list.push(candidate);
				}
			}

			return list;
		}
	},

	c: {

	    initialized: false,
		initialize: function () {

            if (dictionary.c.initialized) {
                return;
            }
            else {
                dictionary.c.initialized = true;
            }

			if (generator.options.useDoubleInsteadOfFloat) {
				dictionary.pages.addWord(new Word(
					"toDouble_str", function(value) {

						generator.includer.function.parser.float.string();
						return this.name + "(" + value + ")";
					}
				, new Array("string-only", "data-type-conversion", "C-language"), generator.enums.c.data.type.float));
			}
			else {
				dictionary.pages.addWord(new Word(
					"toFloat_str", function(value) {

						generator.includer.function.parser.float.string();
						return this.name + "(" + value + ")";
					}
				, new Array("string-only", "data-type-conversion", "C-language"), generator.enums.c.data.type.float));
			}


			dictionary.pages.addWord(new Word(
				"toInteger_str", function(value) {

					generator.includer.function.parser.integer.string();
					return this.name + "(" + value + ")";
				}
			, new Array("string-only", "data-type-conversion", "C-language"), generator.enums.c.data.type.integer));

			if (generator.options.useDoubleInsteadOfFloat) {

				dictionary.pages.addWord(new Word(
					"toString_double", function(value) {

						generator.includer.function.parser.string.float();
						return this.name + "(" + value + ")";
					}
				, new Array("float-only", "data-type-conversion", "C-language"), generator.enums.c.data.type.string));
			}
			else {

				dictionary.pages.addWord(new Word(
					"toString_float", function(value) {

						generator.includer.function.parser.string.float();
						return this.name + "(" + value + ")";
					}
				, new Array("float-only", "data-type-conversion", "C-language"), generator.enums.c.data.type.string));
			}

			dictionary.pages.addWord(new Word(
				"toString_int", function(value) {

					generator.includer.function.parser.string.integer();
					return this.name + "(" + value + ")";
				}
			, new Array("integer-only", "data-type-conversion", "C-language"), generator.enums.c.data.type.string));

			dictionary.pages.addWord(new Word(
				"strConcat", function(parameter) {

					for (var i = 0; i < parameter.length; i++) {
						try {
							var link = generator.refactor.getVariable(parameter[i].name);
							if (link.type == generator.enums.c.data.type.int) {
								generator.includer.function.parser.string.integer();
							}
							else if (link.type == generator.enums.c.data.type.float) {
								generator.includer.function.parser.string.float();
							}
							else if (link.type == generator.enums.c.data.type.string) {
								parameter[i] = parameter[i];
							}
						}
						catch (exception) {
							parameter[i] = parameter[i];
						}
					}
					generator.includer.function.parser.string.concatenator();
					return this.name + "(" + parameter.length + ", " + parameter.join(", ") + ")"
				}
			,new Array("string-only", "concatenation", "C-language"), generator.enums.c.data.type.string));

			dictionary.pages.addWord(new Word(
				"sprintf", function(buffer, parameter) {
					var stringFormat = "";
					var paramFormat = "";
					for (var i = 0; i < parameter.length; i++) {

						if (parameter[i].search("intValue") != -1) {
							parameter[i] = parameter[i].substring(1).replace(RegExp('\\b' + ".intValue" + '\\b','g'), "");
						}
						else if (parameter[i].search("intValue") != -1) {
							parameter[i] = parameter[i].substring(1).replace(RegExp('\\b' + ".floatValue" + '\\b','g'), "");
						}
						else if (parameter[i].search("charValue") != -1) {
							parameter[i] = parameter[i].replace(RegExp('\\b' + ".charValue" + '\\b','g'), "");
						}

						try {
							var link = generator.refactor.getVariable(parameter[i]);

							if (link.ambigious) {

								if (link.type == "int") {
									stringFormat += "%d";
									paramFormat += "*" + link.name + ".intValue";
								}
								else if (link.type == "float") {
									stringFormat += "%f";
									paramFormat += "*" + link.name + ".floatValue";
								}
								else if (link.type == "string") {
									stringFormat += "%s";
									paramFormat += "*" + link.name + ".charValue";
								}
							}
							else {

								if (link.type == "int") {
									stringFormat += "%d";
									paramFormat += link.name;
								}
								else if (link.type == "float") {
									stringFormat += "%f";
									paramFormat += link.name;
								}
								else if (link.type == "string") {
									stringFormat += "%s";
									paramFormat += link.name;
								}
							}
						}
						catch (ex) {

							paramFormat += parameter[i];

							try {
								if (isInteger(parameter[i])) {
									stringFormat += "%d";
								}
								else {
									stringFormat += "%f";
								}
							}
							catch (ex1) {

								try {
									var result = isEquation(parameter[i]);
									if (result == generator.enums.c.data.type.integer) {
										stringFormat += "%d";
									}
									else if (result == generator.enums.c.data.type.float) {
										stringFormat += "%f";
									}
									else {
										stringFormat += "%s";
									}
								}
								catch (ex2) {

									stringFormat += "%s";
								}
							}

						}

						if (i + 1 < parameter.length)
							paramFormat += ", ";
					}

					return "sprintf(" + buffer + ", \"" + stringFormat + "\", " + paramFormat + ")";
				}
			,new Array("string", "manipulation", "C-language"), generator.enums.c.data.type.void));

			dictionary.pages.addWord(new Word(
				"printf", function(parameter) {
					var stringFormat = "";
					var paramFormat = "";
					for (var i = 0; i < parameter.length; i++) {
						if (typeof(parameter[i]) == "object") {

							try {
								var link = generator.refactor.getVariable(parameter[i].name);

								if (link.type == "int") {
									stringFormat += "%d";
									paramFormat += parameter[i].name;
								}
								else if (link.type == "float") {
									stringFormat += "%f";
									paramFormat += parameter[i].name;
								}
								else if (link.type == "string") {
									stringFormat += "%s";
									paramFormat += parameter[i].name;
								}
								else if (link.type == "ambigious") {

									if (link.lastDataType == "int") {
										stringFormat += "%d";
										paramFormat += "*" + parameter[i].name + ".intValue";
									}
									else if (link.lastDataType == "float") {
										stringFormat += "%f";
										paramFormat += "*" + parameter[i].name + ".floatValue";
									}
									else if (link.lastDataType == "string") {
										stringFormat += "%s";
										paramFormat += parameter[i].name + ".charValue";
									}
								}
							}
							catch (ex) {

								paramFormat += parameter[i].name;
								stringFormat += "%s";
							}
						}
						else {

							paramFormat += parameter[i];

							try {
								if (isInteger(parameter[i])) {
									stringFormat += "%d";
								}
								else {
									stringFormat += "%f";
								}
							}
							catch (ex) {

								var dataType = isEquation(parameter[i]);
								if (dataType == "string") {
									stringFormat += "%s";
								}
								else if (dataType == "float") {
									stringFormat += "%f";
								}
								else  {
									stringFormat += "%d";
								}

							}
						}

						if (i + 1 < parameter.length)
							paramFormat += ", ";
					}

					return "printf(\"" + stringFormat + "\", " + paramFormat + ")";
				}
			,new Array("output", "manipulation", "C-language"), generator.enums.c.data.type.void));

			dictionary.pages.addWord(new Word(
				"pow", function(parameter) {

					generator.includer.function.math.pow();
					return this.name + "(" + parameter.join(" ") + ")";
				}
			, new Array("math-operation", "exponent", "C-language"), generator.enums.c.data.type.float));

			dictionary.pages.addWord(new Word(
				"testFunc11", function(value) {

					return this.name + "(" + value.join(" ") + ")";
				}
			, new Array("magic", "doh", "C-language"), generator.enums.c.data.type.integer));
			//
		}
	},

	python: {

        initialized: false,
		initialize: function() {

            if (dictionary.python.initialized) {
                return;
            }
            else {
                dictionary.python.initialized = true;
            }

			dictionary.pages.addWord(new Word(
				"float", function(value) {

				}
			, new Array("integer-or-float-or-string", "data-type-conversion", "Python-language"), generator.enums.python.data.type.float));

			dictionary.pages.addWord(new Word(
				"int", function(value) {

				}
			, new Array("integer-or-float-or-string", "data-type-conversion", "Python-language"), generator.enums.python.data.type.integer));

			dictionary.pages.addWord(new Word(
				"str", function(value) {

				}
			, new Array("integer-or-float-or-string", "data-type-conversion", "Python-language"), generator.enums.python.data.type.string));

			dictionary.pages.addWord(new Word(
				"pow", function(parameter) {

					var paramText = "";
					for (var i = 0; i < parameter.length; i++) {
						paramText += parameter[i];
						if (i + 1 != parameter.length) {
							paramText += ", ";
						}
					}

					return this.name + "(" + paramText + ")";
				}
			, new Array("math-operation", "exponent", "Python-language"), generator.enums.python.data.type.float));

			dictionary.pages.addWord(new Word(
				"testFunc", function(value) {
					return "!!";
				}
			, new Array("magic", "doh", "Python-language"), generator.enums.python.data.type.integer));
		}
	}
}
