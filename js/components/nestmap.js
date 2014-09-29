define(["d3", "googleMap", "nestDetail"], function(d3, GoogleMap, NestDetail) {

var module = function(chartNode, customOptions, events) {

  var defaultOptions = {
  }

  var DEFAULT_SCALE = 1;
  var CLOSE_SCALE = 2;

  var mapScale = d3.scale.linear()
    .domain([0, 21])
    .range([.5, 2.2]);

  var STATE_PINNED = "pinned";
  var STATE_HOVERED = "hovered";

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
    gMap.on("zoom", onZoom);
    gMap.on("idle", draw);
    gMap.zoomToFit(nests);
  }

  function confgureMap() {
    nestLayer = gMap.createLayer();

    var nestCircles = nestLayer.selectAll(".nest")
      .data(nests);

    var nestGroups = nestCircles
      .enter()
      .append("g")
      .classed("nest", true)
      .on("click", onNestClick)
      .on("mouseenter", onNestEnter)
      .on("mouseleave", onNestExit);

    nestGroups
      .append("circle")
      .classed("plate", true)
      .attr("r", 7);

    for (var angle = 0; angle < 360; angle += 120) {
      nestGroups
        .append("circle")
        .classed("egg", true)
        .attr("r", 2.5)
        .attr("cy", -3)
        .attr("transform", "rotate(" + angle + ")");
    }
  }

  function onNestEnter(nest) {
    if (nest != pinnedNest) {
      hoverNest(nest);
    }
  }

  function onNestExit(nest) {
    unhoverNest(nest);
  }

  function onNestClick(nest) {
    zoomToNest(nest);
  }

  function onDrag() {
    unpinNest();
    draw();
  }

  function onZoom(zoom) {
    if (zoom < 19) {
      unpinNest();
    }
    draw();
  }

  function draw() {
    var scale = mapScale(gMap.getZoom());

    nestLayer.selectAll(".nest")
      .each(nestLayer.latLngToXy)
      .attr("transform", function(d) {
        return "translate(" + d.x + ", " + d.y + ") scale(" + scale + ")";
      });
  }

  function hoverNest(nest) {
    unpinNest();

    var offset = gMap.getOffset(nestLayer);
    var position = {
      x: nest.x - offset.x,
      y: nest.y - offset.y
    };

    nestDetail.show(position, nest);
    setNestState(STATE_HOVERED, nest);
  }

  function unhoverNest(nest) {
    if (!pinnedNest) {
      nestDetail.hide();
      clearNestStates();
    }
  }

  function pinNest(nest) {
    nestDetail.show({x: 8, y: 8}, nest);
    pinnedNest = nest;
    setNestState(STATE_PINNED, nest);
  }

  function unpinNest() {
    nestDetail.hide();
    clearNestStates();
    pinnedNest = undefined;
  }

  function clearNestStates() {
    setNestState();
  }

  function setNestState(state, nest) {
    d3.selectAll(".nest")
      .classed(STATE_PINNED,  function(d) {return d == nest && state == STATE_PINNED})
      .classed(STATE_HOVERED, function(d) {return d == nest && state == STATE_HOVERED});
  }

  function zoomToNest(nest) {
    gMap.setSatellite();
    gMap.zoomToPoint(nest);
    pinNest(nest);
  }

  function zoomToAll() {
    unpinNest();
    gMap.setRoadmap();
    gMap.zoomToFit(nests);
    draw();
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
