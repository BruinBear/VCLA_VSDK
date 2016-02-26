define(function (require) {
  var QueryView = require('./views/QueryView');

  return {
    run: function(viewManager, sid) {
      var view = new QueryView();
      view.sid = sid;
      viewManager.show(view);
    }
  };
});
