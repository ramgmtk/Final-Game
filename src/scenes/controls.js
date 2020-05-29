class Controls extends Phaser.Scene {
    constructor() {
        super('controlScene');
    }

    create() {
        let textConfig  = {
            fontFamily: 'Courier',
            fontSize: '32px',
            color: '#ffffff',
        }

        this.add.image(centerX - 250, centerY - 200, 'wasd', null).setOrigin(0.5).setDepth(uiDepth).setScale(1.5);
        this.add.image(centerX + 250, centerY - 200, 'hijkl', null).setOrigin(0.5).setDepth(uiDepth).setScale(1.5);
        this.add.image(centerX, centerY - 175, 'keyAtlas', 'f').setOrigin(0.5).setDepth(uiDepth).setScale(1.5);
        this.add.image(centerX, centerY + 50, 'space', null).setOrigin(0.5).setDepth(uiDepth).setScale(1.5);

        this.add.text(centerX - 325 , centerY - 150, 'Movement', textConfig);
        this.add.text(centerX + 175 , centerY - 150, 'Play Note', textConfig);
        this.add.text(centerX - 50, centerY - 125, 'Melee', textConfig);
        this.add.text(centerX - 88, centerY + 100, 'Play Song', textConfig);

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