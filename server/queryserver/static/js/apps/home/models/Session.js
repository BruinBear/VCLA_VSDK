define(function(require) {
    var Backbone = require('Backbone');

    var Session = Backbone.Model.extend({
        urlRoot: '/api/session/'
    });

    return Session;
});
