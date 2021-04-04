
class WindowSizes {
  public static vh = 0;
  public static vhw = 0;

  public static calculateValues(): void {
    WindowSizes.vh = Math.round(window.innerHeight / 100);
    WindowSizes.vhw = Math.floor(window.innerWidth / WindowSizes.vh) - 8;
  }
}
WindowSizes.calculateValues();
window.onresize = () => WindowSizes.calculateValues();

export default WindowSizes;
