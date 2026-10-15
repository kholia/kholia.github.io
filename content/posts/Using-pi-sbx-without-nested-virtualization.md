---
title: "Using pi-sbx microVM sandboxes without nested virtualization"
date: 2026-10-28
draft: false
tags:
  - linux
  - pvm
  - kvm
  - virtualization
  - ai
  - sandbox
---

[`pi-sbx`](https://github.com/ChristianMoesl/pi-sbx) keeps Pi on the host and
runs its built-in shell and filesystem tools inside a Docker SBX microVM.
Workspace changes remain visible on the host.

PVM (Pagetable-based Virtual Machine) lets us run these microVMs inside an
x86_64 Linux VM without exposed VMX/SVM or nested virtualization. It still
provides the `/dev/kvm` interface used by SBX.

First, install and boot the PVM host kernel from
[Porting PVM to Linux 7.2]({{< relref "Porting-PVM-to-Linux-7.2.md" >}}),
including its `pti=off` boot setting. You also need an SBX-compatible PVM
guest kernel, saved as `vmlinux` below.

## Install SBX

```bash
curl -fsSL https://get.docker.com | sudo REPO_ONLY=1 sh
sudo apt-get install docker-sbx
sudo usermod -aG kvm "$USER"
sudo usermod -aG docker $USER
newgrp kvm
sbx login
```

## Replace the guest kernel

From the directory containing your SBX-compatible PVM guest `vmlinux`:

```bash
wget https://github.com/kholia/linux-builds/raw/refs/heads/master/pvm-host-kernel-debs.zip

wget https://github.com/kholia/linux-builds/raw/refs/heads/master/pvm-full-guest-kernel.zip

unzip pvm-host-kernel-debs.zip

unzip pvm-full-guest-kernel.zip

sudo apt install ./*.deb  # install pvm host kernel and then reboot the host *manually*

sudo cp vmlinux /usr/libexec/nerdbox-kernel-x86_64

sbx daemon restart
```

Note: Package upgrades can replace this kernel; reinstall it after upgrading SBX.

## Install Pi and use the sandbox

Install [Pi](https://pi.dev/) and the extension:

```bash
curl -fsSL https://pi.dev/install.sh | sh
pi install git:github.com/ChristianMoesl/pi-sbx
```

The [extension requires](https://github.com/ChristianMoesl/pi-sbx#requirements)
SBX 0.48.0 or newer, plus Node.js, Bash, `sh`, `rg`, and `file` in the sandbox
image. Create the sandbox and start Pi from its mounted workspace:

```bash
mkdir -p "$HOME/sbx-debug"
sbx --debug create --name sbx-default-test shell "$HOME/sbx-debug"
sbx exec sbx-default-test -- uname -r
cd "$HOME/sbx-debug"

$ sbx run --name sbx-default-test
agent@sbx-default-test:sbx-debug$ uname -a
Linux sbx-default-test-2 7.3.0-gad6ecb3610e2 #1 SMP PREEMPT_DYNAMIC...
```

```
cd "$HOME/sbx-debug"

pi
```

Check that `uname -r` reports your PVM guest kernel. Pi discovers the sandbox
from the workspace mount; its footer should show `sbx: sbx-default-test`.
Use `/sbx` inside Pi to select or reconnect to it.
