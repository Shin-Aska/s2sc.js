// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

var consolehandler = {

	console: null,
	debug: true,

	showParsingInformation: function(map) {

		var string = "";

		for (var i = 0; i < map.length; i++) {

			var result = "";
			if (map[i].length != 0) {
				result = parser.parse(map[i]);
			}
			else {
				result = "<ignore>";
				continue;
			}


			if (consolehandler.debug) {

				if (!result.valid) {
					string += "<p>Invalid use of expression on line " + (i + 1) + ".<br>";
				}

				string += "Generating parse table for " + map[i] + ".</p>";
				string += "<table>";
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

		string = $("#" + consolehandler.console).contents().find('html').html() + string;
		$("#" + consolehandler.console).contents().find('html').html(string);
	}
}

// @license-end
