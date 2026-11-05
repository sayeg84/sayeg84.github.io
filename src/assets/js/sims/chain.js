// Animated 3D polygonal chain (master's thesis). Each CSV holds one coordinate:
// rows are animation frames, columns are the chain's vertices.
(function () {
  const el = document.getElementById("chain-plot");
  if (!el) return;
  const status = document.getElementById("chain-status");
  const base = "/assets/simulations/finalPolyEightVeryReduced_";
  const FRAME_MS = 50;

  const parse = (txt) =>
    txt.trim().split(/\r?\n/).map((line) => line.split(",").map(Number));

  Promise.all(["x", "y", "z"].map((c) =>
    fetch(`${base}${c}.csv`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} loading ${r.url}`);
      return r.text();
    })
  ))
    .then(([xt, yt, zt]) => {
      const [X, Y, Z] = [xt, yt, zt].map(parse);
      if (X.length !== Y.length || X.length !== Z.length) throw new Error("X/Y/Z frame counts differ");

      const frames = X.map((_, f) => ({
        name: String(f),
        data: [{ type: "scatter3d", mode: "lines", x: X[f], y: Y[f], z: Z[f], line: { width: 4 } }],
      }));

      const axis = (t) => ({ title: { text: t }, autorange: false, range: [-50, 50] });
      const layout = {
        scene: { aspectmode: "cube", xaxis: axis("x"), yaxis: axis("y"), zaxis: axis("z") },
        margin: { l: 0, r: 0, t: 0, b: 0 },
        sliders: [{
          active: 0, x: 0.08, len: 0.9, y: 0.02, xanchor: "left", yanchor: "bottom",
          pad: { t: 0, b: 0 },
          currentvalue: { prefix: "Frame: " },
          steps: frames.map((fr) => ({
            label: fr.name,
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

      status.remove();
      return SiteTheme.plot(el, frames[0].data, layout).then(() => Plotly.addFrames(el, frames));
    })
    .catch((err) => {
      status.textContent = "Could not load the animation: " + err.message;
      console.error(err);
    });
})();
