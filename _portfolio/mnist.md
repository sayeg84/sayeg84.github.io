---
title: "Simple MNIST Classifier"
excerpt: "Convolutional Neural Network for the image classificatio problem over the MNIST dataset"
permalink: /projects/mnist
collection: portfolio
---

A classical problem in Machine Learning is the accurate classification of [MNIST](http://yann.lecun.com/exdb/mnist/), a dataset of images of handwritten digits. This was a final project what I did in collaboration with Cossio for an Statistical Machine Learning course imparted by [Guillermina Eslava](https://lya.fciencias.unam.mx/eslava/).

You can test the model by writting a digit in the squarebox and pressing the buttons.

<div style="float:left;text-align: center;">
<canvas id="canvas" width=280 height=280 style="border:1px solid #000000;">
</canvas>
<br>
<br>  
<button type="button" onclick = "resetCanvas()">Erase</button> 
<br>
<br>  
<button type="button" onclick = "predictValues()">Classify</button> 
</div>
<div id="chart" style="width:450px;height:320px;float:left;padding-left:20px">
</div>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js"></script>
<script src="https://cdn.plot.ly/plotly-2.3.0.min.js"></script>
<script>
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const chartDiv = document.getElementById('chart');
    function loadModel(){
        let model = tf.loadGraphModel('https://raw.githubusercontent.com/sayeg84/sayeg84.github.io/master/files/projects/mnist/model.json');    
        return model;
    }
    let model = loadModel();
    let predTest = [];
    let coord = { x: 0, y: 0 };
    let paint = false;
    window.addEventListener('load', ()=>{     
        document.addEventListener('mousedown', startPainting);
        document.addEventListener('touchstart', startPaintingTouch);
        document.addEventListener('mouseup', stopPainting);
        document.addEventListener('touchend', stopPainting);
        document.addEventListener('mousemove', draw);
        document.addEventListener('touchmove', draw);
        ctx.fillStyle=getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        layout = {title: {
            "text":"Prediction: ?"
            },
                xaxis:{title:"Digit",
                    tickmode:"array",
                    tickvals:[0,1,2,3,4,5,6,7,8,9],
                    ticktext:["0","1","2","3","4","5","6","7","8","9"]
            },
                yaxis:{title:"Log Probability",
                    type:"log",
                    tickvals:[1e-100,1e-80,1e-60,1e-40,1e-20,1],
                    ticktext:["-100","-80","-60","-40","-20","0"],
                    range:[-100,0]
            },
                height:320,
                width: 450,
                marign:{
                    l:0,
                    r:0,
                    t:-5,
                    b:0
                }
            };
        Plotly.newPlot(chartDiv, [{
            x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            y: [1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100],
            type:"bar" 
            }], 
            layout
        );
    });
    function resetCanvas(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle=getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        layout["title"] = "Prediction: ?";
        Plotly.newPlot(chartDiv, [{
            x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            y: [1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100, 1e-100],
            type:"bar" 
            }], 
            layout
        );
    }
    function startPainting(event) {
        paint = true;
        getPosition(event);
    }
    function startPaintingTouch(event) {
        paint = true;
        getPosition(event);
    }
    function getPosition(event) {
        coord.x = event.pageX - canvas.offsetLeft;
        coord.y = event.pageY - canvas.offsetTop;
    }
    function getPositionTouch(event) {
        coord.x = event.touches[0].pageX - canvas.offsetLeft;
        coord.y = event.touches[0].pageY - canvas.offsetTop;
    }
    function stopPainting() {
        paint = false;
    }
    function draw(event){
        if (!paint){
            return;
        }
        ctx.beginPath();
        ctx.lineWidth=20;
        ctx.lineCap = "round";
        ctx.strokeStyle = getComputedStyle(document.body).color;
        ctx.moveTo(coord.x, coord.y);
        getPosition(event);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
    function processImageData(data){
        let arr = [];
        for(i=0;i<280;i++){
            let row = [];
            for(j=0;j<280;j++){
                let val = 0;
                for(l=0;l<3;l++){
                    let index = i*280*4 + j*4 + l;
                    val += (255 - data[index]);
                }
                row.push(val/3);
            }
            arr.push(row);
        }
        let arr2 = [];
        for(i=0;i<28;i++){
            for(j=0;j<28;j++){
                let val = 0;
                for(ki=0;ki<10;ki++){
                    for(kj=0;kj<10;kj++){
                        let iaux = i*10 + ki;
                        let jaux = j*10 + kj;
                        val += arr[iaux][jaux];
                    }
                }
                arr2.push(val/100);
            }
        }
        return arr2;
    }
    function softMax(arr){
        let suma = 0;
        for(i=0;i<arr.length;i++){
            suma += Math.exp(arr[i]);
        }
        let vals = [];
        for(i=0;i<arr.length;i++){
            vals[i] = Math.exp(arr[i])/suma;
        }
        vals = vals.map(val => isNaN(val) ? 1 : val);
        return vals;
    }
    function logSoftMax(arr){
        let suma = 0;
        for(i=0;i<arr.length;i++){
            suma += Math.exp(arr[i]);
        }
        let vals = [];
        for(i=0;i<arr.length;i++){
            vals[i] = arr[i]-Math.log(suma);
        }
        return vals;
    }
    function getData(){
        let data = ctx.getImageData(0,0,280,280).data;
        let number = processImageData(data);
        return number;
    }
    function predictValues(){
        let number = getData();
        number = tf.tensor(number);
        number = number.reshape([-1,784]);
        model.then((res)=>{
            let prediction = softMax(res.predict(number).dataSync());
            let digit = prediction.indexOf(Math.max(...prediction));
            layout["title"] = "Prediction: " + digit;
            Plotly.newPlot(chartDiv, [{
                type:"bar",
                x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                y: prediction,
                }],
                layout
            );
        });
    }
</script>