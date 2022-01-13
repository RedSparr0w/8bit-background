import '../css/style.scss';
import './Menu';
import DynamicBackground from './DynamicBackground';
import ActivePokemon from './BattlePokemon/ActivePokemon';
import BackgroundPokemon from './BackgroundPokemon/BackgroundPokemon';
import WindowSizes from './WindowSizes';

// Update WindowSize info and Dynamic background on window resize
window.onresize = () => {
  WindowSizes.calculateValues();
  DynamicBackground.updateScene();
};

export {
  DynamicBackground,
  BackgroundPokemon,
  ActivePokemon,
};
