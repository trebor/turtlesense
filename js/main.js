requirejs.config({
  baseUrl: 'bower_components',
  paths: {
    d3: 'd3/d3.min',
    jquery: 'jquery/dist/jquery.min',
    bootstrap: 'bootstrap/dist/js/bootstrap.min',
    async:     'requirejs-plugins/src/async',

    // internal components

    nestMap:    '../js/components/nestmap',
    nestDetail: '../js/components/nestdetail',
    googleMap:  '../js/components/googlemap'
  },
  shim: {
    bootstrap: {deps: ['jquery']},
  }
});


define(['d3', 'jquery', 'bootstrap', 'nestMap'], function (d3, $, bs, NestMap) {

  var DATE_FORMAT = d3.time.format("%Y-%m-%d");
  var LAT_LONG_REGEX = /(\d{2,3})(\d{2}\.\d{4})([NESW]?)/g

  // construct the map

  var nestMap = new NestMap($(".chart").get(0));

  // load the data

  d3.csv("data/nests.csv")
    .row(transformNest)
    .get(function(error, rows) {error ? console.log("error", error) : onData(rows)});

  function onData(nests) {
    console.log("nests", nests);
    nests.sort(function(a, b) {return a.name.localeCompare(b.name)});
    nestMap.initialize(nests);
    populateMenu(nests);
    navigateHash(nests);
  }

  function transformNest(nest) {
    var newNest = {
      id: nest.nest_id,
      name: nest.sensor_id,
      comm: nest.comm_id,
      nestDate: DATE_FORMAT.parse(nest.nest_date),
      lat: parseLatLong(nest.latitude),
      lng: parseLatLong(nest.longitude),
    }

    return newNest;
  }

  function parseLatLong(ll) {
    var tokens = ll.split(LAT_LONG_REGEX);
    var degrees = parseInt(tokens[1]);
    var minutes = parseFloat(tokens[2]);
    var ordinal = tokens[3];
    var sign = (ordinal.length == 0 || "NW".indexOf(ordinal) < 0) ? -1 : 1;
    return sign * (degrees + (minutes * 60 / 3600));
  }

  function navigateHash(nests) {
    var nestName = window.location.hash.substr(1);
    nests.forEach(function(nest) {
      if (nestName.toLowerCase() == nest.name.toLowerCase()) {
        nestMap.zoomToNest(nest)
      }
    });
  }

  function populateMenu(nests) {
    $(".see-all").on("click", nestMap.zoomToAll);
    var picker = $(".nest-picker");
    nests.forEach(function(nest) {
      var a = $("<a/>").text(nest.name)
        .attr("href", "#" + nest.name.toLowerCase())
        .on("click", function() {nestMap.zoomToNest(nest)});
      var li = $("<li/>")
        .append(a);
      picker.append(li);
    });
  }
});

