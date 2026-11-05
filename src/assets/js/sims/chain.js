// Animated 3D polygonal chains (master's thesis).
//
// Every element with class "chain-plot" and a `data-src` attribute becomes an
// animation. `data-src` is the URL of a JSON file made by
// scripts/convert-chain.js: { frames, vertices, range: {x, y, z}, x, y, z },
// where x/y/z hold one row per animation frame and one column per vertex.
//
//   <div class="plot chain-plot" data-src="/assets/simulations/data/needleTraj.json"></div>
(function () {
  const FRAME_MS = 40;
  const LINE = { color: "rgb(0, 179, 184)", width: 7 };
  const MARKER = { color: "rgb(226, 74, 141)", size: 4, symbol: "circle", opacity: 0.9 };

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

  function render(el, chain) {
    const { x: X, y: Y, z: Z, range } = chain;
    if (!Array.isArray(X) || !X.length || !range) throw new Error("not a chain JSON file");
    if (X.length !== Y.length || X.length !== Z.length) throw new Error("X/Y/Z frame counts differ");

    const frames = X.map((_, f) => ({
      name: String(f),
      data: [{ type: "scatter3d", mode: "lines+markers", x: X[f], y: Y[f], z: Z[f], line: LINE, marker: MARKER }],
    }));

    const axis = (t) => ({ title: { text: t }, autorange: false, range: padded(range[t]) });
    const layout = {
      scene: { aspectmode: "cube", xaxis: axis("x"), yaxis: axis("y"), zaxis: axis("z") },
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
    load(el.dataset.src)
      .then((chain) => render(el, chain))
      .catch((err) => {
        el.textContent = "Could not load the animation: " + err.message;
        console.error(err);
      });
  });
})();
