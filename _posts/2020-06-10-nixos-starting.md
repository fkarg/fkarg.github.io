---
layout: post
published: true
title: What I Wish I Knew When Learning NixOS
tags:
  - setup
---
So I kind of involuntarily switched to NixOS recently. This is the story how
this happened and a couple things I wish I knew when switching.


* TOC
{:toc}


# Introduction
This is not about super-low-level NixOS information, as you will find that
primarily [here](https://nixos.org/learn.html). Rather, while talking about my
situation I want to help you get to know a couple resources that I wish I knew
when starting out, as my initial workarounds where ... sub-optimal. If you just
want to know my thoughts about NixOS, you might want to jump to the
[conclusion](#conclusion).

It might be an interesting story for you even if you don't know what NixOS is.
There are multiple explanations to be found across the web. I kind of like
[this][nixos-explained] one, though prior knowledge about Operating Systems and
Linux in general are assumed.

## Wanting to test NixOS
I wanted to test NixOS for the longest time. After all, one social circle of
mine was _entirely_ on NixOS. So I knew a lot of the concepts beforehand,
_theoretically_. This helped, but led to more detailed frustrations - since I
understood what is going wrong on a higher level while not knowing how to fix
it on the lower one, where it actually happened.

## First Encounter
Regardless, I created a boot-stick and installed NixOS on my desktop-computer.
I booted with a super-minimalist configuration and was immediately thrown off
because I had no idea how to install packages. More precisely: I knew that it
would be possible to install them globally by including them in the
`configuration.nix`, and locally by `nix-env -iA nixos.<packagename>`. But
which one is the correct one for which packages? How do I configure my
environment? How do I include these configurations in the `configuration.nix`?
After being somewhat overwhelmed, I refrained from starting the desktop
computer for some time.

So my first encounter did not exactly go well. It felt similar to having
'burnt' myself once, and while I knew that I needed to understand and configure
it more before I could actually use the computer, I was avoiding it
continuously. So what changed? How did I actually 'switch' to NixOS?

## Only NixOS
My Laptop crashed and burnt. Or, well, not exactly. For some reason, it did not
boot. At first, it seemed like just part of the boot section was corrupted. So
I tried to fix that. Didn't work. Tried some more things. Didn't work. Did a
backup, and tried to install a new OS. I slightly panicked and just wanted a
working OS. I tried Ubuntu first. Then Linux Mint, Debian, and NixOS. None
worked. They all failed to install the bootloader - maybe due to the same
reason it previously failed to start. I already suspected the SSD. Regardless,
I had two presentations to prepare, and they were more critical than fixing my
computer.

As I was sitting in our student council room (I'm well-known there) already,
and several people were aware of what I was trying to do, I just told them: 'I
can't figure out why installing an OS on this laptop just does not work.' There
were three people ready for the challenge. I started to prepare for the
presentation I was supposed to hold in two hours, somewhat unaware of what was
happening to my laptop. At some point, just before I needed to go, they were
successful: 'You now have NixOS'. It was among the bootsticks I had with me,
after all. I held the presentation first, I had no time to start the computer
yet.

# Learning NixOS
Now both of my computers had NixOS, and I had no clue on how to work with it. I
had a somewhat working computer and knew how to use `nix-env -iA
nixos.<packagename>`, so this got me started. And I somehow started to manually
copy and configure dotfiles again. While it worked somewhat, it just felt so
_wrong_. I needed to hold and build another presentation, this time with LaTeX.
On an operating system where I was foreign and had no idea what the package is
called. So I googled it.

From here on, my experiences with NixOS were mostly pleasent. I expected some
sort of hassle after installing LaTeX, some package missing to actually build
it, some cryptic error message. It's _always_ like this when building a new
project. Not this time. Installing LaTeX took a few minutes but than I was
able to build the presentation again, just two hours before we were supposed to
start the presentation. I felt immense relief, to say the least. Everything
would have worked out even if this did not work, but we wanted to change some
small things before actually presenting.


## Packages
Even though googling how certain packages were called worked quite well, it was
pretty clear that this is not the way it was supposed to work. I'm still not
sure how, but at some point I became aware of
[https://nixos.org/nixos/packages.html](https://nixos.org/nixos/packages.html),
the actual searchable package repository. I bookmarked it immediately. This
considerably improved both my speed and confidence when searching for packages.

A pleasen surprise what that a couple of packages from my setup which were not
packaged yet for Ubuntu (`ripgrep` or `broot`) were just immediately available
as a package. And not just those, also some plugins or other packages which
supposedly required a different package manager first (`cargo` or `pip`) were
directly available through nix. [Configuration](#options) was as well. Things
were off to a really good start.

(I learned about `nix search <pkgname>` today. It does basically the same on
the command line.)

## Local Configs
I was under the perception that the whole OS configuration is _only_ determined
by the `configuration.nix`. Even though you _can_ deploy your local
configuration files / dotfiles through NixOS, it might be overkill - Especially
so when just starting out. Treating it just like any other new Linux
installation would have saved me a bit of trouble and the feeling that I was
just doing something wrong.


## Manual
In my understanding, the [NixOS Manual](https://nixos.org/nixos/manual/) is
sort of a mostly static though living document with most of 'available' and
up-to-date knowledge about NixOS. This does not make it the best place to learn
about Nix and NixOS, but it is a good place to find answers for specific
questions. Since I wanted to learn more about NixOS, I started reading through
parts of the manual and in other places in the internet. Frequently, the manual
was referenced or linked, and sometimes, Nix-Pills where mentioned.

## Nix-Pills
The [Nix Pills][nix-pills] are something like the introduction to the 'secret
knowledge' of Nix, or at least it felt like it. They were written originally as
a series of blog posts exploring and explaining the inner workings of all
Nix-relevant concepts. They have been updated accordingly, but most concepts
work still the same. If you are interested in using NixOS, I recommend you to
at least skim over the content.

## Nix (The Language)
All the configuration (`*.nix`) files are written in a specific functional
programming language, Nix. As it is a purely functional language, I was mostly
familiar with the basic concepts. Still, it was probably my weirdest experience
in learning a programming language. I believe almost all of it's intricacies
get covered by the [Nix pills][nix-pills], so I won't go into detail here.

The learning experience was weird primarily because I thought that reading the
`*.nix` files from other people would help me understand what the language was
capable and how it operated. Yeah, No. Even though it was almost always
intuitively clear _what_ it did, I was utterly incapable to explain _why_ it
worked - there just seemed to exist a convenient option for everything they
wanted to do. It took me a long time to figure out that I could actually search
through these options.

## Options
So when 'everything is possible in Nix as long as you know how the option is
called', it is essential to know how the option is called. Or to be able to
search for it - which is possible [here][options]. The options are pretty
powerful, as they enable user and service creation just as well as a detailed
configuration of packages. Only the sky is the limit. And well, if you need to
write an option yourself for your exotic configuration, the Nix Pills got you
covered. Regardless, being able to search for options transformed my
relationship with NixOS. I did note use it more often than searching for
package names, but it made configurating NixOS just so much _easier_.

## Selecting old Configurations when Booting
So eventually I wrote a configuration that was just sufficiently f\*cked up to
not start my display manager. Nothing big in and by itself. So I did the
'usual': Go to login-shell `tty1` and troubleshoot. I actually knew what was
broken, so it was easy to fix the configuration - but not to materialize the
system. That required an internet connection, and the network utilities I was
familiar with were not available (my main utility is `nmcli`, but `ip` was not
available either. Looking back, I think the `$PATH` was broken). I was really
unable to fix it this time, even when consulting the internet on another
laptop.

What I remembered after wasting two hours: When booting on NixOS, you can
select to boot an earlier configuration instead of the current one. And so I
did. There, everything still worked, including internet. And since I already
fixed the configuration it was easy to switch to the upgraded materialization
of the configuration. This feature alone helped me significantly. It would not
work with other package managers, since it depends a lot on the way Nix works
internally.

## Garbage Collection
This is described in detail in both the manual and nix pills, so I won't go in
detail here. The thing is, even when removing packages from your
`configuration.nix` or uninstall local ones with `nix-env -e <pkgname>`, they
simply get unlinked, not actually removed. Even though it is not required
frequently, executing `nix-collect-garbage` and `nix-store --optimise` every
month or so will free up some space without removing any relevant data from
prior generations. Obviously more can be freed by removing all prior
generations via `nix-collect-garbage --delete-old`, but then you cannot boot in
earlier generations either, so use it with care. The 
`--delete-older-than <period>` is a much more safe bet. Example periods would
be `7d` or `30d`.

# Conclusion
NixOS promises reproducible builds and does not disappoint. Even though some
things still feel rough, such as parts of the documentation or the Nix
language, it really feels like a next-generation package manager. After all, it
really solves reproducibility. Obviously there are still improvements possible
in both Nix and NixOS, but I think it is certainly among the least-bad tools in
regards to its value. I do prefer `ansible` in terms of usability, and by a
lot, but they are just from two entirely different worlds, with Nix having much
stronger guarantees to 'same'-ness than ansible would ever be able to provide.

So yeah, I'm happy with NixOS as my main OS, and I don't think I'll switch
anytime soon. It allows literally fearless upgrades, anytime I want or need
one - since I know a rollback is easy and will work. Bonus points for it not
requiring integration to my dotfiles after all.

Since I'm still using an Ubuntu-based laptop for work, I decided to write a
`ansible`-playbook for dotfile deployment. A post about that is in progress.
Stay tuned.


**Edits**:
- 2020-06-11: small rewordings of ... everything.

[nix-pills]: https://nixos.org/nixos/nix-pills/index.html
[options]: https://nixos.org/nixos/options.html
[nixos-explained]: https://christine.website/blog/nixos-desktop-flow-2020-04-25
