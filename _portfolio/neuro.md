---
title: "Pruebas neurológicas interactivas"
excerpt: "Un conjunto de pruebas neurológicas para evaluar la atención de un individuo"
permalink: /proyectos/neuro
collection: portfolio
---

Durante mi servicio social, trabajé como asistente del [Prof. Alessio Franci](https://sites.google.com/site/francialessioac/) en la UNAM. Entre muchos trabajos, ayudé a programar una simple utilizada por él para intentar medir la capacidad de atención de una persona.

<head>
        <style>
            /* containers */
            .column {
              float: left;
              width: 50%;
            }
            /* clearing after containers */
            .row::after {
              content: "";
              clear: both;
              display: table;
            } 
            .slider{
                width: 50%;
            }
            .textbox{
                width: 30%;
                text-align: center;
            }
        </style>
    </head>
  <meta charset="utf-8">
<div class="row">
    <div class="column" align="left" id="asd">
        <canvas id="fc" width="450" height="450">
                Canvas not supported; update your browser.
        </canvas>
    </div>
    <div class="column" align="center" id="">
        <div>
            Total number of points = <span id="totalReadout"> 3000   </span> 
            <input type="range" min="100" max="3000" value="3000" id="totalSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class="slider">
            <br>
            Point size =  <span id="sizeReadout">  5   </span> pix
            <br>
            <input type="range" min="1" max="5" step="0.1" value="2" id="sizeSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class="slider">
            <br>
            Maximum speed = <span id="speedReadout"> 0.5  </span> pix/s
            <br>
            <input type="range" min="1" max="5000" value="500" id="speedSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class="slider">
            <br>
            Coherence = <span id="coherenceReadout"> 0.5  </span> 
            <br>
            <input type="range" min="50" max="100" value="80" id="coherenceSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class="slider">
            <br>
            Coherent groups:
            <br>
            <input type="text" id="coherentGroupsBox" value="3" onchange="showAndUpdate();" class="textbox">
            <br>
            Drift (rad / s):
            <br>
            <input type="text" id="driftBox" value="1" onchange="showAndUpdate();" class="textbox">
        </div>
    </div>
</div>
<script>
simulationNeuro()
</script>