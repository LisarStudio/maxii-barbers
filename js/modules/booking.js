/**
 * booking.js — Multi-Step Interactive Reservation Engine
 * Flow: 1. Service -> 2. Barber -> 3. Date & Time -> 4. Client Details & Confirmation
 */

import { buildWhatsAppLink } from './utils.js';

export function initBooking(data = {}, contact = {}) {
  const widget = document.getElementById('booking-widget');
  const form = document.getElementById('booking-form');
  if (!widget || !form) return;

  const steps = widget.querySelectorAll('.booking-widget__step');
  const stepIndicators = widget.querySelectorAll('.booking-widget__step-indicator');
  const progressBar = document.getElementById('booking-progress-bar');
  const stepTitle = document.getElementById('booking-step-title');
  const btnPrev = document.getElementById('booking-btn-prev');
  const btnNext = document.getElementById('booking-btn-next');

  const servicesGrid = document.getElementById('booking-services-grid');
  const barberGrid = document.getElementById('booking-barber-grid');
  const timeGrid = document.getElementById('booking-time-grid');
  const timeInput = document.getElementById('booking-time-selected');
  const dateInput = document.getElementById('booking-date');
  const summaryBox = document.getElementById('booking-summary-box');

  const modal = document.getElementById('booking-success-modal');
  const modalClose = document.getElementById('booking-modal-close');
  const modalWaBtn = document.getElementById('booking-modal-wa-btn');
  const modalDetails = document.getElementById('booking-modal-details');

  let currentStep = 1;
  const TOTAL_STEPS = 4;

  const stepTitles = {
    1: '1. Selecciona tu Servicio de Inauguración',
    2: '2. Elige tu Barbero / Profesional',
    3: '3. Selecciona Fecha y Horario Disponible',
    4: '4. Tus Datos de Contacto y Confirmación'
  };

  // 1. Inyectar Servicios
  const services = data.services || [];
  if (servicesGrid && services.length) {
    servicesGrid.innerHTML = services.map((s, idx) => `
      <label class="booking-radio-card">
        <input type="radio" name="servicio" value="${s.title}" data-price="${s.price}" ${idx === 0 ? 'checked' : ''} />
        <div class="booking-radio-card__body">
          <div class="booking-radio-card__icon">${idx === 0 ? '✂️' : idx === 1 ? '⚡' : idx === 2 ? '🧔' : '👑'}</div>
          <div class="booking-radio-card__info">
            <div class="booking-radio-card__title-row">
              <span class="booking-radio-card__title">${s.title}</span>
              <span class="booking-radio-card__price">${s.price}</span>
            </div>
            <span class="booking-radio-card__desc">${s.description}</span>
          </div>
        </div>
      </label>
    `).join('');
  }

  // 2. Inyectar Barberos
  const barbers = data.barbers || [];
  if (barberGrid && barbers.length) {
    barberGrid.innerHTML = barbers.map((b, idx) => `
      <label class="booking-radio-card">
        <input type="radio" name="barbero" value="${b.name}" ${idx === 0 ? 'checked' : ''} />
        <div class="booking-radio-card__body">
          <div class="booking-radio-card__icon">${b.avatar || '✂️'}</div>
          <div class="booking-radio-card__info">
            <span class="booking-radio-card__title">${b.name}</span>
            <span class="booking-radio-card__desc">${b.specialty}</span>
          </div>
        </div>
      </label>
    `).join('');
  }

  // 3. Generar Horarios Disponibles
  const defaultTimes = [
    '10:00', '11:00', '12:00', '13:00', '14:30',
    '15:30', '16:30', '17:30', '18:30', '19:30'
  ];

  const updateTimeSlots = () => {
    if (!timeGrid) return;
    timeGrid.innerHTML = defaultTimes.map(time => `
      <button type="button" class="booking-time-btn ${timeInput.value === time ? 'is-selected' : ''}" data-time="${time}">
        ${time} hrs
      </button>
    `).join('');
  };

  timeGrid?.addEventListener('click', (e) => {
    const btn = e.target.closest('.booking-time-btn');
    if (!btn) return;

    timeGrid.querySelectorAll('.booking-time-btn').forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    timeInput.value = btn.getAttribute('data-time') || '';
    hideError();
  });

  // Configurar fecha mínima a hoy
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (!dateInput.value) dateInput.value = today;
    dateInput.addEventListener('change', updateTimeSlots);
  }

  updateTimeSlots();

  // 4. Actualizar Vista del Paso
  const updateStepView = () => {
    steps.forEach(step => {
      const num = parseInt(step.getAttribute('data-step') || '1', 10);
      if (num === currentStep) {
        step.classList.remove('booking-widget__step--hidden');
      } else {
        step.classList.add('booking-widget__step--hidden');
      }
    });

    const progressPercent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    if (progressBar) progressBar.style.width = `${Math.max(12, progressPercent)}%`;

    stepIndicators.forEach(indicator => {
      const num = parseInt(indicator.getAttribute('data-step-indicator') || '1', 10);
      if (num <= currentStep) {
        indicator.classList.add('booking-widget__step-indicator--active');
      } else {
        indicator.classList.remove('booking-widget__step-indicator--active');
      }
    });

    if (stepTitle) stepTitle.textContent = stepTitles[currentStep];

    if (btnPrev) btnPrev.disabled = currentStep === 1;
    if (btnNext) {
      if (currentStep === TOTAL_STEPS) {
        btnNext.textContent = 'Confirmar Reserva por WhatsApp';
        btnNext.classList.add('btn--whatsapp');
      } else {
        btnNext.textContent = 'Siguiente';
        btnNext.classList.remove('btn--whatsapp');
      }
    }

    if (currentStep === 4) {
      updateSummary();
    }
  };

  const updateSummary = () => {
    if (!summaryBox) return;
    const selectedSvc = form.querySelector('input[name="servicio"]:checked');
    const selectedBarber = form.querySelector('input[name="barbero"]:checked');
    const date = dateInput.value;
    const time = timeInput.value;

    const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long'
    }) : 'No seleccionada';

    summaryBox.innerHTML = `
      <div class="booking-summary-row">
        <span>Servicio:</span>
        <strong>${selectedSvc?.value || 'Corte'} (${selectedSvc?.dataset.price || '$8.000'})</strong>
      </div>
      <div class="booking-summary-row">
        <span>Profesional:</span>
        <strong>${selectedBarber?.value || 'Maxi'}</strong>
      </div>
      <div class="booking-summary-row">
        <span>Fecha & Hora:</span>
        <strong>${formattedDate} a las ${time || '10:00'} hrs</strong>
      </div>
      <div class="booking-summary-row">
        <span>Ubicación:</span>
        <strong>Frente al Metro Carlos Valdovinos</strong>
      </div>
    `;
  };

  // 5. Validaciones de Paso
  const showError = (msg) => {
    let errEl = document.getElementById('booking-error-msg');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = 'booking-error-msg';
      errEl.className = 'booking-error-msg is-visible';
      widget.querySelector('.booking-widget__actions')?.before(errEl);
    }
    errEl.textContent = msg;
    errEl.classList.add('is-visible');
  };

  const hideError = () => {
    const errEl = document.getElementById('booking-error-msg');
    if (errEl) errEl.classList.remove('is-visible');
  };

  const validateCurrentStep = () => {
    hideError();

    if (currentStep === 1) {
      const svc = form.querySelector('input[name="servicio"]:checked');
      if (!svc) {
        showError('Por favor, selecciona un servicio.');
        return false;
      }
    } else if (currentStep === 2) {
      const barber = form.querySelector('input[name="barbero"]:checked');
      if (!barber) {
        showError('Por favor, selecciona un profesional.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!dateInput.value) {
        showError('Por favor, selecciona una fecha válida.');
        return false;
      }
      if (!timeInput.value) {
        showError('Por favor, selecciona una hora de atención.');
        return false;
      }
    } else if (currentStep === 4) {
      const name = document.getElementById('booking-name');
      const phone = document.getElementById('booking-phone');
      const email = document.getElementById('booking-email');

      name?.classList.remove('is-invalid');
      phone?.classList.remove('is-invalid');
      email?.classList.remove('is-invalid');

      if (!name?.value.trim()) {
        name?.classList.add('is-invalid');
        showError('Por favor, ingresa tu nombre completo.');
        return false;
      }
      if (!phone?.value.trim()) {
        phone?.classList.add('is-invalid');
        showError('Por favor, ingresa tu WhatsApp o teléfono.');
        return false;
      }
      if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email?.classList.add('is-invalid');
        showError('Por favor, ingresa un correo electrónico válido.');
        return false;
      }
    }

    return true;
  };

  // 6. Event Listeners para Navegación
  btnNext?.addEventListener('click', () => {
    if (!validateCurrentStep()) return;

    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStepView();
      widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Enviar Formulario y abrir WhatsApp
      handleFormSubmit();
    }
  });

  btnPrev?.addEventListener('click', () => {
    if (currentStep > 1) {
      hideError();
      currentStep--;
      updateStepView();
      widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // 7. Enviar y Generar WhatsApp prellenado
  const handleFormSubmit = () => {
    const selectedSvc = form.querySelector('input[name="servicio"]:checked')?.value || 'Corte';
    const selectedBarber = form.querySelector('input[name="barbero"]:checked')?.value || 'Maxi';
    const date = dateInput.value;
    const time = timeInput.value || '11:00';
    const name = document.getElementById('booking-name')?.value.trim() || '';
    const phone = document.getElementById('booking-phone')?.value.trim() || '';
    const email = document.getElementById('booking-email')?.value.trim() || '';
    const notes = document.getElementById('booking-notes')?.value.trim() || '';

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long'
    });

    const waMessage = `¡Hola Maxi Studio! Quiero confirmar mi reserva:\n\n` +
      `📌 *Servicio:* ${selectedSvc}\n` +
      `💈 *Barbero:* ${selectedBarber}\n` +
      `📅 *Fecha:* ${formattedDate}\n` +
      `⏰ *Hora:* ${time} hrs\n` +
      `👤 *Nombre:* ${name}\n` +
      `📱 *WhatsApp:* ${phone}\n` +
      `📧 *Email:* ${email}\n` +
      (notes ? `📝 *Notas:* ${notes}\n` : '') +
      `\n📍 *Ubicación:* Frente al Metro Carlos Valdovinos`;

    const waUrl = buildWhatsAppLink(contact.whatsapp, waMessage);

    // Guardar en localStorage para persistencia
    try {
      const history = JSON.parse(localStorage.getItem('maxii_bookings') || '[]');
      history.push({ selectedSvc, selectedBarber, date, time, name, phone, email, notes, createdAt: new Date().toISOString() });
      localStorage.setItem('maxii_bookings', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Mostrar modal
    if (modalDetails) {
      modalDetails.innerHTML = `
        <p><strong>Servicio:</strong> ${selectedSvc}</p>
        <p><strong>Fecha y Hora:</strong> ${formattedDate} - ${time} hrs</p>
        <p><strong>Cliente:</strong> ${name} (${phone})</p>
      `;
    }

    if (modalWaBtn) {
      modalWaBtn.href = waUrl;
      modalWaBtn.onclick = () => {
        if (modal) modal.classList.remove('is-active');
      };
    }

    if (modal) {
      modal.classList.add('is-active');
    }

    // Abre automáticamente la pestaña de WhatsApp tras breve delay para la mejor UX
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 400);
  };

  modalClose?.addEventListener('click', () => {
    modal?.classList.remove('is-active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('is-active');
  });

  updateStepView();
}
