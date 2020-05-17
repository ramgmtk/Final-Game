class BossRoom extends Phaser.Scene {
    constructor() {
        super('bossScene');
    }

    init(data) {
        console.log('entered bossScene');
        this.gameData = data;
    }

    create() {
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
        this.player = new Player(this, centerX, centerY, playerAtlas, 'MCidle');
        //UI ELEMENTS
        this.healthBar = [];
        this.createHealthBar();
        console.assert(debugFlags.uiFlag, this.healthBar);

        this.powerChordList = new Array(powerChordBar.length);
        this.updatePowerChordList();

        //ENEMIES
        this.projectileGroup = this.add.group({
            scene: this,
            runChildUpdate: true,
        });
        console.assert(debugFlags.enemyFlag, this.projectileGroup);

        //animations
        this.createAnimations();
        this.createSound();

        //camera setup
        //CAMERA SETUP
        this.bossCam;
        this.noteCam;
        this.heartCam;
        this.powerChordCam;
        this.createCams();
        this.bossCam.setZoom(0.5);
    }

    update() {
        this.player.update();
        if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
            this.noteComboCheck();
        }
        if (this.player.shieldActive) {
            this.physics.world.collide(this.player.shield, this.projectileGroup, (object1, object2) => {
                object2.destroy();
            }, null, this);
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
                this.projectileGroup.children.entries[i].redirect();
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

    //Initial setup of the healthbar
    createHealthBar() {
        for (let i = 0; i < playerHealth; i++) {
            this.healthBar.push(this.add.image(i * this.heartInfo.width + uiOffset.x, 0 + uiOffset.y, 'heart').setOrigin(0).setDepth(uiDepth));//.setScrollFactor(0));
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
        this.heartCam = this.cameras.add(0, 0, 200, 200);
        this.heartCam.setViewport(0, 0, this.heartInfo.width * 3, this.heartInfo.height);
        this.heartCam.setScroll(uiOffset.x, uiOffset.y);
        this.heartCam.ignore([this.player.noteBar, this.powerChordList]);

        this.noteCam = this.cameras.add(0, 0, 200, 200);
        this.noteCam.setViewport(0, this.heartInfo.height, noteSize * noteQueueSize, noteSize);
        this.noteCam.setScroll(uiOffset.x, uiOffset.y);
        this.noteCam.ignore([this.healthBar, this.powerChordList]);

        this.powerChordCam = this.cameras.add(0, 0, 200, 200);
        this.powerChordCam.setViewport(game.config.width - (noteQueueSize * noteSize), 0, noteSize * noteQueueSize, noteSize * powerChordBar.length);
        this.powerChordCam.setScroll(uiOffset.x, uiOffset.y)
        this.powerChordCam.ignore([this.healthBar, this.player.noteBar]);
        //How far the camera can go within the world.p
        this.bossCam = this.cameras.main.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height);
        //The actual lens through which we see the game.
        this.bossCam.setViewport(0, 0, game.config.width, game.config.height);
        this.bossCam.startFollow(this.player, true, 1.0, 1.0);
        //wiggle room for the camera
        this.bossCam.setDeadzone(this.playerSpriteInfo.width * 2, this.playerSpriteInfo.height * 2);
        this.bossCam.setName('BossCam');
        //this.bossCam.ignore([this.healthBar, this.player.noteBar, this.powerChordList]);

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