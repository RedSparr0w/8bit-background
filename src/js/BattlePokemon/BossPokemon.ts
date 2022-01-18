import { AttackType } from '../Attacks';
import { elementsColliding, getDistance, shuffleArray } from '../Functions';
import { pokemonMap } from '../PokemonList';
import Rand from '../Random';
import WindowSizes from '../WindowSizes';
import ActivePokemon from './ActivePokemon';
import BattlePokemon from './BattlePokemon';

export default class BossPokemon extends BattlePokemon {
  public static TICK = {
    ENEMY_CHECK: 20,
  }

  // Currently focused on enemy
  public enemy: BattlePokemon;
  // Interval between decisions
  public thinkInterval: NodeJS.Timeout;
  // Increases 1 every tick
  public tick = 0;

  constructor(p = pokemonMap.random()) {
    super(2, p, false);
    // TODO: Make it have a "brain" to choose who to track/attack or move randomly etc
    this.thinkInterval = global.setInterval(() => this.think(), 50);
    this.pokemon.base.hitpoints = this.pokemon.base.hitpoints * 1000;
    this.hp = this.pokemon.base.hitpoints;
    this.hpElement.max = this.pokemon.base.hitpoints;
    this.hpElement.value = this.pokemon.base.hitpoints;
  }

  death(respawn = true): void {
    clearInterval(this.thinkInterval);
    super.death(respawn);
  }

  think(): void {
    // Increase tick
    this.tick++;

    this.updateEnemy();

    this.moveToEnemy();
  }

  getMyPosition(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  updateEnemy(): BattlePokemon {
    if (this.enemy?.element && this.tick % BossPokemon.TICK.ENEMY_CHECK) {
      return;
    }
    let enemy: BattlePokemon = null;
    let enemyDistance = Infinity;
    ActivePokemon.list.filter(p => p.team != this.team)?.forEach(e => {
      const distance = Math.abs(getDistance(e.element, this.element));
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
    const posY = enemyPos.y;

    if (distX <= 0) {
      this.faceLeft();
    } else {
      this.faceRight();
    }

    // If close enough, then attack
    const attackType = Rand.fromWeightedArray([AttackType.physical, AttackType.special], [this.pokemon.base.attack, this.pokemon.base.specialAttack]) as AttackType;
    this.attack(attackType);
  }

  getEnemyPosition(): DOMRect {
    return this.enemy.element.getBoundingClientRect();
  }

  spawn(): void {
    super.spawn();
    this.element.classList.add('big');
    this.element.style.bottom = '10vh';
    this.element.style.left = 'calc(50vw - 30vh)';
  }

  heal(): number {
    this.hp = Math.min(this.pokemon.base.hitpoints, this.hp + (this.enemy.pokemon.base.hitpoints / 10));
    this.hpElement.value = this.hp;
    return this.hp;
  }

  attack(type: AttackType): void {
    if (this.attackElement || this.hp <= 0) {
      return;
    }

    const attack = this.attacks[type];
    if (!attack) {
      return;
    }

    const direction = this.getDirection();

    this.attackElement = document.createElement('div');
    this.attackElement.classList.add('attack');
    this.attackElement.classList.add(attack.name);
    this.attackElement.classList.add(`dir-${direction}`);
    document.body.appendChild(this.attackElement);

    const enemyPosition = this.enemy.element.getBoundingClientRect();

    const width = this.attackElement.clientWidth;

    if (direction == 'left') {
      this.attackElement.style.left = `${enemyPosition.left - 20}px`;
    }
    if (direction == 'right') {
      this.attackElement.style.left = `${enemyPosition.left + 20}px`;
    }

    this.attackElement.style.top = `${this.enemy.element.getBoundingClientRect().top}px`;

    setTimeout(() => {
      this.attackElement?.remove();
    }, attack.duration);

    setTimeout(() => {
      this.attackElement = null;
    }, attack.cooldown);

    const enemies = ActivePokemon.list.filter(p => p.team != this.team);
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
}
