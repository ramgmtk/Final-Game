class Controls extends Phaser.Scene {
    constructor() {
        super('controlScene');
    }

    create() {
        let textConfig  = {
            fontFamily: 'Courier',
            fontSize: '32px',
            color: '#000000',
        }

        this.add.image(0, 0, 'menuBG').setOrigin(0).setDepth(0);
        
        this.add.image(centerX - 250, centerY - 100, 'wasd', null).setOrigin(0.5).setDepth(uiDepth).setScale(1.5);
        this.add.image(centerX + 250, centerY - 100, 'hijkl', null).setOrigin(0.5).setDepth(uiDepth).setScale(1.5);
        this.add.image(centerX, centerY - 75, 'keyAtlas', 'f').setOrigin(0.5).setDepth(uiDepth).setScale(1.5);
        this.add.image(centerX, centerY + 50, 'space', null).setOrigin(0.5).setDepth(uiDepth).setScale(1.5);

        this.add.text(centerX - 325 , centerY - 50, 'Movement', textConfig);
        this.add.text(centerX + 175 , centerY - 50, 'Play Note', textConfig);
        this.add.text(centerX - 50, centerY - 25, 'Melee', textConfig);
        this.add.text(centerX - 88, centerY + 100, 'Play Note Combo', textConfig);

        let backButton  = this.add.image(centerX, game.config.height - 200, 'backButton', null).setOrigin(0.5).setDepth(uiDepth);
        backButton.setInteractive();
        backButton.on('pointerover', () => {
            backButton.setScale(1.5);
        });
        backButton.on('pointerout', () => {
            backButton.setScale(1.0);
        });
        backButton.on('pointerdown', () => {
            this.scene.start('menuScene');
        });
    }
}