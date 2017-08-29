'use strict';

var draw = document.getElementById('draw');
var ctx;
let oldScreenWidth = 0;
let oldScreenHeight = 0;

function rendNum(min, max) {
  return Math.random() * (max - min) + min;
}

function integerRandomNumber(min, max) {
  return Math.round(rendNum(min, max));
}

function redrawScene() {
    ctx.clearRect(0, 0, oldScreenWidth, oldScreenHeight);
    ctx.clearRect(0, 0, draw.width, draw.height);
    oldScreenWidth = draw.width;
    oldScreenHeight = draw.height;
    return;
}

function resize() {
    draw.width = window.innerWidth;
    draw.height = window.innerHeight;
    ctx = draw.getContext('2d'); 
    ctx.fillStyle = 'hsl(230, 100%, 50%)';
 	ctx.lineWidth = 100;
    redrawScene();
}
resize();
window.onresize = resize;

const BRUSH_RADIUS = 6;

let curves = [];
let drawing = false;
let weird = false;
let needsRepaint = false;

function circle(point) {
    ctx.beginPath();
    ctx.arc(...point, BRUSH_RADIUS / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function smoothCurveBetween(p1, p2) {
    const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
    ctx.quadraticCurveTo(...p1, ...cp);

}

function smoothCurve(points) {
    ctx.beginPath();
    ctx.lineWidth = BRUSH_RADIUS;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.moveTo(...points[0]);

    for (let i = 1; i < points.length - 1; i++) {
        smoothCurveBetween(points[i], points[i + 1]);
    }

    ctx.stroke();
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

draw.addEventListener("mouseup", (evt) => {
    drawing = false;
});

draw.addEventListener("mouseleave", (evt) => {
    drawing = false;
});

draw.addEventListener("mousemove", (evt) => {
    if (drawing) {
        const point = makePoint(evt.offsetX, evt.offsetY, weird);
        curves[curves.length - 1].push(point);
        needsRepaint = true;
    }
});

let dateStart = new Date();
draw.addEventListener("click", (evt) => {
   let date = new Date();
   if ((date - dateStart) <= 250) {
   	   redrawScene();
   	   curves = []
   };
   dateStart = date;
});

function repaint() {
    ctx.clearRect(0, 0, draw.width, draw.height);

    curves
        .forEach((curve) => {
            circle(curve[0]);
            smoothCurve(curve);
        });
}

function tick() {
    if (needsRepaint) {
        repaint();
        needsRepaint = false;
    }
    window.requestAnimationFrame(tick);
}

tick();