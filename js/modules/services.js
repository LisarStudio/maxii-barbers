/**
 * services.js — Services grid renderer & quick booking integration
 */

import { buildWhatsAppLink } from './utils.js';

export function initServices(data = {}, contact = {}) {
  const root = document.getElementById('services-root');
  if (!root) return;

  const header = data.services_header || {};
  const services = data.services || [];

  root.innerHTML = `
    <div class="container">
      <header class="section__header reveal">
        <p class="section__overline">${header.overline || 'TARIFAS & SERVICIOS'}</p>
        <h2 class="section__title">${header.title || 'Servicios de Inauguración'}</h2>
        <p class="section__lead">${header.lead || 'Elige tu servicio y agenda tu hora en pocos pasos.'}</p>
      </header>

      <div class="services__grid">
        ${services.map((s, index) => {
          const isFeatured = index === 1; // Corte + Diseño + Cejas
          const waUrl = buildWhatsAppLink(contact.whatsapp, s.waMessage);

          return `
            <article class="service-card ${isFeatured ? 'service-card--featured' : ''} reveal delay-${(index % 4) + 1}">
              ${s.badge ? `<span class="service-card__badge ${isFeatured ? 'service-card__badge--special' : ''}">${s.badge}</span>` : ''}
              
              <div>
                <div class="service-card__icon-wrap">
                  <img src="${s.icon}" alt="${s.title}" class="service-card__icon" loading="lazy" />
                </div>
                <h3 class="service-card__title">${s.title}</h3>
                
                <div class="service-card__pricing">
                  <span class="service-card__price">${s.price}</span>
                  ${s.originalPrice ? `<span class="service-card__original-price">${s.originalPrice}</span>` : ''}
                </div>

                ${s.duration ? `
                  <div class="service-card__duration">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${s.duration} aprox.</span>
                  </div>
                ` : ''}

                <p class="service-card__desc">${s.description}</p>
              </div>

              <div class="service-card__actions">
                <a href="#contacto" class="btn btn--primary btn--block select-service-btn" data-service-title="${s.title}">
                  ${s.cta || 'Reservar Hora'}
                </a>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm btn--block">
                  Consultar WhatsApp
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach click listener to pre-select service in booking widget
  root.querySelectorAll('.select-service-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = btn.getAttribute('data-service-title');
      const radio = document.querySelector(`input[name="servicio"][value="${title}"]`);
      if (radio) {
        radio.checked = true;
        // Trigger change event
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
}
