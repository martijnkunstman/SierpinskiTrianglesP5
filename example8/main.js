// Finite subdivision rule

console.log("Finite subdivision rule");

var items = [{ x1: 0, y1: 400, x2: 400, y2: 400, x3: 200, y3: 0 }]
var level = 0;

function setup() {
    createCanvas(400, 400);
    background(220);
    fill(0);
    noStroke();
    triangle(items[0].x1, items[0].y1, items[0].x2, items[0].y2, items[0].x3, items[0].y3);
    frameRate(1);
    text("Finite subdivision rule", 10, 20);
}

function draw() {
    level++;
    fill(220);
    let newItems = [];
    items.map((item) => {
        x1 = item.x1 + (item.x3 - item.x1) / 2;
        y1 = item.y3 + (item.y1 - item.y3) / 2;
        x2 = item.x3 + (item.x2 - item.x3) / 2;
        y2 = item.y3 + (item.y2 - item.y3) / 2;
        x3 = item.x1 + (item.x2 - item.x1) / 2;
        y3 = item.y1;
        triangle(x1, y1, x2, y2, x3, y3);
        newItems.push({ x1: x1, y1: y1, x2: x2, y2: y2, x3: item.x3, y3: item.y3 });
        newItems.push({ x1: item.x1, y1: item.y1, x2: x3, y2: y3, x3: x1, y3: y1 });
        newItems.push({ x1: x3, y1: y3, x2: item.x2, y2: item.y2, x3: x2, y3: y2 });
    });
    items = newItems;
    if (level > 8) {
        noLoop();
    }
}