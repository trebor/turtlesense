define(["d3", "googleMap", "nestDetail"], function(d3, GoogleMap, NestDetail) {

var module = function(chartNode, customOptions, events) {

  var defaultOptions = {
  }

  var NEST_STATES = {
    PINNED: "green",
    HOVERED: "red",
    DEFAULT: "grey",
  };

  var options = $.extend({}, defaultOptions, customOptions);

  // general variables

  var gMap = new GoogleMap(chartNode, options, events);
  var nestDetail = new NestDetail();
  var pinnedNest = undefined;
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
    gMap.on("drag", onDrag);
    gMap.on("zoom", draw);
    gMap.zoomToFit(nests);
  }

  function confgureMap() {
    nestLayer = gMap.createLayer();

    var nestCircles = nestLayer.selectAll("circle")
      .data(nests);

    nestCircles
      .enter()
      .append("circle")
      .classed("nest", true)
      .attr("r", 10)
      .attr("opacity", 0.8)
      .style("fill", NEST_STATES.DEFAULT)
      .on("click", function(d) {zoomToNest(d)})
      .on("mouseenter", onMouseEnter)
      .on("mouseleave", onMouseExit);
  }

  function onMouseEnter(nest) {
    if (nest != pinnedNest) {
      hoverNest(nest);
    }
  }

  function onMouseExit(nest) {
    unhoverNest(nest);
  }

  function onDrag() {
    unpinNest();
  }

  function draw() {
    nestLayer.selectAll("circle")
      .each(nestLayer.latLngToXy)
      .attr("cx", function(d) {return d.x})
      .attr("cy", function(d) {return d.y});
  }

  function hoverNest(nest) {
    unpinNest();

    var offset = gMap.getOffset(nestLayer);
    var position = {
      x: nest.x - offset.x,
      y: nest.y - offset.y
    };

    nestDetail.show(position, nest);
    setNestState(NEST_STATES.HOVERED, nest);
  }

  function unhoverNest(nest) {
    if (!pinnedNest) {
      nestDetail.hide();
      setNestState(NEST_STATES.DEFAULT);
    }
  }

  function pinNest(nest) {
    nestDetail.show({x: 10, y: 10}, nest);
    pinnedNest = nest;
    setNestState(NEST_STATES.PINNED, nest);
  }

  function unpinNest() {
    nestDetail.hide();
    setNestState(NEST_STATES.DEFAULT);
    pinnedNest = undefined;
  }

  function setNestState(state, nest) {
    d3.selectAll(".nest")
      .filter(function(d) {return nest ? d == nest : true})
      .style("fill", state);
  }

  function zoomToNest(nest) {
    gMap.setSatellite();
    gMap.zoomToFit([nest]);
    pinNest(nest);
  }

  function zoomToAll() {
    unpinNest();
    gMap.setRoadmap();
    gMap.zoomToFit(nests);
  }

  var exports = {
    initialize: initialize,
    zoomToNest: zoomToNest,
    zoomToAll: zoomToAll
  }

  return $.extend({}, gMap, exports);
};

  return module;
});
