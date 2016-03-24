@extends('admin::layout')

@section('content')

    <div class="row row-cards-pf">
        <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
        <div class="col-xs-12 col-sm-6 col-md-3">
            <div class="card-pf card-pf-accented card-pf-aggregate-status card-pf-aggregate-status-mini">
                <h2 class="card-pf-title">
                    <span class="fa fa-newspaper-o"></span>
                    <span class="card-pf-aggregate-status-count">{{ $postCount }}</span> Posts
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
                    <span class="card-pf-aggregate-status-count">{{ $categoryCount }}</span> Categories
                </h2>
                <div class="card-pf-body">
                    <p class="card-pf-aggregate-status-notifications">
                        <span class="card-pf-aggregate-status-notification">
                            <a href="{{ route('admin.categories.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Add new">
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
                    <span class="card-pf-aggregate-status-count">{{ $tagCount }}</span> Tags
                </h2>
                <div class="card-pf-body">
                    <p class="card-pf-aggregate-status-notifications">
                        <span class="card-pf-aggregate-status-notification">
                            <a href="{{ route('admin.tags.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Add new">
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
                    <span class="card-pf-aggregate-status-count">{{ $pageCount }}</span> Pages
                </h2>
                <div class="card-pf-body">
                    <p class="card-pf-aggregate-status-notifications">
                        <span class="card-pf-aggregate-status-notification">
                            <a href="{{ route('admin.pages.create') }}" class="add" data-toggle="tooltip" data-placement="top" title="Add new">
                                <span class="pficon pficon-add-circle-o"></span>
                            </a>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="row row-cards-pf">
        <!-- Most Viewed Posts -->
        <div class="col-xs-12 col-sm-6">
            <div class="card-pf">
                <div class="card-pf-heading">
                    <h2 class="card-pf-title">
                        Most Viewed Posts
                    </h2>
                </div>
                <div class="card-pf-body">
                    @foreach ($mostViewed as $post)
                        <?php $percent = number_format($post->views/$mostViewed->max('views') * 100); ?>
                        <div class="progress-description">
                            <a href="{{ route('admin.posts.edit', [$post->id]) }}">{{ $post->title }}</a>
                        </div>
                        <div class="progress progress-label-top-right">
                            <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="{{ $post->views }}" aria-valuemin="0" aria-valuemax="{{ $mostViewed->max('views') }}" style="width: {{ $percent }}%;"  data-toggle="tooltip" title="{{ $post->views }} views">
                                <span><strong>{{ $post->views }}</strong> Views</span>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        <!-- Least Viewed Posts -->
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
                            <a href="{{ route('admin.posts.edit', [$post->id]) }}">{{ $post->title }}</a>
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
