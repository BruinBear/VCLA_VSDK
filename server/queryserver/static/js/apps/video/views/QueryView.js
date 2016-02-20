
define(function (require) {
    var Backbone = require('Backbone');

    var ObjectModel = require('../models/Query');

    var QueryCollection = require('../collections/QueryCollection');

    var OntConfig = require('../models/OntConfig');

    var QueryView = Backbone.View.extend({

    	tagName: "div",

    	template: require('hbs!./../templates/QueryView'),

    	initialize: function () {
    		this.objectsDropdowns = {};
    		this.objectIdLabel = {};
    		this.ontConfig = new OntConfig();
    		this.queryCollection = new QueryCollection();
    		this.objectAttr = {};
    		this.objectRel = {};
    		this.labelArray = [];
    		this.predicates = [];
    		this.finalAnswer = true;
    		this.
    		this.q = "";
    		var relDict = this.ontConfig.getRelDict();
    		this.objectRel = {};
    		this.objectCollection.foreach(function (o) {
    			this.objectIdLabel[o.get('id')] = o.get('label');
    			if (!(o.get('label') in this.objectAttr)) {
    				this.objectAttr[o.get('label')] = this.ontConfig.get('object_attributes')[o.get('label')];
    			}
    			this.labelArray.push(o.get('label'));
    		});
    		for (var i = 0; i < this.labelArray.length; ++i) {
    			for (var j = 0; j < this.labelArray.length; ++j) {
    				if (!(this.labelArray[i]+' '+this.labelArray[j] in this.objectRel)) {
    					this.objectRel[this.labelArray[i]+' '+this.labelArray[j]] 
    						= relDict[this.labelArray[i]+' '+this.labelArray[j]];
    				}
    			}
    		}
    		createObjectsDropdown('q-attr-o');
  			createObjectsDropdown('q-rel-o1');
  			createObjectsDropdown('q-rel-o2');
  			$('#q-rel').hide();
    	},

    	render: function() {
        	this.$el.html(this.template(this.model.toJSON()));
        	return this;
        },

        createObjectsDropdown: function(cid) {
    		$('#'+cid).html('').append(
      			$('<button>', {
        			id: cid+'-objects-dropdown-btn',
        			class: "btn btn-default dropdown-toggle",
        			type: "button",
        '			data-toggle': "dropdown",
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
    		this.objectsDropdowns[cid] =
      			$('#'+cid+'-objects-dropdown-ul').on('click', 'a', function(){
        			var oname = $(this).attr('data-oname');
        			$('#'+cid+'-objects-dropdown-dsp-span')
          				.attr('data-oname', oname).html(oname +' ');
      			});
    		updateObjectsDropdown(cid);
  		}

  		updateObjectsDropdown: function(cid) {
    		this.objectsDropdowns[cid].html('');
    		this.objectsDropdowns[cid].append(
      			$('<li>', {class: "dropdown-header"}).html('Select an object')
   			);
    		this.objectCollection.foreach(function (o) {
      			this.objectsDropdowns[cid].append(
        			$('<li>').append(
          				$('<a>', {
            				class: 'msee-objects-dropdown-a',
            				href: '#',
            				'data-oname': o.get('id'),
          				}).html(o.get('id'))
        			)
      			);
      		});
    	}

    	$("#q-attr-o").on('click', '.msee-objects-dropdown-a', function(){
    		var ot = this.objectIdLabel[$(this).attr('data-oname')];
    		$('#q-attr .list-group').html('');
    		for (var i = 0; i < this.objectAttr[ot].length; ++i)
      			$('#q-attr .list-group').append(
        			$('<a>', {
          				class: 'list-group-item',
          				href: '#',
        			}).html(this.objectAttr[ot][i])
      			);
    	});

    	$(".q-rel-o").on('click', '.msee-objects-dropdown-a', function(){
    		var on1 = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname');
    		var on2 = $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname');
    		if (on1 && on2) {
      			var ot = this.objectIdLabel[on1]+' '+this.objectIdLabel[on2];
      			for (var i = 0; i < this.objectRel[ot].length; ++i)
        			$('#q-rel .list-group').append(
          				$('<a>', {
            				class: 'list-group-item',
            				href: '#',
          				}).html(this.objectRel[ot][i])
        			);
    		}
    	});

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
        			}).html('A: '+$("#predicate-answer").val())
      			).hide().fadeIn('slow')
    		);
    	}

    	$('#q-type-radios input').change(function(){
    		$('.q-info').hide();
    		$('#'+$(this).attr('data-q')).show();
  		});

  		$('#q-attr').on('click', '.list-group-item', function() {
    		this.q = $('#q-attr #q-attr-o-objects-dropdown-dsp-span').attr('data-oname') + ' ' + $(this).html() + '?';
    		this.isAttr = true;
  		});

  		$('#q-rel').on('click', '.list-group-item', function() {
    		this.q = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname')
      			+ ' ' + $(this).html() + ' '
      			+ $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname') + '?';
      		this.isAttr = false;
  		});

  		$('#q-submit-btn').click(function() {
  			if (new String($("#predicate-answer").val()).valueOf() == new String("no").valueOf()) {
  				this.finalAnswer = false;
  			}
  			this.predicates.push(this.q);
    		appendQuestion(q);
  		});

  		$('#generate-query-btn').click(function() {
  			var pred = '';
  			if (this.predicates.length > 0) {
  				pred = pred + this.predicates[0];
  				for (var i = 1; i < this.predicates.length; ++i) {
  					pred = pred + '&' + this.predicates[i];
  				}
  			}
  			this.queryCollection.create({
  				answer: this.finalAnswer,
  				session: this.session,
  				predicates: pred;
  			},{
  				wait: true
  			});
  			this.predicates = [];
  			this.finalAnswer = true;
  		});

    });
}