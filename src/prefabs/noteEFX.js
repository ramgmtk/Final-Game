class efxEmitter {
    constructor(scene, player, texture = 'foo', frame = 'Note') {
        this.scene = scene;
        this.player = player;
        this.frame = frame;
        this.texture = texture;
        this.particleDistance = 50;
        this.xArr = [this.particleDistance, -this.particleDistance, this.particleDistance, -this.particleDistance];
        this.yArr = [this.particleDistance, this.particleDistance, -this.particleDistance, -this.particleDistance];
    }

    generateParticles() {
        for (let i = 0; i < this.xArr.length; i++) {
            let notefx = new efxParticle(this.scene, this.player.x, 
                this.player.y, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
            let noteTween = this.scene.tweens.add({
                targets: notefx,
                alpha: {from: 0, to: 1},
                scale: {from: 2, to: 0.1},
                x: {from: notefx.origin.x, to: notefx.origin.x + this.xArr[i]},
                y: {from: notefx.origin.y, to: notefx.origin.y + this.yArr[i]},
                //ease: 'Sine.easeOut',
                duration: 1000,
                repeat: 0,
                onComplete: () => {
                    notefx.destroy();
                },
                onCompleteScope: this,
            });
        } 
    }
}

class efxParticle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.origin = {
            x: x,
            y: y,
        };
        //setDepth(uiDepth - 1);
        //setOrigin(0.5);
    }
}