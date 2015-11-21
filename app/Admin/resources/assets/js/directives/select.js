export default {
    twoWay: true,

    params: ['options'],

    bind: function () {
        var self = this;
        $(this.el).select2({
            data: this.params.options
        }).on('change', function () {
            self.set($(this).val());
        });
    },

    update: function (value) {
        $(this.el).val(value).trigger('change');
    },

    unbind: function () {
        $(this.el).off().select2('destroy');
    }

}
