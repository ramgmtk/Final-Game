class Credits extends Phaser.Scene {
    constructor() {
        super('creditScene');
    }

    create() {
        this.add.image(0, 0, 'winScreen').setOrigin(0).setDepth(0);
        this.createSoud();
        this.bossTheme1.play();
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
            this.sound.stopAll();
            this.scene.start('menuScene');
        });
    }

    createSoud() {
        this.bossTheme1 = this.sound.add('bossTheme1', {
            mute: false,
            volume: 0.3 * audio,
            rate: 1.0,
            loop: false,
        });

        this.bossTheme2 = this.sound.add('bossTheme2', {
            mute: false,
            volume: 0.3 * audio,
            rate: 1.0,
            loop: false,
        });

        this.bossTheme3 = this.sound.add('bossTheme3', {
            mute: false,
            volume: 0.3 * audio,
            rate: 1.0,
            loop: false,
        });

        this.bossTheme1.once('complete', () => {
            this.bossTheme2.play();
        });
        this.bossTheme2.once('complete', () => {
            this.bossTheme3.play();
        });
        this.bossTheme3.once('complete', () => {
            this.bossTheme1.play();
        });
    }
}