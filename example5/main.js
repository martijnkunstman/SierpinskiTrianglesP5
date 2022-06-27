// Arrowhead Curve

console.log("Arrowhead Curve");

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
}

function setup() {
    buildCurve();
    createCanvas(400, 400);
    background(220);
    frameRate(120);
    angleMode(DEGREES);
    text("Arrowhead Curve", 10, 20);
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