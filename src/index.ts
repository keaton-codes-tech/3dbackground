// Imports
import Delaunator from 'delaunator';

function main() {
    // Types
    interface PointInterface {
        x: number;
        y: number;
    }
    type CoordsType = Array<Array<number>>;

    // Classes
    class Point implements PointInterface {
        x: number;
        y: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    // Canvas and context
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

    // Draw style
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1;

    // Global variables
    const xStart = -100;
    const yStart = -100;
    const xEnd = canvas.width + 100;
    const yEnd = canvas.height + 100;
    const triangleColor = 'grey';
    const pointColor = 'white';
    const hullColor = 'yellow';
    const numPoints = 500;
    const pointMinDistance = 70;
    const pointMaxDistance = 150;
    const points: Array<PointInterface> = [];
    const maxTimeToWait = 100;
    const beginTime = Date.now();
    let elapsed = 0;
    let fps = 60;

    function generatePoints() {
        console.time('Generate points function');
        // Create first points
        const firstPoint = new Point(
            Math.floor(canvas.width / 2),
            Math.floor(canvas.height / 2)
        );
        points.push(firstPoint);

        // points.push({x: -100, y: -100});
        // points.push({x: -100, y: canvas.height + 100});
        // points.push({x: canvas.width + 100, y: -100});
        // points.push({x: canvas.width + 100, y: canvas.height + 100});

        // Create remaining points
        const pointsPopulated: Array<number> = [];
        while (
            elapsed < maxTimeToWait &&
            points.length < numPoints &&
            pointsPopulated.length < points.length
        ) {
            elapsed = Date.now() - beginTime;
            //console.log(elapsed);

            function fullRandom() {
                const validPoint = fullRandom_FindNewPoint();
                if (validPoint) {
                    points.push(validPoint);
                }
            }

            function randomAngleFromHullPoint() {
                let sourcePoint: PointInterface;
                if (points.length < 4) {
                    sourcePoint = points[intBetweenRange(0, points.length - 1)];
                    addPoint(sourcePoint);
                } else {
                    // choose a random existing convex hull point
                    const coords = convertPointsToCoords(points);
                    const delaunay = Delaunator.from(coords);
                    sourcePoint =
                        points[
                            delaunay.hull[
                                intBetweenRange(0, delaunay.hull.length - 1)
                            ]
                        ];
                    addPoint(sourcePoint);
                }
                function addPoint(sourcePoint: PointInterface) {
                    const validPoint =
                        randomAngleFromPoint_FindNewPoint(sourcePoint);
                    if (validPoint) {
                        points.push(validPoint);
                        //console.log('point added');
                    }
                }
            }

            function randomAngleFromPoint() {
                // choose a random existing point
                let sourcePoint: PointInterface;
                sourcePoint = points[intBetweenRange(0, points.length - 1)];
                addPoint(sourcePoint);
                function addPoint(sourcePoint: PointInterface) {
                    const validPoint =
                        randomAngleFromPoint_FindNewPoint(sourcePoint);
                    if (validPoint) {
                        points.push(validPoint);
                        //console.log('point added');
                    }
                }
            }

            function multipleRandomAnglesFromPoint() {
                // choose a random existing point
                let sourcePoint: PointInterface;
                let sourcePointIndex = intBetweenRange(0, points.length - 1);
                let acceptableSourcePointIndex = false;
                // don't choose a point that has already been used
                function evaluateSourcePointIndex(count = 0) {
                    count++;
                    if (count > 10) {
                        return;
                    } else if (pointsPopulated.includes(sourcePointIndex)) {
                        sourcePointIndex = intBetweenRange(
                            0,
                            points.length - 1
                        );
                        evaluateSourcePointIndex(count);
                    } else {
                        acceptableSourcePointIndex = true;
                    }
                }
                evaluateSourcePointIndex();
                if (acceptableSourcePointIndex) {
                    pointsPopulated.push(sourcePointIndex);
                    sourcePoint = points[sourcePointIndex];
                    const numAttempts = 50;
                    for (let i = 0; i < numAttempts; i++) {
                        addPoint(sourcePoint);
                    }
                    function addPoint(sourcePoint: PointInterface) {
                        const validPoint =
                            randomAngleFromPoint_FindNewPoint(sourcePoint);
                        if (validPoint) {
                            points.push(validPoint);
                            //console.log('point added');
                        }
                    }
                }
            }
            multipleRandomAnglesFromPoint();
        }
        console.log('Number of points generated:', points.length);
        console.timeEnd('Generate points function');
    }

    // Change array shape for delaunay library - [[x, y], [x, y], [x, y]]
    function convertPointsToCoords(points: Array<PointInterface>) {
        const coords: CoordsType = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            coords.push([point.x, point.y]);
        }
        return coords;
    }

    function draw() {
        console.time('Draw function');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // connect all points without crossing lines using delaunay triangulation
        const coords = convertPointsToCoords(points);
        const delaunay = Delaunator.from(coords);

        console.log(delaunay);

        // draw lines to make up the triangles
        function drawTriangles() {
            const triangles = delaunay.triangles;
            ctx.strokeStyle = triangleColor;
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
        }
        drawTriangles();

        function fillTriangles() {
            forEachTriangle(coords, delaunay, (t: number, threePoints: CoordsType) => {
                ctx.fillStyle = 'rgb(50,50,50)';
                ctx.beginPath();
                ctx.moveTo(threePoints[0][0], threePoints[0][1]);
                ctx.lineTo(threePoints[1][0], threePoints[1][1]);
                ctx.lineTo(threePoints[2][0], threePoints[2][1]);
                ctx.closePath();
                ctx.fill();
            });
        }
        fillTriangles();

        // draw lines to make up the convex hull
        function drawHull() {
            const hull = delaunay.hull;
            ctx.strokeStyle = hullColor;
            ctx.beginPath();
            for (let i = 0; i < hull.length; i++) {
                ctx.moveTo(coords[hull[i]][0], coords[hull[i]][1]);
                if (i < hull.length - 1) {
                    ctx.lineTo(coords[hull[i + 1]][0], coords[hull[i + 1]][1]);
                } else {
                    ctx.lineTo(coords[hull[0]][0], coords[hull[0]][1]);
                }
            }
            ctx.stroke();
        }

        // draw points after the lines so that they dont get painted over
        function drawPoints() {
            ctx.fillStyle = pointColor;
            for (let i = points.length - 1; i >= 0; i--) {
                const point = points[i];
                ctx.fillRect(point.x, point.y, 1, 1);
            }
        }
        drawPoints();
        console.timeEnd('Draw function');
    }

    function randomAngleFromPoint_FindNewPoint(sourcePoint: PointInterface) {
        const theta = Math.random() * 2 * Math.PI;
        const radius = intBetweenRange(pointMinDistance, pointMaxDistance);
        const x = Math.floor(sourcePoint.x + radius * Math.cos(theta));
        const y = Math.floor(sourcePoint.y + radius * Math.sin(theta));
        const newPoint = new Point(x, y);
        if (isValidPoint(newPoint)) {
            return newPoint;
        } else {
            return false;
        }
    }

    function fullRandom_FindNewPoint() {
        const x = intBetweenRange(xStart, xEnd);
        const y = intBetweenRange(yStart, yEnd);
        const newPoint = new Point(x, y);
        if (isValidPoint(newPoint)) {
            return newPoint;
        } else {
            return false;
        }
    }

    function isValidPoint(point: PointInterface) {
        if (
            point.x < xStart ||
            point.x > xEnd ||
            point.y < yStart ||
            point.y > yEnd
        ) {
            return false;
        } else {
            let isValid = false;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const distance = Math.sqrt(
                    Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
                );
                if (
                    distance > pointMinDistance &&
                    distance < pointMaxDistance
                ) {
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

    function edgesOfTriangle(t: number) {
        return [3 * t, 3 * t + 1, 3 * t + 2];
    }

    function pointsOfTriangle(delaunay: Delaunator<ArrayLike<number>>, t: number) {
        return edgesOfTriangle(t).map((e) => {
            return delaunay.triangles[e];
        });
    }

    function forEachTriangle(coords: CoordsType, delaunay: Delaunator<ArrayLike<number>>, callback: Function) {
        // basically just index shuffling through different arrays
        // t = triangle index
        for (let t = 0; t < delaunay.triangles.length / 3; t++) {
            callback(
                t,
                pointsOfTriangle(delaunay, t).map((p) => {
                    return coords[p];
                })
            );
        }
    }

    function updateFPS() {
        const fpsElement = document.getElementById('fps-counter');
        if (fpsElement) {
            setInterval(() => {
                fpsElement.innerHTML = `FPS: ${fps}`;
            }, 500);
        }
    }

    function loop(t0 = performance.now()) {
        draw();
        fps = Math.floor(1000 / (performance.now() - t0));
        //requestAnimationFrame(loop);
    }

    function init() {
        updateFPS();
        generatePoints();
        loop();
    }
    init();
}
main();
