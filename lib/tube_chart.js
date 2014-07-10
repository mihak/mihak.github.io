(function() {
  var ChartAbstract, TubeChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ChartAbstract = require('./chart_abstract');

  TubeChart = (function(_super) {
    __extends(TubeChart, _super);

    function TubeChart(options) {
      this.el = options.el, this.percentage = options.percentage, this.fontSize = options.fontSize, this.width = options.width, this.height = options.height, this.nodata = options.nodata, this.adjustData = options.adjustData;
      this.grey = '#e5e5e5';
      this.light = '#a2bf63';
      this.hole = 0.75;
      if (options.formatPercentage) {
        this.formatPercentage = options.formatPercentage;
      }
      if (this.nodata == null) {
        this.nodata = 'no';
      }
      if (!isFinite(this.percentage)) {
        this.percentage = 0;
      }
      this.text = this.percentage;
      if (this.adjustData && this.percentage < 1) {
        this.percentage = this.percentage * 100;
      }
    }

    TubeChart.prototype.render = function() {
      var canvas, center, ctx, gradient, holeRadius, radius, start, stop, txt;
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      center = {
        x: canvas.width / 2,
        y: canvas.height / 2
      };
      radius = Math.min(canvas.width, canvas.height) / 2;
      holeRadius = Math.floor(radius * this.hole);
      ctx.beginPath();
      ctx.fillStyle = this.grey;
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, false);
      ctx.fill();
      start = -Math.PI / 2;
      stop = start + Math.PI * 2 * (this.percentage / 100);
      ctx.beginPath();
      ctx.fillStyle = this.light;
      ctx.moveTo(center.x, center.y);
      ctx.arc(center.x, center.y, radius, start, stop, false);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, false);
      ctx.lineWidth = 1;
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = gradient;
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.arc(center.x, center.y, holeRadius, start, Math.PI * 2, false);
      ctx.fill();
      ctx.lineWidth = 1;
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.strokeStyle = gradient;
      ctx.stroke();
      txt = this.nodata === 'yes' ? 'n/a' : this.formatPercentage(this.text);
      ctx.fillStyle = '#000';
      ctx.font = 'bold ' + this.fontSize + 'px Helvetica';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(txt, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
      return this.el.append(canvas);
    };

    return TubeChart;

  })(ChartAbstract);

  module.exports = TubeChart;

}).call(this);
