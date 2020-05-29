class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }
    init(data) { //can be used for scene callback
        this.data = data;
    }
    create() {
        let gameover = this.add.image(centerX, centerY, 'gameoverButton', null).setOrigin(0.5).setDepth(uiDepth);
        let restartButton = this.add.image(centerX, centerY + 150, 'restartButton', null).setOrigin(0.5).setDepth(uiDepth);

        restartButton.setInteractive();
        restartButton.on('pointerover', () => {
            restartButton.setScale(1.5);
        });
        restartButton.on('pointerout', () => {
            restartButton.setScale(1.0);
        });
        restartButton.on('pointerdown', () => {
            this.scene.start('menuScene');
        });
    }
}