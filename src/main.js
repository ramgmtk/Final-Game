//Pluck and the Power of the Chord
//Rammohan Ramanathan
//Ricky Chavez
//Anthony Plescia

let config = {
    type: Phaser.CANVAS,
    render: {
        pixelArt: true,
    },
    width: 900,
    height: 900,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true,
            gravity: {
                x: 0,
                y: 0,
            }
        }
    },
    scene: [Menu, Controls, GameOver, Credits],
}

//GLOBALS
let centerX = config.width/2;
let centerY = config.height/2;
let audio = 0.5;
let devMode = false;

let playerAtlas = 'foo';
let playerAccel = 5000; //note at values this high, might be better off working with velocity alone.
let playerMaxVelocity = 300;
let playerDrag = playerAccel * 1.5;
let projectileVelocity = 100;

let noteQueueSize = 3;
let noteSize = 32;
let uiDepth = 4;
let uiOffset = {
    x: -700,
    y: -700,
}

powerChordBar = [
    {powerChord: 'jkl',
     name: 'Reverse',
     unlocked: false,},
    {powerChord: 'ijh',
     name: 'Shrink',
     unlocked: false,},
    {powerChord: 'hij',
     name: 'Shield',
     unlocked: false},
    {powerChord: 'lji',
     name: 'Unlock',
     unlocked: false,},
];

let bossCornerSpace = 200
let bossZoom = 0.75;
let bossPatternPoints = [
    {
        x: centerX * (1/bossZoom),
        y: centerY * (1/bossZoom),
    },
    {
        x: bossCornerSpace,
        y: bossCornerSpace,
    },
    {
        x: config.width * (1/bossZoom) - bossCornerSpace,
        y: config.height * (1/bossZoom) - bossCornerSpace, 
    },
    {
        x: config.width * (1/bossZoom) - bossCornerSpace,
        y: bossCornerSpace,
    },
    {
        x: bossCornerSpace,
        y: config.width * (1/bossZoom) - bossCornerSpace,
    }
];

//change this to true to disable console.logs
//ex: console.assert(debugFlag.foo, 'Your statement here');
let debugFlags = {
    playerFlag: true,
    uiFlag: true,
    enemyFlag: true,
    bossFlag: true,
};

function createCams(scene, heartCam, noteCam, powerChordCam, gameCam, shieldCam) {
    heartCam = scene.cameras.add(0, 0, 200, 200);
    heartCam.setViewport((20 * 1/bossZoom), (20 * 1/bossZoom), scene.heartInfo.width * 2, scene.heartInfo.height * 2);
    heartCam.setScroll(uiOffset.x, uiOffset.y);
    heartCam.ignore([scene.player.noteBar, scene.powerChordList, scene.player.shieldMeter.meter]);

    noteCam = scene.cameras.add(0, 0, 200, 200);
    noteCam.setViewport((20 * 1/bossZoom) + scene.heartInfo.width, (20 * 1/bossZoom), noteSize * noteQueueSize, noteSize);
    noteCam.setScroll(uiOffset.x, uiOffset.y);
    noteCam.ignore([scene.player.healthBar, scene.powerChordList, scene.player.shieldMeter.meter]);

    powerChordCam = scene.cameras.add(0, 0, 200, 200);
    powerChordCam.setViewport(game.config.width - (noteQueueSize * noteSize), 0, noteSize * noteQueueSize, noteSize * powerChordBar.length);
    powerChordCam.setScroll(uiOffset.x, uiOffset.y)
    powerChordCam.ignore([scene.player.healthBar, scene.player.noteBar, scene.player.shieldMeter.meter]);

    //How far the camera can go within the world.p
    gameCam = scene.cameras.main.setBounds(0, 0, scene.stageInfo.width, scene.stageInfo.height);
    //The actual lens through which we see the game.
    gameCam.setViewport(0, 0, game.config.width, game.config.height);
    gameCam.startFollow(scene.player, true, 1.0, 1.0);
    //wiggle room for the camera
    gameCam.setDeadzone(scene.playerSpriteInfo.width * 2, scene.playerSpriteInfo.height * 2);
    gameCam.setName('Player');
    gameCam.ignore([scene.player.healthBar, scene.player.noteBar, scene.powerChordList, scene.player.shieldMeter.meter]);
    
    shieldCam = scene.cameras.add(0, 0, 200, 200);
    shieldCam.setViewport((20 * 1/bossZoom), (20 * 1/bossZoom) + scene.heartInfo.height + 5, 50, 50);
    shieldCam.setScroll(uiOffset.x, uiOffset.y)
    shieldCam.ignore([scene.player.healthBar, scene.player.noteBar, scene.powerChordList]);

    return [heartCam, noteCam, powerChordCam, gameCam, shieldCam];
}

let game = new Phaser.Game(config);