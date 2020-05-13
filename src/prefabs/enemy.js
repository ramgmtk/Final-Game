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
            delay: 3000,
            callback: this.spawnPattern,
            callbackScope: this,
            loop: true,
        });
    }

    update() {
        if (this.health <= 0) {
            //clear out this enemies projectiles on destruction.
            this.destroy();
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
        for (let i = 0; i < this.spawnNumber; i++) {
            let projectile = new Projectile(this.scene, this.x, this.y, 'projectile',this, 
                Math.cos(i*Math.PI/(this.spawnNumber/2)), Math.sin(i*Math.PI/(this.spawnNumber/2)));
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    damageEnemy() {
        this.health -= 1;
        //insert some damage indicator
    }

    destroy() {
        console.assert(debugFlags.enemyFlag, 'Destroying Enemy');
        this.projectileGroup.clear(true, true);
        //remove the spawn timer from the scene
        this.projectileSpawn.destroy();
        super.destroy();
    }
} 


//destructor notes
//this.time.removeAllEvents(); //clears the event calls
//this.obstacleGroup.runChildUpdate = false; //clear the obstacle group
//this.obstacleGroup.clear(true, true);