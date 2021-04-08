import '../css/style.scss';
import './Menu';
import DynamicBackground from './DynamicBackground';
import ActivePokemon from './BattlePokemon/ActivePokemon';

// Add some pokemon
ActivePokemon.addPlayer();
ActivePokemon.add();
ActivePokemon.add();
ActivePokemon.add();
ActivePokemon.add();

export {
  DynamicBackground,
  ActivePokemon,
};
