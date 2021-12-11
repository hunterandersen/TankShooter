import Ball from './Ball.js';

const ball1 = Ball(4, 9, 2);

console.log(ball1.speed);
console.log(ball1);

var thing = Ball(4, 9, 2).move(1)
console.log(thing);

console.log(ball1.y);

ball1.move(1);

console.log(ball1.y);