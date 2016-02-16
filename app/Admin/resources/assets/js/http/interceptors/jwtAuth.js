export default {

    request: function (request) {
        var token = localStorage.getItem('jwt-token');

        if (token !== null && token !== 'undefined') {
            request.headers.Authorization = token;
        }

        return request;
    },

    response: function (response) {
        // If we get a 401, we will re-authenticate and resend the request.
        // If that fails we will logout.
        if (response.status == 401) {
            var original = response.request;
            localStorage.removeItem('jwt-token');

            return client.post('auth')
                .then(function (response) {
                    localStorage.setItem('jwt-token', 'Bearer ' + response.data.token);
                    return client[original.method.toLowerCase()](original.url, original.params);
                }, function (response) {
                    window.location = '/admin/auth/logout';
                });
        }

        if (response.headers('authorization')) {
            localStorage.setItem('jwt-token', response.headers('authorization'));
        }

        return response;
    }

}
