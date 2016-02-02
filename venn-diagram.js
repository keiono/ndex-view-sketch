var sets = [{
	sets: ['Genes in network'],
	size: 1233
}, {
	sets: ['Query genes'],
	size: 152
}, {
	sets: ['Genes in network', 'Query genes'],
	size: 75
}, ];
var chart = venn.VennDiagram().width(300).height(300);
var div = d3.select("#venn")
d3.select("#venn").datum(sets).call(chart);

var tooltip = d3.select("body").append("div")
	.attr("class", "venntooltip");

div.selectAll("g")
	.on("mouseover", function(d, i) {
		// sort all the areas relative to the current item
		venn.sortAreas(div, d);

		// Display a tooltip with the current size
		tooltip.transition().duration(400).style("opacity", .9);
		tooltip.text(d.size + " genes");

		// highlight the current path
		var selection = d3.select(this).transition("tooltip").duration(400);
		selection.select("path")
			.style("stroke-width", 3)
			.style("fill-opacity", d.sets.length == 1 ? .4 : .1)
			.style("stroke-opacity", 1);
	})

.on("mousemove", function() {
	tooltip.style("left", (d3.event.pageX) + "px")
		.style("top", (d3.event.pageY - 28) + "px");
})

.on("mouseout", function(d, i) {
	tooltip.transition().duration(800).style("opacity", 0);
	var selection = d3.select(this).transition("tooltip").duration(400);
	selection.select("path")
		.style("stroke-width", 0)
		.style("fill-opacity", d.sets.length == 1 ? .25 : .0)
		.style("stroke-opacity", 0);
});

  		var bp = {
  			y: [
  				'nitrogen compound metabolic process',
  				'catabolic process',
  				'biosynthetic process',
  				'negative regulation of metabolic process',
  				'positive regulation of metabolic process'
  			], 
  			x: [30,13,24,22,25],
  			orientation: 'h',
  			name: 'Nodes in Network',
  			 marker: {
    			color: 'rgba(00,128,191,0.8)',
    			width: 0
  			},
  			type: 'bar'
		};


		var data = [bp];
		var layout = {
			title: 'GO Biological Process'};

		Plotly.newPlot('myDiv', data, layout);