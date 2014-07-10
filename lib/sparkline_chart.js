(function() {
  var ChartBase, SparklineChart,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ChartBase = require('./chart_base');

  SparklineChart = (function(_super) {
    __extends(SparklineChart, _super);

    SparklineChart.defaults = {
      fill: '#ffffdd',
      stroke: '#5b5b5b',
      strokeWidth: 1,
      minValue: 0,
      maxValue: 'max'
    };

    function SparklineChart(options) {
      this.render = __bind(this.render, this);
      var opts;
      SparklineChart.__super__.constructor.apply(this, arguments);
      opts = $.extend(true, {}, this.constructor.defaults, options);
      this.fill = opts.fill, this.stroke = opts.stroke, this.strokeWidth = opts.strokeWidth, this.minValue = opts.minValue, this.maxValue = opts.maxValue;
    }

    SparklineChart.prototype.render = function() {
      var i, max, min, points, valueMult, _i, _ref;
      this.paper.clear();
      if (this.data.length < 2) {
        return;
      }
      min = this.minValue === 'min' ? Math.min.apply(this, this.data) : this.minValue;
      max = Math.max(1, this.maxValue === 'max' ? Math.max.apply(this, this.data) : this.maxValue);
      valueMult = this.height / max;
      points = [];
      for (i = _i = 0, _ref = this.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        points.push({
          x: i * this.width / (this.data.length - 1),
          y: (max - this.data[i]) * valueMult
        });
      }
      this.paper.path(this.getShapeForPoints(points)).attr({
        fill: this.fill,
        stroke: 'none'
      });
      return this.paper.path(this.getLineForPoints(points)).attr({
        stroke: this.stroke,
        'stroke-width': this.strokeWidth
      });
    };

    SparklineChart.prototype.getShapeForPoints = function(points) {
      var i, ret, _i, _ref;
      if (!points.length) {
        return '';
      }
      ret = "M" + points[0].x + "," + points[0].y;
      for (i = _i = 1, _ref = points.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        ret += "L" + points[i].x + "," + points[i].y;
      }
      ret += "L" + points[i - 1].x + "," + this.height;
      ret += "L" + points[0].x + "," + this.height;
      return ret += "z";
    };

    return SparklineChart;

  })(ChartBase);

  module.exports = SparklineChart;

}).call(this);
