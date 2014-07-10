(function() {
  var ChartBase, Raphael;

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  Raphael = require('raphael-light');

  ChartBase = (function() {
    function ChartBase(options) {
      var $el;
      this.el = options.el, this.data = options.data, this.width = options.width, this.height = options.height;
      $el = $(this.el);
      if (this.width == null) {
        this.width = $el.width();
      }
      if (this.height == null) {
        this.height = $el.height();
      }
      this.paper = Raphael($el.empty()[0], this.width, this.height);
    }

    ChartBase.prototype.getLineForPoints = function(points, snap) {
      var i, ret, s, _i, _ref;
      if (snap == null) {
        snap = false;
      }
      if (!points.length) {
        return '';
      }
      s = function(val) {
        if (snap) {
          return Math.round(val) + 0.5;
        } else {
          return val;
        }
      };
      ret = "M" + (s(points[0].x)) + "," + (s(points[0].y));
      for (i = _i = 1, _ref = points.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        ret += "L" + (s(points[i].x)) + "," + (s(points[i].y));
      }
      return ret;
    };

    return ChartBase;

  })();

  module.exports = ChartBase;

}).call(this);
