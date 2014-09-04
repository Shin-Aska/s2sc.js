/**
 *
 * @source: parser.js
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

// Grammar Object Representation in Javascript

function Grammar (equivalent, condition, level, rule) {

	this.representation = equivalent;
	this.condition = condition;
	this.priority = level;
	this.rule = rule;
}

// This is the object that represents a row during parsing

function ParseHistoryRow (buffer, unscanned, next, action) {

	this.buffer = buffer;
	this.unscanned = unscanned;
	this.next = next;
	this.action = action;
}

// Trims the string and removes the whitespaces from beginning and end of a sentence.



var parser = {

	grammar : [

		// Action check triggers


		"func <- kwd sConst F | kwd result F | kwd id F",
		"func <- func + func | func + sConst",

		"decl <- id = result F | id = const F | id = id F",
		//"decl <- id hack F",

		"cmpAsgn <- id += result F | id += const F | id += id F",
		"cmpAsgn <- id *= result F | id *= const F | id *= id F",
		"cmpAsgn <- id -= result F | id -= const F | id -= id F",
		"cmpAsgn <- id /= result F | id /= const F | id /= id F",
		"cmpAsgn <- id cmpAsgnHack F",

		// Temporary Hack to get id = id working
		//"hack <- = id F",
		//"cmpAsgnHack <- += id F",
		//"cmpAsgnHack <- -= id F",
		//"cmpAsgnHack <- *= id F",
		//"cmpAsgnHack <- /= id F",

		"strDecl <- id = sConst F | id += sConst F",
		"funcStrDecl <- strDecl + func",

		// For decimal
		"const <- int ( sConst ) | int result | float ( sConst ) | float result",

		// String Operation
		"sConst <- id + sConst | sConst + id | sConst + sConst",
		"sConst <- str ( sConst ) | str result",

		//Function Return Types
		"id <- undefined",
		"undefined <- kwd ( sConst ) | kwd result | kwd ( paramList ) | kwd ( )",
		"paramList <- result , result | id , id | sConst , sConst",
		"paramList <- result , id | id , result | id , sConst",
		"paramList <- sConst , result | sConst , id | result , sConst",
		"paramList <- const , id | id , const | sConst , const",
		"paramList <- const , result | result , const | const, sConst | const , const",
		"paramList <- paramList , id | paramList , sConst | paramLi st , result | paramList , const",

		// Arithmetic cases
		"product <- id * id | const * const | id * const | const * id | result * id | id * result | result * const | const * result",
		"product <- product * id | product * const | id * product | const * product | product * product | product * result | result * product | result * result",

		"quotient <- id / id | const / const | id / const | const / id | result / id | id / result | result / const | const / result",
		"quotient <- quotient / id | quotient / const | id / quotient | const / quotient | quotient / quotient | quotient / result | result / quotient | result / result",

		"sum <- id + id | const + const | id + const | const + id | result + id | id + result | result + const | const + result",
		"sum <- sum + const | sum + id | id + sum | const + sum | sum + result | result + sum | result + result",

		"difference <- id - id | const - const | id - const | const - id | result - id | id - result | result - const | const - result",
		"difference <- difference - id | difference - const | id - difference | const - difference | difference - result | result - difference | result - result",

		"result <- product | quotient | sum | difference | ( const ) | ( result ) | ( id )"


	],

/*
	Rule object -> contains enumerations for rules in a grammar
*/

	rule : {

		default: {

			value: 0,
			symbol: ""
		},

		final: {

			value: 1,
			symbol: "F"
		}
	},

/*
	tmp object
*/

	tmp: {

		stack: null,
		stream: null
	},

	//

	push: function (caseList, grammar, lvl) {

		var found = false;
		for (var i = 0; i < caseList.length; i++) {

			if (grammar.representation == caseList[i].representation &&
				grammar.condition.length == caseList[i].condition.length
			) {

				for (var j = 0; j < caseList[i].condition.length; j++) {

					if (grammar.condition[j] == caseList[i].condition[j])
						found = true;
					else {
						found = false;
						break;
					}
				}
			}
		}

		if (!found) {
			alert(grammar.condition);
			caseList.push(grammar);
		}
	},

	grammarRuleCheck: function (cases) {

		var result = Object;
		result.condition = [];
		result.rule = 0;

		var rules = getAllProperty(parser.rule, 'object');
		for (var i = 0; i < cases.length; i++) {

			var found = false;
			for (var j = 0; j < rules.length; j++) {

				var ruleSymbol = "";

				eval("ruleSymbol = parser.rule." + rules[j] + ".symbol");

				if (cases[i] == ruleSymbol) {
					found = true;
					eval("result.rule = parser.rule." + rules[j] + ".value");
				}
			}

			if (!found) {
				result.condition.push(cases[i]);
			}
		}

		return result;
	},

	// Syntatically check if the codes submitted to the
	// system is legal based on the given grammar

	parse: function (map) {

		if (map == "")
			return true;
		parser.tmp.stack = [];

		var tokens = tokenizer.detokenize(map);
		var lowestCaseNumber = 2000000;
		var historyStack = [];
		var stackIndex = 0;
		var done = false;
		var insert = false;
		var cases = [];
		var stack = [];
		var result = Object;
		result.valid = false;
		result.symbol = "";

		//this is the part of the code where the grammar list
		//is converted into arrays
		for (var i = 0; i < parser.grammar.length; i++) {

			var list = parser.grammar[i].split("<-");
			var representation = list[0].split(" ")[0];
			var conditions = list[1].split("|");

			for (var j = 0; j < conditions.length; j++) {
				var currentCase = trimString(conditions[j]);
				// var currentCase = conditions[j].trim()  <- Standard code
				var Case = parser.grammarRuleCheck(currentCase.split(" "));
				cases.push(new Grammar(representation, Case.condition, i, Case.rule));
				if (Case.length < lowestCaseNumber)
					lowestCaseNumber = Case.length;
			}
		}

		var actionBuffer = false;
		var stack = tokens.slice();
		var buffer= [];
		var toleranceCountLimit = 1;
		var toleranceCount 		= 0;
		var maxTabSlice = 0;

		/*
			Translates reserve words and symbols to its original value, in order
			for the parser to make a distinction on certain grammar rules.
		*/

		for (var i = 0; i < stack.length; i++) {

			var currentSelector = stack[i].replace(/\d+/g, '');
			var currentIndex 	= stack[i].replace(/[^0-9.]/g, '');
			if (currentSelector == "symb") {

				stack[i] = tokenizer.token.symbol[currentIndex - 1].value;
			}
			else if (currentSelector == "res") {

				stack[i] = tokenizer.token.reserveWord[currentIndex - 1].value;
			}
			else if (currentSelector == "tab") {
				maxTabSlice++;
			}
		}

		stack = stack.slice(maxTabSlice);

        do {

            var cIndex = -1;
            var lastBuffer = buffer.slice();
            var next = stack.length == 0 ? "" : stack[0];
            next = next.replace(/\d+/g, '');
            actionBuffer = false;

            for (var i = 0; i < cases.length; i++) {

                var valid = false;

				if (cases[i].rule == 0) {
					valid = true;
				}
				else if (cases[i].rule == 1) {
					if (stack.length == 0 && toleranceCount != 0) {
                        valid = true;
					}

				}

				if (valid) {

                    buffer = arrayToArrayReplace(buffer, cases[i].condition, Array(cases[i].representation));
                    if (buffer.toString() != lastBuffer.toString()) {

                        cIndex = i;
                        actionBuffer = true;
                        break;
                    }
				}
            }

            if (buffer.toString() == lastBuffer.toString()) {

                if (stack.length > 0) {

                    parser.tmp.stack.push(new ParseHistoryRow(stack.toString(), lastBuffer.toString(), next, "shift"));
                    buffer.push(next);
                    stack.splice(0, 1);
                    actionBuffer = true;
                }
            }
            else {

                if (actionBuffer) {

                    var stackString = stack.toString();
                    var bufferString = lastBuffer.toString();
                    var removedElements = cases[cIndex].condition.join(" ");
                    parser.tmp.stack.push(
                        new ParseHistoryRow(
                            stackString,
                            bufferString,
                            next,
                            removedElements + " reduce to " + cases[cIndex].representation
                        )
                    );
                }
            }

            if (actionBuffer == false && toleranceCount < toleranceCountLimit) {

				//parser.tmp.stack.push(new ParseHistoryRow(stack.toString(), buffer.toString(), next, ""));
				actionBuffer = true;
				toleranceCount++;
			}

			if (actionBuffer == false && toleranceCount != 0) {
                parser.tmp.stack.push(new ParseHistoryRow(stack.toString(), buffer.toString(), next, ""));
			}

        } while (stack.length != 0 || actionBuffer);

		if (buffer.length == 1) {
			result.valid = true;
			result.symbol = buffer[0];
		}

		return result;
	}
}
