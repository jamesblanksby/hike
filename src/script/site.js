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
	bound = [[(point.x - 2), (point.y - 2),], [(point.x + 2), (point.y + 2),]];
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
	// track_listen();
}

/* ------------------------------------------------------------------- LISTEN --- */
function track_listen() {
	var state = { hover: undefined, active: undefined, };

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
		if (typeof feature !== 'undefined' && typeof state.hover !== 'undefined') return;

		// mouseleave feature
		if (typeof feature === 'undefined' && typeof state.hover !== 'undefined') {
			var id;

			// generate layer id
			id = ['track', 'hover', state.hover,].join('-');

			// remove track hover layer
			MAP.ctx.removeLayer(id);
			state.hover = undefined;

			// unset cursor style
			MAP.ctx.getCanvas().style.cursor = 'unset';

			return;
		}

		// bail when no feature is found
		if (typeof feature === 'undefined') return;

		// prevent hover on active state
		if (feature.id === state.active) return;

		// set cursor style
		MAP.ctx.getCanvas().style.cursor = 'pointer';

		// track
		track = JSON.parse(feature.properties.track);

		// add track hover state
		state.hover = feature.id;
		track_feature_hover(track, feature);
	});

	// listen for click
	MAP.ctx.on('click', 'track-default', async function(event) {
		var coordinate,
			feature,
			point,
			track,
			bound;
		
		// store event point
		point = event.transformedPoint;

		// query feature
		feature = map_feature_query('track-default', point);

		// bail when no feature is found
		if (typeof feature === 'undefined') return;

		// determine whether active state should be removed
		if (typeof state.active !== 'undefined') {
			var id;

			// generate layer id
			id = ['track', 'active',].join('-');

			// remove track active layer
			MAP.ctx.removeLayer(id);
			state.active = undefined;
		}

		// track
		track = JSON.parse(feature.properties.track);

		// add track active state
		state.active = feature.id;
		track_feature_active(track, feature);

		// store track point coordinate
		coordinate = track_coordinate(track);
		// reduce coordinates to bound
		bound = map_coordinate_bound(coordinate);

		// bound
		map_bound(bound);
	});
}

/* ------------------------------------------------------------------ PREPARE --- */
function track_prepare() {
	(async function() {
		var track;

		// loop through file paths
		for (var i = 0; i < FILE.length; i ++) {
			// request
			track = await track_request(FILE[i]);

			// store track data
			TRACK.item.push(track);
		}

		// draw
		track_draw();

		// center
		track_center();
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
	source = { maxzoom: 15, type: 'geojson', data: { type: 'FeatureCollection', features: [], }, generateId: true, };

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
			properties: { name: track.name, color: color, track: JSON.stringify(track), },
			geometry: { type: 'LineString', coordinates: coordinate, },
		};
		// add feature to source
		source.data.features.push(feature);
	}

	// append source to map
	MAP.ctx.addSource('track', source);
}

/* -------------------------------------------------------------------- STYLE --- */
function track_style() {
	// toggle style
	if (TRACK.style === 'default') TRACK.style = 'heatmap';
	else if (TRACK.style === 'heatmap') TRACK.style = 'default';

	// draw
	track_draw();
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
	if (track.distance.total <= 5000) color = '#0683df';
	else if (track.distance.total <= 10000) color = '#46e546';
	else if (track.distance.total <= 15000) color = '#ffa600';
	else if (track.distance.total <= 20000) color = '#ff273a';
	else color = '#16000f';

	return color;
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

/* --------------------------------------------------------------------- DRAW --- */
function track_draw() {
	// default
	if (TRACK.style === 'default') track_draw_default();
	// heatmap
	else if (TRACK.style === 'heatmap') track_draw_heatmap();
}

/* ----------------------------------------------------------- DRAW : DEFAULT --- */
function track_draw_default() {
	(async function() {
		var style,
			layer,
			paint;

		// store style
		style = MAP.style[TRACK.style];

		// define layer paint
		paint = { 
			'line-width': 1.5,
			'line-color': ['get', 'color',],
		};

		// style
		await map_style(style);

		// purge heatmap track
		map_layer_purge('track-heatmap');

		// rebuild source
		track_source();

		// layer
		layer = track_layer('track-default', paint);
		// append layer to map
		MAP.ctx.addLayer(layer, 'waterway-label');
	})();
}

/* ----------------------------------------------------------- DRAW : HEATMAP --- */
function track_draw_heatmap() {
	(async function() {
		var style,
			layer,
			paint;

		// store style
		style = MAP.style[TRACK.style];

		// define layer paint
		paint = { 
			'line-width': 1.5,
			'line-color': '#c51b8a',
			'line-opacity': 0.375,
		};

		// style
		await map_style(style);

		// purge default track
		map_layer_purge('track-default');

		// rebuild source
		track_source();

		// layer
		layer = track_layer('track-heatmap', paint);
		// append layer to map
		MAP.ctx.addLayer(layer, 'waterway-label');
	})();
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
			'line-width': 4, 
			'line-color': feature.properties.color,
		},
		filter: ['==', ['get', 'name',], track.name,],
	};

	// determine whether to place layer before track active layer
	if (MAP.ctx.getLayer('track-active')) before = 'track-active';

	// append layer to map
	MAP.ctx.addLayer(layer, before);
}

/* --------------------------------------------------------- FEATURE : ACTIVE --- */
function track_feature_active(track, feature) {
	var layer;

	// build map layer
	layer = {
		id: 'track-active',
		type: 'line',
		source: 'track',
		layout: {
			'line-cap': 'round',
			'line-join': 'round',
		},
		paint: { 
			'line-width': 4, 
			'line-color': 'blue',
		},
		filter: ['==', ['get', 'name',], track.name,],
	};
	// append layer to map
	MAP.ctx.addLayer(layer);
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
	$control.find('[data-func=track_center]').on('click', track_center);
	// listen for click
	$control.find('[data-func=track_style]').on('click', track_style);
}