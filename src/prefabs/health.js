class Health  {
    constructor(scene, x, y, texture, frame) {
        this.health = scene.add.image(x, y, texture, frame).setDepth(uiDepth).setOrigin(0.5);
        this.frameName = frame;
        //1 less than current
        this.maxHealth = parseFloat(frame.charAt(frame.length - 1));
        this.healthNum = parseFloat(frame.charAt(frame.length - 1)) - 1;
    }
    updateHealth() {
        this.frameName = this.frameName.slice(0, -1);
        this.frameName += this.healthNum;
        this.health.setFrame(this.frameName);
        this.healthNum -= 1;
    }

    increase() {
        if (this.healthNum < this.maxHealth - 1) {
            this.frameName = this.frameName.slice(0, -1);
            this.frameName += this.healthNum + 2;
            this.health.setFrame(this.frameName);
            this.healthNum += 1;
        }
    }
}