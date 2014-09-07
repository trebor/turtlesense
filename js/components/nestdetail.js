define([], function(d3, GoogleMap) {

var module = function() {

  var $nestDetail = $(".nest-details");
  var $name = $nestDetail.find(".name");
  console.log("$name", $name);
  function show(position, nest) {
    $nestDetail
      .css("left", position.x)
      .css("top", position.y)
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


