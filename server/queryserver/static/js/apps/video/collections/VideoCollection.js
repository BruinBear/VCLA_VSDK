define(function (require) {
	var Backbone = require('Backbone');
  var BoxCollection = require('./BoxCollection');

	var VideoCollection = Backbone.Collection.extend({
    url: function() {
      return '/api/soc/' + this.sessionId + '/video/';
    },

    fetchBoxes: function() {
      var sid = this.sessionId;
      this.forEach(function(v) {
        v.boxes = new BoxCollection();
        v.boxes.sessionId = sid;
        v.boxes.videoId = v.get('id');
        v.boxes.fetch();
      });
    },

    saveBox: function(box) {
      this.get(box.video).boxes.create(box);
    }
    
  });
    
	return VideoCollection;
});
