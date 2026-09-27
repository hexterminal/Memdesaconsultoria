/* Mem de Sa Ratio Consilium - protecao progressiva dos formularios */
(function () {
  'use strict';

  var limits = {
    name: 120,
    email: 254,
    message: 3000
  };

  var messages = {
    pt: {
      longMessage: 'A mensagem deve ter no maximo 3.000 caracteres.',
      sending: 'Enviando...',
      sensitive: 'Nao envie senhas, dados bancarios, documentos financeiros confidenciais ou dados pessoais sensiveis.'
    },
    en: {
      longMessage: 'The message must be no longer than 3,000 characters.',
      sending: 'Sending...',
      sensitive: 'Do not submit passwords, banking information, confidential financial documents, or sensitive personal data.'
    },
    es: {
      longMessage: 'El mensaje debe tener como maximo 3.000 caracteres.',
      sending: 'Enviando...',
      sensitive: 'No envie contrasenas, datos bancarios, documentos financieros confidenciales ni datos personales sensibles.'
    },
    zh: {
      longMessage: '留言不得超过 3,000 个字符。',
      sending: '正在发送...',
      sensitive: '请勿提交密码、银行信息、机密财务文件或敏感个人数据。'
    }
  };

  function getMessages() {
    var lang = (document.documentElement.lang || 'pt-BR').toLowerCase();
    if (lang.indexOf('en') === 0) return messages.en;
    if (lang.indexOf('es') === 0) return messages.es;
    if (lang.indexOf('zh') === 0) return messages.zh;
    return messages.pt;
  }

  function isHoneypotFilled(form) {
    var honeypot = form.querySelector('input[name="website"]');
    return Boolean(honeypot && honeypot.value.trim());
  }

  function createHoneypot(form) {
    if (form.querySelector('input[name="website"]')) return;

    var wrapper = document.createElement('div');
    wrapper.hidden = true;
    wrapper.setAttribute('aria-hidden', 'true');

    var label = document.createElement('label');
    label.textContent = 'Website';

    var input = document.createElement('input');
    input.type = 'text';
    input.name = 'website';
    input.tabIndex = -1;
    input.autocomplete = 'off';

    label.appendChild(input);
    wrapper.appendChild(label);
    form.appendChild(wrapper);
  }

  function applyLimits(form) {
    var name = form.querySelector('input[name="name"]');
    var email = form.querySelector('input[type="email"], input[name="email"]');
    var message = form.querySelector('textarea[name="message"], textarea');

    if (name && !name.maxLength) name.maxLength = limits.name;
    if (email) {
      email.maxLength = limits.email;
      email.removeAttribute('pattern');
      email.autocomplete = 'email';
    }
    if (message) message.maxLength = limits.message;
  }

  function protectForm(form) {
    if (!form || form.dataset.securityEnhanced === 'true') return;

    var text = getMessages();
    createHoneypot(form);
    applyLimits(form);

    form.addEventListener('submit', function (event) {
      if (isHoneypotFilled(form)) {
        event.preventDefault();
        return;
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      var message = form.querySelector('textarea[name="message"], textarea');
      if (message && message.value.length > limits.message) {
        event.preventDefault();
        message.setCustomValidity(text.longMessage);
        message.reportValidity();
        message.addEventListener('input', function clearError() {
          message.setCustomValidity('');
          message.removeEventListener('input', clearError);
        });
        return;
      }

      var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton && submitButton.disabled) {
        event.preventDefault();
        return;
      }

      if (submitButton) {
        submitButton.dataset.originalText = submitButton.tagName === 'INPUT'
          ? submitButton.value
          : submitButton.textContent;
        submitButton.disabled = true;
        submitButton.setAttribute('aria-disabled', 'true');
        if (submitButton.tagName === 'INPUT') submitButton.value = text.sending;
        else submitButton.textContent = text.sending;

        window.setTimeout(function () {
          if (!document.hidden) {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-disabled');
            if (submitButton.tagName === 'INPUT') submitButton.value = submitButton.dataset.originalText;
            else submitButton.textContent = submitButton.dataset.originalText;
          }
        }, 12000);
      }
    }, true);

    form.dataset.securityEnhanced = 'true';
  }

  function initialize() {
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(protectForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
