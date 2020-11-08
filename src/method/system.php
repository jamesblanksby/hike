<?php

/* ////////////////////////////////////////////////////////////////////////////// */
/* /////////////////////////////////////////////////////////////////// SYSTEM /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* ---------------------------------------------------------------- ENCRYPTED --- */
function encrypted() {
	// determine if https is set or server is running on port 443
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] === 443;
}

/* --------------------------------------------------------------------- PATH --- */
function path() {
	// empty path array
	$path = [];
	
	// merge path arguments
	foreach (func_get_args() as $value) $path = array_merge($path, (array) $value);

	// trim and remove empty values
	$path = array_map(function($a) { return trim($a, DIRECTORY_SEPARATOR); }, $path);
	$path = array_filter($path);

	// build path string
	$path = DIRECTORY_SEPARATOR . join(DIRECTORY_SEPARATOR, $path);

	return $path;
}

/* ----------------------------------------------------------------- REDIRECT --- */
function redirect($redirect) {
	// ensure redirect contains protocol
    if (strpos($redirect, 'http') !== 0) $redirect = ROOT_URL . $redirect;

	// perform redirect via header
    header('Location: ' . $redirect);
    exit;
}

/* ----------------------------------------------------------------- RESPONSE --- */
function response($res) {
	// store response to session
	$_SESSION['response'] = $res;
	
	// determine if ajax request
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
		// output response as json
		echo json_encode($res);
	// simply return response
    } else return $res;
}
