class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    preload() {
        let loading = this.add.graphics();
        loading.fillStyle(0xffffff, 1);
        loading.fillRect(game.config.width * 0.1, centerY - 20, game.config.width * 0.8, 40)
        this.load.on('progress', (value) => {
            loading.fillStyle(0x00ff00, 1);
            loading.fillRect(game.config.width * 0.1, centerY - 20, game.config.width * 0.8 * value, 40);
        });

        this.load.on('complete', ()=> {
            loading.destroy();
        });

        //image data
        this.load.path = './assets/atlas/';
        this.load.atlas(playerAtlas, 'PlaceholderSprites.png', 'PlaceholderSprites.json');
        this.load.atlas('bossAtlas', 'BossSprite.png', 'BossSprite.json');
        this.load.atlas('healthAtlas', 'health.png', 'health.json');
        this.load.atlas('powerAtlas', 'powerchords.png', 'powerchords.json');
        this.load.atlas('keyAtlas', 'keys.png', 'keys.json');
        this.load.path = './assets/tilemap/';
        this.load.image('tutorial_tile', 'Tile_Sheet_v2.png');
        this.load.tilemapTiledJSON('tutorial_map', 'Tutorial1.json')
        this.load.path = './assets/';
        this.load.image('bg', 'bg.png');
        this.load.image('shield', 'shield.png');
        this.load.image('invertedProjectile', 'invertedProjectile.png')
        this.load.image('reverse', 'reverse.png');

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
        this.load.audio('bossTransition1', 'First_Boss_Transition.wav')
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