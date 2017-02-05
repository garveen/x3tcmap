<?php
include 'Sector.php';
include 'Parser.php';

$code = isset($_GET['lang']) ? $_GET['lang'] : 44;
$map = isset($_GET['map']) ? $_GET['map'] : 'tc';

$languageName = Parser::$languageMap[$code];
$parser = new Parser("lang/0001-L0{$code}.xml", ["maps/x3{$map}_universe.xml", 'maps/x3_universe_2.0.xml']);
$cellWidth = 150;
$cellHeight = 50;
$cellGapY = 10;
$cellGapX = 10;

$lineWidth = 10;

$pathPrefix = 'docs/';

include 'template.php';
