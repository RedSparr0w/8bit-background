const menu = document.getElementById('menu');

document.getElementById('openMenu').onclick = (): void => {
  menu.style.width = '250px';
};

/* Set the width of the side navigation to 0 */
document.getElementById('closeMenu').onclick = (): void => {
  menu.style.width = '0px';
};