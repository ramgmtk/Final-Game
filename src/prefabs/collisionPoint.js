class collisionPoint extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, null, null);
        scene.physics.add.existing(this);
        this.setImmovable(true);
        this.canCollide = false;
        this.setOrigin(0.5);
    }
}