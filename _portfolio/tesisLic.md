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

With \\(L\\) the set of all the edges in cycles over the graph associated to the system. This modification integrated the rigidity of the molecular network into the hamiltonian. For certain values of \\(C\\), the system dended towards configurations where all cycles where avoided, similar to a maximum spanning tree.

<meta charset="utf-8">
  <div class="row">
      <div style="width:450px;float:left;" id="asd">    
        <canvas id="fc" width="450" height="450">
                Canvas not supported; update your browser.
        </canvas>
      </div>
      <div style="width:200px;float:left;text-align: center;" id="">
        <div style="display: inline-block">
            MC step = <span id="tReadout"> 0   </span>  
            <br>
            \\(kT\\)  = <span id="tempReadout"> 0.5   </span> 
            <br>
            <input type="range" min="0.01" max="5" value="0.5" step="0.01" id="tempSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            \\(\mu\\)  = <span id="BReadout"> -1.5   </span> 
            <br>
            <input type="range" min="-3.5" max="0" value="-1.5" step="0.01" id="BSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            \\(J\\) = <span id="JReadout"> 2   </span> 
            <br>
            <input type="range" min="0" max="3" value="2" step="0.01" id="JSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            \\(C\\) = <span id="CReadout"> 0.9   </span> 
            <br>
            <input type="range" min="0" max="1" value="0.9" step="0.01" id="CSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            <br>
            <button type="button" onclick = "resetSys()">Restart</button> 
            <br>                    
      </div>
    </div>
  </div>
<iframe
  src="{{ '/assets/simulations/mod_ising.html' | relative_url }}"
  style="width:100%; height:750px; border:0;"
  loading="lazy">
</iframe>

You can check the source code for the project [here](https://github.com/sayeg84/latticeModels). There was also a [publication](../p/publication/2021-02-01-Microscopic-Model-of-Intermediate-Phase-in-Flexible-to-Rigid-Transition) related to this project.