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
      duration: 500,
      cooldown: 750,
    },
    {
      name: 'cut2',
      type: AttackType.physical,
      duration: 600,
      cooldown: 850,
    },
    {
      name: 'pound',
      type: AttackType.physical,
      duration: 700,
      cooldown: 950,
    },
    {
      name: 'swift',
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
    {
      name: 'fire-blast',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
    {
      name: 'fire-fang',
      type: AttackType.physical,
      duration: 600,
      cooldown: 850,
    },
  ],
  [PokemonType.Water]: [
    {
      name: 'bubble',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
    {
      name: 'splash',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
    {
      name: 'water-gun',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
  ],
  [PokemonType.Electric]: [
    {
      name: 'spark',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
    {
      name: 'thunder-fang',
      type: AttackType.physical,
      duration: 600,
      cooldown: 850,
    },
  ],
  [PokemonType.Grass]: [
    {
      name: 'seed-bomb',
      type: AttackType.physical,
      duration: 750,
      cooldown: 1000,
    },
    {
      name: 'razor-leaf',
      type: AttackType.physical,
      duration: 600,
      cooldown: 850,
    },
  ],
  [PokemonType.Ice]: [
    {
      name: 'ice-fang',
      type: AttackType.physical,
      duration: 600,
      cooldown: 850,
    },
  ],
  [PokemonType.Fighting]: [
    {
      name: 'punch',
      type: AttackType.physical,
      duration: 500,
      cooldown: 750,
    },
  ],
  [PokemonType.Poison]: [
    {
      name: 'smog',
      type: AttackType.special,
      duration: 1000,
      cooldown: 1010,
    },
  ],
  [PokemonType.Ground]: [
    {
      name: 'mud-slap',
      type: AttackType.special,
      duration: 500,
      cooldown: 750,
    },
  ],
  [PokemonType.Flying]: [
    {
      name: 'gust',
      type: AttackType.special,
      duration: 750,
      cooldown: 1000,
    },
  ],
  [PokemonType.Psychic]: [],
  [PokemonType.Bug]: [
    {
      name: 'string-shot',
      type: AttackType.special,
      duration: 500,
      cooldown: 750,
    },
  ],
  [PokemonType.Rock]: [
    {
      name: 'rock-throw',
      type: AttackType.special,
      duration: 500,
      cooldown: 750,
    },
  ],
  [PokemonType.Ghost]: [
    {
      name: 'shadow-claw',
      type: AttackType.physical,
      duration: 700,
      cooldown: 900,
    },
  ],
  [PokemonType.Dragon]: [],
  [PokemonType.Dark]: [
    {
      name: 'bite',
      type: AttackType.physical,
      duration: 500,
      cooldown: 750,
    },
    {
      name: 'dark-pulse',
      type: AttackType.special,
      duration: 1000,
      cooldown: 1010,
    },
  ],
  [PokemonType.Steel]: [],
  [PokemonType.Fairy]: [
    {
      name: 'misty-explosion',
      type: AttackType.special,
      duration: 1000,
      cooldown: 1010,
    },
  ],
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
