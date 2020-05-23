class efxEmitter {
    constructor(scene, player, texture = 'foo', frame = 'Note') {
        this.scene = scene;
        this.player = player;
        this.frame = frame;
        this.texture = texture;
        /*this.efxGroup = this.scene.add.group({
            scene: this.scene,
            runChildUpdate: false,
        });*/
    }

    generateParticles() {
        let efxGroup = this.scene.add.group({
            scene: this.scene,
            runChildUpdate: false,
        });
        /*for (let i = 0; i < 5; i++) {
            let notefx = new efxParticle(this.scene, this.player.x + ((i+1)*100), 
                this.player.y, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
            this.efxGroup.add(notefx);
        }*/ //use the for loop once we use tweens

        let notefx = new efxParticle(this.scene, this.player.x + 100, 
            this.player.y + 100, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
        let notefx2 = new efxParticle(this.scene, this.player.x + 100, 
            this.player.y - 100, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
        let notefx3 = new efxParticle(this.scene, this.player.x - 100, 
            this.player.y - 100, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
        let notefx4 = new efxParticle(this.scene, this.player.x - 100, 
            this.player.y + 100, this.texture, this.frame).setDepth(uiDepth - 1).setOrigin(0.5);
        efxGroup.addMultiple([notefx, notefx2, notefx3, notefx4]);

        this.scene.time.addEvent({
            delay: 1000,
            callback: (efxGroup) => {
                efxGroup.clear(true, true);
                efxGroup.destroy();
            },
            callbackScope: this,
            args: [efxGroup],
            repeat: 0,
        });
    }
}

class efxParticle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        //setDepth(uiDepth - 1);
        //setOrigin(0.5);
    }
}