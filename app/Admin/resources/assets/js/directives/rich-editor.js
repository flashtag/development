export default {

    twoWay: true,

    priority: 1000,

    params: ['content'],

    bind: function () {
        var self = this;
        console.log(self);
        console.log(this.el);
        CKEDITOR.replace(this.el.id);
        CKEDITOR.instances[this.el.id].setData(this.params.content);
        CKEDITOR.instances[this.el.id].on('change', function () {
            self.set(CKEDITOR.instances[self.el.id].getData());
        });
    },

    update: function (value) {
        $(this.el).trigger('change');
    },

    unbind: function () {
        CKEDITOR.instances[this.el.id].destroy();
    }

}
