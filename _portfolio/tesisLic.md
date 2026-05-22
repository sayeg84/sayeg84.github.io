---
title: "Microscopic model for the intermediate phase"
excerpt: "Simulating a double phase transition in Chalcogenide Glasses"
permalink: /projects/intermediate
collection: portfolio
---

For my bachelors thesis, I created a Lattice Gas model (equivalent to an Ising model) over 2D networks. The model had the following hamiltonian
\begin{equation}
H(\sigma) = -\mu \sum_{i} \sigma_i - J \sum_{\langle i,j \rangle} \sigma_i \sigma_j  + C \sum_{\langle i,j \rangle \in L} \sigma_i \sigma_j  
\end{equation}

With \(L\) the set of all the edges in cycles over the graph associated to the system. This modification integrated the rigidity of the molecular network into the hamiltonian. For certain values of \(C\), the system dended towards configurations where all cycles where avoided, similar to a maximum spanning tree.

<iframe
  src="{{ '/assets/simulations/mod_ising.html' | relative_url }}"
  style="width:100%; height:750px; border:0;"
  loading="lazy">
</iframe>

You can check the source code for the project [here](https://github.com/sayeg84/latticeModels). There was also a [publication](../p/publication/2021-02-01-Microscopic-Model-of-Intermediate-Phase-in-Flexible-to-Rigid-Transition) related to this project.