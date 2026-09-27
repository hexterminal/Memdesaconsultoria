/* Mem de Sa Ratio Consilium - navegacao das abas de servicos */
(function ($) {
  'use strict';

  $(function () {
    var $tabs = $('#tabs');
    if (!$tabs.length || !$.fn.tabs) return;

    var validHash = /^#tabs-[1-4]$/;
    var initialHash = validHash.test(window.location.hash) ? window.location.hash : '#tabs-1';
    var initialIndex = Number(initialHash.slice(-1)) - 1;

    $tabs.tabs({
      active: initialIndex,
      activate: function (_event, ui) {
        var id = ui.newPanel.attr('id');
        if (!id) return;
        history.replaceState(null, '', '#' + id);
        ui.newPanel.attr('tabindex', '-1');
      }
    });

    $(document).on('click', '.footer-item a[href^="#tabs-"]', function (event) {
      var hash = this.getAttribute('href');
      if (!validHash.test(hash)) return;
      event.preventDefault();
      var index = Number(hash.slice(-1)) - 1;
      $tabs.tabs('option', 'active', index);
      document.getElementById(hash.slice(1)).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    window.addEventListener('hashchange', function () {
      if (!validHash.test(window.location.hash)) return;
      $tabs.tabs('option', 'active', Number(window.location.hash.slice(-1)) - 1);
    });
  });
})(jQuery);
