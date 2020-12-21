/* ////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////// DOCUMENT /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* -------------------------------------------------------------------- READY --- */
$(init);

/* --------------------------------------------------------------------- INIT --- */
function init() {
	(async function() {
		// browser
		browser_init();

		// map
		await map_init();

		// track
		track_init();

		// detail
		detail_init();

		// control
		control_init();
	})();
}


/* ////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////// BROWSER /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function browser_init() {
	// load
	browser_load();

	// resize
	browser_resize();
}

/* --------------------------------------------------------------------- LOAD --- */
function browser_load() {
	// remove load class
	setTimeout(function() { $('html').removeClass('browser_load'); }, 32);
}

/* ------------------------------------------------------------------- RESIZE --- */
function browser_resize() {
	var timer;

	// listen for resize
	$(window).on('resize', function() {
		// destroy timer
		clearTimeout(timer);

		// debounce
		timer = setTimeout(function() {
			// remove resize class
			$('html').removeClass('browser_resize');
		}, 320);

		// add resize class
		$('html').addClass('browser_resize');
	});
}


/* ////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// MAP /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function map_init() {
	return new Promise(async function(resolve, reject) {
		// render
		await map_render();

		// resolve
		resolve();
	});
}

/* ------------------------------------------------------------------- RENDER --- */
function map_render() {
	return new Promise(async function(resolve, reject) {
		var $canvas,
			$map;

		// cache elements
		$map = $('section.map');
		$canvas = $map.find('.canvas');

		// set access token
		mapboxgl.accessToken = MAPBOX.token;

		// initialize map
		MAP.ctx = new mapboxgl.Map({
			style: MAP.style.active,
			center: [0, 0,],
			minZoom: 1,
			maxZoom: 18,
			container: $canvas[0],
			attributionControl: false,
			preserveDrawingBuffer: true,
		});

		// set map initial boundary
		map_bound([[5.6431, 59.5208,], [-13.7688, 49.8376,],]);

		// listen for load	
		MAP.ctx.on('load', function() {
			// remove event listener
			MAP.ctx.off('load');
			
			// resolve
			resolve();
		});
	});
}

/* -------------------------------------------------------------------- BOUND --- */
function map_bound(bound) {
	// bail when map not initialized
	if (typeof MAP.ctx === 'undefined') return;

	var padding,
		camera;

	// store map padding
	padding = map_padding();

	// determine camera
	camera = MAP.ctx.cameraForBounds(bound, { padding: padding, });

	// center on camera
	MAP.ctx.flyTo(camera);
}

/* -------------------------------------------------------------------- STYLE --- */
function map_style(style) {
	return new Promise(function(resolve, reject) {
		// bail when map not initialized
		if (typeof MAP.ctx === 'undefined') return resolve();

		// bail when attempting to set same style
		if (MAP.style.active === style) return resolve();

		// set style
		MAP.ctx.setStyle(style);

		// listen for style.load
		MAP.ctx.on('style.load', function() {
			// remove event listener
			MAP.ctx.off('style.load');

			// store active style
			MAP.style.active = style;

			// resolve
			resolve();
		});
	});
}

/* ------------------------------------------------------------------ PADDING --- */
function map_padding() {
	// bail when map not initialized
	if (typeof MAP.ctx === 'undefined') return;

	var $map;
	var padding;

	// cache elements
	$map = $('section.map');

	// determine map padding
	padding = {
		top: $map.css('padding-top'),
		right: $map.css('padding-right'),
		bottom: $map.css('padding-bottom'),
		left: $map.css('padding-left'),
	};

	// format padding
	Object.keys(padding).map(function(key) { padding[key] = parseInt(padding[key]); });

	return padding;
}

/* ------------------------------------------------------------ LAYER : PURGE --- */
function map_layer_purge(id) {
	// bail when map not initialized
	if (typeof MAP.ctx === 'undefined') return;

	// remove layer
	if (MAP.ctx.getLayer(id)) MAP.ctx.removeLayer(id);
}

/* ------------------------------------------------------- COORDINATE : BOUND --- */
function map_coordinate_bound(coordinate) {
	// reduce coordinates to bounds
	bound = coordinate.reduce(function(bound, coordinate) {
		return bound.extend(coordinate);
	}, new mapboxgl.LngLatBounds(coordinate[0], coordinate[1]));

	return bound;
}

/* ---------------------------------------------------------- FEATURE : STATE --- */
function map_feature_state(source, id, key, state) {
	// bail when map not initialised
	if (typeof MAP.ctx === 'undefined') return;

	// set featured state
	MAP.ctx.setFeatureState({ source: source, id: id, }, { [key]: state, });
}

/* ---------------------------------------------------------- FEATURE : QUERY --- */
function map_feature_query(source, point) {
	// bail when map not initialised
	if (typeof MAP.ctx === 'undefined') return;

	var feature;

	// build enlarged click bound
	bound = [[(point.x - 2), (point.y - 2),], [(point.x + 2), (point.y + 2),],];
	// query bound for feature
	feature = MAP.ctx.queryRenderedFeatures(bound, { layers: [source,], })[0];

	return feature;
}


/* ////////////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////// TRACK /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function track_init() {
	// prepare
	track_prepare();

	// listen
	track_listen();
}

/* ------------------------------------------------------------------- LISTEN --- */
function track_listen() {
	// listen for mousemove
	MAP.ctx.on('mousemove', 'track-default', async function(event) {
		var feature,
			point,
			track;

		// store event point
		point = event.transformedPoint;

		// query feature
		feature = map_feature_query('track-default', point);

		// bail when feature is active
		if (typeof feature !== 'undefined' && typeof TRACK.state.hover !== 'undefined') return;

		// mouseleave feature
		if (typeof feature === 'undefined' && typeof TRACK.state.hover !== 'undefined') {
			// remove feature state
			track_feature_remove(TRACK.state.hover, 'hover');

			// unset cursor style
			MAP.ctx.getCanvas().style.cursor = 'unset';

			return;
		}

		// bail when no feature is found
		if (typeof feature === 'undefined') return;

		// prevent hover on active state
		if (typeof TRACK.state.active !== 'undefined' && feature.id === TRACK.state.active.id) return;

		// set cursor style
		MAP.ctx.getCanvas().style.cursor = 'pointer';

		// track
		track = JSON.parse(feature.properties.track);

		// add track hover state
		TRACK.state.hover = feature;
		track_feature_hover(track, feature);
	});

	// listen for click
	MAP.ctx.on('click', 'track-default', async function(event) {
		var feature,
			point,
			track;
		
		// store event point
		point = event.transformedPoint;

		// query feature
		feature = map_feature_query('track-default', point);

		// bail when no feature is found
		if (typeof feature === 'undefined') return;

		// determine whether active state should be removed
		if (typeof TRACK.state.active !== 'undefined') {
			// remove feature state
			track_feature_remove(TRACK.state.active, 'active');
		}

		// track
		track = JSON.parse(feature.properties.track);

		// active
		track_active(track, feature);

		// update url
		history.replaceState({}, {}, [ROOT_URL, ['track', track.id,].join('/'),].join('/'));
	});
}

/* ------------------------------------------------------------------ PREPARE --- */
function track_prepare() {
	(async function() {
		var feature,
			active,
			track,
			id;

		// store url id
		id = location.href.split('/').pop();

		// loop through file paths
		for (var i = 0; i < FILE.length; i ++) {
			// request
			track = await track_request(FILE[i]);

			// store track data
			TRACK.item.push(track);
		}

		// draw
		await track_draw();

		// attempt to retrieve active track
		active = $.grep(TRACK.item, function(track) { return track.id === id; })[0];

		// determine whether active track exists
		if (typeof active !== 'undefined') {
			// retrieve feature from source features
			feature = $.grep(MAP.ctx.querySourceFeatures('track', { sourceLayer: 'track-default', }), function(feature) {
				return feature.properties.id === active.id;
			});

			// track
			track_active(active, feature);
		}
		// center
		else track_center();
	})();
}

/* ------------------------------------------------------------------ REQUEST --- */
function track_request(file) {
	// promise
	return new Promise(async function(resolve, reject) {
		var track,
			path;

		// store file path
		path = ROOT_URL + [DIR_TMP, 'track', file,].join('/');
		// retrieve track
		track = await $.getJSON(path);

		// resolve
		resolve(track);
	});
}

/* ------------------------------------------------------------------- SOURCE --- */
function track_source() {
	var source;

	// destroy track source
	if (MAP.ctx.getSource('track')) MAP.ctx.removeSource('track');

	// build track data source
	source = { type: 'geojson', data: { type: 'FeatureCollection', features: [], }, generateId: true, };

	// loop through data tracks
	for (var i = 0; i < TRACK.item.length; i++) {
		var coordinate,
			feature,
			track,
			color;

		// store current track
		track = TRACK.item[i];

		// store track point coordinates
		coordinate = track_coordinate(track);

		// determine track color depending on distance
		color = track_color(track);

		// build source feature
		feature = {
			type: 'Feature',
			properties: { id: track.id, color: color, track: JSON.stringify(track), },
			geometry: { type: 'LineString', coordinates: coordinate, },
		};
		// add feature to source
		source.data.features.push(feature);
	}

	// append source to map
	MAP.ctx.addSource('track', source);
}

/* --------------------------------------------------------------- COORDINATE --- */
function track_coordinate(track) {
	var coordinate;

	// retrieve track point coordinates
	coordinate = track.point.map(function(point) { return point.coordinate.map(parseFloat); });

	return coordinate;
}

/* -------------------------------------------------------------------- COLOR --- */
function track_color(track) {
	var color;
	
	// determine track color depending on distance
	if (track.distance.total <= 5000) color = 'rgba(0, 168, 255, 1)';
	else if (track.distance.total <= 10000) color = 'rgba(76, 209, 55, 1)';
	else if (track.distance.total <= 15000) color = 'rgba(251, 197, 49, 1)';
	else if (track.distance.total <= 20000) color = 'rgba(232, 65, 24, 1)';
	else color = 'rgba(47, 54, 64, 1)';

	return color;
}

/* -------------------------------------------------------------------- STYLE --- */
function track_style() {
	// toggle style
	if (TRACK.style === 'default') TRACK.style = 'heatmap';
	else if (TRACK.style === 'heatmap') TRACK.style = 'default';

	// draw
	track_draw();

	// center
	track_center();
}

/* ------------------------------------------------------------------- CENTER --- */
function track_center() {
	var coordinate,
		bound;

	// merge track coordinate
	coordinate = TRACK.item.flatMap(function(track) { return track_coordinate(track); })
	// reduce coordinates to bound
	bound = map_coordinate_bound(coordinate);

	// bound
	map_bound(bound);
}

/* -------------------------------------------------------------------- LAYER --- */
function track_layer(id, paint) {
	var layer;

	layer = {
		id: id,
		type: 'line',
		source: 'track',
		layout: {
			'line-cap': 'round',
			'line-join': 'round',
		},
		paint: paint,
	};

	return layer;
}

/* --------------------------------------------------------------------- DRAW --- */
function track_draw() {
	// promise
	return new Promise(async function(resolve, reject) {
		// default
		if (TRACK.style === 'default') await track_draw_default();
		// heatmap
		else if (TRACK.style === 'heatmap') await track_draw_heatmap();

		// resolve
		resolve();
	});
}

/* ------------------------------------------------------------------- ACTIVE --- */
function track_active(track, feature) {
	var coordinate,
		bound;

	// add track active state
	TRACK.state.active = feature;
	track_feature_active(track, feature);

	// store track point coordinate
	coordinate = track_coordinate(track);
	// reduce coordinates to bound
	bound = map_coordinate_bound(coordinate);

	// add active class
	$('html').addClass('detail_active');
	// remove display class
	$('aside.detail').removeClass('display');

	// bound
	map_bound(bound);

	// listen for moveend
	MAP.ctx.once('moveend', function() {
		// add display class
		$('aside.detail[data-track-id='+ track.id +']').addClass('display');
	});
}

/* ----------------------------------------------------------- DRAW : DEFAULT --- */
function track_draw_default() {
	// promise
	return new Promise(async function(resolve, reject) {
		var paint,
			style,
			layer;

		// define layer paint
		paint = { 
			'line-width': [
				'interpolate',
				['exponential', 1.5],
				['zoom'],
				5, 1,
				13, 2,
				18, 4,
			],
			'line-color': ['get', 'color',],
		};

		// store style
		style = MAP.style[TRACK.style];

		// style
		await map_style(style);

		// purge heatmap track
		map_layer_purge('track-heatmap-base');
		map_layer_purge('track-heatmap-density');

		// rebuild source
		track_source();

		// layer
		layer = track_layer('track-default', paint);
		// append layer to map
		MAP.ctx.addLayer(layer, 'waterway-label');

		// resolve
		MAP.ctx.once('idle', resolve);
	});
}

/* ----------------------------------------------------------- DRAW : HEATMAP --- */
function track_draw_heatmap() {
	// promise
	return new Promise(async function(resolve, reject) {
		var paint,
			style,
			layer;

		// define layer paint
		paint = { 
			'line-width': 1.5,
			'line-color': 'rgba(152, 0, 67, 1)',
			'line-opacity': 0.375,
		};

		// store style
		style = MAP.style[TRACK.style];

		// style
		await map_style(style);

		// purge default track
		map_layer_purge('track-default');

		// rebuild source
		track_source();

		// layer
		layer = {
			'id': 'track-heatmap-density',
			'type': 'heatmap',
			'source': 'track',
			'maxzoom': 20.1,
			'paint': {
				'heatmap-weight': [
					'interpolate', ['exponential', 1.5,],
					['zoom',],
					0, ['interpolate', ['linear',],
						['get', 'density',], 0, 0, 25, 1,
					],
					18.1, ['interpolate', ['linear',],
						['get', 'density',], 0, 0, 15, 1,
					],
				],
				'heatmap-color': [
					'interpolate', ['linear',],
					['heatmap-density',],
					0, 'rgba(0, 0, 0, 0)',
					0.2, 'rgba(0, 0, 0, 0)',
					0.4, 'rgba(221, 28, 119, 1)',
					0.6, 'rgba(223, 101, 176, 1)',
					0.8, 'rgba(215, 181, 216, 1)',
					1, 'rgba(241, 238, 246, 1)',
				],
				'heatmap-radius': [
					'interpolate', ['exponential', 1.5,],
					['zoom',],
					0, 5,
					18.1, 20,
				],
				'heatmap-intensity': [
					'interpolate', ['linear',],
					['zoom',],
					0, 0.25,
					0.99, 1,
					1, 0.25,
					1.99, 1,
					2, 0.25,
					2.99, 1,
					3, 0.25,
					3.99, 1,
					4, 0.25,
					4.99, 1,
					5, 0.25,
					5.99, 1,
					6, 0.25,
					6.99, 1,
					7, 0.25,
					7.99, 1,
					8, 0.25,
					8.99, 1,
					9, 0.25,
					9.99, 1,
					10, 0.25,
					10.99, 1,
					11, 0.25,
					11.99, 1,
					12, 0.25,
					18.99, 2,
				],
				'heatmap-opacity': [
					'interpolate', ['exponential', 1.5,],
					['zoom',],
					16, 1,
					18.1, 0.6,
				],
			},
		};
		// append layer to map
		MAP.ctx.addLayer(layer, 'waterway-label');

		// layer
		layer = track_layer('track-heatmap-base', paint);
		// append layer to map
		MAP.ctx.addLayer(layer, 'track-heatmap-density');

		// resolve
		MAP.ctx.once('idle', resolve);
	});
}

/* ---------------------------------------------------------- FEATURE : HOVER --- */
function track_feature_hover(track, feature) {
	var before,
		layer,
		id;

	// generate layer id
	id = ['track', 'hover', feature.id,].join('-');

	// build map layer
	layer = {
		id: id,
		type: 'line',
		source: 'track',
		layout: {
			'line-cap': 'round',
			'line-join': 'round',
		},
		paint: { 
			'line-width': [
				'interpolate',
				['exponential', 1.5],
				['zoom'],
				5, 1.5,
				13, 3,
				18, 6,
			],
			'line-color': feature.properties.color,
		},
		filter: ['==', ['get', 'id',], track.id,],
	};

	// determine whether to place layer before track active layer
	if (MAP.ctx.getLayer('track-active')) before = 'track-active';

	// append layer to map
	MAP.ctx.addLayer(layer, before);
}

/* --------------------------------------------------------- FEATURE : ACTIVE --- */
function track_feature_active(track, feature) {
	var layer,
		id;

	// generate layer id
	id = ['track', 'active', feature.id,].join('-');

	// build map layer
	layer = {
		id: id,
		type: 'line',
		source: 'track',
		layout: {
			'line-cap': 'round',
			'line-join': 'round',
		},
		paint: { 
			'line-width': [
				'interpolate',
				['exponential', 1.5],
				['zoom'],
				5, 2,
				13, 4,
				18, 8,
			],
			'line-color': 'rgba(221, 28, 119, 1)',
		},
		filter: ['==', ['get', 'id',], track.id,],
	};
	// append layer to map
	MAP.ctx.addLayer(layer);
}

/* --------------------------------------------------------- FEATURE : REMOVE --- */
function track_feature_remove(feature, state) {
	var id;

	// generate layer id
	id = ['track', state, feature.id,].join('-');

	// remove track state layer
	MAP.ctx.removeLayer(id);
	TRACK.state[state] = undefined;
}

/* ----------------------------------------------------------- DETAIL : RESET --- */
function track_detail_reset() {
	// determine whether active state should be removed
	if (typeof TRACK.state.active !== 'undefined') {
		// remove feature state
		track_feature_remove(TRACK.state.active, 'active');
	}

	// remove active class
	$('html').removeClass('detail_active');
	// remove display class
	$('aside.detail').removeClass('display');

	// purge url
	history.replaceState({}, {}, ROOT_URL);
}


/* ////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////// DETAIL /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function detail_init() {
	// sticky
	detail_sticky();
}

/* ------------------------------------------------------------------- STICKY --- */
function detail_sticky() {
	// listen for scroll
	$('aside.detail').find('.scroll').on('scroll', function() {
		var $detail,
			$meta;
		var scroll,
			height;

		// cache elements
		$detail = $(this).closest('aside.detail');
		$meta = $detail.find('.meta');

		// store scroll
		scroll = $detail.find('.scroll').scrollTop();

		// bail when scroll at top
		if (scroll === 0) {
			// remove stuck attribute
			$detail.find('h2').removeAttr('stuck');
			
			return;
		}

		// store meta height
		height = $meta.outerHeight();

		// loop though heading
		$detail.find('h2').each(function() {
			var $h2;
			var offset;

			// cache element
			$h2 = $(this);

			// store heading offset
			offset = $h2.position().top;

			// toggle stuck attribute
			if ((offset - height) === 0) $h2.attr('stuck', '');
			else $h2.removeAttr('stuck');
		});
	});
}


/* ////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////// CONTROL /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function control_init() {
	// listen
	control_listen();
}

/* ------------------------------------------------------------------- LISTEN --- */
function control_listen() {
	var $control;

	// cache element
	$control = $('aside.control');

	// listen for click
	$control.find('[data-func=track_center]').on('click', function() {
		// reset detail aside
		track_detail_reset();

		// center
		track_center();
	});
	
	// listen for click
	$control.find('[data-func=track_style]').on('click', function() {
		// toggle active class
		$(this).toggleClass('active');
		
		// reset detail aside
		track_detail_reset();
		
		// style
		track_style();
	});
}
