import BattlePokemon from './BattlePokemon';
import ComputerPokemon from './ComputerPokemon';
import BossPokemon from './BossPokemon';
import { pokemonMap } from '../PokemonList';

class ActivePokemon {
  static boss: BattlePokemon;
  static list: BattlePokemon[] = [];

  static spawnBoss(): void {
    this.boss = new BossPokemon(pokemonMap['Arceus (normal)']);
  }

  static add(team = 1): void {
    this.list.push(new ComputerPokemon(team));
  }

  static remove(team = 1): void {
    const index = this.list.findIndex(p => p.team == team);
    if (index >= 0) {
      this.list[index].death(false);
      this.list.splice(index, 1);
    }
  }

  static removePlayer(): void {
    const index = this.list.findIndex(p => p.player_controlled);
    if (index >= 0) {
      this.list[index].death(false);
      this.list.splice(index, 1);
    }
  }

  static respawnPokemon(pokemon: BattlePokemon): void {
    const index = this.list.findIndex(p => p == pokemon);
    const team = this.list[index]?.team ?? 1;
    if (index >= 0) {
      this.list.splice(index, 1);
    }
    this.add(team);
  }

  static clearAll(): void {
    let index = this.list.length;
    while (index-- > 0) {
      this.list[index].death(false);
      this.list.splice(index, 1);
    }
    this.boss?.death(false);
  }
}

document.getElementById('addPokemon').addEventListener('click', () => {
  ActivePokemon.add();
});

document.getElementById('removePokemon').addEventListener('click', () => {
  ActivePokemon.remove();
});

export default ActivePokemon;
