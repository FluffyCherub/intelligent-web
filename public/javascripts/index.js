let name = null;
let roomNo = null;
//let socket= null;
let socket= io();
//let chat= io.connect('/chat');
//let socket= io.connect('/chat');

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    document.getElementById('takePhoto').style.display = 'none';

    // set up webcam interface list
    selectCamera();

    //initialise the socket operations as described in the lectures (room joining, chat message receipt etc.)
    initChatSocket();
    // initStreamCanvas();

    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./sw.js')
            .then(function() { console.log('Service Worker Registered'); });
    }
    loadData(false);
    /*if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }*/
}


/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    // send the chat message
    let chatText = document.getElementById('chat_input').value;
    socket.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    let imageUrl= document.getElementById('image_url').value;
    if (name && roomNo && imageUrl){
        //join the room
        socket.emit('create or join', roomNo, name);
        initCanvas(socket, imageUrl);
        hideLoginInterface(roomNo, name);
    }
    else{
        document.getElementById("error").textContent = "Please complete all fields";
    }
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';

    //name,data, image, room
    storeOther('chat', text, imageBase, document.getElementById('roomNo'));

}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('photoCapture').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}

/**
 * it initialises the socket for /chat
 */
function initChatSocket() {
    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}

/////////////////////////////////////////////////////////////////

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
/*
function writeOnChatHistory(text) {
    let history = document.getElementById('chat_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = ''
}
 */


