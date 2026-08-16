/**
 * navigation.js — Header stickiness, active section links & mobile menu
 */

export function initNav(navLinks = [], brand = {}, waLink = '') {
  const header = document.querySelector('.site-header');
  const linksContainer = document.getElementById('nav-links-container');
  const ctaContainer = document.getElementById('nav-cta-container');
  const burger = document.querySelector('.nav__burger');
  const overlay = document.getElementById('nav-overlay');

  // 1. Render Desktop Nav Links
  if (linksContainer && navLinks.length) {
    linksContainer.innerHTML = navLinks.map(link => `
      <li>
        <a href="${link.href}" class="nav__link">${link.label}</a>
      </li>
    `).join('') + `
      <li class="nav__mobile-cta">
        <a href="#contacto" class="btn btn--primary btn--block">Reservar Hora</a>
      </li>
    `;
  }

  // 2. Render Header CTA
  if (ctaContainer) {
    ctaContainer.innerHTML = `
      <a href="#contacto" class="btn btn--primary btn--sm shimmer-btn">Reservar Hora</a>
    `;
  }

  // 3. Scroll Header state
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header?.classList.add('site-header--scrolled');
    } else {
      header?.classList.remove('site-header--scrolled');
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${id}"]`);

      if (scrollPosition >= top && scrollPosition < top + height) {
        document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('nav__link--active'));
        link?.classList.add('nav__link--active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 4. Mobile Burger Drawer
  const toggleMenu = (open) => {
    const isExpanded = open !== undefined ? open : burger?.getAttribute('aria-expanded') !== 'true';
    burger?.setAttribute('aria-expanded', String(isExpanded));
    linksContainer?.classList.toggle('is-active', isExpanded);
    overlay?.classList.toggle('is-active', isExpanded);
    document.body.style.overflow = isExpanded ? 'hidden' : '';
  };

  burger?.addEventListener('click', () => toggleMenu());
  overlay?.addEventListener('click', () => toggleMenu(false));

  // Close mobile menu on link click
  linksContainer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}
