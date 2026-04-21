---
title: Easily verifying certificate chains
date: 2025-04-14
tags:
- Computer Science
- Security
- Notes
---

Here is a quick script to verify that the certificate chain is valid and will work.

```bash
% cat verify-cert-key.sh
#!/usr/bin/env bash

certFile="${1}"
keyFile="${2}"
caFile="${3}"
certPubKey="$(openssl x509 -noout -pubkey -in "${certFile}")"
keyPubKey="$(openssl pkey -pubout -in "${keyFile}")"

if [[ "${certPubKey}" == "${keyPubKey}" ]]
then
  echo "PASS: key and cert match"
else
  echo "FAIL: key and cert DO NOT match"
fi

openssl verify -CAfile "${3}" "${1}"
```
