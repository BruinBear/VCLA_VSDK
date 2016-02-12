/**
 * Created by jingyu on 1/31/16.
 */
define(function (require) {
    var Backbone = require('Backbone');
    var Box = require('./../models/Box');

    var BoxCollection = Backbone.Collection.extend({
        url: '/api/box/',
        model: Box
    });

    return BoxCollection;
});
