import '../css/style.scss';
import './Menu';
import DynamicBackground from './DynamicBackground';
import ActivePokemon from './BattlePokemon/ActivePokemon';
import WindowSizes from './WindowSizes';

// Update WindowSize info and Dynamic background on window resize
window.onresize = () => {
  DynamicBackground.updateScene();
  WindowSizes.calculateValues();
};

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
