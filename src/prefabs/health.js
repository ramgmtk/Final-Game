class Health  {
    constructor(scene, x, y, texture, frame) {
        this.health = scene.add.image(x, y, texture, frame).setDepth(0).setOrigin(0);
        this.frameName = frame;
        //1 less than current
        this.healthNum = parseFloat(frame.charAt(frame.length - 1)) - 1;
    }
    updateHealth() {
        this.frameName = this.frameName.slice(0, -1);
        this.frameName += this.healthNum;
        this.health.setFrame(this.frameName);
        this.healthNum -= 1;
    }
}