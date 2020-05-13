class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);
        this.setCollideWorldBounds(true);
        this.setMaxVelocity(playerMaxVelocity);
        this.setOrigin(0.5);
        this.setDepth(uiDepth - 1);

        this.scene = scene;
        this.canCollide = true;

        //add listeners for music playing
        this.scene.controls.h.addListener('down', this.playMusic, this);
        this.scene.controls.j.addListener('down', this.playMusic, this);
        this.scene.controls.k.addListener('down', this.playMusic, this);
        this.scene.controls.l.addListener('down', this.playMusic, this);
        this.scene.controls.i.addListener('down', this.playMusic, this);

        //notebar setup
        this.noteBar = [];
        this.createNoteBar();

        this.weapon = new Phaser.Physics.Arcade.Sprite(scene, this.x, this.y, texture = null, frame = 0).setOrigin(0.5).setDepth(uiDepth - 1);
        scene.physics.add.existing(this.weapon);
        this.weapon.body.setSize(scene.playerSpriteInfo.width/2, scene.playerSpriteInfo.height/2);
        this.weaponOffsetX = 0;
        this.weaponOffsetY = 0;
        this.isAttacking = false;
        this.canShrink = true;
    }

    update() {
        this.playerMovement();
        this.weaponMovement();
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
            this.setAccelerationX(-playerAccel);
        } else if (this.scene.controls.d.isDown) {
            if (!this.anims.isPlaying && (this.anims.getCurrentKey() != 'play' || this.anims.getCurrentKey() != 'melee')) {
                this.anims.play('right', false);
            }
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

    //callback function for pressing jkl keys
    playMusic(musicalNote) {
        console.assert(debugFlags.playerFlag, 'Entered music note callback');
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

    createNoteBar() {
        for (let i = 0; i < noteQueueSize; i++) {
            this.noteBar.push(this.scene.add.text(i * noteSize, this.scene.heartInfo.height, '',noteTextConfig).setOrigin(0).setDepth(uiDepth).setScrollFactor(0));
        }
    }
}