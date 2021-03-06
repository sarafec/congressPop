// perform xhr on json file
function getData(){
	d3.json('congress.json', function(error, data){
		constant.refData = data;
		createInitialElems(data);
	});
}

/** CONSTANTS **/
let margin = { top: 70, right: 20, bottom: 40, left: 50 };

let constant = {
	width: 600 - margin.left - margin.right,
	height: 300 - margin.top - margin.bottom,
	x: d3.scaleBand().rangeRound([0, 600 - margin.left - margin.right]).padding(0.05),
	y: d3.scaleLinear().rangeRound([300 - margin.top - margin.bottom, 0]),
	refData: {}
};

let tooltip = d3.select('body')
	.append('div')
	.attr('class', 'tooltip')
	.style('position', 'absolute')
	.style('z-index', '10')
	.style('visibility', 'hidden');


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

// create visual elements for stack chart
function createStackChart(data, g) {
	createMajorityBar(data, g);
	createMinorityBar(data, g);
}

// create visual elements for grouped chart
function createGroupChart(data, g) {
	createMaleBar(data, g);
	createFemaleBar(data, g);
	createTotalBar(data, g);

}

/** STACK CHART METHODS **/
function createMinorityBar(data, g) {
	let stackedTransition = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	// define minority bar stack
	g.selectAll('.bar1')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'bar1')
		.attr('x', function(d) { return constant.x(d.abbreviation); })
		.attr('y', function(d) { return constant.y(0); })
		.attr('height', 0)
		.attr('width', constant.x.bandwidth())
		.style('fill', data.colors[0])
		.on('mouseover', function(d) { return tooltip.style('visibility', 'visible'); })
		.on('mousemove', function(d, i) { return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px').html(getTooltipText(data, i)) })
		.on('mouseout', function(d) { return tooltip.style('visibility', 'hidden'); })
		.transition(stackedTransition)
		.attr('y', function(d, i) { return constant.y(evaluateMinorityVal(data, i)); })
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateMinorityVal(data, i)) ;});
}

function createMajorityBar(data, g) {
	let stackedTransition = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	// define majority bar stack
	g.selectAll('.bar2')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'bar2')
		.attr('x', function(d) { return constant.x(d.abbreviation); })
		.attr('y', function(d) { return constant.y(0); })
		.attr('height', 0)
		.attr('width', constant.x.bandwidth())
		.style('fill', function(d, i) { return evaluateMajorityColor(data, i); })
		.on('mouseover', function(d) { return tooltip.style('visibility', 'visible'); })
		.on('mousemove', function(d, i) { return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px').html(getTooltipText(data, i)) })
		.on('mouseout', function(d) { return tooltip.style('visibility', 'hidden'); })
		.transition(stackedTransition)
		.attr('y', function(d, i) { return constant.y(evaluateTotalVal(data, i)); })
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateTotalVal(data, i)); });
}

/** GROUPED CHART METHODS **/
function createMaleBar(data, g) {
	let groupedTransition = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	g.selectAll('.maleBar')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'maleBar')
		.attr('x', function(d) { return constant.x(d.abbreviation) + 3; })
		.attr('y', function(d) { return constant.y(0); })
		.attr('height', 0)
		.attr('width', constant.x.bandwidth()/3)
		.style('fill', data.colors[1])
		.on('mouseover', function(d) { return tooltip.style('visibility', 'visible'); })
		.on('mousemove', function(d, i) { return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px').html(getTooltipText(data, i)); })
		.on('mouseout', function(d) { return tooltip.style('visibility', 'hidden'); })
		.transition(groupedTransition)
		.attr('y', function(d, i) { return constant.y(getMaleVals(data, i)); })
		.attr('height', function(d, i){ return constant.height - constant.y(getMaleVals(data, i)); });
}

function createFemaleBar(data, g) {
	let groupedTransition = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	g.selectAll('.femaleBar')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'femaleBar')
		.attr('x', function(d) { return constant.x(d.abbreviation) - 0.25; })
		.attr('y', function(d) { return constant.y(0); })
		.attr('height', 0)
		.attr('width', constant.x.bandwidth()/3)
		.style('fill', data.colors[2])
		.on('mouseover', function(d) { return tooltip.style('visibility', 'visible'); })
		.on('mousemove', function(d, i) { return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px').html(getTooltipText(data, i)); })
		.on('mouseout', function(d) { return tooltip.style('visibility', 'hidden'); })
		.transition(groupedTransition)
		.attr('y', function(d, i) { return constant.y(getFemaleVals(data, i)); })
		.attr('height', function(d, i){ return constant.height - constant.y(getFemaleVals(data, i)); });
}

function createTotalBar(data, g) {
	let groupedTransition = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	g.selectAll('.totalBar')
		.data(data.data)
		.enter()
		.append('rect')
		.attr('class', 'totalBar')
		.attr('x', function(d) { return constant.x(d.abbreviation) + 6; })
		.attr('y', function(d) { return constant.y(0); })
		.attr('height', 0)
		.attr('width', constant.x.bandwidth()/3)
		.style('fill', data.colors[0])
		.on('mouseover', function(d) { return tooltip.style('visibility', 'visible'); })
		.on('mousemove', function(d, i) { return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px').html(getTooltipText(data, i)); })
		.on('mouseout', function(d) { return tooltip.style('visibility', 'hidden'); })
		.transition(groupedTransition)
		.attr('y', function(d, i) { return constant.y(getTotalVals(data, i)); })
		.attr('height', function(d, i){ return constant.height - constant.y(getTotalVals(data, i)); });
}

/** TRANSITION FUNCTIONS **/
function transitionToGrouped() {
	let svg =  d3.select('.chart');

	let toGroupedChart = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	d3.selectAll('.bar1')
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateMinorityVal(constant.refData, i)); })
		.attr('y', function(d, i) { return constant.y(evaluateMinorityVal(constant.refData, i)); })
		.transition(toGroupedChart)
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); });
	d3.selectAll('.bar2')
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateTotalVal(constant.refData, i)); })
		.attr('y', function(d, i) { return constant.y(evaluateTotalVal(constant.refData, i)); })
		.transition(toGroupedChart)
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); });

	// if grouped bar chart exists, change height
	if (document.querySelector('.maleBar')) {
		d3.selectAll('.maleBar')
			.attr('height', 0)
			.attr('y', function(d) { return constant.y(0); })
			.transition(toGroupedChart)
			.attr('y', function(d, i) { return constant.y(getMaleVals(constant.refData, i)); })
			.attr('height', function(d, i){ return constant.height - constant.y(getMaleVals(constant.refData, i)); });
		d3.selectAll('.femaleBar')
			.attr('height', 0)
			.attr('y', function(d) { return constant.y(0); })
			.transition(toGroupedChart)
			.attr('y', function(d, i) { return constant.y(getFemaleVals(constant.refData, i)); })
			.attr('height', function(d, i){ return constant.height - constant.y(getFemaleVals(constant.refData, i)); });
		d3.selectAll('.totalBar')
			.attr('height', 0)
			.attr('y', function(d) { return constant.y(0); })
			.transition(toGroupedChart)
			.attr('y', function(d, i) { return constant.y(getTotalVals(constant.refData, i)); })
			.attr('height', function(d, i){ return constant.height - constant.y(getTotalVals(constant.refData, i)); });
	
	// if grouped bar chart does not exist, create grouped bar chart
	} else {
		let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		return createGroupChart(constant.refData, g);
	}

}

function transitionToStacked() {
	let svg =  d3.select('.chart');

	let toStackedChart = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	d3.selectAll('.maleBar')
		.attr('y', function(d, i) { return constant.y(getMaleVals(constant.refData, i)); })
		.attr('height', function(d, i){ return constant.height - constant.y(getMaleVals(constant.refData, i)); })
		.transition(toStackedChart)
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); });
	d3.selectAll('.femaleBar')
		.attr('y', function(d, i) { return constant.y(getFemaleVals(constant.refData, i)); })
		.attr('height', function(d, i){ return constant.height - constant.y(getFemaleVals(constant.refData, i)); })
		.transition(toStackedChart)
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); });
	d3.selectAll('.totalBar')
		.attr('y', function(d, i) { return constant.y(getTotalVals(constant.refData, i)); })
		.attr('height', function(d, i){ return constant.height - constant.y(getTotalVals(constant.refData, i)); })
		.transition(toStackedChart)
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); });

	// if stacked bar chart exists, change height
	if (document.querySelector('.bar1')) {
		d3.selectAll('.bar1')
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); })
		.transition(toStackedChart)
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateMinorityVal(constant.refData, i)); })
		.attr('y', function(d, i) { return constant.y(evaluateMinorityVal(constant.refData, i)); });
		
		d3.selectAll('.bar2')
		.attr('height', 0)
		.attr('y', function(d) { return constant.y(0); })
		.transition(toStackedChart)
		.attr('height', function(d, i) { return constant.height - constant.y(evaluateTotalVal(constant.refData, i)); })
		.attr('y', function(d, i) { return constant.y(evaluateTotalVal(constant.refData, i)); });
	
	// if stacked bar chart does not exist, create stacked bar chart
	} else {
		let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		return createStackChart(constant.refData, g);
	}

}


/** STATIC ELEMENTS **/
function createScale(data, g) {
	constant.x.domain(data.data.map(function(d) { return d.abbreviation; }));
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
		.style('transform', 'translateY(20px) translateX(-13px) rotate(-90deg)');

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
		.attr('x', 30)
		.attr('y', 350)
		.attr('text-anchor', 'left')
		.style('font', '10px monospace')
		.text('Source: ' + data.source);
}

/** HELPER FUNCTIONS **/
// get male values
function getMaleVals(data, val) {
	return +data.data[val].values[0].value;
}

// get female values
function getFemaleVals(data, val) {
	return +data.data[val].values[1].value;
}

// get total values
function getTotalVals(data, val) {
	return +data.data[val].values[0].value + +data.data[val].values[1].value;
}

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

// format tooltip text
function getTooltipText(data, val) {
	let maleVals = +data.data[val].values[0].value;
	let femaleVals = +data.data[val].values[1].value;
	let state = data.data[val].state;

	return 'Men: ' + maleVals + '<br>' + 'Women: ' + femaleVals + '<br>' + state;
}

/** USER INTERACTION EVENTS **/
// change from stacked to group bar chart, or vice versa
let radioButtons = document.querySelector('.button-group');
radioButtons.addEventListener('change', function(evt){
	let chartType = evt.target.defaultValue;
	if(chartType){
		if (chartType === 'Grouped'){
			transitionToGrouped();
		} else if (chartType === 'Stacked') {
			transitionToStacked();
		}
	}
});

// kick off xhr
getData();

// explore
// 1 - can we clean up transition fucntions?