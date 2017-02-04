<?php
include 'Sector.php';
include 'Parser.php';

$language = isset($_GET['lang']) ? $_GET['lang'] : 'english';
$parser = new Parser("lang/{$language}.xml", ['maps/x3_universe.xml', 'maps/x3_universe_2.0.xml']);
$cellWidth = 150;
$cellHeight = 50;
$cellGapY = 10;
$cellGapX = 10;

$lineWidth = 10;

include 'template.php';
