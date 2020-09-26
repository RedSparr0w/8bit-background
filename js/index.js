const DEBUG = false;

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/*
SUN & MOON
*/
const setSunMoonPosition = (date = new Date()) => {
    var w = window.innerWidth / 1.2;

    // Do the same thing with the height. Responsive = Good times.
    var h = window.innerHeight / 1;

    // Get the hours and minutes.
    const hours = date.getHours();
    const mins = date.getMinutes();

    // Calculate the position of the sun and moon based on the time.
    const sunRad = (((hours) * 60 + mins) / (24.00 * 62.00)) * Math.PI * 2;
    const moonRad = (((hours + 12) * 60 + mins) / (24.00 * 60.00)) * Math.PI * 2;

    // Calculate the axis
    const sunX = (w / 1.8) - (w * Math.sin(sunRad)) / 2;
    const sunY = (h / 1.6) + (h * Math.cos(sunRad)) / 2;
    const moonX = (w / 1.8) - (w * Math.sin(moonRad)) / 2;
    const moonY = (h / 1.6) + (h * Math.cos(moonRad)) / 2;


    // Apply the sun class on the top left of the axis based on our previous calculations
    const sun = document.getElementById('sun')
    sun.style.top = `${sunY}px`;
    sun.style.left = `${sunX}px`;

    // And do the opposite for the moon, of course!
    const moon = document.getElementById('moon')
    moon.style.top = `${moonY}px`;
    moon.style.left = `${moonX}px`;
}

/*
SKY & GROUND
*/
updateBackgrounds = (d = new Date()) => {
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const bgNumber = getPicture(hour);

    // Determine starting background images:
    const bgNumberNext = bgNumber == 11 ? 0 : bgNumber + 1;

    // Get opacity (i.e. how far (in percentage) are we in a certain time-block):
    // Every block is 2 hours, so 1 hour into a block would be 50% (0.50)
    // If we are in an even hour add 50%
    let opacity = hour % 2 ? 0 : 0.5;
    // Every minute would be 1/120th of a block (minutes / 120)
    opacity += minutes / 120;

    // Set sky image
    document.getElementById('sky1').classList.value = (`sky sky-${bgNumber}`);
    document.getElementById('sky2').style.opacity = opacity;
    document.getElementById('sky2').classList.value = (`sky sky-${bgNumberNext}`);

    // Set ground image
    document.getElementById('ground1').classList.value = (`ground ground-${bgNumber}`);
    document.getElementById('ground2').style.opacity = opacity;
    document.getElementById('ground2').classList.value = (`ground ground-${bgNumberNext}`);

    darkness = hour >= 18 ? (Math.abs(18 - hour) * 60) + minutes : hour < 6 ? (Math.abs(6 - hour) * 60) - minutes : 0;
    max_percent = 30;
    real_percent = max_percent * (darkness / 300);
    if (DEBUG) console.log('CURRENT TIME IS: ' + hour + ':' + minutes);
    if (DEBUG) console.log('BACKGROUNDS ARE: ' + bgNumber + ' -> ' + bgNumberNext + ' [' + opacity.toFixed(2) + '%]');
};

const updateScene = (date = new Date()) => {
    setSunMoonPosition(date);
    updateBackgrounds(date);
}

updateScene();
setTimeout(() => {
    updateScene();
    setInterval(updateScene, MINUTE);
}, MINUTE - (Date.now() % MINUTE));

// For updating the scene quickly
// test = new Date();
// setInterval(() => {
//     test.setMinutes(test.getMinutes() + 10);
//     updateScene(test);
// }, 50);

// Determines the images to use based on the hour
function getPicture(hour) {
    if (hour >= 23 || hour < 1)
        return 11;
    else if (hour >= 21)
        return 10;
    else if (hour >= 19)
        return 9;
    else if (hour >= 17)
        return 8;
    else if (hour >= 15)
        return 7;
    else if (hour >= 13)
        return 6;
    else if (hour >= 11)
        return 5;
    else if (hour >= 9)
        return 4;
    else if (hour >= 7)
        return 3;
    else if (hour >= 5)
        return 2;
    else if (hour >= 3)
        return 1;
    else
        return 0;
};

// TODO: random pokemon move across the screen occasionally
const flyingPokemon = [12,15,17,18,22,41,42,49,92,93,109,110,142,144,145,146,149,150,151];
const addPokemon = id => {
    const pokeElement = document.createElement('div');

    const flying = flyingPokemon.includes(id);
    const shiny = !!Math.round(Math.random());

    pokeElement.style.bottom = `${Math.floor(Math.random() * (10 + (flying ? 60 : 0))) + 5}vh`;
    pokeElement.style.backgroundImage = `url('images/pokemon/${id.toString().padStart(3, 0)}${shiny ? 's' : ''}.png')`;
    pokeElement.classList.add('pokemon');
    pokeElement.classList.add('walkLeft');
    document.body.appendChild(pokeElement);
    setTimeout(() => {
        document.body.removeChild(pokeElement);
    }, MINUTE)
}

const startAddingPokemon = () => {
    delay = Math.floor(Math.random() * (5 * SECOND));
    setTimeout(() => {
        // 151
        addPokemon(Math.floor(Math.random() * 150) + 1)
        startAddingPokemon();
    }, delay);
}
startAddingPokemon();
// setInterval(() => {
//     addPokemon(Math.floor(Math.random() * 250) + 1)
// }, 1000);