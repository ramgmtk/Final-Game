class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, player, uniqueEncounter = false) {
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
        this.canMove = true;
        this.phase = 1;
        this.healthBar = new bossHealth(this.scene, this.maxHealth);
        this.isMoving = false;
        this.uniqueEncounter = uniqueEncounter;
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
        this.bossPatternPoints
        this.createGroups();
        //
        this.soundList = [this.scene.bossTheme1, this.scene.bossTheme2];
        //Timer
        this.timerArray = [];
        this.movementTimer;
        this.spawnTimer;
        this.extraTimer;
        this.projectileSpawnActive;
        this.projectileSpawnPassive;
        this.createTimers();

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
                this.setAlpha(1.0);
            },
            onCompleteScope: this,
        });

        this.body.setSize(this.scene.bossSpriteInfo.width / 1.5, this.scene.bossSpriteInfo.height / 1.5);;
    }

    update() {
        if (this.active) {
            if (this.health <= 0) {
                if (!this.uniqueEncounter) {
                    this.uniqueEncounter = true;
                    this.destroyObject();
                }
            } else {
                if (this.health < (this.maxHealth - (this.maxHealth * 0.5 * this.phase))) {
                    this.phase += 1;
                    this.projectileSetup = [];
                    this.projectileSpawnActive.callback = this.projectileSpawnTypes[this.phase - 1];
                    this.projectileSpawnActive.delay =  this.projectileDelay[this.phase - 1];
                    this.movement = this.movementType[1]; //REPLACE WITH THIS.PHASE - 1 NEED TO FIX
                    this.soundList[this.phase - 2].stop();
                    console.assert(debugFlags.bossFlag, 'NEXT PHASE STARTED');
                }
                //SHOULD FIX WILL CRASH ON NEXT PHASE REACH
                if (this.canMove) {
                    this.movement();
                } else {
                    if (!this.anims.isPlaying) {
                        this.anims.play('bossIdle', true);
                    }
                }
                this.scene.physics.world.overlap(this, this.scene.projectileGroup, (object1, object2) => {
                    object1.damageEnemy(5);
                    object2.destroy();
                }, (object1, object2) => {
                    return object2.canCollideParent;
                }, this);
                if (this.body.checkWorldBounds()) {
                    console.assert(debugFlags.bossFlag, 'Enemy out of bounds');
                    this.destroyObject();
                }
            }
            
        }
    }

    damageEnemy(damage = 10) {
        this.health -= damage;
        this.healthBar.decrease(damage);
        this.scaleTween.play();
        //this.alphaTween.play();
    }

    moveTo(destination, velocity = playerMaxVelocity) {
        console.assert(debugFlags.bossFlag, `Move to: ${destination.x}, ${destination.y}`);
        this.elapsedTime = this.scene.time.now;
        let slope = {
            x: destination.x - this.x,
            y: destination.y - this.y,
        }
        if (this.anims.getCurrentKey() != 'bossAttackSlow' && this.anims.getCurrentKey() != 'test') {
            if (slope.x < 0) {
                this.resetFlip();
            } else {
                this.setFlipX(true);
            }
            this.anims.play('bossMove', false);
        }
        let magnitude = Math.sqrt((slope.x * slope.x) + (slope.y * slope.y));
        slope.x = slope.x/magnitude;
        slope.y = slope.y/magnitude;
        this.setVelocityX(slope.x * velocity);
        this.setVelocityY(slope.y * velocity);
    }

    clearEvents() {
        for (let i = 0; i < this.timerArray.length; i++) {
            this.timerArray[i].remove();
        };
        if (this.movementTimer != null) {  
            this.movementTimer.destroy();
        }
        if (this.spawnTimer != null) {
            this.spawnTimer.destroy();
        }
        if (this.extraTimer != null) {
            this.extraTimer.destroy();
        }
        this.projectileGroup.clear(true, true);
        this.movementGroup.clear(true, true);
        if (this.healthBar != null) {
            this.healthBar.healthBar.destroy();
            this.healthBar = null;
        }
        this.projectilePreviews.clear();
    }
    destroyObject() {
        console.assert(debugFlags.bossFlag, 'Destroying Enemy');
        this.clearEvents();
        this.destroy();
    }

    createProjectileSpawnList() {
        this.projectileSpawnTypes.push(this.spawnPatternCircle);
        this.projectileDelay.push(this.scene.bpms * 7);
        this.projectileSpawnTypes.push(this.spawnPatternLine);
        this.projectileDelay.push(this.scene.bpms * 4);

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
            loop: true,
        });
        this.timerArray.push(this.projectileSpawnPassive);
    }

    createMovementGroup() {
        this.bossPatternPoints = [
            {
                x: centerX * (1/bossZoom),
                y: centerY * (1/bossZoom),
            },
            {
                x: bossCornerSpace,
                y: bossCornerSpace,
            },
            {
                x: config.width * (1/bossZoom) - bossCornerSpace,
                y: config.height * (1/bossZoom) - bossCornerSpace, 
            },
            {
                x: config.width * (1/bossZoom) - bossCornerSpace,
                y: bossCornerSpace,
            },
            {
                x: bossCornerSpace,
                y: config.width * (1/bossZoom) - bossCornerSpace,
            }
        ];
        for (let i = 0; i < this.bossPatternPoints.length; i++) {
            let box = new collisionPoint(this.scene, this.bossPatternPoints[i].x, this.bossPatternPoints[i].y);
            this.movementGroup.add(box);
            this.availableMoves.push(i);
        }
        this.availableMoves.splice(0, 1);
    }

    bossPatternMovement_Static() {
        if (!this.anims.isPlaying) {
            this.anims.play('bossIdle', true);
        }
    }

    bossMovementPattern_test() {
        if (!this.anims.isPlaying) {
            this.anims.play('bossIdle');
        }
        if (this.isMoving) {
            this.scene.physics.world.overlap(this, this.movementGroup, (object1, object2) => {
                object2.canCollide = false;
                object1.isMoving = false;
                this.elapsedTime = (this.scene.time.now - this.elapsedTime);// / this.scene.sceneTimeDelay;
                console.assert(debugFlags.bossFlag, 'Reached collision Point');
                object1.setVelocityX(0);
                object1.setVelocityY(0);
                object1.x = object2.x;
                object1.y = object2.y;
                console.assert(debugFlags.bossFlag,`Boss: ${this.x}, ${this.y}`);
                console.assert(debugFlags.bossFlag, ' ');
            }, (object1, object2)=> {
                return object2.canCollide;
            }, this);
        } else {
            let randPoint = Phaser.Math.Between(0, this.availableMoves.length - 1); //can result in the point boss is currently on
            this.availableMoves.push(this.currPos);
            this.currPos = this.availableMoves[randPoint];
            this.movementGroup.children.entries[this.availableMoves[randPoint]].canCollide = true;
            this.isMoving = true;
            this.movementTimer = this.scene.time.delayedCall((this.scene.bpms * 8) - this.elapsedTime, this.moveTo,
                [this.bossPatternPoints[this.availableMoves[randPoint]], playerMaxVelocity * 3.0], this);
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
            let projectile = new Projectile(this.scene, this.x, this.y, 'Projectile', this, Math.cos(angle), Math.sin(angle), projectileVelocity * 2);
            this.projectileGroup.add(projectile);
            this.scene.projectileGroup.add(projectile);
        }
    }

    //ISSUE WITH THIS IS THAT EVEN THOUGH PROJECTILES ARE DESTROYED OFFSCREEN, THE ARRAY STILL NEEDS TO BE CLEARED ON 1 RUN THROUGH.
    spawnPatternCircle() {
        this.projectileSpawnActive.paused = true;
        this.projectilePreviews.clear();
        this.projectilePreviews.fillStyle(0xff0000);
        if (this.projectileSetup.length == 0) {
            this.projectilePreviews.fillCircle(this.x, this.y, 200).setDepth(uiDepth - 1).setAlpha(0.5);
            this.anims.play('bossAttackFast');
            this.spawnTimer = this.scene.time.delayedCall(this.scene.bpms, () => {
                this.projectileSpawnActive.paused = false;
                this.projectilePreviews.clear();
                let theta = (Math.PI/(this.spawnNumber/2)) + this.thetaVariance;
                for (let i = 0; i < this.spawnNumber; i++) {
                    let projectile = new Projectile(this.scene, this.x, this.y, 'Projectile', this, 
                        Math.cos(i*theta), Math.sin(i*theta), projectileVelocity * 4, false);
                    this.projectileSetup.push(projectile)
                }
                this.projectileGroup.addMultiple(this.projectileSetup);
                this.scene.projectileGroup.addMultiple(this.projectileSetup);
                this.thetaVariance = this.thetaVariance > 0 ? 0 : Math.PI/ 12;
            }, null, this);
        } else {
            this.extraTimer = this.scene.time.delayedCall(this.scene.bpms, () => {
                this.projectileSpawnActive.paused = false;
            }, null, this);
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
        this.projectileSpawnActive.paused = true;
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
            this.anims.play('bossAttackSlow', false);
            this.spawnTimer = this.scene.time.delayedCall(this.scene.bpms * 4, (spawnPArr, spawnCols) => {
                this.projectilePreviews.clear();
                this.projectileSpawnActive.paused = false;
                for (let i = 0; i < spawnCols; i++) {
                    for (let j = 0; j < this.scene.stageInfo.height; j+= this.scene.bossProjectileInfo.height) {
                        let projectile = new Projectile(this.scene, spawnPArr[i].spawn, j, 'Projectile', this,
                            0, spawnPArr[i].direction, projectileVelocity, false);
                        this.projectileSetup.push(projectile);
                    }
                }
                this.projectileGroup.addMultiple(this.projectileSetup);
                this.scene.projectileGroup.addMultiple(this.projectileSetup);
            }, [spawnPArr, spawnCols], this);
        } else {
            this.extraTimer = this.scene.time.delayedCall(this.scene.bpms * 4, () => {
                this.projectileSpawnActive.paused = false;
            }, null, this);
            for (let i = 0; i < this.projectileSetup.length; i++) {
                if (!this.projectileSetup[i].canCollideParent) {
                    this.projectileSetup[i].destroy();
                }
            }
            this.projectileSetup = [];
        }
    }
}