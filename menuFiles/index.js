const newRoomButton = document.getElementById('newGameRoomBtn');
const joinRoomButton = document.getElementById('joinGameRoomBtn');
const userNameInput = document.getElementById('nameInput');
const roomNameInput = document.getElementById('roomInput');
const userFeedbackBar = document.getElementById('userFeedbackBar');
const roomList = document.getElementById('roomList');

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

joinRoomButton.addEventListener('click', async () => {
    if (userNameInput.value.length > 2){
        let userName = userNameInput.value;
        
        if (roomNameInput.value.length == 6){
            let roomName = roomNameInput.value;

            const result = await fetch('/roomToJoinIsValid', {
                method:'POST',
                mode:'cors',
                cache:'no-cache',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "roomName": roomName
                })
            });
            const data = await result.json();
            
            if (data) {
                //Set the search params for player name
                let params = new URLSearchParams(HREF);
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