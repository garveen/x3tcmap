<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'/>
        <link rel="stylesheet" href="style.css" type="text/css" />
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
                    <button id='btn-zoomin' onclick="zoomin()">放大</button>
                    <button id='btn-zoomout' onclick="zoomout()">缩小</button>
                    <button id='btn-direction' onclick="switchDirection()">换坐标</button>
                    <button id='btn-close' onclick="closeModal()">关闭</button>
                </div>
            </div>
            <div class="modal-background" onclick="closeModal()"></div>
        </div>
        <script src="script.js"></script>
        <script>
            var cellWidth = <?=$cellWidth?>;
            var cellHeight = <?=$cellHeight?>;
            var cellGapY = <?=$cellGapY?>;
            var cellGapX = <?=$cellGapX?>;

            var lineWidth = <?=$lineWidth?>;
            var sectors = <?=json_encode($parser->sectors, JSON_UNESCAPED_UNICODE)?>;
            var races = <?=json_encode($parser->translation['1266'], JSON_UNESCAPED_UNICODE)?>;
            var texts = {
                'zoomin': '<?=$parser->translation[1903][10863]?>',
                'zoomout': '<?=$parser->translation[1903][10864]?>',
                'direction': '<?=$parser->translation[1903][10861]?>',
                'close': '<?=$parser->translation[1906][302]?>',
                'gate': '<?=$parser->translation[17][3731]?>',
                'gate_T': '<?=$parser->translation[17][16101]?>'
            }
            init();

        </script>
    </body>
</html>
