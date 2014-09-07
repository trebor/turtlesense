define(["jquery", "d3", "async!http://maps.google.com/maps/api/js?sensor=false"], function($, d3) {

var module = function(chartNode, customOptions, extendedEvents) {

  var map;
  var svg;
  var overlay;
  var layers = [];
  var overlayLayerDiv;

  var events = ['mapReady', 'mapDraw'];
  var dispatch = d3.dispatch.apply(d3, extendedEvents ? events.concat(extendedEvents) : events);

  // map styling

  var mapStyling = [
    {
      "elementType": "labels.text",
      "stylers": [
        { "lightness": 30 }
      ]
    },{
      "elementType": "labels.icon",
      "stylers": [
        { "lightness": 30 }
      ]
    }
  ];
  
  var defaultOptions = {
    zoom: 4,
    center: new google.maps.LatLng(36, -95),
    styles: mapStyling,
    panControlOptions: {position: google.maps.ControlPosition.RIGHT_TOP},
    zoomControlOptions: {position: google.maps.ControlPosition.RIGHT_TOP},
    streetViewControl: false,
  }; 

  var options = $.extend({}, defaultOptions, customOptions);

  function initialize() {

    // creat the map

    map = new google.maps.Map(chartNode, options);

    // create the place for the overlay layer

    overlay = new google.maps.OverlayView();
    overlay.setMap(map);

    // cope with adding to map

    overlay.onAdd = function() {
      overlayLayerDiv = this.getPanes().overlayMouseTarget;
      svg = d3.select(overlayLayerDiv)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

      addMapEventListener("dragend", onDrag);
      addMapEventListener("drag", onDrag);

      dispatch.mapReady();
    };

    // handle draw

    overlay.draw = function() {
      dispatch.mapDraw();
    };
  }

  function onDrag() {
    var mapOffset = getOrigin(overlay);

    // reposition div to adjust for change

    d3.select(overlayLayerDiv)
      .style("left", mapOffset.x)
      .style("top", mapOffset.y);
    
    // adjust any layers to match offset

    layers.forEach(function(layer) {
      layer.attr("transform", "translate(" + (-mapOffset.x) + "," + (-mapOffset.y) + ")");
    });

    // signal a draw

    overlay.draw();
  }

  function createLayer() {
    var layer = svg.append("g");
    layer.latLngToXy = function(thingWithLatLng) {
      var pos = latLngToScreen(thingWithLatLng, overlay);
      thingWithLatLng.x = pos.x;
      thingWithLatLng.y = pos.y;
      return pos;
    };
    layers.push(layer);
    return layer;
  }

  function latLngToScreen(position, overlay) {
    return overlay.getProjection().fromLatLngToDivPixel(
      new google.maps.LatLng(position.lat, position.lng));
  }

  function addMapEventListener(event, listener) {
    google.maps.event.addListener(map, event, listener);
  }

  function getOrigin(overlay) {
    var bounds = map.getBounds();
    var latlng = {
      lat: bounds.getNorthEast().lat(),
      lng: bounds.getSouthWest().lng(),
    };
    return latLngToScreen(latlng, overlay);
  }

  function zoomToFit(points) {
    var bounds = new google.maps.LatLngBounds();
    points.forEach(function(latLng) {
      bounds.extend(new google.maps.LatLng(latLng.lat, latLng.lng));
    });
    map.fitBounds(bounds);
  }

  function getOffset() {
    return getOrigin(overlay);
  }

  var exports = {
    initialize: initialize,
    getOrigin: getOrigin,
    getOffset: getOffset,
    addMapEventListener: addMapEventListener,
    createLayer: createLayer,
    zoomToFit: zoomToFit,
    latLngToScreen: latLngToScreen,
    visualize: function() {},
    setData: function() {},
  };

  return $.extend(exports, dispatch);
};

return module;
});
