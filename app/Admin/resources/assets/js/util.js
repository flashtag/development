export default {

    replaceAll: function (str, find, replace) {
        if (! (find instanceof Array)) {
            find = [find];
        }

        return find.reduce(function (s, search) {
            return s.replace(new RegExp(search, 'g'), replace);
        }, str);
    }

}