class LineGroup{
	constructor(curve){
		console.log(canvas)
		this.curves = [curve]
		this.commonpoints = []
	}

	// try to split the linegroup at point p
	// returns true if it was successful, false otherwise
	split(p){
		var dist
		var closest
		for(var c of curves){
			var ponc = c.get(c.project(p))

			if(d<dist){
				dist = d
				closest = 0
			}
		}
	}
}