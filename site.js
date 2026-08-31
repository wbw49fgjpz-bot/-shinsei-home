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

// The visitor chooses the purpose; only this tab-session preference is remembered.
(()=>{
 const choices=[...document.querySelectorAll('[data-audience-choice]')];if(!choices.length)return;
 const params=new URLSearchParams(location.search);const explicit=params.get('audience');let saved=null;
 try{saved=sessionStorage.getItem('shinsei-audience')}catch{}
 let mode=['resident','owner'].includes(explicit)?explicit:(saved==='owner'?'owner':'resident');
 function apply(next){mode=next;document.body.classList.toggle('audience-owner',mode==='owner');
  choices.forEach(a=>{if(a.dataset.audienceChoice===mode)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  document.querySelectorAll('[data-resident-copy]').forEach(el=>{el.textContent=el.dataset[mode+'Copy']});
  document.querySelectorAll('[data-resident-href]').forEach(el=>{el.href=el.dataset[mode+'Href']});
  const status=document.querySelector('.audience-status');if(status)status.textContent=mode==='owner'?'運用・事業の検討に合わせた表示':'暮らしをイメージする表示';
  const text='心誠不動産 ご担当者様\n\n川越市小堤の土地について、販売状況と資料を教えてください。\n\n検討用途：'+(mode==='owner'?'投資・事業用（具体的な用途：）':'自宅用（希望する住まい：）')+'\nお名前：\n返信先：\nご質問：\n';
  document.querySelectorAll('.odutsumi-mail').forEach(a=>{a.href='mailto:0000ctcctc@gmail.com?subject='+encodeURIComponent('川越市小堤の土地についての問い合わせ')+'&body='+encodeURIComponent(text)});
  // Keep the explicit mode in internal navigation even if session storage is unavailable.
  document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(raw.startsWith('#'))return;const u=new URL(raw,location.href);if(u.origin!==location.origin||!u.pathname.endsWith('.html')||a.hasAttribute('data-audience-choice'))return;u.searchParams.set('audience',mode);a.href=u.pathname+u.search+u.hash});
  try{sessionStorage.setItem('shinsei-audience',mode)}catch{}
 }
 choices.forEach(a=>{const u=new URL(location.href);u.searchParams.set('audience',a.dataset.audienceChoice);a.href=u.pathname+u.search+u.hash;a.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const next=a.dataset.audienceChoice;apply(next);const url=new URL(location.href);url.searchParams.set('audience',next);history.replaceState(null,'',url.pathname+url.search+url.hash)})});apply(mode);
})();
