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
            delay: this.scene.bpms * 8,
            callback: this.spawnPattern,
            callbackScope: this,
            loop: true,
        });

        this.scaleTween = this.scene.tweens.add({
            targets: this,
            paused: true,
            scale: {from: this.scale, to: this.scale + 0.2},
            duration: this.scene.bpms,
            repeat: 3,
            onComplete: () => {
                this.setScale(1.0);
            },
            onCompleteScope: this,
        });
        this.alphaTween = this.scene.tweens.add({
            targets: this,
            paused: true,
            alpha: {from: 0, to: 1},
            duration: this.scene.bpms,
            repeat: 3,
            onComplete: () => {
                this.canCollide = true;
            },
            onCompleteScope: this,
        });
        this.anims.play('AmpIdleForward', true);
    }

    update() {
        if (this.health <= 0) {
            //clear out this enemies projectiles on destruction.
            this.destroyObject();
        } else {
            //Note this allows other nemies projectiles to damage other enemies.
            if (!this.anims.isPlaying && this.anims.getCurrentKey() == 'AmpAttackForward') {
                this.anims.play('AmpIdleForward', true);
            } else if (!this.anims.isPlaying && this.anims.getCurrentKey() == 'AmpAttackSide') {
                this.anims.play('AmpIdleSide', true);
            }
            this.scene.physics.world.overlap(this, this.scene.projectileGroup, (object1, object2) => {
                object1.damageEnemy(3);
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
            this.anims.play('AmpAttackSide');
            this.resetFlip();
        } else if (theta < Math.PI / 3) {
            this.anims.play('AmpAttackSide');
            this.setFlip(true, false);
        } else {
            this.anims.play('AmpAttackForward');
            this.resetFlip();
        }
        for (let i = -1; i < 2; i++) {
            let angle = theta + (i * dTheta);
            let projectile = new Projectile(this.scene, this.x, this.y, 'Projectile', this, Math.cos(angle), Math.sin(angle), projectileVelocity);
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    damageEnemy(damage = 1) {
        this.health -= damage;
        //this.alphaTween.play();
        this.scaleTween.play();
        //insert some damage indicator
    }

    destroyObject() {
        console.assert(debugFlags.enemyFlag, 'Destroying Enemy');
        this.projectileGroup.clear(true, true);
        //remove the spawn timer from the scene
        this.projectileSpawn.remove();
        this.destroy();
    }
} 


//destructor notes
//this.time.removeAllEvents(); //clears the event calls
//this.obstacleGroup.runChildUpdate = false; //clear the obstacle group
//this.obstacleGroup.clear(true, true);