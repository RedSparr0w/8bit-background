import { PokemonType } from './PokemonList';

export enum AttackType {
  physical,
  special,
  ability,
}

export type Attack = {
  name: string,
  type: AttackType,
  duration: number,
  cooldown: number,
};

const Attacks: Record<PokemonType, Attack[]> = {
  [PokemonType.None]: [],
  [PokemonType.Normal]: [
    {
      name: 'cut',
      type: AttackType.physical,
      duration: 750,
      cooldown: 1000,
    },
  ],
  [PokemonType.Fire]: [],
  [PokemonType.Water]: [],
  [PokemonType.Electric]: [],
  [PokemonType.Grass]: [],
  [PokemonType.Ice]: [],
  [PokemonType.Fighting]: [],
  [PokemonType.Poison]: [],
  [PokemonType.Ground]: [],
  [PokemonType.Flying]: [],
  [PokemonType.Psychic]: [],
  [PokemonType.Bug]: [],
  [PokemonType.Rock]: [],
  [PokemonType.Ghost]: [],
  [PokemonType.Dragon]: [],
  [PokemonType.Dark]: [],
  [PokemonType.Steel]: [],
  [PokemonType.Fairy]: [],
};

export default Attacks;
