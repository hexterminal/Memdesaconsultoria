(function () {
  'use strict';
  const copy = {
    pt: ['pt-BR', 'Política de Privacidade', 'Como tratamos dados pessoais, cookies, chat, inteligência artificial e métricas de navegação.'],
    en: ['en', 'Privacy Policy', 'How we process personal data, cookies, live chat, artificial intelligence and usage metrics.'],
    es: ['es', 'Política de Privacidad', 'Cómo tratamos datos personales, cookies, chat, inteligencia artificial y métricas de navegación.'],
    zh: ['zh-CN', '隐私政策', '我们如何处理个人数据、Cookie、在线聊天、人工智能和网站使用指标。']
  };
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.policy'));
  function show(key, updateHistory) {
    if (!copy[key]) key = 'pt';
    panels.forEach(panel => { panel.hidden = panel.id !== 'policy-' + key; });
    tabs.forEach(tab => {
      const selected = tab.dataset.lang === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.documentElement.lang = copy[key][0];
    document.getElementById('main-title').textContent = copy[key][1];
    document.getElementById('main-subtitle').textContent = copy[key][2];
    document.title = copy[key][1] + ' | Mem de Sá Ratio Consilium';
    try { localStorage.setItem('privacy_language', key); } catch (_) {}
    if (updateHistory !== false) history.replaceState(null, '', '#' + key);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => show(tab.dataset.lang));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      show(tabs[next].dataset.lang);
    });
  });
  let key = location.hash.slice(1).toLowerCase();
  if (!copy[key]) { try { key = localStorage.getItem('privacy_language'); } catch (_) {} }
  if (!copy[key]) {
    const lang = (navigator.language || 'pt').toLowerCase();
    key = lang.startsWith('en') ? 'en' : lang.startsWith('es') ? 'es' : lang.startsWith('zh') ? 'zh' : 'pt';
  }
  show(key, false);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
