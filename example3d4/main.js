// Cellular Automata 3D — Tetrahedral Rule 90
// A true 3D CA where each layer is derived from the previous one using XOR logic
// Generates a Sierpinski Tetrahedron iteratively

console.log("Cellular Automata 3D");

var scene, camera, renderer, controls;
var numLayers = 32;
var cubeSize = 0.12;
var spacing = cubeSize * 1.1;

var allCubes = [];         // Stores position and layer info for all active cells
var instancedMesh;
var visibleCount = 0;
var currentLayer = 0;
var layerOffsets = [];     // Index in allCubes where each layer starts

var nextLayerTime = 0;
var layerInterval = 150;   // ms per layer
var restartPending = false;
var restartTime = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcdcdc);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

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
    var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    generateCA();
    createMesh();

    window.addEventListener('resize', onResize);
    animate();
}

function generateCA() {
    // We simulate a 3D CA on a tetrahedral grid.
    // Coordinates (i, j, k) where i+j+k = n (layer index).
    // Simpler: map to 2D grid (i, j) for each layer n.
    // Rule: Cell(n, i, j) = XOR sum of parents from n-1:
    // Parents are (i-1, j), (i, j-1), (i, j) from previous layer (checking bounds)

    var layers = []; // Store grid for each layer to compute next one

    // Layer 0: Top tip
    // Grid: [[1]]
    layers.push([[1]]);

    // Process subsequent layers
    for (var n = 1; n < numLayers; n++) {
        var prevGrid = layers[n - 1];
        var newGrid = [];

        // In layer n, i goes from 0 to n
        for (var i = 0; i <= n; i++) {
            newGrid[i] = [];
            // j goes from 0 to n - i
            for (var j = 0; j <= n - i; j++) {
                // Determine value based on parents in prevGrid
                // Parent 1: (i-1, j)
                var p1 = (i > 0 && j < prevGrid[i - 1].length) ? prevGrid[i - 1][j] : 0;
                // Parent 2: (i, j-1)
                var p2 = (j > 0 && i < prevGrid.length && j - 1 < prevGrid[i].length) ? prevGrid[i][j - 1] : 0;
                // Parent 3: (i, j)
                var p3 = (i < prevGrid.length && j < prevGrid[i].length) ? prevGrid[i][j] : 0;

                // XOR sum: (p1 + p2 + p3) % 2
                var val = (p1 + p2 + p3) % 2;
                newGrid[i][j] = val;
            }
        }
        layers.push(newGrid);
    }

    // Convert active cells to 3D positions
    var sqrt3over2 = Math.sqrt(3) / 2;
    allCubes = [];
    layerOffsets = [];
    var count = 0;

    for (var n = 0; n < numLayers; n++) {
        layerOffsets.push(count);

        // Centering offsets
        var cx = n / 2 * spacing;
        var cz = n / 3 * sqrt3over2 * spacing;
        var cy = -n * spacing;

        var grid = layers[n];
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === 1) {
                    var px = (i + j * 0.5) * spacing - cx;
                    var pz = (j * sqrt3over2) * spacing - cz;
                    var py = cy;

                    allCubes.push({
                        px: px, py: py, pz: pz,
                        layer: n
                    });
                    count++;
                }
            }
        }
    }
    layerOffsets.push(count);

    // Center the whole model
    var minY = Infinity, maxY = -Infinity;
    allCubes.forEach(function (c) {
        if (c.py < minY) minY = c.py;
        if (c.py > maxY) maxY = c.py;
    });
    // Adjust Y so the center of mass is around 0
    var midY = (minY + maxY) / 2;
    allCubes.forEach(function (c) {
        c.py -= midY;
    });
}

function createMesh() {
    if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        instancedMesh.material.dispose();
    }

    var geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    var mat = new THREE.MeshPhongMaterial({ vertexColors: false });
    instancedMesh = new THREE.InstancedMesh(geo, mat, allCubes.length);

    var dummy = new THREE.Object3D();
    var hiddenDummy = new THREE.Object3D();
    hiddenDummy.scale.set(0, 0, 0);
    var color = new THREE.Color();

    allCubes.forEach(function (cube, idx) {
        // Init invisibly
        hiddenDummy.position.set(cube.px, cube.py, cube.pz);
        hiddenDummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, hiddenDummy.matrix);

        // Grayscale color
        var lightness = 0.2 + (cube.layer / numLayers) * 0.35;
        color.setRGB(lightness, lightness, lightness);
        instancedMesh.setColorAt(idx, color);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    currentLayer = 0;
    visibleCount = 0;
    restartPending = false;
    nextLayerTime = performance.now() + layerInterval;
}

function revealLayer(n) {
    var start = layerOffsets[n];
    var end = layerOffsets[n + 1];
    var dummy = new THREE.Object3D();

    for (var i = start; i < end; i++) {
        var cube = allCubes[i];
        dummy.position.set(cube.px, cube.py, cube.pz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
}

function hideAll() {
    var dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);
    for (var i = 0; i < allCubes.length; i++) {
        dummy.position.set(allCubes[i].px, allCubes[i].py, allCubes[i].pz); // keep pos, scale 0
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    currentLayer = 0;
}

function animate() {
    requestAnimationFrame(animate);

    var now = performance.now();

    if (restartPending && now > restartTime) {
        hideAll();
        restartPending = false;
        nextLayerTime = now + layerInterval;
    } else if (!restartPending && now > nextLayerTime && currentLayer < numLayers) {
        revealLayer(currentLayer);
        currentLayer++;
        nextLayerTime = now + layerInterval;

        if (currentLayer >= numLayers) {
            restartPending = true;
            restartTime = now + 3000;
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
