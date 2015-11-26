<template>
    <div class="form-group">
        <label>Image</label>
        <div id="dropzone-image" class="dropzone">
            <div class="fallback">
                <input name="image" type="file" />
            </div>
        </div>
    </div>
</template>

<script>
    import Dropzone from 'dropzone';
    import Cookies from 'js-cookie';

    export default {

        props: ['path', 'image', 'to'],

        data: function () {
            return {
                dropzone: null
            }
        },

        ready: function () {
            this.initDropzone();
        },

        methods: {

            initDropzone: function () {
                this.dropzone = new Dropzone('#dropzone-image', {
                    url: "/api" + this.to,
                    paramName: "image",
                    maxFiles: 1,
                    maxFilesize: 1.5,
                    uploadMultiple: false,
                    addRemoveLinks: true,
                    removedfile: this.delete,
                    headers: { "Authorization": Cookies.get('jwt-token') }
                });
                this.dropzone.on("maxfilesexceeded", function(file) {
                    this.removeFile(file);
                });
                if (this.image && this.image.length > 0) {
                    this.showExistingImage();
                }
            },

            delete: function (file) {
                client({
                    method: 'DELETE',
                    path: '/posts/'+this.$route.params.post_id+'/image'
                }).then(function () {
                    swal({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + file.name + '</strong> was deleted!',
                        type: 'success'
                    });
                }, function () {
                    swal("Oops", "We couldn't connect to the server!", "error");
                });
            },

            showExistingImage: function () {
                var mockFile = {name: this.image, size: 432100};
                this.dropzone.emit("addedfile", mockFile);
                this.dropzone.emit("thumbnail", mockFile, this.path + this.image);
                this.dropzone.emit("complete", mockFile);
                this.dropzone.files.push(mockFile);
                this.dropzone.options.maxFiles = this.dropzone.options.maxFiles - 1;
            }

        }
    }
</script>