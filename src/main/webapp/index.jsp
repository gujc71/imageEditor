<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
<head>
<script type="text/javascript" src="js/jquery-2.2.3.min.js"></script>
<script type="text/javascript">	
function fn_uploadImage() {
	$("#uploadImageFile").click();
}

function uploadImageFileChange() {
	var formData = new FormData();
	formData.append('upfile', $('#uploadImageFile')[0].files[0]); 

	$.ajax({
	    url: 'fileUpload',
	    data: formData,
	    type: 'POST',
	    contentType: false,
	    processData: false,
	    success : function(data){
	    	$('#uploadImage').attr("src", "fileDownload?filename="+data);
	    	$('#imageEditor').css('display', 'inline-block');
        }
	});
}

function fn_modifyImage() {
	var w = window.open("imageEditor", "", "width=800,height=650,top=0px,left=200px,status=,resizable=false,scrollbars=no");
}
function fn_modifyImage2() {
	var w = window.open("imageEditor2", "", "width=800,height=650,top=0px,left=200px,status=,resizable=false,scrollbars=no");
}
function fn_removeImage() {
	$('#uploadImage').removeAttr("src");
	$('#imageEditor').css('display', 'none');
}
</script>	
</head>
<body>
	<h2>Image Editor Sample for Java</h2>
	
	<div style="text-align:center; margin-top: 5px;">
		<a href="javascript:fn_uploadImage('')" class="btn sty13">Load Image</a>
		<div id="imageEditor" style="display:none;">
			<a href="javascript:fn_modifyImage('');" class="btn sty13">Image Editor</a>
			<a href="javascript:fn_removeImage('');" class="btn sty13">Delete</a>
		</div>	
		<input type="file" id="uploadImageFile" onchange="uploadImageFileChange()" style="display:none"/>
	</div>

	<div style="min-height: 260px">
		<img id="uploadImage"/>
	</div>
</body>
</html>
