---
layout: post
published: false
title: Server Plan
subtitle: how I plan to set up my infrastructure
tags:
- cluster
---

Document the current plan and timeline of the server/cluster Project


Hardware:
1x SunFire X4170
    2x 1TB HDD
    2x ___ CPU
    96GB RAM
2x Cluster Node (CloverPi)
    with each 4x Raspberry PI 4 with 2GB or 4GB


Configure everything with ansible (in lxc vms?) and maybe docker


Services:
- CodiMD
- Jenkins
- Mail Server
- Backup Server
- gitea instance
- website(s)
- IRC Bouncer
- Overleaf/Etherpad
- NextCloud
- nixOS config build server preemptively testing config updates for errors
- (Jupyter Compute Node?)
- (Kafka?)
- (Huginn?)
- (Grafana?)
- (doodle?)
- whatever else bullshit I can think about.

first lesson learned: do not try kubernetes with debian. Apparently a lot of things break (because no one uses kubernetes with it already, and it is a big effort that only distributions with 'paid' service do)

optionally:
- clue in Desktop computer while running
    (hard drives as well as computationally)
