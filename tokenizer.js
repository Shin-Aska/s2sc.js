/**
 *
 * @source: tokenizer.js
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

/**************************************************************
	Bug List: [Since im not doing git repositories YET imma do this]

	1.) Tokenizer still recognizes certain names as keywords (Happens randomly?)
		[Update: 2014-07-23] This bug has been fixed
	2.) Tokenizer recognizes real numbers with their integer counter parts (1 = 1.1) => Confirmed bug on tokenizer.replace function and a => ab
		[Update: 2014-07-22] a => ab is now fixed, working on 1 = 1.1
		[Update: 2014-07-23] This bug has been fixed
****************************************************************/

function Token (objId, objType, objValue) {

	this.id = objId;
	this.type = objType;
	this.value= objValue;
}

function Position (s, e) {

	this.start = s;
	this.end = e;
}

var tokenizer = {

	type: ["Keyword", "Identifier", "Symbol", "Constant", "ReserveWord", "String"],
	typeNick: ["kwd", "id", "symb", "const", "res", "sConst"],
	reset: function () {

		tokenizer.tokens = [];
		tokenizer.token.keyword = [];
		tokenizer.token.identifier = [];
		tokenizer.token.symbol = [];
		tokenizer.token.constant = [];
		tokenizer.token.reserveWord = [];
		tokenizer.token.string = [];
	},

/*
	The tokens array stores all of the token information in a single array
*/
	tokens: Array(),

/*
	Token object, stores all of the token information in seperated arrays where
	each of these contain token information on different categories
*/
	token: {

		keyword: Array(),
		identifier: Array(),
		symbol: Array(),
		constant: Array(),
		reserveWord: Array(),
		string: Array()
	},


	insert: {

		token: function (objType, objValue) {

			var objId = "n/a";
			var obj = new Token(objId, objType, objValue);
			var found = false;
			var typeIndex = -1;

			for (var i = 0; i < tokenizer.tokens.length; i++) {

				if (obj.value == tokenizer.tokens[i].value && objType == tokenizer.tokens[i].type) {

					found = true;
					obj = tokenizer.tokens[i];
					break;
				}
			}

			if (!found) {

				for (var i = 0; i < tokenizer.type.length; i++) {

					if (tokenizer.type[i] == objType) {

						if (i == 0) {

							objId = "kwd" + (tokenizer.token.keyword.length + 1);
						}
						else if (i == 1) {

							objId = "id" + (tokenizer.token.identifier.length + 1);
						}
						else if (i == 2) {

							objId = "symb" + (tokenizer.token.symbol.length + 1);
						}
						else if (i == 3) {

							objId = "const" + (tokenizer.token.constant.length + 1);
						}
						else if (i == 4) {

							objId = "res" + (tokenizer.token.reserveWord.length + 1);
						}
						else if (i == 5) {

							objId = "sConst" + (tokenizer.token.string.length + 1);
						}

						typeIndex = i;
						break;
					}
				}

				obj.id = objId;

				tokenizer.tokens.push(obj);
				if (typeIndex == 0) {
					tokenizer.token.keyword.push(obj);
				}
				else if (typeIndex == 1) {
					tokenizer.token.identifier.push(obj);
				}
				else if (typeIndex == 2) {
					tokenizer.token.symbol.push(obj);
				}
				else if (typeIndex == 3) {
					tokenizer.token.constant.push(obj);
				}
				else if (typeIndex == 4) {
					tokenizer.token.reserveWord.push(obj);
				}
				else if (typeIndex == 5) {
					tokenizer.token.string.push(obj);
				}
			}

			return obj;
		}
	},

	list: {

		keyword: ["def", "import", "from", "print", "raw_input", "sys" ,"testFunc"],
		symbol: ["->", "+=", "-=", "*=", "/=", "+", "-", "*", "/", "=", "(", ")", "<", ">", "{", "}", ",", "."],
		reserveWord: ["int", "float", "str"]
	},

	// This private function here finds the pair for the string capsulators and can be change interdependently.
	findPair: function (line, character, lineNum) {

		var keyTest = -1;
		var keyTestE = -1;

		do {

			keyTest = line.indexOf(character);
			keyTestE= line.substring(keyTest + 1).indexOf(character);

			if (keyTest != -1 && keyTestE != -1) {

				var tokVal = tokenizer.insert.token(tokenizer.type[5], line.substr(keyTest + 1, keyTestE));
				line = line.replace(character + tokVal.value + character, "{" + tokVal.id + "}");
			}
			else {

				if (keyTest != -1 && keyTestE == -1) {

					throw "Missing " + character + " terminator character found at line " +
						lineNum + " on " + $('input[type=file]').val();
				}
			}
		} while (keyTest != -1);

		return line;
	},

	tokenize: function (text) {

		tokenizer.reset();
		tokenizer.list.keyword.sort(function(a, b){ return a.length > b.length ? -1 : 1;});
		var lines = text.split("\n");
		for (var i = 0; i < lines.length; i++) {

			//Extra check for { and } symbols
			//since brackets are hardcoded to be symbols and the fact
			//Without this code, it will cause an infinite loop

			// instead of using
			var hardCodedSymbols = ["{", "}"];

			for (var j = 0; j < hardCodedSymbols.length; j++) {

				var keyTest = lines[i].indexOf(hardCodedSymbols[j]);

				if (keyTest != -1) {

					var tokVal = tokenizer.insert.token(tokenizer.type[2], hardCodedSymbols[j]);
					var reg = new RegExp(tokVal.value, 'g');
					lines[i] = lines[i].replace(reg, "\1\0\5\4" + tokVal.id + "\1\5\0\4");
				}
			}

			lines[i] = lines[i].replace(/\1\0\5\4/g, "{");
			lines[i] = lines[i].replace(/\1\5\0\4/g, "}");


			// This code here tries to indentify string constants that is encapsulated by string capsulators such as
			// a single quote or a double quote.

			/*
				Ex:
				'@@@@'" = Illegal
				'asd"'  = Ok
				"'There is no spoon'" = Legal
			*/

			var doubleQuoteFirst = true;
			var doubleQuoteExist = false;
			var singleQuoteExist = false;

			var dQuoteIndex = lines[i].indexOf("\"");
			var sQuoteIndex = lines[i].indexOf("'");
			if (dQuoteIndex != -1)
				doubleQuoteExist = true;
			if (sQuoteIndex != -1)
				singleQuoteExist = true;

			if (singleQuoteExist || doubleQuoteExist) {

				if (dQuoteIndex > sQuoteIndex || !doubleQuoteExist) {

					if (singleQuoteExist) {
						doubleQuoteFirst = false;
					}
				}

				if (doubleQuoteFirst && doubleQuoteExist) {
					lines[i] = tokenizer.findPair(lines[i], "\"", i + 1);
					if (singleQuoteExist) {
						lines[i] = tokenizer.findPair(lines[i], "'", i + 1);
					}
				}
				else if (!doubleQuoteFirst && singleQuoteExist) {

					lines[i] = tokenizer.findPair(lines[i], "'", i + 1);
					if (doubleQuoteExist) {
						lines[i] = tokenizer.findPair(lines[i], "\"", i + 1);
					}
				}
			}

			// Converting keywords into tokens.
			for (var j = 0; j < tokenizer.list.keyword.length; j++) {

				var keyTest = lines[i].indexOf(tokenizer.list.keyword[j]);
				if (keyTest != -1) {

					var tokVal = tokenizer.insert.token(tokenizer.type[0], tokenizer.list.keyword[j]);
					lines[i] = lines[i].replace(RegExp('\\b' + tokVal.value + '\\b','g'), "{" + tokVal.id + "}");
				}
			}


			// Converting reserved words into tokens.

			for (var j = 0; j < tokenizer.list.reserveWord.length; j++) {

				var keyTest = lines[i].indexOf(tokenizer.list.reserveWord[j]);
				if (keyTest != -1) {

					var tokVal = tokenizer.insert.token(tokenizer.type[4], tokenizer.list.reserveWord[j]);
					lines[i] = lines[i].replace(RegExp('\\b' + tokVal.value + '\\b','g'), "{" + tokVal.id + "}");
				}
			}

			// Converting the current state of remaining tokens into

			for (var j = 0; j < lines[i].length; j++) {

				for (var k = 0; k < tokenizer.list.symbol.length; k++) {

					//This initiates two kinds of checks, if the symbol is only 1 character, then it will compare
					//character by character and the second one checks for substrings.
					if (tokenizer.list.symbol[k].length == 1 && (tokenizer.list.symbol[k] != "{" && tokenizer.list.symbol[k] != "}" && tokenizer.list.symbol[k] != ".")) {
						if (lines[i][j] == tokenizer.list.symbol[k]) {
							var tokVal = tokenizer.insert.token(tokenizer.type[2], tokenizer.list.symbol[k]);
							lines[i] = lines[i].replace(tokVal.value, "{" + tokVal.id + "}");
						}
					}
					else if (tokenizer.list.symbol[k].length >= 2) {

						if (lines[i].substring(j, j + tokenizer.list.symbol[k].length) == tokenizer.list.symbol[k]) {
							var tokVal = tokenizer.insert.token(tokenizer.type[2], tokenizer.list.symbol[k]);
							lines[i] = lines[i].replace(tokVal.value, "{" + tokVal.id + "}");
						}
					}
				}
			}

			/*
				This one tries to figure out if its either an identifier or a numeric constant
				what it does is just to ignore all translated tokens (Any word that is covered with {})
				then splits everything to spaces.

				Then after that happens, it will identify if its a numeric constant if the word is a number
				while vice versa, it's identified as an identifier.
			*/
			var dup_line = lines[i];
			var loopIteration = false;
			do {

				var keyTest = dup_line.indexOf("{");
				var keyTestE= dup_line.indexOf("}");

				if (keyTest != -1 || keyTestE != -1) {

					dup_line = dup_line.substr(0, keyTest) + " " + dup_line.substr(keyTestE + 1);
				}
				else {

					loopIteration = true;
				}
			} while (!loopIteration);

			dup_line = dup_line.split(" ");

			for (var j = 0; j < dup_line.length; j++) {

				if (dup_line[j] == "") {

				}
				else {

					var type   = 1;
					if (!isNaN(dup_line[j])) {
						type = 3;
					}


					if (typeof(lines[i]) !== 'undefined') {

						if (type == 1) {

							var identifiers = dup_line[j].split(".");
							var res_dup = dup_line[j];
							var tokVal = tokenizer.insert.token(tokenizer.type[2], ".");
							res_dup = res_dup.replace(/\./g, "{" + tokVal.id + "}");
							for (var k = 0; k < identifiers.length; k++) {
								tokVal = tokenizer.insert.token(tokenizer.type[type], identifiers[k]);
								res_dup = res_dup.replace(RegExp('\\b' + tokVal.value + '\\b','g'), "{" + tokVal.id + "}");
							}
							lines[i] = lines[i].replace(RegExp('\\b' + dup_line[j] + '\\b','g'), res_dup);
						}
						else if (type == 3) {

							var tokVal = tokenizer.insert.token(tokenizer.type[type], dup_line[j]);
							lines[i] = tokenizer.replaceNumeric(lines[i], "{}", tokVal.value, "{" + tokVal.id + "}");
						}
					}
				}
			}

			/*
				Replace the replaceNumeric function with a more robust number replacing
				function
			*/
		}

		return lines;
	},

/*
	This function finds and matches numbers on a string only if its a match and that the patterns it finds
	are whole numbers instead of substring contents.
*/
	replaceNumeric: function (line, limiter, original, replacement) {

		var positions = [];
		var strHolder = "";
		var skip = false;
		var skipTrigger = limiter[0];
		var skipEnder   = limiter[1];
		var cPosition = new Position(-1, -1);

		for (var i = 0; i < line.length + 1; i++) {
			if (line[i] == skipTrigger && !skip) {
				if (cPosition.start != -1) {
					if (strHolder == original) {
						cPosition.end = i;
						positions.push(cPosition);
					}
				}
				strHolder = "";
				cPosition = new Position(-1, -1);
				skip = true;
			}
			else if (line[i] == skipEnder && skip) {
				skip = false;
				continue;
			}

			if (skip) {
				continue;
			}
			else {

				var push = false;
				if (line[i] != " " && (!isNaN(line[i]) || line[i] == ".")) {
					strHolder += line[i];
					if (cPosition.start == -1) {
						cPosition.start = i;
					}
				}
				else {

					push = true;
					if (typeof(line[i]) !== 'undefined') {
						if (!/[^a-zA-Z]/.test(line[i])) {
							strHolder = "";
							cPosition = new Position(-1, -1);
						}
					}
				}

				if (strHolder == original && push) {
					cPosition.end = i;
					positions.push(cPosition);
					strHolder = "";
					cPosition = new Position(-1, -1);
				}
			}
		}

		var offset = 0;
		for (var i = 0; i < positions.length; i++) {

			line = line.substring(0, positions[i].start + offset) + replacement + line.substring(positions[i].end + 0 + offset);
			offset += replacement.length - 1;
		}
		return line;
	}
}
