// @license magnet:?xt=urn:btih:3877d6d54b3accd4bc32f8a48bf32ebc0901502a&dn=mpl-2.0.txt

var consolehandler = {

	console: null,
	debug: true,

	showParsingInformation: function(map, language) {

		var string = "";

		for (var i = 0; i < map.length; i++) {

			var result = "";
			if (map[i].length != 0) {
				result = parser.parse(map[i], language);
			}
			else {
				result = "<ignore>";
				continue;
			}


			if (consolehandler.debug) {

				if (!result.valid) {
					string += "<p>Invalid use of expression on line " + (i + 1) + ".<br>";
				}

				var resultant = "";
				var tokens = tokenizer.detokenize(map[i]);
				for (var j = 0; j < tokens.length; j++) {
					var currentSelector = tokens[j].replace(/\d+/g, '');
					var currentIndex 	= tokens[j].replace(/[^0-9.]/g, '');

					if (currentSelector == "id") {
						resultant += "<p class='console-id' title='" + tokenizer.token.identifier[currentIndex - 1].value + "'>{" + tokens[j] + "}</p>"
					}
					else if (currentSelector == "symb") {
						resultant += "<p class='console-symb' title='" + tokenizer.token.symbol[currentIndex - 1].value + "'>{" + tokens[j] + "}</p>"
					}
					else if (currentSelector == "kwd") {
						resultant += "<p class='console-keyword' title='" + tokenizer.token.keyword[currentIndex - 1].value + "'>{" + tokens[j] + "}</p>"
					}
					else if (currentSelector == "res") {
						resultant += "<p class='console-res' title='" + tokenizer.token.reserveWord[currentIndex - 1].value + "'>{" + tokens[j] + "}</p>"
					}
					else if (currentSelector == "const") {
						resultant += "<p class='console-const' title='" + tokenizer.token.constant[currentIndex - 1].value + "'>{" + tokens[j] + "}</p>"
					}
					else if (currentSelector == "sConst") {
						resultant += "<p class='console-sConst' title='" + tokenizer.token.string[currentIndex - 1].value + "'>{" + tokens[j] + "}</p>"
					}
				}
				string += "Line #<b>" + (i + 1) + ".</b> " + resultant + ".</p>";
				string += "<table title='Parse Table'>";
				string += "<tr><th>Stack</th><th>Input Buffer</th><th>Next</th><th>Action</th></tr>";
				for (var j = 0; j < parser.tmp.stack.length; j++) {

					string += "<tr><td>" + parser.tmp.stack[j].buffer + "&nbsp" + "</td><td>" + parser.tmp.stack[j].unscanned + "&nbsp" + "</td><td>" +
					parser.tmp.stack[j].next + "&nbsp" + "</td><td>" + parser.tmp.stack[j].action + "&nbsp" + "</td></tr>";
				}
				string += "</table><hr><br>";
			}
			else {

				if (result.valid)
					string += "Line [" + (i + 1) + "]: " + result.symbol + "\n";
				else {
					string+= "Line [" + (i + 1) + "]: Failed parse\n";
					break;
				}
			}
		}

		return string;
	}
}

// @license-end
