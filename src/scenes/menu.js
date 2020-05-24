class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    preload() {
        //image data
        this.load.path = './assets/atlas/';
        this.load.atlas(playerAtlas, 'PlaceholderSprites.png', 'PlaceholderSprites.json');
        this.load.atlas('bossAtlas', 'BossSprite.png', 'BossSprite.json');
        this.load.atlas('healthAtlas', 'health.png', 'health.json');
        this.load.path = './assets/tilemap/';
        this.load.image('tutorial_tile', 'Tile Sheet.png');
        this.load.tilemapTiledJSON('tutorial_map', 'Tutorial.json')
        this.load.path = './assets/';
        this.load.image('bg', 'bg.png');
        this.load.image('shield', 'shield.png');

        //sound
        this.load.path = './assets/sounds/';
        this.load.audio('E', 'Short_E.wav');
        this.load.audio('F', 'Short_F.wav');
        this.load.audio('G', 'Short_G.wav');
        this.load.audio('F_Sharp', 'Short_F_Sharp.wav');
        this.load.audio('A', 'Short_A.wav')
        this.load.audio('gameMusic', 'main_theme.wav');
        this.load.audio('AmpAttack', 'AmpAttackMod.wav')
        this.load.audio('bossTheme', 'Boss_theme.wav');
    }

    create() {
        this.createAnimations();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        let menuConfig = {
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
        this.add.text(centerX, centerY + 32, 'Press SPACE to play song / start', menuConfig).setOrigin(0.5);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.add('gameScene', Game);
            this.scene.add('bossScene', BossRoom);
            this.scene.start('gameScene');
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

}