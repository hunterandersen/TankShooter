class Player{
    pos = {
        x:0,
        y:0
    }
    size = {
        width:0,
        height:0
    }
    vel = {
        x:0,
        y:0,
        direction:0, 
        lastDirection:0
    }
    identity = {
        color: 'white',
        defaultColor: null
    }
    health = 0;
    speed = 10;
    canMove = true;

    constructor(x, y, width, height, velX, velY, health, color){
        this.pos.x = x;
        this.pos.y = y;
        this.size.width = width;
        this.size.height = height;
        this.vel.x = velX;
        this.vel.y = velY;
        this.health = health;
        this.identity.color = color;
        this.identity.defaultColor = color;
    }

    setVelocity(direction){
        if (direction != -1){
            this.vel.lastDirection = direction;
        }
        this.vel.direction = direction;
        if (direction == -1){
            this.vel.x = 0;
            this.vel.y = 0;
        }else if (direction == 0){
            this.vel.x = this.speed;
            this.vel.y = 0;
        }else if (direction == 1){
            this.vel.x = 0;
            this.vel.y = this.speed;
        }else if (direction == 2){
            this.vel.x = -this.speed;
            this.vel.y = 0;
        }else if (direction == 3){
            this.vel.x = 0;
            this.vel.y = -this.speed;
        }
    }

    setColor(color){
        this.identity.color = color;
    }

    setDefaultColor(){
        this.identity.color = this.identity.defaultColor;
    }

    setCanMove(value){
        this.canMove = value;
    }

}

module.exports = Player;