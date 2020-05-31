class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    preload() {
        let loading = this.add.graphics();
        this.load.on('progress', (value) => {
            loading.fillStyle(0xffffff, 1);
            loading.fillRect(game.config.width * 0.1, centerY - 20, game.config.width * 0.8, 40)
            loading.fillStyle(0x00ff00, 1);
            loading.fillRect(game.config.width * 0.1, centerY - 20, game.config.width * 0.8 * value, 40);
        });

        this.load.on('complete', ()=> {
            loading.destroy();
        });

        //image data
        this.load.path = './assets/atlas/';
        this.load.atlas(playerAtlas, 'PlaceholderSprites.png', 'PlaceholderSprites.json');
        this.load.atlas('ampAtlas', 'Amp_Atk.png', 'Amp_Atk.json');
        this.load.atlas('mcAtlas', 'MC_Animations.png', 'MC_Animations.json')
        this.load.atlas('bossAtlas', 'BossSprite.png', 'BossSprite.json');
        this.load.atlas('healthAtlas', 'health.png', 'health.json');
        this.load.atlas('powerAtlas', 'powerchords.png', 'powerchords.json');
        this.load.atlas('keyAtlas', 'keys.png', 'keys.json');
        this.load.path = './assets/tilemap/';
        this.load.image('tutorial_tile', 'Tile_Sheet_v2.png');
        this.load.tilemapTiledJSON('tutorial_map', 'Tutorial1.json');

        this.load.path = './assets/Menu/';
        this.load.image('backButton', 'back.png');
        this.load.image('controlsButton', 'controls.png');
        this.load.image('gameoverButton', 'gameover.png');
        this.load.image('playButton', 'play.png');
        this.load.image('restartButton', 'restart.png');
        this.load.image('upButton', 'up.png');
        this.load.image('downButton', 'down.png');
        this.load.image('volumeButton', 'volume.png');
        this.load.image('hijkl', 'hijkl.png');
        this.load.image('wasd', 'wasd.png');
        this.load.image('space', 'space.png');

        this.load.path = './assets/';
        this.load.image('bg', 'bg.png');
        this.load.image('shield', 'shield.png');
        this.load.image('invertedProjectile', 'invertedProjectile.png')
        this.load.image('reverse', 'reverse.png');
        this.load.image('Note Bar', 'Note_Bar.png')

        //sound
        this.load.path = './assets/sounds/';
        this.load.audio('E', 'Short_E.wav');
        this.load.audio('F', 'Short_F.wav');
        this.load.audio('G', 'Short_G.wav');
        this.load.audio('F_Sharp', 'Short_F_Sharp.wav');
        this.load.audio('A', 'Short_A.wav')
        this.load.audio('gameMusic', 'main_theme.wav');
        this.load.audio('AmpAttack', 'AmpAttackMod.wav')
        this.load.audio('bossTheme1', 'Boss_theme.wav');
        this.load.audio('bossTheme2', 'Boss_theme2.wav');
        this.load.audio('bossTheme3', 'Boss_theme3.wav');
        this.load.audio('bossTransition1', 'First_Boss_Transition.wav');
        this.load.audio('bossTransition2', 'Second_Boss_Transition.wav');
    }

    create() {
        this.createAnimations();
        /*let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        this.add.text(centerX , centerY - 32, 'Final Game Prototype' , menuConfig).setOrigin(.5);
        this.add.text(centerX, centerY, 'WASD to move, F melee attack, hijkl note keys', menuConfig).setOrigin(0.5);
        this.add.text(centerX, centerY + 32, 'Press SPACE to play song / start', menuConfig).setOrigin(0.5);*/

        let volumeLevel = audio * 10;
        let playButton = this.add.image(centerX, centerY, 'playButton', null).setOrigin(0.5).setDepth(uiDepth);
        let controlsButton = this.add.image(centerX, centerY + 150, 'controlsButton', null).setOrigin(0.5).setDepth(uiDepth);
        let volumeControl = this.add.image(centerX - 64, centerY + 350, 'volumeButton', null).setOrigin(0.5).setDepth(uiDepth);
        let upButton = this.add.image(centerX + 218/2, centerY + 286, 'upButton', null).setOrigin(0.5).setDepth(uiDepth);
        let downButton = this.add.image(centerX + 218/2, centerY + 414, 'downButton', null).setOrigin(0.5).setDepth(uiDepth);

        let volume = this.add.text(centerX + 218/2, centerY + 350, `${volumeLevel}`, {
            fontFamily: 'Courier',
            fontSize: '64px',
            color: '#ffffff',

        }).setOrigin(0.5).setDepth(uiDepth);

        playButton.setInteractive();
        playButton.on('pointerover', () => {
            playButton.setScale(1.5);
        });
        playButton.on('pointerout', () => {
            playButton.setScale(1.0);
        });
        playButton.on('pointerdown', () => {
            this.scene.add('gameScene', Game);
            this.scene.add('bossScene', BossRoom);
            this.scene.start('gameScene');
        });

        controlsButton.setInteractive();
        controlsButton.on('pointerover', () => {
            controlsButton.setScale(1.5);
        });
        controlsButton.on('pointerout', () => {
            controlsButton.setScale(1.0);
        });
        controlsButton.on('pointerdown', () => {
            this.scene.start('controlScene');
        })

        upButton.setInteractive();
        upButton.on('pointerover', () => {
            upButton.setScale(1.5);
        });
        upButton.on('pointerout', () => {
            upButton.setScale(1.0);
        });

        //Credit to user m93a for explanation of math.round
        //https://stackoverflow.com/questions/2283566/how-can-i-round-a-number-in-javascript-tofixed-returns-a-string
        upButton.on('pointerdown', () => {
            if (audio < 1.0) {
                audio += 0.1;
                audio = Math.round(audio * 1e1) / 1e1;
                volumeLevel = audio * 10;
                volume.setText(`${volumeLevel}`);
            }
        });

        downButton.setInteractive();
        downButton.on('pointerover', () => {
            downButton.setScale(1.5);
        });
        downButton.on('pointerout', () => {
            downButton.setScale(1.0);
        });
        downButton.on('pointerdown', () => {
            if (audio > 0.0) {
                audio -= 0.1;
                audio = Math.round(audio * 1e1) / 1e1;
                volumeLevel = audio * 10;  
                volume.setText(`${volumeLevel}`);
            }
        });
    }

    createAnimations() {

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'idle',
                start: 1,
                end: 5,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'run',
                start: 1,
                end: 6,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'runUp',
                start: 1,
                end: 5,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'runDown',
                start: 1,
                end: 5,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'play',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'playG',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
        });

        this.anims.create({
            key: 'melee',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'atkMC',
                start: 1,
                end: 7,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
        });

        this.anims.create({
            key: 'meleeUp',
            frames: this.anims.generateFrameNames('mcAtlas', {
                prefix: 'atkUp',
                start: 1,
                end: 5,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
        });

        this.anims.create({
            key: 'AmpIdleForward',
            frames: this.anims.generateFrameNames('ampAtlas', {
                prefix: 'atk',
                start: 1,
                end: 3,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'AmpIdleSide',
            frames: this.anims.generateFrameNames('ampAtlas', {
                prefix: 'sideAtk',
                start: 1,
                end: 3,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'AmpAttackForward',
            frames: this.anims.generateFrameNames('ampAtlas', {
                prefix: 'atk',
                start: 1,
                end: 6,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
        });

        this.anims.create({
            key: 'AmpAttackSide',
            frames: this.anims.generateFrameNames('ampAtlas', {
                prefix: 'sideAtk',
                start: 1,
                end: 6,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
        });

        this.anims.create({
            key: 'bossIdle',
            frames: this.anims.generateFrameNames('bossAtlas', {
                prefix: 'idleB',
                start: 1,
                end: 9,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
            repeat: -1,
        });

        this.anims.create({
            key: 'bossAttackFast',
            frames: this.anims.generateFrameNames('bossAtlas', {
                prefix: 'bAtk',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325,
        });

        this.anims.create({
            key: 'bossAttackSlow',
            frames: this.anims.generateFrameNames('bossAtlas', {
                prefix: 'bAtk',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325 * 4,
        });

        this.anims.create({
            key: 'bossMove',
            frames: this.anims.generateFrameNames('bossAtlas', {
                prefix: 'bSideAtk',
                start: 1,
                end: 7,
                suffix: '',
                zeroPad: 0,
            }),
            duration: 325 * 2,
            yoyo: true,
        });
    }

}