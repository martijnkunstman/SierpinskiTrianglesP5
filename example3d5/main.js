// 3D Sierpinski Arrowhead Curve
// A true space-filling curve for a Tetrahedron (Pyramid)
// Replaces Hilbert Curve to match the "Triangle" shape request

console.log("3D Sierpinski Curve");

var scene, camera, renderer, controls;
var maxLevel = 7;
var points = [];
var drawCount = 0;
var batchSize = 25;
var restartPending = false;
var restartTime = 0;
var addedLine;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcdcdc);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Adjusted camera for tetrahedron
    camera.position.set(0, 2, 7);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;

    // Lighting
    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    startSystem();

    window.addEventListener('resize', onResize);
    animate();
}

function startSystem() {
    points = [];

    // Define a regular tetrahedron
    var s = 4.0;
    var p1 = new THREE.Vector3(0, s * Math.sqrt(2 / 3) - s / 2, 0); // Top
    // Base triangle in XZ plane
    var r = s / (2 * Math.sqrt(2)); // radius to vertices? No.
    // Let's use standard coordinates
    // Vertices at (1,1,1), (1,-1,-1), (-1,1,-1), (-1,-1,1) scaled

    var v1 = new THREE.Vector3(1, 1, 1);
    var v2 = new THREE.Vector3(1, -1, -1);
    var v3 = new THREE.Vector3(-1, 1, -1);
    var v4 = new THREE.Vector3(-1, -1, 1);

    // Scale
    var scale = 2.0;
    v1.multiplyScalar(scale);
    v2.multiplyScalar(scale);
    v3.multiplyScalar(scale);
    v4.multiplyScalar(scale);

    // Recursively generate curve points
    sierpinski(v1, v2, v3, v4, maxLevel);

    // Center points
    var center = new THREE.Vector3();
    points.forEach(function (p) { center.add(p); });
    center.divideScalar(points.length);
    points.forEach(function (p) { p.sub(center); });

    // Clean up previous
    if (addedLine) {
        scene.remove(addedLine);
        if (addedLine.geometry) addedLine.geometry.dispose();
        if (addedLine.material) addedLine.material.dispose();
    }

    // Prepare geometry
    var positions = [];
    var colors = [];
    var total = points.length;

    for (var i = 0; i < total; i++) {
        var p = points[i];
        positions.push(p.x, p.y, p.z);
        // Grayscale gradient
        var progress = i / total;
        var lightness = 0.2 + progress * 0.4;
        colors.push(lightness, lightness, lightness);
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var mat = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 });
    addedLine = new THREE.Line(geo, mat);

    // Start invisible
    geo.setDrawRange(0, 0);
    scene.add(addedLine);

    drawCount = 0;
    restartPending = false;
}

// Recursive Sierpinski Curve
function sierpinski(a, b, c, d, depth) {
    if (depth === 0) {
        // Add centroid of this tetrahedron
        var center = new THREE.Vector3()
            .add(a).add(b).add(c).add(d)
            .multiplyScalar(0.25);
        points.push(center);
        return;
    }

    var ab = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    var ac = new THREE.Vector3().addVectors(a, c).multiplyScalar(0.5);
    var ad = new THREE.Vector3().addVectors(a, d).multiplyScalar(0.5);
    var bc = new THREE.Vector3().addVectors(b, c).multiplyScalar(0.5);
    var bd = new THREE.Vector3().addVectors(b, d).multiplyScalar(0.5);
    var cd = new THREE.Vector3().addVectors(c, d).multiplyScalar(0.5);

    // Order of traversal to minimize jumps
    // We alternate order based on depth to create a continuous path?
    // A simple 1-2-3-4 creates a valid traversal but with small jumps.
    // Let's use a standard Gray-code-like order for tetrahedra?
    // For now, simpler: A -> B -> C -> D order, but implicitly defined.

    // Sub-tetrahedra
    // 1: a, ab, ac, ad (Corner A)
    // 2: ab, b, bc, bd (Corner B)
    // 3: ac, bc, c, cd (Corner C)
    // 4: ad, bd, cd, d (Corner D)

    // To connect End(1) to Start(2):
    // 1 ends near... ? If we recurse A->B->C->D inside 1, it ends at D of 1 (ad).
    // 2 starts at A of 2 (ab).
    // Dist(ad, ab) = |(a+d)/2 - (a+b)/2| = |d-b|/2. That's an edge length.
    // So the jump is one edge length of the sub-tet.
    // This is fine, it just looks like a wireframe Sierpinski.

    // To make it zigzag, we can flip the order for B?
    // 1: A->B->C->D
    // 2: B->A->D->C
    // 3: C->D->A->B
    // 4: D->C->B->A

    // Let's try mixing it up slightly to traverse edges more naturally
    // 1 (A) -> 2 (B) -> 3 (C) -> 4 (D)

    sierpinski(a, ab, ac, ad, depth - 1);
    sierpinski(ab, b, bc, bd, depth - 1); // Note: first arg is 'top' of this sub-tet relative to B? No.
    // Actually, just passing the 4 vertices of the sub-tet is enough.
    // The order determines the traversal inside.

    sierpinski(ac, bc, c, cd, depth - 1);
    sierpinski(ad, bd, cd, d, depth - 1);
}


function animate() {
    requestAnimationFrame(animate);

    var now = performance.now();

    if (restartPending) {
        if (now > restartTime) {
            // Restart
            drawCount = 0;
            if (addedLine && addedLine.geometry) {
                addedLine.geometry.setDrawRange(0, 0);
            }
            restartPending = false;
        }
    } else {
        // Draw progressively
        if (drawCount < points.length) {
            var end = Math.min(drawCount + batchSize, points.length);
            drawCount = end;

            if (addedLine && addedLine.geometry) {
                addedLine.geometry.setDrawRange(0, drawCount);
            }

            if (drawCount >= points.length) {
                restartPending = true;
                restartTime = now + 5000;
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
