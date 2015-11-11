<template>
    <h1>Dashboard for {{ currentUser.name }}</h1>

    <p>Why won't this show up?</p>
</template>

<script>
    export default {

        props: ['current-user']

    }
</script>