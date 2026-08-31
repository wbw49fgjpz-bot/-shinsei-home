'use strict';
const menu = document.querySelector('.navigation');
if (menu) {
  menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
  document.addEventListener('click', event => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
}
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Fail open: every section is readable without JavaScript or IntersectionObserver.
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let observer;
function configureMotion() {
  if (observer) observer.disconnect();
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.remove('in-view'));
  if (motion.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}
configureMotion();
if (motion.addEventListener) motion.addEventListener('change', configureMotion);
const progress = document.querySelector('.reading-progress');
const header = document.querySelector('.header');
let framePending = false;
function paintScroll() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
  if (header) header.classList.toggle('has-scrolled', window.scrollY > 20);
  framePending = false;
}
window.addEventListener('scroll', () => {
  if (!framePending) { framePending = true; window.requestAnimationFrame(paintScroll); }
}, { passive: true });
window.addEventListener('resize', paintScroll);
paintScroll();

// Static Pages has no booking backend. Generate an explicit draft, never a success state.
const form = document.querySelector('#viewing-form');
if (form) {
  const dateField = form.elements.date;
  const review = document.querySelector('#request-review');
  function localToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }
  dateField.min = localToday();
  function validateDate() {
    dateField.min = localToday();
    const date = dateField.value;
    const weekday = date ? new Date(`${date}T12:00:00`).getDay() : null;
    dateField.setCustomValidity(weekday === 2 || weekday === 3 ? '火曜日・水曜日は定休日です。別の日をご指定ください。' : '');
  }
  dateField.addEventListener('input', validateDate);
  dateField.addEventListener('change', validateDate);
  form.addEventListener('input', () => { review.hidden = true; document.querySelector('#request-mail').removeAttribute('href'); });
  form.addEventListener('submit', event => {
    event.preventDefault(); validateDate();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = [
      '心誠不動産 ご担当者様', '', '以下の内容で内見を相談したく、ご連絡します。', '',
      `お名前：${String(data.get('name')).trim()}`,
      `返信先：${String(data.get('email')).trim()}`,
      `物件情報：${String(data.get('property')).trim()}`,
      `希望日：${data.get('date')}`, `希望時間帯：${data.get('time')}`,
      `その他の希望：${String(data.get('notes') || 'なし').trim()}`, '',
      '販売状況・内見可能日時をご確認のうえ、ご返信をお願いいたします。',
      '予約は担当者との日程調整後に確定することを承知しています。'
    ].join('\n');
    document.querySelector('#request-preview').textContent = body;
    document.querySelector('#request-mail').href = 'mailto:0000ctcctc@gmail.com?subject=' + encodeURIComponent('内見予約のご相談') + '&body=' + encodeURIComponent(body);
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'center' });
  });
  document.querySelector("#viewing-submit").disabled = false;
}

// Remove retired display-mode parameters from previously shared links.
(()=>{const u=new URL(location.href);if(u.searchParams.has('audience')){u.searchParams.delete('audience');history.replaceState(null,'',u.pathname+u.search+u.hash)}try{sessionStorage.removeItem('shinsei-audience')}catch{}})();
