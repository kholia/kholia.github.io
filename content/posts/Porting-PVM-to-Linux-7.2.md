---
title: "Porting PVM to Linux 7.2"
date: 2026-08-14
draft: false
tags:
  - linux
  - kernel
  - pvm
  - kvm
  - qemu
  - virtualization
  - ubuntu
  - security
---

The original PVM kernel tree was based on Linux 6.12.x, while current Linux
`master` had reached 7.2. This note records the commands I used to build,
package, and boot the forward port. The resulting tree is available in the
[`pvm-720` branch](https://github.com/kholia/linux/tree/pvm-720).

## PVM in short

PVM (Pagetable-based Virtual Machine) is a KVM guest hypervisor designed for
running nested workloads without requiring VMX or SVM. Essentially native or
nested virtualization HW functionality is NOT required! It uses a small shared
region for privilege transitions and efficient shadow page tables for memory
virtualization. The design is described in the SOSP '23 paper [*PVM: Efficient
Shadow Paging for Deploying Secure Containers in Cloud-native
Environments*](https://doi.org/10.1145/3600006.3613158). The original code is
in the [`virt-pvm/linux`](https://github.com/virt-pvm/linux) repository.

## Get the port

Prebuilt host-kernel Debian packages and a guest-kernel binary are also
available for Ubuntu-ish systems from the latest successful
[`PVM kernels` GitHub Actions run](https://github.com/kholia/linux/actions/workflows/pvm-guest-kernel.yml?query=branch%3Apvm-720).

On Ubuntu 26.04:

```bash
sudo apt update
sudo apt install -y \
    bc bison build-essential flex git libelf-dev libssl-dev

sudo apt install -y libz3-dev cmake

git clone --branch pvm-720 --single-branch \
    https://github.com/kholia/linux.git linux-pvm
cd linux-pvm

git log -1 --oneline
make --silent kernelversion
```

The port updates the x86 entry code, KVM capability and MSR handling, PFN cache
interfaces, early page tables, linker layout, and objtool annotations. It also
adds a PVM KVM selftest, a minimal guest config, a config validator, and Ubuntu
26.04 GitHub Actions builds.

## Build the minimal guest kernel

Start with `tinyconfig`, merge the PVM guest fragment, resolve Kconfig
dependencies, and only then run the validator:

```bash
make ARCH=x86 tinyconfig

scripts/kconfig/merge_config.sh -m \
    .config kernel/configs/virt_pvm_openshell.config

make ARCH=x86 olddefconfig
scripts/check-pvm-config.sh .config

make --silent ARCH=x86 -j"$(nproc)" bzImage
ls -lh arch/x86/boot/bzImage
```

The order matters. Running `scripts/check-pvm-config.sh` before
`olddefconfig` can report selected or hidden options incorrectly.

The final kernel is built-in-only: there is no module loader or initramfs. It
contains the virtio, ext4, namespace, cgroup, networking, netfilter, seccomp,
and hardening features required by the guest workload.

## Build an installable PVM host kernel

The host build starts with the default config of the running Ubuntu 26.04
kernel and merges the PVM host fragment. Debug information is disabled to keep
the CI build and packages manageable. Ubuntu-specific certificate paths are
also cleared because those files are not present in the upstream Linux tree.

Install the packaging dependencies:

```bash
sudo apt install -y --no-install-recommends \
    bc bison build-essential cpio debhelper dpkg-dev dwarves fakeroot \
    flex kmod libdw-dev libelf-dev libssl-dev lz4 python3 rsync xz-utils zstd
```

Create the host config:

```bash
ubuntu_config="/boot/config-$(uname -r)"
test -r "$ubuntu_config"

cp "$ubuntu_config" ubuntu-26.04-base.config
cp "$ubuntu_config" .config

scripts/config --file .config \
    --set-str LOCALVERSION "" \
    --disable LOCALVERSION_AUTO \
    --set-str SYSTEM_TRUSTED_KEYS "" \
    --set-str SYSTEM_REVOCATION_KEYS "" \
    --disable DEBUG_INFO \
    --enable DEBUG_INFO_NONE \
    --disable DEBUG_INFO_DWARF_TOOLCHAIN_DEFAULT \
    --disable DEBUG_INFO_DWARF4 \
    --disable DEBUG_INFO_DWARF5 \
    --disable DEBUG_INFO_BTF

scripts/kconfig/merge_config.sh -m \
    .config kernel/configs/virt_pvm_test_host.config

make ARCH=x86 olddefconfig

grep -x 'CONFIG_KVM=y' .config
grep -x 'CONFIG_KVM_PVM=y' .config
grep -x 'CONFIG_KVM_WERROR=y' .config
grep -x 'CONFIG_DEBUG_INFO_NONE=y' .config
! grep -Eq '^CONFIG_KVM_(INTEL|AMD)=[ym]$' .config
```

Build the Debian packages:

```bash
export KBUILD_BUILD_HOST=local
export KBUILD_BUILD_USER=pvm
export KDEB_CHANGELOG_DIST=resolute
export KDEB_SOURCENAME=linux-pvm
export LOCALVERSION=-pvm

kernel_version="$(make --silent kernelversion | sed 's/-rc/~rc/')"
export KDEB_PKGVERSION="${kernel_version}+pvm.1"

make --silent ARCH=x86 -j"$(nproc)" bindeb-pkg

ls -lh ../linux-image-*.deb ../linux-headers-*.deb
```

Install both packages:

```bash
sudo apt install ../linux-image-*.deb ../linux-headers-*.deb
sudo update-grub
```

PVM currently requires `pti=off` on the host. Add it to
`GRUB_CMDLINE_LINUX_DEFAULT` in `/etc/default/grub`, then regenerate GRUB and
reboot:

```bash
sudoedit /etc/default/grub
sudo update-grub
sudo reboot
```

After rebooting:

```bash
uname -r
grep '^CONFIG_KVM_PVM=y' "/boot/config-$(uname -r)"
ls -l /dev/kvm
```

`KVM_PVM` is built into this host kernel, so there is no `kvm_pvm` module to
load.

## Run the PVM selftest

```bash
cd linux-pvm

make -C tools/testing/selftests/kvm \
    -j"$(nproc)" x86/pvm_test

./tools/testing/selftests/kvm/x86/pvm_test
```

The test covers PVM availability, virtual MSRs, register access, and invalid
address handling. Run it on the newly built host kernel; an older 6.12 PVM
host does not contain all the fixes tested by the new binary.

## Download an Ubuntu 26.04 guest image

Install QEMU, qboot, and the cloud-image helper:

```bash
sudo apt install -y \
    cloud-image-utils curl qemu-system-data qemu-system-x86
```

Download the current Resolute cloud image and verify it against Ubuntu's
published checksum file:

```bash
curl -fLO \
    https://cloud-images.ubuntu.com/resolute/current/resolute-server-cloudimg-amd64.img
curl -fLO \
    https://cloud-images.ubuntu.com/resolute/current/SHA256SUMS

grep 'resolute-server-cloudimg-amd64.img$' SHA256SUMS | sha256sum -c -
```

Create a small NoCloud seed so the `ubuntu` user can log in on the serial
console. This password is only suitable for an isolated test VM:

```bash
cat > user-data <<'EOF'
#cloud-config
password: password
chpasswd: { expire: false }
ssh_pwauth: true
EOF

cloud-localds user-data.img user-data
```

## Boot the new `bzImage` with qboot

SeaBIOS rejected an early write into its protected `pc.bios` region during
testing. qboot is small, fast, and works correctly for direct kernel boot. Its
ROM is installed by Ubuntu's `qemu-system-data` package.

```bash
export ROOTFS="$PWD/resolute-server-cloudimg-amd64.img"
export SEED="$PWD/user-data.img"

qemu-system-x86_64 \
    -machine q35,accel=kvm \
    -cpu host \
    -smp 2 \
    -m 512M \
    -bios /usr/share/qemu/qboot.rom \
    -kernel arch/x86/boot/bzImage \
    -append "console=ttyS0 root=/dev/vda1 rw rootwait pti=off panic=-1 fstab=no systemd.mask=lvm2-monitor.service systemd.mask=multipathd.service systemd.mask=multipathd.socket systemd.mask=chrony.service" \
    -drive file="$ROOTFS",if=none,format=qcow2,id=root \
    -device virtio-blk-pci,drive=root \
    -drive file="$SEED",if=virtio,format=raw,readonly=on \
    -snapshot \
    -nographic \
    -no-reboot \
    -nic user,model=virtio-net-pci
```

The expected end state is:

```text
Reached target multi-user.target
Reached target graphical.target

Ubuntu 26.04 LTS ubuntu ttyS0

ubuntu login: ubuntu
Password:


Welcome to Ubuntu 26.04 LTS (GNU/Linux 7.2.0+ x86_64)
...

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

ubuntu@ubuntu:~$ sudo dhcpcd enp0s2

ubuntu@ubuntu:~$ curl ifconfig.me/all
ip_addr: <ip-address>
user_agent: curl/8.18.0
```

Use `Ctrl-a x` to leave QEMU. `-snapshot` ensures that the downloaded cloud
image is not modified.

## BONUS: OpenShell + PVM demo

See https://github.com/kholia/OpenShell/tree/Support-for-PVM for details.

```
$ export PATH=/usr/sbin:$PATH
$ openshell-gateway

$ openshell sandbox create --name pvm-demo --from base --no-tty -- uname -a
Created sandbox: pvm-demo
✓ Sandbox allocated (0s)
Linux pvm-demo 7.2.0+ #1 SMP PREEMPT Mon Aug 17 04:09:20 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux
```

```
$ cat ~/.config/openshell/gateway.toml  # insecure, only for development
[openshell]
version = 1

[openshell.gateway]
# Bind to loopback only.  The Docker driver adds an extra listener on the
# bridge interface automatically so sandbox containers can reach the gateway.
log_level           = "info"
compute_drivers     = ["vm"]
disable_tls = true

[openshell.gateway.gateway_jwt]
signing_key_path = "/home/user/.local/state/openshell/tls/jwt/signing.pem"
public_key_path = "/home/user/.local/state/openshell/tls/jwt/public.pem"
kid_path = "/home/user/.local/state/openshell/tls/jwt/kid"
gateway_id = "openshell"
ttl_secs = 0

[openshell.gateway.auth]
allow_unauthenticated_users = true

[openshell.drivers.vm]
pvm_kernel = "/home/user/vmlinux-guest"
pvm_firmware = "/home/user/qboot.rom"
```

```
$ openshell sandbox create --name pvm-demo --from base --policy examples/sandbox-policy-quickstart/policy.yaml

sandbox@pvm-demo:~$ curl https://api.github.com/zen
Half measures are as bad as nothing at all.
```

Yep - the full PVM path is working: qboot boot, QEMU networking, authenticated
supervisor startup, policy enforcement, DNS, and GitHub HTTPS egress!

## OpenShell - Run Custom Workloads

```
openshell sandbox create \
    --name pvm-rootfs-dev \
    --from examples/pvm-custom-rootfs \
    --policy examples/pvm-custom-rootfs/policy.dev-only.yaml
```

```
openshell forward start 0.0.0.0:6080 pvm-rootfs-dev
```

See https://github.com/kholia/OpenShell/tree/Support-for-PVM for more details.

## OpenShell - GUI workloads

```
$ openshell sandbox connect
...

# Clean up anything left from previous attempts.
pkill -f websockify 2>/dev/null || true
pkill -f x11vnc 2>/dev/null || true
pkill -f openbox 2>/dev/null || true
pkill -f Xvfb 2>/dev/null || true

# Runtime directories.
export HOME=/sandbox/home
export XDG_RUNTIME_DIR=/tmp/runtime
export XDG_CONFIG_HOME=/sandbox/config
export XDG_CACHE_HOME=/sandbox/cache
export TMPDIR=/tmp
export DISPLAY=:99

mkdir -p \
    "$HOME" \
    "$XDG_RUNTIME_DIR" \
    "$XDG_CONFIG_HOME" \
    "$XDG_CACHE_HOME"

chmod 700 "$XDG_RUNTIME_DIR"

# 1. Virtual X11 display.
Xvfb :99 \
    -screen 0 1920x1080x24 \
    -nolisten tcp \
    -ac \
    >/tmp/xvfb.log 2>&1 &

sleep 1

# Verify X is alive.
xdpyinfo -display :99 >/dev/null && echo "Xvfb OK"

# 2. Lightweight window manager.
DISPLAY=:99 openbox-session \
    >/tmp/openbox.log 2>&1 &

sleep 1

# 3. VNC server. Keep it bound to localhost.
DISPLAY=:99 x11vnc \
    -display :99 \
    -localhost \
    -rfbport 5900 \
    -forever \
    -shared \
    -nopw \
    >/tmp/x11vnc.log 2>&1 &

sleep 1

# 4. noVNC/WebSocket frontend.
websockify \
    --web=/usr/share/novnc \
    127.0.0.1:6080 \
    127.0.0.1:5900 \
    >/tmp/websockify.log 2>&1 &

sleep 1

# Verify ports.
echo "=== listening ports ==="
ss -lntp | grep -E '5900|6080' || true
```

```
tsh ssh -L 5000:localhost:6080 user@remote-dev-machine
```

## Idea: a tiny Codex development cloud

A single AWS VM running the PVM-enabled kernel could host several isolated
OpenShell sandboxes, each running a Codex development environment for one remote
user.

A small control plane would create a sandbox from a common base image, attach a
persistent workspace, inject the user's SSH key, apply CPU, memory, disk, and
network-policy limits, and expose SSH through a bastion or a per-sandbox port.
Users would see an ordinary remote Linux development machine while the host
handles provisioning, suspension, snapshots, cleanup, and audit logs.

So yes: this is a small orchestration platform. OpenShell and PVM provide the
isolation and policy layer; the missing piece is mostly lifecycle and identity
management. It would be a useful team-sized system or prototype, though one AWS
VM remains a capacity ceiling and single point of failure. The VM itself would
be managed by IT; developers would have SSH access only to their assigned
sandboxes, not to the host.

## Quickstart Guide

On the target box:

```
sudo usermod -aG docker $USER

sudo usermod -aG kvm $USER

wget https://github.com/kholia/linux-builds/raw/refs/heads/master/pvm-host-kernel-debs.zip

wget https://github.com/kholia/linux-builds/raw/refs/heads/master/pvm-full-guest-kernel.zip

unzip pvm-host-kernel-debs.zip

unzip pvm-full-guest-kernel.zip

mv arch/x86/boot/bzImage vmlinux-guest

sudo apt install ./*.deb
```

Reboot the target box:

```
sudo reboot
```

Re-login to the target box:

```
$ uname -a
Linux remote-box 7.2.0-pvm #1 SMP PREEMPT_DYNAMIC Wed Aug 19 12:31:05 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux

$ sudo cat /etc/modules-load.d/pvm.conf  # create this file
kvm-pvm
```

The host box is now all set to run PVM guests!

Install other components and OpenShell:

```
(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y
```

```
sudo apt install -y libz3-dev cmake qemu-system-x86 \
  cloud-image-utils curl qemu-system-data

git clone https://github.com/kholia/OpenShell.git -b Support-for-PVM

curl https://mise.run | sh

echo "eval \"\$(/home/dkholia/.local/bin/mise activate bash)\"" >> ~/.bashrc

source ~/.bashrc

cd ~/OpenShell

mise trust

mise install

mise run vm:setup
mise run vm:supervisor

test -s target/vm-runtime-compressed/openshell-sandbox.zst
test -s target/vm-runtime-compressed/umoci.zst

OPENSHELL_VM_RUNTIME_COMPRESSED_DIR="$PWD/target/vm-runtime-compressed" \
mise exec -- cargo build --release -p openshell-driver-vm

OPENSHELL_VM_RUNTIME_COMPRESSED_DIR="$PWD/target/vm-runtime-compressed" \
OPENSHELL_DEB_VERSION="0.0.0-local" \
mise run package:deb:install
```

```
sudo ln -s /home/$USER /home/user

mkdir -p ~/.config/openshell

/usr/bin/openshell-gateway generate-certs \
  --output-dir "$HOME/.local/state/openshell/tls" \
  --server-san host.openshell.internal

test -s "$HOME/.local/state/openshell/tls/jwt/signing.pem"
test -s "$HOME/.local/state/openshell/tls/jwt/public.pem"
test -s "$HOME/.local/state/openshell/tls/jwt/kid"

$ cat ~/.config/openshell/gateway.toml  # insecure, only for development, create this file
[openshell]
version = 1

[openshell.gateway]
# Bind to loopback only.  The Docker driver adds an extra listener on the
# bridge interface automatically so sandbox containers can reach the gateway.
log_level           = "info"
compute_drivers     = ["vm"]
disable_tls = true

[openshell.gateway.gateway_jwt]
signing_key_path = "/home/user/.local/state/openshell/tls/jwt/signing.pem"
public_key_path = "/home/user/.local/state/openshell/tls/jwt/public.pem"
kid_path = "/home/user/.local/state/openshell/tls/jwt/kid"
gateway_id = "openshell"
ttl_secs = 0

[openshell.gateway.auth]
allow_unauthenticated_users = true

[openshell.drivers.vm]
pvm_kernel = "/home/user/vmlinux-guest"
pvm_firmware = "/usr/share/qemu/qboot.rom"
```

We are now ready to launch OpenShell sandboxes!

In one terminal:

```
sudo modprobe kvm-pvm

export PATH=/usr/sbin:$PATH
openshell-gateway
```

In another terminal:

```
openshell gateway add http://127.0.0.1:17670
```

```
cd ~/OpenShell

openshell sandbox create \
    --name pvm-rootfs-dev \
    --from examples/pvm-custom-rootfs \
    --policy examples/pvm-custom-rootfs/policy.dev-only.yaml
```

At the end of this semi-long process you should see something like:

```
✓ Sandbox allocated (0s)
sandbox@pvm-rootfs-dev:~$

sandbox@pvm-rootfs-dev:~$ uname -a
Linux pvm-rootfs-dev 7.2.0-g0053662c3879 #1 SMP PREEMPT_DYNAMIC Wed Aug 19 11:52:00 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux
```

Success ;)

## References

- https://www.nofire.ai/guides/NOFire-Sandboxing-for-Agentic-Execution-2026.pdf - Motivation behind this work
- [Linux 7.2 PVM port](https://github.com/kholia/linux/tree/pvm-720)
- [Original PVM Linux repository](https://github.com/virt-pvm/linux)
- [SOSP '23 PVM paper PDF](https://github.com/virt-pvm/misc/blob/main/sosp2023-pvm-paper.pdf)
- [Ubuntu 26.04 Resolute cloud image](https://cloud-images.ubuntu.com/resolute/current/resolute-server-cloudimg-amd64.img)
- [CubeSandbox's old kernels](https://github.com/TencentCloud/CubeSandbox/releases)
- https://github.com/TencentCloud/CubeSandbox/blob/master/docs/guide/pvm-deploy.md
- https://github.com/kholia/OpenShell/tree/Support-for-PVM
- https://github.com/kvcache-ai/linux/releases/ - Older PVM kernels
- https://kvcache-ai.github.io/AgentENV/dev/deployment/pvm.html
- https://katacontainers.io/blog/kata-sandbox-demo-on-kubecon-jp-2026/
- https://github.com/kholia/linux/compare/pvm-720...torvalds:linux:v7.2
