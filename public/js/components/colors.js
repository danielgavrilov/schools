app.constructors.colors = function(colorNames) {
  var self = this;
  this.colors = {};
  colorNames.forEach(function(colorName) {
    self.colors[colorName] = 0;
  });
}

_.extend(app.constructors.colors.prototype, {
  increase: function(colorName) {
    this.colors[colorName] = ++this.colors[colorName];
    return this;
  },
  decrease: function(colorName) {
    this.colors[colorName] = --this.colors[colorName];
    return this;
  },
  getLeastUsed: function() {
    var minColor, minValue = Infinity;
    for (var color in this.colors) {
      var value = this.colors[color];
      if (minValue > value) {
        minColor = color;
        minValue = value;
      }
    }
    return minColor;
  }
});