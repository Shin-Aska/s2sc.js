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
 *
 * Further-more it needs the following libraries/tools for the codes it generates in order for it to run/compile
 *
 * 1. Boehm G.C (http://www.hboehm.info/gc/)
 * 2. GNU Compiler Collection (https://gcc.gnu.org/)
 */

$( document ).ready(function() {

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
				$("#console").contents().find('html').html("<style>td, th {border: 1px solid black;}</style>" + resultant + consolehandler.showParsingInformation(map));

				document.getElementById('output').value = result;
				editAreaLoader.setValue("output", result);
			}
			catch (exception) {

				var map = s2sc.map;

				if (typeof(exception.fileName) !== "undefined") {
					$("#console").contents().find('html').html("<style>td, th {border: 1px solid black;}</style>" + "<html><body>" + exception + "  on " + exception.fileName + " at line#: " + exception.lineNumber + "<br>" + consolehandler.showParsingInformation(map) + "</body></html>");
				}
				else {
					$("#console").contents().find('html').html("<style>td, th {border: 1px solid black;}</style>" + "<html><body>" + exception + " [No stack trace available for this error]" + "<br>" + consolehandler.showParsingInformation(map) + "</body></html>");
				}

				document.getElementById('output').value = "";
				editAreaLoader.setValue("output", "");
			}
		}
	});

	editAreaLoader.init({
		id: "inputText"
		,start_highlight: true
		,allow_resize: "x"
		,allow_toggle: true
		,word_wrap: false
		,language: "en"
		,syntax: "python"
	});

	editAreaLoader.init({
		id: "output"
		,start_highlight: true
		,allow_resize: "x"
		,allow_toggle: true
		,word_wrap: false
		,language: "en"
		,syntax: "c"
		,is_editable: false
	});

	setTimeout(function(){
		$("#frame_inputText").width("48.3%")
		$("#frame_output").width("48.3%");
	}, 1000);
});
// @license-end
