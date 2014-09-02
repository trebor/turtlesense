define(["d3", "lodash"], function(d3, _) {

// base svg chart, which auto resizes to fit containing element

var module = function(chartNode, customOptions, extendedEvents) {

  // globals

  var $chartNode = $(chartNode);
  var width;
  var height;
  var container;
  var options = {
    resizeDebounceMs: 200,
  }

  // declare events

  var events = ['chartResize'];
  if (extendedEvents) 
    events = events.concat(extendedEvents);
  var dispatch = d3.dispatch.apply(d3, events);

  // set options

  setOptions(customOptions);

  // debounced resize function

  var debouncedResize = _.debounce(
    function() {setDimensions();},
    options.resizeDebounceMs);

  // detect resize events

  $(window).resize(debouncedResize);

  // initialize the chart

  function initialize() {

    // create chart container

    container = d3.select(chartNode).append("svg");

    // set chart dimensions

    setDimensions();

    // watch for resize events
    
    $chartNode.resize(function() {
      (!width || !height) ? resize() : debouncedResize()
    });

    // setDimensions();
  }

  // redraw the chart

  function visualize() {
    console.error("Function visualize() must be overwritten");
  }

  // return svg chart element

  function getContainer() {
    return container;
  }

  // get the chart dimensions

  function getDimensions() {
    return {width: width, height: height};
  }

  // set chart dimensions

  function setDimensions(_width, _height) {
    width = _width || $chartNode.innerWidth();
    height = _height || $chartNode.innerHeight();
    container
      .attr("width", width).attr("height", height);
    dispatch.chartResize(getDimensions());
    exports.visualize();
  }

  // set options

  function setOptions(_options) {
    if (_options) {
      options = $.extend({}, options, _options);
    }
  }

  var exports = {

    // actions

    visualize: visualize,
    initialize: initialize,

    // getters

    getContainer: getContainer,
    getDimensions: getDimensions,

    // setters

    setDimensions: setDimensions,
    setOptions: setOptions,
  };

  return $.extend(exports, dispatch);
}

// end module

  return module;
});
