<template>
    <div class="Side-nav panel">
        <!-- Default panel contents -->
        <div class="panel-heading">Admin Menu</div>
        <div class="panel-body">

        </div>

        <div class="list-group">
            <a href="#" class="list-group-item"
               v-link="{ path: '/home', activeClass: 'active' }"
            ><i class="fa fa-home"></i> Home</a>
            <a href="#" class="list-group-item"
               v-link="{ path: '/posts', activeClass: 'active' }"
            ><i class="fa fa-file-text-o"></i> Posts</a>
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