class Meteor{
    
    colors = {
        DEFAULT_COLOR: 'rgb(100, 93, 93)',
        BULLET_HIT_COLOR: 'rgb(112, 8, 8)',
    };

    constructor(x, y, radius, velX, velY, health){
        this.pos = {x, y};
        this.size = {radius};
        this.vel = {x:velX, y:velY};
        this.health = health;
        this.maxSpeed = Math.round(this.size.radius * .25);
        this.color = this.colors.DEFAULT_COLOR;
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

    setColorToDefault(){
        this.color = this.colors.DEFAULT_COLOR;
    }
}

module.exports = Meteor;