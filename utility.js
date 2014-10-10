/**
 * This file contains all utility classes and functions that the modules
 * tokenizer, parser, dictionary and generator needs in order to do their operations.
 */

var clone = {

	variable: function(vari) {

		return new Variable(vari.name, vari.type, vari.lineDeclared, vari.ambigious, vari.temporary);
	},

	line: function(cLine) {

		return new Line(cLine.lineNumber, cLine.tokens, cLine.values, cLine.id);
	},
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
	var n = arr.split(" ");
	var funcTypeParsing = false;
	var floatRepresentation = "";
	var funcRepresentation1 = "";
	var funcRepresentation2 = "";
	if (generator.options.useDoubleInsteadOfFloat) {
		floatRepresentation = "double";
		funcRepresentation1 = "toDouble_str";
		funcRepresentation2 = "toString_double";
	}
	else {
		floatRepresentation = "float";
		funcRepresentation1 = "toFloat_str";
		funcRepresentation2 = "toString_float";
	}

	for (var i = 0; i < n.length; i++) {

		if (dataType == "string") {
			break;
		}
		try {

			var tmp = generator.refactor.getVariable(n[i]);
			if ((tmp.type == "int" || tmp.type == floatRepresentation) && (dataType != "string")) {
				dataType = tmp.type;
			}
			else if (dataType == "") {
                dataType = tmp.type;
			}
		}
		catch (ex) {

			var found = false;
			for (var m = 0; m < tokenizer.token.symbol.length; m++) {

				if (tokenizer.token.symbol[m].value == n[i]) {
					found = true;
					break;
				}
			}

			if (!found) {

				try {

					if (!isInteger(n[i]) && dataType != "string") {
						dataType = floatRepresentation;
					}
					else if (dataType == "") {
						dataType = "int";
					}
				}
				catch (ex2) {

					var cFuncNames = ["toInteger_str", funcRepresentation1, "toString_int", funcRepresentation2, "true", "false", "True", "False"];
					var cFuncDType = ["int", floatRepresentation, "string", "string", "int", "int", "int", "int"];
					var cFuncIndex = [-1, -1, -1, -1, -1, -1, -1, -1];
					var candidateIndex = -1;

					for (var j = 0; j < 8; j++) {
						cFuncIndex[j] = n[i].search(cFuncNames[j]);
					}

					for (var j = 0; j < 8; j++) {

						if (candidateIndex == -1) {
							candidateIndex = j;
						}

						if (cFuncIndex[j] != -1 && (cFuncIndex[candidateIndex] > cFuncIndex[j] || cFuncIndex[candidateIndex] == -1)) {

							candidateIndex = j;
						}
					}

					if (candidateIndex == -1 || cFuncIndex[candidateIndex] == -1) {

						dataType = "string";
					}
					else {

						dataType = cFuncDType[candidateIndex];
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

var mergeArrays = function(src, dest, sIndex, eIndex) {

    if (typeof(eIndex) === "undefined") {
        eIndex = 1;
    }

    var start = 0;
    if (sIndex <= 1) {
        start = sIndex
    }
    else {
        start = sIndex;
    }
    return src.slice(0, start).concat(dest).concat(src.slice(sIndex + eIndex));
}

var arrayToArrayReplace = function (src, cmpValue, rplValue) {

    var srcpy = src.slice();

    var index = 0;
    var srcpyStartingIndex = -1;

    if (src.length < cmpValue.length) {
        return srcpy;
    }

    for (var i = 0; i < srcpy.length; i++) {

        if (srcpy[i] === cmpValue[index]) {

            if (index == 0) {
                srcpyStartingIndex = i;
            }

            index++;
            if (cmpValue.length == index) {
                break;
            }
        }
        else {

            if (srcpyStartingIndex != -1) {
                index = 0;
                srcpyStartingIndex = -1;
                i--;
            }
        }
    }

    if (srcpyStartingIndex != -1 && cmpValue.length == index) {

        srcpy = mergeArrays(srcpy, rplValue, srcpyStartingIndex, cmpValue.length);
    }
    return srcpy;
}

