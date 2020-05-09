class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, parent, vecX, vecY, frame = 0) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);
        this.setOrigin(0.5);
        this.setDepth(uiDepth - 1);

        this.canCollideParent = false;
        this.setPath(vecX, vecY);
        this.parent = parent;
    }

    update() {
        if (this.body.checkWorldBounds()) {
            console.assert(debugFlags.enemyFlag, 'Projectile out of bounds');
            this.destroy();
        }
    }

    setPath(xBar, yBar) {
        //SHOULD FIX REDO MATH
        this.setVelocityX(xBar * projectileVelocity);
        this.setVelocityY(yBar * projectileVelocity);
    }

    redirect() {
        let xvalue = this.parent.x - this.x;
        let yvalue = this.parent.y - this.y;
        let magnitude = Math.sqrt((xvalue*xvalue) + (yvalue*yvalue));
        xvalue = xvalue / magnitude;
        yvalue = yvalue / magnitude;
        this.setPath(xvalue, yvalue);
    }
} 