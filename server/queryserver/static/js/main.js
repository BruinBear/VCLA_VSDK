require.config({
	hbs: {
		templateExtension: 'html',
		disableI18n: true,
		disableHelpers: true
	},

	shim: {
		'jQuery': {
			exports: '$'
		},

		'jQueryUI': {
			deps: ['jQuery']
		},
		'Underscore': {
			exports: '_'
		},

		'Backbone': {
			deps: ['Underscore', 'jQuery', 'jQueryUI'],
			exports: 'Backbone'
		},

		'Handlebars': {
			deps: ['handlebars'],
			exports: 'Handlebars'
		},

		'ApplicationRouter': {
			deps: ['jQuery', 'Underscore', 'Backbone']
		}
	},

	paths: {
		jQuery: './../public/components/jquery/dist/jquery',
		jQueryUI: './../public/components/jquery-ui/jquery-ui.min',
		Underscore: './../public/components/underscore/underscore',
		underscore: './../public/components/require-handlebars-plugin/hbs/underscore',
		Backbone: './../public/components/backbone/backbone',
		handlebars: './../public/components/require-handlebars-plugin/Handlebars',
		hbs: './../public/components/require-handlebars-plugin/hbs',
		i18nprecompile : './../public/components/require-handlebars-plugin/hbs/i18nprecompile',
		json2 : './../public/components/require-handlebars-plugin/hbs/json2'
	}
});

require(['core/router', 'core/client', 'Backbone'], function (Router, client, Backbone) {
	var app = {
		root: '/index'
	};

	window.Router = new Router();
	client.setup(window, app);

	Backbone.history.start({ pushState: true });
  $('#navbar > ul > li:nth-child(1) > a').click();
});
