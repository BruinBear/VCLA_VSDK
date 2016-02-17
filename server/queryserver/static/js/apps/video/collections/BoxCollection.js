/**
 * Created by jingyu on 1/31/16.
 */
define(function (require) {
    var Backbone = require('Backbone');
    var Box = require('./../models/Box');

    var BoxCollection = Backbone.Collection.extend({
        url: function() {
          return '/api/session/' + this.sessionId +'/video/'+ this.videoId + '/box/';
        },
        comparator: function(a, b) {
          if(a.time < b.time) {
            return -1;
          } else if (a.time > b.time) {
            return 1;
          } else {
            return 0;
          }
        },
        model: Box
    });

    return BoxCollection;
});
