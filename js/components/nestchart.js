define(['jquery', 'c3', 'colors'], function($, c3, colors) {return function(chartNode, customOptions, extendedEvents) {

  var TMP_COLOR = colors(colors.BLUE, colors.LIGHT, 0.3);
  var NRG_COLOR = colors(colors.RED , colors.LIGHT, 0.8);

  var titleFormat = d3.time.format("%d %b %H:%M");

  var chart = c3.generate({
    bindto: chartNode,
    transition: {
      duration: 0
    },
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
          format: '%d %b'
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
        transition: {
          duration: 0
        },
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
