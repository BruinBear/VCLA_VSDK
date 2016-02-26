define(function(require) {
    var Backbone = require('Backbone');

    var OntConfig = Backbone.Model.extend({
    	defaults: {
    		object_attributes: {
    			'person': [
        			'male',
        			'female',
        			'running',
        			'walking',
        			'standing',
        			'sitting',
    			],
    			'hat': [],
    			'bike': [
        			'turn-left',
        			'turn-right',
    			],
    			'ball': [],
    			'disk': [],
			},
			relationships: {
    			'on': [
        			[['person'], ['bike']],
    			],
    			'wearing': [
        			[['person'], ['hat']],
    			],
    			'throwing': [
        			[['person'], [
            			'ball',
            			'disk',
        			]],
    			],
    			'catching': [
        			[['person'], [
            			'ball',
            			'disk',
        			]]
    			],
    		},
    	}
    });

    return OntConfig;
});