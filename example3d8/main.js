// Finite Subdivision Rule 3D — Tetrahedron subdivision, removing central octahedron
// Animated level by level

console.log("Finite Subdivision Rule 3D");

var scene, camera, renderer, controls;
var level = 0;
var maxLevel = 5;
var tetrahedra = [];
var group;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 3, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    group = new THREE.Group();
    scene.add(group);

    // Start with a single regular tetrahedron
    var s = 2.5;
    tetrahedra = [{
        p1: new THREE.Vector3(s, s, s),
        p2: new THREE.Vector3(s, -s, -s),
        p3: new THREE.Vector3(-s, s, -s),
        p4: new THREE.Vector3(-s, -s, s)
    }];

    drawTetrahedra();

    window.addEventListener('resize', onResize);
    animate();
}

function mid(a, b) {
    return new THREE.Vector3(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        (a.z + b.z) / 2
    );
}

function subdivide() {
    var newTetrahedra = [];

    tetrahedra.forEach(function (t) {
        // Find midpoints of all 6 edges
        var m12 = mid(t.p1, t.p2);
        var m13 = mid(t.p1, t.p3);
        var m14 = mid(t.p1, t.p4);
        var m23 = mid(t.p2, t.p3);
        var m24 = mid(t.p2, t.p4);
        var m34 = mid(t.p3, t.p4);

        // 4 corner sub-tetrahedra (central octahedron is removed)
        newTetrahedra.push({ p1: t.p1, p2: m12, p3: m13, p4: m14 });
        newTetrahedra.push({ p1: t.p2, p2: m12, p3: m23, p4: m24 });
        newTetrahedra.push({ p1: t.p3, p2: m13, p3: m23, p4: m34 });
        newTetrahedra.push({ p1: t.p4, p2: m14, p3: m24, p4: m34 });
    });

    tetrahedra = newTetrahedra;
}

function drawTetrahedra() {
    // Clear old meshes
    while (group.children.length > 0) {
        var child = group.children[0];
        group.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    }

    tetrahedra.forEach(function (t) {
        var geo = new THREE.BufferGeometry();
        var v = [t.p1, t.p2, t.p3, t.p4];

        var positions = [
            v[0].x, v[0].y, v[0].z, v[1].x, v[1].y, v[1].z, v[2].x, v[2].y, v[2].z,
            v[0].x, v[0].y, v[0].z, v[1].x, v[1].y, v[1].z, v[3].x, v[3].y, v[3].z,
            v[0].x, v[0].y, v[0].z, v[2].x, v[2].y, v[2].z, v[3].x, v[3].y, v[3].z,
            v[1].x, v[1].y, v[1].z, v[2].x, v[2].y, v[2].z, v[3].x, v[3].y, v[3].z
        ];

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.computeVertexNormals();

        // Color by position
        var center = new THREE.Vector3().add(v[0]).add(v[1]).add(v[2]).add(v[3]).divideScalar(4);
        var hue = (Math.atan2(center.z, center.x) / Math.PI + 1) / 2;
        var color = new THREE.Color();
        color.setHSL(hue, 0.75, 0.5);

        var mat = new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.DoubleSide,
            flatShading: true,
            transparent: true,
            opacity: 0.85
        });

        group.add(new THREE.Mesh(geo, mat));
    });
}

var nextStepTime = 0;
var stepInterval = 3000;
var restartPending = false;
var restartTime = 0;
var initialSize = 2.5;

function animate(time) {
    requestAnimationFrame(animate);

    if (restartPending && time > restartTime) {
        // Reset to initial state
        level = 0;
        tetrahedra = [{
            p1: new THREE.Vector3(initialSize, initialSize, initialSize),
            p2: new THREE.Vector3(initialSize, -initialSize, -initialSize),
            p3: new THREE.Vector3(-initialSize, initialSize, -initialSize),
            p4: new THREE.Vector3(-initialSize, -initialSize, initialSize)
        }];
        drawTetrahedra();
        restartPending = false;
        nextStepTime = time + stepInterval;
    } else if (!restartPending && time > nextStepTime && level < maxLevel) {
        subdivide();
        drawTetrahedra();
        level++;
        nextStepTime = time + stepInterval;
        if (level >= maxLevel) {
            restartPending = true;
            restartTime = time + stepInterval;
        }
    }

    // Gentle rotation
    if (group) {
        group.rotation.y += 0.003;
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
