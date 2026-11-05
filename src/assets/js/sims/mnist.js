// Draw a digit and classify it with a small CNN (TensorFlow.js graph model).
// The drawing uses the page's text colour on the page background, so it
// works in both themes; the pixel → MNIST conversion measures the distance
// from the background colour, which makes it colour-independent.
(function () {
  const canvas = document.getElementById("mnist-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const chart = document.getElementById("mnist-chart");
  const SIZE = 280, CELL = 10, GRID = 28;
  const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const model = tf.loadGraphModel("/files/projects/mnist/model.json");

  const layout = {
    title: { text: "Prediction: ?" },
    xaxis: { title: { text: "Digit" }, tickmode: "array", tickvals: DIGITS },
    yaxis: {
      title: { text: "Log probability" },
      type: "log",
      tickvals: [1e-100, 1e-80, 1e-60, 1e-40, 1e-20, 1],
      ticktext: ["-100", "-80", "-60", "-40", "-20", "0"],
      range: [-100, 0],
    },
    margin: { l: 60, r: 10, t: 40, b: 50 },
  };

  function showPrediction(probs, label) {
    layout.title.text = "Prediction: " + label;
    SiteTheme.plot(chart, [{ type: "bar", x: DIGITS, y: probs }], layout, { displayModeBar: false });
  }

  function clear() {
    ctx.fillStyle = SiteTheme.cssVar("--bg");
    ctx.fillRect(0, 0, SIZE, SIZE);
    showPrediction(DIGITS.map(() => 1e-100), "?");
  }

  // --- drawing (pointer events cover mouse, pen and touch) ---
  let drawing = false, last = null;
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * SIZE) / r.width, y: ((e.clientY - r.top) * SIZE) / r.height };
  };
  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    last = pos(e);
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = SiteTheme.cssVar("--text");
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  });
  ["pointerup", "pointercancel"].forEach((t) => canvas.addEventListener(t, () => (drawing = false)));

  // --- canvas → 28×28 input in [0, 255] ---
  function hexToRgb(color) {
    ctx.save();
    ctx.fillStyle = color; // normalises any CSS colour to #rrggbb
    const hex = ctx.fillStyle;
    ctx.restore();
    return [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
  }

  function toInput() {
    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
    const bg = hexToRgb(SiteTheme.cssVar("--bg"));
    const fg = hexToRgb(SiteTheme.cssVar("--text"));
    const span = Math.hypot(fg[0] - bg[0], fg[1] - bg[1], fg[2] - bg[2]) || 1;
    const out = new Float32Array(GRID * GRID);
    for (let py = 0; py < SIZE; py++)
      for (let px = 0; px < SIZE; px++) {
        const k = (py * SIZE + px) * 4;
        const d = Math.hypot(data[k] - bg[0], data[k + 1] - bg[1], data[k + 2] - bg[2]);
        out[Math.floor(py / CELL) * GRID + Math.floor(px / CELL)] += Math.min(1, d / span) * 255;
      }
    return out.map((v) => v / (CELL * CELL));
  }

  function softmax(arr) {
    const m = Math.max(...arr);
    const e = Array.from(arr, (v) => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => Math.max(v / s, 1e-100));
  }

  async function classify() {
    const m = await model;
    const logits = m.predict(tf.tensor(toInput()).reshape([-1, GRID * GRID])).dataSync();
    const probs = softmax(logits);
    showPrediction(probs, probs.indexOf(Math.max(...probs)));
  }

  document.getElementById("mnist-erase").addEventListener("click", clear);
  document.getElementById("mnist-classify").addEventListener("click", classify);
  // The drawing is in theme colours; start over when the theme changes.
  document.addEventListener("themechange", clear);

  clear();
})();
