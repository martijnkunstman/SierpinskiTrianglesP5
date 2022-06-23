// Chaos Game

/*
let points = [{x:200,y:0},{x:0, y:400},{x:400,y:400}];
let x = 200;
let y = 200;
function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  let target = random(points);
  x = x-(x - target.x)/2;
  y = y-(y - target.y)/2;
  point(x, y);
}
*/

// Pascals triangle

/*
let triangle = [[BigInt(1)], [BigInt(1), BigInt(1)]];

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
  triangle.map((values, index1) => {
    values.map((value, index2, array) => {
      if (value % BigInt(2)) {
        point(200 - (array.length - 1) * 2 + index2 * 4, index1 * 4);
      }
    });
  });
}
*/

// Pythagoras tree

/*
function setup() {
  createCanvas(400, 400);
  background(220);
  angleMode(DEGREES);
  drawLine(-400, 400, 800, 0);
}

function drawLine(x, y, length, direction) {
  if (length > 2) {
    xnew = x + length * cos(direction);
    ynew = y + length * sin(direction);
    line(x, y, xnew, ynew);
    drawLine(xnew, ynew, length / 2, direction+240);
    drawLine(xnew, ynew, length / 2, direction + 120);
    drawLine(xnew, ynew, length / 2, direction);
  }
}
*/

// Cellular automata : rule 90

/*
let ruleset90 = [0, 1, 0, 1, 1, 0, 1, 0];
let data = [];
let x = -1;

function setup() {
  createDataStart();
  createCanvas(400, 400);
  background(220);
  stroke('rgba(0,0,0,0.5)');
}

function draw() {
  for (i = 0; i < data.length; i++) {
    if (!data[i]) {
      point(i/2.6-108, x/1.28);
    }
  }
  x=x+1;
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
*/

// Arrowhead Curve

/*
let arrowHeadCurveData = "1";
let counter = 0;
let x = 10;
let y = 390;
let angle = 0;
let length = 3;

function buildCurve() {
  for (a = 0; a < 7; a++) {
    let tempArray = arrowHeadCurveData.split("");
    let tempData = "";
    for (b = 0; b < tempArray.length; b++) {
      if (tempArray[b] == "1") {
        tempData = tempData + "23132";
      }
      if (tempArray[b] == "2") {
        tempData = tempData + "14241";
      }
      if (tempArray[b] == "3") {
        tempData = tempData + "3";
      }
      if (tempArray[b] == "4") {
        tempData = tempData + "4";
      }
    }
    arrowHeadCurveData = tempData;
  }
  arrowHeadCurveData = arrowHeadCurveData.split("");
  console.log(arrowHeadCurveData.length);
}

function setup() {
  buildCurve();
  createCanvas(400, 400);
  background(220);
  angleMode(DEGREES);
}
function draw() {
  xnew = x;
  ynew = y;
  if (arrowHeadCurveData[counter] == "3") {
    angle = angle - 60;
    xnew = x + length * cos(angle);
    ynew = y + length * sin(angle);
    line(x, y, xnew, ynew);
  }
  if (arrowHeadCurveData[counter] == "4") {
    angle = angle + 60;
    xnew = x + length * cos(angle);
    ynew = y + length * sin(angle);
    line(x, y, xnew, ynew);
  }
  x = xnew;
  y = ynew;
  counter++;
}
*/
