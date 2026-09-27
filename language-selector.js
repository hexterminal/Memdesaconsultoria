(function () {
  'use strict';

  const selectorId = 'language-selector';

  function normalizePath(path) {
    const fileName = (path || '').split('/').pop();
    return fileName || 'index.html';
  }

  function closeMobileMenu() {
    const navbar = document.getElementById('navbarResponsive');
    if (!navbar) return;

    navbar.classList.remove('show');

    const toggle = document.querySelector('[data-target="#navbarResponsive"]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.add('collapsed');
    }
  }

  function setupLanguageSelector() {
    const selector = document.getElementById(selectorId);
    if (!selector) return;

    const currentPage = normalizePath(window.location.pathname);
    const normalizedCurrent = currentPage.replace(/\.html$/i, '');

    const matchedOption = Array.from(selector.options).find(function (option) {
      const optionValue = normalizePath(option.value);
      return optionValue === currentPage || optionValue.replace(/\.html$/i, '') === normalizedCurrent;
    });

    if (matchedOption) {
      selector.value = matchedOption.value;
    }

    selector.addEventListener('change', function () {
      const nextPage = this.value;
      if (!nextPage) return;

      const targetUrl = new URL(nextPage, window.location.href);
      const isSameOrigin = targetUrl.origin === window.location.origin;
      const isHtmlPage = /(?:\/|\.html)$/i.test(targetUrl.pathname);

      if (!isSameOrigin || !isHtmlPage) return;

      closeMobileMenu();
      window.location.assign(targetUrl.href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLanguageSelector);
  } else {
    setupLanguageSelector();
  }
})();
