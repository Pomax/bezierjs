class LineGroup{
	constructor(curve){
		this.curves = [curve]
		this.points = [curve.points[0], curve.points[curve.points.length -1]]
		this.handles = []
		this.utils = curve.getUtils()
	}

	pointsEqual(p1, p2){
		return (p1.x==p2.x && p1.y==p2.y)
	}

	replaceCurve(curve, curves){
		curves.left.points[0] = curve.points[curve.points.length-1];
		curves.right.points[curves.right.points.length-1] = curve.points[0]
		curves.left.points[curves.left.points.length-1] = curves.left.points[0];
		//find the index of curve, and replace it with curves.left and curves.right
		for(var i=0; i<this.curves.length; i++){
			if(this.curves[i] == curve){
				this.curves.splice(i,1,curves.left, curves.right)
				return true
			}
			console.log("unable to find curve to be split")
		}
	}

	// try to split the linegroup at point p
	// returns true if it was successful, false otherwise
	split(p){
		//set minimum distance
		var dist=10
		//make a var for closest point to the clicked point
		var closest
		//save the curve that has the closest point
		var curveToSplit
		//save the t value for the point on the curve
		var t
		for(var c of curves){
			//get the t value
			t = c.project(p)
			//get a point on the curve closest to the clicked point
			closest = c.get(t)
			//get the distance from the curve
			var d = this.utils.dist(ponc, p)

			//set our variables, if this point is closest.
			if(d<dist){
				dist = d
				closest = ponc
				curveToSplit = c
			}
		}
		if(curveToSplit){
			this.replaceCurve(curveToSplit, curveToSplit.split(t));
		}
	}
}