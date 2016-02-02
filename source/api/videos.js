var videos = function (app) {
	var videoMetas = [
		{
			socId: '1',
			videoId: 'a',
			videoUrl: 'http://vjs.zencdn.net/v/oceans.mp4'
		},
		{
			socId: '1',
			videoId: 'b',
			videoUrl: 'http://vjs.zencdn.net/v/oceans.mp4'
		},
		{
			socId: '1',
			videoId: 'c',
			videoUrl: 'http://vjs.zencdn.net/v/oceans.mp4'
		},
		{
			socId: '1',
			videoId: 'd',
			videoUrl: 'http://vjs.zencdn.net/v/oceans.mp4'
		},
		{
			socId: '1',
			videoId: 'e',
			videoUrl: 'http://vjs.zencdn.net/v/oceans.mp4'
		}
	];

	app.get('/api/videos', function (req, res) {
		res.json(videoMetas);
	});

	app.post('/api/videos', function (req, res) {
		var email = req.body;
		container.push(email);

		res.send(201);
	});
};

module.exports = videos;