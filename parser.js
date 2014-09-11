/**
 *
 * @source: parser.js
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

var parser = {

	grammar : [

		"decl <- id = result F | id = const F | id = id F",

		"cmpAsgn <- id += result F | id += const F | id += id F",
		"cmpAsgn <- id *= result F | id *= const F | id *= id F",
		"cmpAsgn <- id -= result F | id -= const F | id -= id F",
		"cmpAsgn <- id /= result F | id /= const F | id /= id F",
		"cmpAsgn <- id += sConst F",

		"strDecl <- id = sConst F",
		"funcStrDecl <- strDecl + func",

		// For decimal
		"const <- int ( sConst ) | int result | float ( sConst ) | float result",

		// String Operation
		"sConst <- id + sConst | sConst + id | sConst + sConst",
		"sConst <- str ( sConst ) | str result | ( sConst )",

		//Function Defintion
		"funcDef <- def id ( paramList ) : | funcDefInit :",
		"funcDefInit <- def id ( id )",

		//Class Definition
		"classDef <- class id :",

		//Function Return Types
		"id <- undefined",
		"undefined <- kwd ( sConst ) | kwd result | kwd ( paramList ) | kwd ( )",
		"paramList <- result , result | id , id | sConst , sConst",
		"paramList <- result , id | id , result | id , sConst",
		"paramList <- sConst , result | sConst , id | result , sConst",
		"paramList <- const , id | id , const | sConst , const",
		"paramList <- const , result | result , const | const, sConst | const , const",
		"paramList <- paramList , id | paramList , sConst | paramLi st , result | paramList , const",

		// Boolean cases
		"boolStmt <- id < id | id > id | id == id",
		"boolStmt <- const < const | const > const | const == const",
		"boolStmt <- id < const | id > const | id == const",
		"boolStmt <- const < id | const > id | const == id",
		"boolStmt <- boolStmt and boolStmt | boolStmt or boolStmt",
		"boolStmt <- result < const F | result > const F | result == const F",
		"boolStmt <- result < id F | result > id F | result == id F",
		"boolStmt <- result < result F | result > result F | result == result F",

		// Arithmetic cases
		"product <- id * id | const * const | id * const | const * id | result * id | id * result | result * const | const * result",
		"product <- product * id | product * const | id * product | const * product | product * product | product * result | result * product | result * result",

		"quotient <- id / id | const / const | id / const | const / id | result / id | id / result | result / const | const / result",
		"quotient <- quotient / id | quotient / const | id / quotient | const / quotient | quotient / quotient | quotient / result | result / quotient | result / result",

		"sum <- id + id | const + const | id + const | const + id | result + id | id + result | result + const | const + result",
		"sum <- sum + const | sum + id | id + sum | const + sum | sum + result | result + sum | result + result",

		"difference <- id - id | const - const | id - const | const - id | result - id | id - result | result - const | const - result",
		"difference <- difference - id | difference - const | id - difference | const - difference | difference - result | result - difference | result - result",

		"remainder <- id % id | const % const | id % const | const % id | result % id | id % result | result % const | const % result",
		"remainder <- difference % id | difference % const | id % difference | const % difference | difference % result | result % difference | result % result",

		"incr <- id ++ | ++ id",
		"exp <- id ** id | const ** const | id ** const | const ** id | result ** id | id ** result | result ** const | const ** result",
		"exp <- difference ** id | difference ** const | id ** difference | const ** difference | difference ** result | result ** difference | result ** result",

		"floorQuotient <- id // id | const // const | id // const | const // id | result // id | id // result | result // const | const // result",
		"floorQuotient <- difference // id | difference // const | id // difference | const // difference | difference // result | result // difference | result // result",

		"result <- floorQuotient | exp | remainder | product | quotient | sum | difference | ( const ) | ( result ) | ( id )"


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
