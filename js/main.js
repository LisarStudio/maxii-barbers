/**
 * main.js — Maxi Studio / Maxii Barbers Orchestrator
 */

import { setText, setMeta, buildWhatsAppLink } from './modules/utils.js';
import { initNav } from './modules/navigation.js';
import { initScrollAnimations } from './modules/animations.js';
import { initServices } from './modules/services.js';
import { initGallery } from './modules/gallery.js';
import { initFaqAccordion } from './modules/faq.js';
import { initBooking } from './modules/booking.js';

(async function () {
  let site = {};
  let data = {};

  try {
    const [siteRes, dataRes] = await Promise.all([
      fetch('site.json', { cache: 'no-store' }),
      fetch('data-site.json', { cache: 'no-store' })
    ]);
    site = await siteRes.json();
    data = await dataRes.json();
  } catch (e) {
    console.error('[Maxi Studio] Error cargando JSON:', e);
  }

  const brand = site?.brand || {};
  const contact = site?.contact || {};
  const theme = site?.theme || {};

  /* 1. SEO & Theme Meta */
  document.title = site?.seo?.title || 'Maxii Barbers | Private Barber Studio';
  setMeta('meta[name="description"]', site?.seo?.description);
  setMeta('meta[property="og:title"]', site?.seo?.title);
  setMeta('meta[property="og:description"]', site?.seo?.description);
  setMeta('meta[property="og:image"]', site?.seo?.ogImagePath);

  const root = document.documentElement;
  if (theme.colors?.primary) root.style.setProperty('--c-brand', theme.colors.primary);
  if (theme.colors?.bg) root.style.setProperty('--c-page', theme.colors.bg);

  /* 2. Hero Data Binding */
  const hero = data?.content?.hero || {};
  setText('[data-bind="hero.overline"]', hero.overline);
  setText('[data-bind="hero.title"]', hero.title);
  setText('[data-bind="hero.subtitle"]', hero.subtitle);
  setText('[data-bind-text="hero.ctaText"]', hero.ctaText);

  /* 3. About Section Binding */
  const about = data?.about || {};
  setText('[data-bind="about.overline"]', about.overline);
  setText('[data-bind="about.title"]', about.title);
  setText('[data-bind="about.description"]', about.description);
  setText('[data-bind="about.stat1Value"]', about.stat1Value);
  setText('[data-bind="about.stat1Label"]', about.stat1Label);
  setText('[data-bind="about.stat2Value"]', about.stat2Value);
  setText('[data-bind="about.stat2Label"]', about.stat2Label);
  setText('[data-bind="about.stat3Value"]', about.stat3Value);
  setText('[data-bind="about.stat3Label"]', about.stat3Label);

  const aboutPillarsContainer = document.getElementById('about-pillars-grid');
  if (aboutPillarsContainer && about.pillars?.length) {
    aboutPillarsContainer.innerHTML = about.pillars.map(p => `
      <div class="pillar-item">
        <h4 class="pillar-item__title">${p.title}</h4>
        <p class="pillar-item__desc">${p.description}</p>
      </div>
    `).join('');
  }

  /* 4. Inauguration Promo Banner */
  const promo = data?.inauguration || {};
  setText('[data-bind="promo.overline"]', promo.overline);
  setText('[data-bind="promo.title"]', promo.title);
  setText('[data-bind="promo.lead"]', promo.lead);

  /* 5. Footer & Global Links */
  setText('[data-bind="brand.name"]', brand.name);
  setText('[data-bind="brand.tagline"]', brand.tagline);
  setText('[data-bind="brand.slogan"]', brand.slogan);
  setText('[data-bind="contact.whatsapp"]', contact.whatsapp);
  setText('[data-bind="contact.phone"]', contact.phone);
  setText('[data-bind="contact.location"]', contact.location);
  setText('[data-bind="contact.reference"]', contact.reference);
  setText('[data-bind="contact.schedule"]', contact.schedule);

  const waLink = buildWhatsAppLink(contact.whatsapp);
  document.querySelectorAll('[data-bind-href="contact.whatsappLink"]').forEach(el => {
    el.setAttribute('href', waLink);
  });

  const igLinks = document.querySelectorAll('[data-bind-href="brand.instagram"]');
  igLinks.forEach(el => {
    if (brand.instagram) el.setAttribute('href', brand.instagram);
  });

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const mapIframe = document.getElementById('footer-map-iframe');
  if (mapIframe && contact.mapEmbedUrl) {
    mapIframe.src = contact.mapEmbedUrl;
    mapIframe.title = `Ubicación — ${brand.name || 'Maxi Studio'}`;
  }

  /* 6. Initialize App Modules */
  initNav(site.nav, site.brand, waLink);
  initServices(data, contact);
  initGallery(data, contact, brand);
  initFaqAccordion(data);
  initBooking(data, contact);
  initScrollAnimations();
})();
