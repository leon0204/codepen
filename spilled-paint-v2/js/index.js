
window.requestFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();


var gooSlider = function(parent, id){
	
	var size = {
		x: $(parent).width(),
		y: $(parent).height()
	};
	
	var canvas = $('<canvas/>').attr({width: size.x, height: size.y, id: id}).appendTo(parent),
    context = canvas.get(0).getContext("2d");
	
	var startTime = new Date().getTime(); // timing stuff
	var currentTime = 0; // more timing, it just makes it so it always falls at the same rate
	
	var dripDist = 100; // distance between each "drip"
	var dripsAmount = Math.floor(size.x / dripDist) + 2; // amount of drips that will go across screen
	waves = []; // this will contain the information for each wave (color, drip positions, etc...)
	this.waves = waves; // making the waves variable available to the outside world
	
	noise.seed(Math.random());
	
	this.wave = function(settings, call){ // this creates the wave object. You pass through the color of the "wave" and the callback for when the wave covers the screen.
		if(typeof call != 'function') { call = function(){} }
		var it = {
			drips: [],
			callback: call,
			defaults: {
				color: '#99db81',
				minSpeed: 1,
				maxSpeed: 3
			},
			settings: {}
		}; 
		
		if(typeof settings == 'object'){
			it.settings = $.extend(true, it.defaults, settings);
		} else {
			it.settings = $.extend(true, it.defaults, {color: settings});
		}
		
		for(var i = 0; i < dripsAmount; i++){
			it.drips.push(0);
		}
		waves.push(it); // add the object to the waves array so it's animated.
	}
	
	function loop(){
		var now = new Date().getTime();
		currentTime = (now - startTime) / 10000; // more timing..
		
		//context.clearRect(0,0,size.x,size.y);
		
		for(var i = 0; i <= waves.length; i++){ // for each wave
			if(waves[i] != undefined){ // make sure it's still getting animated
				var done = true;  // this tells me if we're on the last animation frame for this wave or not

				var points = []; // this will contain the points for the wave
				for(var c = 0; c < waves[i].drips.length; c++){ // for each drip in the wave
					waves[i].drips[c] += waves[i].settings.minSpeed + ((noise.simplex2((i*dripsAmount)+c,currentTime) + 1) * waves[i].settings.maxSpeed); // add the "speed" of that drop to the y position

					points.push({ // add this point to be animated
						x: dripDist*c, 
						y: waves[i].drips[c]
					});
					if(waves[i].drips[c] < size.y){ // if this point is not to the bottom of the screen yet, set done to false.  Once all points are below the screen, done will be set to true and the animation for this wave will end and the callback will be... called.
						done = false; // ^^
					}
				}
				
				if(done == true){ // The continuation of the comment above
					waves[i].callback(); // callback
					waves[i].callback = function(){}; // callback
					setTimeout(function(i){
						waves[i] = undefined; // stop this waves animation
					},50000);
				} else {
					context.beginPath(); // this is the animation
					context.strokeStyle = waves[i].settings.color; // set the color of the wave
					context.fillStyle = waves[i].settings.color; // ^^
					context.moveTo(0, 0); // move to the top left
					context.lineTo(points[0].x, points[0].y); // draw to the first point
					
					var p = 0;
					for (p = 1; p < points.length - 2; p ++){ // loop through almost all of the points, but leave the last 2 alone and we'll code that in by hand
						var xc = (points[p].x + points[p + 1].x) / 2; // math for x offset
						var yc = ((points[p].y + points[p + 1].y) / 2); // ^^ but for y

						context.quadraticCurveTo(points[p].x, points[p].y, xc, yc); // draw the curve to this new point, using the x and y offsets
					}
					// curve through the last two points
					context.quadraticCurveTo(points[p].x, points[p].y, points[p+1].x,points[p+1].y); // draw the last two by hand
					context.lineTo(size.x, 0); // draw a line to the top right so the fill works properly
					context.stroke();
					context.fill();
				}
			}
		}
		requestFrame(loop);
	}
	
	this.clear = function(){ // this will come in handy for practical uses
		waves = [];
		context.clearRect(0,0,size.x,size.y);
	}
	loop(); // start the animation
}