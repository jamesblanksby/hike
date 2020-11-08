<?php

/* ////////////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////// DEBUG /// */
/* ////////////////////////////////////////////////////////////////////////////// */

/* ------------------------------------------------------------------------ P --- */
function p() {
	// process each argument
    foreach (func_get_args() as $value) {
        if (is_array($value) || is_object($value)) {
			// human readable output
            echo '<pre>' . print_r($value, 1) . '</pre>';
		}
		// simple variable dump
        else var_dump($value);
    }
}
