class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }
    init(data) { //can be used for scene callback
        this.data = data;
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
        this.add.text(centerX , centerY - 32, 'GAME OVER' , menuConfig).setOrigin(.5);
        this.add.text(centerX, centerY, 'PRESS SPACE TO RESTART', menuConfig).setOrigin(0.5);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start('menuScene')
        } 
    }
}