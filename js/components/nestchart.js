define(['jquery', 'd3', 'c3'], function($, d3, c3) {return function(chartNode, customOptions, extendedEvents) {

  var colors = d3.scale.category10();
  var TMP_COLOR = colors(0);
  var NRG_COLOR = colors(1);

  var titleFormat = d3.time.format("%d %b %y %H:%M:%S");

  var chart = c3.generate({
    bindto: chartNode,
    zoom: {
        enabled: true
    },
    padding: {
      top: 25
    },
    size: {
      height: 300,
      width: 500
    },
    data: {
      columns: [],
      color: color,
      colors: {
        temperature: TMP_COLOR,
        energyLow: NRG_COLOR,
        energyHigh: NRG_COLOR
      },
      names: {
        temperature: 'Temperature',
        energyLow: 'Energy Low',
        energyHigh: 'Energy High'
      }
    },
    point: {
      show: false
    },
    axis: {
      y: {
        label: 'Energy',
        max: 20
      },
      y2: {
        label: 'Temperature',
        show: true
      },
      x: {
        type: 'timeseries',
        tick: {
          count: 8,
          format: '%d %b %y'
        }
      }
    },
    tooltip: {
      format: {
        title: titleFormat,
        value: valueFormat
      }
    }
  });

  function setNest(nest) {

    if (nest.samples.length > 0) {
      chart.load({
        json: nest.samples,
        axes: {
          energyHigh: 'y',
          energyLow: 'y',
          temperature: 'y2'
        },
        types: {
          energyHigh: 'area',
          energyLow: 'area'
        },
        keys: {
          x: 'date',
          value: ['energyHigh', 'energyLow', 'temperature']
        }
      });
    }
    else {
      chart.unload({
        ids: ['energyHigh', 'energyLow', 'temperature']
      });
    }
  }

  function valueFormat(value, ratio, id) {
    return Math.round(value * 10) / 10;
  }

  function color(color, datum) {
    switch (datum.id) {
    case 'energyLow':
      return 'white';
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
