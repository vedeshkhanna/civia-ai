# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# CIVIA AI — Smart Civic Infrastructure Engine

> Automated AI-driven triage, spatial deduplication, and municipal dispatch platform for municipal defect management.

🔗 **Live Application:** [https://civia-b81l4f9xn-vedesh2.vercel.app](https://civia-b81l4f9xn-vedesh2.vercel.app)  
⚙️ **Interactive API Docs:** [https://civia-ai-1.onrender.com/docs](https://civia-ai-1.onrender.com/docs)

---

## 🚀 Key Features

* **Citizen Reporting Portal:** Quick incident logging with photo uploads, GPS coordinates, and ward mapping.
* **AI Visual Diagnostic & Triage:** Real-time damage classification and automated severity scoring (1–100).
* **Spatial Deduplication:** Automatic clustering of overlapping civic grievances within geographic thresholds.
* **Authority Municipal Console:** Real-time GIS interactive map, priority queues, and live ticket resolution workflow.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Leaflet GIS, Lucide Icons
* **Backend:** FastAPI, Python, Uvicorn, SQLite
* **Deployment:** Vercel (Frontend edge hosting), Render (Backend cloud service)

---

## 💻 Local Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
