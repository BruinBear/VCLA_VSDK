define(function (require) {
	var Backbone = require('Backbone');

	var VideoView = Backbone.View.extend({
		tagName: 'div',

		className: 'videoDiv fLeft',

		template: require('hbs!./../templates/VideoView'),

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	return VideoView;
});