import { PokemonType } from './PokemonList';

type Attack = {
  name: string,
  duration: number,
  cooldown: number,
};

const Attacks: Record<PokemonType, Attack> = {
  [PokemonType.Normal]: {
    name: 'cut',
    duration: 750,
    cooldown: 1000,
  },
};

export default Attacks;
