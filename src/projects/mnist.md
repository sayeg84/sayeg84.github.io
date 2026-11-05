---
title: "Simple MNIST Classifier"
excerpt: "Convolutional Neural Network for the image classification problem over the MNIST dataset"
permalink: /projects/mnist/
order: 5
plotly: true
scripts:
  - https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js
  - /assets/js/sims/mnist.js
---

A classical problem in Machine Learning is the accurate classification of [MNIST](http://yann.lecun.com/exdb/mnist/), a dataset of images of handwritten digits. This was a final project what I did in collaboration with Cossio for an Statistical Machine Learning course imparted by [Guillermina Eslava](https://lya.fciencias.unam.mx/eslava/).

You can test the model by writting a digit in the squarebox and pressing the buttons.

<div class="sim mnist" aria-label="Interactive digit classifier">
  <div>
    <canvas id="mnist-canvas" width="280" height="280">Canvas not supported; update your browser.</canvas>
    <div class="sim-controls" style="margin-top: 0.75rem">
      <button type="button" id="mnist-erase">Erase</button>
      <button type="button" id="mnist-classify">Classify</button>
    </div>
  </div>
  <div id="mnist-chart" class="chart"></div>
</div>
