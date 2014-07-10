(function() {
  var ChartAbstract, PieChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  ChartAbstract = require('./chart_abstract');

  PieChart = (function(_super) {
    __extends(PieChart, _super);

    PieChart.prototype.defaults = {
      limit: 3,
      reverseColors: false
    };

    function PieChart(options) {
      var index, slice, _i, _len, _ref;
      PieChart.__super__.constructor.apply(this, arguments);
      $.extend(this.options, ChartAbstract.prototype.defaults, this.defaults, options);
      this.meta = $.extend({}, this.meta, {
        zeroAngle: 0,
        maxAngle: 360,
        maxSliceAngle: 180,
        slices: []
      });
      this.loadSlices();
      _ref = this.meta.slices;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        slice = _ref[index];
        this.$el.append(this.createSliceElement(slice.offset, slice.position));
      }
      $('<div></div>').addClass('smooth-edge').appendTo(this.$el);
    }

    PieChart.prototype.createSliceElement = function(offset, position) {
      var seriesClass, slice;
      slice = $('<div></div>').addClass('slice');
      seriesClass = this.options.reverseColors ? "series-" + (this.data.length - 1 - position) : "series-" + position;
      slice.append($('<div></div>').addClass('fill').addClass(seriesClass));
      this.rotate(slice, offset);
      return slice;
    };

    PieChart.prototype.render = function() {
      var index, slice, _i, _len, _ref, _results;
      _ref = this.$el.find('.fill');
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        slice = _ref[index];
        _results.push(this.rotate($(slice), this.meta.slices[index].angle));
      }
      return _results;
    };

    PieChart.prototype.loadSlices = function() {
      var angle, index, secondSliceAngle, secondSliceOffset, skip, totalAngle, value, _i, _len, _ref, _results;
      this.meta.slices = [];
      totalAngle = 0;
      skip = false;
      _ref = this.data;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        value = _ref[index];
        if (skip) {
          continue;
        }
        if ((this.options.limit != null) && index === this.options.limit) {
          value = this.getCombinedValue(index, this.data.length);
          skip = true;
        }
        angle = this.getAngle(value);
        if (angle <= this.meta.maxSliceAngle) {
          this.meta.slices.push({
            position: index,
            offset: totalAngle,
            angle: angle
          });
        } else {
          this.meta.slices.push({
            position: index,
            offset: totalAngle,
            angle: this.meta.maxSliceAngle
          });
          secondSliceOffset = totalAngle + this.meta.maxSliceAngle;
          secondSliceAngle = angle - this.meta.maxSliceAngle;
          this.meta.slices.push({
            position: index,
            offset: secondSliceOffset,
            angle: secondSliceAngle
          });
          this.meta.slices.push({
            position: index,
            offset: secondSliceOffset - 5,
            angle: secondSliceAngle > 5 ? 10 : 5 + secondSliceAngle
          });
        }
        _results.push(totalAngle += angle);
      }
      return _results;
    };

    PieChart.prototype.getAngle = function(value) {
      return Math.round((value * this.meta.maxAngle) / 100);
    };

    PieChart.prototype.rotate = function($el, angle) {
      var value;
      value = "rotate(" + angle + "deg)";
      $el.css('-webkit-transform', value);
      $el.css('-moz-transform', value);
      $el.css('-ms-transform', value);
      $el.css('-o-transform', value);
      return $el.css('transform', value);
    };

    PieChart.prototype.getCombinedValue = function(firstIndex, lastIndex) {
      var combinedValue, i, value, _i, _len, _ref;
      combinedValue = 0;
      _ref = this.data.slice(firstIndex, +lastIndex + 1 || 9e9);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        value = _ref[i];
        combinedValue += value;
      }
      return combinedValue;
    };

    return PieChart;

  })(ChartAbstract);

  module.exports = PieChart;

}).call(this);
