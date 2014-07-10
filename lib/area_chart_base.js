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
      var _ref, _ref1, _ref2;
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
      if (this.layout.highlightDataPointAreaOnMouseover && ((_ref2 = this.data.series[0]) != null ? _ref2.length : void 0) > 1) {
        $(this.el).mousemove((function(_this) {
          return function(e) {
            var multiplier, offset, paddingBottom, paddingLeft, paddingTop, width, x, xCoordinateFromMousePointer, xMax, xMin, y, _ref3, _ref4;
            offset = _this.el.offset();
            x = e.pageX - offset.left;
            y = e.pageY - offset.top;
            width = _this.width;
            paddingLeft = _this.padding.left;
            if (_this.data.range == null) {
              _this._calculateRanges();
            }
            xMin = _this.data.range.x.min;
            xMax = _this.data.range.x.max;
            multiplier = (width - 2 * paddingLeft) / (xMax - xMin);
            xCoordinateFromMousePointer = Math.round(x / multiplier - paddingLeft / multiplier + xMin);
            paddingTop = ((_ref3 = _this.backgroundPadding) != null ? _ref3.top : void 0) ? _this.backgroundPadding.top : 0;
            paddingBottom = ((_ref4 = _this.backgroundPadding) != null ? _ref4.bottom : void 0) ? _this.backgroundPadding.bottom : 0;
            if (xCoordinateFromMousePointer >= xMin && xCoordinateFromMousePointer < xMax && y >= paddingTop && y <= _this.height - paddingBottom) {
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
      var i, padding, pointInHighlightedArea, _i, _j, _len, _ref, _ref1;
      if (this._isPointOnHighlightedArea(xCoordinate)) {
        return;
      } else {
        if (!this.highlightAreas) {
          this._calculateHighlightAreas();
        }
        for (i = _i = 0, _ref = this.highlightAreas.length - 2; _i <= _ref; i = _i += 1) {
          if (xCoordinate >= this.highlightAreas[i]) {
            this.currentHighlightedArea = [this.highlightAreas[i], this.highlightAreas[i + 1]];
          }
        }
      }
      if (this.highlightedArea) {
        this.highlightedArea.remove();
        this.highlightedArea = null;
      }
      pointInHighlightedArea = this._mapCoordinatesToScreen({
        x: this._getXCoordinateFromPointInHighlightedArea(),
        y: 0
      });
      padding = this.backgroundPadding;
      this.highlightedArea = this.paper.rect(pointInHighlightedArea.x - this.layout.highlightedAreaWidth / 2, padding.top, this.layout.highlightedAreaWidth, this.height - padding.top - padding.bottom).attr({
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
      var circleRadius, coords, currentVisibleBubbleYCoordinate, fillColor, index, o, opacity, p, pair, self, series, strokeWidth, _i, _len, _ref, _results;
      self = this;
      currentVisibleBubbleYCoordinate = null;
      _ref = this.data.series;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        series = _ref[index];
        if (series.length === 0) {
          continue;
        }
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
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
            if (this.layout.showAllDataPoints || this._isPointOnHighlightedArea(pair.x) || (!this.layout.showAllDataPoints && !this.layout.highlightDataPointAreaOnMouseover) || ((_ref1 = this.data.series[0]) != null ? _ref1.length : void 0) === 1) {
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
              if (this.layout.highlightDataPointAreaOnMouseover && series.length !== 1 && (!this.layout.showAllDataPoints || (this.layout.showAllDataPoints && this._isPointOnHighlightedArea(pair.x))) && ((currentVisibleBubbleYCoordinate == null) || coords.y < currentVisibleBubbleYCoordinate)) {
                self.drawBubbleForPoint(p.data('datapoint'));
                currentVisibleBubbleYCoordinate = coords.y;
              }
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

    AreaChartBase.prototype._getXCoordinateFromPointInHighlightedArea = function() {
      var s1, x, _i, _len, _ref;
      _ref = this.data.series[0];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s1 = _ref[_i];
        if (s1.x >= this.currentHighlightedArea[0] && s1.x <= this.currentHighlightedArea[1]) {
          x = s1.x;
        }
      }
      if (x) {
        return x;
      } else {
        return 0;
      }
    };

    return AreaChartBase;

  })(ChartBase);

  module.exports = AreaChartBase;

}).call(this);
