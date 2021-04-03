import { Module } from 'node:module';
import '../css/style.scss';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

class DynamicBackground {
    static autoUpdateScene;

    /* SUN & MOON */
    static setSunMoonPosition = (date = new Date()) => {
        const h = window.innerHeight;
        const w = window.innerWidth / 1.2;

        // Get the hours and minutes.
        const hours = date.getHours();
        const mins = date.getMinutes();

        // Calculate the position of the sun and moon based on the time.
        const sunRad = (((hours) * 60 + mins) / (24 * 60)) * Math.PI * 2;
        const moonRad = (((hours + 12) * 60 + mins) / (24 * 60)) * Math.PI * 2;

        // Calculate the axis
        const sunX = (w / 1.8) - (w * Math.sin(sunRad)) / 2;
        const sunY = (h / 2) + (h * Math.cos(sunRad)) / 2;
        const moonX = (w / 1.8) - (w * Math.sin(moonRad)) / 2;
        const moonY = (h / 1.4) + (h * Math.cos(moonRad)) / 2;

        // Apply the positions based on our previous calculations
        const sun = document.getElementById('sun');
        sun.style.top = `${sunY}px`;
        sun.style.left = `${sunX}px`;
        const moon = document.getElementById('moon');
        moon.style.top = `${moonY}px`;
        moon.style.left = `${moonX}px`;
    };

    /* SKY & GROUND */
    static updateBackgrounds = (d = new Date()) => {
        const hour = d.getHours();
        const minutes = d.getMinutes();
        const bgNumber = DynamicBackground.getPicture(hour);

        // Determine starting background images:
        const bgNumberNext = (bgNumber + 1) % 12;

        // Get opacity (i.e. how far (in percentage) are we in a certain time-block):
        // Every block is 2 hours, so 1 hour into a block would be 50% (0.50)
        // If we are in an even hour add 50%
        let opacity = hour % 2 ? 0 : 0.5;
        // Every minute would be 1/120th of a block (minutes / 120)
        opacity += minutes / 120;

        // Set sky image
        document.getElementById('sky1').classList.value = `sky sky-${bgNumber}`;
        document.getElementById('sky2').style.opacity = opacity.toString();
        document.getElementById('sky2').classList.value = `sky sky-${bgNumberNext}`;

        // Set ground image
        document.getElementById('ground1').classList.value = `ground ground-${bgNumber}`;
        document.getElementById('ground2').style.opacity = opacity.toString();
        document.getElementById('ground2').classList.value = `ground ground-${bgNumberNext}`;
    };

    // Determines the images to use based on the current hour
    static getPicture = (hour) => (hour ? Math.floor((hour - 1) / 2) : 11);

    /* POKEMON */

    static updateScene = (date = new Date()) => {
        try {
            DynamicBackground.setSunMoonPosition(date);
            DynamicBackground.updateBackgrounds(date);
        } catch (e) { console.error(e); }
    };

    static startScene = () => {
        // Update the background now then every minute
        DynamicBackground.updateScene();
        DynamicBackground.autoUpdateScene = setInterval(DynamicBackground.updateScene, MINUTE);
    };

    static stopScene = () => {
        // Stop updating background images
        clearInterval(DynamicBackground.autoUpdateScene);
    };
};

DynamicBackground.startScene();

class Pokemon {
    static MAX_POKEMON_ID = 815;
    static SHINY_CHANCE = 512;
    public shiny = false;
    public element: HTMLDivElement;
    public moving: NodeJS.Timeout;
    public keydown = false;

    constructor(
        public id: number,
        public speed: number,
        public hp: number,
        public attack: number
    ) {
        this.speed = Math.max(0, Math.min(10, this.speed));
        this.shiny = this.calculateShiny();
        this.spawn();
    }

    calculateShiny() {
        return !Math.floor(Math.random() * Pokemon.SHINY_CHANCE);
    }

    spawn() {
        this.element = document.createElement('div');
        this.element.style.bottom = `0vh`;
        this.element.style.left = '-4vh';
        this.element.style.zIndex = (1e4 + parseInt(this.element.style.bottom)).toString();
        this.element.style.backgroundImage = `${this.shiny ? 'url(\'images/pokemon/sparkle.png\'), ' : ''}url('images/pokemon/${this.id.toString().padStart(3, '0')}${this.shiny ? 's' : ''}.png')`;
        this.element.classList.add('pokemonSprite');
        this.element.classList.add(`speed-${this.speed}`);
        this.element.classList.add(`walk-right`);
        document.body.appendChild(this.element);
        document.body.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.keydown) {
                switch (e.key) {
                    case 'w':
                        this.keydown = true;
                        this.moveUp();
                        this.moving = global.setInterval(() => {
                            this.moveUp();
                        }, 400);
                        break;
                    case 'a':
                        this.keydown = true;
                        this.moveLeft();
                        this.moving = global.setInterval(() => {
                            this.moveLeft();
                        }, 800);
                        break;
                    case 's':
                        this.keydown = true;
                        this.moveDown();
                        this.moving = global.setInterval(() => {
                            this.moveDown();
                        }, 400);
                        break;
                    case 'd':
                        this.keydown = true;
                        this.moveRight();
                        this.moving = global.setInterval(() => {
                            this.moveRight();
                        }, 800);
                        break;
                }
            }
        });
        document.body.addEventListener('keyup', (e: KeyboardEvent) => {
            if (this.keydown) {
                switch (e.key) {
                    case 'w':
                    case 'a':
                    case 's':
                    case 'd':
                        this.keydown = false;
                        clearInterval(this.moving);
                        break;
                }
            }
        });
    }

    faceLeft() {
        this.element.classList.replace('walk-up', 'walk-left');
        this.element.classList.replace('walk-right', 'walk-left');
        this.element.classList.replace('walk-down', 'walk-left');
    }

    moveLeft() {
        this.faceLeft();
        const left = parseInt(this.element.style.left);
        if (left > 0) {
            this.element.style.left = `${left - 4}vh`;
        }
    }

    faceRight() {
        this.element.classList.replace('walk-up', 'walk-right');
        this.element.classList.replace('walk-left', 'walk-right');
        this.element.classList.replace('walk-down', 'walk-right');
    }

    moveRight() {
        this.faceRight();
        const left = parseInt(this.element.style.left);
        // TODO: calculate how far they can actually go
        if (left <= 100) {
            this.element.style.left = `${parseInt(this.element.style.left) + 4}vh`;
        }
    }

    faceUp() {
        this.element.classList.replace('walk-left', 'walk-up');
        this.element.classList.replace('walk-right', 'walk-up');
        this.element.classList.replace('walk-down', 'walk-up');
    }

    moveUp() {
        this.faceUp();
        const bottom = parseInt(this.element.style.bottom);
        if (bottom < 14) {
            this.element.style.bottom = `${bottom + 2}vh`;
        }
    }

    faceDown() {
        this.element.classList.replace('walk-left', 'walk-down');
        this.element.classList.replace('walk-right', 'walk-down');
        this.element.classList.replace('walk-up', 'walk-down');
    }

    moveDown() {
        this.faceDown();
        const bottom = parseInt(this.element.style.bottom);
        if (bottom > 0) {
            this.element.style.bottom = `${bottom - 2}vh`;
        }
    }
}

const pikachu = new Pokemon(6, 5, 20, 10);

export {
    DynamicBackground,
    Pokemon,
    pikachu,
}
