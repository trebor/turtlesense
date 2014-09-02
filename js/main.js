requirejs.config({
  baseUrl: 'bower_components',
  paths: {
    d3: 'd3/d3.min',
    jquery: 'jquery/dist/jquery.min',
    bootstrap: 'bootstrap/dist/js/bootstrap.min',
  },
  shim: {
    bootstrap: {deps: ['jquery']},
  }    
});

define(['d3', 'jquery', 'bootstrap'], function (d3, $, bs) {
  console.log("d3", d3);
  console.log("hello, world! you look amazing!");
});

