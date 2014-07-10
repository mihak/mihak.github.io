(function() {
  var CanvasPieChartBase, CookieChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  CanvasPieChartBase = require('./canvas_pie_chart_base');

  CookieChart = (function(_super) {
    __extends(CookieChart, _super);

    CookieChart.prototype.defaults = {
      color: '#5A97BD',
      height: 50,
      width: 50,
      empty: {
        fill: '#ffffff',
        stroke: '#dddddd'
      }
    };

    function CookieChart(options) {
      this.defaults = $.extend({}, CanvasPieChartBase.prototype.defaults, this.defaults);
      CookieChart.__super__.constructor.apply(this, arguments);
    }

    CookieChart.prototype.render = function() {
      if (this.data > 0) {
        this.renderFull();
      } else {
        this.renderEmpty();
      }
      return this.$el.append(this.canvas);
    };

    CookieChart.prototype.renderFull = function() {
      var endPosition, length, startPosition;
      length = this.meta.fullLength * this.options.data;
      startPosition = this.meta.zeroPosition;
      endPosition = startPosition + length;
      this.drawSlice(startPosition, endPosition, this.options.color);
      if (this.options.data < 1) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.options.empty.fill;
        this.ctx.strokeStyle = this.options.empty.stroke;
        this.ctx.moveTo(this.meta.center.x, this.meta.center.y);
        this.ctx.arc(this.meta.center.x, this.meta.center.y, this.meta.radius, startPosition, endPosition, true);
        this.ctx.lineTo(this.meta.center.x, this.meta.center.y);
        this.ctx.fill();
        return this.ctx.stroke();
      }
    };

    return CookieChart;

  })(CanvasPieChartBase);

  module.exports = CookieChart;

}).call(this);
