/* Mem de Sa Ratio Consilium - consentimento e carregamento condicional */
(function () {
  "use strict";

  const CONSENT_KEY = "memdesa_privacy_consent";
  const CONSENT_VERSION = "1.0";
  const VALID_STATUSES = ["accepted", "necessary"];

  const SERVICES = Object.freeze({
    tawkSource: "https://embed.tawk.to/6ab4612be84b8134496f236b/1k389n53l",
    clarityProjectId: "",
    googleMeasurementId: ""
  });

  function getSavedConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      try { localStorage.removeItem(CONSENT_KEY); } catch (_) {}
      return null;
    }
  }

  function isValidConsent(consent) {
    return Boolean(
      consent &&
      consent.version === CONSENT_VERSION &&
      VALID_STATUSES.includes(consent.status)
    );
  }

  function saveConsent(status) {
    const consent = {
      status: status,
      version: CONSENT_VERSION,
      date: new Date().toISOString()
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      return true;
    } catch (error) {
      console.warn("Nao foi possivel salvar a preferencia de privacidade.", error);
      return false;
    }
  }

  function loadTawkTo(source) {
    if (!source || document.getElementById("tawk-to-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-to-script";
    script.async = true;
    script.charset = "UTF-8";
    script.crossOrigin = "anonymous";
    script.src = source;
    document.head.appendChild(script);
  }

  function loadMicrosoftClarity(projectId) {
    if (!projectId || document.getElementById("microsoft-clarity-script")) return;

    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

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

  function loadOptionalServices() {
    loadTawkTo(SERVICES.tawkSource);
    loadMicrosoftClarity(SERVICES.clarityProjectId);
    loadGoogleAnalytics(SERVICES.googleMeasurementId);
  }

  function optionalServicesAreLoaded() {
    return Boolean(
      document.getElementById("tawk-to-script") ||
      document.getElementById("microsoft-clarity-script") ||
      document.getElementById("google-analytics-script")
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById("privacy-consent");
    const acceptButton = document.getElementById("privacy-accept");
    const necessaryButton = document.getElementById("privacy-necessary");
    const preferencesButton = document.getElementById("open-privacy-preferences");

    if (!banner || !acceptButton || !necessaryButton) return;

    let previouslyFocusedElement = null;

    function showBanner(moveFocus) {
      previouslyFocusedElement = document.activeElement;
      banner.hidden = false;
      document.body.classList.add("privacy-consent-open");
      if (moveFocus) {
        window.setTimeout(function () { necessaryButton.focus(); }, 50);
      }
    }

    function hideBanner(restoreFocus) {
      banner.hidden = true;
      document.body.classList.remove("privacy-consent-open");
      if (restoreFocus && previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
        previouslyFocusedElement.focus();
      }
    }

    const savedConsent = getSavedConsent();
    if (isValidConsent(savedConsent)) {
      if (savedConsent.status === "accepted") loadOptionalServices();
      hideBanner(false);
    } else {
      showBanner(false);
    }

    acceptButton.addEventListener("click", function () {
      saveConsent("accepted");
      hideBanner(true);
      loadOptionalServices();
    });

    necessaryButton.addEventListener("click", function () {
      saveConsent("necessary");
      hideBanner(true);

      if (optionalServicesAreLoaded()) {
        window.location.reload();
      }
    });

    if (preferencesButton) {
      preferencesButton.addEventListener("click", function () {
        showBanner(true);
      });
    }

    window.openPrivacyPreferences = function () {
      showBanner(true);
    };
  });

  window.resetPrivacyConsent = function () {
    try { localStorage.removeItem(CONSENT_KEY); } catch (_) {}
    window.location.reload();
  };
})();
