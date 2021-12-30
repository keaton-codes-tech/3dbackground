// Imports
import Delaunator from 'delaunator';

// Types
interface PointInterface {
    x: number;
    y: number;
}

// Classes
class Point implements PointInterface {
    x: number;
    y: number;
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
}

// Canvas and context
const canvas: HTMLCanvasElement = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = <CanvasRenderingContext2D> canvas.getContext("2d");

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
const points: Array<PointInterface> = [];
const maxTimeToWait = 2000;
const beginTime = Date.now();
let elapsed = 0;

function generatePoints() {
    // Create first points
    const firstPoint = new Point(canvas.width/2, canvas.height/2);
    points.push(firstPoint);
    
    // points.push({x: -100, y: -100});
    // points.push({x: -100, y: canvas.height + 100});
    // points.push({x: canvas.width + 100, y: -100});
    // points.push({x: canvas.width + 100, y: canvas.height + 100});

    // Create remaining points
    while (elapsed < maxTimeToWait && points.length < numPoints) {
        elapsed = Date.now() - beginTime;
        console.log(elapsed);
        // choose a random existing point
        let sourcePoint: PointInterface;
        if (points.length < 4) {
            sourcePoint = points[intBetweenRange(0, points.length - 1)];
            addPoint(sourcePoint);
        } else {
            // choose a random existing convex hull point
            const coords = convertPointsToCoords(points);
            const delaunay = Delaunator.from(coords);
            sourcePoint = points[delaunay.hull[intBetweenRange(0, delaunay.hull.length - 1)]];
            addPoint(sourcePoint);
        }
        function addPoint(sourcePoint: PointInterface) {
            const validPoint = findNewPoint(sourcePoint);
            if (validPoint) {
                points.push(validPoint);
            }            
        }

    }
}

// Change array shape for delaunay library - [[x, y], [x, y], [x, y]]
function convertPointsToCoords(points: Array<PointInterface>) {
    const coords: Array<Array<number>> = [];
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        coords.push([Math.floor(point.x), Math.floor(point.y)]);
    }
    return coords;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // connect all points without crossing lines using delaunay triangulation
    const coords = convertPointsToCoords(points);
    const delaunay = Delaunator.from(coords);

    console.log(delaunay);
    console.log(points);

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

function findNewPoint(sourcePoint: PointInterface) {
    const theta = Math.random() * 2 * Math.PI;
    const radius = intBetweenRange(pointMinDistance, pointMaxDistance);
    const x = sourcePoint.x + radius * Math.cos(theta);
    const y = sourcePoint.y + radius * Math.sin(theta);
    const newPoint = new Point(x, y);
    if (isValidPoint(newPoint)) {
        return newPoint;
    } else {
        return false;
    }
}

function isValidPoint(point: PointInterface) {
    if (point.x < 0 || point.x > canvas.width || point.y < 0 || point.y > canvas.height) {
        return false;
    } else {
        let isValid = false;
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
            if (distance > pointMinDistance && distance < pointMaxDistance) {
                isValid = true;
            } else if (distance <= pointMinDistance) {
                isValid = false;
                break;
            }
        }
        if (isValid) {
            return true;
        } else {
            return false;
        }
    }
}

function intBetweenRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loop() {
    draw();
    //window.requestAnimationFrame(loop);
}

function init() {
    generatePoints();
    loop();
}
init();