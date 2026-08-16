/**
 * gallery.js — Portfolio gallery with category filtering & rich Lightbox modal
 */

export function initGallery(data = {}, contact = {}, brand = {}) {
  const filtersNav = document.getElementById('gallery-filters');
  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('.lightbox__img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxClose = lightbox?.querySelector('.lightbox__close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  const header = data.gallery_header || {};
  const allProjects = data.projects || [];
  const categories = header.categories || { all: 'Todos' };

  let activeCategory = 'all';
  let currentImageIndex = 0;
  let filteredProjects = [...allProjects];

  // 1. Render Filter Tabs
  if (filtersNav) {
    filtersNav.innerHTML = Object.entries(categories).map(([key, label]) => `
      <button type="button" class="gallery__filter-btn ${key === 'all' ? 'is-active' : ''}" data-category="${key}">
        ${label}
      </button>
    `).join('');

    filtersNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery__filter-btn');
      if (!btn) return;

      filtersNav.querySelectorAll('.gallery__filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      activeCategory = btn.getAttribute('data-category') || 'all';
      renderGrid();
    });
  }

  // 2. Render Gallery Grid
  const renderGrid = () => {
    if (!galleryGrid) return;

    if (activeCategory === 'all') {
      filteredProjects = [...allProjects];
    } else {
      filteredProjects = allProjects.filter(p => p.category === activeCategory);
    }

    galleryGrid.innerHTML = filteredProjects.map((p, idx) => `
      <li class="gallery-card reveal" data-index="${idx}" tabindex="0" role="button" aria-label="Ver ${p.title}">
        <img src="${p.image}" alt="${p.title} — ${brand.name || 'Maxi Studio'}" class="gallery-card__img" loading="lazy" />
        
        <div class="gallery-card__zoom-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>

        <div class="gallery-card__overlay">
          <div class="gallery-card__tag-list">
            ${(p.tags || []).map(t => `<span class="gallery-card__tag">${t}</span>`).join('')}
          </div>
          <h3 class="gallery-card__title">${p.title}</h3>
          <span class="gallery-card__service">${p.service || 'Corte de Autor'}</span>
        </div>
      </li>
    `).join('');

    // Trigger reveal for newly rendered items
    galleryGrid.querySelectorAll('.reveal').forEach(el => {
      setTimeout(() => el.classList.add('is-visible'), 50);
    });
  };

  renderGrid();

  // 3. Lightbox Logic
  const openLightbox = (index) => {
    if (!lightbox || !filteredProjects[index]) return;
    currentImageIndex = index;
    const project = filteredProjects[currentImageIndex];

    if (lightboxImg) {
      lightboxImg.src = project.image;
      lightboxImg.alt = project.title;
    }
    if (lightboxTitle) lightboxTitle.textContent = project.title;
    if (lightboxCategory) lightboxCategory.textContent = `${project.service} • ${categories[project.category] || project.category}`;

    lightbox.hidden = false;
    setTimeout(() => lightbox.classList.add('is-open'), 10);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    setTimeout(() => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }, 250);
  };

  const showNext = () => {
    if (!filteredProjects.length) return;
    currentImageIndex = (currentImageIndex + 1) % filteredProjects.length;
    openLightbox(currentImageIndex);
  };

  const showPrev = () => {
    if (!filteredProjects.length) return;
    currentImageIndex = (currentImageIndex - 1 + filteredProjects.length) % filteredProjects.length;
    openLightbox(currentImageIndex);
  };

  // Card Click listener
  galleryGrid?.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (!card) return;
    const index = parseInt(card.getAttribute('data-index'), 10);
    if (!isNaN(index)) openLightbox(index);
  });

  // Keyboard navigation on cards
  galleryGrid?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.gallery-card');
      if (!card) return;
      e.preventDefault();
      const index = parseInt(card.getAttribute('data-index'), 10);
      if (!isNaN(index)) openLightbox(index);
    }
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  // Close when clicking outside figure
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Global Keyboard listener for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.hidden || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}
