// Arrowhead Curve 3D — L-system curve drawn in 3D space

console.log("Arrowhead Curve 3D");

var scene, camera, renderer, controls;

// Same L-system as 2D version
var arrowHeadCurveData = "1";

function buildCurve() {
    for (var a = 0; a < 6; a++) {
        var tempArray = arrowHeadCurveData.split("");
        var tempData = "";
        for (var b = 0; b < tempArray.length; b++) {
            if (tempArray[b] === "1") tempData += "23132";
            else if (tempArray[b] === "2") tempData += "14241";
            else if (tempArray[b] === "3") tempData += "3";
            else if (tempArray[b] === "4") tempData += "4";
        }
        arrowHeadCurveData = tempData;
    }
    arrowHeadCurveData = arrowHeadCurveData.split("");
}

function init() {
    buildCurve();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcdcdc);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 5);

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

    // Generate curve points in 3D
    // In 2D, turns are ±60°. In 3D, we alternate rotation axes
    var length = 0.02;
    var points = [];
    var pos = new THREE.Vector3(0, 0, 0);
    var dir = new THREE.Vector3(1, 0, 0);
    var up = new THREE.Vector3(0, 1, 0);

    points.push(pos.clone());

    var turnAngle = Math.PI / 3; // 60 degrees
    var rotationToggle = 0; // Alternate between Y-axis and custom axis rotations

    for (var i = 0; i < arrowHeadCurveData.length; i++) {
        var cmd = arrowHeadCurveData[i];
        if (cmd === "3") {
            // Turn left — rotate around up axis, and slightly around sideways axis
            var axis;
            if (rotationToggle % 3 === 0) {
                axis = new THREE.Vector3(0, 1, 0);
            } else if (rotationToggle % 3 === 1) {
                axis = new THREE.Vector3(0, 0, 1);
            } else {
                axis = new THREE.Vector3().crossVectors(dir, up).normalize();
            }
            dir.applyAxisAngle(axis, -turnAngle);
            rotationToggle++;

            pos = pos.clone().addScaledVector(dir, length);
            points.push(pos.clone());
        } else if (cmd === "4") {
            // Turn right
            var axis2;
            if (rotationToggle % 3 === 0) {
                axis2 = new THREE.Vector3(0, 1, 0);
            } else if (rotationToggle % 3 === 1) {
                axis2 = new THREE.Vector3(0, 0, 1);
            } else {
                axis2 = new THREE.Vector3().crossVectors(dir, up).normalize();
            }
            dir.applyAxisAngle(axis2, turnAngle);
            rotationToggle++;

            pos = pos.clone().addScaledVector(dir, length);
            points.push(pos.clone());
        }
    }

    // Center the curve
    var box = new THREE.Box3();
    points.forEach(function (p) { box.expandByPoint(p); });
    var center = new THREE.Vector3();
    box.getCenter(center);
    points = points.map(function (p) { return p.sub(center); });

    // Create colored line segments
    var totalPts = points.length;
    var positions = [];
    var colors = [];

    for (var j = 0; j < totalPts - 1; j++) {
        positions.push(points[j].x, points[j].y, points[j].z);
        positions.push(points[j + 1].x, points[j + 1].y, points[j + 1].z);

        var lightness = 0.15 + (j / totalPts) * 0.4;
        var c = new THREE.Color(lightness, lightness, lightness);
        colors.push(c.r, c.g, c.b);
        colors.push(c.r, c.g, c.b);
    }

    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var lineMat = new THREE.LineBasicMaterial({ vertexColors: true });
    var lineObj = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineObj);

    window.addEventListener('resize', onResize);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
