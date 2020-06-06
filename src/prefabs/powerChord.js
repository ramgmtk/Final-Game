class PowerChord extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, key) {
        super(scene, x, y, texture, frame);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setImmovable(true);
        this.setDepth(uiDepth - 1);
        this.origin = {
            x: x,
            y: y,
        };
        this.setOrigin(0.5);
        this.scene = scene;
        this.key = key;
        this.collected = false;

        this.idleTween = this.scene.tweens.add({
            targets: this,
            y: {from: this.origin.y, to: this.origin.y + 20},
            yoyo: true,
            duration: this.scene.bpms,
            repeat: -1,
        });
    }

    unlockPowerChord() {
        this.collected = true;
        for (let i = 0; i < powerChordBar.length; i++) {
            if (this.key == powerChordBar[i].powerChord) {
                powerChordBar[i].unlocked = true;
                break;
            }
        }
        this.scene.updatePowerChordList();
        
        let key1 = new Phaser.GameObjects.Sprite(this.scene, this.x - (noteSize), this.y + noteSize, 'keyAtlas', this.key[0]).setAlpha(0).setDepth(uiDepth);
        let key2 = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y + noteSize, 'keyAtlas', this.key[1]).setAlpha(0).setDepth(uiDepth);
        let key3 = new Phaser.GameObjects.Sprite(this.scene, this.x + (noteSize), this.y + noteSize, 'keyAtlas', this.key[2]).setAlpha(0).setDepth(uiDepth);
        this.scene.add.existing(key1);
        this.scene.add.existing(key2);
        this.scene.add.existing(key3);
        let camCenter = this.scene.mainCam.getWorldPoint(centerX, centerY);
        let key4 = new Phaser.GameObjects.Sprite(this.scene, camCenter.x - (noteSize * 4), camCenter.y + (noteSize * 4), 'keyAtlas', this.key[0]).setAlpha(0).setDepth(uiDepth).setScale(4);
        let key5 = new Phaser.GameObjects.Sprite(this.scene, camCenter.x, camCenter.y + (noteSize * 4), 'keyAtlas', this.key[1]).setAlpha(0).setDepth(uiDepth).setScale(4);
        let key6 = new Phaser.GameObjects.Sprite(this.scene, camCenter.x + (noteSize * 4), camCenter.y + (noteSize * 4), 'keyAtlas', this.key[2]).setAlpha(0).setDepth(uiDepth).setScale(4);
        let space = new Phaser.GameObjects.Sprite(this.scene, camCenter.x, camCenter.y, 'space', null).setAlpha(0).setDepth(uiDepth).setScale(3);
        this.scene.add.existing(key4);
        this.scene.add.existing(key5);
        this.scene.add.existing(key6);
        this.scene.add.existing(space);

        let scene = this.scene;
        let timeline1 = this.scene.tweens.timeline({
            repeat: 0,
            paused: true,
            duration: this.scene.bpms * 3,
            tweens: [{
                targets: key1,
                alpha: {from: 0, to: 1},
                onComplete: () => {
                    scene.musicMap[this.key[0]].play();
                },
                onCompleteScope: this,
            },
            {
                targets: key2,
                alpha: {from: 0, to: 1},
                onComplete: () => {
                    scene.musicMap[this.key[1]].play();
                },
                onCompleteScope: this,
            },
            {
                targets: key3,
                alpha: {from: 0, to: 1},
                onComplete: () => {
                    scene.musicMap[this.key[2]].play();
                },
                onCompleteScope: this,
            }],
            onComplete: ()=> {
                key1.destroy();
                key2.destroy();
                key3.destroy();
                timeline2.play();
            },
            onCompleteScope: this,
        });
        
        let timeline2 = this.scene.tweens.timeline({
            repeat: 0,
            paused: true,
            duration: this.scene.bpms * 3,
            tweens: [{
                targets: key4,
                alpha: {from: 0, to: 1},
                onComplete: () => {
                    scene.musicMap[this.key[0]].play();
                },
                onCompleteScope: this,
            },
            {
                targets: key5,
                alpha: {from: 0, to: 1},
                onComplete: () => {
                    scene.musicMap[this.key[1]].play();
                },
                onCompleteScope: this,
            },
            {
                targets: key6,
                alpha: {from: 0, to: 1},
                onComplete: () => {
                    scene.musicMap[this.key[2]].play();
                },
                onCompleteScope: this,
            },
            {
                targets: space,
                alpha: {from: 0, to: 1},
            }],
            onComplete: ()=> {
                key4.destroy();
                key5.destroy();
                key6.destroy();
                space.destroy();
            },
            onCompleteScope: this,
        });
        timeline1.play();
        this.destroy();
    }
}