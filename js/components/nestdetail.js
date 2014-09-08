define([], function(d3, GoogleMap) {

var module = function() {

  var $nestDetail = $(".nest-details");
  var $name = $nestDetail.find(".name");
  var $parent = $nestDetail.parent();

  function show(position, nest) {
    var xOffset = $parent.width() / 2 > position.x ? 0 : $nestDetail.width();
    var yOffset = $parent.height() / 2 > position.y ? 0 : $nestDetail.height();

    console.log("position", position);
    console.log("$parent.width()", $parent.width());
    console.log("$parent.height()", $parent.height());

    $nestDetail
      .css("left", position.x - xOffset)
      .css("top", position.y - yOffset)
      .show();
    $name.text(nest.name);
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


