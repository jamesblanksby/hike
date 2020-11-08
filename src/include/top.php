<?php
$class = [];
$class []= implode('_', ['env', $_ENVIRONMENT,]);
$class []= 'browser_load';
?>
<html class="<?= implode(' ', $class); ?>" lang="en">
<head>
<head>
    <!-- encoding -->
    <meta charset="utf-8">
    <!-- viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- title -->
    <title>Hike — Blanksby</title>
    <!-- favicon -->
    <link href="<?= ROOT_URL . path('src', 'gfx', 'favicon.svg'); ?>" rel="icon">
    <!-- style : site -->
	<link href="<?= ROOT_URL . '/src/css/site.css'; ?>" rel="stylesheet">
    <!-- plugin : jquery -->
    <script defer src="<?= ROOT_URL . path('src', 'plugin', 'jquery', 'jquery.js'); ?>"></script>
    <!-- plugin : mapbox -->
	<script defer src="<?= ROOT_URL . path('src', 'plugin', 'mapbox', 'mapbox.js'); ?>"></script>
    <!-- script : var -->
    <script defer src="<?= ROOT_URL . path('src', 'script', 'var.js'); ?>"></script>
    <!-- script : site -->
    <script defer src="<?= ROOT_URL . path('src', 'script', 'site.js'); ?>"></script>
</head>
<body>

<!-- ROOT -->
<script>var ROOT_URL = '<?= ROOT_URL; ?>';</script>

<!-- DIR -->
<script>var DIR_TMP = '<?= DIR_TMP; ?>';</script>
