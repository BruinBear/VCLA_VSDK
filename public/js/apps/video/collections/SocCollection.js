define(function (require) {
	var Backbone = require('Backbone');
	var Video = require('./../models/Video');

	var InboxCollection = Backbone.Collection.extend({
		model: Video,

		url: '/api/videos'
	});

	return InboxCollection;
});