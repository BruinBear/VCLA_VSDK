/**
 * Created by jingyu on 1/31/16.
 */
define(function (require) {
    var Backbone = require('Backbone');
    var Object = require('./../models/Object');

    var ObjectCollection = Backbone.Collection.extend({
        url: '/api/object',
        model: Object
    });

    return ObjectCollection;
});
