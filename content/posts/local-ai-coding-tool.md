---
title: "Local AI Coding on Ubuntu 26.04"
date: 2026-05-16
draft: false
tags:
  - ai
  - Nanocoder
  - ollama
  - rocm
  - amd
  - ubuntu
  - radeon
---

*Running your own AI coding assistant locally using ROCm, LLaMA C++, and Nanocoder.*

## Why Local AI Coding?

Cloud AI coding assistants are convenient, but local models offer:

- Better privacy
- Lower long-term cost
- Offline development
- Faster iteration for small/medium models
- Full control over models and tooling

With modern AMD GPUs and ROCm support improving rapidly, Ubuntu 26.04 makes it surprisingly easy to run local coding models.

In this guide, we'll set up:

- Ubuntu 26.04
- ROCm GPU stack
- LLaMA C++
- Unsloth Studio
- Nanocoder
- Local coding models (Qwen, DeepSeek-Coder, etc.)

using an AMD Radeon AI R9700 GPU.

## Hardware Used

My setup:

| Component | Details           |
|---------|---------------------|
| GPU     | AMD Radeon AI R9700 |
| OS      | Ubuntu 26.04        |
| RAM     | 32 GB               |
| CPU     | Ryzen 9950X CPU     |
| Storage | NVMe SSD            |

## Step 1 - Enable deb-src repositories

Ubuntu 26.04 uses the new DEB822 `.sources` format.

Enable source repositories:

```bash
sudo sed -i 's/^Types: deb$/Types: deb deb-src/' \
    /etc/apt/sources.list.d/ubuntu.sources

sudo apt update
```

## Step 2 - Install required software

```bash
sudo apt install -y \
    git curl wget build-essential \
    python3 python3-pip python3-venv \
    cmake pkg-config \
    rocminfo clinfo rocm rocm-smi \
    docker.io

sudo usermod -a -G docker,render,video $USER
```

Reboot the system.

## Step 3 - Verify GPU Detection

Check ROCm:

```bash
rocminfo
```

Check OpenCL:

```bash
clinfo
```

You should see your R9700 GPU listed.

## Step 4 - Build `llama.cpp` (With MTP support now)

```
sudo apt build-dep llama.cpp

git clone https://github.com/ggml-org/llama.cpp.git

cd llama.cpp

cmake . -DBUILD_SHARED_LIBS=OFF -DGGML_VULKAN=ON

make -j32
```

## Step 5 - Test `llama.cpp`

```
./bin/llama-bench --list-devices

GML_VK_VISIBLE_DEVICES=0 ./bin/llama-bench -hf llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-GGUF:Q6_K -ngl 999 -fa 1

```

Sample output of above command:

```
| model                          |       size |     params | backend    | ngl | fa |            test |                  t/s |
| ------------------------------ | ---------: | ---------: | ---------- | --: | -: | --------------: | -------------------: |
| qwen35 27B Q6_K                |  21.23 GiB |    27.32 B | Vulkan     | 999 |  1 |           pp512 |        902.06 ± 0.92 |
| qwen35 27B Q6_K                |  21.23 GiB |    27.32 B | Vulkan     | 999 |  1 |           tg128 |         25.00 ± 0.03 |
```

If GPU acceleration is working, you should see VRAM utilization increase in:

```bash
watch -n1 rocm-smi

$ rocm-smi
=========================================== ROCm System Management Interface ===========================================
===================================================== Concise Info =====================================================
Device  Node  IDs              Temp    Power   Partitions          SCLK     MCLK     Fan     Perf  PwrCap  VRAM%  GPU%
              (DID,     GUID)  (Edge)  (Avg)   (Mem, Compute, ID)
========================================================================================================================
0       1     0x7551,   64106  66.0°C  300.0W  N/A, N/A, 0         3070Mhz  1258Mhz  32.94%  auto  300.0W  65%    100%
1       2     0x13c0,   15961  49.0°C  0.009W  N/A, N/A, 0         N/A      3000Mhz  0%      auto  N/A     4%     0%
========================================================================================================================
================================================= End of ROCm SMI Log ==================================================
```

## Step 6 - Install Nanocoder

```bash
npm install -g @nanocollective/nanocoder

nanocoder
```

We found Nanocoder to be much more useful than https://aider.chat/ stuff.

## Step 7 - Configure Nanocoder for `LLaMA C++`

```
$ cat ~/.config/nanocoder/agents.config.json
{
  "nanocoder": {
    "providers": [
      {
        "name": "Ollama",
        "models": [
          "qwen3.6:27b"
        ],
        "baseUrl": "http://uber.local:8080/v1"
      }
    ]
  }
}
```

## Step 8 - Start Coding

```bash
./bin/llama-server -hf unsloth/Qwen3.6-27B-GGUF:UD-Q4_K_XL --temp 1.0 --top-p 0.95 --top-k 20 \
    --presence-penalty 1.5 --min-p 0.00 --port 8080 --host 0.0.0.0 -ngl 999 -fa 1
```

```
cd <target-folder>

nanocoder
```

## Monitoring GPU Usage

Useful commands:

```bash
watch -n1 rocm-smi
```

```bash
radeontop
```

```bash
htop
```

## Final Thoughts

The Linux + ROCm ecosystem has improved dramatically over the past few years.

With Ubuntu 26.04, getting ROCm to work is pretty trivial.

For privacy-conscious developers, this setup is a compelling alternative to
cloud-hosted coding assistants.

##  References

- https://github.com/Nano-Collective/nanocoder

- https://unsloth.ai/docs/models/qwen3.6

- https://huggingface.co/Qwen/Qwen3.6-27B
