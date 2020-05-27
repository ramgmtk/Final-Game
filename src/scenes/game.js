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
        this.exitWorld = false;
        this.shrinkDuration = 0;
        this.canRevert = true;
        //BACKGROUND
        const map = this.add.tilemap('tutorial_map');
        const tileset = map.addTilesetImage('tutorial_level', 'tutorial_tile');

        //const backgroundLayer = map.createStaticLayer('Background_Layer', tileset, 0, 0);
        const levelLayer = map.createStaticLayer('Wall_Layer', tileset, 0, 0);
        this.levelLayer = levelLayer;
        this.stageInfo = {
            width: map.widthInPixels,
            height: map.heightInPixels,
        }
        this.heartInfo = game.textures.getFrame('healthAtlas', 'health4');
        this.physics.world.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height);

        levelLayer.setCollisionByProperty({collides: true});
        const debugGraphics = this.add.graphics().setAlpha(0.75)
        /*levelLayer.renderDebug(debugGraphics, {
            tileColor: new Phaser.Display.Color(125, 125, 240, 255),
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),

        });*/
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
        this.pSpawn = map.findObject('Object_Layer',  (obj) => obj.name === 'pSpawn')
        this.player = new Player(this, this.pSpawn.x, this.pSpawn.y, playerAtlas, 'MCidle', 'Note');

        this.physics.add.collider(this.player, levelLayer);
        /*this.physics.add.overlap(this.player.normalBody, levelLayer, () => {
            this.canRevert = false;
        }, (object1, object2) => {
            return object2.collides == true && !this.canShrink;
        }, this);*/

        //UI ELEMENTS
        //this.powerChordList = new Array(powerChordBar.length);
        this.powerChordList = [];
        this.updatePowerChordList();

        //ENEMIES
        this.projectileGroup = this.add.group({
            scene: this,
            runChildUpdate: true,
        });
        console.assert(debugFlags.enemyFlag, this.projectileGroup);
        this.physics.add.collider(this.projectileGroup, levelLayer, (object1, object2) => {
            object1.destroy();
        }, null, this);
        
        this.enemyGroup = this.add.group({
            scene: this,
            runChildUpdate: true,
        });
        let eSpawnString = 'eSpawn0';
        for (let i = 0; i < 3; i++) {
            eSpawnString = eSpawnString.slice(0, -1);
            eSpawnString = eSpawnString + (i + 1).toString();
            let eSpawn = map.findObject('Object_Layer', (obj) => obj.name == eSpawnString);
            let enemy = new Enemy(this, eSpawn.x, eSpawn.y, playerAtlas, 10, 'AMPidle');
            this.enemyGroup.add(enemy);
        }

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
        const bEnt = map.findObject('Object_Layer', (obj) => obj.name === 'bEntrance');
        this.bossEntrance = new Phaser.Physics.Arcade.Sprite(this, bEnt.x, bEnt.y, playerAtlas, 'Note').setDepth(uiDepth - 1);
        this.physics.add.existing(this.bossEntrance);
        this.bossEntrance.setImmovable(true);
        this.add.existing(this.bossEntrance);

        //test vars
        this.projectilesFired = 0;
        this.projectilesDestroyed = 0;
    }

    update() {
        if (!this.exitWorld) {
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
                    this.player.hasAttacked = true
                    object2.damageEnemy(3);
                }, () => {
                    return !this.player.hasAttacked;
                }, this);
            }
            if (this.player.shieldActive) {
                this.physics.world.overlap(this.player.shield, this.projectileGroup, (object1, object2) => {
                    object2.destroy();
                }, null, this);
            }

            //test collider for scene exit
            this.physics.world.collide(this.player, this.bossEntrance, () => {
                this.exitWorld = true;
            }, null, this);
        } else {
            this.destroyObjects();
            if (this.gameOver) {
                this.scene.start('gameOverScene');
                this.scene.remove('bossScene');
                
            } else {
                this.scene.start('bossScene');
            }
            this.scene.remove('gameScene');
        }
    }

    destroyObjects() {
        this.time.removeAllEvents(); 
        this.enemyGroup.clear(true, true)
        this.projectileGroup.clear(true, true);
        this.sound.stopAll();
        this.player.destroy();
    }

    //callback function for if the player gets hit by projectile
    //object1 should correspond to player
    //object2 is the projectile that has hit the player
    damagePlayer(object1, object2) {
        console.assert(debugFlags.enemyFlag, 'Collision with projectile');
        this.playerCam.shake(500, 0.003, false);
        //Check if player has hit 0 health
        if (this.player.health.healthNum == 0) {
            this.gameOver = true;
            this.exitWorld = true;
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
                /*this.powerChordList[k] = this.add.image(uiOffset.x, (k * noteSize) + uiOffset.y,
                     'powerAtlas', powerChordBar[i].powerChord).setOrigin(0).setDepth(uiDepth);
                k += 1;*/
                this.powerChordList[i] = this.add.image(uiOffset.x, (i * noteSize) + uiOffset.y,
                     'powerAtlas', powerChordBar[i].powerChord).setOrigin(0).setDepth(uiDepth);
            } else {
                this.powerChordList[i] = this.add.image(uiOffset.x, (k * noteSize) + uiOffset.y,
                     null, null).setOrigin(0).setDepth(uiDepth).setAlpha(0);
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
                this.time.delayedCall(3000, this.shrinkCallback, null, this);
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

    //SHOULD FIX, IT IS POSSIBLE TO CRASH THE GAME IF THE PLAYERS BODY REMAINS IN A TIGHT SPACE;
    //TEMPORARY FIX IS SENDING PLAYER BACK TO SPAWN IF THEY REMAIN FOR TOO LONG.
    shrinkCallback() {
        //THE CURRENT STRUCTURE ASSUMS THAT CENTERX CENTERY WILL NOT HAVE ANYTHING THE PLAYER CAN COLLIDE WITH.
        if (this.shrinkDuration > 12000) {
            this.player.x = this.pSpawn.x
            this.player.y = this.pSpawn.y
            this.shrinkDuration = 0;
            this.player.setScale(1.0);
            this.player.canShrink = true;
            this.canRevert = true;
            return;
        } else if (this.physics.world.overlap(this.player.normalBody, this.levelLayer, () => { //LOOK INTO BODY onWall() , onCeiling() SHOULD FIX
            this.canRevert = false;
        }, (object1, object2) => {
            return object2.collides == true && !this.canShrink;
        }, this)) {
            console.assert(debugFlags.playerFlag, 'Bodies overlapping')
            this.shrinkDuration += 3000;
            this.time.delayedCall(3000, this.shrinkCallback, null, this);
        } else {
            this.shrinkDuration = 0;
            this.player.setScale(1.0);
            this.player.canShrink = true;
            this.canRevert = true;
        }
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