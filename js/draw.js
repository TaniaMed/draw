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
let textColor;
draw.addEventListener("mousemove", (evt) => {
    if (drawing) {
        const point = makePoint(evt.offsetX, evt.offsetY, weird);
        curves[curves.length - 1].push(point);
        needsRepaint = true;
    }
    if (evt.shiftKey) {
    	ctx.fillStyle = 'hsl(textColor, 100%, 50%)';
    	if (textColor !== 0) {
 			ctx.fillStyle = 'hsl(textColor--, 100%, 50%)';
 		} else {
 			ctx.fillStyle = 'hsl(0, 100%, 50%)';
 		}
 		return;
    }
    if (textColor !== 359) {
 			ctx.fillStyle = 'hsl(textColor++, 100%, 50%)';
 	} else {
 			ctx.fillStyle = 'hsl(359, 100%, 50%)';
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

let decreases = true;
function changeColor() {
 	if (ctx.lineWidth === 100) {
 		decreases = true;
 	} 
 	if (ctx.lineWidth === 0) {
 		decreases = false;
 	}
 	if (decreases) {
 		ctx.lineWidth--;
 	} else {
 		ctx.lineWidth++;
 	}
 	return;
}

ctx.lineWidth = 100;

function tick() {
    if (needsRepaint) {
        repaint();
        needsRepaint = false;
    }
    changeColor();
    window.requestAnimationFrame(tick);
}

tick();