export default {

    request: function (request) {
        var token = localStorage.getItem('jwt-token');

        if (token !== null && token !== 'undefined') {
            request.headers.Authorization = token;
        }

        return request;
    },

    response: function (response) {
        if (response.status == 401) {
            localStorage.removeItem('jwt-token');
        }
        if (response.headers('authorization')) {
            localStorage.setItem('jwt-token', response.headers('authorization'));
        }

        return response;
    }

}
