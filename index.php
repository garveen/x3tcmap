<?php
include 'Sector.php';
include 'Parser.php';

$code = isset($_GET['lang']) ? $_GET['lang'] : 44;
$map = isset($_GET['map']) ? $_GET['map'] : 'tc';

$languageName = Parser::$languageMap[$code];
$code = sprintf('%02d', $code);

$parser = new Parser("lang/0001-L0{$code}.xml", ["maps/x3{$map}_universe.xml", 'maps/x3_universe_2.0.xml']);
$cellWidth = 150;
$cellHeight = 50;
$cellGapY = 10;
$cellGapX = 10;

$lineWidth = 10;

$pathPrefix = 'docs/';

$isDynamic = true;

$parser = new Parser("lang/0001-L0{$code}.xml", ["maps/x3{$map}_universe.xml", "maps/x3_universe_2.0.xml"]);
$appendScript = '';
foreach ([
    'sectors' => $parser->sectors,
    'races' => $parser->translation['1266'],
    'icons' => $parser->iconUsed,
    'translations' => $parser->translationUsed,
    'texts' => [
        'zoomin' => $parser->translation[1903][10863],
        'zoomout' => $parser->translation[1903][10864],
        'direction' => $parser->translation[1903][10861],
        'close' => $parser->translation[1906][302],
        'gate' => $parser->translation[17][3731],
        'gate_T' => $parser->translation[17][16101],
    ],

] as $k => $v) {
    $appendScript .= "var {$k} = " . json_encode($v, JSON_UNESCAPED_UNICODE) . ';';
}

include 'template.php';
