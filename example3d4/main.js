// Cellular Automata Rule 90 — 3D visualization
// Generations stacked along Z-axis, cells as instanced cubes

console.log("Cellular Automata : Rule 90 3D");

var scene, camera, renderer, controls;
var ruleset90 = [0, 1, 0, 1, 1, 0, 1, 0];
var cellSize = 128;
var numGenerations = 128;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Lighting
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    // Build all generations
    var data = [];
    for (var i = 0; i < cellSize; i++) data.push(0);
    data[Math.floor(cellSize / 2)] = 1;

    var allGenerations = [data.slice()];

    for (var gen = 1; gen < numGenerations; gen++) {
        var newData = [];
        for (var j = 0; j < cellSize; j++) {
            var left = j === 0 ? data[cellSize - 1] : data[j - 1];
            var center = data[j];
            var right = j === cellSize - 1 ? data[0] : data[j + 1];
            var ruleIndex = left * 4 + center * 2 + right;
            newData.push(ruleset90[ruleIndex]);
        }
        allGenerations.push(newData);
        data = newData;
    }

    // Count active cells
    var activeCount = 0;
    allGenerations.forEach(function (row) {
        row.forEach(function (cell) {
            if (cell === 1) activeCount++;
        });
    });

    // Create instanced mesh
    var cubeGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
    var cubeMat = new THREE.MeshPhongMaterial({ vertexColors: false });
    var instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, activeCount);
    var dummy = new THREE.Object3D();
    var color = new THREE.Color();
    var idx = 0;

    var scale = 0.1;
    var offsetX = -cellSize * scale / 2;
    var offsetZ = -numGenerations * scale / 2;

    allGenerations.forEach(function (row, genIndex) {
        row.forEach(function (cell, cellIndex) {
            if (cell === 1) {
                var x = cellIndex * scale + offsetX;
                var y = 0;
                var z = genIndex * scale + offsetZ;

                dummy.position.set(x, y, z);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(idx, dummy.matrix);

                // Color by generation
                var hue = genIndex / numGenerations * 0.7;
                color.setHSL(hue, 0.85, 0.55);
                instancedMesh.setColorAt(idx, color);
                idx++;
            }
        });
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

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
