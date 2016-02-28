<template>
    <div v-if="image" :class="'Image__thumbnail--'+height">
        <h6>Current Image</h6>
        <div>
            <img :src="path + image">
        </div>
    </div>
</template>

<script>
    export default {

        props: ['path', 'image', 'height']

    }
</script>