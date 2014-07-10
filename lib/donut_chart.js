(function() {
  var CanvasPieChartBase, DonutChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  CanvasPieChartBase = require('./canvas_pie_chart_base');

  DonutChart = (function(_super) {
    __extends(DonutChart, _super);

    DonutChart.prototype.defaults = {
      limit: 3,
      holeRatio: 0.2,
      sliceMargin: 7,
      colors: [
        {
          fill: '#c8d8a5',
          stroke: '#c8d8a5'
        }, {
          fill: '#97b94e',
          stroke: '#97b94e'
        }, {
          fill: '#536f16',
          stroke: '#536f16'
        }, {
          fill: '#374e05',
          stroke: '#374e05'
        }
      ],
      empty: {
        fill: {
          start: '#fefefe',
          end: '#efefef'
        },
        stroke: {
          start: '#aaaaaa',
          end: '#d6d6d6'
        }
      },
      inner: {
        fill: '#fff',
        stroke: '#ccc'
      }
    };

    function DonutChart(options) {
      this.defaults = $.extend({}, CanvasPieChartBase.prototype.defaults, this.defaults);
      DonutChart.__super__.constructor.apply(this, arguments);
      this.meta.hole = this.options.holeRatio;
      this.meta.margin = this.options.sliceMargin;
      this.meta.total = this.data.reduce((function(s, v) {
        return s + v;
      }), 0);
      this.meta.sliceRadius = Math.floor(this.meta.radius - this.meta.margin);
      this.meta.holeRadius = Math.floor(this.meta.sliceRadius * this.meta.hole);
      this.meta.innerRadius = this.meta.holeRadius + this.meta.margin;
    }

    DonutChart.prototype.render = function() {
      this.renderEmpty();
      if (this.data.length > 0) {
        this.renderFull();
      }
      return this.$el.append(this.canvas);
    };

    DonutChart.prototype.drawCircle = function(radius, fillColor, strokeColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.beginPath();
      this.ctx.arc(this.meta.center.x, this.meta.center.y, radius, 0, this.meta.fullLength, false);
      this.ctx.fill();
      if (!strokeColor) {
        return;
      }
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = strokeColor;
      return this.ctx.stroke();
    };

    DonutChart.prototype.createLinearGradient = function(startCoordinate, endCoordinate, startColor, endColor) {
      var gradient;
      gradient = this.ctx.createLinearGradient(startCoordinate.x, startCoordinate.y, endCoordinate.x, endCoordinate.y);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      return gradient;
    };

    DonutChart.prototype.createRadialGradient = function(startRadius, endRadius, startColor, endColor) {
      var gradient;
      gradient = this.ctx.createRadialGradient(this.meta.center.x, this.meta.center.y, startRadius, this.meta.center.x, this.meta.center.y, endRadius);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      return gradient;
    };

    DonutChart.prototype.renderEmpty = function() {
      var fillGradient, strokeGradient;
      fillGradient = this.createLinearGradient({
        x: 0,
        y: 0
      }, {
        x: 0,
        y: this.canvas.height
      }, this.options.empty.fill.start, this.options.empty.fill.end);
      strokeGradient = this.createLinearGradient({
        x: this.canvas.width,
        y: 0
      }, {
        x: 0,
        y: this.canvas.height
      }, this.options.empty.stroke.start, this.options.empty.stroke.end);
      this.drawCircle(this.meta.radius, fillGradient, strokeGradient);
      return this.drawCircle(this.meta.innerRadius, this.options.inner.fill, this.options.inner.stroke);
    };

    DonutChart.prototype.renderFull = function() {
      var endColor, endPosition, gradient, i, length, skip, startColor, startPosition, value, _i, _len, _ref;
      startPosition = this.meta.zeroPosition;
      skip = false;
      _ref = this.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        value = _ref[i];
        if (skip) {
          continue;
        }
        length = this.getSliceLength(value);
        endPosition = startPosition + length;
        startColor = this.options.colors.length > i ? this.options.colors[i].fill : 'black';
        endColor = this.options.colors.length > i + 1 ? this.options.colors[i + 1].fill : 'black';
        gradient = this.createRadialGradient(this.meta.holeRadius, this.meta.sliceRadius, startColor, endColor);
        this.drawSlice(startPosition, endPosition, gradient, this.meta.sliceRadius);
        startPosition = endPosition;
        if ((this.options.limit != null) && i + 1 >= this.options.limit) {
          skip = true;
        }
      }
      return this.drawCircle(this.meta.holeRadius, this.options.inner.fill);
    };

    return DonutChart;

  })(CanvasPieChartBase);

  module.exports = DonutChart;

}).call(this);
