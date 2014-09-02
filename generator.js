 /**
 *
 * @source: generator.js
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

function Variable (Vname, Vtype, Vline, Vambigious, Vtemp) {


	if (typeof(Vambigious) === "undefined") {
		Vambigious = false;
	}

	if (typeof(Vtemp) === "undefined") {
		Vtemp = false;
	}

	this.name = Vname;
	this.type = Vtype;
	this.lineDeclared = Vline;
	this.ambigious = Vambigious;
	this.temporary = Vtemp;
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
			this.state.push(clone.variable(variable));
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


function Line (Lline, Ltoks, Lval, LtokIDs) {

    this.length = Ltoks.length;
	this.lineNumber = Lline;
	this.tokens = Ltoks;
	this.values = Lval;
	this.id = LtokIDs;

	this.data = "";
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

function ParseData (Pmap, Psymbol) {

	this.map = Pmap;
	this.symbol = Psymbol;
}

var generator = {

	enums: {

		c: {

			data: {

				type: {

					integer: "int",
					float: "float",
					string: "string",
					object: "object",
					void: "none"
				}
			},

			symbol: {

				string: "char *"
			}
		},

		python: {

			data: {

				type: {

					integer: "int",
					float: "float",
					string: "string",
					object: "object",
					void: "none"
				}
			},

			symbol: {

				string: "str"
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
			rightParenthesis: ")"

        },

		token: {

			keyword: "kwd",
			identifier: "id",
			symbol: "symb",
			constant: "const",
			reserveWord: "res",
			stringConstant: "sConst",
			tab: "tab",
		}


	},

	includer: {

		dataType: {

			ambigious: function() {

				generator.unions.insert("ambigious", "\tint *intValue;\n\tfloat *floatValue;\n\tchar *charValue;\n\tvoid *voidValue;\n");
			}
		},

		function: {

			parser: {

				float: {

					string: function() {

						generator.headers.insert("stdio.h");
						generator.functions.insert("toFloat_str",
							"\tfloat variable = 0;\n\tsscanf(str, \"%d\", &variable);\n\treturn variable;\n",
							"float", "const char *str"
						);
					}
				},

				integer: {

					string: function() {

						generator.headers.insert("stdio.h");
						generator.functions.insert("toInteger_str",
							"\tint variable = 0;\n\tsscanf(str, \"%d\", &variable);\n\treturn variable;\n",
							"int", "const char *str"
						);
					}
				},

				string: {

					integer: function() {

						generator.headers.insert("stdio.h");
						generator.headers.insert("stdlib.h");
						generator.headers.insert("gc.h");
						generator.defines.insert("malloc(n)", "GC_MALLOC(n)");
						generator.defines.insert("calloc(m,n)", "GC_MALLOC(m*n)");
						generator.defines.insert("free(p)", "GC_FREE(p)");
						generator.defines.insert("realloc(n)", "GC_REALLOC(n)");
						generator.functions.insert("toString_int",
							"\tchar *buffer = (char*)calloc(2048, sizeof(char));\n\tsprintf(buffer, \"%d\", num);\n\treturn buffer;\n",
							"char *", "int num"
						);
					},

					float: function() {

						generator.headers.insert("stdio.h");
						generator.headers.insert("stdlib.h");
						generator.headers.insert("gc.h");
						generator.defines.insert("malloc(n)", "GC_MALLOC(n)");
						generator.defines.insert("calloc(m,n)", "GC_MALLOC(m*n)");
						generator.defines.insert("free(p)", "GC_FREE(p)");
						generator.defines.insert("realloc(n)", "GC_REALLOC(n)");
						generator.functions.insert("toString_float",
							"\tchar *buffer = (char*)calloc(2048, sizeof(char));\n\tsprintf(buffer, \"%f\", num);\n\treturn buffer;\n",
							"char *", "float num"
						);
					},

					concatenator: function() {

						generator.headers.insert("stdio.h");
						generator.headers.insert("stdlib.h");
						generator.headers.insert("stdarg.h");
						generator.headers.insert("string.h");
						generator.headers.insert("gc.h");
						generator.defines.insert("malloc(n)", "GC_MALLOC(n)");
						generator.defines.insert("calloc(m,n)", "GC_MALLOC(m*n)");
						generator.defines.insert("free(p)", "GC_FREE(p)");
						generator.defines.insert("realloc(n)", "GC_REALLOC(n)");
						generator.functions.insert("strConcat",
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
			for (var i = 0; i < generator.defines.list.length; i++) {

				if (generator.defines.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				generator.defines.list.push(struct);
			}
		},

		clear: function() {

			generator.variables.defineString = "";
			generator.defines.list = new Array();
		}
	},

	headers: {

		list: Array(),

		insert: function(value) {

			var found = false;
			for (var i = 0; i < generator.headers.list.length; i++) {

				if (generator.headers.list[i] == value) {
					found = true;
				}
			}

			if (!found) {
				generator.headers.list.push(value);
			}
		},

		clear: function() {

			generator.variables.headerString = "";
			generator.headers.list = new Array();
		}
	},

	structures: {

		list: Array(),
		insert: function(name, content) {

			var found = false;
			var struct = new Structure(name, content);
			for (var i = 0; i < generator.structures.list.length; i++) {

				if (generator.structures.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				generator.structures.list.push(struct);
			}
		},
		clear: function() {

			generator.variables.struct = "";
			generator.structures.list = new Array();
		}
	},

	unions: {

		list: Array(),
		insert: function(name, content) {

			var found = false;
			var struct = new Structure(name, content);
			for (var i = 0; i < generator.unions.list.length; i++) {

				if (generator.unions.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				generator.unions.list.push(struct);
			}
		},

		clear: function() {

			generator.variables.union = "";
			generator.unions.list = new Array();
		}
	},

	functions: {

		list: Array(),
		insert: function(name, content, type, parameter) {

			var found = false;
			var struct = new Func(name, parameter, type, content);
			for (var i = 0; i < generator.functions.list.length; i++) {

				if (generator.functions.list[i].name == struct.name) {
					found = true;
				}
			}

			if (!found) {
				generator.functions.list.push(struct);
			}
		},
		clear: function() {

			generator.variables.functions = "";
			generator.functions.list = new Array();
		}
	},

	refactor:{

		variableList: [],

		findVariable: function (name) {

			for (var i = 0; i < generator.refactor.variableList.length; i++) {
				if (generator.refactor.variableList[i].name == name) {
					return i;
				}
			}

			return -1;
		},

		getVariable: function (name) {

			var index = generator.refactor.findVariable(name);
			if (index != -1) {

				return generator.refactor.variableList[index];
			}

			throw "Not found variable(" + name + ") on refactor list";
		},

		insertVariable: function (variable) {

			var found = generator.refactor.findVariable(variable.name);
			if (found == -1) {
				generator.refactor.variableList.push(variable);
			}
		},

		clear: function () {

			generator.refactor.variableList = new Array();
		},

	},

	generateCode: function (currentLanguage, targetLanguage, parseData) {

		var string = "";
		var bodyText = "";
		var result = "";
		var buffer = new Array();
		//var currentLanguage = "Python-language";
		//var targetLanguage = "C-language";


		generator.headers.clear();
		generator.defines.clear();
		generator.refactor.clear();
		generator.unions.clear();
		generator.structures.clear();
		generator.functions.clear();

		for (var i = 0; i < parseData.symbol.length; i++) {

            var tokens = tokenizer.detokenize(parseData.map[i]);
            var tokenIDs = tokens.slice();
            var values = tokens.slice();

            for (var j = 0; j < values.length; j++) {

                var currentSelector = values[j].replace(/\d+/g, '');
                var currentIndex 	= values[j].replace(/[^0-9.]/g, '');
                tokens[j] = currentSelector;
                if (currentSelector == generator.enums.token.keyword) {

                    values[j] = tokenizer.token.keyword[currentIndex - 1].value;
                }
                else if (currentSelector == generator.enums.token.identifier) {

                    values[j] = tokenizer.token.identifier[currentIndex - 1].value;
                }
                else if (currentSelector == generator.enums.token.symbol) {

                    values[j] = tokenizer.token.symbol[currentIndex - 1].value;
                }
                else if (currentSelector == generator.enums.token.constant) {

                    values[j] = tokenizer.token.constant[currentIndex - 1].value;
                }
                else if (currentSelector == generator.enums.token.reserveWord) {

                    values[j] = tokenizer.token.reserveWord[currentIndex - 1].value;
                }
                else if (currentSelector == generator.enums.token.stringConstant) {

                    values[j] = "\""
                    + tokenizer.token.string[currentIndex - 1].value + "\"";
                }
                else if (currentSelector == generator.enums.token.tab) {
                	values[j] = "\t";
                }
            }

			var action = new Action(parseData.symbol[i]);
            var line = new Line(i, tokens.slice(), values, tokenIDs);
            var legal = true;
            if (action.type == generator.enums.action.declaration ||
                action.type == generator.enums.action.stringDeclaration) {

				var isStr =
					action.type == generator.enums.action.declaration ? false: true;
				var contentBuffer = [];
				var newDeclaration = false;
                var variable = generator.refactor.findVariable(values[0]);



                if (variable == -1) {

					variable = new Variable(values[0], 0, i);
					newDeclaration = true;
                }
                else {

					variable = clone.variable(generator.refactor.variableList[variable]);
                }

                if (!isStr) {

					var typeCasted = false;
					var numericVariables = 0;

					for (var j = 2; j < line.tokens.length; j++) {

						if (line.tokens[j] == generator.enums.token.identifier) {

							try {

								var tmpVariable =
									generator.refactor.getVariable(line.values[j]);

								action.pushVariableState(tmpVariable);
								if (tmpVariable.type == generator.enums.c.data.type.integer ||
									tmpVariable.type == generator.enums.c.data.type.float ) {

									if (variable.type == 0 ||
										variable.type != generator.enums.c.data.type.float) {

										variable.type = tmpVariable.type;
									}

									numericVariables += 1;
								}
								else {

									if (!typeCasted) {
										isStr = true;
										variable.type = generator.enums.c.data.type.string;
									}

								}
							}
							catch (exception) {

								legal = false;
							}
						}
						else if (line.tokens[j] == generator.enums.token.constant) {

							if (variable.type == 0 ||
								variable.type != generator.enums.c.data.type.float) {

								try {

									variable.type = isInteger(line.values[j]) ?
										generator.enums.c.data.type.integer :
										generator.enums.c.data.type.float;
									numericVariables += 1;
								}
								catch (exception) {
									legal = false;
								}
							}
							else {

								try {
									isInteger(line.values[j]);
								}
								catch (exception) {
									legal = false;
								}
							}
						}
						else if (line.tokens[j] == generator.enums.token.reserveWord) {

							if (line.values[j] == generator.enums.c.data.type.integer ||
								line.values[j] == generator.enums.c.data.type.float) {

								if (variable.type == 0 ||
									variable.type != generator.enums.c.data.type.float) {

									variable.type = line.values[j]
										== generator.enums.c.data.type.integer ?
										generator.enums.c.data.type.integer :
										generator.enums.c.data.type.float;
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

							generator.refactor.insertVariable(variable);
							contentBuffer.push(variable.type);
						}
						else {

							/*
								To-do: Put code refactoring here...
							*/
							if (variable.ambigious == false) {

								generator.includer.dataType.ambigious();
								var foundDeclarationLine = false;

								if (variable.type != generator.refactor.variableList[variable.lineDeclared].type) {

									for (var j = 0; j < buffer.length; j++) {

										var tmpVariableHolder = null;
										var foundDecl =  null;

										for (var k = 0; k < buffer[j].actionStack.length; k++) {

											for (var l = 0; l < buffer[j].actionStack[k].state.length; l++) {

												if (buffer[j].actionStack[k].state[l].name == variable.name) {
													tmpVariableHolder = clone.variable(buffer[j].actionStack[k].state[l]);
													foundDecl = buffer[j].actionStack[k].type;
												}
											}
										}

										if (foundDeclarationLine == false && tmpVariableHolder != null) {

											for (var k = 0; k < buffer[j].values.length; k++) {

												if (buffer[j].values[k] == variable.name) {

													var content = "";
													var allocContent = "";
													foundDeclarationLine = true;

													if (tmpVariableHolder.type == generator.enums.c.data.type.string) {
														buffer[j].contentStack.shift();
													}
													else {
														/*
															Improve refactoring process here
														*/
													}

													if (tmpVariableHolder.type == generator.enums.c.data.type.string) {

														content += tmpVariableHolder.name + ".charValue";
														allocContent = "( char * ) calloc(2048, sizeof( char ) )";
													}
													else {

														content += "*" + tmpVariableHolder.name + "." + tmpVariableHolder.type + "Value";
														allocContent = "( " + tmpVariableHolder.type + " * ) calloc(1, sizeof( " + tmpVariableHolder.type + " ) )";
													}
													buffer[j].contentStack.unshift(content + " = " + allocContent);
													buffer[j].contentStack.unshift("ambigious " + variable.name);
													buffer[j].contentStack.push("free(" + content + ")");
													continue;
												}
											}
										}
										else if (tmpVariableHolder != null) {

											for (var k = 0; k < buffer[j].contentStack.length; k++) {

												var content = "";
												var currentLine = buffer[j].contentStack[k];

												if (tmpVariableHolder.type == generator.enums.c.data.type.string) {

													content += tmpVariableHolder.name + ".charValue";
												}
												else {

													content += "*" + tmpVariableHolder.name + "." + tmpVariableHolder.type + "Value";
												}

												for (var l = 0; l < buffer[j].tokens.length; l++) {

													if (buffer[j].tokens[l] == generator.enums.token.stringConstant) {
														currentLine = currentLine.replace(buffer[j].values[l], buffer[j].id[l]);
													}
												}

												currentLine = currentLine.replace(RegExp('\\b' + tmpVariableHolder.name + '\\b','g'), content);

												for (var l = 0; l < buffer[j].tokens.length; l++) {

													if (buffer[j].tokens[l] == generator.enums.token.stringConstant) {
														currentLine = currentLine.replace(buffer[j].id[l], buffer[j].values[l]);
													}
												}

												buffer[j].contentStack[k] = currentLine;
											}

											buffer[j].contentStack.push("free(" + content + ")");
										}
									}

									variable.ambigious = true;
								}
							}

							generator.refactor.variableList[variable.lineDeclared] = variable;
						}

						action.pushVariableState(variable);
						line.actionStack.push(action);

						// Code Generation Phase

						var stack = new ParenthesisStack();
						var lastContent = "";

						for (var j = 0; j < line.tokens.length; j++) {

							lastContent = contentBuffer.slice();

							if (line.tokens[j] == generator.enums.token.constant) {
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
							else if (line.tokens[j] == generator.enums.token.identifier) {

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

											if (variable.type == generator.enums.c.data.type.integer ||
												variable.type == generator.enums.c.data.type.float) {
												contentBuffer.push("(" + variable.type + ")");
											}
											else if (identifier.type == generator.enums.c.data.type.string) {

												if (variable.type == generator.enums.c.data.type.integer) {
													generator.includer.function.parser.integer.string();
												}
												else if (variable.type == generator.enums.c.data.type.float) {
													generator.includer.function.parser.float.string();
												}
											}
										}
									}

									if (identifier.ambigious) {
										if (identifier.type == generator.enums.c.data.type.string) {
											contentBuffer.push(identifier.name + ".charValue");
										}
										else {
											contentBuffer.push("*" + identifier.name+ "." + identifier.type + "Value");
										}

										//To do: get previous variable type and do a free statement
									}
									else {
										contentBuffer.push(identifier.name);
									}
								}
							}
							else if (line.tokens[j] == generator.enums.token.reserveWord) {

								if (line.values[j] == generator.enums.c.data.type.integer ||
									line.values[j] == generator.enums.c.data.type.float ||
									line.values[j] == generator.enums.python.symbol.string) {
									if (j + 1 != line.tokens.length) {
										if (line.values[j + 1] == generator.enums.symbol.leftParenthesis) {
											stack.count += 1;
											stack.functionName.push(line.values[j]);
											stack.content.push(new StackContent());
										}
									}
								}

							}
							else if (line.tokens[j] == generator.enums.token.stringConstant) {

								contentBuffer.push(line.values[j]);
							}
							else if (line.tokens[j] == generator.enums.token.symbol) {

								var pushToBuffer = false;

								if (line.values[j] == generator.enums.symbol.leftParenthesis) {

									if (stack.count > 0) {
										if (!((line.values[j - 1] == generator.enums.c.data.type.integer ||
											line.values[j - 1] == generator.enums.c.data.type.float ||
											line.values[j - 1] == generator.enums.python.symbol.string) ||
											line.tokens[j - 1] == generator.enums.token.keyword)) {
											pushToBuffer = true;
											stack.set++;
										}
									}
									else {
										pushToBuffer = true;
									}
								}
								else if (line.values[j] == generator.enums.symbol.rightParenthesis) {

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
										if (operationType == generator.enums.c.data.type.string) {

											var list;
											var candidate;
											var result = "";

											if (currentFunction == generator.enums.c.data.type.integer) {

												if (currentContentBuffer.data.length > 1) {
													//alert(currentContentBuffer.data.join(","));
													for (var k = 0; k < currentContentBuffer.data.length; k++) {
														if (currentContentBuffer.data[k] == generator.enums.symbol.add) {
															currentContentBuffer.data.splice(k, 1);
															k--;
														}
													}

													list = dictionary.pages.findWordsByKeywords(["string-only", "concatenation", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.string, 3);
													result = candidate.function(currentContentBuffer.data);

													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.integer, 3);
													result = candidate.function(result);
												}
												else {
													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.integer, 3);
													result = candidate.function(currentContentBuffer.data);
												}
											}
											else if (currentFunction == generator.enums.c.data.type.float) {

												if (currentContentBuffer.data.length > 1) {

													for (var k = 0; k < currentContentBuffer.data.length; k++) {
														if (currentContentBuffer.data[k] == generator.enums.symbol.add) {
															currentContentBuffer.data.splice(k, 1);
															k--;
														}
													}

													list = dictionary.pages.findWordsByKeywords(["string-only", "concatenation", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.string, 3);
													result = candidate.function(currentContentBuffer.data);

													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.float, 3);
													result = candidate.function(result);
												}
												else {
													list = dictionary.pages.findWordsByKeywords(["string-only", "data-type-conversion", "C-language"]);
													candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.float, 3);
													result = candidate.function(currentContentBuffer.data);
												}

											}
											else if (currentFunction == generator.enums.python.symbol.string) {

												for (var k = 0; k < currentContentBuffer.data.length; k++) {
													if (currentContentBuffer.data[k] == generator.enums.symbol.add) {
														currentContentBuffer.data.splice(k, 1);
														k--;
													}
												}

												list = dictionary.pages.findWordsByKeywords(["string-only", "concatenation", "C-language"]);
												candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.string, 3);
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
										else if (operationType == generator.enums.c.data.type.integer) {

											var list;
											var candidate;
											var result = "";

											if (currentFunction == generator.enums.c.data.type.integer) {
												result = currentContentBuffer.data.join(" ");
											}
											else if (currentFunction == generator.enums.c.data.type.float) {
												result = "((" + generator.enums.c.data.type.float + ")(" + currentContentBuffer.data.join(" ") + "))";
											}
											else if (currentFunction == generator.enums.python.symbol.string) {
												list = dictionary.pages.findWordsByKeywords(["integer-only", "data-type-conversion", "C-language"]);
												candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.string, 3);
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
										else if (operationType == generator.enums.c.data.type.float) {

											var list;
											var candidate;
											var result = "";
											if (currentFunction == generator.enums.c.data.type.integer) {
												result = "((" + generator.enums.c.data.type.integer + ")(" + currentContentBuffer.data.join(" ") + "))";
											}
											else if (currentFunction == generator.enums.symbol.float) {
												result = currentContentBuffer.data.join(" ");
											}
											else if (currentFunction == generator.enums.python.symbol.string) {

												list = dictionary.pages.findWordsByKeywords(["float-only", "data-type-conversion", "C-language"]);
												candidate = dictionary.search.list.byTypeAndCount(list, generator.enums.c.data.type.string, 3);
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
							else if (line.tokens[j] == generator.enums.token.keyword) {
								if (j + 1 != line.tokens.length) {
									if (line.values[j + 1] == generator.enums.symbol.leftParenthesis) {
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
					variable.type = generator.enums.c.data.type.string;
					generator.headers.insert("stdio.h");
					generator.headers.insert("stdlib.h");

                    if (newDeclaration) {

						generator.refactor.insertVariable(variable);
						contentBuffer.push(variable.type);
						line.contentStack.push("char *" + variable.name + " = " + " (char*)calloc(2048, sizeof(char))");
					}
					else {

						if (variable.ambigious == false) {

							generator.includer.dataType.ambigious();
							var foundDeclarationLine = false;

							if (variable.type != generator.refactor.variableList[variable.lineDeclared].type) {

								for (var j = 0; j < buffer.length; j++) {

									var tmpVariableHolder = null;
									var foundDecl =  null;

									for (var k = 0; k < buffer[j].actionStack.length; k++) {

										for (var l = 0; l < buffer[j].actionStack[k].state.length; l++) {

											if (buffer[j].actionStack[k].state[l].name == variable.name) {
												tmpVariableHolder = clone.variable(buffer[j].actionStack[k].state[l]);
												foundDecl = buffer[j].actionStack[k].type;
											}
										}
									}

									if (foundDeclarationLine == false && tmpVariableHolder != null) {

										for (var k = 0; k < buffer[j].values.length; k++) {

											if (buffer[j].values[k] == variable.name) {

												var content = "";
												var allocContent = "";
												foundDeclarationLine = true;

												if (tmpVariableHolder.type == generator.enums.c.data.type.string) {
													buffer[j].contentStack.shift();
												}
												else {
													/*
														Improve refactoring process here
													*/
												}

												if (tmpVariableHolder.type == generator.enums.c.data.type.string) {

													content += tmpVariableHolder.name + ".charValue";
													allocContent = "( char * ) calloc(2048, sizeof( char ) )";
												}
												else {

													content += "*" + tmpVariableHolder.name + "." + tmpVariableHolder.type + "Value";
													allocContent = "( " + tmpVariableHolder.type + " * ) calloc(1, sizeof( " + tmpVariableHolder.type + " ) )";
												}
												buffer[j].contentStack.unshift(content + " = " + allocContent);
												buffer[j].contentStack.unshift("ambigious " + variable.name);
												buffer[j].contentStack.push("free(" + content + ")");
												continue;
											}
										}
									}
									else if (tmpVariableHolder != null) {

										for (var k = 0; k < buffer[j].contentStack.length; k++) {

											var content = "";
											var currentLine = buffer[j].contentStack[k];

											if (tmpVariableHolder.type == generator.enums.c.data.type.string) {

												content += tmpVariableHolder.name + ".charValue";
											}
											else {

												content += "*" + tmpVariableHolder.name + "." + tmpVariableHolder.type + "Value";
											}

											for (var l = 0; l < buffer[j].tokens.length; l++) {

												if (buffer[j].tokens[l] == generator.enums.token.stringConstant) {
													currentLine = currentLine.replace(buffer[j].values[l], buffer[j].id[l]);
												}
											}

											currentLine = currentLine.replace(RegExp('\\b' + tmpVariableHolder.name + '\\b','g'), content);

											for (var l = 0; l < buffer[j].tokens.length; l++) {

												if (buffer[j].tokens[l] == generator.enums.token.stringConstant) {
													currentLine = currentLine.replace(buffer[j].id[l], buffer[j].values[l]);
												}
											}

											buffer[j].contentStack[k] = currentLine;
										}
										buffer[j].contentStack.push("free(" + content + ")");
									}
								}

								variable.ambigious = true;
							}
						}


						generator.refactor.variableList[variable.lineDeclared] = variable;
					}

					action.pushVariableState(variable);
					line.actionStack.push(action);

					var stack = new ParenthesisStack();
					contentBuffer = [];
					var lastContent = "";

					for (var j = 0; j < line.tokens.length; j++) {

						lastContent = contentBuffer.slice();

						if (line.tokens[j] == generator.enums.token.constant) {
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

								legal = false;
							}
						}
						else if (line.tokens[j] == generator.enums.token.identifier) {

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

										if (variable.type == generator.enums.c.data.type.integer ||
											variable.type == generator.enums.c.data.type.float) {
											contentBuffer.push("(" + variable.type + ")");
										}
										else if (identifier.type == generator.enums.c.data.type.string) {

											if (variable.type == generator.enums.c.data.type.integer) {
												generator.includer.function.parser.integer.string();
											}
											else if (variable.type == generator.enums.c.data.type.float) {
												generator.includer.function.parser.float.string();
											}
										}
									}
								}

								if (identifier.ambigious) {
									if (identifier.type == generator.enums.c.data.type.string) {
										contentBuffer.push(identifier.name + ".charValue");
									}
									else {
										contentBuffer.push(identifier.name+ "." + identifier.type + "Value");
									}

									//To do: get previous variable type and do a free statement
								}
								else {
									contentBuffer.push(identifier.name);
								}
							}

						}
						else if (line.tokens[j] == generator.enums.token.reserveWord) {

							if (line.values[j] == generator.enums.c.data.type.integer ||
								line.values[j] == generator.enums.c.data.type.float ||
								line.values[j] == generator.enums.python.symbol.string) {
								if (j + 1 != line.tokens.length) {
									if (line.values[j + 1] == generator.enums.symbol.leftParenthesis) {
										stack.count += 1;
										stack.functionName.push(line.values[j]);
										stack.content.push(new StackContent());
									}
								}
							}
						}
						else if (line.tokens[j] == generator.enums.token.stringConstant) {

							contentBuffer.push(line.values[j]);
						}
						else if (line.tokens[j] == generator.enums.token.symbol) {

							var pushToBuffer = false;

							if (line.values[j] == generator.enums.symbol.leftParenthesis) {

								if (stack.count > 0) {
									if (!((line.values[j - 1] == generator.enums.c.data.type.integer ||
										line.values[j - 1] == generator.enums.c.data.type.float ||
										line.values[j - 1] == generator.enums.python.symbol.string) ||
										line.tokens[j - 1] == generator.enums.token.keyword)) {
										pushToBuffer = true;
										stack.set++;
									}
								}
								else {
									pushToBuffer = true;
								}
							}
							else if (line.values[j] == generator.enums.symbol.rightParenthesis) {

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
									if (operationType == generator.enums.c.data.type.string) {

										var list;
										var candidate;
										var result = "";

										if (currentFunction == generator.enums.c.data.type.integer) {

											if (currentContentBuffer.data.length > 1) {
												//alert(currentContentBuffer.data.join(","));
												for (var k = 0; k < currentContentBuffer.data.length; k++) {
													if (currentContentBuffer.data[k] == generator.enums.symbol.add) {
														currentContentBuffer.data.splice(k, 1);
														k--;
													}
												}
											}

											result = JSON.stringify(currentContentBuffer.data);
										}
										else if (currentFunction == generator.enums.c.data.type.float) {

											if (currentContentBuffer.data.length > 1) {

												for (var k = 0; k < currentContentBuffer.data.length; k++) {
													if (currentContentBuffer.data[k] == generator.enums.symbol.add) {
														currentContentBuffer.data.splice(k, 1);
														k--;
													}
												}
											}

											result = JSON.stringify(currentContentBuffer.data);

										}
										else if (currentFunction == generator.enums.python.symbol.string) {

											for (var k = 0; k < currentContentBuffer.data.length; k++) {
												if (currentContentBuffer.data[k] == generator.enums.symbol.add) {
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
									else if (operationType == generator.enums.c.data.type.integer || operationType == generator.enums.c.data.type.float) {

										var list;
										var candidate;
										var result = "";

										if (currentFunction == generator.enums.c.data.type.integer) {
											result = currentContentBuffer.data.join(" ");
										}
										else if (currentFunction == generator.enums.c.data.type.float) {
											result = currentContentBuffer.data.join(" ");
										}
										else if (currentFunction == generator.enums.python.symbol.string) {
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
						else if (line.tokens[j] == generator.enums.token.keyword) {

							if (j + 1 != line.tokens.length) {
								if (line.values[j + 1] == generator.enums.symbol.leftParenthesis) {
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

							if (!(contentBuffer[j] == generator.enums.symbol.add || contentBuffer[j] == generator.enums.symbol.equal)) {
								try {

									var arrayList = JSON.parse(contentBuffer[j]);
									if (typeof(arrayList) === generator.enums.c.data.type.object) {
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

					if (generator.options.detailedErrors) {
						line.contentStack = [];
						line.contentStack.push("//Invalid Syntax (" + line.values.join(" ") + ")");
					}
				}
            }

            buffer.push(line);
		}

		for (var i = 0; i < generator.headers.list.length; i++) {
			generator.variables.headerString += "#include <" + generator.headers.list[i] + ">\n";
		}

		for (var i = 0; i < generator.defines.list.length; i++) {
			generator.variables.defineString += "#define " + generator.defines.list[i].name + " " + generator.defines.list[i].content  +"\n";
		}

		for (var i = 0; i < generator.structures.list.length; i++) {
			generator.variables.struct += "\ntypedef struct {\n" + generator.structure.list[i].content + "} " + generator.structure.list[i].name + ";\n\n";
		}

		for (var i = 0; i < generator.unions.list.length; i++) {
			generator.variables.union += "\ntypedef union {\n" + generator.unions.list[i].content + "} " + generator.unions.list[i].name + ";\n\n";
		}

		for (var i = 0; i < generator.functions.list.length; i++) {
			generator.variables.functions += generator.functions.list[i].type + " " + generator.functions.list[i].name + " (" + generator.functions.list[i].param + ") {\n" + generator.functions.list[i].content + "}\n\n";
		}

		for (var i = 0; i < buffer.length; i++) {
			for (var j = 0; j < buffer[i].contentStack.length; j++) {
				bodyText += "\t" + buffer[i].contentStack[j] + ";\n";
			}
		}

		result = generator.variables.comment + generator.variables.headerString +
		"\n" + generator.variables.defineString + "\n" + generator.variables.struct + generator.variables.union +
        generator.variables.functions + generator.variables.bodyBegin + bodyText +
		generator.variables.bodyEnd;

		return result;

	},

	options: {

		detailedErrors: true
	}
}
