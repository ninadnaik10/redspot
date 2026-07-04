import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet, RotateCw } from "lucide-react";
import HeatmapCanvas from "./HeatmapCanvas";

const VIEWPORTS = [
  { id: "desktop", icon: Monitor, label: "Desktop", width: "100%" },
  { id: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
  { id: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
];

function Viewer({ siteUrl, path, apiBase }) {
  const [viewport, setViewport] = useState("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [clicks, setClicks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch heatmap data when path changes or on manual refresh
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchClicks() {
      try {
        const fullUrl = siteUrl.replace(/\/$/, "") + path;
        const res = await fetch(
          `${apiBase}/api/v1/heatmap?url=${encodeURIComponent(fullUrl)}`,
        );
        const data = await res.json();
        if (!cancelled) setClicks(data.clicks || []);
      } catch {
        if (!cancelled) setClicks([]);
      }
    }
    fetchClicks();
    return () => { cancelled = true; };
  }, [path, apiBase, siteUrl, refreshKey]);

  // Listen for scroll/dimension metrics from the iframe
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === "redspot:metrics") {
        setMetrics(e.data);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleWheel = useCallback((e) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "redspot:scroll", deltaX: e.deltaX, deltaY: e.deltaY },
      "*",
    );
  }, []);

  const activeViewport = VIEWPORTS.find((v) => v.id === viewport);

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-1">
          {VIEWPORTS.map((vp) => (
            <button
              className={`rounded-md p-2 transition ${
                viewport === vp.id
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              key={vp.id}
              onClick={() => setViewport(vp.id)}
              title={vp.label}
            >
              <vp.icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {clicks.length} clicks on <strong>{path}</strong>
          </span>
          <span className="rounded-md bg-slate-50 px-3 py-1 text-xs text-slate-500">
            {siteUrl}
          </span>
          <button
            className="rounded-md p-2 text-slate-400 transition hover:text-slate-600"
            onClick={() => { setIframeKey((k) => k + 1); setRefreshKey((k) => k + 1); }}
            title="Reload"
          >
            <RotateCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <div
          className="relative h-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 transition-all duration-300"
          ref={containerRef}
          style={{ width: activeViewport.width, maxWidth: "100%" }}
        >
          <iframe
            className="h-full w-full border-none"
            key={iframeKey}
            ref={iframeRef}
            src={siteUrl}
            title="Site preview"
          />
          <HeatmapCanvas
            clicks={clicks}
            containerRef={containerRef}
            metrics={metrics}
            onWheel={handleWheel}
          />
        </div>
      </div>
    </main>
  );
}

export default Viewer;