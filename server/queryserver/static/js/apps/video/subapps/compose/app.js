define(function(require) {
	var MainView = require('./views/MainView');
	var Video = require('./../../models/Video');

	return {
		run: function(viewManager) {
			var video = new Video();
			var mainView = new MainView({model: video});
			viewManager.show(mainView);
		}
	};
});