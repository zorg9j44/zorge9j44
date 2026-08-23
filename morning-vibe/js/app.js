// Morning Vibe — мобильное меню и форма бронирования

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.classList.toggle('is-active', isOpen);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.classList.remove('is-active');
      });
    });
  }

  const form = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');

  if (form && success) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      success.classList.add('is-visible');
      form.reset();
    });
  }
});
