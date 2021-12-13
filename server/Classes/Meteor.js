class Meteor{
    
    constructor(x, y, radius, velX, velY, health){
        this.pos = {x, y};
        this.size = {radius};
        this.vel = {x:velX, y:velY};
        this.health = health;
        this.maxSpeed = Math.round(this.size.radius * .25);
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