var curve;
var canvas;
var frameCount;
var lines = [];
var bits = 8

function setCurve(c, cvs){
	curve=c;
	canvas=cvs
	canvas.ondblclick = canvas_double_click;
	// canvas.addEventListener('resize', canvas_resize)
	// canvas.onresize = canvas_resize;
	window.addEventListener('resize', window_resize)
	document.addEventListener('load', window_resize)
	console.log('set curve')
}

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

function intensity_to_power(num, bits) {
  var max_val = Math.pow(2, bits);
  return Math.round(Math.exp( Math.log(max_val)*num)-1)
}

function updateFrameCount(f){
	if(f>1000){
		console.log("too many points");
		return 1000
	}
	frameCount = f;
	lines = [];
	width=canvas.width;
	height=canvas.height;
	step=canvas.width/(frameCount-1);
	var i=frameCount
	var x_i;
	for(var i=0; i<frameCount; i++){
		x_i = i*step;
		var l = {p1:{x:x_i,y:0}, p2:{x:x_i, y:height}}
		lines.push(l);
	}
	return f;
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