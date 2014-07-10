(function() {
  var ChartAbstract, ColumnChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ChartAbstract = require('./chart_abstract');

  ColumnChart = (function(_super) {
    __extends(ColumnChart, _super);

    function ColumnChart(options) {
      var d, _i, _len, _ref;
      this.el = options.el, this.barMargin = options.barMargin, this.showAllTimeHigh = options.showAllTimeHigh, this.hideValue = options.hideValue, this.data = options.data, this.axisY = options.axisY, this.unit = options.unit, this.formatFn = options.formatFn;
      if (this.unit == null) {
        this.unit = '';
      }
      if (!this.axisY) {
        this.axisY = [0, 50, 100];
      }
      this.highestPlot = Math.max.apply(this, this.axisY);
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        if (d.value > this.highestPlot) {
          this.axisY.push(parseFloat(d.value));
          this.highestPlot = parseFloat(d.value);
        }
      }
      if (options.formatInt) {
        this.formatInt = options.formatInt;
      }
    }

    ColumnChart.prototype.render = function() {
      var b, backgroundColor, barWidth, borderColor, borderTopWidth, chart, chartHeight, columnChartClass, d, height, i, left, liClass, nrOfBreakdowns, placementContainer, position, spanClass, sum, value, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      this.container = $('<div class="column-graphs"/>').appendTo(this.el);
      if (this.data.length === 0) {
        return this.drawEmpty();
      } else {
        this.drawLegend();
        sum = this.data.length;
        left = 0;
        barWidth = (100 - (sum - 1) * (2 * this.barMargin) - (2 * this.barMargin)) / sum;
        _ref = this.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          d = _ref[_i];
          if (d.value === 0) {
            chartHeight = 0;
          } else if (d.value >= this.highestPlot) {
            chartHeight = 100;
          } else {
            chartHeight = Math.round(d.value * 100) / this.highestPlot;
          }
          value = this.formatFn ? this.formatFn.call(this, d.value) : d.value;
          columnChartClass = this.showAllTimeHigh ? 'column-graph' : 'column-graph transparent';
          chart = $("<div>").css('margin-left', this.barMargin + '%').css('width', barWidth + '%').css('height', chartHeight + '%').css('left', left + '%').addClass(columnChartClass);
          if (this.showAllTimeHigh) {
            chart.html("<span class='column-graph-value'><strong>" + value + '<span class="column-graph-unit">' + this.unit + "</span></strong></span> <span class='column-graph-label'>" + d.label + "</span>");
          } else {
            chart.html("<span class='column-graph-label'>" + d.label + "</span>");
          }
          chart.appendTo(this.container);
          nrOfBreakdowns = (_ref1 = d.breakdowns) != null ? _ref1.length : void 0;
          if (d.breakdowns) {
            placementContainer = $("<ul class='partial'>");
            i = 0;
            _ref2 = d.breakdowns;
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              b = _ref2[_j];
              height = (Math.round(b.value * 100) / d.value) || 0;
              if (height > 100) {
                height = 100;
              }
              if ((height > 90 || chartHeight < 10) && this.showAllTimeHigh && !this.hideValue) {
                chart.find('.column-graph-value').addClass('more-padding');
                chart.find('.legend-spot-highest span').addClass('more-padding');
              }
              value = this.formatFn ? this.formatFn.call(this, b.value) : b.value;
              if (this.hideValue && this.showAllTimeHigh) {
                value = '';
              }
              borderTopWidth = this.showAllTimeHigh ? '2px' : '1px';
              liClass = nrOfBreakdowns === 1 ? 'wider' : void 0;
              spanClass = this.showAllTimeHigh ? '' : 'standalone';
              if (nrOfBreakdowns === 2) {
                spanClass += ' split';
              }
              if (i % 2 !== 1) {
                backgroundColor = !this.showAllTimeHigh ? 'rgba(255, 153, 0, 0.2)' : 'transparent';
                borderColor = 'rgba(255, 153, 0, 1)';
                position = 'left';
                if (nrOfBreakdowns === 2) {
                  spanClass += ' right';
                }
              } else {
                backgroundColor = !this.showAllTimeHigh ? 'rgba(102, 102, 204, 0.2)' : 'transparent';
                borderColor = 'rgba(102, 102, 204, 1)';
                position = 'right';
                if (nrOfBreakdowns === 2) {
                  spanClass += ' left';
                }
              }
              $("<li class='" + liClass + "'><span class='" + spanClass + "'>" + value + "</span></li>").css(position, '0').css('height', height + '%').css('border-color', borderColor).css('border-top-width', borderTopWidth).css('background-color', backgroundColor).appendTo(placementContainer);
              i = i + 1;
            }
            placementContainer.appendTo(chart);
          }
          left = left + barWidth + 2 * this.barMargin;
        }
      }
    };

    ColumnChart.prototype.drawEmpty = function() {
      return this.container.addClass('empty');
    };

    ColumnChart.prototype.drawLegend = function() {
      var legend, plot, plotPosition, _i, _len, _ref;
      legend = '';
      _ref = this.axisY;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plot = _ref[_i];
        plotPosition = 100 - (Math.round((plot * 100) / this.highestPlot));
        if (plot !== 0) {
          if (plotPosition > 94) {
            plotPosition = 95;
          }
          plot = this.formatFn ? this.formatFn.call(this, plot) : plot;
          legend += "<span class='legend-spot' style='top: " + plotPosition + "%;'>" + plot + this.unit + "</span>\n";
        }
      }
      return $("<legend>" + legend + "</legend>").appendTo(this.container);
    };

    return ColumnChart;

  })(ChartAbstract);

  module.exports = ColumnChart;

}).call(this);
