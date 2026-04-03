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
    var fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

    var lightVars = {
      /* typography */
      fontFamily: fontFamily,
      fontSize: '14px',

      /* primary node */
      primaryColor: '#EFF6FF',
      primaryBorderColor: '#3B82F6',
      primaryTextColor: '#1E3A5F',
      mainBkg: '#EFF6FF',
      nodeBorder: '#3B82F6',
      nodeTextColor: '#1E3A5F',

      /* secondary / special nodes */
      secondaryColor: '#F0FDFA',
      secondaryBorderColor: '#0D9488',
      secondaryTextColor: '#0F4C43',
      tertiaryColor: '#F5F3FF',
      tertiaryBorderColor: '#7C3AED',
      tertiaryTextColor: '#3B1F6E',

      /* cluster / subgraph */
      clusterBkg: 'rgba(37,99,235,0.04)',
      clusterBorder: '#BFDBFE',
      titleColor: '#1E3A5F',

      /* edges */
      lineColor: '#3B82F6',
      edgeLabelBackground: '#F0F7FF',

      /* sequence diagrams */
      actorBkg: '#EFF6FF',
      actorBorder: '#3B82F6',
      actorTextColor: '#1E3A5F',
      actorLineColor: '#93C5FD',
      activationBkgColor: '#DBEAFE',
      activationBorderColor: '#3B82F6',
      signalColor: '#1E40AF',
      signalTextColor: '#1E40AF',
      sequenceNumberColor: '#FFFFFF',
      labelBoxBkgColor: '#EFF6FF',
      labelBoxBorderColor: '#BFDBFE',
      labelTextColor: '#1E3A5F',
      loopTextColor: '#1E3A5F',
      noteBkgColor: '#FFF7ED',
      noteBorderColor: '#FED7AA',
      noteTextColor: '#9A3412',

      /* background */
      background: '#FFFFFF'
    };

    var darkVars = {
      /* typography */
      fontFamily: fontFamily,
      fontSize: '14px',

      /* primary node */
      primaryColor: '#1E2D45',
      primaryBorderColor: '#60A5FA',
      primaryTextColor: '#BFDBFE',
      mainBkg: '#1E2D45',
      nodeBorder: '#60A5FA',
      nodeTextColor: '#BFDBFE',

      /* secondary / special nodes */
      secondaryColor: '#0F2E2B',
      secondaryBorderColor: '#2DD4BF',
      secondaryTextColor: '#99F6E4',
      tertiaryColor: '#1E1B38',
      tertiaryBorderColor: '#A78BFA',
      tertiaryTextColor: '#DDD6FE',

      /* cluster / subgraph */
      clusterBkg: 'rgba(96,165,250,0.06)',
      clusterBorder: '#2D4A7A',
      titleColor: '#93C5FD',

      /* edges */
      lineColor: '#60A5FA',
      edgeLabelBackground: '#172033',

      /* sequence diagrams */
      actorBkg: '#1E2D45',
      actorBorder: '#60A5FA',
      actorTextColor: '#BFDBFE',
      actorLineColor: '#3B5A8A',
      activationBkgColor: '#1A3260',
      activationBorderColor: '#60A5FA',
      signalColor: '#93C5FD',
      signalTextColor: '#93C5FD',
      sequenceNumberColor: '#0F172A',
      labelBoxBkgColor: '#1E2D45',
      labelBoxBorderColor: '#2D4A7A',
      labelTextColor: '#BFDBFE',
      loopTextColor: '#BFDBFE',
      noteBkgColor: '#2D1F0E',
      noteBorderColor: '#92400E',
      noteTextColor: '#FCD34D',

      /* background */
      background: '#121D2D'
    };

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: isDark ? darkVars : lightVars,
        flowchart: {
          curve: 'basis',
          padding: 18,
          nodeSpacing: 36,
          rankSpacing: 52,
          htmlLabels: true,
          useMaxWidth: true
        },
        sequence: {
          useMaxWidth: true,
          boxMargin: 10,
          noteMargin: 10,
          messageMargin: 35,
          mirrorActors: false
        },
        securityLevel: 'loose'
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
