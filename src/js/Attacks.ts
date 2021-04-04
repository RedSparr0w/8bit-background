import { PokemonType } from './PokemonList';
import SeededRand from './SeededRand';

export enum AttackType {
  physical,
  special,
}

export type Attack = {
  name: string,
  type: AttackType,
  duration: number,
  cooldown: number,
};

export const Attacks: Record<PokemonType, Attack[]> = {
  [PokemonType.None]: [],
  [PokemonType.Normal]: [
    {
      name: 'cut',
      type: AttackType.physical,
      duration: 750,
      cooldown: 1000,
    },
    {
      name: 'cut2',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
  ],
  [PokemonType.Fire]: [
    {
      name: 'fire-punch',
      type: AttackType.physical,
      duration: 750,
      cooldown: 1000,
    },
  ],
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

export const selectAttack = (type: PokemonType, type2: PokemonType, attackType: AttackType, id = 0): Attack => {
  let possibleAttacks: Attack[] = [];

  if (type != undefined) {
    possibleAttacks.push(...Attacks[type]);
  }

  if (type2 != undefined) {
    possibleAttacks.push(...Attacks[type2]);
  }

  possibleAttacks = possibleAttacks.filter(a => a.type == attackType);
  if (!possibleAttacks.length) {
    possibleAttacks = Attacks[PokemonType.Normal].filter(a => a.type == attackType);
  }

  SeededRand.seed(id);
  const attack = SeededRand.fromArray(possibleAttacks) as Attack;

  return attack;
};
