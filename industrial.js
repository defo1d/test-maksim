const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reveal = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    reveal.unobserve(target);
    if (reducedMotion.matches) continue;
    target.animate([
      { opacity: 0.35, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
});
for (const element of document.querySelectorAll('.roof-about h2, .about-description, .featured-products, .section-heading, .service-library > *, .center-heading, .product-card, .faq-list, .roof-cta>div, .footer-top')) {
  reveal.observe(element);
}

const strip = document.querySelector('.industry-strip');
const group = strip.querySelector('.strip-group');
const repeat = group.cloneNode(true);
repeat.setAttribute('aria-hidden', 'true');
for (const link of repeat.querySelectorAll('a')) link.tabIndex = -1;
group.after(repeat);
strip.classList.add('is-animated');

const header = document.querySelector('.industry-header');
const navigation = header.querySelector('.industry-navigation');
const menuToggle = header.querySelector('.nav-toggle');
const sectionToggles = [...header.querySelectorAll('.nav-section-toggle')];
const mobileMenu = matchMedia('(max-width: 900px)');
const pageContent = document.querySelectorAll('.roof-page > main, .roof-page > footer');

function updateHeader() {
  const threshold = document.querySelector('.roof-hero').getBoundingClientRect().bottom;
  header.classList.toggle('is-scrolled', threshold < 84);
}
let openToggle = null;
let openedByHover = false;

function showSection(toggle = null, byHover = false) {
  for (const item of sectionToggles) {
    const expanded = item === toggle;
    item.setAttribute('aria-expanded', String(expanded));
    document.getElementById(item.getAttribute('aria-controls')).inert = !expanded;
  }
  openToggle = toggle;
  openedByHover = byHover;
}
function setMenu(open) {
  showSection();
  header.classList.toggle('menu-open', open);
  navigation.inert = mobileMenu.matches && !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('span').textContent = open ? 'Закрыть' : 'Меню';
  for (const element of pageContent) element.inert = open;
}
menuToggle.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
for (const toggle of sectionToggles) {
  const group = toggle.closest('.nav-group');
  group.addEventListener('pointerenter', event => {
    if (!mobileMenu.matches && event.pointerType === 'mouse' && !group.contains(document.activeElement)) {
      showSection(toggle, true);
    }
  });
  group.addEventListener('pointerleave', () => {
    if (openToggle === toggle && openedByHover && !group.contains(document.activeElement)) showSection();
  });
  toggle.addEventListener('click', () => {
    showSection(toggle !== openToggle || openedByHover ? toggle : null);
  });
  group.addEventListener('focusout', event => {
    if (!mobileMenu.matches && openToggle === toggle && !group.contains(event.relatedTarget)) showSection();
  });
}
document.addEventListener('click', event => {
  if (!header.contains(event.target) || event.target.closest('.industry-header a, .industry-header [data-inquiry]')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
  if (openToggle) {
    openToggle.focus();
    showSection();
  } else if (header.classList.contains('menu-open')) {
    setMenu(false);
    menuToggle.focus();
  }
});
mobileMenu.addEventListener('change', () => setMenu(false));
setMenu(false);
const glassPanel = document.querySelector('.complex-panel');
let scrollFrame = 0;
function updateScrollEffects() {
  scrollFrame = 0;
  updateHeader();
  if (!glassPanel || reducedMotion.matches) return;
  const {top, bottom, height} = glassPanel.getBoundingClientRect();
  if (bottom <= 0 || top >= innerHeight) return;
  const progress = (innerHeight - top) / (innerHeight + height);
  glassPanel.style.setProperty('--glass-shift', ((progress - .5) * 96).toFixed(2) + '%');
}
function scheduleScrollEffects() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}
window.addEventListener('scroll', scheduleScrollEffects, {passive: true});
window.addEventListener('resize', scheduleScrollEffects);
reducedMotion.addEventListener('change', scheduleScrollEffects);
updateScrollEffects();
if (!reducedMotion.matches) {
  for (const piece of header.querySelectorAll('.industry-brand [data-x]')) {
    piece.animate([
      {transform: `translate(${piece.dataset.x}px, ${piece.dataset.y}px)`, opacity: 0},
      {transform: 'translate(0, 0)', opacity: 1}
    ], {duration: 900, delay: Number(piece.dataset.delay), easing: 'cubic-bezier(.8,0,.2,1)', fill: 'backwards'});
  }
}

const requestForm = document.getElementById('project-request');
const requestDialog = requestForm.closest('dialog');
const requestHeading = requestDialog.querySelector('.request-heading');
const requestSuccess = requestDialog.querySelector('.request-success');
const requestError = requestForm.querySelector('.request-error');
const requestSubmit = requestForm.querySelector('.request-submit');
let previousPayload = '';
let requestId = '';

function openRequest(service, email) {
  if (!requestSubmit.disabled) {
    requestForm.elements.service.value = service;
    if (email) requestForm.elements.email.value = email;
    requestError.textContent = '';
    requestForm.hidden = false;
    requestHeading.hidden = false;
    requestSuccess.hidden = true;
    requestDialog.setAttribute('aria-labelledby', 'request-title');
  }
  requestDialog.showModal();
  requestDialog.scrollTop = 0;
}
for (const trigger of document.querySelectorAll('[data-inquiry]')) {
  trigger.addEventListener('click', () => openRequest(trigger.dataset.inquiry));
}
document.querySelector('.email-start').addEventListener('submit', event => {
  event.preventDefault();
  openRequest('', event.currentTarget.elements.email.value);
});
requestDialog.querySelector('.request-done').addEventListener('click', () => requestDialog.close());
requestForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (requestSubmit.disabled) return;
  const data = Object.fromEntries(new FormData(requestForm));
  const payload = JSON.stringify(data);
  if (payload !== previousPayload) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    requestId = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    previousPayload = payload;
  }
  requestError.textContent = '';
  requestSubmit.disabled = true;
  requestSubmit.firstElementChild.textContent = 'Отправляем…';
  try {
    const response = await fetch(requestForm.action, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...data, id: requestId}), signal: AbortSignal.timeout(15000)
    });
    if (response.status === 422) {
      requestError.textContent = 'Проверьте имя, электронную почту и описание задачи.';
      return;
    }
    if (!response.ok || (await response.json()).saved !== true) throw new Error('save');
    requestForm.reset();
    previousPayload = '';
    requestHeading.hidden = true;
    requestForm.hidden = true;
    requestSuccess.hidden = false;
    const title = requestSuccess.querySelector('h2');
    requestDialog.setAttribute('aria-labelledby', title.id);
    if (requestDialog.open) title.focus();
  } catch {
    requestError.textContent = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
  } finally {
    requestSubmit.disabled = false;
    requestSubmit.firstElementChild.textContent = 'Оставить заявку';
  }
});
