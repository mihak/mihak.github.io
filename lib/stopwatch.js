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
