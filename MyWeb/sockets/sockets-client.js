var socket = io();

console.log(socket);

var branchs = [];

socket.on('connected', (data) => {
    console.log(`connected on socket ${socket.id}`);
    listenBranch('connected', data);
});

socket.on('fail-to-connect', (data) => {
    console.error(`fail to connect on ${data.name}. reason: ${data.reason}`);
    listenBranch('fail-to-connect', data);
});

socket.on('connect-branch', (data) => {
    console.log('connecting to branch ' + data.name);
    listenBranch('connect-branch', data);
});

socket.on('disconnected', (data) => {
    console.log('diconnecting to branch ' + data.name);
    listenBranch('disconnected', data);
});

function listenBranch(local, data) {
    branchs.forEach(x => {
        if (x.on == local) {
            x.method(data);
        }
    });
}

function getSocketId() {
    return socket.id;
}

function registerListener(local, f) {
    branchs.push({ on: local, method: f });
}
function getSocket(branch) {
    return {
        emitRoot: (local, data) => {
            socket.emit(local, data);
        },
        emitBranch: (local, data) => {
            console.log(`emmiting ${branch}-${local}`);
            socket.emit(`${branch}-${local}`, data);
        },
        listen: (local, f) => {
            console.log(`added listener ${branch}-${local}`);
            socket.on(`${branch}-${local}`, f);
        }
    };
}

export { registerListener, getSocket, getSocketId };