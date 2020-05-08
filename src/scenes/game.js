class Game extends Phaser.Scene {
    constructor() {
        super('gameScene')
    }

    preload() {
        //SHOULD FIX by moving to menu preload at a later point in time.
        //Loading placeholder variables
        this.load.path = './assets/';
        this.load.atlas(playerAtlas, 'spritesheet.png', 'sprites.json');
        this.load.image('bg', 'bg.png');

        //sound
        this.load.audio('E', 'sounds/Short_E.wav');
        this.load.audio('F', 'sounds/Short_F.wav');
        this.load.audio('G', 'sounds/Short_G.wav');
    }
    create() {
        //BACKGROUND
        this.add.image(0, 0, 'bg').setOrigin(0);
        this.stageInfo = game.textures.get('bg');
        this.stageInfo = this.stageInfo.getSourceImage();
        this.physics.world.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height)
        //PLAYER RELATED VARIABLES
        //key controls
        this.playerSpriteInfo = game.textures.getFrame(playerAtlas, 'sprite5');
        this.controls = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            j: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            k: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            l: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        };
        this.player = new Player(this, centerX, centerY, playerAtlas, 'sprite5').setOrigin(0.5).setDepth(3);

        //CAMERA SETUP
        //How far the camera can go within the world.
        this.cameras.main.setBounds(0, 0, this.stageInfo.width, this.stageInfo.height);
        //The actual lens through which we see the game.
        this.cameras.main.setViewport(0, 0, game.config.width, game.config.height);
        //how the camera follows the player
        this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
        //wiggle room for the camera
        this.cameras.main.setDeadzone(this.playerSpriteInfo.width * 2, this.playerSpriteInfo.height * 2);

        //ANIMATIONS
        //Animations for the different animation states of the player
        //Left, Right, Up, Down movement, as well as playing a note.
        this.anims.create({
            key: 'left',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite1'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'right',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite2'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'up',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite3'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'down',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite4'},
            ],
            frameRate: 48,
        });

        this.anims.create({
            key: 'play',
            defaultTextureKey: playerAtlas,
            frames: [
                {frame: 'sprite5'},
            ],
            duration: 2000,
        });

        //SOUND
        this.musicalNoteOne = this.sound.add('E', {
            mute: false,
            volume: 0.3,
            rate: 7.0,
            loop: false,
        });

        this.musicalNoteTwo = this.sound.add('F', {
            mute: false,
            volume: 0.3,
            rate: 7.0,
            loop: false,
        });

        this.musicalNoteThree = this.sound.add('G', {
            mute: false,
            volume: 0.3,
            rate: 1.0,
            loop: false,
        });
    }

    update() {
        this.player.update();
    }
}