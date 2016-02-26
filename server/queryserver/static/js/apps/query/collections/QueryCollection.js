define(function (require) {
    var Backbone = require('Backbone');
    var Query = require('./../models/Query');

    var QueryCollection = Backbone.Collection.extend({
        url: function() {
          return '/api/session/'+this.sessionId+'/query/';
        },
        model: Query
    });

    return QueryCollection;
});