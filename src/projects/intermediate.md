---
title: "Microscopic model for the intermediate phase"
excerpt: "Simulating a double phase transition in Chalcogenide Glasses"
permalink: /projects/intermediate/
order: 2
math: true
scripts:
  - /assets/js/sims/lattice-gas.js
---

For my bachelors thesis, I created a Lattice Gas model (equivalent to an Ising model) over 2D networks. The model had the following hamiltonian

$$
H(\sigma) = -\mu \sum_{i} \sigma_i - J \sum_{\langle i,j \rangle} \sigma_i \sigma_j  + C \sum_{\langle i,j \rangle \in L} \sigma_i \sigma_j
$$

With \\(L\\) the set of all the edges in cycles over the graph associated to the system. This modification integrated the rigidity of the molecular network into the hamiltonian. For certain values of \\(C\\), the system dended towards configurations where all cycles where avoided, similar to a maximum spanning tree.

<div class="sim" aria-label="Interactive lattice gas simulation">
  <canvas id="lg-canvas" width="450" height="450">Canvas not supported; update your browser.</canvas>
  <div class="sim-controls">
    <div>MC step = <output id="lg-t">0</output></div>
    <label>
      <span>\(kT\) = <output id="lg-temp-out">0.50</output></span>
      <input type="range" id="lg-temp" min="0.01" max="5" step="0.01" value="0.5">
    </label>
    <label>
      <span>\(\mu\) = <output id="lg-mu-out">-1.50</output></span>
      <input type="range" id="lg-mu" min="-3.5" max="0" step="0.01" value="-1.5">
    </label>
    <label>
      <span>\(J\) = <output id="lg-J-out">2.00</output></span>
      <input type="range" id="lg-J" min="0" max="3" step="0.01" value="2">
    </label>
    <label>
      <span>\(C\) = <output id="lg-C-out">0.90</output></span>
      <input type="range" id="lg-C" min="0" max="1" step="0.01" value="0.9">
    </label>
    <div><button type="button" id="lg-reset">Restart</button></div>
  </div>
</div>

You can check the source code for the project [here](https://github.com/sayeg84/latticeModels). There was also a [publication](/publication/2021-02-01-Microscopic-Model-of-Intermediate-Phase-in-Flexible-to-Rigid-Transition/) related to this project.
