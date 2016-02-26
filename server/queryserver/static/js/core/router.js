define(function(require) {
  var Backbone = require('Backbone');
  var viewManager = require('./viewManager');

  var Router = Backbone.Router.extend({
    routes: {
      'session/': 'home',
      'session/:sid/video': 'video',
      'session/:sid/query': 'query',
    },

    home: function () {
      require('./../apps/home/app').run(viewManager);
    },

    video: function (sid) {
      this.view && this.view.remove();
      require('./../apps/video/app').run(viewManager, sid);
    },

    query: function (sid) {
      this.view && this.view.remove();
      require('./../apps/query/app').run(viewManager, sid);
    },

    queries: function (sid) {
      this.view && this.view.remove();
      this.view = new queryView();
    },
  });

  return Router;
});
