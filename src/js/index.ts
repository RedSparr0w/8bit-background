import { Module } from 'node:module';
import '../css/style.scss';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

class WindowSizes {
    public static vh = 0;
    public static vhw = 0;

    public static calculateValues() {
        WindowSizes.vh = Math.round(window.innerHeight / 100);
        WindowSizes.vhw = Math.floor(window.innerWidth / WindowSizes.vh) - 8;
    }
}
WindowSizes.calculateValues();
window.onresize = () => WindowSizes.calculateValues();

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
    public hp: number;

    public movement = {
        x: 0,
        y: 0,
    };

    constructor(
        public id: number,
        public speed: number,
        public attack: number,
        public maxHP: number,
        public player_controlled = false,
    ) {
        this.hp = this.maxHP;
        this.speed = Math.max(0, Math.min(10, this.speed));
        this.shiny = this.calculateShiny();
        this.spawn();
    }

    updatePosition() {
        if (!this.movement.x && !this.movement.y) return;
        // Update the firection the player is facing
        let direction = '';
        if (this.movement.x == 1) direction = 'right';
        else if (this.movement.x == -1) direction = 'left';
        else if (this.movement.y == 1) direction = 'up';
        else if (this.movement.y == -1) direction = 'down';
        this.faceDirection(direction);

        // TODO: Calculate actual max it can go to the right
        this.element.style.left = `${Math.max(0, Math.min(WindowSizes.vhw, parseFloat(this.element.style.left) + this.movement.x))}vh`;
        this.element.style.bottom = `${Math.max(0, Math.min(14, parseFloat(this.element.style.bottom) + this.movement.y))}vh`;
        this.element.style.zIndex = (1e4 - (parseFloat(this.element.style.bottom) * 10)).toString();
    }

    calculateShiny() {
        return !Math.floor(Math.random() * Pokemon.SHINY_CHANCE);
    }

    spawn() {
        this.element = document.createElement('div');
        this.element.style.bottom = `0`;
        this.element.style.left = `${this.player_controlled ? 0 : WindowSizes.vhw}vh`;
        this.element.style.backgroundImage = `${this.shiny ? 'url(\'images/pokemon/sparkle.png\'), ' : ''}url('images/pokemon/${this.id.toString().padStart(3, '0')}${this.shiny ? 's' : ''}.png')`;
        this.element.classList.add('pokemonSprite');
        this.element.classList.add(`speed-${this.speed}`);
        this.element.classList.add(`walk-right`);
        document.body.appendChild(this.element);

        if (this.player_controlled) {
            document.body.addEventListener('keydown', (e: KeyboardEvent) => {
                switch (e.key) {
                    case 'w':
                        this.movement.x = 0;
                        this.movement.y = 1;
                        break;
                    case 'a':
                        this.movement.x = -1;
                        this.movement.y = 0;
                        break;
                    case 's':
                        this.movement.x = 0;
                        this.movement.y = -1;
                        break;
                    case 'd':
                        this.movement.x = 1;
                        this.movement.y = 0;
                        break;
                }
            });

            document.body.addEventListener('keyup', (e: KeyboardEvent) => {
                switch (e.key) {
                    case 'w':
                        if (this.movement.y == 1) {
                            this.movement.y = 0;
                        }
                        break;
                    case 's':
                        if (this.movement.y == -1) {
                            this.movement.y = 0;
                        }
                        break;
                    case 'a':
                        if (this.movement.x == -1) {
                            this.movement.x = 0;
                        }
                        break;
                    case 'd':
                        if (this.movement.x == 1) {
                            this.movement.x = 0;
                        }
                        break;
                }
            });
        }
        
        setInterval(() => this.updatePosition(), 150 - (this.speed * 5));
    }

    faceDirection(direction: string) {
        this.element.classList.replace('walk-up', `walk-${direction}`);
        this.element.classList.replace('walk-left', `walk-${direction}`);
        this.element.classList.replace('walk-down', `walk-${direction}`);
        this.element.classList.replace('walk-right', `walk-${direction}`);
    }

    faceUp() {
        this.faceDirection('up');
    }

    faceLeft() {
        this.faceDirection('left');
    }

    faceDown() {
        this.faceDirection('down');
    }

    faceRight() {
        this.faceDirection('right');
    }
}

class EnemyPokemon {
    public pokemon: Pokemon;
    constructor() {
        const ID = Math.floor(Math.random() * 151) + 1;
        const speed = Math.floor(Math.random() * 10) + 1;
        const hp = Math.floor(Math.random() * 40) + 10;
        const attack = Math.floor(Math.random() * 40) + 5;
        this.pokemon = new Pokemon(ID, speed, hp, attack);
        // TODO: Make it have a "brain" to choose who to track/attack or move randomly etc
        setInterval(() => this.moveToClosestEnemy(), 100);
    }

    getPosition() {
        return this.pokemon.element.getBoundingClientRect();
    }

    moveToClosestEnemy() {
        const enemyPos = this.getClosestEnemyPosition();
        const pos = this.getPosition();
        const distX = enemyPos.x - pos.x;
        const distY = pos.y - enemyPos.y;
        this.pokemon.movement.x = 0;
        this.pokemon.movement.y = 0;
        const closeDist = WindowSizes.vh * 5;
        const closestDist = WindowSizes.vh * 0.5;

        if (distY >= closeDist) this.pokemon.movement.y = 1;
        else if (distY >= closestDist && (distX > 20 || distX < -20)) this.pokemon.movement.y = 1;
        else if (distY <= -closeDist) this.pokemon.movement.y = -1;
        else if (distY <= -closestDist && (distX > 20 || distX < -20)) this.pokemon.movement.y = -1;
        else if (distX > closeDist) this.pokemon.movement.x = 1;
        else if (distX < -closeDist) this.pokemon.movement.x = -1;
        else if (Math.abs(distX) > Math.abs(distY))
            if (distX <= 0) this.pokemon.faceLeft();
            else this.pokemon.faceRight();
        else if (Math.abs(distY) > Math.abs(distX))
            if (distY <= 0) this.pokemon.faceDown();
            else this.pokemon.faceUp();
    }

    moveAwayClosestEnemy() {
        const enemyPos = this.getClosestEnemyPosition();
        const pos = this.getPosition();
        const distX = enemyPos.x - pos.x;
        const distY = pos.y - enemyPos.y;
        this.pokemon.movement.x = 0;
        this.pokemon.movement.y = 0;
        const closeDist = WindowSizes.vh * 30;
        const closestDist = WindowSizes.vh * 0.5;

        if (distX > closeDist && distX) this.pokemon.movement.x = -1;
        else if (distX < -closeDist) this.pokemon.movement.x = 1;
        else if (distY >= closeDist) this.pokemon.movement.y = -1;
        else if (distY >= closestDist && (distX > 20 || distX < -20)) this.pokemon.movement.y = -1;
        else if (distY <= -closeDist) this.pokemon.movement.y = 1;
        else if (distY <= -closestDist && (distX > 20 || distX < -20)) this.pokemon.movement.y = 1;
        else if (Math.abs(distX) > Math.abs(distY))
            if (distX <= 0) this.pokemon.faceLeft();
            else this.pokemon.faceRight();
        else if (Math.abs(distY) > Math.abs(distX))
            if (distY <= 0) this.pokemon.faceDown();
            else this.pokemon.faceUp();
    }

    getClosestEnemyPosition() {
        return playerPokemon.element.getBoundingClientRect();
    }
}

const playerPokemon: Pokemon = new Pokemon(6, 10, 20, 10, true);

const enemyPokemon: EnemyPokemon[] = [
    new EnemyPokemon(),
];


export {
    DynamicBackground,
    Pokemon,
    playerPokemon,
    enemyPokemon,
}
