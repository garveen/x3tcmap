<?php
include 'Sector.php';
include 'Parser.php';

$cellWidth = 150;
$cellHeight = 50;
$cellGapY = 10;
$cellGapX = 10;

$lineWidth = 10;

$pathPrefix = '';

$tc = '';
$ap = '';

$appendScript = '';

$isDynamic = false;
ob_start();
include 'template.php';
file_put_contents('docs/universe.html', ob_get_clean());

foreach (Parser::$languageMap as $code => $languageName) {
    foreach (['tc', 'ap'] as $map) {
        $code = sprintf('%02d', $code);
        $parser = new Parser("lang/0001-L0{$code}.xml", ["maps/x3{$map}_universe.xml", "maps/x3_universe_2.0.xml"]);
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
        $$map .= "<a href='universe.html?lang={$code}&map={$map}'>{$languageName}</a><br>";
    }
}

$html = <<<HTML
X3:TC Terran Conflict Universe Map: <br>
$tc
<br>
<br>
<br>
X3:AP Albion Prelude Universe Map: <br>
$ap
HTML;
file_put_contents('docs/index.html', $html);
