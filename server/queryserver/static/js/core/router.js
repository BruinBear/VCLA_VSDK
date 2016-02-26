define(function(require) {
	var Backbone = require('Backbone');
	var viewManager = require('./viewManager');
	var queryView = require('./../apps/video/views/QueryView');

	var Router = Backbone.Router.extend({
		routes: {
			'index/#': 'video',
			'index/#contacts': 'contacts',
			'index/#tasks': 'tasks',
			'index/#queries': 'queries',
		},

		video: function () {
			this.view && this.view.remove();
			require('./../apps/video/app').run(viewManager);
		},

		queries: function () {
			this.view && this.view.remove();
			this.view = new queryView();
		},

		help: function () {
			require('./../apps/tasks/app').run(viewManager);
		}
	});

	return Router;
});
