---
title: "Easy Taint Tracking - Finding Heartbleed in 2024"
date: 2024-11-01
tags:
- Taint Analysis
- CS
- Computer Science
- Security
- Hacking
---

## Aim

Finding 'Heartbleed' class of bugs with taint analysis.

Background reading: https://heartbleed.com/

## Motivation

While `Coverity` is now able to detect this bug, we wanted to evaluate the
state of open-source security tooling in 2024.

Have we been able to reduce the cost of finding such bugs after all these
years?

## The Idea

Can we find an `execution path` from the tainted data in the `n2s` function to
sensitive functions?

Since `n2s` typically operates on network received bytes, it can serve as a
taint source.

## The bug

```c
int
tls1_process_heartbeat(SSL *s)
{
unsigned char *p = &s->s3->rrec.data[0], *pl;
unsigned short hbtype;
unsigned int payload;

/* ... */

hbtype = *p++;
n2s(p, payload);
pl = p;

/* ... */

if (hbtype == TLS1_HB_REQUEST)
        {
        /* ... */
        memcpy(bp, pl, payload);  // BAD: overflow here
        /* ... */
        }


/* ... */

}
```

Source: https://codeql.github.com/codeql-query-help/cpp/cpp-openssl-heartbleed/

The `payload` variable is the number of bytes that should be copied from the
request back into the response. The call to memcpy does this copy. The problem
is that `payload` is supplied as part of the remote request, and there is no
code that checks the size of it. If the caller supplies a very large value,
then the memcpy call will copy memory that is outside the request packet.

## Setup

Install LLVM and Clang 20 from https://apt.llvm.org/. I am actually running
these under WSL 2 on a Windows 11 laptop for a change.

Fetch and extract the affected OpenSSL source code.

```
wget http://www.openssl.org/source/openssl-1.0.1f.tar.gz

tar -xf openssl-1.0.1f.tar.gz
```

## Taint Analyzer Configuration

```
$ cat ~/taint_config.yml
Filters:

Propagations:
  - Name: n2s
DstArgs: [0, 1]

Sinks:
  - Name: CRYPTO_malloc
Args: [0]

  - Name: memcpy_
Args: [2]
```

See [TaintAnalysisConfiguration](https://clang.llvm.org/docs/analyzer/user-docs/TaintAnalysisConfiguration.html) for details on this topic.

## Lending a hand

Let's patch the OpenSSL source code a bit to make it amenable to taint
analysis.

Replace the following macro with a function definition:

```
#define n2s(c,l)        (l =((IDEA_INT)(*((c)++)))<< 8L, \
                     l|=((IDEA_INT)(*((c)++)))      )

void n2s(unsigned char *data, unsigned int *b);
```

Rename `memcpy` to `memcpy_` in `ssl/d1_both.c` file.

Declare the following function helper:

```
void memcpy_(void *a, void *b, size_t len);
```

Patch the `n2s` calls in `ssl/d1_both.c` file:

Before:

```
n2s(p, payload);
```

After:

```
n2s(p, &payload);
```

## Let's go!

```
user@newie:~/openssl-1.0.1f$ ./config
...
Configured for linux-x86_64.

$ scan-build-20 -enable-checker optin.taint.GenericTaint -analyzer-config \
  optin.taint.TaintPropagation:Config=/home/user/taint_config.yml \
  clang -I. -Iinclude -c ssl/d1_both.c
scan-build: Using '/usr/lib/llvm-20/bin/clang' for static analysis

ssl/d1_both.c:1490:12: warning: Untrusted data is passed to a user-defined sink
 1490 |                 buffer = OPENSSL_malloc(1 + 2 + payload + padding);
  |                          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~```

include/openssl/crypto.h:368:29: note: expanded from macro 'OPENSSL_malloc'
  368 | #define OPENSSL_malloc(num)     CRYPTO_malloc((int)num,__FILE__,__LINE__)
  |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~```

ssl/d1_both.c:1496:3: warning: Untrusted data is passed to a user-defined sink
 1496 |                 memcpy_(bp, pl, payload);
```

Done - We have successfully found network data flowing into sensitive functions directly!

## Future Tasks

Can we find these bugs with less source code patching work?

Or can we use [Coccinelle](https://coccinelle.gitlabpages.inria.fr/website/) for this patching work?

## References

Pic (or it didn't happen):

![Clang-Analyzer](/images/Z1-Clang-Analyzer.png)

Coverity now detects this bug too:

![Coverity Reference](/images/Z2-Coverity-Screenshot_2024-10-29_15-29-18.png)

- https://www.blackduck.com/blog/detecting-heartbleed-with-static-analysis.html

- https://www.giac.org/paper/gsec/36189/role-static-analysis-heartbleed/143117

- https://blog.regehr.org/archives/1125

- https://blog.regehr.org/archives/1128

- https://blog.trailofbits.com/2014/04/27/using-static-analysis-and-clang-to-find-heartbleed/

- https://clang.llvm.org/docs/analyzer/user-docs/TaintAnalysisConfiguration.html

- https://www.zerodayinitiative.com/blog/2022/2/10/mindshare-when-mysql-cluster-encounters-taint-analysis

- https://github.com/llvm/llvm-project/blob/main/clang/lib/StaticAnalyzer/Checkers/GenericTaintChecker.cpp#L430

- https://coccinelle.gitlabpages.inria.fr/website/
