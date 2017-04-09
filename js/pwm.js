var curve;
var canvas;
var frameCount;
var lines = [];
var bits = 8

function setCurve(c, cvs){
	curve=c;
	canvas=cvs
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