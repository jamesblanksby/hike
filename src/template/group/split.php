<div class="group split">
    <h2>Splits</h2>
    <table>
        <tr>
            <th class="km">KM</th>
            <th class="pace">Pace</th>
            <th class="delta">Split</th>
            <th class="elevation">Elev.</th>
        </tr>
        <?php if (!empty($track->split)) : ?>
            <?php 
            $split_array = $track->split;
            usort($split_array, function($a, $b) { return ($a->time->moving - $b->time->moving); });
            $split_fastest = $split_array[0];
            $split_slowest = $split_array[(count($split_array) - 1)];
            ?>
            <?php foreach ($track->split as $split) : ?>
                <?php $class = array_filter([($split_fastest->time->start === $split->time->start ? 'fastest' : ''),]); ?>
                <tr class="<?= implode(' ', $class); ?>">
                    <td class="km"><?= number_format(($split->distance / 1000)); ?></td>
                    <td class="pace"><?= date('i:s', $split->time->moving); ?></td>
                    <?php $delta = ($split->time->moving / $split_slowest->time->moving); ?>
                    <td class="delta"><div style="<?= implode(':', ['--delta', $delta,]); ?>"></div></td>
                    <td class="elevation"><?= number_format($split->elevation->difference); ?>
                </tr>
                <?php $split_prev = $split; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </table>
</div>
