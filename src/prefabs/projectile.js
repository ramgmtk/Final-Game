class Projectile extends Phaser.Physics.Arcade.Sprite {
    //vecX, vecY expected to make a unit vector.
    constructor(scene, x, y, frame, parent, vecX, vecY, velocity, reverseable = true) {
        super(scene, x, y, playerAtlas, frame);
        this.reverseable = reverseable;
        if (!this.reverseable) {
            this.setFrame('BossProjectile')
        }
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.setImmovable(true);
        this.setOrigin(0.5);
        this.setDepth(uiDepth - 1);

        this.reverseable = reverseable;
        this.canCollideParent = false;
        this.projectileVelocity = velocity;
        this.setPath(vecX, vecY);
        this.parent = parent;

        this.scene.projectilesFired += 1;
    }

    update() {
        if (this.body.checkWorldBounds()) {
            console.assert(debugFlags.enemyFlag, 'Projectile out of bounds');
            this.scene.projectilesDestroyed += 1;
            this.destroy();
        }
    }

    setPath(xBar, yBar) {
        //SHOULD FIX REDO MATH
        this.setVelocityX(xBar * this.projectileVelocity);
        this.setVelocityY(yBar * this.projectileVelocity);
    }

    redirect() {
        this.scene.projectilesDestroyed += 1;
        this.canCollideParent = true;
        this.setFrame(null);
        this.setTexture('invertedProjectile');
        let xvalue = this.parent.x - this.x;
        let yvalue = this.parent.y - this.y;
        let magnitude = Math.sqrt((xvalue*xvalue) + (yvalue*yvalue));
        xvalue = xvalue / magnitude;
        yvalue = yvalue / magnitude;
        this.setPath(xvalue, yvalue);
    }
} 