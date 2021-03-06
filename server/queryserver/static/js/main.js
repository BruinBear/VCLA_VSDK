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

    'Bootstrap': {
      deps: ['jQuery']
    },

    'Backbone': {
      deps: ['Underscore', 'jQuery', 'jQueryUI', 'Bootstrap'],
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
    Bootstrap: './../public/components/bootstrap/dist/js/bootstrap.min',
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
    root: '/session'
  };

  window.Router = new Router();
  client.setup(window, app);

  Backbone.history.start({ pushState: true });
});
