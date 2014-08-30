/**
 * This file contains all utility classes and functions that the modules
 * tokenizer, parser, dictionary and analyzer needs in order to do their operations.
 *
 * Some of these classes and functions here completely rely on Objects that where declared on these modules
 * so even though this part of code is not GPL licensed, be careful which code you copy and paste
 */

var clone = {

	variable: function(vari) {

		return new Variable(vari.name, vari.type, vari.lineDeclared)
	}
}

var parenthesisParser = {

}

var getAllProperty = function(object, type) {
	return Object.getOwnPropertyNames(object).filter(function(property) {
		return typeof object[property] == type;
	});
}

var isInteger = function(n) {

	if (n[n.length - 1] == "f") {
		n = n.slice();
		n = n.slice(0, n.length - 1);
	}
	if (isNaN(n)) {
		throw "NaN Exception caused by " + n;
	}

    if (parseInt(n) == parseFloat(n)) {
    	if (n.toString().length == parseInt(n).toString().length) {
    		return true;
    	}
    }
    return false;
}

var isEquation = function(arr) {

	if (arr.length == 0) {
		return "";
	}
	var dataType = "";
	n = arr.split(" ");

	for (var i = 0; i < n.length; i++) {

		if (dataType == "string") {
			break;
		}
		try {

			var tmp = analyzer.refactor.getVariable(n[i]);
			if ((tmp.type == "int" || tmp.type == "float") && (dataType != "string" || dataType == "")) {
				dataType = tmp.type;
			}
		}
		catch (ex) {

			var found = false;
			for (var m = 0; m < tokenizer.list.symbol.length; m++) {

				if (tokenizer.list.symbol[m] == n[i]) {
					found = true;
					break;
				}
			}

			if (!found) {

				try {

					if (!isInteger(n[i]) && dataType != "string") {
						dataType = "float";
					}
					else if (dataType == "") {
						dataType = "int";
					}
				}
				catch (ex2) {

					if (n[i].search("toInteger_str") != -1) {
						dataType = "int"
					}
					else if (n[i].search("toFloat_str") != -1) {
						dataType = "float"
					}
					else {
						dataType = "string";
					}
					//dataType = "string";
				}
			}
		}
	}

	return dataType;
}

var trimString = function (str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}
