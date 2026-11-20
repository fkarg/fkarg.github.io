---
layout: post
title: Dotfile-Management with Ansible
subtitle: even if you don't know ansible yet
cover-img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Ansible_Logo.png'
tags:
- setup
---
Short article description

Short description of where I got the book from and how I got interested in it,
as well as when I read it. Reference other book reviews if applicable.


* TOC
{:toc}


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

<!-- might require:
{% highlight yaml linenos %}
<code>
{% endhighlight %}

OR:

```yaml
<code>
```

OR:

~~~
<code>
~~~

-->

```yaml
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

```yaml
# part of main.yml
- name: Link File A to B
  file:
    src: /path/to/A
    dest: /path/to/B
    state: link
```

Symlinking folders works the same way, just make A a folder instead of a file.
A hardlink is also possible by setting `state: hard`.

{: .box-note }
More information on the `file` module can be found [here][file].

### Installing Packages with APT
Assuming you are a fan of viewing stars, and your favourite piece of software
is `stellarium`. When being on a ubuntu-based distribution, you would install
it with `sudo apt install stellarium`. Let's include that in our script.

```yaml
# part of main.yml, v1
- name: Install stellarium
  shell: sudo apt install stellarium
```

This is a bad idea on multiple counts, so let's dissect it. When trying to
execute it, it is unlikely to terminate. Unless you don't need to put in a
password when accessing root priviliges. So using the shell is not a good idea,
especially if you need to input some additional data. Actually, there is an apt
module.


```yaml
# part of main.yml, v2
- name: Install stellarium
  apt:
    name: stellarium
```

That's it? Not yet, I'm afraid.If you try, it will fail because a normal user
cannot install packages. There is two ways to deal with it, ignoring it, or
escalating to root priviliges. How would I ignore it?

{: .box-note }
All available parameters for the `apt` module can be found [here][apt].

## Parameters for Tasks
You see, the general syntax for a task looks like this:
```yaml
- name: Optional name
  mod: # actual task to execute
    par: parameter for task
  modifier: modify execution of the task in a certain way
```

Both 'ignoring' as well as 'privilige escalation' are modifiers applicable to
every task you might encounter. Though you might to avoid using them.


### Ignoring failure
Ignoring an actually failing task is considerably easy, you only need to add
`ignore_errors: true` to the module. So the fully non-working but also
error-ignoring installation of `stellarium` using `apt` looks like this:

```yaml
# part of main.yml, v3
- name: Install stellarium
  apt:
    name: stellarium
  ignore_errors: true
```

'But that's barely useful' you say. While this is true for this scenario, we
are going to need it later for cloning / updating the configs-repository, since
it fails if the repository is already present but with local modification (due
to which the module was unable to 'simply' update, thus failing).

### Privilige escalation
This is a bit more tricky, since we actually need to slightly change the way we
call the playbook (it needs to request the `sudo` password, after all).

Privilige escalation in ansible (to sudo/root) works in most cases with a
simple `become: true`.


```yaml
# part of main.yml, v3
- name: Install stellarium
  apt:
    name: stellarium
  become: true
```

However, this will fail if privilige escalation requires a password on your
computer (as it should!). This can be mitigated by calling
`ansible-playbook main.yml -K` instead of the previous without `-K`. This will
prompt you for a password that will be tried whenever a privilige escalation
is supposed to happen and a password is required.

{: .box-note }
**Note**: `-K` also asks for a password even if no sudo rights are required
for executing the playbook, and will notice a wrong password only when 'using'
it.

{: .box-note }
More detailed information on privilige escalation can be found [here][become].

This now finally works! But what if I don't just have an ubuntu, but a
NixOS/CentOS/Arch/... as well, where `apt` is not available?

### Conditionals
So we might want to ensure that our task is only run when `apt` is actually
available. Loosely speaking, this restricts us to debian and ubuntu.

```yaml
# part of main.yml, v4
- name: Install stellarium
  apt:
    name: stellarium
  become: true
  when: ansible_distribution == 'Debian' or ansible_distribution == 'Ubuntu'
```

Whoa, what does `when` do? And where does `ansible_distribution` come from? As
we might guess, `when` is a modifier ensuring that this task is only executed
on debian or ubuntu, where `apt` is bound to be available.
`ansible_distribution` is one of the `ansible facts` that are collected even
prior to task execution.

You can see all available facts with the `setup` module, as described
[here][setup], by running `ansible -m setup localhost`. You might want to add
`--connection local`, since ansible will try to connect via ssh otherwise.

In a playbook, we can build a task to do the same:

```yaml
# part of main.yml
- debug: var=ansible_facts
```

Yeah, that's it. Based on these, based on the environment of the target for the
ansible playbook, we can decide to execute some tasks instead of others.
Conditionals become really useful when conditioning based on Variables that
receive values based on the success of a prior task

### Variables
(mainly registering)

### Handlers

### Iterating multiple items

### Including other files

### Customizing configuration files




Slowly figuring out what to do, step by step. Including the stepwise
'escalation' to the more formally correct methods.

## Conclusion




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



<!--
# Publication Checklist:
- [ ] Added cover-image
- [ ] checked with `pylanguagetool` for typos
- [ ] checked with `homer` for compulsive hedgers
- [ ] checked with `homer` for vague words
- [ ] checked with `homer` for sentence length
- [ ] test-read actual rendered text
- [ ] checked how it looks like on mobile
- [ ] scheduled publication / linked in [books][books]
- [ ] checked if linked in prior/upcoming posts
- [ ] removed this comment

Footnote<sup>[1](#footnote1)</sup> among text.
- - -
**Footnotes**:

<a name="footnote1">1</a>: Text from footnote1.
-->


---
[ansible101]: https://www.youtube.com/watch?v=goclfp6a2IQ
[copy]: https://docs.ansible.com/ansible/latest/modules/copy_module.html
[file]: https://docs.ansible.com/ansible/latest/modules/file_module.html
[template]: https://docs.ansible.com/ansible/latest/modules/template_module.html
[apt]: https://docs.ansible.com/ansible/latest/modules/apt_module.html
[pacman]: https://docs.ansible.com/ansible/latest/modules/pacman_module.html
[become]: https://docs.ansible.com/ansible/latest/user_guide/become.html
[package]: https://docs.ansible.com/ansible/latest/modules/package_module.html
[conditionals]: https://docs.ansible.com/ansible/latest/user_guide/playbooks_conditionals.html
[setup]: https://docs.ansible.com/ansible/latest/reference_appendices/faq.html#how-do-i-see-a-list-of-all-of-the-ansible-variables
[variablesfacts]: https://docs.ansible.com/ansible/latest/user_guide/playbooks_variables.html#variables-discovered-from-systems-facts
[variables]: https://docs.ansible.com/ansible/latest/user_guide/playbooks_variables.html
