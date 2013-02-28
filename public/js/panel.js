$(document).ready(function () {
	var socket = io.connect();
	var fps = 0, now, lastUpdate = (new Date)*1 - 1;

   
 	var fpsFilter = 50;

    var canvas = document.getElementById("videoFeed");
    var ctx = canvas.getContext("2d");
    ctx.font = "bold 12px sans-serif";
    // ctx.scale(2,2);
                       
	socket.on("robot", function(data){
        if ( data.type == "image"){
                var image = new Image();
                image.src = "data:image/jpeg;base64," + data.base64;
                image.onload = function(){
                        ctx.drawImage(image,0,0);
                        var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
                          fps += (thisFrameFPS - fps) / fpsFilter;
                          lastUpdate = now;
                          ctx.fillText("FPS: " + fps, 10, 10);
                }
                // $("#videoFeed").attr("src", "data:image/jpeg;base64," + t[1]);
        }
    });

    window.framess = [];
    socket.on("video", function(data){
        console.log("video data recieved");
        window.framess.push(data);        
    });

    socket.on("test", function(data){
        // console.log(data);  
        window.mydata = data;
    });

    socket.on("testlength", function(data){
       // console.log(data);  
        window.mydatalen = data;
    });


	var data = [{
		name: 'Temprature',
		data: [30,32,33,33,33,32,31,30]
	}];

	// var categories = [1,2,3,4,5,6,7,8]


	chart1 = new Highcharts.Chart({
         chart: {
            renderTo: 'graphs',
            type: 'line',
            zoomType: 'x'
         },
         title: {
            text: 'Sensors Data'
         },	 
         xAxis: {
            // categories: categories,
            labels : {
             	y : 10,
             	rotation: -90,
             	align: 'right' 
            }
       	 },        
         yAxis: {
            title: {
               text: 'Values'
            }
         },      
         series: data,
         width: 400,
         height: 400
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
		 console.log(s);
		 socket.emit("command", {value: s});
	})

	$(".setting").click(function(){
		// Button toggling
		$(this).parent().find(".btn-primary").removeClass("btn-primary");
		$(this).addClass("btn-primary");
		// Inform the server!!
		var type = $(this).parent().attr("id");
		var value = $(this).text();
		socket.emit("setting", {type:type, value:value});
	});

	$("#movementBtns .btn").click(function(){
		socket.emit("command", {value: $(this).attr("id")});
	});
}); 	