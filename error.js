/**
 *
 * @source: error.js
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

function Error (line, symbol, detail) {

	this.line = line;
	this.symbol = symbol;
	this.detail = detail;
}

var errorHandler = {

	stack: [],

	clear: function () {

		errorHandler.stack = [];
	},

	raiseError: function(error) {

		errorHandler.stack.push(error);
	},

	throwException: function() {

		var throwExceptionAction = false;
		var throwExceptionText = "An error was encountered during conversion, please check.<br><br>";
		throwExceptionText += "Error Stack #:<br>";
		throwExceptionText += "<table><tr><th>Type</th><th>Line</th><th>Symbol</th></tr>";

		for (var i = 0; i < errorHandler.stack.length; i++) {
			throwExceptionAction = true;
			throwExceptionText += "<tr><td>" + errorHandler.stack[i].detail + "</td><td>" +  errorHandler.stack[i].line + "</td><td>" + errorHandler.stack[i].symbol.join(" ") + "</td></tr>";
		}
		throwExceptionText += "</table><br>";

		if (throwExceptionAction) {

			throw(throwExceptionText);
		}
	}
}
