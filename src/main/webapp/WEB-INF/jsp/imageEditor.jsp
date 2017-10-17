<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>PaintWeb</title>
    <script type="text/javascript" src="js/paintweb/paintweb.src.js"></script>
</head>
<body>
    <img id="editableImage"/>
    <div id="progressBar" style="width: 200px; height: 20px; position: absolute; top: 200px; left: 200px; border:2px solid skyblue; display:none; z-index:99;  border-radius: 25px;">
        <div id="progressRate" style="width: 0%; height: 92%; background-color:#397ca8; color: white;  font-weight: bold; text-align: center; padding-top: 2px; border-radius: 25px;">100%
        </div>
    </div>    
    <div id="PaintWebTarget"></div>

<script type="text/javascript">
var srcImg = null, img1 =null, filename=null;

(function () {
	srcImg = window.opener.document.getElementById("uploadImage");

	img1 = document.getElementById('editableImage');
	img1.src = srcImg.src;
	img1.onload = function () {
		initEditor();
	}
})();

function initEditor() {
	var ex = /\?filename=([a-z0-9\-]+)\&?/i;
	var url = srcImg.src;
	filename = url.match(ex)[1]; 

	var target = document.getElementById('PaintWebTarget'),
	pw = new PaintWeb();
	pw.config.guiPlaceholder = target;
	pw.config.imageSaveTo    = imageSaveTo;
	pw.config.imageLoad 	 = img1;
	pw.config.configFile     = 'config-example.json';
	pw.init(pwInit);

	// Function called when the PaintWeb application fires the "appInit" event.
	function pwInit (ev) {
		if (ev.state === PaintWeb.INIT_ERROR) {
			alert('Demo: PaintWeb initialization failed.');
			return;
		} else 
		if (ev.state === PaintWeb.INIT_DONE) {
			if (window.console && console.log) {
				console.log("OK");
			} else if (window.opera) {
				opera.postError("OK");
			}
		} else {
			alert('Demo: Unrecognized PaintWeb initialization state ' + ev.state);
			return;
		}
		img1.style.display = 'none';
	};
}

function imageSaveTo(idata, width, height){
	var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var progressBar = document.getElementById("progressBar");
    progressBar.style.left = ((w-200)/2) + "px";
    progressBar.style.display = "";
    var progressRate = document.getElementById("progressRate");
	
	var xhr = new XMLHttpRequest(),
	boundary = 'multipartformboundary' + (new Date).getTime();

	xhr.open("POST", "saveImage");
	xhr.setRequestHeader('content-type', 'multipart/form-data; boundary='+ boundary);
	
	var dashdash = '--';
	var crlf     = '\r\n';
	var type1	 = 'png';
	
	var builder = dashdash + boundary + crlf + 'Content-Disposition: form-data; name="imageFile"' + 
		'; filename="' + filename + '";' + crlf + ' Content-Type: application/octet-stream' + crlf + crlf; 
	builder += idata;
	builder += crlf + dashdash + boundary + crlf + 'Content-Disposition: form-data; name="fileori"' + crlf + crlf + filename;
	builder += crlf + dashdash + boundary + dashdash + crlf;
	
	xhr.onload = function () {
		var newImg = document.createElement("IMG");
		newImg.onload = function () {
			srcImg.src = newImg.src + "#img" + (new Date()).getTime();
			window.close();			
		}
		newImg.src = "fileDownload?filename=" + filename+ "#img" + (new Date()).getTime();
	};
	xhr.upload.addEventListener("progress", function(evt){
    	if (evt.lengthComputable) {
            var p = evt.loaded / evt.total * 100;
            progressRate.style.width = p + "%";
            progressRate.innerText = progressRate.style.width;
            if (p==100) {
                progressRate.innerText = "Saving";
            }
        }
	}, false);   
	xhr.send(builder);	
}
</script>
</body>

</html>
