<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'/>
        <title>X3 <?=strtoupper($map);?> Universe Map for <?=$languageName;?></title>
        <link rel="stylesheet" href="<?=$pathPrefix;?>style.css" type="text/css" />
        <style>
            .sector{width: <?=$cellWidth;?>px;height: <?=$cellHeight;?>px}
            .line.jump{height:<?=$lineWidth;?>px;}
        </style>
    </head>
    <body>
        <div id='container'>

        </div>

         <div id="modal-overlay">
            <div class="modal-data">
                <div class='modal-header'>
                    <span class='sector-name' onclick='switchImage()'></span>
                    <iframe src="https://ghbtns.com/github-btn.html?user=garveen&repo=x3tcmap&type=star&count=true" frameborder="0" scrolling="0" width="120px" height="24px"></iframe>
                </div>
                <div class="modal-content">
                    <div class="modal-map">
                    </div>
                </div>
                <div class='modal-footer'>
                    <div class='modal-coordinate'></div>
                    <button id='btn-zoomin' onclick="zoomin()"></button>
                    <button id='btn-zoomout' onclick="zoomout()"></button>
                    <button id='btn-direction' onclick="switchDirection()"></button>
                    <button id='btn-close' onclick="closeModal()"></button>
                </div>
            </div>
            <div class="modal-background" onclick="closeModal()"></div>
        </div>
        <script src="<?=$pathPrefix;?>script.js"></script>
        <script>
            var cellWidth = <?=$cellWidth;?>;
            var cellHeight = <?=$cellHeight;?>;
            var cellGapY = <?=$cellGapY;?>;
            var cellGapX = <?=$cellGapX;?>;

            var lineWidth = <?=$lineWidth;?>;
            var sectors = <?=json_encode($parser->sectors, JSON_UNESCAPED_UNICODE);?>;
            var races = <?=json_encode($parser->translation['1266'], JSON_UNESCAPED_UNICODE);?>;
            var texts = {
                'zoomin': <?=json_encode($parser->translation[1903][10863], JSON_UNESCAPED_UNICODE)?>,
                'zoomout': <?=json_encode($parser->translation[1903][10864], JSON_UNESCAPED_UNICODE)?>,
                'direction': <?=json_encode($parser->translation[1903][10861], JSON_UNESCAPED_UNICODE)?>,
                'close': <?=json_encode($parser->translation[1906][302], JSON_UNESCAPED_UNICODE)?>,
                'gate': <?=json_encode($parser->translation[17][3731], JSON_UNESCAPED_UNICODE)?>,
                'gate_T': <?=json_encode($parser->translation[17][16101], JSON_UNESCAPED_UNICODE);?>
            }
            init();

        </script>
    </body>
</html>
