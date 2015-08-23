define(['jquery', 'd3', 'c3'], function($, d3, c3) {return function(chartNode, customOptions, extendedEvents) {

  var chart = c3.generate({
    bindto: chartNode,
    padding: {
      top: 10
    },
    size: {
      height: 240,
      width: 480
    },
    data: {
      columns: []
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
        show: true,
        label: 'temperature'
      },
      x: {
        type: 'timeseries',
        tick: {
          format: '%d %b',
          culling: {
            max: 8
          }
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
      keys: {
        x: 'date',
        value: ['temperature', 'energyLow', 'energyHigh']
      }
    });
  }

  // exports

  var exports = {
    setNest: setNest
  };

  return exports;
};});
