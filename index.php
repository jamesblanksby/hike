<!-- data -->
<?php include __DIR__ . '/src/include/data.php'; ?>

<?php
$file_array = array_map('basename', glob(ROOT_DIR . path(DIR_TMP, 'track', implode('.', ['*', 'json',]))));
$track_array = [];
foreach ($file_array as $file) {
    $track_array []= json_decode(file_get_contents(ROOT_DIR . path(DIR_TMP, 'track', $file)));
}
?>

<!-- top -->
<?php include ROOT_DIR . path('src', 'include', 'top.php'); ?>

<!-- FILE -->
<script>var FILE = JSON.parse('<?= json_encode($file_array); ?>');</script>

<!-- main -->
<main>
    
    <!-- map -->
    <section class="map">
        <div class="canvas"></div>
    </section>

    <!-- detail -->
    <?php if (!empty($track_array)) : ?>
        <?php foreach ($track_array as $track) : ?>
            <aside class="detail" data-track-id="<?= $track->id; ?>">
                <div>
                    <div class="scroll">
                        <div class="meta">
                            <h1><?= $track->name; ?></h1>
                            <time class="date"><?= date('jS F Y', $track->time->start); ?></time>
                            <time class="time"><?= implode(' &mdash; ', [date('H:i', $track->time->start), date('H:i', $track->time->end),]); ?></time>
                        </div>
                        <?php include ROOT_DIR . path('src', 'template', 'group', 'stat.php'); ?>
                        <?php include ROOT_DIR . path('src', 'template', 'group', 'split.php'); ?>
                    </div>
                </div>
            </aside>
        <?php endforeach; ?>
    <?php endif; ?>

    <!-- control -->
    <aside class="control">
        <div class="action">
            <a class="center" data-func="track_center"></a>
            <a class="style" data-func="track_style"></a>
            <?php $href = 'https://alltrails.com/members/james-blanksby'; ?>
            <a class="profile" href="<?= $href; ?>" target="_blank"></a>
        </div>
    </aside>

    <!-- data -->
    <aside class="data">
        <div class="scroll">
            <?php include ROOT_DIR . path('src', 'template', 'group', 'time.php'); ?>
            <?php include ROOT_DIR . path('src', 'template', 'group', 'distance.php'); ?>
            <?php include ROOT_DIR . path('src', 'template', 'group', 'speed.php'); ?>
            <?php include ROOT_DIR . path('src', 'template', 'group', 'pace.php'); ?>
            <?php include ROOT_DIR . path('src', 'template', 'group', 'elevation.php'); ?>
        </div>
    </aside>

</main>

<!-- bottom -->
<?php include ROOT_DIR . path('src', 'include', 'bottom.php'); ?>
