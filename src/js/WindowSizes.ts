
class WindowSizes {
  // View Height
  public static vh = 0;
  // View Height Width?, How many vh fit in vw?
  public static vhw = 0;
  // View Width
  public static vw = 0;

  public static calculateValues(): void {
    WindowSizes.vh = Math.round(window.innerHeight / 100);
    WindowSizes.vhw = Math.floor(window.innerWidth / WindowSizes.vh) - 8;
    WindowSizes.vw = Math.round(window.innerWidth / 100);
  }
}
WindowSizes.calculateValues();

export default WindowSizes;
