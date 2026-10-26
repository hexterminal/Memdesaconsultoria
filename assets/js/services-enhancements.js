(function () {
  'use strict';

  var INTERVAL = 5000;

  function init() {
    var viewport = document.querySelector('[data-services-viewport]');
    if (!viewport) return;

    var prev = document.querySelector('[data-services-prev]');
    var next = document.querySelector('[data-services-next]');
    var toggle = document.querySelector('[data-services-autoplay]');
    var filters = [].slice.call(document.querySelectorAll('[data-service-filter]'));
    var cards = [].slice.call(viewport.querySelectorAll('.service-summary-card'));
    var status = document.querySelector('[data-services-status]');
    var progress = document.querySelector('[data-services-progress]');
    var timer = null;
    var paused = false;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function visible() {
      return cards.filter(function (card) {
        return !card.hidden;
      });
    }

    function step() {
      var card = visible()[0];
      var track = viewport.querySelector('.services-showcase__track');
      if (!card || !track) return viewport.clientWidth;

      var styles = getComputedStyle(track);
      return card.getBoundingClientRect().width + (parseFloat(styles.gap || styles.columnGap) || 0);
    }

    function max() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function update() {
      var limit = max();
      if (prev) prev.disabled = viewport.scrollLeft <= 2;
      if (next) next.disabled = viewport.scrollLeft >= limit - 2;

      var percentage = limit
        ? Math.min(100, (viewport.scrollLeft / limit) * 100)
        : 100;
      if (progress) progress.style.width = percentage + '%';
    }

    function forward() {
      var limit = max();
      var target = viewport.scrollLeft >= limit - 2
        ? 0
        : Math.min(viewport.scrollLeft + step(), limit);

      viewport.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (!paused && !reduced && !document.hidden) {
        timer = setInterval(forward, INTERVAL);
      }
    }

    function setPaused(value) {
      paused = value;
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.innerHTML = paused
          ? '<i class="fa fa-play" aria-hidden="true"></i><span>Continuar rotação</span>'
          : '<i class="fa fa-pause" aria-hidden="true"></i><span>Pausar rotação</span>';
      }
      restart();
    }

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.dataset.serviceFilter;
        filters.forEach(function (item) {
          var active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        cards.forEach(function (card) {
          card.hidden = filter !== 'all' && card.dataset.serviceLevel !== filter;
        });
        viewport.scrollTo({ left: 0, behavior: 'auto' });
        if (status) {
          status.textContent = filter === 'all'
            ? 'Exibindo todos os 18 serviços'
            : 'Exibindo 6 serviços do Nível ' + filter;
        }
        update();
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        viewport.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' });
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        forward();
        restart();
      });
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        setPaused(!paused);
      });
    }

    viewport.addEventListener('scroll', update, { passive: true });
    viewport.addEventListener('mouseenter', function () {
      if (timer) clearInterval(timer);
    });
    viewport.addEventListener('mouseleave', restart);
    viewport.addEventListener('focusin', function () {
      if (timer) clearInterval(timer);
    });
    viewport.addEventListener('focusout', restart);
    document.addEventListener('visibilitychange', restart);
    window.addEventListener('resize', update);
    update();
    restart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
