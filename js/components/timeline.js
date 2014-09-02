define(["d3", "basechart"], function(d3, BaseChart) {

var module = function(chartNode) {

  // constants

  var MS_INA_DAY = 24*60*60*1000;

  var margin = {top: 10, bottom: 50, left: 30, right: 30};
  var tweets;

  // general variables

  var chart;
  var xScale = d3.scale.ordinal();
  var timeScale = d3.time.scale();
  var yScale = d3.scale.pow().exponent(.45);
  var base = new BaseChart(chartNode, {}, []);
  var dimensions;
  var width;
  var height;
  var xAxis = d3.svg.axis()
    .scale(timeScale)
    .ticks(d3.time.year, 1)
    .orient("bottom");

  var barGroup;
  var countrBarGroup;

  var bars;

  // declare events

  function initialize() {
    base.initialize();
    chart = base.getContainer();
    barGroup = chart.append("g").classed("barGroup", true);
    countryBarGroup = chart.append("g").classed("countryBarGroup", true);
  }

  base.on("chartResize", function(_dimensions) {
    dimensions = _dimensions;
    height = dimensions.height - (margin.top + margin.bottom);
    width = dimensions.width - (margin.left + margin.right);
    xScale.rangeBands([margin.left, dimensions.width  - margin.right], .2);
    yScale.range([0, height]);
    timeScale.range([margin.left, dimensions.width  - margin.right]);
    visualize();
  });

  function createBars(tweets) {
    var monthMap = {};

    for (var year = 2012; year <= 2014; year++) {
      for (var month = 0; month < 12; month++) {
        if (year == 2014 && month > 6)
          continue;
        monthMap[year * 100 + month] = 0;
      }
    }

    tweets.forEach(function(tweet) {
      var id = tweet.date.getMonth() + (1900 + tweet.date.getYear()) * 100;
      monthMap[id]++;
    });

    var months = Object.keys(monthMap).map(function(month) {
      return {month: +month, count: monthMap[month]}
    }).sort(function(a,b) {return a.month - b.month});

    return months;
  }


  function setData(_tweets) {
    tweets = _tweets;
    var dateExtent = d3.extent(tweets, function(d) {return d.date});
    timeScale.domain(dateExtent);
    var timeExtent = d3.extent(tweets, function(d) {return d.date.getTime()});

    var months = createBars(tweets);

    yScale.domain([0, d3.max(months, function(d) {return d.count})]);
    xScale.domain(months.map(function(d) {return d.month}));

    var bar = barGroup.selectAll(".bar")
      .data(months)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {return xScale(d.month)})
      .attr("y", function(d) {return margin.top + (height - yScale(d.count))})
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) { return yScale(d.count)})
      .append("title")
      .text(function(d) {return d.month});

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height + 20) + ")")
      .call(xAxis);
  }

  function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  function visualize() {
    if (!chart)
      return;

    barGroup.selectAll(".bar")
      .attr("x", function(d) {return xScale(d.month)})
      .attr("y", function(d) {return margin.top + (height - yScale(d.count))})
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) { return yScale(d.count)});

    chart.selectAll(".x.axis")
      .attr("transform", "translate(0," + (height + 20) + ")")
      .call(xAxis);
  }

  function daysBetween(date1, date2) {
    return Math.round(Math.abs((date1.getTime() - date2.getTime())/(MS_INA_DAY)));
  }

  function setCountry(country) {
    var countryTweets = tweets.filter(function(d) {
      var found = false;
      d.countries.forEach(function(c) {
        if (country.id == c.cca3) {
          found = true;
        }
      });
      return found;
    });

    if (countryTweets.length == 0) {
      return;
    }

    var months = createBars(countryTweets);

    var update = countryBarGroup.selectAll(".countryBar")
      .data(months);

    update
      .enter()
      .append("rect")
      .attr("class", "countryBar")
      .attr("x", function(d) {return xScale(d.month)})
      .attr("y", margin.top + height)
      .attr("width", xScale.rangeBand())
      .attr("height", 0)
      .append("title")
      .text(function(d) {return d.month});

    update
      .transition()
      .duration(500)
      .attr("y", function(d) {return margin.top + (height - yScale(d.count))})
      .attr("height", function(d) { return yScale(d.count)});
  }

  function clearCountry(country) {
    countryBarGroup.selectAll(".countryBar")
      .data([])
      .exit()
      .transition()
      .duration(200)
      .attr("y", margin.top + height)
      .attr("height", 0)
      .remove();
  }

  // overwride visualize

  base.visualize = visualize;

  var exports = {
    setData: setData,
    visualize: visualize,
    initialize: initialize,
    setCountry: setCountry,
    clearCountry: clearCountry,
  }

  return $.extend({}, base, exports);
};

  return module;
});
