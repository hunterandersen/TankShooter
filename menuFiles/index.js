const userNameInput = document.getElementById('nameInput');
const roomNameInput = document.getElementById('roomInput');
const newRoomButton = document.getElementById('newGameRoomBtn');
const joinRoomButton = document.getElementById('joinGameRoomBtn');
const userFeedbackBar = document.getElementById('userFeedbackBar');
const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const roomList = document.getElementById('roomList');

const MIN_USER_NAME_LENGTH = 2;
const ROOM_NAME_LENGTH = 6;

let isValidUserName = false;
let isValidRoomName = false;

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
            //Remove all of the items in the list
            while(roomList.firstChild){
                roomList.removeChild(roomList.firstChild);
            }
            
            //Recreate the list with all the room names
            let roomInfo;
            let roomButton;
            values.forEach(room =>{
                roomInfo = document.createElement("li");

                roomButton = document.createElement("button");
                roomButton.setAttribute("data-roomName", room);
                roomButton.textContent = `${room}`;
                roomButton.classList.add("roomButton");
                roomButton.textContent === roomNameInput.value && roomButton.classList.add("selected");

                roomButton.addEventListener("click", (e) => {
                    //The user clicking the button should put this room's name into their join game input box
                    roomNameInput.value = room;
                    document.querySelectorAll(".roomButton").forEach(button => {
                        button.classList.remove("selected");
                    });
                    e.target.classList.add("selected");
                });
                
                roomInfo.appendChild(roomButton);
                roomList.appendChild(roomInfo);
            })
        }
    })
    .catch(error =>{
        console.error(`Error: `, error);
    });
}
displayGameRooms();
setInterval(displayGameRooms, 3000);

newRoomButton.addEventListener('click', () => {
    if (userNameInput.value.length > 2){
        let userName = userNameInput.value;

        //Set the search params for player name
        let params = new URLSearchParams();
        params.set('playerName', userName);
        //Redirect to start the game with the search params
        const redirectURL = `${HREF}game.html?${params.toString()}`;
        window.location.replace(redirectURL);
    } else {
        console.log('Invalid Name Length');
        displayGameRooms();
    }

});

joinRoomButton.addEventListener('click', async () => {
    if (userNameInput.value.length > 2){
        let userName = userNameInput.value;
        
        if (roomNameInput.value.length == 6){
            let roomName = roomNameInput.value;
            
            let params = new URLSearchParams();
            params.set('roomID', roomName);
            const result = await fetch(`/roomToJoinIsValid?${params.toString()}`, {
                method:'GET',
                mode:'cors',
                cache:'no-cache',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/json'},
            });
            const data = await result.json();
            
            if (data) {
                //Set the search params for player name
                params = new URLSearchParams();
                params.set('playerName', userName);
                params.set('roomID', roomName);
                //Redirect to start the game with the search params
                const redirectURL = `${HREF}game.html?${params.toString()}`;
                window.location.replace(redirectURL);
            } else {
                userFeedbackBar.textContent = `${roomName} is not a valid game room to join`;
            }
        }else{
            console.log('Invalid Room Length');
            displayGameRooms();
        }

    } else {
        console.log('Invalid Name Length');
    }
});

//MARK: UI handling
function matchUItoState() {
    //Enable/Disable the buttons based on the text inputs
    newRoomButton.disabled = !isValidUserName;
    joinRoomButton.disabled = !(isValidRoomName && isValidUserName);

}

roomNameInput.addEventListener("input", (e) => {
    if (e.target.value.length === ROOM_NAME_LENGTH) {
        isValidRoomName = true;
    } else {
        isValidRoomName = false;        
    }
    matchUItoState();
});

userNameInput.addEventListener("input", (e) => {
    if (e.target.value.length >= MIN_USER_NAME_LENGTH) {
        isValidUserName = true;
    } else {
        isValidUserName = false;        
    }
    matchUItoState();
});