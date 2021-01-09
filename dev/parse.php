<?php

foreach (array_reverse(glob(__DIR__ . '/../lib/track/*.gpx')) as $file) {
    $name = basename($file, '.' . 'gpx');

    $file_gpx = __DIR__ . '/../lib/track/' . $name . '.' . 'gpx';
    $file_json = __DIR__ . '/../tmp/track/' . $name . '.' . 'json';

    if (file_exists($file_json)) continue;

    $track = track_parse($file_gpx);
    file_put_contents($file_json, json_encode($track, JSON_PARTIAL_OUTPUT_ON_ERROR));
}


function track_parse($file) {
    // data
    $data = simplexml_load_file($file, null, LIBXML_NOCDATA);

    // track
    $track = (object) [
        'id' => guid(),
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
        if (!empty($prev_point)) $point->moving = ($point->time - $prev_point->time) < 5 && $point->distance > 0.25;
        // action
        if (!empty($prev_point) && abs(($point->elevation - $prev_point->elevation)) > 0.25) {
            if ($point->elevation > $prev_point->elevation) $point->action = 'climb';
            elseif ($point->elevation < $prev_point->elevation) $point->action = 'descent';
        }

        // prev
        $prev_point = $point;
        // store
        $track->point []= $point;
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
        if (abs($delta_elevation) > 10) {
            // elevation gain
            $track->elevation->gain += ($delta_elevation > 0) ? $delta_elevation : 0;
            // elevation gain
            $track->elevation->loss += ($delta_elevation < 0) ? abs($delta_elevation) : 0;
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


function guid() {
    return strtolower(
        sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X',
            mt_rand(0, 65535),
            mt_rand(0, 65535),
            mt_rand(0, 65535),
            mt_rand(16384, 20479),
            mt_rand(32768, 49151),
            mt_rand(0, 65535),
            mt_rand(0, 65535),
            mt_rand(0, 65535)
        )
    );
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
