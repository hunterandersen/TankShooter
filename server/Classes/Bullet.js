class Bullet{

    constructor(x, y, base, height, velX, velY, direction){
        this.pos = {x, y};
        this.size = {base, height};
        this.vel = {x:velX, y:velY};
        this.defaultSpeed = 6;

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