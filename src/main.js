let config = {
    type: Phaser.CANVAS,
    width: 1080,
    height: 720,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug : true,
            gravity: {
                x: 0,
                y: 0,
            }
        }
    },
    scene: [Game],
}

//GLOBALS
let centerX = config.width/2;
let centerY = config.height/2;
let playerAtlas = 'foo';
let playerAccel = 2000;
let playerMaxVelocity = 700;
let playerDrag = playerAccel * 0.3;
let playerHealth = 3;

//change this to true to disable console.logs
//ex: console.assert(debugFlag.foo, 'Your statement here');
let debugFlags = {
    playerFlag: false,
    uiFlag: false,
    enemyFlag: false,
}

let game = new Phaser.Game(config);