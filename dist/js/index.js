// Imports
import Delaunator from 'delaunator';
// Classes
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
// Canvas and context
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
// Draw style
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.fillStyle = "white";
ctx.strokeStyle = 'grey';
ctx.lineWidth = 1;
// Global variables
const numPoints = 500;
const pointMinDistance = 70;
const pointMaxDistance = 150;
const points = [];
const maxTimeToWait = 2000;
const beginTime = Date.now();
let elapsed = 0;
// Create first points
const firstPoint = new Point(canvas.width / 2, canvas.height / 2);
points.push(firstPoint);
// points.push({x: -100, y: -100});
// points.push({x: -100, y: canvas.height + 100});
// points.push({x: canvas.width + 100, y: -100});
// points.push({x: canvas.width + 100, y: canvas.height + 100});
// Create remaining points
while (elapsed < maxTimeToWait && points.length < numPoints) {
    elapsed = Date.now() - beginTime;
    console.log(elapsed);
    const x = intBetweenRange(-100, canvas.width + 100);
    const y = intBetweenRange(-100, canvas.height + 100);
    const point = new Point(x, y);
    let isValid = false;
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
        if (distance > pointMinDistance && distance < pointMaxDistance) {
            isValid = true;
        }
        else if (distance <= pointMinDistance) {
            isValid = false;
            break;
        }
    }
    if (isValid) {
        points.push(point);
    }
}
// Change array shape for delaunay library
const coords = points.map((x) => { return [Math.floor(x.x), Math.floor(x.y)]; });
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // connect all points without crossing lines using delaunay triangulation
    const delaunay = Delaunator.from(coords);
    console.log(delaunay);
    const triangles = delaunay.triangles;
    ctx.beginPath();
    for (let i = 0; i < triangles.length; i += 3) {
        const p0 = triangles[i];
        const p1 = triangles[i + 1];
        const p2 = triangles[i + 2];
        ctx.moveTo(coords[p0][0], coords[p0][1]);
        ctx.lineTo(coords[p1][0], coords[p1][1]);
        ctx.lineTo(coords[p2][0], coords[p2][1]);
        ctx.closePath();
    }
    ctx.stroke();
    // draw points after the lines so that they dont get painted over
    for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        ctx.fillRect(point.x, point.y, 1, 1);
    }
}
function intBetweenRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function loop() {
    draw();
    //window.requestAnimationFrame(loop);
}
loop();
