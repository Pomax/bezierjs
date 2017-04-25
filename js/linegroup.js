class LineGroup{
	constructor(curve){
		this.curves = [curve]
		this.points = [curve.points[0], curve.points[curve.points.length -1]]
		this.handles = []
		this.utils = curve.getUtils()
	}

	debugCurves(curves){
		var str = ""
		for(var curve of curves){
			str+= "[" + this.debugCurve(c)+"],"
		}
		return str
	}

	debugCurve(c){
		var str = ""
		for(var p of c.points){
			str+="(" + p.x + ","+p.y+"), "
		}
		return str;
	}

	pointsEqual(p1, p2){
		return (p1.x==p2.x && p1.y==p2.y)
	}

	replaceCurve(curve, curves){
		curves.right.points[0] = curves.left.points[curves.left.points.length-1];
		//find the index of curve, and replace it with curves.left and curves.right
		for(var i=0; i<this.curves.length; i++){
			if(this.curves[i] == curve){
				//set lg's rightmost point before the split segment to the leftmost curve of the replacement segments.
				if(i>0){
					curves.left.points[0] = this.curves[i-1].points[this.curves[i-1].points.length-1]
				}
				if(i<this.curves.length-1){
					curves.right.points[curves.right.points.length-1] = this.curves[i+1].points[0]	
				}
				this.curves.splice(i,1, curves.left, curves.right)
				break;
			}
			console.log("unable to find curve to be split")
		}
	}

	// try to split the linegroup at point p
	// returns true if it was successful, false otherwise
	split(curveToSplit, t){
		var c = curveToSplit.split(t)
		this.replaceCurve(curveToSplit, curveToSplit.split(t.t));
	}
}