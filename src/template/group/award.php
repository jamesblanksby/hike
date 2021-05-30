<?php
$class_award = ['gold', 'silver', 'bronze',];
$class_distance = $class_elevation = $class_pace = null;

if (($index = array_search($track->id, array_column($award_distance, 'id'))) !== false) $class_distance = $class_award[$index];
if (($index = array_search($track->id, array_column($award_elevation, 'id'))) !== false) $class_elevation = $class_award[$index];
if (($index = array_search($track->id, array_column($award_pace, 'id'))) !== false) $class_pace = $class_award[$index];
?>

<?php if (count(array_filter([$class_distance, $class_elevation, $class_pace,])) > 0) : ?>
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
        <?php if (!empty($class_pace)) : ?>
            <?php $class = ['item', 'pace', $class_pace,]; ?>
            <div class="<?= implode(' ', $class); ?>"></div>
        <?php endif; ?>
    </div>
<?php endif; ?>
