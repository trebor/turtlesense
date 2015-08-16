requirejs.config({
  baseUrl: 'bower_components',
  paths: {
    d3: 'd3/d3.min',
    queue: 'queue-async/queue.min',
    lodash: 'lodash/dist/lodash.min',
    jquery: 'jquery/dist/jquery.min',
    bootstrap: 'bootstrap/dist/js/bootstrap.min',
    async:     'requirejs-plugins/src/async',

    // internal components

    baseChart:  '../js/components/basechart',
    nestMap:    '../js/components/nestmap',
    nestDetail: '../js/components/nestdetail',
    nestChart:  '../js/components/nestchart',
    googleMap:  '../js/components/googlemap'
  },
  shim: {
    bootstrap: {deps: ['jquery']}
  }
});


define(['d3', 'jquery', 'queue', 'bootstrap', 'nestMap'], function (d3, $, queue, bs, NestMap) {

  console.log("window.location.hostname", window.location.hostname);

  var TEMP_FACTOR = 25.6;
  var MS_INA_DAY = 86400000;
  var DATA_PATH = 'data/';
  // var DATA_PATH = '/nests/';
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
      energyHight: +sample.energyHight
    };
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * MS_INA_DAY);
  }

  function transformNest(nest, i) {
    var sensor = nest['Sensor #'];
    var commId = nest['Comm ID #'];

    return {
      id: i,
      name: commId,
      commId: commId,
      sensor: sensor,
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
        nestMap.zoomToNest(nest);
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

  function generateRandomTimeSeries(timeScale, valueScale, sampleCount, volitility) {
    volitility = volitility || .1;
    var volitilityScale = d3.scale.linear().range([-volitility, volitility]);
    var timeSeries = [];
    var normalValue = Math.random();

    // create samples

    for (var i = 0; i < sampleCount; ++i) {

      // compute value normal

      var dNormal = volitilityScale(Math.random());
      normalValue += dNormal;
      normalValue = d3.max([0, d3.min([1, normalValue])]);

      // create record

      timeSeries.push({
        time: timeScale.invert(i / (sampleCount - 1)),
        value: valueScale(normalValue)
      });
    }

    return timeSeries;
  }
});
