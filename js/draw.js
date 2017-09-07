'use strict';

let draw = document.getElementById('draw');
let ctx = draw.getContext('2d');

function rendNum(min, max) {
    return Math.random() * (max - min) + min;
}

function integerRandomNumber(min, max) {
    return Math.round(rendNum(min, max));
}

let oldScreenWidth = 0;
let oldScreenHeight = 0;

function redrawScene() {
    ctx.clearRect(0, 0, oldScreenWidth, oldScreenHeight);
    oldScreenWidth = draw.width;
    oldScreenHeight = draw.height;
    return;
}

function resize() {
    draw.width = window.innerWidth;
    draw.height = window.innerHeight;
    redrawScene();
}

resize();
window.onresize = resize;

let curves = [];

let dateStart = new Date();
draw.addEventListener("click", (evt) => {
    let date = new Date();
    if ((date - dateStart) <= 250) {
        redrawScene();
        curves = []
    };
    dateStart = date;
});

let BRUSH_RADIUS = 100;

let drawing = false;
let weird = false;
let needsRepaint = false;

let lineColor = 5;
let decreases = true;

function thicknessLine() {
    if (ctx.lineWidth === 5) {
        decreases = false;
    }
    if (ctx.lineWidth === 100) {
        decreases = true
    }
    if (decreases) {
        return BRUSH_RADIUS--;
    } else {
        return BRUSH_RADIUS++;
    }
}

function smoothCurveBetween(p1, p2) {
    const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
    ctx.lineWidth = thicknessLine();
        if (shift) {
            ctx.strokeStyle = `hsl(${lineColor++}, 100%, 50%)`;
        }   else {
            ctx.strokeStyle = `hsl(${lineColor--}, 100%, 50%)`;
        }

    ctx.quadraticCurveTo(...p1, ...cp);
}

function smoothCurve(points) {
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (points.length > 3) {
        for (let i = points.length - 3; i < points.length - 1; i++) {
            ctx.moveTo(...points[i]);
            smoothCurveBetween(points[i], points[i + 1]);
        }
        ctx.stroke();
    }
}

function makePoint(x, y, reflect = false) {
    return reflect ? [y, x] : [x, y];
};

draw.addEventListener("mousedown", (evt) => {
    drawing = true;
    const curve = [];
    
    curve.push(makePoint(evt.offsetX, evt.offsetY, weird));
    curves.push(curve);
    needsRepaint = true;
});
let shift; 
draw.addEventListener("mouseup", (evt) => {
    drawing = false;
    curves = [];
    shift = evt.shiftKey;
});

draw.addEventListener("mouseleave", (evt) => {
    drawing = false;
    curves = [];
});
let textColor = 0;
draw.addEventListener("mousemove", (evt) => {
    if (drawing) {
        const point = makePoint(evt.offsetX, evt.offsetY, weird);
        curves[curves.length - 1].push(point);
        needsRepaint = true;
    }
});

function repaint() {
    curves
        .forEach((curve) => {
            smoothCurve(curve);
        });
}

let brushColor;

function tick() {
    requestAnimationFrame(tick);
    if (needsRepaint) {
        repaint();
        needsRepaint = false;
    }
}

tick();