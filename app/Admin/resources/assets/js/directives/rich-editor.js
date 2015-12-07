export default {
    twoWay: true,

    bind: function () {
        this.vm.$nextTick(this.setupEditor.bind(this));
    },

    setupEditor: function () {
        var self = this;
        CKEDITOR.replace(this.el.id);
        CKEDITOR.instances[this.el.id].on('change', function () {
            self.set(CKEDITOR.instances[self.el.id].getData());
        });
    },

    update: function (value) {
        value = value || ' ';
        if (!CKEDITOR.instances[this.el.id]) {
            return this.vm.$nextTick(this.update.bind(this, value));
        }
        CKEDITOR.instances[this.el.id].setData(value);
    },

    unbind: function () {
        CKEDITOR.instances[this.el.id].destroy();
    }

}
