<?php

exit;

foreach (glob(__DIR__ . '/../lib/track/*.gpx') as $file) {
    $name = basename($file, '.gpx');

    $file_gpx = __DIR__ . '/../lib/track/' . $name . '.gpx';
    $file_json = __DIR__ . '/../tmp/track/' . $name . '.json';

    $track = track_parse($file_gpx);
    file_put_contents($file_json, json_encode($track, JSON_PARTIAL_OUTPUT_ON_ERROR));
}

function track_parse($file) {
    // data
    $data = simplexml_load_file($file, null, LIBXML_NOCDATA);

    // track
    $track = (object) [
        'name' => null,
        'time' => (object) ['start' => 0, 'end' => 0, 'moving' => 0, 'climb' => 0, 'descent' => 0, 'flat' => 0, 'total' => 0,],
        'distance' => (object) ['climb' => 0, 'descent' => 0, 'flat' => 0, 'total' => 0,],
        'elevation' => (object) ['min' => INF, 'max' => 0, 'gain' => 0, 'loss' => 0,],
        'speed' => (object) ['climb' => 0, 'descent' => 0, 'flat' => 0, 'average' => 0,],
        'point' => [],
    ];

    // name
    $track->name = $data->name ?? basename($file, implode('', ['.', 'gpx',]));

    // trkpt
    foreach ($data->trk->trkseg->trkpt as $trkpt) {
        // point
        $point = (object) ['time' => 0, 'elevation' => 0, 'coordinate' => [],];

        // time
        $point->time = strtotime($trkpt->time);
        // elevation
        $point->elevation = floatval($trkpt->ele);
        // coordinate
        $point->coordinate = array_map('floatval', [$trkpt->attributes()->lon, $trkpt->attributes()->lat,]);

        // elevation
        if (!empty($prev)) {
            $elevation = ($point->elevation - $prev->elevation);
        }
        // elevation min
        if ($point->elevation < $track->elevation->min) {
            $track->elevation->min = $point->elevation;
        }
        // elevation max
        if ($point->elevation > $track->elevation->max) {
            $track->elevation->max = $point->elevation;
        }
        // elevation gain
        if (!empty($prev) && $elevation > 0) {
            $track->elevation->gain += $elevation;
        }
        // elevation loss
        if (!empty($prev) && $elevation < 0) {
            $track->elevation->loss += $elevation;
        }

        // point action
        $action = 'flat';
        if (!empty($prev) && abs($elevation) > 0.25) {
            if ($point->elevation > $prev->elevation) {
                $action = 'climb';
            } elseif ($point->elevation < $prev->elevation) {
                $action = 'descent';
            }
        }

        // distance
        if (!empty($prev)) {
            $distance = _dist3d($prev, $point);
        }
        // distance climb
        if ($action === 'climb') {
            $track->distance->climb += $distance;
        }
        // distance descent
        if ($action === 'descent') {
            $track->distance->descent += $distance;
        }
        // distance flat
        if ($action === 'flat') {
            $track->distance->flat += $distance;
        }
        // distance total
        $track->distance->total += $distance;

        // time
        $time = ($point->time - $prev->time);
        $moving = $time < 15 && $distance > 0.25;
        // time start
        if (empty($track->time->start)) {
            $track->time->start = $point->time;
        }
        // time end
        $track->time->end = $point->time;
        // time moving
        if ($moving) {
            $track->time->moving += $time;
        }
        // time climb
        if ($action === 'climb' && $moving) {
            $track->time->climb += $time;
        }
        // time descent
        if ($action === 'descent' && $moving) {
            $track->time->descent += $time;
        }
        // time flat
        if ($action === 'flat' && $moving) {
            $track->time->flat += $time;
        }
        // time total
        if (!empty($prev) && $moving) {
            $track->time->total += abs(($point->time - $prev->time));
        }
        
        // speed
        $speed = (($distance / 1000) / ($time / 3600));
        // speed max
        if ($speed > $track->speed->max) {
            $track->speed->max = $speed;
        }

        // store
        $prev = $point;
        $track->point []= $point;
    }
    
    // speed
    // speed climb
    $track->speed->climb = INF;
    if ($track->distance->climb > 0 && $track->time->climb > 0) $track->speed->climb = (($track->distance->climb / 1000) / ($track->time->climb / 3600));
    // speed descent
    $track->speed->descent = INF;
    if ($track->distance->descent > 0 && $track->time->descent > 0)$track->speed->descent = (($track->distance->descent / 1000) / ($track->time->descent / 3600));
    // speed flat
    $track->speed->flat = (($track->distance->flat / 1000) / ($track->time->flat / 3600));
    // speed average
    $track->speed->average = (($track->distance->total / 1000) / ($track->time->moving / 3600));

    return $track;
}

function _dist3d($a, $b) {
    $planar = _dist2d($a, $b);
    $height = abs(($b->elevation - $a->elevation));

    return sqrt((pow($planar, 2) + pow($height, 2)));
}

function _dist2d($a, $b) {
    $R = 6371000;

    $d_lon = _deg2rad(($b->coordinate[0] - $a->coordinate[0]));
    $d_lat = _deg2rad(($b->coordinate[1] - $a->coordinate[1]));

    $r = (sin(($d_lat / 2)) * sin(($d_lat / 2)) + cos(_deg2rad($a->coordinate[1])) * cos(_deg2rad($b->coordinate[1])) * sin(($d_lon / 2)) * sin(($d_lon / 2)));
    $c = (2 * atan2(sqrt($r), sqrt((1 - $r))));

    return ($R * $c);
}

function _deg2rad($deg) {
    return (($deg * M_PI) / 180);
}