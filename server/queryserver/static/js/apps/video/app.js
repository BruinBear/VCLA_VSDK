define(function (require) {
	var QueryView = require('./views/QueryView');

	return {
		run: function(viewManager) {
      var view = new QueryView({
      });
      viewManager.show(view);
		}
	};
});
