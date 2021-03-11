/* ////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////// DOCUMENT /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* -------------------------------------------------------------------- READY --- */
$(init);

/* --------------------------------------------------------------------- INIT --- */
function init() {
	// browser
	browser_init();

	// dropdown
	dropdown_init();

	// map
	map_init();

	// track
	track_init();

	// detail
	detail_init();

	// data
	data_init();

	// control
	control_init();
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
/* ///////////////////////////////////////////////////////////////// DROPDOWN /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function dropdown_init() {
	// prepare
	dropdown_prepare();

	// toggle
	dropdown_toggle();

	// select
	dropdown_select();

	// change
	dropdown_change();
}

/* ------------------------------------------------------------------ PREPARE --- */
function dropdown_prepare() {
	// loop through dropdown
	$('.field.dropdown').each(function() {
		var $dropdown;

		// cache element
		$dropdown = $(this);

		// build
		dropdown_build($dropdown);
	});
}

/* -------------------------------------------------------------------- BUILD --- */
function dropdown_build(dropdown) {
	var $dropdown,
		$select,
		$tmp;
	var width,
		html = [];

	// cache elements
	$dropdown = $(dropdown);
	$select = $dropdown.find('select');

	// build select element
	$tmp = $('<div class="select"></div>');

	// set placeholder attribute
	if (typeof $select.attr('placeholder') !== 'undefined') $tmp.attr('data-select-placeholder', $select.attr('placeholder'));

	// build select option
	$tmp.append('<div class="option"></div>');

	// loop through select option
	$select.find('option').each(function() {
		var $option;

		// cache element
		$option = $(this);

		// build option
		html.push(dropdown_build_option($option));
	});

	// append inner html
	$tmp.find('.option').append(html.join(''));

	// append select to dropdown
	$dropdown.append($tmp);

	// thread
	setTimeout(function() {
		// store max option width
		width = $tmp.find('.option').outerWidth();
		// set select width
		$tmp.width(width);
	}, 1);
}

/* ------------------------------------------------------------- BUILD OPTION --- */
function dropdown_build_option(option) {
	var $option,
		$tmp;

	// cache element
	$option = $(option);

	// build option element
	$tmp = $('<a></a>');

	// set option text
	$tmp.html($option.text());

	// set option value
	$tmp.attr('data-value', $option.val());

	// set disabled class
	if ($option.is(':disabled')) $tmp.addClass('disabled');

	// set active class
	if ($option.is(':selected')) $tmp.addClass('active');

	return $tmp.prop('outerHTML');
}

/* ------------------------------------------------------------------- TOGGLE --- */
function dropdown_toggle() {
	// listen for click event
	$('.dropdown .select').on('click', function(event) {
		var $select;

		// cache elements
		$select = $(this);

		// remove active class
		$('.dropdown .select').not($select).removeClass('active');

		// toggle active class
		$select.toggleClass('active');
	});

	// listen for click event
	$(document).on('click', function(event) {
		var $target;

		// cache elements
		$target = $(event.target);

		// prevent close when interacting with dropdown
		if ($target.is('.select') || $target.closest('.select').length > 0) return;

		// remove active class
		$('.dropdown .select').removeClass('active');
	});
}

/* ------------------------------------------------------------------- SELECT --- */
function dropdown_select() {
	// listen for click event
	$('.dropdown .option a').on('click', function() {
		var $dropdown,
			$option,
			$a;
		var value;

		// cache elements
		$a = $(this);
		$option = $a.closest('.option');
		$dropdown = $option.closest('.dropdown');

		// store selected value
		value = $a.attr('data-value');

		// remove active class
		$option.find('a').not($a).removeClass('active');

		// toggle active class
		$a.toggleClass('active');

		// backfill select value
		$dropdown.find('select').val(value).trigger('change');
	});
}

/* ------------------------------------------------------------------- CHANGE --- */
function dropdown_change() {
	// listen for change event
	$('.dropdown select').on('change', function() {
		var $dropdown,
			$select,
			$option,
			$tmp;
		var value;

		// cache elements
		$tmp = $(this);
		$dropdown = $(this).closest('.dropdown');
		$select = $dropdown.find('.select');
		$option = $select.find('.option');

		// bail when no option selected
		if ($tmp.prop('selectedIndex') === 0 
			&& typeof $tmp.find('option').first().attr('selected') === 'undefined') return;

		// store select value
		value = $tmp.val();

		// add active class
		$option.find('a[data-value="' + value + '"]').addClass('active');

		// set select text
		$select.attr('data-select-text', $tmp.find('option:selected').text());
	}).trigger('change');
}


/* ////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// MAP /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function map_init() {
	// render
	map_render();
}

/* ------------------------------------------------------------------- RENDER --- */
function map_render() {
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
	// listen
	track_listen();

	// prepare
	track_prepare();
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

		// active detail
		track_detail_active(track, feature);
	});
}

/* ------------------------------------------------------------------ PREPARE --- */
function track_prepare() {
	(async function() {
		var promises = [],
			feature,
			active,
			id;

		// store url id
		id = location.href.split('/').pop();

		// loop through file paths
		for (var i = 0; i < FILE.length; i ++) {
			// request
			promises.push(track_request(FILE[i]));
		}

		// store track data
		TRACK.item = await Promise.all(promises);

		// draw
		await track_draw();

		// attempt to retrieve active track
		active = $.grep(TRACK.item, function(track) { return track.id === id; })[0];

		// determine whether active track exists
		if (typeof active !== 'undefined') {
			// retrieve feature from source features
			feature = $.grep(MAP.ctx.querySourceFeatures('track', { sourceLayer: 'track-default', }), function(feature) {
				return feature.properties.id === active.id;
			})[0];

			// active detail
			track_detail_active(active, feature);
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

/* ----------------------------------------------------------- DRAW : DEFAULT --- */
function track_draw_default() {
	// promise
	return new Promise(async function(resolve, reject) {
		var style,
			paint,
			layer;

		// store style
		style = MAP.style[TRACK.style];

		// style
		await map_style(style);

		// purge heatmap track
		map_layer_purge('track-heatmap-base');
		map_layer_purge('track-heatmap-density');

		// rebuild source
		track_source();

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
		var style,
			layer,
			paint;

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

		// define layer paint
		paint = { 
			'line-width': 1.5,
			'line-color': 'rgba(152, 0, 67, 1)',
			'line-opacity': 0.375,
		};

		// layer
		layer = track_layer('track-heatmap-base', paint);
		// append layer to map
		MAP.ctx.addLayer(layer, 'track-heatmap-density');

		// resolve
		MAP.ctx.once('idle', resolve);
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
			track,
			color,
			year,
			tmp;

		// store current track
		track = TRACK.item[i];

		// store track point coordinates
		coordinate = track_coordinate(track);

		// determine track color depending on distance
		color = track_color(track);

		// determine track year
		year = new Date((track.time.start * 1000));
		year = year.getFullYear();

		// build source feature
		tmp = {
			type: 'Feature',
			properties: { id: track.id, year: year, color: color, track: JSON.stringify(track), },
			geometry: { type: 'LineString', coordinates: coordinate, },
		};
		// add feature to source
		source.data.features.push(tmp);
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

/* -------------------------------------------------------------------- STYLE --- */
function track_style() {
	(async function() {
		// toggle style
		if (TRACK.style === 'default') TRACK.style = 'heatmap';
		else if (TRACK.style === 'heatmap') TRACK.style = 'default';

		// draw
		await track_draw();

		// center
		track_center();

		// filter
		track_filter_year();
	})();
}

/* ------------------------------------------------------------ FILTER : YEAR --- */
function track_filter_year() {
	var layer;

	// determine active layer
	if (TRACK.style === 'default') layer = ['track-default',];
	else if (TRACK.style === 'heatmap') layer = ['track-heatmap-base', 'track-heatmap-density',];

	// loop through layers
	for (var i = 0; i < layer.length; i++) {
		// filter set
		if (!isNaN(FILTER.year)) MAP.ctx.setFilter(layer[i], ['==', 'year', FILTER.year,]);
		// filter clear
		else MAP.ctx.setFilter(layer[i], undefined);
	}
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
	else before = 'waterway-label';

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
	MAP.ctx.addLayer(layer, 'waterway-label');
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

/* ---------------------------------------------------------- MARKER : INSERT --- */
function track_marker_insert(track) {
	var linestring,
		distance,
		source,
		layer,
		step;

	// purge track marker layer and source
	track_marker_purge();

	// convert track to linestring
	linestring = turf.helpers.lineString(track.point.map(function(point) { return point.coordinate; }));

	// build track data source
	source = { type: 'geojson', data: { type: 'FeatureCollection', features: [], }, generateId: true, };

	// determine track distance
	distance = Math.floor((track.distance.total / 1000));

	// define marker step
	step = 1;
	if (distance > 25) step = 3;

	// loop through kilometres
	for (var i = 0; i <= distance; i++) {
		// skip initial point
		if (i === 0) continue;
		// skip when not step
		if (i % step !== 0 && i !== distance) continue;

		var segment,
			tmp;

		// determine point at distance
		segment = turf.along(linestring, i);

		// build source feature
		tmp = {
			type: 'Feature',
			properties: { distance: i, },
			geometry: { type: 'Point', coordinates: segment.geometry.coordinates, },
		};
		// add feature to source
		source.data.features.push(tmp);
	}

	// append source to map
	MAP.ctx.addSource('track-marker', source);

	// build circle layer	
	layer = {
		id: 'track-marker-circle',
		type: 'circle',
		source: 'track-marker',
		paint: {
			'circle-radius': 5,
			'circle-color': 'white',
			'circle-stroke-width': 2,
			'circle-stroke-color': 'rgba(221, 28, 119, 1)',
		},
	};
	// append layer to map
	MAP.ctx.addLayer(layer, 'waterway-label');

	// build distance layer
	layer = {
		id: 'track-marker-distance',
		type: 'symbol',
		source: 'track-marker',
		paint: {
			'text-color': 'black',
		},
		layout: {
			'text-font': ['DIN Pro Medium',],
			'text-size': 6,
			'text-field': '{distance}',
			'text-allow-overlap': true,
			'text-ignore-placement': true,
		},
	};
	// append layer to map
	MAP.ctx.addLayer(layer, 'waterway-label');
}

/* ----------------------------------------------------------- MARKER : PURGE --- */
function track_marker_purge() {
	// determine whether layer can be removed
	if (MAP.ctx.getLayer('track-marker-circle')) {
		// remove layer
		MAP.ctx.removeLayer('track-marker-circle');
	}

	// determine whether layer can be removed
	if (MAP.ctx.getLayer('track-marker-distance')) {
		// remove layer
		MAP.ctx.removeLayer('track-marker-distance');
	}

	// determine whether source can be removed
	if (MAP.ctx.getSource('track-marker')) {
		// remove source
		MAP.ctx.removeSource('track-marker');
	}
}

/* ---------------------------------------------------------- DETAIL : ACTIVE --- */
function track_detail_active(track, feature) {
	var $detail;
	var coordinate,
		bound,
		title;

	// cache elment
	$detail = $('aside.detail[data-track-id='+ track.id +']');

	// reset scroll
	$detail.find('.scroll').scrollTop(0);

	// add track active state
	TRACK.state.active = feature;
	track_feature_active(track, feature);

	// add track distance
	track_marker_insert(track);

	// update paint property
	MAP.ctx.setPaintProperty('track-default', 'line-opacity', 0.5);

	// add active class
	$('html').addClass('detail_active');
	// remove display class
	$('aside.detail').removeClass('display');

	// store track point coordinate
	coordinate = track_coordinate(track);
	// reduce coordinates to bound
	bound = map_coordinate_bound(coordinate);

	// bound
	map_bound(bound);

	// listen for moveend
	MAP.ctx.once('moveend', function() {
		// add display class
		$detail.addClass('display');
	});

	// store default title text
	title = $('title').attr('data-title');
	// update title
	$('title').text([title, track.name,].join(' — '));

	// update url
	history.replaceState({}, {}, [ROOT_URL, ['track', track.id,].join('/'),].join('/'));
}

/* ----------------------------------------------------------- DETAIL : RESET --- */
function track_detail_reset() {
	var title;

	// determine whether hover state should be removed
	if (typeof TRACK.state.hover !== 'undefined') {
		// remove feature state
		track_feature_remove(TRACK.state.hover, 'hover');
	}

	// determine whether active state should be removed
	if (typeof TRACK.state.active !== 'undefined') {
		// remove feature state
		track_feature_remove(TRACK.state.active, 'active');
	}

	// purge track marker layer and source
	track_marker_purge();

	// reset paint property
	MAP.ctx.setPaintProperty('track-default', 'line-opacity', 1);

	// remove active class
	$('html').removeClass('detail_active');
	// remove display class
	$('aside.detail').removeClass('display');

	// store default title text
	title = $('title').attr('data-title');
	// reset title
	$('title').text(title);

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
/* ///////////////////////////////////////////////////////////////////// DATA /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* --------------------------------------------------------------------- INIT --- */
function data_init() {
	// sticky
	data_sticky();
}

/* ------------------------------------------------------------------- STICKY --- */
function data_sticky() {
	// listen for scroll
	$('aside.data').find('.scroll').on('scroll', function() {
		var $data;
		var scroll;

		// cache element
		$data = $(this).closest('aside.data');

		// store scroll
		scroll = $data.find('.scroll').scrollTop();

		// bail when scroll at top
		if (scroll === 0) {
			// remove stuck attribute
			$data.find('h2').removeAttr('stuck');
			
			return;
		}

		// loop though heading
		$data.find('h2').each(function() {
			var $h2;
			var offset;

			// cache element
			$h2 = $(this);

			// store heading offset
			offset = $h2.position().top;

			// toggle stuck attribute
			if (offset === 0) $h2.attr('stuck', '');
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

	// listen for change
	$control.find('[data-func=filter_year]').on('change', function() {
		// store filter value
		FILTER.year = parseInt($(this).val());

		// toggle display class
		$('aside.data').removeClass('display').filter('[data-year=' + (!isNaN(FILTER.year) ? FILTER.year : '*') + ']').addClass('display');

		// year filter
		track_filter_year();
	});
}
