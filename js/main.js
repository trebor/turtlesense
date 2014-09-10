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

  var nestMap = new NestMap($(".chart").get(0));

  d3.csv("data/nests.csv")
    .row(transformNest)
    .get(function(error, rows) {error ? console.log("error", error) : onData(rows)});

  function onData(nests) {
    console.log("nests", nests);
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
      lat: parseFloat(nest.latitude) / 100,
      lng: parseFloat(nest.longitude) / -100,
    }

    // // show east coast data only

    // return (newNest.lng < -80) ? undefined : newNest;

    return newNest;
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

