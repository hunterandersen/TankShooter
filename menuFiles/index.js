const newRoomButton = document.getElementById('newGameRoomBtn');
const joinRoomButton = document.getElementById('joinGameRoomBtn');
const userNameField = document.getElementById('nameInput');
const roomNameField = document.getElementById('roomInput');

console.log('Menu File starting...');
console.log(window.location.hostname);
console.log(window.location.pathname);
console.log(window.location.href);

const HREF = window.location.href;

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
        }

    } else {
        console.log('Invalid Name Length');
    }
});