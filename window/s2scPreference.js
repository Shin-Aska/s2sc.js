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

	$( "#S2SCWindow" ).dialog({
		autoOpen: false,
		resizable: true,
		height: 500,
		width: 800,
		modal: true,
		buttons: {

			Apply: function() {

				$( this ).dialog( "close" );
			},

			Close: function() {

				$( this ).dialog( "close" );
			}
		},

		open: function() {
			
		},

		close: function() {
			
		}
	});
});