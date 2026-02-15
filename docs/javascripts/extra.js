(function() {
  'use strict';

  /* 平滑滚动 */
  document.documentElement.style.scrollBehavior = 'smooth';

  function initReveal() {
    var revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    var observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  function initMermaidTheme() {
    if (typeof mermaid === 'undefined') return;
    var isDark = document.querySelector('[data-md-color-scheme="slate"]');
    try {
      mermaid.initialize({
        theme: isDark ? 'dark' : 'default',
        themeVariables: {
          primaryColor: isDark ? '#42a5f5' : '#0d47a1',
          primaryTextColor: isDark ? '#e3f2fd' : '#0d47a1',
          primaryBorderColor: isDark ? '#64b5f6' : '#1976d2',
          lineColor: isDark ? '#90caf9' : '#1565c0',
          secondaryColor: '#00bcd4',
          tertiaryColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
        }
      });
    } catch (e) {}
  }

  function init() {
    initReveal();
    initMermaidTheme();
  }

  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(init);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  var themeObserver = new MutationObserver(initMermaidTheme);
  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
  }
})();
