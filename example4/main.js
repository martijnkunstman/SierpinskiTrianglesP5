// Cellular automata : rule 90

console.log("Cellular automata : rule 90");

let ruleset90 = [0, 1, 0, 1, 1, 0, 1, 0];
let data = [];
let x = -1;

function setup() {
    createDataStart();
    createCanvas(400, 400);
    background(220);
    text('Cellular automata : rule 90', 10, 20);
    stroke('rgba(0,0,0,0.5)');
}

function draw() {
    for (i = 0; i < data.length; i++) {
        if (!data[i]) {
            point(i / 2.6 - 108, x / 1.28);
        }
    }
    x = x + 1;
    data = findResult();
}

function createDataStart() {
    for (i = 0; i < 1600; i++) {
        data.push(0);
    }
    data[Math.round(1600 / 2)] = 1;
}

function findResult() {
    let array = [];
    for (j = 0; j < 1600; j++) {
        outcome = 0;
        if (j == 0) {
            element1 = data[1600 - 1];
        } else {
            element1 = data[j - 1];
        }

        element2 = data[j];

        if (j == 1600 - 1) {
            element3 = data[0];
        } else {
            element3 = data[j + 1];
        }

        result = element1 + "-" + element2 + "-" + element3;

        if (result == "0-0-0") {
            outcome = ruleset90[0] ? 0 : 1;
        }
        if (result == "0-0-1") {
            outcome = ruleset90[1] ? 0 : 1;
        }
        if (result == "0-1-0") {
            outcome = ruleset90[2] ? 0 : 1;
        }
        if (result == "0-1-1") {
            outcome = ruleset90[3] ? 0 : 1;
        }
        if (result == "1-0-0") {
            outcome = ruleset90[4] ? 0 : 1;
        }
        if (result == "1-0-1") {
            outcome = ruleset90[5] ? 0 : 1;
        }
        if (result == "1-1-0") {
            outcome = ruleset90[6] ? 0 : 1;
        }
        if (result == "1-1-1") {
            outcome = ruleset90[7] ? 0 : 1;
        }
        array.push(outcome);
    }
    return array;
}