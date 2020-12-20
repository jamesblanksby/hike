<div class="group stat">
    <h2>Stats</h2>
    <div class="item time">
        <h3>Moving Time</h3>
        <?php $value = format_second($track->time->moving); ?>
        <div class="value">
            <?php if (!empty($value->hour)) : ?>
                <div class="hour"><?= $value->hour; ?></div>
            <?php endif; ?>
            <div class="minute"><?= $value->minute; ?></div>
            <div class="second"><?= $value->second; ?></div>
        </div>
    </div>
    <div class="item time">
        <h3>Total Time</h3>
        <?php $value = format_second($track->time->total); ?>
        <div class="value">
            <?php if (!empty($value->hour)) : ?>
                <div class="hour"><?= $value->hour; ?></div>
            <?php endif; ?>
            <div class="minute"><?= $value->minute; ?></div>
            <div class="second"><?= $value->second; ?></div>
        </div>
    </div>
    <div class="item distance">
        <h3>Distance</h3>
        <div class="value"><?= number_format(($track->distance->total / 1000), 2); ?></div>
    </div>
    <div class="item speed">
        <h3>Speed</h3>
        <div class="value"><?= number_format($track->speed->average, 2); ?></div>
    </div>
    <div class="item pace">
        <h3>Pace</h3>
        <?php $value = ($track->time->moving / ($track->distance->total / 1000)); ?>
        <div class="value"><?= date('i:s', $value); ?></div>
    </div>
    <div class="item elevation">
        <h3>Elev. Gain</h3>
        <div class="value"><?= number_format($track->elevation->gain, 1); ?></div>
    </div>
</div>
