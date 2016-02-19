/**
 * Created by jingyu on 1/31/16.
 */
define(function (require) {
    var Backbone = require('Backbone');

    var DisplayBoxCollection = Backbone.Collection.extend({
        comparator: function(a, b) {
          if(a.time < b.time) {
            return -1;
          } else if (a.time > b.time) {
            return 1;
          } else {
            return 0;
          }
        }
    });

    return DisplayBoxCollection;
});
