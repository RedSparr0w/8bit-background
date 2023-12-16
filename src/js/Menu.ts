import { Pane } from 'tweakpane';
import BackgroundPokemon from './BackgroundPokemon/BackgroundPokemon';
import ActivePokemon from './BattlePokemon/ActivePokemon';

const PARAMS = {
  pokemonDisplay: 'passive',
};

const pane = new Pane({
  title: 'Settings',
  expanded: true,
});


export const Movement = pane.addFolder({
  title: 'Movement',
  expanded: true,
});

// END TWEAKPANE

const menu = document.getElementById('menu');

document.getElementById('openMenu').onclick = (): void => {
  menu.style.left = '0px';
};

document.getElementById('closeMenu').onclick = (): void => {
  menu.style.left = '-250px';
};

document.getElementById('pokemonDisplay').onchange = (e): void => {
  const val = (e.target as HTMLSelectElement).value;

  // Stop all current pokemon activities
  BackgroundPokemon.stop();
  ActivePokemon.clearAll();

  // Hide all options
  [...document.querySelectorAll('.menuOptions')].forEach((el: HTMLDivElement) => el.style.display = 'none');

  // Start selected pokemon activity
  switch (val) {
    case 'passive':
      BackgroundPokemon.start();
      break;
    case 'active':
      for (let i = 4; i >  0; i--) {
        ActivePokemon.add();
      }
      document.getElementById('playerControlledPokemon').dispatchEvent(new Event('change'));
      break;
  }

  // Save the last selected option in settings/local storage
  localStorage.pokemonDisplay = val;

  // Show possible options
  const elToShow = document.getElementById(`${val}Options`);
  if (elToShow) {
    elToShow.style.display = 'block';
  }
};

(document.getElementById('pokemonDisplay') as HTMLSelectElement).value = localStorage.pokemonDisplay || 'passive';
(document.getElementById('pokemonDisplay') as HTMLSelectElement).dispatchEvent(new Event('change'));
