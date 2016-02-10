define(function(require) {
    var Backbone = require('Backbone');

    var Object = Backbone.Model.extend({
      url: '/api/object/'
    });

    return Object;
});
