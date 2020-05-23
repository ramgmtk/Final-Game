class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, health, frame = 0) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.setDepth(uiDepth - 1);
        this.setOrigin(0.5);

        this.scene = scene;
        this.health = health;
        this.projectileGroup = scene.add.group ({
            scene: scene,
            runChildUpdate: true,
        });

        this.spawnNumber = 16;
        this.projectileSpawn = scene.time.addEvent({
            delay: 1500,
            callback: this.spawnPattern,
            callbackScope: this,
            loop: true,
        });
    }

    update() {
        if (this.health <= 0) {
            //clear out this enemies projectiles on destruction.
            this.destroyObject();
        } else {
            //Note this allows other nemies projectiles to damage other enemies.
            this.scene.physics.world.collide(this, this.scene.projectileGroup, (object1, object2) => {
                object1.damageEnemy();
                object2.destroy();
            }, (object1, object2) => {
                return object2.canCollideParent;
            }, this);
        }
        //console.assert(debugFlags.enemyFlag, `Enemy health ${this.health}`)
    }

    spawnPattern() {
        this.scene.enemySound.play();
        let slope = {
            x: this.scene.player.x - this.x,
            y: this.scene.player.y - this.y,
        };
        let magnitude = Math.sqrt((slope.x * slope.x) + (slope.y * slope.y));
        slope.x = slope.x/magnitude;
        slope.y = slope.y/magnitude;
        let theta = Math.acos(slope.x);
        let dTheta = 10 * Math.PI / 180;
        if (theta > (2*Math.PI/3)) {
            this.setFrame('AMPrun');
            this.resetFlip();
        } else if (theta < Math.PI / 3) {
            this.setFrame('AMPrun');
            this.setFlip(true, false);
        } else {
            this.setFrame('AMPidle');
            this.resetFlip();
        }
        for (let i = -1; i < 2; i++) {
            let angle = theta + (i * dTheta);
            let projectile = new Projectile(this.scene, this.x, this.y, 'Projectile', this, Math.cos(angle), Math.sin(angle), projectileVelocity);
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    damageEnemy() {
        this.health -= 1;
        //insert some damage indicator
    }

    destroyObject() {
        console.assert(debugFlags.enemyFlag, 'Destroying Enemy');
        this.projectileGroup.clear(true, true);
        //remove the spawn timer from the scene
        this.projectileSpawn.remove();
        super.destroy();
    }
} 


//destructor notes
//this.time.removeAllEvents(); //clears the event calls
//this.obstacleGroup.runChildUpdate = false; //clear the obstacle group
//this.obstacleGroup.clear(true, true);