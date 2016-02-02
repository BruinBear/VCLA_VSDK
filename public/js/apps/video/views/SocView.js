define(function(require) {
	var Backbone = require('Backbone');
	var VideoView = require('./VideoView');
	var ObjectView = require('./ObjectView');
    var ObjectModel = require('../models/Object');
    var ObjectCollection = require('../collections/ObjectCollection');

	var SocView = Backbone.View.extend({
		tagName: 'div',

		events: {
			'click #newObject': 'newObject',
			'click #cancelObject': 'cancelObject',
			'click #submitObject': 'submitObject',
            'click #playButton': 'playPauseAll',
            'click .boundingBoxButton': 'newBoundingBox',
            'click .videoDiv': 'handleVideoClick'
		},

		template: require('hbs!./../templates/SocView'),

		initialize: function () {
            this.playing = false;
			this.subviews = [];
            this.videoPlayers = [];
            this.objectCollection = new ObjectCollection();
            this.objectCollection.on('change', this.renderObjectList);
            this.drawing = false;

            var cH = $('#crosshair-h'),
                cV = $('#crosshair-v');
            this.cH = cH;
            this.cV = cV;
        },

		render: function () {
            var me = this;
			this.$el.html(this.template());

			var videos = this.$('.videos');
			this.collection.forEach(function (video) {
				var view = new VideoView({model: video});
				videos.append(view.render().el);
			}, this);

            return this;
		},

        renderObject: function (obj) {
            var objectList = this.$('.objects ol');
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
			e.preventDefault();
            var obj = new ObjectModel(this.getFormData(this.$el.find('form')));
            this.objectCollection.add(obj);
            this.renderObject(obj);
			$('#overlay, #overlay-back').fadeOut(500);
			console.log('add object');
		},

		getFormData: function(form) {
			var unindexed_array = form.serializeArray();
			var indexed_array = {};

			$.map(unindexed_array, function(n, i){
				indexed_array[n['name']] = n['value'];
			});

			return indexed_array;
		},

        // Check https://bocoup.com/weblog/html5-video-synchronizing-playback-of-two-videos
        bindVideos: function() {
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
                    if (++loadCount == videos.length) {
                        // sync progress bar
                        window.setInterval( function() {
                            scrub.val(videos[0].currentTime());
                        }, 1000 );
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
                                        if(b.video.id!=videos[0].video.id)
                                            b.emit("timeupdate")
                                    });
                                    // update scrubber
                                    scrub.val(this.currentTime());
                                    return;
                                }
                                if (event === "seeking") {
                                    var ct = this.currentTime();
                                    videos.forEach(function (b) {
                                        if(b.video.id!=videos[0].video.id)
                                            b.currentTime(ct);
                                    });
                                }
                                if (event === "play" || event === "pause") {
                                    videos.forEach(function (b) {
                                        if(b.video.id!=videos[0].video.id)
                                            b[event]();
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
                    if (b.video.id!=videos[0].video.id && b.media.readyState === 4) {
                        b.currentTime(videos[0].currentTime());
                    }
                });
                requestAnimationFrame(sync);
            }
            sync();
        },

        playPauseAll: function(e) {
            var self = this;
            if(self.videoPlayers.length == 0) { // bind videos this only once
                var toAdd = self.collection.length;
                var added = 0;
                self.collection.forEach(function(v) {
                    added++;
                    self.videoPlayers.push(Popcorn('#'+ v.get('videoId')));
                    if(added === toAdd) {
                        self.bindVideos();
                    }
                });
            }
            e.preventDefault();
            if(this.playing) {
                this.collection.forEach(function (video) {
                    document.getElementById(video.get('videoId')).pause();
                }, this);
            } else {
                this.collection.forEach(function (video) {
                    document.getElementById(video.get('videoId')).play();
                }, this);
            }
            this.playing = !this.playing;
        },

        newBoundingBox: function(e) {
            var self = this;
            console.log('adding bounding box');
            self.drawing = true;
        },




	});

	return SocView;
});