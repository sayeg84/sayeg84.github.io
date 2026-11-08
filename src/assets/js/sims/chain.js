// Animated 3D polygonal chains (master's thesis), drawn on a 2D canvas.
//
// Every element with class "chain-plot" and a `data-src` attribute becomes an
// animation. `data-src` is the URL of a JSON file made by
// scripts/convert-chain.js: { frames, vertices, range: {x, y, z}, x, y, z },
// where x/y/z hold one row per animation frame and one column per vertex.
//
//   <div class="plot chain-plot" data-src="/assets/simulations/data/needleTraj.json"></div>
//
// The 3D projection is done by hand (rotation + orthographic projection), so no
// plotting library is needed. Drag the canvas to rotate, double-click to reset.
// Colours come from the CSS variables --sim-chain-line, --sim-chain-vertex and
// --muted, and are re-read on `themechange`.
(function () {
  const FRAME_MS = 40;
  // Same viewpoint as Plotly's default camera: looking from (1, 1, 1).
  const DEFAULT_VIEW = { yaw: (-3 * Math.PI) / 4, pitch: Math.atan(1 / Math.SQRT2) };
  const LINE_WIDTH = 4;
  const VERTEX_RADIUS = 3.5;
  const DRAG_SPEED = 0.01; // radians per pixel

  const load = (url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} loading ${url}`);
      return r.json();
    });

  // [min, max] padded by 10% on each side.
  function padded([min, max]) {
    const pad = (max - min) * 0.1 || 0.5;
    return [min - pad, max + pad];
  }

  function el(tag, props = {}) {
    return Object.assign(document.createElement(tag), props);
  }

  function setup(root, chain) {
    const { x: X, y: Y, z: Z, range } = chain;
    if (!Array.isArray(X) || !X.length || !range) throw new Error("not a chain JSON file");
    if (X.length !== Y.length || X.length !== Z.length) throw new Error("X/Y/Z frame counts differ");
    const n = X.length;

    // ----- geometry: map data into a box centred on the origin, equal aspect -----
    const box = ["x", "y", "z"].map((a) => padded(range[a]));
    const center = box.map(([lo, hi]) => (lo + hi) / 2);
    const half = Math.max(...box.map(([lo, hi]) => (hi - lo) / 2));
    const corners = [];
    for (let i = 0; i < 8; i++) {
      corners.push([0, 1, 2].map((k) => (box[k][(i >> k) & 1] - center[k]) / half));
    }
    // Edges join corners that differ in one coordinate; edgesByAxis[k] are parallel to axis k.
    const edgesByAxis = [[], [], []];
    for (let i = 0; i < 8; i++) {
      for (let k = 0; k < 3; k++) if (!(i & (1 << k))) edgesByAxis[k].push([i, i | (1 << k)]);
    }
    const radius = Math.max(...corners.map((c) => Math.hypot(...c)));

    // ----- DOM -----
    const canvas = el("canvas", { className: "chain-canvas" });
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "3D animation of a polygonal chain. Drag to rotate, double-click to reset the view.");
    const playBtn = el("button", { type: "button", className: "chain-play", textContent: "Play" });
    const slider = el("input", { type: "range", min: 0, max: n - 1, step: 1, value: 0 });
    slider.setAttribute("aria-label", "Frame");
    const output = el("output");
    const resetBtn = el("button", { type: "button", textContent: "Reset view" });
    const controls = el("div", { className: "chain-controls" });
    controls.append(playBtn, slider, output, resetBtn);
    root.replaceChildren(canvas, controls);
    const ctx = canvas.getContext("2d");

    // ----- state -----
    let frame = 0;
    let playing = false;
    let visible = true;
    let raf = 0;
    let last = 0;
    let drawPending = false;
    let w = 0, h = 0, dpr = 1;
    let colors = {};
    const view = { ...DEFAULT_VIEW };

    function readColors() {
      const v = SiteTheme.cssVar;
      colors = {
        line: v("--sim-chain-line"),
        vertex: v("--sim-chain-vertex"),
        muted: v("--muted"),
        font: `13px ${v("--font-body") || "sans-serif"}`,
      };
    }

    function draw() {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
      const cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
      const s = (0.5 * Math.min(w, h) * 0.92) / radius;
      const ox = w / 2, oy = h / 2;
      // Rotate about z (yaw), tilt about the screen's horizontal axis (pitch),
      // project orthographically. Returns [screenX, screenY, depth]; larger depth = farther.
      const P = (x, y, z) => {
        const x1 = x * cy - y * sy;
        const y1 = x * sy + y * cy;
        return [ox + x1 * s, oy - (y1 * sp + z * cp) * s, y1 * cp - z * sp];
      };

      // Bounding box.
      const pc = corners.map((c) => P(c[0], c[1], c[2]));
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.muted;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (const edges of edgesByAxis) {
        for (const [i, j] of edges) {
          ctx.moveTo(pc[i][0], pc[i][1]);
          ctx.lineTo(pc[j][0], pc[j][1]);
        }
      }
      ctx.stroke();

      // Axis labels, on the outermost edge parallel to each axis.
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = colors.muted;
      ctx.font = colors.font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ["x", "y", "z"].forEach((name, k) => {
        let best = null, bestDist = -1;
        for (const [i, j] of edgesByAxis[k]) {
          const mx = (pc[i][0] + pc[j][0]) / 2 - ox, my = (pc[i][1] + pc[j][1]) / 2 - oy;
          const d = Math.hypot(mx, my);
          if (d > bestDist) { bestDist = d; best = [mx, my]; }
        }
        const push = bestDist ? 14 / bestDist : 0;
        ctx.fillText(name, ox + best[0] * (1 + push), oy + best[1] * (1 + push));
      });

      // Chain: segments and vertices painted back to front, fading with depth.
      const xs = X[frame], ys = Y[frame], zs = Z[frame];
      const m = xs.length;
      const pts = new Array(m);
      for (let i = 0; i < m; i++) {
        pts[i] = P((xs[i] - center[0]) / half, (ys[i] - center[1]) / half, (zs[i] - center[2]) / half);
      }
      const items = [];
      for (let i = 0; i < m - 1; i++) items.push({ d: (pts[i][2] + pts[i + 1][2]) / 2, i, seg: true });
      for (let i = 0; i < m; i++) items.push({ d: pts[i][2] - 1e-3, i, seg: false });
      items.sort((a, b) => b.d - a.d);

      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = "round";
      ctx.strokeStyle = colors.line;
      ctx.fillStyle = colors.vertex;
      for (const { d, i, seg } of items) {
        ctx.globalAlpha = 1 - 0.5 * Math.min(1, Math.max(0, (d + radius) / (2 * radius)));
        ctx.beginPath();
        if (seg) {
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
          ctx.stroke();
        } else {
          ctx.arc(pts[i][0], pts[i][1], VERTEX_RADIUS, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function requestDraw() {
      if (drawPending) return;
      drawPending = true;
      requestAnimationFrame(() => {
        drawPending = false;
        draw();
      });
    }

    function setFrame(f) {
      frame = f;
      slider.value = f;
      output.value = `Frame ${f} / ${n - 1}`;
    }

    // ----- playback -----
    function schedule() {
      if (playing && visible && !raf) raf = requestAnimationFrame(tick);
    }

    function tick(t) {
      raf = 0;
      if (!playing) return;
      if (t - last >= FRAME_MS) {
        last = t - last > 4 * FRAME_MS ? t : last + FRAME_MS; // don't race to catch up after a stall
        if (frame >= n - 1) return pause();
        setFrame(frame + 1);
        draw();
      }
      schedule();
    }

    function play() {
      if (frame >= n - 1) setFrame(0);
      playing = true;
      playBtn.textContent = "Pause";
      last = performance.now();
      schedule();
    }

    function pause() {
      playing = false;
      playBtn.textContent = "Play";
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    playBtn.addEventListener("click", () => (playing ? pause() : play()));
    slider.addEventListener("input", () => {
      pause();
      setFrame(Number(slider.value));
      requestDraw();
    });

    // ----- rotation -----
    function resetView() {
      Object.assign(view, DEFAULT_VIEW);
      requestDraw();
    }
    resetBtn.addEventListener("click", resetView);
    canvas.addEventListener("dblclick", resetView);

    let drag = null;
    canvas.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      view.yaw += (e.clientX - drag.x) * DRAG_SPEED;
      view.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, view.pitch + (e.clientY - drag.y) * DRAG_SPEED));
      drag = { x: e.clientX, y: e.clientY };
      requestDraw();
    });
    const endDrag = () => {
      drag = null;
      canvas.classList.remove("dragging");
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    // ----- size, visibility, theme -----
    new ResizeObserver(() => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw();
    }).observe(canvas);

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        last = performance.now();
        schedule();
      }
    }).observe(canvas);

    document.addEventListener("themechange", () => {
      readColors();
      requestDraw();
    });

    readColors();
    setFrame(0);
  }

  document.querySelectorAll(".chain-plot[data-src]").forEach((root) => {
    load(root.dataset.src)
      .then((chain) => setup(root, chain))
      .catch((err) => {
        root.textContent = "Could not load the animation: " + err.message;
        console.error(err);
      });
  });
})();
