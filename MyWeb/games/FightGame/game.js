//import http from 'http';

export default class Game {
    constructor() {
        this.running = false;

        this.wordSize = { width: 1280, height: 1024 };

        this.characters = [];

        this.drawStatics = [];

        //this.getDefault();
    }

    getDefault() {

    }

    getCharacterById(id) {
        return this.characters.find(char => char.id == id);
    }

    setWordSize({ wordSize }) {
        this.wordSize = wordSize;
    }

    // remove from character list
    removeCharacter(characterId) {
        var index = this.characters.indexOf(this.characters.find((character) => {
            if (character.id == characterId)
                return true;

            return false;
        }));

        if (index == -1)
            return false;

        this.characters.splice(index, 1);

        if (this.player1Id == characterId) {
            this.player1Id = null;
            this.player1Controller = null;
        }

        if (this.player2Id == characterId) {
            this.player2Id = null;
            this.player2Controller = null;
        }

        return true;
    }

    async start({ option }) {
        if (this.running)
            return false;

        this.running = true;
    }

    listenForPlayer(data) {
        console.log(`player ${data.id} said ${data.action}`);
        this.playerActions['die'](data);

    }

    update() {
        if (!this.running)
            return false;

        this.characters.forEach(x => x.update());
    }

    end() {
        if (!this.running)
            return false;

        this.running = false;
    }

}


async function getCharacter({ id, className }) {
	// find by class name the specify json file
	var cj = null;

	//const options = {
	//	hostname: 'localhost',
	//	path: '/games/FightGame/characters.json',
	//	method: 'GET',
	//};

	//var callback = function (response) {
	//	var str = '';
	//	//another chunk of data has been received, so append it to `str`
	//	response.on('data', function (chunk) {
	//		str += chunk;
	//	});

	//	//the whole response has been received, so we just print it out here
	//	response.on('end', function () {
	//		cj = JSON.parse(str).find(x => x[className] != undefined)[className];
	//	});
	//}

	//await http.request(options, callback).end();

	var character;
	var playerData = {
		id: id,
		className: cj.name,
	};

	character = new Player(playerData);


	for (var i = 0; i < cj.imagesToLoad.length; i++) {
		var sprite = cj.imagesToLoad[i];
		var imgId = cj.name + "-" + sprite.name;
		if (document.getElementById(imgId) != undefined)
			continue;

		var image = document.createElement('img');
		image.id = imgId;
		image.src = `${srcFolder}/${sprite.url}`;
		gameImages.appendChild(image);
	}

	for (var i = 0; i < cj.actionImages.length; i++) {
		var sprite = cj.actionImages[i];
		let crSprite = null;
		character.characterSprites.push({
			actionName: sprite.nameAction,
			sprite: crSprite,
		});
	}

	for (var i = 0; i < cj.skills.length; i++) {
		var skill = cj.skills[i];
		var sprite = skill.image;

		let crSprite = null;

		// get image node
		var attack = new Attack({
			skillName: skill.nameSkill,
			actionName: sprite.nameAction,
			width: skill.width,
			height: skill.height,
			castTime: skill.castTime,
			duration: skill.duration,
			damage: skill.damage,
			owner: character,
			sprite: crSprite,
		});

		character.skills.push(attack);
	}

	return character;
}

export { getCharacter };