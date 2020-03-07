import { LithoHardware } from './litho';
import config from './config';
import uw, { World, Sprite, Sound, Rect, Text } from 'you-win';
import _ from 'lodash';

const roomSize = 1000;
const PLAYER_STEP = 8;
let playerDeltaX = 0;
let playerDeltaY = 0;

document.addEventListener('keyup', keyHandler);
document.addEventListener('keydown', keyHandler);


const player = localStorage.player ? JSON.parse(localStorage.player) : {
    id: Date.now(),
    posX: 0 - (roomSize / 2),
    posY: 0 - (roomSize / 2),
    costume: _.sample(['😂', '🕺', '💃', '😫', '🙄']),
    name: prompt(`Name`),
    stats: {
        social: 100,
        burnout: 100,
    }
};

export async function game() {
    // Load everything we need
    uw.loadCostume('wall', 'wall.png')

    uw.loadSound('kitchen', 'kitchen.mp3')
    uw.loadSound('meeting', 'meeting.mp3')
    uw.loadSound('desk', 'desk.mp3')
    uw.loadSound('gone-fishing', 'gone-fishing.mp3')
    await uw.begin()

    let currentSound;

    var kitchenSound = new Sound('kitchen')
    var deskSound = new Sound('desk')
    var meetingSound = new Sound('meeting')
    var goneFishingSound = new Sound('gone-fishing')

    const sounds = {
        kitchen: kitchenSound,
        goneFishing: goneFishingSound,
        desk: deskSound,
        meeting: meetingSound,
    };
    // Make the world
    var world = new World
    world.title = ''
    world.background = '#aaa'
    world.width = 3000;
    world.height = 3000;

    const deskSpace = new Rect
    deskSpace.type = 'room';
    deskSpace.width = roomSize;
    deskSpace.height = roomSize;
    deskSpace.fill = 'red';
    deskSpace.right = 0;
    deskSpace.bottom = 0;
    deskSpace.soundName = 'desk';
    deskSpace.label = new Text;
    deskSpace.label.text = 'Desk Space';
    deskSpace.label.posX = deskSpace.posX;
    deskSpace.label.posY = deskSpace.posY;

    const kitchen = new Rect
    kitchen.type = 'room';
    kitchen.width = roomSize;
    kitchen.height = roomSize;
    kitchen.fill = 'blue';
    kitchen.right = 0;
    kitchen.top = 0;
    kitchen.soundName = 'kitchen';
    kitchen.label = new Text;
    kitchen.label.text = 'Kitchen';
    kitchen.label.posX = kitchen.posX;
    kitchen.label.posY = kitchen.posY;

    const pond = new Rect
    pond.type = 'room';
    pond.width = roomSize;
    pond.height = roomSize;
    pond.fill = 'green';
    pond.left = 0;
    pond.top = 0;
    pond.soundName = 'goneFishing';
    pond.label = new Text;
    pond.label.text = 'Pond';
    pond.label.posX = pond.posX;
    pond.label.posY = pond.posY;

    const meetingRoom = new Rect
    meetingRoom.type = 'room';
    meetingRoom.width = roomSize;
    meetingRoom.height = roomSize;
    meetingRoom.fill = 'pink';
    meetingRoom.left = 0;
    meetingRoom.bottom = 0;
    meetingRoom.soundName = 'meeting';
    meetingRoom.label = new Text;
    meetingRoom.label.text = 'Meeting Room';
    meetingRoom.label.posX = meetingRoom.posX;
    meetingRoom.label.posY = meetingRoom.posY;


    const playerSprite = new Sprite
    playerSprite.scale = 2;
    playerSprite.costume = player.costume;
    playerSprite.posX = player.posX;
    playerSprite.posY = player.posY;
    playerSprite.nameText = new Text;
    playerSprite.nameText.scale = 2;
    playerSprite.nameText.text = player.name;
    playerSprite.nameText.fill = 'black';


    world.onDrag(e => {
        // move when dragged
        playerDeltaX = e.deltaX / 3
        playerDeltaY = e.deltaY / 3
        return true
    })

    playerSprite.forever(() => {
        playerSprite.posX += playerDeltaX;
        playerSprite.posY += playerDeltaY;
        const touchingObjs = playerSprite.getTouchingFast();
        if (touchingObjs.filter(a => a.type === 'object').length) {
            playerSprite.posX -= playerDeltaX;
            playerSprite.posY -= playerDeltaY;
        }
        player.posX = playerSprite.posX;
        player.posY = playerSprite.posY;
        playerSprite.nameText.bottom = playerSprite.top;
        playerSprite.nameText.posX = playerSprite.posX;

        world.scrollX = playerSprite.posX - world.width / 2;
        world.scrollY = playerSprite.posY - world.height / 2;

        player.stats = player.stats || { social: 100, burnout: 0 };

        player.stats.social = Math.max(player.stats.social - 0.05, 0);
        player.stats.burnout = Math.min(Math.max(player.stats.burnout + 0.05, 0), 100);

        const room = touchingObjs.find((o) => o.type === 'room');

        if (room && room.soundName === 'goneFishing') {
            player.stats.burnout = Math.min(Math.max(player.stats.burnout - 0.5, 0), 100);
        }
        if (room && room.soundName !== currentSound) {
            if (sounds[currentSound]) sounds[currentSound].source.stop();
            currentSound = room.soundName;
            if (sounds[currentSound]) sounds[currentSound].play();
        }

        const closePlayer = touchingObjs.find((o) => o.type === 'player');
        if (closePlayer) {
            player.stats.burnout = Math.min(Math.max(player.stats.burnout - 0.2, 0), 100);
            playerSprite.stats.social = Math.min(playerSprite.stats.social + 1, 100)
        }

        playerSprite.stats = player.stats;
        renderPlayerStats(playerSprite);
        // if (world.height + world.scrollY > player.posY + 300) {
        //     world.scrollY = player.posY + 300
        // }
    });

    const ws = new WebSocket(`${config.api}`);

    ws.onopen = function open() {
        ws.send(JSON.stringify(player));
    };

    setInterval(() => {
        const _player = JSON.stringify(player);
        ws.send(_player);
        localStorage.player = _player;
    }, 300);

    ws.onmessage = function incoming(message) {
        JSON.parse(message.data).forEach(renderPlayer);
    }


    makeWorld();

}


const playerSprites = {};

function renderPlayer(playerData) {
    if (player.id !== playerData.id) {
        const sprite = playerSprites[playerData.id] = playerSprites[playerData.id] || new Sprite;
        sprite.type = 'player';
        sprite.scale = 2;
        Object.assign(sprite, playerData);
        if (!sprite.nameText) {
            sprite.nameText = new Text;
            sprite.nameText.scale = 2;
            sprite.nameText.text = playerData.name;
            sprite.nameText.fill = 'black';
        }
        sprite.nameText.bottom = sprite.top;
        sprite.nameText.posX = sprite.posX;
        renderPlayerStats(sprite);
    }
}

function renderPlayerStats(player) {
    const { burnout, social } = player.stats || { burnout: 0, social: 0 };
    player.socialLabel = player.socialLabel || new Text;
    player.socialLabel.text = `Social: ${Math.floor(social || 0)}/100`
    player.socialLabel.top = player.bottom;
    player.socialLabel.posX = player.posX;
    if (social < 30) {
        player.socialLabel.fill = 'red';
        player.socialLabel.scale = 1.5;
    } else {
        player.socialLabel.fill = 'black';
        player.socialLabel.scale = 1;
    }

    player.burnoutLabel = player.burnoutLabel || new Text;
    player.burnoutLabel.text = `Burnout: ${Math.floor(burnout || 0)}/100`
    player.burnoutLabel.top = player.socialLabel.bottom;
    player.burnoutLabel.posX = player.posX;
    if (burnout > 70) {
        player.burnoutLabel.fill = 'red';
        player.burnoutLabel.scale = 1.5;
    } else {
        player.burnoutLabel.fill = 'black';
        player.burnoutLabel.scale = 1;
    }
}


function keyHandler(event) {
    if (event.key === 'a') {
        if (event.type === 'keydown') {
            playerDeltaX = -PLAYER_STEP;
        } else {
            playerDeltaX = 0;
        }
    } else if (event.key === 'd') {
        if (event.type === 'keydown') {
            playerDeltaX = PLAYER_STEP;
        } else {
            playerDeltaX = 0;
        }
    } else if (event.key === 'w') {
        if (event.type === 'keydown') {
            playerDeltaY = PLAYER_STEP;
        } else {
            playerDeltaY = 0;
        }
    } else if (event.key === 's') {
        if (event.type === 'keydown') {
            playerDeltaY = -PLAYER_STEP;
        } else {
            playerDeltaY = 0;
        }
    }
}



const world = [{
    costume: 'wall',
    // width: 100,
    // height: 100,
    posX: 0,
    posY: 0,
    angle: 90
}, {
    costume: 'wall',
    // width: 100,
    // height: 100,
    posX: 90,
    posY: 0,
    angle: 90
}, {
    costume: 'wall',
    // width: 100,
    // height: 100,
    posX: 180,
    posY: 0,
    angle: 90
}];


function makeWorld() {
    for (const object of world) {
        const sprite = new Sprite;
        sprite.type = 'object';
        Object.assign(sprite, object);
    }
}
