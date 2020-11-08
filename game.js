
var treeGamePiece;
var trainGamePiece;
var isForwardButtonPressed = false;
var isBrakeButtonPressed = false;
var stopAtStationCounter = 0

const timeinterval_s = 0.05; // s
const timeinterval_ms = timeinterval_s * 1000; // ms

const messageCounterMax = 50;

var message = "";
var messageCounter = 0;

var cnt = 0;

// UNITS
// 60 px -> 10 m
// factors:
const m_to_px = 60.0/10.0;
const px_to_m = 1.0/m_to_px;
const secPlanePerspFactor = 0.1;

var trainPosX = 0.0; // meters
var treePosX = 100.0; // meters
var stationPosX = 1000.0 // meters
var landPosX = 0.0;
var heightsPosX = landPosX + 500.0;
var housePosX = 80.0 // meters

var numOfTrees = 1;
var treeIdArray = [0,0,0,0];

var accel = 3.0; // m/s^2
var speed = 0.0;

function startGame() {
    myGameArea.start();
    treeGamePiece = new component(30, 30, 0, 184, "tree1.png");
    tree2GamePiece = new component(30, 30, 0, 184, "tree2.png");
    tree3GamePiece = new component(30, 30,  0, 184, "tree3.png");
    tree4GamePiece = new component(30, 30,  0, 184, "tree4.png");
    trainGamePiece = new component(222, 18,  0, 194, "train2.png");
    stationGamePiece = new component(350, 40,  0 , 172, "small_station.png");
    landGamePiece = new component(356,45,  10, 100, "land.png");
    heightsGamePiece = new component(174,29, 10, 100, "heights.png");
    land2GamePiece = new component(356, 45 , 10, 100, "land2.png");
    houseGamePiece = new component(22,21, 50, 192, "house.png");
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 400; // px
        this.canvas.height = 225; // px
        this.image = new Image()
        this.image.src = "bg.png"
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, timeinterval_ms);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)
    }
}

function component(width, height, x, y, imageFile) {
    this.width = width;
    this.height = height;
    this.x = x; // px
    this.y = y; // px
    this.image = new Image();
    this.image.src = imageFile;
    this.draw = function (x,y) {
        ctx = myGameArea.context;
        ctx.drawImage(this.image,
            x,
            y,
            this.width, this.height);     
        console.log("ok");
    }
}

function updateGameArea() {
    myGameArea.clear();    
    ctx = myGameArea.context;
    
    // second plane - far
    landGamePiece.draw(landGamePiece.x, landGamePiece.y);
    heightsGamePiece.draw(landGamePiece.x + 370, heightsGamePiece.y);
    land2GamePiece.draw(landGamePiece.x + 370 + 174, land2GamePiece.y);
    
    for (var i = 0; i < numOfTrees ; i++ ) {
        var treeId = treeIdArray[i];
        var treeToDraw = treeGamePiece;
        switch (treeId) {
            case 1:
                treeToDraw = tree2GamePiece;
                break;
            case 2:
                treeToDraw = tree3GamePiece;
                break;
            case 3:
                treeToDraw = tree4GamePiece;
                break;
        }
        treeToDraw.draw(treeToDraw.x + i*20, treeToDraw.y);
        console.log("### tree screen pos : " + treeToDraw.x + i*20)
    }
    
    houseGamePiece.draw(houseGamePiece.x, houseGamePiece.y);
    stationGamePiece.draw(stationGamePiece.x, stationGamePiece.y);
    trainGamePiece.draw(trainGamePiece.x, trainGamePiece.y);
    
    ctx.font = "15px Arial";
    ctx.fillText("Train speed : " + Math.floor(speed * 3.6) + " km/h", 10, 50);
    ctx.fillText("Next station: " + Math.floor(stationPosX - trainPosX) + " m", 10, 70); 
    
    if (Math.abs(stationPosX - trainPosX) < 20 && speed < 5) {
        stopAtStationCounter += 1;
    } 
    
    if (stopAtStationCounter == 10) {
        stopAtStationCounter += 1
        message = "Station stop OK!";
        messageCounter = 1;
    }
    
    if (stopAtStationCounter > 0 && Math.abs(stationPosX - trainPosX) > 50) {
        stopAtStationCounter = 0;
    }
    
    if (trainPosX - stationPosX > 30 && trainPosX - stationPosX < 50 /*&& messageCounter < 1*/ && stopAtStationCounter < 10) {
        message = "Station missed!";
        messageCounter = 1;
    }
    
    displayMessage();
    
    updateTrain();
    updateTree();
    updateStation();
    updateLand();
    updateHouse();
    cnt += 1;
}

function displayMessage() {
    ctx = myGameArea.context;
    
    if (messageCounter > 0 && messageCounter <= messageCounterMax) {
        ctx.font = "15px Arial";
        ctx.fillText(message, 10, 90);
        messageCounter += 1;
    }
    
    if (messageCounter > messageCounterMax) {
        messageCounter = 0;
    }
}

function pickTrees() {
    console.log("### size : " + treeIdArray.length)
    for (var i = 0 ; i < 4 ; i++) {
        treeIdArray[i] = Math.floor(Math.random()*4);
        console.log("### tree " + treeIdArray[i])
    } 
}

function handleGoOnMouseDown() {
    isForwardButtonPressed = true;
    console.log("MOUSE DOWN");
}

function handleGoOnMouseUp() {
    isForwardButtonPressed = false;
    console.log("MOUSE UP");
}

function handleBrakeOnMouseDown() {
    isBrakeButtonPressed = true;
}

function handleBrakeOnMouseUp() {
    isBrakeButtonPressed = false;
}

function updateTrain() {
    // control
    trainPosX += speed*timeinterval_s;
    
    if (isBrakeButtonPressed == true) {
        speed -= 3.0*accel*timeinterval_s;
    } else if (isForwardButtonPressed == true) {
        speed += accel*timeinterval_s;          
    } else {
        speed -= 0.1*accel*timeinterval_s;        
    }
     // limit speed
    if (speed >= 70.0) {
        speed = 70.0;
    }
    if (speed <= 0) {
            speed = 0;
    }
    console.log("speed: " + speed)
    
    // simulate bumps on railway
    if (Math.floor(trainPosX) % 20 < 3 && speed > 5.0) {
        trainGamePiece.y = 194 + 2*Math.sin(Math.random()*3.14);
    } else {
        trainGamePiece.y = 194;
    }
}

function getPosOnScreen(posX) {
    posX_local = posX - trainPosX;
    return posX_local*m_to_px;
}

function updateTree() {
    // update gfx
    treePosX_local = treePosX - trainPosX;
    //console.log("tree pos local: " + treePosX_local);
    treeGamePiece.x = treePosX_local*m_to_px;
    tree2GamePiece.x = treeGamePiece.x;
    tree3GamePiece.x = treeGamePiece.x;
    tree4GamePiece.x = treeGamePiece.x;
    
    if (treePosX_local < -30.0) {
        treePosX = trainPosX + Math.random()*50.0 + 80.0;
        
        numOfTrees = Math.random()*3 + 1;
        pickTrees();
        for (var i = 0 ; i < numOfTrees ;i++) {
            console.log("### tree id " + treeIdArray[i]);
        }
        console.log("num of trees = " + numOfTrees);
    }
}

function updateStation() {
    stationPosX_local = stationPosX - trainPosX;
    stationGamePiece.x = stationPosX_local*m_to_px
    
    if (stationPosX_local < -50.0) {
        stationPosX = trainPosX + Math.random()*2000.0 + 1000.0;
    }
}

function updateLand() { 
    landPosX_local = (landPosX - trainPosX);
    // heightsPosX_local = (heightsPosX - trainPosX);
    
    landGamePiece.x = landPosX_local*m_to_px*secPlanePerspFactor;
    // heightsGamePiece.x = heightsPosX_local*m_to_px*secPlanePerspFactor;
    
    if (landPosX_local < -1370.0) {
        landPosX = trainPosX + 1000.0;
    }
    
    // if (heightsPosX_local < -1000.0) {
        // heightsPosX = landPosX + 1000.0;
    // }   
}

function updateHouse() {
    housePosX_local = housePosX - trainPosX;
    houseGamePiece.x = housePosX_local*m_to_px;
    
    if (housePosX_local < -30.0) {
        housePosX = trainPosX + Math.random()*50.0 + 200.0;
    }
}



