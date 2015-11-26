<template>
    <div class="form-group">
        <label for="media-type">Media type</label>
        <select v-model="media.type" @change="checkMediaType" name="media-type" id="media-type" class="form-control">
            <option value="" disabled selected>Select type...</option>
            <option v-for="type in mediaTypes" :value="type.id">{{ type.text }}</option>
        </select>
    </div>
    <div v-show="showDropzone">
        <div class="form-group">
            <label>Image</label>
            <div id="dropzone-image" class="dropzone">
                <div class="fallback">
                    <input name="image" type="file" />
                </div>
            </div>
        </div>
    </div>
    <div v-show="showMediaInput" class="form-group">
        <label for="media-link">Media Link</label>
        <input type="text" v-model="media.url" name="media-link" id="media-link" class="form-control">
    </div>
</template>

<script>
    import Dropzone from 'dropzone';
    import Cookies from 'js-cookie';

    export default {

        props: ['media', 'to'],

        data: function () {
            return {
                mediaTypes: [
                    { id: 'image', text: 'Image' },
                    { id: 'youtube_video', text: 'Youtube' },
                    { id: 'vimeo_video', text: 'Vimeo' },
                    { id: 'wistia_video', text: 'Wistia' }
                ],
                showMediaInput: false,
                showDropzone: false,
                dropzone: null
            }
        },

        ready: function () {
            this.checkMediaType();
        },

        methods: {
            checkMediaType: function () {
                this.showDropzone = (this.media.type == 'image');
                if (this.showDropzone && !this.dropzone) {
                    this.initDropzone();
                }
                this.showMediaInput = (this.media.type.length > 0) && (this.media.type != 'image');
            },

            initDropzone: function () {
                this.dropzone = new Dropzone('#dropzone-image', {
                    url: "/api" + this.to,
                    paramName: "image",
                    maxFiles: 1,
                    maxFilesize: 1.5,
                    uploadMultiple: false,
                    headers: { "Authorization": Cookies.get('jwt-token') }
                });
                this.dropzone.on("maxfilesexceeded", function(file) { this.removeFile(file); });
                if (this.media.url && this.media.url.length > 0) {
                    this.showExistingImage();
                }
            },

            showExistingImage: function () {
                var mockFile = {name: "Filename", size: 12345};
                this.dropzone.emit("addedfile", mockFile);
                this.dropzone.emit("thumbnail", mockFile, this.media.url);
                this.dropzone.emit("complete", mockFile);
                this.dropzone.options.maxFiles = this.dropzone.options.maxFiles - 1;
            }
        }
    }
</script>