/**
 * faq.js — FAQ accordion renderer and handler
 */

export function initFaqAccordion(data = {}) {
  const grid = document.getElementById('faq-grid');
  if (!grid) return;

  const faqs = data.faq || [];

  grid.innerHTML = faqs.map((item, index) => `
    <details class="faq-item reveal delay-${(index % 4) + 1}" ${index === 0 ? 'open' : ''}>
      <summary class="faq-item__summary">
        <span>${item.question}</span>
        <svg class="faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div class="faq-item__content">
        <p>${item.answer}</p>
      </div>
    </details>
  `).join('');

  // Accordion behavior: close other items when one is opened
  const items = grid.querySelectorAll('.faq-item');
  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => {
          if (other !== item && other.open) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });
}
