---
layout: layouts/page.njk
title: CV
permalink: /cv/
---

## Work Experience

* Research Assistant and PhD student
  * Freie Universitat Berlin.
  * September 2022 -
  * Research and development of Coarse Grained models based on Neural Networks force fields to study protein dynamics.

* Software Development Engineer
  * Altair Engineering.
  * September 2021 - July 2022
  * Part of the Meshing and Geometry team, developing Hypermesh, the main meshing tool of Hyperworks, an program for Finite Element Analysis widely used in the car industry. My work consisted mostly on the mantainence of codebase and implementing new features for mesh post processing.

* Lecturer
  * Faculty of Sciences, UNAM.
  * January 2020 - July 2022
  * Imparted lectures in the Physics Department such as **Computational Physics**, a practical introducion to numerical methods for physics, and **Computagional Algorithms**, an introduction to basic programming. My work consisted on planning a sylllabus and creating all materials for the class, and also imparting lecture twice a week.

* Teacher Assistant
  * Faculty of Sciences, UNAM.
  * January 2018 - December 2019
  * Worked as a teacherin the Physics and Math Department. My work consisted on giving tutorials and grading homework and exams. I took part in courses such as **Calculus 1,2,3** and **Computational Physics**.

## Education

### Bachelor's Degree in Physics

*National Autonomous University of Mexico*

*Faculty of Sciences (August 2013 - May 2019)*

Thesis project on an Ising-like model to try to reproduce [phase transitions in Chalcogenide Glasses](/projects/intermediate/).

### Master's Degree in Mathematics

*National Autonomous University of Mexico*

*Graduate program in Mathematical Sciences (August 2019 - August 2022)*

Worked under supervision of Prof. Atahualpa Kraemer with a project based on applying minimization to see the Locking Transition in 3D polygonal chains.

## Research Internships

<ul>
{%- for item in collections.internships %}
  <li><a href="{{ item.url }}">{{ item.data.title }}</a>, {{ item.data.venue }}. {{ item.data.period }}.</li>
{%- endfor %}
</ul>

## Coding

* Julia (Advanced)
* Python (TensorFlow, PyTorch, Scikit-learn, Pandas, Matplotlib, Networkx) (Advanced)
* C/C++ (Medium)
* Javascript (Basic)
* SQL (PostreSQL) (Basic)
* Java (Basic)

## Publications

<ul>
{%- for item in collections.publications %}
  <li><a href="{{ item.data.paperurl or item.url }}">{{ item.data.title }}</a>. <i>{{ item.data.venue }}</i>, {{ item.date | year }}.</li>
{%- endfor %}
</ul>

## Presentations

<ul>
{%- for item in collections.talks %}
  <li><a href="{{ item.url }}">{{ item.data.title }}</a> ({{ item.data.subtitle }}), {{ item.data.venue }}, {{ item.data.location }} {{ item.date | year }}.</li>
{%- endfor %}
</ul>

## Teaching

<ul>
{%- for item in collections.teaching %}
  <li><a href="{{ item.url }}">{{ item.data.title }}</a>, {{ item.data.venue }} {{ item.data.subtitle }}.</li>
{%- endfor %}
</ul>
