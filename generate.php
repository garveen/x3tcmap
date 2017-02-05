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

foreach (Parser::$languageMap as $code => $languageName) {
    foreach (['tc', 'ap'] as $map) {
        $code = sprintf('%02d', $code);
        $parser = new Parser("lang/0001-L0{$code}.xml", ["maps/x3{$map}_universe.xml", "maps/x3_universe_2.0.xml"]);
        ob_start();
        include 'template.php';
        $content = ob_get_clean();
        $name = "{$map}{$code}.html";
        file_put_contents("docs/{$name}", $content);
        $$map .= "<a href='{$name}'>{$languageName}</a><br>";
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
