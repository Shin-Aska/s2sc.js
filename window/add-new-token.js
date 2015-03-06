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

	$( "#addNewToken" ).dialog({
		autoOpen: false,
		resizable: true,
		height: 300,
		width: 500,
		modal: true,
		buttons: {

			Add: function() {
				
				if ($( "#addNewToken_condition" ).val() == "Keyword") {
					tokenizer.python.token.keyword.push($( "#addNewToken_representation" ).val());
				}
				else if ($( "#addNewToken_condition" ).val() == "Symbol") {
					tokenizer.python.token.symbol.push($( "#addNewToken_representation" ).val());
				}
				else if ($( "#addNewToken_condition" ).val() == "ReserveWord") {
					tokenizer.python.token.reserveWord.push($( "#addNewToken_representation" ).val());
				}
				$( "#addNewToken_representation" ).val("")
				$( this ).dialog( "close" );
			},

			Cancel: function() {
				$( "#addNewToken_representation" ).val("")
				$( this ).dialog( "close" );
			}
		},

		open: function() {
			
			$( "#addNewToken_representation" ).val("");
			$( "#addNewToken_condition" ).val("");
		},

		close: function() {
			
		}
	});
});