// Pascals Triangle 3D — Pascal's Pyramid (trinomial coefficients)
// Odd entries rendered as cubes, forming a 3D Sierpinski tetrahedron
// Animated layer by layer with auto-restart

console.log("Pascals Triangle 3D");

var scene, camera, renderer, controls;
var numLayers = 32;
var cubeSize = 0.12;
var spacing = cubeSize * 1.1;

var allEntries = [];       // all precomputed entries grouped by layer
var instancedMesh;
var visibleCount = 0;      // how many instances are visible so far
var currentLayer = 0;      // which layer we're building up to
var layerOffsets = [];      // cumulative count at start of each layer

var nextLayerTime = 0;
var layerInterval = 150;   // ms between adding each layer
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

    buildAllEntries();
    createMesh();

    window.addEventListener('resize', onResize);
    animate();
}

function buildAllEntries() {
    var sqrt3over2 = Math.sqrt(3) / 2;
    allEntries = [];
    layerOffsets = [];
    var totalCount = 0;

    for (var n = 0; n < numLayers; n++) {
        layerOffsets.push(totalCount);

        // Centroid of this layer's triangle grid
        var cx = n / 2 * spacing;
        var cz = n / 3 * sqrt3over2 * spacing;

        for (var i = 0; i <= n; i++) {
            for (var j = 0; j <= n - i; j++) {
                var k = n - i - j;

                // Trinomial coefficient is odd iff no two indices share a 1-bit
                if ((i & j) === 0 && (j & k) === 0 && (i & k) === 0) {
                    var gridX = (i + j * 0.5) * spacing - cx;
                    var gridZ = (j * sqrt3over2) * spacing - cz;
                    var gridY = -n * spacing;

                    allEntries.push({
                        px: gridX,
                        py: gridY,
                        pz: gridZ,
                        layer: n
                    });
                    totalCount++;
                }
            }
        }
    }
    // Final offset marks total count
    layerOffsets.push(totalCount);

    // Pre-compute center offset so structure is centered
    // We compute this from ALL entries
    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;
    allEntries.forEach(function (e) {
        if (e.px < minX) minX = e.px;
        if (e.px > maxX) maxX = e.px;
        if (e.py < minY) minY = e.py;
        if (e.py > maxY) maxY = e.py;
        if (e.pz < minZ) minZ = e.pz;
        if (e.pz > maxZ) maxZ = e.pz;
    });
    var offX = (minX + maxX) / 2;
    var offY = (minY + maxY) / 2;
    var offZ = (minZ + maxZ) / 2;
    allEntries.forEach(function (e) {
        e.px -= offX;
        e.py -= offY;
        e.pz -= offZ;
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
    instancedMesh = new THREE.InstancedMesh(geo, mat, allEntries.length);

    var dummy = new THREE.Object3D();
    var color = new THREE.Color();

    // Set all instance transforms and colors, but hide them initially
    // by scaling to 0
    var hiddenDummy = new THREE.Object3D();
    hiddenDummy.scale.set(0, 0, 0);

    allEntries.forEach(function (entry, idx) {
        // Set real position
        dummy.position.set(entry.px, entry.py, entry.pz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        // Start hidden
        hiddenDummy.position.set(entry.px, entry.py, entry.pz);
        hiddenDummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, hiddenDummy.matrix);

        var lightness = 0.2 + (entry.layer / numLayers) * 0.35;
        color.setRGB(lightness, lightness, lightness);
        instancedMesh.setColorAt(idx, color);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    // Reset animation state
    visibleCount = 0;
    currentLayer = 0;
    restartPending = false;
    nextLayerTime = performance.now() + layerInterval;
}

function revealLayer(layerIndex) {
    var start = layerOffsets[layerIndex];
    var end = layerOffsets[layerIndex + 1];
    var dummy = new THREE.Object3D();

    for (var idx = start; idx < end; idx++) {
        var entry = allEntries[idx];
        dummy.position.set(entry.px, entry.py, entry.pz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    visibleCount = end;
}

function hideAll() {
    var hiddenDummy = new THREE.Object3D();
    hiddenDummy.scale.set(0, 0, 0);

    for (var idx = 0; idx < allEntries.length; idx++) {
        var entry = allEntries[idx];
        hiddenDummy.position.set(entry.px, entry.py, entry.pz);
        hiddenDummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, hiddenDummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    visibleCount = 0;
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
