// Pascals triangle

console.log("Pascals triangle");

let triangle = [
    [BigInt(1)],
    [BigInt(1), BigInt(1)]
];

function addRow() {
    let previousRow = triangle[triangle.length - 1];
    let newRow = [BigInt(1)];
    for (let i = 0; i < previousRow.length - 1; i++) {
        let current = previousRow[i];
        let next = previousRow[i + 1];
        newRow.push(current + next);
    }
    newRow.push(BigInt(1));
    triangle.push(newRow);
}

for (let i = 0; i < 100; i++) {
    addRow();
}

function setup() {
    createCanvas(400, 400);
    background(220);
    strokeWeight(3);
    frameRate(120);
    text('Pascals triangle', 10, 20);
}
rowCount = 0;
collumnCount = 0;

function draw() {
    triangle.map((values, index1) => {
        if (rowCount == index1) {
            values.map((value, index2, array) => {
                if (collumnCount == index2) {
                    if (value % BigInt(2)) {
                        point(200 - (array.length - 1) * 2 + index2 * 4, index1 * 4);
                    }
                    if (collumnCount == array.length - 1) {
                        collumnCount = 0;
                        rowCount++;
                    }
                }
            });
        }
    });
    collumnCount++;
}