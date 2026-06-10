(function () {
  const INGEST_ENDPOINT =
    "https://httpdump.app/dumps/c178c8f8-46dc-48c0-a741-c0df558ccbf4";

  // Prevent multiple initializations
  if (window.__heatmapTrackerInitialized) return;
  window.__heatmapTrackerInitialized = true;

  function handleInteraction(event) {
    try {
      const target = event.target instanceof Element ? event.target : null;
      const payload = {
        event_type: "click",
        url: window.location.href,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),

        // Coordinates relative to the top-left of the entire document
        click_x: Math.round(event.pageX),
        click_y: Math.round(event.pageY),

        // Current dimensions of the browser window (crucial for normalization later)
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        doc_width: document.documentElement.scrollWidth,
        doc_height: document.documentElement.scrollHeight,

        // Optional: Target element tracking
        target_tag: target?.tagName.toLowerCase() || null,
        target_id: target?.id || null,
        target_class: target?.className || null,
        target_text: target?.textContent?.trim().slice(0, 120) || null,
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

  document.addEventListener("pointerdown", handleInteraction, {
    capture: true,
    passive: true,
  });
})();
