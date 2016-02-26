define(function (require) {
  var Backbone = require('Backbone'),
  SocCollection = require('../collections/SocCollection'),
  Session = require('../models/Session');

  var MainView = Backbone.View.extend({
    template: require('hbs!./../templates/HomeView'),
    socRow: require('hbs!./../templates/SocRow'),

    events: {
      'click #newSession': 'newSession',
      'click tr.socRow': 'selectSocRow'
    },

    initialize: function() {
      var self = this;
      this.subviews = [];
      this.socs = new SocCollection();
      this.socs.on('add', function(soc) {
        self.addSocRow(soc);
      });
      this.socs.fetch();
      this.socSelected = null;
    },

    render: function() {
      this.$el.append(this.template());
      return this;
    },

    addSocRow: function(soc) {
      this.$('table#socTable > tbody').append(this.socRow(soc.toJSON()));
    },

    selectSocRow: function(e) {
      if(this.socSelected !== null) {;
        $('tr[socId="'+this.socSelected+'"]').removeClass('success');
      }
      $(e.target.parentElement).addClass('success');
      this.socSelected = $(e.target.parentElement).attr('socId');
      this.$('button#newSession').addClass('btn-success');
    },

    newSession: function(socId) {
      var self = this;
      self.session = new Session({'soc': socId});
      self.session.save(null, {
        error: function(err) {
          console.log(err);
        },
        success: function(session) {
          console.log(session);
        }
      });
    },

    newSessionWithSoc: function(e) {
      this.newSession(parseInt($(e.target).attr('socId')));
    },

    afterSessionLoaded: function(data) {
      var self = this;
    }

  });

  return MainView;
});
