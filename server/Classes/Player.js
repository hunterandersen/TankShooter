class Player{

    constructor(x, y, width, height, velX, velY, health, color, armor){
        this.pos = {x, y};
        this.size = {width, height};
        this.vel = {x:velX, y:velY, direction:0, lastDirection:0};
        this.health = health || 10;
        this.identity = {color, defaultColor:color};
        this.armor = armor || 10;
        this.speed = 6;
        this.canMove = true;
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

    takeDamage(dmgIncoming){
        const dmgReduction = dmgIncoming - (dmgIncoming *  (this.armor / 100));
        const dmgRealized = Math.max((dmgIncoming - dmgReduction), 1);
        this.health = this.health - dmgRealized;
    }

}

module.exports = Player;