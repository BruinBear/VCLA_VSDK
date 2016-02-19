
define(function (require) {
    var Backbone = require('Backbone');

    var QueryView = Backbone.View.extend({

    	tagName: "div",

    	events: {
    		'click #q-attr-o': '' 
    	},

    	template: require('hbs!./../templates/QueryView'),

    	initialize: function () {
    		var objectsDropdowns = {};
    		createObjectsDropdown('q-attr-o');
  			createObjectsDropdown('q-rel-o1');
  			createObjectsDropdown('q-rel-o2');

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
    		objectsDropdowns[cid] =
      			$('#'+cid+'-objects-dropdown-ul').on('click', 'a', function(){
        			var oname = $(this).attr('data-oname');
        			$('#'+cid+'-objects-dropdown-dsp-span')
          				.attr('data-oname', oname).html(oname +' ');
      			});
    		updateObjectsDropdown(cid);
  		}

  		updateObjectsDropdown: function(cid) {
    		objectsDropdowns[cid].html('');
    		objectsDropdowns[cid].append(
      			$('<li>', {class: "dropdown-header"}).html('Select an object')
   			);
    		for (var x in objects)
      			objectsDropdowns[cid].append(
        			$('<li>').append(
          				$('<a>', {
            				class: 'msee-objects-dropdown-a',
            				href: '#',
            				'data-oname': x,
          				}).html(x)
        			)
      			);
    		}
    });
}