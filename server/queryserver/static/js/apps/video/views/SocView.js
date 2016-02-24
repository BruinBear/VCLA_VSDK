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
      'click .boxParty': 'videoClickHandle',
      'change input#scrub': 'updateBoxUI'
    },

    template: require('hbs!./../templates/SocView'),
    boxTemplate: require('hbs!./../templates/BoundingBox'),


    initialize: function () {
        var self = this;
        this.scrub = $("#scrub");
        this.clockId = null;
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

    getTime: function() {
      return this.videoPlayers[0].currentTime();
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
            console.log(key);
            var bc = new BoxCollection();
            self.boxUIPool[key] = bc;
            bc.bootstrap(sid, oid, vid);
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

    findNeighbors: function(boxes, t) {
      if(t <= boxes.at(0).get('time'))
        return {left: null, right: boxes.at(0)};
      if(t >= boxes.at(boxes.length-1).get('time'))
        return {left: null, right: boxes.at(boxes.length-1)};
      var lo = 0;
      var hi = boxes.length-1;
      while(lo+1 < hi) {
        var mid =  Math.floor((lo+hi)/2);
        var midTime = boxes.at(mid).get('time');
        if(midTime < t) {
          lo = mid;
        } else if(midTime >= t) {
          hi = mid;
        }
      }
      return {left: boxes.at(lo), right: boxes.at(hi)};
    },

    linearCombination: function(boxPair, t) {
      if(boxPair.left == null) {
        estimate = boxPair.right.toJSON();
        delete estimate.id;
        estimate.time = t;
        return estimate;
      }
      var left = boxPair.left.toJSON();
      var right = boxPair.right.toJSON();
      var lt = left.time;
      var rt = right.time;
      var offset = (t-lt)/(rt-lt);
      return {
        time: t,
        session: left.session,
        video: left.video,
        object: left.object,
        x: left.x+(right.x-left.x)*offset,
        y: left.y+(right.y-left.y)*offset,
        xlen: left.xlen+(right.xlen-left.xlen)*offset,
        ylen: left.ylen+(right.ylen-left.ylen)*offset
      }
    },

    estimateBox: function(boxes, time) {
      var self = this;
      var neighbors = self.findNeighbors(boxes, time);
      var box = self.linearCombination(neighbors, time);
      return box;
    },

    updateBoxUI: function() {
      var self = this;
      var time = self.getTime();
      for (var key in self.boxUIPool) {
        var boxes = self.boxUIPool[key];
        if(boxes.length == 0) {
          boxes.UI.hide();
          continue;
        } else {
          boxes.UI.show();
        }
        var pos = self.estimateBox(boxes, time); 
        $(boxes.UI).css({
          width: pos.xlen,
          height: pos.ylen,
          left: pos.x,
          top: pos.y
        });
      }
    },

    addBoxUI: function(boxes) {
      var self= this;
      var boxEl = $(self.boxTemplate(boxes));
      boxes.UI = boxEl;
      var boxUI = $('[boxpartyid="'+boxes.vid+'"]').append(boxEl);
      $(boxEl).hide();
      if(boxes.length > 0) {
        var first = boxes.at(0);
        $(boxEl).css({
          left: first.x,
          top: first.y,
          width: first.xlen,
          height: first.ylen
        });
      }
      self.$(boxEl).resizable({
        start: function(e, ui) {
          self.pauseAll();
          self.resizeStart = e;
        },
        stop: function(e, ui) {
          var newBox = self.estimateBox(boxes, self.getTime());  
          newBox.xlen += e.pageX-self.resizeStart.pageX;
          newBox.ylen += e.pageY-self.resizeStart.pageY;
          boxes.create(newBox);
        }
      }).draggable({
        containment: 'parent',
        start: function(e, ui) {
          self.pauseAll();
          self.dragStart = e;
        },
        stop: function(e, ui) {
          var newBox = self.estimateBox(boxes, self.getTime());  
          newBox.x += e.pageX-self.dragStart.pageX;
          newBox.y += e.pageY-self.dragStart.pageY;
          boxes.create(newBox);
        }
      });
    },

    getBoxUI: function(vid, oid) {
      return $('div.boundingBox[vid="vid"][oid="oid"]');
    },

    getBoxCollection: function(oid, vid) {
      return this.boxUIPool[this.getUIBoxKey(oid, vid)];
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
      var self = this;
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
                if (Math.abs(b.currentTime() - syncedTime) > 1.5 &&
                    b.media.readyState === 4) {
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
          var scrub = $("#scrub");
          self.clockId = window.setInterval(function () {
              scrub.val(self.videoPlayers[0].currentTime());
              self.updateBoxUI();
          }, 100);
          self.videoPlayers.forEach(function (player) {
            player.play();
          }, this);

        },

        pauseAll: function() {
          var self = this;
          window.clearInterval(self.clockId);
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
            self.startPos = {X: e.offsetX, Y: e.offsetY};
            self.addState = 2;
            self.clickVid = $(e.target).attr('boxpartyid');
          } else if(this.addState==2) {
            console.log('second pos');
            if($(e.target).attr('boxpartyid') !== self.clickVid) { // skip if clicked different video
              return;
            }
            var newBox = {
              session: self.session.get('id'),
              time: self.getTime(),
              x: Math.min(self.startPos.X, e.offsetX),
              y: Math.min(self.startPos.Y, e.offsetY),
              xlen: Math.abs(e.offsetX - self.startPos.X),
              ylen: Math.abs(e.offsetY - self.startPos.Y),
              object: parseInt(self.clickOid),
              video: parseInt(self.clickVid)
            };
            var toBeAdded = self.getBoxCollection(self.clickOid, self.clickVid);
            toBeAdded.create(newBox);
            self.addState = 0;
          }
        },
    });

    return SocView;
});
