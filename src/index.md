---
layout: layouts/base.njk
permalink: /
excerpt: "About me"
scripts:
  - /assets/js/sims/ising.js
---

<div class="profile">
  <img src="{{ site.author.avatar }}" alt="Photo of {{ site.author.name }}">
  <div>
    <h1>{{ site.author.name }}</h1>
    <p>{{ site.author.bio }} {{ site.author.location }}.</p>
    <div class="links">{% for link in site.links %}<a href="{{ link.url }}">{{ link.name }}</a>{% endfor %}</div>
  </div>
</div>

<div class="sim" aria-label="Interactive Ising model simulation">
  <canvas id="ising-canvas" width="450" height="450">Canvas not supported; update your browser.</canvas>
  <div class="sim-controls">
    <div>t = <output id="ising-t">0</output></div>
    <label>
      <span>kT (randomness) = <output id="ising-temp-out">4.00</output></span>
      <input type="range" id="ising-temp" min="0.01" max="5" step="0.01" value="4">
    </label>
    <label>
      <span>B (direction) = <output id="ising-B-out">0.00</output></span>
      <input type="range" id="ising-B" min="-3" max="3" step="0.01" value="0">
    </label>
    <label>
      <span>J (interaction) = <output id="ising-J-out">0.00</output></span>
      <input type="range" id="ising-J" min="-3" max="3" step="0.01" value="0">
    </label>
    <div><button type="button" id="ising-reset">Restart</button></div>
  </div>
</div>

## About me

I am a PhD Student under the supervision of [Cecilia Clementi](https://www.physik.fu-berlin.de/en/einrichtungen/ag/ag-clementi/index.html) at the [IMPRS-BAC](https://www.molgen.mpg.de/IMPRS). Before that, I did my Bachelor's in Physics and a Master's in Math at the National Autonomous University of Mexico (UNAM) under the supervision of [Atahualpa Kraemer](http://www.fciencias.unam.mx/directorio/41583).

My main research area is the simlation of biological macromolecules using Computational Statistical Mechanics and Machine Learning. I am also interested in Artificial Intelligence, Numerical Analysis, Complex Systems and Computability Theory.

On a personal side, most of my hobbies are Art-related: Music (Spotify ranks my favorite genres as Hip Hop, Electronica and Experimental), Films and Books. I also enjoy discussing politics. Se habla español.

You can contact me through email:

- sayeg84 [at] gmail [dot] com
- sayeg84 [at] zedat [dot] fu-berlin [dot] de
- sayeg [at] molgen [dot] mpg [dot] de

## This website

This is a personal academic page built with [Eleventy](https://www.11ty.dev/). The source is [on GitHub](https://github.com/sayeg84/sayeg84.github.io).
