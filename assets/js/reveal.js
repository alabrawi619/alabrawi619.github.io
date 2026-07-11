/* reveal.js — scroll-triggered fade-in via IntersectionObserver */
(function () {
  "use strict";

  function activate(el) { el.classList.add("is-visible"); }

  document.addEventListener("DOMContentLoaded", function () {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    // Fallback for browsers without IntersectionObserver.
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach(activate);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    targets.forEach(function (el) { observer.observe(el); });

    // Failsafe: never leave content invisible. If for any reason the observer
    // hasn't revealed an element after a short delay, reveal it directly.
    window.setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(activate);
    }, 1500);
  });
})();
