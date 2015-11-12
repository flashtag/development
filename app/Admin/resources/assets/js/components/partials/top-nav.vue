<template>
    <nav class="Top-nav navbar navbar-inverse navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-nav">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <span class="navbar-brand">My Site</span>
            </div>
            <ul class="nav navbar-nav navbar-right">
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                       {{ userName }} <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/admin/auth/logout"><i class="fa fa-sign-out"></i> Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
    global.jQuery = require('jquery');
    var bootstrap = require('bootstrap-sass');

    export default {

        props: ['current-user'],

        computed: {

            userName: function () {
                return !! this.currentUser ? this.currentUser.name : '';
            }

        }

    }
</script>