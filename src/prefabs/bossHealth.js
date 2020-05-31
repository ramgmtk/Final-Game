//https://phaser.io/examples/v3/view/game-objects/graphics/health-bars-demo
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

    decrease(damage) {
        this.currHealth -= damage;
        this.draw();
    }

    draw() {
        this.healthBar.clear();
        //border
        //this.healthBar.fillStyle(0x00ff00);
        //this.healthBar.fillRect(uiOffset.x, uiOffset.y, centerX * bossZoom, (50* bossZoom));
        //actual bar
        this.healthBar.fillStyle(0xffffff);
        this.healthBar.fillRect(uiOffset.x + this.borderOffset, uiOffset.y + this.borderOffset, 
            (centerX * bossZoom) - (this.borderOffset * 2) , (50 * bossZoom) - (this.borderOffset*2));
        
        this.healthBar.fillStyle(0xff0000);
        let adjustedHealth = Math.floor(this.percentPerPixel * this.currHealth);
        this.healthBar.fillRect(uiOffset.x + this.borderOffset, uiOffset.y + this.borderOffset,
            (adjustedHealth * bossZoom), (50 * bossZoom) - (this.borderOffset * 2));
    }
}