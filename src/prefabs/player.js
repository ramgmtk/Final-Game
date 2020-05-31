class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0, particleFrame = 0) {
        super(scene, x, y, texture, frame);
        this.scene = scene;

        this.canCollide = true;
        this.canMove = true;
        
        //notebar setup
        this.noteBar;

        //health
        this.healthBar = [];
        this.health;

        //weapons
        this.weapon;
        this.weaponOffsetX;
        this.weaponOffsetY;
        this.isAttacking;
        this.attackDirection;
        this.hasAttacked;
        this.normalBody;
        this.canShrink;
        this.shield;
        this.shieldMeter;
        this.shieldActive;
        this.reverseRange;

        //efx
        this.particleManager;
        this.noteEfx;
        this.particleManager = new efxEmitter(this.scene, this, playerAtlas, 'Note')

        this.setup();
        this.playerSet = [this, this.weapon, this.shield];

        this.anims.play('idle');
    }

    update() {
        this.playerMovement();
        this.shieldMovement();
        this.weaponMovement();
        this.normalBodyMovement();
        this.reverseRangeMovement();
    }

    damagePlayer() {
        this.health.updateHealth();
        this.scene.time.delayedCall(this.scene.bpms * 6, () => {
            this.canCollide = true;
        }, null, this);
        this.alphaTween.play();
        this.scaleTween = this.scene.tweens.add({ //needs to be done at runtime cause player scale does change
            targets: this,
            paused: true,
            scale: {from: this.scale, to: this.scale + 0.2},
            duration: this.scene.bpms,
            repeat: 6,
            onComplete: () => {
                if (this.canShrink) {
                    this.setScale(1.0);
                } else {
                    this.setScale(0.5);
                };
            },
            onCompleteScope: this,
        });
        this.scaleTween.play();
        this.healthTween.play();
    }


    //handles the players basic movement
    playerMovement() { //BECAUSE I FORGOT DISCREET MATH, THE IF ELSES IN THIS BLOCK ARE SLOPPY.
        //this.weapon.body.velocity.copy(this.body.velocity)
        if (this.scene.controls.w.isDown || this.scene.controls.a.isDown || this.scene.controls.s.isDown || this.scene.controls.d.isDown) {
            if (this.scene.controls.w.isDown && this.canMove) {
                if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
                } else {
                    this.setFlipY(false);
                    this.anims.play('up', true);
                }
                this.attackDirection = 'w';
                this.setAccelerationY(-playerAccel);
            } else if (this.scene.controls.s.isDown && this.canMove) {
                if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
                } else {
                    this.setFlipY(false);
                    this.anims.play('down', true);
                }
                this.attackDirection = 's';
                this.setAccelerationY(playerAccel);
            } else {
                if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
                } else {
                    this.setFlipY(false);
                    //this.anims.play('idle', true);
                };
                this.setAccelerationY(0);
                this.setDragY(playerDrag);
            }

            if (this.scene.controls.a.isDown && this.canMove) {
                if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
                } else {
                    this.anims.play('right', true);
                }
                this.setFlip(true, false);
                this.attackDirection = 'a';
                this.setAccelerationX(-playerAccel);
            } else if (this.scene.controls.d.isDown && this.canMove) {
                if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
                } else {
                    this.anims.play('right', true);
                }
                this.attackDirection = 'd';
                //this.resetFlip();
                this.setFlip(false, false);
                this.setAccelerationX(playerAccel);
            } else {
                if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
                } else {
                    //this.anims.play('idle', true);
                    this.setFlipY(false);
                }
                this.setAccelerationX(0);
                this.setDragX(playerDrag);
            }
        } else {
            this.setAcceleration(0);
            this.setDrag(playerDrag);
            if (this.anims.isPlaying && (this.anims.getCurrentKey() == 'play' || this.anims.getCurrentKey() == 'melee' || this.anims.getCurrentKey() == 'meleeUp')) {
                    //do nothing,
            } else {
                //this.anims.play('idle', true);
                this.anims.play('idle', true);
                this.setFlipY(false);
            }
        }
    }

    weaponMovement() {
        //Source code referenced for weapon placement:
        //https://codepen.io/samme/pen/ExYGRyo?editors=0010
        //Courtesy of user: samme https://phaser.discourse.group/t/arcade-physics-create-one-sprite-with-multiple-collision-bodies-compounded-sprite/3773
        if (Phaser.Input.Keyboard.JustDown(this.scene.controls.f)) {
            this.isAttacking = true;
            this.hasAttacked = false;
            console.assert(debugFlags.playerFlag, 'Performing melee attack');
            this.weaponOffsetX = 0;
            this.weaponOffsetY = 0
            if (this.attackDirection == 'w') {
                this.anims.play('meleeUp', false);
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width*2, this.scene.playerSpriteInfo.height);
                this.weaponOffsetY = -this.scene.playerSpriteInfo.height
            } else if (this.attackDirection == 's') {
                this.anims.play('meleeUp', false);
                this.setFlipY(true);
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width*2, this.scene.playerSpriteInfo.height);
                this.weaponOffsetY = this.scene.playerSpriteInfo.height;
            } else if (this.attackDirection == 'a') {
                this.anims.play('melee', false);
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width, this.scene.playerSpriteInfo.height*2);
                this.weaponOffsetX = -this.scene.playerSpriteInfo.width;
            } else {
                this.anims.play('melee', false);
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width, this.scene.playerSpriteInfo.height*2);
                this.weaponOffsetX = this.scene.playerSpriteInfo.width;
            }
        } else if (!this.anims.isPlaying || this.anims.getCurrentKey() != 'melee') {
            this.weapon.body.setSize(this.scene.playerSpriteInfo.width/2, this.scene.playerSpriteInfo.height/2)
            this.weaponOffsetX = 0;
            this.weaponOffsetY = 0;
            this.isAttacking = false;
        }
        this.weapon.body.x = this.body.x + this.body.halfWidth - this.weapon.body.halfWidth + this.weaponOffsetX;
        this.weapon.body.y = this.body.y + this.body.halfHeight - this.weapon.body.halfHeight + this.weaponOffsetY;
    }

    shieldMovement() {
        this.shield.body.x = this.body.x + this.body.halfWidth - this.shield.body.halfWidth;
        this.shield.body.y = this.body.y + this.body.halfHeight - this.shield.body.halfHeight;
    }

    normalBodyMovement() {
        this.normalBody.body.x = this.body.x + this.body.halfWidth - this.normalBody.body.halfHeight;
        this.normalBody.body.y = this.body.y + this.body.halfHeight - this.normalBody.body.halfHeight;
    }

    reverseRangeMovement() {
        this.reverseRange.body.x = this.body.x + this.body.halfWidth - this.reverseRange.body.halfHeight;
        this.reverseRange.body.y = this.body.y + this.body.halfHeight - this.reverseRange.body.halfHeight;
    }

    //callback function for pressing jkl keys
    playMusic(musicalNote) {
        console.assert(debugFlags.playerFlag, 'Entered music note callback');
        //this.noteEfx.explode(5, this.x, this.y);
        this.particleManager.generateParticles();
        this.setFlipY(false);
        this.anims.play('play', false);
        switch(musicalNote.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.H:
                this.scene.musicalNoteE.play();
                this.addNotes('h');
                break;
            case Phaser.Input.Keyboard.KeyCodes.J:
                this.scene.musicalNoteF.play();
                this.addNotes('j');
                break;
            case Phaser.Input.Keyboard.KeyCodes.K:
                this.scene.musicalNoteG.play();
                this.addNotes('k');
                break;
            case Phaser.Input.Keyboard.KeyCodes.L:
                this.scene.musicalNoteA.play();
                this.addNotes('l');
                break;
            case Phaser.Input.Keyboard.KeyCodes.I:
                this.scene.musicalNoteFS.play();
                this.addNotes('i');
                break;
        }
    }

    //simulates a queue-like behavior for adding notes to the bar.
    addNotes(note) {
        //array.shift can shift elements, but destroys some elements.
        let curr = note;
        let prev = this.noteBar[this.noteBar.length - 2].frame.name;
        for (let i = this.noteBar.length - 2; i > 0; i--) {
            if (curr == '__BASE' || curr == 'Note') {
                this.noteBar[i].setTexture(null, null).setAlpha(0)
            } else {
                this.noteBar[i].setTexture('keyAtlas', curr).setAlpha(1);
            }
            curr = prev;
            prev = this.noteBar[i - 1].frame.name;
        }
        if (curr == '__BASE' || curr == 'Note') {
            this.noteBar[0].setTexture(null, null).setAlpha(0)
        } else {
            this.noteBar[0].setTexture('keyAtlas', curr).setAlpha(1);
        }
    }

    addNoteListeners() {
        this.scene.controls.h.addListener('down', this.playMusic, this);
        this.scene.controls.j.addListener('down', this.playMusic, this);
        this.scene.controls.k.addListener('down', this.playMusic, this);
        this.scene.controls.l.addListener('down', this.playMusic, this);
        this.scene.controls.i.addListener('down', this.playMusic, this);
    }
    createNoteBar() {
        this.noteBar = [];
        for (let i = 0; i < noteQueueSize; i++) {
            this.noteBar.push(this.scene.add.image((i * noteSize) + uiOffset.x, uiOffset.y, null, null).setOrigin(0).setDepth(uiDepth).setAlpha(0));
        }
        this.noteBar.push(this.scene.add.image(uiOffset.x, uiOffset.y, 'Note Bar', null).setOrigin(0).setDepth(uiDepth - 1));
    }

    clearNoteBar() {
        for (let i = 0; i < this.noteBar.length - 1; i++) {
            //this.noteBar[i].setTexture(null, null,).setAlpha(0);
            this.noteBar[i].setTexture(playerAtlas, 'Note');
            this.scene.tweens.add({
                targets: this.noteBar[i],
                scale: {from: 1, to: 0},
                onComplete: () => {
                    this.noteBar[i].setScale(1);
                    if (this.noteBar[i].frame.name == 'Note') {
                        this.noteBar[i].setTexture(null, null,).setAlpha(0);
                    }
                },
                onCompleteScope: this,
                duration: this.scene.bpms,
            });
        }
    }

    createHealthBar() {
        this.health = new Health(this.scene, uiOffset.x + this.scene.heartInfo.width/2, uiOffset.y + this.scene.heartInfo.height / 2, 'healthAtlas', 'health4')
        this.healthBar.push(this.health.health);
        this.alphaTween = this.scene.tweens.add({
            targets: this,
            paused: true,
            alpha: {from: 0, to: 1},
            duration: this.scene.bpms,
            repeat: 6,
            onComplete: () => {
                this.setAlpha(1.0);
            },
            onCompleteScope: this,
        });
        this.healthTween = this.scene.tweens.add({
            targets: this.health.health,
            paused: true,
            //angle: {from: 0, to: 360},
            scale: {from: 1, to: 0},
            duration: this.scene.bpms,
            repeat: 4,
            onComplete: () => {
                this.health.health.setScale(1.0);
            },
            onCompleteScope: this,
        });
    }

    createTools() {
        this.weapon = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, null, 0).setOrigin(0.5).setDepth(uiDepth - 1);
        this.scene.physics.add.existing(this.weapon);
        this.weapon.body.setSize(this.scene.playerSpriteInfo.width/2, this.scene.playerSpriteInfo.height/2);
        this.weapon.setImmovable(true);
        this.weaponOffsetX = 0;
        this.weaponOffsetY = 0;
        this.attackDirection = 'd';
        this.isAttacking = false;
        this.hasAttacked = false;

        this.shield = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, 'shield', 0).setOrigin(0.5).setDepth(uiDepth - 1).setAlpha(0);
        this.scene.add.existing(this.shield);
        this.scene.physics.add.existing(this.shield);
        //this.shield.setAngularVelocity(100);
        this.shield.body.setCircle(this.scene.playerSpriteInfo.width * 2);
        this.shield.setImmovable(true);
        this.shieldActive = false;
        this.shieldMeter = new ShieldMeter(this.scene, 100, this);

        this.normalBody = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, null, 0).setOrigin(0.5).setDepth(uiDepth - 1);
        this.scene.physics.add.existing(this.normalBody);
        this.normalBody.body.setSize(this.scene.playerSpriteInfo.width, this.scene.playerSpriteInfo.height);
        this.normalBody.setImmovable(true);
        this.normalBody.setDebugBodyColor(0x0000ff);
        this.canShrink = true;

        this.reverseRange = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, null, 0).setOrigin(0.5).setDepth(uiDepth - 1);
        this.scene.physics.add.existing(this.reverseRange);
        this.reverseRange.setImmovable(true);
        this.reverseRange.body.setCircle(this.scene.playerSpriteInfo.width * 6);
        this.reverseRange.setDebugBodyColor(0xffffff);
    }

    createEFX(zoom = 1) {
        this.particleManager = this.scene.add.particles(playerAtlas, 'Note');
        this.noteEfx = this.particleManager.createEmitter({
            speed: 50,
            frequency: -1,
            alpha: {start: 1, end: 0},
            start: {start: 0.1, end: 1},
            lifespan: 2000,
        });
        this.noteEfx.startFollow(this);
    }

    setup() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setImmovable(true);
        this.setCollideWorldBounds(true);
        this.setMaxVelocity(playerMaxVelocity);
        this.setOrigin(0.5);
        this.setDepth(uiDepth - 1);
        //
        
        this.addNoteListeners();
        this.createNoteBar();
        this.createHealthBar();
        this.createTools();
        //this.createEFX();
    }
}