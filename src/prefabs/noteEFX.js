class efxEmitter {
    constructor(scene, parent, texture = playerAtlas, frame = 'Note') {
        this.scene = scene;
        this.parent = parent;
        this.frame = frame;
        this.texture = texture;
        this.particleDistance = 50;
        this.xArr = [this.particleDistance, -this.particleDistance, this.particleDistance, -this.particleDistance];
        this.yArr = [this.particleDistance, this.particleDistance, -this.particleDistance, -this.particleDistance];
        this.xArr2 = [200, 0, -200, 0];
        this.yArr2 = [0, 200, 0, -200];
        this.noteGroup = this.scene.add.group({
            scene: this,
            runChildUpdate: true,
        });
    }

    noteParticles() {
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

    dudParticles() {
        let notefx = new efxParticle(this.scene, this.parent.x, 
            this.parent.y, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
        let noteTween = this.scene.tweens.add({
            targets: notefx,
            alpha: {from: 1, to: 0},
            scale: {from: 0.1, to: 2},
            x: {from: notefx.origin.x, to: notefx.origin.x + 150},
            ease: 'Sine.easeOut',
            duration: 1000,
            repeat: 0,
            onComplete: () => {
                notefx.destroy();
            },
            onCompleteScope: this,
        });
        let notefx2 = new efxParticle(this.scene, this.parent.x, 
            this.parent.y, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
        let noteTween2 = this.scene.tweens.add({
            targets: notefx2,
            alpha: {from: 1, to: 0},
            scale: {from: 0.1, to: 2},
            x: {from: notefx.origin.x, to: notefx.origin.x - 150},
            ease: 'Sine.easeOut',
            duration: 1000,
            repeat: 0,
            onComplete: () => {
                notefx.destroy();
            },
            onCompleteScope: this,
        });
    }

    reverseParticles() {
        let notefx = new efxParticle(this.scene, this.parent.x, this.parent.y,
            'reverse', 0).setScale(0).setDepth(uiDepth -1).setOrigin(0.5);
        this.noteGroup.add(notefx);
        let noteTween = this.scene.tweens.add({
            targets: notefx,
            alpha: {from: 1, to: 0},
            scale: {from: 3, to: 0},
            angle: {from: 0, to: 360},
            duration: 325,
            repeat: 0,
            onComplete: () => {
                notefx.destroy();
            },
            onCompleteScope: this,
        });
    }

    shrinkParticles() {
        let notefx1 = new efxParticle(this.scene, this.parent.x, this.parent.y, 'shrink', null).setScale(1).setDepth(uiDepth - 1).setOrigin(0.5).setFlip(true, false);
        let notefx2 = new efxParticle(this.scene, this.parent.x, this.parent.y, 'shrink', null).setScale(1).setDepth(uiDepth - 1).setOrigin(0.5).setFlip(false, false);
        let notefx3 = new efxParticle(this.scene, this.parent.x, this.parent.y, 'shrink', null).setScale(1).setDepth(uiDepth - 1).setOrigin(0.5).setFlip(true, true);
        let notefx4 = new efxParticle(this.scene, this.parent.x, this.parent.y, 'shrink', null).setScale(1).setDepth(uiDepth - 1).setOrigin(0.5).setFlip(false, true);
        let noteArr = [notefx1, notefx2, notefx3, notefx4];
        for (let i = 0; i < noteArr.length; i++) {
            let noteTween = this.scene.tweens.add({
                targets: noteArr[i],
                alpha: {from: 1, to: 0},
                scale: {from: 1, to: 0},
                x: {from: noteArr[i].origin.x + this.xArr[i], to: noteArr[i].origin.x},
                y: {from: noteArr[i].origin.y + this.yArr[i], to: noteArr[i].origin.y},
                //ease: 'Sine.easeOut',
                duration: 500,
                repeat: 0,
                onComplete: () => {
                    noteArr[i].destroy();
                },
                onCompleteScope: this,
            });
        }
    }

    gameOverParticles() {
        let theta = (Math.PI/(4));
        for (let i = 0; i < 7; i++) {
            let efx = new efxParticle(this.scene, this.parent.x, this.parent.y, playerAtlas, 'MCidle').setAlpha(0.3).setDepth(uiDepth - 1).setOrigin(0.5); 
            this.scene.tweens.add({
                targets: efx,
                x: {from: efx.origin.x, to: efx.origin.x + (100*Math.cos(i * theta))},
                y: {from: efx.origin.y, to: efx.origin.y + (100*Math.sin(i*theta))},
                duration: 3000,
                repeat: 0,
                onComplete: () => {
                    efx.destroy();
                },
                onCompleteScope: this,
            });
        }
        let efx = new efxParticle(this.scene, this.parent.x, this.parent.y, playerAtlas, 'MCidle').setAlpha(0.3).setDepth(uiDepth - 1).setOrigin(0.5); 
        this.scene.tweens.add({
            targets: efx,
            x: {from: efx.origin.x, to: efx.origin.x + (100*Math.cos(7 * theta))},
            y: {from: efx.origin.y, to: efx.origin.y + (100*Math.sin(7 * theta))},
            duration: 3000,
            repeat: 0,
            onComplete: () => {
                efx.destroy();
            },
            onCompleteScope: this,
        });
    }

    shieldEfx() {
        let theta = Math.PI/2;
        for (let i = 0; i < 4; i++) {
            let notefx = new efxParticle(this.scene, this.parent.x, this.parent.y, 'nonProjectile', null).setAlpha(0).setDepth(uiDepth - 1).setScale(1).setOrigin(0.5);
            this.scene.tweens.add({
                targets: notefx,
                alpha: {from: 0, to: 1},
                scale: {scale: 1, to: 2},
                x: {from: notefx.origin.x, to: notefx.origin.x + this.xArr2[i]},
                y: {from: notefx.origin.y, to: notefx.origin.y + this.yArr2[i]},
                duration: 1000,
                repeat: 0,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: notefx,
                        alpha: {from: 0, to: 1},
                        scale: {from: 2, to: 0},
                        x: this.scene.mainCam.getWorldPoint(20 * 1/this.scene.mainCam.zoom + 5, 20 * 1/this.scene.mainCam.zoom + 15 + this.scene.heartInfo.height).x,
                        y: this.scene.mainCam.getWorldPoint(20 * 1/this.scene.mainCam.zoom + 5, 20 * 1/this.scene.mainCam.zoom + 15 + this.scene.heartInfo.height).y,
                        repeat: 0,
                        duration: 1000,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            notefx.destroy();
                        },
                        onCompleteSCope: this,
                    });
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

    update() {
        this.x = this.scene.player.body.x + this.scene.player.body.halfWidth;// - this.width / 2;
        this.y = this.scene.player.body.y + this.scene.player.body.halfHeight;// - this.height / 2;
    }
}