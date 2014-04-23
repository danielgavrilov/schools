var mongojs = require('mongojs');
var db = mongojs('ks5', ['schools']);
var schools = db.schools;
var config = require('../../config');
var YEAR = config.YEAR;
var d3 = require('d3');

var projection = {_id: 1};
projection['performance.'+YEAR+'.aps.a-level.entry'] = 1;

function getScores(callback) {
  schools.find({}, projection, function(err, results) {
    if (err) throw err;
    scores = [];
    results.forEach(function(school) {
      try {
        var score = school['performance'][YEAR]['aps']['a-level']['entry'];
        if (typeof score === 'number') scores.push(score); 
      } catch(e) {
        console.log(e);
      }
    });
    return callback(scores.sort());
  });
};

module.exports = function(callback) {
  getScores(function(scores) {

    var percent = d3.format(".5%");
    var mean = d3.mean(scores);
    var median = d3.median(scores);

    var x = d3.scale.linear()
        // 150 point score = Grade E (minimum grade)
        .domain([150, d3.max(scores)])
        .range([0, 1])
        .nice();

    var data = d3.layout.histogram()
        .bins(x.ticks(15))
        (scores);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([1, 0]);

    var chart = d3.select('body')
        .insert('div')
        .classed('aps-entry-histogram', true);

    var bars = chart.selectAll("div")
        .data(data)
      .enter().append("div")
        .attr("class", "wrap")
        .style("width", percent(1/data.length));

    var bar = bars.append("div")
        .attr("class", "bar")
        .style("top", function(d) { return percent(y(d.y)) });

    var measures = {
        mean: mean,
        median: median,
        min: x.invert(0),
        max: x.invert(1)
    };

    callback({
      measures: measures,
      html: chart.node().outerHTML,
      css: '.aps-entry-mean { background-position: '+percent(x(measures.mean))+' 0 }'
    });

  });
};

