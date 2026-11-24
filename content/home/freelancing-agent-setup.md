---
layout: page
title: Coding-agent setup
subtitle: Shared configuration and provisioning for agent CLIs
permalink: /home/freelancing/agent-setup
description: Public Ansible-managed coding-agent configuration from Felix Karg's configs repository.
---

[Back to freelancing overview](/home/freelancing)

## The project

My public [configs repository](https://github.com/fkarg/configs) combines system configuration with Ansible-based provisioning. Its `coding_agents` role manages configuration for coding-agent command-line tools, keeping this setup reproducible across supported machines.

The [coding-agents directory](https://github.com/fkarg/configs/tree/master/coding-agents) contains the shared agent configuration and supporting tooling. Machine-specific authentication stays out of the public repository.

## Why it is useful

The setup makes it practical to keep a consistent working environment across different coding-agent tools, while still allowing each tool to receive its own configuration. The provisioning layer connects those configs to a repeatable machine setup.

## Links

- [Coding-agent setup in GitHub](https://github.com/fkarg/configs/tree/master/coding-agents)
- [Freelancing overview](/home/freelancing)
