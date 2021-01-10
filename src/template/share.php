<?php

// default
$default_title = 'Hike Blanksby';

// page
$_PAGE = [];

// site
$_PAGE['site'] = $default_title;

// url
$_PAGE['url'] = rtrim(str_replace($_ENV['root'], '', ROOT_URL) . $_SERVER['REQUEST_URI'], '/');

// title
$title = [$default_title,];
if (!empty($track_active)) $title []= $track_active->name;
$_PAGE['title'] = implode(' &mdash; ', $title);

// description
if (!empty($track_active)) {
    $distance = implode(': ', ['Distance', implode('', [round(($track_active->distance->total / 1000), 2), 'KM',]),]);
    $elevation = implode(': ', ['Elevation Gain', implode('', [round($track_active->elevation->gain, 2), 'M',]),]);
    $moving = implode(': ', ['Moving Time', gmdate('H:i:s', $track_active->time->moving),]);
    $_PAGE['description'] = implode(' / ', [$distance, $elevation, $moving,]);
}

// image
if (!empty($track_active)) $_PAGE['image'] = ROOT_URL . path(DIR_LIB, 'track', implode('.', [$track_active->file, 'png',]));
