---
title: "Chain unlocking"
excerpt: "Global minimization for unlocking geometrical chains"
permalink: /projects/chain
collection: portfolio
---

For my master thesis, I worked on a computational geometry problem, about applying optimization methods for untying knotted chains (i.e. segments of lines). 

<iframe
  src="{{ '/assets/simulations/plot_curve.html' | relative_url }}"
  style="width:900px; height:700px; border:0;"
  loading="lazy">
</iframe>
While continuous optimization methods could be applied without problem to large, detailed chains consisting on many links, smaller chains couldn't be easy to treat as the traditional methods would not avoid intersections. 

The crossing of the line segments had to be carefully detected and metaheuristic methods for optimization were more appropriate.
<iframe
  src="{{ '/assets/simulations/plot_knot.html' | relative_url }}"
  style="width:900px; height:700px; border:0;"
  loading="lazy">
</iframe>  

You can check the source code for the project [here](https://github.com/sayeg84/chainUnlocking). My thesis can be consulted [here](https://tesiunam.dgb.unam.mx/cgi-bin/koha/opac-detail.pl?biblionumber=826069)