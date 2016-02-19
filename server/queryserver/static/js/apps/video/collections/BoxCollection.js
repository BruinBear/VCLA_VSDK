/**
 * Created by jingyu on 1/31/16.
 */
define(function (require) {
    var Backbone = require('Backbone');
    var Box = require('./../models/Box');

    var BoxCollection = Backbone.Collection.extend({
        url: function() {
          return '/api/session/'+this.sid+'/object/'+this.oid+'/video/'+this.vid+'/box/';
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
        bootstrap: function(sid, oid, vid) {
          this.sid = sid;
          this.oid = oid;
          this.vid = vid;
        },
        model: Box
    });

    return BoxCollection;
});
