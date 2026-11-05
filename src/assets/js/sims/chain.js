// Animated 3D polygonal chains (master's thesis).
//
// Every element with class "chain-plot" and a `data-src` attribute becomes an
// animation. `data-src` is a path prefix: the script loads `<prefix>_x.csv`,
// `<prefix>_y.csv` and `<prefix>_z.csv`, where rows are animation frames and
// columns are the chain's vertices.
//
//   <div class="plot chain-plot" data-src="/assets/simulations/data/needleTrajReduced"></div>
(function () {
  const FRAME_MS = 40;
  const MAX_FRAMES = 300;
  const LINE = { color: "rgb(0, 179, 184)", width: 7 };
  const MARKER = { color: "rgb(226, 74, 141)", size: 4, symbol: "circle", opacity: 0.9 };

  const parse = (txt) => txt.trim().split(/\r?\n/).map((line) => line.split(",").map(Number));

  const load = (url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} loading ${url}`);
      return r.text();
    });

  // [min, max] over every vertex of every frame, padded by 10% on each side.
  function paddedRange(M) {
    let min = Infinity, max = -Infinity;
    for (const row of M) for (const v of row) if (Number.isFinite(v)) { if (v < min) min = v; if (v > max) max = v; }
    const pad = (max - min) * 0.1 || 0.5;
    return [min - pad, max + pad];
  }

  function render(el, X, Y, Z) {
    if (X.length !== Y.length || X.length !== Z.length) throw new Error("X/Y/Z frame counts differ");

    // Keep at most MAX_FRAMES frames so the animation stays smooth.
    const step = Math.ceil(X.length / MAX_FRAMES);
    const frames = [];
    for (let f = 0; f < X.length; f += step) {
      frames.push({
        name: String(f),
        data: [{ type: "scatter3d", mode: "lines+markers", x: X[f], y: Y[f], z: Z[f], line: LINE, marker: MARKER }],
      });
    }

    const axis = (t, M) => ({ title: { text: t }, autorange: false, range: paddedRange(M) });
    const layout = {
      scene: { aspectmode: "cube", xaxis: axis("x", X), yaxis: axis("y", Y), zaxis: axis("z", Z) },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      sliders: [{
        active: 0, x: 0.08, len: 0.9, y: 0.02, xanchor: "left", yanchor: "bottom",
        pad: { t: 0, b: 0 },
        currentvalue: { prefix: "Frame: " },
        steps: frames.map((fr, i) => ({
          label: String(i),
          method: "animate",
          args: [[fr.name], { mode: "immediate", frame: { duration: 0, redraw: true }, transition: { duration: 0 } }],
        })),
      }],
      updatemenus: [{
        type: "buttons", direction: "left", x: 0.08, y: 0, xanchor: "left", yanchor: "bottom",
        pad: { t: 35, r: 10 }, showactive: false,
        buttons: [
          { label: "Play", method: "animate",
            args: [null, { fromcurrent: true, mode: "immediate", frame: { duration: FRAME_MS, redraw: true }, transition: { duration: 0 } }] },
          { label: "Pause", method: "animate",
            args: [[null], { mode: "immediate", frame: { duration: 0, redraw: false }, transition: { duration: 0 } }] },
        ],
      }],
    };

    el.replaceChildren();
    return SiteTheme.plot(el, frames[0].data, layout).then(() => Plotly.addFrames(el, frames));
  }

  document.querySelectorAll(".chain-plot[data-src]").forEach((el) => {
    const src = el.dataset.src;
    Promise.all(["x", "y", "z"].map((c) => load(`${src}_${c}.csv`)))
      .then((texts) => render(el, ...texts.map(parse)))
      .catch((err) => {
        el.textContent = "Could not load the animation: " + err.message;
        console.error(err);
      });
  });
})();
