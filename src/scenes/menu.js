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
        
    }

    update() {
        this.scene.start('gameScene') 
    }
}