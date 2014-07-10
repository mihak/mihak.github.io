(function() {
  var AreaChartBase, LineChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AreaChartBase = require('./area_chart_base');

  LineChart = (function(_super) {
    __extends(LineChart, _super);

    LineChart.colors = {
      series: ['#77a020', '#ff9000', '#6763CE'],
      areaShadeFills: ['90-#dce6c4-#eaefd8'],
      areaOpacity: 1,
      backgroundShade: '#f8f8f8',
      backgroundAreaOpacity: 1,
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

    LineChart.layout = {
      noDataImage: {
        src: 'img/chart_no_data.png',
        width: 359,
        height: 86
      },
      axes: {
        x: {
          textProps: {
            'font': '11px Tahoma',
            'text-anchor': 'middle'
          },
          offsetX: 0,
          offsetY: 0,
          fitLabels: false
        },
        y: {
          textProps: {
            'font': '11px Tahoma',
            'text-anchor': 'start'
          },
          offsetX: 0,
          offsetY: 0
        },
        positionY: 'left'
      },
      background: null,
      highlightDataPointAreaOnMouseover: false,
      highlightedAreaWidth: 4,
      showAllDataPoints: true,
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
          offsetX: -44,
          offsetY: -54,
          width: 88,
          height: 49,
          src: 'img/analytics_bubble.png'
        },
        top: {
          offsetX: -36,
          offsetY: -39,
          textProps: {
            'text-anchor': 'start'
          }
        },
        bottom: {
          offsetX: -36,
          offsetY: -26,
          textProps: {
            'text-anchor': 'start',
            'font-weight': 'bold'
          }
        }
      },
      datapoints: {
        stroke: '#000000',
        fill: '#ffffff'
      }
    };

    LineChart.padding = {
      left: 10,
      top: 10,
      right: 10,
      bottom: 25
    };

    LineChart.backgroundPadding = {
      left: 10,
      top: 10,
      right: 10,
      bottom: 25
    };

    function LineChart(options) {
      LineChart.__super__.constructor.apply(this, arguments);
      this._playhead = null;
      if (this.data.format) {
        this.formatBubble = this.data.format;
      }
    }

    LineChart.prototype.getOpacity = function() {
      var _ref, _ref1, _ref2, _ref3;
      if (((_ref = this.data.axes) != null ? (_ref1 = _ref.x) != null ? _ref1.length : void 0 : void 0) === 1) {
        return 1;
      } else if (((_ref2 = this.layout) != null ? (_ref3 = _ref2.datapoints) != null ? _ref3.opacity : void 0 : void 0) != null) {
        return this.layout.datapoints.opacity;
      }
    };

    LineChart.prototype.getCircleRadius = function(index) {
      if (this.layout.datapoints.radius) {
        return this.layout.datapoints.radius;
      } else if (index === 0) {
        return 5;
      } else {
        return 4;
      }
    };

    LineChart.prototype.getStrokeWidth = function(index) {
      if (index === 0) {
        return '1.5px';
      } else {
        return '1px';
      }
    };

    LineChart.prototype.render = function() {
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

    LineChart.prototype.drawSeries = function() {
      var index, mappedSeries, series, _i, _len, _ref, _ref1, _ref2, _results;
      _ref = this.data.series;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        series = _ref[index];
        if (series.length === 0) {
          continue;
        }
        mappedSeries = series.map((function(_this) {
          return function(pair) {
            return _this._mapCoordinatesToScreen(pair);
          };
        })(this));
        if (series.length === 1) {
          _results.push(this.paper.path(this._getLineForSingleDayChart(mappedSeries[0].x, mappedSeries[0].y)).attr({
            fill: 'none',
            stroke: this.colors.series[index % this.colors.series.length],
            'stroke-width': ((_ref1 = this.layout.series) != null ? _ref1.stroke : void 0) != null ? this.layout.series.stroke : index === 0 && series.length < 75 ? '4px' : '2px'
          }));
        } else if (series.length > 1) {
          this.paper.path(this._getAreaForPoints(mappedSeries)).attr({
            stroke: 'none',
            fill: this.colors.areaShadeFills[index],
            opacity: this.colors.areaOpacity
          });
          _results.push(this.paper.path(this.getLineForPoints(mappedSeries)).attr({
            fill: 'none',
            stroke: this.colors.series[index % this.colors.series.length],
            'stroke-width': ((_ref2 = this.layout.series) != null ? _ref2.stroke : void 0) != null ? this.layout.series.stroke : index === 0 && series.length < 75 ? '4px' : '2px'
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    LineChart.prototype.drawPlayhead = function(x) {
      var point;
      point = this._mapCoordinatesToScreen({
        x: x,
        y: 0
      });
      if (this._playhead != null) {
        this._playhead.remove();
      }
      return this._playhead = this.paper.path(this.getLineForPoints([
        {
          x: Math.ceil(point.x),
          y: 0
        }, {
          x: Math.ceil(point.x),
          y: this.height - this.padding.bottom
        }
      ])).attr({
        'stroke-width': '2px',
        stroke: this.colors.xMarker
      });
    };

    LineChart.prototype.formatBubbleData = function(datapoint) {
      return this.formatBubble({
        x: datapoint.x,
        y: datapoint.y
      });
    };

    LineChart.prototype._calculateRanges = function() {
      var xValues, yValues;
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
      yValues = Array.prototype.concat.apply([], this.data.series.map(function(s) {
        return s.map(function(row) {
          return row.y;
        });
      }));
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

    LineChart.prototype._getLineForSingleDayChart = function(x, y) {
      var s;
      return s = "M" + (x - 26) + " " + y + "L" + (x + 26) + " " + y;
    };

    return LineChart;

  })(AreaChartBase);

  module.exports = LineChart;

}).call(this);
