function Mover(state){

    return function move(direction){
        if(direction == 0){
            state.x += state.speed;
        }
        if(direction == 1){
            state.y += state.speed;
        }
        if(direction == 2){
            state.x -= state.speed;
        }
        if(direction == 3){
            state.y -= state.speed;
        }
    }

}

export default Mover;