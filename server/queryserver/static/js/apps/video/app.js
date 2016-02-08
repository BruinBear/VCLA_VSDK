define(function (require) {
	var SocView = require('./views/SocView');

	return {
		run: function(viewManager) {
      var view = new SocView({
      });
      viewManager.show(view);
		}
	};
});
