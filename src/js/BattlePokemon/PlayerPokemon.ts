import { AttackType } from '../Attacks';
import { PokemonListData, pokemonMap } from '../PokemonList';
import BattlePokemon from './BattlePokemon';

export default class PlayerPokemon extends BattlePokemon {
  constructor(
    public team: number,
    public pokemon: PokemonListData = pokemonMap.random()
  ) {
    super(team, pokemon, true);

    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyQ':
          this.attack(AttackType.physical);
          break;
        case 'KeyE':
          this.attack(AttackType.special);
          break;
        case 'KeyW':
          this.movement.x = 0;
          this.movement.y = 1;
          break;
        case 'KeyA':
          this.movement.x = -1;
          this.movement.y = 0;
          break;
        case 'KeyS':
          this.movement.x = 0;
          this.movement.y = -1;
          break;
        case 'KeyD':
          this.movement.x = 1;
          this.movement.y = 0;
          break;
      }
    });

    document.body.addEventListener('keyup', (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          if (this.movement.y == 1) {
            this.movement.y = 0;
          }
          break;
        case 'KeyS':
          if (this.movement.y == -1) {
            this.movement.y = 0;
          }
          break;
        case 'KeyA':
          if (this.movement.x == -1) {
            this.movement.x = 0;
          }
          break;
        case 'KeyD':
          if (this.movement.x == 1) {
            this.movement.x = 0;
          }
          break;
      }
    });
  }
}
