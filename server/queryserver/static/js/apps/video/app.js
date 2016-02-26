define(function (require) {
  var VideoView = require('./views/VideoView');

  return {
    run: function(viewManager, sid) {
      var view = new VideoView();
      view.sid = sid;
      viewManager.show(view);
    }
  };
});
