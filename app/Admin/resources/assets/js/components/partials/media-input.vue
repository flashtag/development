<template>
    <div class="form-group">
        <label for="media-type">Media type</label>
        <select v-model="type" @change="changeSelect" name="media-type" id="media-type" class="form-control">
            <option :value="null">Select type...</option>
            <option v-for="mediaType in mediaTypes" :value="mediaType.id">{{ mediaType.text }}</option>
        </select>
    </div>
    <div v-if="showDropzone">
        <dropzone :path="imagePath" :image="url" :to="imageUpload"></dropzone>
    </div>
    <div v-if="showMediaInput" class="form-group">
        <label for="media-link">Media Link</label>
        <input type="text" v-model="url" name="media-link" id="media-link" class="form-control"
               @keyup="updatePreview | debounce 500">
    </div>

    <div v-if="url.length" class="media-preview" style="margin-bottom:20px;">
        <div v-if="showDropzone" class="image-preview">
            <img id="preview-image" style="max-width:100%;">
        </div>
        <div v-else class="video-preview embed-responsive embed-responsive-16by9">
            <iframe id="preview-frame" class="embed-responsive-item" frameborder="0" allowfullscreen></iframe>
        </div>
    </div>
</template>

<script>
    export default {

        props: ['type', 'url', 'image-path', 'image-upload'],

        data: function () {
            return {
                mediaTypes: [
                    { id: 'image', text: 'Image' },
                    { id: 'video', text: 'Video' }
                ],
                showMediaInput: false,
                showDropzone: false,
                preview: null
            }
        },

        ready: function () {
            this.$nextTick(function () {
                this.changeSelect();
            });
        },

        computed: {
              imageUrl: function () {
                  return window.location.protocol + '//'
                      + window.location.hostname
                      + '/img/uploads/media/'
                      + this.url;
              }
        },

        methods: {

            changeSelect: function () {
                this.showDropzone = this.type == 'image';
                this.showMediaInput = this.type == 'video';

                this.updatePreview();
            },

            updatePreview: function(){
                if (this.showDropzone) {
                    this.setImagePreview();
                } else {
                    this.setVideoPreview();
                }
            },

            setImagePreview: function () {
                this.$http.get('/admin/media/preview/image', { url: this.imageUrl }).then(function (response) {
                    document.getElementById('preview-image').src = this.imageUrl;
                    // console.log(this.imageUrl);
                }, function (response) {
                    // failed
                });
            },

            setVideoPreview: function () {
                this.$http.get('/admin/media/preview/' + this.type, { url: this.url }).then(function (response) {
                    document.getElementById('preview-frame').contentDocument.write(response.data);
                }, function (response) {
                    // failed
                });
            },

            imageUrlIsValid: function() {
                var valid = false;
                this.$http.get('/admin/media/preview/image', { url: this.imageUrl }).then(function (response) {
                    valid = true;
                }, function (response) {
                    valid = false;
                });

                return valid;
            },

            videoUrlIsValid: function() {
                var valid = false;
                this.$http.get('/admin/media/preview/' + this.type, { url: this.url }).then(function (response) {
                    valid = true;
                }, function (response) {
                    valid = false;
                });

                return valid;
            }
        }
    }
</script>