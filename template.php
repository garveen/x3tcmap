<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'/>
        <title id='document-title'>X3 Universe Map</title>
        <link rel="stylesheet" href="<?=$pathPrefix;?>style.css" type="text/css" />
        <style>
            .sector{width: <?=$cellWidth;?>px;height: <?=$cellHeight;?>px}
            .line.jump,.modal-coordinate{height:<?=$fontSize;?>px;}
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
                    <div class='modal-map'>
                        <div id='container-2d'></div>
                        <div id='container-3d' style='display:none'></div>
                    </div>
                </div>
                <div class='modal-footer'>
                    <div class='modal-coordinate'>&nbsp;</div>
                    <div class='controls'>
                        <span id='controls-2d'>
                            <button id='btn-zoomin' onclick="zoomin()"></button>
                            <button id='btn-zoomout' onclick="zoomout()"></button>
                            <button id='btn-direction' onclick="switchDirection()"></button>
                        </span>
                        <button id='btn-3d' onclick="switchRender()">3D (Experimental)</button>
                        <button id='btn-close' onclick="closeModal()"></button>
                    </div>
                </div>
            </div>
            <div class="modal-background" onclick="closeModal()"></div>
        </div>
        <script>
            var cellWidth = <?=$cellWidth;?>;
            var cellHeight = <?=$cellHeight;?>;
            var cellGapY = <?=$cellGapY;?>;
            var cellGapX = <?=$cellGapX;?>;

            var lineWidth = <?=$lineWidth;?>;
            var pathPrefix = '<?=$pathPrefix;?>';

            var isDynamic = <?=json_encode($isDynamic);?>;

            var languages = <?=json_encode(Parser::$languageMap);?>;

            <?=$appendScript;?>
        </script>
        <script src="<?=$pathPrefix;?>three/three.min.js"></script>
        <script src="<?=$pathPrefix;?>three/OrbitControls.js"></script>
        <script src="<?=$pathPrefix;?>three/Projector.js"></script>
        <script src="<?=$pathPrefix;?>three/CanvasRenderer.js"></script>
        <script src="<?=$pathPrefix;?>script.js"></script>
        <script>

        </script>
    </body>
</html>
