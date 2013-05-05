$(document).ready(function () {
	var socket = io.connect();

    var video = document.querySelector('video');

    var canvas = document.getElementById("videoFeed");
    var ctx = canvas.getContext("2d");
    ctx.font = "bold 12px sans-serif";
    // ctx.scale(2,2);
                       
	socket.on("video-frame", function(data){
        var image = new Image();
        image.src = "data:image/jpeg;base64," + data;
        image.onload = function(){
            ctx.drawImage(image,0,0); 
            // BGR to RGB
            var imgData = ctx.getImageData(0, 0, 640, 480);  
            var pix = imgData.data;
            for (var i = 0, n = pix.length; i < n; i += 4) {
                var r = pix[i];
                pix[i  ] = pix[i + 2]; // red
                pix[i+2] = r; // blue
                // i+3 is alpha (the fourth element)
            }
            ctx.putImageData(imgData, 0, 0);
        }
    });

	$("body").keydown(function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        var s = "";
        if(code == 37) { //Enter keycode
            socket.emit("movement", "left");
        } else if ( code == 38){
            socket.emit("movement", "up");
        } else if ( code == 39){
        	socket.emit("movement", "right");
        } else if ( code == 40){
            socket.emit("movement", "down");
        } else if ( code == 83){
            socket.emit("movement", "stop");
        }
	});

	 $("#movementBtns > .btn").on("touchstart", function(){
	 	$(this).trigger("click");
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


    ///////// STATUS DASHBOARD //////////
    var tempBoundaries = [30,35];    
    function findDangerLevel(temp){
        if ( temp < tempBoundaries[0]){
            return 'label label-success';
        } else if ( temp < tempBoundaries[1]){
            return 'label label-warning';
        } else {
            return 'label label-important';
        }
    }

    function lastUpdate(){
        var d = new Date();        
        $("#lastUpdate").text(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
    }

    function tidyNum(num){
        return parseFloat(Math.round(num * 100) / 100).toFixed(2);
    }

    function avgTempTask(){
        $.get("/temperature", function(data){                
            var html = "";
            html += "<div class='" + findDangerLevel(data.avgTemp) + "'> AVG: " + tidyNum(data.avgTemp) + "</a></div>&nbsp;";
            html += "<div class='" + findDangerLevel(data.minTemp) + "'> MIN: " + tidyNum(data.minTemp) + "</a></div>&nbsp;";
            html += "<div class='" + findDangerLevel(data.maxTemp) + "'> MAX: " + tidyNum(data.maxTemp) + "</a></div>&nbsp;";
            $("#avgTemp").html(html);
            lastUpdate();
        });
    } 
    
    avgTempTask();
    setInterval(avgTempTask, 60*1000);

}); 	