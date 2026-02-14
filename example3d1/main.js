// Chaos Game 3D — Sierpinski Tetrahedron via random walk

console.log("Chaos Game 3D");

var scene, camera, renderer, controls;
var pointsGeo, pointsMat, pointsMesh;
var vertices = [];
var current = new THREE.Vector3(0, 0, 0);
var positions = [];
var maxPoints = 50000;
var batchSize = 200;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 3, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Tetrahedron vertices
    var s = 2;
    vertices.push(new THREE.Vector3(s, s, s));
    vertices.push(new THREE.Vector3(s, -s, -s));
    vertices.push(new THREE.Vector3(-s, s, -s));
    vertices.push(new THREE.Vector3(-s, -s, s));

    // Draw vertex markers
    var markerGeo = new THREE.SphereGeometry(0.05, 8, 8);
    var markerMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    vertices.forEach(function (v) {
        var m = new THREE.Mesh(markerGeo, markerMat);
        m.position.copy(v);
        scene.add(m);
    });

    // Wireframe tetrahedron
    var wireGeo = new THREE.BufferGeometry();
    var wirePositions = [];
    var indices = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    indices.forEach(function (pair) {
        wirePositions.push(vertices[pair[0]].x, vertices[pair[0]].y, vertices[pair[0]].z);
        wirePositions.push(vertices[pair[1]].x, vertices[pair[1]].y, vertices[pair[1]].z);
    });
    wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(wirePositions, 3));
    var wireMat = new THREE.LineBasicMaterial({ color: 0x333333 });
    scene.add(new THREE.LineSegments(wireGeo, wireMat));

    // Points buffer
    pointsGeo = new THREE.BufferGeometry();
    var posArray = new Float32Array(maxPoints * 3);
    var colArray = new Float32Array(maxPoints * 3);
    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
    pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colArray, 3));
    pointsGeo.setDrawRange(0, 0);

    pointsMat = new THREE.PointsMaterial({ size: 0.02, vertexColors: true });
    pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    scene.add(pointsMesh);

    current.set(0, 0, 0);

    window.addEventListener('resize', onResize);
    animate();
}

var pointCount = 0;
var colors = [
    new THREE.Color(0x00ffcc),
    new THREE.Color(0xff00cc),
    new THREE.Color(0xccff00),
    new THREE.Color(0x00ccff)
];

function addPoints() {
    if (pointCount >= maxPoints) return;

    var posAttr = pointsGeo.attributes.position;
    var colAttr = pointsGeo.attributes.color;
    var count = Math.min(batchSize, maxPoints - pointCount);

    for (var i = 0; i < count; i++) {
        var idx = Math.floor(Math.random() * 4);
        var target = vertices[idx];
        current.x = (current.x + target.x) / 2;
        current.y = (current.y + target.y) / 2;
        current.z = (current.z + target.z) / 2;

        var pi = pointCount + i;
        posAttr.array[pi * 3] = current.x;
        posAttr.array[pi * 3 + 1] = current.y;
        posAttr.array[pi * 3 + 2] = current.z;

        var c = colors[idx];
        colAttr.array[pi * 3] = c.r;
        colAttr.array[pi * 3 + 1] = c.g;
        colAttr.array[pi * 3 + 2] = c.b;
    }

    pointCount += count;
    pointsGeo.setDrawRange(0, pointCount);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    addPoints();
    controls.update();
    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
