export default {

    template: '#Post',

    methods: {
        /**
         * Save the post.
         */
        save: function() {
            this.post.update({
                fields: this.fieldValues
            }).then(function(response) {
                this.notify('success', 'Saved successfully.');
            });
        },

        delete: function() {
            var self = this;
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this post and all of its revision history!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                self.post.delete.then(function () {
                    swal({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + self.post.title + '</strong> was deleted!',
                        type: 'success'
                    }, function () {
                        self.deleted = true;
                        window.location = '/admin/posts';
                    });
                }, function () {
                    swal("Oops", "We couldn't connect to the server!", "error");
                });
            });
        },

        notify: function (type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        }

    }

}
