---
title: "Atl subtractive synth"
excerpt: "Basic subtractive synth"
permalink: /projects/atl/
order: 3
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

<iframe style="aspect-ratio: 16 / 9; width: 100%; border: 0;" src="https://www.youtube-nocookie.com/embed/H9ZyKJAXXLc" title="Atl synth demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
