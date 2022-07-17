import { createPage } from './pages.js';

const gameFolder = './games';
 
const index = createPage({
    name: 'game',
    headerTitle: 'Fight Game',
    pagesFolder: `${gameFolder}/FightGame`,
    replaces: [
        {
            name: '[FightGameFolder]',
            new: `/games/FightGame`,
        },
        {
            name: '[FightGameSource]',
            new: `/games/FightGame/src`,
        },
    ],
    csss: [
        '<link rel="stylesheet" href="[FightGameFolder]/client/game.css">',
    ],
    jss: [
        '<script type="module" src="[FightGameFolder]/client/game.ini.js"></script>',
    ],
});

export { index };