/* Mem de Sa Ratio Consilium - indicadores economicos */
(function () {
  'use strict';

  var chartState = {};
  var resizeTimer = null;
  var REQUEST_TIMEOUT = 12000;

  var translations = {
    pt: {
      period: 'Periodo',
      value: 'Valor',
      source: 'Banco Central do Brasil',
      updated: 'Atualizado em',
      unavailable: 'Dados indisponiveis',
      loading: 'Carregando...',
      percent: function (value) { return formatNumber(value, 'pt-BR') + '% a.a.'; },
      currency: function (value) { return 'R$ ' + formatNumber(value, 'pt-BR'); }
    },
    en: {
      period: 'Period',
      value: 'Value',
      source: 'Central Bank of Brazil',
      updated: 'Updated on',
      unavailable: 'Data unavailable',
      loading: 'Loading...',
      percent: function (value) { return formatNumber(value, 'en-US') + '% p.a.'; },
      currency: function (value) { return 'BRL ' + formatNumber(value, 'en-US'); }
    },
    es: {
      period: 'Periodo',
      value: 'Valor',
      source: 'Banco Central de Brasil',
      updated: 'Actualizado el',
      unavailable: 'Datos no disponibles',
      loading: 'Cargando...',
      percent: function (value) { return formatNumber(value, 'es-ES') + '% a.a.'; },
      currency: function (value) { return 'BRL ' + formatNumber(value, 'es-ES'); }
    },
    zh: {
      period: '期间',
      value: '数值',
      source: '巴西中央银行',
      updated: '更新于',
      unavailable: '数据暂不可用',
      loading: '加载中...',
      percent: function (value) { return formatNumber(value, 'zh-CN') + '% 年利率'; },
      currency: function (value) { return 'BRL ' + formatNumber(value, 'zh-CN'); }
    }
  };

  function getLocale() {
    var lang = (document.documentElement.lang || 'pt-BR').toLowerCase();
    if (lang.indexOf('en') === 0) return translations.en;
    if (lang.indexOf('es') === 0) return translations.es;
    if (lang.indexOf('zh') === 0) return translations.zh;
    return translations.pt;
  }

  var text = getLocale();

  function formatNumber(value, locale) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function hasIndicatorMarkup() {
    return Boolean(getElement('indicator-selic') && getElement('value-selic'));
  }

  function setLoadingText() {
    ['selic', 'ipca', 'dollar', 'euro'].forEach(function (name) {
      var valueElement = getElement('value-' + name);
      if (valueElement) valueElement.textContent = text.loading;
    });
  }

  function drawChart(name) {
    var state = chartState[name];
    var element = getElement('indicator-' + name);
    if (!state || !element || !window.google || !google.visualization) return;

    var rows = [[text.period, text.value]];
    state.series.forEach(function (item) {
      rows.push([item.label, item.value]);
    });

    var data = google.visualization.arrayToDataTable(rows);
    var chart = new google.visualization.LineChart(element);
    chart.draw(data, {
      backgroundColor: 'transparent',
      chartArea: { left: 8, top: 8, width: '94%', height: '78%' },
      colors: ['#b8860b'],
      enableInteractivity: false,
      legend: { position: 'none' },
      hAxis: {
        textPosition: 'none',
        baselineColor: 'transparent',
        gridlines: { color: 'transparent' }
      },
      vAxis: {
        textPosition: 'none',
        baselineColor: 'transparent',
        gridlines: { color: '#edf0f2', count: 2 }
      },
      lineWidth: 3,
      pointSize: 0
    });
  }

  function redrawCharts() {
    Object.keys(chartState).forEach(drawChart);
  }

  function fetchJson(url) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) controller.abort();
    }, REQUEST_TIMEOUT);

    return fetch(url, controller ? { signal: controller.signal } : undefined)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .finally(function () {
        window.clearTimeout(timeout);
      });
  }

  function formatSgsDate(date) {
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    return day + '/' + month + '/' + date.getFullYear();
  }

  function formatPtaxDate(date) {
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    return month + '-' + day + '-' + date.getFullYear();
  }

  function parseSgsSeries(items) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      return {
        label: item.data,
        value: Number(String(item.valor).replace(',', '.'))
      };
    }).filter(function (item) {
      return Number.isFinite(item.value);
    });
  }

  function fetchSgsSeries(code) {
    var end = new Date();
    var start = new Date(end);
    start.setMonth(start.getMonth() - 6);

    var url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code +
      '/dados?formato=json&dataInicial=' + encodeURIComponent(formatSgsDate(start)) +
      '&dataFinal=' + encodeURIComponent(formatSgsDate(end));

    return fetchJson(url).then(parseSgsSeries);
  }

  function fetchExchangeSeries(currency) {
    var end = new Date();
    var start = new Date(end);
    start.setDate(start.getDate() - 30);

    var url = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/' +
      'CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)' +
      '?@moeda=%27' + currency + '%27' +
      '&@dataInicial=%27' + formatPtaxDate(start) + '%27' +
      '&@dataFinalCotacao=%27' + formatPtaxDate(end) + '%27' +
      '&$format=json';

    return fetchJson(url).then(function (result) {
      return (result && Array.isArray(result.value) ? result.value : []).map(function (item) {
        return {
          label: String(item.dataHoraCotacao || '').slice(0, 10),
          value: Number(item.cotacaoVenda)
        };
      }).filter(function (item) {
        return item.label && Number.isFinite(item.value);
      });
    });
  }

  function updateCard(name, series, formatter) {
    var values = series.slice(-6);
    if (!values.length) throw new Error('Empty series: ' + name);

    chartState[name] = { series: values };
    drawChart(name);

    var latest = values[values.length - 1];
    var valueElement = getElement('value-' + name);
    var sourceElement = getElement('source-' + name);

    if (valueElement) valueElement.textContent = formatter(latest.value);
    if (sourceElement) {
      sourceElement.textContent = text.source + ' | ' + text.updated + ' ' + latest.label;
    }
  }

  function showUnavailable(name) {
    var valueElement = getElement('value-' + name);
    var sourceElement = getElement('source-' + name);
    var chartElement = getElement('indicator-' + name);

    if (valueElement) valueElement.textContent = text.unavailable;
    if (sourceElement) sourceElement.textContent = text.source;
    if (chartElement) chartElement.innerHTML = '';
  }

  function loadIndicators() {
    setLoadingText();

    return Promise.allSettled([
      fetchSgsSeries(432)
        .then(function (series) { updateCard('selic', series, text.percent); })
        .catch(function (error) { console.warn('SELIC unavailable', error); showUnavailable('selic'); }),
      fetchSgsSeries(13522)
        .then(function (series) { updateCard('ipca', series, text.percent); })
        .catch(function (error) { console.warn('IPCA unavailable', error); showUnavailable('ipca'); }),
      fetchExchangeSeries('USD')
        .then(function (series) { updateCard('dollar', series, text.currency); })
        .catch(function (error) { console.warn('USD unavailable', error); showUnavailable('dollar'); }),
      fetchExchangeSeries('EUR')
        .then(function (series) { updateCard('euro', series, text.currency); })
        .catch(function (error) { console.warn('EUR unavailable', error); showUnavailable('euro'); })
    ]);
  }

  function initialize() {
    if (!hasIndicatorMarkup()) return;

    if (!window.google || !google.charts) {
      ['selic', 'ipca', 'dollar', 'euro'].forEach(showUnavailable);
      console.warn('Google Charts loader is unavailable.');
      return;
    }

    google.charts.load('current', { packages: ['corechart'], language: document.documentElement.lang || 'pt-BR' });
    google.charts.setOnLoadCallback(loadIndicators);

    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(redrawCharts, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
