define(function (require) {
  var Backbone = require('Backbone');

  var Session = require('../models/Session');

  var MainView = Backbone.View.extend({
    template: require('hbs!./../templates/HomeView'),

    events: {
      'click #newSession': 'newSession',
      'click #loadSession': 'loadSession'
    },

    initialize: function () {
      this.subviews = [];
    },

    render: function () {
      this.$el.append(this.template());
      return this;
    },

    newSession: function () {
      var self = this;
      self.session = new Session({'soc': 1});
      self.session.save(null, {
        error: function(err) {
          console.log(err);
        },
        success: function(data) {
          self.afterSessionLoaded(data);
        }
      });
    },

    loadSession: function () {
      var self = this;
      self.session = new Session({'id': 1});
      self.session.fetch({
        error: function(err) {
          console.log(err);
        },
        success: function(data) {
          self.afterSessionLoaded(data);
        }
      });
    },

    afterSessionLoaded: function(data) {
      var self = this;
    }

  });

  return MainView;
});
