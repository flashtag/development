<template>
    <div class="panel-heading">
        Logging out...
    </div>
</template>

<script>
    module.exports = {

        route: {
            activate: function (transition) {
                this.$root.authenticated = false;
                this.$root.user = null;
                localStorage.removeItem('user');
                localStorage.removeItem('jwt-token');
                transition.redirect('/');
            }
        }

    }
</script>
