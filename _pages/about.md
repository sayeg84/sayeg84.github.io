---
permalink: /
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---




<head>
  <style>
      /* containers */
      .column {
        float: left;
        width: 50%;
      }
      .row::after {
        content: "";
        clear: both;
        display: table;
      } 
      .slider{
          width: 70%;
      }
      .textbox{
          width: 0%;
          text-align: center;
      }
  </style>
</head>
<meta charset="utf-8">
  <div class="row">
      <div style="width=450px;float:left;" align="center" id="asd">    
        <canvas id="fc" width="450" height="450">
                Canvas not supported; update your browser.
        </canvas>
      </div>
      <div style="width=200px;float:left;text-align: center;" align="center" id="">
        <div style="display: inline-block">
            t = <span id="tReadout"> 0   </span>  
            <br>
            kT (aleatoreidad) = <span id="tempReadout"> 4   </span> 
            <br>
            <input type="range" min="0.01" max="5" value="4" step="0.01" id="tempSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            B (dirección) = <span id="BReadout"> 0   </span> 
            <br>
            <input type="range" min="-3" max="3" value="0" step="0.01" id="BSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            J (interacción) = <span id="JReadout"> -2   </span> 
            <br>
            <input type="range" min="-3" max="3" value="0" step="0.01" id="JSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            <br>
            <button type="button" onclick = "resetSystem()">Reiniciar</button> 
            <br>                    
      </div>
    </div>
  </div>

<script >
var tempReadout = document.getElementById("tempReadout");
var BReadout = document.getElementById("BReadout");
var JReadout = document.getElementById("JReadout");
var speedReadout = document.getElementById("speedReadout");
const n = 50;
var B = 0;
var J = -2;
var temp = 4;
function randomSpin(){
    var x = Math.floor(2*Math.random());
    return 2*x-1
}
function randomConfiguration(){
    var res = [];
    for(i=0; i<n;i++){
        var aux = [];
        for(j=0; j<n;j++){
            aux.push(randomSpin());
        }
        res[i] = aux;
    }
    return res;
}
var sys = randomConfiguration();
var step = 0;
function mod(x,y){
    return ((x % y) + y)%y;
}

function mag(){
    var sum = 0;
    for(i=0;i<n;i++){
        for(j=0;j<n;j++){
            sum += sys[i][j];
        }   
    }
    return sum;
}

function sqrLatPerNeighs(i,j){
    return [[mod(i+1,n),j],[mod(i-1,n),j],[i,mod(j+1,n)],[i,mod(j-1,n)]];
}
function neighSum(i,j){
    var neighs = sqrLatPerNeighs(i,j);
    var sum = 0;
    for(k=0;k<neighs.length;k++){
        sum += sys[neighs[k][0]][neighs[k][1]]
    }
    return sum;
}
function energy(){
    var sum = 0;
    for(i=0;i<n;i++){
        for(j=0;j<n;j++){
            sum += sys[i][j]*(-B - J/2*neighSum(i,j));
        }   
    }
    return sum;
}
function randomLocation(){
    var i = Math.floor(n*Math.random());
    var j = Math.floor(n*Math.random());
    return [i,j];
}
function deltaEner(i,j){
    var aux = neighSum(i,j);
    var delta = 2*sys[i][j]*(B + J *aux);
    return delta;
}
function twoDigit(x){
    return (Math.round(x * 100) / 100).toFixed(2);
}
function showAndUpdate(){
    tempReadout.innerHTML = twoDigit(Number(tempSlider.value));
    temp=Number(document.getElementById("tempSlider").value);    
    BReadout.innerHTML = twoDigit(Number(BSlider.value));
    B=Number(document.getElementById("BSlider").value);
    JReadout.innerHTML = twoDigit(Number(JSlider.value));
    J=Number(document.getElementById("JSlider").value);
}
function resetSystem(){
    sys = randomConfiguration();
    step = 0;
}
showAndUpdate();
var theCanvas=document.getElementById("fc");
var context=theCanvas.getContext("2d");
function drawSystem(){
    context.clearRect(0,0,theCanvas.width,theCanvas.height);
    context.fillStyle="#CBCE91";
    context.fillRect(0,0,theCanvas.width,theCanvas.height);
    var w = theCanvas.width/n;
    var h = theCanvas.height/n;
    for (i=0;i<n;i++){
        for (j=0;j<n;j++){
            if (sys[i][j] > 0){
                context.beginPath();
                context.rect(i*w,j*h,w,h);
                context.fillStyle="#76528B";
                context.fill();
            }
        }
    }
}
function advance(){
    var aux = randomLocation();
    var i = aux[0];
    var j = aux[1];
    var p = deltaEner(i,j);
    var r = Math.random();
    if (-p/temp > Math.log(r)) {
        sys[i][j] = -1*sys[i][j] 
    }
    step++;
    tReadout.innerHTML = step;
    drawSystem();
    window.setTimeout(advance,1);
}
advance();
</script>

&nbsp;


# Acerca de mí

Soy estudiante de Maestría en el Posgrado en Ciencias Matemáticas de la UNAM. Mi tutor es [Atahualpa Kraemer](http://www.fciencias.unam.mx/directorio/41583), del Departamento de Física de la Facultad de Ciencias. Antes de eso, estudié Física en la Facultad de Ciencias y Atahulapa también fue mi asesor de Tesis.

Mis principales áreas de interés son la física computacional aplicada a mecánica estadística. En particular, me interesan los sistemas discretos simples (modelos tipo Ising, cadenas poliméricas en una red) y los sistemas continuos de muchos cuerpos (dinámica molecular). Más reciéntemente, estoy interesado en como se puede utilizar el aprendizaje estadístico para mejorar las simulaciones. Los principales lenguajes de programación en los que trabajo son Julia y Python. 

En un plano más personal, me gusta toda la música, aunque principalmente escucho música electrónica. 

No tengo un lugar en dónde estar en Ciudad Universitaria, por lo que la única manera de contactarme es mediante mis correos electrónicos: [sayeg@ciencias.unam.mx](mailto:sayeg@ciencias.unam), [sayeg84@gmail.com](mailto:sayeg84@gmail.com)

# Página

Esta página es personal, creada utilizando GitHub Pages a partir de una plantilla disponible [aquí](https://github.com/academicpages)



