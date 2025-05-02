//io is retrieved from a cdn in the script tag in index.html

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const windowWidth = 900;
const windowHeight = 700;

let playerNumber = -1;

//Connect to the socket.io server
//io(window.location.origin)
//Leaving the paramter blank is supposed to connect to the server it's already running on
const serverSocket = io();

//Grab the search params from the url to determine whether this client should make a new room or join an existing room
const searchParamsRaw = window.location.search
let searchParams = new URLSearchParams(searchParamsRaw);
let playerName = searchParams.get('playerName');
const roomID = searchParams.get('roomID');

if(playerName){//If there is a player name, then they want a room. One way or another

    if(roomID){//If there is a roomID, then they are joining a room
        serverSocket.emit('requestJoinRoom', {roomName:roomID, playerName});
    }
    else{//Otherwise, they will create a new room to join
        serverSocket.emit('requestNewRoom', {playerName});
    }
}

serverSocket.on('connection', (thing)=>{
    console.log('connection!');
});

serverSocket.on('roomName', roomName => {
    /**
     * Eventually, we could build a link that the user can copy and share to other players so that they can join the room
     */
    document.getElementById("title").textContent = `Room ID: ${roomName}`;
    console.log(`Room Name is: ${roomName}`);
});

serverSocket.on('invalidRoom', roomName => {
    console.log('Invalid Room: ', roomName);
    //Redirect back to the menu page
    const LOC = window.location;
    const BASE = `${LOC.protocol}//${LOC.hostname}` + (LOC.port? `:${LOC.port}`: "");
    const redirectURL = `${BASE}/index.html`;
    window.location.replace(redirectURL);
});

serverSocket.on('fullRoom', roomName => {
    console.log('Full room', roomName);
});

serverSocket.on('disconnect', roomName => {
    console.log('Disconnected from: ', roomName);
});

serverSocket.on('init', data => {
    playerNumber = data;
    console.log('Room initializing');
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    canvas.setAttribute('background-color', 'rgb(15, 15, 15)');
});

serverSocket.on('newGameFrame', paintFrame);

//get state of game from server
//draw game state
//get user input
//send user input to server

const directions = {
    right:0,
    down:1,
    left:2,
    up:3
}

let playerMovement = {
    up: false,
    down: false,
    left: false,
    right: false
}

let playerControlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];

function paintFrame(frameState){
    context.clearRect(0, 0, canvas.width, canvas.height);

    //console.log(frameState);
    let players = frameState.players;
    let meteors = frameState.meteors;
    let bullets = frameState.bullets;

    players.forEach((player) => {
        if (player) {
            drawPlayer(player);
        }
    });

    meteors.forEach((meteor) =>{
        drawMeteor(meteor);
    });

    bullets.forEach((bullet) =>{
        drawBullet(bullet);
    });
}

function drawPlayer(p){
    //Draw the player's body
    context.fillStyle = p.identity.color;
    context.fillRect(p.pos.x, p.pos.y, p.size.width, p.size.height);

    //Draw the player's health
    const fontSize = 30;
    context.font = `${fontSize}px sans-serif`;
    context.fillStyle = "red";
    //textAlign center only effects alignment on the x-axis
    context.textAlign = "center";
    const playerMidX = p.pos.x + p.size.width/2;
    //Offset included to help y-alignment be centered
    //Doesn't quite seem perfect, but okay for now
    const playerMidY = p.pos.y + p.size.height/2 + (fontSize/4);
    context.fillText(p.health, playerMidX, playerMidY);
}

function drawMeteor(m){
    context.fillStyle = 'rgb(100, 93, 93)';
    context.beginPath();
    context.arc(m.pos.x, m.pos.y, m.size.radius, 0, Math.PI *2);
    context.fill();
    context.closePath();
}

function drawBullet(b){
    context.fillStyle = 'red';
    context.beginPath();
    let direction;
    if (Math.abs(b.vel.x) > Math.abs(b.vel.y)){
        if (b.vel.x > 0){
            direction = directions.right;
        }else{
            direction = directions.left;
        }
    }else if (b.vel.y > 0){
        direction = directions.down;
    }else{
        direction = directions.up;
    }

    switch(direction){
        case directions.right:
            context.moveTo(b.pos.x, b.pos.y);
            context.lineTo(b.pos.x, b.pos.y + b.size.base);
            context.lineTo(b.pos.x + b.size.height, b.pos.y + b.size.base*.5);
            context.lineTo(b.pos.x, b.pos.y);
            break;
        case directions.down:
            context.moveTo(b.pos.x, b.pos.y);
            context.lineTo(b.pos.x + b.size.base, b.pos.y);
            context.lineTo(b.pos.x + b.size.base*.5, b.pos.y + b.size.height);
            context.lineTo(b.pos.x, b.pos.y);
            break;
        case directions.left:
            context.moveTo(b.pos.x + b.size.base, b.pos.y);
            context.lineTo(b.pos.x + b.size.base, b.pos.y + b.size.base);
            context.lineTo(b.pos.x, b.pos.y + b.size.base*.5);
            context.lineTo(b.pos.x + b.size.base, b.pos.y);
            break;
        case directions.up:
            context.moveTo(b.pos.x, b.pos.y + b.size.height);
            context.lineTo(b.pos.x + b.size.base, b.pos.y + b.size.height);
            context.lineTo(b.pos.x + b.size.base*.5, b.pos.y);
            context.lineTo(b.pos.x, b.pos.y + b.size.height);
            break;
    }
    context.fill();
    context.closePath();

    /* context.strokeStyle = 'yellow';
    context.strokeRect(b.pos.x, b.pos.y, b.size.base, b.size.height); */
}

//Get User Movement Input
window.addEventListener('keydown', (event) => {
    let keyCode = event.code;
    if (validKeyCode(keyCode)){
        switch(keyCode){
            case 'ArrowLeft': 
                event.preventDefault();
                setPlayerMovement(directions.left);
                break;
            case 'ArrowRight': 
                event.preventDefault();
                setPlayerMovement(directions.right);
                break;
            case 'ArrowUp' : 
                event.preventDefault();
                setPlayerMovement(directions.up);
                break;
            case 'ArrowDown' : 
                event.preventDefault();
                setPlayerMovement(directions.down);
                break;
            case 'Space' :
                event.preventDefault();
                serverSocket.emit('shootBullet', );
        }
        serverSocket.emit('userInput', movementToDirection(playerMovement));
    }
    
});

window.addEventListener('keyup', (event) => {
    let keyCode = event.code;
    if (validKeyCode(keyCode)){
        switch(event.code){
            case 'ArrowLeft': 
                event.preventDefault();
                playerMovement.left = false;
                break;
            case 'ArrowRight': 
                event.preventDefault();
                playerMovement.right = false;
                break;
            case 'ArrowUp' : 
                event.preventDefault();
                playerMovement.up = false;
                break;
            case 'ArrowDown' : 
                event.preventDefault();
                playerMovement.down = false;
                break;
        }
        serverSocket.emit('userInput', movementToDirection(playerMovement));
    }
});

function validKeyCode(code){
    let valid = false;
    playerControlKeys.forEach(value => {
        if (code == value){
            valid = true;
        }
    });

    return valid;
}

function setPlayerMovement(direction){
    playerMovement.down = false;
    playerMovement.left = false;
    playerMovement.right = false;
    playerMovement.up = false;

    if(direction == directions.up){
        playerMovement.up = true;
    }else if (direction == directions.down){
        playerMovement.down = true;
    }else if (direction == directions.left){
        playerMovement.left = true;
    }else if (direction == directions.right){
        playerMovement.right = true;
    }
}

function movementToDirection(movement){
    if (movement.up){
        return directions.up;
    } else if (movement.down){
        return directions.down;
    }else if (movement.right){
        return directions.right;
    }else if (movement.left){
        return directions.left;
    }

    return -1;
}
