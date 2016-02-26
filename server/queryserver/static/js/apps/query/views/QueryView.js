define(function (require) {
    var Backbone = require('Backbone');

    var QueryModel = require('../models/Query');

    var QueryCollection = require('../collections/QueryCollection');

    var ObjectModel = require('../models/Object');

    var ObjectCollection = require('../collections/ObjectCollection');

    var OntConfig = require('../models/OntConfig');

    var QueryView = Backbone.View.extend({

      tagName: "div",

      template: require('hbs!./../templates/QueryView'),

      events: {
        'click #q-attr-o .msee-objects-dropdown-a': 'newAttr',
        'click .q-rel-o .msee-objects-dropdown-a': 'newRel',
        'click #q-submit-btn': 'submitPredicate',
        'click #generate-query-btn': 'generateQuery',
      },

      initialize: function () {
        var self = this;
        this.session = 1;
        this.objectCollection = new ObjectCollection();
        this.objectCollection.sessionId = 1;
        this.objectCollection.fetch({
          async: false
        });
        this.objectsDropdowns = {};
        this.objectIdLabel = {};
        this.ontConfig = new OntConfig();
        this.queryCollection = new QueryCollection();
        this.objectAttr = {};
        this.objectRel = {};
        this.labelArray = [];
        this.predicates = [];
        this.finalAnswer = true;
        this.q = "";
        this.relDict = {};
        this.relationships = self.ontConfig.get('relationships');
        for (var key in self.relationships) {
          var values = self.relationships[key];
          for (var i = 0; i < values.length; ++i) {
            for (var j = 0; j < values[i][0].length; ++j) {
              for (var k = 0; k < values[i][1].length; ++k) {
                if (!(values[i][0][j]+' '+values[i][1][k] in self.relDict)) {
                  self.relDict[values[i][0][j]+' '+values[i][1][k]] = [];
                }
                self.relDict[values[i][0][j]+' '+values[i][1][k]].push(key);
              }
            }
          }
        }
        this.objectRel = {};
        this.objectCollection.each(function (o) {
          self.objectIdLabel[o.get('id')] = o.get('label');
          if (!(o.get('label') in self.objectAttr)) {
            self.objectAttr[o.get('label')] = self.ontConfig.get('object_attributes')[o.get('label')];
          }
          self.labelArray.push(o.get('label'));
        });
        for (var i = 0; i < self.labelArray.length; ++i) {
          for (var j = 0; j < self.labelArray.length; ++j) {
            if (!(self.labelArray[i]+' '+self.labelArray[j] in self.objectRel)) {
              self.objectRel[self.labelArray[i]+' '+self.labelArray[j]] 
                = self.relDict[self.labelArray[i]+' '+self.labelArray[j]]
            }
          }
        }
      },

      render: function() {
        var self = this;
        self.$el.html(self.template());
        self.createObjectsDropdown('q-attr-o');
        self.createObjectsDropdown('q-rel-o1');
        self.createObjectsDropdown('q-rel-o2');
        $('#q-rel').hide();
        $('#q-type-radios input').change(function(){
          $('.q-info').hide();
          $('#'+$(this).attr('data-q')).show();
        });
        $('#q-attr').on('click', '.list-group-item', function() {
          self.q = $('#q-attr #q-attr-o-objects-dropdown-dsp-span').attr('data-oname') + ' ' + $(this).html() + '?';
        });
        $('#q-rel').on('click', '.list-group-item', function() {
          self.q = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname')
            + ' ' + $(this).html() + ' '
            + $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname') + '?';
        });
        return self;
      },

      createObjectsDropdown: function(cid) {
        var self = this;
        $('#'+cid).html('').append(
            $('<button>', {
              id: cid+'-objects-dropdown-btn',
              class: "btn btn-default dropdown-toggle",
              type: "button",
              'data-toggle': "dropdown",
            }).append(
              $('<span>', {
                  id: cid+'-objects-dropdown-dsp-span'
              }).html("Object ")
            ).append(
              $('<span>', {class: "caret"})
            )
        ).append(
            $('<ul>', {
              id: cid+'-objects-dropdown-ul',
              class: "dropdown-menu",
              'aria-labelledby': cid+'-objects-dropdown-btn',
            })
        );
        self.objectsDropdowns[cid] =
            $('#'+cid+'-objects-dropdown-ul').on('click', 'a', function(){
              var oname = $(this).attr('data-oname');
              $('#'+cid+'-objects-dropdown-dsp-span')
                  .attr('data-oname', oname).html(oname +' ');
            });
        self.updateObjectsDropdown(cid);
      },

      updateObjectsDropdown: function(cid) {
        var self = this;
        self.objectsDropdowns[cid].html('');
        self.objectsDropdowns[cid].append(
            $('<li>', {class: "dropdown-header"}).html('Select an object')
         );
        self.objectCollection.each(function (o) {
            self.objectsDropdowns[cid].append(
              $('<li>').append(
                  $('<a>', {
                    class: 'msee-objects-dropdown-a',
                    href: '#',
                    'data-oname': o.get('id'),
                  }).html(o.get('id'))
              )
            );
          });
      },

      newAttr: function(){
        var self = this;
        var ot = self.objectIdLabel[$('#q-attr-o .msee-objects-dropdown-a').attr('data-oname')];
        $('#q-attr .list-group').html('');
        for (var i = 0; i < self.objectAttr[ot].length; ++i)
            $('#q-attr .list-group').append(
              $('<a>', {
                  class: 'list-group-item',
                  href: '#',
              }).html(self.objectAttr[ot][i])
            );
      },

      newRel: function(){
        var self = this;
        var on1 = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname');
        var on2 = $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname');
        if (on1 && on2) {
            var ot = self.objectIdLabel[on1]+' '+self.objectIdLabel[on2];
            $('#q-rel .list-group').html('');
            for (var i = 0; i < self.objectRel[ot].length; ++i)
              $('#q-rel .list-group').append(
                  $('<a>', {
                    class: 'list-group-item',
                    href: '#',
                  }).html(self.objectRel[ot][i])
              );
        }
      },

      appendQuestion: function(q) {
        $('#history-pool').append(
            $('<div>', {
              class: 'history-entry'
            }).append(
              $('<span>', {
                  class: 'history-entry-q'
              }).html('Q: '+q)
            ).append(
              $('<span>', {
                  class: 'history-entry-a'
              }).html('  A: '+$("#predicate-answer").val())
            ).hide().fadeIn('slow')
        );
      },

      submitPredicate: function() {
        var self = this;
        if (new String($("#predicate-answer").val()).valueOf() == new String("no").valueOf()) {
          self.finalAnswer = false;
        }
        var predi = self.q+"&&answer is: "+$("#predicate-answer").val();
        self.predicates.push(predi);
        self.appendQuestion(self.q);
      },

      generateQuery: function() {
        var self = this;
        var pred = '';
        if (self.predicates.length > 0) {
          pred = pred + self.predicates[0];
          for (var i = 1; i < self.predicates.length; ++i) {
            pred = pred + '&' + self.predicates[i];
          }
        }
        self.queryCollection.create({
          answer: self.finalAnswer,
          session: self.session,
          predicates: pred,
          comment: $("#query-comment").val(),
        },{
          wait: true
        });
        self.predicates = [];
        self.finalAnswer = true;
        self.q = '';
        $('#history-pool').html('');
        $('#query-comment').html('');
      },

    });

    return QueryView;
});
