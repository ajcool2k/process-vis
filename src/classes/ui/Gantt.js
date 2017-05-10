
/**
 * @author Jens Auerswald
 * @version 1.0
 */

export function ganttExt(d3lib) {

	var d3 = d3lib;					// store d3 lib
	var container = "body";			// container for svg
	var svg;

	// layout
    var margin = { top : 20, right : 40, bottom : 20, left : 80 };
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;	

	// flex option
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

	// axis
    var xScale;
    var yScale;    
    var xAxis;
    var yAxis;

	// domain
	var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var timeDomainStart;
    var timeDomainEnd;
    var tickFormat = "%H:%M";

	// data
    var taskTypes = [];
    var taskStatus = [];


    var keyFunction = function(d) {
		return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
		return "translate(" + xScale(d.startDate) + "," + yScale(d.taskName) + ")";
    };

    var initTimeDomain = function(tasks) {
	
		if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
			if (tasks === undefined || tasks.length < 1) {
				timeDomainStart = d3.time.day.offset(new Date(), -3);
				timeDomainEnd = d3.time.hour.offset(new Date(), +3);
				return;
			}
		
			tasks.sort(function(a, b) {
				return a.endDate - b.endDate;
			});
			
			timeDomainEnd = tasks[tasks.length - 1].endDate;
			
			tasks.sort(function(a, b) {
				return a.startDate - b.startDate;
			});
			
			timeDomainStart = tasks[0].startDate;
		}
    };

    var initAxis = function() {
		xScale = d3.scaleTime()
				.domain([ timeDomainStart, timeDomainEnd ])
				.range([ 0, width ])
				.clamp(true);

		yScale = d3.scaleBand()
				.domain(taskTypes)
				.range([ 0, height - margin.top - margin.bottom ])
				.round(.1);

    	xAxis = d3.axisBottom()
				.scale(xScale)
				.tickFormat(d3.timeFormat(tickFormat))
				.tickSize(8)
				.tickPadding(8);

    	yAxis = d3.axisLeft()
				.scale(yScale)
				.tickSize(0);

    };
    
	// for webpack hot reloading
	function clean() {
		if (svg) {
			svg.remove();
			svg = null;
		}

		d3.selectAll("svg.chart").remove();
	}

	function create() {
		// create SVG
		svg = d3.select(container).append("svg")
			.attr("class", "chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("class", "gantt-chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

		
		// create Axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
			.transition()
			.call(xAxis);
		
		svg.append("g")
			.attr("class", "y axis")
			.transition()
			.call(yAxis);

		return;
	}

    function gantt(tasks) {
		console.log('create gantt');
		
		clean();

		initTimeDomain(tasks);
		initAxis();

		create();

		draw(tasks);
		
		return gantt;

    };
    
	gantt.redraw = function(tasks) {
		console.log('redraw gantt');
		initTimeDomain(tasks);
		initAxis();
		draw(tasks);	
	};

     function draw(tasks) {
		console.log('draw gantt');
	
        svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect")
			.data(tasks, keyFunction);
        
        rect.enter()
			.insert("rect",":first-child")
			.attr("rx", 5)
			.attr("ry", 5)
			.attr("class", function(d){ 
				if(taskStatus[d.status] == null){ return "bar";}
					return taskStatus[d.status];
				}) 
			.transition()
			.attr("y", 0)
			.attr("transform", rectTransform)
			.attr("height", function(d) {
				return yScale.bandwidth();
			})
			.attr("width", function(d) { 
				return (xScale(d.endDate) - xScale(d.startDate)); 
			});

        rect.transition()
          	.attr("transform", rectTransform)
	 		.attr("height", function(d) { 
				return yScale.bandwidth();
			})
	 		.attr("width", function(d) { 
	     		return (xScale(d.endDate) - xScale(d.startDate)); 
	     	});
        
		rect.exit().remove();

		svg.select(".x").transition().call(xAxis);
		svg.select(".y").transition().call(yAxis);
		
		return gantt;
    };

    gantt.margin = function(value) {
		if (!arguments.length)
			return margin;

		margin = value;
		return gantt;
    };

    gantt.timeDomain = function(value) {
		if (!arguments.length)
			return [ timeDomainStart, timeDomainEnd ];
			
		timeDomainStart = +value[0], timeDomainEnd = +value[1];
		return gantt;
    };

    gantt.timeDomainMode = function(value) {
		if (!arguments.length)
			return timeDomainMode;

		timeDomainMode = value;
		return gantt;

    };

    gantt.taskTypes = function(value) {
		if (!arguments.length)
			return taskTypes;

		taskTypes = value;
		return gantt;
    };
    
    gantt.taskStatus = function(value) {
		if (!arguments.length)
			return taskStatus;

		taskStatus = value;
		return gantt;
    };

    gantt.setContainer = function(value) {
		if (!arguments.length)
			return container;

		container = value;
		return gantt;
    };	

    gantt.width = function(value) {
		if (!arguments.length)
			return width;

		width = +value;
		return gantt;
    };

    gantt.height = function(value) {
		if (!arguments.length)
			return height;

		height = +value;
		return gantt;
    };

    gantt.tickFormat = function(value) {
		if (!arguments.length)
			return tickFormat;

		tickFormat = value;
		return gantt;
    };
    
    return gantt;
};