 /**
 *
 * @source: analyzer.js
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

function Variable (Vname, Vtype, Vline) {

	this.name = Vname;
	this.type = Vtype;
	this.lineDeclared = Vline;
	this.ambigious = false;
	this.temporary = false;
}

function Action (Atype) {

	this.type = Atype;
	this.state = [];

	this.pushVariableState = function(variable) {

		var found = false;

		for (var i = 0; i < this.state.length; i++) {

			if (variable.name == this.state[i].name) {
				found = true;
			}
		}

		if (!found) {
			this.state.push(
				new Variable(variable.name, variable.type, variable.lineDeclared)
			);
		}
	}
}

function ParenthesisStack (Svariable) {

	this.count = 0
	this.set = 0;
	this.functionName = new Array();
	this.content = new Array();

	this.pushData = function(data) {
		if (this.content.length == 0) {
			throw "Invalid Operation";
		}

		this.content[this.content.length - 1].data.push(data);
	}
}

function StackContent () {

	this.data = [];
	this.result = "";
}


function Line (Lline, Ltoks, Lval) {

    this.length = Ltoks.length;
	this.lineNumber = Lline;
	this.tokens = Ltoks;
	this.values = Lval;

	this.actionStack = [];
	this.contentStack = [];
}

function Structure (Sname, Scontent) {

	this.name = Sname;
	this.content = Scontent;
}

function Func (Fname, Fparam, Ftype, Fcontent) {

	this.name = Fname;
	this.param = Fparam;
	this.type = Ftype;
	this.content = Fcontent;
}

var analyzer = {

	enums: {

		data: {

			type: {

				integer: "int",
				float: "float",
				string: "string",
				object: "object",
				void: "none"
			}
		},

		action: {

            declaration: "decl",
            stringDeclaration: "strDecl",
            compoundAssignment: "cmpAsgn"
        },

        symbol: {

			add: "+",
			subtract: "-",
			multiply: "*",
			divide: "/",
			dot: ".",
			equal: "=",
			leftParenthesis: "(",
			rightParenthesis: ")",
			string: "str"
        },

		token: {

			keyword: "kwd",
			identifier: "id",
			symbol: "symb",
			constant: "const",
			reserveWord: "res",
			stringConstant: "sConst"
		}


	},

	includer: {

		dataType: {

			ambigious: function() {

				analyzer.unions.insert("ambigious", "\tint *intValue;\n\tfloat *floatValue;\n\tchar *charValue;\n\tvoid *voidValue;\n");
			}
		},

		function: {

			parser: {

				float: {

					string: function() {

						analyzer.headers.insert("stdio.h");
						analyzer.functions.insert("toFloat_str",
							"\tfloat variable = 0;\n\tsscanf(str, \"%d\", &variable);\n\treturn variable;\n",
							"float", "const char *str"
						);
					}
				},

				integer: {

					string: function() {

						analyzer.headers.insert("stdio.h");
						analyzer.functions.insert("toInteger_str",
							"\tint variable = 0;\n\tsscanf(str, \"%d\", &variable);\n\treturn variable;\n",
							"int", "const char *str"
						);
					}
				},

				string: {

					integer: function() {

						analyzer.headers.insert("stdio.h");
						analyzer.headers.insert("stdlib.h");
						analyzer.headers.insert("gc.h");
						analyzer.defines.insert("malloc(n)", "GC_MALLOC(n)");
						analyzer.defines.insert("calloc(m,n)", "GC_MALLOC(m*n)");
						analyzer.defines.insert("free(p)", "GC_FREE(p)");
						analyzer.defines.insert("realloc(n)", "GC_REALLOC(n)");
						analyzer.functions.insert("toString_int",
							"\tchar *buffer = (char*)calloc(2048, sizeof(char));\n\tsprintf(buffer, \"%d\", num);\n\treturn buffer;\n",
							"char *", "int num"
						);
					},

					float: function() {

						analyzer.headers.insert("stdio.h");
						analyzer.headers.insert("stdlib.h");
						analyzer.headers.insert("gc.h");
						analyzer.defines.insert("malloc(n)", "GC_MALLOC(n)");
						analyzer.defines.insert("calloc(m,n)", "GC_MALLOC(m*n)");
						analyzer.defines.insert("free(p)", "GC_FREE(p)");
						analyzer.defines.insert("realloc(n)", "GC_REALLOC(n)");
						analyzer.functions.insert("toString_float",
							"\tchar *buffer = (char*)calloc(2048, sizeof(char));\n\tsprintf(buffer, \"%f\", num);\n\treturn buffer;\n",
							"char *", "float num"
						);
					},

					concatenator: function() {

						analyzer.headers.insert("stdio.h");
						analyzer.headers.insert("stdlib.h");
						analyzer.headers.insert("stdarg.h");
						analyzer.headers.insert("string.h");
						analyzer.headers.insert("gc.h");
						analyzer.defines.insert("malloc(n)", "GC_MALLOC(n)");
						analyzer.defines.insert("calloc(m,n)", "GC_MALLOC(m*n)");
						analyzer.defines.insert("free(p)", "GC_FREE(p)");
						analyzer.defines.insert("realloc(n)", "GC_REALLOC(n)");
						analyzer.functions.insert("strConcat",
							"\tchar *buffer = (char*)calloc(2048, sizeof(char));\n\tstrcpy(buffer, \"\");\n\n\tva_list vl;\n\tva_start(vl, limit);\n\tfor (int i = 0; i < limit; i++) {\n\t\tstrcat(buffer, va_arg(vl, char*));\n\t}\n\tva_end(vl);\n\treturn buffer;\n",
							"char *", "int limit, ..."
						);
					}
				}
			}
		}
	},

	variables: {

		comment : '/*******************************************************\n\
\tCode generated by Python Code Analyzer\n\
*******************************************************/\n\n',
		defineString: "",
		headerString : "",
		struct: "",
		union: "",
		functions: "",
		bodyBegin : "int main (void) {\n\n",
		bodyEnd   : "\treturn 0;\n}",
		result: "",

		type: {

			integer: "int",
			float: "float",
			string: "char *",
			mixed: "mixed_type"
		}
	},

	defines: {

		list: Array(),

		insert: function(name, content) {

			var found = false;
			var struct = new Structure(name, content);
			for (var i = 0; i < analyzer.defines.list.length; i++) {

				if (analyzer.defines.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				analyzer.defines.list.push(struct);
			}
		},

		clear: function() {

			analyzer.variables.defineString = "";
			analyzer.defines.list = new Array();
		}
	},

	headers: {

		list: Array(),

		insert: function(value) {

			var found = false;
			for (var i = 0; i < analyzer.headers.list.length; i++) {

				if (analyzer.headers.list[i] == value) {
					found = true;
				}
			}

			if (!found) {
				analyzer.headers.list.push(value);
			}
		},

		clear: function() {

			analyzer.variables.headerString = "";
			analyzer.headers.list = new Array();
		}
	},

	structures: {

		list: Array(),
		insert: function(name, content) {

			var found = false;
			var struct = new Structure(name, content);
			for (var i = 0; i < analyzer.structures.list.length; i++) {

				if (analyzer.structures.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				analyzer.structures.list.push(struct);
			}
		},
		clear: function() {

			analyzer.variables.struct = "";
			analyzer.structures.list = new Array();
		}
	},

	unions: {

		list: Array(),
		insert: function(name, content) {

			var found = false;
			var struct = new Structure(name, content);
			for (var i = 0; i < analyzer.unions.list.length; i++) {

				if (analyzer.unions.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				analyzer.unions.list.push(struct);
			}
		},

		clear: function() {

			analyzer.variables.union = "";
			analyzer.unions.list = new Array();
		}
	},

	functions: {

		list: Array(),
		insert: function(name, content, type, parameter) {

			var found = false;
			var struct = new Func(name, parameter, type, content);
			for (var i = 0; i < analyzer.functions.list.length; i++) {

				if (analyzer.functions.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				analyzer.functions.list.push(struct);
			}
		},
		clear: function() {

			analyzer.variables.functions = "";
			analyzer.functions.list = new Array();
		}
	},

	refactor:{

		variableList: [],

		findVariable: function (name) {

			for (var i = 0; i < analyzer.refactor.variableList.length; i++) {
				if (analyzer.refactor.variableList[i].name == name) {
					return i;
				}
			}

			return -1;
		},

		getVariable: function (name) {

			var index = analyzer.refactor.findVariable(name);
			if (index != -1) {

				return analyzer.refactor.variableList[index];
			}

			throw "Not found variable(" + name + ") on refactor list";
		},

		insertVariable: function (variable) {

			var found = analyzer.refactor.findVariable(variable.name);
			if (found == -1) {
				analyzer.refactor.variableList.push(variable);
			}
		},

		clear: function () {

			analyzer.refactor.variableList = new Array();
		},

	},

	getTokensFromString: function (map, symbol) {

		var string = "";
		var bodyText = "";
		var result = "";
		var buffer = new Array();
		var currentLanguage = "Python-language";
		var targetLanguage = "C-language";


		analyzer.headers.clear();
		analyzer.defines.clear();
		analyzer.refactor.clear();
		analyzer.unions.clear();
		analyzer.structures.clear();
		analyzer.functions.clear();

		for (var i = 0; i < symbol.length; i++) {

            var tokens = parser.detokenize(map[i]);
            var values = tokens.slice();

            for (var j = 0; j < values.length; j++) {

                var currentSelector = values[j].replace(/\d+/g, '');
                var currentIndex 	= values[j].replace(/[^0-9.]/g, '');
                tokens[j] = currentSelector;

                if (currentSelector == analyzer.enums.token.keyword) {

                    values[j] = tokenizer.token.keyword[currentIndex - 1].value;
                }
                else if (currentSelector == analyzer.enums.token.identifier) {

                    values[j] = tokenizer.token.identifier[currentIndex - 1].value;
                }
                else if (currentSelector == analyzer.enums.token.symbol) {

                    values[j] = tokenizer.token.symbol[currentIndex - 1].value;
                }
                else if (currentSelector == analyzer.enums.token.constant) {

                    values[j] = tokenizer.token.constant[currentIndex - 1].value;
                }
                else if (currentSelector == analyzer.enums.token.reserveWord) {

                    values[j] = tokenizer.token.reserveWord[currentIndex - 1].value;
                }
                else if (currentSelector == analyzer.enums.token.stringConstant) {

                    values[j] = "\""
                    + tokenizer.token.string[currentIndex - 1].value + "\"";
                }
            }

			var action = new Action(symbol[i]);
            var line = new Line(i, tokens, values);
            var legal = true;
            if (action.type == analyzer.enums.action.declaration ||
                action.type == analyzer.enums.action.stringDeclaration) {

				var isStr =
					action.type == analyzer.enums.action.declaration ? false: true;
				var contentBuffer = [];
				var newDeclaration = false;
                var variable = analyzer.refactor.findVariable(values[0]);



                if (variable == -1) {

					variable = new Variable(values[0], 0, i);
					newDeclaration = true;
                }
                else {

					variable = clone.variable(analyzer.refactor.variableList[variable]);
                }

                if (!isStr) {

					var typeCasted = false;
					var numericVariables = 0;

					for (var j = 2; j < line.tokens.length; j++) {

						if (line.tokens[j] == analyzer.enums.token.identifier) {

							try {

								var tmpVariable =
									analyzer.refactor.getVariable(line.values[j]);

								action.pushVariableState(tmpVariable);
								if (tmpVariable.type == analyzer.enums.data.type.integer ||
									tmpVariable.type == analyzer.enums.data.type.float ) {

									if (variable.type == 0 ||
										variable.type != analyzer.enums.data.type.float) {

										variable.type = tmpVariable.type;
									}

									numericVariables += 1;
								}
								else {

									if (!typeCasted) {
										isStr = true;
										variable.type = analyzer.enums.data.type.string;
									}

								}
							}
							catch (exception) {

								legal = false;
							}
						}
						else if (line.tokens[j] == analyzer.enums.token.constant) {

							if (variable.type == 0 ||
								variable.type != analyzer.enums.data.type.float) {

								try {
									variable.type = isInteger(line.values[j]) ?
										analyzer.enums.data.type.integer :
										analyzer.enums.data.type.float;
									numericVariables += 1;
								}
								catch (exception) {

								}
							}
						}
						else if (line.tokens[j] == analyzer.enums.token.reserveWord) {

							if (line.values[j] == analyzer.enums.data.type.integer ||
								line.values[j] == analyzer.enums.data.type.float) {

								if (variable.type == 0 ||
									variable.type != analyzer.enums.data.type.float) {

									variable.type = line.values[j]
										== analyzer.enums.data.type.integer ?
										analyzer.enums.data.type.integer :
										analyzer.enums.data.type.float;
								}

								typeCasted = true;
							}
						}
					}

					if ((isStr && numericVariables > 0) || variable.type == 0) {

						legal = false;
					}

					if (legal && !isStr) {

						if (newDeclaration) {

							analyzer.refactor.insertVariable(variable);
							contentBuffer.push(variable.type);
						}
						else {

							/*
								To-do: Put code refactoring here...
							*/
							analyzer.refactor.variableList[variable.lineDeclared] = variable;
						}

						action.pushVariableState(variable);
						line.actionStack.push(action);

						// Code Generation Phase

						var stack = new ParenthesisStack();
						var lastContent = "";

						for (var j = 0; j < line.tokens.length; j++) {

							lastContent = contentBuffer.slice();

							if (line.tokens[j] == analyzer.enums.token.constant) {
								try {

									var constantValue = "";
									if (!isInteger(line.values[j])) {
										constantValue += line.values[j] + "f";
									}
									else {
										constantValue += line.values[j];
									}

									contentBuffer.push(constantValue);
								}
								catch (exception) {

									contentBuffer.push(line.values[j]);
								}
							}
							else if (line.tokens[j] == analyzer.enums.token.identifier) {

								var identifier = null;
								for (var k = 0; k < line.actionStack.length; k++) {

									for (var l = 0; l < line.actionStack[k].state.length; l++) {

										if (line.values[j] == line.actionStack[k].state[l].name) {

											identifier = line.actionStack[k].state[l];
											break;
										}
									}
								}

								if (identifier != null) {
									if (identifier.lineDeclared != i && j != 0) {


										if (identifier.type != variable.type && stack.count == 0) {

											if (variable.type == analyzer.enums.data.type.integer ||
												variable.type == analyzer.enums.data.type.float) {
												contentBuffer.push("(" + variable.type + ")");
											}
											else if (identifier.type == analyzer.enums.data.type.string) {

												if (variable.type == analyzer.enums.data.type.integer) {
													analyzer.includer.function.parser.integer.string();
												}
												else if (variable.type == analyzer.enums.data.type.float) {
													analyzer.includer.function.parser.float.string();
												}
											}
										}
									}

									if (identifier.ambigious) {
										if (identifier.type == analyzer.enums.data.type.string) {
											contentBuffer.push(identifier.name + ".charValue");
										}
										else {
											contentBuffer.push(identifier.name+ "." + identifier.type + "Value");
										}
									}
									else {
										contentBuffer.push(identifier.name);
									}
								}
							}
							else if (line.tokens[j] == analyzer.enums.token.reserveWord) {

								if (line.values[j] == analyzer.enums.data.type.integer ||
									line.values[j] == analyzer.enums.data.type.float ||
									line.values[j] == analyzer.enums.symbol.string) {
									if (j + 1 != line.tokens.length) {
										if (line.values[j + 1] == analyzer.enums.symbol.leftParenthesis) {
											stack.count += 1;
											stack.functionName.push(line.values[j]);
											stack.content.push(new StackContent());
										}
									}
								}

							}
							else if (line.tokens[j] == analyzer.enums.token.stringConstant) {

								contentBuffer.push(line.values[j]);
							}
							else if (line.tokens[j] == analyzer.enums.token.symbol) {

								var pushToBuffer = false;

								if (line.values[j] == analyzer.enums.symbol.leftParenthesis) {

									if (stack.count > 0) {
										if (!((line.values[j - 1] == analyzer.enums.data.type.integer ||
											line.values[j - 1] == analyzer.enums.data.type.float ||
											line.values[j - 1] == analyzer.enums.symbol.string) ||
											line.tokens[j - 1] == analyzer.enums.token.keyword)) {
											pushToBuffer = true;
											stack.set++;
										}
									}
									else {
										pushToBuffer = true;
									}
								}
								else if (line.values[j] == analyzer.enums.symbol.rightParenthesis) {

									if (stack.set > 0) {
										stack.set--;
									}

									if (stack.count == 0) {
										pushToBuffer = true;
									}

									if (stack.set == 0 && stack.count > 0) {

										stack.count--;
										var currentFunction = stack.functionName.pop();
										var currentContentBuffer = stack.content.pop();
										var operationType = isEquation(currentContentBuffer.data.join(" "));
										//alert(operationType + "-" + currentFunction + " = " + currentContentBuffer.data.join(" "));
										if (operationType == analyzer.enums.data.type.string) {

											var list;
											var candidate;
											var result = "";

											if (currentFunction == analyzer.enums.data.type.integer) {

												if (currentContentBuffer.data.length > 1) {
													//alert(currentContentBuffer.data.join(","));
													for (var k = 0; k < currentContentBuffer.data.length; k++) {
														if (currentContentBuffer.data[k] == analyzer.enums.symbol.add) {
															currentContentBuffer.data.splice(k, 1);
															k--;
														}
													}

													list = dictionary.pages.findWordsByKeywords(["string-only", "concatenation", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.string, 3);
													result = candidate.function(currentContentBuffer.data);

													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.integer, 3);
													result = candidate.function(result);
												}
												else {
													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.integer, 3);
													result = candidate.function(currentContentBuffer.data);
												}
											}
											else if (currentFunction == analyzer.enums.data.type.float) {

												if (currentContentBuffer.data.length > 1) {

													for (var k = 0; k < currentContentBuffer.data.length; k++) {
														if (currentContentBuffer.data[k] == analyzer.enums.symbol.add) {
															currentContentBuffer.data.splice(k, 1);
															k--;
														}
													}

													list = dictionary.pages.findWordsByKeywords(["string-only", "concatenation", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.string, 3);
													result = candidate.function(currentContentBuffer.data);

													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.float, 3);
													result = candidate.function(result);
												}
												else {
													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.float, 3);
													result = candidate.function(currentContentBuffer.data);
												}

											}
											else if (currentFunction == analyzer.enums.symbol.string) {

												for (var k = 0; k < currentContentBuffer.data.length; k++) {
													if (currentContentBuffer.data[k] == analyzer.enums.symbol.add) {
														currentContentBuffer.data.splice(k, 1);
														k--;
													}
												}

												list = dictionary.pages.findWordsByKeywords(["string-only", "concatenation", "C-language"]);
												candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.string, 3);
												result = candidate.function(currentContentBuffer.data);
											}
											else {
												// Function Analyser here
												try {

													var candidate = dictionary.search.equivalentWord(targetLanguage, dictionary.pages.findWord(currentFunction, currentLanguage));
													result = candidate.function(currentContentBuffer.data);

												}
												catch (exception) {

												}
											}
										}
										else if (operationType == analyzer.enums.data.type.integer) {

											var list;
											var candidate;
											var result = "";

											if (currentFunction == analyzer.enums.data.type.integer) {
												result = currentContentBuffer.data.join(" ");
											}
											else if (currentFunction == analyzer.enums.data.type.float) {
												result = "((" + analyzer.enums.data.type.float + ")(" + currentContentBuffer.data.join(" ") + "))";
											}
											else if (currentFunction == analyzer.enums.symbol.string) {
												list = dictionary.pages.findWordsByKeywords(["integer-only", "data-type-conversion", "C-language"]);
												candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.string, 3);
												result = candidate.function(currentContentBuffer.data.join(" "));
											}
											else {
												//alert(currentContentBuffer.data.join("-"));
												try {

													var candidate = dictionary.search.equivalentWord(targetLanguage, dictionary.pages.findWord(currentFunction, currentLanguage));
													result = candidate.function(currentContentBuffer.data);

												}
												catch (exception) {

												}
											}
										}
										else if (operationType == analyzer.enums.data.type.float) {

											var list;
											var candidate;
											var result = "";
											if (currentFunction == analyzer.enums.data.type.integer) {
												result = "((" + analyzer.enums.data.type.integer + ")(" + currentContentBuffer.data.join(" ") + "))";
											}
											else if (currentFunction == analyzer.enums.symbol.float) {
												result = currentContentBuffer.data.join(" ");
											}
											else if (currentFunction == analyzer.enums.symbol.string) {

												list = dictionary.pages.findWordsByKeywords(["float-only", "data-type-conversion", "C-language"]);
												candidate = dictionary.search.list.byTypeAndCount(list, analyzer.enums.data.type.string, 3);
												result = candidate.function(currentContentBuffer.data.join(" "));
											}
											else {
												// Function Analyser here
												try {

													var candidate = dictionary.search.equivalentWord(targetLanguage, dictionary.pages.findWord(currentFunction, currentLanguage));
													result = candidate.function(currentContentBuffer.data);

												}
												catch (exception) {

												}
											}
										}

										if (stack.content.length == 0) {
											currentContentBuffer.result += result;
											contentBuffer.push(currentContentBuffer.result);
										}
										else {

											stack.content[stack.content.length - 1].data.push(result);
										}
									}

								}
								else {
									pushToBuffer = true;
								}

								if (pushToBuffer) {
									contentBuffer.push(line.values[j]);
								}
							}
							else if (line.tokens[j] == analyzer.enums.token.keyword) {
								if (j + 1 != line.tokens.length) {
									if (line.values[j + 1] == analyzer.enums.symbol.leftParenthesis) {
										stack.count += 1;
										stack.functionName.push(line.values[j]);
										stack.content.push(new StackContent());
									}
								}
							}

							if (stack.count > 0) {

								for (var k = lastContent.length; k < contentBuffer.length; k++) {

									stack.pushData(contentBuffer[k]);
								}

								contentBuffer = lastContent;
							}
						}
						//
						var content = "";
						for (var j = 0; j < contentBuffer.length; j++) {
							content += trimString(contentBuffer[j]);
							if (j + 1 < contentBuffer.length) {
								content += " ";
							}
						}
						line.contentStack.push(content);
					}
                }

				/*
					It was necessary to do multiple ifs instead of if and else
					because the first if checks whether the declaration was
					really for  int / float data types by checking the identifiers
					where initialized and are currently holding int / float data
				*/

                if (isStr && legal) {

                    var lastContent = "";
                    contentBuffer = [];
                    var stack = new ParenthesisStack();
					variable.type = analyzer.enums.data.type.string;
					analyzer.headers.insert("stdio.h");
					analyzer.headers.insert("stdlib.h");

                    if (newDeclaration) {

						analyzer.refactor.insertVariable(variable);
						contentBuffer.push(variable.type);
						line.contentStack.push("char *" + variable.name + " = " + " (char*)calloc(2048, sizeof(char))");
					}
					else {

						/*
							To-do: Put code refactoring here...
						*/
						analyzer.refactor.variableList[variable.lineDeclared] = variable;
					}

					action.pushVariableState(variable);
					line.actionStack.push(action);

					var stack = new ParenthesisStack();
					contentBuffer = [];
					var lastContent = "";

					for (var j = 0; j < line.tokens.length; j++) {

						lastContent = contentBuffer.slice();

						if (line.tokens[j] == analyzer.enums.token.constant) {
							try {

								var constantValue = "";
								if (!isInteger(line.values[j])) {
									constantValue += line.values[j] + "f";
								}
								else {
									constantValue += line.values[j];
								}

								contentBuffer.push(constantValue);
							}
							catch (exception) {

								contentBuffer.push(line.values[j]);
							}
						}
						else if (line.tokens[j] == analyzer.enums.token.identifier) {

							var identifier = null;
							for (var k = 0; k < line.actionStack.length; k++) {

								for (var l = 0; l < line.actionStack[k].state.length; l++) {

									if (line.values[j] == line.actionStack[k].state[l].name) {

										identifier = line.actionStack[k].state[l];
										break;
									}
								}
							}

							if (identifier != null) {
								if (identifier.lineDeclared != i && j != 0) {


									if (identifier.type != variable.type && stack.count == 0) {

										if (variable.type == analyzer.enums.data.type.integer ||
											variable.type == analyzer.enums.data.type.float) {
											contentBuffer.push("(" + variable.type + ")");
										}
										else if (identifier.type == analyzer.enums.data.type.string) {

											if (variable.type == analyzer.enums.data.type.integer) {
												analyzer.includer.function.parser.integer.string();
											}
											else if (variable.type == analyzer.enums.data.type.float) {
												analyzer.includer.function.parser.float.string();
											}
										}
									}
								}

								if (identifier.ambigious) {
									if (identifier.type == analyzer.enums.data.type.string) {
										contentBuffer.push(identifier.name + ".charValue");
									}
									else {
										contentBuffer.push(identifier.name+ "." + identifier.type + "Value");
									}
								}
								else {
									contentBuffer.push(identifier.name);
								}
							}

						}
						else if (line.tokens[j] == analyzer.enums.token.reserveWord) {

							if (line.values[j] == analyzer.enums.data.type.integer ||
								line.values[j] == analyzer.enums.data.type.float ||
								line.values[j] == analyzer.enums.symbol.string) {
								if (j + 1 != line.tokens.length) {
									if (line.values[j + 1] == analyzer.enums.symbol.leftParenthesis) {
										stack.count += 1;
										stack.functionName.push(line.values[j]);
										stack.content.push(new StackContent());
									}
								}
							}
						}
						else if (line.tokens[j] == analyzer.enums.token.stringConstant) {

							contentBuffer.push(line.values[j]);
						}
						else if (line.tokens[j] == analyzer.enums.token.symbol) {

							var pushToBuffer = false;

							if (line.values[j] == analyzer.enums.symbol.leftParenthesis) {

								if (stack.count > 0) {
									if (!((line.values[j - 1] == analyzer.enums.data.type.integer ||
										line.values[j - 1] == analyzer.enums.data.type.float ||
										line.values[j - 1] == analyzer.enums.symbol.string) ||
										line.tokens[j - 1] == analyzer.enums.token.keyword)) {
										pushToBuffer = true;
										stack.set++;
									}
								}
								else {
									pushToBuffer = true;
								}
							}
							else if (line.values[j] == analyzer.enums.symbol.rightParenthesis) {

								if (stack.set > 0) {
									stack.set--;
								}

								if (stack.count == 0) {
									pushToBuffer = true;
								}

								if (stack.set == 0 && stack.count > 0) {

									stack.count--;
									var currentFunction = stack.functionName.pop();
									var currentContentBuffer = stack.content.pop();
									var operationType = isEquation(currentContentBuffer.data.join(" "));
									//alert(operationType + "-" + currentFunction + " = " + currentContentBuffer.data.join(" "));
									if (operationType == analyzer.enums.data.type.string) {

										var list;
										var candidate;
										var result = "";

										if (currentFunction == analyzer.enums.data.type.integer) {

											if (currentContentBuffer.data.length > 1) {
												//alert(currentContentBuffer.data.join(","));
												for (var k = 0; k < currentContentBuffer.data.length; k++) {
													if (currentContentBuffer.data[k] == analyzer.enums.symbol.add) {
														currentContentBuffer.data.splice(k, 1);
														k--;
													}
												}
											}

											result = JSON.stringify(currentContentBuffer.data);
										}
										else if (currentFunction == analyzer.enums.data.type.float) {

											if (currentContentBuffer.data.length > 1) {

												for (var k = 0; k < currentContentBuffer.data.length; k++) {
													if (currentContentBuffer.data[k] == analyzer.enums.symbol.add) {
														currentContentBuffer.data.splice(k, 1);
														k--;
													}
												}
											}

											result = JSON.stringify(currentContentBuffer.data);

										}
										else if (currentFunction == analyzer.enums.symbol.string) {

											for (var k = 0; k < currentContentBuffer.data.length; k++) {
												if (currentContentBuffer.data[k] == analyzer.enums.symbol.add) {
													currentContentBuffer.data.splice(k, 1);
													k--;
												}
											}

											result = JSON.stringify(currentContentBuffer.data);
										}
										else {
											// Function Analyser here
											try {

												var candidate = dictionary.search.equivalentWord(targetLanguage, dictionary.pages.findWord(currentFunction, currentLanguage));
												result = candidate.function(currentContentBuffer.data);

											}
											catch (exception) {

											}
										}
									}
									else if (operationType == analyzer.enums.data.type.integer || operationType == analyzer.enums.data.type.float) {

										var list;
										var candidate;
										var result = "";

										if (currentFunction == analyzer.enums.data.type.integer) {
											result = currentContentBuffer.data.join(" ");
										}
										else if (currentFunction == analyzer.enums.data.type.float) {
											result = currentContentBuffer.data.join(" ");
										}
										else if (currentFunction == analyzer.enums.symbol.string) {
											result = currentContentBuffer.data.join(" ");
										}
										else {
											//alert(currentContentBuffer.data.join("-"));
											try {

												var candidate = dictionary.search.equivalentWord(targetLanguage, dictionary.pages.findWord(currentFunction, currentLanguage));
												result = candidate.function(currentContentBuffer.data);
											}
											catch (exception) {

											}
										}
									}


									if (stack.content.length == 0) {
										currentContentBuffer.result += result;
										contentBuffer.push(currentContentBuffer.result);
									}
									else {

										stack.content[stack.content.length - 1].data.push(result);
									}
								}
							}
							else {
								pushToBuffer = true;
							}

							if (pushToBuffer) {
								contentBuffer.push(line.values[j]);
							}
						}
						else if (line.tokens[j] == analyzer.enums.token.keyword) {

							if (j + 1 != line.tokens.length) {
								if (line.values[j + 1] == analyzer.enums.symbol.leftParenthesis) {
									stack.count += 1;
									stack.functionName.push(line.values[j]);
									stack.content.push(new StackContent());
								}
							}
						}

						if (stack.count > 0) {

							for (var k = lastContent.length; k < contentBuffer.length; k++) {

								stack.pushData(contentBuffer[k]);
							}

							contentBuffer = lastContent;
						}
					}

					//line.actionStack.push();

					var paramList = [];
					var strBuffer = "";
					var content = "";

					for (var j = 0; j < contentBuffer.length; j++) {

						if (j == 0) {
							strBuffer = contentBuffer[j];
						}
						else {

							if (!(contentBuffer[j] == analyzer.enums.symbol.add || contentBuffer[j] == analyzer.enums.symbol.equal)) {
								try {

									var arrayList = JSON.parse(contentBuffer[j]);
									if (typeof(arrayList) === analyzer.enums.data.type.object) {
										for (var k = 0; k < arrayList.length; k++) {
											paramList.push(arrayList[k]);
										}
									}
									else {
										paramList.push(contentBuffer[j]);
									}

								}
								catch (exception) {

									paramList.push(contentBuffer[j]);
								}
							}
						}
					}

					line.contentStack.push(dictionary.pages.findWord("sprintf", "C-language").function(strBuffer, paramList));
					//alert(variable.name + " " + variable.type);
                }

				if (!legal) {

					if (analyzer.options.detailedErrors) {
						line.contentStack.push("//Invalid Syntax (" + line.values.join(" ") + ")");
					}
				}
            }

            buffer.push(line);
		}

		for (var i = 0; i < analyzer.headers.list.length; i++) {
			analyzer.variables.headerString += "#include <" + analyzer.headers.list[i] + ">\n";
		}

		for (var i = 0; i < analyzer.defines.list.length; i++) {
			analyzer.variables.defineString += "#define " + analyzer.defines.list[i].name + " " + analyzer.defines.list[i].content  +"\n";
		}

		for (var i = 0; i < analyzer.structures.list.length; i++) {
			analyzer.variables.struct += "\ntypedef struct {\n" + analyzer.structure.list[i].content + "} " + analyzer.structure.list[i].name + ";\n\n";
		}

		for (var i = 0; i < analyzer.unions.list.length; i++) {
			analyzer.variables.union += "\ntypedef union {\n" + analyzer.unions.list[i].content + "} " + analyzer.unions.list[i].name + ";\n\n";
		}

		for (var i = 0; i < analyzer.functions.list.length; i++) {
			analyzer.variables.functions += analyzer.functions.list[i].type + " " + analyzer.functions.list[i].name + " (" + analyzer.functions.list[i].param + ") {\n" + analyzer.functions.list[i].content + "}\n\n";
		}

		for (var i = 0; i < buffer.length; i++) {
			for (var j = 0; j < buffer[i].contentStack.length; j++) {
				bodyText += "\t" + buffer[i].contentStack[j] + ";\n";
			}
		}

		result = analyzer.variables.comment + analyzer.variables.headerString +
		"\n" + analyzer.variables.defineString + "\n" + analyzer.variables.struct + analyzer.variables.union +
        analyzer.variables.functions + analyzer.variables.bodyBegin + bodyText +
		analyzer.variables.bodyEnd;

		analyzer.variables.result = result;

	},

	options: {

		detailedErrors: true
	}
}
