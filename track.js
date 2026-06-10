(function () {
  const INGEST_ENDPOINT =
    "https://httpdump.app/dumps/c178c8f8-46dc-48c0-a741-c0df558ccbf4";

  // Prevent multiple initializations
  if (window.__heatmapTrackerInitialized) return;
  window.__heatmapTrackerInitialized = true;

  function handlePageClick(event) {
    try {
      const payload = {
        event_type: "click",
        url: window.location.href,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),

        // Coordinates relative to the top-left of the entire document
        click_x: event.pageX,
        click_y: event.pageY,

        // Current dimensions of the browser window (crucial for normalization later)
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        doc_width: document.documentElement.scrollWidth,
        doc_height: document.documentElement.scrollHeight,

        // Optional: Target element tracking
        target_tag: event.target.tagName.toLowerCase(),
        target_id: event.target.id || null,
        target_class: event.target.className || null,
      };

      const body = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        const blob = new Blob([body], {
          type: "text/plain;charset=UTF-8",
        });
        navigator.sendBeacon(INGEST_ENDPOINT, blob);
      } else {
        // Fallback for older browsers
        fetch(INGEST_ENDPOINT, {
          method: "POST",
          body,
          keepalive: true, // Keeps the request alive if the page unloads
          mode: "no-cors",
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Heatmap tracking error:", error);
    }
  }

  document.addEventListener("click", handlePageClick, { passive: true });
})();
