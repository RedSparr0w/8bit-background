import '../css/style.scss';
import { pokemonMap, PokemonListData, minSpeed, maxSpeed } from './PokemonList';

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
    public hpElement: HTMLProgressElement;
    public timeout: NodeJS.Timeout;
    public keydown = false;
    public hp: number;
    public speed: number;
    public attackElement: HTMLDivElement;

    public movement = {
        x: 0,
        y: 0,
    };

    constructor(
        public pokemon: PokemonListData,
        public team: number,
        public player_controlled = false,
    ) {
        this.hp = this.pokemon.base.hitpoints;
        const speedSpread = maxSpeed - minSpeed;

        this.speed = Math.round(((this.pokemon.base.speed - minSpeed) / speedSpread) * 20);
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
        this.element.style.bottom = `${Math.floor(Math.random() * 15)}vh`;
        this.element.style.left = `${this.team <= 1 ? 0 : WindowSizes.vhw}vh`;
        this.element.style.backgroundImage = `${this.shiny ? 'url(\'images/pokemon/sparkle.png\'), ' : ''}url('images/pokemon/${this.pokemon.id.toString().padStart(3, '0')}${this.shiny ? 's' : ''}.png')`;
        this.element.classList.add('pokemonSprite');
        this.element.classList.add(`speed-${this.speed}`);
        this.element.classList.add(`walk-right`);
        this.hpElement = document.createElement('progress');
        this.hpElement.max = this.pokemon.base.hitpoints;
        this.hpElement.value = this.pokemon.base.hitpoints;
        this.hpElement.classList.add(`hit-points`);
        this.element.appendChild(this.hpElement);
        document.body.appendChild(this.element);

        if (this.player_controlled) {
            document.body.addEventListener('keydown', (e: KeyboardEvent) => {
                switch (e.key) {
                    case 'q':
                        this.attack();
                        break;
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
        
        this.timeout = global.setInterval(() => this.updatePosition(), 160 - (this.speed * 5));
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

    getDirection() {
        if(this.element.classList.contains('walk-up')) return 'up';
        if(this.element.classList.contains('walk-left')) return 'left';
        if(this.element.classList.contains('walk-down')) return 'down';
        if(this.element.classList.contains('walk-right')) return 'right';
    }

    attack() {
        if (this.attackElement) return;
        this.attackElement = document.createElement('div');
        this.attackElement.classList.add('attack');
        this.attackElement.classList.add('cut');

        const position = this.element.getBoundingClientRect();
        const direction = this.getDirection();
        const newPosition = {
            left: position.left,
            top: position.top,
        }
        if (direction == 'up') { newPosition.top -= WindowSizes.vh * 4 }
        if (direction == 'down') { newPosition.top += WindowSizes.vh * 4 }
        if (direction == 'left') { newPosition.left -= WindowSizes.vh * 4 }
        if (direction == 'right') { newPosition.left += WindowSizes.vh * 4 }

        this.attackElement.style.left = `${newPosition.left}px`;
        this.attackElement.style.top = `${newPosition.top}px`;

        document.body.appendChild(this.attackElement);
        setTimeout(() => {
            this.attackElement.remove();
            this.attackElement = null;
        }, 750);

        let enemies = pokemon.filter(p => p.team != this.team);
        enemies.forEach(p => {
            const colliding = is_colliding(this.attackElement, p.element);
            if (colliding) {
                p.takeDamage(this.pokemon.attack / 10);
            }
        });
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hpElement.value -= amount;
        if (this.hp <= 0) {
            this.death();
        }
    }

    death() {
        console.log(this.pokemon.name, 'has fainted');
        clearTimeout(this.timeout);
        this.element?.remove();
        this.hpElement?.remove();
        this.attackElement?.remove();
        this.element = null;
        this.hpElement = null;
        this.attackElement = null;
        const index = pokemon.findIndex(p => p == this);
        pokemon.splice(index, 1);
        if (this.player_controlled) {
            pokemon.push(new Pokemon(pokemonMap.random(), 1, true));
        }
    }
}

class ComputerPokemon extends Pokemon {
    public thinkInterval: NodeJS.Timeout;
    constructor(team = 1, p = pokemonMap.random()) {
        super(p, team, false);
        // TODO: Make it have a "brain" to choose who to track/attack or move randomly etc
        this.thinkInterval = global.setInterval(() => this.think(), 100);
    }

    death() {
        clearInterval(this.thinkInterval);
        super.death();
        pokemon.push(new ComputerPokemon(this.team));
    }

    think() {
        if (this.attackElement) {
            this.moveAwayClosestEnemy();
        } else {
            this.moveToClosestEnemy();
        }
    }

    getPosition(): DOMRect {
        return this.element.getBoundingClientRect();
    }

    moveToClosestEnemy() {
        const enemyPos = this.getClosestEnemyPosition();
        if (!enemyPos) return;
        const pos = this.getPosition();
        const distX = enemyPos.x - pos.x;
        const distY = pos.y - enemyPos.y;
        this.movement.x = 0;
        this.movement.y = 0;
        const closeDist = WindowSizes.vh * 5;
        const closestDist = WindowSizes.vh * 0.9;

        // move up
        if (distY >= closeDist) this.movement.y = 1;
        // move up to same level before moving over
        else if (distY >= closestDist && (distX > 20 || distX < -20)) this.movement.y = 1;
        // move down
        else if (distY <= -closeDist) this.movement.y = -1;
        // move down to same level before moving over
        else if (distY <= -closestDist && (distX > 20 || distX < -20)) this.movement.y = -1;
        // move right
        else if (distX >= closeDist) this.movement.x = 1;
        // move left
        else if (distX <= -closeDist) this.movement.x = -1;
        else if (Math.abs(distX) > Math.abs(distY)) {
            if (distX <= 0) this.faceLeft();
            else this.faceRight();
            this.attack()
        } else if (Math.abs(distY) > Math.abs(distX)) {
            if (distY <= 0) this.faceDown();
            else this.faceUp();
            this.attack()
        }
    }

    moveAwayClosestEnemy() {
        const enemyPos = this.getClosestEnemyPosition();
        if (!enemyPos) return;
        const pos = this.getPosition();
        const distX = enemyPos.x - pos.x;
        const distY = pos.y - enemyPos.y;
        this.movement.x = 0;
        this.movement.y = 0;
        const furthestDist = WindowSizes.vh * 30;
        const closestDist = WindowSizes.vh * 0.2;
        const totalDist = (Math.abs(distX) + Math.abs(distY));

        if (totalDist <= furthestDist) {
            if (distX > closestDist && distX <= furthestDist && totalDist) this.movement.x = -1;
            else if (distX < -closestDist && distX >= -furthestDist) this.movement.x = 1;
            else if (distY > closestDist && distY <= furthestDist) this.movement.y = -1;
            else if (distY < -closestDist && distY >= -furthestDist) this.movement.y = 1;
        } else if (Math.abs(distX) > Math.abs(distY)) {
            if (distX <= 0) this.faceLeft();
            else this.faceRight();
        } else if (Math.abs(distY) > Math.abs(distX)) {
            if (distY <= 0) this.faceDown();
            else this.faceUp();
        }
    }

    getClosestEnemyPosition(): DOMRect {
        let enemy: Pokemon | ComputerPokemon = null;
        let enemyDistance = Infinity;
        pokemon.filter(p => p.team != this.team)?.forEach(e => {
           const distance = getDistance(e.element, this.element);
           if (distance < enemyDistance) {
               enemy = e;
               enemyDistance = distance;
           }
        });
        return enemy.element.getBoundingClientRect()
    }
}


const is_colliding = (div1: HTMLElement, div2: HTMLElement) => {
	// Div 1 data
	const d1 = div1.getBoundingClientRect();
	const d1_from_top  = d1.top + d1.height;
	const d1_from_left = d1.left + d1.width;

	// Div 2 data
	const d2 = div2.getBoundingClientRect();
	const d2_from_top  = d2.top + d2.height;
	const d2_from_left = d2.left + d2.width;

	return !(d1_from_top < d2.top || d1.top > d2_from_top || d1_from_left < d2.left || d1.left > d2_from_left);
};

const getDistance = (div1: HTMLElement, div2: HTMLElement) => {
	const d1 = div1.getBoundingClientRect();
	const d2 = div2.getBoundingClientRect();

    const distX = Math.abs(d1.x - d2.x);
    const distY = Math.abs(d1.y - d2.y);

	return distX + distY;
};

const pokemon: Array<ComputerPokemon | Pokemon> = [
    new Pokemon(pokemonMap.random(), 1, true), // players pokemon
    new ComputerPokemon(1),
    new ComputerPokemon(1),
    new ComputerPokemon(2),
    new ComputerPokemon(2),
];


export {
    DynamicBackground,
    Pokemon,
    pokemon,
}
