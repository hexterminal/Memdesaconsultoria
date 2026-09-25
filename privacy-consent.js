/* Mem de Sa Ratio Consilium - consentimento e carregamento condicional */
(function () {
  "use strict";

  const CONSENT_KEY = "memdesa_privacy_consent";
  const CONSENT_VERSION = "1.0";

  /* Servicos opcionais. O tawk.to ja esta configurado com o ID real do site. */
  const SERVICES = {
    tawkSource: "https://embed.tawk.to/6ab4612be84b8134496f236b/1k389n53l",
    clarityProjectId: "",       // Preencha futuramente, por exemplo: "abc123xyz"
    googleMeasurementId: ""    // Preencha futuramente, por exemplo: "G-XXXXXXXXXX"
  };

  document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById("privacy-consent");
    const acceptButton = document.getElementById("privacy-accept");
    const necessaryButton = document.getElementById("privacy-necessary");
    const preferencesButton = document.getElementById("open-privacy-preferences");

    if (!banner || !acceptButton || !necessaryButton) return;

    const savedConsent = getSavedConsent();
    if (isValidConsent(savedConsent)) {
      if (savedConsent.status === "accepted") loadOptionalServices();
      hideBanner();
    } else {
      showBanner(false);
    }

    acceptButton.addEventListener("click", function () {
      saveConsent("accepted");
      hideBanner();
      loadOptionalServices();
    });

    necessaryButton.addEventListener("click", function () {
      saveConsent("necessary");
      hideBanner();
      disableOptionalServices();
    });

    if (preferencesButton) {
      preferencesButton.addEventListener("click", function () {
        showBanner(true);
      });
    }

    function getSavedConsent() {
      try {
        const raw = localStorage.getItem(CONSENT_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
    }

    function isValidConsent(consent) {
      return Boolean(consent && consent.version === CONSENT_VERSION && ["accepted", "necessary"].includes(consent.status));
    }

    function saveConsent(status) {
      const consent = { status: status, version: CONSENT_VERSION, date: new Date().toISOString() };
      try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); }
      catch (error) { console.warn("Nao foi possivel salvar a preferencia de privacidade.", error); }
    }

    function showBanner(moveFocus) {
      banner.hidden = false;
      if (moveFocus) window.setTimeout(function () { necessaryButton.focus(); }, 100);
    }

    function hideBanner() { banner.hidden = true; }

    function loadOptionalServices() {
      loadTawkTo(SERVICES.tawkSource);
      loadMicrosoftClarity(SERVICES.clarityProjectId);
      loadGoogleAnalytics(SERVICES.googleMeasurementId);
    }

    function disableOptionalServices() {
      /* Scripts ainda nao carregados permanecem bloqueados. Se o visitante mudar
         de "aceitar" para "somente necessarios", recarregamos a pagina para
         encerrar os servicos carregados na sessao atual. */
      if (document.getElementById("tawk-to-script") || document.getElementById("microsoft-clarity-script") || document.getElementById("google-analytics-script")) {
        window.location.reload();
      }
    }
  });

  function loadTawkTo(source) {
    if (!source || document.getElementById("tawk-to-script")) return;
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    const script = document.createElement("script");
    script.id = "tawk-to-script";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    script.src = source;
    document.head.appendChild(script);
  }

  function loadMicrosoftClarity(projectId) {
    if (!projectId || document.getElementById("microsoft-clarity-script")) return;
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    const script = document.createElement("script");
    script.id = "microsoft-clarity-script";
    script.async = true;
    script.src = "https://www.clarity.ms/tag/" + encodeURIComponent(projectId);
    document.head.appendChild(script);
  }

  function loadGoogleAnalytics(measurementId) {
    if (!measurementId || document.getElementById("google-analytics-script")) return;
    const script = document.createElement("script");
    script.id = "google-analytics-script";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });
  }

  /* Funcoes uteis para teste no console do navegador. */
  window.openPrivacyPreferences = function () {
    const banner = document.getElementById("privacy-consent");
    const necessaryButton = document.getElementById("privacy-necessary");
    if (banner) banner.hidden = false;
    if (necessaryButton) necessaryButton.focus();
  };

  window.resetPrivacyConsent = function () {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };
})();
