$(document).ready(function () {
	var socket = io.connect();

    var canvas = document.getElementById("videoFeed");
    var ctx = canvas.getContext("2d");
    ctx.font = "bold 12px sans-serif";
    // ctx.scale(2,2);
                       
	socket.on("video-frame", function(data){
        var image = new Image();
        image.src = "data:image/jpeg;base64," + data;
        image.onload = function(){
            ctx.drawImage(image,0,0);   
        }
    });



	$("body").keydown(function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        var s = "";
        if(code == 37) { //Enter keycode
        	s = "left";
        } else if ( code == 38){
        	s = "up";
        } else if ( code == 39){
        	s = "right";
        } else if ( code == 40){
        	s = "down";
        } else if ( code == 83){
            s = "stop";
        }
	});


    $("#movementBtns > .btn").click(function(){
        socket.emit("movement", $(this).data("cmd"));
    });

    $("#cameraBtns > .btn").click(function(){
        socket.emit("camera", $(this).data("cmd"));
    });

    $("#detectionBtns > .btn").click(function(){
        if ( $(this).hasClass("btn-success")){
            $(this).removeClass("btn-success").addClass("btn-danger").children().removeClass("icon-ok").addClass("icon-remove");
            socket.emit("detection", { name: $(this).text().trim(), value:0});
        } else {
            $(this).addClass("btn-success").removeClass("btn-danger").children().removeClass("icon-remove").addClass("icon-ok");
            socket.emit("detection", { name: $(this).text().trim(), value:1});
        }
    });

    $("#notifyBtns > .btn").click(function(){
        if ( $(this).hasClass("btn-success")){
            $(this).removeClass("btn-success").addClass("btn-danger").children().removeClass("icon-ok").addClass("icon-remove");
            socket.emit("notify", { name: $(this).text().trim(), value:0});
        } else {
            $(this).addClass("btn-success").removeClass("btn-danger").children().removeClass("icon-remove").addClass("icon-ok");
            socket.emit("notify", { name: $(this).text().trim(), value:1});
        }
    });
}); 	