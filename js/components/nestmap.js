define(['d3', 'googleMap', 'nestDetail'], function(d3, GoogleMap, NestDetail) {

var module = function(chartNode, customOptions, events) {

  var defaultOptions = {
  }

  var EGG_COUNT = 4;
  var EGG_LIGHT = 'white';
  var EGG_DARK = '#6C4721';
  var NEST_LIGHT = '#AD421E';
  var NEST_DARK = '#333';
  var NEST_SIZE = 13;
  var EGG_SIZE = 5;
  var DEFAULT_SCALE = 1;
  var CLOSE_SCALE = 2;

  var EGG_GRADIANT = [
    {color: EGG_LIGHT, offset: 0},
    {color: EGG_LIGHT, offset: 15},
    {color: EGG_DARK,  offset: 200},
  ];
  var NEST_GRADIANT = [
    {color: NEST_DARK, offset: 0},
    {color: NEST_LIGHT,  offset: 100},
  ];

  var mapScale = d3.scale.linear()
    .domain([0, 21])
    .range([.1, 4]);
//    .range([10, 10]);

  var STATE_PINNED = 'pinned';
  var STATE_HOVERED = 'hovered';

  var options = $.extend({}, defaultOptions, customOptions);

  var nestMapEvents = [];

  // general variables

  var gMap = new GoogleMap(chartNode, options, nestMapEvents.concat(events));
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
    gMap.on('mapReady', confgureMap);
    gMap.on('mapDraw', draw);
    gMap.on('drag', onDrag);
    gMap.on('zoom', onZoom);
    gMap.on('idle', draw);
    gMap.zoomToFit(nests);
  }

  function confgureMap() {
    var defs = gMap.getSvg().append('defs');
    var eggGradient = defs.append('radialGradient')
      .attr('id', 'eggGradient')
      .attr('r', '70%')
      .attr('cx', '35%')
      .attr('cy', '35%');

    EGG_GRADIANT.forEach(function(stop) {
      eggGradient.append('stop')
        .attr('offset', stop.offset + '%')
        .attr('style', 'stop-color:' + stop.color + ';stop-opacity:1');
    });

    var nestGradient = defs.append('linearGradient')
      .attr('id', 'nestGradient')
      .attr('r', '50%')
      .attr('cx', '35%')
      .attr('cy', '35%');

    NEST_GRADIANT.forEach(function(stop) {
      nestGradient.append('stop')
        .attr('offset', stop.offset + '%')
        .attr('style', 'stop-color:' + stop.color + ';stop-opacity:1');
    });

    nestLayer = gMap.createLayer();

    var nestCircles = nestLayer.selectAll('.nest')
      .data(nests);

    var nestGroups = nestCircles
      .enter()
      .append('g')
      .classed('nest', true)
      .on('click', onNestClick)
      .on('mouseenter', onNestEnter)
      .on('mouseleave', onNestExit);

    nestGroups
      .append('circle')
      .classed('plate', true)
      .attr('fill', 'url(#nestGradient)');

    nestGroups.selectAll('.egg')
      .data(d3.range(EGG_COUNT))
      .enter()
      .append('circle')
      .classed('egg', true)
      .attr('fill', 'url(#eggGradient)');
  }

  function eggXY(egg, trigFn) {
    return eggRadius() * 1.3 * trigFn(eggAngle(egg));
  }

  function eggAngle(egg) {
    return egg * Math.PI * 2 / EGG_COUNT + 2;
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

  function nestRadius() {
    return mapScale(gMap.getZoom()) * NEST_SIZE / 2;
  }

  function eggRadius() {
    return mapScale(gMap.getZoom()) * EGG_SIZE / 2;
  }

  function draw() {
    nestDetail.setOffset(nestRadius());

    nestLayer.selectAll('.plate')
      .attr('r', nestRadius);

    nestLayer.selectAll('.egg')
      .attr('cx', function(d) {return eggXY(d, Math.cos);})
      .attr('cy', function(d) {return eggXY(d, Math.sin);})
      .attr('r', eggRadius);

    nestLayer.selectAll('.nest')
      .each(nestLayer.latLngToXy)
      .attr('transform', function(d) {
        return 'translate(' + d.x + ', ' + d.y + ')';
      });
  }

  function hoverNest(nest) {

    // sort nest to top

    d3.selectAll('.nest')
      .sort(function(a, b) {
        if (a == nest) return 1;
        if (b == nest) return -1;
        return a.name.localeCompare(b.name);
      });

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
    d3.selectAll('.nest')
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
