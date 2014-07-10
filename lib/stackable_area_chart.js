(function() {
  var AreaChartBase, StackableAreaChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AreaChartBase = require('./area_chart_base');

  StackableAreaChart = (function(_super) {
    __extends(StackableAreaChart, _super);

    function StackableAreaChart() {
      return StackableAreaChart.__super__.constructor.apply(this, arguments);
    }

    StackableAreaChart.colors = {
      series: ['#5a97bd', '#88ccca', '#f7cd9c', '#aaaaaa'],
      areaShade: '90-#dce6c4-#eaefd8',
      backgroundShade: '#000000',
      backgroundAreaOpacity: 0.03,
      xLabel: '#777777',
      yLabel: '#777777',
      xAxis: '#000000',
      xMinorAxis: '#7f7f7f',
      xMarker: '#6666cc',
      xMarkerLabel: '#979797',
      yMinorAxis: '#f4f4f4',
      yMarkerLabel: '#000000',
      xBubble: '#777777',
      yBubble: '#000000'
    };

    StackableAreaChart.layout = {
      noDataImage: {
        src: 'img/chart_no_data.png',
        width: 359,
        height: 86
      },
      axes: {
        x: {
          textProps: {
            'font': '11px Tahoma',
            'text-anchor': 'end'
          },
          offsetX: 0,
          offsetY: 0,
          fitLabels: false
        },
        y: {
          textProps: {
            'font': '11px Tahoma',
            'text-anchor': 'end'
          },
          offsetX: 0,
          offsetY: 0
        },
        positionY: 'right'
      },
      background: null,
      highlightDataPointAreaOnMouseover: true,
      highlightedAreaWidth: 4,
      showAllDataPoints: false,
      markers: {
        x: {
          offsetX: 10,
          offsetY: 10,
          textProps: {
            'text-anchor': 'start'
          }
        },
        y: {
          offsetX: 0,
          offsetY: -4.5,
          textProps: {
            'text-anchor': 'middle'
          }
        }
      },
      bubble: {
        image: {
          offsetX: -52,
          offsetY: -60,
          width: 104,
          height: 53
        },
        top: {
          offsetX: 0,
          offsetY: -48,
          textProps: {
            'font': '12px Segoe Regular',
            'fill': '#777777'
          }
        },
        bottom: {
          offsetX: 0,
          offsetY: -30,
          textProps: {
            'font': '16px Avenir Next LT Pro Regular',
            'font-weight': 'regular',
            'fill': '#1F1F1F'
          }
        }
      },
      datapoints: {
        stroke: '#000000',
        fill: '#ffffff',
        radius: 5,
        opacity: 0
      }
    };

    StackableAreaChart.padding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    StackableAreaChart.backgroundPadding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    StackableAreaChart.prototype.getCircleRadius = function(index) {
      return this.layout.datapoints.radius;
    };

    StackableAreaChart.prototype.getStrokeWidth = function(index) {
      return '1px';
    };

    StackableAreaChart.prototype.getOpacity = function(index) {
      return this.layout.datapoints.opacity;
    };

    StackableAreaChart.prototype.render = function() {
      this.paper.clear();
      this._calculateRanges();
      if (this._hasBackgroundText()) {
        this.drawBackgroundText();
      }
      if (this._hasSeriesData()) {
        this.drawSeries();
      }
      this.drawBackground();
      if (this._hasMarkersData()) {
        this.drawMarkers();
      }
      if (this._hasAxesData()) {
        this.drawAxes();
      }
      if (this._hasSeriesData()) {
        this.drawDataPoints();
      }
      return this.el.find('tspan').attr('dy', 0);
    };

    StackableAreaChart.prototype.drawSeries = function() {
      var index, mappedSeries, reverse, series, seriesColors, _i, _len, _results;
      reverse = this.data.series.reverse();
      seriesColors = this.colors.series.slice(0, reverse.length);
      _results = [];
      for (index = _i = 0, _len = reverse.length; _i < _len; index = ++_i) {
        series = reverse[index];
        if (series.length === 0) {
          continue;
        }
        mappedSeries = series.map((function(_this) {
          return function(pair) {
            return _this._mapCoordinatesToScreen(pair);
          };
        })(this));
        if (series.length === 1) {
          _results.push(this.paper.path(this.getLineForPoints([
            {
              x: mappedSeries[0].x,
              y: this.height - this.padding.bottom
            }, {
              x: mappedSeries[0].x,
              y: mappedSeries[0].y
            }
          ])).attr({
            fill: 'none',
            stroke: seriesColors[index % seriesColors.length],
            'stroke-width': '150px'
          }));
        } else if (series.length > 1) {
          this.paper.path(this._getAreaForPoints(mappedSeries)).attr({
            stroke: 'none',
            fill: seriesColors[index]
          });
          _results.push(this.paper.path(this.getLineForPoints(mappedSeries)).attr({
            fill: 'none',
            stroke: seriesColors[index % seriesColors.length],
            'stroke-width': '2px'
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    StackableAreaChart.prototype.formatBubbleData = function(datapoint) {
      return this.formatBubble({
        x: datapoint.xLabel,
        y: datapoint.yLabel
      });
    };

    StackableAreaChart.prototype._calculateRanges = function() {
      var plot, series, temp, xValues, yValues, _i, _j, _len, _len1, _ref;
      xValues = Array.prototype.concat.apply([], this.data.series.map(function(s) {
        return s.map(function(row) {
          return row.x;
        });
      }));
      if (this.data.axes.x != null) {
        xValues = xValues.concat(this.data.axes.x.map(function(axis) {
          return axis.position;
        }));
      }
      temp = [];
      yValues = [];
      _ref = this.data.series;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        series = _ref[_i];
        for (_j = 0, _len1 = series.length; _j < _len1; _j++) {
          plot = series[_j];
          plot.xLabel = plot.x;
          plot.yLabel = plot.y;
          if (temp[plot.x]) {
            plot.y = temp[plot.x] + plot.y;
          }
          temp[plot.x] = plot.y;
        }
      }
      temp.map(function(row) {
        return yValues.push(row);
      });
      if (this.data.axes.y != null) {
        yValues = yValues.concat(this.data.axes.y.map(function(axis) {
          return axis.position;
        }));
      }
      return this.data.range = {
        x: {
          min: Math.min.apply(Math, xValues),
          max: Math.max.apply(Math, xValues)
        },
        y: {
          min: 0,
          max: Math.max.apply(Math, yValues)
        }
      };
    };

    return StackableAreaChart;

  })(AreaChartBase);

  module.exports = StackableAreaChart;

}).call(this);
