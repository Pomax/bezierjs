var canvas;
var frameCount;
var lines = [];
var bits = 8
var lut=[]

// function setCurve(c, cvs){
// 	curve=c;
// 	canvas=cvs
// 	canvas.ondblclick = canvas_double_click;
// 	// canvas.addEventListener('resize', canvas_resize)
// 	// canvas.onresize = canvas_resize;
// 	window.addEventListener('resize', window_resize)
// 	document.addEventListener('load', window_resize)
// 	console.log('set curve')
// }

function window_resize(arg){
	var new_width = window.innerWidth/2;
	var new_height = window.innerHeight*0.7;
	//compute a scale factor for the existing points
	var scale = [new_width/canvas.width, new_height/canvas.height];
	for(p of curve.points){
		p.x *= scale[0];
		p.y *= scale[1];

		//range check new values.
		//todo check if they are equal to a boundary before scaling, and set to new boundary
		if(p.x>new_width)
			p.x = new_width
		else if(p.x<0)
			p.x=0
		if(p.y>new_height)
			p.y=new_height;
		else if (p.y<0)
			p.y=0
	}
	canvas.width=new_width;
	canvas.height=new_height;
	canvas.dispatchEvent(new Event('mousemove'));
}

function canvas_double_click(arg)
{

}

function _power_to_intensity(num, max)
{
  num++;
  var result = Math.log(num);
  result /= Math.log(max);
  return result;
}

function updateLUT(lg){
	var resinput = document.getElementById('pwmres');
	var timeinput = document.getElementById('time');
	var pointsinput = document.getElementById('points');
	var points = pointsinput.value;
	var time = timeinput.value;
	var res = resinput.value;
	var max_val = Math.pow(2,res);

	var min=lg.curves[0].points[0].x
	var lastcurve = lg.curves[lg.curves.length-1];
	var max=lastcurve.points[lastcurve.points.length - 1].x
	var step = (max-min)/(points-1)
	var i=min
	var lutPoints=[];
	var tlut=[]


	for(var c of lg.curves){
	  //increment i with step until we are at the end of this curve
	  var maxx = c.points[c.points.length-1].x
	  for(i;i<maxx; i+=step){
	    
	    var tp = c.intersects({p1:{x:i, y:0}, p2:{x:i, y:9999999}})
	    //get the y value and normalize it by canvas height
	    var h = (cvs.height-c.get(tp).y)/cvs.height;

	    tlut.push(h);

	    //convert desired intensity to PWM duty cycle
	    h = intensity_to_power(h, max_val);
	    h = Math.round(h);

	    lutPoints.push(h)
	    var color = _power_to_intensity(h,max_val)*255
	    color = "#" + (color<<16 | color<<8 | color).toString(16)
	    tlut.push(color);
	  }
	}
	document.getElementById('output').innerHTML = lutPoints;
	lut=tlut;
}

// convert desired intensity to PWM duty cycle, accounting for non-linearity
// of the eye
function intensity_to_power(num, max_val) {
  return Math.round(Math.exp( Math.log(max_val)*num)-1)
}

function pwm_draw(){
}

function getValues(output){
	var arr=[]
	for(l of lines){
		var c = curve.get(curve.intersects(l))
		arr.push(intensity_to_power((canvas.height-c.y)/canvas.height, bits))
	}
	output.innerHTML = arr.join(", ");
}

function simStep(i){
	var time = document.getElementById('time').value;
	var steps = document.getElementById('points').value;
	if(i>=lut.length)
		i=0;
	sim = document.getElementById('sim');
	sim.style.backgroundColor = lut[i]
	setTimeout(function(){simStep(i+1)}, time/steps*1000);
}