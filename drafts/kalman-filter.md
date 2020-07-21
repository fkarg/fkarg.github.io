---
layout: post
published: false
title: Bayesian Stochastics and Kalman Filter
subtitle: subtitle
tex: true
tags:
- maths
- stochastics
---
Short article description

Short description of how I got interested in this topic, or some other story associated with how I read about it


* TOC
{:toc}


# Basics

## Recap of Probability Theory
In case have read something like [this][intro-prob] or visited a lecture on the
topic, you can skip up to '[Evidence](#evidence)'. For everyone else, this is a
quick refresher to probability theory.

Probabilities don't exist, but they are pretty useful to model the world. In
fact, there are situations in which the most accurate description is with
probabilities.

<!-- Picture dice with equal probabilities -->
Before throwing a dice, we don't know which side he'll land on. But a model
saying that it's 'equal probability' is the most accurate picture of the
situation we can have. It is the most correct _on average_. After all, if we
knew which situatino we'd be in beforehand, we could simply predict _that_
situation and be done with hypothetical alternatives.

### Probability Distributions
<!-- Picture of common probability distributions -->
The immediate next question when dealing with probabilities is 'how are they
distributed?' There are some pretty common ones, but apart from them it could
be anything, really.


### Conditional Probabilities
<!-- Picture showing drastic update of probabilities due to additional condition -->
Sometimes you know partial information already, and you'd like to have the
probability of rain _given_ that it is a cloudy day instead of just the average
probability of rain on any day. So you'd like \\(\mathds{P}(rain|cloudy)\\)
instead of \\(\mathds{P}(rain)\\).


## Bayesian Statistics
If you heard of probabilities before, chances are you heard of bayesian
statistics before as well. Essentially, it's all about this formula:
\\[
\mathds{P}(A|B) = \frac{\mathds{P}(B|A) \times \mathds{P}(A)}{\mathds{P}(B)}
\\]



## Evidence


---
# Modeling Systems
## Static Systems


- Introduction of Stochastics
- Introduction to Bayesian Statistics
- What is 'Evidence' from a statistical perspective

- Statistical Models
- How to get to the basic System description (Vektor-Matrix-Form) -> static system
- dynamic system: additional dependency to internal state
- Markov Chains
- Higher-Order Markov Chains + mapping to first dimension
- Messabbildung
- Complete system: Hidden Markov Model
    - System model A or A_k
    - Measurement model B or B_k
    - state vector Z^x_k
    - output vector Z^y_k
    - Initial state Z^x_0
- Realtime vs Batching:
    - Prediction
    - Filtering
    - Smoothing




<!--
-\-\-
**Footnotes**:
-->
[intro-prob]: http://users.jyu.fi/~geiss/lectures/probability-1.pdf
