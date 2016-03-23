@extends('admin::layout')

@section('content')
    <div class="container-fluid container-cards-pf container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <div class="row row-cards-pf">
            <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
            <div class="col-md-12">
                <div class="card-pf">
                    <div class="card-pf-heading">
                        <h2 class="card-pf-title">
                            Posts
                        </h2>
                    </div>
                    <div class="card-pf-body">
                        <posts :current-user="user"></posts>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
