<div class="group speed">
    <h2>Speed</h2>
    <div class="item speed">
        <h3>Climbing</h3>
        <?php $value = (array_sum(array_map(function($track) { return $track->speed->climb; }, $track_array)) / count($track_array)); ?>
        <div class="value"><?= number_format($value, 2); ?></div>
    </div>
    <div class="item speed">
        <h3>Descending</h3>
        <?php $value = (array_sum(array_map(function($track) { return $track->speed->descent; }, $track_array)) / count($track_array)); ?>
        <div class="value"><?= number_format($value, 2); ?></div>
    </div>
    <div class="item speed">
        <h3>Flat</h3>
        <?php $value = (array_sum(array_map(function($track) { return $track->speed->flat; }, $track_array)) / count($track_array)); ?>
        <div class="value"><?= number_format($value, 2); ?></div>
    </div>
    <div class="item speed">
        <h3>Combined</h3>
        <?php $value = (array_sum(array_map(function($track) { return $track->speed->average; }, $track_array)) / count($track_array)); ?>
        <div class="value"><?= number_format($value, 2); ?></div>
    </div>
</div>
