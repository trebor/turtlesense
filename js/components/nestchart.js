define(['d3', 'lodash', 'baseChart'], function(d3, _, BaseChart) {

// base svg chart, which auto resizes to fit containing element

var module = function($chartNode, customOptions, extendedEvents) {

  var localEvents = [];
  var localOptions = {};
  var dimensions;
  var baseChart = new BaseChart($chartNode, localOptions, localEvents);
  baseChart.setOptions(customOptions);
  baseChart.visualize = visualize;

  var margin = {top: 20, right: 90, bottom: 50, left: 45};
  var svg;
  var x = d3.time.scale();
  var yTmp = d3.scale.linear();
  var yNrg = d3.scale.linear();
  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(4)
    .tickFormat(d3.time.format('%b %e'))
    .orient('bottom');
  var yTmpAxis = d3.svg.axis()
    .scale(yTmp)
    .orient('left');
  var yNrgAxis = d3.svg.axis()
    .scale(yNrg)
    .orient('right');

  var tempLine = d3.svg.line()
    .x(function(d) { return x(d.date);})
    .y(function(d) { return yTmp(d.temperature);});

  var nrgLine = d3.svg.line()
    .x(function(d) { return x(d.date);})
    .y(function(d) { return yNrg(d.energyLow);});

  function initialize() {
    baseChart.initialize();
    onResize(baseChart.getDimensions());

    svg = baseChart.getContainer()
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (dimensions.height - margin.bottom) + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'yTmp axis')
      .call(yTmpAxis);

    svg.append('g')
      .attr('transform', 'translate(' + [dimensions.width - margin.right , 0] + ')')
      .attr('class', 'yNrg axis')
      .call(yTmpAxis);

    svg.append('path')
      .classed('temperature', true);

    svg.append('path')
      .classed('energyLow', true);
  }

  function setNest(nest) {
    x.domain(d3.extent(nest.samples, function(d) { return d.date; }));
    yTmp.domain(d3.extent(nest.samples, function(d) { return d.temperature; }));
    yNrg.domain([d3.min(nest.samples, function(d) { return d.energyLow; }), 20]);

    d3.select('path.temperature')
      .datum(nest.samples)
      .attr('d', tempLine);

    d3.select('path.energyLow')
      .datum(nest.samples)
      .attr('d', nrgLine);

    d3.select('.yTmp.axis')
      .call(yTmpAxis);
    d3.select('.yNrg.axis')
      .call(yNrgAxis);
    d3.select('.x.axis')
      .call(xAxis);
  }

  function onResize(_dimensions) {
    dimensions = _dimensions;
    x.range([0, dimensions.width - margin.right]);
    yTmp.range([dimensions.height - margin.bottom, 0]);
    yNrg.range([dimensions.height - margin.bottom, 0]);
  }

  function visualize() {
  }

  // exports

  var exports = {
    setNest: setNest
  };

  initialize();
  return $.extend(exports, baseChart);
};

// end module

  return module;
});
