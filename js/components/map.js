define(["d3", "topojson", "basechart"], function(d3, topojson, BaseChart) {

var module = function(chartNode, options, extendedEvents) {

  // local events

  var events = ["countryEnter", "countryExit"].concat(extendedEvents || []);

  // general variables

  var base = new BaseChart(chartNode, options, events);
  var self = this;
  var width = 0;
  var height = 0;

  var projection = d3.geo.equirectangular()
    // .rotate([0, 0])
    .center([0, -5])
    // .parallels([29.5, 45.5])
    .scale(270)
    .translate([width / 2, height / 2])
    .precision(.1);

  var path = d3.geo.path()
    .projection(projection);

  base.on("chartResize", function(dimensions) {
    width = dimensions.width;
    height = dimensions.height;
    projection.translate([width / 2, height / 2]);
    path.projection(projection);
    base.visualize();
  });

  var mapLayer;
  var landLayer;
  var world;
  var countryMap;
  var countryCountMap;
  var countryCountScale = d3.scale.log()
    .range(["#f4abba", "#a0041e"]);

  function computeCentroid(feature) {
    var country = countryMap[feature.id];
    return country ? projection([
      country.latlng[1],
      country.latlng[0]
    ]) : path.centroid(feature);
  }

  function initialize() {
    base.initialize();

    mapLayer = base.getContainer().append("g");

    landLayer = mapLayer.append("g")
      .attr("class", "land");

    d3.json("static/data/world-countries.json", function(error, _world) {
      world = _world;
      base.visualize();
    });
  }

  function setData(tweets, countries) {
    countryMap = {};

    countries.forEach(function(country) {
      countryMap[country.cca3] = country;
    });

    countryCountMap = {};
    tweets.forEach(function(tweet) {
      tweet.countries.forEach(function(country) {
        var count = countryCountMap[country.cca3];
        countryCountMap[country.cca3] = count ? count + 1 : 1;
      });
    });

    var countryCounts = Object.keys(countryCountMap).map(function(countryId) {
      return countryCountMap[countryId];
    });

    countryCountScale.domain([1, d3.max(countryCounts)]);
    base.visualize();
  }

  function createMapLayer() {
    return mapLayer.append("g");
  }

  base.visualize = function() {

    if (!world)
      return;

    var update = landLayer.selectAll("path.country")
      .data(world.features);

    update
      .enter()
      .append("path")
      .attr("id", function(d){return d.id;})
      .classed("country", true)
      .each(function(d) {
        $(this)
          .mouseenter(countryEnter)
          .mouseleave(countryExit);
      })
      .style("fill", function(d) {
        var count = countryCountMap[d.id];
        return count && count > 0 ? countryCountScale(count) : null;
      });

    update
      .attr("d", path);

    // test centroids

//     var radiusScale = d3.scale.sqrt()
//       .domain(d3.extent(world.features, function(d) {
//         return countryCountMap[d.id] || 0;
//       }))
//       .range([0, 20]);

//     landLayer.selectAll("circle")
//       .data(world.features)
//       .enter()
//       .append("circle")
// //      .attr("r", function(d) {return radiusScale(countryCountMap[d.id] || 0)})
//       .attr("r", 3)
//       .attr("cx", function(d){return computeCentroid(d)[0]})
//       .attr("cy", function(d){return computeCentroid(d)[1]});
  }

  function countryEnter(event) {
    base.countryEnter(createEnterExitEvent(event.target.__data__), event);
  }

  function countryExit(event) {
    base.countryExit(createEnterExitEvent(event.target.__data__), event);
  }

  function createEnterExitEvent(event) {
    return {
      id: event.id,
      mouseEvent: d3.event,
      centroid: computeCentroid(event),
      metadata: countryMap[event.id],
    };
  }

  function getProjection() {
    return projection;
  }

  function setExtent(latLonPoints) {
    var geojson = {
      type: "LineString",
      coordinates: latLonPoints
        .filter(function(d) {return d.lon && d.lat}).
        map(function(d) {return [d.lon, d.lat]})
    };

    zoom(mapLayer, geojson);
  }

  function zoom(element, feature) {
    var bounds = path.bounds(feature);
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var scale = .9 / Math.max(dx / width, dy / height);
    var translate = [width / 2 - scale * x, height / 2 - scale * y];

    element.transition()
      .duration(750)
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
  }

  function expandExtent(extent, lowExtend, highExtend) {
    highExtend = highExtend !== undefined ? highExtend : lowExtend;
    var range = Math.abs(extent[1] - extent[0]);
    var order = extent[1] > extent[0] ? 1 : -1;

    return [
      extent[0] - order * range * lowExtend,
      extent[1] + order * range * highExtend
    ];
  }

  var exports = {
    createMapLayer: createMapLayer,
    initialize: initialize,
    setExtent: setExtent,
    setData: setData,
    getProjection: getProjection,
  }

  return $.extend({}, base, exports);
};

  return module;
});
