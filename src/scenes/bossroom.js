class BossRoom extends Phaser.Scene {
    constructor() {
        super('bossScene');
    }

    init(data) {
        this.gameData = data;
    }

    create() {
        this.gameOver = false;
        this.winner = false;
        this.finalPhase = false;
        this.bossHit = false;
        this.heartInfo = this.textures.get('heart').getSourceImage();
        this.stageInfo = {
            width: game.config.width * (1/bossZoom),
            height: game.config.height * (1/bossZoom),
        }
        this.physics.world.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height)
        this.playerSpriteInfo = game.textures.getFrame(playerAtlas, 'MCidle');
        this.bossProjectileInfo = game.textures.getFrame(playerAtlas, 'BossProjectile');
        this.bpms = 325;
        this.sceneTimeDelay = 3.000333;
        this.controls = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            f: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            h: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H),
            j: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            k: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            l: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
            i: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        };
        this.player = new Player(this, centerX, centerY, playerAtlas, 'MCidle', 'Note');
        //UI ELEMENTS
        this.powerChordList = new Array(powerChordBar.length);
        this.updatePowerChordList();

        //ENEMIES
        this.projectileGroup = this.add.group({
            scene: this,
            runChildUpdate: true,
        });
        this.boss = new Boss(this, centerX * 1/bossZoom, centerY * 1/bossZoom, 'bossAtlas', 'BOSSidle', this.player, true);
        //sound
        this.createSound();

        //camera setup
        //CAMERA SETUP
        this.bossCam;
        this.bossHealthCam;
        this.noteCam;
        this.heartCam;
        this.powerChordCam;
        this.createCams();

        //audio example
        /*this.testNoise.play();
        this.testNoise.once('complete', () => {
            this.bossTheme.play();
        }, this);*/
        this.bossTheme.play();

        //test vars
        this.finalPhaseDuration = 30000;
        this.projectilesFired = 0;
        this.projectilesDestroyed = 0;
    }
    update() {
        if (!this.gameOver) {
            this.player.update();
            if (this.boss.health > 0) {
                this.boss.update();
                //projectile collider
                this.physics.world.collide(this.player, this.projectileGroup, this.damagePlayer, (object1, object2) => {
                    return object1.canCollide && !object2.canCollideParent ? true : false;
                }, this); //COMMENTED OUT FOR GOD MODE
                if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
                    console.log(`${this.projectilesFired}, ${this.projectilesDestroyed}`);
                    this.noteComboCheck();
                }
                if (this.player.shieldActive) {
                    this.physics.world.collide(this.player.shield, this.projectileGroup, (object1, object2) => {
                        object2.destroy();
                    }, null, this);
                }
                if (this.player.isAttacking) {
                    this.physics.world.collide(this.player.weapon, this.boss, (object1, object2) => {
                        this.player.hasAttacked = true
                        object2.damageEnemy(100);
                    }, () => {
                        return !this.player.hasAttacked;
                    }, this);
                }
            } else if (!this.finalPhase) {
                this.finalPhaseSetup();
            } else {
                if (!this.winner) {
                    if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
                        console.log(`${this.projectilesFired}, ${this.projectilesDestroyed}`);
                    }
                    if (!this.bossHit) {
                        this.boss.moveTo({x: this.player.x, y: this.player.y}, playerMaxVelocity/2);
                    }
                } else {
                    this.destroyObjects();
                    this.scene.start('gameOverScene'); //replace with winner screen MUST FIX
                    this.scene.remove('bossScene');
                }   
            }
        } else {
            this.destroyObjects();
            this.scene.start('gameOverScene');
            this.scene.remove('bossScene');
        }
    }

    destroyObjects() {
        this.time.removeAllEvents(); 
        this.projectileGroup.clear(true, true);
        this.boss.destroyObject();
        this.sound.stopAll();
        this.player.destroy();
    }

    damagePlayer(object1, object2) {
        console.assert(debugFlags.enemyFlag, 'Collision with projectile');
        this.bossCam.shake(500, 0.003 * 1/bossZoom, false);
        //Check if player has hit 0 health
        if (this.player.health.healthNum == 0) {
            this.gameOver = true;
            let health = this.player.healthBar.pop();
            health.destroy();
        } else {
            //SHOULD FIX add player blinking effect here
            object1.canCollide = false;
            object2.destroy();
            this.player.health.updateHealth();
            this.time.delayedCall(2000, () => {
                this.player.canCollide = true;
            }, null, this);
        }
        
    }

    finalPhaseSetup() {
        this.finalPhase = true;
        this.boss.clearEvents();
        this.player.canMove = false;
        this.player.attackDirection = 'w';
        this.boss.setImmovable(false);
        //this.player.setImmovable(false);
        this.player.setDrag(0);
        this.player.setAcceleration(0);
        this.player.setVelocity(0);
        this.boss.setVelocity(0);
        this.player.x = centerX * 1/bossZoom;
        this.player.y = centerY * 1/bossZoom + 200;
        this.player.setDrag(0);
        this.player.setAcceleration(0);
        this.boss.x = this.player.x;
        this.boss.y = this.player.y - 400;
        this.boss.setCollideWorldBounds(true);
        //this.boss.setBounceY(1);

        this.physics.add.collider(this.player, this.boss, (object1, object2) => {
            this.bossCam.shake(500, 0.003 * 1/bossZoom, false);
            //Check if player has hit 0 health
            if (this.player.health.healthNum == 0) {
                this.gameOver = true;
                let health = this.player.healthBar.pop();
                health.destroy();
            } else {
                //SHOULD FIX add player blinking effect here
                object1.canCollide = false;
                this.player.health.updateHealth();
                this.time.delayedCall(2000, () => {
                    this.player.canCollide = true;
                }, null, this);
            }
        }, (object1, object2) => {
            return object1.canCollide;
        }, this);

        this.physics.add.collider(this.player.weapon, this.boss, () => {
            this.player.hasAttacked = true;
            this.boss.y = this.player.weapon.y - 200;
            this.boss.setVelocity(0);
            this.bossHit = true;
            this.time.delayedCall(this.bpms / 2, () => {
                this.bossHit = false;
            }, null, this);
        }, () => {
            return !this.player.hasAttacked;
        }, this.x);

        this.time.delayedCall(this.finalPhaseDuration, () => {
            this.winner = true;
        }, null, this);
    }

    //used to manage the combo system.
    noteComboCheck() {
        let noteCombo = '';
        for (let i = 0; i < this.player.noteBar.length; i++) {
            noteCombo += this.player.noteBar[i].text;
        }
        //add code below to string compare which combo to play
        if (noteCombo == powerChordBar[0].powerChord) {
            console.assert(debugFlags.playerFlag, 'Reverse');
            this.player.particleManager.generateParticles_v2();
            this.physics.world.overlap(this.player.reverseRange, this.projectileGroup, (object1, object2) => {
                object2.redirect();
            }, (object1, object2) => {
                return (!object2.canCollideParent && object2.reverseable);
            }, this);
        } else if (noteCombo == powerChordBar[1].powerChord) { //MUST FIX, WHAT IF PLAYER RESIZES INTO A NARROW ENTRANCE?
            console.assert(debugFlags.playerFlag, 'Shrink');
            if (this.player.canShrink) {
                this.player.setScale(0.5);
                this.player.canShrink = false;
                this.time.delayedCall(3000, () => {
                    this.player.setScale(1.0);
                    this.player.canShrink = true;
                }, null, this);
            }
        } else if (noteCombo == powerChordBar[2].powerChord) {
            console.assert(debugFlags.playerFlag, 'Shield');
            if (!this.player.shieldActive) {
                this.player.shieldActive = true;
                //this.player.shield.setAlpha(1);
                this.tweens.add({
                    targets: this.player.shield,
                    alpha: {from: 0, to: 0.3},
                    scale: {from: 0, to: 1},
                    duration: 1000,
                    repeat: 0,
                });
                this.player.setMaxVelocity(playerMaxVelocity/5);
                this.time.delayedCall(2000, () => {
                    this.player.shieldActive = false;
                    this.player.shield.setAlpha(0);
                    this.player.setMaxVelocity(playerMaxVelocity);
                }, null, this);
            }
        }
        //Reset the bar
        for (let i = 0; i < this.player.noteBar.length; i++) {
            this.player.noteBar[i].setText('');
        }
    }
    //update the notebar
    updatePowerChordList() {
        //empty the list to be recreated. Inefficient
        for (let i = 0; i < this.powerChordList.length; i++) {
            if (this.powerChordList[i] != null) {
                this.powerChordList[i].destroy();
            }  
        }
        //inefficient
        let k = 0;
        for (let i = 0; i < powerChordBar.length; i++) {
            if (powerChordBar[i].unlocked) {
                this.powerChordList[i] = this.add.image(uiOffset.x, (k * noteSize) + uiOffset.y,
                     'powerAtlas', powerChordBar[i].powerChord).setOrigin(0).setDepth(uiDepth);
                k += 1;
            }
        }
    }

    createCams() {
        let cams = createCams(this, this.heartCam, this.noteCam, this.powerChordCam, this.playerCam);
        this.heartCam = cams[0];
        this.noteCam = cams[1];
        this.powerChordCam = cams[2];
        this.bossCam = cams[3];
        this.heartCam.ignore([this.boss.healthBar.healthBar]);
        this.noteCam.ignore([this.boss.healthBar.healthBar, this.projectileGroup]);
        this.powerChordCam.ignore([this.boss.healthBar.healthBar, this.projectileGroup]);
        //this.bossCam.ignore([this.boss.healthBar.healthBar]); leaving in just in case to see if a potential overlap with scene and offscreen elements occures
        this.bossHealthCam = this.cameras.add(0, 0, centerX * bossZoom, 50);
        this.bossHealthCam.setViewport(centerX * 0.65, 0, centerX, 50);
        this.bossHealthCam.setScroll(uiOffset.x, uiOffset.y);
        this.bossHealthCam.ignore([this.player.healthBar, this.powerChordList, this.player.noteBar, this.projectileGroup]);
        this.bossCam.setZoom(bossZoom);
    }

    createSound() {
        this.musicalNoteE = this.sound.add('E', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });

        this.musicalNoteF = this.sound.add('F', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });

        this.musicalNoteG = this.sound.add('G', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });

        this.musicalNoteA = this.sound.add('A', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });

        this.musicalNoteFS = this.sound.add('F_Sharp', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });

        this.bossTheme = this.sound.add('bossTheme', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });

        this.testNoise = this.sound.add('F_Sharp', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
            delay: 10000,
        });
    }
}