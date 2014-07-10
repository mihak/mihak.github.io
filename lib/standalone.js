(function() {
  var BarChart, ColumnChart, CookieChart, DonutChart, FilmstripChart, GaugeChart, LineChart, PieChart, SemicircleGaugeChart, SparklineChart, StackableAreaChart, Stopwatch, TubeChart;

  PieChart = require('./pie_chart');

  DonutChart = require('./donut_chart');

  BarChart = require('./bar_chart');

  TubeChart = require('./tube_chart');

  GaugeChart = require('./gauge_chart');

  SemicircleGaugeChart = require('./semicircle_gauge_chart');

  FilmstripChart = require('./filmstrip_chart');

  ColumnChart = require('./column_chart');

  LineChart = require('./line_chart');

  StackableAreaChart = require('./stackable_area_chart');

  SparklineChart = require('./sparkline_chart');

  CookieChart = require('./cookie_chart');

  Stopwatch = require('./stopwatch');

  window.pillow = {
    PieChart: PieChart,
    DonutChart: DonutChart,
    BarChart: BarChart,
    TubeChart: TubeChart,
    GaugeChart: GaugeChart,
    SemicircleGaugeChart: SemicircleGaugeChart,
    FilmstripChart: FilmstripChart,
    ColumnChart: ColumnChart,
    LineChart: LineChart,
    StackableAreaChart: StackableAreaChart,
    SparklineChart: SparklineChart,
    CookieChart: CookieChart,
    Stopwatch: Stopwatch
  };

}).call(this);
