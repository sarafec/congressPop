// perform xhr on json file
function getData(){
	let request = new XMLHttpRequest();
	request.open('GET', 'congress.json', true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			let data = JSON.parse(request.responseText);
			return createInitialElems(data);
		} else {
			console.log('error!');

	}
};
	request.onerror = function() {
		console.log('connection error!');
	};

	request.send();
}

/** CONSTANTS **/
let margin = {
	top: 70,
	right: 20,
	bottom: 40,
	left: 50
};

let constant = {
	width: 600 - margin.left - margin.right,
	height: 300 - margin.top - margin.bottom,
	x: d3.scaleBand().rangeRound([0, 600 - margin.left - margin.right]).padding(0.05),
	y: d3.scaleLinear().rangeRound([300 - margin.top - margin.bottom, 0])
};

// kick off chart creation
function createInitialElems(data) {
	// create static chart elems
	let svg =  d3.select('.chart');
	let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	createTitle(data, svg);
	createSubtitle(data, svg);
	createSource(data, svg);
	createScale(data, g);
	createLegend(data, g);
	
	// create initial chart
	createStackChart(data, g);

}

function createStackChart(data, g) {
	createMajorityBar(data, g);
	createMinorityBar(data, g);
}

function createGroupChart(data) {

}

/** STACK CHART METHODS **/
function createMinorityBar(data, g) {
	// define minority bar stack
	g.selectAll('.bar1')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'bar1')
		.attr('x', function(d) { return constant.x(d.state); })
		.attr('y', function(d, i) { return constant.y(evaluateMinorityVal(data, i)); })
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateMinorityVal(data, i)) ;})
		.attr('width', constant.x.bandwidth())
		.style('fill', data.colors[0]);
}

function createMajorityBar(data, g) {
	// define majority bar stack
	g.selectAll('.bar2')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'bar2')
		.attr('x', function(d) { return constant.x(d.state); })
		.attr('y', function(d, i) { return constant.y(evaluateTotalVal(data, i)); })
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateTotalVal(data, i)); })
		.attr('width', constant.x.bandwidth())
		.style('fill', function(d, i) { return evaluateMajorityColor(data, i); });
}


/** STATIC ELEMENTS **/
function createScale(data, g) {
	constant.x.domain(data.data.map(function(d) { return d.state; }));
	// note - fix max domain value
	constant.y.domain([0, 53]);

	//define x axis
	g.append('g')
		.attr('class', 'x-axis')
		.attr('transform', 'translate(0,' + constant.height + ')')
	.call(d3.axisBottom(constant.x))
		.append('text')
		.attr('y', 30)
		.attr('x', 400)
		.attr('dy', '0.5em')
		.style('fill', 'black');

	// transform text on x axis
	g.selectAll('.x-axis text')
		.style('transform', 'translateY(38px) translateX(-13px) rotate(-90deg)');

	// define y axis
	g.append('g')
		.attr('class', 'axis axis-y')
		.style('stroke-width', '0')
		.call(d3.axisLeft(constant.y));
}

function createLegend(data, g) {
	// define legend element
	let legend = g.append('g')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 10)
		.attr('text-anchor', 'end')
		.selectAll('g')
		.data([{gender: 'Male', color: data.colors[1]}, 
				{gender: 'Female', color: data.colors[2]}, 
				{gender: 'All', color: data.colors[0]}])
		.enter()
		.append('g')
		.attr('transform', function(d, i) { return 'translate(-10,' + ( -45 + i * 20) + ')'; });
	
	legend.append('rect')
		.attr('x', constant.width - 19)
		.attr('width', 19)
		.attr('height', 19)
		.attr('fill', function(d) { return d.color; });
	
	legend.append('text')
		.attr('x', constant.width - 24)
		.attr('y', 9.5)
		.attr('dy', '0.32em')
		.text(function(d) { return d.gender; });
}

// define title element
function createTitle(data, svg){
	let title = svg.append('g')
		.attr('class', 'chart-title');
	title.append('text')
		.attr('x', 50)
		.attr('y', 30)
		.attr('text-anchor', 'center')
		.style('font', '19px Archivo')
		.text(data.title);
}

// define subtitle elements
function createSubtitle(data, svg){
	let subtitle = svg.append('g')
		.attr('class', 'chart-subtitle');
	subtitle.append('text')
		.attr('x', 70)
		.attr('y', 50)
		.attr('text-anchor', 'center')
		.style('font', '15px Archivo')
		.style('font-style', 'italic')
		.text(data.yaxis);
}

// define source element
function createSource(data, svg){
	let source = svg.append('g')
		.attr('class', 'source');
	source.append('text')
		.attr('x', 10)
		.attr('y', 390)
		.attr('text-anchor', 'left')
		.style('font', '10px monospace')
		.text('Source: ' + data.source);
}

/** HELPER FUNCTIONS **/
// evaluate minority value
function evaluateMinorityVal(data, val) {
	let maleVals = +data.data[val].values[0].value;
	let femaleVals = +data.data[val].values[1].value;
	let totalVals = maleVals + femaleVals;


	if(maleVals > femaleVals){
		return femaleVals;
	} else if(maleVals < femaleVals){
		return maleVals;
	} else if(maleVals === femaleVals){
		return totalVals;
	}
}

// evaluate majority value
function evaluateTotalVal(data, val) {
	let maleVals = +data.data[val].values[0].value;
	let femaleVals = +data.data[val].values[1].value;
	let totalVals = maleVals + femaleVals;

	if(maleVals > femaleVals){
		return totalVals;
	} else if(maleVals < femaleVals){
		return totalVals;
	} else if(maleVals === femaleVals){
		return 0;
	}
}

// evaluate majority stack color
function evaluateMajorityColor(data, val) {
	let maleVals = +data.data[val].values[0].value;
	let femaleVals = +data.data[val].values[1].value;
	let totalVals = maleVals + femaleVals;

		if(maleVals > femaleVals){
			return data.colors[1];
		} else if(maleVals < femaleVals){
			return data.colors[2];
		} else if(maleVals === femaleVals){
			return data.colors[0];
		}
}

// kick off xhr
getData();

//additions
// - transition between stacked and grouped bar chart
// - animation between stacked and grouped bar chart
// - add tooltips
