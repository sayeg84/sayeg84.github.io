---
title: "Chain unlocking"
excerpt: "Global minimization for unlocking geometrical chains"
permalink: /projects/chain
collection: portfolio
---


<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>3D Curve Segment Animation (Plotly + fetch CSV)</title>
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    #plot { width: 100vw; height: 100vh; }
    #msg { position: fixed; left: 12px; top: 12px; padding: 8px 10px; background: rgba(0,0,0,.65); color: #fff; border-radius: 6px; font-size: 13px; }
  </style>
</head>
<body>
  <div id="plot"></div>
  <div id="msg">Loading CSV…</div>

  <script>
    // Put your CSV next to this HTML file and name it this:
    const CSV_URL = "./curve.csv"; // header: x1,y1,z1,x2,y2,z2

    const msgEl = document.getElementById("msg");
    const setMsg = (s) => { msgEl.textContent = s; };

    function parseSegments(csv) {
      const lines = csv.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error("CSV has no data rows.");

      const header = lines[0].split(",").map(s => s.trim());
      const idx = Object.fromEntries(header.map((h, i) => [h, i]));

      const required = ["x1","y1","z1","x2","y2","z2"];
      for (const k of required) {
        if (!(k in idx)) throw new Error(`Missing column: ${k}`);
      }

      const segs = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",").map(s => s.trim());
        if (parts.length < header.length) continue;

        const s = {
          x1: parseFloat(parts[idx.x1]),
          y1: parseFloat(parts[idx.y1]),
          z1: parseFloat(parts[idx.z1]),
          x2: parseFloat(parts[idx.x2]),
          y2: parseFloat(parts[idx.y2]),
          z2: parseFloat(parts[idx.z2]),
        };
        if ([s.x1,s.y1,s.z1,s.x2,s.y2,s.z2].some(v => Number.isNaN(v))) continue;
        segs.push(s);
      }

      if (!segs.length) throw new Error("No valid segments parsed from CSV.");
      return segs;
    }

    async function main() {
      setMsg(`Fetching ${CSV_URL}…`);

      // NOTE: Most browsers block fetch() from file:// URLs.
      // Run a local server (examples below) and open http://localhost:....
      const res = await fetch(CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      const csvText = await res.text();

      setMsg("Parsing…");
      const segments = parseSegments(csvText);

      // Build frames: progressively draw polyline, plus a moving head marker.
      const xs = [segments[0].x1];
      const ys = [segments[0].y1];
      const zs = [segments[0].z1];

      const frames = [];
      for (let i = 0; i < segments.length; i++) {
        xs.push(segments[i].x2);
        ys.push(segments[i].y2);
        zs.push(segments[i].z2);

        frames.push({
          name: String(i),
          data: [
            { x: xs.slice(), y: ys.slice(), z: zs.slice() }, // line
            { x: [segments[i].x2], y: [segments[i].y2], z: [segments[i].z2] } // head
          ]
        });
      }
    const frameNames = frames.map(f => f.name);
      const lineTrace = {
        type: "scatter3d",
        mode: "lines",
        x: [segments[0].x1],
        y: [segments[0].y1],
        z: [segments[0].z1],
        line: { width: 6, color: "#1f77b4" },
        name: "curve"
      };

      const headTrace = {
        type: "scatter3d",
        mode: "markers",
        x: [segments[0].x1],
        y: [segments[0].y1],
        z: [segments[0].z1],
        marker: { size: 5, color: "#d62728" },
        name: "head"
      };

      const layout = {
        margin: { l: 0, r: 0, t: 0, b: 0 },
        showlegend: false,
        scene: {
        aspectmode: "cube",
        xaxis: { title: "x", autorange: false, range: [-1, 1] },
        yaxis: { title: "y", autorange: false, range: [-1, 1] },
        zaxis: { title: "z", autorange: false, range: [-1, 1] },
        },
        updatemenus: [{
          type: "buttons",
          direction: "left",
          x: 0.05, y: 0.05,
          xanchor: "left", yanchor: "bottom",
          pad: { r: 10, t: 10 },
          buttons: [
            {
            label: "Play",
            method: "animate",
            args: [frameNames, {
                frame: { duration: 80, redraw: true },
                transition: { duration: 0 },
                fromcurrent: true,
                mode: "immediate"
            }]
            },
            {
              label: "Pause",
              method: "animate",
              args: [[null], {
                frame: { duration: 0, redraw: false },
                transition: { duration: 0 },
                mode: "immediate"
              }]
            }
          ]
        }],
        sliders: [{
          x: 0.05, len: 0.9,
          y: 0.02,
          pad: { t: 30, b: 10 },
          currentvalue: { prefix: "Segment: " },
          steps: frames.map(f => ({
            label: f.name,
            method: "animate",
            args: [[f.name], {
              frame: { duration: 0, redraw: true },
              transition: { duration: 0 },
              mode: "immediate"
            }]
          }))
        }]
      };

      setMsg("Rendering…");
      await Plotly.newPlot("plot", [lineTrace, headTrace], layout, { responsive: true });
      await Plotly.addFrames("plot", frames);

      setMsg(`Loaded ${segments.length} segments. Hit Play.`);
      setTimeout(() => { msgEl.style.display = "none"; }, 1200);
    }

    main().catch(err => {
      console.error(err);
      setMsg("Error: " + err.message + "\n(Open console for details.)");
    });
  </script>
</body>


You can check the source code for the project [here](https://github.com/sayeg84/chainUnlocking). My thesis can be consulted [here](https://tesiunam.dgb.unam.mx/cgi-bin/koha/opac-detail.pl?biblionumber=826069)