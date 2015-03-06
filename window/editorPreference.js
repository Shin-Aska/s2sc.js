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

	$( "#editorWindow" ).dialog({
		autoOpen: false,
		resizable: true,
		height: 550,
		width: 850,
		modal: true,
		buttons: {

			Apply: function() {

				
				var selected = $("#shownToolbar").find(".draggable-item");
				var unused = $("#selection").find(".draggable-item");

				var shortcuts = [];
				var unusedstc = [];
				var shortcuts_original = JSON.parse(localStorage["shortcuts"]);
				var unusedstc_original = JSON.parse(localStorage["unusedstc"]);

				for (var i = 0; i < selected.length; i++) {

					for (var j = 0; j < shortcuts_original.length; j++) {

						if (selected[i].id == shortcuts_original[j].id) {
							shortcuts.push(shortcuts_original[j]);

						}
					}

					for (var j = 0; j < unusedstc_original.length; j++) {
						
						if (selected[i].id == unusedstc_original[j].id) {
							shortcuts.push(unusedstc_original[j]);
						}
					}
				}

				for (var i = 0; i < unused.length; i++) {

					for (var j = 0; j < shortcuts_original.length; j++) {

						if (unused[i].id == shortcuts_original[j].id) {
							unusedstc.push(shortcuts_original[j]);
						}
					}

					for (var j = 0; j < unusedstc_original.length; j++) {
						
						if (unused[i].id == unusedstc_original[j].id) {
							unusedstc.push(unusedstc_original[j]);
						}
					}
				}

				localStorage["shortcuts"] = JSON.stringify(shortcuts);	
				localStorage["unusedstc"] = JSON.stringify(unusedstc);
				$( this ).dialog( "close" );
				updateShortcut();
				
			},

			Close: function() {

				$( this ).dialog( "close" );
			}
		},

		open: function() {
			
			try {

				var shortcuts = localStorage["shortcuts"];
				var unusedstc = localStorage["unusedstc"];

				if (shortcuts == "[]" && unusedstc == "[]" || shortcuts == "" && unusedstc == "") {
					shortcuts = undefined;
					unusedstc = undefined;
				}

				if (shortcuts == undefined) {
					localStorage["shortcuts"] = JSON.stringify([]);	
				}
				
				if (unusedstc == undefined) {
					var available = [];
					available.push({name: "C -> Python", id: "compileCtoPython", functionTarget: "#convertButton"});
					available.push({name: "Parser Configuration", id: "parserConfig", functionTarget: "#parserSelector"});
					available.push({name: "Tokens Configuration", id: "tokenizerConfig", functionTarget: "#tokenizerSelector"});
					available.push({name: "Dictionary Configuration", id: "dictionaryConfig", functionTarget: "#dictionarySelector"});
					localStorage["unusedstc"] = JSON.stringify(available);
				}

				shortcuts = JSON.parse(localStorage["shortcuts"]);
				unusedstc = JSON.parse(localStorage["unusedstc"]);
				
				var unusedstcstr = "";
				for (var i = 0; i < unusedstc.length; i++) {
					unusedstcstr += '<div id="' + unusedstc[i].id + '" class="draggable-item"><p>' + unusedstc[i].name + '</p></div>';
				}

				var shortcutsstr = "";
				for (var i = 0; i < shortcuts.length; i++) {
					shortcutsstr += '<div id="' + shortcuts[i].id + '" class="draggable-item"><p>' + shortcuts[i].name + '</p></div>';
				}

				$("#selection").html(unusedstcstr);
				$("#shownToolbar").html(shortcutsstr);

			}
			catch (e) {

				alert(e);
			}
		},

		close: function() {
			
			$("#selection").html("");
			$("#shownToolbar").html("");
		}
	});
});