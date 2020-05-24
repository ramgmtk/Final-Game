class Game extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }

    /*preload() {
        //SHOULD FIX by moving to menu preload at a later point in time.   
    }*/
    create() {
        //misc
        this.gameOver = false;
        this.shrinkDuration = 0;;
        //BACKGROUND
        let bg = this.add.image(0, 0, 'bg').setOrigin(0);
        this.stageInfo = this.textures.get('bg');
        this.stageInfo = this.stageInfo.getSourceImage();
        this.heartInfo = game.textures.getFrame('healthAtlas', 'health4');
        this.physics.world.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height);
        //PLAYER RELATED VARIABLES
        //key controls
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
        
        //CREATE THE PLAYER
        this.player = new Player(this, centerX, centerY, playerAtlas, 'MCidle', 'Note');

        //UI ELEMENTS
        this.powerChordList = new Array(powerChordBar.length);
        this.updatePowerChordList();

        //ENEMIES
        this.projectileGroup = this.add.group({
            scene: this,
            runChildUpdate: true,
        });
        console.assert(debugFlags.enemyFlag, this.projectileGroup);
        
        this.enemyGroup = this.add.group({
            scene: this,
            runChildUpdate: true,
        })
        let enemy = new Enemy(this, centerX + 300, centerY, playerAtlas, 50, 'AMPidle');
        this.enemyGroup.add(enemy);
        
        //ANIMATIONS
        //Animations for the different animation states of the player
        //Left, Right, Up, Down movement, as well as playing a note.
        this.createAnimations();

        //SOUND
        this.bgm;
        this.musicalNoteA;
        this.musicalNoteE;
        this.musicalNoteF;
        this.musicalNoteFS;
        this.musicalNoteG;
        this.createSound();
        this.bgm.play();

        //CAMERA SETUP
        this.playerCam;
        this.noteCam;
        this.heartCam;
        this.powerChordCam;
        let cams = createCams(this, this.heartCam, this.noteCam, this.powerChordCam, this.playerCam);
        this.heartCam = cams[0];
        this.noteCam = cams[1];
        this.powerChordCam = cams[2];
        this.playerCam = cams[3];

        //test
        this.bossEntrance = new Phaser.Physics.Arcade.Sprite(this, centerX, centerY + 300, playerAtlas, 'Note').setDepth(uiDepth - 1);
        this.physics.add.existing(this.bossEntrance);
        this.add.existing(this.bossEntrance);

        
    }

    update() {
        if (!this.gameOver) {
            //player actions
            this.player.update();
            if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
                this.noteComboCheck();
            }

            //projectile collider
            this.physics.world.collide(this.player, this.projectileGroup, this.damagePlayer, (object1, object2) => {
                return object1.canCollide && !object2.canCollideParent ? true : false;
            }, this);

            //Player Specific action colliders.
            if (this.player.isAttacking) {
                this.physics.world.collide(this.player.weapon, this.enemyGroup, (object1, object2) => {
                    object2.damageEnemy();
                }, null, this);
            }
            if (this.player.shieldActive) {
                this.physics.world.collide(this.player.shield, this.projectileGroup, (object1, object2) => {
                    object2.destroy();
                }, null, this);
            }

            //test collider for scene exit
            this.physics.world.collide(this.player, this.bossEntrance, () => {
                this.destroyObjects();
                this.sound.stopAll();
                this.scene.start('bossScene', {test: this.player});
            }, null, this);
        } else {
            this.destroyObjects();
            this.sound.stopAll();
            this.scene.start('gameOverScene');
        }
    }

    destroyObjects() {
        this.time.removeAllEvents(); 
        this.enemyGroup.clear(true, true)
        this.projectileGroup.clear(true, true);
    }

    //callback function for if the player gets hit by projectile
    //object1 should correspond to player
    //object2 is the projectile that has hit the player
    damagePlayer(object1, object2) {
        console.assert(debugFlags.enemyFlag, 'Collision with projectile');
        this.playerCam.shake(500, 0.003, false);
        //Check if player has hit 0 health
        if (this.player.health.healthNum == 0) {
            let health = this.player.healthBar.pop();
            health.destroy();
            this.time.removeAllEvents(); //clears the event calls
            this.enemyGroup.clear(true, true);
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
                     `${powerChordBar[i].powerChord}:${powerChordBar[i].name}`, noteTextConfig).setOrigin(0).setDepth(uiDepth);
                k += 1;
            }
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
                    callback: this.shrinkCallback,
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

    //SHOULD FIX, IT IS POSSIBLE TO CRASH THE GAME IF THE PLAYERS BODY REMAINS IN A TIGHT SPACE;
    //TEMPORARY FIX IS SENDING PLAYER BACK TO SPAWN IF THEY REMAIN FOR TOO LONG.
    shrinkCallback() {
        //THE CURRENT STRUCTURE ASSUMS THAT CENTERX CENTERY WILL NOT HAVE ANYTHING THE PLAYER CAN COLLIDE WITH.
        if (this.shrinkDuration > 12000) {
            this.player.x = centerX;
            this.player.y = centerY;
            this.shrinkDuration = 0;
            this.player.setScale(1.0);
            this.player.canShrink = true;
            return;
        } else if (this.physics.world.overlap(this.player.normalBody, this.enemyGroup, () => {
            this.shrinkDuration += 3000;
            this.time.addEvent({
                delay: 3000,
                callback: this.shrinkCallback,
                callbackScope: this,
                loop: false,
            })
        }, () => {
            return !this.player.canShrink;
        }, this)) {
            console.assert(debugFlags.playerFlag, 'Bodies overlapping')
        } else {
            this.shrinkDuration = 0;
            this.player.setScale(1.0);
            this.player.canShrink = true;
        }
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

        this.bgm = this.sound.add('gameMusic', {
            mute: false,
            volume: 0.5,
            rate: 1.0,
            loop: true,
        });

        this.enemySound = this.sound.add('AmpAttack', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });
    }
}