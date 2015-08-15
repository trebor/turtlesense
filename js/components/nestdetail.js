define(["d3", "nestChart"], function(d3, NestChart) {

var module = function() {

  var DATE_FORMAT = d3.time.format("%b %-d, %Y");
  var offset = 1;

  var $nestDetail = $(".nest-details");
  var $name = $nestDetail.find("#name");
  var $date = $nestDetail.find("#date");
  var $sensor = $nestDetail.find("#sensor");
  var $timeSeries = $nestDetail.find("#time-series");
  var $parent = $nestDetail.parent();

  var chart = new NestChart($timeSeries);

  function show(position, nest) {

    chart.setNest(nest);

    // establish offset

    var xOffset = $parent.width() / 2 > position.x
      ? -offset
      : $nestDetail.width() + offset;
    var yOffset = $parent.height() / 2 > position.y
      ? -offset
      : $nestDetail.height() + offset;

    // plug fields

    $name.text(nest.name);
    $date.text(DATE_FORMAT(nest.nestDate));
    $sensor.text(nest.sensor);

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
    hide: hide,
    setOffset: function(_offset) {offset = _offset / Math.sqrt(2);}
  };

  return exports;
};

  return module;
});


