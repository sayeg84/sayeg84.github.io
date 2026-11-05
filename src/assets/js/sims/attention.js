// Random-dot kinematogram for the interactive attention test (neuro project).
// A fraction `coherence` of the dots move in one of `groups` coherent directions
// that slowly rotate (drift); the rest move randomly. Black disc by design, so
// it looks the same in light and dark mode.
(function () {
  const canvas = document.getElementById("att-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const MAX = 3000;
  const W = canvas.width, H = canvas.height;
  const theta0 = (2 * Math.PI) / 5;

  const $ = (id) => document.getElementById(id);
  let total, size, speed, coherence, groups, dtheta, theta, nRandom;
  let step = 1;

  const mod = (a, m) => ((a % m) + m) % m;
  const x = [], y = [], vx = [], vy = [];
  for (let i = 0; i < MAX; i++) {
    x.push(Math.random() * W);
    y.push(Math.random() * H);
    vx.push(Math.cos(Math.random() * 2 * Math.PI));
    vy.push(Math.sin(Math.random() * 2 * Math.PI));
  }

  function readParams() {
    total = Number($("att-total").value);
    size = Number($("att-size").value);
    speed = Number($("att-speed").value) / 1000;
    coherence = Number($("att-coherence").value) / 100;
    groups = Math.max(1, Math.floor(Number($("att-groups").value) || 1));
    dtheta = (Number($("att-drift").value) * 2 * Math.PI) / 1000;
    theta = (2 * Math.PI) / groups;
    nRandom = Math.floor(total * (1 - coherence));
    $("att-total-out").textContent = total;
    $("att-size-out").textContent = size;
    $("att-speed-out").textContent = speed;
    $("att-coherence-out").textContent = coherence;
  }

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      ctx.moveTo(x[i] + size, y[i]);
      ctx.arc(x[i], y[i], size, 0, 2 * Math.PI);
    }
    ctx.fill();
    // Keep only a central disc.
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  function move() {
    for (let i = 0; i < total; i++) {
      if (i < nRandom) {
        x[i] += vx[i] * speed;
        y[i] += vy[i] * speed;
      } else {
        const ang = (i % groups) * theta + theta0 + step * dtheta;
        x[i] += speed * Math.cos(ang);
        y[i] += speed * Math.sin(ang);
      }
      x[i] = mod(x[i], W);
      y[i] = mod(y[i], H);
    }
    step++;
    draw();
    setTimeout(move, 1);
  }

  ["att-total", "att-size", "att-speed", "att-coherence"].forEach((id) => $(id).addEventListener("input", readParams));
  ["att-groups", "att-drift"].forEach((id) => $(id).addEventListener("change", readParams));

  readParams();
  move();
})();
