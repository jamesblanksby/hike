<?php

include __DIR__ . '/rdp.php';

$root = __DIR__ . '/../..';

foreach (array_reverse(glob($root . '/lib/track/*.gpx')) as $file) {
    $name = basename($file, '.' . 'gpx');

    $file_gpx = $root . '/lib/track/' . $name . '.' . 'gpx';
    $file_json = $root . '/tmp/track/' . $name . '.' . 'json';
    $file_image = $root . '/lib/track/' . $name . '.' . 'png';

    if (file_exists($file_json)) continue;

    $parse = track_parse($file_gpx);
    file_put_contents($file_json, json_encode($parse, JSON_PARTIAL_OUTPUT_ON_ERROR));

    $image = track_image($parse);
    file_put_contents($file_image, $image);
}


function track_parse($file) {
    // data
    $data = simplexml_load_file($file, null, LIBXML_NOCDATA);

    // track
    $track = (object) [
        'id' => md5(basename($data->trk->trkseg->trkpt[0]->time)),
        'file' => basename($file, '.' . 'gpx'),
        'name' => null,
        'time' => (object) ['start' => 0, 'end' => 0, 'flat' => 0, 'climb' => 0, 'descent' => 0, 'moving' => 0, 'total' => 0,],
        'distance' => (object) ['flat' => 0, 'climb' => 0, 'descent' => 0, 'total' => 0,],
        'elevation' => (object) ['min' => INF, 'max' => 0, 'gain' => 0, 'loss' => 0,],
        'speed' => (object) ['flat' => 0, 'climb' => 0, 'descent' => 0, 'average' => 0,],
        'split' => [],
        'point' => [],
    ];

    // name
    $track->name = $data->metadata->name ?? $data->trk->name ?? basename($file, implode('', ['.', 'gpx',]));
    $track->name = (string) $track->name;

    // trkpt
    foreach ($data->trk->trkseg->trkpt as $trkpt) {
        // point
        $point = (object) ['time' => 0, 'distance' => 0, 'elevation' => 0, 'moving' => false, 'action' => 'flat', 'coordinate' => [],];

        // time
        $point->time = strtotime($trkpt->time);
        // elevation
        $point->elevation = floatval($trkpt->ele);
        // coordinate
        $point->coordinate = array_map('floatval', [$trkpt->attributes()->lon, $trkpt->attributes()->lat,]);
        // distance
        if (!empty($prev_point)) $point->distance = dist3d($point, $prev_point);
        // moving
        $delta_moving = ($point->time - $prev_point->time);
        if (!empty($prev_point)) $point->moving = $delta_moving < 5 && $point->distance > 0.25 || $delta_moving < 35;

        // prev
        $prev_point = $point;
        // store
        $track->point []= $point;
    }

    // elevation smooth
    $elevation_array = [];
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // elevation
        $prev_elevation = $track->point[($i - 1)];
        $elevation = $point->elevation;
        $next_elevation = $track->point[($i + 1)];

        // elevation smooth
        if (!empty($prev_elevation) && !empty($next_elevation)) {
            $elevation = (($prev_elevation * 0.3) + ($elevation * 0.4) + ($next_elevation * 0.3));
        }

        // store
        $elevation_array []= $elevation;
    }

    // action
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // elevation
        $prev_elevation = $elevation_array[($i - 1)];
        $elevation = $elevation_array[$i];

        // action
        if (!empty($prev_elevation) && abs(($elevation - $prev_elevation)) > 0.125 && $point->moving) {
            if ($elevation_array[$i] > $elevation_array[($i - 1)]) $point->action = 'climb';
            elseif ($elevation_array[$i] < $elevation_array[($i - 1)]) $point->action = 'descent';
        }

        // store
        $track->point[$i] = $point;
    }

    // time
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // first
        if ($i === 0) {
            $prev_point = $point;
            continue;
        }

        // time delta
        $delta_time = ($point->time - $prev_point->time);
        // time start
        if (empty($track->time->start)) $track->time->start = $point->time;
        // time end
        $track->time->end = $point->time;
        // time flat
        if ($point->action === 'flat' && $point->moving) $track->time->flat += $delta_time;
        // time climb
        if ($point->action === 'climb' && $point->moving) $track->time->climb += $delta_time;
        // time descent
        if ($point->action === 'descent' && $point->moving) $track->time->descent += $delta_time;
        // time moving
        if ($point->moving) $track->time->moving += $delta_time;
        // time total
        $track->time->total += $delta_time;

        // prev
        $prev_point = $point;
        // store
        $track->point[$i] = $point;
    }

    // distance
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // first
        if ($i === 0) {
            $prev_point = $point;
            continue;
        }

        // distance delta
        $delta_distance = dist3d($point, $prev_point);
        // distance smooth
        if ($delta_distance > 2) {
            // distance flat
            if ($point->action === 'flat') {
                $track->distance->flat += $delta_distance;
            }
            // distance climb
            if ($point->action === 'climb') {
                $track->distance->climb += $delta_distance;
            }
            // distance descent
            if ($point->action === 'descent') {
                $track->distance->descent += $delta_distance;
            }
            // distance total
            $track->distance->total += $delta_distance;

            // prev
            $prev_point = $point;
        }

        // store
        $track->point[$i] = $point;
    }

    // elevation smooth
    $smooth_elevation = true;
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // first
        if ($i === 0) {
            $prev_point = $point;
            continue;
        }

        // elevation delta
        $delta_elevation = ($point->elevation - $prev_point->elevation);

        // elevation gain
        $diff_elevation = $delta_elevation > $diff_elevation ? $delta_elevation : $diff_elevation;
    }
    if ($diff_elevation <= 10) $smooth_elevation = false;

    // elevation
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // ignore zero
        if ($point->elevation === 0) {
            continue;
        }

        // first
        if ($i === 0) {
            $prev_point = $point;
            continue;
        }

        // elevation delta
        $delta_elevation = ($point->elevation - $prev_point->elevation);
        // elevation smooth
        if (abs($delta_elevation) > 10 || !$smooth_elevation) {
            // elevation gain
            $track->elevation->gain += $delta_elevation > 0 ? $delta_elevation : 0;
            // elevation gain
            $track->elevation->loss += $delta_elevation < 0 ? abs($delta_elevation) : 0;
            // elevation min
            if ($point->elevation > 0 && $point->elevation < $track->elevation->min) $track->elevation->min = $point->elevation;
            // elevation max
            if ($point->elevation > $track->elevation->max) $track->elevation->max = $point->elevation;

            // prev
            $prev_point = $point;
        }

        // store
        $track->point[$i] = $point;
    }

    // speed
    // speed flat
    $track->speed->flat = @(($track->distance->flat / 1000) / ($track->time->flat / 3600));
    // speed climb
    $track->speed->climb = @(($track->distance->climb / 1000) / ($track->time->climb / 3600));
    // speed descent
    $track->speed->descent = @(($track->distance->descent / 1000) / ($track->time->descent / 3600));
    // speed average
    $track->speed->average = @(($track->distance->total / 1000) / ($track->time->moving / 3600));

    // split
    for ($i = 0; $i < count($track->point); $i++) {
        // point
        $point = $track->point[$i];

        // first
        if ($i === 0) {
            $prev_point = $point;
            continue;
        }

        // total
        $total_moving += $point->moving ? ($point->time - $prev_point->time) : 0;
        $total_distance += $point->distance;

        // split
        if (count($track->split) < floor(($total_distance / 1000)) && $total_distance < $track->distance->total) {
            // split
            $split = (object) [
                'time' => (object) ['start' => null, 'end' => null, 'moving' => null, 'total' => null,],
                'distance' => 0,
                'elevation' => (object) ['start' => null, 'end' => null,],
            ];

            // time start
            $split->time->start = !empty($prev_split) ? $prev_split->time->end : $track->point[0]->time;
            // time end
            $split->time->end = $point->time;
            // time moving
            $prev_moving = array_sum(array_map(function($split) { return $split->time->moving; }, $track->split));
            $split->time->moving = !empty($prev_split) ? ($total_moving - $prev_moving) : $total_moving;
            // time total
            $split->time->total = ($split->time->end - $split->time->start);
            // distance
            $split->distance = $total_distance;
            // elevation start
            $split->elevation->start = !empty($prev_split) ? $prev_split->elevation->end : $track->point[0]->elevation;
            // elevation end
            $split->elevation->end = $point->elevation;
            // elevation difference
            $split->elevation->difference = round(($split->elevation->end - $split->elevation->start), 2);

            // prev
            $prev_split = $split;
            // store
            $track->split []= $split;
        }

        // prev
        $prev_point = $point;
    }

    return $track;
}

function track_image($track) {
    // token
    $token = 'pk.eyJ1IjoiamFtZXNibGFua3NieSIsImEiOiJjazBiM2E1dzkwbzVxM2dud3lvZXNocW9uIn0.hTartIj-fT9-6f7yOAuLIg';
    
    // dimension
    $width = 600;
    $height = 315;

    // coordinate
    $coordinate = array_map(function($point) { return $point->coordinate; }, $track->point);

    // simplify
    $tolerance = 0.0000001;
    while (count($coordinate) > 250) {
        $coordinate = simplify($coordinate, $tolerance, true);
        $tolerance *= 10;
    }

    // overlay
    $overlay = (object) [
        'type' => 'FeatureCollection',
        'features' => [
            (object) [
                'type' => 'Feature',
                'properties' => (object) [
                    'stroke' => '#dd1c77',
                    'stroke-width' => 4,
                    'stroke-opacity' => 1,
                ],
                'geometry' => (object) [
                    'type' => 'LineString',
                    'coordinates' => $coordinate,
                ],
            ],
        ],
    ];

    // format
    $lon_array = [];
    $lat_array = [];
    for ($i = 0; $i < count($coordinate); $i++) {
        $lon_array []= $coordinate[$i][0];
        $lat_array []= $coordinate[$i][1];
    }

    // min / max
    $lon_min = min($lon_array);
    $lat_min = min($lat_array);
    $lon_max = max($lon_array);
    $lat_max = max($lat_array);

    // bound
    $bound = [[$lon_min, $lat_min,], [$lon_max, $lat_max,],];

    // url
    $url = 'https://api.mapbox.com/styles/v1';
    $url .= '/jamesblanksby/ckht3exwv29rd1anysnr4h59a';
    $url .= '/static';
    $url .= '/geojson(' . urlencode(json_encode($overlay)) . ')';
    $url .= '/auto';
    $url .= '/' . implode('x', [$width, $height,]);
    $url .= '@2x';
    $url .= '?access_token=' . $token . '&logo=false' . '&attribution=false' . '&before_layer=waterway-label';

    return file_get_contents($url);
}


function dist3d($a, $b) {
    $planar = dist2d($a, $b);
    $height = abs(($b->elevation - $a->elevation));

    return sqrt((pow($planar, 2) + pow($height, 2)));
}

function dist2d($a, $b) {
    $R = 6371000;

    $d_lon = deg2rad(($b->coordinate[0] - $a->coordinate[0]));
    $d_lat = deg2rad(($b->coordinate[1] - $a->coordinate[1]));

    $r = (sin(($d_lat / 2)) * sin(($d_lat / 2)) + cos(deg2rad($a->coordinate[1])) * cos(deg2rad($b->coordinate[1])) * sin(($d_lon / 2)) * sin(($d_lon / 2)));
    $c = (2 * atan2(sqrt($r), sqrt((1 - $r))));

    return ($R * $c);
}

function p($v) {
    echo '<pre>' . print_r($v, 1) . '</pre>';
}
