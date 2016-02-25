<template>
    <h1>Dashboard for {{ userName }}</h1>
</template>

<script>
    export default {

        props: ['current-user'],

        computed: {

            userName: function () {
                return this.currentUser ? this.currentUser.name : '';
            }

        }

    }
</script>