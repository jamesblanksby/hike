<div class="group distance">
    <h2>Distance</h2>
    <div class="item distance">
        <h3>Climbing</h3>
        <?php $value = array_sum(array_map(function($track) { return $track->distance->climb; }, $tmp_array)); ?>
        <div class="value"><?= number_format(($value / 1000), 1); ?></div>
    </div>
    <div class="item distance">
        <h3>Descending</h3>
        <?php $value = array_sum(array_map(function($track) { return $track->distance->descent; }, $tmp_array)); ?>
        <div class="value"><?= number_format(($value / 1000), 1); ?></div>
    </div>
    <div class="item distance">
        <h3>Flat</h3>
        <?php $value = array_sum(array_map(function($track) { return $track->distance->flat; }, $tmp_array)); ?>
        <div class="value"><?= number_format(($value / 1000), 1); ?></div>
    </div>
    <div class="item distance">
        <h3>Total</h3>
        <?php $value = array_sum(array_map(function($track) { return $track->distance->total; }, $tmp_array)); ?>
        <div class="value"><?= number_format(($value / 1000), 1); ?></div>
    </div>
</div>
