(function() {
  var ChartAbstract;

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  ChartAbstract = (function() {
    ChartAbstract.prototype.defaults = {
      height: 200,
      width: 200
    };

    ChartAbstract.prototype.$el = $('<div></div>');

    ChartAbstract.prototype.options = {};

    ChartAbstract.prototype.meta = {};

    function ChartAbstract(options) {
      this.$el = options.el;
      this.data = options.data ? options.data : [];
      $.extend(this.options, this.defaults, options);
    }

    ChartAbstract.prototype.createCanvas = function() {
      var canvas;
      canvas = document.createElement('canvas');
      canvas.width = this.options.width;
      canvas.height = this.options.height;
      return canvas;
    };

    ChartAbstract.prototype.render = function() {};

    ChartAbstract.prototype.formatPercentage = function(value) {
      if (!isFinite(value)) {
        return 'n/a';
      }
      if (value === 0) {
        return '0%';
      }
      if (value < 0.01) {
        return '<0.01%';
      }
      return value + '%';
    };

    ChartAbstract.prototype.formatInt = function(value) {
      var rounded;
      if (!isFinite(value)) {
        return 'n/a';
      }
      rounded = Math.round(value);
      return rounded.toString();
    };

    return ChartAbstract;

  })();

  module.exports = ChartAbstract;

}).call(this);
