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
