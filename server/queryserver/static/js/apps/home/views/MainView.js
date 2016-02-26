define(function (require) {
  var Backbone = require('Backbone'),
    SessionCollection = require('../collections/SessionCollection'),
    SocCollection = require('../collections/SocCollection'),
    Session = require('../models/Session');

  var MainView = Backbone.View.extend({
    template: require('hbs!./../templates/HomeView'),
    socRow: require('hbs!./../templates/SocRow'),
    sessionRow: require('hbs!./../templates/SessionRow'),

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
      this.sessions = new SessionCollection();
      this.sessions.on('add', function(session) {
        self.addSessionRow(session);
      });
      this.socSelected = null;
      this.sessionSelected = null;
    },

    render: function() {
      this.$el.append(this.template());
      this.socs.fetch();
      this.sessions.fetch();
      
      this.socSelected = null;
      this.sessionSelected = null;
      
      return this;
    },

    addSocRow: function(soc) {
      this.$('table#socTable > tbody').append(this.socRow(soc.toJSON()));
    },

    addSessionRow: function(session) {
      this.$('table#sessionTable > tbody').append(this.sessionRow(session.toJSON()));
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
      self.session = new Session({'soc': self.socSelected});
      self.session.save(null, {
        error: function(err) {
          console.log(err);
        },
        success: function(session) {
          Backbone.history.navigate('/session/' + session.get('id') + '/video', {trigger: true});
        }
      });
    }

  });

  return MainView;
});
