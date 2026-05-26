function loadText(url, cb) {
  fetch(url, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " loading " + url);
      return r.text();
    })
    .then(function (txt) { cb(null, txt); })
    .catch(function (e) { cb(e); });
}

function parseMatrix(csvText) {
  var parsed = Papa.parse(csvText, {
    header: false,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  return parsed.data; // frames x N
}

function validateSameShape(X, Y, Z) {
  var nFrames = X.length;
  if (nFrames === 0) throw new Error("Empty X file");
  if (Y.length !== nFrames || Z.length !== nFrames) throw new Error("X/Y/Z row counts differ");

  var nPoints = X[0].length;
  for (var i = 0; i < nFrames; i++) {
    if (X[i].length !== nPoints || Y[i].length !== nPoints || Z[i].length !== nPoints) {
      throw new Error("Column count mismatch on row " + i);
    }
  }
  return { nFrames: nFrames, nPoints: nPoints };
}

// Helper function to find min and max values in arrays
function findMinMax(values) {
  let min = Infinity;
  let max = -Infinity;
  
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      const val = values[i][j];
      if (v < min) min = val;
      if (v > max) max = val;
    }
  }
  
  return { min, max };
}

// Helper function to calculate padding for better visualization
function calculatePadding(minVal, maxVal, paddingFactor = 0.1) {
  const range = maxVal - minVal;
  const padding = range * paddingFactor;
  return padding;
}

function buildFrames(X, Y, Z) {
  validateSameShape(X, Y, Z);
  var frames = [];
  // Reduce number of frames for better performance if needed
  const step = Math.ceil(X.length / 300); // Limit to 100 frames maximum
  
  for (var f = 0; f < X.length; f += step) {
    frames.push({
      name: String(f),
      data: [{
        type: "scatter3d",
        mode: "lines+markers",
        x: X[f], y: Y[f], z: Z[f],
          line: {
            color: 'rgb(0, 179, 184)', 
            width: 7
          },

          marker: {
            color: 'rgb(226, 74, 141)',
            size: 4,
            symbol: 'circle',
            opacity: 0.9
          },
      }]
    });
  }
  return frames;
}

function render(divId, frames, frameDurationMs) {
  // Calculate dynamic ranges based on actual data
  const initTrace = frames[0].data[0];

  const sliderSteps = frames.map((fr, i) => ({
    label: String(i),              
    method: "animate",
    args: [[fr.name], {
      mode: "immediate",
      frame: { duration: 0, redraw: true },
      transition: { duration: 0 }
    }]
  }));
  
  // Optimized range calculation
  let allX = [];
  let allY = [];
  let allZ = [];
  
  // Only use a subset of frames for range calculation to improve performance
  const sampleSize = Math.min(frames.length, 100);
  const step = Math.ceil(frames.length / sampleSize);
  
  for (let i = 0; i < frames.length; i += step) {
    const frame = frames[i];
    frame.data.forEach(trace => {
      allX = allX.concat(trace.x);
      allY = allY.concat(trace.y);
      allZ = allZ.concat(trace.z);
    });
  }
  
  // Find min/max values for each axis
  const xRange = findMinMax(allX);
  const yRange = findMinMax(allY);
  const zRange = findMinMax(allZ);
  
  // Add padding for better visualization (10% padding)
  const xPadding = calculatePadding(xRange.min, xRange.max, 0.1);
  const yPadding = calculatePadding(yRange.min, yRange.max, 0.1);
  const zPadding = calculatePadding(zRange.min, zRange.max, 0.1);
  
  // Calculate final ranges with padding
  const finalXRange = [
    xRange.min - xPadding,
    xRange.max + xPadding
  ];
  
  const finalYRange = [
    yRange.min - yPadding,
    yRange.max + yPadding
  ];
  
  const finalZRange = [
    zRange.min - zPadding,
    zRange.max + zPadding
  ];

  // Ensure ranges are not too small (avoid division by zero or very narrow ranges)
  const minRangeSize = 1e-10;
  if (Math.abs(finalXRange[1] - finalXRange[0]) < minRangeSize) {
    finalXRange[0] -= 0.5;
    finalXRange[1] += 0.5;
  }
  if (Math.abs(finalYRange[1] - finalYRange[0]) < minRangeSize) {
    finalYRange[0] -= 0.5;
    finalYRange[1] += 0.5;
  }
  if (Math.abs(finalZRange[1] - finalZRange[0]) < minRangeSize) {
    finalZRange[0] -= 0.5;
    finalZRange[1] += 0.5;
  }

  // Layout configuration
  const layout = {
    scene: {
      aspectmode: "cube",
      xaxis: {
        title: "x",
        autorange: false,
        range: finalXRange,
        tickfont: { family: 'Arial, sans-serif' }
      },
      yaxis: {
        title: "y",
        autorange: false,
        range: finalYRange,
        tickfont: { family: 'Arial, sans-serif' }
      },
      zaxis: {
        title: "z",
        autorange: false,
        range: finalZRange,
        tickfont: { family: 'Arial, sans-serif' }
      },
      bgcolor: getComputedStyle(window.parent.document.body).backgroundColor,
    },
    paper_bgcolor: getComputedStyle(window.parent.document.body).backgroundColor,
    font: { color: getComputedStyle(window.parent.document.body).color },
    margin: { l: 0, r: 0, t: 0, b: 0 },
    sliders: [{
      active: 0,
      x: 0.08,
      len: 0.9,
      y: -0.2,
      xanchor: "left",
      yanchor: "bottom",
      pad: { t: 0, b: 10 },
      currentvalue: { prefix: "Frame: " },
      steps: sliderSteps
    }],
    updatemenus: [{
      type: "buttons",
      direction: "left",
      x: 0.08,
      y: 0,
      xanchor: "left",
      yanchor: "bottom",
      pad: { t: 35, r: 10 },
      showactive: false,
      buttons: [{
        label: "Play",
        method: "animate",
        args: [null, {
          fromcurrent: true,
          mode: "immediate",
          frame: { duration: frameDurationMs, redraw: true },
          transition: { duration: 0 }
        }]
      }, {
        label: "Pause",
        method: "animate",
        args: [[null], {
          mode: "immediate",
          frame: { duration: 0, redraw: false },
          transition: { duration: 0 }
        }]
      }]
    }]
  };
  
  // Theme observer optimization
  let html = window.parent.document.documentElement;
  let prev = html.getAttribute("data-theme");
  let obs = new MutationObserver((mutations) => {
    for (let m of mutations) {
      if (m.type !== "attributes" || m.attributeName !== "data-theme") continue;
      let next = html.getAttribute("data-theme"); 
      let isChanged = (prev === null && next === "dark") || (prev === "dark" && next === null);
      if (isChanged){
        const parentBody = window.parent.document.body;
        const bg = getComputedStyle(parentBody).backgroundColor;
        const fg = getComputedStyle(parentBody).color;
        Plotly.relayout(divId, {
          paper_bgcolor: bg,
          plot_bgcolor: bg,
          "font.color": fg,
          "scene.bgcolor": bg,  
        });
      }
      prev = next;
    }
  });
  obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
  
  // Render with optimizations
  Plotly.newPlot(divId, [initTrace], layout).then(function () {
    Plotly.addFrames(divId, frames);
  });
}