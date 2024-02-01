import { Pane } from 'tweakpane';
import BackgroundPokemon from './BackgroundPokemon/BackgroundPokemon';
import ActivePokemon from './BattlePokemon/ActivePokemon';
import { CONSTANTS } from './Constants';

const PARAMS = {
  pokemonDisplay: 'passive',
  playerPokemon: false,
  controls: {
    movement: 'WASD',
    physicalAttack: 'Q',
    specialAttack: 'E',
  },
};

const pane = new Pane({
  title: 'Settings',
  expanded: true,
});

pane.addBinding(PARAMS, 'pokemonDisplay', {
  label: 'Pokémon',
  options: {
    None: 'none',
    Passive: 'passive',
    Fighting: 'active',
  },
}).on('change', (e) => {
  const val = e.value;

  // Hide all options
  paneFolderPassiveOptions.hidden = true;
  paneFolderFightingOptions.hidden = true;

  // Stop all current pokemon activities
  BackgroundPokemon.stop();
  ActivePokemon.clearAll();

  // Start selected pokemon activity
  switch (val) {
    case 'passive':
      BackgroundPokemon.start();
      paneFolderPassiveOptions.hidden = false;
      break;
    case 'active':
      // Add 4 pokemon to start with
      for (let i = 4; i >  0; i--) {
        ActivePokemon.add();
      }
      paneFolderFightingOptions.hidden = false;
      break;
  }

  // Save the last selected option in settings/local storage
  localStorage.pokemonDisplay = val;

  // Hide some options, show possible options
});

pane.addBinding(CONSTANTS, 'SHINY_CHANCE', {
  label: 'Shiny Chance',
  min: 1,
  max: 1024,
  step: 1,
});

const paneFolderPassiveOptions = pane.addFolder({
  title: 'Passive Options',
  expanded: true,
  hidden: false,
});

paneFolderPassiveOptions.addBinding(BackgroundPokemon, 'MAX_DELAY', {
  label: 'Max Appearance Delay (seconds)',
  min: 1,
  max: 10,
  step: 1,
  rows: 5,
  suffix: 'test',
});

const paneFolderFightingOptions = pane.addFolder({
  title: 'Fighting Options',
  expanded: true,
  hidden: true,
});

paneFolderFightingOptions.addButton({
  title: 'Add Pokémon',
}).on('click', () => {
  ActivePokemon.add();
});

paneFolderFightingOptions.addButton({
  title: 'Remove Pokémon',
}).on('click', () => {
  ActivePokemon.remove();
});

paneFolderFightingOptions.addBinding(PARAMS, 'playerPokemon', {
  label: 'Player Controled Pokémon',
}).on('change', (e) => {
  e.value ? ActivePokemon.addPlayer() : ActivePokemon.removePlayer();
});

const paneControlsFolder = paneFolderFightingOptions.addFolder({
  title: 'Controls',
  expanded: false,
});

paneControlsFolder.addBinding(PARAMS.controls, 'movement', {
  readonly: true,
  label: 'Movement',
});

paneControlsFolder.addBinding(PARAMS.controls, 'physicalAttack', {
  readonly: true,
  label: 'Physical Attack',
});

paneControlsFolder.addBinding(PARAMS.controls, 'specialAttack', {
  readonly: true,
  label: 'Special Attack',
});
