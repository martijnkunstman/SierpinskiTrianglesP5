// Shrinking and Duplication 3D — cubes shrinking and duplicating into 4 copies

console.log("Shrinking and Duplication 3D");

var scene, camera, renderer, controls;
var items = [];
var level = 0;
var maxLevel = 6;
var group;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcdcdc);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2.7, 2.7, 2.7);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;

    // Lighting
    var ambientLight = new THREE.AmbientLight(0x505050);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    group = new THREE.Group();
    scene.add(group);

    // Start with one cube
    // In 2D version: {x, y, width} — shrinks to half and creates 3 copies
    // In 3D version: {x, y, z, size} — shrinks to half and creates 4 copies (tetrahedron arrangement)
    items = [{ x: 0, y: 0, z: 0, size: 3 }];

    drawCurrentLevel();

    window.addEventListener('resize', onResize);
    animate();
}

function drawCurrentLevel() {
    // Clear previous
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }

    // Center offset
    items.forEach(function (item) {
        var geo = new THREE.BoxGeometry(item.size * 0.95, item.size * 0.95, item.size * 0.95);
        var lightness = 0.2 + ((item.x + item.y + item.z + 5) / 10 % 1) * 0.4;
        var color = new THREE.Color(lightness, lightness, lightness);
        var mat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            item.x + item.size / 2,
            item.y + item.size / 2,
            item.z + item.size / 2
        );
        group.add(mesh);
    });

    // Calculate center target for smooth centering
    var box = new THREE.Box3().setFromObject(group);
    var center = new THREE.Vector3();
    box.getCenter(center);
    centerTarget.copy(group.position).sub(center);
}

var nextStepTime = 0;
var stepInterval = 2250; // ms between levels (1.5x of original 1500)
var restartPending = false;
var restartTime = 0;
var centerTarget = new THREE.Vector3();
var initialItems = [{ x: 0, y: 0, z: 0, size: 3 }];

function animate(time) {
    requestAnimationFrame(animate);

    if (restartPending && time > restartTime) {
        // Reset to initial state
        level = 0;
        items = [{ x: 0, y: 0, z: 0, size: 3 }];
        drawCurrentLevel();
        restartPending = false;
        nextStepTime = time + stepInterval;
    } else if (!restartPending && time > nextStepTime && level < maxLevel) {
        // Shrink and duplicate — 3D version
        var newItems = [];
        items.forEach(function (item) {
            var half = item.size / 2;
            newItems.push({ x: item.x, y: item.y, z: item.z, size: half });
            newItems.push({ x: item.x + half, y: item.y, z: item.z, size: half });
            newItems.push({ x: item.x + half / 2, y: item.y, z: item.z + half, size: half });
            newItems.push({ x: item.x + half / 2, y: item.y + half, z: item.z + half / 2, size: half });
        });
        items = newItems;
        level++;
        drawCurrentLevel();
        nextStepTime = time + stepInterval;
        if (level >= maxLevel) {
            restartPending = true;
            restartTime = time + stepInterval;
        }
    }

    // Smooth centering — lerp group position toward target
    group.position.lerp(centerTarget, 0.05);

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
