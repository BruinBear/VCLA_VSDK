define(function(require) {
  var Backbone = require('Backbone');

  var Session = require('../models/Session');
  var ObjectModel = require('../models/Object');

  var ObjectCollection = require('../collections/ObjectCollection');
  var VideoCollection = require('../collections/VideoCollection');
  var BoxCollection = require('../collections/BoxCollection');
  var VideoView = require('./VideoView');
  var ObjectView = require('./ObjectView');

  var SocView = Backbone.View.extend({
    tagName: 'div',

    events: {
      'click #newSession': 'newSession',
      'click #loadSession': 'loadSession',
      'click #newObject': 'newObject',
      'click #cancelObject': 'cancelObject',
      'click #submitObject': 'submitObject',
      'click #playButton': 'playAll',
      'click #pauseButton': 'pauseAll',
      'click .boundingBoxButton': 'newBoundingBox',
      'click video': 'videoClickHandle'
    },

    template: require('hbs!./../templates/SocView'),
    boxTemplate: require('hbs!./../templates/BoundingBox'),


    initialize: function () {
        var self = this;
        this.scrub = $("#scrub"),

        this.playing = false;
        this.subviews = [];
        this.videoPlayers = [];

        this.videoCollection = new VideoCollection();
  
        this.objectCollection = new ObjectCollection();
        this.objectCollection.on("add", function(object) {
          console.log(object);
          self.renderObject(object);
        });

        // fetch box
        this.boxUIPool = [];
        this.startDrawing = false;

        // box states
        this.preload = 0;
        this.clickOid = null;
        this.clickVid = null;
        this.addState = 0;
        this.startPos = null;
        this.endPos = null;
    },

    newSession: function () {
      var self = this;
      self.session = new Session({'soc': 1});
      self.session.save(null, {
        error: function(err) {
          console.log(err);
        },
        success: function(data) {
          self.afterSessionLoaded(data);
        }
      });
    },

    loadSession: function () {
      var self = this;
      self.session = new Session({'id': 1});
      self.session.fetch({
        error: function(err) {
          console.log(err);
        },
        success: function(data) {
          self.afterSessionLoaded(data);
        }
      });
    },

    afterSessionLoaded: function(data) {
      var self = this;
      self.videoCollection.sessionId = data.get('soc');
      self.objectCollection.sessionId = data.get('soc');
      self.videoCollection.fetch({
        success: function(vids) {
          self.renderVideos();
          self.tryLoadBoxes();
        }
      });
      self.objectCollection.fetch({
        success: function(objects) {
          self.tryLoadBoxes();
        }
      });
    },

    getUIBoxKey: function(oid, vid) {
      return 'o'+oid+'v'+vid;
    },

    tryLoadBoxes: function(boxes) {
      var self = this;
      if(self.preload === 0) {
        self.preload = 1;
      } else {
        self.objectCollection.forEach(function(object) {
          self.videoCollection.forEach(function(video) {
            var sid = self.session.get('id');
            var oid = object.get('id');
            var vid = video.get('id');
            var key = self.getUIBoxKey(oid, vid);
            var bc = new BoxCollection();
            self.boxUIPool[key] = bc;
            bc.bootstrap(sid, oid, sid);
            bc.fetch({
              success: function(boxes) {
                console.log(boxes);
                self.addBoxUI(boxes);
              }
            })
          });
        });
      }
    },

    addBoxUI: function(boxes) {
      var self= this;
      var boxEl = $(self.boxTemplate(boxes));
      var boxUI = $('[boxPartyId="'+boxes.vid+'"]').append(boxEl);
      self.$(boxEl).resizable({
        stop: function(e, ui) {
          var x = $(e.target).offset().left;
          var y = $(e.target).offset().top;
          var xlen = $(e.target).width;
          var ylen = $(e.target).height;
        }
      }).draggable({
        containment: 'parent',
        start: function(e, ui) {
          console.log(e);
        },
        stop: function(e, ui) {
          console.log(e)
        }
      });
    },

    render: function () {
      var me = this;
      this.$el.html(this.template());
      return this;
    },

    renderVideos: function () {
      var self = this;
      var videos = this.$('.videos');
      self.videoCollection.forEach(function (video) {
        var view = new VideoView({model: video});
        videos.append(view.render().el);
      }, this);

    },

    renderObject: function (obj) {
      var objectList = $('.objects ol');
      var view = new ObjectView({model: obj});
      objectList.append(view.render().el);
    },

    newObject: function () {
        console.log('create object');
        $('#overlay, #overlay-back').fadeIn(500);
    },

    cancelObject: function(e) {
        e.preventDefault();
        console.log('cancel object');
        $('#overlay, #overlay-back').fadeOut(500);
    },

    submitObject: function(e) {
      var self = this;
      e.preventDefault();
      var attrs = this.getFormData(this.$el.find('form'));
      this.objectCollection.create({
        label: attrs.label,
        session: self.session.get('id')
      },{
        wait: true
      });
      $('#overlay, #overlay-back').fadeOut(500);
      console.log('add object');
    },

    getTime: function() {
      return $('#scrub').val();
    },


    getFormData: function(form) {
      var unindexed_array = form.serializeArray();
      var indexed_array = {};

      $.map(unindexed_array, function(n, i){
        indexed_array[n.name] = n.value;
      });

      return indexed_array;
    },
        
        // Check https://bocoup.com/weblog/html5-video-synchronizing-playback-of-two-videos
    bindVideos: function () {
      var videos = this.videoPlayers;
      var scrub = $("#scrub"),
          loadCount = 0,
          events = "play pause timeupdate seeking".split(/\s+/g);
      // iterate both media sources
      Popcorn.forEach(videos, function (media, type) {
        // when each is ready...
        media.on("canplayall", function () {
            // trigger a custom "sync" event
            this.emit("sync");
            // set the max value of the "scrubber"
            scrub.attr("max", this.duration());
            // Listen for the custom sync event...
        }).on("sync", function () {
            // Once both items are loaded, sync events
            if (++loadCount === videos.length) {
                // sync progress bar
                window.setInterval(function () {
                    scrub.val(videos[0].currentTime());
                }, 1000);
                // Iterate all events and trigger them on the video B
                // whenever they occur on the video A
                events.forEach(function (event) {
                    videos[0].on(event, function () {
                        // Avoid overkill events, trigger timeupdate manually
                        if (event === "timeupdate") {
                            if (!this.media.paused) {
                                return;
                            }
                            videos.forEach(function (b) {
                                if (b.video.id !== videos[0].video.id) {
                                    b.emit("timeupdate");
                                }
                            });
                            // update scrubber
                            scrub.val(this.currentTime());
                            return;
                        }
                        if (event === "seeking") {
                            var ct = this.currentTime();
                                    videos.forEach(function (b) {
                                        if (b.video.id !== videos[0].video.id) {
                                            b.currentTime(ct);
                                        }
                                    });
                                }
                                if (event === "play" || event === "pause") {
                                    videos.forEach(function (b) {
                                        if (b.video.id !== videos[0].video.id) {
                                            b[event]();
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            });

            scrub.bind("change", function () {
                var val = this.value;
                videos.forEach(function (b) {
                    b.currentTime(val)
                });
            });

            // With requestAnimationFrame, we can ensure that as
            // frequently as the browser would allow,
            // the video is resync'ed.
            function sync() {
    var syncedTime = videos[0].currentTime();
                videos.forEach(function (b, time) {
                    if (Math.abs(b.currentTime() - syncedTime) > 0.5 && b.media.readyState === 4) {
                        b.currentTime(videos[0].currentTime());
                    }
                });
                requestAnimationFrame(sync);
            }
            sync();
        },

        playAll: function() {
          var self = this;
          if (self.videoPlayers.length === 0) { // bind videos this only once
            var toAdd = self.videoCollection.length;
            var added = 0;
            self.videoCollection.forEach(function (v) {
              added++;
              self.videoPlayers.push(Popcorn('#video' + v.get('id')));
              if (added === toAdd) {
                self.bindVideos();
              }
            });
          }
          self.videoCollection.forEach(function (video) {
            document.getElementById('video' + video.get('id')).play();
          }, this);

        },

        pauseAll: function() {
          var self = this;
          self.videoCollection.forEach(function (video) {
            document.getElementById('video' + video.get('id')).pause();
          }, this);
        },

        newBoundingBox: function (e) {
            var self = this;
            self.pauseAll();
            self.addState = 1;
            console.log('adding bounding box');
            self.addState = true;
            self.clickOid = $(e.target).attr('objectId');
        },

        videoClickHandle: function(e) {
          var self = this;
          if(this.addState == 0) {
            return;
          } else if(this.addState==1) {
            self.startPos = {X: e.clientX, Y: e.clientY};
            self.addState = 2;
            self.clickVid = $(e.target).attr('videoid');
          } else if(this.addState==2) {
            console.log('second pos');
            if($(e.target).attr('videoid') !== self.clickVid) { // skip if clicked different video
              return;
            }
            var newBox = {
              time: self.getTime(),
              x: self.startPos.X,
              y: self.startPos.Y,
              xlen: e.clientX - self.startPos.X,
              ylen: e.clientY - self.startPos.Y,
              object: parseInt(self.clickOid),
              video: parseInt(self.clickVid)
            };
//            self.saveBox(newBox);
            self.addState = 0;
          }
        },
    });

    return SocView;
});
