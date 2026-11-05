---
title: "Interactive attention test"
excerpt: "Random-dot simulation to measure how many coherent groups of particles a person can track"
permalink: /projects/neuro/
order: 4
scripts:
  - /assets/js/sims/attention.js
---

This a basic simulation that can be used to measure the attention capacity of a person. This was developed as a project for [Prof. Alessio Franci](https://sites.google.com/site/francialessioac/).

Change the parameters of the simulation and test how many coherent (i.e. similar in movement) groups of particles can you detect.

<div class="sim" aria-label="Interactive attention test">
  <canvas id="att-canvas" width="550" height="550">Canvas not supported; update your browser.</canvas>
  <div class="sim-controls">
    <label>
      <span>Total number of points = <output id="att-total-out">3000</output></span>
      <input type="range" id="att-total" min="100" max="3000" value="3000">
    </label>
    <label>
      <span>Point size = <output id="att-size-out">2</output> px</span>
      <input type="range" id="att-size" min="1" max="8" step="0.1" value="2">
    </label>
    <label>
      <span>Maximum speed = <output id="att-speed-out">0.5</output> px/s</span>
      <input type="range" id="att-speed" min="1" max="5000" value="500">
    </label>
    <label>
      <span>Coherence = <output id="att-coherence-out">0.8</output></span>
      <input type="range" id="att-coherence" min="50" max="100" value="80">
    </label>
    <label>
      <span>Coherent groups</span>
      <input type="number" id="att-groups" min="1" max="20" value="3">
    </label>
    <label>
      <span>Drift (rad / s)</span>
      <input type="number" id="att-drift" step="0.1" value="1">
    </label>
  </div>
</div>
