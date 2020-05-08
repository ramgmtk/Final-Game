class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);
        this.setCollideWorldBounds(true);
        this.setMaxVelocity(playerMaxVelocity);

        this.scene = scene;

        //add listeners for music playing
        this.scene.controls.j.addListener('down', this.playMusic, this);
        this.scene.controls.k.addListener('down', this.playMusic, this);
        this.scene.controls.l.addListener('down', this.playMusic, this);
    }

    update() {
        this.playerMovement();
    }

    //handles the players basic movement
    playerMovement() {
        if (this.scene.controls.w.isDown) {
            if (!this.anims.isPlaying || this.anims.getCurrentKey() != 'play') {
                this.anims.play('up', false);
            }
            /*if (Phaser.Input.Keyboard.JustUp(this.scene.controls.s)) {
                this.setVelocityY(playerMaxVelocity * 0.5);
            }*/
            this.setAccelerationY(-playerAccel);
        } else if (this.scene.controls.s.isDown) {
            if (!this.anims.isPlaying || this.anims.getCurrentKey() != 'play') {
                this.anims.play('down', false);
            }
            /*if (Phaser.Input.Keyboard.JustUp(this.scene.controls.w)) {
                this.setVelocityY(-playerMaxVelocity * 0.5);
            }*/
            this.setAccelerationY(playerAccel);
        } else {
            this.setAccelerationY(0);
            this.setDragY(playerDrag);
        }

        if (this.scene.controls.a.isDown) {
            console.assert(debugFlag, 'a');
            if (!this.anims.isPlaying || this.anims.getCurrentKey() != 'play') {
                this.anims.play('left', false);
            }
            /*if (Phaser.Input.Keyboard.JustUp(this.scene.controls.d)) {
                console.assert(debugFlag, 'testing drag a');
                this.setVelocityX(playerMaxVelocity * 0.7);
            }*/
            this.setAccelerationX(-playerAccel);
        } else if (this.scene.controls.d.isDown) {
            console.assert(debugFlag, 'd');
            if (!this.anims.isPlaying || this.anims.getCurrentKey() != 'play') {
                this.anims.play('right', false);
            }
            /*if (Phaser.Input.Keyboard.JustUp(this.scene.controls.a)) {
                console.assert(debugFlag, 'testing drag d');
                this.setVelocityX(-playerMaxVelocity * 0.7);
            }*/
            this.setAccelerationX(playerAccel);
        } else {
            this.setAccelerationX(0);
            this.setDragX(playerDrag);
        }
    }

    //callback function for pressing jkl keys
    playMusic(musicalNote) {
        console.assert(debugFlag, 'Entered music note callback');
        this.anims.play('play');
        switch(musicalNote.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.J:
                this.scene.musicalNoteOne.play();
                break;
            case Phaser.Input.Keyboard.KeyCodes.K:
                this.scene.musicalNoteTwo.play();
                break;
            case Phaser.Input.Keyboard.KeyCodes.L:
                this.scene.musicalNoteThree.play();
                break;
        }
    }
}