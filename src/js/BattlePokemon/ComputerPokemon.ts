import { AttackType } from '../Attacks';
import { getDistance, shuffleArray } from '../Functions';
import { pokemonMap } from '../PokemonList';
import Rand from '../Random';
import WindowSizes from '../WindowSizes';
import ActivePokemon from './ActivePokemon';
import BattlePokemon from './BattlePokemon';

export default class ComputerPokemon extends BattlePokemon {
  public static TICK = {
    ENEMY_CHECK: 20,
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

  constructor(team = 1, p = pokemonMap.random()) {
    super(team, p, false);
    // TODO: Make it have a "brain" to choose who to track/attack or move randomly etc
    this.retreatChance = (Math.random() * 0.05) + 0.05;
    this.braveryChance = (Math.random() * 0.05) + 0.05;
    this.thinkInterval = global.setInterval(() => this.think(), 50);
  }

  death(respawn = true): void {
    clearInterval(this.thinkInterval);
    super.death(respawn);
  }

  think(): void {
    // Increase tick
    this.tick++;

    this.updateEnemy();

    // TODO: Factor in current health
    this.braveryCounter += this.braveryCounter <= 6 && Rand.fromChance(this.braveryChance) ? Rand.intBetween(20, 100) : 0;
    if (this.braveryCounter > 0) {
      this.braveryCounter--;
      return this.moveToEnemy();
    }

    // TODO: Factor in current health
    this.retreatCounter += this.retreatCounter <= 6 && Rand.fromChance(this.retreatChance) ? Rand.intBetween(10, 60) : 0;
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
    this.enemy = ActivePokemon.boss;
  }

  // TODO: Select a target, then keep that target for next 10? ticks, check for a new target, less computations
  moveToEnemy(): void {
    if (!this.enemy) {
      return;
    }

    // Calculate where enemy is compared to us
    const dist = getDistance(this.element, this.enemy.element);

    // Stop moving
    this.movement.x = dist > 0 ? 1 : dist < 0 ? -1 : 0;

    const closeDist = WindowSizes.vh * 10;

    if (dist < 0) {
      this.faceLeft();
    } else if (dist > 0) {
      this.faceRight();
    }

    // If close enough, then attack
    if (Math.abs(dist) <= closeDist) {
      const attackType = Rand.fromWeightedArray([AttackType.physical, AttackType.special], [this.pokemon.base.attack, this.pokemon.base.specialAttack]) as AttackType;
      this.attack(attackType);
    }
  }

  moveAwayFromEnemy(): void {
    if (!this.enemy) {
      return;
    }

    const furthestDist = WindowSizes.vw * 30;

    // Calculate where enemy is compared to us
    const dist = getDistance(this.element, this.enemy.element);

    if (Math.abs(dist) >= furthestDist) {
      this.movement.x = 0;

      if (dist < 0) {
        this.faceLeft();
      } else if (dist > 0) {
        this.faceRight();
      }
      return;
    }

    // Stop moving
    this.movement.x = dist > 0 ? -1 : dist < 0 ? 1 : 0;

    if (dist > 0) {
      this.faceLeft();
    } else if (dist < 0) {
      this.faceRight();
    }
  }

  getEnemyPosition(): DOMRect {
    return this.enemy.element.getBoundingClientRect();
  }
}
