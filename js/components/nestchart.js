define(["d3", "lodash", "baseChart"], function(d3, _, BaseChart) {

// base svg chart, which auto resizes to fit containing element

var module = function($chartNode, customOptions, extendedEvents) {

  var localEvents = [];
  var localOptions = {};
  var dimensions;
  var baseChart = new BaseChart($chartNode, localOptions, localEvents);
  baseChart.setOptions(customOptions);
  baseChart.visualize = visualize;

  var margin = {top: 20, right: 60, bottom: 50, left: 50};
  var svg;
  var x = d3.time.scale();
  var y = d3.scale.linear();
  var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(d3.time.format("%b %e"))
    .ticks(5)
    .orient("bottom");
  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(6)
    .orient("left");

  var tempLine = d3.svg.line()
    .x(function(d) { return x(d.time);})
    .y(function(d) { return y(d.value);});

  function initialize() {
    baseChart.initialize();
    onResize(baseChart.getDimensions());

    svg = baseChart.getContainer()
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (dimensions.height - margin.bottom) + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("path")
      .classed("temperature", true);
  }
  
  function setNest(nest) {
    x.domain(d3.extent(nest.temperature, function(d) { return d.time; }));
    y.domain(d3.extent(nest.temperature, function(d) { return d.value; }));

    d3.select("path.temperature")
      .datum(nest.temperature)
      .attr("d", tempLine);

    d3.select(".y.axis")
      .call(yAxis);
    d3.select(".x.axis")
      .call(xAxis);
  }

  function onResize(_dimensions) {
    dimensions = _dimensions;
    x.range([0, dimensions.width - margin.right]);
    y.range([dimensions.height - margin.bottom, 0]);
  }

  function visualize() {
  }

  // exports

  var exports = {
    setNest: setNest
  };

  initialize();
  return $.extend(exports, baseChart);
}

// end module

  return module;
});
