import { pokemonMap, PokemonListData, minSpeed, maxSpeed } from './PokemonList';
import WindowSizes from './WindowSizes';
import { elementsColliding, getDistance, shuffleArray } from './Functions';
import { Attack, Attacks, AttackType, selectAttack } from './Attacks';
import Rand from './Random';

export class Pokemon {
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
  public attacks: {
    [AttackType.physical]: Attack,
    [AttackType.special]: Attack,
  };

  public movement = {
    x: 0,
    y: 0,
  };

  constructor(
      public team: number,
      public pokemon: PokemonListData = pokemonMap.random(),
      public player_controlled = false
  ) {
    this.hp = this.pokemon.base.hitpoints;
    const speedSpread = maxSpeed - minSpeed;

    this.attacks = {
      [AttackType.physical]: selectAttack(this.pokemon.type[0], this.pokemon.type[1], AttackType.physical, this.pokemon.id),
      [AttackType.special]: selectAttack(this.pokemon.type[0], this.pokemon.type[1], AttackType.special, this.pokemon.id),
    };

    this.speed = Math.round(((this.pokemon.base.speed - minSpeed) / speedSpread) * 20);
    this.shiny = this.calculateShiny();
    this.spawn();
  }

  updatePosition(): void {
    if (!this.movement.x && !this.movement.y) {
      return;
    }
    // Update the firection the player is facing
    let direction = '';
    if (this.movement.x == 1) {
      direction = 'right';
    } else if (this.movement.x == -1) {
      direction = 'left';
    } else if (this.movement.y == 1) {
      direction = 'up';
    } else if (this.movement.y == -1) {
      direction = 'down';
    }
    this.faceDirection(direction);

    // TODO: Calculate actual max it can go to the right
    this.element.style.left = `${Math.max(0, Math.min(WindowSizes.vhw, parseFloat(this.element.style.left) + this.movement.x))}vh`;
    this.element.style.bottom = `${Math.max(0, Math.min(14, parseFloat(this.element.style.bottom) + this.movement.y))}vh`;
    this.element.style.zIndex = (1e4 - (parseFloat(this.element.style.bottom) * 10)).toString();
  }

  calculateShiny(): boolean {
    return !Math.floor(Math.random() * Pokemon.SHINY_CHANCE);
  }

  spawn(): void {
    this.element = document.createElement('div');
    this.element.style.bottom = `${Math.floor(Math.random() * 15)}vh`;
    this.element.style.left = `${this.team <= 1 ? 0 : WindowSizes.vhw}vh`;
    this.element.style.backgroundImage = `${this.shiny ? 'url(\'images/pokemon/sparkle.png\'), ' : ''}url('images/pokemon/${this.pokemon.id.toString().padStart(3, '0')}${this.shiny ? 's' : ''}.png')`;
    this.element.classList.add('pokemonSprite');
    this.element.classList.add(`speed-${this.speed}`);
    this.element.classList.add('walk-right');
    this.hpElement = document.createElement('progress');
    this.hpElement.max = this.pokemon.base.hitpoints;
    this.hpElement.value = this.pokemon.base.hitpoints;
    this.hpElement.classList.add('hit-points');
    this.hpElement.classList.add(`team${this.team}`);
    this.element.appendChild(this.hpElement);
    document.body.appendChild(this.element);

    if (this.player_controlled) {
      document.body.addEventListener('keydown', (e: KeyboardEvent) => {
        switch (e.key) {
          case 'q':
            this.attack(AttackType.physical);
            break;
          case 'e':
            this.attack(AttackType.special);
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

  faceDirection(direction: string): void {
    this.element.classList.replace('walk-up', `walk-${direction}`);
    this.element.classList.replace('walk-left', `walk-${direction}`);
    this.element.classList.replace('walk-down', `walk-${direction}`);
    this.element.classList.replace('walk-right', `walk-${direction}`);
  }

  faceUp(): void {
    this.faceDirection('up');
  }

  faceLeft(): void {
    this.faceDirection('left');
  }

  faceDown(): void {
    this.faceDirection('down');
  }

  faceRight(): void {
    this.faceDirection('right');
  }

  getDirection(): string {
    if (this.element.classList.contains('walk-up')) {
      return 'up';
    }
    if (this.element.classList.contains('walk-left')) {
      return 'left';
    }
    if (this.element.classList.contains('walk-down')) {
      return 'down';
    }
    if (this.element.classList.contains('walk-right')) {
      return 'right';
    }
  }

  // TODO: close range, long range, different typed attacks, maybe some ability attacks
  attack(type: AttackType): void {
    if (this.attackElement || this.hp <= 0) {
      return;
    }

    const attack = this.attacks[type];
    if (!attack) {
      return;
    }

    this.attackElement = document.createElement('div');
    this.attackElement.classList.add('attack');
    this.attackElement.classList.add(attack.name);
    document.body.appendChild(this.attackElement);

    const position = this.element.getBoundingClientRect();
    const direction = this.getDirection();
    const newPosition = {
      left: position.left,
      top: position.top,
    };

    const height = this.attackElement.clientHeight;
    const width = this.attackElement.clientWidth;

    if (direction == 'up') {
      newPosition.top -= height;
    }
    if (direction == 'down') {
      newPosition.top += height;
    }
    if (direction == 'left') {
      newPosition.left -= width;
    }
    if (direction == 'right') {
      newPosition.left += width;
    }

    this.attackElement.style.left = `${newPosition.left}px`;
    this.attackElement.style.top = `${newPosition.top}px`;

    setTimeout(() => {
      this.attackElement?.remove();
    }, attack.duration);

    setTimeout(() => {
      this.attackElement = null;
    }, attack.cooldown);

    const enemies = activePokemon.filter(p => p.team != this.team);
    enemies.forEach(p => {
      const colliding = elementsColliding(this.attackElement, p.element);
      if (colliding) {
        p.takeDamage((type == AttackType.physical ? this.pokemon.base.attack : this.pokemon.base.specialAttack) / 10);
        if (p.hp <= 0) {
          this.heal();
        }
      }
    });
  }

  heal(amount = this.pokemon.base.hitpoints / 5): number {
    this.hp = Math.min(this.pokemon.base.hitpoints, this.hp + amount);
    this.hpElement.value = this.hp;
    return this.hp;
  }

  // TODO: type advantages, defensive resistance
  takeDamage(amount: number): number {
    this.hp -= amount;
    this.hpElement.value = this.hp;
    if (this.hp <= 0) {
      this.death();
    }
    return this.hp;
  }

  death(): void {
    console.log(this.pokemon.name, 'has fainted');
    clearTimeout(this.timeout);
    this.element?.remove();
    this.hpElement?.remove();
    this.attackElement?.remove();
    this.element = null;
    this.hpElement = null;
    this.attackElement = null;
    const index = activePokemon.findIndex(p => p == this);
    activePokemon.splice(index, 1);
    if (this.player_controlled) {
      activePokemon.push(new Pokemon(1, pokemonMap.random(), true));
    }
  }
}


export class ComputerPokemon extends Pokemon {
  public thinkInterval: NodeJS.Timeout;
  public retreatChance = 0;
  public retreatCounter = 0;
  public braveryChance = 0;
  public braveryCounter = 0;
  public moveToOrder = [
    // move up
    (dx: number, dy: number, c1: number, c2: number): boolean => {
      if (dy >= c1) {
        this.movement.y = 1;
        return true;
      }
    },
    // move up to same level before moving over
    (dx: number, dy: number, c1: number, c2: number): boolean => {
      if (dy >= c2 && (dx > 20 || dx < -20)) {
        this.movement.y = 1;
        return true;
      }
    },
    // move down
    (dx: number, dy: number, c1: number, c2: number): boolean => {
      if (dy <= -c1) {
        this.movement.y = -1;
        return true;
      }
    },
    // move down to same level before moving over
    (dx: number, dy: number, c1: number, c2: number): boolean => {
      if (dy <= -c2 && (dx > 20 || dx < -20)) {
        this.movement.y = -1;
        return true;
      }
    },
    // move right
    (dx: number, dy: number, c1: number, c2: number): boolean => {
      if (dx >= c1) {
        this.movement.x = 1;
        return true;
      }
    },
    // move left
    (dx: number, dy: number, c1: number, c2: number): boolean => {
      if (dx <= -c1) {
        this.movement.x = -1;
        return true;
      }
    },
  ]

  constructor(team = 1, p = pokemonMap.random()) {
    super(team, p, false);
    // Give some randomness to the movements
    this.moveToOrder = shuffleArray(this.moveToOrder);
    // TODO: Make it have a "brain" to choose who to track/attack or move randomly etc
    this.retreatChance = Math.random() * 0.02;
    this.braveryChance = Math.random() * 0.1;
    this.thinkInterval = global.setInterval(() => this.think(), 100);
  }

  death(): void {
    clearInterval(this.thinkInterval);
    super.death();
    activePokemon.push(new ComputerPokemon(this.team));
  }

  think(): void {
    // TODO: Factor in current health
    this.braveryCounter += this.braveryCounter <= 5 && Math.random() <= this.braveryChance ? 10 + Math.floor(Math.random() * 30) : 0;
    if (this.braveryCounter > 0) {
      this.braveryCounter--;
      return this.moveToClosestEnemy();
    }

    // TODO: Factor in current health
    this.retreatCounter += this.retreatCounter <= 5 && Math.random() <= this.retreatChance ? 5 + Math.floor(Math.random() * 30) : 0;
    if (this.retreatCounter > 0) {
      this.retreatCounter--;
      return this.moveAwayClosestEnemy();
    }
    // If already attacking retreat
    if (this.attackElement) {
      this.moveAwayClosestEnemy();
    } else { // Else move towards the enemy
      this.moveToClosestEnemy();
    }
  }

  getPosition(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  // TODO: Select a target, then keep that target for next 10? ticks, check for a new target, less computations
  moveToClosestEnemy(): void {
    const enemyPos = this.getClosestEnemyPosition();
    if (!enemyPos) {
      return;
    }
    const pos = this.getPosition();
    const distX = enemyPos.x - pos.x;
    const distY = pos.y - enemyPos.y;
    this.movement.x = 0;
    this.movement.y = 0;
    const closeDist = WindowSizes.vh * 5;
    const closestDist = WindowSizes.vh * 0.9;
    const moved = this.moveToOrder.some(m => m(distX, distY, closeDist, closestDist));
    if (!moved && Math.abs(distX) > Math.abs(distY)) {
      if (distX <= 0) {
        this.faceLeft();
      } else {
        this.faceRight();
      }
    } else if (!moved && Math.abs(distY) > Math.abs(distX)) {
      if (distY <= 0) {
        this.faceDown();
      } else {
        this.faceUp();
      }
    }

    // If close enough, then attack
    if (Math.abs(distX) <= closeDist && Math.abs(distY) <= closeDist) {
      const attackType = Rand.fromWeightedArray([AttackType.physical, AttackType.special], [this.pokemon.base.attack, this.pokemon.base.specialAttack]) as AttackType;
      this.attack(attackType);
    }
  }

  moveAwayClosestEnemy(): void {
    const enemyPos = this.getClosestEnemyPosition();
    if (!enemyPos) {
      return;
    }
    const pos = this.getPosition();
    const distX = enemyPos.x - pos.x;
    const distY = pos.y - enemyPos.y;
    this.movement.x = 0;
    this.movement.y = 0;
    const furthestDist = WindowSizes.vh * 30;
    const closestDist = WindowSizes.vh * 0.2;
    const totalDist = (Math.abs(distX) + Math.abs(distY));

    if (totalDist <= furthestDist) {
      if (distX > closestDist && distX <= furthestDist && totalDist) {
        this.movement.x = -1;
      } else if (distX < -closestDist && distX >= -furthestDist) {
        this.movement.x = 1;
      } else if (distY > closestDist && distY <= furthestDist) {
        this.movement.y = -1;
      } else if (distY < -closestDist && distY >= -furthestDist) {
        this.movement.y = 1;
      }
    } else if (Math.abs(distX) > Math.abs(distY)) {
      if (distX <= 0) {
        this.faceLeft();
      } else {
        this.faceRight();
      }
    } else if (Math.abs(distY) > Math.abs(distX)) {
      if (distY <= 0) {
        this.faceDown();
      } else {
        this.faceUp();
      }
    }
  }

  getClosestEnemyPosition(): DOMRect {
    let enemy: Pokemon | ComputerPokemon = null;
    let enemyDistance = Infinity;
    activePokemon.filter(p => p.team != this.team)?.forEach(e => {
      const distance = getDistance(e.element, this.element);
      if (distance < enemyDistance) {
        enemy = e;
        enemyDistance = distance;
      }
    });
    return enemy.element.getBoundingClientRect();
  }
}

export const activePokemon: Array<Pokemon> = [
  new Pokemon(1, pokemonMap.random(), true), // players pokemon
  new ComputerPokemon(1),
  new ComputerPokemon(1),
  new ComputerPokemon(2),
  new ComputerPokemon(2),
];
