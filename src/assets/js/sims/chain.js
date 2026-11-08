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
// plotting library is needed. The trajectory is re-oriented so the final chain
// lies left to right (see `reorient`). Drag the canvas to rotate, double-click
// to reset.
// Colours come from the CSS variables --sim-chain-line, --sim-chain-vertex and
// --muted, and are re-read on `themechange`.
(function () {
  const FRAME_MS = 40;
  // Slightly from the side and above, so the (re-oriented) long axis runs left to right.
  const DEFAULT_VIEW = { yaw: -0.45, pitch: 0.35 };
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

  // Eigen-decomposition of a symmetric 3x3 matrix (Jacobi rotations).
  // Returns eigenvectors as rows, sorted by decreasing eigenvalue.
  function eigenSym3(A) {
    const a = A.map((r) => r.slice());
    const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // columns are eigenvectors
    for (let sweep = 0; sweep < 50; sweep++) {
      let off = 0;
      for (let p = 0; p < 2; p++) for (let q = p + 1; q < 3; q++) off += a[p][q] ** 2;
      if (off < 1e-20) break;
      for (let p = 0; p < 2; p++) {
        for (let q = p + 1; q < 3; q++) {
          if (Math.abs(a[p][q]) < 1e-30) continue;
          const theta = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
          const c = Math.cos(theta), s = Math.sin(theta);
          for (let k = 0; k < 3; k++) { // A <- A J
            const akp = a[k][p], akq = a[k][q];
            a[k][p] = c * akp - s * akq;
            a[k][q] = s * akp + c * akq;
          }
          for (let k = 0; k < 3; k++) { // A <- J^T A
            const apk = a[p][k], aqk = a[q][k];
            a[p][k] = c * apk - s * aqk;
            a[q][k] = s * apk + c * aqk;
          }
          for (let k = 0; k < 3; k++) { // V <- V J
            const vkp = V[k][p], vkq = V[k][q];
            V[k][p] = c * vkp - s * vkq;
            V[k][q] = s * vkp + c * vkq;
          }
        }
      }
    }
    return [0, 1, 2]
      .sort((i, j) => a[j][j] - a[i][i])
      .map((i) => [V[0][i], V[1][i], V[2][i]]);
  }

  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];

  // The problem is rotation invariant, so re-orient the whole trajectory to read
  // well: the principal axes of the LAST frame (usually the unlocked, stretched
  // chain) become horizontal (longest), vertical (second) and depth (shortest).
  // Returns new { X, Y, Z } arrays (x = horizontal, y = depth, z = vertical).
  function reorient(X, Y, Z) {
    const f = X.length - 1, m = X[f].length;
    const mean = [X[f], Y[f], Z[f]].map((r) => r.reduce((s, v) => s + v, 0) / m);
    const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < m; i++) {
      const p = [X[f][i] - mean[0], Y[f][i] - mean[1], Z[f][i] - mean[2]];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a][b] += p[a] * p[b];
    }
    const [e1, e2] = eigenSym3(C).map((e) => {
      // Deterministic sign: largest component positive.
      const big = e.reduce((best, v) => (Math.abs(v) > Math.abs(best) ? v : best), 0);
      return big < 0 ? e.map((v) => -v) : e;
    });
    const depth = cross(e2, e1); // keeps (horizontal, depth, vertical) right-handed
    const dot = (e, x, y, z) => e[0] * x + e[1] * y + e[2] * z;
    const map = (e) => X.map((row, t) => row.map((x, i) => dot(e, x, Y[t][i], Z[t][i])));
    return { X: map(e1), Y: map(depth), Z: map(e2) };
  }

  function extent(rows) {
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) for (const v of r) { if (v < lo) lo = v; if (v > hi) hi = v; }
    return [lo, hi];
  }

  function setup(root, chain) {
    if (!Array.isArray(chain.x) || !chain.x.length) throw new Error("not a chain JSON file");
    if (chain.x.length !== chain.y.length || chain.x.length !== chain.z.length) throw new Error("X/Y/Z frame counts differ");
    const { X, Y, Z } = reorient(chain.x, chain.y, chain.z);
    const n = X.length;

    // ----- geometry: map data into a box centred on the origin, equal aspect -----
    const box = [X, Y, Z].map((rows) => padded(extent(rows)));
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

    // Rotation + orthographic projection, without translation/scale:
    // returns [right, up, depth] (larger depth = farther from the viewer).
    function rotate(v, x, y, z) {
      const x1 = x * v.cy - y * v.sy;
      const y1 = x * v.sy + y * v.cy;
      return [x1, y1 * v.sp + z * v.cp, y1 * v.cp - z * v.sp];
    }
    const trig = ({ yaw, pitch }) => ({ cy: Math.cos(yaw), sy: Math.sin(yaw), cp: Math.cos(pitch), sp: Math.sin(pitch) });
    // Projected half-width / half-height of the box from the default view; sets the zoom.
    const defaultExtent = (() => {
      const t = trig(DEFAULT_VIEW);
      const pr = corners.map((c) => rotate(t, c[0], c[1], c[2]));
      return [Math.max(...pr.map((p) => Math.abs(p[0]))), Math.max(...pr.map((p) => Math.abs(p[1])))];
    })();

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

      const t = trig(view);
      // Fit the box as seen from the default view; extreme rotations may clip.
      const s = 0.46 * Math.min(w / defaultExtent[0], h / defaultExtent[1]);
      const ox = w / 2, oy = h / 2;
      // Returns [screenX, screenY, depth].
      const P = (x, y, z) => {
        const r = rotate(t, x, y, z);
        return [ox + r[0] * s, oy - r[1] * s, r[2]];
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

      // Axis labels (of the re-oriented system), on the outermost edge parallel to each axis.
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
