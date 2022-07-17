import { SocketBranch, registerBranch } from './../webSocketServer.js';

export default function chatIni() {

    const branch = new SocketBranch({ name: 'chat' });

    branch.onConnect = (socket) => {
        branch.emit('connect-branch', {connected: true, socketId: socket.id, name: 'chat'});
    };

    branch.addListener('alter-user-name', (data) => {
        branch.emit('alter-user-name', data);
    });

    branch.addListener('send-message', (data, socket) => {
        console.log('emitting chat message received');
        branch.emit('message-received', data);
    });

    registerBranch(branch);
}