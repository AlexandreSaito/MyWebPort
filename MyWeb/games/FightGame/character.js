class Character {
	constructor({ id, position = { x: 0, y: 0 }, starterDirection = 1, gameDef = { width: 1280, height: 1024 }, className = 'default' }) {
		this.gameDef = gameDef;

		this.id = id;

		this.className = className;

		this.position = position;

		this.lookDirection = starterDirection;

		this.characterSprites = [];

		// refatorar skills
		this.skills = [];

		this.currentAnimation = null;
		this.currentAnimationName = 'idle';

		this.wordListener = [];

		this.getDefaults();
	}

	getDefaults() {
		// definitions
		this.width = 50;
		this.height = 100;

		// status
		this.health = 100;

		this.gravity = 0.6;
		this.velocity = { x: 1, y: 10 };
		this.jumpForce = -50;
		this.jumpCanCount = 1;

		// tempo do pulo em milisecond
		this.jumpTime = 100;
		// tempo do ataque em milisecond
		this.attackLength = 250;
		// tempo invulneravel em milisecond
		this.invulnerableTime = 100;

		// current
		this.currentHealth = 100;

		this.currentVelocity = { x: 10, y: 1 };
		this.moveDirection = 0;
		this.lookDirection = 1;
		this.jumpCount = 0;

		this.isJumping = false;
		this.isAttacking = false;
		this.isInvulnerable = false;

		this.dying = false;
		this.dyingTime = 1000;
	}

	loadCharacter({ characterClass }) {
		this.className == characterClass.name;
		this.sprites = sprites;
	}

	sendToWord(data) {
		this.wordListener.forEach(x => x(data));
	}

	draw(ctx, { showCollisions = false }) {
		if (this.currentAnimation == null || this.currentAnimation.actionName != this.currentAnimationName) {
			this.currentAnimation = this.characterSprites.find(x => x.actionName == this.currentAnimationName);
			if (this.currentAnimation == undefined) {
				console.error(`missing animation ${this.currentAnimationName} on ${this.className}, character ID: ${this.id}`);
				return;
			}
			this.currentAnimation.sprite.reset();
		}

		this.currentAnimation.sprite.position = this.position;

		this.currentAnimation.sprite.draw(ctx, { lookDirection: this.lookDirection });

		if (showCollisions) {
			ctx.fillStyle = '#ffff0080';
			ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
		}
	}

	update() {
		this.gravityEffect();

		var currentVel = this.currentVelocity.x;

		if (this.isAttacking) {
			currentVel = currentVel / 2;
		}

		this.position.x += this.moveDirection * currentVel;

		if (this.position.x + this.width >= this.gameDef.width)
			this.position.x = this.gameDef.width - this.width;

		if (this.position.x <= 0)
			this.position.x = 0;

		if (this.isJumping) {
			this.position.y += this.jumpForce;
		}

		if (!this.isAttacking && !this.isJumping) {
			this.currentAnimationName = this.moveDirection == 0 ? 'idle' : 'walking';
		}

		//console.log(`character ${this.id} is on position: ${this.position.x} ${this.position.y} and looking at ${this.lookDirection}`);
	}

	jump() {
		if (this.jumpCount >= this.jumpCanCount)
			return;

		this.spriteFrameIndex = 0;
		this.isJumping = true;
		this.jumpCount += 1;
		this.currentAnimationName = 'jumping';
		setTimeout(() => { this.isJumping = false; }, this.jumpTime);
	}

	attack({ attackName }) {
		var action = this.skills.find(x => x.actionName == attackName);

		if (action == undefined) {
			return false;
		}

		this.currentAction = action.ownerAction;

	}

	takeDamage({ damage }) {
		console.log(`${this.id} is receiving ${damage} of damage.`);

		this.currentHealth -= damage;

		if (this.currentHealth <= 0) {
			this.die();
		}

		if (this.currentHealth >= this.health) {
			this.currentHealth = this.health;
		}
	}

	die() {
		this.currentAnimationName = 'dieing';
		this.sendToWord({ id: this.id, action: 'die' });
	}

	gravityEffect() {
		this.position.y += this.currentVelocity.y;

		if (this.position.y + this.currentVelocity.y + this.height >= this.gameDef.height) {
			this.currentVelocity.y = 0;
			this.position.y = (this.gameDef.height - this.height);
			this.jumpCount = 0;
			return;
		}

		if (this.currentVelocity.y == 0) {
			this.currentVelocity.y = this.velocity.y;
		}

		this.currentVelocity.y += this.gravity;

	}

}

class Player extends Character {

	getDefaults() {
		super.getDefaults();

		this.keys = {
			jump: {
				pressed: false
			},
			moveLeft: {
				pressed: false
			},
			down: {
				pressed: false
			},
			moveRight: {
				pressed: false
			}
		};

		this.lastMoveAction = '';

		this.drawIndex = 200;
		// for debug
		this.color = '#0000ff7a';
	}

	update() {
		super.update();

		this.moveDirection = 0;

		if (this.keys.moveLeft.pressed && (this.lastMoveAction == 'moveLeft')) {
			this.moveDirection = -1;
			if (this.position.x <= 0) {
				this.moveDirection = 0;
			}
		} else if (this.keys.moveRight.pressed && (this.lastMoveAction == 'moveRight')) {
			this.moveDirection = 1;
			if (this.position.x + this.width >= this.gameDef.width) {
				this.moveDirection = 0;
			}
		}

		if (this.moveDirection != 0) {
			if (!this.isAttacking) {
				this.lookDirection = this.moveDirection;
			}
		}

	}
}

class Attack {
	constructor({ skillName, actionName, width, height, duration, damage, owner, sprite }) {
		this.skillName = name;
		this.actionName = actionName;

		this.owner = owner;
		this.position = this.owner.position;

		this.ownerAction = sprite.name;

		this.sprite = sprite;

		this.width = width;
		this.height = height;

		this.duration = duration;

		this.target = false;
		this.targetStopOnAlredyHitted = true;

		this.wave = true;

		this.damage = damage;

		this.isAttacking = false;

		this.reset();
	}

	reset() {
		this.hitted = [];
		this.directionPos = { x: 0, y: 0 };
		this.getDefaultPos();
	}

	getDefaultPos() {
		this.currentPosX = this.position.x;
		this.currentPosY = this.position.y;
		this.currentWidth = this.width;
		this.currentHeight = this.height;
	}

	setPosition() {
		this.getDefaultPos();

		if (this.directionPos.x != 0) {
			if (this.directionPos.x > 0) {
				this.currentPosX = this.position.x;
			}
			if (this.directionPos.x < 0) {
				this.currentPosX = this.position.x + (this.owner.width * -1);
			}
		}
	}

	draw(ctx, { showCollisions = false }) {

		if (this.sprite != null) {
			this.sprite.draw(ctx, {});
		}

		if (showCollisions) {
			ctx.fillStyle = "#44ff9894";
			ctx.fillRect(this.currentPosX, this.currentPosY, this.currentWidth, this.currentHeight);
		}
	}

}

export { Player, Character, Attack };