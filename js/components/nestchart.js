define(['jquery', 'd3', 'c3'], function($, d3, c3) {return function(chartNode, customOptions, extendedEvents) {

  var TMP_COLOR = 'rgba(33, 102, 172, 0.7)';
  var NRG_COLOR = 'rgba(178, 24,  43, 0.7)';

  var titleFormat = d3.time.format("%d %b %y %H:%M:%S");
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
      color: color,
      colors: {
        temperature: TMP_COLOR,
        energyLow: NRG_COLOR,
        energyHigh: NRG_COLOR
      }
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
