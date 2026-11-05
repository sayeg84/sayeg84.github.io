// Modified lattice gas with a penalty C for every edge that lies on a cycle
// (bachelor's thesis). Edges that are bridges (not on any cycle) are "flexible",
// the rest are "rigid". Open boundary conditions on an n×n square lattice.
(function () {
  const canvas = document.getElementById("lg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const n = 16;

  const $ = (id) => document.getElementById(id);
  const sliders = { temp: $("lg-temp"), mu: $("lg-mu"), J: $("lg-J"), C: $("lg-C") };
  const params = {};
  let colors = {};
  let sys, step;
  let bridges = new Set();

  const lin = (i, j) => i + j * n;
  const edgeKey = (a, b) => (a < b ? a * n * n + b : b * n * n + a);

  // Open-boundary neighbours of every site, precomputed.
  const neigh = [];
  for (let i = 0; i < n; i++) {
    neigh[i] = [];
    for (let j = 0; j < n; j++) {
      const list = [];
      if (i > 0) list.push([i - 1, j]);
      if (i < n - 1) list.push([i + 1, j]);
      if (j > 0) list.push([i, j - 1]);
      if (j < n - 1) list.push([i, j + 1]);
      neigh[i][j] = list;
    }
  }

  function reset() {
    sys = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(2 * Math.random())));
    step = 0;
  }

  // Number of occupied edges that lie on a cycle (= edges - bridges), via Tarjan's bridge-finding.
  function cycleEdges(s, bridgeOut) {
    const N = n * n;
    const adj = Array.from({ length: N }, () => []);
    let edges = 0;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!s[i][j]) continue;
        for (const [a, b] of neigh[i][j]) if (s[a][b]) { adj[lin(i, j)].push(lin(a, b)); edges++; }
      }
    edges /= 2;
    const disc = new Array(N).fill(-1), low = new Array(N).fill(0);
    let time = 0, nBridges = 0;
    function dfs(u, parent) {
      disc[u] = low[u] = time++;
      for (const v of adj[u]) {
        if (disc[v] === -1) {
          dfs(v, u);
          low[u] = Math.min(low[u], low[v]);
          if (low[v] > disc[u]) { nBridges++; if (bridgeOut) bridgeOut.add(edgeKey(u, v)); }
        } else if (v !== parent) {
          low[u] = Math.min(low[u], disc[v]);
        }
      }
    }
    for (let u = 0; u < N; u++) if (disc[u] === -1 && adj[u].length) dfs(u, -1);
    return edges - nBridges;
  }

  function energy(s) {
    let sum = 0;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!s[i][j]) continue;
        let ns = 0;
        for (const [a, b] of neigh[i][j]) ns += s[a][b];
        sum += -params.mu - (params.J / 2) * ns;
      }
    return sum + params.C * cycleEdges(s);
  }

  function readParams() {
    for (const [k, el] of Object.entries(sliders)) {
      params[k] = Number(el.value);
      $(el.id + "-out").textContent = params[k].toFixed(2);
    }
  }

  function readColors() {
    colors = {
      bg: SiteTheme.cssVar("--bg"),
      rigid: SiteTheme.cssVar("--sim-rigid"),
      flexible: SiteTheme.cssVar("--sim-flexible"),
    };
  }

  function draw() {
    bridges = new Set();
    cycleEdges(sys, bridges);
    const w = canvas.width / n;
    const r = w / 3;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!sys[i][j]) continue;
        let allBridges = true;
        for (const [a, b] of neigh[i][j]) {
          if (!sys[a][b]) continue;
          const isBridge = bridges.has(edgeKey(lin(i, j), lin(a, b)));
          allBridges = allBridges && isBridge;
          ctx.strokeStyle = isBridge ? colors.flexible : colors.rigid;
          ctx.beginPath();
          ctx.moveTo((i + 0.5) * w, (j + 0.5) * w);
          ctx.lineTo((a + 0.5) * w, (b + 0.5) * w);
          ctx.stroke();
        }
        ctx.fillStyle = allBridges ? colors.flexible : colors.rigid;
        ctx.beginPath();
        ctx.arc((i + 0.5) * w, (j + 0.5) * w, r, 0, 2 * Math.PI);
        ctx.fill();
      }
  }

  function advance() {
    const i = Math.floor(n * Math.random());
    const j = Math.floor(n * Math.random());
    const e1 = energy(sys);
    sys[i][j] = 1 - sys[i][j];
    const dE = energy(sys) - e1;
    if (!(-dE / params.temp > Math.log(Math.random()))) sys[i][j] = 1 - sys[i][j]; // reject
    step++;
    $("lg-t").textContent = step;
    draw();
    setTimeout(advance, 1);
  }

  Object.values(sliders).forEach((el) => el.addEventListener("input", readParams));
  $("lg-reset").addEventListener("click", reset);
  document.addEventListener("themechange", readColors);

  readParams();
  readColors();
  reset();
  advance();
})();
