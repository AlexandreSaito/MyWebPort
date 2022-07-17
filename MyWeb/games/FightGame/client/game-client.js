import { Player, Character, Attack } from './../character.js';
import Game from './../game.js';
import { registerListener, getSocket, getSocketId } from './../../../sockets/sockets-client.js';

const srcFolder = '/games/FightGame/src';

const gameImages = document.getElementById("game-images");

class GameClient extends Game {

    getDefault() {
        super.getDefault();

        this.player1Controller = null;
        this.player1Controller = null;

        this.player1Id = null;
        this.player2Id = null;

        this.showCollisions = false;

        this.playerActions = {};

        this.socket = null;

        this.#addBackground();
        this.#setPlayerActions();

        this.ctx = null;
    }

    #receiveKeyListenerForPlayer(controller, playerId, event) {
        var moves = controller.constructor.getOwnPropertyNames(controller);
        var move = moves.find(x => controller[x].keyCode.toUpperCase() == event.key.toUpperCase());

        if (move != undefined && controller[move].action != undefined) {
            var character = this.getCharacterById(playerId);
            if (character == undefined) {
                return;
            }
            let oldKeys = JSON.parse(JSON.stringify(character.keys));
            controller[move].action(event, character);
            character.update();
            if (character.keys == oldKeys) {
                return;
            }
            emitAction(this.socket, {
                characterId: character.id,
                action: {
                    name: move,
                    keys: character.keys,
                    position: character.position,
                    moveDirection: character.moveDirection,
                }
            });
        }
    }

    #addBackground() {
        const backgroundImage = new Image();
        backgroundImage.src = `${srcFolder}/ambient/bc-game.png`;

        this.drawStatics.push(new Sprite({
            name: 'background',
            position: { x: 0, y: 0 },
            image: backgroundImage,
            imagePosition: { x: 0, y: 0 },
            imageWidth: backgroundImage.width,
            imageHeight: backgroundImage.height,
            drawWidth: this.wordSize.width,
            drawHeight: this.wordSize.height,
            frameHolder: 999,
            frameMax: 1,
            drawIndex: -999,
        }));
    }

    #setPlayerActions() {
        this.playerActions = {
            die: (data) => {
                this.removeCharacter(data.id);
            },
            checkColisionWithPlayers: (data) => {
                checkColision(p1.position, p2.position);
            },
        };
    }

    async #startSocket() {
        var socket = getSocket('fg');
        var game = this;

        socket.listen('connect-branch', async (data) => {
            if (game.socketId == undefined)
                game.socketId = getSocketId();
            
            if (data.socketId == game.socketId) {
                data.connected = true;

                var playerChar = await getCharacter({
                    id: game.socketId == undefined ? 'player' : game.socketId,
                    className: 'default',
                    isPlayer: true
                });

                socket.emitBranch('create-character', { characterId: playerChar.id, className: playerChar.className });
                game.addCharacter({ character: playerChar });
            }
            console.log(`connected on fg: ${data.socketId}`);

        });

        socket.listen('receive-players', (data) => {
            console.log("received players");
            console.log(data);
        });

        socket.listen('alter-user-name', (data) => {
            console.log(data);
        });

        socket.listen('create-character', async (data) => {
            if (data.characterId == game.socketId)
                return;

            var char = await getCharacter({
                id: data.characterId,
                className: data.className,
                isPlayer: false
            });

            game.addCharacter({ character: char });
        });

        socket.listen('action', (data) => {
            console.log(`${data.characterId} is doing ${data.action.name} ${data.action.keys.moveRight.pressed}`);
            if (data.characterId == game.socketId)
                return;

            var character = game.getCharacterById(data.characterId);
            if (character != undefined) {
                if (data.action.name != "att") {
                    if (data.action.keys.moveRight.pressed == false && data.action.keys.moveLeft.pressed == false)
                        data.action.moveDirection = 0;
                    character.moveDirection = data.action.moveDirection;
                }
                character.position = data.action.position;
            }
        });

        socket.listen('action', (data) => {
            console.log(data);
        });

        setTimeout(() => { socket.emitRoot('connect-branch', { name: 'fg' }); /*socket.emitBranch('get-players', {});*/ }, 200);

        this.socket = socket;
    }

    setContext(canvas) {
        this.ctx = canvas.getContext('2d');
    }

    loadController(controller, isPlayer2) {
        if (isPlayer2) {
            this.player2Controller = controller;
            return true;
        }

        this.player1Controller = controller;
        return true;
    }

    // add player at character list
    addCharacter({ character, isPlayer2 }) {
        if (character.constructor.name == 'Player') {
            if (isPlayer2) {
                if (this.player2Id != null) {
                    console.error('Player 2 já adicionado');
                    return false;
                }
                this.player2Id = character.id + '-p2';
                return;
            }

            if (this.player1Id != null) {
                console.error('Player 1 já adicionado');
                return false;
            }
            this.player1Id = character.id;
        }

        character.wordListener.push((data) => {
            this.playerActions[data.action](data);
        });

        this.characters.push(character);
    }

    // load necessarie things
    async start({ option }) {
        if (this.running)
            return false;

        this.running = true;

        if (option == 'vs-IA') {

        }

        if (option == 'vs-p2') {

        }

        if (option == 'online') {
            await this.#startSocket();
        }
    }

    handleUI() {

    }

    updateState() {

    }

    receiveKeyListener(event) {
        if (!this.running)
            return false;

        if (this.player1Controller != null) {
            this.#receiveKeyListenerForPlayer(this.player1Controller, this.player1Id, event);
        }

        if (this.player2Controller != null) {
            this.#receiveKeyListenerForPlayer(this.player2Controller, this.player2Id, event);
        }
    }

    update() {
        super.update();

        //var character = this.getCharacterById(this.player1Id);
        //emitAction(this.socket, {
        //    characterId: character.id,
        //    action: {
        //        name: "att",
        //        keys: character.keys,
        //        position: character.position,
        //        moveDirection: character.moveDirection,
        //    }
        //});
    }

    drawGame() {
        if (!this.running)
            return false;

        this.ctx.clearRect(0, 0, this.wordSize.width, this.wordSize.height);

        var ctx = this.ctx;

        this.drawStatics.forEach(x => x.draw(ctx, {}));
        this.characters.forEach(x => x.draw(ctx, { showCollisions: this.showCollisions }));
    }

}

class Sprite {
    constructor({ name, position, image, imagePosition, imageWidth, imageHeight, drawWidth, drawHeight, frameHolder = 2, frameMax = 1, drawIndex = 1 }) {
        this.name = name;

        this.position = position;
        this.imagePosition = imagePosition;

        if (typeof image == 'string')
            image = new Image(image);

        this.image = image;

        if (imageWidth == undefined || imageWidth == null)
            imageWidth = this.image.width;
        if (imageHeight == undefined || imageHeight == null)
            imageHeight = this.image.height;

        this.imgWidth = imageWidth;
        this.imgHeight = imageHeight;

        this.drawWidth = drawWidth;
        this.drawHeight = drawHeight;

        this.drawIndex = drawIndex;

        this.frameHolder = frameHolder;
        this.frameMax = frameMax;

        this.frameHolding = 0;
        this.currentFrame = 0;
    }

    draw(ctx, { lookDirection = 1 }) {
        this.lookDirection = lookDirection;
        if (this.frameHolding >= this.frameHolder && this.frameMax > 1) {
            this.frameHolding = 0;
            this.currentFrame++;
        }

        if (this.currentFrame >= this.frameMax)
            this.currentFrame = 0;

        var posX = this.position.x;
        var posY = this.position.y;

        ctx.save();
        if (this.lookDirection == -1) {
            ctx.scale(-1, 1);
            posX = this.position.x * -1 - this.drawWidth;
            posY = this.position.y;
        }

        ctx.drawImage(
            this.image, // image
            this.imagePosition.x + (this.imgWidth * this.currentFrame), this.imagePosition.y, this.imgWidth, this.imgHeight, // sheeting image
            posX, posY, this.drawWidth, this.drawHeight // position on canvas
        );
        ctx.restore();


        this.frameHolding++;
    }

    reset() {
        this.frameHolding = 0;
        this.currentFrame = 0;
    }
}

function getController(controller) {
    if (typeof controller == 'string') {
        controller = JSON.parse(controller);
    }

    controller.moveRight.action = (event, character) => {
        if (event.type == 'keydown') {
            character.keys.moveRight.pressed = true;
            character.lastMoveAction = 'moveRight';
            return;
        }

        if (event.type == 'keyup') {
            character.keys.moveRight.pressed = false;
        }
    };

    controller.moveLeft.action = (event, character) => {
        if (event.type == 'keydown') {
            character.keys.moveLeft.pressed = true;
            character.lastMoveAction = 'moveLeft';
            return;
        }

        if (event.type == 'keyup') {
            character.keys.moveLeft.pressed = false;
        }
    };

    controller.down.action = (event, character) => {
        if (event.type == 'keydown') {
            character.keys.down.pressed = true;
            return;
        }

        if (event.type == 'keyup') {
            character.keys.down.pressed = false;
        }
    };

    controller.jump.action = (event, character) => {
        if (event.type == 'keydown') {
            character.keys.jump.pressed = true;
            character.jump();
            return;
        }

        if (event.type == 'keyup') {
            character.keys.jump.pressed = false;
        }
    }

    return controller;
}

function emitAction(socket, action) {
    if (socket == undefined || socket == null)
        return;

    socket.emitBranch('action', action);
}

async function getCharacter({ id, className, isPlayer = false, isServer = false }) {
    console.log({ id, className, isPlayer });
    // find by class name the specify json file
    var cj = null;

    await fetch('/games/FightGame/characters.json')
        .then(async (res) => {
            await res.json()
                .then((json) => { cj = json.find(x => x[className] != undefined)[className] });
        });

    var character;
    var playerData = {
        id: id,
        className: cj.name,
    };

    if (isPlayer) {
        character = new Player(playerData);
    } else {
        character = new Character(playerData);
    }


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
        if (!isServer) {
            // get image node
            var image = document.getElementById(cj.name + "-" + sprite.nameImage);

            crSprite = new Sprite({
                name: sprite.nameAction,
                position: sprite.position,
                image: image,
                imagePosition: sprite.imagePosition,
                imageWidth: sprite.imageWidth,
                imageHeight: sprite.imageHeight,
                drawWidth: sprite.drawWidth,
                drawHeight: sprite.drawHeight,
                frameHolder: sprite.frameHolder,
                frameMax: sprite.frameMax,
                drawIndex: sprite.drawIndex,
            });
        }

        character.characterSprites.push({
            actionName: sprite.nameAction,
            sprite: crSprite,
        });
    }

    for (var i = 0; i < cj.skills.length; i++) {
        var skill = cj.skills[i];
        var sprite = skill.image;

        let crSprite = null;
        if (!isServer) {
            crSprite = new Sprite({
                name: sprite.nameAction,
                position: sprite.position,
                image: image,
                imagePosition: sprite.imagePosition,
                imageWidth: sprite.imageWidth,
                imageHeight: sprite.imageHeight,
                drawWidth: sprite.drawWidth,
                drawHeight: sprite.drawHeight,
                frameHolder: sprite.frameHolder,
                frameMax: sprite.frameMax,
                drawIndex: sprite.drawIndex,
            });
        }
        // get image node
        var image = document.getElementById(cj.name + "-" + sprite.nameImage);
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

export { GameClient, Sprite, getController, getCharacter };