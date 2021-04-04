import { MINUTE } from './Constants';

class DynamicBackground {
  static autoUpdateScene;

  /* SUN & MOON */
  static setSunMoonPosition = (date = new Date()): void => {
    const h = window.innerHeight;
    const w = window.innerWidth / 1.2;

    // Get the hours and minutes.
    const hours = date.getHours();
    const mins = date.getMinutes();

    // Calculate the position of the sun and moon based on the time.
    const sunRad = (((hours) * 60 + mins) / (24 * 60)) * Math.PI * 2;
    const moonRad = (((hours + 12) * 60 + mins) / (24 * 60)) * Math.PI * 2;

    // Calculate the axis
    const sunX = (w / 1.8) - (w * Math.sin(sunRad)) / 2;
    const sunY = (h / 2) + (h * Math.cos(sunRad)) / 2;
    const moonX = (w / 1.8) - (w * Math.sin(moonRad)) / 2;
    const moonY = (h / 1.4) + (h * Math.cos(moonRad)) / 2;

    // Apply the positions based on our previous calculations
    const sun = document.getElementById('sun');
    sun.style.top = `${sunY}px`;
    sun.style.left = `${sunX}px`;
    const moon = document.getElementById('moon');
    moon.style.top = `${moonY}px`;
    moon.style.left = `${moonX}px`;
  };

  /* SKY & GROUND */
  static updateBackgrounds = (d = new Date()): void => {
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const bgNumber = DynamicBackground.getPicture(hour);

    // Determine starting background images:
    const bgNumberNext = (bgNumber + 1) % 12;

    // Get opacity (i.e. how far (in percentage) are we in a certain time-block):
    // Every block is 2 hours, so 1 hour into a block would be 50% (0.50)
    // If we are in an even hour add 50%
    let opacity = hour % 2 ? 0 : 0.5;
    // Every minute would be 1/120th of a block (minutes / 120)
    opacity += minutes / 120;

    // Set sky image
    document.getElementById('sky1').classList.value = `sky sky-${bgNumber}`;
    document.getElementById('sky2').style.opacity = opacity.toString();
    document.getElementById('sky2').classList.value = `sky sky-${bgNumberNext}`;

    // Set ground image
    document.getElementById('ground1').classList.value = `ground ground-${bgNumber}`;
    document.getElementById('ground2').style.opacity = opacity.toString();
    document.getElementById('ground2').classList.value = `ground ground-${bgNumberNext}`;
  };

  // Determines the images to use based on the current hour
  static getPicture = (hour: number): number => (hour ? Math.floor((hour - 1) / 2) : 11);

  /* POKEMON */

  static updateScene = (date = new Date()): void => {
    try {
      DynamicBackground.setSunMoonPosition(date);
      DynamicBackground.updateBackgrounds(date);
    } catch (e) {
      console.error(e);
    }
  };

  static startScene = (): void => {
    // Update the background now then every minute
    DynamicBackground.updateScene();
    DynamicBackground.autoUpdateScene = setInterval(DynamicBackground.updateScene, MINUTE);
  };

  static stopScene = (): void => {
    // Stop updating background images
    clearInterval(DynamicBackground.autoUpdateScene);
  };
}

DynamicBackground.startScene();

export default DynamicBackground;
