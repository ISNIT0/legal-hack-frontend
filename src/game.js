import { LithoHardware } from './litho';
import config from './config';
import uw, { World, Sprite, Sound, Rect, Text } from 'you-win';
import _ from 'lodash';

const roomSize = 1000;
const PLAYER_STEP = 8;
let playerDeltaX = 0;
let playerDeltaY = 0;

const playerSprites = {};

document.onclick = async function () {
    if (location.href.includes('litho=true')) {
        const litho = new LithoHardware();
        await litho.connect();
        litho.onStateChangeCallback = function (data) {
            if (data.touch.x) {
                playerDeltaX = (data.touch.y - 0.5) * 20;
                playerDeltaY = (data.touch.x - 0.5) * 20;
            } else {
                playerDeltaX = 0;
                playerDeltaY = 0;
            }
        }
    }
}

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
    uw.loadCostume('wall', 'wall.png');
    uw.loadCostume('tree', 'tree.png');
    uw.loadCostume('lake', 'lake.png');
    uw.loadCostume('greenery', 'greenery.png');
    uw.loadCostume('stone', 'stone.png');
    uw.loadCostume('carpet', 'carpet.png');
    uw.loadCostume('table', 'desk.png');
    uw.loadCostume('conference-table', 'conference-table.png');
    uw.loadCostume('presentation', 'presentation.png');
    uw.loadCostume('kitchen-counter', 'kitchen-counter.png');
    uw.loadCostume('water-cooler', 'water-cooler.png');
    uw.loadCostume('fridge', 'fridge.png');

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

    let touchStartX;
    let touchStartY;
    window.ontouchstart = (ev) => {
        const touch = ev.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
    window.ontouchmove = (ev) => {
        const touch = ev.touches[0];
        playerDeltaX = Math.min(Math.max(-10, (touch.clientX - touchStartX) * 0.1), 10);
        playerDeltaY = -Math.min(Math.max(-10, (touch.clientY - touchStartY) * 0.1), 10);
    }
    window.ontouchend = (ev) => {
        playerDeltaX = 0;
        playerDeltaY = 0;
    }

    const deskSpace = new Rect
    deskSpace.type = 'room';
    deskSpace.width = roomSize;
    deskSpace.height = roomSize;
    deskSpace.fill = 'beige';
    deskSpace.right = 0;
    deskSpace.bottom = 0;
    deskSpace.soundName = 'desk';
    deskSpace.label = new Text;
    deskSpace.label.text = 'Working';
    deskSpace.label.scale = 1.4;
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
    kitchen.label.text = 'Available for conversation';
    kitchen.label.scale = 1.4;
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
    pond.label.text = 'Gone Fishing';
    pond.label.scale = 1.4;
    pond.label.posX = pond.posX;
    pond.label.posY = pond.posY;

    const meetingRoom = new Rect
    meetingRoom.type = 'room';
    meetingRoom.width = roomSize;
    meetingRoom.height = roomSize;
    meetingRoom.fill = '#800020';
    meetingRoom.left = 0;
    meetingRoom.bottom = 0;
    meetingRoom.soundName = 'meeting';
    meetingRoom.label = new Text;
    meetingRoom.label.text = 'In a meeting';
    meetingRoom.label.scale = 1.4;
    meetingRoom.label.posX = meetingRoom.posX;
    meetingRoom.label.posY = meetingRoom.posY;


    const playerSprite = new Sprite
    playerSprite.scale = 3;
    playerSprite.costume = player.costume;
    playerSprite.posX = player.posX;
    playerSprite.posY = player.posY;
    playerSprite.nameText = new Text;
    playerSprite.nameText.scale = 2;
    playerSprite.nameText.text = player.name;
    playerSprite.nameText.fill = 'black';

    let numFingers = 0;

    playerSprite.forever(() => {
        const fingers = world.getFingers();
        if (numFingers > fingers.length) {
            playerDeltaX = 0;
            playerDeltaY = 0;
        } else if (numFingers > fingers.length) {
            originalScrollX = world.scrollX;
            originalScrollY = world.scrollY;
        }
        numFingers = fingers.length;

        playerSprite.posX += playerDeltaX;
        playerSprite.posY += playerDeltaY;
        const touchingObjs = playerSprite.getTouching();
        if (touchingObjs.filter(a => a.type === 'object' && a.collide !== false).length) {
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
        const players = JSON.parse(message.data);
        players.forEach(renderPlayer);
        const loggedOff = Object.keys(playerSprites).filter(id => id !== player.id && !players.find(p => p.id === Number(id)));
        loggedOff.forEach((id) => {
            playerSprites[id].nameText.destroy();
            playerSprites[id].socialLabel.destroy();
            playerSprites[id].burnoutLabel.destroy();
            playerSprites[id].destroy();
            delete playerSprites[id];
        });
    }


    makeWorld();
}


function renderPlayer(playerData) {
    if (player.id !== playerData.id) {
        const sprite = playerSprites[playerData.id] = playerSprites[playerData.id] || new Sprite;
        sprite.type = 'player';
        sprite.scale = 3;
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



const world = [
    //     {
    //     costume: 'wall',
    //     // width: 100,
    //     // height: 100,
    //     posX: 0,
    //     posY: 0,
    //     angle: 90
    // }, {
    //     costume: 'wall',
    //     // width: 100,
    //     // height: 100,
    //     posX: 90,
    //     posY: 0,
    //     angle: 90
    // },
    // {
    //     costume: 'wall',
    //     // width: 100,
    //     // height: 100,
    //     posX: 180,
    //     posY: 0,
    //     angle: 90
    // },
    {
        costume: 'tree',
        // width: 100,
        // height: 100,
        posX: 800,
        posY: -100,
        angle: 0,
        scale: 2,
    },
    {
        costume: 'lake',
        // width: 100,
        // height: 100,
        posX: 500,
        posY: -700,
        angle: 0,
        scale: 1.2,
    },
    {
        costume: 'greenery',
        // width: 100,
        // height: 100,
        posX: 900,
        posY: -200,
        angle: 0,
        scale: 1.2,
    },
    // {
    //     costume: 'stone',
    //     // width: 100,
    //     // height: 100,
    //     posX: 900,
    //     posY: -900,
    //     angle: 0,
    //     scale: 1.2,
    // },
    // {
    //     costume: 'carpet',
    //     collide: false,
    //     // width: 100,
    //     // height: 100,
    //     posX: -600,
    //     posY: 400,
    //     angle: 0,
    //     scale: 1.2,
    // },
    {
        costume: 'table',
        // width: 100,
        // height: 100,
        posY: 900,
        posX: -800,
        angle: 0,
        scale: 1.3,
    },
    {
        costume: 'table',
        // width: 100,
        // height: 100,
        posY: 900,
        posX: -500,
        angle: 0,
        scale: 1.3,
    },
    {
        costume: 'table',
        // width: 100,
        // height: 100,
        posY: 900,
        posX: -200,
        angle: 0,
        scale: 1.3,
    },
    {
        costume: 'table',
        // width: 100,
        // height: 100,
        posY: 400,
        posX: -900,
        angle: 0,
        scale: 1.3,
        angle: -90
    },
    {
        costume: 'conference-table',
        // width: 100,
        // height: 100,
        posY: 400,
        posX: 500,
        angle: 0,
        scale: 1.3,
        angle: 0
    },
    {
        costume: 'presentation',
        // width: 100,
        // height: 100,
        posY: 890,
        posX: 500,
        angle: 0,
        scale: 2,
        angle: 0
    },
    {
        costume: 'kitchen-counter',
        // width: 100,
        // height: 100,
        posY: -700,
        posX: -930,
        angle: 0,
        scale: 2,
        angle: -90,
    },
    {
        costume: 'fridge',
        // width: 100,
        // height: 100,
        posY: -200,
        posX: -900,
        angle: 0,
        scale: 2,
        angle: 0
    },
    {
        costume: 'water-cooler',
        // width: 100,
        // height: 100,
        posY: -900,
        posX: -600,
        angle: 0,
        scale: 2,
        angle: 0
    },
];


function makeWorld() {
    for (const object of world) {
        const sprite = new Sprite;
        sprite.type = 'object';
        Object.assign(sprite, object);
    }
}


function mobileAndTabletCheck() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};