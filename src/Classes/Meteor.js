class Meteor{
    pos = {
        x:0,
        y:0
    }
    size = {
        radius:0
    }
    vel = {
        x:0,
        y:0
    }
    health = 0;
    maxSpeed;
    
    constructor(x, y, radius, velX, velY, health){
        this.pos.x = x;
        this.pos.y = y;
        this.size.radius = radius;
        this.vel.x = velX;
        this.vel.y = velY;
        this.health = health;
        this.maxSpeed = Math.round(this.size.radius * .25);
        //console.log(this.maxSpeed);
    }

    addVelocity(additionX, additionY){
        this.vel.x += additionX;
        this.vel.y += additionY;
        if (this.vel.x > this.maxSpeed){
            this.vel.x = this.maxSpeed;
        }
        if (this.vel.y > this.maxSpeed){
            this.vel.y = this.maxSpeed;
        }
    }
}

module.exports = Meteor;