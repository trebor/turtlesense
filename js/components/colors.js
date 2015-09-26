define(['jquery'], function($) {

  // palette URL: http://paletton.com/#uid=71t1o0kABQg7ZVbmHPIPZtKSih6

  var COLOR_MAP = {
    YELLOW: ['#FFD700', '#FFF5BF', '#FFE34A', '#EDC800', '#887300'],
    GREEN:  ['#00EE00', '#B9F6B9', '#45ED45', '#00BE00', '#006D00'],
    RED:    ['#FF0000', '#FFBFBF', '#FF4A4A', '#ED0000', '#880000'],
    BLUE:   ['#4E14E4', '#CABBF0', '#7B53E3', '#3106A3', '#1C035D'],

    // YELLOW: ['#FFD700', '#FFF5BF', '#FFE34A', '#EDC800', '#887300'],
    // GREEN:  ['#00E75D', '#B6F2CE', '#43E685', '#00AA45', '#006228'],
    // RED:    ['#FF3100', '#FFCCBF', '#FF6D4A', '#ED2D00', '#881A00'],
    // BLUE:   ['#4E14E4', '#CABBF0', '#7B53E3', '#3106A3', '#1C035D'],
    GRAY:   ['#222222', '#666666', '#888888', '#AAAAAA', '#DDDDDD']
  };

  var COLOR_TONES = {
    LIGHTEST : 1,
    LIGHT    : 2,
    BASE     : 0,
    DARK     : 3,
    DARKEST  : 4
  };

  var get = function(color, tone, opacity) {
    console.log("tone", tone);
    var hex = color[(tone == undefined) ? COLOR_TONES.BASE : tone];
    return opacity ? hexToRgba(hex, opacity) : hex;
  };

  function hexToRgba(hex,opacity) {
    hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return 'rgba(' + r + ',' + g + ',' + b +','+opacity+')';
  }

  return $.extend(get, COLOR_MAP, COLOR_TONES);
});
