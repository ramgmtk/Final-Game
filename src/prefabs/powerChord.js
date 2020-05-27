class PowerChord extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, key) {
        super(scene, x, y, texture, frame);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setImmovable(true);
        this.setDepth(uiDepth - 1);
        this.setOrigin(0.5);
        this.scene = scene;
        this.key = key;
        this.collected = false;
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
        this.destroy();
    }
}