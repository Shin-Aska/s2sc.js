// @license magnet:?xt=urn:btih:3877d6d54b3accd4bc32f8a48bf32ebc0901502a&dn=mpl-2.0.txt
/**
 * This is the application Javascript part of the whole converter (similar to main of a C program)
 * This application combines several Javascript libraries in order to make the converter
 * look more intuitive and useful out of the box.
 *
 * Aside from the 4 modules included on the package, the converter uses the following Javascript libraries
 * as a part of its user interface.
 *
 * 1. JQuery (http://jquery.com/)
 * 2. EditArea (http://www.cdolivet.com/editarea/)
 * 3. Superfish (users.tpg.com.au/j_birch/plugins/superfish)
 * 4. FancyTree (https://github.com/mar10/fancytree)
 *
 * Further-more it needs the following libraries/tools for the codes it generates in order for it to run/compile
 *
 * 1. Boehm G.C (http://www.hboehm.info/gc/)
 * 2. GNU Compiler Collection (https://gcc.gnu.org/)
 */

var updateShortcut = function() {

	var shortcuts = JSON.parse(localStorage["shortcuts"]);
	var shortcuts_str = "";
	for (var i = 0; i < shortcuts.length; i++) {
		shortcuts_str += '<div id="' + shortcuts[i].id +'" class="shortcutButton"><p></p></div>';
	}

	$("#shortcutbar").html(shortcuts_str);

	for (var i = 0; i < shortcuts.length; i++) {
		var f = "$('" + shortcuts[i].functionTarget + "').click()";
		$("#" + shortcuts[i].id).on("click", function(){
			eval(f);
		});
		//document.getElementById().onclick = eval("alert('@@@')");
	}
}

$( document ).ready(function() {

	/*try {
		$( "#tokenizerWindow" ).dialog("open")
	}
	catch (exception) {
		console.log(exception);
	}*/

	$("#parserSelector").on("click", function(){
		$( "#parserWindow" ).dialog("open")
	});

	$("#tokenizerSelector").on("click", function(){
		$( "#tokenizerWindow" ).dialog("open")
	});

	$("#dictionarySelector").on("click", function(){
		$( "#dictionaryWindow" ).dialog("open")
	});


	$("#editorSelector").on("click", function(){
		$( "#editorWindow" ).dialog("open")
	});

	$("#cConfigSelector").on("click", function(){
		$( "#C-ConfigWindow" ).dialog("open")
	});

	$("#pythonConfigSelector").on("click", function(){
		$( "#Python-ConfigWindow" ).dialog("open")
	});

	$("#s2scSelector").on("click", function(){
		$( "#S2SCWindow" ).dialog("open")
	});
	

	var textareas = document.getElementsByTagName('textarea');
	var count = textareas.length;
	for(var i=0;i<count;i++){
	    textareas[i].onkeydown = function(e){

	    	var keyCode = -1;
	    	if (e) {
	    		keyCode = e.keyCode;
	    	}
	    	else if (event) {
	    		keyCode = event.which;
	    	}

	        if(keyCode == 9){
	            e.preventDefault();
	            var s = this.selectionStart;
	            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
	            this.selectionEnd = s+1;
	        }
	        else {

	        	return true;
	        }
	    }
	}

	$('#chosenFile').on("change", function(){

		$("#fileName").val($('input[type=file]').val());
		var file = document.getElementById("chosenFile").files[0];
		if (file) {
		    var reader = new FileReader();
		    reader.readAsText(file, "UTF-8");
		    reader.onload = function (evt) {
		        document.getElementById("inputText").value = evt.target.result;
		        editAreaLoader.setValue("inputText", evt.target.result);
		    }
		    reader.onerror = function (evt) {
		        document.getElementById("inputText").value = "error reading file";
		        editAreaLoader.setValue("inputText", "error reading file");
		    }
		}
	});

	$("#convertButton").on("click", function(){

		document.getElementById("inputText").value = editAreaLoader.getValue("inputText");
		var value = document.getElementById("inputText").value;
		var res = -1;
		if (value == "")
			res = confirm("You are submitting an empty output\n\tDo you wish to proceed?");

		if (res) {

			try {

				var resMap = $('input[type=file]').val();
				var result = s2sc.convert("Python-language", "C-language", value);
				var map = s2sc.map;
				var symbol = s2sc.symbol;
				consolehandler.console = "console";

				var resultant = "";
				resultant += "<p>Generating Tokens from String...\n</p>";
				resultant += "<p>Showing result...</p>";
				resultant += "<hr>";
				resultant += "<table><tr><td colspan=2>Tokens</td></tr>";
				for (var i = 0; i < map.length; i++) {
					resultant += "<tr><td> " + (i + 1) + ". </td><td>" + map[i] + "&nbsp" + "</td></tr>";
				}
				resultant += "</table>";
				resultant += "<hr>";
				$("#console").contents().find('html').html("<style>td, th {border: 1px solid black;}</style>" + resultant + consolehandler.showParsingInformation(map, "Python-language"));

				document.getElementById('output').value = result;
				editAreaLoader.setValue("output", result);
			}
			catch (exception) {

				var map = s2sc.map;

				if (typeof(exception.fileName) !== "undefined") {
					$("#console").contents().find('html').html("<style>td, th {border: 1px solid black;}</style>" + "<html><body>" + exception + "  on " + exception.fileName + " at line#: " + exception.lineNumber + "<br>" + consolehandler.showParsingInformation(map, "Python-language") + "</body></html>");
				}
				else {
					$("#console").contents().find('html').html("<style>td, th {border: 1px solid black;}</style>" + "<html><body>" + exception + " [No stack trace available for this error]" + "<br>" + consolehandler.showParsingInformation(map, "Python-language") + "</body></html>");
				}

				document.getElementById('output').value = "";
				editAreaLoader.setValue("output", "");
			}
		}

		var variables = s2sc.list.variables();
		var functions = s2sc.list.functions();
		var lastFunc = 0;

		var tree = new Array();

		for (var i = 0; i < functions.length; i++) {

			try {
				var currentFunction = {title: functions[i].name, key: (i + 1), folder: true, children: []};
				var funcInfo = dictionary.pages.findWord(currentFunction.title, "C-language");

				for (var j = 0; j < functions[i]._varList.length; j++) {
					if (!functions[i]._varList[j].temporary) {
						var cVar = functions[i]._varList[j];
						currentFunction.children.push({title: cVar.name + ": " + cVar.type, key: 0});
					}
				}
				currentFunction.title += "(";
				for (var j = 0; j < functions[i].arguments.length; j++) {

					currentFunction.title += functions[i].arguments[j];
					if (j + 1 != functions[i].arguments.length) {
						currentFunction.title += ", ";
					}
				}
				currentFunction.title += "): " + funcInfo.returnType;
				tree.push(currentFunction);
				lastFunc = i + 1;
			}
			catch (ex) {
				
			}
		}

		for (var i = 0; i < variables.length; i++) {

			var cVar = {title: variables[i].name, key: (i + 1 + lastFunc)};
			cVar.title += ": " + variables[i].type;
			tree.push(cVar);
		}

		$("#functionList").fancytree("getTree").reload(tree);
	});

	editAreaLoader.init({
		id: "inputText"
		,start_highlight: true
		,word_wrap: false
		,language: "en"
		,syntax: "python"
		,allow_resize: "no"
		,toolbar: "search,go_to_line,undo,redo,separator,word_wrap,syntax_selection"
	});

	editAreaLoader.init({
		id: "output"
		,start_highlight: true
		,word_wrap: false
		,language: "en"
		,syntax: "c"
		,is_editable: false
		,allow_resize: "no"
	});

	setTimeout(function(){
		$("#frame_inputText").width("39%");
		$("#frame_output").width("39%");
	
	}, 500);

	window.onresize = function() {
		setTimeout(function(){
			$("#frame_inputText").height("98%");	
			$("#frame_output").height("98%");
		}, 300);

		if (parseInt($("body").height()) <= 800) {
			$("#consoleContainer").height("33%");
		}
		else if (parseInt($("body").height()) <= 1000) {
			$("#consoleContainer").height("35%");
		}
		else  {
			$("#consoleContainer").height("37%");
		}

		if (parseInt($("body").width()) >= 1900) {
			$("#console").width("99.6%");
			$(".wrapper").width("100.4%");
		}
		else if (parseInt($("body").width()) >= 1500) {
			$("#console").width("99.6%");
			$(".wrapper").width("100.2%");
		}
		else if (parseInt($("body").width()) >= 1300) {
			$("#console").width("99.4%");
			$(".wrapper").width("99.8%");
		}
		else if (parseInt($("body").width()) >= 1100) {
			$("#console").width("99.6%");
			$(".wrapper").width("99.8%");
		}
		else if (parseInt($("body").width()) >= 1000) {
			$("#console").width("99.8%");
			$(".wrapper").width("99.8%");
		}
	};

	window.onscroll = function() {
		setTimeout(function(){
			$("#frame_inputText").height("98%");	
			$("#frame_output").height("98%");
		}, 300);

		if (parseInt($("body").height()) <= 800) {
			$("#consoleContainer").height("33%");
		}
		else if (parseInt($("body").height()) <= 1000) {
			$("#consoleContainer").height("35%");
		}
		else  {
			$("#consoleContainer").height("37%");
		}

		if (parseInt($("body").width()) >= 1900) {
			$("#console").width("99.6%");
			$(".wrapper").width("100.4%");
		}
		else if (parseInt($("body").width()) >= 1500) {
			$("#console").width("99.6%");
			$(".wrapper").width("100.2%");
		}
		else if (parseInt($("body").width()) >= 1300) {
			$("#console").width("99.4%");
			$(".wrapper").width("99.8%");
		}
		else if (parseInt($("body").width()) >= 1100) {
			$("#console").width("99.6%");
			$(".wrapper").width("99.8%");
		}
		else if (parseInt($("body").width()) >= 1000) {
			$("#console").width("99.8%");
			$(".wrapper").width("99.8%");
		}
	};

	window.onscroll();

	var menu = $('#menubar').superfish({
					//add options here if required
				});


	$("#functionList").fancytree({

		source: [

		]

	});

	updateShortcut()

	$('.buttonContainer .draggable-list').sortable({
	connectWith: '.buttonContainer .draggable-list'
	});
});
// @license-end
