---
layout: post
published: false
title: Dotfile-Management with Ansible
subtitle: even if you don't know ansible yet
tags:
- setup
---

## Explaining the current state / problem we are going to solve
My main operating system is NixOS. Both my primary laptop as well as my desktop
computer run on NixOS. With `nix`, deterministic configuration management is
easy. Then I have my working computer, and a couple servers. These are all on
different versions of ubuntu. I could explain how I got to NixOS, but that's
for another time.

I'd like to have well synced configuration files, between the two laptops and
the desktop computer. It was a git repository collecting files and references
for the longest time, manually copying some new version and making local
adjustments (do not show a battery or wifi in the status bar at the desktop).

Setting up a new computer and configuring the configs did not take much time,
and the steps were obvious, but it still regularly took half an hour until my
workflows worked again (Oh, why is that script failing? Ah, there is a symlink
missing here. Ah, and it's not in the PATH yet).

Sound familiar? Let's get down to business.


## What is ansible anyway?
Ansible is going to magically solve all our problems. At least I thought so
when hearing about it. So what is ansible? Wikipedia:

> Ansible is an open-source software provisioning, configuration management,
> and application-deployment tool. It runs on many Unix-like systems, and can
> configure both Unix-like systems as well as Microsoft Windows. It includes
> its own declarative language to describe system configuration.

Even though it's certainly not wrong, it does not feel exactly 'right' either.
Let's try the top answer from quora to 'What is ansible?':

> Ansible is an open source IT configuration management (CM) and automation
> platform, provided by Red Hat. It uses human-readable YAML templates so that
> users can program repetitive tasks to occur automatically, without learning
> an advanced language.

In both answers, 'configuration management' was one of the first descriptions,
around automation platform and software provisioning, whatever that is. Instead
of trying to look at definitions and words, let's take a look at what ansible
can actually do.

## Installing ansible
For nixos, it's simply the `ansible` package. For those without nixos, you
might want to install it with pip (I suggest python3 in a virtual environment).
Again, the package itself is called `ansible`.

After installing the package, verify installation with `ansible --version`. The
next steps will be to actually solve some basic problems of dotfile deployment.

I'm going to push you head first into the cold water, so brace for impact.
Don't worry, I'll explain what's going on.

## Solving Real Problems with ansible

### Copying files

Let's say you have your repo with your configs on your new machine already.
Some files need to be placed at certain places. How could we do this? The
following ansible playbook should give you an idea:

```
--- # file: main.yml
- hosts: locahost
  connection: local

  tasks:
    - name: Move File from A to B
      template:
        src: /path/to/A
        dest: /path/to/B

    # - name: Next task
    #     actually no, this is just a comment.
```

We only want to run the following tasks on localhost, this is unusual for
ansible. Also we want the connection to be _local_, since otherwise ansible
would try to connect with ssh which would most likely fail.

The task is quite simple: take a file from path A, and copy it to path B. You
might be wondering why it is called `template` then, this is because `template`
can do so much more than just that, we'll get to that in a minute.

So how to execute this thing? It's simple, really: `ansible-playbook main.yml`.

### Idempotence

When you run this playbook for the first time, you will see something like
`changed: [localhost]` after execution. Every time you run it after that
(without removing or modifying the file at `src` or `dest`), you will see
`ok: [localhost]` instead. This means, that the task did not do anything in
this run.

This is important, because it means that if some later step fails, you can
modify and run it again without worrying about the earlier steps interfering in
any way, since they notice that nothing needs to be done for them, so they
won't do anything. Repeated execution without the fear of accidentially
destroying something by an earlier step.

### Linking files and folders

So let's say you have deployed the configuration files for `~/.config/sth`, but
you'd like to make changes to them just once and see the effects without having
to re-run the ansible playbook. Which is to say, you'd like to create a symlink
to your configuration file, instead of copying it. Nothing easier than that:

``` # part of main.yml
- name: Link File A to B
  file:
    src: /path/to/A
    dest: /path/to/B
    state: link
```

Symlinking folders works the same way, just make A a folder instead of a file.
A hardlink is also possible by setting `state: hard`. More documentation can be
found [here][filedoc].

### Installing Packages with APT
Assuming you are a fan of viewing stars, and your favourite piece of software
is `stellarium`. When being on a ubuntu-based distribution, you would install
it with `sudo apt install stellarium`. Let's include that in our script.

``` # part of main.yml, v1
- name: Install stellarium
  shell: sudo apt install stellarium
```

This is a bad idea on multiple counts, so let's dissect it. when trying to
execute it, it is unlikely to terminate. Unless you don't need to put in a
password when accessing root priviliges. So using the shell is not a good idea, especially if you need to input some additional data. Actually, there is a apt module.


``` # part of main.yml, v2
- name: Install stellarium
  apt:
    
```

### Ignoring failure

introduce `ignore_errors: true`

### Privilige escalation

escalate to sudo by passing in the password externally

### Conditionals and Variables

conditional on only on ubuntu-based ones

### Including other files

### Customizing configuration files




Slowly figuring out what to do, step by step. Including the stepwise
'escalation' to the more formally correct methods.


Footnote<sup>[1](#footnote1)</sup> among text.





<!--

After having verified that it works, let's see a more detailed example.

```
ansible localhost -m ping - -connection local
```

You should see something among the lines of:
```
localhost | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python"
    },
    "changed": false,
    "ping": "pong"
}
```
As you might have guessed, it tried to 'ping' localhost. If you leave out the `- -connection local` bit, you might get the following instead:

```
The authenticity of host 'localhost (::1)' can't be established.
ED25519 key fingerprint is SHA256:..........................
Are you sure you want to continue connecting (yes/no)? yes
localhost | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh: Warning: Permanently added 'localhost' (ED25519) to the list of known hosts.\r\user@localhost: Permission denied (publickey,password,keyboard-interactive).",
    "unreachable": true
}
```

Well, maybe you won't but most likely you will. If you still get a
'SUCCESS'-message, it means that you can access localhost from your current
machine with ssh with a key on your machine. And I hope you have a good reason.
for that.

So we learned something important: `ansible` tries to connect over ssh by
'default'. It is specifically that connection that allows you to configure
other hosts, without having more than ssh access to them. We'll get to that
later. Now the `-m ping` part specifies what we want ansible to do in this
case, 'requesting' an answer from, in this case, localhost. more specfically,
we request the execution of the 'ping' module, which does not require further
arguments.

-->

---
#### Footnotes

<a name="footnote1">1</a>: Text from footnote1.

[ansible101]: https://www.youtube.com/watch?v=goclfp6a2IQ
[filedoc]: https://docs.ansible.com/ansible/latest/modules/file_module.html
[templatedoc]: https://docs.ansible.com/ansible/latest/modules/template_module.html
[aptdoc]: https://docs.ansible.com/ansible/latest/modules/apt_module.html
