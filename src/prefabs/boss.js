class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, player) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.setDepth(uiDepth - 1);
        this.setOrigin(0.5);

        this.scene = scene;
        this.player = player;
        this.health = 1000;
        this.isMoving = false;
        this.destination = {
            x: 0,
            y: 0,
        }

        this.projectileGroup = this.scene.add.group({
            scene: this.scene,
            runChildUpdate: false,
        });
        this.projectileSpawn = this.scene.time.addEvent({
            delay: 3000,
            callback: this.spawnPattern,
            callbackScope: this,
            loop: true
        });
        this.movementGroup = this.scene.add.group({
            scene: this.scene,
            runChildUpdate: false,
        });
        this.availableMoves = [];
        this.currPos = 0;
        this.createMovementGroup();
    }

    update() {
        if (this.isMoving) {
            this.scene.physics.world.collide(this, this.movementGroup, (object1, object2) => {
                object2.canCollide = false;
                object1.isMoving = false;
                object1.setVelocityX(0);
                object2.setVelocityY(0);
            }, (object1, object2)=> {
                return object2.canCollide;
            }, this);
        } else {
            let randPoint = Phaser.Math.Between(0, this.availableMoves.length - 1); //can result in the point boss is currently on
            this.availableMoves.push(this.currPos);
            this.currPos = this.availableMoves[randPoint];
            this.movementGroup.children.entries[this.availableMoves[randPoint]].canCollide = true;
            this.isMoving = true;
            this.moveTo(bossPatternPoints[this.availableMoves[randPoint]]);
            this.availableMoves.splice(this.availableMoves.indexOf(this.currPos), 1)
        }
        if (this.body.checkWorldBounds()) {
            console.assert(debugFlags.enemyFlag, 'Enemy out of bounds');
            this.destroyObject();
        }
    }

    spawnPattern() {
        //calculate unit vec
        let slope = {
            x: this.player.x - this.x,
            y: this.player.y - this.y,
        };
        let magnitude = Math.sqrt((slope.x * slope.x) + (slope.y * slope.y));
        slope.x = slope.x/magnitude;
        slope.y = slope.y/magnitude;
        let theta = Math.atan(slope.y/slope.x);
        let tanInverseAdjust = 0;
        if ((this.y > this.player.y && this.x > this.player.x) || (this.y < this.player.y && this.x > this.player.x)) { //SHOULD FIX INCREDIBLY HARD CODED.
            tanInverseAdjust += Math.PI;
        }
        let dTheta = 10 * Math.PI / 180;
        for (let i = -1; i < 2; i++) {
            let angle = theta + (i * dTheta) +  tanInverseAdjust;
            let projectile = new Projectile(this.scene, this.x, this.y, 'BossProjectile', this, Math.cos(angle), Math.sin(angle));
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    createMovementGroup() {
        for (let i = 0; i < bossPatternPoints.length; i++) {
            let box = new collisionPoint(this.scene, bossPatternPoints[i].x, bossPatternPoints[i].y);
            this.movementGroup.add(box);
            this.availableMoves.push(i);
        }
        this.availableMoves.splice(0, 1);
    }

    moveTo(destination) {
        let slope = {
            x: destination.x - this.x,
            y: destination.y - this.y,
        }
        let magnitude = Math.sqrt((slope.x * slope.x) + (slope.y * slope.y));
        slope.x = slope.x/magnitude;
        slope.y = slope.y/magnitude;
        this.setVelocityX(slope.x * 400);
        this.setVelocityY(slope.y * 400);
    }

    destroyObject() {
        console.assert(debugFlags.enemyFlag, 'Destroying Enemy');
        this.projectileGroup.clear(true, true);
        this.movementGroup.clear(true, true);
        //remove the spawn timer from the scene
        this.projectileSpawn.remove();
        super.destroy();
    }
}