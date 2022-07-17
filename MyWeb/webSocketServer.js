import { Server } from "socket.io";

var io = null;

const branchs = [];

function startSocketServer(server) {
    if (io == null)
        io = new Server(server);

    io.on("connection", (socket) => {
        console.log(`${socket.id} has connected on server!`);

        socket.emit('connected', {
            connected: true,
            socketId: socket.id,
        });

        socket.on('connect-branch', (data) => {
            console.log('connecting to branch ' + data.name);
            let branch = branchs.find(x => x.name == data.name);
            if (branch == null || branch == undefined) {
                socket.emit('fail-to-connect', {name: data.name, reason: 'branch not found.'});
                return;
            }
            socket.join(data.name);

            branch.registerListeners(socket);

            if (branch.onConnect != null) {
                branch.onConnect(socket);
            }
        });

        socket.on('leave-branch', (data) => {
            console.log('diconnecting to branch ' + data.name);

            socket.leave(data.name);

            socket.emit('disconnected', { connected: false, from: data.name });
        });

        //socket.on('connect-room', (data) => {
        //    let room = rooms.find(x => x.name == data.roomName);
        //    if (room == undefined) {
        //        room = {
        //            name: data.roomName,
        //            sockets: []
        //        }
        //        rooms.push(room);
        //    }

        //    if (!room.sockets.find(x => x == socket.id)) {
        //        room.sockets.push(socket.id);
        //    }

        //    if (!socket.rooms.has(data.roomName)) {

        //        socket.join(data.roomName);
        //    }

        //});


    });

    io.on('disconnect', (socket) => {
        console.log(`${socket.id} has disconnected from server!`);
        branchs.forEach(branch => branch.disconnectSocket(socket));
    });

}

function getIO() {
    return io;
}

function registerBranch(newBranch) {
    var branch = branchs.find(x => x.name == newBranch.name)
    if (branch != null && branch != undefined)
        return false;

    newBranch.addEmitter(emit);
    branchs.push(newBranch);
    return true;
}

function emit({ branchName, emitName, data, rooms = [] }) {
    if (rooms.length == 0)
        io.to(branchName).emit(`${branchName}-${emitName}`, data);

    rooms.forEach(x => io.to(x).emit(`${branchName}-${emitName}`, data));
}

class SocketBranch {
    constructor({ name }) {
        this.name = name;
        this.emitter = null;
        this.listeners = [];
        this.emitters = [];
        this.onConnect = null;
    }

    addListener(name, listen) {
        this.listeners.push({ name: name, listen: listen });
    }

    addEmitter(f) {
        this.emitter = f;
    }

    emit(emitName, data, rooms) {
        let name = this.name;
        console.log(`${name} is emiting ${emitName}`);
        this.emitter({ branchName: name, emitName: emitName, data: data, rooms: rooms });
    }

    registerListeners(socket) {
        var name = this.name;
        console.log(`${name} is registering ${this.listeners.length} listeners`);
        this.listeners.forEach(listener => socket.on(`${name}-${listener.name}`, (data) => { listener.listen(data, socket); }));
    }

    disconnectSocket(socket) {

    }

}

export { startSocketServer, getIO, SocketBranch, registerBranch }