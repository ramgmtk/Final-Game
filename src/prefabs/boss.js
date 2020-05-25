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
        this.waveAmount = 3;
        this.thetaVariance = 0;
        this.availableMoves = [];
        this.currPos = 0;
        this.destination = {
            x: 0,
            y: 0,
        }

        //projectile pattern holder
        this.projectilePreviews = new Phaser.GameObjects.Graphics(this.scene);
        this.scene.add.existing(this.projectilePreviews);
        this.projectileSetup = [];
        this.projectileSpawnTypes = [];
        this.projectileDelay = [];
        this.movementType = [];
        this.movement = this.bossPatternMovement_Static;
        this.elapsedTime = 0;
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
        if (this.health <= 0) {
            this.scene.gameOver = true;
        } else {
            if (this.health < (this.maxHealth - (this.maxHealth * 0.3 * this.phase))) {
                this.phase += 1;
                this.projectileSpawnActive.callback = this.projectileSpawnTypes[this.phase - 1];
                this.projectileSpawnActive.delay =  this.projectileDelay[this.phase - 1];
                this.movement = this.movementType[1]; //REPLACE WITH THIS.PHASE - 1 NEED TO FIX
                console.assert(debugFlags.bossFlag, 'NEXT PHASE STARTED');
            }
            //SHOULD FIX WILL CRASH ON NEXT PHASE REACH
            this.movement();
            this.scene.physics.world.collide(this, this.scene.projectileGroup, (object1, object2) => {
                object1.damageEnemy();
                object2.destroy();
            }, (object1, object2) => {
                return object2.canCollideParent;
            }, this);
        }
        if (this.body.checkWorldBounds()) {
            console.assert(debugFlags.bossFlag, 'Enemy out of bounds');
            this.health = 0;
            this.destroyObject();
        }
}

    damageEnemy() {
        this.health -= 10;
        this.healthBar.decrease();
    }

    moveTo(destination) {
        console.assert(debugFlags.bossFlag, `Move to: ${destination.x}, ${destination.y}`);
        let slope = {
            x: destination.x - this.x,
            y: destination.y - this.y,
        }
        let magnitude = Math.sqrt((slope.x * slope.x) + (slope.y * slope.y));
        slope.x = slope.x/magnitude;
        slope.y = slope.y/magnitude;
        this.setVelocityX(slope.x * playerMaxVelocity);
        this.setVelocityY(slope.y * playerMaxVelocity);
    }

    destroyObject() {
        console.assert(debugFlags.bossFlag, 'Destroying Enemy');
        this.projectileGroup.clear(true, true);
        this.movementGroup.clear(true, true);
        this.healthBar.healthBar.destroy();
        this.healthBar = null;
        this.projectilePreviews.clear();
        //remove the spawn timer from the scene
        for (let i = 0; i < this.timerArray.length; i++) {
            this.timerArray[i].remove();
        };
        super.destroy();
    }

    createProjectileSpawnList() {
        this.projectileSpawnTypes.push(this.spawnPatternCircle);
        this.projectileDelay.push(this.scene.bpms * 9);
        this.projectileSpawnTypes.push(this.spawnPatternLine);
        this.projectileDelay.push(this.scene.bpms * 12);

        this.movementType.push(this.bossPatternMovement_Static);
        this.movementType.push(this.bossMovementPattern_test);
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
            delay: this.projectileDelay[this.phase - 1],
            callback: this.projectileSpawnTypes[this.phase - 1],
            callbackScope: this,
            loop: true,
        });
        this.timerArray.push(this.projectileSpawnActive);
        this.projectileSpawnPassive = this.scene.time.addEvent({
            delay: this.scene.bpms,
            callback: this.spawnPatternWave,
            callbackScope: this,
            loop: false,
        });
        this.timerArray.push(this.projectileSpawnPassive);
    }

    createMovementGroup() {
        for (let i = 0; i < bossPatternPoints.length; i++) {
            let box = new collisionPoint(this.scene, bossPatternPoints[i].x, bossPatternPoints[i].y);
            console.log(`x: ${box.x}, y: ${box.y}, (${bossPatternPoints[i].x},${bossPatternPoints[i].y})`);
            console.log(`body: ${box.body.x}, y: ${box.body.y}`);
            this.movementGroup.add(box);
            this.availableMoves.push(i);
        }
        this.availableMoves.splice(0, 1);
    }

    bossPatternMovement_Static() {
        return;
    }

    bossMovementPattern_test() {
        if (this.isMoving) {
            this.scene.physics.world.collide(this, this.movementGroup, (object1, object2) => {
                object2.canCollide = false;
                object1.isMoving = false;
                this.elapsedTime = (this.scene.time.now - this.elapsedTime) / this.scene.sceneTimeDelay;
                console.assert(debugFlags.bossFlag, 'Reached collision Point');
                object1.setVelocityX(0);
                object1.setVelocityY(0);
                object1.x = object2.x;
                object1.y = object2.y;
                console.assert(debugFlags.bossFlag,`Boss: ${this.x}, ${this.y}`);
                console.log('');
            }, (object1, object2)=> {
                return object2.canCollide;
            }, this);
        } else {
            let randPoint = Phaser.Math.Between(0, this.availableMoves.length - 1); //can result in the point boss is currently on
            this.availableMoves.push(this.currPos);
            this.currPos = this.availableMoves[randPoint];
            this.movementGroup.children.entries[this.availableMoves[randPoint]].canCollide = true;
            this.isMoving = true;
            this.scene.time.addEvent({
                delay: (this.scene.bpms * 8) - this.elapsedTime,
                callback: this.moveTo,
                callbackScope: this,
                args: [bossPatternPoints[this.availableMoves[randPoint]]]
            });
            this.elapsedTime = this.scene.time.now
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
        for (let i = -1; i < -1 + this.waveAmount; i++) {
            let angle = theta + (i * dTheta) +  tanInverseAdjust;
            let projectile = new Projectile(this.scene, this.x, this.y, 'BossProjectile', this, Math.cos(angle), Math.sin(angle), projectileVelocity * 2);
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    //ISSUE WITH THIS IS THAT EVEN THOUGH PROJECTILES ARE DESTROYED OFFSCREEN, THE ARRAY STILL NEEDS TO BE CLEARED ON 1 RUN THROUGH.
    spawnPatternCircle() {
        this.projectilePreviews.clear();
        this.projectilePreviews.fillStyle(0xff0000);
        if (this.projectileSetup.length == 0) {
            this.projectilePreviews.fillCircle(this.x, this.y, 200).setDepth(uiDepth - 1).setAlpha(0.5);
            this.scene.time.addEvent({
                delay: this.scene.bpms * 3,
                callback: () => {
                    this.projectilePreviews.clear();
                    let theta = (Math.PI/(this.spawnNumber/2)) + this.thetaVariance;
                    for (let i = 0; i < this.spawnNumber; i++) {
                        let projectile = new Projectile(this.scene, this.x, this.y, 'BossProjectile', this, 
                            Math.cos(i*theta), Math.sin(i*theta), projectileVelocity * 4);
                        this.projectileSetup.push(projectile)
                    }
                    this.projectileGroup.addMultiple(this.projectileSetup);
                    this.scene.projectileGroup.addMultiple(this.projectileSetup);
                    this.thetaVariance = this.thetaVariance > 0 ? 0 : Math.PI/ 12;
                },
                callbackScope: this,
                loop: false,
            });
        } else {
            for (let i = 0; i < this.projectileSetup.length; i++) {
                if (!this.projectileSetup[i].canCollideParent) {
                    this.projectileSetup[i].destroy();
                }
            }
            this.projectileSetup = [];
        }
    }

    //INCREDIBLY TAXING METHOD TO CREATE A WALL, SHOULD FIX
    spawnPatternLine() {
        this.projectilePreviews.clear();
        this.projectilePreviews.fillStyle(0xff0000);
        if (this.projectileSetup.length == 0) {
            let spawnPArr = [];
            let vec;
            let spawnCols = 4; //number of columns of projectiles
            for (let i = 0; i < spawnCols; i++) {
                let spawnPoint = Phaser.Math.Between((i * this.scene.stageInfo.width/spawnCols) + this.scene.bossProjectileInfo.width/2, 
                    ((i + 1) * (this.scene.stageInfo.width/spawnCols)) - this.scene.bossProjectileInfo.width/2);
                vec = i % 2 == 0 ? 1 : -1;
                spawnPArr.push({spawn: spawnPoint, direction: vec});
                this.projectilePreviews.fillRect(spawnPoint - (this.scene.bossProjectileInfo.width/2), 0, 
                    this.scene.bossProjectileInfo.width, game.config.height * (1/bossZoom)).setDepth(uiDepth - 1).setAlpha(0.5);
            }
            this.scene.time.addEvent({
                delay: this.scene.bpms * 3,
                callback: (spawnPArr) => {
                    this.projectilePreviews.clear();
                    for (let i = 0; i < spawnCols; i++) {
                        for (let j = 0; j < this.scene.stageInfo.height; j+= this.scene.bossProjectileInfo.height) {
                            let projectile = new Projectile(this.scene, spawnPArr[i].spawn, j, 'BossProjectile', this,
                                0, spawnPArr[i].direction, projectileVelocity);
                            this.projectileSetup.push(projectile);
                        }
                    }
                    this.projectileGroup.addMultiple(this.projectileSetup);
                    this.scene.projectileGroup.addMultiple(this.projectileSetup);
                },
                callbackScope: this,
                args: [spawnPArr],
                loop: false,
            });
        } else {
            for (let i = 0; i < this.projectileSetup.length; i++) {
                if (!this.projectileSetup[i].canCollideParent) {
                    this.projectileSetup[i].destroy();
                }
            }
            this.projectileSetup = [];
        }
    }
}