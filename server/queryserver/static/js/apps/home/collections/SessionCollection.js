define(function (require) {
  var Backbone = require('Backbone');

  var SessionCollection = Backbone.Collection.extend({
    url: function() {
      return '/api/session/';
    },
  });
    
  return SessionCollection;
});
