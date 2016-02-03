<template>
    <div class="form-group">
        <label for="media-type">Media type</label>
        <select v-model="type" @change="checkMediaType" name="media-type" id="media-type" class="form-control">
            <option :value="null">Select type...</option>
            <option v-for="mediaType in mediaTypes" :value="mediaType.id">{{ mediaType.text }}</option>
        </select>
    </div>
    <div v-if="showDropzone">
        <dropzone :path="imagePath" :image="url" :to="imageUpload"></dropzone>
    </div>
    <div v-if="showMediaInput" class="form-group">
        <label for="media-link">Media Link</label>
        <input type="text" v-model="url" name="media-link" id="media-link" class="form-control">
    </div>
</template>

<script>
    export default {

        props: ['type', 'url', 'image-path', 'image-upload'],

        components: {
            dropzone: require('./dropzone.vue')
        },

        data: function () {
            return {
                mediaTypes: [
                    { id: 'image', text: 'Image' },
                    { id: 'youtube_video', text: 'Youtube' },
                    { id: 'vimeo_video', text: 'Vimeo' },
                    { id: 'wistia_video', text: 'Wistia' }
                ],
                showMediaInput: false,
                showDropzone: false
            }
        },

        ready: function () {
            this.$nextTick(function () {
                this.checkMediaType();
            });
        },

        methods: {
            checkMediaType: function () {
                this.showDropzone = (this.type == 'image');
                this.showMediaInput = this.type && (this.type.length > 0) && (this.type != 'image');
            }
        }
    }
</script>