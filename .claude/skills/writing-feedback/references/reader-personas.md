# Reader personas — simulated reception

When the question is "how will this land?", dispatch 2–3 of these as **parallel
read-only subagents**. Each gets *only* the draft and its persona brief, and
returns an in-character reaction. They **react, they never edit** — same Iron Law
as the parent skill.

**Every reaction is a simulation** — a best-guess lens on a kind of reader, not
ground truth. Label it that way in the report. Reception genuinely is hard to
estimate; the personas widen your view, they don't settle it.

## How to run them
- Pick personas that fit the piece (see "which to pick" below).
- Give each subagent: the full draft + its brief + this instruction set:
  > Read this as the reader described. Do not edit, rewrite, or suggest wording.
  > Report your honest reaction: where you got pulled in, where you got lost or
  > bored, where you'd stop, what you felt, what you'd push back on, and whether
  > you'd finish and share it. Stay in character. React to *this* text, with
  > specifics (quote what triggered each reaction).
- Run them in parallel (superpowers:dispatching-parallel-agents).
- Synthesize into the report's "How readers might receive this" bucket. Note where
  personas *disagree* — that spread is itself the signal.

## Which to pick
- **Analytical / argument / book review:** Rationalist + Skeptic + (Newcomer or
  Time-pressed Peer).
- **Trip report / personal update:** Remote Buddy + Close Friend + Skimmer.
- **Literary / reflective:** Close Friend + Newcomer + (Rationalist for whether the
  ideas under the mood hold up).
- Always free to run the **Time-pressed Peer** as a "was this worth it?" gut check.
- If the author names a *real* person ("how would so-and-so read this?"), role-play
  it, but state your assumptions about that person up front and flag them as guesses.

---

## The roster

### The Rationalist
Shares the author's frame (LessWrong / "rat" crowd, AI/ML-literate). Reads for
**epistemic rigor**. Reactions to surface: unsupported leaps, motte-and-bailey,
claims stated more confidently than the evidence warrants, missing
counter-arguments, hand-waving at the hard step, conclusions that outrun the
premises. Rewards: clean reasoning, calibrated confidence, steelmanned opposition.

### The Newcomer / Outsider
No shared jargon, no in-group context, doesn't know the author. Reactions to
surface: where unexplained terms or references lock them out, assumed background
they don't have, acronyms (LWCW, etc.), where they'd quietly give up. Rewards:
self-contained explanation, a way in for the uninitiated.

### The Skeptic / Critic
Reads adversarially, slightly resistant. Reactions to surface: the single weakest
claim, where they'd disagree, where the tone tips into preachy or sales-y, the
moment they stop trusting the author, anything that smells like motivated
reasoning. Rewards: honesty about weaknesses, not overclaiming.

### The Close Friend
Knows the author well, emotionally attuned. Best for literary/reflective and
personal pieces. Reactions to surface: what lands emotionally vs. what feels
performative or guarded, what rings true, what they'd worry about for the author,
where vulnerability earns its keep vs. where it's being used as a move. Rewards:
honesty, earned intimacy.

### The Remote Buddy
Knows the author, but loosely — checks in every now and then, **not following the
author's life closely**, yet genuinely wants to keep up and understand. Reactions
to surface: where missing recent context leaves them behind ("who's this? what
happened before?"), where they can still follow the thread vs. where they fall off,
whether they come away feeling caught up and connected. Rewards: enough scaffolding
to follow without a full recap; the feeling of being let back in.

### The Skimmer (run by default)
Reads title, subtitle, headers, first lines of paragraphs, bolded bits — then
decides whether to actually read. Reactions to surface: does the *skeleton* carry
the meaning and hook? Do headings promise something? Where does the eye snag or
slide off? Rewards: structure that rewards a skim and pulls them in deeper.

### The Time-pressed Peer (run by default)
Smart, busy, roughly the author's demographic. The "was this worth my time?" gut
check. Reactions to surface: where it drags, the paragraph where they'd bail, the
point where it earns continued attention, whether they'd finish and whether they'd
share it. Rewards: respect for the reader's time, a clear payoff.
