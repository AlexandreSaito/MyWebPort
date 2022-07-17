import { GameClient, getController, getCharacter } from './game-client.js';

const p1c = {
	"jump": {
		"keyCode": "w",
	},
	"moveRight": {
		"keyCode": "d",
	},
	"moveLeft": {
		"keyCode": "a",
	},
	"down": {
		"keyCode": "s",
	},
	"basic-attack": {
		"keyCode": " ",
	},
};

const innerGame = document.querySelector('#inner-game');
const canvas = document.querySelector('#canvas-game');
innerGame.appendChild(canvas);
canvas.width = 1280;
canvas.height = 1024;
canvas.style.width = '100%';
canvas.style.height = '100%';

const gc = new GameClient();

await ini();

window.addEventListener('keydown', function (event) {
	gc.receiveKeyListener(event);

});

window.addEventListener('keyup', function (event) {
	gc.receiveKeyListener(event);

});

drawWord();

setInterval(updateWord, 1000 / 60);
setInterval(() => { console.log(frames); frames = 0; }, 1000);

function drawWord() {
	window.requestAnimationFrame(drawWord);

	gc.drawGame();
}

function updateWord() {
	frames++;

	gc.update();
}

async function ini() {
	gc.getDefault();
	await gc.start({ option: 'online' });

	gc.loadController(getController(p1c));
	gc.setContext(canvas);

}