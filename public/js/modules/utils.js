app.utils.incrementor = (function() {
  var i = 0;
  return function() {
    return i++;
  };
})();

app.utils.deg2rad = function(deg) {
  return deg * (Math.PI/180);
};

app.utils.calcDistance = function(coords1, coords2, unit) {
  var deg2rad = app.utils.deg2rad;
  var R = (unit === 'km') ? 6371 : 3959;
  var dLat = deg2rad(coords2[1]-coords1[1]);
  var dLon = deg2rad(coords2[0]-coords1[0]); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coords1[1])) * Math.cos(deg2rad(coords2[1])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
};

app.utils.toNumber = function(number, dp) {
  number = Number(number);
  if (isNaN(number)) return;
  if (dp) return number.toFixed(dp);
  return number;
};

app.utils.toPercentage = function(num) {
  if (isNaN(num)) return num;
  return "" + (num * 100) + "%";
};

app.utils.elementFromHTML = function(html) {
    var temp = document.createElement('div');
    if (!html) return temp;
    temp.innerHTML = html;
    return temp.firstElementChild;
};

app.utils.arrayToFragment = function(elements) {
  var fragment = document.createDocumentFragment();
  elements.forEach(function(el) {
    fragment.appendChild(el);
  });
  return fragment;
};

app.utils.toFixed = function(num, dp) {
  try {
    return num.toFixed(dp);
  } catch(e) {
    return num;
  }
};

// Reverses a _.sortBy(function)
// http://stackoverflow.com/a/12220415/1775517
app.utils.reverseSortBy = function(sortByFunction) {
  return function(left, right) {
    var l = sortByFunction(left);
    var r = sortByFunction(right);

    if (l === void 0) return -1;
    if (r === void 0) return 1;

    return l < r ? 1 : l > r ? -1 : 0;
  };
};

app.utils.uninterpolateClamp = function(a, b) {
  b -= a;
  return function(x) {
    return Math.max(0, Math.min(1, (x-a)/b));
  }
};