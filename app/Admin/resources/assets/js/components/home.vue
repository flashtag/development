<template>
    <h1>Dashboard for {{ currentUser.name }}</h1>

</template>

<script>
    export default {

        props: ['current-user']

    }
</script>