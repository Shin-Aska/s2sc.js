try {
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

		$( "#addNewGrammar" ).dialog({
			autoOpen: false,
			resizable: true,
			height: 300,
			width: 500,
			modal: true,
			buttons: {

				Add: function() {
					if (__windowParser.selectedLanguage == "Python") {
						parser.python.grammar.push($( "#addNewGrammar_representation" ).val() + " <- " + $( "#addNewGrammar_condition" ).val());
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
					$( this ).dialog( "close" );
				},

				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},

			open: function() {
				
				$( "#addNewGrammar_representation" ).val("");
				$( "#addNewGrammar_condition" ).val("");
			},

			close: function() {
				
			}
		});

		$( "#addNewGrammar_error_noLanguage" ).dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});
}
catch (exception) {
	console.log(exception);
}