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
      'click #playButton': 'playPauseAll',
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

        this.startDrawing = false;

        var cH = $('#crosshair-h'),
        cV = $('#crosshair-v');
        this.cH = cH;
        this.cV = cV;

        // box states
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
          /*  after session selection fetch
              VideoCollection
              ObjectCollection
              BoundingBoxCollection
           */
          self.videoCollection.sessionId = data.get('soc');
          self.objectCollection.sessionId = data.get('soc');

          self.videoCollection.fetch({
            success: function(vids) {
              console.log(vids);
              self.renderVideos();
              vids.fetchBoxes();// populate boxes for each video
            }
          });
          self.objectCollection.fetch();
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
          /*  after session selection fetch
              VideoCollection
              ObjectCollection
              BoundingBoxCollection
           */
          self.videoCollection.sessionId = data.get('soc');
          self.objectCollection.sessionId = data.get('soc');

          self.videoCollection.fetch({
            success: function(vids) {
              console.log(vids);
              self.renderVideos();
              vids.fetchBoxes();// populate boxes for each video
            }
          });
          self.objectCollection.fetch();
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
      var self = this;
      return self.videoPlayers[0].currentTime();
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
                videos.forEach(function (b, time) {
                    if (b.video.id !== videos[0].video.id && b.media.readyState === 4) {
                        b.currentTime(videos[0].currentTime());
                    }
                });
                requestAnimationFrame(sync);
            }
            sync();
        },

        playPauseAll: function() {
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
            e.preventDefault();
            if(this.playing) {
                self.videoCollection.forEach(function (video) {
                    document.getElementById('video' + video.get('id')).pause();
                }, this);
            } else {
                self.videoCollection.forEach(function (video) {
                    document.getElementById('video' + video.get('id')).play();
                }, this);
            }
            this.playing = !this.playing;
        },

        newBoundingBox: function (e) {
            var self = this;
            self.playPauseAll();
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

            self.saveBox(newBox);
            self.addState = 0;
          }
        },

        saveBox: function(box) {
          this.videoCollection.saveBox(box);
        },

        addBoxToJournal: function(box) {
          console.log(box);
        } 
    });

    return SocView;
});
