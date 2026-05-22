---
title: "Atl subtractive synth"
excerpt: "Basic subtractive synth "
permalink: /projects/atl
collection: portfolio
---

To become familiar with synthesizers and with [MaxMsp](https://cycling74.com/products/max), I tried to build a basic
systractive syntesizer.

Some features of the architecture:
- Midi interface independent of the synth, allowing full adaptation for any midi controller.
- 3 oscillators with Saw,Square,Triangle and Sine wave option, detune and PWM.
- Multistate Filter (low-pass, high-pass band-pass and notch).
- Amp and Filter ADSR envelope with curve and polarity selection. 
- 3 LFOs mapped to filter cutoff,  vibrato and tremolo.
- Stereo delay and reverb (via freeverb2 implementation).
- Oscilloscope and spectroscope for optimal visualization.

You can watch a demo here:

<iframe width="560" height="315" src="https://www.youtube.com/embed/H9ZyKJAXXLc?si=4X3Tou4Nmf3tvp5r" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>