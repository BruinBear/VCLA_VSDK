define(function (require) {
	var Backbone = require('Backbone');

	var VideoCollection = Backbone.Collection.extend({
    url: function() {
      return '/api/videoswithsocid/' + this.sessionId;
    }
	});

	return VideoCollection;
});
