<template>
    <div class="form-group">
        <label for="media-type">Media type</label>
        <select v-model="media.type" @change="checkMediaType" name="media-type" id="media-type" class="form-control">
            <option value="" disabled selected>Select type...</option>
            <option v-for="type in mediaTypes" :value="type.id">{{ type.text }}</option>
        </select>
    </div>
    <div v-show="showDropzone" class="form-group">
        <label>Image</label>
        <div id="dropzone-image" class="dropzone">
            <div class="fallback">
                <input name="file" type="file" />
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

    export default {

        props: ['media'],

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
                this.dropzone = new Dropzone('#dropzone-image', { url: "/file/post" });
                this.dropzone.on("maxfilesexceeded", function(file) { this.removeFile(file); });
                Dropzone.options.dropzoneImage = {
                    paramName: "url",
                    maxFiles: 1,
                    maxFilesize: 1.5,
                    uploadMultiple: false
                };
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