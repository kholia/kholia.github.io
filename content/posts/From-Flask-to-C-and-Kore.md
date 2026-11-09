---
title: "From Flask to C and Kore via a Rust OOM"
date: 2026-11-16
description: "From Flask and Gunicorn through slow Rust builds and OOM kills to C, Kore, and memory safety with Fil-C."
tags:
- C
- Rust
- Linux
- Security
- Software
---

I wanted the [Bunzee Labs](https://bunzee-labs.com/) website to use less RAM.
The Flask application worked, but its Gunicorn processes felt expensive for
what the site did. I wanted one application executable, a maintainable codebase,
and one deployment command. Builds had to work on **4 GB machines**.

This sounded like a small migration. LOL.

## The Rust detour

Rust with Axum looked attractive: native performance, memory safety, and an
executable to deploy. We ported the site.

Then came compilation. The release build took ages and eventually OOM'ed (even
on a bigger box with 16 GB RAM). I also know very little Rust; this was
supposed to leave me with something I could comfortably hack on.

This isn't the first time Rust has OOM'ed on us: see our
[initial forays with the R36S]({{< relref "R36S-Adventures-1.md#initial-forays" >}}).

For this project, the build experience became a dealbreaker. We changed direction
to **C + [Kore](https://kore.io/)**.

## C with memory safety

I wanted C's familiar tools with memory safety for an Internet-facing payment
website. **[Fil-C](https://fil-c.org/)** makes that possible.

Fil-C compiles C and C++ with runtime memory-safety enforcement. Its
[capability checks and concurrent garbage collector](https://fil-c.org/how)
catch invalid memory accesses, including use-after-free. The application and
its libraries need the [Fil-C ABI](https://fil-c.org/runtime).

It immediately earned its place here. Fil-C caught Kore's process-title code
writing across the boundaries of argument/environment allocations. We replaced
that behavior with `prctl(PR_SET_NAME)` for Fil-C builds. The safety check stayed.

Kore's Linux sandbox also needed specific syscalls used by the runtime and curl:
`sched_yield`, `sched_getaffinity`, `gettid`, and `eventfd2`. We traced the failures
and added those calls to the allowlist. Seccomp stayed enabled too.

The installed `/opt/fil` SDK supplies OpenSSL and curl. We compile and cache only
the missing SQLite dependency. No rebuilding OpenSSL on every deployment!

## What we ended up with

Pages and public assets live inside one application executable. Python/Jinja
renders templates at build time; Python is absent from the serving path. SQLite,
private downloads, configuration, and the matching Fil-C runtime remain external.

Some measurements from our Linux tests:

- A clean Fil-C build, including SQLite, took **3m19s** and peaked at **1.94 GiB**
  under a 3 GiB limit with no swap on this `N150 Mini PC`. The template build
  environment and generated page sources were already prepared.
- A cached build with no changes took about **one second**.
- Fil-C runtime RSS was about **101 MiB idle / 152 MiB after loading every public
  asset**, summing the Kore parent and worker. Shared pages can be counted twice.

The deployment script builds before touching the service, backs up SQLite, checks
the candidate, and restores the previous binary if activation fails:

```sh
./deploy.sh user@server.local
```

## Hardening the deployed binary

We also borrowed from Fedora's **redhat-rpm-config** hardening policy, pinned to
[commit `29b86f0275754403c3da4fcdcfe5fa655f7ae518`](https://src.fedoraproject.org/rpms/redhat-rpm-config/tree/29b86f0275754403c3da4fcdcfe5fa655f7ae518).
The source revision, reference-file checksums, and our adaptations are recorded
alongside the build configuration.

The profile enables:

- **Compiler checks:** `_FORTIFY_SOURCE=3`, stack canaries, stack-clash protection,
  zero-initialized automatic variables, and format-security warnings as errors.
- **Executable protections:** PIE for address randomization, full RELRO with
  immediate symbol binding, and a non-executable stack. The audit rejects
  writable executable load segments.

These settings cover our application, Kore, cJSON, and SQLite. The prebuilt
Fil-C SDK libraries retain their own build settings. Changing flags invalidates
the object caches so an old, less-hardened object cannot quietly slip through.
LTO stays off to keep the 4 GB build target practical; the hardened rebuild
still fitted inside the 3 GiB limit without swap.

Then we checked the **Intel N150's CET support**. It has both shadow stacks,
which protect return addresses (the backward edge), and indirect branch tracking
(IBT), which restricts indirect call/jump destinations (the forward edge).

Our deployed service now runs with **hardware shadow stacks enabled and locked
in every thread of both the Kore parent and worker**. The audit reads each
thread's `/proc` status to verify enforcement, independently of compiler flags
and ELF compatibility markers.

This particular `/opt/fil` installation uses Fil-C's **glibc-based variant**;
[Fil-C also supports musl](https://fil-c.org/runtime). Its loader needed both
parts of this service-local setting:

```ini
Environment=GLIBC_TUNABLES=glibc.cpu.hwcaps=SHSTK:glibc.cpu.x86_shstk=on
```

Setting `x86_shstk=on` alone left shadow stacks inactive on our installation.
Checking the running process caught that detail.

There is a distinction on the forward edge:
[upstream Linux supports userspace shadow stacks and kernel IBT](https://docs.kernel.org/arch/x86/shstk.html),
but does not currently enforce IBT for userspace applications. We emit CET
instrumentation with `-fcf-protection=full`, while Fil-C's
[function capabilities](https://fil-c.org/invisicaps) validate indirect call
targets in software. Negative tests confirmed that calling a data pointer or an
offset function pointer triggers a Fil-C safety failure.

Deployment now audits the candidate ELF before activation and the running
process tree after health checks. On a supported x86 host, missing or unlocked
shadow stacks fail activation and trigger rollback. Kore's worker seccomp
sandbox and systemd's `NoNewPrivileges` remain enabled throughout.

## Why Fil-C matters now

AI-assisted vulnerability discovery is already finding serious bugs in mature
software. In March 2026, Anthropic reported
[22 Firefox vulnerabilities found over two weeks, including 14 rated high severity](https://www.anthropic.com/news/mozilla-firefox-security).
Relying on dangerous code being too tedious to audit feels increasingly fragile.

For this C server, Fil-C is a baseline requirement. Keeping existing C code and
libraries while enforcing memory safety is a big deal. It makes a huge body of
native software worth looking at with fresh eyes.

There are costs: our Fil-C build uses more RAM than native C, and it still needs
its runtime. It cannot fix broken authorization, payment logic, or resource
exhaustion. Those still need careful design and testing.

The recent trouble with backdoors in npm, PyPI, and other dependency registries
isn't great either. Memory safety doesn't protect us from malicious dependencies.
It doesn't matter how safe your language is if your
[`is-even`](https://www.npmjs.com/package/is-even) dependency gets compromised in
the supply chain. We only wanted to check `n % 2`! :D

Keeping C's familiar tools while gaining memory-safety enforcement makes this
a trade I am very happy to make.

Earlier me believed nobody sane would expose C to the web. But here we are,
and safely so far!?

## References

- https://filippo.io/linux-syscall-table/

- https://fil-c.org/install_optfil

- https://www.npmjs.com/package/is-even

- https://src.fedoraproject.org/rpms/redhat-rpm-config/tree/rawhide

- [Control Flow Integrity Explained](https://safeguard.sh/resources/blog/control-flow-integrity-explained-intel-cet-shadow-stacks-ibt-arm-pac-bti-and-compiler-cfi)
