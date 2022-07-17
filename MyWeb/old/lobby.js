const socketIO = require("socket.io");

const players = [];
const lobbys = [];

class PlayerHandler {
    constructor({ idPlayer, idLobby }) {
        this.idPlayer = idPlayer;
        this.idLobby = idLobby;
    }
}

class LobbyHandler {
    constructor({ idLobby }) {
        this.idLobby = idLobby;
        this.idPlayers = [];
    }

    addPlayer(idPlayer) {
        this.idPlayers.push(idPlayer);
    }

    removePlayer(idPlayer) {
        var index = this.idPlayers.indexOf(idPlayer);
        if (index >= 0)
            this.idPlayers.splice(index, 1);
    }
};

module.exports = {
    startServer: function (server) {
        const io = socketIO(server);

        io.on("connection", (socket) => {
            var player = new PlayerHandler({
                idPlayer: players.length,
                idLobby: 0
            });

            players.push(player);

            socket.emit('connected', {
                connected: true,
                playerId: player.idPlayer,
            });

            socketLobby(socket);
            socketPlayerInGame(socket);

        });
    },

}

function getLobbysId() {
    var ids = [];
    lobbys.forEach(x => { ids.push(x.idLobby); });
    return ids;
}

function socketLobby(socket) {
    socket.on('create-lobby', function (o) {
        var lobby = new LobbyHandler({
            idLobby: lobbys.length,
        });

        lobby.addPlayer(o.idPlayer);

        lobbys.push(lobby);

        players.find(x => x.idPlayer == o.idPlayer).idLobby = lobby.idLobby;

        socket.emit('lobby-created', lobby);
        socket.emit('list-lobby', getLobbysId());
    });

    socket.on('get-list-lobby', function () {
        socket.emit('list-lobby', getLobbysId());
    });

    socket.on('join-lobby', function (o) {
        var lobby = lobbys.find(x => x.idLobby == o.idLobby);
        lobby.addPlayer(o.idPlayer);
    });

    socket.on('leave-lobby', function (o) {
        var lobby = lobbys.find(x => x.idLobby == o.idLobby);
        lobby.removePlayer(o.idPlayer);
        if (lobby.idPlayers.length == 0) {
            // deletar lobby
        }
    });
}

function socketPlayerInGame(socket) {
    socket.on('player-move', function (o) {
        console.log(o);
    });
}
