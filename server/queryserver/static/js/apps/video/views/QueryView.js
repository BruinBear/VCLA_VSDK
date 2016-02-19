
define(function (require) {
    var Backbone = require('Backbone');

    var OntConfig = require('../models/OntConfig');

    var QueryView = Backbone.View.extend({

    	tagName: "div",

    	template: require('hbs!./../templates/QueryView'),

    	initialize: function () {
    		this.objectsDropdowns = {};
    		this.objectIdLabel = {};
    		this.ontConfig = new OntConfig();
    		this.objectAttr = {};
    		this.objectRel = {};
    		this.labelArray = [];
    		var relDict = this.ontConfig.getRelDict();
    		this.objectRel = {};
    		this.objectCollection.foreach(function (o) {
    			this.objectIdLabel[o.get('id')] = o.get('label');
    			if (!(o.get('label') in this.objectAttr)) {
    				this.objectAttr[o.get('label')] = this.ontConfig.get('object_attributes')[o.get('label')];
    			}
    			this.labelArray.push(o.get('label'));
    		});

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
      			var ot = objects[on1].objType+' '+objects[on2].objType;
      			for (var i = 0; i < oRel[ot].length; ++i)
        			$('#q-rel .list-group').append(
          				$('<a>', {
            				class: 'list-group-item',
            				href: '#',
          				}).html(oRel[ot][i])
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
        			}).html('A: Yes')
      			).hide().fadeIn('slow')
    		);
    	}

    	$('#q-type-radios input').change(function(){
    		$('.q-info').hide();
    		$('#'+$(this).attr('data-q')).show();
  		});

  		$('#q-attr').on('click', '.list-group-item', function() {
    		var q = $('#q-attr #q-attr-o-objects-dropdown-dsp-span').attr('data-oname') + ' ' + $(this).html() + '?';
    		appendQuestion(q);
  		});

  		$('#q-rel').on('click', '.list-group-item', function() {
    		var q = $('#q-rel-o1-objects-dropdown-dsp-span').attr('data-oname')
      			+ ' ' + $(this).html() + ' '
      			+ $('#q-rel-o2-objects-dropdown-dsp-span').attr('data-oname') + '?';
    		appendQuestion(q);
  		});

    });
}