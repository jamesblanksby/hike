/* ////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// VAR /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* ------------------------------------------------------------------- MAPBOX --- */
var MAPBOX = {};
	MAPBOX.token = 'pk.eyJ1IjoiamFtZXNibGFua3NieSIsImEiOiJjazBiM2E1dzkwbzVxM2dud3lvZXNocW9uIn0.hTartIj-fT9-6f7yOAuLIg';

/* ---------------------------------------------------------------------- MAP --- */
var MAP = {};
	MAP.ctx = undefined;
	MAP.style = {
		default: 'mapbox://styles/jamesblanksby/ckh99mzew0nxq19n0qygpqh27',
		heatmap: 'mapbox://styles/jamesblanksby/ckh99rzt7260819odgvjykhpi',
	};
	MAP.style.active = MAP.style.default;

/* -------------------------------------------------------------------- TRACK --- */
var TRACK = {};
	TRACK.style = 'default';
	TRACK.item = [];
