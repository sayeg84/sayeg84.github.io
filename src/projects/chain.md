---
title: "Chain unlocking"
excerpt: "Global minimization for unlocking geometrical chains"
permalink: /projects/chain/
order: 1
plotly: true
scripts:
  - /assets/js/sims/chain.js
---

For my master thesis, I worked on a computational geometry problem, about applying optimization methods for untying knotted chains (i.e. segments of lines).

<div class="plot chain-plot" data-src="/assets/simulations/data/finalPolyEightVeryReduced"><p class="plot-status">Loading animation…</p></div>

While continuous optimization methods could be applied without problem to large, detailed chains consisting on many links, smaller chains couldn't be easy to treat as the traditional methods would not avoid intersections. The crossing of the line segments had to be carefully detected and metaheuristic methods for optimization were more appropriate.

<div class="plot chain-plot" data-src="/assets/simulations/data/needleTrajReduced"><p class="plot-status">Loading animation…</p></div>

You can check the source code for the project [here](https://github.com/sayeg84/chainUnlocking). My thesis can be consulted [here](https://tesiunam.dgb.unam.mx/cgi-bin/koha/opac-detail.pl?biblionumber=826069).
