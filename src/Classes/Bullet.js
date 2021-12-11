class Bullet{
    pos = {
        x: 0,
        y: 0
    }
    size = {
        base: 0,
        height: 0
    }
    vel = {
        x: 0,
        y: 0
    }
    defaultSpeed = 6;

    constructor(x, y, base, height, velX, velY, direction){
        this.pos.x = x;
        this.pos.y = y;
        this.size.base = base;
        this.size.height = height;
        this.vel.x = velX;
        this.vel.y = velY;
        if (this.vel.x == 0 && this.vel.y == 0){
            if (direction == 0){
                this.vel.x = this.defaultSpeed;
                this.vel.y = 0;
            }else if (direction == 1){
                this.vel.x = 0;
                this.vel.y = this.defaultSpeed;
            }else if (direction == 2){
                this.vel.x = -this.defaultSpeed;
                this.vel.y = 0;
            }else if (direction == 3){
                this.vel.x = 0;
                this.vel.y = -this.defaultSpeed;
            }
        }
        if(!direction){
            if(this.vel.x > 0){
                this.direction = 0;
            }else if (this.vel.x < 0){
                this.direction = 2;
            }else if (this.vel.y > 0){
                this.direction = 1;
            }else{
                this.direction = 3;
            }
        }
    }
}

module.exports = Bullet;