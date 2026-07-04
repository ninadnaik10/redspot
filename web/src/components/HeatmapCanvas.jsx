import { useEffect, useRef } from "react";

const RADIUS = 30;
const MAX_OPACITY = 0.6;

function HeatmapCanvas({ clicks, containerRef, metrics, onWheel }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !metrics) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (clicks.length === 0) return;

    // Scale factor: map from the original doc coordinates to the iframe's current viewport
    const scaleX = width / (metrics.docWidth || width);
    const scaleY = height / (metrics.docHeight || height);
    // Use uniform scale based on width to preserve aspect ratio
    const scale = scaleX;

    const scrollY = metrics.scrollY || 0;

    // Draw heat points onto an offscreen alpha canvas
    const alphaCanvas = document.createElement("canvas");
    alphaCanvas.width = canvas.width;
    alphaCanvas.height = canvas.height;
    const alphaCtx = alphaCanvas.getContext("2d");
    alphaCtx.scale(dpr, dpr);

    // Find max intensity for normalization
    const grid = {};
    for (const click of clicks) {
      const x = Math.round(click.click_x * scale);
      const y = Math.round((click.click_y - scrollY) * scale);
      const key = `${x},${y}`;
      grid[key] = (grid[key] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(grid), 1);

    // Draw radial gradients for each click point
    for (const click of clicks) {
      const x = click.click_x * scale;
      const y = (click.click_y - scrollY) * scale;

      // Skip points outside visible area
      if (y < -RADIUS || y > height + RADIUS) continue;

      const gradient = alphaCtx.createRadialGradient(x, y, 0, x, y, RADIUS);
      const intensity = 1 / maxCount;
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      alphaCtx.fillStyle = gradient;
      alphaCtx.fillRect(x - RADIUS, y - RADIUS, RADIUS * 2, RADIUS * 2);
    }

    // Colorize: read the alpha channel and map to a red-yellow-green-blue gradient
    const imageData = alphaCtx.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height);
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3] / 255;
      if (alpha === 0) continue;

      const [r, g, b] = intensityToColor(alpha / MAX_OPACITY);
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = Math.min(alpha, MAX_OPACITY) * 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [clicks, metrics, containerRef]);

  return (
    <canvas
      className="absolute inset-0"
      onWheel={onWheel}
      ref={canvasRef}
    />
  );
}

// Map 0..1 intensity to a color (blue → green → yellow → red)
function intensityToColor(t) {
  t = Math.min(Math.max(t, 0), 1);
  if (t < 0.25) {
    const f = t / 0.25;
    return [0, Math.round(f * 255), 255];
  } else if (t < 0.5) {
    const f = (t - 0.25) / 0.25;
    return [0, 255, Math.round((1 - f) * 255)];
  } else if (t < 0.75) {
    const f = (t - 0.5) / 0.25;
    return [Math.round(f * 255), 255, 0];
  } else {
    const f = (t - 0.75) / 0.25;
    return [255, Math.round((1 - f) * 255), 0];
  }
}

export default HeatmapCanvas;