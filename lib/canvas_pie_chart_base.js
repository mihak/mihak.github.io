(function() {
  var CanvasPieChartBase, ChartAbstract,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  ChartAbstract = require('./chart_abstract');

  CanvasPieChartBase = (function(_super) {
    __extends(CanvasPieChartBase, _super);

    CanvasPieChartBase.prototype.defaults = {
      empty: {
        fill: '#ffffff',
        stroke: '#cccccc'
      }
    };

    function CanvasPieChartBase(options) {
      var size;
      this.defaults = $.extend({}, ChartAbstract.prototype.defaults, this.defaults);
      CanvasPieChartBase.__super__.constructor.apply(this, arguments);
      this.canvas = this.createCanvas();
      this.ctx = this.canvas.getContext('2d');
      this.meta.zeroPosition = -Math.PI / 2;
      this.meta.fullLength = Math.PI * 2;
      size = Math.min(this.canvas.width - 2, this.canvas.height - 2) / 2;
      this.meta.radius = Math.floor(size);
      this.meta.center = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      };
    }

    CanvasPieChartBase.prototype.drawSlice = function(startPosition, endPosition, color, radius) {
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.moveTo(this.meta.center.x, this.meta.center.y);
      this.ctx.arc(this.meta.center.x, this.meta.center.y, (radius ? radius : this.meta.radius), startPosition, endPosition, false);
      return this.ctx.fill();
    };

    CanvasPieChartBase.prototype.drawArc = function(startPosition, endPosition, color, radius) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.arc(this.meta.center.x, this.meta.center.y, (radius ? radius : this.meta.radius), startPosition, endPosition, false);
      return this.ctx.stroke();
    };

    CanvasPieChartBase.prototype.renderEmpty = function() {
      this.ctx.fillStyle = this.options.empty.fill;
      this.ctx.strokeStyle = this.options.empty.stroke;
      this.ctx.beginPath();
      this.ctx.arc(this.meta.center.x, this.meta.center.y, this.meta.radius, 0, this.meta.fullLength, false);
      this.ctx.fill();
      return this.ctx.stroke();
    };

    CanvasPieChartBase.prototype.getSliceLength = function(value) {
      return this.meta.fullLength * (value / this.meta.total);
    };

    CanvasPieChartBase.prototype.getCombinedValue = function(firstIndex, lastIndex) {
      var combinedValue, i, value, _i, _len, _ref;
      combinedValue = 0;
      _ref = this.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        value = _ref[i];
        if (i >= firstIndex && i <= lastIndex) {
          combinedValue += value;
        }
      }
      return combinedValue;
    };

    return CanvasPieChartBase;

  })(ChartAbstract);

  module.exports = CanvasPieChartBase;

}).call(this);
