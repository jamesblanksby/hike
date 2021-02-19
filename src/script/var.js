/* ////////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////// VAR /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* ------------------------------------------------------------------- MAPBOX --- */
var MAPBOX = {};
	MAPBOX.token = 'pk.eyJ1IjoiamFtZXNibGFua3NieSIsImEiOiJjazBiM2E1dzkwbzVxM2dud3lvZXNocW9uIn0.hTartIj-fT9-6f7yOAuLIg';

/* ------------------------------------------------------------------- FILTER --- */
var FILTER = {};
	FILTER.year = NaN;

/* ---------------------------------------------------------------------- MAP --- */
var MAP = {};
	MAP.ctx = undefined;
	MAP.event = { flying: false, };
	MAP.style = {
		default: 'mapbox://styles/jamesblanksby/ckht3exwv29rd1anysnr4h59a',
		heatmap: 'mapbox://styles/jamesblanksby/ckh99rzt7260819odgvjykhpi',
	};
	MAP.style.active = MAP.style.default;

/* -------------------------------------------------------------------- TRACK --- */
var TRACK = {};
	TRACK.style = 'default';
	TRACK.state = { hover: undefined, active: undefined, };
	TRACK.item = [];
