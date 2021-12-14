const newRoomButton = document.getElementById('newGameRoomBtn');
const joinRoomButton = document.getElementById('joinGameRoomBtn');
const userNameField = document.getElementById('nameInput');
const roomNameField = document.getElementById('roomInput');

const HREF = window.location.href;

//Fetch a list of game rooms on the server and console log them
function displayGameRooms(){
    fetch('/getRooms', {
        method:'GET',
        mode:'cors',
        cache:'no-cache',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        let values = Object.values(data);
        if(values.length > 0){
            values.forEach(room =>{
                console.log(`Room: ${room}`);
            })
        }
    })
    .catch(error =>{
        console.error(`Error: `, error);
    });
}
displayGameRooms();

newRoomButton.addEventListener('click', event => {
    if (userNameField.value.length > 2){
        let userName = userNameField.value;

        //Set the search params for player name
        let params = new URLSearchParams(HREF);
        params.set('playerName', userName);
        //Redirect to start the game with the search params
        const redirectURL = `${HREF}game.html?${params.toString()}`;
        window.location.replace(redirectURL);
    } else {
        console.log('Invalid Name Length');
        displayGameRooms();
    }

});

joinRoomButton.addEventListener('click', event => {
    if (userNameField.value.length > 2){
        let userName = userNameField.value;
        
        if (roomNameField.value.length == 6){
            let roomName = roomNameField.value;

            //Set the search params for player name
            let params = new URLSearchParams(HREF);
            params.set('playerName', userName);
            params.set('roomID', roomName);
            //Redirect to start the game with the search params
            const redirectURL = `${HREF}game.html?${params.toString()}`;
            window.location.replace(redirectURL);
        }else{
            console.log('Invalid Room Length');
            displayGameRooms();
        }

    } else {
        console.log('Invalid Name Length');
    }
});