(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var AreaChartBase, ChartBase,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ChartBase = require('./chart_base');


  /*
  AreaCharts expects the following `data` parameter structure:
  
  new LineChart
      data:
          series: [ {x, y}, ... ]
          axes:
               * the x axes are the ones that produce shaded rectangles in the background
              x: [ {position, [label]}, ... ] # label is optional, will write value if not supplied
               * these are minor axes on the y axis and are rendered as solid lines
              y: [ {position, [label]}, ... ] # label is optional, will write value if not supplied
  
          markers (optional):
              x: [ { position, label, style, opacity, width }, ... ]
              y: [ { position, label, style, opacity, width }, ... ]
  
           * formatter function used to display values in the bubble, the function is passed
           * the datapoint being hovered over and has an { x, y } structure with values
          format: (datapoint) -> { x: 'formatted x value', y: 'formatted y value' }
   */

  AreaChartBase = (function(_super) {
    __extends(AreaChartBase, _super);

    AreaChartBase.prototype.formatBubble = function(datapoint) {
      return {
        x: datapoint.x,
        y: datapoint.y
      };
    };

    function AreaChartBase(options) {
      var _ref, _ref1;
      AreaChartBase.__super__.constructor.apply(this, arguments);
      this.padding = $.extend(true, {}, this.constructor.padding, options.padding);
      this.backgroundPadding = $.extend(true, {}, this.constructor.backgroundPadding, options.backgroundPadding);
      this.colors = $.extend(true, {}, this.constructor.colors, options.colors);
      this.layout = $.extend(true, {}, this.constructor.layout, options.layout);
      this.data = $.extend(true, {}, options.data);
      if (((_ref = options.colors) != null ? _ref.series : void 0) != null) {
        this.colors.series = options.colors.series;
      }
      if (((_ref1 = options.colors) != null ? _ref1.areaShadeFills : void 0) != null) {
        this.colors.areaShadeFills = options.colors.areaShadeFills;
      }
      if (this.data.format) {
        this.formatBubble = this.data.format;
      }
      this._bubble = null;
      this.visiblePoints = [];
      if (this.layout.highlightDataPointAreaOnMouseover) {
        $(this.el).mousemove((function(_this) {
          return function(e) {
            var multiplier, offset, padding, width, x, xCoordinateFromMousePointer, xMax, xMin;
            offset = _this.el.offset();
            x = e.clientX - offset.left;
            width = _this.width;
            padding = _this.padding.left;
            if (_this.data.range == null) {
              _this._calculateRanges();
            }
            xMin = _this.data.range.x.min;
            xMax = _this.data.range.x.max;
            multiplier = (width - 2 * padding) / (xMax - xMin);
            xCoordinateFromMousePointer = Math.round((x / multiplier) + xMin - (padding / multiplier));
            if (xCoordinateFromMousePointer >= xMin && xCoordinateFromMousePointer < xMax) {
              return _this.drawHighlightedArea(xCoordinateFromMousePointer);
            }
          };
        })(this));
      }
    }

    AreaChartBase.prototype.drawBackground = function() {
      var firstPoint, index, padding, position, secondPoint, _i, _len, _ref, _ref1;
      padding = this.backgroundPadding;
      this.paper.rect(padding.left, this.height - padding.bottom, this.width - padding.left - padding.right, 1.5).attr({
        fill: this.colors.xAxis,
        stroke: 'none'
      });
      if (((_ref = this.data.background) != null ? _ref.length : void 0) > 0) {
        _ref1 = this.data.background;
        for (index = _i = 0, _len = _ref1.length; _i < _len; index = _i += 2) {
          position = _ref1[index];
          firstPoint = this._mapCoordinatesToScreen({
            x: position,
            y: 0
          });
          if (index === this.data.background.length - 1) {
            secondPoint = this._mapCoordinatesToScreen({
              x: this.data.range.x.max,
              y: 0
            });
          } else {
            secondPoint = this._mapCoordinatesToScreen({
              x: this.data.background[index + 1],
              y: 0
            });
          }
          this.paper.rect(firstPoint.x, padding.top, secondPoint.x - firstPoint.x, this.height - padding.top - padding.bottom).attr({
            fill: this.colors.backgroundShade,
            stroke: 'none',
            opacity: this.colors.backgroundAreaOpacity
          });
        }
      }
      if (!this._hasSeriesData()) {
        if (this._hasBackgroundText()) {
          return;
        }
        return this.paper.image(this.layout.noDataImage.src, (this.width - padding.left - padding.right - this.layout.noDataImage.width) / 2 + padding.left, (this.height - padding.top - padding.bottom - this.layout.noDataImage.height) / 2 + padding.top, this.layout.noDataImage.width, this.layout.noDataImage.height);
      }
    };

    AreaChartBase.prototype.drawHighlightedArea = function(xCoordinate) {
      var firstPoint, i, padding, secondPoint, _i, _j, _len, _ref, _ref1;
      if (this._isPointOnHighlightedArea(xCoordinate)) {
        return;
      } else {
        if (!this.highlightAreas) {
          this._calculateHighlightAreas();
        }
        for (i = _i = 0, _ref = this.highlightAreas.length - 2; _i <= _ref; i = _i += 1) {
          if (xCoordinate > this.highlightAreas[i]) {
            this.currentHighlightedArea = [this.highlightAreas[i], this.highlightAreas[i + 1]];
          }
        }
      }
      firstPoint = this._mapCoordinatesToScreen({
        x: this.currentHighlightedArea[0],
        y: 0
      });
      secondPoint = this._mapCoordinatesToScreen({
        x: this.currentHighlightedArea[1],
        y: 0
      });
      if (this.highlightedArea) {
        this.highlightedArea.remove();
        this.highlightedArea = null;
      }
      padding = this.backgroundPadding;
      this.highlightedArea = this.paper.rect(firstPoint.x, padding.top, secondPoint.x - firstPoint.x, this.height - padding.top - padding.bottom).attr({
        fill: this.colors.backgroundShade,
        stroke: 'none',
        opacity: this.colors.backgroundAreaOpacity
      });
      this.highlightedArea.node.style.pointerEvents = 'none';
      _ref1 = this.visiblePoints;
      for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
        i = _ref1[_j];
        i.remove();
      }
      this.visiblePoints = [];
      return this.drawDataPoints();
    };

    AreaChartBase.prototype.drawBackgroundText = function() {
      var padding;
      padding = this.backgroundPadding;
      return this.paper.text((this.width - padding.left - padding.right) / 2 + padding.left, this.height - padding.bottom - this.layout.background.paddingBottom, this.layout.background.text).attr(this.layout.background.textProps);
    };

    AreaChartBase.prototype.drawAxes = function() {
      var anchor, endOfText, label, leftEadge, offset, offsetPoint, point, pos, rightEadge, segment, startOfText, textProps, width, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      if (((_ref = this.data.axes) != null ? _ref.x : void 0) != null) {
        _ref1 = this.data.axes.x;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          segment = _ref1[_i];
          if (segment.label == null) {
            continue;
          }
          point = this._mapCoordinatesToScreen({
            x: segment.position,
            y: 0
          });
          textProps = $.extend({}, this.layout.axes.x.textProps);
          label = this.paper.text(point.x + this.layout.axes.x.offsetX, this.height - this.padding.bottom + 25 + this.layout.axes.x.offsetY, segment.label).attr(textProps).attr({
            fill: this.colors.xLabel
          });
          if (!this.layout.axes.x.fitLabels) {
            continue;
          }
          anchor = label.attr('text-anchor');
          width = label.getBBox().width;
          leftEadge = this.padding.left;
          rightEadge = this.paper.width - this.padding.right;
          switch (anchor) {
            case 'start':
              endOfText = point.x + width;
              if (!(endOfText > rightEadge)) {
                continue;
              }
              offset = endOfText - rightEadge;
              offsetPoint = point.x - offset;
              break;
            case 'end':
              startOfText = point.x - width;
              if (!(startOfText < leftEadge)) {
                continue;
              }
              offset = leftEadge - startOfText;
              offsetPoint = point.x + offset;
              break;
            case 'middle':
              startOfText = point.x - (width / 2);
              endOfText = point.x + (width / 2);
              if (startOfText < leftEadge) {
                offset = leftEadge - startOfText;
                offsetPoint = point.x + offset;
              } else if (endOfText > rightEadge) {
                offset = endOfText - rightEadge;
                offsetPoint = point.x - offset;
              } else {
                continue;
              }
          }
          label.attr('x', offsetPoint);
        }
      }
      if (((_ref2 = this.data.axes) != null ? _ref2.y : void 0) != null) {
        _ref3 = this.data.axes.y;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          segment = _ref3[_j];
          if (segment.label == null) {
            continue;
          }
          point = this._mapCoordinatesToScreen({
            x: 0,
            y: segment.position
          });
          pos = {};
          if (this.layout.axes.positionY === 'left') {
            pos.x = this.padding.left + 2 + this.layout.axes.y.offsetX;
            pos.y = point.y + 12 + this.layout.axes.y.offsetY;
          } else {
            pos.x = this.width - this.padding.left - 5 + this.layout.axes.y.offsetX;
            pos.y = point.y + this.layout.axes.y.offsetY;
          }
          this.paper.text(pos.x, pos.y, segment.label).attr(this.layout.axes.y.textProps).attr({
            fill: this.colors.yLabel
          });
        }
      }
      return this.paper.rect(0, 0, this.width, this.height).attr({
        fill: 'white',
        opacity: 0
      });
    };

    AreaChartBase.prototype.drawMarkers = function() {
      var marker, point, x, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
      if (((_ref = this.data.markers) != null ? _ref.x : void 0) != null) {
        _ref1 = this.data.markers.x;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          marker = _ref1[_i];
          point = this._mapCoordinatesToScreen({
            x: marker.position,
            y: 0
          });
          this.paper.path(this.getLineForPoints([
            {
              x: Math.ceil(point.x) - 0.5,
              y: 0
            }, {
              x: Math.ceil(point.x) - 0.5,
              y: this.height - this.padding.bottom
            }
          ])).attr({
            'stroke-width': marker.width ? marker.width : '1px',
            stroke: this.colors.xMinorAxis,
            'stroke-opacity': marker.opacity ? marker.opacity : 1
          }).node.setAttribute('stroke-dasharray', this._getStroke(marker.style));
          if (marker.label != null) {
            this.paper.text(Math.ceil(point.x) - 0.5 + this.layout.markers.x.offsetX, this.padding.top + this.layout.markers.x.offsetY, marker.label).attr(this.layout.markers.x.textProps).attr({
              fill: this.colors.xMarkerLabel
            });
          }
        }
      }
      if (((_ref2 = this.data.markers) != null ? _ref2.y : void 0) != null) {
        _ref3 = this.data.markers.y;
        _results = [];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          marker = _ref3[_j];
          point = this._mapCoordinatesToScreen({
            x: 0,
            y: marker.position
          });
          this.paper.path(this.getLineForPoints([
            {
              x: this.padding.left,
              y: Math.ceil(point.y) - 0.5
            }, {
              x: this.width - this.padding.right,
              y: Math.ceil(point.y) - 0.5
            }
          ])).attr({
            'stroke-width': marker.width ? marker.width : '1px',
            stroke: this.colors.xMinorAxis,
            'stroke-opacity': marker.opacity ? marker.opacity : 1
          }).node.setAttribute('stroke-dasharray', this._getStroke(marker.style));
          if (marker.label != null) {
            x = (this.width - this.padding.left - this.padding.right) / 2 + this.padding.left;
            _results.push(this.paper.text(x + this.layout.markers.y.offsetX, Math.ceil(point.y) + this.layout.markers.y.offsetY, marker.label).attr(this.layout.markers.y.textProps).attr({
              fill: this.colors.yMarkerLabel
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    AreaChartBase.prototype.drawDataPoints = function() {
      var circleRadius, coords, fillColor, index, o, opacity, p, pair, self, series, strokeWidth, _i, _len, _ref, _results;
      self = this;
      _ref = this.data.series;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        series = _ref[index];
        if (series.length === 0) {
          continue;
        }
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = series.length; _j < _len1; _j++) {
            pair = series[_j];
            coords = this._mapCoordinatesToScreen(pair);
            fillColor = this.colors.series[index % this.colors.series.length];
            circleRadius = this.getCircleRadius(index);
            if (this.layout.highlightDataPointAreaOnMouseover && this._isPointOnHighlightedArea(pair.x)) {
              opacity = 1;
            } else {
              opacity = (o = this.getOpacity()) != null ? o : series.length > 75 ? 0 : 1;
            }
            strokeWidth = this.getStrokeWidth(index);
            if (this.layout.showAllDataPoints || this._isPointOnHighlightedArea(pair.x) || (!this.layout.showAllDataPoints && !this.layout.highlightDataPointAreaOnMouseover)) {
              p = this.paper.circle(coords.x, coords.y, circleRadius).attr({
                stroke: 'white',
                'stroke-width': strokeWidth,
                fill: fillColor,
                opacity: opacity
              }).data({
                datapoint: pair
              }).data({
                fillColor: fillColor
              }).data({
                circleRadius: circleRadius
              }).data({
                strokeWidth: strokeWidth
              }).data({
                opacity: opacity
              }).mouseover(function() {
                self.drawBubbleForPoint(this.data('datapoint'));
                return this.animate({
                  stroke: self.layout.datapoints.stroke,
                  'stroke-width': '2.5px',
                  fill: self.layout.datapoints.fill === 'none' ? this.data('fillColor') : self.layout.datapoints.fill,
                  r: this.data('circleRadius') + 1.5,
                  opacity: 1
                }, 60, 'ease-out');
              }).mouseout(function() {
                if (self._bubble != null) {
                  self._bubble.remove();
                }
                self._bubble = null;
                return this.animate({
                  stroke: 'white',
                  'stroke-width': this.data('strokeWidth'),
                  fill: this.data('fillColor'),
                  r: this.data('circleRadius'),
                  opacity: this.data('opacity')
                }, 60, 'ease-out');
              });
              if (this.layout.highlightDataPointAreaOnMouseover) {
                _results1.push(this.visiblePoints.push(p));
              } else {
                _results1.push(void 0);
              }
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    AreaChartBase.prototype.drawBubbleForPoint = function(datapoint) {
      var formatted, point;
      point = this._mapCoordinatesToScreen(datapoint);
      if (this._bubble != null) {
        this._bubble.remove();
      }
      formatted = this.formatBubbleData(datapoint);
      this.paper.setStart();
      this.paper.image(this.layout.bubble.image.src, point.x + this.layout.bubble.image.offsetX, point.y + this.layout.bubble.image.offsetY, this.layout.bubble.image.width, this.layout.bubble.image.height).node.style.pointerEvents = 'none';
      this.paper.text(point.x + this.layout.bubble.top.offsetX, point.y + this.layout.bubble.top.offsetY, formatted.x).attr(this.layout.bubble.top.textProps).attr({
        fill: this.colors.xBubble
      }).node.style.pointerEvents = 'none';
      this.paper.text(point.x + this.layout.bubble.bottom.offsetX, point.y + this.layout.bubble.bottom.offsetY, formatted.y).attr(this.layout.bubble.bottom.textProps).attr({
        fill: this.colors.yBubble
      }).node.style.pointerEvents = 'none';
      return this._bubble = this.paper.setFinish();
    };

    AreaChartBase.prototype._getStroke = function(style) {
      switch (style) {
        case 'line':
          return '0  0';
        case 'dotted':
          return '2  6';
        case 'dashed':
          return '15 5';
        default:
          return '4  3';
      }
    };

    AreaChartBase.prototype._hasBackgroundText = function() {
      var _ref, _ref1;
      return ((_ref = this.layout.background) != null ? (_ref1 = _ref.text) != null ? _ref1.length : void 0 : void 0) > 0;
    };

    AreaChartBase.prototype._hasSeriesData = function() {
      var hasData, _ref;
      hasData = false;
      if ((_ref = this.data.series) != null) {
        _ref.forEach(function(series) {
          if (series.length > 0) {
            return hasData = true;
          }
        });
      }
      return hasData;
    };

    AreaChartBase.prototype._hasAxesData = function() {
      var hasData, _ref, _ref1, _ref2, _ref3;
      hasData = false;
      if (((_ref = this.data.axes) != null ? (_ref1 = _ref.x) != null ? _ref1.length : void 0 : void 0) > 0) {
        hasData = true;
      }
      if (((_ref2 = this.data.axes) != null ? (_ref3 = _ref2.y) != null ? _ref3.length : void 0 : void 0) > 0) {
        hasData = true;
      }
      return hasData;
    };

    AreaChartBase.prototype._hasMarkersData = function() {
      var hasData, _ref, _ref1, _ref2, _ref3;
      hasData = false;
      if (((_ref = this.data.markers) != null ? (_ref1 = _ref.x) != null ? _ref1.length : void 0 : void 0) > 0) {
        hasData = true;
      }
      if (((_ref2 = this.data.markers) != null ? (_ref3 = _ref2.y) != null ? _ref3.length : void 0 : void 0) > 0) {
        hasData = true;
      }
      return hasData;
    };

    AreaChartBase.prototype._mapCoordinatesToScreen = function(coordinate) {
      var _ref, _ref1;
      if (this.data.range == null) {
        this._calculateRanges();
      }
      return {
        x: ((_ref = this.data.axes) != null ? (_ref1 = _ref.x) != null ? _ref1.length : void 0 : void 0) === 1 ? (this.paper.width - this.padding.left - this.padding.right) / 2 + this.padding.left : ((coordinate.x - this.data.range.x.min) / (this.data.range.x.max - this.data.range.x.min) * (this.width - this.padding.left - this.padding.right) || 0) + this.padding.left,
        y: (1 - (coordinate.y - this.data.range.y.min) / (this.data.range.y.max - this.data.range.y.min)) * (this.height - this.padding.top - this.padding.bottom) + this.padding.top
      };
    };

    AreaChartBase.prototype._getAreaForPoints = function(points, snap) {
      var path, s;
      if (snap == null) {
        snap = false;
      }
      s = function(val) {
        if (snap) {
          return Math.round(val) + 0.5;
        } else {
          return val;
        }
      };
      path = this.getLineForPoints(points, snap);
      path += "L" + (s(this.width - this.padding.right)) + "," + (s(this.height - this.padding.bottom));
      path += "L" + (s(points[0].x)) + "," + (s(this.height - this.padding.bottom));
      path += "L" + (s(points[0].x)) + "," + (s(points[0].y));
      return path;
    };

    AreaChartBase.prototype._isPointOnHighlightedArea = function(xCoordinate) {
      return this.currentHighlightedArea && xCoordinate >= this.currentHighlightedArea[0] && xCoordinate <= this.currentHighlightedArea[1];
    };

    AreaChartBase.prototype._calculateHighlightAreas = function() {
      var areas, i, middleValue, points, s, _i, _j, _len, _ref, _ref1;
      if (this.data.range == null) {
        this._calculateRanges();
      }
      points = [];
      _ref = this.data.series[0];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        points.push(s.x);
      }
      areas = [];
      areas.push(this.data.range.x.min);
      for (i = _j = 0, _ref1 = points.length - 2; _j <= _ref1; i = _j += 1) {
        middleValue = Math.round((points[i] + points[i + 1]) / 2);
        areas.push(middleValue);
      }
      areas.push(this.data.range.x.max);
      return this.highlightAreas = areas;
    };

    return AreaChartBase;

  })(ChartBase);

  module.exports = AreaChartBase;

}).call(this);

},{"./chart_base":5}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./chart_abstract":4,"jquery-commonjs":19}],4:[function(require,module,exports){
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

},{"jquery-commonjs":19}],5:[function(require,module,exports){
(function() {
  var ChartBase, Raphael;

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  Raphael = require('raphael-light');

  ChartBase = (function() {
    function ChartBase(options) {
      var $el;
      this.el = options.el, this.data = options.data, this.width = options.width, this.height = options.height;
      $el = $(this.el);
      if (this.width == null) {
        this.width = $el.width();
      }
      if (this.height == null) {
        this.height = $el.height();
      }
      this.paper = Raphael($el.empty()[0], this.width, this.height);
    }

    ChartBase.prototype.getLineForPoints = function(points, snap) {
      var i, ret, s, _i, _ref;
      if (snap == null) {
        snap = false;
      }
      if (!points.length) {
        return '';
      }
      s = function(val) {
        if (snap) {
          return Math.round(val) + 0.5;
        } else {
          return val;
        }
      };
      ret = "M" + (s(points[0].x)) + "," + (s(points[0].y));
      for (i = _i = 1, _ref = points.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        ret += "L" + (s(points[i].x)) + "," + (s(points[i].y));
      }
      return ret;
    };

    return ChartBase;

  })();

  module.exports = ChartBase;

}).call(this);

},{"jquery-commonjs":19,"raphael-light":20}],6:[function(require,module,exports){
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

},{"./chart_abstract":4}],7:[function(require,module,exports){
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

},{"./canvas_pie_chart_base":3,"jquery-commonjs":19}],8:[function(require,module,exports){
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

},{"./canvas_pie_chart_base":3,"jquery-commonjs":19}],9:[function(require,module,exports){
(function() {
  require('./pie_chart');

  require('./donut_chart');

  require('./bar_chart');

  require('./tube_chart');

  require('./gauge_chart');

  require('./semicircle_gauge_chart');

  require('./filmstrip_chart');

  require('./column_chart');

  require('./line_chart');

  require('./stackable_area_chart');

  require('./sparkline_chart');

  require('./cookie_chart');

  require('./stopwatch');

}).call(this);

},{"./bar_chart":2,"./column_chart":6,"./cookie_chart":7,"./donut_chart":8,"./filmstrip_chart":10,"./gauge_chart":11,"./line_chart":12,"./pie_chart":13,"./semicircle_gauge_chart":14,"./sparkline_chart":15,"./stackable_area_chart":16,"./stopwatch":17,"./tube_chart":18}],10:[function(require,module,exports){
(function() {
  var FilmstripChart;

  FilmstripChart = (function() {
    function FilmstripChart(options) {
      this.el = options.el, this.percentage = options.percentage, this.width = options.width, this.height = options.height;
    }

    FilmstripChart.prototype.render = function() {
      var canvas, ctx, drawStripe, grd, greenWidth;
      canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      ctx = canvas.getContext('2d');
      ctx.save();
      grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grd.addColorStop(0, '#eee');
      grd.addColorStop(1, '#ddd');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ddd';
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      greenWidth = canvas.width * (this.percentage / 100);
      grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grd.addColorStop(0, '#acc478');
      grd.addColorStop(1, '#97b94e');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, greenWidth, canvas.height);
      ctx.strokeStyle = '#5f7f19';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(greenWidth, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(95,127,25,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(greenWidth, 0);
      ctx.lineTo(greenWidth, canvas.height);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fff';
      drawStripe = (function(_this) {
        return function(y) {
          var x, _results;
          x = 2;
          _results = [];
          while (x < _this.width) {
            ctx.fillRect(x, y, 4, 5);
            _results.push(x += 8);
          }
          return _results;
        };
      })(this);
      drawStripe(4);
      drawStripe(canvas.height - 9);
      return this.el.append(canvas);
    };

    return FilmstripChart;

  })();

  module.exports = FilmstripChart;

}).call(this);

},{}],11:[function(require,module,exports){
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

},{"jquery-commonjs":19}],12:[function(require,module,exports){
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
      var index, mappedSeries, series, _i, _len, _ref, _ref1, _results;
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
        if (series.length > 1) {
          this.paper.path(this._getAreaForPoints(mappedSeries)).attr({
            stroke: 'none',
            fill: this.colors.areaShadeFills[index],
            opacity: this.colors.areaOpacity
          });
          _results.push(this.paper.path(this.getLineForPoints(mappedSeries)).attr({
            fill: 'none',
            stroke: this.colors.series[index % this.colors.series.length],
            'stroke-width': ((_ref1 = this.layout.series) != null ? _ref1.stroke : void 0) != null ? this.layout.series.stroke : index === 0 && series.length < 75 ? '4px' : '2px'
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

    return LineChart;

  })(AreaChartBase);

  module.exports = LineChart;

}).call(this);

},{"./area_chart_base":1}],13:[function(require,module,exports){
(function() {
  var ChartAbstract, PieChart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.$ == null) {
    window.$ = require('jquery-commonjs');
  }

  ChartAbstract = require('./chart_abstract');

  PieChart = (function(_super) {
    __extends(PieChart, _super);

    PieChart.prototype.defaults = {
      limit: 3,
      reverseColors: false
    };

    function PieChart(options) {
      var index, slice, _i, _len, _ref;
      PieChart.__super__.constructor.apply(this, arguments);
      $.extend(this.options, ChartAbstract.prototype.defaults, this.defaults, options);
      this.meta = $.extend({}, this.meta, {
        zeroAngle: 0,
        maxAngle: 360,
        maxSliceAngle: 180,
        slices: []
      });
      this.loadSlices();
      _ref = this.meta.slices;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        slice = _ref[index];
        this.$el.append(this.createSliceElement(slice.offset, slice.position));
      }
      $('<div></div>').addClass('smooth-edge').appendTo(this.$el);
    }

    PieChart.prototype.createSliceElement = function(offset, position) {
      var seriesClass, slice;
      slice = $('<div></div>').addClass('slice');
      seriesClass = this.options.reverseColors ? "series-" + (this.data.length - 1 - position) : "series-" + position;
      slice.append($('<div></div>').addClass('fill').addClass(seriesClass));
      this.rotate(slice, offset);
      return slice;
    };

    PieChart.prototype.render = function() {
      var index, slice, _i, _len, _ref, _results;
      _ref = this.$el.find('.fill');
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        slice = _ref[index];
        _results.push(this.rotate($(slice), this.meta.slices[index].angle));
      }
      return _results;
    };

    PieChart.prototype.loadSlices = function() {
      var angle, index, secondSliceAngle, secondSliceOffset, skip, totalAngle, value, _i, _len, _ref, _results;
      this.meta.slices = [];
      totalAngle = 0;
      skip = false;
      _ref = this.data;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        value = _ref[index];
        if (skip) {
          continue;
        }
        if ((this.options.limit != null) && index === this.options.limit) {
          value = this.getCombinedValue(index, this.data.length);
          skip = true;
        }
        angle = this.getAngle(value);
        if (angle <= this.meta.maxSliceAngle) {
          this.meta.slices.push({
            position: index,
            offset: totalAngle,
            angle: angle
          });
        } else {
          this.meta.slices.push({
            position: index,
            offset: totalAngle,
            angle: this.meta.maxSliceAngle
          });
          secondSliceOffset = totalAngle + this.meta.maxSliceAngle;
          secondSliceAngle = angle - this.meta.maxSliceAngle;
          this.meta.slices.push({
            position: index,
            offset: secondSliceOffset,
            angle: secondSliceAngle
          });
          this.meta.slices.push({
            position: index,
            offset: secondSliceOffset - 5,
            angle: secondSliceAngle > 5 ? 10 : 5 + secondSliceAngle
          });
        }
        _results.push(totalAngle += angle);
      }
      return _results;
    };

    PieChart.prototype.getAngle = function(value) {
      return Math.round((value * this.meta.maxAngle) / 100);
    };

    PieChart.prototype.rotate = function($el, angle) {
      var value;
      value = "rotate(" + angle + "deg)";
      $el.css('-webkit-transform', value);
      $el.css('-moz-transform', value);
      $el.css('-ms-transform', value);
      $el.css('-o-transform', value);
      return $el.css('transform', value);
    };

    PieChart.prototype.getCombinedValue = function(firstIndex, lastIndex) {
      var combinedValue, i, value, _i, _len, _ref;
      combinedValue = 0;
      _ref = this.data.slice(firstIndex, +lastIndex + 1 || 9e9);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        value = _ref[i];
        combinedValue += value;
      }
      return combinedValue;
    };

    return PieChart;

  })(ChartAbstract);

  module.exports = PieChart;

}).call(this);

},{"./chart_abstract":4,"jquery-commonjs":19}],14:[function(require,module,exports){
(function() {
  var SemicircleGaugeChart;

  SemicircleGaugeChart = (function() {
    function SemicircleGaugeChart(options) {
      this.el = options.el, this.percentage = options.percentage, this.width = options.width, this.height = options.height;
    }

    SemicircleGaugeChart.prototype.render = function() {
      var canvas, circleCenterX, circleCenterY, circleRadius, ctx, cursor, grd, innerCircleRadius, maxAngle, minAngle, pctAngle;
      canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      ctx = canvas.getContext('2d');
      minAngle = -Math.PI * 2 / 3;
      maxAngle = -Math.PI * 2 / 6;
      pctAngle = minAngle - (maxAngle * this.percentage / 100);
      circleCenterX = canvas.width / 2;
      circleCenterY = canvas.width;
      circleRadius = canvas.width;
      innerCircleRadius = canvas.width - this.height * 0.55;
      grd = ctx.createRadialGradient(circleCenterX, circleCenterY, innerCircleRadius, circleCenterX, circleCenterX, circleRadius);
      grd.addColorStop(0, '#e1e1e1');
      grd.addColorStop(1, '#ececec');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.arc(circleCenterX, circleCenterY, circleRadius, minAngle, maxAngle, false);
      ctx.fill();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, circleRadius - 1, minAngle, maxAngle, false);
      ctx.strokeStyle = '#b3b3b3';
      ctx.stroke();
      grd = ctx.createRadialGradient(circleCenterX, circleCenterY, innerCircleRadius, circleCenterX, circleCenterY, circleRadius);
      grd.addColorStop(0, '#97b94e');
      grd.addColorStop(1, '#acc478');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.arc(circleCenterX, circleCenterY, circleRadius, minAngle, pctAngle, false);
      ctx.fill();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, circleRadius - 1, minAngle, pctAngle, false);
      ctx.strokeStyle = '#5f7f19';
      ctx.stroke();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, innerCircleRadius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      cursor = new Image;
      cursor.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAABKCAYAAAC2EwTNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERUNEM0JGRDg1N0IxMUUyOUI1MEEyMTYyRDYxNjBGNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERUNEM0JGRTg1N0IxMUUyOUI1MEEyMTYyRDYxNjBGNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRFQ0QzQkZCODU3QjExRTI5QjUwQTIxNjJENjE2MEY1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRFQ0QzQkZDODU3QjExRTI5QjUwQTIxNjJENjE2MEY1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+cRJdlAAAAu9JREFUeNrsmMGO2jAQhuPEzkIqVmRLtRUtLapaUZCKaCXECamHVuqZA2+ExGO0bwDv0RegFw49cajEcmmXDVA7+oOCY8cm2kNVraXR7s6Mv52ZjO3ExMkfBCLGAaJ11Ol9CIPujssWkgFSDUgAqlyuuVxCt+Gy4rLmcutYDJdLyOXDQRpCB5urmqTSBdPp9JNsgC6wBXlcSuVy+YlsgK4EHztQq9V6IxugOwvk12q1a9kAnW8LEjo/DMNMatD5NjUiaImLKz5kZ+gu4ENMoDiiarUayiDokoiMIDYajZ7rmgw2ZgKJv1mv19OCYGPyXBWIViqVUAeCjZpA8aPvdDqvdCDYMi2gqpEfRZFuMTuw+aYaif/C2u32Wx0INmaKKC42X+i6fcqBLbfYJImoXq8/04FgSyIiOlAcUYkPHQg2JjdlJqJut1s17XzwyY2IjcfjlgkEH6YDxWltt1tmAsHnpOAyiPIl8NoEgg/NBQVBUDGB4KMFxXvRfr93TSD40Lwa0Waz+dIEgk9+arxNAhMIPrmpeXnLQ1omyj5Kupqq9mrN3k3T3Z0ptmqv1uzdNC8iz7EfniqiY2pngLSp0clk8t6WAl8qpxZHs9vtrFOD77EF0qkRm66WupuoauQViMhTgehwOHxnC4IvlUGu7YJVLNxsjWyWh7RMiLKzC4Iyne094sMWBF9PWaNGo/HCFgRfZY3cAqlpV/+546RGRPp4ORcUi+vc07jX1I6P32bjlw6Ak31b/PKYy8fDmUPMwVziGr4CrEvjKj45izy1f/zxP4AeQP8fKPduKO8MSOa5KUBRUPwzHdG+AGgvR7QTl0t8/LYlwPcWc48RiWuvzWKx+G4Lgu8Gc09eLJ/2+/0vq9Xqp2mvFj7CV8xRvcCWxZE+GAw+z+fzr8vl8ocMWK/Xv2az2TfhI3wxJ3OWEVwyVXBRd4lrsOStLOIi6nKDCzuR1p+k2ETz/sxStw3pJxulrhEjm3tI3cmibdy/AgwA5/ssrgDG3U8AAAAASUVORK5CYII=';
      cursor.onload = function() {
        ctx.translate(circleCenterX, circleCenterY);
        ctx.rotate(pctAngle + Math.PI / 2);
        return ctx.drawImage(cursor, -9, -circleCenterY + 2);
      };
      return this.el.append(canvas);
    };

    return SemicircleGaugeChart;

  })();

  module.exports = SemicircleGaugeChart;

}).call(this);

},{}],15:[function(require,module,exports){
(function() {
  var ChartBase, SparklineChart,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ChartBase = require('./chart_base');

  SparklineChart = (function(_super) {
    __extends(SparklineChart, _super);

    SparklineChart.defaults = {
      fill: '#ffffdd',
      stroke: '#5b5b5b',
      strokeWidth: 1,
      minValue: 0,
      maxValue: 'max'
    };

    function SparklineChart(options) {
      this.render = __bind(this.render, this);
      var opts;
      SparklineChart.__super__.constructor.apply(this, arguments);
      opts = $.extend(true, {}, this.constructor.defaults, options);
      this.fill = opts.fill, this.stroke = opts.stroke, this.strokeWidth = opts.strokeWidth, this.minValue = opts.minValue, this.maxValue = opts.maxValue;
    }

    SparklineChart.prototype.render = function() {
      var i, max, min, points, valueMult, _i, _ref;
      this.paper.clear();
      if (this.data.length < 2) {
        return;
      }
      min = this.minValue === 'min' ? Math.min.apply(this, this.data) : this.minValue;
      max = Math.max(1, this.maxValue === 'max' ? Math.max.apply(this, this.data) : this.maxValue);
      valueMult = this.height / max;
      points = [];
      for (i = _i = 0, _ref = this.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        points.push({
          x: i * this.width / (this.data.length - 1),
          y: (max - this.data[i]) * valueMult
        });
      }
      this.paper.path(this.getShapeForPoints(points)).attr({
        fill: this.fill,
        stroke: 'none'
      });
      return this.paper.path(this.getLineForPoints(points)).attr({
        stroke: this.stroke,
        'stroke-width': this.strokeWidth
      });
    };

    SparklineChart.prototype.getShapeForPoints = function(points) {
      var i, ret, _i, _ref;
      if (!points.length) {
        return '';
      }
      ret = "M" + points[0].x + "," + points[0].y;
      for (i = _i = 1, _ref = points.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        ret += "L" + points[i].x + "," + points[i].y;
      }
      ret += "L" + points[i - 1].x + "," + this.height;
      ret += "L" + points[0].x + "," + this.height;
      return ret += "z";
    };

    return SparklineChart;

  })(ChartBase);

  module.exports = SparklineChart;

}).call(this);

},{"./chart_base":5}],16:[function(require,module,exports){
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
            'stroke-width': '5px'
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

},{"./area_chart_base":1}],17:[function(require,module,exports){
(function() {
  var Stopwatch;

  Stopwatch = (function() {
    Stopwatch.prototype.topLevelDivsData = [
      {
        name: 'buttonsContainer',
        classNames: 'pillow-stopwatch-buttons-container'
      }, {
        name: 'outerClockContainer',
        classNames: 'pillow-stopwatch-outer-clock-container'
      }, {
        name: 'innerClocksContainer',
        classNames: 'pillow-stopwatch-inner-clocks'
      }, {
        name: 'littleNotchesContainer',
        classNames: 'pillow-stopwatch-little-notches-container'
      }, {
        name: 'captionContainer',
        classNames: 'pillow-stopwatch-caption-container'
      }, {
        name: 'notch',
        classNames: 'pillow-stopwatch-notch'
      }
    ];

    Stopwatch.prototype.buttonDivsData = [
      {
        name: 'buttonLeft',
        classNames: 'pillow-stopwatch-btn pillow-stopwatch-btn-left'
      }, {
        name: 'buttonRight',
        classNames: 'pillow-stopwatch-btn pillow-stopwatch-btn-right'
      }, {
        name: 'buttonMiddlePart1',
        classNames: 'pillow-stopwatch-btn pillow-stopwatch-btn-middle-part-1'
      }, {
        name: 'buttonMiddlePart2',
        classNames: 'pillow-stopwatch-btn pillow-stopwatch-btn-middle-part-2'
      }
    ];

    Stopwatch.prototype.outerClockDivsData = [
      {
        name: 'pieColor',
        classNames: 'pillow-stopwatch-pie pillow-stopwatch-pie-colored pillow-stopwatch-quarter'
      }, {
        name: 'circleBackground',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-background pillow-stopwatch-full'
      }, {
        name: 'circleColor',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-colored pillow-stopwatch-quarter'
      }, {
        name: 'circleCutter',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-background pillow-stopwatch-quarter'
      }, {
        name: 'pieGrey',
        classNames: 'pillow-stopwatch-pie pillow-stopwatch-pie-cutter pillow-stopwatch-quarter'
      }, {
        name: 'pieColorFix',
        classNames: 'pillow-stopwatch-pie pillow-stopwatch-pie-colored pillow-stopwatch-quarter'
      }, {
        name: 'circleColorFix',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-colored pillow-stopwatch-quarter'
      }
    ];

    Stopwatch.prototype.innerClocksDivsData = [
      {
        name: 'pieColor',
        classNames: 'pillow-stopwatch-pie pillow-stopwatch-pie-colored pillow-stopwatch-quarter'
      }, {
        name: 'pieGrey',
        classNames: 'pillow-stopwatch-pie pillow-stopwatch-pie-cutter pillow-stopwatch-quarter'
      }, {
        name: 'pieColorFix',
        classNames: 'pillow-stopwatch-pie pillow-stopwatch-pie-colored pillow-stopwatch-quarter'
      }, {
        name: 'circleColor',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-colored pillow-stopwatch-quarter'
      }, {
        name: 'circleCutter',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-background pillow-stopwatch-quarter'
      }, {
        name: 'circleColorFix',
        classNames: 'pillow-stopwatch-circle pillow-stopwatch-circle-colored pillow-stopwatch-quarter'
      }
    ];

    Stopwatch.prototype.captionDivsData = [
      {
        name: 'timeText',
        classNames: 'pillow-stopwatch-text pillow-stopwatch-time-text'
      }, {
        name: 'titleText',
        classNames: 'pillow-stopwatch-text pillow-stopwatch-title-text'
      }, {
        name: 'subtitleText',
        classNames: 'pillow-stopwatch-text pillow-stopwatch-subtitle-text'
      }
    ];

    Stopwatch.prototype.comparedToAverageClass = null;

    Stopwatch.prototype.topLevelDivs = {};

    Stopwatch.prototype.outerClockDivs = {};

    Stopwatch.prototype.innerClocksDivs = {};

    Stopwatch.prototype.captionDivs = {};

    Stopwatch.prototype.animationDurationDefault = 1000;

    Stopwatch.prototype.animationInProgress = false;

    function Stopwatch(options) {
      this.el = options.el, this.time = options.time, this.averageTime = options.averageTime, this.showAverage = options.showAverage, this.title = options.title, this.subtitle = options.subtitle, this.animationDuration = options.animationDuration, this.displayMilliseconds = options.displayMilliseconds, this.autoAnimate = options.autoAnimate;
      if (!this.animationDuration) {
        this.animationDuration = this.animationDurationDefault;
      }
      if (this.time >= this.averageTime) {
        this.comparedToAverageClass = ' pillow-stopwatch-above-average';
      } else {
        this.comparedToAverageClass = ' pillow-stopwatch-below-average';
      }
    }

    Stopwatch.prototype.addComparedToAverageClassToDivs = function(divs) {
      var div, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = divs.length; _i < _len; _i++) {
        div = divs[_i];
        _results.push(div.className += this.comparedToAverageClass);
      }
      return _results;
    };

    Stopwatch.prototype.getMinutes = function() {
      return Math.floor(this.time / 60);
    };

    Stopwatch.prototype.createAndAppendDivToContainer = function(container, classNames) {
      var div;
      div = document.createElement('div');
      div.className = classNames;
      return container.appendChild(div);
    };

    Stopwatch.prototype.createAndAppendDivsToContainer = function(container, elementsInfo) {
      var divs, element, _i, _len;
      divs = {};
      for (_i = 0, _len = elementsInfo.length; _i < _len; _i++) {
        element = elementsInfo[_i];
        divs[element.name] = this.createAndAppendDivToContainer(container, element.classNames);
      }
      return divs;
    };

    Stopwatch.prototype.createAndAppendLittleNotchesToContainer = function(container) {
      var notch, _i, _results;
      _results = [];
      for (notch = _i = 0; _i < 12; notch = ++_i) {
        _results.push(this.rotateElement(this.createAndAppendDivToContainer(container, 'pillow-stopwatch-little-notch'), notch * 30));
      }
      return _results;
    };

    Stopwatch.prototype.createInnerClock = function(minute, container) {
      var circle;
      circle = this.createAndAppendDivsToContainer(container, this.innerClocksDivsData);
      this.addComparedToAverageClassToDivs([circle.circleColor, circle.circleColorFix, circle.pieColor, circle.pieColorFix]);
      this.hideElement(circle.circleColorFix);
      this.hideElement(circle.pieColorFix);
      return circle;
    };

    Stopwatch.prototype.createInnerClocks = function(minutes) {
      var circles, minute, minuteContainer;
      circles = [];
      minute = 1;
      while (minute <= Math.min(this.getMinutes(), 5)) {
        minuteContainer = document.createElement('div');
        minuteContainer.className = 'pillow-stopwatch-clock-for-minute-' + minute;
        this.topLevelDivs.innerClocksContainer.appendChild(minuteContainer);
        circles.push(this.createInnerClock(minute, minuteContainer));
        minute++;
      }
      return circles;
    };

    Stopwatch.prototype.render = function() {
      var self;
      self = this;
      this.topLevelDivs = this.createAndAppendDivsToContainer(this.el[0], this.topLevelDivsData);
      this.buttonDivs = this.createAndAppendDivsToContainer(this.topLevelDivs.buttonsContainer, this.buttonDivsData);
      this.outerClockDivs = this.createAndAppendDivsToContainer(this.topLevelDivs.outerClockContainer, this.outerClockDivsData);
      this.innerClocksDivs = this.createInnerClocks(this.getMinutes);
      this.textDivs = this.createAndAppendDivsToContainer(this.topLevelDivs.captionContainer, this.captionDivsData);
      this.createAndAppendLittleNotchesToContainer(this.topLevelDivs.littleNotchesContainer);
      this.addComparedToAverageClassToDivs([this.outerClockDivs.pieColorFix, this.outerClockDivs.circleColorFix]);
      this.setTitles(this.title, this.subtitle);
      this.reset();
      if (this.time > 60) {
        this.hideElement(this.topLevelDivs.notch);
      }
      if (this.autoAnimate) {
        return this.animate();
      }
    };

    Stopwatch.prototype.reset = function() {
      this.setRotation(0, this.outerClockDivs, true);
      return this.setTimeText(0);
    };

    Stopwatch.prototype.setTimeText = function(time) {
      var milliseconds, minutes, seconds;
      if (this.displayMilliseconds) {
        milliseconds = time * 1000;
        milliseconds = milliseconds.toFixed();
        return this.textDivs.timeText.innerHTML = "" + milliseconds + "ms";
      } else {
        minutes = Math.floor(time / 60);
        seconds = String(time % 60);
        if (seconds.length === 1) {
          seconds = '0' + seconds;
        }
        return this.textDivs.timeText.innerHTML = "" + minutes + ":" + seconds;
      }
    };

    Stopwatch.prototype.setTitles = function(title, subtitle) {
      this.textDivs.titleText.innerHTML = title;
      if (subtitle) {
        return this.textDivs.subtitleText.innerHTML = subtitle;
      }
    };

    Stopwatch.prototype.animate = function() {
      var duration;
      if (this.getMinutes() > 0) {
        duration = this.animationDuration / ((this.getMinutes() + 2) * 0.75);
        return this.animateClocks(this.time, duration, [this.outerClockDivs].concat(this.innerClocksDivs));
      } else {
        return this.animateClocks(this.time, this.animationDuration, [this.outerClockDivs]);
      }
    };

    Stopwatch.prototype.animateClocks = function(time, duration, clocksDivs) {
      var currentMinute, ease, endAt, endTime, minutes, requestAnimFrame, requestAnimFrameListener, secondsInCurrentMinute, self, setAnimationVars, showPie, startAt, startTime;
      self = this;
      this.animationComplete = false;
      secondsInCurrentMinute = 0;
      showPie = false;
      startAt = 0;
      endAt = 0;
      startTime = 0;
      endTime = 0;
      ease = false;
      currentMinute = 0;
      minutes = Math.floor(time / 60);
      requestAnimFrameListener = function() {
        var currentPercentage, currentPercentageOfNotch, currentTime;
        self.animationInProgress = true;
        currentTime = new Date().getTime();
        currentPercentage = self.getAnimationProgress(startAt, endAt, startTime, currentTime, endTime, ease);
        if (currentPercentage > 100) {
          currentPercentage = 100;
        }
        if (self.averageTime) {
          currentPercentageOfNotch = self.getAnimationProgress(startAt, self.averageTime, startTime, currentTime, endTime, ease);
          self.rotateNotch(currentPercentageOfNotch);
        } else {
          self.hideElement(self.topLevelDivs.notch);
        }
        if (currentMinute < clocksDivs.length) {
          self.setRotation(currentPercentage, clocksDivs[currentMinute], showPie);
        }
        if (self.displayMilliseconds) {
          self.setTimeText(currentPercentage * 0.6);
        } else {
          self.setTimeText(60 * currentMinute + Math.round(currentPercentage * 0.6));
        }
        if (currentTime < endTime) {
          return requestAnimFrame(function() {
            return requestAnimFrameListener();
          });
        } else if (time > 60) {
          time -= 60;
          currentMinute++;
          setAnimationVars();
          return requestAnimFrame(function() {
            return requestAnimFrameListener();
          });
        } else {
          return self.animationComplete = true;
        }
      };
      setAnimationVars = function() {
        if (time > 60) {
          secondsInCurrentMinute = 60;
          showPie = false;
        } else {
          secondsInCurrentMinute = time;
          showPie = true;
        }
        if (currentMinute === minutes) {
          ease = true;
        }
        startAt = 0;
        endAt = secondsInCurrentMinute * 100 / 60;
        startTime = new Date().getTime();
        return endTime = startTime + duration;
      };
      requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          return window.setTimeout(callback, 1000 / 60);
        };
      })();
      return setInterval((function(_this) {
        return function() {
          if (document.hasFocus() && !_this.animationComplete && !_this.animationInProgress) {
            setAnimationVars();
            return requestAnimFrameListener();
          }
        };
      })(this), 60);
    };

    Stopwatch.prototype.getAnimationProgress = function(startAt, endAt, startTime, currentTime, endTime, ease) {
      var change, progress;
      change = endAt - startAt;
      progress = (currentTime - startTime) / (endTime - startTime);
      if (ease) {
        return change * (--progress * progress * progress + 1) + startAt;
      } else {
        return change * progress + startAt;
      }
    };

    Stopwatch.prototype.setRotation = function(percentage, clockDivs, showPie) {
      var angle, circleColorClass, pieColorClass;
      angle = 3.6 * percentage;
      if (angle < 270) {
        this.hideElement(clockDivs.circleColorFix);
        this.hideElement(clockDivs.pieColorFix);
      } else {
        this.showElement(clockDivs.circleColorFix);
        if (showPie) {
          this.showElement(clockDivs.pieColorFix);
        }
      }
      circleColorClass = 'pillow-stopwatch-circle pillow-stopwatch-circle-colored' + this.comparedToAverageClass;
      pieColorClass = 'pillow-stopwatch-pie pillow-stopwatch-pie-colored' + this.comparedToAverageClass;
      switch (false) {
        case !(angle > 270):
          clockDivs.circleColor.className = circleColorClass + ' pillow-stopwatch-full';
          if (showPie) {
            clockDivs.pieColor.className = pieColorClass + ' pillow-stopwatch-full';
          }
          break;
        case !(angle > 180):
          clockDivs.circleColor.className = circleColorClass + ' pillow-stopwatch-three-quarters';
          if (showPie) {
            clockDivs.pieColor.className = pieColorClass + ' pillow-stopwatch-three-quarters';
          }
          break;
        case !(angle > 90):
          clockDivs.circleColor.className = circleColorClass + ' pillow-stopwatch-half';
          if (showPie) {
            clockDivs.pieColor.className = pieColorClass + ' pillow-stopwatch-half';
          }
          break;
        default:
          clockDivs.circleColor.className = circleColorClass + ' pillow-stopwatch-quarter';
          if (showPie) {
            clockDivs.pieColor.className = pieColorClass + ' pillow-stopwatch-quarter';
          }
      }
      angle += 45;
      this.rotateElement(clockDivs.circleCutter, angle);
      if (showPie) {
        return this.rotateElement(clockDivs.pieGrey, angle);
      }
    };

    Stopwatch.prototype.rotateNotch = function(time) {
      var angle, percentage;
      percentage = time * 100 / 60;
      angle = 360 * percentage / 100;
      return this.rotateElement(this.topLevelDivs.notch, angle);
    };

    Stopwatch.prototype.hideElement = function(element) {
      return element.style.visibility = 'hidden';
    };

    Stopwatch.prototype.showElement = function(element) {
      return element.style.visibility = 'visible';
    };

    Stopwatch.prototype.rotateElement = function(element, angle) {
      var value;
      value = 'rotate(' + angle + 'deg)';
      element.style.webkitTransform = value;
      element.style.MozTransform = value;
      element.style.msTransform = value;
      element.style.OTransform = value;
      return element.style.transform = value;
    };

    return Stopwatch;

  })();

  module.exports = Stopwatch;

}).call(this);

},{}],18:[function(require,module,exports){
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

},{"./chart_abstract":4}],19:[function(require,module,exports){

},{}],20:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.0.1 - JavaScript Vector Library                           │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

// ┌──────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.0 - JavaScript Events Library                                                │ \\
// ├──────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)          │ \\
// │ Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license. │ \\
// └──────────────────────────────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.0",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    
        eve = function (name, scope) {
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            stop = oldstop;
                            return out;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                stop = oldstop;
                                return out;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        stop = oldstop;
                        return out;
                    }
                }
            }
            stop = oldstop;
            return out.length ? out : null;
        };
    
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    
    eve.on = function (name, f) {
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            !e[names[i]] && (e[names[i]] = {n: {}});
            e = e[names[i]];
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    
    eve.stop = function () {
        stop = 1;
    };
    
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    
    eve.unbind = function (name, f) {
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    
    eve.once = function (name, f) {
        var f2 = function () {
            f.apply(this, arguments);
            eve.unbind(name, f2);
        };
        return eve.on(name, f2);
    };
    
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    //(typeof module != "undefined" && module.exports) ? (module.exports = eve) : (glob.eve = eve);
    glob.eve = eve;
})(window);

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.0.1" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
(function () {
    
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.0.1";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            
            
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in g.doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        commaSpaces = /\s*,\s*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig,
        tCommand = /([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    
    R.type = "SVG";
    
    R.svg = true;
    R._Paper = Paper;
    
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    
    
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    
    R.setWindow = function (newwin) {
        eve("setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
        var i = g.doc.createElement("i");
        i.title = "Rapha\xebl Colour Picker";
        i.style.display = "none";
        g.doc.body.appendChild(i);
        toHex = cacher(function (color) {
            i.style.color = color;
            return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
        });
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    },
    prepareRGB = function (r, g, b) {
        if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (g == null && R.is(r, string)) {
            var clr = R.getRGB(r);
            r = clr.r;
            g = clr.g;
            b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }
        
        return [r, g, b];
    },
    packageRGB = function (r, g, b, o) {
        r *= 255;
        g *= 255;
        b *= 255;
        var rgb = {
            r: r,
            g: g,
            b: b,
            hex: R.rgb(r, g, b),
            toString: rgbtoString
        };
        R.is(o, "finite") && (rgb.opacity = o);
        return rgb;
    };
    
    
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4
            );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
             M == r ? (g - b) / C :
             M == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
             L < .5 ? C / (2 * L) :
                      C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };
    
    function clrToString() {
        return this.hex;
    }

    
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 > i; i += 2) {
            var p = [{x: +crp[i],     y: +crp[i + 1]},
                     {x: +crp[i],     y: +crp[i + 1]},
                     {x: +crp[i + 2], y: +crp[i + 3]},
                     {x: +crp[i + 4], y: +crp[i + 5]}];
            if (iLen - 4 == i) {
                p[0] = {x: +crp[i - 2], y: +crp[i - 1]};
                p[3] = p[2];
            } else if (i) {
                p[0] = {x: +crp[i - 2], y: +crp[i - 1]};
            }
            d.push(["C",
                (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                (p[1].x + 6 * p[2].x - p[3].x) / 6,
                (p[1].y + 6*p[2].y - p[3].y) / 6,
                p[2].x,
                p[2].y
            ]);
        }

        return d;
    }
    
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        return data;
    });
    
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    R._removedFactory = function (methodname) {
        return function () {
            throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
        };
    };
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }, null, function (o) {
        return {
            x: o.x,
            y: o.y,
            width: o.width,
            height: o.height
        };
    }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray.length; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i].length; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = R._pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                    ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    
    R.pathToRelative = pathToRelative;
    R._engine = {};
    
    R.path2curve = path2curve;
    
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
                "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx && s.dy ? "t" + [s.dx, s.dy] : E) + 
                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                        (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }
 
    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (g.doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                    f = function (e) {
                        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                            x = e.clientX + scrollX,
                            y = e.clientY + scrollY;
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e, x, y);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (g.doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || g.win.event;
                    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                        scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                        x = e.clientX + scrollX,
                        y = e.clientY + scrollY;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e, x, y);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            var node = dragi.el.node,
                o,
                next = node.nextSibling,
                parent = node.parentNode,
                display = node.style.display;
            g.win.opera && parent.removeChild(node);
            node.style.display = "none";
            o = dragi.el.paper.getElementByPoint(x, y);
            node.style.display = display;
            g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
            o && eve("drag.over." + dragi.el.id, dragi.el, o);
            x += scrollX;
            y += scrollY;
            eve("drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            eve("drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    },
    
    elproto = R.el = {};
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events,
                    l = events.length;
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    
    
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("data.set." + this.id, this, value, key);
        return this;
    };
    
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
    
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        function start(e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("drag.start." + this.id, onstart);
            onmove && eve.on("drag.move." + this.id, onmove);
            onend && eve.on("drag.end." + this.id, onend);
            eve("drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
    
    elproto.onDragOver = function (f) {
        f ? eve.on("drag.over." + this.id, f) : eve.unbind("drag.over." + this.id);
    };
    
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
    };
    
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    
    
    paperproto.top = paperproto.bottom = null;
    
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };
    
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
            width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
            fill: glow.fill || false,
            opacity: glow.opacity || .5,
            offsetx: glow.offsetx || 0,
            offsety: glow.offsety || 0,
            color: glow.color || "#000"
        },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        var len = 0,
            precision = 100,
            name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
            cache = curveslengths[name],
            old, dot;
        !cache && (curveslengths[name] = cache = {data: []});
        cache.timer && clearTimeout(cache.timer);
        cache.timer = setTimeout(function () {delete curveslengths[name];}, 2e3);
        if (length != null && !cache.precision) {
            var total = getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
            cache.precision = ~~total * 10;
            cache.data = [];
        }
        precision = cache.precision || precision;
        for (var i = 0; i < precision + 1; i++) {
            if (cache.data[i * precision]) {
                dot = cache.data[i * precision];
            } else {
                dot = R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
                cache.data[i * precision] = dot;
            }
            i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
            if (length != null && len >= length) {
                return dot;
            }
            old = dot;
        }
        if (length == null) {
            return len;
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p.shift() + p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    
    R.getTotalLength = getTotalLength;
    
    R.getPointAtLength = getPointAtLength;
    
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        return R.getSubpath(this.attrs.path, from, to);
    };
    
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function (callback) {
                               setTimeout(callback, 16);
                           },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("anim.frame." + el.id, el, a);
                            eve("anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    
    elproto.animateWith = function (element, anim, params, ms, easing, callback) {
        var a = params ? R.animation(params, ms, easing, callback) : anim,
            status = element.status(anim);
        return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("anim.frame." + this.id, f) : eve.unbind("anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    
    Animation.prototype.repeat = function (times) { 
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.e - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("anim.start." + element.id, element, anim);
    }
    
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
        this.items = [];
        this.length = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                    this[this.items.length] = this.items[this.items.length] = items[i];
                    this.length++;
                }
            }
        }
    },
    setproto = Set.prototype;
    
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim);
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            w.push(box.x + box.width);
            h.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
    setproto.clone = function (s) {
        s = new Set;
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var out = this.set(),
            letters = Str(string)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, string) && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                curr && curr.d && out.push(this.path(curr.d).attr({
                    fill: "#000",
                    stroke: "none",
                    transform: [["t", shift * scale, 0]]
                }));
            }
            out.transform(["...s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
        }
        return out;
    };

    
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);
    
    eve.on("DOMload", function () {
        loaded = true;
    });
    
    if (typeof module != 'undefined' && module.exports) module.exports = R;
})();


// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
window.Raphael.svg && function (R) {
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        separator = /[, ]+/,
        eve = R.eve,
        E = "",
        S = " ";
    var xlink = "http://www.w3.org/1999/xlink",
        markers = {
            block: "M5,0 0,2.5 5,5z",
            classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
            diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
            open: "M6,1 1,3.5 6,6",
            oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
        },
        markerCounter = {};
    R.toString = function () {
        return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
    };
    var $ = function (el, attr) {
        if (attr) {
            if (typeof el == "string") {
                el = $(el);
            }
            for (var key in attr) if (attr[has](key)) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                } else {
                    el.setAttribute(key, Str(attr[key]));
                }
            }
        } else {
            el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
        }
        return el;
    },
    addGradientFill = function (element, gradient) {
        var type = "linear",
            id = element.id + gradient,
            fx = .5, fy = .5,
            o = element.node,
            SVG = element.paper,
            s = o.style,
            el = R._g.doc.getElementById(id);
        if (!el) {
            gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient.split(/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = R._parseDots(gradient);
            if (!dots) {
                return null;
            }
            id = id.replace(/[\(\)\s,\xb0#]/g, "_");
            
            if (element.gradient && id != element.gradient.id) {
                SVG.defs.removeChild(element.gradient);
                delete element.gradient;
            }

            if (!element.gradient) {
                el = $(type + "Gradient", {id: id});
                element.gradient = el;
                $(el, type == "radial" ? {
                    fx: fx,
                    fy: fy
                } : {
                    x1: vector[0],
                    y1: vector[1],
                    x2: vector[2],
                    y2: vector[3],
                    gradientTransform: element.matrix.invert()
                });
                SVG.defs.appendChild(el);
                for (var i = 0, ii = dots.length; i < ii; i++) {
                    el.appendChild($("stop", {
                        offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                        "stop-color": dots[i].color || "#fff"
                    }));
                }
            }
        }
        $(o, {
            fill: "url(#" + id + ")",
            opacity: 1,
            "fill-opacity": 1
        });
        s.fill = E;
        s.opacity = 1;
        s.fillOpacity = 1;
        return 1;
    },
    updatePosition = function (o) {
        var bbox = o.getBBox(1);
        $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    },
    addArrow = function (o, value, isEnd) {
        if (o.type == "path") {
            var values = Str(value).toLowerCase().split("-"),
                p = o.paper,
                se = isEnd ? "end" : "start",
                node = o.node,
                attrs = o.attrs,
                stroke = attrs["stroke-width"],
                i = values.length,
                type = "classic",
                from,
                to,
                dx,
                refX,
                attr,
                w = 3,
                h = 3,
                t = 5;
            while (i--) {
                switch (values[i]) {
                    case "block":
                    case "classic":
                    case "oval":
                    case "diamond":
                    case "open":
                    case "none":
                        type = values[i];
                        break;
                    case "wide": h = 5; break;
                    case "narrow": h = 2; break;
                    case "long": w = 5; break;
                    case "short": w = 2; break;
                }
            }
            if (type == "open") {
                w += 2;
                h += 2;
                t += 2;
                dx = 1;
                refX = isEnd ? 4 : 1;
                attr = {
                    fill: "none",
                    stroke: attrs.stroke
                };
            } else {
                refX = dx = w / 2;
                attr = {
                    fill: attrs.stroke,
                    stroke: "none"
                };
            }
            if (o._.arrows) {
                if (isEnd) {
                    o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                    o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                } else {
                    o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                    o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                }
            } else {
                o._.arrows = {};
            }
            if (type != "none") {
                var pathId = "raphael-marker-" + type,
                    markerId = "raphael-marker-" + se + type + w + h;
                if (!R._g.doc.getElementById(pathId)) {
                    p.defs.appendChild($($("path"), {
                        "stroke-linecap": "round",
                        d: markers[type],
                        id: pathId
                    }));
                    markerCounter[pathId] = 1;
                } else {
                    markerCounter[pathId]++;
                }
                var marker = R._g.doc.getElementById(markerId),
                    use;
                if (!marker) {
                    marker = $($("marker"), {
                        id: markerId,
                        markerHeight: h,
                        markerWidth: w,
                        orient: "auto",
                        refX: refX,
                        refY: h / 2
                    });
                    use = $($("use"), {
                        "xlink:href": "#" + pathId,
                        transform: (isEnd ? " rotate(180 " + w / 2 + " " + h / 2 + ") " : S) + "scale(" + w / t + "," + h / t + ")",
                        "stroke-width": 1 / ((w / t + h / t) / 2)
                    });
                    marker.appendChild(use);
                    p.defs.appendChild(marker);
                    markerCounter[markerId] = 1;
                } else {
                    markerCounter[markerId]++;
                    use = marker.getElementsByTagName("use")[0];
                }
                $(use, attr);
                var delta = dx * (type != "diamond" && type != "oval");
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - delta * stroke;
                } else {
                    from = delta * stroke;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                attr = {};
                attr["marker-" + se] = "url(#" + markerId + ")";
                if (to || from) {
                    attr.d = Raphael.getSubpath(attrs.path, from, to);
                }
                $(node, attr);
                o._.arrows[se + "Path"] = pathId;
                o._.arrows[se + "Marker"] = markerId;
                o._.arrows[se + "dx"] = delta;
                o._.arrows[se + "Type"] = type;
                o._.arrows[se + "String"] = value;
            } else {
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - from;
                } else {
                    from = 0;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                o._.arrows[se + "Path"] && $(node, {d: Raphael.getSubpath(attrs.path, from, to)});
                delete o._.arrows[se + "Path"];
                delete o._.arrows[se + "Marker"];
                delete o._.arrows[se + "dx"];
                delete o._.arrows[se + "Type"];
                delete o._.arrows[se + "String"];
            }
            for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                var item = R._g.doc.getElementById(attr);
                item && item.parentNode.removeChild(item);
            }
        }
    },
    dasharray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
    },
    addDashes = function (o, value, params) {
        value = dasharray[Str(value).toLowerCase()];
        if (value) {
            var width = o.attrs["stroke-width"] || "1",
                butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                dashes = [],
                i = value.length;
            while (i--) {
                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
            }
            $(o.node, {"stroke-dasharray": dashes.join(",")});
        }
    },
    setFillAndStroke = function (o, params) {
        var node = o.node,
            attrs = o.attrs,
            vis = node.style.visibility;
        node.style.visibility = "hidden";
        for (var att in params) {
            if (params[has](att)) {
                if (!R._availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "blur":
                        o.blur(value);
                        break;
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        if (att == "target" && value == "blank") {
                            pn.setAttributeNS(xlink, "show", "new");
                        } else {
                            pn.setAttributeNS(xlink, att, value);
                        }
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "transform":
                        o.transform(value);
                        break;
                    case "arrow-start":
                        addArrow(o, value);
                        break;
                    case "arrow-end":
                        addArrow(o, value, 1);
                        break;
                    case "clip-rect":
                        var rect = Str(value).split(separator);
                        if (rect.length == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = R.createUUID();
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el.appendChild(rc);
                            o.paper.defs.appendChild(el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var path = node.getAttribute("clip-path");
                            if (path) {
                                var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        }
                    break;
                    case "path":
                        if (o.type == "path") {
                            $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                            o._.dirty = 1;
                            if (o._.arrows) {
                                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                            }
                        }
                        break;
                    case "width":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node.setAttribute(att, value);
                        }
                        o._.dirty = 1;
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        if (o._.sx != 1 || o._.sy != 1) {
                            value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                        }
                        if (o.paper._vbSize) {
                            value *= o.paper._vbSize;
                        }
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"], params);
                        }
                        if (o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value, params);
                        break;
                    case "fill":
                        var isURL = Str(value).match(R._ISURL);
                        if (isURL) {
                            el = $("pattern");
                            var ig = $("image");
                            el.id = R.createUUID();
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                            el.appendChild(ig);

                            (function (el) {
                                R._preload(isURL[1], function () {
                                    var w = this.offsetWidth,
                                        h = this.offsetHeight;
                                    $(el, {width: w, height: h});
                                    $(ig, {width: w, height: h});
                                    o.paper.safari();
                                });
                            })(el);
                            o.paper.defs.appendChild(el);
                            node.style.fill = "url(#" + el.id + ")";
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        var clr = R.getRGB(value);
                        if (!clr.error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                            if ("opacity" in attrs || "fill-opacity" in attrs) {
                                var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                }
                            }
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                        clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                    case "stroke":
                        clr = R.getRGB(value);
                        node.setAttribute(att, clr.hex);
                        att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        if (att == "stroke" && o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "gradient":
                        (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                        break;
                    case "opacity":
                        if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                            $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                        }
                        // fall
                    case "fill-opacity":
                        if (attrs.gradient) {
                            gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                            if (gradient) {
                                stops = gradient.getElementsByTagName("stop");
                                $(stops[stops.length - 1], {"stop-opacity": value});
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        o._.dirty = 1;
                        node.setAttribute(att, value);
                        break;
                }
            }
        }

        tuneText(o, params);
        node.style.visibility = vis;
    },
    leading = 1.2,
    tuneText = function (el, params) {
        if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
            return;
        }
        var a = el.attrs,
            node = el.node,
            fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

        if (params[has]("text")) {
            a.text = params.text;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var texts = Str(params.text).split("\n"),
                tspans = [],
                tspan;
            for (var i = 0, ii = texts.length; i < ii; i++) {
                tspan = $("tspan");
                i && $(tspan, {dy: fontSize * leading, x: a.x});
                tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                node.appendChild(tspan);
                tspans[i] = tspan;
            }
        } else {
            tspans = node.getElementsByTagName("tspan");
            for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                $(tspans[i], {dy: fontSize * leading, x: a.x});
            } else {
                $(tspans[0], {dy: 0});
            }
        }
        $(node, {x: a.x, y: a.y});
        el._.dirty = 1;
        var bb = el._getBBox(),
            dif = a.y - (bb.y + bb.height / 2);
        dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
    },
    Element = function (node, svg) {
        var X = 0,
            Y = 0;
        
        this[0] = this.node = node;
        
        node.raphael = true;
        
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.matrix = R.matrix();
        this.realPath = null;
        
        this.paper = svg;
        this.attrs = this.attrs || {};
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            deg: 0,
            dx: 0,
            dy: 0,
            dirty: 1
        };
        !svg.bottom && (svg.bottom = this);
        
        this.prev = svg.top;
        svg.top && (svg.top.next = this);
        svg.top = this;
        
        this.next = null;
    },
    elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;

    R._engine.path = function (pathString, SVG) {
        var el = $("path");
        SVG.canvas && SVG.canvas.appendChild(el);
        var p = new Element(el, SVG);
        p.type = "path";
        setFillAndStroke(p, {
            fill: "none",
            stroke: "#000",
            path: pathString
        });
        return p;
    };
    
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        return this;
    };
    
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    
    elproto.transform = function (tstr) {
        var _ = this._;
        if (tstr == null) {
            return _.transform;
        }
        R._extractTransform(this, tstr);

        this.clip && $(this.clip, {transform: this.matrix.invert()});
        this.pattern && updatePosition(this);
        this.node && $(this.node, {transform: this.matrix});
    
        if (_.sx != 1 || _.sy != 1) {
            var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
            this.attr({"stroke-width": sw});
        }

        return this;
    };
    
    elproto.hide = function () {
        !this.removed && this.paper.safari(this.node.style.display = "none");
        return this;
    };
    
    elproto.show = function () {
        !this.removed && this.paper.safari(this.node.style.display = "");
        return this;
    };
    
    elproto.remove = function () {
        if (this.removed) {
            return;
        }
        var paper = this.paper;
        paper.__set__ && paper.__set__.exclude(this);
        eve.unbind("*.*." + this.id);
        if (this.gradient) {
            paper.defs.removeChild(this.gradient);
        }
        R._tear(this, paper);
        this.node.parentNode.removeChild(this.node);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto._getBBox = function () {
        if (this.node.style.display == "none") {
            this.show();
            var hide = true;
        }
        var bbox = {};
        try {
            bbox = this.node.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || {};
        }
        hide && this.hide();
        return bbox;
    };
    
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            if (name == "transform") {
                return this._.transform;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        if (value != null) {
            var params = {};
            params[name] = value;
        } else if (name != null && R.is(name, "object")) {
            params = name;
        }
        for (var key in params) {
            eve("attr." + key + "." + this.id, this, params[key]);
        }
        for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) if (par[has](subkey)) {
                params[subkey] = par[subkey];
            }
        }
        setFillAndStroke(this, params);
        return this;
    };
    
    elproto.toFront = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.appendChild(this.node.parentNode);
        } else {
            this.node.parentNode.appendChild(this.node);
        }
        var svg = this.paper;
        svg.top != this && R._tofront(this, svg);
        return this;
    };
    
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        var parent = this.node.parentNode;
        if (parent.tagName.toLowerCase() == "a") {
            parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
        } else if (parent.firstChild != this.node) {
            parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
        R._toback(this, this.paper);
        var svg = this.paper;
        return this;
    };
    
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[element.length - 1].node;
        if (node.nextSibling) {
            node.parentNode.insertBefore(this.node, node.nextSibling);
        } else {
            node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[0].node;
        node.parentNode.insertBefore(this.node, node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        // Experimental. No Safari support. Use it on your own risk.
        var t = this;
        if (+size !== 0) {
            var fltr = $("filter"),
                blur = $("feGaussianBlur");
            t.attrs.blur = size;
            fltr.id = R.createUUID();
            $(blur, {stdDeviation: +size || 1.5});
            fltr.appendChild(blur);
            t.paper.defs.appendChild(fltr);
            t._blur = fltr;
            $(t.node, {filter: "url(#" + fltr.id + ")"});
        } else {
            if (t._blur) {
                t._blur.parentNode.removeChild(t._blur);
                delete t._blur;
                delete t.attrs.blur;
            }
            t.node.removeAttribute("filter");
        }
    };
    R._engine.circle = function (svg, x, y, r) {
        var el = $("circle");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
        res.type = "circle";
        $(el, res.attrs);
        return res;
    };
    R._engine.rect = function (svg, x, y, w, h, r) {
        var el = $("rect");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
        res.type = "rect";
        $(el, res.attrs);
        return res;
    };
    R._engine.ellipse = function (svg, x, y, rx, ry) {
        var el = $("ellipse");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
        res.type = "ellipse";
        $(el, res.attrs);
        return res;
    };
    R._engine.image = function (svg, src, x, y, w, h) {
        var el = $("image");
        $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
        el.setAttributeNS(xlink, "href", src);
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, src: src};
        res.type = "image";
        return res;
    };
    R._engine.text = function (svg, x, y, text) {
        var el = $("text");
        // $(el, {x: x, y: y, "text-anchor": "middle"});
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {
            x: x,
            y: y,
            "text-anchor": "middle",
            text: text,
            font: R._availableAttrs.font,
            stroke: "none",
            fill: "#000"
        };
        res.type = "text";
        setFillAndStroke(res, res.attrs);
        return res;
    };
    R._engine.setSize = function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this._viewBox) {
            this.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con && con.container,
            x = con.x,
            y = con.y,
            width = con.width,
            height = con.height;
        if (!container) {
            throw new Error("SVG container not found.");
        }
        var cnvs = $("svg"),
            css = "overflow:hidden;",
            isFloating;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        $(cnvs, {
            height: height,
            version: 1.1,
            width: width,
            xmlns: "http://www.w3.org/2000/svg"
        });
        if (container == 1) {
            cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
            R._g.doc.body.appendChild(cnvs);
            isFloating = 1;
        } else {
            cnvs.style.cssText = css + "position:relative";
            if (container.firstChild) {
                container.insertBefore(cnvs, container.firstChild);
            } else {
                container.appendChild(cnvs);
            }
        }
        container = new R._Paper;
        container.width = width;
        container.height = height;
        container.canvas = cnvs;
        // plugins.call(container, container, R.fn);
        container.clear();
        container._left = container._top = 0;
        isFloating && (container.renderfix = function () {});
        container.renderfix();
        return container;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        eve("setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var size = mmax(w / this.width, h / this.height),
            top = this.top,
            aspectRatio = fit ? "meet" : "xMinYMin",
            vb,
            sw;
        if (x == null) {
            if (this._vbSize) {
                size = 1;
            }
            delete this._vbSize;
            vb = "0 0 " + this.width + S + this.height;
        } else {
            this._vbSize = size;
            vb = x + S + y + S + w + S + h;
        }
        $(this.canvas, {
            viewBox: vb,
            preserveAspectRatio: aspectRatio
        });
        while (size && top) {
            sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
            top.attr({"stroke-width": sw});
            top._.dirty = 1;
            top._.dirtyT = 1;
            top = top.prev;
        }
        this._viewBox = [x, y, w, h, !!fit];
        return this;
    };
    
    R.prototype.renderfix = function () {
        var cnvs = this.canvas,
            s = cnvs.style,
            pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix(),
            left = -pos.e % 1,
            top = -pos.f % 1;
        if (left || top) {
            if (left) {
                this._left = (this._left + left) % 1;
                s.left = this._left + "px";
            }
            if (top) {
                this._top = (this._top + top) % 1;
                s.top = this._top + "px";
            }
        }
    };
    
    R.prototype.clear = function () {
        R.eve("clear", this);
        var c = this.canvas;
        while (c.firstChild) {
            c.removeChild(c.firstChild);
        }
        this.bottom = this.top = null;
        (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
        c.appendChild(this.desc);
        c.appendChild(this.defs = $("defs"));
    };
    
    R.prototype.remove = function () {
        eve("remove", this);
        this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
    };
    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
}(window.Raphael);
},{}]},{},[9])