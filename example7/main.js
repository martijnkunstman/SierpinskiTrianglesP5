// Shrinking and duplication

console.log("Shrinking and duplication");

var items = [{ x: 0, y: 0, width: 400 }]
var level = 0;

function setup() {
    createCanvas(400, 400);
    background(220);
    fill(0);
    frameRate(1);
    text("Shrinking and duplication", 10, 20);
}

function draw() {
    level++;
    background(220);
    text("Shrinking and duplication", 10, 20);
    let newItems = [];
    items.map((item) => {
        square(item.x, item.y, item.width, item.width / 4);
        newItems.push({ x: item.x + item.width / 4, y: item.y, width: item.width / 2 });
        newItems.push({ x: item.x, y: item.y + item.width / 2, width: item.width / 2 });
        newItems.push({ x: item.x + item.width / 2, y: item.y + item.width / 2, width: item.width / 2 });
    });
    items = newItems;
    if (level > 10) {
        noLoop();
    }
}