---
layout: post
title: Neural Networks are 'similar' to our Brains
subtitle: it's wrong. stop demonstrating your ignorance
cover-img: 'https://www.researchgate.net/profile/Yopi-Lesnussa/publication/324476486/figure/fig2/AS:614531856355329@1523527220699/The-ANN-Adopt-The-Nerve-Of-Human-Brain.png'
tags:
- thoughts
---

I _really_ dislike the analogy that neural networks 'are similar to' our brains.
It isn't true, nor has it ever been. We have made about 50 years of progress in
neuroscience research since the misnormer happened -- if they would not have
the same name, you would not confuse them in how they work, even by accident.

Yes, originally we knew very little about brains and neurons, and it definitely
showed that (at least initially) AI research was aimed at replicating existing
biological intelligence.
However, it seems that most of the AI research community has shunted anything
we learned from progress in neuroscience since.
This can be seen e.g. by claiming that biological and artificial neural
networks 'are similar' in just about every introductory lecture on machine
learning -- but it only demonstrates disdain for _both_ disciplines.

No, they are not similar. It's a weird quirk of history that they got named
similarly, and we know better now. By not being aware of the differences, you
are only demonstrating your own ignorance.

### Short List of Stark Differences between Biological and Artificial Neural Networks (ANNs):
- **Feedback**: In the brain, for every feedforward connection, there are about
  nine back. So 90% of signals are not 'feedforward' but 'feedback' (or:
  predictive. confirmation bias anyone?). In ANNs, most of the time 100% of
  connections are feedforward
- **Sparse Activation**: at every moment, only about 5% of columns in the
  neocortex are active, and even fewer neurons (afaik e.g. the cerebellum with
  80% of neurons works differently, though I don't know much about it). In
  ANNs, even if a connection is zeroed out, all neuron activations are being
  calculated (except architectures such as pathways, but even they work differently)
- **Plasticity**: biological brains are modified (learn) by activation, and
  have internal state continuously modeling the outer world. ANNs are static in
  their weights when they're not actively being trained
- Biologically, connections are part of plasticity, mostly random and adjust
  themselves when unused. They can cross various layer boundaries (in fact,
  additional layers can grow over time from the same amount of neurons/columns
  due to 'automatic' optimization, and suppression of redundant activation).
- It has been shown that dendrites have some form of computation / 'activation
  function' as well. They can be primed (to activate / predict to activate),
  something without analogue in ANNs. ANN connections are static (they exist,
  or they don't) and can have weights at best, no additional computation /
  prediction / activation / modification.
- Activation potentials in biological neurons are much simpler and have timing
  — there are also ANNs (spiking neural networks) that try to imitate something
  similar, but with limited success. Timing of firing in brains is actually
  extremely important and can mess up just about everything, particularly
  coordination. Ever been drunk? yeah, timings are ever-so-slightly off

{: .box-note}
At best, ANNs are biologically _inspired_ (by our understanding at the time).
