<div class="group time">
    <h2>Time</h2>
    <div class="item time">
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
    <div class="item time">
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
    <div class="item time">
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
    <div class="item time">
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
