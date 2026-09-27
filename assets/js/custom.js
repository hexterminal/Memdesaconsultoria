/* Mem de Sa Ratio Consilium - interacoes globais */
(function ($) {
  'use strict';

  $(function () {
    var reducedMotion = Boolean(
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    var $window = $(window);
    var $header = $('header');
    var $headerText = $('.header-text').first();

    function hidePreloader() {
      var $preloader = $('#preloader');
      if (!$preloader.length) return;

      if (reducedMotion) {
        $preloader.css({ visibility: 'hidden', display: 'none' });
        return;
      }

      $preloader.stop(true).animate({ opacity: 0 }, 350, function () {
        $preloader.css('visibility', 'hidden').hide();
      });
    }

    window.setTimeout(hidePreloader, 150);
    window.addEventListener('load', hidePreloader, { once: true });

    if ($('#tabs').length && $.fn.tabs) {
      $('#tabs').tabs();
    }

    function updateHeader() {
      if (!$header.length || !$headerText.length) return;
      var threshold = Math.max(0, $headerText.outerHeight() - $header.outerHeight());
      $header.toggleClass('background-header', $window.scrollTop() >= threshold);
    }

    var scrollScheduled = false;
    $window.on('scroll', function () {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(function () {
        updateHeader();
        scrollScheduled = false;
      });
    });
    updateHeader();

    if ($('.owl-testimonials').length && $.fn.owlCarousel) {
      $('.owl-testimonials').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        margin: 30,
        autoplay: !reducedMotion,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        smartSpeed: reducedMotion ? 0 : 700,
        responsive: {
          0: { items: 1, margin: 0 },
          576: { items: 2, margin: 20 },
          992: { items: 2, margin: 30 }
        }
      });

      var $testimonialCarousel = $('.owl-testimonials');
      $testimonialCarousel.attr('aria-live', 'off');
      $testimonialCarousel.on('focusin', function () {
        $testimonialCarousel.trigger('stop.owl.autoplay');
      });
      $testimonialCarousel.on('focusout', function () {
        if (!reducedMotion) {
          $testimonialCarousel.trigger('play.owl.autoplay', [5000]);
        }
      });
    }

    if ($('.owl-partners').length && $.fn.owlCarousel) {
      $('.owl-partners').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        margin: 30,
        autoplay: false,
        smartSpeed: reducedMotion ? 0 : 700,
        responsive: {
          0: { items: 1, margin: 0 },
          576: { items: 2, margin: 20 },
          992: { items: 4, margin: 30 }
        }
      });
    }

    if ($('.Modern-Slider').length && $.fn.slick) {
      $('.Modern-Slider').slick({
        autoplay: !reducedMotion,
        autoplaySpeed: 10000,
        speed: reducedMotion ? 0 : 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        pauseOnHover: true,
        pauseOnFocus: true,
        dots: true,
        pauseOnDotsHover: true,
        cssEase: 'linear',
        draggable: true,
        swipe: true,
        accessibility: true,
        prevArrow: '<button class="PrevArrow" type="button" aria-label="Slide anterior"></button>',
        nextArrow: '<button class="NextArrow" type="button" aria-label="Proximo slide"></button>'
      });
    }

    var counterContainer = document.querySelector('.count-digit');
    if (counterContainer) {
      var loadCounters = function () {
        $('.count-digit').each(function () {
          var $counter = $(this);
          if ($counter.hasClass('counter-loaded')) return;

          var originalValue = $.trim($counter.text());
          var numericValue = Number(originalValue.replace(/[^0-9.,-]/g, '').replace(',', '.'));
          if (!Number.isFinite(numericValue)) return;

          $counter.addClass('counter-loaded');
          if (reducedMotion) {
            $counter.text(originalValue);
            return;
          }

          $({ value: 0 }).animate({ value: numericValue }, {
            duration: 1800,
            easing: 'swing',
            step: function () { $counter.text(Math.ceil(this.value)); },
            complete: function () { $counter.text(originalValue); }
          });
        });
      };

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          if (entries.some(function (entry) { return entry.isIntersecting; })) {
            loadCounters();
            observer.disconnect();
          }
        }, { threshold: 0.2 });
        observer.observe(counterContainer);
      } else {
        loadCounters();
      }
    }

    $(document).on('click', '#navbarResponsive .nav-link', function () {
      var navbar = document.getElementById('navbarResponsive');
      if (navbar) navbar.classList.remove('show');

      var toggle = document.querySelector('[data-target="#navbarResponsive"]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.add('collapsed');
      }
    });
  });
})(jQuery);
