define(["d3", "googleMap", "nestDetail"], function(d3, GoogleMap, NestDetail) {

var module = function(chartNode, customOptions, events) {

  var defaultOptions = {
  }

  var options = $.extend({}, defaultOptions, customOptions);

  // general variables

  var gMap = new GoogleMap(chartNode, options, events);
  var nestDetail = new NestDetail();
  var nestLayer;
  var nests;

  function genPoint() {
    return {
      lat: latScale(Math.random()),
      lng: lonScale(Math.random()),
      radius: radScale(Math.random()),
    }
  }

  function initialize(_nests) {
    nests = _nests;
    gMap.initialize();
    gMap.on("mapReady", confgureMap);
    gMap.on("mapDraw", draw);
    gMap.zoomToFit(nests);
  }

  function confgureMap() {
    nestLayer = gMap.createLayer();

    var nestCircles = nestLayer.selectAll("circle")
      .data(nests);

    nestCircles
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("opacity", 0.8)
      .style("fill", "red")
      .on("mouseenter", onMouseEnter)
      .on("mouseout", onMouseExit);
  }

  function onMouseEnter(nest) {
    var offset = gMap.getOffset(nestLayer);
    var position = {
      x: nest.x - offset.x,
      y: nest.y - offset.y
    };

    nestDetail.show(position, nest);

    d3.select(this).style("fill", "blue");
  }

  function onMouseExit(thing) {
    nestDetail.hide();
    d3.select(this).style("fill", "red");
  }

  function draw() {
    nestLayer.selectAll("circle")
      .each(nestLayer.latLngToXy)
      .attr("cx", function(d) {return d.x})
      .attr("cy", function(d) {return d.y});
  }

  var exports = {
    initialize: initialize,
  }

  return $.extend({}, gMap, exports);
};

  return module;
});
