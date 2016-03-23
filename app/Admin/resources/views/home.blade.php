@extends('admin::layout')

@section('content')
    <div class="container-fluid container-cards-pf container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="card-pf card-pf-accented card-pf-aggregate-status card-pf-aggregate-status-mini">
                    <h2 class="card-pf-title">
                        <span class="fa fa-newspaper-o"></span>
                        <span class="card-pf-aggregate-status-count">{{ Flashtag\Data\Post::count() }}</span> Posts
                    </h2>
                    <div class="card-pf-body">
                        <p class="card-pf-aggregate-status-notifications">
                            <span class="card-pf-aggregate-status-notification">
                                <a href="{{ route('admin.posts.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Write new">
                                    <span class="pficon pficon-add-circle-o"></span>
                                </a>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="card-pf card-pf-accented card-pf-aggregate-status card-pf-aggregate-status-mini">
                    <h2 class="card-pf-title">
                        <span class="fa fa-columns"></span>
                        <span class="card-pf-aggregate-status-count">{{ Flashtag\Data\Category::count() }}</span> Categories
                    </h2>
                    <div class="card-pf-body">
                        <p class="card-pf-aggregate-status-notifications">
                            <span class="card-pf-aggregate-status-notification">
                                <a href="{{ route('admin.posts.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Write new">
                                    <span class="pficon pficon-add-circle-o"></span>
                                </a>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="card-pf card-pf-accented card-pf-aggregate-status card-pf-aggregate-status-mini">
                    <h2 class="card-pf-title">
                        <span class="fa fa-tags"></span>
                        <span class="card-pf-aggregate-status-count">{{ Flashtag\Data\Tag::count() }}</span> Tags
                    </h2>
                    <div class="card-pf-body">
                        <p class="card-pf-aggregate-status-notifications">
                            <span class="card-pf-aggregate-status-notification">
                                <a href="{{ route('admin.posts.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Write new">
                                    <span class="pficon pficon-add-circle-o"></span>
                                </a>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="card-pf card-pf-accented card-pf-aggregate-status card-pf-aggregate-status-mini">
                    <h2 class="card-pf-title">
                        <span class="fa fa-sticky-note-o"></span>
                        <span class="card-pf-aggregate-status-count">{{ Flashtag\Data\Page::count() }}</span> Pages
                    </h2>
                    <div class="card-pf-body">
                        <p class="card-pf-aggregate-status-notifications">
                            <span class="card-pf-aggregate-status-notification">
                                <a href="{{ route('admin.posts.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Write new">
                                    <span class="pficon pficon-add-circle-o"></span>
                                </a>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Most Viewed Posts -->
        <div class="row row-cards-pf">
            <div class="col-xs-12 col-sm-6">
                <div class="card-pf">
                    <div class="card-pf-heading">
                        <h2 class="card-pf-title">
                            Most Viewed Posts
                        </h2>
                    </div>
                    <div class="card-pf-body">
                        @foreach ($mostViewed as $post)
                            <?php $percent = number_format($post->views/$mostViews * 100); ?>
                            <div class="progress-description">
                                {{ $post->title }}
                            </div>
                            <div class="progress progress-label-top-right">
                                <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="{{ $post->views }}" aria-valuemin="0" aria-valuemax="{{ $mostViews }}" style="width: {{ $percent }}%;"  data-toggle="tooltip" title="{{ $post->views }} views">
                                    <span><strong>{{ $post->views }}</strong> Views</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6">
                <div class="card-pf">
                    <div class="card-pf-heading">
                        <h2 class="card-pf-title">
                            Least Viewed Posts
                        </h2>
                    </div>
                    <div class="card-pf-body">
                        @foreach ($leastViewed as $post)
                            <?php $percent = number_format($post->views/$leastViewed->max('views') * 100); ?>
                            <div class="progress-description">
                                {{ $post->title }}
                            </div>
                            <div class="progress progress-label-top-right">
                                <div class="progress-bar progress-bar-default" role="progressbar" aria-valuenow="{{ $post->views }}" aria-valuemin="0" aria-valuemax="{{ $leastViewed->max('views') }}" style="width: {{ $percent }}%;"  data-toggle="tooltip" title="{{ $post->views }} views">
                                    <span><strong>{{ $post->views }}</strong> Views</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-md-12">
                <div class="card-pf card-pf-utilization">
                    <div class="card-pf-heading">
                        <p class="card-pf-heading-details">Last 30 days</p>
                        <h2 class="card-pf-title">
                            Utilization
                        </h2>
                    </div>
                    <div class="card-pf-body">
                        <div class="row">
                            <div class="col-xs-12 col-sm-4 col-md-4">
                                <h3 class="card-pf-subtitle">CPU</h3>
                                <p class="card-pf-utilization-details">
                                    <span class="card-pf-utilization-card-details-count">50</span>
                                    <span class="card-pf-utilization-card-details-description">
                                        <span class="card-pf-utilization-card-details-line-1">Available</span>
                                        <span class="card-pf-utilization-card-details-line-2">of 1000 MHz</span>
                                    </span>
                                </p>
                                <div id="chart-pf-donut-1"></div>
                                <div class="chart-pf-sparkline" id="chart-pf-sparkline-1"></div>
                                <script>
                                var donutConfig = $().c3ChartDefaults().getDefaultDonutConfig('A');
                                donutConfig.bindto = '#chart-pf-donut-1';
                                donutConfig.color =  {
                                    pattern: ["#cc0000","#D1D1D1"]
                                };
                                donutConfig.data = {
                                    type: "donut",
                                    columns: [
                                        ["Used", 95],
                                        ["Available", 5]
                                    ],
                                    groups: [
                                        ["used", "available"]
                                    ],
                                    order: null
                                };
                                donutConfig.tooltip = {
                                    contents: function (d) {
                                        return '<span class="donut-tooltip-pf" style="white-space: nowrap;">' +
                                        Math.round(d[0].ratio * 100) + '%' + ' MHz ' + d[0].name +
                                        '</span>';
                                    }
                                };

                                var chart1 = c3.generate(donutConfig);
                                var donutChartTitle = d3.select("#chart-pf-donut-1").select('text.c3-chart-arcs-title');
                                donutChartTitle.text("");
                                donutChartTitle.insert('tspan').text("950").classed('donut-title-big-pf', true).attr('dy', 0).attr('x', 0);
                                donutChartTitle.insert('tspan').text("MHz Used").classed('donut-title-small-pf', true).attr('dy', 20).attr('x', 0);

                                var sparklineConfig = $().c3ChartDefaults().getDefaultSparklineConfig();
                                sparklineConfig.bindto = '#chart-pf-sparkline-1';
                                sparklineConfig.data = {
                                    columns: [
                                        ['%', 10, 50, 28, 20, 31, 27, 60, 36, 52, 55, 62, 68, 69, 88, 74, 88, 95],
                                    ],
                                    type: 'area'
                                };
                                var chart2 = c3.generate(sparklineConfig);
                                </script>
                            </div>
                            <div class="col-xs-12 col-sm-4 col-md-4">
                                <h3 class="card-pf-subtitle">Memory</h3>
                                <p class="card-pf-utilization-details">
                                    <span class="card-pf-utilization-card-details-count">256</span>
                                    <span class="card-pf-utilization-card-details-description">
                                        <span class="card-pf-utilization-card-details-line-1">Available</span>
                                        <span class="card-pf-utilization-card-details-line-2">of 432 GB</span>
                                    </span>
                                </p>
                                <div id="chart-pf-donut-2"></div>
                                <div class="chart-pf-sparkline" id="chart-pf-sparkline-2"></div>
                                <script>
                                var donutConfig = $().c3ChartDefaults().getDefaultDonutConfig('A');
                                donutConfig.bindto = '#chart-pf-donut-2';
                                donutConfig.color =  {
                                    pattern: ["#3f9c35","#D1D1D1"]
                                };
                                donutConfig.data = {
                                    type: "donut",
                                    columns: [
                                        ["Used", 41],
                                        ["Available", 59]
                                    ],
                                    groups: [
                                        ["used", "available"]
                                    ],
                                    order: null
                                };
                                donutConfig.tooltip = {
                                    contents: function (d) {
                                        return '<span class="donut-tooltip-pf" style="white-space: nowrap;">' +
                                        Math.round(d[0].ratio * 100) + '%' + ' GB ' + d[0].name +
                                        '</span>';
                                    }
                                };

                                var chart3 = c3.generate(donutConfig);
                                var donutChartTitle = d3.select("#chart-pf-donut-2").select('text.c3-chart-arcs-title');
                                donutChartTitle.text("");
                                donutChartTitle.insert('tspan').text("176").classed('donut-title-big-pf', true).attr('dy', 0).attr('x', 0);
                                donutChartTitle.insert('tspan').text("GB Used").classed('donut-title-small-pf', true).attr('dy', 20).attr('x', 0);

                                var sparklineConfig = $().c3ChartDefaults().getDefaultSparklineConfig();
                                sparklineConfig.bindto = '#chart-pf-sparkline-2';
                                sparklineConfig.data = {
                                    columns: [
                                        ['%', 35, 36, 20, 30, 31, 22, 44, 36, 40, 41, 55, 52, 48, 48, 50, 40, 41],
                                    ],
                                    type: 'area'
                                };
                                var chart4 = c3.generate(sparklineConfig);
                                </script>
                            </div>
                            <div class="col-xs-12 col-sm-4 col-md-4">
                                <h3 class="card-pf-subtitle">Network</h3>
                                <p class="card-pf-utilization-details">
                                    <span class="card-pf-utilization-card-details-count">200</span>
                                    <span class="card-pf-utilization-card-details-description">
                                        <span class="card-pf-utilization-card-details-line-1">Available</span>
                                        <span class="card-pf-utilization-card-details-line-2">of 1300 Gbps</span>
                                    </span>
                                </p>
                                <div id="chart-pf-donut-3"></div>
                                <div class="chart-pf-sparkline" id="chart-pf-sparkline-3"></div>
                                <script>
                                var donutConfig = $().c3ChartDefaults().getDefaultDonutConfig('A');
                                donutConfig.bindto = '#chart-pf-donut-3';
                                donutConfig.color =  {
                                    pattern: ["#EC7A08","#D1D1D1"]
                                };
                                donutConfig.data = {
                                    type: "donut",
                                    columns: [
                                        ["Used", 85],
                                        ["Available", 15]
                                    ],
                                    groups: [
                                        ["used", "available"]
                                    ],
                                    order: null
                                };
                                donutConfig.tooltip = {
                                    contents: function (d) {
                                        return '<span class="donut-tooltip-pf" style="white-space: nowrap;">' +
                                        Math.round(d[0].ratio * 100) + '%' + ' Gbps ' + d[0].name +
                                        '</span>';
                                    }
                                };

                                var chart5 = c3.generate(donutConfig);
                                var donutChartTitle = d3.select("#chart-pf-donut-3").select('text.c3-chart-arcs-title');
                                donutChartTitle.text("");
                                donutChartTitle.insert('tspan').text("1100").classed('donut-title-big-pf', true).attr('dy', 0).attr('x', 0);
                                donutChartTitle.insert('tspan').text("Gbps Used").classed('donut-title-small-pf', true).attr('dy', 20).attr('x', 0);

                                var sparklineConfig = $().c3ChartDefaults().getDefaultSparklineConfig();
                                sparklineConfig.bindto = '#chart-pf-sparkline-3';
                                sparklineConfig.data = {
                                    columns: [
                                        ['%', 60, 55, 70, 44, 31, 67, 54, 46, 58, 75, 62, 68, 69, 88, 74, 88, 85],
                                    ],
                                    type: 'area'
                                };
                                var chart6 = c3.generate(sparklineConfig);
                                </script>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div><!-- /row -->
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-xs-12 col-sm-4 col-md-4">
                <div class="card-pf card-pf-utilization">
                    <h2 class="card-pf-title">
                        Network
                    </h2>
                    <div class="card-pf-body">
                        <p class="card-pf-utilization-details">
                            <span class="card-pf-utilization-card-details-count">200</span>
                            <span class="card-pf-utilization-card-details-description">
                                <span class="card-pf-utilization-card-details-line-1">Available</span>
                                <span class="card-pf-utilization-card-details-line-2">of 1300 Gbps</span>
                            </span>
                        </p>
                        <div id="chart-pf-donut-4"></div>
                        <div class="chart-pf-sparkline" id="chart-pf-sparkline-4"></div>
                        <script>
                        var c3ChartDefaults = $().c3ChartDefaults();

                        var donutConfig = c3ChartDefaults.getDefaultDonutConfig('A');
                        donutConfig.bindto = '#chart-pf-donut-4';
                        donutConfig.color =  {
                            pattern: ["#EC7A08","#D1D1D1"]
                        };
                        donutConfig.data = {
                            type: "donut",
                            columns: [
                                ["Used", 85],
                                ["Available", 15]
                            ],
                            groups: [
                                ["used", "available"]
                            ],
                            order: null
                        };
                        donutConfig.tooltip = {
                            contents: function (d) {
                                return '<span class="donut-tooltip-pf" style="white-space: nowrap;">' +
                                Math.round(d[0].ratio * 100) + '%' + ' Gbps ' + d[0].name +
                                '</span>';
                            }
                        };

                        var chart1 = c3.generate(donutConfig);
                        var donutChartTitle = d3.select("#chart-pf-donut-4").select('text.c3-chart-arcs-title');
                        donutChartTitle.text("");
                        donutChartTitle.insert('tspan').text("1100").classed('donut-title-big-pf', true).attr('dy', 0).attr('x', 0);
                        donutChartTitle.insert('tspan').text("Gpbs Used").classed('donut-title-small-pf', true).attr('dy', 20).attr('x', 0);

                        var sparklineConfig = c3ChartDefaults.getDefaultSparklineConfig();
                        sparklineConfig.bindto = '#chart-pf-sparkline-4';
                        sparklineConfig.data = {
                            columns: [
                                ['%', 60, 55, 70, 44, 31, 67, 54, 46, 58, 75, 62, 68, 69, 88, 74, 88, 85],
                            ],
                            type: 'area'
                        };

                        var chart2 = c3.generate(sparklineConfig);
                        </script>
                    </div>
                </div>
            </div>

        </div><!-- /row -->
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-xs-12 col-sm-6 col-md-5">
                <div class="card-pf">
                    <div class="card-pf-heading">
                        <div class="dropdown card-pf-time-frame-filter">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                                Last 30 Days <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right" role="menu">
                                <li><a href="#">Last 60 Days</a></li>
                                <li><a href="#">Last 90 Days</a></li>
                            </ul>
                        </div>
                        <h2 class="card-pf-title">
                            Card Title
                        </h2>
                    </div>
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-7">
                <div class="card-pf">
                    <h2 class="card-pf-title">
                        Card Title
                    </h2>
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                    <div class="card-pf-footer">
                        <div class="dropdown card-pf-time-frame-filter">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                                Last 30 Days <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right" role="menu">
                                <li><a href="#">Last 60 Days</a></li>
                                <li><a href="#">Last 90 Days</a></li>
                            </ul>
                        </div>
                        <p>
                            <a href="#" class="card-pf-link-with-icon">
                                <span class="pficon pficon-add-circle-o"></span>Add New Cluster
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div><!-- /row -->
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-xs-12 col-sm-5 col-md-5">
                <div class="card-pf">
                    <h2 class="card-pf-title">
                        Card Title
                    </h2>
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                    <div class="card-pf-footer">
                        <div class="dropdown card-pf-time-frame-filter">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                                Last 30 Days <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right" role="menu">
                                <li><a href="#">Last 60 Days</a></li>
                                <li><a href="#">Last 90 Days</a></li>
                            </ul>
                        </div>
                        <p>
                            <a href="#" class="card-pf-link-with-icon">
                                <span class="pficon pficon-flag"></span>View CPU Events
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-7 col-md-7">
                <div class="card-pf">
                    <h2 class="card-pf-title">
                        Card Title
                    </h2>
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-xs-6 col-sm-8 col-md-8">
                <div class="card-pf">
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                    <div class="card-pf-footer">
                        <p><a href="#">Footer link</a></p>
                    </div>
                </div>
            </div>
            <div class="col-xs-6 col-sm-4 col-md-4">
                <div class="card-pf">
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                    <div class="card-pf-footer">
                        <p><a href="#">Footer link</a></p>
                    </div>
                </div>
            </div>
        </div><!-- /row -->
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-xs-6 col-sm-6 col-md-6">
                <div class="card-pf">
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                </div>
            </div>
            <div class="col-xs-6 col-sm-6 col-md-6">
                <div class="card-pf">
                    <div class="card-pf-body">
                        <p>[card contents]</p>
                    </div>
                </div>
            </div>
        </div><!-- /row -->

    </div>
@stop

@section('scripts')
    <script>
    $(document).ready(function() {
        // matchHeight the contents of each .card-pf and then the .card-pf itself
        $(".row-cards-pf > [class*='col'] > .card-pf .card-pf-title").matchHeight();
        $(".row-cards-pf > [class*='col'] > .card-pf > .card-pf-body").matchHeight();
        $(".row-cards-pf > [class*='col'] > .card-pf > .card-pf-footer").matchHeight();
        $(".row-cards-pf > [class*='col'] > .card-pf").matchHeight();

        // initialize tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // Initialize the vertical navigation
        $().setupVerticalNavigation(true);
    });
    </script>
@stop
