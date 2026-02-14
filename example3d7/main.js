// Shrinking and Duplication 3D — cubes shrinking and duplicating into 4 copies

console.log("Shrinking and Duplication 3D");

var scene, camera, renderer, controls;
var items = [];
var level = 0;
var maxLevel = 6;
var group;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 4, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

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
        var hue = (item.x + item.y + item.z + 5) / 10;
        var color = new THREE.Color();
        color.setHSL(hue % 1, 0.7, 0.5);
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

    // Center the group
    var box = new THREE.Box3().setFromObject(group);
    var center = new THREE.Vector3();
    box.getCenter(center);
    group.position.sub(center);
}

var nextStepTime = 0;
var stepInterval = 1500; // ms between levels

function animate(time) {
    requestAnimationFrame(animate);

    if (time > nextStepTime && level < maxLevel) {
        // Shrink and duplicate — 3D version
        // Each cube at (x,y,z,size) → 4 cubes at half size:
        // Bottom-left-front, Bottom-right-front, Bottom-left-back, Top-center
        var newItems = [];
        items.forEach(function (item) {
            var half = item.size / 2;
            // 4 copies arranged like tetrahedron vertices
            newItems.push({ x: item.x, y: item.y, z: item.z, size: half }); // bottom-front-left
            newItems.push({ x: item.x + half, y: item.y, z: item.z, size: half }); // bottom-front-right
            newItems.push({ x: item.x + half / 2, y: item.y, z: item.z + half, size: half }); // bottom-back-center
            newItems.push({ x: item.x + half / 2, y: item.y + half, z: item.z + half / 2, size: half }); // top-center
        });
        items = newItems;
        level++;
        drawCurrentLevel();
        nextStepTime = time + stepInterval;
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
