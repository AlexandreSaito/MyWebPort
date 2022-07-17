import { Server } from "socket.io";
import { Player, Character, Attack } from './games/FightGame/character.js';
import Game, { getCharacter } from './games/FightGame/game.js';
import { startServer, getIO } from './webSocketServer.js';

const rooms = [];

const words = [];

function startGameServer() {
    let io = getIO();

    //socket.emit('connected', {
    //    connected: true,
    //    socketId: socket.id,
    //});

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

    //socket.on('create-character', (data) => {
    //    //var character = getCharacter({ id: data.characterId, className: data.className, isPlayer: true, isServer: true });
    //    io.sockets.emit('create-character', data);
    //});

    //socket.on('action', (data) => {
    //    console.log(data);
    //    socket.emit('action', data);
    //});

    //console.log('Starting game server!');
    //io = new Server(server);

    //io.on("connection", (socket) => {

    //    console.log(`${socket.id} has connected on game server!`);

    //    socket.emit('connected', {
    //        connected: true,
    //        socketId: socket.id,
    //    });

    //    socket.on('connect-room', (data) => {
    //        let room = rooms.find(x => x.name == data.roomName);
    //        if (room == undefined) {
    //            room = {
    //                name: data.roomName,
    //                sockets: []
    //            }
    //            rooms.push(room);
    //        }

    //        if (!room.sockets.find(x => x == socket.id)) {
    //            room.sockets.push(socket.id);
    //        }

    //        if (!socket.rooms.has(data.roomName)) {

    //            socket.join(data.roomName);
    //        }

    //    });

    //    socket.on('create-character', (data) => {
    //        var character = getCharacter({ id: data.characterId, className: data.className, isPlayer: true, isServer: true });
    //        io.sockets.emit('create-character', data);
    //    });

    //    socket.on('action', (data) => {
    //        console.log(data);
    //        socket.emit('action', data);
    //    });

    //});

    //io.on('disconnect', (socket) => {
    //    console.log(`${socket.id} has disconnected from server!`);
    //})

}

const gameServer = {
    startServer: startGameServer,
};

export default gameServer;