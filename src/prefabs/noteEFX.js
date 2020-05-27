class efxEmitter {
    constructor(scene, player, texture = playerAtlas, frame = 'Note') {
        this.scene = scene;
        this.parent = player;
        this.frame = frame;
        this.texture = texture;
        this.particleDistance = 50;
        this.xArr = [this.particleDistance, -this.particleDistance, this.particleDistance, -this.particleDistance];
        this.yArr = [this.particleDistance, this.particleDistance, -this.particleDistance, -this.particleDistance];
        this.noteGroup = this.scene.add.group({
            scene: this,
            runChildUpdate: true,
        });
    }

    generateParticles() {
        for (let i = 0; i < this.xArr.length; i++) {
            let notefx = new efxParticle(this.scene, this.parent.x, 
                this.parent.y, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
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

    generateParticles_v2() {
        let notefx = new efxParticle(this.scene, this.parent.x, this.parent.y,
            'reverse', 0).setScale(0).setDepth(uiDepth -1).setOrigin(0.5);
        this.noteGroup.add(notefx);
        let noteTween = this.scene.tweens.add({
            targets: notefx,
            alpha: {from: 1, to: 0},
            scale: {from: 2, to: 0},
            angle: {from: 0, to: 360},
            duration: 1000,
            repeat: 0,
            onComplete: () => {
                notefx.destroy();
            },
            onCompleteScope: this,
        })
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

    update() {
        this.x = this.scene.player.body.x + this.scene.player.body.halfWidth;// - this.width / 2;
        this.y = this.scene.player.body.y + this.scene.player.body.halfHeight;// - this.height / 2;
    }
}