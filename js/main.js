requirejs.config({
    baseUrl: 'bower_components',
    paths: {
        d3: 'd3/d3.min'
    }
});

// app starts here

define(['d3'], function (d3) {
  console.log("d3", d3);
  console.log("hello, world! you look amazing!");
});

