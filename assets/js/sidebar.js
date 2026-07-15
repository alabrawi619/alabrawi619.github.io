/* sidebar.js — collapsible blogs sidebar (GitHub-style) */
(function () {
  "use strict";

  function init() {
    var layout = document.querySelector("[data-blog-doc]");
    if (!layout) return;

    var toggle = layout.querySelector("[data-sidebar-toggle]");
    var backdrop = layout.querySelector("[data-sidebar-backdrop]");
    var mobileMQ = window.matchMedia("(max-width: 768px)");
    var STORE_KEY = "blogSidebarCollapsed";

    function isMobile() { return mobileMQ.matches; }

    function isCollapsed() { return layout.classList.contains("sidebar-collapsed"); }

    // The knowledge graph sizes itself to its container, so nudge it to
    // re-measure whenever the content width changes. The second dispatch fires
    // after the sidebar's 0.3s ($t-mid) slide/layout has settled.
    function notifyResize() {
      window.dispatchEvent(new Event("resize"));
      window.setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 340);
    }

    function setCollapsed(collapsed) {
      layout.classList.toggle("sidebar-collapsed", collapsed);
      if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
      if (backdrop) backdrop.hidden = collapsed || !isMobile();
      notifyResize();
    }

    function readStored() {
      try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    }
    function writeStored(collapsed) {
      try { localStorage.setItem(STORE_KEY, collapsed ? "1" : "0"); } catch (e) {}
    }

    // Default: expanded on desktop (respecting a saved preference), and
    // collapsed as an off-canvas drawer on small screens.
    function applyDefault() {
      if (isMobile()) {
        setCollapsed(true);
      } else {
        setCollapsed(readStored() === "1");
      }
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        var collapsed = !isCollapsed();
        setCollapsed(collapsed);
        if (!isMobile()) writeStored(collapsed);
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () { setCollapsed(true); });
    }

    // Close the mobile drawer with the Escape key.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isMobile() && !isCollapsed()) setCollapsed(true);
    });

    // Re-apply the appropriate default when crossing the breakpoint.
    if (mobileMQ.addEventListener) {
      mobileMQ.addEventListener("change", applyDefault);
    } else if (mobileMQ.addListener) {
      mobileMQ.addListener(applyDefault);
    }

    applyDefault();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
