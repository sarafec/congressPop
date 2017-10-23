// perform xhr on json file
function getData(){
	let request = new XMLHttpRequest();
	request.open('GET', 'congress.json', true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			let data = JSON.parse(request.responseText);
			return createPopChart(data);
		} else {
			console.log("error!");

	}
};
	request.onerror = function() {
		console.log("connection error!");
	};

	request.send();
};

// kick off chart creation
function createPopChart(data) {
	createTitle(data);
	createSubtitle(data);
	createSource(data);

	paintPopChart(data);
}

// note - can we build the chart using smaller functions
function paintPopChart(targetData) {
	// chart constants
	let svg = d3.select(".chart"),
		margin = {top: 70, right: 20, bottom: 40, left: 50},
		width = 600 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	// define chart scales
	let x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
			y = d3.scaleLinear().rangeRound([height, 0]);
	x.domain(targetData.data.map(function(d) { return d.state; }));
	y.domain([0, 53]);

	//define x axis
	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))
		.append("text")
		.attr("y", 30)
		.attr("x", 400)
		.attr("dy", "0.5em")
		.style("fill", "black");

	// transform text on x axis
	g.selectAll(".x-axis text")
		.style("transform", "translateY(38px) translateX(-13px) rotate(-90deg)");

	// define y axis
	g.append("g")
		.attr("class", "axis axis-y")
		.style("stroke-width", "0")
		.call(d3.axisLeft(y));

	// define majority bar stack
	g.selectAll(".bar2")
		.data(targetData.data)
		.enter()
		.append("rect")
		.attr("class", "bar2")
		.attr("x", function(d) { return x(d.state); })
		.attr("y", function(d, i) { return y(evaluateSecondaryPopVals(targetData, i)); })
		.attr("height", function(d, i) { return height - y(evaluateSecondaryPopVals(targetData, i)); })
		.attr("width", x.bandwidth())
		.style("fill", function(d, i) { return evaluateSecondaryColorVals(targetData, i); });

	// define minority bar stack
	g.selectAll(".bar1")
		.data(targetData.data)
		.enter()
		.append("rect")
		.attr("class", "bar1")
		.attr("x", function(d) { return x(d.state); })
		.attr("y", function(d, i) { return y(evaluatePrimaryPopVals(targetData, i)); })
		.attr("height", function(d, i) { return height - y(evaluatePrimaryPopVals(targetData, i)) ;})
		.attr("width", x.bandwidth())
		.style("fill", targetData.colors[0]);

	// define legend element
	let legend = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g")
		.data([{gender: "Male", color: targetData.colors[1]}, 
				{gender: "Female", color: targetData.colors[2]}, 
				{gender: "All", color: targetData.colors[0]}])
		.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate(-10," + ( -45 + i * 20) + ")"; });
	legend.append("rect")
		.attr("x", width - 19)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", function(d) { return d.color; });
	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text(function(d) { return d.gender; });
}

// evaluate minority value
function evaluatePrimaryPopVals(targetData, val) {
	let maleVals = +targetData.data[val].values[0].value;
	let femaleVals = +targetData.data[val].values[1].value;
	let bothVals = maleVals + femaleVals;

	if(maleVals > femaleVals){
		return femaleVals;
	} else if(maleVals < femaleVals){
		return maleVals;
	} else if(maleVals === femaleVals){
		return bothVals;
	}
}

// evaluate majority value
function evaluateSecondaryPopVals(targetData, val) {
	let maleVals = +targetData.data[val].values[0].value;
	let femaleVals = +targetData.data[val].values[1].value;
	let bothVals = maleVals + femaleVals;

	if(maleVals > femaleVals){
		return bothVals;
	} else if(maleVals < femaleVals){
		return bothVals;
	} else if(maleVals === femaleVals){
		return 0;
	}
}

// evaluate majority stack color
function evaluateSecondaryColorVals(targetData, val) {
		let maleVals = +targetData.data[val].values[0].value;
		let femaleVals = +targetData.data[val].values[1].value;

		if(maleVals > femaleVals){
			return targetData.colors[1];
		} else if(maleVals < femaleVals){
			return targetData.colors[2];
		} else if(maleVals === femaleVals){
			return targetData.colors[0];
		}
}

// define title element
function createTitle(data){
	// chart constants
	let svg = d3.select(".chart"),
	margin = {top: 70, right: 20, bottom: 40, left: 50},
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let title = svg.append("g")
		.attr("class", "chart-title");
	title.append("text")
		.attr("x", 50)
		.attr("y", 30)
		.attr("text-anchor", "center")
		.style("font", "19px Archivo")
		.text(data.title);
}

// define subtitle elements
function createSubtitle(data){
	// chart constants
	let svg = d3.select(".chart"),
	margin = {top: 70, right: 20, bottom: 40, left: 50},
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let subtitle = svg.append("g")
		.attr("class", "chart-subtitle");
	subtitle.append("text")
		.attr("x", 70)
		.attr("y", 50)
		.attr("text-anchor", "center")
		.style("font", "15px Archivo")
		.style("font-style", "italic")
		.text(data.yaxis);
}

// define source element
function createSource(data){
	// chart constants
	let svg = d3.select(".chart"),
	margin = {top: 70, right: 20, bottom: 40, left: 50},
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	let source = svg.append("g")
		.attr("class", "source");
	source.append("text")
		.attr("x", 10)
		.attr("y", 390)
		.attr("text-anchor", "left")
		.style("font", "10px monospace")
		.text("Source: " + data.source);
}
// kick off xhr
getData();

//additions
// - make as modular as possible
// - transition between stacked and grouped bar chart
// - animation between stacked and grouped bar chart
// - add tooltips
