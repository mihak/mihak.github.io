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
