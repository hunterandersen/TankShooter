import Mover from './Mover.js';

function Ball(x, y, speed){

    let state = {
        x,
        y,
        speed
    }

    console.log(state);

    return Object.assign(
        state,
        Mover(state)
    );

}

export default Ball;