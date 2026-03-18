(function() {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js');

  function updateMotionPreference() {
    document.documentElement.style.scrollBehavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
  }

  function initReveal() {
    var revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;
    if (prefersReducedMotion.matches || typeof IntersectionObserver === 'undefined') {
      revealElements.forEach(function(el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
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
    updateMotionPreference();
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

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', updateMotionPreference);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(updateMotionPreference);
  }
})();
