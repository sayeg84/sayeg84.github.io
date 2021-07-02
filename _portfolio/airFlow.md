---
title: "Túnel de viento para alas de Joukowsky"
excerpt: "Simulación de un túnel de viento con un obstáculo de geometría complicada"
permalink: /proyectos/viento
collection: portfolio
---

Se resolvieron las ecuaciones de Navier-Stokes para las condiciones planteadas por un túnel de viento rectangular. Se resolvió mediante el método de paso fraccionario, utilizando una discretización de elementos finitos. La discretización del dominio se hizo a partir de una triangulación aleatoria mediante la librería [Triangulate](https://www.cs.cmu.edu/~quake/triangle.html). Fuera de la triangulación, el código se programó desde 0 en el lenguaje Julia. 

Para un obstáculo circular, no hay mucha estabilidad:

![circular](../files/proyectos/viento/Uspeed_circle.gif)

Mientras que una ala de Joujowsky presenta muy buena estabilidad:

![joukowsky](../files/proyectos/viento/Uspeed_joukowski.gif)

Se puede acceder al código del proyecto en el siguiente [repositorio de github](https://github.com/sayeg84/windTunnel)
