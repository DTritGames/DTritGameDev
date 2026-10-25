// reveal.js: fades each block in as it scrolls into view
(function () {
  var targets = document.querySelectorAll(
    'main > h2, main > p, .game-section > *:not(style):not(.video-container)'
  );

  // Browsers without IntersectionObserver: just show everything
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -8% 0px'  // start the fade a little before the bottom edge
  });

  targets.forEach(function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();