---
title: "Interactive attention test"
permalink: /projects/neuro
collection: portfolio
---

This a basic simulation that can be used to measure the attention capacity of a person. This was developed as a project for [Prof. Alessio Franci](https://sites.google.com/site/francialessioac/).

Change the parameters of the simulation and test how many coherent (i.e. similar in movement) groups of particles can you detect.

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
                width: 80%;
            }
            .textbox{
                width: 40%;
                text-align: center;
            }
        </style>
    </head>
  <meta charset="utf-8">
<div class="row">
    <div style="width:550px;float:left" align="left" id="asd">
        <canvas id="fc" width="550" height="550">
                Canvas not supported; update your browser.
        </canvas>
    </div>
    <div style="width:200px;float:left;padding-left:20px" align="center" id="">
        <div>
            Total number of points = <span id="totalReadout"> 3000   </span> 
            <input type="range" min="100" max="3000" value="3000" id="totalSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class="slider">
            <br>
            Point size =  <span id="sizeReadout">  5   </span> pix
            <br>
            <input type="range" min="1" max="8" step="0.1" value="2" id="sizeSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class="slider">
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
var totalReadout = document.getElementById("totalReadout");
var sizeReadout = document.getElementById("sizeReadout");
var speedReadout = document.getElementById("speedReadout");
var coherenceReadout = document.getElementById("coherenceReadout");
var drift = document.getElementById("driftBox");
var coherentGroups = document.getElementById("coherentGroupsBox");
var total=3000;
var coherence;
var size;
var lambda;
var coherentGroups;
var dtheta;
var N;
var theta;
var rand;
function showAndUpdate() {
    totalReadout.innerHTML = Number(totalSlider.value);
    total=Number(document.getElementById("totalSlider").value);
    sizeReadout.innerHTML = Number(sizeSlider.value);
    size=Number(document.getElementById("sizeSlider").value);
    speedReadout.innerHTML = Number(speedSlider.value)/1000;
    lambda=Number(document.getElementById("speedSlider").value)/1000;
    coherenceReadout.innerHTML = Number(coherenceSlider.value)/100;
    coherence=Number(document.getElementById("coherenceSlider").value)/100;
    dtheta=Number(document.getElementById("driftBox").value)*2*Math.PI/(1000);
    coherentGroups=Number(document.getElementById("coherentGroupsBox").value);
    N=Math.floor(total/coherentGroups);
    theta=2*Math.PI/coherentGroups;
    rand=Math.floor(total*(1-coherence));
}
showAndUpdate();
var theCanvas=document.getElementById("fc");
var context=theCanvas.getContext("2d");
function mod(n, m) {
    return ((n % m) + m) % m;
}
var x=[];
var y=[];
var vx=[];
var vy=[];
var dt=1;
var theta0 = 2*Math.PI/5;
var T=5;
var step=1;
for (i=0;i<3000;i++){
    x.push(Math.ceil(Math.random()*theCanvas.width));
    y.push(Math.ceil(Math.random()*theCanvas.height));
    vx.push(Math.cos(Math.random()*2*Math.PI));
    vy.push(Math.sin(Math.random()*2*Math.PI));
}
function drawPoints(){
    context.clearRect(0,0,theCanvas.width,theCanvas.height);
    context.fillStyle="#000000";
    context.fillRect(0,0,theCanvas.width,theCanvas.height);
    for (i=0;i<total;i++){
        context.beginPath();
        context.arc(x[i],y[i],size,0,2*Math.PI);
        context.fillStyle="#FFFFFF";
        context.fill();
    }
    context.globalCompositeOperation='destination-in';
    context.beginPath();
    context.arc(theCanvas.width/2,theCanvas.width/2,theCanvas.width/2,0,Math.PI*2);
    context.fillStyle="#000000";
    context.closePath();
    context.fill();
    context.globalCompositeOperation='source-over';
}
function movePoints(){
    for (i=0;i<total;i++){
        if (i<rand){
            x[i]=x[i]+vx[i]*dt*lambda;
            y[i]=y[i]+vy[i]*dt*lambda;
            x[i] = mod(x[i],theCanvas.width );
            y[i] = mod(y[i],theCanvas.height );
        } else {
            k=mod(i,coherentGroups);
            x[i]=x[i]+dt*lambda*Math.cos(k*theta+theta0+dt*step*dtheta);    
            y[i]=y[i]+dt*lambda*Math.sin(k*theta+theta0+dt*step*dtheta);
            x[i] = mod(x[i],theCanvas.width );
            y[i] = mod(y[i],theCanvas.height );
        }
    }
    step++;
    drawPoints();
    window.setTimeout(movePoints,dt);
}
movePoints();

</script>