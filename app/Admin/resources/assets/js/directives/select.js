var $ = require('jquery');
var select2 = require('select2');

export default {

    twoWay: true,

    priority: 1000,

    params: ['options'],

    bind: function () {
        var self = this;
        $(this.el).select2({
            data: this.params.options
        }).on('change', function () {
            self.set(this.value);
        });
    },

    update: function (value) {
        $(this.el).val(value).trigger('change');
    },

    unbind: function () {
        $(this.el).off().select2('destroy');
    }

}
