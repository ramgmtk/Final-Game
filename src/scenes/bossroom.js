class BossRoom extends Phaser.Scene {
    constructor() {
        super('bossScene');
    }

    init(data) {
        console.log('entered bossScene');
        this.gameData = data;
    }

    create() {
        this.gameOver = false;
        this.heartInfo = this.textures.get('heart').getSourceImage();
        this.stageInfo = {
            width: game.config.width * 2,
            height: game.config.height * 2,
        }
        this.physics.world.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height)
        this.playerSpriteInfo = game.textures.getFrame(playerAtlas, 'MCidle');
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
        this.boss = new Boss(this, bossPatternPoints[0].x, bossPatternPoints[0].y, 'bossAtlas', 'BOSSidle', this.player);
        console.assert(debugFlags.enemyFlag, this.projectileGroup);

        //animations
        this.createAnimations();
        this.createSound();

        //camera setup
        //CAMERA SETUP
        this.bossCam;
        this.bossHealthCam;
        this.noteCam;
        this.heartCam;
        this.powerChordCam;
        this.createCams();
    }

    update() {
        if (!this.gameOver) {
            this.player.update();
            this.boss.update();
            //projectile collider
            this.physics.world.collide(this.player, this.projectileGroup, this.damagePlayer, (object1, object2) => {
                return object1.canCollide && !object2.canCollideParent ? true : false;
            }, this);
            if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
                this.noteComboCheck();
            }
            if (this.player.shieldActive) {
                this.physics.world.collide(this.player.shield, this.projectileGroup, (object1, object2) => {
                    object2.destroy();
                }, null, this);
            }
        }
    }

    damagePlayer(object1, object2) {
        console.assert(debugFlags.enemyFlag, 'Collision with projectile');
        this.bossCam.shake(500, 0.003, false);
        //Check if player has hit 0 health
        if (this.player.health.healthNum == 0) {
            let health = this.player.healthBar.pop();
            health.destroy();
            this.time.removeAllEvents(); //clears the event calls
            this.boss.destroyObject();
            this.projectileGroup.clear(true, true);
            this.gameOver = true;
        } else {
            //SHOULD FIX add player blinking effect here
            object1.canCollide = false;
            object2.destroy();
            this.player.health.updateHealth();
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    this.player.canCollide = true;
                },
                callbackScope: this,
                loop: false
            });
        }
        
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
            for(let i = 0; i < this.projectileGroup.children.entries.length; i++) {
                if (this.projectileGroup.children.entries[i].canCollideParent == false) {
                    this.projectileGroup.children.entries[i].redirect();
                }
            }
        } else if (noteCombo == powerChordBar[1].powerChord) { //MUST FIX, WHAT IF PLAYER RESIZES INTO A NARROW ENTRANCE?
            console.assert(debugFlags.playerFlag, 'Shrink');
            if (this.player.canShrink) {
                this.player.setScale(0.5);
                this.player.canShrink = false;
                this.time.addEvent({
                    delay: 3000,
                    callback: () => {
                        this.player.setScale(1.0);
                        this.player.canShrink = true;
                    },
                    callbackScope: this,
                    loop: false,
                });
            }
        } else if (noteCombo == powerChordBar[2].powerChord) {
            console.assert(debugFlags.playerFlag, 'Shield');
            if (!this.player.shieldActive) {
                this.player.shieldActive = true;
                this.player.shield.setAlpha(1);
                this.player.setMaxVelocity(playerMaxVelocity/5);
                this.time.addEvent({
                    delay: 2000,
                    callback: () => {
                        this.player.shieldActive = false;
                        this.player.shield.setAlpha(0);
                        this.player.setMaxVelocity(playerMaxVelocity);
                    },
                    callbackScope: this,
                    loop: false,
                });
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
                this.powerChordList[i] = this.add.text(0 + uiOffset.x, (k * noteSize) + uiOffset.y,
                     powerChordBar[i].powerChord, noteTextConfig).setOrigin(0).setDepth(uiDepth);
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
        this.noteCam.ignore([this.boss.healthBar.healthBar]);
        this.powerChordCam.ignore([this.boss.healthBar.healthBar]);
        //this.bossCam.ignore([this.boss.healthBar.healthBar]); leaving in just in case to see if a potential overlap with scene and offscreen elements occures
        this.bossHealthCam = this.cameras.add(0, 0, centerX, 200);
        this.bossHealthCam.setViewport(centerX / 2, 0, centerX, 50);
        this.bossHealthCam.setScroll(uiOffset.x, uiOffset.y);
        this.bossHealthCam.ignore([this.player.healthBar, this.powerChordList, this.player.noteBar]);
        this.bossCam.setZoom(bossZoom);
    }

    createAnimations() {
        this.anims.create({
            key: 'left',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'MCrun'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'right',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'MCrun'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'up',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'MCidle'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'down',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'MCidle'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'play',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'MCplay'},
            ],
            duration: 2000,
        });

        this.anims.create({
            key: 'melee',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'MCplay'},
            ],
            duration: 500,
        });
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
    }
}