// embeds.js: loads itch.io and Steam widget iframes with queueing,
// immediate priority loading, and automatic retries on load failure/timeout.
(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll('iframe[data-src]'));
  if (!frames.length) return;

  var GAP_MS = { steam: 400, itch: 1000 }; // delay between launching widget loads (per host)
  var LOAD_TIMEOUT_MS = 10000;            // time to wait (10s) before treating an attempt as timed out
  var RETRY_DELAY_MS = 4000;              // pause (4s) before attempting a reload
  var MAX_RETRIES = 3;                    // total retry attempts before stopping the spinner

  function boxOf(frame) { return frame.closest('.steam-embed'); }

  frames.forEach(function (frame) {
    var box = boxOf(frame);
    if (box) box.classList.add('is-loading');
  });

  function clearLoading(frame) {
    var box = boxOf(frame);
    if (box) box.classList.remove('is-loading');
  }

  // Robust iframe loader with retry logic on network error or hanging timeouts
  function loadWithRetry(frame) {
    var url = frame.getAttribute('data-src');
    if (!url) return;
    frame.removeAttribute('data-src'); // Prevent duplicate queue processing

    var retries = 0;
    var timer = null;
    var resolved = false;

    function cleanup() {
      if (timer) clearTimeout(timer);
      frame.removeEventListener('load', onLoad);
      frame.removeEventListener('error', onError);
    }

    function onLoad() {
      if (resolved) return;
      resolved = true;
      cleanup();
      clearLoading(frame);
    }

    function onError() {
      if (resolved) return;
      cleanup();

      if (retries < MAX_RETRIES) {
        retries++;
        // Keep spinner visible and wait before retrying
        setTimeout(function () {
          resolved = false;
          // Temporarily reset iframe src to trigger a clean re-request
          frame.src = 'about:blank';
          setTimeout(function () {
            start();
          }, 100);
        }, RETRY_DELAY_MS);
      } else {
        // Exceeded max retries: remove loading spinner to fail gracefully
        resolved = true;
        clearLoading(frame);
      }
    }

    function start() {
      frame.addEventListener('load', onLoad, { once: true });
      frame.addEventListener('error', onError, { once: true });

      // Fallback timeout in case the iframe load hangs silently or gets rate-limited
      timer = setTimeout(onError, LOAD_TIMEOUT_MS);

      frame.src = url;
    }

    start();
  }

  // Identify priority embeds (Broken Peaces or explicit data-priority="true")
  var priorityFrames = [];
  var lazyFrames = [];

  frames.forEach(function (frame) {
    var src = frame.getAttribute('data-src') || '';
    var title = frame.getAttribute('title') || '';
    var isPriorityAttr = frame.getAttribute('data-priority') === 'true';

    if (isPriorityAttr || src.indexOf('4472608') !== -1 || /Broken Peaces/i.test(title)) {
      priorityFrames.push(frame);
    } else {
      lazyFrames.push(frame);
    }
  });

  // 1. Fire priority embeds immediately with retry support
  priorityFrames.forEach(loadWithRetry);

  // 2. Setup standard queue for remaining embeds
  if (!lazyFrames.length) return;

  var order = new Map();
  lazyFrames.forEach(function (f, i) { order.set(f, i); });

  var queues = {
    steam: { items: [], running: false },
    itch:  { items: [], running: false }
  };

  function hostOf(frame) {
    return /itch\.io/.test(frame.getAttribute('data-src')) ? 'itch' : 'steam';
  }

  function loadNext(host) {
    var q = queues[host];
    q.items.sort(function (a, b) { return order.get(a) - order.get(b); }); // top of page first
    var frame = q.items.shift();
    if (!frame) { q.running = false; return; }
    q.running = true;

    loadWithRetry(frame);

    // Continue launching subsequent embeds on schedule without waiting for retries
    setTimeout(function () { loadNext(host); }, GAP_MS[host]);
  }

  function enqueue(frame) {
    var host = hostOf(frame);
    queues[host].items.push(frame);
    if (!queues[host].running) loadNext(host);
  }

  // Old browsers fallback
  if (!('IntersectionObserver' in window)) {
    lazyFrames.forEach(enqueue);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        enqueue(entry.target);
      }
    });
  }, { rootMargin: '300px 0px' });

  lazyFrames.forEach(function (frame) { observer.observe(frame); });
})();