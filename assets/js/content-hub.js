document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var header = document.querySelector("[data-content-header]");
  var hero = document.querySelector("[data-content-hero]");

  function updateHeader() {
    if (!header || !hero) return;
    header.classList.toggle(
      "is-scrolled",
      hero.getBoundingClientRect().bottom <= (header.offsetHeight || 80)
    );
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);

  var carouselControllers = {};

  function initializeCarousel(root) {
    var name = root.dataset.carousel;
    var track = root.querySelector('[data-carousel-track="' + name + '"]');
    var previous = root.querySelector('[data-carousel-prev="' + name + '"]');
    var next = root.querySelector('[data-carousel-next="' + name + '"]');
    var status = root.querySelector('[data-carousel-status="' + name + '"]');
    var updateFrame = 0;

    if (!track || !previous || !next || !status) return;

    function visibleItems() {
      return Array.prototype.slice.call(track.children).filter(function (item) {
        return !item.hidden && window.getComputedStyle(item).display !== "none";
      });
    }

    function itemStep() {
      var items = visibleItems();
      if (!items.length) return Math.max(1, track.clientWidth);
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return Math.max(1, items[0].getBoundingClientRect().width + gap);
    }

    function rowCount() {
      return Math.max(1, parseInt(root.dataset.carouselRows || "1", 10));
    }

    function columnsPerPage() {
      var step = itemStep();
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return Math.max(1, Math.round((track.clientWidth + gap) / step));
    }

    function itemsPerPage() {
      return columnsPerPage() * rowCount();
    }

    function metrics() {
      var totalItems = visibleItems().length;
      var perPage = itemsPerPage();
      var columns = columnsPerPage();
      var totalPages = totalItems ? Math.max(1, Math.ceil(totalItems / perPage)) : 0;
      var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      var atEnd = maxScroll > 0 && track.scrollLeft >= maxScroll - 4;
      var pageWidth = Math.max(1, columns * itemStep());
      var currentPage = totalPages
        ? (atEnd ? totalPages : Math.min(totalPages, Math.max(1, Math.round(track.scrollLeft / pageWidth) + 1)))
        : 0;
      return {
        totalItems: totalItems,
        perPage: perPage,
        columns: columns,
        totalPages: totalPages,
        currentPage: currentPage,
        maxScroll: maxScroll
      };
    }

    function updateNow() {
      var data = metrics();
      status.textContent = data.totalPages
        ? "Página " + data.currentPage + " de " + data.totalPages
        : "Sem itens";
      previous.disabled = data.currentPage <= 1;
      next.disabled = data.currentPage >= data.totalPages;
      status.setAttribute("data-current-page", String(data.currentPage));
      status.setAttribute("data-total-pages", String(data.totalPages));
    }

    function scheduleUpdate() {
      window.cancelAnimationFrame(updateFrame);
      updateFrame = window.requestAnimationFrame(updateNow);
    }

    function goToPage(page) {
      var data = metrics();
      if (!data.totalPages) return;
      var targetPage = Math.min(data.totalPages, Math.max(1, page));
      var target = targetPage === data.totalPages
        ? data.maxScroll
        : (targetPage - 1) * data.columns * itemStep();
      track.scrollTo({
        left: Math.min(target, data.maxScroll),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
      window.setTimeout(scheduleUpdate, 350);
    }

    previous.addEventListener("click", function () {
      goToPage(metrics().currentPage - 1);
    });

    next.addEventListener("click", function () {
      goToPage(metrics().currentPage + 1);
    });

    track.addEventListener("scroll", scheduleUpdate, { passive: true });
    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next.click();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous.click();
      } else if (event.key === "Home") {
        event.preventDefault();
        goToPage(1);
      } else if (event.key === "End") {
        event.preventDefault();
        goToPage(metrics().totalPages);
      }
    });

    function refresh(resetPosition) {
      if (resetPosition) track.scrollTo({ left: 0, behavior: "auto" });
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(updateNow);
      });
    }

    carouselControllers[name] = { refresh: refresh };
    window.addEventListener("resize", function () { refresh(false); });
    refresh(true);
  }

  document.querySelectorAll("[data-carousel]").forEach(initializeCarousel);

  var glossarySearch = document.getElementById("gloss-search");
  var glossaryCards = Array.prototype.slice.call(document.querySelectorAll("[data-gloss]"));

  if (glossarySearch) {
    glossarySearch.addEventListener("input", function () {
      var term = glossarySearch.value.toLowerCase().trim();
      glossaryCards.forEach(function (card) {
        card.hidden = Boolean(term) && card.dataset.gloss.indexOf(term) < 0;
      });
      if (carouselControllers.glossario) carouselControllers.glossario.refresh(true);
    });
  }

  var librarySearch = document.getElementById("library-search");
  var libraryCards = Array.prototype.slice.call(document.querySelectorAll("[data-library-card]"));
  var libraryFilters = Array.prototype.slice.call(document.querySelectorAll("[data-library-filter]"));
  var libraryEmpty = document.getElementById("library-empty");
  var libraryCategory = "Todos";

  var pendingLabel = {
    en: "Content in preparation",
    es: "Contenido en preparación",
    zh: "内容正在准备中",
    pt: "Conteúdo em preparação"
  };
  var pageLanguage = (document.documentElement.lang || "pt").toLowerCase();
  var pendingText = pageLanguage.indexOf("en") === 0
    ? pendingLabel.en
    : pageLanguage.indexOf("es") === 0
      ? pendingLabel.es
      : pageLanguage.indexOf("zh") === 0
        ? pendingLabel.zh
        : pendingLabel.pt;

  document.querySelectorAll('a.library-card-link[href=""], a.material-link[href=""]').forEach(function (link) {
    var status = document.createElement("span");
    status.className = link.className + " is-pending";
    status.setAttribute("aria-disabled", "true");
    status.textContent = pendingText;
    link.replaceWith(status);
  });

  function updateLibrary() {
    var term = librarySearch ? librarySearch.value.toLowerCase().trim() : "";
    var visible = 0;

    libraryCards.forEach(function (card) {
      var categoryMatch = libraryCategory === "Todos" || card.dataset.category === libraryCategory;
      var searchMatch = !term || card.dataset.librarySearch.indexOf(term) >= 0;
      card.hidden = !(categoryMatch && searchMatch);
      if (!card.hidden) visible += 1;
    });

    if (libraryEmpty) libraryEmpty.hidden = visible !== 0;
    if (carouselControllers.biblioteca) carouselControllers.biblioteca.refresh(true);
  }

  libraryFilters.forEach(function (button) {
    button.addEventListener("click", function () {
      libraryCategory = button.dataset.libraryFilter;
      libraryFilters.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      updateLibrary();
    });
  });

  if (librarySearch) librarySearch.addEventListener("input", updateLibrary);

  document.querySelectorAll(".faq-tab").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".faq-tab").forEach(function (item) {
        item.classList.remove("active");
      });
      document.querySelectorAll(".faq-panel").forEach(function (panel) {
        panel.classList.remove("active");
      });
      button.classList.add("active");
      var target = document.getElementById(button.dataset.target);
      if (target) target.classList.add("active");
    });
  });
});
