# 🌍 Cloud Carbon Compass

**Cloud Carbon Compass** is a lightweight, high-performance web dashboard that estimates the carbon impact (kg CO₂e / month) and financial spend ($ USD) of cloud workloads across **AWS**, **Azure**, and **GCP**, suggesting lower-impact operating choices through an interactive green scenario simulator.

---

## 🚀 Quick Start (Runnable in 5 Minutes with 1 Command)

No cloud credentials, paid APIs, or external setup required. The application works out of the box with realistic sample workloads.

### 1. Installation
Clone or navigate to the project root directory and run:

```bash
npm install
```
*(This automatically installs dependencies for both the Express backend and React Vite frontend).*

### 2. Run Application (One Command)
Start both backend API and frontend dev server concurrently:

```bash
npm start
```
or
```bash
npm run dev
```

* **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
* **Backend Express API:** [http://localhost:8080/api/summary](http://localhost:8080/api/summary)

---

## ✨ Core Features

* **Multi-Cloud Workload Inventory:** Real-world sample workloads across AWS, Azure, and GCP (Kubernetes clusters, database fleets, LLM inference nodes, serverless functions, object storage, and dev sandboxes).
* **Carbon & Energy Calculation Engine:** Estimates operational power draw (Watts), monthly energy usage (kWh), facility overhead via Data Center PUE, operational Scope 2 emissions, and hardware manufacturing Scope 3 embodied emissions.
* **Interactive "What-If?" Green Optimizer:**
  * **Low-Carbon Region Migration:** Test moving workloads from high-intensity grids (e.g. Virginia 365 gCO₂e/kWh) to hydro/Nordic clean grids (e.g. Sweden 15 g/kWh, Oregon 78 g/kWh).
  * **Off-Peak Auto-Pause Schedule:** Simulate scaling non-production (dev/staging/batch) workloads to zero outside business hours (40% runtime reduction).
  * **vCPU Right-Sizing:** Identify over-provisioned nodes (<30% utilization) and simulate right-sizing.
  * **One-Click Apply:** Instantly apply simulated green optimizations to the live baseline.
* **Automated Smart Recommendations:** Ranked suggestions with calculated monthly carbon savings (kg CO₂e), cost impact ($/mo), and difficulty ratings.
* **Visual Data Analysis:** Interactive charts powered by Recharts comparing emissions by Cloud Provider, Environment, and Regional Grid Intensity.
* **Methodology & Assumptions Modal:** Transparent breakdown of SPECpower CPU/RAM power draw formulas, data center PUE multipliers, and Ember/electricityMaps grid intensity values.
* **Report Export:** Export full structured executive reports in JSON format.

---

## 🧮 Carbon Estimation Methodology & Formulas

> **Note:** Carbon emissions are estimates based on sample architectural assumptions and open science models (Cloud Carbon Footprint standard methodologies), not live provider metering APIs.

### 1. System Operational Power Draw ($P_{system}$)
$$P_{system} = (vCPUs \times P_{cpu}) + (RAM_{GB} \times P_{ram}) + (GPUs \times P_{gpu}) + (Storage_{TB} \times P_{storage})$$
* **$P_{cpu}$:** Idle power 1.0W/vCPU to Max power 3.8W/vCPU (scaled linearly by CPU utilization %).
* **$P_{ram}$:** 0.38 W/GB.
* **$P_{gpu}$:** Weighted average ~215 W per active GPU unit.
* **$P_{storage}$:** 1.2 W/TB SSD/NVMe data center power.

### 2. Data Center Facility Energy ($P_{facility}$) & Monthly kWh
$$P_{facility} = P_{system} \times PUE$$
$$\text{Monthly Energy (kWh)} = \frac{P_{facility} \times \text{Runtime Hours}}{1000}$$
* **PUE (Power Usage Effectiveness):** Hyperscale Nordic hydro facilities = 1.09–1.11; Legacy/hot climate regions = 1.20–1.25.

### 3. Operational & Embodied Carbon ($kg \ CO_2e$)
$$\text{Operational } CO_2e \ (kg) = \frac{\text{Monthly Energy (kWh)} \times \text{Grid Carbon Intensity } (gCO_2e/kWh)}{1000}$$
$$\text{Embodied } CO_2e \ (kg) = vCPUs \times 0.85 \ kg/vCPU\text{-month} \times \left(\frac{\text{Runtime Hours}}{720}\right)$$
$$\mathbf{\text{Total } CO_2e \ (kg/month) = \text{Operational } CO_2e + \text{Embodied } CO_2e}$$

---

## 🌐 Sample Grid Carbon Intensity Data (gCO₂e/kWh)

| Provider | Region Code | Location | Grid Carbon Intensity | PUE | Renewable Match |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **AWS** | `eu-north-1` | Stockholm, Sweden | **18 g/kWh** | 1.11 | 99% |
| **AWS** | `us-west-2` | Oregon, USA | **78 g/kWh** | 1.12 | 95% |
| **AWS** | `us-east-1` | Virginia, USA | **365 g/kWh** | 1.15 | 62% |
| **GCP** | `europe-west9` | Paris, France | **52 g/kWh** | 1.10 | 96% |
| **GCP** | `us-west1` | Oregon, USA | **72 g/kWh** | 1.09 | 98% |
| **GCP** | `us-central1` | Iowa, USA | **390 g/kWh** | 1.10 | 88% |
| **Azure** | `swedencentral` | Gävle, Sweden | **15 g/kWh** | 1.09 | 100% |
| **Azure** | `westus2` | Washington, USA | **65 g/kWh** | 1.12 | 96% |
| **Azure** | `eastus` | Virginia, USA | **370 g/kWh** | 1.18 | 65% |

---

## 🛠️ Tech Stack & Project Architecture

* **Frontend:** React 18, Vite, Recharts, Lucide React Icons, Custom Eco-Tech CSS Design System.
* **Backend:** Node.js, Express API, In-memory carbon estimation & simulation engine.
* **Orchestration:** `concurrently` for single-command start.

```
Cld_Project/
├── package.json              # Root script runner (npm start / npm run dev)
├── README.md                 # Complete documentation
├── server/
│   ├── index.js              # Express API server entrypoint
│   ├── data/
│   │   ├── regions.js        # Grid carbon intensities & PUE data
│   │   ├── workloads.js      # Sample AWS/Azure/GCP workloads
│   │   └── recommendations.js# Smart green optimization rules
│   └── routes/
│       ├── api.js            # REST API routes (/api/workloads, /api/what-if, etc.)
│       └── carbonEngine.js   # CCF mathematical calculation engine
└── client/
    ├── index.html            # Entry HTML & Google Fonts
    ├── vite.config.js        # Vite config with Express API proxy
    └── src/
        ├── App.jsx           # Main Dashboard orchestration
        ├── index.css         # Modern eco-tech dark theme & glassmorphism
        ├── components/       # UI Components (Metrics, Simulator, Charts, Table)
        └── services/api.js   # API Client layer
```

---

## 📄 License
MIT License. Created for green cloud computing & sustainable software engineering.
