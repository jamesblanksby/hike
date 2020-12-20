<div class="group pace">
    <h2>Pace</h2>
    <div class="item pace">
        <h3>Climbing</h3>
        <?php 
        $total_time = array_sum(array_map(function($track) { return $track->time->climb; }, $track_array));
        $total_distance = array_sum(array_map(function($track) { return $track->distance->climb; }, $track_array));
        $value = ($total_time / ($total_distance / 1000));
        ?>
        <div class="value"><?= date('i:s', $value); ?></div>
    </div>
    <div class="item pace">
        <h3>Descending</h3>
        <?php 
        $total_time = array_sum(array_map(function($track) { return $track->time->descent; }, $track_array));
        $total_distance = array_sum(array_map(function($track) { return $track->distance->descent; }, $track_array));
        $value = ($total_time / ($total_distance / 1000));
        ?>
        <div class="value"><?= date('i:s', $value); ?></div>
    </div>
    <div class="item pace">
        <h3>Flat</h3>
        <?php 
        $total_time = array_sum(array_map(function($track) { return $track->time->flat; }, $track_array));
        $total_distance = array_sum(array_map(function($track) { return $track->distance->flat; }, $track_array));
        $value = ($total_time / ($total_distance / 1000));
        ?>
        <div class="value"><?= date('i:s', $value); ?></div>
    </div>
    <div class="item pace">
        <h3>Combined</h3>
        <?php 
        $total_time = array_sum(array_map(function($track) { return $track->time->moving; }, $track_array));
        $total_distance = array_sum(array_map(function($track) { return $track->distance->total; }, $track_array));
        $value = ($total_time / ($total_distance / 1000));
        ?>
        <div class="value"><?= date('i:s', $value); ?></div>
    </div>
</div>
