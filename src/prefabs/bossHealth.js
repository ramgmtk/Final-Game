class bossHealth {
    constructor(scene, totalHealth) {
        this.healthBar = new Phaser.GameObjects.Graphics(scene);
        this.healthBar.setDepth(uiDepth);
        this.currHealth = totalHealth;

        this.borderOffset = 8;
        this.percentPerPixel = (centerX - (this.borderOffset*2)) / totalHealth;

        this.draw();
        scene.add.existing(this.healthBar);
    }

    decrease() {
        this.currHealth -= 1;
        this.draw();
    }

    draw() {
        this.healthBar.clear();
        //border
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(uiOffset.x, uiOffset.y, centerX, 50);
        //actual bar
        this.healthBar.fillStyle(0xffffff);
        this.healthBar.fillRect(uiOffset.x + this.borderOffset, uiOffset.y + this.borderOffset, 
            centerX - (this.borderOffset * 2), 50 - (this.borderOffset*2));
        
        this.healthBar.fillStyle(0xff0000);
        let adjustedHealth = Math.floor(this.percentPerPixel * this.currHealth);
        console.log(adjustedHealth);
        this.healthBar.fillRect(uiOffset.x + this.borderOffset, uiOffset.y + this.borderOffset,
            adjustedHealth, 50 - (this.borderOffset * 2));
    }
}