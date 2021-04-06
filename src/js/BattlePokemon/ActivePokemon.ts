import { BattlePokemon, ComputerPokemon } from './BattlePokemon';

const ActivePokemon: Array<BattlePokemon> = [
  new BattlePokemon(1, undefined, true), // players pokemon
  new ComputerPokemon(1),
  new ComputerPokemon(1),
  new ComputerPokemon(2),
  new ComputerPokemon(2),
];

export default ActivePokemon;
