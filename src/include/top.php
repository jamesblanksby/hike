<?php
$class = [];
$class []= implode('_', ['env', $_ENVIRONMENT,]);
$class []= 'browser_load';
?>
<html class="<?= implode(' ', $class); ?>" lang="en">
<head>
<head>
    <!-- share -->
    <?php include ROOT_DIR . path('src', 'template', 'share.php'); ?>
    <!-- encoding -->
    <meta charset="utf-8">
    <!-- viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- title -->
	<title data-title="<?= $default_title; ?>"><?= $_PAGE['title']; ?></title>
    <!-- favicon -->
    <link href="<?= ROOT_URL . path('src', 'gfx', 'favicon.png'); ?>" rel="icon">
    <?php foreach ([16, 32, 96,] as $size) : ?>
        <?php $href = ROOT_URL . path('src', 'gfx', 'favicon', implode('.', [$size, 'png',])); ?>
        <link href="<?= $href; ?>" sizes="<?= implode('x', [$size, $size,]); ?>" rel="icon">
    <?php endforeach; ?>
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
    <!-- og -->
	<meta property="og:url" content="<?= $_PAGE['url']; ?>">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= $_PAGE['title']; ?>">
    <meta property="og:image" content="<?= $_PAGE['image']; ?>">
    <meta property="og:description" content="<?= $_PAGE['description']; ?>">
    <meta property="og:site_name" content="<?= $_PAGE['site']; ?>">
	<meta property="og:locale" content="en_GB">
	<!-- twitter -->
	<meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="<?= $_PAGE['url']; ?>">
    <meta name="twitter:title" content="<?= $_PAGE['title']; ?>">
    <meta name="twitter:description" content="<?= $_PAGE['description']; ?>">
    <meta name="twitter:image" content="<?= $_PAGE['image']; ?>">
</head>
<body>

<!-- ROOT -->
<script>var ROOT_URL = '<?= ROOT_URL; ?>';</script>

<!-- DIR -->
<script>var DIR_TMP = '<?= DIR_TMP; ?>';</script>
