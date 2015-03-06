var __windowToken = {
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

	$( "#tokenizerWindow" ).dialog({
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

	$("#languageList").fancytree({

		activate: function(event, data) {

			__windowToken.selectedLanguage = data.node.title;

			var tokenTree = [];
			
			var key = {title: "Keyword", folder: true, mode: 0, children: []};
			var sym = {title: "Symbol", folder: true, mode: 0, children: []};
			var res = {title: "Reserve Word", folder: true, mode: 0, children: []};


			if (__windowToken.selectedLanguage  == "Python") {

				for (var i = 0; i < tokenizer.python.token.keyword.length; i++) {
					var keyword = {title: tokenizer.python.token.keyword[i], folder: false, mode: 1,  children: []};
					key.children.push(keyword);
				}

				for (var i = 0; i < tokenizer.python.token.symbol.length; i++) {
					var symbol= {title: tokenizer.python.token.symbol[i], folder: false, mode: 2,  children: []};
					sym.children.push(symbol);
				}

				for (var i = 0; i < tokenizer.python.token.reserveWord.length; i++) {
					var reserve = {title: tokenizer.python.token.reserveWord[i], folder: false, mode: 3,  children: []};
					res.children.push(reserve);
				}
			}
				
			tokenTree.push(key);
			tokenTree.push(sym);
			tokenTree.push(res);

			$("#tokenList").fancytree("getTree").reload(tokenTree);
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

	$("#tokenList").fancytree({

		checkbox: true,
		selectMode: 3,

		activate: function(event, data) {
			
		},

		select: function(event, data) {

			var selNodes = data.tree.getSelectedNodes(true);
			__windowToken.selectedGrammar = selNodes;
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

	$("#addToken").on("click", function(){
		if (__windowToken.selectedLanguage != "") {
			$( "#addNewToken" ).dialog("open")
			$( "#addNewToken_Language" ).html(__windowToken.selectedLanguage);
			$( "#addNewToken_condition" ).val("Keyword");
		}
		else {
			$( "#addNewGrammar_error_noLanguage" ).dialog("open");
		}
		
	});

	$("#deleteToken").on("click", function(){
		var deletedTokens = __windowToken.selectedGrammar;
		for (var i = 0; i < deletedTokens.length; i++) {

			if (__windowToken.selectedLanguage == "Python") {

				if (deletedTokens[i].folder) {
					if (deletedTokens[i].title == "Keyword") {
						tokenizer.python.token.keyword = new Array();
					}
					else if (deletedTokens[i].title == "Symbol") {
						tokenizer.python.token.symbol = new Array();
					}
					else if (deletedTokens[i].title == "Reserve Word") {
						tokenizer.python.token.reserveWord = new Array();
					}
				}
				else {

					var parent = deletedTokens[i].getParent();
					var found = false;
					var index = -1;

					if (parent.title == "Keyword") {

						for (var j = 0; j < tokenizer.python.token.keyword.length; j++) {
							if (tokenizer.python.token.keyword[j] == deletedTokens[i].title) {
								found = true;
								index = j;
							}
						}

						if (found) {
							tokenizer.python.token.keyword.splice(index, 1);
						}
					}
					else if (parent.title == "Symbol") {
						
						for (var j = 0; j < tokenizer.python.token.symbol.length; j++) {
							if (tokenizer.python.token.symbol[j] == deletedTokens[i].title) {
								found = true;
								index = j;
							}
						}

						if (found) {
							tokenizer.python.token.symbol.splice(index, 1);
						}
					}
					else if (parent.title == "Reserve Word") {
						
						for (var j = 0; j < tokenizer.python.token.reserveWord.length; j++) {
							if (tokenizer.python.token.reserveWord[j] == deletedTokens[i].title) {
								found = true;
								index = j;
							}
						}

						if (found) {
							tokenizer.python.token.reserveWord.splice(index, 1);
						}
					}						
				}
			}
		}

		var tokenTree = [];
			
		var key = {title: "Keyword", folder: true, mode: 0, children: []};
		var sym = {title: "Symbol", folder: true, mode: 0, children: []};
		var res = {title: "Reserve Word", folder: true, mode: 0, children: []};


		if (__windowToken.selectedLanguage  == "Python") {

			for (var i = 0; i < tokenizer.python.token.keyword.length; i++) {
				var keyword = {title: tokenizer.python.token.keyword[i], folder: false, mode: 1, children: []};
				key.children.push(keyword);
			}

			for (var i = 0; i < tokenizer.python.token.symbol.length; i++) {
				var symbol= {title: tokenizer.python.token.symbol[i], folder: false, mode: 2,  children: []};
				sym.children.push(symbol);
			}

			for (var i = 0; i < tokenizer.python.token.reserveWord.length; i++) {

				var reserve = {title: tokenizer.python.token.reserveWord[i], folder: false, mode: 3,  children: []};
				res.children.push(reserve);
			}
		}
			
		tokenTree.push(key);
		tokenTree.push(sym);
		tokenTree.push(res);

		$("#tokenList").fancytree("getTree").reload(tokenTree);
	});
});