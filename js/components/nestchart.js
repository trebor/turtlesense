define(['jquery', 'd3', 'c3'], function($, d3, c3) {return function(chartNode, customOptions, extendedEvents) {

  var tempColorScale = d3.scale.linear()
    .range(['red', 'blue'])
    .domain([0, 30]);

  var chart = c3.generate({
    bindto: chartNode,
    zoom: {
        enabled: true
    },
    padding: {
      top: 10
    },
    size: {
      height: 240,
      width: 480
    },
    data: {
      columns: [],
      color: color
    },
    point: {
      show: false
    },
    axis: {
      y: {
        label: 'energy',
        max: 20
      },
      y2: {
        label: 'temperature',
        show: true
      },
      x: {
        type: 'timeseries',
        tick: {
          count: 8,
          format: '%d %b'
        }
      }
    }
  });

  function setNest(nest) {
    chart.load({
      json: nest.samples,
      axes: {
        energyLow: 'y',
        energyHigh: 'y',
        temperature: 'y2'
      },
      types: {
        // temperature: 'area'
      },
      keys: {
        x: 'date',
        value: ['temperature', 'energyLow', 'energyHigh']
      }
    });
  }

  function color(color, datum) {
    switch (datum.id) {
    // case 'temperature':
      // var c = tempColorScale(datum.value);
      // console.log(datum, c);
      // // var c = '#0300fc';
      // return c;
      // var c = datum.index < 500 ? 'red' : 'blue';
      // console.log(datum.index, c);
      // return c;
      // console.log("==================================================");
    default:
      return color;
    }
  }

  // exports

  var exports = {
    setNest: setNest
  };

  return exports;
};});
