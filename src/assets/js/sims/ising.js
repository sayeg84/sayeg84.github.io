// 2D Ising model, Metropolis Monte Carlo on a periodic n×n lattice (home page).
(function () {
  const canvas = document.getElementById("ising-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const n = 50;
  const STEPS_PER_FRAME = 4;

  const $ = (id) => document.getElementById(id);
  const sliders = { temp: $("ising-temp"), B: $("ising-B"), J: $("ising-J") };
  const params = { temp: 4, B: 0, J: 0 };
  let colors = {};
  let sys, step;

  const mod = (x, y) => ((x % y) + y) % y;
  const randomSpin = () => 2 * Math.floor(2 * Math.random()) - 1;

  function reset() {
    sys = Array.from({ length: n }, () => Array.from({ length: n }, randomSpin));
    step = 0;
  }

  function neighSum(i, j) {
    return sys[mod(i + 1, n)][j] + sys[mod(i - 1, n)][j] + sys[i][mod(j + 1, n)] + sys[i][mod(j - 1, n)];
  }

  function readParams() {
    for (const [k, el] of Object.entries(sliders)) {
      params[k] = Number(el.value);
      $(el.id + "-out").textContent = params[k].toFixed(2);
    }
  }

  function readColors() {
    colors = { up: SiteTheme.cssVar("--sim-ising-up"), down: SiteTheme.cssVar("--sim-ising-down") };
  }

  function draw() {
    const w = canvas.width / n;
    ctx.fillStyle = colors.down;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.up;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (sys[i][j] > 0) ctx.fillRect(i * w, j * w, w, w);
  }

  function advance() {
    for (let s = 0; s < STEPS_PER_FRAME; s++) {
      const i = Math.floor(n * Math.random());
      const j = Math.floor(n * Math.random());
      const dE = 2 * sys[i][j] * (params.B + params.J * neighSum(i, j));
      if (-dE / params.temp > Math.log(Math.random())) sys[i][j] *= -1;
      step++;
    }
    $("ising-t").textContent = step;
    draw();
    requestAnimationFrame(advance);
  }

  Object.values(sliders).forEach((el) => el.addEventListener("input", readParams));
  $("ising-reset").addEventListener("click", reset);
  document.addEventListener("themechange", readColors);

  readParams();
  readColors();
  reset();
  advance();
})();
