<template>
    <div class="Side-nav panel">
        <!-- Default panel contents -->
        <div class="panel-heading">Admin Menu</div>
        <div class="panel-body">

        </div>

        <div class="list-group">
            <a href="#" class="list-group-item" v-link="{ path: '/home', activeClass: 'active' }">
                <i class="fa fa-home"></i> Home
            </a>
            <a href="#" class="list-group-item" v-link="{ path: '/posts', activeClass: 'active' }">
                <i class="fa fa-newspaper-o"></i> Posts
            </a>
            <a href="#" class="list-group-item" v-link="{ path: '/categories', activeClass: 'active' }">
                <i class="fa fa-columns"></i> Categories
            </a>
            <a href="#" class="list-group-item" v-link="{ path: '/tags', activeClass: 'active' }">
                <i class="fa fa-tags"></i> Tags
            </a>
            <a href="#" class="list-group-item" v-link="{ path: '/authors', activeClass: 'active' }">
                <i class="fa fa-pencil-square-o"></i> Authors
            </a>
            <a href="#" class="list-group-item" v-link="{ path: '/users', activeClass: 'active' }">
                <i class="fa fa-users"></i> Users
            </a>
            <a href="#" class="list-group-item" v-link="{ path: '/settings', activeClass: 'active' }">
                <i class="fa fa-gear"></i> Settings
            </a>
        </div>
    </div>

    <div class="flashtag">
        <!-- You don't have to leave this but it would be nice if you did -->
        <div class="flashtag__link"><a href="http://flashtag.org" title="&copy; Ryan Winchester">FLASHTAG</a></div>
    </div>
</template>

<script>
    export default {

        props: ['current-user']

    }
</script>