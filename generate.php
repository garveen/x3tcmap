<?php
chdir(__DIR__);

include 'Sector.php';
include 'Parser.php';

$config = include 'config.php';

$cellWidth = 150;
$cellHeight = 50;
$cellGapY = 10;
$cellGapX = 10;

$lineWidth = 10;

$pathPrefix = '';

$fontSize = 12;

$appendScript = '';

$isDynamic = false;
ob_start();
include 'templates/universe.php';
file_put_contents('docs/universe.html', ob_get_clean());

foreach (Parser::$languageMap as $code => $languageName) {
    foreach ($config as $map => $mapConfig) {
        $code = sprintf('%02d', $code);
        $parser = new Parser($config[$map], $code);
        $html = '';
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
            $html .= "var {$k} = " . json_encode($v, JSON_UNESCAPED_UNICODE) . ";\n";
        }
        $html .= 'show();';

        $name = "{$map}{$code}.js";
        file_put_contents("docs/{$name}", $html);
    }
}
ob_start();
include 'templates/index.php';

file_put_contents('docs/index.html', ob_get_clean());
