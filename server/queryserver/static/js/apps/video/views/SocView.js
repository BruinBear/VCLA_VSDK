define(function (require) {
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
            'click .videoDiv': 'videoClickHandle'
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
            this.objectCollection.on("add", function (object) {
                console.log(object);
                self.renderObject(object);
            });

            this.boxCollection = new BoxCollection();
            this.boxCollection.on("add", function (box) {
                console.log(box);
                self.addBoxToJournal(box);
            });

            this.startDrawing = false;

            var cH = $('#crosshair-h'),
                cV = $('#crosshair-v');
            this.cH = cH;
            this.cV = cV;
        },

        newSession: function () {
            var self = this;
            self.session = new Session({
                'soc': 1
            });
            self.session.save(null, {
                error: function (err) {
                    console.log(err);
                },
                success: function (data) {
                    /*  after session selection fetch
                        VideoCollection
                        ObjectCollection
                        BoundingBoxCollection
                     */
                    self.videoCollection.sessionId = data.get('soc');
                    self.objectCollection.sessionId = data.get('soc');
                    self.boxCollection.sessionId = data.get('soc');

                    self.videoCollection.fetch({
                        success: function (vids) {
                            console.log(vids);
                            self.renderVideos();
                        }
                    });
                    self.objectCollection.fetch();
                    self.boxCollection.fetch();
                }
            });
        },

        loadSession: function () {

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
                var view = new VideoView({
                    model: video
                });
                videos.append(view.render().el);
            }, this);

        },

        renderObject: function (obj) {
            var objectList = $('.objects ol');
            var view = new ObjectView({
                model: obj
            });
            objectList.append(view.render().el);
        },

        newObject: function () {
            console.log('create object');
            $('#overlay, #overlay-back').fadeIn(500);
        },

        cancelObject: function (e) {
            e.preventDefault();
            console.log('cancel object');
            $('#overlay, #overlay-back').fadeOut(500);
        },

        submitObject: function (e) {
            var self = this;
            e.preventDefault();
            var attrs = this.getFormData(this.$el.find('form'));
            this.objectCollection.create({
                label: attrs.label,
                session: self.session.get('id')
            }, {
                wait: true
            });
            $('#overlay, #overlay-back').fadeOut(500);
            console.log('add object');
        },

        getFormData: function (form) {
            var unindexed_array = form.serializeArray();
            var indexed_array = {};

            $.map(unindexed_array, function (n, i) {
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

        playPauseAll: function (e) {
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
            if (this.playing) {
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
            console.log('adding bounding box');
            self.startDrawing = true;
            self.objectSelected = self.objectCollection.get($(e.target).attr('objectId'));
        },

        videoClickHandle: function (e) {
            var self = this;
            console.log(e);
            // start drawing
            if (self.startDrawing) {
                // create box
                self.boxCollection.create({
                    videoid: $(e.target).attr('videoId'),
                    objectid: self.objectSelected.get('id'),
                    time: $('#scrub').val(),
                    x: 0,
                    y: 0,
                    xlen: 0,
                    ylen: 0
                }, {
                    wait: true
                });
                console.log('inserting bounding box');
            } else {
                console.log('idle');
            }

        },

        addBoxToJournal: function (box) {
            console.log(box);
        }
    });

    return SocView;
});