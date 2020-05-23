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
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.phase = 1;
        this.healthBar = new bossHealth(this.scene, this.maxHealth);
        this.isMoving = false;
        this.spawnNumber = 16;
        this.thetaVariance = 0;
        this.availableMoves = [];
        this.currPos = 0;
        this.destination = {
            x: 0,
            y: 0,
        }

        //projectile pattern holder
        this.projectileSpawnTypes = [];
        this.createProjectileSpawnList();
        //Groups
        this.projectileGroup;
        this.movementGroup;
        this.createGroups();

        //Timer
        this.timerArray = [];
        this.projectileSpawnActive;
        this.projectileSpawnPassive;
        this.createTimers();
    }

    update() {
        if (this.health < (this.maxHealth - (this.maxHealth * 0.3 * this.phase))) {
            this.phase += 1;
            this.projectileSpawnActive.callback = this.projectileSpawnTypes[this.phase - 1];
            console.assert(debugFlags.enemyFlag, 'NEXT PHASE STARTED');
        }
        if (this.body.checkWorldBounds()) {
            console.assert(debugFlags.enemyFlag, 'Enemy out of bounds');
            this.destroyObject();
        }
        this.scene.physics.world.collide(this, this.scene.projectileGroup, (object1, object2) => {
            object1.damageEnemy();
            object2.destroy();
        }, (object1, object2) => {
            return object2.canCollideParent;
        }, this);
    }

    damageEnemy() {
        this.health -= 10;
        this.healthBar.decrease();
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
        this.healthBar.healthBar.destroy();
        this.healthBar = null;
        //remove the spawn timer from the scene
        for (let i = 0; i < this.timerArray.length; i++) {
            this.timerArray[i].remove();
        };
        super.destroy();
    }

    createProjectileSpawnList() {
        this.projectileSpawnTypes.push(this.spawnPatternCircle);
        this.projectileSpawnTypes.push(this.spawnPatternLine);
    }
    createGroups() {
        this.projectileGroup = this.scene.add.group({
            scene: this.scene,
            runChildUpdate: false,
        });
        this.movementGroup = this.scene.add.group({
            scene: this.scene,
            runChildUpdate: false,
        });
        this.createMovementGroup();
    }

    createTimers() {
        this.projectileSpawnActive = this.scene.time.addEvent({
            delay: 3000,
            callback: this.projectileSpawnTypes[this.phase - 1],
            callbackScope: this,
            loop: true,
        });
        this.timerArray.push(this.projectileSpawnActive);
        console.log(this.projectileSpawnActive);
        this.projectileSpawnPassive = this.scene.time.addEvent({
            delay: 325,
            callback: this.spawnPatternWave,
            callbackScope: this,
            loop: true,
        });
        this.timerArray.push(this.projectileSpawnPassive);
    }

    createMovementGroup() {
        for (let i = 0; i < bossPatternPoints.length; i++) {
            let box = new collisionPoint(this.scene, bossPatternPoints[i].x, bossPatternPoints[i].y);
            this.movementGroup.add(box);
            this.availableMoves.push(i);
        }
        this.availableMoves.splice(0, 1);
    }

    bossMovementPattern_test() {
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
    }

    spawnPatternWave() {
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
        //this is compensating for the range of tan^-1
        if ((this.y > this.player.y && this.x > this.player.x) || (this.y < this.player.y && this.x > this.player.x)) { //SHOULD FIX INCREDIBLY HARD CODED.
            tanInverseAdjust += Math.PI;
        }
        let dTheta = 20 * Math.PI / 180;
        for (let i = -1; i < 2; i++) {
            let angle = theta + (i * dTheta) +  tanInverseAdjust;
            let projectile = new Projectile(this.scene, this.x, this.y, 'BossProjectile', this, Math.cos(angle), Math.sin(angle), projectileVelocity * 4);
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    spawnPatternCircle() {
        let theta = (Math.PI/(this.spawnNumber/2)) + this.thetaVariance;
        for (let i = 0; i < this.spawnNumber; i++) {
            let projectile = new Projectile(this.scene, this.x, this.y, 'BossProjectile', this, 
                Math.cos(i*theta), Math.sin(i*theta), projectileVelocity * 2);
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
        this.thetaVariance = this.thetaVariance > 0 ? 0 : Math.PI/ 12;
    }

    //INCREDIBLY TAXING METHOD TO CREATE A WALL, SHOULD FIX
    spawnPatternLine() {
        let projectileSetup = [];
        let direction;
        let spawnCols = 4; //number of columns of projectiles
        for (let i = 0; i < spawnCols; i++) {
            let spawnPoint = Phaser.Math.Between(i * this.scene.stageInfo.width/spawnCols, (i + 1) * (this.scene.stageInfo.width/spawnCols));
            direction = i % 2 == 0 ? 1 : -1;
            for (let j = 0; j < this.scene.stageInfo.height; j+= this.scene.playerSpriteInfo.height) {
                let projectile = new Projectile(this.scene, spawnPoint, j, 'BossProjectile', this,
                0, direction, projectileVelocity);
                projectileSetup.push(projectile);
            }
        }
        this.projectileGroup.addMultiple(projectileSetup);
        this.scene.projectileGroup.addMultiple(projectileSetup);
    }
}