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
        this.hasAttacked;
        this.normalBody;
        this.canShrink;
        this.shield;
        this.shieldActive;

        //efx
        this.particleManager;
        this.noteEfx;
        this.particleManager = new efxEmitter(this.scene, this, playerAtlas, 'Note')

        this.setup();
        this.playerSet = [this, this.weapon, this.shield];
    }

    update() {
        if (this.canMove) {
            this.playerMovement();
        }
        this.shieldMovement();
        this.weaponMovement();
        this.normalBodyMovement();
    }

    //handles the players basic movement
    playerMovement() {
        //this.weapon.body.velocity.copy(this.body.velocity)
        if (this.scene.controls.w.isDown) {
            if (!this.anims.isPlaying && (this.anims.getCurrentKey() != 'play' || this.anims.getCurrentKey() != 'melee')) {
                this.anims.play('up', false);
            }
            this.setAccelerationY(-playerAccel);
        } else if (this.scene.controls.s.isDown) {
            if (!this.anims.isPlaying && (this.anims.getCurrentKey() != 'play' || this.anims.getCurrentKey() != 'melee')) {
                this.anims.play('down', false);
            }
            this.setAccelerationY(playerAccel);
        } else {
            this.setAccelerationY(0);
            this.setDragY(playerDrag);
        }

        if (this.scene.controls.a.isDown) {
            if (!this.anims.isPlaying && (this.anims.getCurrentKey() != 'play' || this.anims.getCurrentKey() != 'melee')) {
                this.anims.play('left', false);
            }
            this.setFlip(true, false);
            this.setAccelerationX(-playerAccel);
        } else if (this.scene.controls.d.isDown) {
            if (!this.anims.isPlaying && (this.anims.getCurrentKey() != 'play' || this.anims.getCurrentKey() != 'melee')) {
                this.anims.play('right', false);
            }
            this.resetFlip();
            this.setAccelerationX(playerAccel);
        } else {
            this.setAccelerationX(0);
            this.setDragX(playerDrag);
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
            this.anims.play('melee');
            if (this.scene.controls.w.isDown) {
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width*2, this.scene.playerSpriteInfo.height);
                this.weaponOffsetY = -this.scene.playerSpriteInfo.height
            } else if (this.scene.controls.s.isDown) {
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width*2, this.scene.playerSpriteInfo.height);
                this.weaponOffsetY = this.scene.playerSpriteInfo.height;
            } else if (this.scene.controls.a.isDown) {
                this.weapon.body.setSize(this.scene.playerSpriteInfo.width, this.scene.playerSpriteInfo.height*2);
                this.weaponOffsetX = -this.scene.playerSpriteInfo.width;
            } else {
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

    //callback function for pressing jkl keys
    playMusic(musicalNote) {
        console.assert(debugFlags.playerFlag, 'Entered music note callback');
        //this.noteEfx.explode(5, this.x, this.y);
        this.particleManager.generateParticles();
        this.anims.play('play');
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
        let prev = this.noteBar[this.noteBar.length - 1].text;
        for (let i = this.noteBar.length - 1; i > 0; i--) {
            this.noteBar[i].setText(curr);
            curr = prev;
            prev = this.noteBar[i - 1].text;
        }
        this.noteBar[0].setText(curr);
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
            this.noteBar.push(this.scene.add.text((i * noteSize) + uiOffset.x, uiOffset.y, '',noteTextConfig).setOrigin(0).setDepth(uiDepth));
        }
    }

    createHealthBar() {
        this.health = new Health(this.scene, uiOffset.x, 0 + uiOffset.y, 'healthAtlas', 'health4')
        this.healthBar.push(this.health.health);
    }

    createTools() {
        this.weapon = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, null, 0).setOrigin(0.5).setDepth(uiDepth - 1);
        this.scene.physics.add.existing(this.weapon);
        this.weapon.body.setSize(this.scene.playerSpriteInfo.width/2, this.scene.playerSpriteInfo.height/2);
        this.weaponOffsetX = 0;
        this.weaponOffsetY = 0;
        this.isAttacking = false;
        this.hasAttacked = false;

        this.shield = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, 'shield', 0).setOrigin(0.5).setDepth(uiDepth - 1).setAlpha(0);
        this.scene.add.existing(this.shield);
        this.scene.physics.add.existing(this.shield);
        this.shield.setAngularVelocity(100);;
        this.shield.body.setCircle(this.scene.playerSpriteInfo.width);
        this.shield.setScale(2.0);
        this.shieldActive = false;

        this.normalBody = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y, null, 0).setOrigin(0.5).setDepth(uiDepth - 1);
        this.scene.physics.add.existing(this.normalBody);
        this.normalBody.body.setSize(this.scene.playerSpriteInfo.width, this.scene.playerSpriteInfo.height);
        this.normalBody.setImmovable(true);
        this.normalBody.setDebugBodyColor(0x0000ff);
        this.canShrink = true;
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