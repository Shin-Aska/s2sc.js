var __windowDictionary = {
	selectedGrammar: [],
	selectedLanguage: "",

	initialize: {
		C: false,
		Python: false
	}
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

	$( "#dictionaryWindow" ).dialog({
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

	$("#supportedLanguageList").fancytree({

		activate: function(event, data) {

			__windowDictionary.selectedLanguage = data.node.title;

			if (__windowDictionary.selectedLanguage == "Python") {
				if (__windowDictionary.initialize.Python == false) {
					dictionary.python.initialize();
					__windowDictionary.initialize.Python = true;
				}
				
			}
			else if (__windowDictionary.selectedLanguage == "C") {
				if (__windowDictionary.initialize.C == false) {
					dictionary.c.initialize();
					__windowDictionary.initialize.C = true;
				}
			}

			var functionTree = [];
			var funcList = dictionary.pages.findWordsByKeywords([__windowDictionary.selectedLanguage + "-language"]);

			for (var i = 0; i < funcList.length; i++) {
				var cFunc = dictionary.pages.word[funcList[i].index];
				var rType = cFunc.returnType == 0 ? "void" : cFunc.returnType;
				var func = {title: cFunc.name + " : " + rType, folder: false, key: funcList[i].index, children: []};
				functionTree.push(func);
			}

			$("#dictionaryFunctionList").fancytree("getTree").reload(functionTree);
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
			{title: "C", data: "C", key: 1, folder: true},
			{title: "Python", data: "Python", key: 2, folder: true}
		]

	});

	

	$("#dictionaryFunctionList").fancytree({

		activate: function(event, data) {
			
			var functionText = dictionary.pages.word[data.node.key].function.toString();
			$("#functionCode").val(functionText);
			//editAreaLoader.setValue("functionCode", functionText);
		},

		select: function(event, data) {

			var selNodes = data.tree.getSelectedNodes(true);
			__windowDictionary.selectedGrammar = selNodes;
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

	
	$("#addFunction").on("click", function(){
		if (__windowDictionary.selectedLanguage != "") {
			
		}
		else {
			$( "#addNewGrammar_error_noLanguage" ).dialog("open");
		}
		
	});

	$("#deleteFunction").on("click", function(){
		var funcSelList = __windowDictionary.selectedGrammar;
		var funcList = dictionary.pages.findWordsByKeywords([__windowDictionary.selectedLanguage + "-language"]);
		
		for (var i = 0; i < funcList.length; i++) {

			var found = false;
			var selectionIndex = -1;
			for (var j = 0; j < funcSelList.length; j++) {
				if (funcList[i].name == dictionary.pages.word[funcSelList[j].key].name) {
					found = true;
					selectionIndex = j;
					dictionary.pages.word.splice(funcSelList[j].key, 1);
					break;
				}
			}

			if (found) {
				i--;
				funcList.splice(i, 1);
				funcSelList.splice(j, 1);
			}
		}

		var functionTree = [];
		var funcList = dictionary.pages.findWordsByKeywords([__windowDictionary.selectedLanguage + "-language"]);

		for (var i = 0; i < funcList.length; i++) {
			var cFunc = dictionary.pages.word[funcList[i].index];
			var rType = cFunc.returnType == 0 ? "void" : cFunc.returnType;
			var func = {title: cFunc.name + " : " + rType, folder: false, key: funcList[i].index, children: []};
			functionTree.push(func);
		}

		$("#dictionaryFunctionList").fancytree("getTree").reload(functionTree);
	});

	$("#functionCode").val("");


	/*editAreaLoader.init({
		id: "functionCode"
		,start_highlight: true
		,word_wrap: true
		,language: "en"
		,syntax: "python"
	});
	editAreaLoader.setValue("functionCode", "");*/
});