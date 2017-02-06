
var zooming, currX, currY;
var image = 'gui/gui_master_newest.png'
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

var render3D = false;

init();
if(isDynamic) {
    show();
}

function show() {
    document.getElementById('document-title').innerHTML = 'X3 ' + map.toUpperCase() + ' Universe Map for ' + languages[lang];

    ['zoomin', 'zoomout', 'direction', 'close'].forEach(function (k) {
        document.getElementById('btn-' + k).innerHTML = texts[k]
    })
    var html = '';
    var container = document.createElement('div');
    container.id = 'container';

    for(var coordinate in sectors) {
        var sector = sectors[coordinate];
        sector.gates.forEach(function (gate) {
            if (isNeighbour(sector, gate)) {
                var style = lineStyle(sector, gate)
                if (!style) {
                    return true;
                }
                var className = 'line';
            } else {
                var style = jumpStyle(sector, gate)
                if (!style) {
                    return true;
                }
                var className = 'line jump';
            }
            var div = document.createElement('div');
            div.className = className;
            div.style.cssText = style;
            container.appendChild(div)
        })
    }
    for(var coordinate in sectors) {
        var sector = sectors[coordinate];
        var sectorDiv = document.createElement('div')
        sectorDiv.className = 'sector race-' + sector.race
        sectorDiv.style.cssText = 'left: ' + calcLeft(sector.x) + 'px;top: ' + calcTop(sector.y) + 'px'
        sectorDiv.x = sector.x
        sectorDiv.y = sector.y

        sectorDiv.onclick = function (evt) {
            overlay(this.x, this.y)
        }

        var span = document.createElement('span')
        span.className = 'name'
        names = translations[sector.name].split('|')
        span.innerHTML = names[0]
        sectorDiv.appendChild(span)
        if(typeof names[1] != 'undefined') {
            var span = document.createElement('span')
            span.className = 'translated'
            span.innerHTML = names[1]
            sectorDiv.appendChild(span)
        }
        var span  = document.createElement('span')
        span.className = 'position'
        span.innerHTML = sector.x + ' ' + sector.y
        sectorDiv.appendChild(span)
        var span  = document.createElement('span')
        span.className = 'race'
        span.innerHTML = races[sector.race]
        sectorDiv.appendChild(span)
        var span  = document.createElement('span')
        span.className = 'safety'
        span.innerHTML = translations[sector.safety]
        sectorDiv.appendChild(span)
        var span  = document.createElement('span')
        span.className = 'stations'
        span.innerHTML = sector.stations
        sectorDiv.appendChild(span)
        container.appendChild(sectorDiv)
    }
    document.body.replaceChild(container, document.getElementById('container'))
}

function isNeighbour(sector, gate) {
    return Math.abs(sector.x - gate.gx) + Math.abs(sector.y - gate.gy) == 1;
};

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
    colors = [
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
    color = colors[colorIndex];

    myLeft = calcLeft(sector.x + 0.5);
    myTop = calcTop(sector.y + 0.5);
    dx = calcLeft(gate.gx - sector.x);
    dy = calcTop(gate.gy - sector.y);
    length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (dx == 0) {
        rad = Math.PI / 2;
    } else {
        rad = Math.atan(dy / dx);
    }
    return "background-color:" + color + ";left:" + myLeft + "px;top:" + myTop + "px;width:" + length + "px;transform:rotate(" + rad + "rad)";

};

function switchImage() {
    image = image == 'gui/gui_master_diff.png' ? 'gui/gui_master_newest.png' : 'gui/gui_master_diff.png'
    overlay(currX, currY, zooming)
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
    e1.style.visibility =  "hidden";
    direction = 'z';
}
function overlay(x, y, zoom){
    if(typeof zoom == 'undefined') {
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
    mapSize = map.clientHeight

    var sector = sectors[x+"_"+y];
    document.getElementsByClassName('sector-name')[0].innerHTML = translations[sector.name] + ' [' + x + ', ' + y + ']'

    if(render3D) {
        renderThree(sector)
    } else {
        renderDom(sector, zoom)
    }

    e1.style.visibility = "visible";

}

function renderThree(sector) {
    mapSize = Math.ceil(mapSize / 2) * 2
    if(group) {
        scene.remove(group)
    }
    group = new THREE.Group()
    var loader = new THREE.TextureLoader()
    var spriteMap = loader.load( "docs/gui/gui_master_newest.png", function(xxx) {
        var width = xxx.image.width
        var height = xxx.image.height

        sectorSize = sector.size

        camera.left = - mapSize / 2;
        camera.right = mapSize / 2;
        camera.top = mapSize / 2;
        camera.bottom = - mapSize / 2;
        camera.near = 0;
        camera.far = mapSize * 4;
        camera.position.x = 0;
        camera.position.y = mapSize * 2;
        camera.position.z = 0;
        camera.updateProjectionMatrix();
        controls.rotateLeft(Math.PI / 2)
        renderer.setSize( mapSize, mapSize );


        ;[17, 5, 6].forEach(function(index) {
            if (typeof sector.objects[index] == 'undefined') {
                return true;
            }
            for (var subType in sector.objects[index]) {
                sector.objects[index][subType].forEach(function(object, index){
                    var spriteMap = xxx.clone()
                    var icon = icons[object.icon]

                    var texture = spriteMap.clone();
                    spriteMap.offset = new THREE.Vector2(icon.l / width, 1 - (parseInt(icon.t) + parseInt(icon.h)) / height)
                    spriteMap.repeat = new THREE.Vector2(icon.w / width, icon.h / height)
                    spriteMap.needsUpdate = true
                    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
                    var sprite = new THREE.Sprite( spriteMaterial );
                    sprite.icon = icon
                    sprite.scale.set(icon.w, icon.h, 1)
                    sprite.position.set(object.z * mapSize / sectorSize / 2, object.y * mapSize / sectorSize / 2, object.x * mapSize / sectorSize / 2)
                    group.add(sprite)

                })
            }
        } );

        sector.gates.forEach(function(gate) {
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

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.height = 16;
            canvas.width = 8
            var metrics = context.measureText( sMap[gate.s] );
            var textWidth = metrics.width;
            context.font = "12px Helvetica, Tahoma, Arial";
            context.fillStyle = "rgb(249,185,111)";
            context.fillText(sMap[gate.s], 0, 12)
            var texture = new THREE.Texture(canvas)
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
            var sprite = new THREE.Sprite( spriteMaterial );
            sprite.scale.set(8,16,1.0);
            sprite.icon = {
                w: 8,
                h: 16
            }
            sprite.position.set(gate.z * mapSize / sectorSize / 2, gate.y * mapSize / sectorSize / 2, gate.x * mapSize / sectorSize / 2)
            group.add(sprite)
        })

        scene.add(group)

        render()
        controls.update()
    } )

}

function renderDom(sector, zoom) {
    var map = document.getElementById('container-2d')
    if(zoom == 2) {
        map.innerHTML = '<div class="map-visual-area"></div>';
    } else {
        map.innerHTML = '';
    }

    var size = sector.size * zoom


    var calcPosition = function(el) {
        return {x: (el.x + size) / size / 2, y: (el.y + size) / size / 2, z: (el.z + size) / size / 2};
    };
    var calcStyle = function(position) {
        return 'left: ' + (position.x * mapSize) + 'px;top: ' + (mapSize - position[direction] * mapSize) + 'px;';
    };
    var calcKiloMeter = function(el) {
        return 'x: ' + (el.x / 500000).toFixed(2) + 'km y: ' + (el.y / 500000).toFixed(2) + 'km z: '+ (el.z / 500000).toFixed(2) + 'km'
    }

    ;[17, 5, 6].forEach(function(index) {
        if (typeof sector.objects[index] == 'undefined') {
            return true;
        }
        for (var subType in sector.objects[index]) {
            sector.objects[index][subType].forEach(function(object, index){
                var div = document.createElement('div');
                div.className = 'map-object';
                var position = calcPosition(object);
                var style = calcStyle(position) + 'width:'+icons[object.icon].w+'px;height:'+icons[object.icon].h+'px;background:url('+pathPrefix+image+') no-repeat -' + icons[object.icon].l + 'px -' + icons[object.icon].t + 'px';
                div.style.cssText = style
                div.onmouseover = function() {
                    document.getElementsByClassName('modal-coordinate')[0].innerHTML = translations[object.name] + ' ' + calcKiloMeter(object)
                }
                map.appendChild(div);
            })
        }

    })
    sector.gates.forEach(function(gate) {
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

        var div = document.createElement('div');
        div.className = 'map-gate';
        var position = calcPosition(gate);
        div.style.cssText = calcStyle(position);
        div.onmouseover = function() {
            document.getElementsByClassName('modal-coordinate')[0].innerHTML = (gate.s > 4 ? texts['gate_T'] : texts['gate']) + ' [' + translations[sectors[gate.gx+'_'+gate.gy].name] + '] ' + calcKiloMeter(gate)
        }
        div.onclick = function() {
            overlay(gate.gx, gate.gy)
        }

        div.innerHTML = sMap[gate.s]
        map.appendChild(div)

    })
}


function init() {
    // stackoverflow-oriented programming
    QueryString = function () {
      // This function is anonymous, is executed immediately and
      // the return value is assigned to QueryString!
      var query_string = {};
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
            // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
          query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
          query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
      }
      return query_string;
    }();
    lang = typeof QueryString.lang != 'undefined' ? QueryString.lang : '44'
    map = typeof QueryString.map != 'undefined' ? QueryString.map : 'tc'

    if(!isDynamic) {
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = '' + map + lang + '.js';
        document.body.appendChild(js);
    }
    initThree()
}

function initThree() {
    var mapSize = 500;
    var container = document.getElementsByClassName('modal-map')[0];
    var max = 1000;

    camera = new THREE.OrthographicCamera( -max, max, max, -max, - max, max );

    scene = new THREE.Scene();

    // Grid
    var size = 500, step = 50;

    var geometry = new THREE.Geometry();

    for ( var i = - size; i <= size; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

    var material = new THREE.LineBasicMaterial( { color: 'rgb(38,39,62)', opacity: 1 } );

    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );
    var geometry = new THREE.Geometry();

    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3(   size, 0, 0 ) );

    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 0, 0,   size ) );

    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 0, size,0 ) );
    var material = new THREE.LineBasicMaterial( { color: 'rgb(61,62,99)', opacity: 1 } );

    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 'rgb(13,18,29)' );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( mapSize, mapSize );
    container.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.mouseButtons = {ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.MIDDLE}

    controls.addEventListener('change', function(evt) {
        if(group) {
            var zoom = evt.target.object.zoom
            group.children.forEach(function(sprite) {
                sprite.scale.set(sprite.icon.w / zoom, sprite.icon.h / zoom,  1)
            })
        }
        render()
    })
    controls.update()
    var container = document.getElementById('container-3d');
    container.appendChild( renderer.domElement );

    render()
}
function render() {
    renderer.render(scene, camera);
}
function switchRender() {
    render3D = !render3D;
    document.getElementById('controls-2d').style.display = render3D ? 'none' : 'inline-block'
    document.getElementById('container-2d').style.display = render3D ? 'none' : 'block'
    document.getElementById('container-3d').style.display = render3D ? 'block' : 'none'

    overlay(currX, currY)
}

