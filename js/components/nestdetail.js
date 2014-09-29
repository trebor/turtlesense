define(["d3", "nestChart"], function(d3, NestChart) {

var module = function() {

  var DATE_FORMAT = d3.time.format("%b %-d, %Y");
  var COMFORT_ZONE = 5;

  var $nestDetail = $(".nest-details");
  var $name = $nestDetail.find("#name");
  var $date = $nestDetail.find("#date");
  var $comm = $nestDetail.find("#comm");
  var $timeSeries = $nestDetail.find("#time-series");
  var $parent = $nestDetail.parent();

  var chart = new NestChart($timeSeries);

  function show(position, nest) {

    chart.setNest(nest);

    // establish offset

    var xOffset = $parent.width() / 2 > position.x
      ? -COMFORT_ZONE
      : $nestDetail.width() + COMFORT_ZONE;
    var yOffset = $parent.height() / 2 > position.y
      ? -COMFORT_ZONE
      : $nestDetail.height() + COMFORT_ZONE;

    // plug fields

    $name.text(nest.name);
    $date.text(DATE_FORMAT(nest.nestDate));
    $comm.text(nest.comm);

    // show detial

    $nestDetail
      .css("left", position.x - xOffset)
      .css("top", position.y - yOffset)
      .show();
  }
  
  function hide() {
    $nestDetail.hide();
  }

  var exports = {
    show: show,
    hide: hide
  }
  
  return exports;
};

  return module;
});


