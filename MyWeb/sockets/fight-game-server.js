import { SocketBranch, registerBranch } from './../webSocketServer.js';

const players = [];

export default function FGIni() {

	const branch = new SocketBranch({ name: 'fg' });

	branch.onConnect = (socket) => {
		if (!players.includes(socket.id))
			players.push(socket.id);

		branch.emit('connect-branch', { connected: true, socketId: socket.id, name: 'fg' });
	};

	branch.addListener('alter-user-name', (data) => {
		branch.emit('alter-user-name', data);
	});

	branch.addListener('get-players', (data, socket) => {
		console.log("getting players");
		console.log(players);
		branch.emit('receive-players', players, [socket.id]);
	});

	branch.addListener('action', (data) => {
		console.log(data);
		branch.emit('action', data);
	});

	branch.addListener('create-character', (data) => {
		//var character = getCharacter({ id: data.characterId, className: data.className, isPlayer: true, isServer: true });
		branch.emit('create-character', data);
	});

	registerBranch(branch);
}