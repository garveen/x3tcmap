
var zooming, currX, currY;
var image = 'gui/gui_master_newest.png'
var e1 = document.getElementById('modal-overlay');
var direction = 'z';

var init = function () {
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
                var div = document.createElement('div');
                div.className = 'line';
                div.style.cssText = style;
                container.appendChild(div)
            } else {
                var style = jumpStyle(sector, gate)
                if (!style) {
                    return true;
                }
                var div = document.createElement('div');
                div.className = 'line jump';
                div.style.cssText = style;
                container.appendChild(div)
            }
        })
    }
    for(var coordinate in sectors) {
        var sector = sectors[coordinate];
        var sectorDiv = document.createElement('div')
        sectorDiv.className = 'sector race-' + sector.race
        sectorDiv.style.cssText = 'left: ' + calcLeft(sector.x) + 'px;top: ' + calcTop(sector.y) + 'px'
        console.log('left: ' + calcLeft(sector.x) + 'px;top: ' + calcTop(sector.y) + 'px')
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
        ;['safety', 'stations'].forEach(function (type) {
            var span  = document.createElement('span')
            span.className = type
            span.innerHTML = sector[type]
            sectorDiv.appendChild(span)
        })
        container.appendChild(sectorDiv)
    }
    document.body.replaceChild(container, document.getElementById('container'))
}

var isNeighbour = function (sector, gate) {
    return Math.abs(sector.x - gate.gx) + Math.abs(sector.y - gate.gy) == 1;
};

var calcLeft = function (x) {
    return x * (cellWidth + cellGapX);
};
var calcTop = function (y) {
    return y * (cellHeight + cellGapY);
};

var lineStyle = function (sector, gate) {
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

var colorIndex = 0;
var jumpStyle = function (sector, gate) {
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
    var map = document.getElementsByClassName('modal-map')[0];
    if(zoom == 2) {
        map.innerHTML = '<div class="map-visual-area"></div>';
    } else {
        map.innerHTML = '';
    }
    var sector = sectors[x+"_"+y];
    document.getElementsByClassName('sector-name')[0].innerHTML = translations[sector.name] + ' [' + x + ', ' + y + ']'
    var size = sector.size * zoom
    console.log(sector)

    var width = 500;
    var height = 500;


    var calcPosition = function(el) {
        return {x: (el.x + size) / size / 2, y: (el.y + size) / size / 2, z: (el.z + size) / size / 2};
    };
    var calcStyle = function(position, icon) {
        if (typeof icon =='undefined') icon = {w: 0, h: 0}
        return 'left: ' + (position.x * width - icon.w / 2) + 'px;top: ' + (height - position[direction] * height + icon.h / 2) + 'px;';
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
                var style = calcStyle(position, icons[object.icon]) + 'width:'+icons[object.icon].w+'px;height:'+icons[object.icon].h+'px;background:url('+pathPrefix+image+') no-repeat -' + icons[object.icon].l + 'px -' + icons[object.icon].t + 'px';
                div.style.cssText = style
                div.onmouseover = function() {
                    document.getElementsByClassName('modal-coordinate')[0].innerHTML = translations[object.name] + ' ' + calcKiloMeter(object)
                }
                map.appendChild(div);
            })
        }

    })
    sector.gates.forEach(function(gate) {
        var gidMap = {
            0: 'N',
            1: 'S',
            2: 'W',
            3: 'E'
        };

        var div = document.createElement('div');
        div.className = 'map-gate';
        var position = calcPosition(gate);
        div.style.cssText = calcStyle(position);
        div.onmouseover = function() {
            console.log(gate.s)
            document.getElementsByClassName('modal-coordinate')[0].innerHTML = (gate.s > 4 ? texts['gate_T'] : texts['gate']) + ' [' + translations[sectors[gate.gx+'_'+gate.gy].name] + '] ' + calcKiloMeter(gate)
        }
        div.onclick = function() {
            overlay(gate.gx, gate.gy)
        }

        div.innerHTML = gidMap[gate.gid]
        map.appendChild(div)

    })
    e1.style.visibility = "visible";

}

