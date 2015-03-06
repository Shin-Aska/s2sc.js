var __windowParser = {
	selectedGrammar: [],
	selectedLanguage: ""
}

$(function() {

	function updateTips( t ) {
		tips
			.text( t )
			.addClass( "ui-state-highlight" );
		setTimeout(function() {
			tips.removeClass( "ui-state-highlight", 1500 );
			setTimeout(function(){
				tips.html("All form fields are required.");
			}, 1500)
		}, 500 );
	}

	function checkLength( o, n, min, max ) {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
				min + " and " + max + "." );
			return false;
		} else {
			return true;
		}
	}

	function checkRegexp( o, regexp, n ) {
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n );
			return false;
		} else {
			return true;
		}
	}

	function checkLengthNum( o, n, min, max ) {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
				min + " and " + max + "." );
			return false;
		} else {
			try {

				if (parseInt(o.val() == NaN)) {
					throw "Not a number exception";
				}
				return true;
			}
			catch (exception) {
				o.addClass( "ui-state-error" );
				updateTips("Value must be number");
				return false;
			}
			
		}
	}

	$( "#parserWindow" ).dialog({
		autoOpen: false,
		resizable: true,
		height: 500,
		width: 800,
		modal: true,
		buttons: {


		},

		open: function() {
			
		},

		close: function() {
			
		}
	});

	$( "#parserWindow" ).dialog({
		autoOpen: false,
		resizable: true,
		height: 500,
		width: 800,
		modal: true,
		buttons: {


		},

		open: function() {
			
		},

		close: function() {
			
		}
	});


	$("#parserList").fancytree({

		activate: function(event, data) {

			var cases = null;
			if (data.node.title == "Python") {
				parser.parse([1], "Python-language");
				cases = parser.tmp.cases;
				__windowParser.selectedLanguage = data.node.title;
			}

			var grammarTree = [];
			for (var i = 0; i < cases.length; i++) {

				var found = false;
				var index = -1;
				var ccase = {title: cases[i].representation, folder: true, children: []};
				var child = {title: cases[i].condition.join(" "), children: []};

				ccase.children.push(child);;
				for (var j = 0; j < grammarTree.length; j++) {
					if (grammarTree[j].title == ccase.title) {

						found = true;
						index = j;
					}
				}

				if (!found) {
					grammarTree.push(ccase);
				}
				else {
					grammarTree[index].children.push(child);
				}
			}
			$("#grammarList").fancytree("getTree").reload(grammarTree);
		},
		deactivate: function(event, data) {
			$("#echoSelected").text("-");
		},
		focus: function(event, data) {
			$("#echoFocused").text(data.node.title);
		},
		blur: function(event, data) {
			$("#echoFocused").text("-");
		},
		lazyLoad: function(event, data){
			// Simulate a slow ajax request
			var dfd = new $.Deferred()
			data.result = dfd;
			window.setTimeout(function(){
				dfd.resolve([
					{ title: 'Lazy node 1', lazy: true },
					{ title: 'Simple node 2', select: true }
				]);
			}, 1500);
		},
		source: [
			{title: "Python", data: "Python", key: 1, folder: true}
		]

	});

	

	$("#grammarList").fancytree({

		checkbox: true,
		selectMode: 3,

		activate: function(event, data) {
			
		},

		select: function(event, data) {

			var selNodes = data.tree.getSelectedNodes(true);
			__windowParser.selectedGrammar = selNodes;
		},

		lazyLoad: function(event, data){
			// Simulate a slow ajax request
			var dfd = new $.Deferred()
			data.result = dfd;
			window.setTimeout(function(){
				dfd.resolve([
					{ title: 'Lazy node 1', lazy: true },
					{ title: 'Simple node 2', select: true }
				]);
			}, 1500);
		},
		source: [

		]

	});


	$("#addGrammar").on("click", function(){
		if (__windowParser.selectedLanguage != "") {
			$( "#addNewGrammar" ).dialog("open")
			$( "#addNewGrammar_Language" ).html(__windowParser.selectedLanguage);
		}
		else {
			$( "#addNewGrammar_error_noLanguage" ).dialog("open");
		}
		
	});

	$("#deleteGrammar").on("click", function(){
		var deletedGrammar = __windowParser.selectedGrammar;
		for (var i = 0; i < deletedGrammar.length; i++) {
			
			if (__windowParser.selectedLanguage == "Python") {

				for (var j = 0; j < parser.python.grammar.length; j++) {
					var list = parser.python.grammar[j].split("<-");
					var representation = list[0].split(" ")[0];
					var conditions = list[1].split("|");

					if (typeof(deletedGrammar[i]) == "undefined") {
						continue;
					}

					if (trimString(representation) == trimString(deletedGrammar[i].title) && typeof(deletedGrammar[i].folder) != "undefined") {
						
						parser.python.grammar.splice(j, 1);
						j--;
					}
					else if (typeof(deletedGrammar[i].folder) == "undefined") {

						if (representation != deletedGrammar[i].getParent().title) {
							continue;
						}
						for (var k = 0; k < conditions.length; k++) {
							conditions[k] = conditions[k].replace(" F ", "");
							conditions[k] = conditions[k].replace(" F", "");

							if (trimString(deletedGrammar[i].title) == trimString(conditions[k])) {

								if (k == 0) {
									parser.python.grammar[j] = parser.python.grammar[j].replace(trimString(deletedGrammar[i].title) + " | ", "")
								}
								else {
									parser.python.grammar[j] = parser.python.grammar[j].replace(" | " + trimString(deletedGrammar[i].title), "")
								}
								
							}
						}
					}
				}
			}
		}

		var cases = null;
		if (__windowParser.selectedLanguage == "Python") {
			parser.parse([1], "Python-language");
			cases = parser.tmp.cases;
		}

		var grammarTree = [];
		for (var i = 0; i < cases.length; i++) {

			var found = false;
			var index = -1;
			var ccase = {title: cases[i].representation, folder: true, children: []};
			var child = {title: cases[i].condition.join(" "), children: []};

			ccase.children.push(child);;
			for (var j = 0; j < grammarTree.length; j++) {
				if (grammarTree[j].title == ccase.title) {

					found = true;
					index = j;
				}
			}

			if (!found) {
				grammarTree.push(ccase);
			}
			else {
				grammarTree[index].children.push(child);
			}
		}
		$("#grammarList").fancytree("getTree").reload(grammarTree);
	});
});