<?php
include 'Sector.php';
include 'Parser.php';

$cellWidth = 150;
$cellHeight = 50;
$cellGapY = 10;
$cellGapX = 10;

$lineWidth = 10;

foreach (['chinese', 'english'] as $language) {
    $parser = new Parser("lang/{$language}.xml", ['maps/x3_universe.xml', 'maps/x3_universe_2.0.xml']);
    ob_start();
    include 'template.php';
    $content = ob_get_clean();
    file_put_contents("{$language}.html", $content);
}
rename('english.html', 'index.html');
