# Kateriya-X: Closed-Loop Neural Interface & Control Framework

![BCI Status](https://shields.io)
![Framework](https://shields.io)
![License](https://shields.io)

**Kateriya-X** is an advanced, high-throughput closed-loop Brain-Computer Interface (BCI) architecture designed for real-time cognitive state tracking, automated signal quality assurance, and motor imagery decoding. 

This repository serves as a **Public Demonstration Hub** showcasing the visual terminal interface, asynchronous ingestion pipelines, and hardware simulation layers. The core machine learning kernels and hardware blueprints remain fully proprietary.

---

## 🚀 Executive Project Description

The Kateriya-X ecosystem bridges the gap between raw neurophysiology and real-world digital control systems. Operating at a strict **250 Hz hardware sampling rate**, the pipeline processes multi-channel electroencephalogram (EEG) signals to decode human cognitive states (Focused, Relaxed, Fatigued) and structural motor imagery intents (Left vs. Right hand movement imagination). 

Unlike traditional passive neuro-monitoring software, Kateriya-X features a **Closed-Loop Feedback Controller**. When targeted cognitive dips or focus lapses are classified, the system simulates localized transient resonance modulation pulses back to the BCI node to guide cortical networks toward desired frequency bands. Every system operation is guarded by a deterministic, clinical-grade software safety firewall to guarantee user safety.

### Key Technological Pillars:
* **Asynchronous Telemetry Ingestion:** Multi-threaded `asyncio` and `websockets` engine driving a rolling memory ring buffer (`np.roll`) to achieve ultra-low system latency.
* **Domain-Adversarial Deep Learning:** A PyTorch 1D-Convolutional Neural Network integrated with a Gradient Reversal Layer (GRL) to strip out cross-subject anatomical variations, isolating invariant neural signatures.
* **Signal Quality Assurance (Lead-Off Detection):** Real-time Power Spectral Density (PSD) analysis to instantly catch electrode flatlines, saturation clipping, or 50/60Hz AC line grid hum.
* **Spatial Filtering & Decoding:** Custom Common Spatial Patterns (CSP) spatial-filtering matrix nodes linked to a Support Vector Machine (SVM) to translate contralateral mu/beta rhythms into clear directional commands.

---

## 🛠️ System Architecture Directory Map

```text
├── .github/workflows/
│   └── ci.yml                     # Automated GitHub Actions CI workflow harness
├── config/
│   └── default_profile.json       # Human-readable virtual keyboard macro maps
├── src/
│   ├── mock_hardware_server.py    # Asynchronous 250Hz telemetry simulator node
│   ├── dashboard_core.py          # Master Plotly Dash UI application console
│   ├── cnn_classifier.py         # PyTorch 1D-CNN domain adaptation engine
│   ├── csp_decoder.py             # Motor imagery spatial filtering processor
│   ├── safety_firewall.py         # Outbound pulse duty-cycle interlock logic
│   └── quality_monitor.py         # Lead-off verification module
├── tests/
│   └── test_safety.py             # Automated unit tests for interlock assertions
├── Dockerfile                     # Multi-stage container compilation blueprint
├── docker-compose.yml             # Service orchestration configuration map
└── requirements.txt               # Locked framework dependency tree
```

---

## 🚦 Quick Start (Local Demo Simulation)

### Prerequisite Dependencies
Ensure you have Docker and Docker Compose installed on your host system.

### 1. Boot the Containerized Ecosystem
Spin up the complete decoupled network topology (Hardware Simulator + Core Dashboard Console) using a single command:
```bash
docker-compose up --build
```

### 2. Open the Interface
Once the container network bridge builds successfully, navigate to the local server URL in your browser:## 🔒 License & Intellectual Property Notice

Copyright (c) 2026 Kateriya-X Project. All rights reserved.

This repository contains the open-source frontend and simulation demo for the Kateriya-X BCI platform. The core deep-learning architecture, hardware blueprints, and proprietary closed-loop stimulation modules are kept in a private repository for commercial development.

### Strict Proprietary Terms:
* **No Derivation or Modification:** You may not alter, transform, or build upon this source code.
* **No Distribution:** You may not redistribute, sub-license, mirror, or publicly host copies of this software code.
* **View-Only Permission:** Permission is granted solely to download and execute this code locally for personal evaluation, educational inspection, and portfolio review purposes. 
## License

This project is licensed under the MIT License - see below for details:

Copyright (c) 2026 Kateriya-X Project Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.## License & Intellectual Property Notice

Copyright (c) 2026 Kateriya-X Project. All rights reserved.

This repository contains the open-source frontend and simulation demo for the Kateriya-X BCI platform. The core deep-learning architecture, hardware blueprints, and proprietary closed-loop stimulation modules are kept in a private repository for commercial development.

### Strict Proprietary Terms:
* **No Derivation or Modification:** You may not alter, transform, or build upon this source code.
* **No Distribution:** You may not redistribute, sub-license, mirror, or publicly host copies of this software code.
* **View-Only Permission:** Permission is granted solely to download and execute this code locally for personal evaluation, educational inspection, and portfolio review purposes. 

Commercial use, cloning for unauthorized projects, or reverse-engineering of this architecture is strictly prohibited without explicit written consent from the copyright holder.🚀 Excited to share my latest engineering milestone: Kateriya-X — a production-grade, Closed-Loop Brain-Computer Interface (BCI) platform!

Developing for neurotechnology means designing for two massive challenges: ultra-low latency telemetry and ironclad safety constraints. To solve this, I built a hybrid architecture that bridges the gap between raw cortical signals and operating system control.

Key features of the public system demo include:
📡 Asynchronous Telemetry Ingestion: Multi-threaded asyncio and websockets running a rolling numpy ring buffer to handle 250 Hz data streams smoothly.
🧠 Domain-Adversarial Deep Learning: A PyTorch 1D-CNN designed to strip out subject-specific anatomical variations and isolate invariant focus signatures.
🛡️ Signal Quality Assurance (Lead-Off Detection): Real-time Welch Power Spectral Density analytics to catch bad electrode contacts, rails, or 50/60Hz AC grid hum instantly.
🛑 Strict Safety Interlock Firewall: A deterministic safety manager enforcing hard limits on rolling duty-cycles and cooldown windows to prevent hardware over-stimulation.
🎮 Motor Imagery HUD: A custom Common Spatial Patterns (CSP) spatial-filtering matrix node that decodes imagined left/right hand movements to drive a built-in training maze.

I have open-sourced the frontend dashboard, ingestion architecture, and hardware simulation server as a public portfolio project, while keeping the proprietary hardware blueprints and core deep-learning weights secure.## 💰 Financial Blueprint & Bill of Materials (BOM)

The total estimated cost to assemble, validate, and deploy a physical hardware deployment node for the Kateriya-X BCI system workspace is **$965.00 USD**. Below is the explicit cost breakdown separated by physical hardware requirements and cloud operational infrastructure footprints:

### 1. Physical Hardware Components (BCI Rig)
* **Core Bio-Telemetry Process Node:** OpenBCI Cyton 8-Channel Board (or equivalent high-resolution ADS1299-based biopotential digitizer) — **$599.00 USD**
* **Active Electrode Matrix:** Premium Gold-Cup Active Ag/AgCl Electrodes (Set of 10) — **$90.00 USD**
* **Mechanical Sub-System:** Adjustable Ergonomic Ultracortex Headband Mesh Grid — **$120.00 USD**
* **Consumables Pack:** Electrophysiological Prep Kit (NuPrep Abrasive Paste, Ten20 Conductive Paste, Isopropyl Alcohol wipes, Cotton Swabs) — **$45.00 USD**

### 2. Computing & Cloud Infrastructure Footprint
* **Local Processing Ingestion Node:** Containerized Multi-Core Host Environment (Minimum 8GB RAM CPU Target) — **Existing Host Hardware / $0.00**
* **Cloud Invariant Storage Buffer:** AWS S3 Archive Storage Tier (For raw session CSV telemetry logs retrieval) — **~$5.00 USD / Month**
* **CI/CD Automation Pipeline Engine:** GitHub Actions Virtual Runner Execution Cycles — **Free Tier Included / $0.00**
* **Edge Application Hosting Container:** Docker/Docker Compose Stack deployment layer — **Open Source / $0.00**

### 3. Safety Calibration & Verification Equipment
* **Hardware Impedance Tester:** Handheld Digital Multimeter / Test Bench Verification Unit — **$106.00 USD**

---
*Note: Cost matrices reflect commercial retail estimates evaluated as of Q4 2026. The public software simulator package requires $0.00 in hardware outlays to build, execute, and inspect.*








