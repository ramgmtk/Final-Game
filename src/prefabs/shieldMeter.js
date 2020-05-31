class ShieldMeter {
    constructor(scene, meterSize, player) {
        this.meter = new Phaser.GameObjects.Graphics(scene);
        this.meter.setDepth(uiDepth);
        this.player = player
        this.meterSize = meterSize;
        this.currMeter = 0;
        this.radius = 20;

        this.percentPerPixel = this.radius / meterSize;

        this.draw();
        scene.add.existing(this.meter);
    }

    increase(damage = 1) {
        this.currMeter += damage;
        if (this.currMeter > this.meterSize) {
            this.currMeter = 0;
            this.player.health.increase();
        }
        this.draw();
    }

    draw() {
        this.meter.fillStyle(0xffffff);
        this.meter.fillCircle(uiOffset.x + this.radius, uiOffset.y + this.radius, this.radius);

        let adjustedMeter = Math.floor(this.currMeter * this.percentPerPixel);
        this.meter.fillStyle(0xFACADE);
        this.meter.fillCircle(uiOffset.x + this.radius, uiOffset.y + this.radius, adjustedMeter);
    }
}