// Chaos Game

console.log("Chaos Game");

let points = [{
    x: 200,
    y: 0
}, {
    x: 0,
    y: 400
}, {
    x: 400,
    y: 400
}];
let x = 200;
let y = 200;

function setup() {
    createCanvas(400, 400);
    background(220);
    text('Chaos Game', 10, 20);
}

function draw() {
    let target = random(points);
    x = x - (x - target.x) / 2;
    y = y - (y - target.y) / 2;
    point(x, y);
}