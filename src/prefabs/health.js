class Health  {
    constructor(scene, x, y, texture, frame) {
        this.health = scene.add.image(x, y, texture, frame).setDepth(uiDepth).setOrigin(0.5);
        this.scene = scene;
        this.frameName = frame;
        //1 less than current
        this.maxHealth = parseFloat(frame.charAt(frame.length - 1));
        this.healthNum = parseFloat(frame.charAt(frame.length - 1)) - 1;
        this.increaseTween = this.scene.tweens.add({
            targets: this.health,
            paused: true,
            scale: {from: 1, to: 2},
            duration: this.scene.bpms,
            repeat: 4,
            onComplete: () => {
                this.health.setScale(1);
            },
            onCompleteScope: this,
        });
        this.decreaseTween = this.scene.tweens.add({
            targets: this.health,
            paused: true,
            scale: {from: 1, to: 0},
            duration: this.scene.bpms,
            repeat: 4,
            onComplete: () => {
                this.health.setScale(1.0);
            },
            onCompleteScope: this,
        });
    }
    updateHealth() {
        this.decreaseTween.play();
        this.frameName = this.frameName.slice(0, -1);
        this.frameName += this.healthNum;
        this.health.setFrame(this.frameName);
        this.healthNum -= 1;
    }

    increase() {
        this.increaseTween.play();  
        if (this.healthNum < this.maxHealth - 1) {
            this.frameName = this.frameName.slice(0, -1);
            this.frameName += this.healthNum + 2;
            this.health.setFrame(this.frameName);
            this.healthNum += 1;
        }
    }
}