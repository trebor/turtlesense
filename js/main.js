requirejs.config({
  baseUrl: 'bower_components',
  paths: {
    d3:        'd3/d3.min',
    queue:     'queue-async/queue.min',
    lodash:    'lodash/dist/lodash.min',
    jquery:    'jquery/dist/jquery.min',
    bootstrap: 'bootstrap/dist/js/bootstrap.min',
    async:     'requirejs-plugins/src/async',
    c3:        'c3/c3.min',

    // internal components

    baseChart:  '../js/components/basechart',
    nestMap:    '../js/components/nestmap',
    nestDetail: '../js/components/nestdetail',
    nestChart:  '../js/components/nestchart',
    googleMap:  '../js/components/googlemap',
    colors:     '../js/components/colors'
  },
  shim: {
    bootstrap: {deps: ['jquery']},
    c3:        {deps: ['d3'    ]}
  }
});


define(['d3', 'jquery', 'queue', 'bootstrap', 'nestMap'], function (d3, $, queue, bs, NestMap) {

  var TEMP_FACTOR = 25.6;
  var MS_INA_DAY = 86400000;
  var HOME_HOST = 'nps.turtlesense.org';
  var DATA_PATH = window.location.hostname == HOME_HOST ? '/nests/' : 'data/';
  var SUMMARY_FILE_EXT = '_Summary.csv';
  var DATE_FORMAT = d3.time.format("%m/%d/%Y");
  var DATETIME_FORMAT = d3.time.format("%Y-%m-%d %H:%M:%S");
  var LAT_LONG_REGEX = /(\d{2,3})(\d{2}\.\d{4})([NESW]?)/g;

  // construct the map

  var nestMap = new NestMap($(".chart").get(0));

  queue()
    .defer(d3.csv, DATA_PATH + 'Nest_Data.csv')
    .await(onData);

  function onData(error, nests) {
    if (error) {
      console.error("error", error);
      return;
    }

    // preprocess nests

    nests = nests
      .map(transformNest)
      .filter(function(nest) {return nest.show;})
      .sort(function(a, b) {return a.name.localeCompare(b.name);});

    var summaryQueue = queue();

    nests.forEach(function(nest) {
      summaryQueue.defer(function(path, callback) {
        d3.csv(path, function(error, samples) {
          nestJoinSamples(nest, samples || []);
          callback(null, true);
        });
      }, DATA_PATH + nest.sensor + SUMMARY_FILE_EXT);
    });

    summaryQueue
      .awaitAll(function() {
        nestMap.initialize(nests);
        populateMenu(nests);
        navigateHash(nests);
      });
  }

  function nestJoinSamples(nest, samples) {
    nest.samples = samples.map(function(sample) {
      return transformSample(nest.nestDate, sample);
    });
  }

  function transformSample(startDate, sample) {
    return {
      date: addDays(startDate, +sample.tDayStart),
      temperature: +sample.tempAvg / TEMP_FACTOR,
      energyLow: +sample.energyLow,
      energyHigh: +sample.energyHigh
    };
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * MS_INA_DAY);
  }

  function transformNest(nest, i) {
    return {
      id: i,
      name: nest['Nest'],
      sensor: nest['Sensor #'],
      nestDate: DATE_FORMAT.parse(nest['Nest Date']),
      lat: +nest['Lat'],
      lng: +nest['Long'],
      show: nest['Show on Map'].toLowerCase() == 'yes'
    };
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
        setTimeout(function() {
          nestMap.zoomToNest(nest);
        }, 100);
      }
    });
  }

  function populateMenu(nests) {
    $(".see-all").on("click", nestMap.zoomToAll);
    var picker = $(".nest-picker");
    nests.forEach(function(nest) {
      var a = $("<a/>").text(nest.name)
        .attr("href", "#" + nest.name.toLowerCase())
        .on("click", function() {nestMap.zoomToNest(nest);});
      var li = $("<li/>")
        .append(a);
      picker.append(li);
    });
  }
});
