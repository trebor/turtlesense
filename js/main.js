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
    bootstrap: {deps: ['jquery']},
  }
});


define(['d3', 'jquery', 'queue', 'bootstrap', 'nestMap'], function (d3, $, queue, bs, NestMap) {

  var DATE_FORMAT = d3.time.format("%Y-%m-%d");
  var DATETIME_FORMAT = d3.time.format("%Y-%m-%d %H:%M:%S");
  var LAT_LONG_REGEX = /(\d{2,3})(\d{2}\.\d{4})([NESW]?)/g

  // construct the map

  var nestMap = new NestMap($(".chart").get(0));

  queue()
   .defer(d3.csv, 'data/nests.csv')
   .defer(d3.csv, 'data/records.csv')
   .await(onData);

  function onData(error, nests, records) {
    if (error) {
      console.error("error", error);
      return;
    }

    // preprocess records

    records = records.map(transformRecord);

    // construct map of records grouped by nest ID

    var recordsMap = d3.nest()
      .key(function(d) {return +d.nest_id})
      .sortValues(function(a, b) {return a.date - b.date;})
      .map(records);

    // preprocess nests

    nests = nests
      .map(transformNest)
      .filter(function(nest) {return recordsMap[nest.id] && nest.lng > -80;})
      .map(function(nest) {return nestJoinRecords(nest, recordsMap[nest.id])})
      .sort(function(a, b) {return a.name.localeCompare(b.name)});

    nestMap.initialize(nests);
    populateMenu(nests);
    navigateHash(nests);
  }

  function nestJoinRecords(nest, records) {

    // group records by time

    recordsByTime = d3.nest()
      .key(function(d) {
        //return new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate(), d.date.getHours());
        return new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());
      })
      .sortValues(function(a, b) {return a.date - b.date;})
      .entries(records);

    // establish mean temperatures during that time period

    var meanTempsByPeriod = recordsByTime.reduce(function(acc, period) {
      acc.push({
        date: new Date(period.key),
        temperature: d3.mean(period.values, function(d) {return d.temperature;})
      });
      return acc;
    }, []);

    // assign mean temperature to nest

    nest.records = meanTempsByPeriod;
    return nest;
  }

  function transformRecord(record) {
    record.date = DATETIME_FORMAT.parse(record.record_datetime);
    record.nest_id = +record.nest_id;
    record.temperature = +record.temperature;
    return record;
  }

  function transformNest(nest) {
    var newNest = {
      id: +nest.nest_id,
      name: nest.sensor_id + ':' + nest.comm_id + '(' + nest.nest_id + ')',
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
        value: valueScale(normalValue),
      });
    }

    return timeSeries;
  }
});
