import { MINUTE, SECOND } from '../Constants';
import Rand from '../Random';

export default class BackgroundPokemon {
  static MAX_POKEMON_ID = 815;
  static SHINY_CHANCE = 512;

  // All the flying pokemon IDs (these pokemon can spawn in the sky)
  static flyingPokemon = [
    12, 15, 17, 18, 22, 41, 42, 49, 92, 93,
    109, 110, 142, 144, 145, 146, 149, 151, 164, 165, 166, 169, 176, 187, 188, 189, 193,
    200, 206, 227, 249, 250, 251, 267, 269, 277, 278, 279, 284, 291,
    329, 330, 333, 334, 358, 380, 381, 384, 385, 397, 398,
    414, 415, 416, 425, 426, 433, 462, 469, 479, 480, 481, 482, 488, 489, 490, 491,
    521, 527, 528, 567, 581,
    628, 642, 644, 645, 646, 662, 663, 666, 691,
    707, 714, 715, 738, 745, 746,
  ];

  static MIN_SPEED_STAT = 20;
  static MAX_SPEED_STAT = 180;
  static MAX_SPEED = 10;

  // Add a pokemon to the scene
  static addPokemon(id: number): void {
    const pokemonSpeed = Math.random() * this.MAX_SPEED_STAT + this.MIN_SPEED_STAT;
    let moveSpeed = Math.floor(((pokemonSpeed - this.MIN_SPEED_STAT) / (this.MAX_SPEED_STAT - this.MIN_SPEED_STAT)) * this.MAX_SPEED);
    // Adjust speed by -1 → +1 randomly
    moveSpeed += Math.floor(Math.random() * 3) - 1;
    moveSpeed = Math.max(0, Math.min(this.MAX_SPEED, moveSpeed));
    const flying = this.flyingPokemon.includes(id);
    const shiny = !Math.floor(Math.random() * this.SHINY_CHANCE);

    const pokeElement = document.createElement('div');
    const bottom = flying ? Rand.intBetween(20, 90) : Rand.intBetween(0, 15);
    pokeElement.style.bottom = `${bottom}vh`;
    pokeElement.style.zIndex = `${1e4 - bottom}`;
    pokeElement.style.backgroundImage = `${shiny ? 'url(\'images/pokemon/sparkle.png\'), ' : ''}url('images/pokemon/${id.toString().padStart(3, '0')}${shiny ? 's' : ''}.png')`;
    pokeElement.classList.add('backgroundPokemonSprite');
    pokeElement.classList.add(`speed-${moveSpeed}`);
    const direction = !!Math.round(Math.random());
    pokeElement.classList.add(`move-${direction ? 'left' : 'right'}`);
    document.body.appendChild(pokeElement);
    setTimeout(() => {
      document.body.removeChild(pokeElement);
    }, 2 * MINUTE);
  }

  /* SCENE MANAGEMENT */
  static timeout;

  static start(): void {
    // Random delay up to 7 seconds
    const delay = Rand.intBetween(0.2 * SECOND, 7 * SECOND);

    // Assign our timeout function so we can stop it later
    this.timeout = setTimeout(() => {
      this.addPokemon(Rand.intBetween(0, this.MAX_POKEMON_ID));
      // Add another pokemon
      this.start();
    }, delay);
  }

  static stop(): void {
    clearTimeout(this.timeout);
    [...document.querySelectorAll('.backgroundPokemonSprite')].forEach(el => el.remove());
  }
}
