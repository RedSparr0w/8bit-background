import BattlePokemon from './BattlePokemon';
import ComputerPokemon from './ComputerPokemon';
import PlayerPokemon from './PlayerPokemon';

class ActivePokemon {
  static list: BattlePokemon[] = [];

  static add(): void {
    const team1Count = this.list.filter(p => p.team == 1).length;
    const team2Count = this.list.filter(p => p.team == 2).length;
    const team = team1Count > team2Count ? 2 : 1;
    this.list.push(new ComputerPokemon(team));
  }

  static addPlayer(team = 1): void {
    const index = this.list.findIndex(p => p.player_controlled);
    if (index < 0) {
      this.list.push(new PlayerPokemon(team, undefined));
    }
  }

  static remove(): void {
    const team1Count = this.list.filter(p => p.team == 1);
    const team2Count = this.list.filter(p => p.team == 2);
    const team = team1Count > team2Count ? 1 : 2;
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
    if (index >= 0) {
      this.list.splice(index, 1);
    }
    pokemon.player_controlled ? this.addPlayer() : this.add();
  }

  static clearAll(): void {
    let index = this.list.length;
    while (index-- > 0) {
      this.list[index].death(false);
      this.list.splice(index, 1);
    }
  }
}

document.getElementById('addPokemon').addEventListener('click', () => {
  ActivePokemon.add();
});

document.getElementById('removePokemon').addEventListener('click', () => {
  ActivePokemon.remove();
});

export default ActivePokemon;
