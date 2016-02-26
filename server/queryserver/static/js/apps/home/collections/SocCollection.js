define(function (require) {
  var Backbone = require('Backbone');

  var SocCollection = Backbone.Collection.extend({
    url: function() {
      return '/api/soc/';
    },
  });
    
  return SocCollection;
});
