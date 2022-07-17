import chatIni from './chat.js';
import FGIni from './fight-game-server.js';

function startAllSocketModules() {
    chatIni();
    FGIni();
}

function startSocketModules(modules) {

}

export { startAllSocketModules, startSocketModules };