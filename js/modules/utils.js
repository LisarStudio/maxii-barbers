/**
 * utils.js — DOM & Data Utility Functions
 */

export function setText(selector, text) {
  if (!text) return;
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.textContent = text;
  });
}

export function setMeta(selector, content) {
  if (!content) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

export function buildWhatsAppLink(phone, message = '') {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message || 'Hola Maxi Studio, quiero consultar por una reserva.');
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export function formatPriceCLP(num) {
  if (typeof num === 'string' && num.startsWith('$')) return num;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(num);
}
