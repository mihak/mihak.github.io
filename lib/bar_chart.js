(function() {
  var BarChart;

  BarChart = (function() {
    BarChart.defaults = {
      width: 200,
      height: 100,
      emptyStyle: {
        fill: '#ffffff',
        stroke: '#d9d9d9'
      }
    };

    function BarChart(options) {
      var opts;
      opts = $.extend(true, {}, this.constructor.defaults, options);
      this.el = opts.el, this.data = opts.data, this.sum = opts.sum, this.width = opts.width, this.height = opts.height, this.emptyStyle = opts.emptyStyle;
    }

    BarChart.prototype.render = function(id) {
      var canvas, context, sum_sessions;
      canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      context = canvas.getContext('2d');
      sum_sessions = this.sum;
      if ((this.data == null) || (this.data.length === 0) || (sum_sessions === 0)) {
        this.drawEmpty(context);
      } else {
        this.drawBar(context, sum_sessions);
      }
      return this.el.append(canvas);
    };

    BarChart.prototype.drawEmpty = function(context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, this.width, this.height);
      context.strokeStyle = '#d9d9d9';
      context.strokeRect(0, 0, this.width, this.height);
    };

    BarChart.prototype.drawBar = function(context, sum_sessions) {
      var cur_x, d, partialBarWidth, percentage, _i, _len, _ref;
      cur_x = 0;
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        percentage = d.sessions / sum_sessions;
        partialBarWidth = this.width * percentage;
        context.fillStyle = d.color;
        context.fillRect(cur_x, 0, partialBarWidth, this.height);
        cur_x = cur_x + partialBarWidth;
      }
    };

    return BarChart;

  })();

  module.exports = BarChart;

}).call(this);
