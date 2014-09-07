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

	count: {

		value: 0,
		reset: function () {

			errorHandler.value = 0;
		}
	}
}
