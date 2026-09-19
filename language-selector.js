(function () {
  const selectorId = 'language-selector';

  function normalizePath(path) {
    return (path || '').split('/').pop();
  }

  function setupLanguageSelector() {
    const selector = document.getElementById(selectorId);
    if (!selector) return;

    const currentPage = normalizePath(window.location.pathname);
    let matchedOption = null;

    Array.from(selector.options).some((option) => {
      const optionValue = normalizePath(option.value);
      if (optionValue === currentPage) {
        matchedOption = option;
        return true;
      }

      const normalizedCurrent = currentPage.replace(/\.(html)$/i, '');
      const normalizedOption = optionValue.replace(/\.(html)$/i, '');
      if (normalizedOption === normalizedCurrent) {
        matchedOption = option;
        return true;
      }

      return false;
    });

    if (matchedOption) {
      selector.value = matchedOption.value;
    }

    selector.addEventListener('change', function () {
      const nextPage = this.value;
      if (nextPage) {
        window.location.href = nextPage;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLanguageSelector);
  } else {
    setupLanguageSelector();
  }
})();
