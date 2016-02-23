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
    		}
    	},

    	getRelDict: function(){
    		relDict = {};
    		for (var key in this.relationships) {
    			var values = this.relationships[key];
    			for (var i = 0; i < values.length; ++i) {
    				for (var j = 0; j < values[i][0].length; ++j) {
    					for (var k = 0; k < values[i][1].length; ++k) {
    						if (!(values[i][j]+' '+values[i][k] in relDict)) {
    							relDict[values[i][j]+' '+values[i][k]] = key;
    						}
    					}
    				}
    			}
    		}
    		return relDict;
    	}
    });

    return OntConfig;
});