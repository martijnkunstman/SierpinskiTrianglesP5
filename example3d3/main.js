// Pythagoras Tree 3D — recursive branching in 3D space

console.log("Pythagoras Tree 3D");

var scene, camera, renderer, controls;
var lines = [];
var counter = 0;
var maxCounter = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcdcdc);

    var aspect = window.innerWidth / window.innerHeight;
    var frustumSize = 5;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2, frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / -2,
        0.1, 1000
    );
    // Top-down view
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.target.set(0, 0, 0);

    // Group to hold tree lines (easy to clear)
    treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // Build all branches recursively
    buildTree(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        2.0,
        0
    );

    // Sort lines by depth for BFS animation (step-by-step growth)
    lines.sort(function (a, b) { return a.depth - b.depth; });

    window.addEventListener('resize', onResize);
    animate();
}

function buildTree(origin, direction, length, depth) {
    if (length < 0.04 || depth > 12) return; // Optimized: stop when lines are too small (~8px)

    var end = new THREE.Vector3().copy(origin).addScaledVector(direction, length);

    var lightness = 0.15 + (depth / 10) * 0.4;
    var color = new THREE.Color(lightness, lightness, lightness);

    lines.push({
        start: origin.clone(),
        end: end.clone(),
        color: color,
        depth: depth
    });

    var newLen = length * 0.5;

    // Branch in 3 directions like the 2D version, but add a 3rd axis
    // Original 2D had: direction + 240°, direction + 120°, direction + 0°
    // In 3D we rotate around the branch axis and tilt

    var axis = direction.clone().normalize();

    // Create a perpendicular vector
    var perp = new THREE.Vector3(1, 0, 0);
    if (Math.abs(axis.dot(perp)) > 0.9) {
        perp.set(0, 0, 1);
    }
    perp.crossVectors(axis, perp).normalize();

    // Branch 1: tilt forward-left
    var q1 = new THREE.Quaternion().setFromAxisAngle(perp, -Math.PI / 3);
    var d1 = direction.clone().applyQuaternion(q1).normalize();

    // Branch 2: tilt forward-right (rotate perp 120° around axis)
    var perp2 = perp.clone().applyAxisAngle(axis, (2 * Math.PI) / 3);
    var q2 = new THREE.Quaternion().setFromAxisAngle(perp2, -Math.PI / 3);
    var d2 = direction.clone().applyQuaternion(q2).normalize();

    // Branch 3: tilt backward (rotate perp 240° around axis)
    var perp3 = perp.clone().applyAxisAngle(axis, (4 * Math.PI) / 3);
    var q3 = new THREE.Quaternion().setFromAxisAngle(perp3, -Math.PI / 3);
    var d3 = direction.clone().applyQuaternion(q3).normalize();

    buildTree(end, d1, newLen, depth + 1);
    buildTree(end, d2, newLen, depth + 1);
    buildTree(end, d3, newLen, depth + 1);
}

var drawnCount = 0;
var batchSize = 5; // Slow down to show steps clearly
var restartPending = false;
var restartTime = 0;
var treeGroup;

function animate() {
    requestAnimationFrame(animate);

    var now = performance.now();

    if (restartPending) {
        if (now > restartTime) {
            // Restart
            treeGroup.clear(); // Clear all lines
            drawnCount = 0;
            restartPending = false;
        }
    } else {
        // Progressively add lines (sorted by depth)
        if (drawnCount < lines.length) {
            var end = Math.min(drawnCount + batchSize, lines.length);
            for (var i = drawnCount; i < end; i++) {
                var l = lines[i];
                var geo = new THREE.BufferGeometry().setFromPoints([l.start, l.end]);
                var mat = new THREE.LineBasicMaterial({ color: l.color });
                var line = new THREE.Line(geo, mat);
                treeGroup.add(line);
            }
            drawnCount = end;

            if (drawnCount >= lines.length) {
                restartPending = true;
                restartTime = now + 4000; // Wait 4 seconds before restart
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

function onResize() {
    var aspect = window.innerWidth / window.innerHeight;
    var frustumSize = 5;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
