define(function (require) {
	var Backbone = require('Backbone');

	var VideoCollection = Backbone.Collection.extend({
    "url": function() {
      return '/api/videowithsocid/' + this.get('socid');
    }
	});

	return VideoCollection;
});
