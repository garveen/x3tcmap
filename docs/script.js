'use strict';
var zooming, currX, currY;
var image = 'gui/gui_master_newest.png';
var e1 = document.getElementById('modal-overlay');
var direction = 'z';
var QueryString;
var lang;
var map;
var colorIndex = 0;
var mapSize;
var group;
var renderer;
var scene;
var camera;
var controls;
var sectorSize;
var render3D = true;
var ThreeInited = false;
var container3DRect;
var moreGridsLine;
var coordinateLine;
var objectFrame;
var baseTexture;
var spriteMaterialCache = {};

var sMap = {
    0: 'N',
    1: 'S',
    2: 'W',
    3: 'E',
    5: 'N',
    6: 'S',
    7: 'W',
    8: 'E'
};


function show() {
    'use strict';
    document.getElementById('document-title').innerHTML = 'X3 ' + map.toUpperCase() + ' Universe Map for ' + languages[lang];
    ['zoomin', 'zoomout', 'direction', 'close'].forEach(function (k) {
        document.getElementById('btn-' + k).innerHTML = texts[k];
    });
    var html = '';
    var container = document.createElement('div');
    container.id = 'container';
    var sector;
    var style;
    var className;

    var isNeighbour = function (sector, gate) {
        return Math.abs(sector.x - gate.gx) + Math.abs(sector.y - gate.gy) == 1;
    };
    Object.keys(sectors).forEach(function (sectorIndex) {
        sector = sectors[sectorIndex];
        if (!sector.gates) {
            return true;
        }
        sector.gates.forEach(function (gate) {
            if (isNeighbour(sector, gate)) {
                style = lineStyle(sector, gate);
                if (!style) {
                    return true;
                }
                className = 'line';
            } else {
                style = jumpStyle(sector, gate);
                if (!style) {
                    return true;
                }
                className = 'line jump';
            }
            var div = document.createElement('div');
            div.className = className;
            div.style.cssText = style;
            container.appendChild(div);
        });
    });
    var sectorDiv;
    Object.keys(sectors).forEach(function (sectorIndex) {
        sector = sectors[sectorIndex];

        sectorDiv = document.createElement('div');
        sectorDiv.className = 'sector race-' + sector.race;
        sectorDiv.style.cssText = 'left: ' + calcLeft(sector.x) + 'px;top: ' + calcTop(sector.y) + 'px';
        sectorDiv.x = sector.x;
        sectorDiv.y = sector.y;
        sectorDiv.onclick = function (evt) {
            overlay(this.x, this.y);
        };
        var span;
        span = document.createElement('span');
        span.className = 'name';
        var names = translations[sector.name].split('|');
        span.innerHTML = names[0];
        sectorDiv.appendChild(span);
        if (typeof names[1] != 'undefined') {
            span = document.createElement('span');
            span.className = 'translated';
            span.innerHTML = names[1];
            sectorDiv.appendChild(span);
        }
        span = document.createElement('span');
        span.className = 'position';
        span.innerHTML = sector.x + ' ' + sector.y;
        sectorDiv.appendChild(span);
        span = document.createElement('span');
        span.className = 'race';
        span.innerHTML = races[sector.race];
        sectorDiv.appendChild(span);
        span = document.createElement('span');
        span.className = 'safety';
        span.innerHTML = translations[sector.safety];
        sectorDiv.appendChild(span);
        span = document.createElement('span');
        span.className = 'stations';
        span.innerHTML = sector.stations;
        sectorDiv.appendChild(span);
        container.appendChild(sectorDiv);
    });
    document.body.replaceChild(container, document.getElementById('container'));
}


function calcLeft(x) {
    return x * (cellWidth + cellGapX);
};

function calcTop(y) {
    return y * (cellHeight + cellGapY);
};

function lineStyle(sector, gate) {
    if (sector.x > gate.gx || sector.y > gate.gy) {
        return false;
    }
    var myLeft = calcLeft(sector.x + 0.5);
    var myTop = calcTop(sector.y + 0.5);
    if (sector.x == gate.gx) {
        var width = lineWidth;
        var height = cellHeight;
        myLeft -= lineWidth / 2;
    } else {
        var width = cellWidth;
        var height = lineWidth;
        myTop -= lineWidth;
    }
    return "left:" + myLeft + "px;top:" + myTop + "px;width:" + width + "px;height:" + height + "px";
};

function jumpStyle(sector, gate) {
    if (sector.x > gate.gx) {
        return false;
    }
    if (sector.x == gate.gx && sector.y > gate.gy) {
        return false;
    }
    var colors = [
        'orange',
        'red',
        'green',
        // 'yellow',
        'blue',
        // 'pink',
    ];
    colorIndex++;
    if (colorIndex >= colors.length) {
        colorIndex = 0;
    }
    var color = colors[colorIndex];
    var myLeft = calcLeft(sector.x + 0.5);
    var myTop = calcTop(sector.y + 0.5);
    var dx = calcLeft(gate.gx - sector.x);
    var dy = calcTop(gate.gy - sector.y);
    var length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    var rad;
    if (dx == 0) {
        rad = Math.PI / 2;
    } else {
        rad = Math.atan(dy / dx);
    }
    return "background-color:" + color + ";left:" + myLeft + "px;top:" + myTop + "px;width:" + length + "px;transform:rotate(" + rad + "rad)";
};

function switchImage() {
    image = image == 'gui/gui_master_diff.png' ? 'gui/gui_master_newest.png' : 'gui/gui_master_diff.png';
    overlay(currX, currY, zooming);
}

function switchDirection() {
    direction = direction == 'z' ? 'y' : 'z';
    overlay(currX, currY, zooming);
}

function zoomin() {
    overlay(currX, currY, zooming / 2);
}

function zoomout() {
    overlay(currX, currY, zooming * 2);
}

function closeModal() {
    e1.style.visibility = "hidden";
    direction = 'z';
}

function calcKiloMeter(el) {
    return 'x: ' + (el.x / 500000).toFixed(2) + 'km y: ' + (el.y / 500000).toFixed(2) + 'km z: ' + (el.z / 500000).toFixed(2) + 'km';
};


function overlay(x, y, zoom) {
    e1.style.visibility = "visible";

    if (typeof zoom == 'undefined') {
        zoom = 2;
    }
    zooming = zoom;
    currX = x;
    currY = y;
    var iconSize = 31;
    mapSize = window.innerHeight - 200;
    var map = document.getElementsByClassName('modal-map')[0];
    map.style.height = map.style.width = '' + mapSize + 'px';
    // get actual height
    mapSize = map.clientHeight;
    var sector = sectors[x + "_" + y];
    document.getElementsByClassName('sector-name')[0].innerHTML = translations[sector.name] + ' [' + x + ', ' + y + ']'
    if (render3D) {
        renderThree(sector);
    } else {
        renderDom(sector, zoom);
    }
}

function renderThree(sector) {
    if (!ThreeInited) {
        initThree();
    }
    mapSize = Math.ceil(mapSize / 2) * 2;
    if (group) {
        scene.remove(group);
    }
    group = new THREE.Group();
    var loader = new THREE.TextureLoader();
    var spriteMap = loader.load(pathPrefix + "gui/gui_master_newest.png", function (baseTextureT) {
        baseTexture = baseTextureT;
        var width = baseTexture.image.width;
        var height = baseTexture.image.height;
        sectorSize = sector.size;
        camera.position.x = 0;
        camera.position.y = mapSize / 1.4;
        camera.position.z = 0;
        camera.updateProjectionMatrix();
        controls.rotateLeft(Math.PI / 2);
        renderer.setSize(mapSize, mapSize);
        var ratio = sectorSize * 2 / mapSize;

        [17, 5, 6].forEach(function (index) {
            if (typeof sector.objects[index] == 'undefined') {
                return true;
            }
            for (var subType in sector.objects[index]) {
                sector.objects[index][subType].forEach(function (object, index) {
                    var icon = icons[object.icon];
                    var spriteMaterial;
                    if (!spriteMaterialCache[object.icon]) {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.width = icon.w;
                        canvas.height = icon.h;
                        context.drawImage(
                            baseTexture.image, // source
                            icon.l, icon.t, // source x, y
                            icon.w, icon.h, // source w, h
                            0, 0, // dist x, y
                            icon.w, icon.h // dist w,h
                        );
                        var spriteMap = new THREE.Texture(canvas);
                        spriteMap.needsUpdate = true;
                        spriteMaterial = new THREE.SpriteMaterial({
                            map: spriteMap,
                            color: 0xffffff
                        });
                        spriteMaterialCache[object.icon] = spriteMaterial;
                    }
                    spriteMaterial = spriteMaterialCache[object.icon];
                    var sprite = new THREE.Sprite(spriteMaterial);
                    sprite.scale.set(icon.w * 1.5, icon.h * 1.5, 0);
                    sprite.position.set(object.z / ratio, object.y / ratio, object.x / ratio);
                    sprite.object = object;

                    group.add(sprite);
                })
            }
        });

        var gateSize = 32;

        sector.gates.forEach(function (gate) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.height = gateSize;
            canvas.width = gateSize;
            context.font = "24px Helvetica, Tahoma, Arial";
            var metrics = context.measureText(sMap[gate.s]);
            var textWidth = metrics.width;
            context.fillStyle = "rgb(249,185,111)";
            context.fillText(sMap[gate.s], gateSize / 2 - Math.round(textWidth / 2), 24);
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({
                map: texture
            });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(gateSize, gateSize, 0);

            sprite.position.set(gate.z / ratio, gate.y / ratio, gate.x / ratio)
            sprite.coordinateText = (gate.s > 4 ? texts['gate_T'] : texts['gate']) + ' [' + translations[
                sectors[gate.gx + '_' + gate.gy].name] + '] ' + calcKiloMeter(gate)
            sprite.isGate = true;
            sprite.object = gate;
            group.add(sprite);
        })
        scene.add(group);
        controls.update();
        if (false) {
            window.setTimeout(function(){
                controls.autoRotate = true;
                function animate() {
                    requestAnimationFrame( animate );

                    controls.update();
                    render();
                }
                animate();
            },10000);

        }
        container3DRect = document.getElementById('container-3d').getBoundingClientRect();
        container3DRect.mapSize = mapSize;

    })
}

function renderDom(sector, zoom) {
    var map = document.getElementById('container-2d');
    if (zoom == 2) {
        map.innerHTML = '<div class="map-visual-area"></div>';
    } else {
        map.innerHTML = '';
    }
    var size = sector.size * zoom;
    var calcPosition = function (el) {
        return {
            x: (el.x + size) / size / 2,
            y: (el.y + size) / size / 2,
            z: (el.z + size) / size / 2
        };
    };
    var calcStyle = function (position) {
        return 'left: ' + (position.x * mapSize) + 'px;top: ' + (mapSize - position[direction] * mapSize) + 'px;';
    };
    [17, 5, 6].forEach(function (index) {
        if (typeof sector.objects[index] == 'undefined') {
            return true;
        }
        for (var subType in sector.objects[index]) {
            sector.objects[index][subType].forEach(function (object, index) {
                var div = document.createElement('div');
                div.className = 'map-object';
                var position = calcPosition(object);
                var style = calcStyle(position) + 'width:' + icons[object.icon].w + 'px;height:' + icons[object.icon].h + 'px;background:url(' +
                    pathPrefix + image + ') no-repeat -' + icons[object.icon].l + 'px -' + icons[object.icon].t + 'px';
                div.style.cssText = style;
                div.onmouseover = function(evt) {
                    showCoordinate(object);
                };
                map.appendChild(div);
            })
        }
    })
    sector.gates.forEach(function (gate) {
        var div = document.createElement('div');
        div.className = 'map-gate';
        var position = calcPosition(gate);
        div.style.cssText = calcStyle(position);
        div.onmouseover = function(evt) {
            showCoordinate(gate);
        }
        div.onclick = function () {
            overlay(gate.gx, gate.gy);
        }
        div.innerHTML = sMap[gate.s];
        map.appendChild(div);
    })
}

function showCoordinate(object) {
    var html;
    if (object.gid) {
        // is gate
        html = (object.s > 4 ? texts['gate_T'] : texts['gate']) + ' [' + translations[
                sectors[object.gx + '_' + object.gy].name] + '] ' + calcKiloMeter(object)
    } else {
        // not gate
        html = translations[object.name] + ' ' + calcKiloMeter(object);
    }
    document.getElementsByClassName('modal-coordinate')[0].innerHTML = html;
}

function init() {
    // stackoverflow-oriented programming
    QueryString = function () {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }();
    lang = typeof QueryString.lang != 'undefined' ? QueryString.lang : '44';
    map = typeof QueryString.map != 'undefined' ? QueryString.map : 'tc';
    if (!isDynamic) {
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = '' + map + lang + '.js';
        document.body.appendChild(js);
    }
    if (render3D) {
        initThree();
    }
}

function initThree() {
    ThreeInited = true;
    var mapSize = 500;
    var container = document.getElementById('container-3d');
    var nebulaDistance = 1500;
    camera = new THREE.PerspectiveCamera(90, 1, 1, 10000);
    scene = new THREE.Scene();
    // Grid
    var size = 500,
        step = 50;
    var geometry = new THREE.Geometry();
    for (var i = -size; i <= size; i += step) {
        geometry.vertices.push(new THREE.Vector3(-size, 0, i));
        geometry.vertices.push(new THREE.Vector3(size, 0, i));
        geometry.vertices.push(new THREE.Vector3(i, 0, -size));
        geometry.vertices.push(new THREE.Vector3(i, 0, size));
    }

    var material = new THREE.LineBasicMaterial({
        color: 'rgb(38,39,62)',
        opacity: 0.5
    });
    var line = new THREE.LineSegments(geometry, material);
    scene.add(line);
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(size, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, size));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, size / 2, 0));

    var material = new THREE.LineBasicMaterial({
        color: 'rgb(61,62,99)',
        opacity: 1
    });
    line = new THREE.LineSegments(geometry, material);
    scene.add(line);

    ['x', 'z'].forEach(function (letter, index) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = 32;
        canvas.width = 32;
        context.font = "24px Helvetica, Tahoma, Arial";
        var metrics = context.measureText(letter);
        var textWidth = metrics.width;
        context.fillStyle = "white";
        context.fillText(letter,  16 - Math.round(textWidth / 2), 16);
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(32, 32, 0);
        sprite.position.set(size * (index == 1), 0, size * (index == 0))
        scene.add(sprite);
    });

    // https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
    var supportWebgl = true;
    try {
        var canvas = document.createElement('canvas');
        supportWebgl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        supportWebgl = false;
    }

    if (supportWebgl) {
        var a, b, l;
        for (var j = 3; j--;) {
            geometry = new THREE.Geometry();

            for ( i = 0; i < 300; i ++ ) {
                a = Math.acos( 1 - 2 * Math.random());
                b = Math.random() * Math.PI * 2;
                l = Math.sin(a);
                geometry.vertices.push(new THREE.Vector3(
                    Math.sin(b) * l * nebulaDistance,
                    Math.cos(a) * nebulaDistance,
                    Math.cos(b) * l * nebulaDistance
                ));
            }

            var starsMaterial = new THREE.PointsMaterial({
                color: 0x777777 + j * 0x222222,
                size: (j + 1) * 2
            });

            var particles = new THREE.Points( geometry, starsMaterial);

            scene.add( particles );
        }

        var geometry = new THREE.SphereGeometry(nebulaDistance - 100, 60, 40);
        geometry.scale(1, -1, 1);
        var material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(pathPrefix + 'gui/nebula_redreef_background.jpg'),
            transparent: true,
            alphaMap: new THREE.TextureLoader().load(pathPrefix + 'gui/nebula_redreef_background_mask.jpg')
        });
        var mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);
        renderer = new THREE.WebGLRenderer();
    } else {
        renderer = new THREE.CanvasRenderer();
    }

    renderer.setClearColor('black');
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mapSize, mapSize);

    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.mouseButtons = {
        ORBIT: THREE.MOUSE.LEFT,
        ZOOM: THREE.MOUSE.RIGHT,
        PAN: THREE.MOUSE.MIDDLE
    }
    controls.maxDistance = nebulaDistance - 1;

    controls.addEventListener('change', function (evt) {
        render();
    })
    controls.update();


    var raycaster = new THREE.Raycaster();
    raycaster.near = 2;
    var mouse = new THREE.Vector2();

    container3DRect = document.getElementById('container-3d').getBoundingClientRect();
    container3DRect.mapSize = mapSize;

    function getRealIntersect(intersects) {
        var intersect;
        for (var i = intersects.length; i--;) {
            if (intersects[i].distance < 0.0001) continue;
            return intersects[i];
        }
    }

    function onClick(event) {
        mouse.x = ((event.clientX - container3DRect.left) / container3DRect.mapSize) * 2 - 1;
        mouse.y = - ((event.clientY - container3DRect.top) / container3DRect.mapSize) * 2 + 1;
        if (mouse.x < -1 || mouse.x > 1 || mouse.y < -1 || mouse.y > 1) {
            return;
        }
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(group.children);
        var intersect = getRealIntersect(intersects);
        if (intersect && intersect.object.isGate) {
            var gate = intersect.object;
            camera.position.copy(gate.position);
            // camera.position.x *= 0.9;
            // camera.position.y *= 0.9;
            // camera.position.z *= 0.9;
            controls.update();
        }
    }

    function onMouseMove( event ) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouse.x = ((event.clientX - container3DRect.left) / container3DRect.mapSize) * 2 - 1;
        mouse.y = - ((event.clientY - container3DRect.top) / container3DRect.mapSize) * 2 + 1;
        if (mouse.x < -1 || mouse.x > 1 || mouse.y < -1 || mouse.y > 1) {
            return;
        }
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(group.children);
        var intersect = getRealIntersect(intersects);
        if (intersect && intersect.object) {
            var object = intersect.object;
            showCoordinate(object.object);
            if (object.isGate) {
                container.style.cursor = "pointer";
            } else {
                container.style.cursor = "";
            }
            if (objectFrame) {
                if (objectFrame.object == object) {
                    return;
                }
                scene.remove(objectFrame);
            }

            var spriteMap = baseTexture.clone()
            spriteMap.offset = new THREE.Vector2(447 / 1024, 1 - 506 / 512)
            spriteMap.repeat = new THREE.Vector2(30 / 1024, 30 / 512)
            spriteMap.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({
                map: spriteMap,
                color: 0xffffff
            });
            objectFrame = new THREE.Sprite(spriteMaterial);
            objectFrame.scale.set(30 * 1.5, 30 * 1.5, 0);
            objectFrame.position.copy(object.position);
            objectFrame.object = object;
            objectFrame.renderOrder = 1;

            scene.add(objectFrame);

            if (!moreGridsLine) {
                render();
                return;
            }
            if (coordinateLine) {
                scene.remove(coordinateLine);
            }

            var geometry = new THREE.Geometry();
            var x = object.position.x;
            var y = object.position.y;
            var z = object.position.z;
            for (var i = 3; i; i--) {
                geometry.vertices.push(new THREE.Vector3(x, y, z));
                geometry.vertices.push(new THREE.Vector3((i != 3) * x, (i != 2) * y, (i != 1) * z));
            }

            var material = new THREE.LineBasicMaterial({
                color: 'rgb(0, 60, 60)',
                opacity: 0.5
            });
            coordinateLine = new THREE.LineSegments(geometry, material);
            coordinateLine.object = object;
            scene.add(coordinateLine);
            render();
        } else {
            if (container.style.cursor) {
                container.style.cursor = "";
            }
        }



    }
    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('click', onClick, false);


    container.appendChild(renderer.domElement);
}

function render() {
    renderer.render(scene, camera);
}

function switchRender() {
    render3D = !render3D;
    document.getElementById('controls-2d').style.display = render3D ? 'none' : 'inline-block';
    document.getElementById('controls-3d').style.display = render3D ? 'inline-block' : 'none';
    document.getElementById('container-2d').style.display = render3D ? 'none' : 'block';
    document.getElementById('container-3d').style.display = render3D ? 'block' : 'none';
    document.getElementById('btn-3d').innerHTML = render3D ? '2D' : '3D';
    overlay(currX, currY);
}

function moreGrids() {
    if (moreGridsLine) {
        scene.remove(moreGridsLine);
        moreGridsLine = null;
        if (coordinateLine) {
            scene.remove(coordinateLine);
            coordinateLine = null;
        }
        render();
        return;
    }
    var geometry = new THREE.Geometry();
    var size = 500;
    var step = 50;
    for (var i = -size / 2; i <= size / 2; i += step) {
        geometry.vertices.push(new THREE.Vector3(-size, i, 0));
        geometry.vertices.push(new THREE.Vector3(size, i, 0));
        geometry.vertices.push(new THREE.Vector3(i, -size / 2, 0));
        geometry.vertices.push(new THREE.Vector3(i, size / 2, 0));

        geometry.vertices.push(new THREE.Vector3(0, i, -size));
        geometry.vertices.push(new THREE.Vector3(0, i, size));
        geometry.vertices.push(new THREE.Vector3(0, -size / 2, i));
        geometry.vertices.push(new THREE.Vector3(0, size / 2, i));
    }
    var material = new THREE.LineBasicMaterial({
        color: 'rgb(30,31,50)',
        opacity: 0.2
    });
    var line = new THREE.LineSegments(geometry, material);
    scene.add(line);
    moreGridsLine = line;
    render();
}

init();
if (isDynamic) {
    show();
}
