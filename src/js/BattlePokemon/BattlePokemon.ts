import { Attack, AttackType, selectAttack } from '../Attacks';
import { CONSTANTS } from '../Constants';
import { elementsColliding } from '../Functions';
import { PokemonListData, maxSpeed, minSpeed, pokemonMap } from '../PokemonList';
import WindowSizes from '../WindowSizes';
import ActivePokemon from './ActivePokemon';

export default class BattlePokemon {

  public shiny = false;
  public element: HTMLDivElement;
  public hpElement: HTMLProgressElement;
  public timeout: NodeJS.Timeout;
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
    return !Math.floor(Math.random() * CONSTANTS.SHINY_CHANCE);
  }

  spawn(): void {
    this.element = document.createElement('div');
    this.element.style.bottom = `${Math.floor(Math.random() * 15)}vh`;
    this.element.style.left = `${this.team <= 1 ? 0 : WindowSizes.vhw}vh`;
    this.element.style.backgroundImage = `${this.shiny ? 'url(\'images/pokemon/sparkle.png\'), ' : ''}url('images/pokemon/${this.pokemon.id.toString().padStart(3, '0')}${this.shiny ? 's' : ''}.png')`;
    this.element.classList.add('battlePokemonSprite');
    this.element.classList.add(`speed-${this.speed}`);
    this.element.classList.add('walk-right');
    this.hpElement = document.createElement('progress');
    this.hpElement.max = this.pokemon.base.hitpoints;
    this.hpElement.value = this.pokemon.base.hitpoints;
    this.hpElement.classList.add('hit-points');
    this.hpElement.classList.add(`team${this.team}`);
    this.element.appendChild(this.hpElement);
    document.body.appendChild(this.element);

    this.timeout = global.setInterval(() => this.updatePosition(), 150 - (this.speed * 5));
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

    const direction = this.getDirection();

    this.attackElement = document.createElement('div');
    this.attackElement.classList.add('attack');
    this.attackElement.classList.add(attack.name);
    this.attackElement.classList.add(`dir-${direction}`);
    document.body.appendChild(this.attackElement);

    const position = this.element.getBoundingClientRect();
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

  death(respawn = true): void {
    clearTimeout(this.timeout);
    this.element?.remove();
    this.hpElement?.remove();
    this.attackElement?.remove();
    this.element = null;
    this.hpElement = null;
    this.attackElement = null;
    if (respawn) {
      ActivePokemon.respawnPokemon(this);
    }
  }
}
