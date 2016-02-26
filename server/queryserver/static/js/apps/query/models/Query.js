
define(function(require) {
    var Backbone = require('Backbone');

    var Query = Backbone.Model.extend({
      url: '/api/query/'
    });

    return Query;
});