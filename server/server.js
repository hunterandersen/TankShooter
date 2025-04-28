const Player = require('./Classes/Player');
const Meteor = require('./Classes/Meteor');
const Bullet = require('./Classes/Bullet');
const express = require('express');

const FRAME_RATE = 60;
const windowWidth = 900;
const windowHeight = 700;
const NUM_RANDOM_CHARACTERS = 3;
const SOCKET_PORT_NUMBER = 3000;
const EXPRESS_PORT_NUMBER = 3500;

const playerColors = ['white', 'blue', 'green', 'yellow'];

let gameRooms = {};
let gameState = [];

let uniqueActiveGameRooms = [];

//Set up the HTTP Server using Express
const httpServer = express();
//Set up the middleware that serves my static client-side html
httpServer.use(express.static('menuFiles'));
httpServer.use(express.static('gameFiles'));
httpServer.use(express.json());

httpServer.get('/getRooms', (req, res)=>{
    console.log('Sending a list of the rooms');
    res.json(uniqueActiveGameRooms);
});

httpServer.post("/roomToJoinIsValid", (req, res) => {
    console.log("Determining incoming room's validity");
    const {roomName} = req.body;

    //Find the room in the list of all rooms
    const roomToJoin = sockIO.sockets.adapter.rooms.get(roomName);
    //If the room exists and doesn't have more than 3 players, then true, else false
    const roomIsValid = !!roomToJoin && (roomToJoin.size >= 4);
    console.log("roomIsValid", roomIsValid);

    res.json(roomIsValid);
});

httpServer.listen(EXPRESS_PORT_NUMBER, () => {
    console.log(`Server started on port ${EXPRESS_PORT_NUMBER}`);
});

//------------ END EXPRESS SERVER ----------------

//Set up the Socket Server and start it listening on PORT_NUMBER
const sockIO = require('socket.io')(SOCKET_PORT_NUMBER, {
    cors: {
        origins: [`http://localhost:${SOCKET_PORT_NUMBER}`, "*"],
        methods: ["GET", "POST"]
    }
});

sockIO.on('connection', client => {
    console.log('Client connected to server', client.id);

    let playerIndex;
    let roomName;

    client.on('requestNewRoom', data => {
        roomName = generateRoomId();
        gameRooms[client.id] = roomName;
        uniqueActiveGameRooms.push(roomName);

        client.emit('roomName', roomName);

        initGameState(roomName);
 
        client.join(roomName);
        client.userName = data;
        playerIndex = 1;
        client.emit('init', playerIndex);
    });

    client.on('requestJoinRoom', data => {
        roomName = data.roomName + '';
        let userName = data.userName;

        let numPlayersInRoom;
        const roomToJoin = sockIO.sockets.adapter.rooms.get(roomName);
        console.log("Attempting to join this room:", roomToJoin);

        if (roomToJoin){
            numPlayersInRoom = roomToJoin.size;
            console.log(`Num Players: ${numPlayersInRoom}`);
            if (numPlayersInRoom <= 0){
                console.log('UH OH - THEY CAN JOIN AN EMPTY ROOM!');
            }
            if (numPlayersInRoom >= 4){
                //Already 4 players in the room
                client.emit('fullRoom', roomName);
                console.log('Full Room. More than 4 trying to enter');
                return;
            }
        }else{
            console.log("Attempt to join invalid room:", roomName);
            client.emit('invalidRoom', roomName);
            return;
        }

        gameRooms[client.id] = roomName;
        //No need to add to the unique active rooms lists since this code only happens when joining an existing room
        client.userName = userName;
        
        client.join(roomName);
        console.log('Joined room: ', roomName);
        playerIndex = numPlayersInRoom + 1;
        console.log(`Player Index: ${playerIndex}`);
        gameState[roomName].players.push(new Player(450, 450, 50, 50, 0, 0, 35, playerColors[playerIndex-1]));

        client.emit('init', playerIndex);
    });

    client.on('userInput', direction => {
        if(roomName && client.rooms.has(roomName)){
            gameState[roomName].players[playerIndex-1].setVelocity(direction);//implement lerping
        }
    });

    client.on('shootBullet', () => {
        if(roomName && client.rooms.has(roomName)){
            let shooter = gameState[roomName].players[playerIndex-1];
            let bulletBase = 20;
            let bulletHeight = 25;
            //Start with the shooter's position, but REMEMBER that a bullet's "position" for drawing is really it's top left corner, so bulletHeight only matters half the time
            let newBulletX = shooter.pos.x;
            let newBulletY = shooter.pos.y;
            //Based on which direction the shooter is facing, offset the x and y so that the bullet appears in front of the player instead of inside the player
            switch(shooter.vel.lastDirection) {
                //East
                case 0:
                    newBulletX += (shooter.size.width + Math.abs(shooter.vel.x) + 2);
                    newBulletY += (shooter.size.height / 2 - bulletBase / 2);
                break;
                //South
                case 1:
                    newBulletX += (shooter.size.width / 2 - bulletBase / 2);
                    newBulletY += (shooter.size.height + Math.abs(shooter.vel.y) + 2);
                break;
                //West
                case 2:
                    newBulletX -= ((Math.abs(shooter.vel.x) + bulletHeight + 2));
                    newBulletY += (shooter.size.height / 2 - bulletBase / 2);
                break;
                //North
                case 3:
                    newBulletX += (shooter.size.width / 2 - bulletBase / 2);
                    newBulletY -= ((Math.abs(shooter.vel.y) + bulletHeight + 2));
                break;
            }

            gameState[roomName].bullets.push(new Bullet(newBulletX, newBulletY, bulletBase, bulletHeight, 
                (shooter.vel.x/Math.abs(shooter.vel.x))*12 || 0, (shooter.vel.y/Math.abs(shooter.vel.y))*12 || 0, shooter.vel.lastDirection));
        }
    });

    client.on('disconnect', reason =>{
        console.log(`Client ${client.id} has disconnected due to: ${reason}`);

        let currentRoom = sockIO.sockets.adapter.rooms.get(roomName);
        let numPlayersInRoom;
        if (currentRoom){
            //Find how many players are in the room
            numPlayersInRoom = currentRoom.size;
            console.log(numPlayersInRoom);
        }else{
            client.emit('roomClose', currentRoom);
            console.log(`Room emptied`);
            //Remove the game room from the list of all game rooms
            //Reminder: gameRooms is an object, not an array
            delete gameRooms[client.id];

            //Remove the game room from the active rooms list
            let roomIndex = uniqueActiveGameRooms.indexOf(currentRoom);
            uniqueActiveGameRooms.splice(roomIndex, 1);
        }

        if(playerIndex){
            gameState[roomName].players.splice(playerIndex-1, 1);
            client.emit('playerDisconnect', playerIndex);
        }
        if(numPlayersInRoom <= 0){
            console.log(gameRooms);
        }

    });

});

function initGameState(room){
    gameState[room] = {
        players: [new Player(10, 20, 50, 50, 0, 0, 30, playerColors[0])],
        meteors: [new Meteor(100, 100, 25, 1, -2, 40), new Meteor(200, 200, 25, 0, 0, 40),
             new Meteor(487, 333, 5, -5, 0, 40), new Meteor(600, 482, 15, 0, -2, 40), new Meteor(60, 400, 35, 2, -2, 15)],
        bullets: [],
    };

    const intervalId = setInterval(() => {
        update(room);

        sockIO.sockets.in(room).emit('newGameFrame', gameState[room]);

    }, 1000 / FRAME_RATE);
}

function update(room){
    //Reset player statuses to their defaults
    gameState[room].players.forEach(player => {
        player.setCanMove(true);
        player.setDefaultColor();
    });

    //Update meteors
    let meteorsLength = gameState[room].meteors.length;
    gameState[room].meteors = gameState[room].meteors.filter( meteor => {
        if(meteor.health <= 0){
            meteorDeath(meteor, room);
            return false;//Remove the dead meteors
        }

        meteor.pos.x += meteor.vel.x;
        meteor.pos.y += meteor.vel.y;

        //Bounce the meteors off the walls
        if(meteor.pos.x - meteor.size.radius <= 0 || meteor.pos.x + meteor.size.radius >= windowWidth){
            meteor.vel.x *= -1;
        }
        if(meteor.pos.y - meteor.size.radius <= 0 || meteor.pos.y + meteor.size.radius >= windowHeight){
            meteor.vel.y *= -1;
        }

        //Check for collision between the meteors and the players
        let nearPointX;
        let nearPointY;
        gameState[room].players.forEach(player => {
            nearPointX = nearestPointBetween(meteor.pos.x, player.pos.x, player.pos.x + player.size.width);
            nearPointY = nearestPointBetween(meteor.pos.y, player.pos.y, player.pos.y + player.size.height);

            if (squaredDistance(meteor.pos.x, meteor.pos.y, nearPointX, nearPointY) < (meteor.size.radius * meteor.size.radius)){
                //COLLISION!
                meteor.addVelocity(player.vel.x * .5, player.vel.y *.5);
                /* meteor.vel.x *= -1;
                meteor.vel.y *= -1; */
                //Freeze the player's movement due to hitting a meteor
                player.setCanMove(false);
                player.setColor('orange');
            }

        });

        return meteor;
    });

    let newMeteorsLength = gameState[room].meteors.length;
    for(let i = 0; i < meteorsLength - newMeteorsLength; i++){
        gameState[room].meteors.push(
            new Meteor(randIntBetween(0, windowWidth), randIntBetween(0, windowHeight),
                        randIntBetween(10, 35), randIntBetween(0, 5), randIntBetween(0, 5), 30));
    }

    //Move players
    gameState[room].players.forEach(player => {
        if(player.canMove){
            player.pos.x += player.vel.x;
            player.pos.y += player.vel.y;
            if (player.pos.x < 0){
                player.pos.x = 0;
            } else if (player.pos.x + player.size.width > windowWidth){
                player.pos.x = windowWidth - player.size.width;
            }
            if (player.pos.y < 0){
                player.pos.y = 0;
            } else if (player.pos.y + player.size.height > windowHeight){
                player.pos.y = windowHeight - player.size.height;
            }
        }
    });

    gameState[room].bullets = gameState[room].bullets.filter( bullet => {
        bullet.pos.x += bullet.vel.x;
        bullet.pos.y += bullet.vel.y;

        if (bullet.pos.x > windowWidth || bullet.pos.x < 0 || bullet.pos.y < 0 || bullet.pos.y > windowHeight){
            return false;
        }

        //Check triangle collision

        //Clamp version of testing collision
        //Scary performance potential ---- Nesting For Each statements inside of the filter
        let nearestPointOnTriangleX, nearestPointOnTriangleY;
        let bulletHit = false;
        gameState[room].players.forEach(player => {
            if (Math.abs(bullet.vel.x) > 0){//bullet is facing left or right
                nearestPointOnTriangleX = nearestPointBetween(player.pos.x + (player.size.width*.5), bullet.pos.x, bullet.pos.x + bullet.size.height);
                nearestPointOnTriangleY = nearestPointBetween(player.pos.y + (player.size.height*.5), bullet.pos.y, bullet.pos.y + bullet.size.base);
            }else{//bullet is facing up or down
                nearestPointOnTriangleX = nearestPointBetween(player.pos.x + (player.size.width*.5), bullet.pos.x, bullet.pos.x + bullet.size.base);
                nearestPointOnTriangleY = nearestPointBetween(player.pos.y + (player.size.height*.5), bullet.pos.y, bullet.pos.y + bullet.size.height);
            }

            if(pointWithinRect(nearestPointOnTriangleX, nearestPointOnTriangleY, player.pos.x, player.pos.y, player.size.width, player.size.height)){
                player.setColor('lightgreen');//Certain Collision with bullet
                player.takeDamage(20);
                bulletHit = true;
            }
        });
        //Remove the bullet so that it doesn't pierce through the player
        if (bulletHit) return false;
        
        bulletHit = false;
        gameState[room].meteors.forEach(meteor => {
            if (Math.abs(bullet.vel.x) > 0){//bullet is facing left or right
                nearestPointOnTriangleX = nearestPointBetween(meteor.pos.x, bullet.pos.x, bullet.pos.x + bullet.size.height);
                nearestPointOnTriangleY = nearestPointBetween(meteor.pos.y, bullet.pos.y, bullet.pos.y + bullet.size.base);
            }else{
                nearestPointOnTriangleX = nearestPointBetween(meteor.pos.x, bullet.pos.x, bullet.pos.x + bullet.size.base);
                nearestPointOnTriangleY = nearestPointBetween(meteor.pos.y, bullet.pos.y, bullet.pos.y + bullet.size.height);
            }

            if (squaredDistance(meteor.pos.x, meteor.pos.y, nearestPointOnTriangleX, nearestPointOnTriangleY) < (meteor.size.radius * meteor.size.radius)){
                //Bullet collided with meteor!
                meteor.health -= 5;
                bulletHit = true;
            }

        });
        //Remove the bullet so that it doesn't pierce through the meteor
        if(bulletHit) return false;

        return bullet;
    });

}

function meteorDeath(meteor, room){
    //Simulate meteor explosion. Aka, create bullets that the meteor shoots out as it dies
    let velX, velY;
    for(let i = 0; i < 8; i++){
        velX = randIntBetween(-6, 6, true);
        velY = randIntBetween(-6, 6, true);
        gameState[room].bullets.push(new Bullet(meteor.pos.x, meteor.pos.y, 20, 20, velX, velY, null));
    }

}

//------------------------------  Utility Functions  ------------------------------

//returns the values without square rooting them
//This saves on performance since square rooting a number is a more costly (less performant) operation
function squaredDistance(a, b, x, y){
    return (x-a)*(x-a) + (y-b)*(y-b);
}

/**
 * 
 * @param {number} value "x" or "y" on coordinate plane to be checked
 * @param {number} minX The low end value
 * @param {number} maxX The high end value
 * @returns {number} The "clamped" nearest value between the given points
 */
function nearestPointBetween(value, minX, maxX){
    if (value < minX){
        return minX;
    }else if (value > maxX){
        return maxX;
    }else {
        return value;
    }
}

/**
 * 
 * @param {*} x The point's x coord
 * @param {*} y The point's y coord
 * @param {*} a The rect's starting point "x"
 * @param {*} b The rect's starting point "y"
 * @param {*} width The rect's width
 * @param {*} height The rect's height
 * @returns A boolean - whether or not the point lies within the rectangle
 */
function pointWithinRect(x, y, a, b, width, height){
    if (x >= a && x <= a + width){//x axis potential hit
        if (y >= b && y <= b + height){
            return true;//both axes hit
        }
    }
    if (y >= b && y <= b + height){//y axis potential hit
        if (x >= a && x <= a + width){
            return true;//both axes hit
        }
    }
    return false;
}

function generateRoomId(){
    let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let numeric = '0123456789';
    let letters = '';
    let numbers = '';
    let rand;

    //Generate three random letters and three random numbers
    for(let i = 0; i < NUM_RANDOM_CHARACTERS; i++){
        rand = Math.floor(Math.random() * alpha.length);
        letters += alpha.substring(rand, rand+1);
        rand = Math.floor(Math.random() * numeric.length);
        numbers += numeric.substring(rand, rand+1);
    }
    
    //Check that it hasn't duplicated the game room code
    if(isDuplicateRoomId(letters+numbers, gameRooms)){
        return generateRoomId();
    }

    return letters + numbers;
}

/**
 * 
 * @param {string} roomId The new roomId string to be checked
 * @param {Object} prevRooms An object whose values are the previous roomIds to be referenced
 * @returns {boolean} true if prevRooms contains roomId, false if it's a new id
 */
function isDuplicateRoomId(roomId, prevRooms){
    let values = Object.values(prevRooms);
    for(let i = 0; i < values.length; i++){
        if (roomId === values[i]){
            console.log(`Id in use: ${id}`);
            console.log(`Duplicated ID: ${roomId}`);
            return true;
        }
    }

    return false;
}

/**
 * 
 * @param {number} a low-end
 * @param {number} b high-end
 * @param {boolean} nonZero 
 * @returns {number} A random number between a and b. If nonZero is true, then the random number can't be 0.
 */
function randIntBetween(a, b, nonZero){
    if (nonZero){
        let x = Math.round(Math.random() * (b-a) + a);
        if (x == 0){
            return randIntBetween(a, b, true);
        }
        return x;
    }
    return Math.round(Math.random() * (b-a) + a);
}