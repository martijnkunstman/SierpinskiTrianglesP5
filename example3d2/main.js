// Pascals Triangle 3D — odd values rendered as 3D cubes

console.log("Pascals Triangle 3D");

var scene, camera, renderer, controls;
var triangle = [[BigInt(1)], [BigInt(1), BigInt(1)]];
var numRows = 64;
var cubeSize = 0.12;
var built = false;

function addRow() {
    var previousRow = triangle[triangle.length - 1];
    var newRow = [BigInt(1)];
    for (var i = 0; i < previousRow.length - 1; i++) {
        newRow.push(previousRow[i] + previousRow[i + 1]);
    }
    newRow.push(BigInt(1));
    triangle.push(newRow);
}

function init() {
    // Build Pascal's triangle
    for (var i = 0; i < numRows; i++) {
        addRow();
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -2, 8);

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
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Use instanced mesh for performance
    var geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    var mat = new THREE.MeshPhongMaterial({ vertexColors: false });

    // Count odd values
    var count = 0;
    triangle.forEach(function (row) {
        row.forEach(function (val) {
            if (val % BigInt(2) !== BigInt(0)) count++;
        });
    });

    var instancedMesh = new THREE.InstancedMesh(geo, mat, count);
    var dummy = new THREE.Object3D();
    var color = new THREE.Color();
    var idx = 0;

    var totalRows = triangle.length;

    triangle.forEach(function (row, rowIndex) {
        var rowLen = row.length;
        row.forEach(function (val, colIndex) {
            if (val % BigInt(2) !== BigInt(0)) {
                var x = (colIndex - (rowLen - 1) / 2) * cubeSize * 1.1;
                var y = -(rowIndex - totalRows / 2) * cubeSize * 1.1;
                var z = 0;

                dummy.position.set(x, y, z);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(idx, dummy.matrix);

                // Color based on row depth
                var hue = rowIndex / totalRows;
                color.setHSL(hue, 0.8, 0.55);
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
