class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    
    preload() {
        this.load.path = './assets/';
        this.load.atlas(playerAtlas, 'PlaceholderSprites.png', 'PlaceholderSprites.json');
        this.load.atlas('bossAtlas', 'BossSprite.png', 'BossSprite.json');
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
        this.add.text(centerX, centerY + 32, 'Press SPACE to start', menuConfig).setOrigin(0.5);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start('gameScene')
        } 
    }
}