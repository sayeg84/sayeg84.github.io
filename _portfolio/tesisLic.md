---
title: "Modelo microscópico para la fase intermedia"
excerpt: "Intento por recuperar desde un modelo microscópico la fase intermedia encontrada en vidrios calcogenoides"
permalink: /proyectos/intermedia
collection: portfolio
---

Para mi tesis de licenciatura, trabajé con un modelo de gas de red (equivalente al modelo de Ising) modificado sobre redes en dos dimensiones. El hamiltoniano del sistema consistía en 
\begin{equation}
H(\sigma) = -\mu \sum_{i} \sigma_i - J \sum_{\langle i,j \rangle} \sigma_i \sigma_j  + C \sum_{\langle i,j \rangle \in L} \sigma_i \sigma_j  
\end{equation}

Con $L$ el conjunto de todos los aristas que formaban ciclos en la gráfica asociada a la red del sistema. Esta modificación pretende tomar en cuenta la rigidez que existiría en un sólido amorfo que tuviera una estructura atómica similiar a la de la red existente en el sistema. Para valores escogidos de $C$, el sistema buscaba una configuración distinta de totalmente rígida o totalmente sin enlaces, llegando a un intermedio similiar a un árbol máximo generador.

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
          width: 60%;
      }
      .textbox{
          width: 0%;
          text-align: center;
      }
  </style>
</head>
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
            $kT$  = <span id="tempReadout"> 0.5   </span> 
            <br>
            <input type="range" min="0.01" max="5" value="0.5" step="0.01" id="tempSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            $\mu$  = <span id="BReadout"> -1.5   </span> 
            <br>
            <input type="range" min="-3.5" max="0" value="-1.5" step="0.01" id="BSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            $J$ = <span id="JReadout"> 2   </span> 
            <br>
            <input type="range" min="0" max="3" value="2" step="0.01" id="JSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            $C$ = <span id="CReadout"> 0.9   </span> 
            <br>
            <input type="range" min="0" max="1" value="0.9" step="0.01" id="CSlider" oninput="showAndUpdate();" onchange="showAndUpdate();" class = "slider">
            <br>
            <br>
            <button type="button" onclick = "resetSys()">Reiniciar</button> 
            <br>                    
      </div>
    </div>
  </div>

<script>
var tempReadout = document.getElementById("tempReadout");
var BReadout = document.getElementById("BReadout");
var JReadout = document.getElementById("JReadout");
var Creadout = document.getElementById("CReadout");
const n = 16;
var B = 0;
var J = 2;
var C = 0.9;
var temp = 0.5;
var bridArray = [];
var edgList = [];
function arrayEquals(arr1,arr2){
    if (arr1.length != arr2.length){
        return false;
    }
    else{
        var flag = true;
        for(let k=0;k<arr1.length;k++){
            flag = flag && (arr1[k]==arr2[k]);
        }
        return flag;
    }
}
function isUndefined(x){
    return typeof(x) === 'undefined';
}
function linearIndex(i,j){
    return i + j*n;
}
function matrixIndex(k){
    var j = Math.floor(k/n);
    var i = k - j*n;
    return [i,j];
}
function randomSpin(){
    var x = Math.floor(2*Math.random());
    return x;
}
function randomConfiguration(){
    var res = [];
    for(let i=0; i<n;i++){
        var aux = [];
        for(let j=0; j<n;j++){
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
    for(let i=0;i<n;i++){
        for(let j=0;j<n;j++){
            sum += sys[i][j];
        }   
    }
    return sum;
}
function sqrLatPerNeighs(i,j){
    return [[mod(i+1,n),j],[mod(i-1,n),j],[i,mod(j+1,n)],[i,mod(j-1,n)]];
}
function sqrLatNeighs(i,j){
    if (i==0 && j==0){
        return [[1,0],[0,1]];
    }
    else if (i==0 && j==n-1){
        return [[1,n-1],[0,n-2]];
    }
    else if (i==n-1 && j==0){
        return [[n-2,0],[n-1,1]];
    }
    else if (i==n-1 && j==n-1){
        return [[n-2,n-1],[n-1,n-2]];
    }
    else if (i==0){
        return [[1,j],[0,j-1],[0,j+1]];
    }
    else if (j==0){
        return [[i-1,0],[i+1,0],[i,1]];
    }
    else if (i==n-1){
        return [[n-2,j],[n-1,j-1],[n-1,j+1]];
    }
    else if (j==n-1){
        return [[i-1,n-1],[i+1,n-1],[i,n-2]];
    }
    else{
        return [[i-1,j],[i+1,j],[i,j-1],[i,j+1]];
    }
}
function makeNeighLatt(){
    var res = [];
    for(let i=0; i<n;i++){
        var aux = [];
        for(let j=0; j<n;j++){
            aux.push(sqrLatNeighs(i,j));
        }
        res[i] = aux;
    }
    return res;
}
var neighLatt = makeNeighLatt();
function makeLinearNeighLatt(){
    var res = [];
    for(let k=0; k<n*n;k++){
        var ip = matrixIndex(k);
        var neighs = neighLatt[ip[0]][ip[1]];
        var linNeighs = [];
        for(let l=0;l<neighs.length;l++){
            linNeighs[l] = linearIndex(neighs[l][0],neighs[l][1]);
        }
        res[k] = linNeighs;
    }
    return res;
}
var linearNeighLatt= makeLinearNeighLatt(); 
function neighSum(i,j){
    var neighs = neighLatt[i][j];
    var sum = 0;
    for(let k=0;k<neighs.length;k++){
        sum += sys[neighs[k][0]][neighs[k][1]];
    }
    return sum;
}
function dfs(i,visited,parent,low,disc,edgList){
    visited[i] = true;
    disc[i] = count;
    low[i] = count;
    count = count + 1;
    for(let k=0;k<edgList[i].length;k++){
        var j = edgList[i][k];
        if (!visited[j]){
            parent[j] = i;
            dfs(j,visited,parent,low,disc,edgList);
            low[i] = Math.min(low[j],low[i]);            
            if (low[j] > disc[i]){
                brid = brid +1;
                bridArray.push([i,j]);
            }
        }
        else if (j != parent[i]) {
            low[i] = Math.min(low[i],disc[j]);
        }
    }
}
function cycles(sys){
    count = 0;
    edgList = [];
    for(let i=0;i<n*n;i++){
        var aux = [];
        var indx_i = matrixIndex(i);
        for(let j=0;j<linearNeighLatt[i].length;j++){
            var k = linearNeighLatt[i][j];
            var indx_k = matrixIndex(k);
            if (sys[indx_i[0]][indx_i[1]]==1 && sys[indx_k[0]][indx_k[1]]==1){
                aux.push(k);
            }
        }
        edgList.push(aux);
    }
    visited = [];
    for(let i=0;i<n*n;i++) {
        visited.push(false);
    }
    disc = [];
    for(let i=0;i<n*n;i++) {
        disc.push(10000000);
    }
    low = [];
    for(let i=0;i<n*n;i++) {
        low.push(10000000);
    }
    parent = [];
    for(let i=0;i<n*n;i++) {
        parent.push(0);
    }
    brid = 0;
    bridArray = [];
    for(let i=0;i<n*n;i++) {
        if (!visited[i]){
            dfs(i,visited,parent,low,disc,edgList);
        }
    }
    var normal = 0;
    for(let i=0;i<n*n;i++){
        normal += edgList[i].length;
    }
    return normal/2 - brid;
}
function energy(sys){
    var sum = 0;
    for(let i=0;i<n;i++){
        for(let j=0;j<n;j++){
            sum += sys[i][j]*(-B - J/2*neighSum(i,j));
        }   
    }
    return sum + C*cycles(sys);
}
function randomLocation(){
    var i = Math.floor(n*Math.random());
    var j = Math.floor(n*Math.random());
    return [i,j];
}
function deltaEner(i,j){
    var newSys = [];
    for(let l=0;l<n;l++){
        var aux = [];
        for(let k=0;k<n;k++){
            aux.push(sys[l][k]);
        }
        newSys.push(aux);   
    }
    newSys[i][j] = 1-newSys[i][j]; 
    var e1 = energy(sys);
    var e2 = energy(newSys);
    return e2-e1;
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
    CReadout.innerHTML = twoDigit(Number(CSlider.value));
    C=Number(document.getElementById("CSlider").value);
}
function resetSys(){
    sys = randomConfiguration();
    step = 0;
}
showAndUpdate();
var theCanvas=document.getElementById("fc");
var context=theCanvas.getContext("2d");
function drawPoints(){
    var rigidc = "#00203FFF";
    var flexc = "#ADEFD1FF";
    context.clearRect(0,0,theCanvas.width,theCanvas.height);
    context.fillStyle="#FFFFFF";
    context.fillRect(0,0,theCanvas.width,theCanvas.height);
    var w = theCanvas.width/n;
    var h = theCanvas.height/n;
    var r = Math.min(w,h)/3;
    var ang = 2*Math.PI
    for(let i=0;i<n;i++){
        for(let j=0;j<n;j++){
            if (sys[i][j] > 0){
                var rigid = true; 
                for(let k=0;k<neighLatt[i][j].length;k++){
                    context.strokeStyle=rigidc;
                    var pos = neighLatt[i][j][k];
                    if (sys[pos[0]][pos[1]] > 0){
                        context.beginPath();
                        context.lineWidth = 4;
                        context.moveTo((i+0.5)*w, (j+0.5)*h);
                        context.lineTo((pos[0]+0.5)*w, (pos[1]+0.5)*h);
                        context.stroke();
                        var e1 = linearIndex(i,j);
                        var e2 = linearIndex(pos[0],pos[1]);
                        test1 = !isUndefined(bridArray.find(x => arrayEquals(x,[e1,e2])));
                        test2 = !isUndefined(bridArray.find(x => arrayEquals(x,[e2,e1])));
                        rigid = rigid && (test1 || test2)
                        if (test1 || test2){
                            context.strokeStyle=flexc;
                            context.beginPath();
                            context.lineWidth = 4;
                            context.moveTo((i+0.5)*w, (j+0.5)*h);
                            context.lineTo((pos[0]+0.5)*w, (pos[1]+0.5)*h);
                            context.stroke();
                        }
                    }
                }
                if (rigid){
                    context.fillStyle=flexc;
                }
                else{
                    context.fillStyle=rigidc;
                }
                context.beginPath();
                context.arc((i+0.5)*w,(j+0.5)*h,r,0,ang);
                context.fill();
            }
        }
    }
}
function movePoints(){
    var aux = randomLocation();
    var i = aux[0];
    var j = aux[1];
    var p = deltaEner(i,j);
    var r = Math.random();
    if (-p/temp > Math.log(r)) {
        sys[i][j] = 1-sys[i][j] 
    }
    step++;
    tReadout.innerHTML = step;
    drawPoints();
    window.setTimeout(movePoints,1);
}
movePoints();
</script>


El código del proyecto se puede ver en [github](https://github.com/sayeg84/latticeModels). El proyecto creció lo suficiente para generar una [publicación](../publicaciones/2021-microscopic)