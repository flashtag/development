<template>
    <div v-if="image" :class="'Image__thumbnail--'+height">
        <h6>Current Image</h6>
        <div>
            <img :src="path + image">
        </div>
        <div>
            <a href="#delete-image" @click.prevent="deleteImage" class="btn btn-danger">Delete Image</a>
        </div>
    </div>
</template>

<script>
    export default {

        props: ['path', 'image', 'height'],

        methods: {
            deleteImage() {
                return this.$http.delete('/admin/api/media/images/' + this.image)
                    .then(function(response){
                        this.$dispatch('media-image:deleted', this.image);
                    });
            }
        }

    }
</script>