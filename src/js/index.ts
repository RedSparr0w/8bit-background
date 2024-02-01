import '../css/style.scss';
import BackgroundPokemon from './BackgroundPokemon/BackgroundPokemon';
import ActivePokemon from './BattlePokemon/ActivePokemon';
import DynamicBackground from './DynamicBackground';
import './Menu';
import WindowSizes from './WindowSizes';

// Update WindowSize info and Dynamic background on window resize
window.onresize = () => {
  DynamicBackground.updateScene();
  WindowSizes.calculateValues();
};

export {
  ActivePokemon,
  BackgroundPokemon,
  DynamicBackground,
};

