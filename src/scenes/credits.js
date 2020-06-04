class Credits extends Phaser.Scene {
    constructor() {
        super('creditScene');
    }

    create() {

        let textConfig  = {
            fontFamily: 'Courier',
            fontSize: '32px',
            color: '#ffffff',
        }


        this.add.text(centerX - 150, centerY - 200, 'Congratulations!', textConfig);
        this.add.text(centerX - 100, centerY + 100, 'Created By:', textConfig);
        this.add.text(centerX - 250, centerY + 150, 'Rammohan R., Ricky Chavez, and Anthony Plescia');
        this.add.text(centerX - 250, centerY + 200, 'Special Thanks to Nathan Altice and Elizabeth Swensen');

        let backButton  = this.add.image(centerX, game.config.height - 100, 'backButton', null).setOrigin(0.5).setDepth(uiDepth);
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