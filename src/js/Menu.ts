import BackgroundPokemon from './BackgroundPokemon/BackgroundPokemon';
import ActivePokemon from './BattlePokemon/ActivePokemon';

const menu = document.getElementById('menu');

document.getElementById('openMenu').onclick = (): void => {
  menu.style.left = '0px';
};

document.getElementById('closeMenu').onclick = (): void => {
  menu.style.left = '-250px';
};

document.getElementById('pokemonDisplay').onchange = (e): void => {
  const val = (e.target as HTMLSelectElement).value;
  BackgroundPokemon.stop();
  ActivePokemon.clearAll();
  switch (val) {
    case 'passive':
      BackgroundPokemon.start();
      break;
    case 'active':
      for (let i = 4; i >  0; i--) {
        ActivePokemon.add();
      }
      break;
  }

  // Save the last selected option in settings/local storage
  localStorage.pokemonDisplay = val;
};

(document.getElementById('pokemonDisplay') as HTMLSelectElement).value = localStorage.pokemonDisplay || 'none';
(document.getElementById('pokemonDisplay') as HTMLSelectElement).dispatchEvent(new Event('change'));
