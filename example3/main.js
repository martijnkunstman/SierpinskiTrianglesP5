// Pythagoras tree

console.log("Pythagoras tree");

let counter = 0;
let step = 0;

function setup() {
    createCanvas(400, 400);
    background(220);
    angleMode(DEGREES);
    text('Pythagoras tree', 10, 20);
}

function draw() {
    drawLine(-400, 400, 800, 0);
    step = 0;
    counter++;
}

function drawLine(x, y, length, direction) {
    if (length > 4) {
        xnew = x + length * cos(direction);
        ynew = y + length * sin(direction);
        if (counter == step) {
            line(x, y, xnew, ynew);
        }
        step++;
        drawLine(xnew, ynew, length / 2, direction + 240);
        drawLine(xnew, ynew, length / 2, direction + 120);
        drawLine(xnew, ynew, length / 2, direction);
    }

}