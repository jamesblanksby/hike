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
        <div>
            <div class="group time">
                <h2>Time</h2>
                <div class="item">
                    <h3>Climbing</h3>
                    <?php
                    $value = array_sum(array_map(function($track) { return $track->time->climb; }, $track_array));
                    $value = format_second($value);
                    ?>
                    <div class="value">
                        <?php if (!empty($value->day)) : ?>
                            <div class="day"><?= $value->day; ?></div>
                        <?php endif; ?>
                        <div class="hour"><?= $value->hour; ?></div>
                        <div class="minute"><?= $value->minute; ?></div>
                    </div>
                </div>
                <div class="item">
                    <h3>Descending</h3>
                    <?php
                    $value = array_sum(array_map(function($track) { return $track->time->descent; }, $track_array));
                    $value = format_second($value);
                    ?>
                    <div class="value">
                        <?php if (!empty($value->day)) : ?>
                            <div class="day"><?= $value->day; ?></div>
                        <?php endif; ?>
                        <div class="hour"><?= $value->hour; ?></div>
                        <div class="minute"><?= $value->minute; ?></div>
                    </div>
                </div>
                <div class="item">
                    <h3>Flat</h3>
                    <?php
                    $value = array_sum(array_map(function($track) { return $track->time->flat; }, $track_array));
                    $value = format_second($value);
                    ?>
                    <div class="value">
                        <?php if (!empty($value->day)) : ?>
                            <div class="day"><?= $value->day; ?></div>
                        <?php endif; ?>
                        <div class="hour"><?= $value->hour; ?></div>
                        <div class="minute"><?= $value->minute; ?></div>
                    </div>
                </div>
                <div class="item">
                    <h3>Total</h3>
                    <?php
                    $value = array_sum(array_map(function($track) { return $track->time->total; }, $track_array));
                    $value = format_second($value);
                    ?>
                    <div class="value">
                        <?php if (!empty($value->day)) : ?>
                            <div class="day"><?= $value->day; ?></div>
                        <?php endif; ?>
                        <div class="hour"><?= $value->hour; ?></div>
                        <div class="minute"><?= $value->minute; ?></div>
                    </div>
                </div>
            </div>
            <div class="group distance">
                <h2>Distance</h2>
                <div class="item">
                    <h3>Climbing</h3>
                    <?php $value = array_sum(array_map(function($track) { return $track->distance->climb; }, $track_array)); ?>
                    <div class="value"><?= number_format(($value / 1000), 1); ?></div>
                </div>
                <div class="item">
                    <h3>Descending</h3>
                    <?php $value = array_sum(array_map(function($track) { return $track->distance->descent; }, $track_array)); ?>
                    <div class="value"><?= number_format(($value / 1000), 1); ?></div>
                </div>
                <div class="item">
                    <h3>Flat</h3>
                    <?php $value = array_sum(array_map(function($track) { return $track->distance->flat; }, $track_array)); ?>
                    <div class="value"><?= number_format(($value / 1000), 1); ?></div>
                </div>
                <div class="item">
                    <h3>Total</h3>
                    <?php $value = array_sum(array_map(function($track) { return $track->distance->total; }, $track_array)); ?>
                    <div class="value"><?= number_format(($value / 1000), 1); ?></div>
                </div>
            </div>
            <div class="group speed">
                <h2>Speed</h2>
                <div class="item">
                    <h3>Climbing</h3>
                    <?php $value = (array_sum(array_map(function($track) { return $track->speed->climb; }, $track_array)) / count($track_array)); ?>
                    <div class="value"><?= number_format($value, 2); ?></div>
                </div>
                <div class="item">
                    <h3>Descending</h3>
                    <?php $value = (array_sum(array_map(function($track) { return $track->speed->descent; }, $track_array)) / count($track_array)); ?>
                    <div class="value"><?= number_format($value, 2); ?></div>
                </div>
                <div class="item">
                    <h3>Flat</h3>
                    <?php $value = (array_sum(array_map(function($track) { return $track->speed->flat; }, $track_array)) / count($track_array)); ?>
                    <div class="value"><?= number_format($value, 2); ?></div>
                </div>
                <div class="item">
                    <h3>Combined</h3>
                    <?php $value = (array_sum(array_map(function($track) { return $track->speed->average; }, $track_array)) / count($track_array)); ?>
                    <div class="value"><?= number_format($value, 2); ?></div>
                </div>
            </div>
            <div class="group pace">
                <h2>Pace</h2>
                <div class="item">
                    <h3>Climbing</h3>
                    <?php 
                    $total_time = array_sum(array_map(function($track) { return $track->time->climb; }, $track_array));
                    $total_distance = array_sum(array_map(function($track) { return $track->distance->climb; }, $track_array));
                    $value = ($total_time / ($total_distance / 1000));
                    ?>
                    <div class="value"><?= date('i:s', $value); ?></div>
                </div>
                <div class="item">
                    <h3>Descending</h3>
                    <?php 
                    $total_time = array_sum(array_map(function($track) { return $track->time->descent; }, $track_array));
                    $total_distance = array_sum(array_map(function($track) { return $track->distance->descent; }, $track_array));
                    $value = ($total_time / ($total_distance / 1000));
                    ?>
                    <div class="value"><?= date('i:s', $value); ?></div>
                </div>
                <div class="item">
                    <h3>Flat</h3>
                    <?php 
                    $total_time = array_sum(array_map(function($track) { return $track->time->flat; }, $track_array));
                    $total_distance = array_sum(array_map(function($track) { return $track->distance->flat; }, $track_array));
                    $value = ($total_time / ($total_distance / 1000));
                    ?>
                    <div class="value"><?= date('i:s', $value); ?></div>
                </div>
                <div class="item">
                    <h3>Combined</h3>
                    <?php 
                    $total_time = array_sum(array_map(function($track) { return $track->time->total; }, $track_array));
                    $total_distance = array_sum(array_map(function($track) { return $track->distance->total; }, $track_array));
                    $value = ($total_time / ($total_distance / 1000));
                    ?>
                    <div class="value"><?= date('i:s', $value); ?></div>
                </div>
            </div>
            <div class="group elevation">
                <h2>Elevation</h2>
                <div class="item">
                    <h3>Min</h3>
                    <?php $value = min(array_diff(array_map(function($track) { return $track->elevation->min; }, $track_array), [null,])); ?>
                    <div class="value"><?= number_format($value, 1); ?></div>
                </div>
                <div class="item">
                    <h3>Max</h3>
                    <?php $value = max(array_map(function($track) { return $track->elevation->max; }, $track_array)); ?>
                    <div class="value"><?= number_format($value, 1); ?></div>
                </div>
                <div class="item">
                    <h3>Loss</h3>
                    <?php $value = array_sum(array_map(function($track) { return $track->elevation->loss; }, $track_array)); ?>
                    <div class="value"><?= number_format(abs($value)); ?></div>
                </div>
                <div class="item">
                    <h3>Gain</h3>
                    <?php $value = array_sum(array_map(function($track) { return $track->elevation->gain; }, $track_array)); ?>
                    <div class="value"><?= number_format($value); ?></div>
                </div>
            </div>
        </div>
    </aside>

</main>

<!-- bottom -->
<?php include ROOT_DIR . path('src', 'include', 'bottom.php'); ?>
