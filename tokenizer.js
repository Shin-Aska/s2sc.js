/**
 *
 * @source: tokenizer.js
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

function Token (objId, objType, objValue) {

	this.id = objId;
	this.type = objType;
	this.value= objValue;
}

function Position (s, e) {

	this.start = s;
	this.end = e;
}

function Flag () {

	this.number = false;
	this.string = false;
	this.symbol = false;
	this.other = false;

	this.resetFlags = function() {

		this.number = false;
		this.string = false;
		this.symbol = false;
		this.other = false;
	}

	this.raiseNumberFlag = function () {

		this.resetFlags();
		this.number = true;
	}

	this.raiseStringFlag = function () {

		this.resetFlags();
		this.string = true;
	}

	this.raiseSymbolFlag = function () {

		this.resetFlags();
		this.symbol = true;
	}

	this.raiseOtherFlag = function() {

		this.resetFlags();
		this.other = true;
	}

	this.getTypeFlag = function() {

		if (this.number) {
			return "number";
		}
		else if (this.string) {
			return "string";
		}
		else if (this.symbol) {
			return "symbol";
		}
		else if (this.other) {
			return "other";
		}
		else {
			return "none";
		}
	}
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

	initialize: function(list) {

		tokenizer.reset();
		list.token.keyword.sort(function(a, b){ return a.length > b.length ? -1 : 1;});
		tokenizer.general.token = list.token;
	},

	python: {

		token: {

			keyword: [
				"import", "from", "print", "raw_input", "sys",
				"testFunc", "pow"
			],
			symbol: [
				"->", "+=", "-=", "*=", "/=", "+", "=",
				"-", "*", "/", "%", "**", "//",
				"(", ")", "<", ">", "{", "}", ",", ".", "==", "!=", "<>", ":",
				"&", "|",
			],
			reserveWord: ["int", "float", "str", "def", "class", "True", "False",
				"and", "or", "not", "if", "elif", "else"
			]
		},

		tokenize: function(text) {

			var backupSymbol = tokenizer.python.token.symbol.slice();
			tokenizer.python.token.symbol.sort(function(a, b){ return a.length > b.length ? -1 : 1;});
			var lines = [];
			var lineBuffer = "";
			var tokenBuffer = "";
			var flag = new Flag();
			var stringTerminator = "";

			for (var i = 0; i < text.length; i++) {

				var skip = false;

				if (text[i] == "\t") {
					tokenBuffer += "{tab}";
					skip = true;
				}

				if (text[i] == "\n") {
					skip = true;
				}

				if (!skip) {

					if (flag.getTypeFlag() == "none") {

						if (text[i].toLowerCase() != text[i].toUpperCase()) {
							//alert(text[i]);
							flag.raiseOtherFlag();
						}
						else if (text[i] == "'" || text[i] == "\"") {

							stringTerminator = text[i];
							flag.raiseStringFlag();
						}
						else if (/^\d+$/.test(text[i])) {

							flag.raiseNumberFlag();
						}
						else {

							for (var j = 0; j < tokenizer.python.token.symbol.length; j++) {

								if (text[i] == tokenizer.python.token.symbol[j]) {
									flag.raiseSymbolFlag();
									break;
								}
							}

							if (flag.getTypeFlag() == "none" && text[i] != " ") {

								flag.raiseOtherFlag();
							}
						}

						if (text[i] != " ") {

							lineBuffer += text[i];
						}
					}
					else if (flag.getTypeFlag() == "other") {

						if (text[i] == "'" || text[i] == "\"") {

							stringTerminator = text[i];
							var found = false;
							var type = 1;

							for (var j = 0; j < tokenizer.python.token.keyword.length; j++) {

								if (lineBuffer == tokenizer.python.token.keyword[j]) {
									type = 0;
									found = true;
									break;
								}
							}

							for (var j = 0; j < tokenizer.python.token.reserveWord.length; j++) {

								if (lineBuffer == tokenizer.python.token.reserveWord[j]) {
									if (found) {
										console.log("Existing definition of " + lineBuffer + " exists on keyword list. Overwriting setting");
									}

									type = 4;
									break;
								}
							}

							var token = tokenizer.insert.token(tokenizer.type[type], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
							flag.raiseStringFlag();
						}
						else if (text[i] == " ") {

							var found = false;
							var type = 1;

							for (var j = 0; j < tokenizer.python.token.keyword.length; j++) {

								if (lineBuffer == tokenizer.python.token.keyword[j]) {
									type = 0;
									found = true;
									break;
								}
							}

							for (var j = 0; j < tokenizer.python.token.reserveWord.length; j++) {

								if (lineBuffer == tokenizer.python.token.reserveWord[j]) {
									if (found) {
										console.log("Existing definition of " + lineBuffer + " exists on keyword list. Overwriting setting");
									}

									type = 4;
									break;
								}
							}

							var token = tokenizer.insert.token(tokenizer.type[type], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
							flag.resetFlags();
						}
						else {

							for (var j = 0; j < tokenizer.python.token.symbol.length; j++) {

								if (text[i] == tokenizer.python.token.symbol[j]) {
									var found = false;
									var type = 1;

									for (var j = 0; j < tokenizer.python.token.keyword.length; j++) {

										if (lineBuffer == tokenizer.python.token.keyword[j]) {
											type = 0;
											found = true;
											break;
										}
									}

									for (var j = 0; j < tokenizer.python.token.reserveWord.length; j++) {

										if (lineBuffer == tokenizer.python.token.reserveWord[j]) {
											if (found) {
												console.log("Existing definition of " + lineBuffer + " exists on keyword list. Overwriting setting");
											}

											type = 4;
											break;
										}
									}

									var token = tokenizer.insert.token(tokenizer.type[type], lineBuffer);
									tokenBuffer += "{" + token.id + "}";
									lineBuffer = "";
									flag.raiseSymbolFlag();
									break;
								}
							}

							if (text[i] != " ") {

								lineBuffer += text[i];
							}
						}
					}
					else if (flag.getTypeFlag() == "string") {

						if (text[i] == stringTerminator) {

							lineBuffer += text[i];
							var token = tokenizer.insert.token(tokenizer.type[5], lineBuffer.substring(1, lineBuffer.length - 1));
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
							flag.resetFlags();
						}
						else {
							lineBuffer += text[i];
							if (i + 1 == text.length) {
								throw "Non-terminating string Exception occured";
							}
						}
					}
					else if (flag.getTypeFlag() == "number") {

						if (text[i].toLowerCase() != text[i].toUpperCase()) {

							var token = tokenizer.insert.token(tokenizer.type[3], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
							flag.raiseOtherFlag();
						}
						else if (text[i] == "'" || text[i] == "\"") {

							stringTerminator = text[i];
							var token = tokenizer.insert.token(tokenizer.type[3], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
							flag.raiseStringFlag();
						}
						else if (text[i] == " ") {

							var token = tokenizer.insert.token(tokenizer.type[3], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
							flag.resetFlags();
						}
						else {

							for (var j = 0; j < tokenizer.python.token.symbol.length; j++) {

								if (text[i] == tokenizer.python.token.symbol[j]) {
									if (text[i] != ".") {

										dotCounter = 0;
										var token = tokenizer.insert.token(tokenizer.type[3], lineBuffer);
										tokenBuffer += "{" + token.id + "}";
										lineBuffer = "";
										flag.raiseSymbolFlag();
										break;
									}
								}
							}
						}

						if (text[i] != " ") {

							lineBuffer += text[i];
						}
					}
					else if (flag.getTypeFlag() == "symbol") {

						var pushToBuffer = true;
						if (text[i].toLowerCase() != text[i].toUpperCase()) {

							flag.raiseOtherFlag();
						}
						else if (/^\d+$/.test(text[i])) {

							flag.raiseNumberFlag();
						}
						else if (text[i] == "'" || text[i] == "\"") {

							stringTerminator = text[i];
							flag.raiseStringFlag();
						}
						else if (text[i] == " ") {

							flag.resetFlags();
						}
						else {

							pushToBuffer = false;
						}

						if (pushToBuffer) {

							for (var j = 0; j < tokenizer.python.token.symbol.length; j++) {

								if (tokenizer.python.token.symbol[j].length <= lineBuffer.length) {

									if (tokenizer.python.token.symbol[j] == lineBuffer.substring(0, tokenizer.python.token.symbol[j].length)) {

										var token = tokenizer.insert.token(tokenizer.type[2], tokenizer.python.token.symbol[j]);
										tokenBuffer += "{" + token.id + "}";
										lineBuffer = lineBuffer.substring(tokenizer.python.token.symbol[j].length);
										j = 0;
									}
								}

								if (lineBuffer.length == 0 || lineBuffer == "") {
									break;
								}
							}
						}

						if (text[i] != " ") {

							lineBuffer += text[i];
						}
					}
				}

				if (text[i + 1] == "\n" || i + 1 >= text.length) {

					if (lineBuffer.length != 0) {

						if (flag.getTypeFlag() == "other") {
							var found = false;
							var type = 1;

							for (var j = 0; j < tokenizer.python.token.keyword.length; j++) {

								if (lineBuffer == tokenizer.python.token.keyword[j]) {
									type = 0;
									found = true;
									break;
								}
							}

							for (var j = 0; j < tokenizer.python.token.reserveWord.length; j++) {

								if (lineBuffer == tokenizer.python.token.reserveWord[j]) {
									if (found) {
										console.log("Existing definition of " + lineBuffer + " exists on keyword list. Overwriting setting");
									}

									type = 4;
									break;
								}
							}

							var token = tokenizer.insert.token(tokenizer.type[type], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
							lineBuffer = "";
						}
						else if (flag.getTypeFlag() == "string") {

						}
						else if (flag.getTypeFlag() == "number") {
							var token = tokenizer.insert.token(tokenizer.type[3], lineBuffer);
							tokenBuffer += "{" + token.id + "}";
						}
						else if (flag.getTypeFlag() == "symbol") {

							for (var j = 0; j < tokenizer.python.token.symbol.length; j++) {

								if (tokenizer.python.token.symbol[j].length <= lineBuffer.length) {

									if (tokenizer.python.token.symbol[j] == lineBuffer.substring(0, tokenizer.python.token.symbol[j].length)) {

										var token = tokenizer.insert.token(tokenizer.type[2], tokenizer.python.token.symbol[j]);
										tokenBuffer += "{" + token.id + "}";
										lineBuffer = lineBuffer.substring(tokenizer.python.token.symbol[j].length);
										j = 0;
									}
								}

								if (lineBuffer.length == 0 || lineBuffer == "") {
									break;
								}
							}
						}
					}

					lines.push(tokenBuffer);
					lineBuffer = "";
					tokenBuffer = "";
					i++;
					flag.resetFlags();
				}

			}

			tokenizer.python.token.symbol = backupSymbol;
			return lines;
		}
	},

	detokenize: function (line) {

		var tokens = [];
		var begin = false;
		var token = "";
		for (var i = 0; i < line.length; i++) {

			if (line[i] == "{") {
				begin = true;
				continue;
			}
			else if (line[i] == "}" && begin) {
				begin = false;
				tokens.push(token);
				token = "";
			}

			if (begin) {
				token += line[i];
			}
		}

		return tokens;
	},

	general: {

		token: null
	}

}
