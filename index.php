<!-- data -->
<?php include __DIR__ . '/src/include/data.php'; ?>

<?php
$file_array = array_map('basename', glob(ROOT_DIR . path(DIR_TMP, 'track', implode('.', ['*', 'json',]))));
$track_array = [];
foreach ($file_array as $file) $track_array []= json_decode(file_get_contents(ROOT_DIR . path(DIR_TMP, 'track', $file)));

$track_id = array_pop(explode('/', $_SERVER['REQUEST_URI']));
$track_active = array_values(array_filter($track_array, function($track) use ($track_id) { return $track_id === $track->id; }))[0];

$year_array = range(date('Y', min(array_map(function($track) { return $track->time->start; }, $track_array))), date('Y'));

$tmp_array = $track_array;
usort($tmp_array, function($a, $b) { return ($b->distance->total - $a->distance->total); });
$award_distance = array_slice($tmp_array, 0, 3);

$tmp_array = $track_array;
usort($tmp_array, function($a, $b) { return ($b->elevation->gain - $a->elevation->gain); });
$award_elevation = array_slice($tmp_array, 0, 3);

$tmp_array = $track_array;
usort($tmp_array, function($a, $b) { return ($b->time->moving - $a->time->moving); });
$award_time = array_slice($tmp_array, 0, 3);
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
                        <?php include ROOT_DIR . path('src', 'template', 'group', 'award.php'); ?>
                        <?php include ROOT_DIR . path('src', 'template', 'group', 'split.php'); ?>
                    </div>
                </div>
            </aside>
        <?php endforeach; ?>
    <?php endif; ?>

    <!-- control -->
    <aside class="control">
        <div class="filter">
            <div class="field dropdown">
                <select id="type" name="type" data-func="filter_year">
                    <option value="*" selected>All Years</option>
                    <?php foreach ($year_array as $year) : ?>
                        <option value="<?= $year; ?>"><?= $year; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
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
