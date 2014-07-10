(function() {
  var GaugeChart;

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  GaugeChart = (function() {
    GaugeChart.prototype.defaults = {
      animationDuration: 1500,
      autoAnimate: true,
      unit: '%',
      formatFn: null,
      label: '',
      max: 100,
      avg: null,
      value: 0
    };

    function GaugeChart(options) {
      this.options = options;
      this.meta = {
        gaugeStartAngle: -270,
        railOffsetAngle: 90,
        shadowStartAngle: -270,
        notchStartAngle: -135,
        zeroAngle: 0,
        maxAngle: 270,
        valueAngle: 0,
        overflowAngle: 0,
        avgAngle: 0,
        overflow: 0
      };
      this.options = $.extend({}, this.defaults, this.options);
      if (this.options.formatFn) {
        this.formatValue = this.options.formatFn;
      }
      this.normalizeParameters();
      this.$el = options.el;
      this.chart = $('<div></div>');
      this.chart.addClass(this.$el.attr('class'));
      this.rail = this.createElement('pillow-gauge-rail').appendTo(this.chart);
      this.gauge = this.createElement('pillow-gauge-gauge').appendTo(this.chart);
      this.shadow = this.createElement('pillow-gauge-shadow').appendTo(this.chart);
      this.caption = this.createCaption().appendTo(this.chart);
      this.setGaugeRotation(this.meta.zeroAngle);
      this.setShadowRotation(this.meta.zeroAngle);
      this.setCaption(0);
      this.meta.valueAngle = this.convertToAngle(this.options.value);
      this.meta.overflowAngle = this.convertToAngle(this.meta.overflow);
      if (this.options.avg) {
        this.notch = this.createElement('pillow-gauge-notch').appendTo(this.chart);
        this.setNotchRotation(this.meta.zeroAngle);
        this.meta.avgAngle = this.convertToAngle(this.options.avg);
      }
    }

    GaugeChart.prototype.createElement = function(className) {
      return $('<div></div>').addClass(className);
    };

    GaugeChart.prototype.createCaption = function() {
      var $caption;
      $caption = this.createElement('pillow-gauge-caption');
      $caption.append(this.createElement('value'));
      $caption.append(this.createElement('unit').html(this.options.unit));
      $caption.append(this.createElement('label').html(this.options.label));
      return $caption;
    };

    GaugeChart.prototype.normalizeParameters = function() {
      if (this.options.value > this.options.max) {
        this.meta.overflow = this.options.value - this.options.max;
      }
      if (this.meta.overflow > this.options.max) {
        this.meta.overflow = this.options.max;
      }
      if (this.options.value < 0) {
        this.options.value = 0;
      }
      if (this.options.value > this.options.max) {
        this.options.value = this.options.max;
      }
      if (this.options.avg) {
        if (this.options.avg < 0) {
          this.options.avg = 0;
        }
        if (this.options.avg > this.options.max) {
          return this.options.avg = this.options.max;
        }
      }
    };

    GaugeChart.prototype.convertToAngle = function(value) {
      value = value / this.options.max;
      if (value > 0 && value < 0.01) {
        value = 0.01;
      }
      return Math.round(this.meta.maxAngle * value);
    };

    GaugeChart.prototype.render = function() {
      this.$el.append(this.chart);
      if (this.options.autoAnimate) {
        return this.animate();
      }
    };

    GaugeChart.prototype.animate = function() {
      var animation, endTime, startTime;
      this.$el.trigger('animationstart');
      startTime = new Date().getTime();
      endTime = startTime + this.options.animationDuration;
      return animation = setInterval(((function(_this) {
        return function() {
          var gaugeAngle, progress, progressAngle, shadowAngle;
          progress = _this.getAnimationProgress(new Date().getTime(), startTime, endTime);
          progressAngle = _this.getProgressAngle(progress);
          if (progressAngle > _this.meta.maxAngle) {
            gaugeAngle = _this.meta.maxAngle;
            shadowAngle = progressAngle - _this.meta.maxAngle;
          } else {
            gaugeAngle = progressAngle;
            shadowAngle = _this.meta.zeroAngle;
          }
          _this.setGaugeRotation(gaugeAngle);
          _this.setShadowRotation(shadowAngle);
          _this.setCaption(_this.getProgressValue(progress));
          if (_this.options.avg) {
            _this.setNotchRotation(_this.getProgressNotchAngle(progress));
          }
          if (progress === 1) {
            clearInterval(animation);
            return _this.$el.trigger('animationend');
          }
        };
      })(this)), 1000 / 60);
    };

    GaugeChart.prototype.setGaugeRotation = function(angle) {
      var gaugeAngle, railAngle;
      if (angle > this.meta.maxAngle) {
        angle = this.meta.maxAngle;
      }
      if (angle < this.meta.zeroAngle) {
        angle = this.meta.zeroAngle;
      }
      this.setGaugeProportions(angle);
      gaugeAngle = this.meta.gaugeStartAngle + angle;
      railAngle = gaugeAngle + this.meta.railOffsetAngle;
      this.rotate(this.gauge, gaugeAngle);
      return this.rotate(this.rail, railAngle);
    };

    GaugeChart.prototype.setGaugeProportions = function(angle) {
      this.rail.removeClass('third half full');
      this.gauge.removeClass('third half full');
      switch (false) {
        case !(angle < 90):
          this.rail.addClass('full');
          return this.gauge.addClass('third');
        case !(angle < 180):
          this.rail.addClass('half');
          return this.gauge.addClass('half');
        default:
          this.rail.addClass('third');
          return this.gauge.addClass('full');
      }
    };

    GaugeChart.prototype.setShadowRotation = function(angle) {
      this.setShadowProportions(angle);
      return this.rotate(this.shadow, this.meta.shadowStartAngle + angle);
    };

    GaugeChart.prototype.setShadowProportions = function(angle) {
      this.shadow.removeClass('third half full');
      switch (false) {
        case !(angle < 90):
          return this.shadow.addClass('third');
        case !(angle < 180):
          return this.shadow.addClass('half');
        default:
          return this.shadow.addClass('full');
      }
    };

    GaugeChart.prototype.setNotchRotation = function(angle) {
      var notchAngle;
      if (angle > this.meta.maxAngle) {
        angle = this.meta.maxAngle;
      }
      if (angle < this.meta.zeroAngle) {
        angle = this.meta.zeroAngle;
      }
      notchAngle = this.meta.notchStartAngle + angle;
      return this.rotate(this.notch, notchAngle);
    };

    GaugeChart.prototype.setCaption = function(value) {
      return this.caption.find('.value').text(this.formatValue(value));
    };

    GaugeChart.prototype.getAnimationProgress = function(currentTime, startTime, endTime) {
      var delta, progress;
      progress = (currentTime - startTime) / (endTime - startTime);
      if (progress > 1) {
        progress = 1;
      }
      delta = this.makeEaseOut(progress);
      return delta;
    };

    GaugeChart.prototype.makeEaseOut = function(progress) {
      return 1 - Math.pow(1 - progress, 3);
    };

    GaugeChart.prototype.getProgressAngle = function(percentage) {
      return Math.round((this.meta.valueAngle + this.meta.overflowAngle) * percentage);
    };

    GaugeChart.prototype.getProgressNotchAngle = function(percentage) {
      return Math.round(this.meta.avgAngle * percentage);
    };

    GaugeChart.prototype.getProgressValue = function(percentage) {
      return Math.round((this.options.value + this.meta.overflow) * percentage * 100) / 100;
    };

    GaugeChart.prototype.formatValue = function(value) {
      var d;
      d = this.options.value < 100 ? 2 : 0;
      return parseFloat(value).toFixed(d);
    };

    GaugeChart.prototype.rotate = function($el, angle) {
      var value;
      value = "rotate(" + angle + "deg)";
      $el.css('-webkit-transform', value);
      $el.css('-moz-transform', value);
      $el.css('-ms-transform', value);
      $el.css('-o-transform', value);
      return $el.css('transform', value);
    };

    return GaugeChart;

  })();

  module.exports = GaugeChart;

}).call(this);
