<?php
$class_award = ['gold', 'silver', 'bronze',];
$class_distance = $class_elevation = $class_time = null;

if (($index = array_search($track->id, array_column($award_distance, 'id'))) !== false) $class_distance = $class_award[$index];
if (($index = array_search($track->id, array_column($award_elevation, 'id'))) !== false) $class_elevation = $class_award[$index];
if (($index = array_search($track->id, array_column($award_time, 'id'))) !== false) $class_time = $class_award[$index];
?>

<?php if (count(array_filter([$class_distance, $class_elevation, $class_time,])) > 0) : ?>
    <div class="group award">
        <h2>Achivements</h2>
        <?php if (!empty($class_distance)) : ?>
            <?php $class = ['item', 'distance', $class_distance,]; ?>
            <div class="<?= implode(' ', $class); ?>"></div>
        <?php endif; ?>
        <?php if (!empty($class_elevation)) : ?>
            <?php $class = ['item', 'elevation', $class_elevation,]; ?>
            <div class="<?= implode(' ', $class); ?>"></div>
        <?php endif; ?>
        <?php if (!empty($class_time)) : ?>
            <?php $class = ['item', 'time', $class_time,]; ?>
            <div class="<?= implode(' ', $class); ?>"></div>
        <?php endif; ?>
    </div>
<?php endif; ?>
