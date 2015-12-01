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
    import swal from 'sweetalert';

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
                // Overwrite dropzone's confirm method with our own
                Dropzone.confirm = this.confirm;
                // Initialize dropzone with our config and add some even listeners
                this.dropzone = new Dropzone('#dropzone-image', {
                    url: "/api" + this.to,
                    dictDefaultMessage: "Drop image file here to upload",
                    dictRemoveFileConfirmation: "Are you sure you want to delete this?",
                    paramName: "image",
                    maxFiles: 1,
                    maxFilesize: 1.5,
                    uploadMultiple: false,
                    headers: { "Authorization": Cookies.get('jwt-token') }
                }).on('maxfilesreached', function() {
                    //$('#dropzone-image').removeClass('dz-clickable'); // remove cursor
                    //$('#dropzone-image')[0].removeEventListener('click', this.listeners[1].events.click);
                }).on('maxfilesexceeded', function (file) {
                    //this.removeFile(file);
                }).on('removedfile', function (file) {
                    this.delete(file);
                }.bind(this));
                // Show existing photo in dropzone box
                if (this.image && this.image.length > 0) {
                    this.showExistingImage();
                }
            },

            delete: function (file) {
                client({
                    method: 'DELETE',
                    path: this.to
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
            },

            confirm: function(question, accepted, rejected) {
                swal({
                    title: 'Hold up!',
                    text: question,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, accepted, rejected);
            }

        }
    }
</script>
