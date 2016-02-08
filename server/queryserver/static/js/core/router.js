define(function(require) {
	var Backbone = require('Backbone');
	var viewManager = require('./viewManager');

	var Router = Backbone.Router.extend({
		routes: {
			'index/#': 'video',
			'index/#contacts': 'contacts',
			'index/#tasks': 'tasks'
		},

		video: function () {
			require('./../apps/video/app').run(viewManager);
		},

		predicate: function () {
			require('./../apps/contacts/app').run(viewManager);
		},

		help: function () {
			require('./../apps/tasks/app').run(viewManager);
		}
	});

	return Router;
});
