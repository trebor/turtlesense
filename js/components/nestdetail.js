define(["d3"], function(d3) {

var module = function() {

  var DATE_FORMAT = d3.time.format("%b %-d, %Y");

  var $nestDetail = $(".nest-details");
  var $name = $nestDetail.find("#name");
  var $date = $nestDetail.find("#date");
  var $parent = $nestDetail.parent();

  function show(position, nest) {
    var xOffset = $parent.width() / 2 > position.x ? 0 : $nestDetail.width();
    var yOffset = $parent.height() / 2 > position.y ? 0 : $nestDetail.height();

    $nestDetail
      .css("left", position.x - xOffset)
      .css("top", position.y - yOffset)
      .show();
    $name.text(nest.name);
    $date.text(DATE_FORMAT(nest.nestDate));
    
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


