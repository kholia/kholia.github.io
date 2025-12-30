---
title: Debugging / reversing Firebase gRPC traffic with mitmproxy
date: 2025-04-16
tags:
- CS
- Computer Science
- Security
- Self-Note
- Notes
- Reversing
- Protobuf
- gRPC
- mitmproxy
- Reverse Engineering
- MITM
- Hacking
---

Recently, I was stuck in figuring out how the Firebase gRPC calls worked and how I could generate, modify, and replay them. Trapping and modifying the existing gRPC traffic was not working too well. Finally, I took a step back and spent some time on learning how to build and debug simple Firebase applications. This approach helped me tremendously and I was able to make further progress with my original task in almost no time.

## Solution

You may find the following code sample useful when reversing / debugging Firebase applications.

```python
#!/usr/bin/env python3

import os
import sys

os.environ["GOOGLE_CLOUD_PROJECT"] = "deepdive-a5480"  # CHANGE ME
os.environ["REQUESTS_CA_BUNDLE"] = 'mitmproxy-ca.pem'
os.environ["SSL_CERT_FILE"] = 'mitmproxy-ca.pem'
os.environ['PYTHONHTTPSVERIFY'] = '0'
# Set these before importing any Firebase/gRPC modules
os.environ["GRPC_SSL_CIPHER_SUITES"] = "HIGH+ECDSA"
os.environ["GRPC_VERBOSITY"] = "DEBUG"
# os.environ["GRPC_TRACE"] = "ssl,http,api"
os.environ["GRPC_SSL_TARGET_NAME_OVERRIDE"] = "*"
# Set proxy environment variables
os.environ["HTTP_PROXY"] = "http://localhost:8080"
os.environ["HTTPS_PROXY"] = "http://localhost:8080"
os.environ["https_proxy"] = "http://localhost:8080"
# Tell gRPC to use the system proxy
os.environ["GRPC_PROXY_EXP"] = "http://localhost:8080"
# Trust the mitmproxy CA certificate
# (You'll need to export the mitmproxy CA cert and specify its path)
os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = "mitmproxy-ca.pem"
# For Firebase/Google libraries
os.environ["GOOGLE_API_USE_CLIENT_CERTIFICATE"] = "false"

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use the application default credentials - we will override these using
# mitmproxy - so just use any valid credentials to make the library happy
# enough ;)
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
dbf = firestore.client()

# Run mitmproxy -s plug.py. The 'auth.txt' should contain "Bearer <long token>" value.

doc_ref = dbf.collection('users').document(v)
doc = doc_ref.get()
print(doc.to_dict())
```

This code works well with the following `mitmproxy` plugin.

```python
class AddHeader:
    def __init__(self):
        self.num = 0

    def request(self, flow):
        self.num = self.num + 1
        token = open("auth.txt").read().strip()  # previously captured jwt token
        if "BatchGetDocuments" in flow.request.path:
            flow.request.headers["authorization"] = token

addons = [AddHeader()]
```

Run `mitmproxy` with this plugin via the `mitmproxy -s plug.py` command.

## Findings

- Existing tools like `HTTP Toolkit` fare poorly when trying to replay the 'binary' gRPC traffic. `HTTP Toolkit` also makes modifications of binary request bodies hard. Hopefully these current limitations will be addressed in the near future.

- The integration of ADB support + VPN-based MITM in `HTTP Toolkit` deserves recognition for its exceptional quality and reliability. Unlike competitors such as Burp Suite that often leave users to figure out man-in-the-middle setup procedures independently, HTTP Toolkit stands out by providing comprehensive, precise guidance throughout the process, demonstrating a strong commitment to user support.

- Old Android versions require older versions of Magisk. The latest (28103) version of Magisk doesn't work with Android 9.x or 10.x for example.

- For (binary) request + response modifications, mitmproxy remains the gold standard it seems.

Happy hacking!
