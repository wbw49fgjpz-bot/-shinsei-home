'use strict';
// Native details keeps navigation and FAQs usable without JavaScript.
const menu = document.querySelector('.navigation');
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
document.addEventListener('click', (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});
document.querySelector('#year').textContent = new Date().getFullYear();
