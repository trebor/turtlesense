define([d3], function(d3) {

var module = function(description, initialOptions) {

  // exports

  var exports = {
    defineOption: defineOption,
    defineOptions: defineOptions,
    getOptions: getOptions,
    describeOptions: describeOptions,
    describeOption: describeOption,
    get: get,
    set: set,
  };

  var options = {};
  var dispatch = d3.dispatch('valueChanged', 'optionDefined');

  function initialize() {
    defineOptions(initialOptions);
  }

  function defineOption(name, description, defaultValue) {
    var oldOption = options[name];
    var newOption = {
      name: name,
      description: description,
      defaultValue: defaultValue,
      value: defaultValue,
    };
    
    if (oldOption) {
      console.warn("Option Redefined\n\n"
          + "  new: " + describeOption(newOption)
          + "  old: " + describeOption(oldOption));
    }

    options[name] = newOption;
    dispatch.optionDefined(newOption);
  }

  function defineOptions(options) {
    options.forEach(function(option) {
      defineOption(option.name, option.description, option.defaultValue);
    });
  }

  function getOptions() {
    return options;
  }

  function get(name) {
    var option = options[name];
    if (!option) {
      console.warn("Option " + name + " is not defined.");
    }
    return option ? option.value : undefined;
  }

  function set(name, value) {
    var option = options[name];
    if (option) {
      if (option.value !== value) {
        var oldValue = option.value;
        option.value = value;
        dispatch.valueChanged(option, oldValue);
      }

      return option.value;
    }
    console.warn("Option " + name + " is not defined.");
    return undefined;
  }

  function describeOptions() {
    var result = description + "\n\n";
    Object.keys(options).forEach(function(name) {
      result += "  " + describeOption(name) + "\n";
    });
    return result;
  }

  function describeOption(name) {
    var option = options[name];
    return option 
      ? describeOptionObj(option)
      : "Option " + name + " not defined."; 
  }

  function describeOptionObj(option) {
    return option.name + " - "
      + option.describeOption
      + " value: " + option.value
      + " default: " + option.defaultValue;
  }

  initialize();

  return $.extend({}, exports, dispatch);
};

  return module;
});
