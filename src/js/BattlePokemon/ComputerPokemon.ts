import { AttackType } from '../Attacks';
import { getDistance, shuffleArray } from '../Functions';
import { pokemonMap } from '../PokemonList';
import Rand from '../Random';
import WindowSizes from '../WindowSizes';
import ActivePokemon from './ActivePokemon';
import BattlePokemon from './BattlePokemon';

export default class ComputerPokemon extends BattlePokemon {
  public static TICK = {
    ENEMY_CHECK: 10,
  }

  // Currently focused on enemy
  public enemy: BattlePokemon;
  // Interval between decisions
  public thinkInterval: NodeJS.Timeout;
  // Increases 1 every tick
  public tick = 0;
  // Decision stuff
  public retreatChance = 0;
  public retreatCounter = 0;
  public braveryChance = 0;
  public braveryCounter = 0;
  // Movement
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

  death(respawn = true): void {
    clearInterval(this.thinkInterval);
    super.death();
    if (respawn) {
      ActivePokemon.push(new ComputerPokemon(this.team));
    }
  }

  think(): void {
    // Increase tick
    this.tick++;

    this.updateEnemy();

    // TODO: Factor in current health
    this.braveryCounter += this.braveryCounter <= 5 && Math.random() <= this.braveryChance ? 10 + Math.floor(Math.random() * 30) : 0;
    if (this.braveryCounter > 0) {
      this.braveryCounter--;
      return this.moveToEnemy();
    }

    // TODO: Factor in current health
    this.retreatCounter += this.retreatCounter <= 5 && Math.random() <= this.retreatChance ? 5 + Math.floor(Math.random() * 30) : 0;
    if (this.retreatCounter > 0) {
      this.retreatCounter--;
      return this.moveAwayFromEnemy();
    }
    // If already attacking retreat
    if (this.attackElement) {
      this.moveAwayFromEnemy();
    } else { // Else move towards the enemy
      this.moveToEnemy();
    }
  }

  getMyPosition(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  updateEnemy(): BattlePokemon {
    if (this.enemy?.element && this.tick % ComputerPokemon.TICK.ENEMY_CHECK) {
      return;
    }
    let enemy: BattlePokemon | ComputerPokemon = null;
    let enemyDistance = Infinity;
    ActivePokemon.filter(p => p.team != this.team)?.forEach(e => {
      const distance = getDistance(e.element, this.element);
      if (distance < enemyDistance) {
        enemy = e;
        enemyDistance = distance;
      }
    });
    this.enemy = enemy;
  }

  // TODO: Select a target, then keep that target for next 10? ticks, check for a new target, less computations
  moveToEnemy(): void {
    if (!this.enemy) {
      return;
    }

    // Calculate where enemy is compared to us
    const enemyPos = this.getEnemyPosition();
    const pos = this.getMyPosition();
    const distX = enemyPos.x - pos.x;
    const distY = pos.y - enemyPos.y;

    // Stop moving
    this.movement.x = 0;
    this.movement.y = 0;

    const closeDist = WindowSizes.vh * 5;
    const closestDist = WindowSizes.vh * 0.9;

    // Check if we should move
    const moved = this.moveToOrder.some(m => m(distX, distY, closeDist, closestDist));

    // If we haven't moved, we must be near the enemy, face the enemy
    if (!moved) {
      if (Math.abs(distX) > Math.abs(distY)) {
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

    // If close enough, then attack
    if (Math.abs(distX) <= closeDist && Math.abs(distY) <= closeDist) {
      const attackType = Rand.fromWeightedArray([AttackType.physical, AttackType.special], [this.pokemon.base.attack, this.pokemon.base.specialAttack]) as AttackType;
      this.attack(attackType);
    }
  }

  moveAwayFromEnemy(): void {
    if (!this.enemy) {
      return;
    }

    // Calculate where enemy is compared to us
    const enemyPos = this.getEnemyPosition();
    const pos = this.getMyPosition();
    const distX = enemyPos.x - pos.x;
    const distY = pos.y - enemyPos.y;

    // Stop moving
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

  getEnemyPosition(): DOMRect {
    return this.enemy.element.getBoundingClientRect();
  }
}
