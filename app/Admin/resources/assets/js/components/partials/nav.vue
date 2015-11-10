<template>
    <nav class="navbar navbar-inverse">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-nav">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">Brand</a>
            </div>

            <div class="collapse navbar-collapse" id="main-nav">
                <ul class="nav navbar-nav">
                    <li>
                        <a v-link="{path: '/home' }">Home</a>
                    </li>
                    <li>
                        <a v-link="{path: '/posts' }">Posts</a>
                    </li>
                </ul>
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="/admin/auth/logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
    export default {

        methods: {

            //

        }

    }
</script>