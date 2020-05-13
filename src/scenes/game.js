class Game extends Phaser.Scene {
    constructor() {
        super('gameScene')
    }

    preload() {
        //SHOULD FIX by moving to menu preload at a later point in time.
        //Loading placeholder variables
        this.load.path = './assets/';
        this.load.atlas(playerAtlas, 'spritesheet.png', 'sprites.json');
        this.load.image('bg', 'bg.png');
        this.load.image('heart', 'heart.png')
        this.load.image('projectile', 'projectile.png');
        this.load.image('shield', 'shield.png');

        //sound
        this.load.audio('E', 'sounds/Short_E.wav');
        this.load.audio('F', 'sounds/Short_F.wav');
        this.load.audio('G', 'sounds/Short_G.wav');
        this.load.audio('F_Sharp', 'sounds/Short_F_Sharp.wav');
        this.load.audio('A', 'sounds/Short_A.wav')
    }
    create() {
        //misc
        this.gameOver = false;
        //BACKGROUND
        this.add.image(0, 0, 'bg').setOrigin(0);
        this.stageInfo = this.textures.get('bg');
        this.stageInfo = this.stageInfo.getSourceImage();
        this.heartInfo = this.textures.get('heart').getSourceImage();
        this.physics.world.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height)
        //PLAYER RELATED VARIABLES
        //key controls
        this.playerSpriteInfo = game.textures.getFrame(playerAtlas, 'sprite5');
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
        this.player = new Player(this, centerX, centerY, playerAtlas, 'sprite5');

        //CAMERA SETUP
        //How far the camera can go within the world.
        this.playerCam = this.cameras.main.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height);
        //The actual lens through which we see the game.
        this.playerCam.setViewport(0, 0, game.config.width, game.config.height);
        //how the camera follows the player
        this.playerCam.startFollow(this.player, true, 1.0, 1.0);
        //wiggle room for the camera
        this.playerCam.setDeadzone(this.playerSpriteInfo.width * 2, this.playerSpriteInfo.height * 2);
        this.playerCam.setName('Player');

        //UI ELEMENTS
        
        this.healthBar = [];
        this.createHealthBar();
        console.assert(debugFlags.uiFlag, this.healthBar);

        this.songBar = this.add.group({
            scene: this,
        });

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
        let enemy = new Enemy(this, centerX + 300, centerY, playerAtlas, 50, 'sprite5');
        this.enemyGroup.add(enemy);
        this.physics.add.collider(this.player, this.enemyGroup);
        
        //ANIMATIONS
        //Animations for the different animation states of the player
        //Left, Right, Up, Down movement, as well as playing a note.
        this.createAnimations();

        //SOUND
        this.createSound();
    }

    update() {
        if (!this.gameOver) {
            this.player.update();
            if (this.enemy != null){
                this.enemy.update();
            }
            if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
                this.noteComboCheck();
            }
            this.physics.world.collide(this.player, this.projectileGroup, this.damagePlayer, (object1, object2) => {
                return object1.canCollide && !object2.canCollideParent ? true : false;
            }, this);

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
        }
    }

    //callback function for if the player gets hit by projectile
    //object1 should correspond to player
    //object2 is the projectile that has hit the player
    damagePlayer(object1, object2) {
        console.assert(debugFlags.enemyFlag, 'Collision with projectile');
        let heart = this.healthBar.pop();
        this.playerCam.shake(500, 0.003, false);
        heart.destroy();
        //Check if player has hit 0 health
        if (this.healthBar.length == 0) {
            this.time.removeAllEvents(); //clears the event calls
            this.enemyGroup.clear(true, true);
            this.projectileGroup.clear(true, true);
            this.gameOver = true;
        } else {
            //SHOULD FIX add player blinking effect here
            object1.canCollide = false;
            object2.destroy();
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

    //Initial setup of the healthbar
    createHealthBar() {
        for (let i = 0; i < playerHealth; i++) {
            this.healthBar.push(this.add.image(i * this.heartInfo.width, 0, 'heart').setOrigin(0).setDepth(uiDepth).setScrollFactor(0));
        }
    }

    //used to manage the combo system.
    noteComboCheck() {
        let noteCombo = '';
        for (let i = 0; i < this.player.noteBar.length; i++) {
            noteCombo += this.player.noteBar[i].text;
        }
        //add code below to string compare which combo to play
        if (noteCombo == 'jkl') {
            console.assert(debugFlags.playerFlag, 'Reverse');
            for(let i = 0; i < this.projectileGroup.children.entries.length; i++) {
                this.projectileGroup.children.entries[i].redirect();
            }
        } else if (noteCombo == 'hij') { //MUST FIX, WHAT IF PLAYER RESIZES INTO A NARROW ENTRANCE?
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
        } else if (noteCombo == 'khi') {
            console.assert(debugFlags.playerFlag, 'Shield');
            if (!this.player.shieldActive) {
                this.player.shieldActive = true;
                this.player.shield.setAlpha(1);
                this.player.setMaxVelocity(playerMaxVelocity/2);
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

    createAnimations() {
        this.anims.create({
            key: 'left',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite1'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'right',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite2'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'up',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite3'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'down',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite4'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'play',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite5'},
            ],
            duration: 2000,
        });

        this.anims.create({
            key: 'melee',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite5'},
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