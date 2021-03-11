<div class="group elevation">
    <h2>Elevation</h2>
    <div class="item elevation">
        <h3>Min</h3>
        <?php $value = min(array_map(function($track) { return $track->elevation->min; }, $tmp_array)); ?>
        <div class="value"><?= number_format($value, 1); ?></div>
    </div>
    <div class="item elevation">
        <h3>Max</h3>
        <?php $value = max(array_map(function($track) { return $track->elevation->max; }, $tmp_array)); ?>
        <div class="value"><?= number_format($value, 1); ?></div>
    </div>
    <div class="item elevation">
        <h3>Loss</h3>
        <?php $value = array_sum(array_map(function($track) { return $track->elevation->loss; }, $tmp_array)); ?>
        <div class="value"><?= number_format(abs($value)); ?></div>
    </div>
    <div class="item elevation">
        <h3>Gain</h3>
        <?php $value = array_sum(array_map(function($track) { return $track->elevation->gain; }, $tmp_array)); ?>
        <div class="value"><?= number_format($value); ?></div>
    </div>
</div>
