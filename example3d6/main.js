// Recursive Function 3D — Sierpinski tetrahedron via midpoint subdivision

console.log("Recursive Function 3D");

var scene, camera, renderer, controls;
var level = 5;
var tetrahedra = [];
var drawnCount = 0;
var batchSize = 3;
var restartPending = false;
var restartTime = 0;
var addedMeshes = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcdcdc);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 3, 4);

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
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // Tetrahedron vertices (regular tetrahedron centered at origin)
    var s = 2;
    var p1 = new THREE.Vector3(s, s, s);
    var p2 = new THREE.Vector3(s, -s, -s);
    var p3 = new THREE.Vector3(-s, s, -s);
    var p4 = new THREE.Vector3(-s, -s, s);

    // Recursively subdivide
    buildSierpinskiTetrahedron(p1, p2, p3, p4, 0);

    window.addEventListener('resize', onResize);
    animate();
}

function getMidpoint(a, b) {
    return new THREE.Vector3(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        (a.z + b.z) / 2
    );
}

function buildSierpinskiTetrahedron(p1, p2, p3, p4, depth) {
    if (depth === level) {
        // At max depth, store this tetrahedron for rendering
        tetrahedra.push({
            vertices: [p1, p2, p3, p4],
            depth: depth
        });
        return;
    }

    // Find midpoints of all 6 edges
    var m12 = getMidpoint(p1, p2);
    var m13 = getMidpoint(p1, p3);
    var m14 = getMidpoint(p1, p4);
    var m23 = getMidpoint(p2, p3);
    var m24 = getMidpoint(p2, p4);
    var m34 = getMidpoint(p3, p4);

    // 4 sub-tetrahedra at the corners (removing central octahedron)
    buildSierpinskiTetrahedron(p1, m12, m13, m14, depth + 1);
    buildSierpinskiTetrahedron(p2, m12, m23, m24, depth + 1);
    buildSierpinskiTetrahedron(p3, m13, m23, m34, depth + 1);
    buildSierpinskiTetrahedron(p4, m14, m24, m34, depth + 1);
}

function createTetrahedronMesh(verts, colorHue) {
    var geo = new THREE.BufferGeometry();
    var v = verts;

    // 4 faces of a tetrahedron
    var positions = [
        v[0].x, v[0].y, v[0].z, v[1].x, v[1].y, v[1].z, v[2].x, v[2].y, v[2].z,
        v[0].x, v[0].y, v[0].z, v[1].x, v[1].y, v[1].z, v[3].x, v[3].y, v[3].z,
        v[0].x, v[0].y, v[0].z, v[2].x, v[2].y, v[2].z, v[3].x, v[3].y, v[3].z,
        v[1].x, v[1].y, v[1].z, v[2].x, v[2].y, v[2].z, v[3].x, v[3].y, v[3].z
    ];

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();

    var color = new THREE.Color();
    var lightness = 0.2 + colorHue * 0.4;
    color.setRGB(lightness, lightness, lightness);
    var mat = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        flatShading: true,
        transparent: true,
        opacity: 0.85
    });

    return new THREE.Mesh(geo, mat);
}

function animate() {
    requestAnimationFrame(animate);

    // Progressively add tetrahedra
    if (drawnCount < tetrahedra.length) {
        var end = Math.min(drawnCount + batchSize, tetrahedra.length);
        for (var i = drawnCount; i < end; i++) {
            var t = tetrahedra[i];
            // Color by position for visual variety
            var center = new THREE.Vector3();
            t.vertices.forEach(function (v) { center.add(v); });
            center.divideScalar(4);
            var hue = (Math.atan2(center.z, center.x) / Math.PI + 1) / 2;
            var mesh = createTetrahedronMesh(t.vertices, hue);
            scene.add(mesh);
            addedMeshes.push(mesh);
        }
        drawnCount = end;
        if (drawnCount >= tetrahedra.length) {
            restartPending = true;
            restartTime = performance.now() + 3000;
        }
    } else if (restartPending && performance.now() > restartTime) {
        // Remove all drawn meshes and restart
        addedMeshes.forEach(function (m) {
            scene.remove(m);
            if (m.geometry) m.geometry.dispose();
            if (m.material) m.material.dispose();
        });
        addedMeshes = [];
        drawnCount = 0;
        restartPending = false;
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
