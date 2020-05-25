class collisionPoint extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, null, null);
        scene.physics.add.existing(this);
        this.setImmovable(true);
        this.canCollide = false;
        this.setOrigin(0.5);
        this.body.setSize(this.scene.playerSpriteInfo.width/2, this.scene.playerSpriteInfo.height/2);
        this.setDebugBodyColor(0x0000ff);
    }
}