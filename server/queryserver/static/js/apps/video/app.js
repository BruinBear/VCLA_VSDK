define(function (require) {
	var SocCollection = require('./collections/SocCollection');
	var SocView = require('./views/SocView');

	return {
		run: function(viewManager) {
			var videosCollection = new SocCollection();
			videosCollection.fetch({
				success: function (videosCollection) {
					var view = new SocView({
						collection: videosCollection
					});
					viewManager.show(view);
				}
			});
		}
	};
});