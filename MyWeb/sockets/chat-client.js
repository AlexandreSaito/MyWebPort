import { registerListener, getSocket, getSocketId } from './sockets-client.js';
const socketName = 'chat';

var socket = getSocket(socketName);

var userName = '';

var connected = false;

registerListener('connect-branch', (data) => {
    console.log(data);
    if (data.name == socketName) {
        console.log(data);

    }
});

const chatElement = document.createElement('div');

chatElement.id = 'chat-wrapper'
chatElement.classList.add("closed");

chatElement.innerHTML += `<a class='open-chat'></a>`;
chatElement.innerHTML += `
<div class='content'>
    <div class='user'>
        <input type='text' id='chat-user-name' data-submit='#chat-alter-user-name' />
        <button type='button' id='chat-alter-user-name'>Alter</button>
    </div>
    <div id='chat-messages'></div>
    <div class='message'>
        <input type='text' id='chat-text-message' data-submit='#chat-send-message' />
        <button type='button' id='chat-send-message'>Send</button>
    </div>
</div>`;

document.body.appendChild(chatElement);

const btnOpenChat = document.querySelector("#chat-wrapper>.open-chat");
const btnAlterUser = document.getElementById('chat-alter-user-name');
const btnSendMessage = document.getElementById('chat-send-message');
const Messages = document.getElementById('chat-messages');

btnOpenChat.onclick = (e) => {
    chatElement.classList.remove("closed");
    if (!connected) {
        addSocketListeners();
        socket.emitRoot('connect-branch', { name: socketName });
    }
};

btnSendMessage.onclick = (e) => {
    socket.emitBranch('send-message', {
        name: userName, content: document.getElementById('chat-text-message').value
    });
};

btnAlterUser.onclick = (e) => {
    userName = document.getElementById('chat-user-name').value;
    socket.emitBranch('alter-user-name', { name: userName, socketId: getSocketId() });
};

function addSocketListeners() {
    socket.listen('connect-branch', (data) => {
        if (data.socketId == socket.id) {
            connected = true;
        }
        console.log(`connected on chat: ${data.socketId}`);
    });

    socket.listen('message-received', (data) => {
        console.log(data);
    });

    socket.listen('alter-user-name', (data) => {
        console.log(data);
    });

    socket.listen('message-received', (data) => {
        Messages.innerHTML += `<p class='message'><span class='sender'>${data.name}</span>: <span class='content'>${data.content}</span></p>`;
    });
}