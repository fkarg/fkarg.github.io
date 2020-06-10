---
layout: post
published: true
title: 'Things I wish I knew when starting with NixOS'
tags:
- setup
---
So I kind of involuntarily switched to NixOS recently. This is the story how
this happened and a couple things I wish I knew when switching.


* TOC
{:toc}


# Introduction
This is not about super-low-level NixOS information, you will that primarily
[here](https://nixos.org/learn.html). Rather, while talking about my situation
I want to help you get to know a couple resources that I wish I knew when
starting out, as my initial workarounds where ... sub-optimal. If you just want
to know my thoughts about NixOS, you might want to jump to the
[conclusion](#conclusion).

## Wanting to test NixOS
I wanted to test NixOS for the longest time. After all, one social circle of
mine was _entirely_ on NixOS. So I knew a lot of the concepts beforehand,
_theoretically_. This helped, but led to more detailed frustrations - since I
understood what is going wrong on a higher level while not knowing how to fix
it on the lower one, where it actually happened.

## First Encounter
Regardless, I created a boot-stick and installed NixOS on my desktop-computer. I
booted with a super-minimalist configuration and was immediately thrown off
because I had no idea how to install packages. More precisely: I knew that it
would be possible to install them globally by including them in the
`configuration.nix`, and locally by `nix-env -iA nixos.<packagename>`. But
which one is the correct one for which packages? How do I configure my
environment? How do I include these configurations in the `configuration.nix`?
After being somewhat overwhelmed, I refrained from starting the desktop
computer for some time.

This did not exactly go well, to put it bluntly. It felt similar to having
'burnt' myself once, and while I knew that I needed to configure it more before
I could actually use my computer, I was avoiding it continuously.

## Only NixOS
And then my Laptop crashed and burnt. Or, well, not exactly. For some reason,
it did not boot. At first, it seemed like part of the boot section corrupted.
So I tried to fix that. Didn't work. Tried some more things. Didn't work. did a
backup, and tried to install a new OS. First, Ubuntu. Then Linux Mint, Debian,
and NixOS. None worked. They all failed to install the bootloader - just one
critical part. And I had two presentations to prepare, so I had no more time to
waste trying to fix my computer.

So I went into our student council room (I'm well-known there) and told them:
'I can't figure out why installing an OS does not work.' There were three
people ready for the challenge. I started to prepare for the presentation I was
supposed to hold in two hours, somewhat unaware of what was happening to my
laptop. At some point, someone said: 'You now have NixOS'. It was among the
bootsticks I gave them, after all. I held my presentation first, not even
starting the computer yet.

# Learning NixOS
Now both of my computers had NixOS, and I did not know how to work with it. I
had a somewhat working computer and knew how to use `nix-env -iA
nixos.<packagename>` after all. But that's only a temporary solution, since I
always had to reconfigure _something_, and I did not have my prior setup or my
prior dotfiles back yet. And I needed to build another presentation, this time
with LaTeX. On an operating system where I had no idea what the package is
called. So I googled it.

From here on, my experiences were easier than expected. I expected some sort of
hassle after installing it, some package missing or something. It's _always_
like this when building a new project. Not this time. Installing LaTeX took a
few minutes but than I was able to build the presentation again, just two hours
before we were supposed to start the presentation. I felt immense relief, to
say the least. I've been under considerable pressure, and even though I
actually had prepared a second laptop for presenting and a backup from the
presentation, I wanted to change a few small things before presenting.

## Packages
Even though googling how some packages were called worked quite well, it was
pretty clear that this is not the way it was supposed to work. I'm still not
sure how, but at some point I became aware of
[https://nixos.org/nixos/packages.html](https://nixos.org/nixos/packages.html),
the actual searchable package repository. This considerably improved my
searching speed for packages. I was positively surprised that a couple of
packages I was using but which were not packaged yet for Ubuntu (`ripgrep` or
`broot`) were just immediately available as a package. And not just those, also
some plugins or other packages which supposedly required a different package
manager first (`cargo` or `pip`) were directly available through nix. That was
comfortable.

## Local Configs
Contrary to my initial image of NixOS, not _everything_ is determined by the
`configuration.nix`. Even though you _can_ deploy your local configuration
files / dotfiles through NixOS, it might be a bit overkill, especially when
just starting out. Just copy your configuration files manually, like you would
when installing a new OS.

## Manual
So as I understand it, the [NixOS Manual](https://nixos.org/nixos/manual/) is
kind of a living document with most of 'available' knowledge about NixOS. Which
does not mean it is the best place to learn about Nix and NixOS, but it is a
good place to find answers for specific questions. Since I wanted to learn more
about NixOS, I started reading through parts of the manual and in other places
in the internet. And sometimes, Nix-Pills where mentioned. What are they?

## Nix-Pills
The [Nix Pills][nix-pills] are something like the introduction to the 'secret
knowledge' of Nix, or at least it felt like it. They were written originally as
a series of blog posts exploring and explaining the inner workings of all
Nix-relevant concepts. They have been updated accordingly, but still. They
provide really interesting and well-structured insights to the inner workings
of Nix and NixOS.

## Nix (The Language)
All the configuration (`*.nix`) files were written in a specific functional
programming language, Nix. As I taught Haskell two years prior to switching to
NixOS, I was mostly familiar with the basic concepts. Still, it was probably my
weirdest experience in learning a programming language. I believe almost all of
it's intricacies get covered by the [Nix pills][nix-pills], so I won't go into
detail here.

The learning experience was weird primarily because somehow I still don't know
what the _limits_ of the language are, what it is _not_ capable of. This might
be because I didn't really do that much in it, but early on I read a lot of
code that was intuitively pretty clear _what_ it did, but I was usually unable
to explain _why_ it worked, and this persists until today.

## Options
Something else that added to the weird learning experience of 'everything is
possible in Nix as long as you know how to express it' was that frequently
_options_ to programs were mentioned. The [NixOS Options][options] are pretty
powerful, from user and service creation to detailed configuration of packages,
only the sky is the limit. At least it initially felt like it, as people on
stack overflow were answering the questions I was googling with 'just add
`boot.kernelPackages = pkgs.linuxPackages_latest;` to your `configuration.nix`'
or some other _intuitively correct_ option. Always exactly just the ones I was
looking for. So finding out that I could simply [search for them][options] was
an incredible revelation, and something I probably used more often than
searching for packages.

## Selecting old Configurations when Booting
So eventually I wrote a configuration that was just sufficiently f\*cked up to
not let me boot my display manager. So I did the 'usual': Go to login-shell
`tty1` and troubleshoot. I actually knew what was broken, so I was able to fix
the configuration - but not update the system, since that required an internet
connection, and the network utilities I was familiar with were somehow not
available. Apparently I was really unable to fix it this time, even when
consulting the internet on another laptop.

What I remembered much too late: When booting on NixOS, you can select to boot
an earlier configuration instead of the current one. And so I did. There, most
other things still worked, including internet. And since I already fixed the
configuration it was easy to switch to the upgraded one. This feature alone
helped me significantly.

## Garbage Collection
This is described in detail in both the manual and nix pills, so I won't go in
detail too much. The thing is, even when removing packages from your
`configuration.nix` or uninstall local ones with `nix-env -e <pkgname>`, they
simply get unlinked, not removed. Even though this is not required frequently,
executing `nix-collect-garbage` and `nix-store --optimise` every month or so
will free up some space without removing prior generations. Obviously more can
be freed by removing all prior generations via `nix-collect-garbage
--delete-old`, but then you cannot boot in earlier generations either, so use
with care. The `--delete-older-than <period>` is a much more safe bet. Example
periods would be `7d` or `30d`.

# Conclusion
NixOS promises reproducible builds and does not disappoint. Even though some
things still feel rough, such as parts of the documentation or the Nix
language, it really feels like a next-generation package manager. After all, it
really solves most of the problems I had prior to my first contact with nix.
Obviously there are still improvements possible in both Nix and NixOS, but I
think it is probably among the least-bad tools in regards of reproducibility. I
do prefer `ansible` in terms of usability, and by a lot, but it's clear that
they are just from two entirely different worlds, with Nix having much stronger
guarantees to 'same'-ness than ansible would ever be able to provide.

So yeah, I'm happy with NixOS as my main OS, and I don't think I'll switch
anytime soon. It allows literally fearless upgrades, anytime I want or need
one. Bonus points for it not requiring integration to my dotfiles after all.
Since I'm still using one Ubuntu-based computer for work, I decided to write an
`ansible`-playbook for dotfile deployment instead. A post about that is in
progress. Stay tuned.

[nix-pills]: https://nixos.org/nixos/nix-pills/index.html
[options]: https://nixos.org/nixos/options.html
