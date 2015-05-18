function _pointFromArgs(args) {
    return point.apply(window, args);
}

function _pointsFromArgs(args, count) {
    var pts = [];
    for (var i = 0, j = 0; i < count; i++, j++) {
        if (args[j].x !== undefined && args[j].y !== undefined) {
            pts.push([args[j].x, args[j].y]);
        }
        else if (args[j][0] !== undefined && args[j][1] !== undefined) {
            pts.push([args[j][0], args[j][1]]);
        }
        else {
            pts.push([args[j], args[j + 1]]);
            ++j;
        }
    }
    return pts;
}

function _localFromArgs(args, count) {
    if (count === void 0) { count = 1; }
    var pts = [];
    for (var i = 0, j = 0; i < count; i++, j++) {
        if (args[j].x !== undefined && args[j].y !== undefined) {
            pts.push([args[j].x, args[j].y]);
        }
        else if (args[j][0] !== undefined && args[j][1] !== undefined) {
            pts.push([args[j][0], args[j][1]]);
        }
        else {
            pts.push([args[j], args[j + 1]]);
            ++j;
        }
    }
    return pts[j] ? true : false;
}

function translate() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var pt = _pointFromArgs(args);
    return 'translate(' + pt[0] + (pt[1] ? (', ' + pt[1]) : '') + ')';
}

function rotate(a) {
    return 'rotate(' + a + ')';
}

function scale() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var pt = _pointFromArgs(args);
    return 'scale(' + pt[0] + (pt[1] ? (', ' + pt[1]) : '') + ')';
}

function matrix(a, b, c, d, e, f) {
    return 'matrix(' + a + ', ' + b + ', ' + c + ', ' + d + ', ' + e + ', ' + f + ')';
}

function skewX(a) {
    return 'skewX(' + a + ')';
}

function skewY(a) {
    return 'skewY(' + a + ')';
}

function moveto() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var pt = _pointFromArgs(args);
    var local = _localFromArgs(args);
    return (local ? 'm' : 'M') + pt[0] + ',' + pt[1];
}

function lineto() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var pt = _pointFromArgs(args);
    var local = _localFromArgs(args);
    return (local ? 'l' : 'L') + pt[0] + ',' + pt[1];
}

function curveto() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var pts = _pointsFromArgs(args, 3);
    var local = _localFromArgs(args, 3);
    return (local ? 'c' : 'C') + pts[0][0] + ',' + pts[0][1] + ' ' + pts[1][0] + ',' + pts[1][1] + ' ' + pts[2][0] + ',' + pts[2][1];
}

function add(v1, v2) {
    if (v1.x !== undefined && v1.y !== undefined) {
        v1 = [v1.x, v1.y];
    }
    if (v2.x !== undefined && v2.y !== undefined) {
        v2 = [v2.x, v2.y];
    }
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

function avg(v1, v2) {
    if (v1.x !== undefined && v1.y !== undefined) {
        v1 = [v1.x, v1.y];
    }
    if (v2.x !== undefined && v2.y !== undefined) {
        v2 = [v2.x, v2.y];
    }
    return [(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2];
}

function sub(v1, v2) {
    if (v1.x !== undefined && v1.y !== undefined) {
        v1 = [v1.x, v1.y];
    }
    if (v2.x !== undefined && v2.y !== undefined) {
        v2 = [v2.x, v2.y];
    }
    return [v1[0] - v2[0], v1[1] - v2[1]];
}

function rectangle(x, y, w, h) {
    return x + ' ' + y + ' ' + w + ' ' + h;
}

function point() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args[0].x !== undefined && args[0].y !== undefined) {
        return [args[0].x, args[0].y];
    }
    else if (args[0][0] !== undefined && args[0][1] !== undefined) {
        return [args[0][0], args[0][1]];
    }
    else {
        return [args[0], args[1]];
    }
}

function topRoundedRect(x, y, width, height, radius) {
    return 'M' + (x + width / 2) + ',' + (y + height) + 'h' + -width + 'v' + (radius - height) + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + -radius + 'h' + (width - 2 * radius) + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius + 'v' + (height - radius) + 'z';
}

function dist(v1, v2) {
    v1 = point(v1);
    v2 = point(v2);
    return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
}

function screenPosition(selector) {
    var mat = d3.select(selector)[0][0].getScreenCTM();
    return [mat.e, mat.f];
}

function position(selector, offset) {
    var mat;
    if (selector.getCTM) {
        mat = selector.getCTM();
    }
    else {
        var element = d3.select(selector)[0][0];
        if (element.getCTM) {
            mat = element.getCTM();
        }
        else {
            mat = element[0].getCTM();
        }
    }
    var pt = offset ? [mat.e - offset[0], mat.f - offset[1]] : [mat.e, mat.f];
    return pt;
}
