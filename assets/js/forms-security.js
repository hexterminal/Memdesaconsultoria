(function () {
  function isHoneypotFilled(form) {
    const honeypot = form.querySelector('input[name="website"], input[name="company"]');
    if (!honeypot) return false;
    return honeypot.value.trim() !== '';
  }

  function protectForm(form) {
    if (!form || form.dataset.securityEnhanced === 'true') return;

    const honeypot = document.createElement('input');
    honeypot.type = 'hidden';
    honeypot.name = 'website';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.value = '';
    honeypot.setAttribute('aria-hidden', 'true');
    form.appendChild(honeypot);

    form.addEventListener('submit', function (event) {
      if (isHoneypotFilled(form)) {
        event.preventDefault();
        return;
      }

      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(function (field) {
        if (!field.checkValidity()) {
          valid = false;
        }
      });

      if (!valid) {
        event.preventDefault();
      }
    }, true);

    form.dataset.securityEnhanced = 'true';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(protectForm);
  });
})();
