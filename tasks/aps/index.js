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

// round to 2 significant figures
function twoSF(n) {
    return +(n).toPrecision(2);
}

module.exports = function(callback) {
  getScores(function(scores) {

    var percent = d3.format(".5%");
    var mean = d3.mean(scores);
    var median = d3.median(scores);
    var q1 = d3.quantile(scores, .25);
    var q3 = d3.quantile(scores, .75);
    var iqr = q3 - q1;

    // Remove outliers.
    // They are taken into account when calculating mean and median,
    // but for the purpose of making the histogram smaller, are not plotted.
    scores = scores.filter(function(n) { 
        return n > twoSF(q1 - iqr*1.5) && n < twoSF(q3 + iqr*1.5);
    });

    var x = d3.scale.linear()
        .domain(d3.extent(scores))
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

